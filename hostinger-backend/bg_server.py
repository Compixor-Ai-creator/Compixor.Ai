"""
Compixor AI — Background Removal FastAPI Service
================================================
Runs on port 8000.  Nginx proxies:
  /remove-bg  →  http://127.0.0.1:8000/remove-bg
  /api/remove-bg  →  (if you add it to nginx) or served via the same path

API contract (unchanged):
  POST /remove-bg?bg=transparent|white|blue
  POST /api/remove-bg?bg=transparent|white|blue
  Multipart field: `file`  (image bytes, any Pillow-readable format)
  Response: PNG bytes
  Error: JSON {"error": "..."} with appropriate HTTP status

Env vars:
  BG_FG_ESTIMATE=true       (default true)  — pymatting foreground estimation
  FG_ESTIMATE_MAX_SIDE=1200 (default 1200)  — downscale before estimation
  MAX_FILE_SIZE_MB=25        (default 25)
  ALLOWED_ORIGINS=...
"""
from __future__ import annotations

import io
import logging
import os
import time
from typing import Optional

from fastapi import FastAPI, File, Query, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from PIL import Image, ImageOps

from bg_remove import remove_background

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s — %(message)s")
logger = logging.getLogger("compixor.bg_server")

# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Compixor AI — Background Removal Service", version="2.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://compixor-ai.cloud,https://www.compixor-ai.cloud,https://compixor-ai.vercel.app,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)

MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "25")) * 1024 * 1024

# ── Helpers ────────────────────────────────────────────────────────────────────

def _validate_image(raw: bytes) -> bytes:
    """
    EXIF-transpose and verify the upload is a real image.
    Returns raw bytes normalised for rembg (JPEG or PNG).
    """
    if len(raw) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_FILE_SIZE_BYTES // (1024*1024)} MB.")
    try:
        with Image.open(io.BytesIO(raw)) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=95)
            return buf.getvalue()
    except Exception as exc:
        raise HTTPException(status_code=415, detail=f"Invalid image format: {exc}")


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "compixor-bg-removal",
        "version": "2.0.0",
        "fg_estimate": os.getenv("BG_FG_ESTIMATE", "true"),
    }


async def _process(file: UploadFile, bg: str) -> Response:
    raw = await file.read()
    image_bytes = _validate_image(raw)

    try:
        png_bytes, meta = remove_background(image_bytes, bg=bg)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("remove_background failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Processing error: {exc}")

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={
            "Access-Control-Expose-Headers": "X-Processing-Time-Ms,X-FG-Estimate-Ms,X-Cleanup-Ms,X-Output-Px",
            "X-Processing-Time-Ms": str(meta.get("total_ms", "")),
            "X-FG-Estimate-Ms":     str(meta.get("fg_estimate_ms", "")),
            "X-Cleanup-Ms":         str(meta.get("cleanup_ms", "")),
            "X-Output-Px":          str(meta.get("output_px", "")),
        },
    )


@app.post("/remove-bg")
async def remove_bg_root(
    file: UploadFile = File(...),
    bg: str = Query("transparent", pattern="^(transparent|white|blue)$"),
):
    """Legacy route — Nginx proxies /remove-bg here."""
    return await _process(file, bg)


@app.post("/api/remove-bg")
async def remove_bg_api(
    file: UploadFile = File(...),
    bg: str = Query("transparent", pattern="^(transparent|white|blue)$"),
):

    """Frontend-facing route — also accept /api/remove-bg on same service."""
    return await _process(file, bg)
