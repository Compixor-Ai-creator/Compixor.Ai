"""
Compixor AI — Image to Word v5.0 (Gemini 1.5 Flash Vision + Smart Layout Engine)
================================================================================
Architecture:
  - Gemini 1.5 Flash Vision API: Deep Document Intelligence (< 2.5s latency)
  - 1:1 Document Reconstruction via python-docx:
      * Clean Header: Center Title, Subtitle, and Date
      * Side-by-Side Profile: Borderless 2-Column Table (Left: Details, Right: Cropped Photo)
      * Native Word Tables: Exact 7-column layout, shaded headers, editable cells
      * Signature Block: Cropped signature image + Controller title
      * Urdu Notice Box: Clean RTL Urdu text in bordered callout box
  - Fallback Engine: Seamless transition to local PaddleOCR if API key is not present

CORS: compixor-ai.cloud + compixor-ai.vercel.app
"""

from __future__ import annotations

import io
import os
import re
import json
import time
import logging
import unicodedata
from pathlib import Path
from typing import Optional, Any

import numpy as np
from PIL import Image, ImageOps
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.table import WD_TABLE_ALIGNMENT

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("compixor.gemini_engine")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Compixor AI — Vision Document Engine v5",
    version="5.0.0",
    description="Gemini 1.5 Flash Vision + python-docx 1:1 Layout Reconstruction",
)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://compixor-ai.cloud,https://www.compixor-ai.cloud,"
    "https://compixor-ai.vercel.app,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
MAX_BATCH_FILES = int(os.getenv("MAX_BATCH_FILES", "10"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Check if Gemini API Key is configured
genai_ready = bool(GEMINI_API_KEY)
if genai_ready:
    logger.info("Gemini Vision Engine configured and ready!")


# ── Utility Formatting Helpers ────────────────────────────────────────────────

def sanitize(text: Any) -> str:
    """Strip XML-unsafe control characters."""
    if text is None:
        return ""
    text_str = str(text)
    return "".join(
        ch for ch in text_str
        if unicodedata.category(ch)[0] != "C" or ch in ("\n", "\t")
    ).strip()


def set_rtl_para(para) -> None:
    """Set Right-to-Left alignment and bidi flag for Urdu / Arabic."""
    pPr = para._p.get_or_add_pPr()
    bidi = OxmlElement("w:bidi")
    bidi.set(qn("w:val"), "1")
    pPr.insert(0, bidi)
    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT


def set_cell_borders(cell, color="94A3B8", sz="4"):
    """Apply borders to a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = OxmlElement(f"w:{edge}")
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), sz)
        tag.set(qn("w:space"), "0")
        tag.set(qn("w:color"), color)
        tcBorders.append(tag)
    tcPr.append(tcBorders)


def shade_cell(cell, fill_hex: str) -> None:
    """Set background color fill of a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill_hex)
    tcPr.append(shd)


def crop_normalized_box(pil_img: Image.Image, box: list) -> Optional[io.BytesIO]:
    """
    Crop region using normalized coordinates [ymin, xmin, ymax, xmax] in 0-1000 scale.
    """
    if not box or len(box) != 4:
        return None
    try:
        ymin, xmin, ymax, xmax = [float(v) for v in box]
        w, h = pil_img.width, pil_img.height

        x1 = int(max(0, min(w, (xmin / 1000.0) * w)))
        y1 = int(max(0, min(h, (ymin / 1000.0) * h)))
        x2 = int(max(0, min(w, (xmax / 1000.0) * w)))
        y2 = int(max(0, min(h, (ymax / 1000.0) * h)))

        if (x2 - x1) < 20 or (y2 - y1) < 20:
            return None

        crop = pil_img.crop((x1, y1, x2, y2))
        buf = io.BytesIO()
        crop.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        return buf
    except Exception as e:
        logger.warning(f"Failed to crop box {box}: {e}")
        return None


# ── Gemini 1.5 Flash Vision Extraction ────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert document reconstruction and OCR AI for high-fidelity Microsoft Word conversion.
Analyze the uploaded document image with extreme accuracy and return a valid JSON object matching this schema:

{
  "header": {
    "title": "Organization / University Name (e.g. ALLAMA IQBAL OPEN UNIVERSITY)",
    "subtitle": "Document Subtitle (e.g. ADMIT CARD)",
    "date": "Document Date if visible (e.g. 29-Sep-26) or null",
    "logo_box_normalized": [ymin, xmin, ymax, xmax] // 0-1000 scale, or null
  },
  "profile_section": {
    "fields": [
      {"label": "SEMESTER", "value": "2026 SPRING (O)"},
      {"label": "PROGRAMME", "value": "B.A GEN.(A.D. IN ARTS)"},
      {"label": "STUDENT ID / REGISTRATION NO", "value": "0000629245"},
      {"label": "NAME", "value": "SYED ZOHAIB HASSAN SHAH"},
      {"label": "FATHER NAME", "value": "ABDUL RAZZAQ SHAH"},
      {"label": "ADDRESS", "value": "STREET TEACHER HANIF MOH RAM GARAH SHEIKHUPURA Pakistan Punjab"}
    ],
    "photo_box_normalized": [ymin, xmin, ymax, xmax] // coordinates of student picture, 0-1000 scale
  },
  "tables": [
    {
      "headers": ["S. No.", "Subject", "Course", "Date", "Time From - To", "Center No.", "Address"],
      "rows": [
        ["1", "AIOU- 464", "ISLAMIC FIQH(Course)", "3-Oct-26", "14:00 - 17:00", "SHP-SH:11", "Allama Iqbal Open University Regional Centre..."]
      ]
    }
  ],
  "signatures": [
    {
      "title": "Controller of Examination",
      "box_normalized": [ymin, xmin, ymax, xmax] // signature image crop box, 0-1000 scale
    }
  ],
  "urdu_notice_box": {
    "title": "ضروری ہدایات برائے طلبہ",
    "instructions": [
      "1- دوران امتحان کسی بھی قسم کا امدادی مواد یا الیکٹرانک ڈیوائس پاس رکھنا جرم ہے۔",
      "2- طلبہ اپنی جوابی کاپیوں پر اپنی Enrollment / آئی ڈی درست درج کریں۔",
      "3- قانون نافذ کرنے والے اداروں کے ملازمین باوردی یا اسلحے سمیت کمرہ امتحان میں داخل نہیں ہو سکتے۔",
      "4- کمرہ امتحان میں داخلے کے لیے اپنا اصل شناختی کارڈ ساتھ لائیں۔",
      "5- شعبہ امتحانات کی پیشگی اجازت کے بغیر امتحانی مرکز تبدیل کرنے کی صورت میں مروجہ امتحانی قواعد کے تحت تادیبی کارروائی عمل میں لائی جائے گی۔"
    ]
  },
  "general_paragraphs": [
    // Any remaining text lines not covered in the sections above
  ]
}

RULES:
1. Do not miss any table columns. If there is an Address column, extract its full address text completely.
2. Separate words with natural spaces. Never merge words like 'ALLAMAIQBAL'.
3. For Urdu text, output genuine readable Urdu characters.
4. Output STRICT JSON only. Do not wrap in markdown or backticks.
"""


def extract_with_gemini(pil_img: Image.Image) -> dict:
    """Call Gemini Vision with automatic multi-model fallback."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured.")

    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)

    candidate_models = [
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
    ]
    last_err = None

    for model_name in candidate_models:
        try:
            logger.info(f"Attempting extraction with {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                [SYSTEM_PROMPT, pil_img],
                generation_config={
                    "temperature": 0.1,
                    "response_mime_type": "application/json",
                },
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            logger.info(f"Gemini Vision successfully extracted layout via {model_name}!")
            return json.loads(text.strip())
        except Exception as e:
            logger.warning(f"Model {model_name} failed ({e}), trying next candidate...")
            last_err = e
            continue

    raise last_err or RuntimeError("All Gemini models failed.")


# ── High-Fidelity DOCX Document Builder ───────────────────────────────────────

def build_docx_from_data(pil_img: Image.Image, data: dict, title_stem: str) -> bytes:
    doc = Document()

    # Set Clean Page Margins (A4)
    for section in doc.sections:
        section.top_margin = Cm(1.2)
        section.bottom_margin = Cm(1.2)
        section.left_margin = Cm(1.5)
        section.right_margin = Cm(1.5)

    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(10)

    header = data.get("header", {})
    profile = data.get("profile_section", {})
    tables = data.get("tables", [])
    signatures = data.get("signatures", [])
    urdu_box = data.get("urdu_notice_box")

    # ── 1. Top Date (Right-Aligned) ───────────────────────────────────────────
    doc_date = header.get("date")
    if doc_date:
        p_date = doc.add_paragraph()
        p_date.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_date.paragraph_format.space_after = Pt(2)
        r_date = p_date.add_run(f"Date: {sanitize(doc_date)}")
        r_date.font.size = Pt(9.5)
        r_date.font.bold = True

    # ── 2. Header (Logo + University Name + Subtitle) ─────────────────────────
    # If Logo detected, insert at top left
    logo_box = header.get("logo_box_normalized")
    if logo_box:
        logo_buf = crop_normalized_box(pil_img, logo_box)
        if logo_buf:
            p_logo = doc.add_paragraph()
            p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_logo.paragraph_format.space_after = Pt(2)
            run_logo = p_logo.add_run()
            run_logo.add_picture(logo_buf, width=Inches(0.9))

    title_text = header.get("title", "")
    if title_text:
        h1 = doc.add_paragraph()
        h1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        h1.paragraph_format.space_before = Pt(2)
        h1.paragraph_format.space_after = Pt(2)
        r_title = h1.add_run(sanitize(title_text))
        r_title.font.name = "Calibri"
        r_title.font.size = Pt(15)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(15, 23, 42)

    subtitle_text = header.get("subtitle", "")
    if subtitle_text:
        h2 = doc.add_paragraph()
        h2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        h2.paragraph_format.space_before = Pt(0)
        h2.paragraph_format.space_after = Pt(8)
        r_sub = h2.add_run(sanitize(subtitle_text))
        r_sub.font.name = "Calibri"
        r_sub.font.size = Pt(13)
        r_sub.font.bold = True
        r_sub.font.color.rgb = RGBColor(30, 41, 59)

    # ── 3. Profile Section: Side-by-Side Invisible 2-Column Table ─────────────
    fields = profile.get("fields", [])
    photo_box = profile.get("photo_box_normalized")
    photo_buf = crop_normalized_box(pil_img, photo_box) if photo_box else None

    if fields or photo_buf:
        # Create 1-row, 2-column borderless layout table
        profile_tbl = doc.add_table(rows=1, cols=2)
        profile_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell_left = profile_tbl.cell(0, 0)
        cell_right = profile_tbl.cell(0, 1)

        # Set column widths (70% info, 30% photo)
        cell_left.width = Inches(5.0)
        cell_right.width = Inches(1.8)

        # Fill Left Cell: Student Details
        cell_left.text = ""  # Clear default
        for idx, f in enumerate(fields):
            lbl = sanitize(f.get("label", ""))
            val = sanitize(f.get("value", ""))
            p_field = cell_left.paragraphs[0] if idx == 0 else cell_left.add_paragraph()
            p_field.paragraph_format.space_before = Pt(1)
            p_field.paragraph_format.space_after = Pt(2)

            r_lbl = p_field.add_run(f"{lbl}: ")
            r_lbl.font.bold = True
            r_lbl.font.size = Pt(9.5)
            r_lbl.font.color.rgb = RGBColor(15, 23, 42)

            r_val = p_field.add_run(val)
            r_val.font.size = Pt(9.5)
            r_val.font.color.rgb = RGBColor(30, 41, 59)

        # Fill Right Cell: Student Photo
        cell_right.text = ""  # Clear default
        if photo_buf:
            p_photo = cell_right.paragraphs[0]
            p_photo.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_photo = p_photo.add_run()
            r_photo.add_picture(photo_buf, width=Inches(1.3))

        # Space below profile
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(4)

    # ── 4. Native Word Tables (All 7 Columns, Shaded Headers) ─────────────────
    for tbl_data in tables:
        headers = [sanitize(h) for h in tbl_data.get("headers", [])]
        rows = tbl_data.get("rows", [])
        if not headers and not rows:
            continue

        num_cols = max(len(headers), max((len(r) for r in rows), default=0))
        num_rows = (1 if headers else 0) + len(rows)

        w_table = doc.add_table(rows=num_rows, cols=num_cols)
        w_table.style = "Table Grid"
        w_table.alignment = WD_TABLE_ALIGNMENT.CENTER

        cur_r = 0
        if headers:
            for c_idx in range(num_cols):
                cell = w_table.cell(0, c_idx)
                cell.text = ""
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)

                text_h = headers[c_idx] if c_idx < len(headers) else ""
                r = p.add_run(text_h)
                r.font.bold = True
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(15, 23, 42)

                set_cell_borders(cell, color="94A3B8")
                shade_cell(cell, "E0EDFE")  # Light clean blue header tint
            cur_r = 1

        for r_data in rows:
            for c_idx in range(num_cols):
                cell = w_table.cell(cur_r, c_idx)
                cell.text = ""
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                # Center short columns, left align longer text like addresses
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx in (1, 2, 6) else WD_ALIGN_PARAGRAPH.CENTER

                val_text = sanitize(r_data[c_idx]) if c_idx < len(r_data) else ""
                r = p.add_run(val_text)
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(30, 41, 59)

                set_cell_borders(cell, color="CBD5E1")
            cur_r += 1

        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_after = Pt(4)

    # ── 5. Signatures (Controller of Examination) ─────────────────────────────
    for sig in signatures:
        sig_title = sanitize(sig.get("title", "Controller of Examination"))
        sig_box = sig.get("box_normalized")
        sig_buf = crop_normalized_box(pil_img, sig_box) if sig_box else None

        p_sig = doc.add_paragraph()
        p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_sig.paragraph_format.space_before = Pt(6)
        p_sig.paragraph_format.space_after = Pt(1)

        if sig_buf:
            r_sig_img = p_sig.add_run()
            r_sig_img.add_picture(sig_buf, width=Inches(1.2))
            p_sig = doc.add_paragraph()
            p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            p_sig.paragraph_format.space_after = Pt(4)

        r_sig_txt = p_sig.add_run(sig_title)
        r_sig_txt.font.bold = True
        r_sig_txt.font.size = Pt(10)
        r_sig_txt.font.color.rgb = RGBColor(15, 23, 42)

    # ── 6. Urdu Notice Box (ضروری ہدایات برائے طلبہ) ──────────────────────────
    if urdu_box:
        u_title = sanitize(urdu_box.get("title", "ضروری ہدایات برائے طلبہ"))
        instructions = urdu_box.get("instructions", [])

        # Create a single-cell bordered callout box for the notice
        notice_tbl = doc.add_table(rows=1, cols=1)
        notice_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        notice_cell = notice_tbl.cell(0, 0)
        notice_cell.width = Inches(6.8)
        set_cell_borders(notice_cell, color="64748B", sz="6")
        shade_cell(notice_cell, "F8FAFC")

        notice_cell.text = ""  # Clear default

        # Title
        p_utitle = notice_cell.paragraphs[0]
        p_utitle.paragraph_format.space_before = Pt(4)
        p_utitle.paragraph_format.space_after = Pt(4)
        set_rtl_para(p_utitle)
        p_utitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ut = p_utitle.add_run(u_title)
        r_ut.font.name = "Arial"
        r_ut.font.size = Pt(11.5)
        r_ut.font.bold = True
        r_ut.font.color.rgb = RGBColor(15, 23, 42)

        # Instructions list
        for inst in instructions:
            inst_clean = sanitize(inst)
            if not inst_clean:
                continue
            p_inst = notice_cell.add_paragraph()
            p_inst.paragraph_format.space_before = Pt(1)
            p_inst.paragraph_format.space_after = Pt(2)
            set_rtl_para(p_inst)

            r_inst = p_inst.add_run(inst_clean)
            r_inst.font.name = "Arial"
            r_inst.font.size = Pt(9.5)
            r_inst.font.color.rgb = RGBColor(30, 41, 59)

    # Document properties
    doc.core_properties.author = "Compixor AI"
    doc.core_properties.title = title_stem
    doc.core_properties.comments = "Converted via Compixor AI Gemini Vision Engine v5"

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ── Local Fallback Engine (PaddleOCR) ─────────────────────────────────────────

def local_ocr_fallback(pil_img: Image.Image, first_stem: str) -> bytes:
    """Fallback if Gemini API is unavailable."""
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(lang="en")
    raw = ocr.ocr(np.array(pil_img))

    doc = Document()
    doc.add_heading(first_stem, level=1)
    if raw and raw[0]:
        for item in raw[0]:
            if item and item[1]:
                doc.add_paragraph(sanitize(item[1][0]))

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    mode = "Gemini Flash Vision (Active)" if genai_ready else "Local OCR Fallback (API Key missing)"
    return {
        "status": "healthy",
        "engine": f"Compixor AI v5 — {mode}",
        "gemini_active": genai_ready,
    }


@app.post("/api/convert-img-to-docx")
async def convert_image_to_docx(
    files: list[UploadFile] = File(...),
    language: str = Form("eng"),
):
    t_start = time.perf_counter()

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    if len(files) > MAX_BATCH_FILES:
        raise HTTPException(status_code=400, detail=f"Max {MAX_BATCH_FILES} files per request.")

    upload = files[0]
    raw_bytes = await upload.read()
    first_stem = Path(upload.filename).stem if upload.filename else "compixor-document"

    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_FILE_SIZE_MB}MB limit.")

    try:
        with Image.open(io.BytesIO(raw_bytes)) as img:
            pil_img = ImageOps.exif_transpose(img)
            if pil_img.mode != "RGB":
                pil_img = pil_img.convert("RGB")
    except Exception as exc:
        logger.error(f"Image decode failed: {exc}")
        raise HTTPException(status_code=415, detail="Invalid image file format.")

    # Primary: Gemini Flash Vision (< 2.5s)
    if genai_ready:
        try:
            logger.info(f"Processing '{upload.filename}' with Gemini Vision...")
            doc_data = extract_with_gemini(pil_img)
            docx_bytes = build_docx_from_data(pil_img, doc_data, first_stem)
            logger.info("Successfully synthesized high-fidelity DOCX with Gemini Vision!")
        except Exception as e:
            logger.warning(f"Gemini Vision failed ({e}), falling back to local OCR...")
            docx_bytes = local_ocr_fallback(pil_img, first_stem)
    else:
        logger.info("GEMINI_API_KEY not found. Running local OCR fallback...")
        docx_bytes = local_ocr_fallback(pil_img, first_stem)

    elapsed_ms = int((time.perf_counter() - t_start) * 1000)
    output_name = f"{first_stem}-converted.docx"

    logger.info(f"Delivered {output_name} in {elapsed_ms}ms ({len(docx_bytes)} bytes)")

    return StreamingResponse(
        io.BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{output_name}"',
            "Access-Control-Expose-Headers": "Content-Disposition, X-Processing-Time-Ms",
            "X-Processing-Time-Ms": str(elapsed_ms),
        },
    )
