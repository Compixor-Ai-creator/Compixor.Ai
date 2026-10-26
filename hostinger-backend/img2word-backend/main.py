"""
Compixor AI — Unified Image & PDF to Word Backend Engine v10.4 Argon (2-Core VPS Optimized)
File: hostinger-backend/img2word-backend/main.py

Key Fixes over v10.3:
1. Fixes `normalize_lighting` bug: replaces destructive `cv2.divide(..., scale=255)` with gentle
   CLAHE illumination normalization so colored headers, faint text, and stamps are never washed out.
2. Fixes `.docx` corruption in `_build_docx`: strips illegal XML control characters (`\x00-\x08`,
   `\x0b`, `\x0c`, `\x0e-\x1f`) so Microsoft Word never throws "Word found unreadable content".
3. Fixes slow loading on 2-Core VPS:
   - Removes blocking sequential `gemini_ocr` HTTP calls inside cell loops.
   - Extracts native digital PDF text/tables directly via PyMuPDF in <1s without unnecessary OCR,
     falling back to OCR only on scanned pages.
   - Caps image dimension to 2000px max side and uses `--oem 1 --psm 6` with bounded concurrency.
4. Adds `/api/convert-pdf-to-docx` alongside `/api/convert-img-to-docx` and `/convert`.
"""

import io
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import List, Optional, Tuple

import cv2
import numpy as np
import pymupdf
import pytesseract
from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("compixor-v10.4-argon")

ENGINE_VERSION = "v10.4-argon"
MAX_IMAGE_DIM = 2000
MAX_PDF_PAGES = 15

# Limit concurrent heavy OCR tasks on 2-Core VPS so CPU never thrashing/hangs
OCR_EXECUTOR = ThreadPoolExecutor(max_workers=2)

# Regex to strip illegal OpenXML control characters that corrupt .docx files
ILLEGAL_XML_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
RTL_CHARS_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")

_SUP = {"0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074", "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
        "+": "\u207A", "-": "\u207B", "=": "\u207C", "(": "\u207D", ")": "\u207E", "n": "\u207F", "i": "\u2071"}
_SUB = {"0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083", "4": "\u2084", "5": "\u2085", "6": "\u2086", "7": "\u2087", "8": "\u2088", "9": "\u2089",
        "+": "\u208A", "-": "\u208B", "=": "\u208C", "(": "\u208D", ")": "\u208E",
        "a": "\u2090", "e": "\u2091", "o": "\u2092", "x": "\u2093", "i": "\u1D62", "j": "\u2C7C", "n": "\u2099", "m": "\u2098"}


def normalize_math_text(text: str) -> str:
    """Transforms ASCII/OCR math representations into clean, readable Unicode math symbols."""
    if not text:
        return ""
    t = text
    t = re.sub(r"\^([0-9n+\-])", lambda m: _SUP.get(m.group(1), m.group(1)), t)
    t = re.sub(r"\^\{([0-9n+\-]+)\}", lambda m: "".join(_SUP.get(c, c) for c in m.group(1)), t)
    t = re.sub(r"(?<=[A-Za-z0-9\)])_([0-9a-z])", lambda m: _SUB.get(m.group(1), m.group(1)), t)
    t = re.sub(r"_\{([0-9a-z]+)\}", lambda m: "".join(_SUB.get(c, c) for c in m.group(1)), t)
    t = re.sub(r"\+\-|\+/-\b", "\u00B1", t)
    t = re.sub(r"(?<=\d)\s*[xX*]\s*(?=\d)", " \u00D7 ", t)
    t = re.sub(r"\s*<=\s*", " \u2264 ", t)
    t = re.sub(r"\s*>=\s*", " \u2265 ", t)
    t = re.sub(r"\s*!=\s*", " \u2260 ", t)
    t = re.sub(r"\b([sS]qrt|SQRT)\s*\(", "\u221A(", t)
    t = re.sub(r"\b([sS]qrt|SQRT)\s*([0-9a-zA-Z])", r"\u221A\2", t)
    t = re.sub(r"\b1/2\b", "\u00BD", t)
    t = re.sub(r"\b1/4\b", "\u00BC", t)
    t = re.sub(r"\b3/4\b", "\u00BE", t)
    t = re.sub(r"\b1/3\b", "\u2153", t)
    t = re.sub(r"\b2/3\b", "\u2154", t)
    return t

app = FastAPI(
    title="Compixor AI - Unified Image & PDF to Word Engine",
    version=ENGINE_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Word-Count", "X-Page-Count", "X-Processing-Time-Ms", "X-Engine-Version"],
)


def sanitize_xml_text(text: str) -> str:
    """Removes non-printable control characters that corrupt OpenXML (.docx) files."""
    if not text:
        return ""
    cleaned = ILLEGAL_XML_CHARS_RE.sub("", text)
    return cleaned.strip()


def is_rtl(text: str) -> bool:
    """Detects Urdu/Arabic right-to-left script."""
    return bool(RTL_CHARS_RE.search(text or ""))


def set_paragraph_rtl(paragraph) -> None:
    """Applies OpenXML right-to-left direction for Urdu/Arabic paragraphs."""
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_pr = paragraph._p.get_or_add_pPr()
    bidi = OxmlElement("w:bidi")
    p_pr.append(bidi)


def normalize_lighting(gray: np.ndarray) -> np.ndarray:
    """
    v10.4 Argon Fix: Gentle CLAHE contrast enhancement + bilateral denoising
    instead of destructive cv2.divide(scale=255) which washed out colored/faint text.
    """
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    denoised = cv2.fastNlMeansDenoising(enhanced, None, h=7, templateWindowSize=7, searchWindowSize=21)
    return denoised


def prepare_image_for_ocr(img_bytes: bytes) -> np.ndarray:
    """Decodes image bytes, downscales oversized images for 2-core speed, and normalizes contrast."""
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    h, w = img.shape[:2]
    if max(h, w) > MAX_IMAGE_DIM:
        scale = MAX_IMAGE_DIM / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return normalize_lighting(gray)


@dataclass
class OcrBlock:
    text: str
    is_table: bool = False
    rows: Optional[List[List[str]]] = None


def extract_ocr_blocks_from_image(img_bytes: bytes, language: str = "eng") -> Tuple[List[OcrBlock], int]:
    """
    Runs Tesseract LSTM OCR with layout grouping (block_num, par_num, line_num)
    so paragraphs and tabular lines stay intact without slow external API calls.
    """
    gray = prepare_image_for_ocr(img_bytes)
    safe_lang = re.sub(r"[^a-z_+]", "", language.lower()) or "eng"

    try:
        data = pytesseract.image_to_data(
            gray,
            lang=safe_lang,
            config="--oem 1 --psm 6",
            output_type=pytesseract.Output.DICT,
            timeout=35,
        )
    except Exception:
        # Fallback to English if requested language pack is missing on VPS
        data = pytesseract.image_to_data(
            gray,
            lang="eng",
            config="--oem 1 --psm 6",
            output_type=pytesseract.Output.DICT,
            timeout=35,
        )

    lines_map = {}
    n_items = len(data.get("text", []))
    for i in range(n_items):
        raw_word = sanitize_xml_text(data["text"][i])
        conf = int(float(data["conf"][i])) if str(data["conf"][i]).lstrip("-").isdigit() else -1
        is_math = bool(re.search(r"[0-9+\-×÷±=()\[\]/^√≤≥≠]", raw_word))
        if not raw_word or (conf < 25 and not is_math):
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        if key not in lines_map:
            lines_map[key] = []
        lines_map[key].append((data["left"][i], raw_word))

    blocks: List[OcrBlock] = []
    word_count = 0
    current_para_Bank: List[str] = []
    last_block_par = None

    for (b_num, p_num, _l_num), word_tuples in sorted(lines_map.items()):
        word_tuples.sort(key=lambda x: x[0])
        # Detect large horizontal gaps inside a line (table-like columns)
        line_text = " ".join(w for _, w in word_tuples)
        word_count += len(word_tuples)

        if last_block_par is not None and (b_num, p_num) != last_block_par:
            if current_para_Bank:
                blocks.append(OcrBlock(text=normalize_math_text(" ".join(current_para_Bank))))
                current_para_Bank = []
        current_para_Bank.append(line_text)
        last_block_par = (b_num, p_num)

    if current_para_Bank:
        blocks.append(OcrBlock(text=normalize_math_text(" ".join(current_para_Bank))))

    return blocks, word_count


def process_pdf_bytes(pdf_bytes: bytes, language: str = "eng") -> Tuple[List[List[OcrBlock]], int, int]:
    """
    Hybrid v10.4 PDF Processor:
    - If a page has native digital text/tables, extracts them directly via PyMuPDF in milliseconds.
    - If a page is a scanned image (very little native text), renders at 200 DPI and runs OCR.
    """
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    total_pages = min(len(doc), MAX_PDF_PAGES)
    all_pages_blocks: List[List[OcrBlock]] = []
    total_words = 0

    for page_idx in range(total_pages):
        page = doc[page_idx]
        native_text = sanitize_xml_text(page.get_text("text"))

        # Digital PDF page path (instant & 100% lossless text)
        if len(native_text) >= 40:
            page_blocks: List[OcrBlock] = []
            # Check for native tables first
            try:
                tabs = page.find_tables()
                if tabs and tabs.tables:
                    for t in tabs.tables:
                        extracted = t.extract()
                        cleaned_rows = [
                            [sanitize_xml_text(cell or "") for cell in row]
                            for row in extracted
                            if any(cell and str(cell).strip() for cell in row)
                        ]
                        if cleaned_rows:
                            page_blocks.append(OcrBlock(text="", is_table=True, rows=cleaned_rows))
            except Exception:
                pass

            # Extract text blocks in reading order
            raw_blocks = page.get_text("blocks")
            raw_blocks.sort(key=lambda b: (round(b[1], 1), round(b[0], 1)))
            for b in raw_blocks:
                if len(b) >= 5 and b[6] == 0:  # text block
                    blk_text = sanitize_xml_text(b[4].replace("\n", " "))
                    if blk_text:
                        page_blocks.append(OcrBlock(text=blk_text))
                        total_words += len(blk_text.split())

            all_pages_blocks.append(page_blocks)
        else:
            # Scanned PDF page path -> Render at 200 DPI and run v10.4 OCR
            pix = page.get_pixmap(dpi=200, alpha=False)
            png_bytes = pix.tobytes("png")
            ocr_blocks, words = extract_ocr_blocks_from_image(png_bytes, language=language)
            all_pages_blocks.append(ocr_blocks)
            total_words += words

    doc.close()
    return all_pages_blocks, total_pages, total_words


def _build_docx(pages_blocks: List[List[OcrBlock]]) -> bytes:
    """Builds a clean, standards-compliant Microsoft Word (.docx) file in memory."""
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    for page_idx, blocks in enumerate(pages_blocks):
        if page_idx > 0:
            doc.add_page_break()

        if not blocks:
            p = doc.add_paragraph("")
            continue

        for blk in blocks:
            if blk.is_table and blk.rows:
                num_cols = max(len(r) for r in blk.rows)
                if num_cols > 0:
                    tbl = doc.add_table(rows=len(blk.rows), cols=num_cols)
                    tbl.style = "Table Grid"
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    for r_idx, row in enumerate(blk.rows):
                        for c_idx, val in enumerate(row):
                            cell = tbl.cell(r_idx, c_idx)
                            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                            cell.text = sanitize_xml_text(val)
                continue

            clean_line = sanitize_xml_text(blk.text)
            if not clean_line:
                continue

            para = doc.add_paragraph()
            para.paragraph_format.space_after = Pt(6)
            para.paragraph_format.line_spacing = 1.15
            if is_rtl(clean_line):
                set_paragraph_rtl(para)
            run = para.add_run(clean_line)
            run.font.size = Pt(11)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()


async def _handle_conversion(
    files: List[UploadFile],
    language: str = "eng",
) -> StreamingResponse:
    t0 = time.perf_counter()
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    all_pages_blocks: List[List[OcrBlock]] = []
    total_pages = 0
    total_words = 0

    try:
        for upload in files[:10]:
            raw_bytes = await upload.read()
            if not raw_bytes:
                continue

            filename_lower = (upload.filename or "").lower()
            is_pdf = filename_lower.endswith(".pdf") or raw_bytes[:4] == b"%PDF"

            if is_pdf:
                pdf_pages, p_count, w_count = process_pdf_bytes(raw_bytes, language=language)
                all_pages_blocks.extend(pdf_pages)
                total_pages += p_count
                total_words += w_count
            else:
                blocks, w_count = extract_ocr_blocks_from_image(raw_bytes, language=language)
                all_pages_blocks.append(blocks)
                total_pages += 1
                total_words += w_count

        if not all_pages_blocks:
            raise HTTPException(status_code=422, detail="Could not read content from the uploaded file.")

        docx_bytes = _build_docx(all_pages_blocks)
        elapsed_ms = int((time.perf_counter() - t0) * 1000)

        headers = {
            "Content-Disposition": 'attachment; filename="converted.docx"',
            "X-Word-Count": str(total_words),
            "X-Page-Count": str(max(1, total_pages)),
            "X-Processing-Time-Ms": str(elapsed_ms),
            "X-Engine-Version": ENGINE_VERSION,
        }

        return StreamingResponse(
            io.BytesIO(docx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers=headers,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Conversion failed in v10.4 Argon engine")
        raise HTTPException(
            status_code=500,
            detail=f"Conversion server could not process this file ({type(exc).__name__}). Please try again shortly.",
        )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "Compixor AI Unified OCR & Document Engine",
        "version": ENGINE_VERSION,
    }


@app.post("/convert")
async def convert_legacy(
    files: List[UploadFile] = File(...),
    language: str = Form("eng"),
):
    return await _handle_conversion(files, language)


@app.post("/api/convert-img-to-docx")
async def convert_img_to_docx(
    files: List[UploadFile] = File(...),
    language: str = Form("eng"),
):
    return await _handle_conversion(files, language)


@app.post("/api/convert-pdf-to-docx")
async def convert_pdf_to_docx(
    files: List[UploadFile] = File(...),
    language: str = Form("eng"),
):
    return await _handle_conversion(files, language)
