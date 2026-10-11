"""
Compixor AI — Background Removal Module v2.0
============================================
Fixes light halo / fringe on hair and shoulders by running
foreground colour estimation (pymatting) after rembg alpha matting.

Pipeline per request
--------------------
1. Decode input image → RGB numpy array
2. rembg  →  raw RGBA  (alpha matte)
3. alpha_cleanup()  →  cleaned alpha (blob removal, hole fill, Gaussian smooth, 1-px erode)
4. If BG_FG_ESTIMATE=true  →  estimate_foreground_ml() at max 1200 px → corrected RGB colours
5. Composite over requested background colour (transparent | white | blue)
6. Encode PNG → return bytes

Author: Compixor AI
"""
from __future__ import annotations

import io
import logging
import math
import os
import time
from typing import Tuple

import numpy as np
from PIL import Image

logger = logging.getLogger("compixor.bg_remove")

# ── Env-var flags ─────────────────────────────────────────────────────────────

BG_FG_ESTIMATE: bool = os.getenv("BG_FG_ESTIMATE", "true").lower() in ("1", "true", "yes")
FG_ESTIMATE_MAX_SIDE: int = int(os.getenv("FG_ESTIMATE_MAX_SIDE", "900"))


# ── Lazy imports (packages present on VPS, not on Windows dev box) ────────────

def _rembg_remove(image_bytes: bytes) -> bytes:
    from rembg import remove
    return remove(image_bytes)


def _pymatting_estimate_fg(rgb_float: np.ndarray, alpha_float: np.ndarray) -> np.ndarray:
    """
    Wrapper around pymatting.estimate_foreground_ml.
    Returns corrected foreground as float32 H×W×3 array in [0, 1].
    """
    from pymatting import estimate_foreground_ml  # type: ignore
    fg = estimate_foreground_ml(rgb_float.astype(np.float64), alpha_float.astype(np.float64))
    return np.clip(fg, 0.0, 1.0).astype(np.float32)



# ── Alpha cleanup ──────────────────────────────────────────────────────────────

def alpha_cleanup(alpha: np.ndarray) -> np.ndarray:
    """
    1. Remove tiny isolated blobs smaller than 0.2 % of image area.
    2. Fill small holes in the largest foreground region.
    3. Keep only the largest connected person region.
    4. Gaussian smooth (sigma ≈ 0.8) the alpha edges.
    5. Erode alpha by 1 px (scaled linearly with image width at 1600 px reference).

    Parameters
    ----------
    alpha : np.ndarray  shape (H, W), dtype uint8, values 0–255

    Returns
    -------
    np.ndarray  same shape and dtype, cleaned alpha
    """
    try:
        from scipy import ndimage  # type: ignore
        import scipy.ndimage as ndi  # type: ignore
    except ImportError:
        logger.warning("scipy not available; alpha cleanup skipped")
        return alpha

    H, W = alpha.shape
    area = H * W
    min_blob_area = max(1, int(area * 0.002))   # 0.2 % threshold

    # ── Step 1 & 3: binary threshold, label, keep largest region ─────────────
    binary = alpha > 30  # pixels that are at least slightly foreground

    labeled, n_labels = ndi.label(binary)
    if n_labels == 0:
        return alpha

    label_sizes = ndi.sum(binary, labeled, range(1, n_labels + 1))
    largest_label = int(np.argmax(label_sizes)) + 1
    largest_mask = labeled == largest_label

    # ── Step 2: fill holes in the largest region ─────────────────────────────
    filled_mask = ndi.binary_fill_holes(largest_mask)

    # ── Step 1: also kill tiny isolated blobs in other labels ────────────────
    extra_mask = np.zeros_like(binary)
    for lbl_idx, sz in enumerate(label_sizes, start=1):
        if lbl_idx == largest_label:
            continue
        if sz >= min_blob_area:
            extra_mask |= (labeled == lbl_idx)

    combined = filled_mask | extra_mask

    # ── Map boolean mask back to alpha (preserve partial transparency) ────────
    # Pixels removed by cleanup go to 0; kept pixels keep their original value
    clean_alpha = np.where(combined, alpha, 0).astype(np.float32)

    # ── Step 4: Gaussian smooth on alpha only (sigma ≈ 0.8) ──────────────────
    clean_alpha = ndi.gaussian_filter(clean_alpha, sigma=0.8)

    # ── Step 5: erode alpha by 1 px scaled to 1600 px reference ──────────────
    erode_px = max(1, round(W / 1600))
    if erode_px > 0:
        struct = ndi.generate_binary_structure(2, 1)
        # Erosion on the binary mask, then re-apply to alpha
        eroded_bin = ndi.binary_erosion(combined, structure=struct, iterations=erode_px)
        clean_alpha = np.where(eroded_bin, clean_alpha, 0.0)

    return np.clip(clean_alpha, 0, 255).astype(np.uint8)


# ── Foreground colour estimation ───────────────────────────────────────────────

def _downscale_for_fg(rgb: np.ndarray, alpha: np.ndarray, max_side: int) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    Downscale (rgb, alpha) so the longest side ≤ max_side.
    Returns (rgb_ds, alpha_ds, scale) where scale = original / downscaled.
    """
    H, W = rgb.shape[:2]
    longest = max(H, W)
    if longest <= max_side:
        return rgb, alpha, 1.0
    scale = longest / max_side
    new_W = max(1, round(W / scale))
    new_H = max(1, round(H / scale))
    from PIL import Image as PilImage
    rgb_pil = PilImage.fromarray((rgb * 255).astype(np.uint8)).resize((new_W, new_H), PilImage.LANCZOS)
    alpha_pil = PilImage.fromarray((alpha * 255).astype(np.uint8)).resize((new_W, new_H), PilImage.LANCZOS)
    return (
        np.asarray(rgb_pil, dtype=np.float32) / 255.0,
        np.asarray(alpha_pil, dtype=np.float32) / 255.0,
        scale,
    )


def estimate_fg_dehaloed(
    rgb_float: np.ndarray,      # H×W×3, float32 [0,1]
    alpha_float: np.ndarray,    # H×W,   float32 [0,1]
) -> Tuple[np.ndarray, float]:
    """
    Run pymatting foreground estimation on a downscaled copy if needed,
    then upscale the colour result back to original size.

    Returns
    -------
    fg : np.ndarray  H×W×3 float32 [0,1]  — corrected foreground colours
    elapsed_s : float                       — time spent in estimation
    """
    H, W = rgb_float.shape[:2]

    t0 = time.perf_counter()
    rgb_ds, alpha_ds, scale = _downscale_for_fg(rgb_float, alpha_float, FG_ESTIMATE_MAX_SIDE)
    fg_ds = _pymatting_estimate_fg(rgb_ds, alpha_ds)
    elapsed_s = time.perf_counter() - t0

    if scale > 1.0:
        # Upscale fg colour only back to original size
        from PIL import Image as PilImage
        fg_pil = PilImage.fromarray((fg_ds * 255).astype(np.uint8)).resize((W, H), PilImage.LANCZOS)
        fg = np.asarray(fg_pil, dtype=np.float32) / 255.0
    else:
        fg = fg_ds

    return fg, elapsed_s


# ── Composite helper ───────────────────────────────────────────────────────────

def composite_over(fg_float: np.ndarray, alpha_float: np.ndarray, bg_rgb: Tuple[float, float, float]) -> np.ndarray:
    """
    Composite fg (H×W×3 float) over a solid background colour.
    Returns uint8 H×W×3 RGB.
    """
    bg = np.array(bg_rgb, dtype=np.float32).reshape(1, 1, 3)
    a = alpha_float[:, :, np.newaxis]
    out = fg_float * a + bg * (1.0 - a)
    return np.clip(out * 255, 0, 255).astype(np.uint8)


# ── Main entry point ───────────────────────────────────────────────────────────

def remove_background(
    image_bytes: bytes,
    bg: str = "transparent",
) -> Tuple[bytes, dict]:
    """
    Full pipeline: rembg → alpha_cleanup → [fg_estimate] → composite.

    Parameters
    ----------
    image_bytes : raw bytes of the uploaded image (any PIL-readable format)
    bg          : "transparent" | "white" | "blue"

    Returns
    -------
    png_bytes : PNG bytes ready to stream
    meta      : dict with timing and size info for response headers
    """
    t_total = time.perf_counter()
    meta: dict = {}

    # ── 1. rembg alpha matte ──────────────────────────────────────────────────
    t0 = time.perf_counter()
    raw_rgba_bytes = _rembg_remove(image_bytes)
    meta["rembg_ms"] = int((time.perf_counter() - t0) * 1000)

    raw_rgba = np.asarray(Image.open(io.BytesIO(raw_rgba_bytes)).convert("RGBA"), dtype=np.uint8)
    H, W = raw_rgba.shape[:2]
    rgb_u8   = raw_rgba[:, :, :3]
    alpha_u8 = raw_rgba[:, :, 3]

    # ── 2. Alpha cleanup ──────────────────────────────────────────────────────
    t0 = time.perf_counter()
    alpha_u8 = alpha_cleanup(alpha_u8)
    meta["cleanup_ms"] = int((time.perf_counter() - t0) * 1000)

    # ── 3. Foreground colour estimation (de-halo) ─────────────────────────────
    rgb_float   = rgb_u8.astype(np.float32) / 255.0
    alpha_float = alpha_u8.astype(np.float32) / 255.0

    if BG_FG_ESTIMATE:
        try:
            fg_float, fg_elapsed_s = estimate_fg_dehaloed(rgb_float, alpha_float)
            meta["fg_estimate_ms"] = int(fg_elapsed_s * 1000)
            if fg_elapsed_s > 1.5:
                logger.warning(
                    "FG estimation took %.2f s (>1.5 s threshold) on %d×%d image; "
                    "consider reducing FG_ESTIMATE_MAX_SIDE.",
                    fg_elapsed_s, W, H,
                )
        except Exception as exc:
            logger.error("FG estimation failed, using raw rembg colours: %s", exc)
            fg_float = rgb_float
            meta["fg_estimate_ms"] = -1
    else:
        fg_float = rgb_float
        meta["fg_estimate_ms"] = 0

    # ── 4. Build output image ─────────────────────────────────────────────────
    bg_lower = bg.strip().lower()

    if bg_lower in ("transparent", ""):
        # RGBA PNG with corrected foreground
        fg_u8  = np.clip(fg_float * 255, 0, 255).astype(np.uint8)
        out_arr = np.dstack([fg_u8, alpha_u8])
        out_img = Image.fromarray(out_arr, mode="RGBA")
    elif bg_lower == "white":
        out_rgb = composite_over(fg_float, alpha_float, (1.0, 1.0, 1.0))
        out_img = Image.fromarray(out_rgb, mode="RGB")
    elif bg_lower == "blue":
        # NADRA / Philippines passport royal blue #1d4ed8 = (29, 78, 216)
        out_rgb = composite_over(fg_float, alpha_float, (29 / 255.0, 78 / 255.0, 216 / 255.0))
        out_img = Image.fromarray(out_rgb, mode="RGB")
    else:
        # Unknown bg → transparent
        fg_u8 = np.clip(fg_float * 255, 0, 255).astype(np.uint8)
        out_arr = np.dstack([fg_u8, alpha_u8])
        out_img = Image.fromarray(out_arr, mode="RGBA")

    buf = io.BytesIO()
    out_img.save(buf, format="PNG", optimize=False)
    png_bytes = buf.getvalue()

    meta["total_ms"] = int((time.perf_counter() - t_total) * 1000)
    meta["output_px"] = f"{W}x{H}"
    meta["fg_estimate_on"] = BG_FG_ESTIMATE

    logger.info(
        "remove_background bg=%s %s rembg=%dms cleanup=%dms fg=%dms total=%dms size=%dKB",
        bg_lower,
        meta["output_px"],
        meta["rembg_ms"],
        meta["cleanup_ms"],
        meta["fg_estimate_ms"],
        meta["total_ms"],
        len(png_bytes) // 1024,
    )

    return png_bytes, meta
