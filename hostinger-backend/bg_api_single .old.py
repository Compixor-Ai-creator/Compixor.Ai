"""
Compixor AI — All-In-One Background Removal & Portrait Matting API
===================================================================
Single-file production backend for Compixor Passport Photo Maker.
Deployable on Hostinger VPS (Ubuntu / Python 3.11).

Endpoints:
  GET  /health
  POST /remove-bg?bg=transparent|white|blue
  POST /api/remove-bg?bg=transparent|white|blue

Dependencies:
  pip install fastapi uvicorn pillow rembg onnxruntime numpy scipy python-multipart
  (Optional for advanced de-halo: pip install pymatting)
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
from fastapi.responses import JSONResponse
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
BG_MODEL: str = os.getenv("BG_MODEL", "u2net_human_seg")  # Options: u2net_human_seg, isnet-general-use, u2net
ENABLE_FG_ESTIMATE: bool = os.getenv("BG_FG_ESTIMATE", "true").lower() in ("1", "true", "yes")
FG_MAX_SIDE: int = int(os.getenv("FG_ESTIMATE_MAX_SIDE", "900"))
MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "15"))
MAX_CONCURRENT: int = int(os.getenv("MAX_CONCURRENT", "2"))
MAX_QUEUE: int = int(os.getenv("MAX_QUEUE", "10"))

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://compixor-ai.cloud,https://www.compixor-ai.cloud,https://compixor-ai.vercel.app,http://localhost:3000,http://127.0.0.1:3000",
).split(",")

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_BG_OPTIONS = {"transparent", "white", "blue"}

# Concurrency semaphore to prevent CPU exhaustion on VPS (e.g. 2 vCPU)
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENT)
waiting_lock = asyncio.Lock()
waiting_requests: int = 0


# ── Model Lifespan Management ────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-loads the rembg segmentation model into memory once at startup."""
    import rembg

    logger.info("Pre-loading background removal model: '%s'...", BG_MODEL)
    try:
        session = rembg.new_session(BG_MODEL)
        app.state.session = session
        app.state.model_name = BG_MODEL
        logger.info("Model '%s' loaded successfully into memory.", BG_MODEL)
    except Exception as exc:
        logger.warning("Could not load '%s' (%s). Falling back to 'u2net'...", BG_MODEL, exc)
        session = rembg.new_session("u2net")
        app.state.session = session
        app.state.model_name = "u2net"
        logger.info("Fallback model 'u2net' loaded successfully.")

    yield
    logger.info("Shutting down background removal service.")


# ── FastAPI Application ───────────────────────────────────────────────────────
app = FastAPI(
    title="Compixor AI — Single-File Background Removal API",
    version="2.1.0",
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

    # Correct EXIF rotation
    img = ImageOps.exif_transpose(img)

    # Convert to RGB mode
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Downscale so longest side <= 1600 px (retains full quality for 300 DPI passport)
    longest_side = max(img.width, img.height)
    if longest_side > 1600:
        img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)

    return img


def _clean_alpha_mask(alpha_arr: np.ndarray) -> np.ndarray:
    """
    Cleans up the alpha channel:
    1. Removes isolated tiny background noise blobs.
    2. Fills small interior holes (e.g. inside dark shirts, ties, buttons).
    3. Smooths harsh stair-stepping on hair edges.
    """
    try:
        from scipy import ndimage as ndi
    except ImportError:
        logger.debug("scipy not installed; skipping mask morphology.")
        return alpha_arr

    H, W = alpha_arr.shape
    area = H * W
    min_blob_area = max(1, int(area * 0.001))

    # Binary mask of foreground pixels
    binary = alpha_arr > 30
    labeled, n_labels = ndi.label(binary)
    if n_labels == 0:
        return alpha_arr

    label_sizes = ndi.sum(binary, labeled, range(1, n_labels + 1))
    largest_label = int(np.argmax(label_sizes)) + 1
    largest_mask = labeled == largest_label

    # Fill internal holes inside the person
    filled_largest = ndi.binary_fill_holes(largest_mask)

    # Keep any other significant regions (e.g. shoulders or detached arm)
    extra_mask = np.zeros_like(binary)
    for lbl_idx, sz in enumerate(label_sizes, start=1):
        if lbl_idx != largest_label and sz >= min_blob_area:
            extra_mask |= (labeled == lbl_idx)

    combined_mask = filled_largest | extra_mask

    # Preserve alpha transparency within the valid mask
    cleaned_alpha = np.where(combined_mask, alpha_arr, 0).astype(np.float32)

    # Gentle Gaussian edge smoothing (sigma 0.6)
    cleaned_alpha = ndi.gaussian_filter(cleaned_alpha, sigma=0.6)

    return np.clip(cleaned_alpha, 0, 255).astype(np.uint8)


def _dehalo_foreground(rgb_u8: np.ndarray, alpha_u8: np.ndarray) -> np.ndarray:
    """Removes background color bleed (light halos) around hair strands using pymatting if available."""
    try:
        from pymatting import estimate_foreground_ml
    except ImportError:
        # Graceful fallback: return original RGB without modification
        return rgb_u8

    H, W = rgb_u8.shape[:2]
    longest = max(H, W)
    scale = 1.0

    rgb_work = rgb_u8.astype(np.float64) / 255.0
    alpha_work = alpha_u8.astype(np.float64) / 255.0

    # Downscale for fast foreground estimation
    if longest > FG_MAX_SIDE:
        scale = longest / FG_MAX_SIDE
        new_w = max(1, round(W / scale))
        new_h = max(1, round(H / scale))

        rgb_pil = Image.fromarray(rgb_u8).resize((new_w, new_h), Image.Resampling.LANCZOS)
        alpha_pil = Image.fromarray(alpha_u8).resize((new_w, new_h), Image.Resampling.LANCZOS)

        rgb_work = np.asarray(rgb_pil, dtype=np.float64) / 255.0
        alpha_work = np.asarray(alpha_pil, dtype=np.float64) / 255.0

    fg = estimate_foreground_ml(rgb_work, alpha_work)
    fg = np.clip(fg, 0.0, 1.0)

    if scale > 1.0:
        fg_pil = Image.fromarray((fg * 255).astype(np.uint8)).resize((W, H), Image.Resampling.LANCZOS)
        return np.asarray(fg_pil, dtype=np.uint8)

    return (fg * 255).astype(np.uint8)


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
        # Default transparent
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

    # 2. rembg neural segmentation
    t0 = time.perf_counter()
    rgba_output = rembg.remove(pil_img, session=session, post_process_mask=True)
    timings["rembg_ms"] = int((time.perf_counter() - t0) * 1000)

    rgba_arr = np.asarray(rgba_output, dtype=np.uint8)
    rgb_arr = rgba_arr[:, :, :3]
    alpha_arr = rgba_arr[:, :, 3]

    # 3. Clean Alpha Mask (hole filling & edge smoothing)
    t0 = time.perf_counter()
    alpha_arr = _clean_alpha_mask(alpha_arr)
    timings["cleanup_ms"] = int((time.perf_counter() - t0) * 1000)

    # 4. De-halo / Color Bleed Estimation
    if ENABLE_FG_ESTIMATE:
        t0 = time.perf_counter()
        rgb_arr = _dehalo_foreground(rgb_arr, alpha_arr)
        timings["dehalo_ms"] = int((time.perf_counter() - t0) * 1000)
    else:
        timings["dehalo_ms"] = 0

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
        "Processed bg=%s in %d ms (rembg=%d ms, cleanup=%d ms, dehalo=%d ms, size=%d KB)",
        bg,
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
            "X-Engine": "compixor-ai-v2",
        },
    )


# ── Standalone CLI Entrypoint ─────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    logger.info("Starting Compixor Background Removal API on port %d...", port)
    uvicorn.run("bg_api_single:app", host="0.0.0.0", port=port, reload=False, workers=1)
