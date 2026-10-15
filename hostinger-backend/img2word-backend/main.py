"""
Compixor AI - Image to Word Engine v10 (2-Core VPS Optimized)

Pipeline:
  1. Decode + normalise image (alpha -> white, size normalisation, fast illumination normalisation)
  2. Find table grids from ruling lines, derive REAL cell grid (merged cells + broken-border cell recovery)
  3. OCR every cell in parallel (optional Gemini 2.5 Flash refinement for Urdu / low confidence)
  4. Find photos / faces / B&W logos / signatures outside tables (thread-safe Haar cascade + halftone + crest detector)
  5. OCR remaining page text as paragraphs (full table bboxes + pictures masked out)
  6. Rebuild page in reading order: paragraphs, pictures, tables, borderless side-by-side bands (schema-valid OpenXML)

Endpoints: GET /health, POST /convert, POST /api/convert-img-to-docx
"""
import io
import os

# Lock OpenMP threads to 1 per worker to prevent CPU thrashing on 2-core VPS
os.environ.setdefault("OMP_THREAD_LIMIT", "1")

import re
import json
import base64
import logging
import threading
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
ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "https://compixor-ai.cloud,https://www.compixor-ai.cloud,https://compixor-ai.vercel.app,http://localhost:3000",
    ).split(",")
    if o.strip()
]
OCR_WORKERS = int(os.getenv("OCR_WORKERS", "2"))

# Optional Gemini refinement (used only for Urdu/Arabic or low-confidence crops)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_AI_CALLS = int(os.getenv("MAX_AI_CALLS", "60"))

URDU_FONT = os.getenv("URDU_FONT", "Jameel Noori Nastaleeq")
ARABIC_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")
LANG_ALIASES = {"english": "eng", "en": "eng", "urdu": "urd", "ur": "urd", "arabic": "ara", "ar": "ara"}

PAGE_W_IN = 8.27
MARGIN_IN = 0.6
USABLE_IN = PAGE_W_IN - 2 * MARGIN_IN

app = FastAPI(title="Compixor AI - Image to Word Engine v10")
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


def has_ink(img: np.ndarray, thr: float = 0.003) -> bool:
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    return float((norm < 185).mean()) > thr


def ink_ratio(img: np.ndarray) -> float:
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    return float((norm < 185).mean())


def is_photo(img: np.ndarray) -> bool:
    """Photos / crests have lots of normalized mid-tones OR a detectable human face."""
    h, w = img.shape[:2]
    if h < 70 or w < 60:
        return False
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    norm = normalize_lighting(g)
    mid = float(((norm > 45) & (norm < 210)).mean())
    if mid > 0.45 and float(g.std()) > 35:
        return True
    return has_face(img)


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
    use = [p for p in wanted if p in avail]
    if not use:
        use = ["eng"] if "eng" in avail else sorted(avail)[:1]
    return "+".join(use)


# --------------------------------------------------------------------------- OCR
def gemini_ocr(img: np.ndarray) -> Optional[str]:
    ok, buf = cv2.imencode(".png", img)
    if not ok:
        return None
    prompt = (
        "Transcribe all text in this image exactly as written. Return only the text, no commentary. "
        "Keep line breaks. Urdu/Arabic must be correct Unicode in natural reading order; English stays English. "
        "If there is no text, return an empty string."
    )
    payload = {
        "contents": [{"parts": [
            {"text": prompt},
            {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(buf.tobytes()).decode()}},
        ]}],
        "generationConfig": {"temperature": 0},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.load(r)
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = re.sub(r"^```[a-z]*\n?|```$", "", text.strip()).strip()
        return text
    except Exception as e:
        log.warning("Gemini OCR failed: %s", e)
        return None


class OCR:
    def __init__(self, lang: str):
        self.lang = lang
        self.urdu = "urd" in lang or "ara" in lang
        self.ai_calls = 0
        self.lock = threading.Lock()

    def _take_ai(self) -> bool:
        with self.lock:
            if self.ai_calls < MAX_AI_CALLS:
                self.ai_calls += 1
                return True
        return False

    def _tess(self, img: np.ndarray, psm: int) -> dict:
        g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = g.shape[:2]
        f = 3 if h < 40 else 2 if h < 90 else 1
        if f > 1:
            g = cv2.resize(g, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC)
        pad = 10
        g = cv2.copyMakeBorder(g, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=255)
        d = pytesseract.image_to_data(
            g, lang=self.lang, config=f"--psm {psm}", output_type=pytesseract.Output.DICT
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
            paras.setdefault(key, {}).setdefault(d["line_num"][i], []).append(t)
            confs.append(c)
            hs.append(d["height"][i] / f)
            x0s.append((d["left"][i] - pad) / f)
            x1s.append((d["left"][i] + d["width"][i] - pad) / f)
        text = "\n".join(
            " ".join(" ".join(words) for _, words in sorted(lines.items()))
            for _, lines in sorted(paras.items())
        )
        return {
            "text": text,
            "conf": float(np.mean(confs)) if confs else 0.0,
            "h": float(np.median(hs)) if hs else 0.0,
            "cx": ((min(x0s) + max(x1s)) / 2.0 / max(w, 1)) if x0s else 0.5,
            "wr": ((max(x1s) - min(x0s)) / max(w, 1)) if x0s else 1.0,
        }

    def read(self, img: np.ndarray, psm: int = 6) -> dict:
        r = self._tess(img, psm)
        if GEMINI_API_KEY and self.urdu and has_ink(img):
            need = bool(ARABIC_RE.search(r["text"])) or r["conf"] < 65
            if need and self._take_ai():
                t = gemini_ocr(img)
                if t:
                    r["text"], r["conf"] = t, 95.0
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


def fill_table(tb: TableData, bgr: np.ndarray, ocr: OCR, dpi: float) -> None:
    def work(cell: Cell):
        try:
            x0, y0, x1, y1 = cell.box
            m = 3
            crop = bgr[y0 + m:y1 - m, x0 + m:x1 - m]
            if crop.size == 0 or not has_ink(crop):
                return
            if is_photo(crop):
                cell.img = crop.copy()
                return
            r = ocr.read(crop, psm=7 if crop.shape[0] < 45 else 6)
            # Unreadable but clearly inked (signature, stamp, failed script) -> keep as picture
            if r["conf"] < 30 and ink_ratio(crop) > 0.02 and crop.shape[0] > 30:
                cell.img = crop.copy()
                return
            cell.text = r["text"].strip()
            if r["h"] > 0:
                cell.pt = float(min(16.0, max(7.0, round(r["h"] * 72.0 / dpi * 2) / 2)))
            if r["wr"] < 0.85 and abs(r["cx"] - 0.5) < 0.07:
                cell.align = "center"
        except Exception as e:
            log.warning("cell OCR failed: %s", e)

    with ThreadPoolExecutor(max_workers=OCR_WORKERS) as ex:
        list(ex.map(work, tb.cells))


# --------------------------------------------------------------------------- pictures + page text
def _overlaps(b1: Tuple[int, int, int, int], b2: Tuple[int, int, int, int]) -> bool:
    ix0, iy0 = max(b1[0], b2[0]), max(b1[1], b2[1])
    ix1, iy1 = min(b1[2], b2[2]), min(b1[3], b2[3])
    if ix1 <= ix0 or iy1 <= iy0:
        return False
    inter = (ix1 - ix0) * (iy1 - iy0)
    a1 = max(1, (b1[2] - b1[0]) * (b1[3] - b1[1]))
    a2 = max(1, (b2[2] - b2[0]) * (b2[3] - b2[1]))
    return inter / float(min(a1, a2)) > 0.35


def find_pictures(masked_gray: np.ndarray, bgr: np.ndarray) -> List[Tuple[int, int, int, int]]:
    global _FACE
    H, W = masked_gray.shape
    norm = normalize_lighting(masked_gray)
    boxes: List[Tuple[int, int, int, int]] = []

    def add_box(cand: Tuple[int, int, int, int]):
        if not any(_overlaps(cand, existing) for existing in boxes):
            boxes.append(cand)

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

    # 3. High-contrast B&W Crests / Logos / QR codes in top header area
    top_h = int(H * 0.26)
    _, bw = cv2.threshold(norm[:top_h, :], 190, 255, cv2.THRESH_BINARY_INV)
    logo_blob = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    l_cnts, _ = cv2.findContours(logo_blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in l_cnts:
        x, y, w, h = cv2.boundingRect(c)
        if not (min_side <= w <= W * 0.22 and min_side <= h <= H * 0.18):
            continue
        if not (0.68 <= w / float(h) <= 1.45):
            continue
        ink_density = float((bw[y:y + h, x:x + w] > 0).mean())
        if 0.18 <= ink_density <= 0.78:
            p = 4
            add_box((max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)))

    return boxes


def page_paragraphs(masked: np.ndarray, bgr: np.ndarray, ocr: OCR, dpi: float) -> List[Block]:
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

    raw = []
    for key, words in sorted(paras.items()):
        words.sort(key=lambda w: (w[0], w[1]))
        lines = {}
        for w in words:
            lines.setdefault(w[0], []).append(w[6])
        text = " ".join(" ".join(v) for _, v in sorted(lines.items()))
        if not re.sub(r"\W", "", text):
            continue
        x0 = min(w[1] for w in words)
        y0 = min(w[2] for w in words)
        x1 = max(w[1] + w[3] for w in words)
        y1 = max(w[2] + w[4] for w in words)
        conf = float(np.mean([w[5] for w in words]))
        hmed = float(np.median([w[4] for w in words]))
        if conf < 25 and len(text) < 4:
            continue
        raw.append([x0, y0, x1, y1, text, conf, hmed])

    blocks = []
    for x0, y0, x1, y1, text, conf, hmed in raw:
        if GEMINI_API_KEY and ocr.urdu and (ARABIC_RE.search(text) or conf < 65):
            if ocr._take_ai():
                p = 6
                crop = bgr[max(0, y0 - p):min(H, y1 + p), max(0, x0 - p):min(W, x1 + p)]
                if crop.size and has_ink(crop):
                    t = gemini_ocr(crop)
                    if t:
                        text = " ".join(t.splitlines())
        pt = float(min(30.0, max(8.0, round(hmed * 72.0 / dpi * 2) / 2)))
        blocks.append(Block("text", x0, y0, x1, y1, text=text, pt=pt, rtl=is_rtl(text)))

    if blocks:
        med = float(np.median([b.pt for b in blocks]))
        for b in blocks:
            b.bold = b.pt >= 1.3 * med
            if not b.bold:
                b.pt = min(b.pt, max(med, 8.0) * 1.15)
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
    elif align == "left" and rtl:
        par.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = par.add_run(text)
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


def align_for(b: Block, x_lo: int, x_hi: int, page_w: int = 0) -> str:
    span = max(1, x_hi - x_lo)
    c = ((b.x0 + b.x1) / 2.0 - x_lo) / span
    wr = (b.x1 - b.x0) / float(span)
    if page_w > 0:
        page_c = ((b.x0 + b.x1) / 2.0) / float(page_w)
        if abs(page_c - 0.5) < 0.08 and (b.x1 - b.x0) < 0.75 * page_w:
            return "center"
    if wr > 0.85:
        return "left"
    if abs(c - 0.5) < 0.07:
        return "center"
    return "right" if c > 0.6 else "left"


def emit_block(container, b: Block, x_lo: int, x_hi: int, ipp: float, max_w_in: float, page_w: int = 0) -> None:
    al = align_for(b, x_lo, x_hi, page_w)
    if b.kind == "text":
        write_par(new_paragraph(container), b.text, b.pt, b.bold, b.rtl, al)
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


def emit_band(doc, items: List[Block], W: int, ipp: float) -> None:
    cols = make_columns(items)
    if len(cols) == 1:
        for b in cols[0]["items"]:
            emit_block(doc, b, 0, W, ipp, USABLE_IN, page_w=W)
        return
    widths = []
    for i, c in enumerate(cols):
        nxt = cols[i + 1]["x0"] if i + 1 < len(cols) else c["x1"]
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
            emit_block(cell, b, c["x0"], c["x1"], ipp, widths[i] - 0.15, page_w=W)
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
                    write_par(new_paragraph(tc), line, cell.pt, False, is_rtl(line), cell.align)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def build_docx(blocks: List[Block], tables: List[TableData], W: int) -> bytes:
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(PAGE_W_IN), Inches(11.69)
    sec.left_margin = sec.right_margin = Inches(MARGIN_IN)
    sec.top_margin = sec.bottom_margin = Inches(MARGIN_IN)
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(11)
    ipp = PAGE_W_IN / float(W)

    items = [("b", b.y0, b) for b in blocks] + [("t", t.bbox[1], t) for t in tables]
    items.sort(key=lambda it: it[1])
    pending: List[Block] = []
    for kind, _, obj in items:
        if kind == "b":
            pending.append(obj)
        else:
            for band in make_bands(pending):
                emit_band(doc, band, W, ipp)
            pending = []
            emit_table(doc, obj, ipp)
    for band in make_bands(pending):
        emit_band(doc, band, W, ipp)

    if not items:
        doc.add_paragraph("(No text could be detected in this image.)")
    out = io.BytesIO()
    doc.save(out)
    return out.getvalue()


# --------------------------------------------------------------------------- pipeline
def run_pipeline(data: bytes, lang: str) -> bytes:
    bgr = decode_image(data)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    H, W = gray.shape
    dpi = W / PAGE_W_IN
    ocr = OCR(lang)

    tables = find_tables(gray)
    for tb in tables:
        fill_table(tb, bgr, ocr, dpi)

    # Mask entire table bounding boxes + cells so no table text/borders leak into paragraphs
    masked = gray.copy()
    for tb in tables:
        x0, y0, x1, y1 = tb.bbox
        masked[max(0, y0 - 4):min(H, y1 + 4), max(0, x0 - 4):min(W, x1 + 4)] = 255

    pic_blocks = []
    for (x0, y0, x1, y1) in find_pictures(masked, bgr):
        pic_blocks.append(Block("image", x0, y0, x1, y1, img=bgr[y0:y1, x0:x1].copy()))
        masked[y0:y1, x0:x1] = 255

    text_blocks = page_paragraphs(masked, bgr, ocr, dpi)
    log.info(
        "tables=%d pictures=%d paragraphs=%d ai_calls=%d",
        len(tables), len(pic_blocks), len(text_blocks), ocr.ai_calls,
    )
    return build_docx(text_blocks + pic_blocks, tables, W)


# --------------------------------------------------------------------------- API
@app.get("/health")
def health():
    try:
        langs = pytesseract.get_languages(config="")
    except Exception:
        langs = []
    return {
        "status": "online",
        "engine": "Image to Word v10",
        "tesseract_langs": langs,
        "gemini_enabled": bool(GEMINI_API_KEY),
    }


@app.post("/api/convert-img-to-docx")
@app.post("/convert")
def convert(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    language: Optional[str] = Form(None),
    lang: Optional[str] = Form(None),
):
    upload = (files[0] if files else None) or file
    if not upload:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = Path(upload.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    data = upload.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large")

    ocr_lang = resolve_lang(language or lang)
    try:
        out = run_pipeline(data, ocr_lang)
    except HTTPException:
        raise
    except Exception:
        log.exception("conversion failed")
        raise HTTPException(status_code=500, detail="Conversion failed")

    stem = re.sub(r"[^\w\-]+", "_", Path(upload.filename or "document").stem) or "document"
    return StreamingResponse(
        io.BytesIO(out),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{stem}_converted.docx"'},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8003")), reload=False)