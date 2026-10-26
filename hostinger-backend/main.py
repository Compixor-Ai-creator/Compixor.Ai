"""
Compixor AI - Image to Word Engine v10.3 (2-Core VPS Optimized)

Pipeline:
  1. Decode + normalise image (alpha -> white, size normalisation, fast illumination normalisation)
  2. Find table grids from ruling lines, derive REAL cell grid (merged cells + broken-border cell recovery)
  3. Fast table OCR (single-pass borderless table OCR + per-cell fallback + Gemini refinement + uniform row fonts)
  4. Find photos / faces / B&W logos / signatures / barcodes outside tables (Haar + halftone + crest + Sobel barcode detector)
  5. OCR remaining page text with:
     - Blank underline ("___________") recovery (internal & trailing fill-in-the-blanks)
     - Intra-line column splitting (side-by-side MCQ options a/b/c/d & header metadata)
     - Smart line-wrap vs standalone line separation (prevents merging Q3, Q4 & Urdu lines into 1 line)
     - Barcode/stamp gibberish filter (catches "دعہد[ء۱ہ٠٭ ءہ ٠ ۷" & garbled Nastaleeq) + image fallback when Gemini fails
  6. Rebuild single or multi-image batch in reading order with page breaks (schema-valid OpenXML)

Endpoints: GET /health, POST /convert, POST /api/convert-img-to-docx
"""
import io
import os
import glob
import subprocess
import tempfile

# Lock OpenMP threads to 1 per worker to prevent CPU thrashing on 2-core VPS
os.environ.setdefault("OMP_THREAD_LIMIT", "1")
os.environ.setdefault("OPENCV_IO_MAX_IMAGE_PIXELS", "60000000")

import re
import json
import base64
import logging
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional, List, Tuple

import cv2
import numpy as np
import pytesseract
from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from docx.table import _Cell
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

cv2.setNumThreads(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("img2docx")

# --------------------------------------------------------------------------- config
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "15")) * 1024 * 1024
MAX_BATCH_FILES = int(os.getenv("MAX_BATCH_FILES", "10"))
ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
# Scanned PDFs: rendered to page images and pushed through the same OCR pipeline.
# Pages and Gemini calls are capped hard - OCR is far slower than text-layer extraction.
MAX_PDF_BYTES = int(os.getenv("MAX_PDF_MB", "25")) * 1024 * 1024
MAX_PDF_PAGES = int(os.getenv("MAX_PDF_PAGES", "15"))
PDF_DPI = int(os.getenv("PDF_DPI", "200"))
PDF_AI_BUDGET = int(os.getenv("PDF_AI_BUDGET", "3"))
PDF_FULL_QUALITY_PAGES = int(os.getenv("PDF_FULL_QUALITY_PAGES", "3"))
MAX_TOTAL_PAGES = int(os.getenv("MAX_TOTAL_PAGES", "30"))
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "https://compixor-ai.cloud,https://www.compixor-ai.cloud,https://compixor-ai.vercel.app,http://localhost:3000",
    ).split(",")
    if o.strip()
]
OCR_WORKERS = int(os.getenv("OCR_WORKERS", "2"))
CONVERT_SLOTS = threading.BoundedSemaphore(int(os.getenv("MAX_CONCURRENT", "2")))
GEMINI_TIMEOUT = int(os.getenv("GEMINI_TIMEOUT", "15"))

# Optional Gemini refinement (used only for Urdu/Arabic or low-confidence crops)
# Prioritizes fast lite models first; caches 404 model names so invalid IDs never stall requests
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash-lite,gemini-3.5-flash,gemini-3.8-flash",
)
GEMINI_MODELS = [m.strip() for m in GEMINI_MODEL.split(",") if m.strip()]
MAX_AI_CALLS = int(os.getenv("MAX_AI_CALLS", "25"))
_AI_SEM = threading.BoundedSemaphore(int(os.getenv("GEMINI_CONCURRENCY", "2")))

# Optional debug crop directory: set DEBUG_CROPS_DIR=/tmp/crops to inspect barcodes/noise lines
DEBUG_CROPS_DIR = os.getenv("DEBUG_CROPS_DIR", "").strip()

# Line-level garbage filter thresholds (drops barcode/stamp OCR noise like "دعہد[ء۱ہ٠٭ ءہ ٠ ۷")
MIN_SHORT_LINE_CONF = float(os.getenv("MIN_SHORT_LINE_CONF", "42.0"))
MIN_SHORT_LINE_CHARS = int(os.getenv("MIN_SHORT_LINE_CHARS", "16"))
IMAGE_FALLBACK_CONF = float(os.getenv("IMAGE_FALLBACK_CONF", "48.0"))

URDU_FONT = os.getenv("URDU_FONT", "Jameel Noori Nastaleeq")
ILLEGAL_XML_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
ARABIC_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")
ARABIC_LETTER_RE = re.compile(r"[\u0621-\u064A\u0671-\u06D3\u06D5-\u06FF]")
LIST_START_RE = re.compile(
    r"^(?:Q\s*\d+[\.:]?|\d+[\.\)]|[I V X i v x]{1,4}[\.\)]|[a-dA-D][\.\)]|[١-٩0-9]+[-۔\.])\s+"
)
LANG_ALIASES = {"english": "eng", "en": "eng", "urdu": "urd", "ur": "urd", "arabic": "ara", "ar": "ara"}

PAGE_W_IN = 8.27
MARGIN_IN = 0.6
USABLE_IN = PAGE_W_IN - 2 * MARGIN_IN

app = FastAPI(title="Compixor AI - Image to Word Engine v10.3")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- data
@dataclass
class Cell:
    r0: int
    r1: int
    c0: int
    c1: int
    box: Tuple[int, int, int, int]
    text: str = ""
    pt: float = 10.0
    bold: bool = False
    align: str = "left"
    img: Optional[np.ndarray] = None


@dataclass
class TableData:
    xs: List[int]
    ys: List[int]
    cells: List[Cell]

    @property
    def n_rows(self) -> int:
        return len(self.ys) - 1

    @property
    def n_cols(self) -> int:
        return len(self.xs) - 1

    @property
    def bbox(self) -> Tuple[int, int, int, int]:
        return (
            min(self.xs[0], min(c.box[0] for c in self.cells)),
            min(self.ys[0], min(c.box[1] for c in self.cells)),
            max(self.xs[-1], max(c.box[2] for c in self.cells)),
            max(self.ys[-1], max(c.box[3] for c in self.cells)),
        )


@dataclass
class Block:
    kind: str  # "text" | "image"
    x0: int
    y0: int
    x1: int
    y1: int
    text: str = ""
    pt: float = 11.0
    bold: bool = False
    rtl: bool = False
    img: Optional[np.ndarray] = None


# --------------------------------------------------------------------------- helpers
_FACE = None
_FACE_LOCK = threading.Lock()
_DEAD_MODELS = set()
_DEAD_MODELS_LOCK = threading.Lock()


def save_debug_crop(tag: str, img: np.ndarray, meta: str = "") -> None:
    """Saves cropped regions when DEBUG_CROPS_DIR is set for inspecting barcodes/stamps/OCR noise."""
    if not DEBUG_CROPS_DIR or img is None or img.size == 0:
        return
    try:
        out_dir = Path(DEBUG_CROPS_DIR)
        out_dir.mkdir(parents=True, exist_ok=True)
        ts = int(time.time() * 1000)
        safe_meta = re.sub(r"[^\w\-]+", "_", meta)[:40]
        fname = out_dir / f"{ts}_{tag}_{safe_meta}.png"
        cv2.imwrite(str(fname), img)
    except Exception as e:
        log.debug("debug crop save failed: %s", e)


def has_face(img: np.ndarray) -> bool:
    """Thread-safe cached Haar cascade check for portraits inside or outside tables."""
    global _FACE
    h, w = img.shape[:2]
    if h < 90 or w < 70 or not (0.5 < w / float(h) < 1.4):
        return False
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    with _FACE_LOCK:
        if _FACE is None:
            p = getattr(cv2.data, "haarcascades", "") + "haarcascade_frontalface_default.xml"
            _FACE = cv2.CascadeClassifier(p) if os.path.exists(p) else False
        if not _FACE:
            return False
        return len(_FACE.detectMultiScale(g, 1.1, 4, minSize=(40, 40))) > 0


def normalize_lighting(gray: np.ndarray) -> np.ndarray:
    """Fast downscaled background illumination normalization for 2-core CPUs."""
    h, w = gray.shape[:2]
    if h < 40 or w < 40:
        return gray
    small = cv2.resize(gray, (max(1, w // 4), max(1, h // 4)), interpolation=cv2.INTER_AREA)
    small_bg = cv2.dilate(small, np.ones((5, 5), np.uint8))
    small_bg = cv2.GaussianBlur(small_bg, (21, 21), 0)
    bg = cv2.resize(small_bg, (w, h), interpolation=cv2.INTER_LINEAR)
    return cv2.divide(gray, np.clip(bg, 1, 255), scale=255)


def is_rtl(text: str) -> bool:
    a = len(ARABIC_RE.findall(text))
    latin = len(re.findall(r"[A-Za-z]", text))
    return a > 0 and a >= latin


def _strip_stray_lead(tokens: List[str]) -> List[str]:
    """Drops leading single-symbol/digit OCR artifacts (ruling-line noise) from multi-token lines."""
    while len(tokens) > 1 and not ARABIC_RE.search(tokens[0]) and re.fullmatch(r"\d|[^\w\s]", tokens[0]):
        tokens = tokens[1:]
    return tokens


def is_barcode_or_stamp_garbage(text: str, conf: float) -> bool:
    """
    Detects barcode / stamp OCR hallucinations such as 'دعہد[ء۱ہ٠٭ ءہ ٠ ۷' (under Student ID)
    even when they are 15-30 characters long.
    Strictly exempts math expressions, questions, formulas, and numbers from being dropped or converted to image.
    """
    s = (text or "").strip()
    if not s:
        return True
    # Exempt lines with math operators, numbers, or question markers from being dropped/flagged
    if re.search(r"[0-9+\-×÷±=()\[\]/^√≤≥≠<>°%&πθα-ωA-Za-z_]", s):
        if not bool(ARABIC_RE.search(s)):
            return False
    if conf < MIN_SHORT_LINE_CONF and len(s) < MIN_SHORT_LINE_CHARS:
        return True
    has_arab = bool(ARABIC_RE.search(s))
    if has_arab and len(s) <= 32:
        weird = len(re.findall(r"[\[\]\*\٭\|\\~`^٠-٩۰-۹ء]", s))
        if weird >= 2 and conf < 72:
            return True
        if re.search(r"[\[\]٭\|]", s):
            return True
    return False


def is_garbled_urdu(text: str, conf: float) -> bool:
    """
    Detects when Tesseract produced garbled Nastaleeq output (e.g. 'ہے۔ اکا کیا تی... Pine Si te... 2۸۴01۸9۳۴')
    after Gemini failed, so the engine can safely fall back to a picture crop instead of broken text.
    """
    s = (text or "").strip()
    if not ARABIC_RE.search(s):
        return False
    if conf < 68:
        return True
    if is_barcode_or_stamp_garbage(s, conf):
        return True
    for tok in s.split():
        if re.match(r"^\d+[-۔\.\)]$", tok):
            continue
        has_arab_let_or_indic = bool(ARABIC_LETTER_RE.search(tok) or re.search(r"[٠-٩۰-۹]", tok))
        if has_arab_let_or_indic and re.search(r"[A-Za-z0-9]", tok):
            return True
    arab_chars = len(ARABIC_RE.findall(s))
    latin_words = re.findall(r"\b[A-Za-z]{2,}\b", s)
    if arab_chars > 15 and len(latin_words) >= 2:
        bad_latin = [w for w in latin_words if not w.isupper()]
        if len(bad_latin) >= 2:
            return True
    return False


def has_ink(img: np.ndarray, thr: float = 0.003) -> bool:
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    return float((norm < 185).mean()) > thr


def ink_ratio(img: np.ndarray) -> float:
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    return float((norm < 185).mean())


def is_barcode_crop(img: np.ndarray) -> bool:
    """
    Detects 1D barcodes by verifying:
      1. High horizontal transition rate across vertical bars (h_diff >= 0.14)
      2. Near-zero vertical transition rate inside the middle 60% of the bars (h_diff / v_diff >= 4.0)
      3. High top-half vs bottom-half bar agreement (>= 0.85), which rejects normal text lines.
    """
    h, w = img.shape[:2]
    if h < 16 or w < 60 or w < 2.0 * h:
        return False
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    y0, y1 = int(0.2 * h), int(0.8 * h)
    if y1 - y0 < 6:
        return False
    inner = (norm[y0:y1, :] < 180).astype(np.float32)
    v_diff = float(np.mean(np.abs(np.diff(inner, axis=0))))
    h_diff = float(np.mean(np.abs(np.diff(inner, axis=1))))
    if h_diff < 0.14 or v_diff > 0.045:
        return False
    if h_diff / max(v_diff, 1e-4) < 4.0:
        return False
    half = inner.shape[0] // 2
    if half < 3:
        return False
    agree = float(np.mean(inner[:half, :] == inner[inner.shape[0] - half:, :]))
    return agree >= 0.85


def is_photo(img: np.ndarray) -> bool:
    """Photos / crests / barcodes have normalized mid-tones, a face, or barcode stripes."""
    h, w = img.shape[:2]
    if is_barcode_crop(img):
        return True
    if h < 70 or w < 60:
        return False
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    mid = float(((norm > 45) & (norm < 210)).mean())
    if mid > 0.45 and float(g.std()) > 35:
        return True
    return has_face(img)


def has_horizontal_underline(gray_img: np.ndarray, x0: int, x1: int, y_top: int, y_bot: int) -> int:
    """
    Detects a horizontal fill-in-the-blank underline ('___________') in x0..x1 near the line baseline.
    Returns the pixel width of the horizontal line (or 0 if none).
    """
    H, W = gray_img.shape
    lh = max(10, y_bot - y_top)
    uy0 = max(0, y_top + int(lh * 0.45))
    uy1 = min(H, y_bot + int(lh * 0.45))
    ux0 = max(0, x0 + 2)
    ux1 = min(int(W * 0.93), x1 - 2)
    if ux1 - ux0 < int(lh * 1.5) or uy1 <= uy0:
        return 0
    strip = gray_img[uy0:uy1, ux0:ux1]
    top_strip = gray_img[max(0, y_top):max(1, y_top + int(lh * 0.45)), ux0:ux1]
    if top_strip.size > 0 and float((top_strip < 180).mean()) > 0.12:
        return 0
    bw = (strip < 195).astype(np.uint8) * 255
    hk = cv2.getStructuringElement(cv2.MORPH_RECT, (max(18, int(lh * 1.2)), 1))
    horiz = cv2.morphologyEx(bw, cv2.MORPH_OPEN, hk)
    col_has = np.any(horiz > 0, axis=0)
    return int(np.sum(col_has))


def render_pdf_pages(data: bytes) -> List[bytes]:
    """Render up to MAX_PDF_PAGES pages of a PDF to PNG bytes for the OCR pipeline."""
    pages: List[bytes] = []
    try:
        import pymupdf

        with pymupdf.open(stream=data, filetype="pdf") as doc:
            if doc.needs_pass:
                raise HTTPException(status_code=400, detail="PDF is password protected")
            zoom = PDF_DPI / 72.0
            for page in list(doc)[:MAX_PDF_PAGES]:
                pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
                pages.append(pix.tobytes("png"))
        if pages:
            return pages
    except HTTPException:
        raise
    except Exception:
        log.warning("pymupdf render failed, falling back to pdftoppm", exc_info=True)

    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.pdf")
        with open(src, "wb") as f:
            f.write(data)
        cmd = ["pdftoppm", "-png", "-r", str(PDF_DPI), "-f", "1", "-l", str(MAX_PDF_PAGES), src,
               os.path.join(tmp, "p")]
        try:
            subprocess.run(cmd, check=True, capture_output=True, timeout=180)
        except FileNotFoundError:
            log.error("neither pymupdf nor pdftoppm can render this PDF")
            raise HTTPException(status_code=500, detail="PDF rendering is unavailable on this server")
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            raise HTTPException(status_code=400, detail="Corrupted or unreadable PDF")
        for p in sorted(glob.glob(os.path.join(tmp, "p-*.png")) + glob.glob(os.path.join(tmp, "p*.png"))):
            with open(p, "rb") as f:
                pages.append(f.read())
    if not pages:
        raise HTTPException(status_code=400, detail="Corrupted or unreadable PDF")
    return pages[:MAX_PDF_PAGES]


def decode_image(data: bytes) -> np.ndarray:
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise HTTPException(status_code=400, detail="Corrupted or unsupported image")
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        alpha = img[:, :, 3:4].astype(np.float32) / 255.0
        rgb = img[:, :, :3].astype(np.float32)
        img = (rgb * alpha + 255.0 * (1.0 - alpha)).astype(np.uint8)
    h, w = img.shape[:2]
    if w < 1400:
        f = min(2.5, 1400.0 / w)
        img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC)
    elif w > 2600:
        f = 2600.0 / w
        img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    return img


def resolve_lang(requested: Optional[str]) -> str:
    wanted = []
    for p in re.split(r"[+,\s]+", (requested or "eng+urd").lower()):
        p = LANG_ALIASES.get(p, p)
        if re.fullmatch(r"[a-z_]{2,8}", p):
            wanted.append(p)
    try:
        avail = set(pytesseract.get_languages(config=""))
    except Exception:
        avail = {"eng"}
    # Always include 'urd' if installed so mixed English+Urdu papers work even if user left default lang
    if "urd" in avail and "urd" not in wanted:
        wanted.append("urd")
    use = [p for p in wanted if p in avail]
    if not use:
        use = ["eng"] if "eng" in avail else sorted(avail)[:1]
    return "+".join(use)


# --------------------------------------------------------------------------- OCR
# --------------------------------------------------------------------------- math-paper helpers
_COMMON_WORDS = set("""
a about above after again all also an and any are as at be because been before being below between both but by
can could did do does done down during each few for from further had has have having he her here hers him his how
i if in into is it its just me more most my no nor not of off on once only or other our out over own same she
should so some such than that the their them then there these they this those through to too under until up very
was we were what when where which while who whom why will with would you your
find value values evaluate simplify solve show prove write given that attempt any all question questions section
class subject paper time marks max total mid term examination exam test name date roll number page
use number numbers integers between illustrate unknown angle angles triangle circle line lines point points
sum difference product quotient factor factors expand express in terms hence thus therefore if then
min mins minute minutes hour hours sec second seconds
""".split())

_MATH_CHARS_RE = re.compile(r"[+\-×÷±=()\[\]/^]")


_DATE_TOKEN_RE = re.compile(r"^\d{1,4}[-/.][A-Za-z0-9]{1,4}[-/.]\d{2,4}$")


def _is_dict_token(tok: str) -> bool:
    if _DATE_TOKEN_RE.match(tok):
        return True  # 29-Sep-26, 15-10-2026 are ordinary dates, not math noise
    w = re.sub(r"^[^A-Za-z]+|[^A-Za-z]+$", "", tok)
    return bool(w) and w.isalpha() and w.lower() in _COMMON_WORDS


def looks_like_math_noise(text: str) -> bool:
    """
    True only for lines with DENSE math indicators, so ordinary prose/metadata never
    triggers a Gemini call. Tesseract often reads real math with HIGH confidence but
    WRONG content ('2 he 15 min', '(=7b)', '1 : +2 BM').
    """
    s = (text or "").strip()
    if not s:
        return False
    if "\\" in s or "{" in s or "}" in s:
        return True  # LaTeX leftovers
    math_chars = re.findall(r"[+×÷±=()\[\]/^]", s)
    n_math = len(math_chars)
    if "=" in s and n_math >= 2:
        return True  # equation-like line
    if n_math >= 3:
        return True
    if "____" in s and n_math >= 2:
        return True  # fill-in-the-blank with operators, e.g. '4.35 + 1.5 ____'
    toks = s.split()
    if not toks or len(toks) > 18:
        return False
    non_dict = sum(1 for t in toks if not _is_dict_token(t))
    has_digit = bool(re.search(r"\d", s))
    return (non_dict / len(toks)) >= 0.5 and (has_digit and n_math >= 2)


_SUP = {"0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "+": "⁺", "-": "⁻", "−": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", "n": "ⁿ", "i": "ⁱ"}
_SUB = {"0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        "+": "₊", "-": "₋", "−": "₋", "=": "₌", "(": "₍", ")": "₎",
        "a": "ₐ", "e": "ₑ", "o": "ₒ", "x": "ₓ", "i": "ᵢ", "j": "ⱼ", "n": "ₙ", "m": "ₘ"}
_NICE_FRAC = {("1", "2"): "½", ("1", "3"): "⅓", ("2", "3"): "⅔", ("1", "4"): "¼", ("3", "4"): "¾"}
_LATEX_SYMBOLS = {
    "times": "×", "div": "÷", "pm": "±", "mp": "∓", "cdot": "·", "pi": "π", "theta": "θ", "alpha": "α",
    "beta": "β", "gamma": "γ", "delta": "δ", "lambda": "λ", "mu": "μ", "sigma": "σ", "omega": "ω",
    "leq": "≤", "le": "≤", "geq": "≥", "ge": "≥", "neq": "≠", "ne": "≠", "approx": "≈", "infty": "∞",
    "circ": "°", "degree": "°", "angle": "∠", "to": "→", "rightarrow": "→", "parallel": "∥", "perp": "⊥",
    "therefore": "∴", "because": "∵",
}


def _to_script(chars: str, table: dict, marker: str) -> str:
    chars = chars.strip()
    if chars and all(c in table for c in chars):
        return "".join(table[c] for c in chars)
    return marker + chars  # cannot be shown as Unicode super/subscript -> plain "^n" / "_n"


def latex_to_unicode(text: str) -> str:
    """Converts any LaTeX that slips through into plain Unicode math; leaves non-LaTeX text untouched."""
    if not text:
        return text
    if "\\" not in text and not re.search(r"[\^_]\{", text):
        return text  # nothing LaTeX-like (keeps legit set braces like {1, 2, 3})
    t = text
    # math delimiters
    t = re.sub(r"\\[\(\)\[\]]", "", t)
    t = t.replace("$", "")
    t = t.replace("\\\\", "\n")
    # degrees:  ^\circ / ^{\circ}
    t = re.sub(r"\^\s*(?:\{\s*\\circ\s*\}|\\circ(?![A-Za-z]))", "°", t)
    # text-like wrappers keep their content
    t = re.sub(r"\\(?:text|mathrm|mathbf|mathit|textbf|textit|operatorname|mbox)\s*\{([^{}]*)\}", r"\1", t)

    def frac(m):
        a, b = m.group(1).strip(), m.group(2).strip()
        if (a, b) in _NICE_FRAC:
            return _NICE_FRAC[(a, b)]
        wrap = lambda x: x if re.fullmatch(r"[\w°.]+", x) else "(" + x + ")"
        return f"{wrap(a)}⁄{wrap(b)}"

    def sqrt_idx(m):
        n = _to_script(m.group(1), _SUP, "")
        body = m.group(2).strip()
        body = body if re.fullmatch(r"\w+", body) else "(" + body + ")"
        return f"{n}√{body}"

    def sqrt(m):
        body = m.group(1).strip()
        return "√" + (body if re.fullmatch(r"\w+", body) else "(" + body + ")")

    for _ in range(6):  # inner-most braces first, so nested \frac{\frac{a}{b}}{c} resolves
        prev = t
        t = re.sub(r"\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}", frac, t)
        t = re.sub(r"\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}", sqrt_idx, t)
        t = re.sub(r"\\sqrt\s*\{([^{}]*)\}", sqrt, t)
        if t == prev:
            break
    t = re.sub(r"\\sqrt\s*([A-Za-z0-9])", r"√\1", t)

    # known symbols (longest names first so \leq is not read as \le + q)
    names = sorted(_LATEX_SYMBOLS, key=len, reverse=True)
    t = re.sub(r"\\(" + "|".join(names) + r")(?![A-Za-z])", lambda m: _LATEX_SYMBOLS[m.group(1)], t)

    # super / subscripts
    t = re.sub(r"\^\s*\{([^{}]*)\}", lambda m: _to_script(m.group(1), _SUP, "^"), t)
    t = re.sub(r"_\s*\{([^{}]*)\}", lambda m: _to_script(m.group(1), _SUB, "_"), t)
    t = re.sub(r"\^\s*([0-9n+\-])", lambda m: _to_script(m.group(1), _SUP, "^"), t)
    t = re.sub(r"(?<=[A-Za-z0-9\)])_([0-9])", lambda m: _to_script(m.group(1), _SUB, "_"), t)

    # spacing commands, escaped specials, then drop whatever backslash commands / braces remain
    t = re.sub(r"\\[,;:! ]", " ", t)
    t = re.sub(r"\\([%&#_$])", r"\1", t)
    t = re.sub(r"\\[A-Za-z]+\*?", "", t)
    t = t.replace("\\", "")
    t = t.replace("{", "").replace("}", "")
    return re.sub(r"[ \t]{2,}", " ", t).strip()


def normalize_math_text(text: str) -> str:
    """
    Transforms ASCII/OCR math representations into clean, readable Unicode math symbols.
    Never outputs image crops for math expressions.
    """
    if not text:
        return ""
    # First convert any LaTeX syntax to Unicode
    t = latex_to_unicode(text)
    # Common superscripts: x^2 -> x², x^3 -> x³, 10^-5 -> 10⁻⁵
    t = re.sub(r"\^([0-9n+\-])", lambda m: _SUP.get(m.group(1), m.group(1)), t)
    t = re.sub(r"\^\{([0-9n+\-]+)\}", lambda m: _to_script(m.group(1), _SUP, "^"), t)
    # Common subscripts: x_1 -> x₁, a_n -> aₙ
    t = re.sub(r"(?<=[A-Za-z0-9\)])_([0-9a-z])", lambda m: _SUB.get(m.group(1), m.group(1)), t)
    t = re.sub(r"_\{([0-9a-z]+)\}", lambda m: _to_script(m.group(1), _SUB, "_"), t)
    # Plus-minus
    t = re.sub(r"\+\-|\+/-\b", "±", t)
    # Multiplication sign between digits
    t = re.sub(r"(?<=\d)\s*[xX*]\s*(?=\d)", " × ", t)
    # Inequality signs
    t = re.sub(r"\s*<=\s*", " ≤ ", t)
    t = re.sub(r"\s*>=\s*", " ≥ ", t)
    t = re.sub(r"\s*!=\s*", " ≠ ", t)
    # Square root symbols
    t = re.sub(r"\b([sS]qrt|SQRT)\s*\(", "√(", t)
    t = re.sub(r"\b([sS]qrt|SQRT)\s*([0-9a-zA-Z])", r"√\2", t)
    t = re.sub(r"\\/([0-9a-zA-Z(])", r"√\1", t)
    t = re.sub(r"(?<=[=+\-×÷\s])V(?=[0-9(])", "√", t)
    # Degrees: 30^o, 45^0 -> 30°, 45°
    t = re.sub(r"(?<=\d)\s*\^[oO0]\b", "°", t)
    # Nice common fractions
    t = re.sub(r"\b1/2\b", "½", t)
    t = re.sub(r"\b1/4\b", "¼", t)
    t = re.sub(r"\b3/4\b", "¾", t)
    t = re.sub(r"\b1/3\b", "⅓", t)
    t = re.sub(r"\b2/3\b", "⅔", t)
    return t


def mask_colored_annotations(bgr: np.ndarray, sat_thr: int = 120, val_min: int = 100) -> np.ndarray:
    """
    Returns a COPY of the page with hand-drawn colored pen marks (arrows, circles, ticks)
    painted white. For the OCR pass ONLY - never embed this image in the DOCX.
    A colored connected component is erased only if it looks like a thin pen stroke:
    sparse inside its bounding box (fill ratio < 0.4) and reasonably large. Solid colored
    regions (printed header/background bands, photos, logos) are left untouched so printed
    text on colored backgrounds survives OCR.
    """
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    colored = ((hsv[:, :, 1] > sat_thr) & (hsv[:, :, 2] > val_min)).astype(np.uint8)
    if colored.mean() == 0.0 or colored.mean() > 0.25:
        return bgr  # colored paper / colored photo page - do not mask
    n, labels, stats, _ = cv2.connectedComponentsWithStats(colored, 8)
    mask = np.zeros_like(colored)
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if w < 12 or h < 12:
            continue
        if area / float(w * h) < 0.4:  # sparse => pen stroke, not a solid printed band
            mask[labels == i] = 1
    if not mask.any():
        return bgr
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8))
    out = bgr.copy()
    out[mask > 0] = 255
    return out


def gemini_ocr(img: np.ndarray) -> Optional[str]:
    if not GEMINI_API_KEY:
        return None
    ok, buf = cv2.imencode(".png", img)
    if not ok:
        return None
    prompt = (
        "Transcribe all text in this image exactly as written. Return only the text, no commentary. "
        "Keep line breaks. Preserve any fill-in-the-blank underlines as ________. "
        "Urdu/Arabic must be correct Unicode in natural reading order; English stays English. "
        "If there is no text or only a barcode/stamp/signature, return an empty string. "
        "Return plain Unicode text only. Do NOT use LaTeX. Use Unicode math symbols: "
        "× ÷ ± = ≠ ≤ ≥ √ ½ ⅓ ⅔ ¼ ¾ ⁄ π θ α β ° ² ³ ⁿ and superscript/subscript digits."
    )
    payload = {
        "contents": [{"parts": [
            {"text": prompt},
            {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(buf.tobytes()).decode()}},
        ]}],
        "generationConfig": {"temperature": 0},
    }
    body = json.dumps(payload).encode()
    with _AI_SEM:
        for model in GEMINI_MODELS:
            with _DEAD_MODELS_LOCK:
                if model in _DEAD_MODELS:
                    continue
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            for attempt in range(3):
                req = urllib.request.Request(
                    url,
                    data=body,
                    headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
                )
                try:
                    with urllib.request.urlopen(req, timeout=GEMINI_TIMEOUT) as r:
                        data = json.load(r)
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return latex_to_unicode(re.sub(r"^```[a-z]*\n?|```$", "", text.strip()).strip())
                except urllib.error.HTTPError as e:
                    log.warning("Gemini %s HTTP %s (attempt %d)", model, e.code, attempt + 1)
                    if e.code == 404:
                        with _DEAD_MODELS_LOCK:
                            _DEAD_MODELS.add(model)
                        break
                    if e.code in (429, 500, 502, 503, 504) and attempt < 2:
                        time.sleep(1.2 * (attempt + 1))
                        continue
                    break  # 400/403 or repeated failure -> try next model
                except Exception as e:
                    log.warning("Gemini %s failed: %s (attempt %d)", model, e, attempt + 1)
                    if attempt < 2:
                        time.sleep(0.8 * (attempt + 1))
                        continue
                    break
    return None


class OCR:
    def __init__(self, lang: str, ai_budget: Optional[int] = None):
        self.lang = lang
        self.urdu = "urd" in lang or "ara" in lang
        self.ai_calls = 0
        self.max_ai_calls = MAX_AI_CALLS if ai_budget is None else ai_budget
        self.lock = threading.Lock()

    def _take_ai(self) -> bool:
        with self.lock:
            if self.ai_calls < self.max_ai_calls:
                self.ai_calls += 1
                return True
        return False

    def _tess(self, img: np.ndarray, psm: int, lang: Optional[str] = None) -> dict:
        g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = g.shape[:2]
        f = 3 if h < 40 else 2 if h < 90 else 1
        if f > 1:
            g = cv2.resize(g, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC)
        pad = 10
        g = cv2.copyMakeBorder(g, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=255)
        d = pytesseract.image_to_data(
            g, lang=lang or self.lang, config=f"--psm {psm}", output_type=pytesseract.Output.DICT
        )
        paras, confs, hs, x0s, x1s = {}, [], [], [], []
        for i, t in enumerate(d["text"]):
            t = (t or "").strip()
            try:
                c = float(d["conf"][i])
            except (TypeError, ValueError):
                continue
            if not t or c < 0:
                continue
            key = (d["block_num"][i], d["par_num"][i])
            line_entry = paras.setdefault(key, {}).setdefault(d["line_num"][i], {"words": [], "confs": []})
            line_entry["words"].append(t)
            line_entry["confs"].append(c)
            confs.append(c)
            hs.append(d["height"][i] / f)
            x0s.append((d["left"][i] - pad) / f)
            x1s.append((d["left"][i] + d["width"][i] - pad) / f)

        kept_paras = []
        for _, lines in sorted(paras.items()):
            kept_lines = []
            for _, ldata in sorted(lines.items()):
                ltxt = " ".join(ldata["words"]).strip()
                lconf = float(np.mean(ldata["confs"])) if ldata["confs"] else 0.0
                if is_barcode_or_stamp_garbage(ltxt, lconf):
                    continue
                kept_lines.append(ltxt)
            if kept_lines:
                kept_paras.append("\n".join(kept_lines))

        text = "\n".join(kept_paras)
        return {
            "text": text,
            "conf": float(np.mean(confs)) if confs else 0.0,
            "h": float(np.median(hs)) if hs else 0.0,
            "cx": ((min(x0s) + max(x1s)) / 2.0 / max(w, 1)) if x0s else 0.5,
            "wr": ((max(x1s) - min(x0s)) / max(w, 1)) if x0s else 0.0,
            "ai_failed": False,
        }

    def _retess_lang(self, text: str) -> Optional[str]:
        """
        Picks a single-script language for a second OCR pass when the mixed eng+urd pass
        produced cross-script artifacts (e.g. 'c) see' read as '(۵' or 'ہت' inside '14:00').
        """
        arab_let = len(ARABIC_LETTER_RE.findall(text))
        arab_digits = len(re.findall(r"[۰-۹٠-٩]", text))
        arab_let = max(0, arab_let - arab_digits)
        latin = len(re.findall(r"[A-Za-z]", text))
        digits = len(re.findall(r"[0-9]", text)) + arab_digits
        sym = bool(re.search(r"[۰-۹٠-٩٭]", text))
        if arab_let == 0 and not sym:
            return None
        if arab_let == 0 and sym:
            return "eng" if "eng" in self.lang else None
        if arab_let <= 3 and (latin + digits) > arab_let:
            return "eng" if "eng" in self.lang else None
        if latin > arab_let:
            return "eng" if "eng" in self.lang else None
        return "urd" if "urd" in self.lang else None

    def read(self, img: np.ndarray, psm: int = 6) -> dict:
        r = self._tess(img, psm)
        lang2 = self._retess_lang(r["text"])
        if lang2 and lang2 != self.lang:
            r2 = self._tess(img, psm, lang=lang2)
            if r2["text"].strip():
                r = r2
        if self.urdu and has_ink(img):
            need = bool(ARABIC_RE.search(r["text"])) or r["conf"] < 65
            if need:
                if GEMINI_API_KEY and self._take_ai():
                    t = gemini_ocr(img)
                    if t is not None:
                        r["text"], r["conf"] = t, 95.0
                    else:
                        r["ai_failed"] = True
                else:
                    r["ai_failed"] = True
        return r


# --------------------------------------------------------------------------- table detection
def cluster(vals: List[int], tol: int) -> List[int]:
    vals = sorted(vals)
    groups = [[vals[0]]]
    for v in vals[1:]:
        if v - groups[-1][-1] <= tol:
            groups[-1].append(v)
        else:
            groups.append([v])
    return [int(round(sum(g) / len(g))) for g in groups]


def find_tables(gray: np.ndarray) -> List[TableData]:
    H, W = gray.shape
    bw = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 10)
    hk = cv2.getStructuringElement(cv2.MORPH_RECT, (max(25, W // 30), 1))
    vk = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(25, H // 30)))
    horiz = cv2.morphologyEx(bw, cv2.MORPH_OPEN, hk)
    vert = cv2.morphologyEx(bw, cv2.MORPH_OPEN, vk)
    grid = cv2.dilate(cv2.add(horiz, vert), np.ones((3, 3), np.uint8), iterations=1)

    contours, _ = cv2.findContours(grid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    tol = max(8, int(W * 0.008))
    tables: List[TableData] = []

    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w < W * 0.25 or h < 30:
            continue
        sub = grid[y:y + h, x:x + w]
        inv = cv2.bitwise_not(sub)
        cnts, _ = cv2.findContours(inv, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        boxes = []
        for cc in cnts:
            cx, cy, cw, ch = cv2.boundingRect(cc)
            if cw < 14 or ch < 10:
                continue
            if cw > w * 0.97 and ch > h * 0.97:
                continue
            if cw * ch > 0.45 * W * H:
                continue
            if cv2.contourArea(cc) < 0.5 * cw * ch:
                continue
            boxes.append((cx + x, cy + y, cx + x + cw, cy + y + ch))
        if len(boxes) < 2:
            continue

        xs = cluster([b[0] for b in boxes] + [b[2] for b in boxes], tol)
        ys = cluster([b[1] for b in boxes] + [b[3] for b in boxes], tol)
        if len(xs) < 2 or len(ys) < 2 or len(xs) - 1 > 25 or len(ys) - 1 > 80:
            continue

        def nearest(arr, v):
            return int(np.argmin([abs(a - v) for a in arr]))

        occ, cells = set(), []
        for (x0, y0, x1, y1) in sorted(boxes, key=lambda b: (b[1], b[0])):
            c0, c1, r0, r1 = nearest(xs, x0), nearest(xs, x1), nearest(ys, y0), nearest(ys, y1)
            if c1 <= c0 or r1 <= r0:
                continue
            pos = {(r, k) for r in range(r0, r1) for k in range(c0, c1)}
            if pos & occ:
                continue
            occ |= pos
            cells.append(Cell(r0, r1, c0, c1, (x0, y0, x1, y1)))

        # Recover any unclosed cells in the grid whose borders had small gaps
        for r in range(len(ys) - 1):
            for k in range(len(xs) - 1):
                if (r, k) not in occ:
                    occ.add((r, k))
                    cells.append(Cell(r, r + 1, k, k + 1, (xs[k], ys[r], xs[k + 1], ys[r + 1])))

        if len(cells) >= 2:
            cells.sort(key=lambda cl: (cl.r0, cl.c0))
            tables.append(TableData(xs, ys, cells))
    tables.sort(key=lambda t: t.bbox[1])
    return tables


def unify_table_fonts(tb: TableData) -> None:
    """Unifies font sizes across table headers (row 0) and body rows to prevent uneven cell fonts."""
    header_pts = [c.pt for c in tb.cells if c.r0 == 0 and c.text and not is_rtl(c.text)]
    header_rtl_pts = [c.pt for c in tb.cells if c.r0 == 0 and c.text and is_rtl(c.text)]
    body_pts = [c.pt for c in tb.cells if c.r0 > 0 and c.text and not is_rtl(c.text)]
    body_rtl_pts = [c.pt for c in tb.cells if c.r0 > 0 and c.text and is_rtl(c.text)]

    body_med = float(np.clip(np.median(body_pts), 8.5, 10.5)) if body_pts else 9.5
    body_rtl_med = float(np.clip(np.median(body_rtl_pts), 8.5, 10.5)) if body_rtl_pts else 9.5
    hdr_med = float(np.clip(np.median(header_pts), body_med, 11.0)) if header_pts else body_med
    hdr_rtl_med = float(np.clip(np.median(header_rtl_pts), body_rtl_med, 11.0)) if header_rtl_pts else body_rtl_med

    for c in tb.cells:
        if not c.text:
            continue
        rtl = is_rtl(c.text)
        if c.r0 == 0:
            c.pt = hdr_rtl_med if rtl else hdr_med
            c.bold = True
        else:
            c.pt = body_rtl_med if rtl else body_med


def fill_table(tb: TableData, bgr: np.ndarray, ocr: OCR, dpi: float, ocr_bgr: Optional[np.ndarray] = None) -> None:
    """
    Fast 2-stage table OCR:
      Stage 1: Build a border-free table canvas and run 1 Tesseract pass to populate cells rapidly.
      Stage 2: Run targeted fallback / Gemini refinement only on cells that need it.
    """
    tx0, ty0, tx1, ty1 = tb.bbox
    tw, th = max(1, tx1 - tx0), max(1, ty1 - ty0)
    clean_tbl = np.full((th, tw), 255, dtype=np.uint8)
    ocr_src = ocr_bgr if ocr_bgr is not None else bgr  # OCR-only copy (colored marks removed)
    gray_full = cv2.cvtColor(ocr_src, cv2.COLOR_BGR2GRAY)

    active_cells: List[Tuple[int, Cell, np.ndarray]] = []
    for idx, cell in enumerate(tb.cells):
        x0, y0, x1, y1 = cell.box
        m = 3
        crop = bgr[y0 + m:y1 - m, x0 + m:x1 - m]
        if crop.size == 0 or not has_ink(crop):
            continue
        if is_photo(crop):
            cell.img = crop.copy()
            continue
        gcrop = gray_full[y0 + m:y1 - m, x0 + m:x1 - m]
        cy0, cy1 = max(0, y0 + m - ty0), min(th, y1 - m - ty0)
        cx0, cx1 = max(0, x0 + m - tx0), min(tw, x1 - m - tx0)
        if cy1 > cy0 and cx1 > cx0:
            clean_tbl[cy0:cy1, cx0:cx1] = gcrop[:cy1 - cy0, :cx1 - cx0]
        active_cells.append((idx, cell, crop))

    if not active_cells:
        return

    d = pytesseract.image_to_data(
        clean_tbl, lang=ocr.lang, config="--psm 6", output_type=pytesseract.Output.DICT
    )
    cell_words = {idx: [] for idx, _, _ in active_cells}
    for i, t in enumerate(d["text"]):
        t = (t or "").strip()
        try:
            c = float(d["conf"][i])
        except (TypeError, ValueError):
            continue
        if not t or c < 0:
            continue
        wx = d["left"][i] + tx0
        wy = d["top"][i] + ty0
        ww = d["width"][i]
        wh = d["height"][i]
        wcx, wcy = wx + ww / 2.0, wy + wh / 2.0
        for idx, cell, _ in active_cells:
            x0, y0, x1, y1 = cell.box
            if x0 <= wcx <= x1 and y0 <= wcy <= y1:
                cell_words[idx].append((d["line_num"][i], wx, wy, ww, wh, c, t))
                break

    def refine_cell(entry: Tuple[int, Cell, np.ndarray]):
        idx, cell, crop = entry
        try:
            words = cell_words.get(idx, [])
            x0, y0, x1, y1 = cell.box
            ocr_crop = ocr_src[y0 + 3:y1 - 3, x0 + 3:x1 - 3]  # OCR reads this; cell.img below keeps ORIGINAL crop
            cw = max(1, x1 - x0 - 6)
            if words:
                words.sort(key=lambda w: (w[0], w[1]))
                lines = {}
                for w in words:
                    lines.setdefault(w[0], []).append(w[6])
                text = "\n".join(" ".join(_strip_stray_lead(v)) for _, v in sorted(lines.items())).strip()
                conf = float(np.mean([w[5] for w in words]))
                hmed = float(np.median([w[4] for w in words]))
                wx0 = min(w[1] - (x0 + 3) for w in words)
                wx1 = max(w[1] + w[3] - (x0 + 3) for w in words)
                cx = (wx0 + wx1) / 2.0 / cw
                wr = (wx1 - wx0) / float(cw)
                r = {"text": text, "conf": conf, "h": hmed, "cx": cx, "wr": wr, "ai_failed": False}
                if ocr.urdu and (bool(ARABIC_RE.search(text)) or conf < 65):
                    if GEMINI_API_KEY and ocr._take_ai():
                        gt = gemini_ocr(ocr_crop)
                        if gt is not None:
                            r["text"], r["conf"] = gt, 95.0
                        else:
                            r["ai_failed"] = True
                    else:
                        r["ai_failed"] = True
            else:
                r = ocr.read(ocr_crop, psm=7 if crop.shape[0] < 45 else 6)

            lang2 = ocr._retess_lang(r["text"])
            if lang2 and lang2 != ocr.lang:
                r2 = ocr._tess(ocr_crop, 7 if crop.shape[0] < 45 else 6, lang=lang2)
                if r2["text"].strip():
                    r2["ai_failed"] = r.get("ai_failed", False)
                    r = r2
            cell_lines = [ln for ln in r["text"].split("\n") if ln.strip()]
            if len(cell_lines) > 1:
                cell_lines = [
                    ln for ln in cell_lines
                    if not (re.fullmatch(r"[A-Za-z0-9]|[^\w\s]", ln.strip()) and not ARABIC_RE.search(ln))
                ]
            r["text"] = _clean_ocr_typos("\n".join(cell_lines).strip())

            alnum = len(re.findall(r"\w", r["text"]))
            # Only convert to image if crop is genuinely a photo/face/barcode, NEVER for textual or math content
            if is_photo(crop) and alnum < 2 and ink_ratio(crop) > 0.04 and crop.shape[0] > 35 and not re.search(r"[0-9+\-×÷±=()\[\]/^√≤≥≠]", r["text"]):
                save_debug_crop("cell_img_fallback", crop, f"conf_{int(r['conf'])}")
                cell.img = crop.copy()
                return
            cell.text = normalize_math_text(r["text"].strip())
            if r["h"] > 0:
                cell.pt = float(min(14.0, max(7.5, round(r["h"] * 72.0 / dpi * 2) / 2)))
            if is_rtl(cell.text):
                cell.pt = float(min(11.5, max(7.5, cell.pt * 0.8)))
            if r["wr"] < 0.85 and abs(r["cx"] - 0.5) < 0.07:
                cell.align = "center"
        except Exception as e:
            log.warning("cell OCR failed: %s", e)

    with ThreadPoolExecutor(max_workers=OCR_WORKERS) as ex:
        list(ex.map(refine_cell, active_cells))

    unify_table_fonts(tb)


# --------------------------------------------------------------------------- pictures + barcodes + page text
def _overlaps(b1: Tuple[int, int, int, int], b2: Tuple[int, int, int, int]) -> bool:
    ix0, iy0 = max(b1[0], b2[0]), max(b1[1], b2[1])
    ix1, iy1 = min(b1[2], b2[2]), min(b1[3], b2[3])
    if ix1 <= ix0 or iy1 <= iy0:
        return False
    inter = (ix1 - ix0) * (iy1 - iy0)
    a1 = max(1, (b1[2] - b1[0]) * (b1[3] - b1[1]))
    a2 = max(1, (b2[2] - b2[0]) * (b2[3] - b2[1]))
    return inter / float(min(a1, a2)) > 0.35


def find_barcodes(norm: np.ndarray, masked_gray: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detects 1D barcodes (e.g. under Student ID / Roll No) via x-Sobel minus y-Sobel gradient,
    blurring, wide morphological closing, and strict vertical bar consistency check.
    """
    H, W = norm.shape
    gx = cv2.Sobel(norm, cv2.CV_16S, 1, 0, ksize=3)
    gy = cv2.Sobel(norm, cv2.CV_16S, 0, 1, ksize=3)
    grad = cv2.subtract(cv2.convertScaleAbs(gx), cv2.convertScaleAbs(gy))
    blurred = cv2.GaussianBlur(grad, (9, 9), 0)
    _, thresh = cv2.threshold(blurred, 55, 255, cv2.THRESH_BINARY)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(21, W // 45), max(5, H // 220)))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    closed = cv2.erode(closed, None, iterations=2)
    closed = cv2.dilate(closed, None, iterations=2)

    cnts, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out: List[Tuple[int, int, int, int]] = []
    min_w = max(60, int(W * 0.05))
    max_h = max(35, int(H * 0.10))

    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if w < min_w or h < 16 or h > max_h:
            continue
        if w < 2.0 * h or w > 14.0 * h:
            continue
        crop = masked_gray[y:y + h, x:x + w]
        if not is_barcode_crop(crop):
            continue
        p = 4
        bx0, by0 = max(0, x - p), max(0, y - p)
        bx1, by1 = min(W, x + w + p), min(H, y + h + p)
        save_debug_crop("barcode", masked_gray[by0:by1, bx0:bx1], f"{bx0}_{by0}")
        out.append((bx0, by0, bx1, by1))
    return out


def find_pictures(masked_gray: np.ndarray, bgr: np.ndarray) -> List[Tuple[int, int, int, int]]:
    global _FACE
    H, W = masked_gray.shape
    norm = normalize_lighting(masked_gray)
    boxes: List[Tuple[int, int, int, int]] = []

    def add_box(cand: Tuple[int, int, int, int]):
        if not any(_overlaps(cand, existing) for existing in boxes):
            boxes.append(cand)

    # 0. Barcode Detection (prevents Tesseract from reading barcodes as garbled Urdu like "دعہد[")
    for b_box in find_barcodes(norm, masked_gray):
        add_box(b_box)

    # 1. Thread-safe Haar Cascade Face Detection for portraits
    with _FACE_LOCK:
        if _FACE is None:
            p = getattr(cv2.data, "haarcascades", "") + "haarcascade_frontalface_default.xml"
            _FACE = cv2.CascadeClassifier(p) if os.path.exists(p) else False
        faces = _FACE.detectMultiScale(masked_gray, 1.1, 4, minSize=(50, 50)) if _FACE else []

    for (x, y, w, h) in faces:
        pad_x, pad_y = int(w * 0.35), int(h * 0.45)
        x0, y0 = max(0, x - pad_x), max(0, y - pad_y)
        x1, y1 = min(W, x + w + pad_x), min(H, y + h + int(pad_y * 1.25))
        if float((masked_gray[y0:y1, x0:x1] == 255).mean()) < 0.90:
            add_box((x0, y0, x1, y1))

    # 2. Continuous-Tone Photos / Colored Logos (on lighting-normalized gray)
    mid = ((norm > 45) & (norm < 210)).astype(np.uint8) * 255
    blob = cv2.morphologyEx(mid, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    blob = cv2.morphologyEx(blob, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_side = max(50, int(W * 0.04))
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if w < min_side or h < min_side or w * h > 0.5 * W * H:
            continue
        if not (0.4 < w / float(h) < 2.5):
            continue
        if float((mid[y:y + h, x:x + w] > 0).mean()) < 0.5:
            continue
        if float(masked_gray[y:y + h, x:x + w].std()) < 30:
            continue
        p = 4
        add_box((max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)))

    # 3. Smart College / School Crests & Logos in top header area (exam paper headers)
    top_h = int(H * 0.35)
    _, bw = cv2.threshold(norm[:top_h, :], 190, 255, cv2.THRESH_BINARY_INV)
    logo_blob = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    l_cnts, _ = cv2.findContours(logo_blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_logo_dim = max(35, int(W * 0.03))
    for c in l_cnts:
        x, y, w, h = cv2.boundingRect(c)
        if not (min_logo_dim <= w <= int(W * 0.42) and min_logo_dim <= h <= int(H * 0.28)):
            continue
        aspect = w / float(h)
        # Accepts circular seals, shield crests, and horizontal institution emblem banners
        if not (0.45 <= aspect <= 2.80):
            continue
        crop_bw = bw[y:y + h, x:x + w]
        ink_density = float((crop_bw > 0).mean())
        if 0.10 <= ink_density <= 0.85:
            area = cv2.contourArea(c)
            hull = cv2.convexHull(c)
            hull_area = cv2.contourArea(hull)
            solidity = float(area / hull_area) if hull_area > 0 else 0.0
            if solidity >= 0.15 or ink_density >= 0.18:
                crop_gray = masked_gray[y:y + h, x:x + w]
                thick_ink = cv2.morphologyEx(crop_bw, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
                thick_ratio = float((thick_ink > 0).sum()) / max(1, float((crop_bw > 0).sum()))
                gray_std = float(crop_gray.std())
                is_graphic_logo = (thick_ratio >= 0.14 or gray_std >= 32 or (solidity >= 0.35 and 0.55 <= aspect <= 1.8))
                if not is_graphic_logo:
                    try:
                        sample_txt = pytesseract.image_to_string(crop_gray, config="--psm 6 -l eng").strip()
                        clean_words = [w for w in sample_txt.split() if len(w) >= 3 and w.isalpha()]
                        if len(clean_words) >= 3 and thick_ratio < 0.10:
                            continue  # Pure text heading, keep for editable text OCR
                    except Exception:
                        pass
                p = 4
                add_box((max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)))

    # 4. Signatures / Rubber Stamps (strictly exempting any math diagrams or question text)
    _, dark = cv2.threshold(norm, 120, 255, cv2.THRESH_BINARY_INV)
    dblob = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    d_cnts, _ = cv2.findContours(dblob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in d_cnts:
        x, y, w, h = cv2.boundingRect(c)
        if not (90 <= h <= 320 and 90 <= w <= int(W * 0.45)):
            continue
        if cv2.contourArea(c) < 0.18 * w * h:
            continue
        sub_dark = dark[y:y + h, x:x + w]
        ink = float((sub_dark > 0).mean())
        if not (0.05 <= ink <= 0.55):
            continue
        if float((sub_dark.sum(axis=1) == 0).mean()) > 0.15:
            continue
        if float(masked_gray[y:y + h, x:x + w].std()) < 45:
            continue
        # Verify region does not contain readable math questions, equations or numbers
        crop_gray = masked_gray[y:y + h, x:x + w]
        try:
            sample_txt = pytesseract.image_to_string(crop_gray, config="--psm 6 -l eng")
            if len(re.findall(r"[A-Za-z0-9+\-×÷±=()\[\]/^√≤≥≠]", sample_txt)) >= 3:
                continue  # Contains textual questions or math symbols -> keep as editable text
        except Exception:
            pass
        p = 4
        add_box((max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)))

    return boxes


def _split_line_segments_and_blanks(lwords: list, masked: np.ndarray, W: int) -> List[Tuple[int, int, int, int, str, float, float]]:
    """
    Takes words on a single visual line (sorted by x0), restores internal and trailing
    fill-in-the-blank underlines ('___________'), and splits wide non-underlined column gaps
    (e.g. 'Class: VI' vs 'Max. Marks: 25' or 'a) Samarkar' vs 'b) Scotland') into separate segments.
    """
    lwords = sorted(lwords, key=lambda w: w[1])
    lh = float(np.median([w[4] for w in lwords]))
    ly0 = min(w[2] for w in lwords)
    ly1 = max(w[2] + w[4] for w in lwords)

    segments = []
    cur_words = [lwords[0]]
    cur_tokens = [lwords[0][6]]

    for w_prev, w_curr in zip(lwords[:-1], lwords[1:]):
        prev_x1 = w_prev[1] + w_prev[3]
        curr_x0 = w_curr[1]
        gap = curr_x0 - prev_x1

        if gap > max(38, int(lh * 1.8)):
            ul_w = has_horizontal_underline(masked, prev_x1, curr_x0, ly0, ly1)
            if ul_w >= int(lh * 1.4):
                n_underscores = max(8, min(18, int(round(ul_w / max(8.0, lh * 0.55)))))
                cur_tokens.append("_" * n_underscores)
                cur_words.append(w_curr)
                cur_tokens.append(w_curr[6])
                continue
            elif gap > max(95, int(lh * 3.5)):
                sx0 = min(w[1] for w in cur_words)
                sy0 = min(w[2] for w in cur_words)
                sx1 = max(w[1] + w[3] for w in cur_words)
                sy1 = max(w[2] + w[4] for w in cur_words)
                sconf = float(np.mean([w[5] for w in cur_words]))
                shmed = float(np.median([w[4] for w in cur_words]))
                segments.append((sx0, sy0, sx1, sy1, " ".join(cur_tokens), sconf, shmed))
                cur_words = [w_curr]
                cur_tokens = [w_curr[6]]
                continue

        cur_words.append(w_curr)
        cur_tokens.append(w_curr[6])

    if cur_words:
        sx0 = min(w[1] for w in cur_words)
        sy0 = min(w[2] for w in cur_words)
        sx1 = max(w[1] + w[3] for w in cur_words)
        sy1 = max(w[2] + w[4] for w in cur_words)
        trail_limit = min(int(W * 0.90), sx1 + int(lh * 12))
        if trail_limit - sx1 > int(lh * 2.0):
            ul_w = has_horizontal_underline(masked, sx1, trail_limit, sy0, sy1)
            if ul_w >= int(lh * 1.8):
                n_underscores = max(8, min(18, int(round(ul_w / max(8.0, lh * 0.55)))))
                cur_tokens.append("_" * n_underscores + ".")
                sx1 = min(trail_limit, sx1 + ul_w + 10)
        sconf = float(np.mean([w[5] for w in cur_words]))
        shmed = float(np.median([w[4] for w in cur_words]))
        segments.append((sx0, sy0, sx1, sy1, " ".join(cur_tokens), sconf, shmed))

    return segments


def _clean_ocr_typos(text: str) -> str:
    text = re.sub(r"^I\.\s+(?=[“\"A-Z])", "1. ", text)
    text = re.sub(r"\bGullberg-\s*(?:Ill|111|I11|l11)\b", "Gullberg- III", text)
    text = re.sub(r"\biil\)", "iii)", text)
    text = re.sub(r"\b([A-D])\)(?=\s+[a-z])", lambda m: m.group(1).lower() + ")", text)
    text = re.sub(r"¢\)", "c)", text)
    text = re.sub(r"\b(SPRING|FALL|AUTUMN|SUMMER)\s*\(0\)", r"\1 (O)", text)
    text = re.sub(r"\bIgbal\b", "Iqbal", text)
    text = re.sub(r"\bA[l1]OU\b", "AIOU", text)
    text = re.sub(r"\bit\)", "ii)", text)
    text = re.sub(r"\bill\)", "iii)", text)
    text = re.sub(r"\*([A-Za-z][\w-]*)™", r'"\1"', text)
    return text


def page_paragraphs(masked: np.ndarray, bgr: np.ndarray, ocr: OCR, dpi: float, ocr_bgr: Optional[np.ndarray] = None) -> List[Block]:
    H, W = masked.shape
    d = pytesseract.image_to_data(
        masked, lang=ocr.lang, config="--psm 4", output_type=pytesseract.Output.DICT
    )
    paras = {}
    for i, t in enumerate(d["text"]):
        t = (t or "").strip()
        try:
            c = float(d["conf"][i])
        except (TypeError, ValueError):
            continue
        if not t or c < 0:
            continue
        key = (d["block_num"][i], d["par_num"][i])
        paras.setdefault(key, []).append(
            (d["line_num"][i], d["left"][i], d["top"][i], d["width"][i], d["height"][i], c, t)
        )

    # Step 1: Extract clean line-level segments (with blank underlines restored & column gaps split)
    line_items = []
    for key, words in sorted(paras.items()):
        words.sort(key=lambda w: (w[0], w[1]))
        lines = {}
        for w in words:
            lines.setdefault(w[0], []).append(w)

        for _, lwords in sorted(lines.items()):
            raw_ltxt = " ".join(w[6] for w in lwords).strip()
            raw_lconf = float(np.mean([w[5] for w in lwords]))
            lx0 = min(w[1] for w in lwords)
            ly0 = min(w[2] for w in lwords)
            lx1 = max(w[1] + w[3] for w in lwords)
            ly1 = max(w[2] + w[4] for w in lwords)
            lcrop = bgr[max(0, ly0 - 3):min(H, ly1 + 3), max(0, lx0 - 3):min(W, lx1 + 3)]

            if lcrop.size and is_barcode_crop(lcrop):
                save_debug_crop("line_barcode", lcrop, raw_ltxt)
                line_items.append([lx0, ly0, lx1, ly1, "", 0.0, float(ly1 - ly0), True])
                continue

            if is_barcode_or_stamp_garbage(raw_ltxt, raw_lconf):
                rescue = is_photo(lcrop) if lcrop.size else False
                if rescue and lcrop.size and has_ink(lcrop):
                    line_items.append([lx0, ly0, lx1, ly1, "", 0.0, float(ly1 - ly0), True])
                else:
                    save_debug_crop("dropped_garbage_line", lcrop, f"c{int(raw_lconf)}_{raw_ltxt}")
                continue

            for (sx0, sy0, sx1, sy1, stxt, sconf, shmed) in _split_line_segments_and_blanks(lwords, masked, W):
                stxt = _clean_ocr_typos(stxt.strip())
                if not re.sub(r"\W", "", stxt):
                    continue
                if is_barcode_or_stamp_garbage(stxt, sconf):
                    scrop = bgr[max(0, sy0 - 3):min(H, sy1 + 3), max(0, sx0 - 3):min(W, sx1 + 3)]
                    rescue = is_photo(scrop) if scrop.size else False
                    if rescue and scrop.size and has_ink(scrop):
                        line_items.append([sx0, sy0, sx1, sy1, "", 0.0, shmed, True])
                    continue
                line_items.append([sx0, sy0, sx1, sy1, stxt, sconf, shmed, False])

    # Step 2: Merge consecutive lines ONLY when they are genuine wrapped continuations of a multi-line paragraph
    raw = []
    for item in line_items:
        x0, y0, x1, y1, text, conf, hmed, force_img = item
        if not raw or force_img or raw[-1][7]:
            raw.append(item)
            continue

        px0, py0, px1, py1, ptext, pconf, phmed, _ = raw[-1]
        v_gap = y0 - py1
        same_rtl = is_rtl(ptext) == is_rtl(text)
        starts_new_item = bool(LIST_START_RE.match(text))

        can_wrap = False
        if same_rtl and not starts_new_item and 0 <= v_gap <= max(28, int(1.6 * phmed)):
            if not is_rtl(text):
                # True LTR wrapped paragraph starts in left third of page and reaches near right margin
                if px0 < int(W * 0.35) and px1 > int(W * 0.76) and abs(px0 - x0) < int(W * 0.06):
                    can_wrap = True
            else:
                # True RTL wrapped paragraph starts near right margin and reaches near left margin
                if px1 > int(W * 0.65) and px0 < int(W * 0.24) and abs(px1 - x1) < int(W * 0.06):
                    can_wrap = True

        if can_wrap:
            raw[-1][0] = min(px0, x0)
            raw[-1][1] = min(py0, y0)
            raw[-1][2] = max(px1, x1)
            raw[-1][3] = max(py1, y1)
            raw[-1][4] = ptext + " " + text
            raw[-1][5] = (pconf + conf) / 2.0
            raw[-1][6] = float(np.median([phmed, hmed]))
        else:
            raw.append(item)

    def refine(item):
        x0, y0, x1, y1, text, conf, hmed, force_img = item
        p = 6
        crop = bgr[max(0, y0 - p):min(H, y1 + p), max(0, x0 - p):min(W, x1 + p)]  # ORIGINAL (embedded / fallback)
        ocr_crop = (ocr_bgr if ocr_bgr is not None else bgr)[max(0, y0 - p):min(H, y1 + p), max(0, x0 - p):min(W, x1 + p)]
        if force_img and crop.size and is_photo(crop):
            return ("image", "", crop.copy())
        lang2 = ocr._retess_lang(text)
        if lang2 and lang2 != ocr.lang and crop.size:
            r2 = ocr._tess(ocr_crop, 6, lang=lang2)
            if r2["text"].strip():
                text, conf = _clean_ocr_typos(r2["text"]), r2["conf"]
        # Right-aligned low-confidence line (e.g. Urdu line when only 'eng' was active) also triggers AI / fallback
        right_side_lowconf = (x0 > int(W * 0.50) and x1 > int(W * 0.80) and conf < 68)
        need_ai = (
            (ocr.urdu and (bool(ARABIC_RE.search(text)) or conf < 65))
            or right_side_lowconf
            or looks_like_math_noise(text)
        )
        if need_ai:
            if GEMINI_API_KEY and ocr._take_ai() and crop.size and has_ink(crop):
                t = gemini_ocr(ocr_crop)
                if t is not None:
                    lines_clean = [ln.strip() for ln in t.splitlines() if ln.strip()]
                    if lines_clean:
                        return ("text", normalize_math_text(_clean_ocr_typos("\n".join(lines_clean))), None)
            # Only genuine unreadable Nastaleeq when ocr.urdu is active may fall back to image; never math or english
            if ocr.urdu and (is_garbled_urdu(text, conf) or right_side_lowconf) and crop.size and has_ink(crop) and not re.search(r"[0-9+\-×÷±=()\[\]/^√≤≥≠]", text):
                save_debug_crop("para_img_fallback", crop, f"c{int(conf)}_{text[:15]}")
                return ("image", "", crop.copy())
        elif conf < 25 and crop.size and is_photo(crop) and not re.search(r"[A-Za-z0-9+\-×÷±=()\[\]/^√≤≥≠]", text):
            save_debug_crop("para_lowconf_img", crop, f"c{int(conf)}")
            return ("image", "", crop.copy())
        return ("text", normalize_math_text(_clean_ocr_typos(text)), None)

    with ThreadPoolExecutor(max_workers=OCR_WORKERS) as ex:
        results = list(ex.map(refine, raw))

    blocks: List[Block] = []
    for item, (kind, text, crop_img) in zip(raw, results):
        x0, y0, x1, y1, _, conf, hmed, _ = item
        if kind == "image" and crop_img is not None:
            blocks.append(Block("image", x0, y0, x1, y1, img=crop_img))
            continue
        if not text:
            continue
        rtl = is_rtl(text)
        pt = float(min(26.0, max(8.5, round(hmed * 72.0 / dpi * 2) / 2)))
        if rtl:
            pt = float(min(12.0, max(8.5, round(pt * 0.78 * 2) / 2)))
        blocks.append(Block("text", x0, y0, x1, y1, text=text, pt=pt, rtl=rtl))

    text_only = [b for b in blocks if b.kind == "text"]
    if text_only:
        med = float(np.median([b.pt for b in text_only]))
        for b in text_only:
            b.bold = b.pt >= 1.25 * med or bool(re.match(r"^Q\s*\d+[\.:]", b.text))
            if not b.bold:
                b.pt = min(b.pt, max(med, 8.5) * 1.12)
    return blocks


# --------------------------------------------------------------------------- docx writing
def set_bidi(par) -> None:
    pPr = par._p.get_or_add_pPr()
    old = pPr.find(qn("w:bidi"))
    if old is not None:
        pPr.remove(old)
    bidi = OxmlElement("w:bidi")
    bidi.set(qn("w:val"), "1")
    pPr.insert_element_before(bidi, "w:spacing", "w:ind", "w:jc", "w:rPr")


def clear_table_borders(table) -> None:
    """Inserts w:tblBorders in strict ECMA-376 CT_TblPr schema order before w:shd/w:tblLook."""
    tblPr = table._tbl.tblPr
    old = tblPr.find(qn("w:tblBorders"))
    if old is not None:
        tblPr.remove(old)
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "nil")
        borders.append(e)
    anchor = None
    for tag in ("w:shd", "w:tblLayout", "w:tblCellMar", "w:tblLook"):
        anchor = tblPr.find(qn(tag))
        if anchor is not None:
            break
    if anchor is not None:
        anchor.addprevious(borders)
    else:
        tblPr.append(borders)


def finish_rtl_run(run, pt: float) -> None:
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.insert(0, rFonts)
    for a in ("w:ascii", "w:hAnsi", "w:cs"):
        rFonts.set(qn(a), URDU_FONT)
    szcs = OxmlElement("w:szCs")
    szcs.set(qn("w:val"), str(int(pt * 2)))
    rPr.append(szcs)
    rtl = OxmlElement("w:rtl")
    rtl.set(qn("w:val"), "1")
    rPr.append(rtl)


def new_paragraph(container):
    if isinstance(container, _Cell):
        ps = container.paragraphs
        if len(ps) == 1 and not ps[0].runs:
            return ps[0]
    return container.add_paragraph()


def write_par(par, text: str, pt: float, bold: bool, rtl: bool, align: str) -> None:
    if rtl:
        set_bidi(par)
    par.paragraph_format.space_before = Pt(0)
    par.paragraph_format.space_after = Pt(3)
    if align == "center":
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "right" and not rtl:
        par.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    clean_text = ILLEGAL_XML_CHARS_RE.sub("", text)
    run = par.add_run(clean_text)
    run.font.size = Pt(pt)
    if bold:
        run.bold = True
    if rtl:
        finish_rtl_run(run, pt)


def add_picture(container, img: np.ndarray, width_in: float, align: str = "left") -> None:
    h, w = img.shape[:2]
    if w * h < 250_000:
        ok, buf = cv2.imencode(".png", img)
    else:
        ok, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if not ok:
        return
    par = new_paragraph(container)
    par.paragraph_format.space_after = Pt(2)
    if align == "center":
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "right":
        par.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    par.add_run().add_picture(io.BytesIO(buf.tobytes()), width=Inches(max(0.3, width_in)))


def align_for(
    b: Block, x_lo: int, x_hi: int, page_w: int = 0, text_min_x: int = 0, text_max_x: int = 0
) -> str:
    if b.rtl:
        if page_w > 0 and (b.x1 - b.x0) < 0.55 * page_w:
            page_c = ((b.x0 + b.x1) / 2.0) / float(page_w)
            if abs(page_c - 0.5) < 0.06:
                return "center"
        return "right"

    if b.kind == "text" and LIST_START_RE.match(b.text.strip()):
        return "left"

    eff_lo = text_min_x if (page_w > 0 and x_lo == 0 and text_max_x > text_min_x) else x_lo
    eff_hi = text_max_x if (page_w > 0 and x_hi == page_w and text_max_x > text_min_x) else x_hi
    span = max(1, eff_hi - eff_lo)
    bw = b.x1 - b.x0
    left_gap = b.x0 - eff_lo
    right_gap = eff_hi - b.x1

    if left_gap <= max(28, int(0.05 * span)):
        return "left"

    if bw < 0.72 * span and left_gap > 0.08 * span and right_gap > 0.08 * span:
        if abs(left_gap - right_gap) <= 0.08 * span:
            return "center"

    if right_gap <= max(35, int(0.06 * span)) and left_gap > 0.35 * span:
        return "right"

    return "left"


def emit_block(
    container,
    b: Block,
    x_lo: int,
    x_hi: int,
    ipp: float,
    max_w_in: float,
    page_w: int = 0,
    text_min_x: int = 0,
    text_max_x: int = 0,
) -> None:
    al = align_for(b, x_lo, x_hi, page_w, text_min_x, text_max_x)
    if b.kind == "text":
        for line in b.text.split("\n"):
            line = line.strip()
            if line:
                write_par(new_paragraph(container), line, b.pt, b.bold, is_rtl(line) or b.rtl, al)
    else:
        add_picture(container, b.img, min((b.x1 - b.x0) * ipp, max_w_in, 3.0), al)


def make_bands(blocks: List[Block]) -> List[List[Block]]:
    bands = []
    for b in sorted(blocks, key=lambda b: b.y0):
        if bands:
            bd = bands[-1]
            if b.y0 < bd["y1"] - 0.35 * (b.y1 - b.y0):
                bd["items"].append(b)
                bd["y1"] = max(bd["y1"], b.y1)
                continue
        bands.append({"items": [b], "y1": b.y1})
    return [bd["items"] for bd in bands]


def make_columns(items: List[Block]) -> list:
    cols = []
    for b in sorted(items, key=lambda b: b.x0):
        for col in cols:
            ov = min(col["x1"], b.x1) - max(col["x0"], b.x0)
            if ov > 0.3 * min(b.x1 - b.x0, col["x1"] - col["x0"]):
                col["items"].append(b)
                col["x0"], col["x1"] = min(col["x0"], b.x0), max(col["x1"], b.x1)
                break
        else:
            cols.append({"x0": b.x0, "x1": b.x1, "items": [b]})
    cols.sort(key=lambda c: c["x0"])
    for c in cols:
        c["items"].sort(key=lambda b: b.y0)
    return cols


def emit_band(doc, items: List[Block], W: int, ipp: float, text_min_x: int = 0, text_max_x: int = 0) -> None:
    cols = make_columns(items)
    if len(cols) == 1:
        for b in cols[0]["items"]:
            emit_block(doc, b, 0, W, ipp, USABLE_IN, page_w=W, text_min_x=text_min_x, text_max_x=text_max_x)
        return
    widths = []
    for i, c in enumerate(cols):
        nxt = cols[i + 1]["x0"] if i + 1 < len(cols) else max(c["x1"], text_max_x)
        widths.append(max(0.7, (nxt - c["x0"]) * ipp))
    scale = min(1.0, USABLE_IN / sum(widths))
    widths = [w * scale for w in widths]
    t = doc.add_table(rows=1, cols=len(cols))
    t.autofit = False
    clear_table_borders(t)
    for i, c in enumerate(cols):
        cell = t.cell(0, i)
        cell.width = Inches(widths[i])
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for b in c["items"]:
            emit_block(cell, b, c["x0"], c["x1"], ipp, widths[i] - 0.15, page_w=0)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def emit_table(doc, tb: TableData, ipp: float) -> None:
    widths_px = [max(10, tb.xs[i + 1] - tb.xs[i]) for i in range(tb.n_cols)]
    total_px = float(sum(widths_px))
    scale = min(ipp, USABLE_IN / total_px)  # inches per pixel for this table
    widths_in = [w * scale for w in widths_px]

    t = doc.add_table(rows=tb.n_rows, cols=tb.n_cols)
    t.style = "Table Grid"
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for ci in range(tb.n_cols):
        for ri in range(tb.n_rows):
            t.cell(ri, ci).width = Inches(widths_in[ci])
    for ri in range(tb.n_rows):
        row = t.rows[ri]
        row.height = Inches(max(0.2, (tb.ys[ri + 1] - tb.ys[ri]) * scale * 0.9))
        row.height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST

    for cell in tb.cells:
        tc = t.cell(cell.r0, cell.c0)
        if cell.r1 - cell.r0 > 1 or cell.c1 - cell.c0 > 1:
            try:
                tc = tc.merge(t.cell(cell.r1 - 1, cell.c1 - 1))
            except Exception as e:
                log.warning("merge failed: %s", e)
        tc.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        cw_in = sum(widths_in[cell.c0:cell.c1])
        if cell.img is not None:
            add_picture(tc, cell.img, min(cell.img.shape[1] * scale, cw_in - 0.12), "center")
        elif cell.text:
            for line in cell.text.split("\n"):
                line = line.strip()
                if line:
                    write_par(new_paragraph(tc), line, cell.pt, cell.bold, is_rtl(line), cell.align)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def append_page_to_doc(doc, blocks: List[Block], tables: List[TableData], W: int) -> None:
    ipp = PAGE_W_IN / float(W)
    text_min_x = min((b.x0 for b in blocks), default=int(W * 0.08))
    text_max_x = max((b.x1 for b in blocks), default=int(W * 0.92))

    items = [("b", b.y0, b) for b in blocks] + [("t", t.bbox[1], t) for t in tables]
    items.sort(key=lambda it: it[1])
    pending: List[Block] = []
    for kind, _, obj in items:
        if kind == "b":
            pending.append(obj)
        else:
            for band in _glue_stray_bands(make_bands(pending)):
                emit_band(doc, band, W, ipp, text_min_x=text_min_x, text_max_x=text_max_x)
            pending = []
            emit_table(doc, obj, ipp)
    for band in _glue_stray_bands(make_bands(pending)):
        emit_band(doc, band, W, ipp, text_min_x=text_min_x, text_max_x=text_max_x)

    if not items:
        doc.add_paragraph("(No text could be detected in this image.)")


def create_empty_docx() -> Document:
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(PAGE_W_IN), Inches(11.69)
    sec.left_margin = sec.right_margin = Inches(MARGIN_IN)
    sec.top_margin = sec.bottom_margin = Inches(MARGIN_IN)
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(11)
    return doc


# --------------------------------------------------------------------------- pipeline
def _glue_stray_bands(bands: List[List[Block]]) -> List[List[Block]]:
    res: List[List[Block]] = []
    i = 0
    while i < len(bands):
        bd = bands[i]
        nxt = bands[i + 1] if i + 1 < len(bands) else None
        if len(bd) == 1 and bd[0].kind == "text" and nxt and len(nxt) >= 2:
            b = bd[0]
            ny0 = min(x.y0 for x in nxt)
            ny1 = max(x.y1 for x in nxt)
            leftmost = sorted(nxt, key=lambda x: x.x0)[0]
            labeled = leftmost.kind == "text" and leftmost.text.strip().split("\n")[0].rstrip().endswith(":")
            if (
                (b.text.strip().endswith(":") or labeled)
                and b.y0 >= ny0 - int(1.5 * (b.y1 - b.y0))
                and b.y1 <= ny1
            ):
                nxt.insert(0, b)
                i += 1
                continue
        res.append(bd)
        i += 1
    return res


def process_single_image(data: bytes, ocr: OCR) -> Tuple[List[Block], List[TableData], int]:
    bgr = decode_image(data)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    H, W = gray.shape
    dpi = W / PAGE_W_IN

    # OCR-only copy: colored hand-drawn marks (arrows, circles) painted white. Table/picture detection
    # and every image embedded in the DOCX keep using the ORIGINAL bgr / gray.
    ocr_bgr = mask_colored_annotations(bgr)
    ocr_gray = cv2.cvtColor(ocr_bgr, cv2.COLOR_BGR2GRAY)

    tables = find_tables(gray)
    for tb in tables:
        fill_table(tb, bgr, ocr, dpi, ocr_bgr=ocr_bgr)

    masked = gray.copy()
    ocr_masked = ocr_gray.copy()
    for tb in tables:
        x0, y0, x1, y1 = tb.bbox
        masked[max(0, y0 - 4):min(H, y1 + 4), max(0, x0 - 4):min(W, x1 + 4)] = 255
        ocr_masked[max(0, y0 - 4):min(H, y1 + 4), max(0, x0 - 4):min(W, x1 + 4)] = 255

    pic_blocks = []
    for (x0, y0, x1, y1) in find_pictures(masked, bgr):
        pic_blocks.append(Block("image", x0, y0, x1, y1, img=bgr[y0:y1, x0:x1].copy()))
        masked[y0:y1, x0:x1] = 255
        ocr_masked[y0:y1, x0:x1] = 255

    text_blocks = page_paragraphs(ocr_masked, bgr, ocr, dpi, ocr_bgr=ocr_bgr)
    return text_blocks + pic_blocks, tables, W


def run_pipeline(images_data: List[bytes], lang: str, ai_budget: Optional[int] = None) -> Tuple[bytes, float]:
    t0 = time.perf_counter()
    ocr = OCR(lang, ai_budget=ai_budget)
    doc = create_empty_docx()

    for idx, data in enumerate(images_data):
        if idx > 0:
            doc.add_page_break()
        p_t0 = time.perf_counter()
        with ocr.lock:  # per-page AI budget so a heavy first page can't starve later pages
            ocr.ai_calls = 0
        blocks, tables, W = process_single_image(data, ocr)
        append_page_to_doc(doc, blocks, tables, W)
        log.info(
            "page=%d/%d tables=%d blocks=%d ai_calls=%d page_sec=%.2f",
            idx + 1, len(images_data), len(tables), len(blocks), ocr.ai_calls, time.perf_counter() - p_t0,
        )

    out = io.BytesIO()
    doc.save(out)
    elapsed = time.perf_counter() - t0
    log.info("batch_done pages=%d total_ai_calls=%d total_sec=%.2f", len(images_data), ocr.ai_calls, elapsed)
    return out.getvalue(), elapsed


# --------------------------------------------------------------------------- API
@app.get("/health")
def health():
    try:
        langs = pytesseract.get_languages(config="")
    except Exception:
        langs = []
    return {
        "status": "online",
        "engine": "Image to Word v10.4",
        "tesseract_langs": langs,
        "gemini_enabled": bool(GEMINI_API_KEY),
        "gemini_models": GEMINI_MODELS,
        "max_batch_files": MAX_BATCH_FILES,
        "accepts_pdf": True,
        "max_pdf_pages": MAX_PDF_PAGES,
        "max_total_pages": MAX_TOTAL_PAGES,
    }


@app.post("/api/convert-img-to-docx")
@app.post("/api/convert-pdf-to-docx")
@app.post("/convert")
def convert(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    language: Optional[str] = Form(None),
    lang: Optional[str] = Form(None),
):
    uploads: List[UploadFile] = []
    if files:
        uploads.extend(f for f in files if f and f.filename)
    if file and file.filename and file not in uploads:
        uploads.append(file)
    if not uploads:
        raise HTTPException(status_code=400, detail="No file provided")
    if len(uploads) > MAX_BATCH_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_BATCH_FILES} images allowed per batch")

    images_data: List[bytes] = []
    has_pdf = False
    for u in uploads:
        ext = Path(u.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT and ext != ".pdf":
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {u.filename}")
        limit = MAX_PDF_BYTES if ext == ".pdf" else MAX_UPLOAD_BYTES
        data = u.file.read(limit + 1)
        if len(data) > limit:
            raise HTTPException(status_code=413, detail=f"File too large: {u.filename}")
        if ext == ".pdf" or data[:5] == b"%PDF-":
            has_pdf = True
            images_data.extend(render_pdf_pages(data))
        else:
            images_data.append(data)
    if len(images_data) > MAX_TOTAL_PAGES:
        raise HTTPException(status_code=400, detail=f"Too many pages: {MAX_TOTAL_PAGES} is the limit per request")

    ocr_lang = resolve_lang(language or lang)
    # Short PDFs get the full refinement budget (best quality); long ones are throttled
    # per page so a 30-page scan cannot monopolise the 2-core box or the Gemini quota.
    ai_budget = PDF_AI_BUDGET if has_pdf and len(images_data) > PDF_FULL_QUALITY_PAGES else None
    if not CONVERT_SLOTS.acquire(timeout=20):
        raise HTTPException(status_code=503, detail="Server is busy, please try again in a minute")
    try:
        out, elapsed = run_pipeline(images_data, ocr_lang, ai_budget=ai_budget)
    except HTTPException:
        raise
    except Exception:
        log.exception("conversion failed")
        raise HTTPException(status_code=500, detail="Conversion failed")
    finally:
        CONVERT_SLOTS.release()

    stem = re.sub(r"[^\w\-]+", "_", Path(uploads[0].filename or "document").stem) or "document"
    suffix = f"_batch_{len(images_data)}_converted.docx" if len(images_data) > 1 else "_converted.docx"
    return StreamingResponse(
        io.BytesIO(out),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{stem}{suffix}"',
            "X-Processing-Time-Seconds": f"{elapsed:.2f}",
            "X-Pages-Converted": str(len(images_data)),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8003")), reload=False)