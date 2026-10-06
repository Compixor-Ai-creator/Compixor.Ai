"""
Compixor AI — Image to Word Converter Backend
==============================================
FastAPI + PaddleOCR + python-docx (In-Memory Processing)

Features:
- Pure RAM processing via io.BytesIO (Zero disk storage footprint)
- PaddleOCR text detection with intelligent 2D coordinate sorting (reading order)
- python-docx structured document generation (headings, bullet points, numbered lists, RTL support)
- Cross-Origin Resource Sharing (CORS) configured for compixor-ai.cloud & compixor-ai.vercel.app
- High-performance StreamingResponse of .docx binary
"""

from __future__ import annotations

import io
import os
import re
import time
import logging
import unicodedata
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import numpy as np
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from paddleocr import PaddleOCR

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("compixor.img2word")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Compixor AI — Image to Word API",
    version="2.0.0",
    description="High-accuracy PaddleOCR + python-docx conversion endpoint for compixor-ai.cloud",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
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

# ── Configuration ─────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
MAX_BATCH_FILES: int = int(os.getenv("MAX_BATCH_FILES", "10"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

SUPPORTED_LANGS = {
    "eng", "eng+urd", "urd", "eng+ara", "ara",
    "fra", "deu", "spa", "por", "ita", "rus",
    "chi_sim", "jpn",
}

# PaddleOCR language code mappings
PADDLE_LANG_MAP = {
    "eng": "en",
    "fra": "fr",
    "deu": "de",
    "spa": "es",
    "por": "pt",
    "ita": "it",
    "rus": "ru",
    "chi_sim": "ch",
    "jpn": "japan",
    "ara": "ar",
    "urd": "en",       # Latin+Arabic tokens fallback to en
    "eng+urd": "en",
    "eng+ara": "ar",
}

# RTL languages (Urdu / Arabic)
RTL_LANGS = {"urd", "ara", "eng+urd", "eng+ara"}

# Model cache in memory to prevent cold starts
_ocr_cache: dict[str, PaddleOCR] = {}


def get_ocr(lang: str) -> PaddleOCR:
    """Return a cached PaddleOCR instance for the requested language."""
    paddle_lang = PADDLE_LANG_MAP.get(lang, "en")
    if paddle_lang not in _ocr_cache:
        logger.info(f"Loading PaddleOCR model in RAM for language: '{paddle_lang}'")
        _ocr_cache[paddle_lang] = PaddleOCR(
            use_angle_cls=True,
            lang=paddle_lang,
            show_log=False,
            use_gpu=False,  # Set to True if VPS has GPU with CUDA support
        )
    return _ocr_cache[paddle_lang]


# ── Text Heuristics & Helpers ─────────────────────────────────────────────────

HEADING_KEYWORDS_RE = re.compile(
    r"^(chapter|section|part|appendix|\d+\.|introduction|conclusion|summary|abstract|invoice|receipt)",
    re.IGNORECASE,
)
BULLET_RE = re.compile(r"^\s*([•\-\*\–\—\u2022\u25E6\u2043]|\([a-zA-Z0-9]\))\s+")
NUMBER_LIST_RE = re.compile(r"^\s*(\d+[\.\)])\s+")
ALL_CAPS_RE = re.compile(r"^[A-Z0-9\s\-\:\,\.\/\(\)]{4,}$")


def sanitize_text(text: str) -> str:
    """Remove invalid XML control characters that break OOXML documents."""
    return "".join(
        ch for ch in text
        if unicodedata.category(ch)[0] != "C" or ch in ("\n", "\t")
    )


def classify_line(text: str, font_height: float, median_height: float) -> str:
    """
    Classify a text line into structural document block:
    heading | bullet | numbered | normal.
    """
    stripped = text.strip()
    if not stripped:
        return "empty"
    if BULLET_RE.match(stripped):
        return "bullet"
    if NUMBER_LIST_RE.match(stripped):
        return "numbered"
    if median_height and font_height > (median_height * 1.35):
        return "heading"
    if ALL_CAPS_RE.match(stripped) and len(stripped) < 70:
        return "heading"
    if HEADING_KEYWORDS_RE.match(stripped) and len(stripped) < 80:
        return "heading"
    return "normal"


def set_rtl_paragraph(paragraph) -> None:
    """Add BiDi / RTL XML markers for proper Arabic & Urdu alignment."""
    pPr = paragraph._p.get_or_add_pPr()
    bidi = OxmlElement("w:bidi")
    bidi.set(qn("w:val"), "1")
    pPr.insert(0, bidi)


def preprocess_image_in_memory(raw_bytes: bytes) -> np.ndarray:
    """
    Open raw image bytes in RAM, fix EXIF orientation, and convert to numpy RGB array.
    Zero disk writes.
    """
    with Image.open(io.BytesIO(raw_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")
        return np.array(img)


def sort_and_cluster_ocr(raw_results: list) -> list[dict]:
    """
    Intelligently sort 2D bounding-box coordinates into human reading order:
    1. Filter low confidence & sanitize text.
    2. Cluster words/boxes that share the same horizontal band into unified lines.
    3. Sort each row left-to-right (x-axis).
    4. Sort document lines top-to-bottom (y-axis).
    """
    if not raw_results or not raw_results[0]:
        return []

    parsed = []
    for item in raw_results[0]:
        if not item or len(item) < 2:
            continue
        bbox_pts, (text, conf) = item
        clean = sanitize_text(text.strip())
        if not clean or conf < 0.30:
            continue

        xs = [pt[0] for pt in bbox_pts]
        ys = [pt[1] for pt in bbox_pts]
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)
        height = max(1.0, y_max - y_min)

        parsed.append({
            "text": clean,
            "confidence": float(conf),
            "x_min": x_min,
            "x_max": x_max,
            "y_min": y_min,
            "y_max": y_max,
            "y_center": (y_min + y_max) / 2.0,
            "bbox_height": height,
        })

    if not parsed:
        return []

    # Sort items vertically first
    parsed.sort(key=lambda it: it["y_min"])

    # Determine vertical tolerance for clustering based on median line height
    median_h = float(np.median([it["bbox_height"] for it in parsed]))
    v_tol = max(6.0, median_h * 0.45)

    # Cluster items into visual lines
    lines: list[list[dict]] = []
    for item in parsed:
        placed = False
        for line in lines:
            line_y_avg = float(np.mean([it["y_center"] for it in line]))
            if abs(item["y_center"] - line_y_avg) <= v_tol:
                line.append(item)
                placed = True
                break
        if not placed:
            lines.append([item])

    # Sort lines vertically (top to bottom)
    lines.sort(key=lambda line: float(np.mean([it["y_min"] for it in line])))

    # Within each line, sort horizontally (left to right) & combine
    final_lines: list[dict] = []
    for line in lines:
        line.sort(key=lambda it: it["x_min"])
        combined_text = " ".join(it["text"] for it in line)
        combined_height = max(it["bbox_height"] for it in line)
        combined_conf = float(np.mean([it["confidence"] for it in line]))
        final_lines.append({
            "text": combined_text,
            "confidence": combined_conf,
            "bbox_height": combined_height,
        })

    return final_lines


def build_docx_in_memory(
    pages: list[list[dict]],
    title_stem: str,
    is_rtl: bool = False,
) -> bytes:
    """
    Build Microsoft Word document purely in RAM (io.BytesIO).
    Returns binary docx bytes.
    """
    doc = Document()

    # Base styling
    normal_style = doc.styles["Normal"]
    normal_style.font.name = "Calibri"
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(33, 37, 41)

    # Standard A4 Margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    for page_idx, lines in enumerate(pages):
        if not lines:
            continue

        heights = [ln["bbox_height"] for ln in lines if ln["bbox_height"] > 0]
        median_height = float(np.median(heights)) if heights else 16.0

        for line in lines:
            text = line["text"]
            if not text:
                continue

            block_type = classify_line(text, line["bbox_height"], median_height)

            if block_type == "heading":
                para = doc.add_heading(text, level=2)
                if is_rtl:
                    set_rtl_paragraph(para)
                    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT

            elif block_type == "bullet":
                clean_bullet = BULLET_RE.sub("", text).strip()
                para = doc.add_paragraph(clean_bullet, style="List Bullet")
                if is_rtl:
                    set_rtl_paragraph(para)
                    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT

            elif block_type == "numbered":
                clean_num = NUMBER_LIST_RE.sub("", text).strip()
                para = doc.add_paragraph(clean_num, style="List Number")
                if is_rtl:
                    set_rtl_paragraph(para)
                    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT

            else:
                para = doc.add_paragraph(text)
                if is_rtl:
                    set_rtl_paragraph(para)
                    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT

        # Insert page break between multiple images (omit on final page)
        if page_idx < len(pages) - 1:
            doc.add_page_break()

    # Document properties
    doc.core_properties.author = "Compixor AI"
    doc.core_properties.title = title_stem
    doc.core_properties.description = "Converted via Compixor AI PaddleOCR Engine"

    # Save to memory buffer
    buffer = io.BytesIO()
    doc.save(buffer)
    docx_bytes = buffer.getvalue()
    buffer.close()
    return docx_bytes


# ── API Endpoints ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Liveness probe for Nginx reverse proxy and monitoring."""
    return {"status": "healthy", "engine": "PaddleOCR + python-docx"}


@app.post("/api/convert-img-to-docx")
async def convert_image_to_docx(
    files: list[UploadFile] = File(..., description="One or more image files"),
    language: str = Form("eng", description="Language code (eng, urd, ara, etc.)"),
):
    """
    Convert image(s) to editable Microsoft Word (.docx).
    Processes all buffers strictly in RAM with zero disk persistence.
    """
    t_start = time.perf_counter()

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    if len(files) > MAX_BATCH_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Batch size exceeds limit of {MAX_BATCH_FILES} images.",
        )

    lang = language.lower().strip()
    if lang not in SUPPORTED_LANGS:
        lang = "eng"

    is_rtl = lang in RTL_LANGS
    ocr_model = get_ocr(lang)

    pages_data: list[list[dict]] = []
    first_stem = "compixor-document"

    for idx, upload in enumerate(files):
        raw_bytes = await upload.read()

        if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File '{upload.filename}' exceeds {MAX_FILE_SIZE_MB}MB maximum size limit.",
            )

        if idx == 0 and upload.filename:
            first_stem = Path(upload.filename).stem

        try:
            image_array = preprocess_image_in_memory(raw_bytes)
        except Exception as e:
            logger.error(f"Failed to decode image {upload.filename}: {e}")
            raise HTTPException(
                status_code=415,
                detail=f"File '{upload.filename}' is not a valid or readable image.",
            )

        # Run PaddleOCR
        raw_ocr = ocr_model.ocr(image_array, cls=True)

        # Coordinate sorting into reading order
        sorted_lines = sort_and_cluster_ocr(raw_ocr)
        pages_data.append(sorted_lines)

    # Build DOCX in memory
    docx_binary = build_docx_in_memory(pages_data, first_stem, is_rtl=is_rtl)

    elapsed_ms = int((time.perf_counter() - t_start) * 1000)
    total_words = sum(len(line["text"].split()) for page in pages_data for line in page)

    output_filename = (
        f"{first_stem}-converted.docx"
        if len(files) == 1
        else f"compixor-converted-{len(files)}-pages.docx"
    )

    logger.info(
        f"Generated '{output_filename}' in {elapsed_ms}ms | "
        f"Pages: {len(pages_data)} | Words: {total_words} | Size: {len(docx_binary)} bytes"
    )

    return StreamingResponse(
        io.BytesIO(docx_binary),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{output_filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition, X-Processing-Time-Ms, X-Word-Count, X-Page-Count",
            "X-Processing-Time-Ms": str(elapsed_ms),
            "X-Word-Count": str(total_words),
            "X-Page-Count": str(len(pages_data)),
        },
    )
