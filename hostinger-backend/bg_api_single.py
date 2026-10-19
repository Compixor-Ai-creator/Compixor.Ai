"""
Compixor AI — All-In-One Background Removal & Portrait Matting API  (v2.2)
===========================================================================
Single-file production backend for Compixor Passport Photo Maker.
Deployable on Hostinger VPS (Ubuntu / Python 3.11).

What changed in v2.2 (hair-edge quality fix)
--------------------------------------------
1. Default model is now BiRefNet (high-res, soft hair edges) instead of
   u2net_human_seg (320x320 internal mask -> blocky edges).
2. rembg post_process_mask is OFF. It binarises the mask (0/255), which is what
   produced the hard, step-like hair edges.
3. We ask rembg for the MASK ONLY and take colours from the ORIGINAL photo.
   rembg's own cutout darkens edge pixels, which caused dark fringes.
4. Cleanup no longer deletes flyaway hair strands (they were being removed as
   "small blobs"), and hole filling now actually fills holes (it did nothing before).
5. Soft alpha levels remove the faint ghost haze around hair.
6. De-halo: pymatting foreground estimation, with a cheap nearest-solid-colour
   fallback if pymatting is unavailable.
7. Model + pymatting (numba) are warmed up at startup so the first user is not slow.

Endpoints:
  GET  /health
  POST /remove-bg?bg=transparent|white|blue
  POST /api/remove-bg?bg=transparent|white|blue

Dependencies:
  pip install -U fastapi uvicorn pillow "rembg[cpu]" onnxruntime numpy scipy python-multipart pymatting
  (BiRefNet models need a recent rembg:  pip install -U rembg)
"""

import asyncio
from contextlib import asynccontextmanager
import io
import logging
import os
import time
from typing import Any, Optional, Tuple

from fastapi import FastAPI, File, HTTPException, Query, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image, ImageOps

# ── Logging Configuration ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("compixor.bg_api")

# ── Environment Configurations ───────────────────────────────────────────────
# Best hair quality:  birefnet-portrait   (slower on CPU, ~5-10 s)
# Faster option:      birefnet-general-lite
# Fastest / weaker:   isnet-general-use
BG_MODEL: str = os.getenv("BG_MODEL", "birefnet-general-lite")
MODEL_FALLBACKS = ["isnet-general-use", "u2net_human_seg", "u2net"]

ENABLE_FG_ESTIMATE: bool = os.getenv("BG_FG_ESTIMATE", "true").lower() in ("1", "true", "yes")
FG_MAX_SIDE: int = int(os.getenv("FG_ESTIMATE_MAX_SIDE", "900"))
MAX_SIDE: int = int(os.getenv("MAX_SIDE", "1600"))
MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "15"))

# BiRefNet is RAM/CPU heavy: on 2 vCPU keep this at 1.
MAX_CONCURRENT: int = int(os.getenv("MAX_CONCURRENT", "1"))
MAX_QUEUE: int = int(os.getenv("MAX_QUEUE", "8"))

# Alpha tuning
ALPHA_SMOOTH_SIGMA: float = float(os.getenv("ALPHA_SMOOTH_SIGMA", "0.5"))  # 0 = off
ALPHA_LO: int = int(os.getenv("ALPHA_LO", "10"))    # alpha <= LO  -> 0   (kills faint haze)
ALPHA_HI: int = int(os.getenv("ALPHA_HI", "245"))   # alpha >= HI  -> 255 (solid body)
MAX_HOLE_FRACTION: float = float(os.getenv("MAX_HOLE_FRACTION", "0.003"))  # of image area
KEEP_NEAR_FRACTION: float = float(os.getenv("KEEP_NEAR_FRACTION", "0.02"))  # of longest side

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://compixor-ai.cloud,https://www.compixor-ai.cloud,https://compixor-ai.vercel.app,http://localhost:3000,http://127.0.0.1:3000",
).split(",")

ALLOWED_BG_OPTIONS = {"transparent", "white", "blue"}

# Concurrency semaphore to prevent CPU exhaustion on VPS (e.g. 2 vCPU)
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENT)
waiting_lock = asyncio.Lock()
waiting_requests: int = 0


# ── Model Lifespan Management ────────────────────────────────────────────────
def _load_session():
    """Try BG_MODEL first, then fall back through lighter models."""
    import rembg

    candidates = [BG_MODEL] + [m for m in MODEL_FALLBACKS if m != BG_MODEL]
    last_exc: Optional[Exception] = None
    for name in candidates:
        try:
            logger.info("Loading background removal model '%s'...", name)
            session = rembg.new_session(name)
            logger.info("Model '%s' loaded successfully.", name)
            return session, name
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            logger.warning("Could not load '%s' (%s). Trying next fallback...", name, exc)
    raise RuntimeError(f"No background removal model could be loaded: {last_exc}")


def _warmup(session: Any) -> None:
    """Run one tiny pass so ONNX + pymatting (numba JIT) are compiled before the first user."""
    try:
        import rembg

        t0 = time.perf_counter()
        dummy = Image.new("RGB", (256, 256), (200, 200, 200))
        rembg.remove(dummy, session=session, only_mask=True, post_process_mask=False)

        if ENABLE_FG_ESTIMATE:
            rgb = (np.random.rand(128, 128, 3) * 255).astype(np.uint8)
            alpha = np.tile(np.linspace(0, 255, 128, dtype=np.uint8), (128, 1))
            _dehalo_foreground(rgb, alpha)
        logger.info("Warm-up finished in %.1fs", time.perf_counter() - t0)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Warm-up skipped: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-loads the segmentation model into memory once at startup."""
    session, name = await asyncio.to_thread(_load_session)
    app.state.session = session
    app.state.model_name = name
    await asyncio.to_thread(_warmup, session)
    yield
    logger.info("Shutting down background removal service.")


# ── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="Compixor AI — Single-File Background Removal API",
    version="2.2.0",
    description="All-in-one background removal service optimized for passport portraits.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ── Image Helper Functions ────────────────────────────────────────────────────
def _validate_and_prepare_image(raw_bytes: bytes) -> Image.Image:
    """Validate upload, orient using EXIF, downscale if needed, return RGB PIL image."""
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        with Image.open(io.BytesIO(raw_bytes)) as probe:
            probe.verify()

        img = Image.open(io.BytesIO(raw_bytes))
        img.load()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Corrupt or invalid image file: {exc}")

    img = ImageOps.exif_transpose(img)

    if img.mode != "RGB":
        img = img.convert("RGB")

    longest_side = max(img.width, img.height)
    if longest_side > MAX_SIDE:
        img.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)

    return img


def _clean_alpha_mask(alpha_arr: np.ndarray) -> np.ndarray:
    """
    Hair-safe alpha cleanup.

    1. Keep the largest person region PLUS anything close to it (flyaway hair
       strands are separate tiny blobs; they must survive).
    2. Remove far-away noise (stray background blobs).
    3. Fill small enclosed holes (shirt / tie / buttons) with solid alpha.
    4. Levels: drop faint haze (<= ALPHA_LO) and solidify the body (>= ALPHA_HI).
    5. Very light smoothing.
    """
    try:
        from scipy import ndimage as ndi
    except ImportError:
        logger.debug("scipy not installed; skipping mask morphology.")
        return alpha_arr

    H, W = alpha_arr.shape
    area = H * W

    binary = alpha_arr > 40
    labeled, n_labels = ndi.label(binary)
    if n_labels == 0:
        return alpha_arr

    sizes = ndi.sum(binary, labeled, range(1, n_labels + 1))
    largest_label = int(np.argmax(sizes)) + 1
    main = labeled == largest_label

    # 1+2. keep everything within reach of the main body (hair strands), drop the rest
    reach = max(3, int(max(H, W) * KEEP_NEAR_FRACTION))
    dist = ndi.distance_transform_edt(~main)
    keep = dist <= reach
    out = np.where(keep, alpha_arr, 0).astype(np.float32)

    # 3. fill SMALL enclosed holes only (large ones are real background, e.g. between arm and body)
    holes = ndi.binary_fill_holes(main) & ~main
    if holes.any():
        hole_lbl, n_holes = ndi.label(holes)
        hole_sizes = ndi.sum(holes, hole_lbl, range(1, n_holes + 1))
        max_hole = max(1, int(area * MAX_HOLE_FRACTION))
        small_ids = np.nonzero(hole_sizes <= max_hole)[0] + 1
        if small_ids.size:
            out[np.isin(hole_lbl, small_ids)] = 255.0

    # 4. levels: remove faint ghost haze, solidify the body, keep the soft middle
    lo, hi = float(ALPHA_LO), float(ALPHA_HI)
    if hi > lo:
        out = np.clip((out - lo) / (hi - lo), 0.0, 1.0) * 255.0

    # 5. gentle smoothing
    if ALPHA_SMOOTH_SIGMA > 0:
        out = ndi.gaussian_filter(out, sigma=ALPHA_SMOOTH_SIGMA)

    return np.clip(out, 0, 255).astype(np.uint8)


def _fallback_decontaminate(rgb_u8: np.ndarray, alpha_u8: np.ndarray, max_dist: int = 12) -> np.ndarray:
    """
    Cheap de-halo when pymatting is unavailable: edge pixels borrow the colour of the
    nearest fully-solid pixel, so the old background colour does not leak into the edge.
    """
    try:
        from scipy import ndimage as ndi
    except ImportError:
        return rgb_u8

    solid = alpha_u8 >= 250
    if not solid.any():
        return rgb_u8

    dist, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
    fix = (~solid) & (dist <= max_dist)
    out = rgb_u8.copy()
    out[fix] = rgb_u8[iy[fix], ix[fix]]
    return out


def _dehalo_foreground(rgb_u8: np.ndarray, alpha_u8: np.ndarray) -> np.ndarray:
    """Removes old-background colour bleed around hair/shoulders (foreground colour estimation)."""
    try:
        from pymatting import estimate_foreground_ml
    except ImportError:
        return _fallback_decontaminate(rgb_u8, alpha_u8)

    H, W = rgb_u8.shape[:2]
    longest = max(H, W)
    scale = 1.0

    rgb_work = rgb_u8.astype(np.float64) / 255.0
    alpha_work = alpha_u8.astype(np.float64) / 255.0

    if longest > FG_MAX_SIDE:
        scale = longest / FG_MAX_SIDE
        new_w = max(1, round(W / scale))
        new_h = max(1, round(H / scale))
        rgb_pil = Image.fromarray(rgb_u8).resize((new_w, new_h), Image.Resampling.LANCZOS)
        alpha_pil = Image.fromarray(alpha_u8).resize((new_w, new_h), Image.Resampling.LANCZOS)
        rgb_work = np.asarray(rgb_pil, dtype=np.float64) / 255.0
        alpha_work = np.asarray(alpha_pil, dtype=np.float64) / 255.0

    try:
        fg = estimate_foreground_ml(rgb_work, alpha_work)
    except Exception as exc:  # noqa: BLE001
        logger.warning("pymatting failed (%s); using fallback de-halo.", exc)
        return _fallback_decontaminate(rgb_u8, alpha_u8)

    fg_u8_small = (np.clip(fg, 0.0, 1.0) * 255).astype(np.uint8)

    if scale > 1.0:
        fg_pil = Image.fromarray(fg_u8_small).resize((W, H), Image.Resampling.LANCZOS)
        fg_full = np.asarray(fg_pil, dtype=np.uint8)
    else:
        fg_full = fg_u8_small

    # Keep the ORIGINAL full-resolution colours in solid areas (sharp skin/clothes);
    # use the estimated colours only where the edge is semi-transparent.
    edge = (alpha_u8 < 250)[:, :, np.newaxis]
    return np.where(edge, fg_full, rgb_u8).astype(np.uint8)


def _composite_image(fg_rgb: np.ndarray, alpha: np.ndarray, bg_mode: str) -> Image.Image:
    """Composite the foreground over transparent, white, or passport blue background."""
    bg_mode = bg_mode.strip().lower()

    if bg_mode in ("transparent", ""):
        out_rgba = np.dstack([fg_rgb, alpha])
        return Image.fromarray(out_rgba, mode="RGBA")

    alpha_norm = (alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
    fg_norm = fg_rgb.astype(np.float32)

    if bg_mode == "white":
        bg_rgb = np.array([255.0, 255.0, 255.0], dtype=np.float32).reshape(1, 1, 3)
    elif bg_mode == "blue":
        # Standard Passport / NADRA Royal Blue (#1D4ED8 -> 29, 78, 216)
        bg_rgb = np.array([29.0, 78.0, 216.0], dtype=np.float32).reshape(1, 1, 3)
    else:
        out_rgba = np.dstack([fg_rgb, alpha])
        return Image.fromarray(out_rgba, mode="RGBA")

    out_comp = fg_norm * alpha_norm + bg_rgb * (1.0 - alpha_norm)
    out_rgb = np.clip(out_comp, 0, 255).astype(np.uint8)
    return Image.fromarray(out_rgb, mode="RGB")


def _execute_pipeline_sync(image_data: bytes, bg_mode: str, session: Any) -> Tuple[bytes, dict]:
    """CPU-bound image segmentation and compositing pipeline."""
    import rembg

    t_start = time.perf_counter()
    timings = {}

    # 1. Validation & Orientation
    pil_img = _validate_and_prepare_image(image_data)

    # 2. Neural segmentation -> SOFT alpha mask only (no binarising post-process)
    t0 = time.perf_counter()
    mask_img = rembg.remove(
        pil_img,
        session=session,
        only_mask=True,
        post_process_mask=False,
    )
    timings["rembg_ms"] = int((time.perf_counter() - t0) * 1000)

    alpha_arr = np.asarray(mask_img.convert("L"), dtype=np.uint8)
    if alpha_arr.shape[:2] != (pil_img.height, pil_img.width):
        alpha_arr = np.asarray(
            Image.fromarray(alpha_arr).resize(pil_img.size, Image.Resampling.LANCZOS), dtype=np.uint8
        )

    # Colours come from the ORIGINAL photo (not from rembg's cutout)
    rgb_arr = np.asarray(pil_img, dtype=np.uint8)

    # 3. Hair-safe alpha cleanup
    t0 = time.perf_counter()
    alpha_arr = _clean_alpha_mask(alpha_arr)
    timings["cleanup_ms"] = int((time.perf_counter() - t0) * 1000)

    # 4. De-halo / colour bleed removal
    t0 = time.perf_counter()
    if ENABLE_FG_ESTIMATE:
        rgb_arr = _dehalo_foreground(rgb_arr, alpha_arr)
    timings["dehalo_ms"] = int((time.perf_counter() - t0) * 1000)

    # 5. Background Compositing
    final_img = _composite_image(rgb_arr, alpha_arr, bg_mode)

    # 6. PNG Export
    out_buf = io.BytesIO()
    final_img.save(out_buf, format="PNG", optimize=False)
    png_bytes = out_buf.getvalue()

    timings["total_ms"] = int((time.perf_counter() - t_start) * 1000)
    return png_bytes, timings


# ── HTTP Endpoints ────────────────────────────────────────────────────────────
@app.get("/health", tags=["Monitoring"])
async def health(request: Request):
    """Health-check endpoint for uptime monitoring and load balancers."""
    model_name = getattr(request.app.state, "model_name", BG_MODEL)
    return {
        "status": "ok",
        "service": "compixor-bg-remover",
        "model": model_name,
        "fg_estimate": ENABLE_FG_ESTIMATE,
        "max_concurrent": MAX_CONCURRENT,
    }


@app.post("/remove-bg", tags=["Background Removal"])
@app.post("/api/remove-bg", tags=["Background Removal"])
async def remove_background_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    bg: str = Query("transparent", description="Background mode: transparent, white, or blue"),
):
    """
    Remove background from portrait photo with neural matting and de-halo filter.
    Accepts multipart upload using field name 'file' or 'image'.
    """
    global waiting_requests

    upload = file or image
    if upload is None:
        raise HTTPException(
            status_code=400,
            detail="No file uploaded. Please supply an image via form field 'file' or 'image'.",
        )

    if bg.strip().lower() not in ALLOWED_BG_OPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid bg parameter '{bg}'. Allowed values: {', '.join(sorted(ALLOWED_BG_OPTIONS))}",
        )

    # Read uploaded file in chunks with max size guard
    max_bytes = MAX_UPLOAD_MB * 1024 * 1024
    content = bytearray()
    chunk_size = 64 * 1024

    while True:
        chunk = await upload.read(chunk_size)
        if not chunk:
            break
        content.extend(chunk)
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed upload size of {MAX_UPLOAD_MB} MB",
            )

    # Concurrency and queue backpressure guard
    async with waiting_lock:
        if waiting_requests >= MAX_QUEUE:
            raise HTTPException(
                status_code=503,
                detail="Server is busy processing other photos. Please try again in a few seconds.",
            )
        waiting_requests += 1

    acquired = False
    try:
        async with concurrency_semaphore:
            async with waiting_lock:
                waiting_requests -= 1
            acquired = True

            session = getattr(request.app.state, "session", None)
            if session is None:
                raise HTTPException(status_code=500, detail="Neural session not initialized.")

            # Run CPU-bound pipeline in worker thread so event loop stays responsive
            png_bytes, timings = await asyncio.to_thread(
                _execute_pipeline_sync, bytes(content), bg, session
            )
    finally:
        if not acquired:
            async with waiting_lock:
                waiting_requests -= 1

    logger.info(
        "Processed bg=%s model=%s in %d ms (seg=%d ms, cleanup=%d ms, dehalo=%d ms, size=%d KB)",
        bg,
        getattr(request.app.state, "model_name", "?"),
        timings["total_ms"],
        timings["rembg_ms"],
        timings["cleanup_ms"],
        timings["dehalo_ms"],
        len(png_bytes) // 1024,
    )

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={
            "Cache-Control": "no-store",
            "X-Process-Time": f"{timings['total_ms']}ms",
            "X-Engine": "compixor-ai-v2.2",
            "X-Model": getattr(request.app.state, "model_name", "unknown"),
        },
    )


# ── Standalone CLI Entrypoint ─────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    logger.info("Starting Compixor Background Removal API on port %d...", port)
    uvicorn.run("bg_api_single:app", host="0.0.0.0", port=port, reload=False, workers=1)
