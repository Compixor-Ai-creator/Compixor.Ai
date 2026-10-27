"""
Dual-Engine Language Script Routing, Urdu Nastaliq Detection & Vision-LLM Transcription.
Conforms to PROJECT.md § Interface Contracts § 4 and Requirement R6.

Responsibilities:
1. Script Classification:
   - Differentiate English/Latin text from Urdu Nastaliq using Unicode codepoints
     and visual topological heuristics (nuqta dot ratio, ligature aspect ratio, diagonal gradient).
2. Single-Cell Container Detection:
   - Detect single-cell bordered callout containers (n_rows == 1, n_cols == 1) bypassed by M2 table extractor.
   - Mask out detected container regions from text_mask to guarantee zero duplicate content in body.
3. Vision-LLM API Transcription:
   - Resolve VISION_API_KEY from parameter, environment, or .env.
   - Transcribe Urdu crops via Google Gemini Vision API (gemini-1.5-flash) with verbatim prompt:
     "Transcribe exactly, Urdu RTL, no translation, no commentary. Output only the transcribed Urdu lines. Preserve all numbering (1, 2, 3...) exactly as shown."
   - Guard against missing/empty/mock keys when Urdu is encountered, raising ValueError per R1/R6.
   - Allow pure Latin documents to process without requiring VISION_API_KEY.
   - Support pluggable transcriber_fn for offline unit testing without network dependencies.
4. OpenXML BiDi Typography:
   - Generate FormattedLine metadata with language_script="urdu_nastaliq" and urdu_container=True.
   - Provide XML helpers for <w:bidi/>, <w:rtl/>, "Jameel Noori Nastaleeq", "Noto Nastaliq Urdu",
     and right alignment (<w:jc w:val="right"/>).
"""

from __future__ import annotations

import io
import os
import re
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple, Optional, Callable, Dict, Any

import cv2
import numpy as np
from PIL import Image

from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from pipeline.preprocessor import PreprocessedPage
from pipeline.typography_engine import FormattedLine

logger = logging.getLogger("compixor.pipeline.script_router")


# ==============================================================================
# Data Structures
# ==============================================================================

@dataclass
class SingleCellContainer:
    """Represents a detected single-cell bordered callout/container box."""
    bbox: tuple[int, int, int, int]   # (x, y, w, h) in page coordinates
    is_urdu: bool
    confidence: float = 0.95


# ==============================================================================
# OpenXML BiDi Typography Helpers
# ==============================================================================

def apply_bidi_paragraph_formatting(paragraph) -> None:
    """
    Applies OpenXML BiDi paragraph properties:
    - <w:bidi w:val="1"/>
    - Right paragraph alignment (<w:jc w:val="right"/>)
    """
    pPr = paragraph._p.get_or_add_pPr()
    if pPr.find(qn("w:bidi")) is None:
        bidi = OxmlElement("w:bidi")
        bidi.set(qn("w:val"), "1")
        pPr.insert(0, bidi)
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    jc = pPr.find(qn("w:jc"))
    if jc is None:
        jc = OxmlElement("w:jc")
        pPr.append(jc)
    jc.set(qn("w:val"), "right")


def apply_bidi_run_formatting(
    run,
    font_cs: str = "Jameel Noori Nastaleeq",
    font_ascii: str = "Noto Nastaliq Urdu",
    font_size_pt: float = 11.0,
    is_bold: bool = False,
) -> None:
    """
    Applies OpenXML BiDi run properties:
    - <w:rtl w:val="1"/>
    - <w:rFonts w:cs="Jameel Noori Nastaleeq" w:ascii="Noto Nastaliq Urdu" w:hAnsi="Noto Nastaliq Urdu"/>
    - Font size <w:sz> and <w:szCs>
    - Bold <w:b/> and <w:bCs/>
    """
    rPr = run._r.get_or_add_rPr()

    # 1. RTL tag
    if rPr.find(qn("w:rtl")) is None:
        rtl = OxmlElement("w:rtl")
        rtl.set(qn("w:val"), "1")
        rPr.append(rtl)

    # 2. Complex Script & Latin Font Bindings
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:cs"), font_cs)
    rFonts.set(qn("w:ascii"), font_ascii)
    rFonts.set(qn("w:hAnsi"), font_ascii)

    # 3. Font Size in half-points
    sz_half_pts = str(int(font_size_pt * 2))
    sz = rPr.find(qn("w:sz"))
    if sz is None:
        sz = OxmlElement("w:sz")
        rPr.append(sz)
    sz.set(qn("w:val"), sz_half_pts)

    szCs = rPr.find(qn("w:szCs"))
    if szCs is None:
        szCs = OxmlElement("w:szCs")
        rPr.append(szCs)
    szCs.set(qn("w:val"), sz_half_pts)

    # 4. Bold Weight
    if is_bold:
        if rPr.find(qn("w:b")) is None:
            rPr.append(OxmlElement("w:b"))
        if rPr.find(qn("w:bCs")) is None:
            rPr.append(OxmlElement("w:bCs"))


def set_cell_box_borders(cell, color: str = "000000", sz: str = "8") -> None:
    """Sets clean solid outer borders on a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        border = OxmlElement(f"w:{edge}")
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), sz)
        border.set(qn("w:space"), "0")
        border.set(qn("w:color"), color)
        tcBorders.append(border)
    tcPr.append(tcBorders)


def create_urdu_container_table(
    doc,
    lines: List[FormattedLine],
    font_cs: str = "Jameel Noori Nastaleeq",
    font_ascii: str = "Noto Nastaliq Urdu",
):
    """Creates a 1x1 single-cell Word container table with BiDi Nastaliq formatting."""
    table = doc.add_table(rows=1, cols=1)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_box_borders(cell, color="000000", sz="8")

    for i, line in enumerate(lines):
        if i == 0 and len(cell.paragraphs) > 0:
            p = cell.paragraphs[0]
        else:
            p = cell.add_paragraph()
        apply_bidi_paragraph_formatting(p)
        run = p.add_run(line.text)
        apply_bidi_run_formatting(
            run,
            font_cs=font_cs,
            font_ascii=font_ascii,
            font_size_pt=line.font_size_pt,
            is_bold=line.is_bold,
        )
    return table


# ==============================================================================
# Script Classifier (Unicode + Contour Topology)
# ==============================================================================

class ScriptClassifier:
    """Classifies script (Latin vs Urdu Nastaliq) via Unicode ranges and contour topology."""

    ARABIC_URDU_RANGES = [
        (0x0600, 0x06FF),  # Arabic / Urdu core
        (0x0750, 0x077F),  # Arabic Supplement
        (0x08A0, 0x08FF),  # Arabic Extended-A
        (0xFB50, 0xFDFF),  # Arabic Presentation Forms-A
        (0xFE70, 0xFEFF),  # Arabic Presentation Forms-B
    ]

    @classmethod
    def is_urdu_unicode(cls, text: str) -> bool:
        """Returns True if text contains significant Arabic/Urdu Unicode codepoints."""
        if not text:
            return False
        urdu_chars = sum(
            1 for ch in text
            if any(start <= ord(ch) <= end for start, end in cls.ARABIC_URDU_RANGES)
        )
        alpha_chars = sum(1 for ch in text if ch.isalpha())
        if alpha_chars == 0:
            return urdu_chars > 0
        return (urdu_chars / alpha_chars) > 0.20 or urdu_chars >= 2

    @classmethod
    def is_urdu_contour_topology(cls, binary_roi: np.ndarray) -> bool:
        """
        Detects Urdu Nastaliq visually from binary ink:
        - Detached nuqta (dot) component ratio >= 0.25
        - Ligature component aspect ratio >= 2.0
        - Diagonal 45-degree stroke gradient response
        """
        if binary_roi is None or binary_roi.size == 0 or np.sum(binary_roi > 0) < 50:
            return False

        contours, _ = cv2.findContours(binary_roi, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if len(contours) < 3:
            return False

        dot_count = 0
        wide_ligature_count = 0
        total_valid = 0

        for c in contours:
            area = cv2.contourArea(c)
            if area < 4:
                continue
            total_valid += 1
            bx, by, bw, bh = cv2.boundingRect(c)

            # Compact nuqta dots (area <= 75 px^2, aspect ratio 0.4 - 2.5)
            if area <= 75 and 0.4 <= (bw / max(1, bh)) <= 2.5:
                dot_count += 1

            # Wide cursive ligatures
            if (bw / max(1, bh)) >= 2.0 and area > 80:
                wide_ligature_count += 1

        if total_valid < 3:
            return False

        dot_ratio = dot_count / float(total_valid)
        ligature_ratio = wide_ligature_count / float(total_valid)

        # In Urdu Nastaliq, dot ratio is characteristically high (>= 0.25)
        # or combined with flowing ligatures
        return (dot_ratio >= 0.25) or (dot_ratio >= 0.16 and ligature_ratio >= 0.15)

    def classify(self, crop_binary: np.ndarray, text_hint: str = "") -> str:
        """Classifies text block as 'urdu_nastaliq' or 'latin'."""
        if self.is_urdu_unicode(text_hint):
            return "urdu_nastaliq"
        if crop_binary is not None and crop_binary.size > 0 and self.is_urdu_contour_topology(crop_binary):
            return "urdu_nastaliq"
        return "latin"


# ==============================================================================
# Vision-LLM Transcriber Client
# ==============================================================================

class VisionLLMTranscriber:
    """Manages Vision-LLM transcription API calls for Urdu Nastaliq blocks."""

    DEFAULT_PROMPT = (
        "Transcribe exactly, Urdu RTL, no translation, no commentary. "
        "Output only the transcribed Urdu lines. Preserve all numbering (1, 2, 3...) exactly as shown."
    )

    CANDIDATE_MODELS = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.0-flash-lite",
    ]

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout_sec: float = 15.0,
    ):
        self.api_key = self.resolve_api_key(api_key)
        self.model_name = model_name or "gemini-2.0-flash"
        self.timeout_sec = timeout_sec
        self._model = None

    @classmethod
    def resolve_api_key(cls, explicit_key: Optional[str] = None) -> Optional[str]:
        """Resolves VISION_API_KEY from parameter, environment, or .env file."""
        if explicit_key and explicit_key.strip():
            return explicit_key.strip()

        env_key = os.getenv("VISION_API_KEY") or os.getenv("GEMINI_API_KEY")
        if env_key and env_key.strip():
            return env_key.strip()

        # Check .env file directly in backend root or working directory
        env_files = [
            Path(__file__).resolve().parent.parent / ".env",
            Path.cwd() / ".env",
            Path.cwd() / "compixor" / "hostinger-backend" / ".env",
        ]
        for ef in env_files:
            if ef.exists():
                try:
                    for line in ef.read_text(encoding="utf-8").splitlines():
                        line = line.strip()
                        if line.startswith("VISION_API_KEY=") and not line.startswith("#"):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
                except Exception:
                    pass
        return None

    def _get_model(self, model_name: Optional[str] = None):
        target = model_name or self.model_name
        if not self.api_key or self.api_key == "MOCK_KEY":
            raise ValueError(
                "VISION_API_KEY is missing or empty in .env. "
                "Urdu Nastaliq transcription requires a valid Vision-LLM API key."
            )
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        return genai.GenerativeModel(target)

    def transcribe(self, crop_image: Image.Image) -> str:
        """
        Transcribes the image crop via Gemini Vision API.
        Tries primary model (gemini-3.8-flash) and fallbacks if deprecated.
        Returns verbatim transcribed text.
        """
        if not self.api_key or self.api_key == "MOCK_KEY":
            raise ValueError(
                "VISION_API_KEY is missing or empty in .env. "
                "Urdu Nastaliq transcription requires a valid Vision-LLM API key."
            )

        models_to_try = [self.model_name] + [m for m in self.CANDIDATE_MODELS if m != self.model_name]
        last_err = None
        for m_name in models_to_try:
            try:
                model = self._get_model(m_name)
                response = model.generate_content([self.DEFAULT_PROMPT, crop_image])
                if response and response.text:
                    self.model_name = m_name
                    return response.text.strip()
                return ""
            except Exception as exc:
                last_err = exc
                err_str = str(exc).lower()
                if "not found" in err_str or "no longer available" in err_str or "unsupported" in err_str:
                    logger.warning(f"Model {m_name} unavailable, trying fallback: {exc}")
                    continue
                else:
                    logger.error(f"Vision-LLM transcription failed on {m_name}: {exc}")
                    raise

        if last_err:
            raise last_err
        return ""


# ==============================================================================
# Script Router Engine (Requirement R6)
# ==============================================================================

class ScriptRouter:
    """
    Coordinates container detection, script classification, and Vision-LLM routing.
    Integrates with PreprocessedPage, text_mask, and Document Reconstruction.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        transcriber_fn: Optional[Callable[[Image.Image], str]] = None,
    ):
        self.api_key = VisionLLMTranscriber.resolve_api_key(api_key)
        self.classifier = ScriptClassifier()
        self.transcriber_fn = transcriber_fn
        self._transcriber = VisionLLMTranscriber(api_key=self.api_key)

    def detect_single_cell_containers(
        self, page: PreprocessedPage, text_mask: Optional[np.ndarray] = None
    ) -> List[SingleCellContainer]:
        """
        Detects single-cell bordered callouts (n_rows == 1, n_cols == 1)
        such as the Urdu boxed instructions.
        """
        w, h = page.width, page.height
        inv = (page.binary_image == 0).astype(np.uint8) * 255

        kw = max(20, int(w * 0.025))
        kh = max(15, int(h * 0.015))
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kw, 1))
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, kh))

        horiz = cv2.morphologyEx(inv, cv2.MORPH_OPEN, h_kernel, iterations=2)
        vert = cv2.morphologyEx(inv, cv2.MORPH_OPEN, v_kernel, iterations=2)
        box_grid = cv2.add(horiz, vert)

        contours, _ = cv2.findContours(box_grid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        containers: List[SingleCellContainer] = []

        for c in contours:
            bx, by, bw, bh = cv2.boundingRect(c)
            # Must meet minimum callout container dimensions
            if bw >= w * 0.15 and bh >= h * 0.03:
                margin = 8
                if bw > 2 * margin and bh > 2 * margin:
                    sub_h = horiz[by + margin : by + bh - margin, bx + margin : bx + bw - margin]
                    sub_v = vert[by + margin : by + bh - margin, bx + margin : bx + bw - margin]

                    has_internal_h = False
                    has_internal_v = False

                    if sub_h.size > 0:
                        h_proj = np.sum(sub_h > 0, axis=1)
                        if np.any(h_proj > (bw * 0.35)):
                            has_internal_h = True

                    if sub_v.size > 0:
                        v_proj = np.sum(sub_v > 0, axis=0)
                        if np.any(v_proj > (bh * 0.35)):
                            has_internal_v = True

                    # If no internal dividers, candidate is a genuine single-cell container!
                    if not (has_internal_h or has_internal_v):
                        crop_binary = inv[by + margin : by + bh - margin, bx + margin : bx + bw - margin]
                        is_urdu = self.classifier.classify(crop_binary) == "urdu_nastaliq"
                        containers.append(
                            SingleCellContainer(
                                bbox=(int(bx), int(by), int(bw), int(bh)),
                                is_urdu=is_urdu,
                                confidence=0.95,
                            )
                        )

        # Sort top-to-bottom
        containers.sort(key=lambda c: c.bbox[1])
        return containers

    def extract_and_route_containers(
        self,
        page: PreprocessedPage,
        text_mask: np.ndarray,
        containers: List[SingleCellContainer],
    ) -> Tuple[List[FormattedLine], np.ndarray]:
        """
        Transcribes single-cell containers, constructs FormattedLine objects,
        and masks the container bounding boxes out of text_mask to eliminate duplicates.
        """
        updated_mask = text_mask.copy()
        lines: List[FormattedLine] = []

        for cont in containers:
            bx, by, bw, bh = cont.bbox

            # Crop RGB with 4px inset to exclude outer border ink
            inset = 4
            x1 = max(0, bx + inset)
            y1 = max(0, by + inset)
            x2 = min(page.width, bx + bw - inset)
            y2 = min(page.height, by + bh - inset)
            crop = page.rgb_image.crop((x1, y1, x2, y2))

            if cont.is_urdu:
                # Transcribe via injected mock or Vision-LLM client
                if self.transcriber_fn is not None:
                    transcription = self.transcriber_fn(crop)
                else:
                    transcription = self._transcriber.transcribe(crop)

                # Parse lines, preserving numbered items
                raw_lines = [ln.strip() for ln in transcription.splitlines() if ln.strip()]
                line_h = bh // max(1, len(raw_lines))

                for idx, ln in enumerate(raw_lines):
                    ly = by + idx * line_h
                    lines.append(
                        FormattedLine(
                            text=ln,
                            bbox=(bx, ly, bw, line_h),
                            font_size_pt=11.0,
                            is_bold=False,
                            alignment="right",
                            is_key_value=False,
                            language_script="urdu_nastaliq",
                            urdu_container=True,
                        )
                    )

            # Mask out container with 2px padding to guarantee zero duplicate content in body
            pad = 2
            mask_y1 = max(0, by - pad)
            mask_y2 = min(page.height, by + bh + pad)
            mask_x1 = max(0, bx - pad)
            mask_x2 = min(page.width, bx + bw + pad)
            updated_mask[mask_y1:mask_y2, mask_x1:mask_x2] = 0

        return lines, updated_mask

    def route_line_or_block(
        self,
        text: str,
        crop_image: Image.Image,
        bbox: tuple[int, int, int, int],
        is_container: bool = False,
    ) -> FormattedLine:
        """
        Routes an arbitrary text line:
        - If Urdu Nastaliq: transcribes via Vision-LLM, marks BiDi metadata.
        - If Latin: preserves OCR text, marks language_script='latin'.
        """
        crop_inv = (np.array(crop_image.convert("L")) < 128).astype(np.uint8) * 255
        script = self.classifier.classify(crop_inv, text_hint=text)

        if script == "urdu_nastaliq":
            if not self.classifier.is_urdu_unicode(text):
                if self.transcriber_fn:
                    text = self.transcriber_fn(crop_image)
                elif self._transcriber:
                    text = self._transcriber.transcribe(crop_image)

            return FormattedLine(
                text=text,
                bbox=bbox,
                font_size_pt=11.0,
                is_bold=False,
                alignment="right",
                is_key_value=False,
                language_script="urdu_nastaliq",
                urdu_container=is_container,
            )
        else:
            return FormattedLine(
                text=text,
                bbox=bbox,
                font_size_pt=10.0,
                is_bold=False,
                alignment="left",
                is_key_value=False,
                language_script="latin",
                urdu_container=False,
            )
