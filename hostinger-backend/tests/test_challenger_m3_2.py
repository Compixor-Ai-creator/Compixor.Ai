"""
Empirical Challenger S2_M3_2 Test Suite.
Dual-Engine Language Script Routing, Urdu Nastaliq & OpenXML BiDi Stress Tester.
Conforms strictly to Milestone M3 requirements, Interface Contracts, and Authoritative User Request.

Mission Requirements:
1. Verify single-cell container detection on synthetic boxed callout documents.
2. Verify that container extraction completely zeroes out the container area in text_mask
   with 2px padding (0.0% text leakage into body text).
3. Verify script classification: correctly identifies Arabic/Urdu Unicode strings and visual
   cursive ligature crops while rejecting Latin text.
4. Verify Vision-LLM API key guard (R1, R6): raises ValueError if VISION_API_KEY is missing/empty/MOCK_KEY
   when Urdu is encountered; pure Latin documents succeed without VISION_API_KEY.
5. Verify OpenXML BiDi typography: verifies <w:bidi/>, <w:rtl/>, "Jameel Noori Nastaleeq" /
   "Noto Nastaliq Urdu" font bindings and right alignment XML generation.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from unittest.mock import patch, MagicMock
from typing import List, Tuple

import cv2
import numpy as np
import pytest
from PIL import Image, ImageDraw
import docx
from docx.oxml.ns import qn

from pipeline.preprocessor import PreprocessedPage
from pipeline.typography_engine import FormattedLine
from pipeline.script_router import (
    SingleCellContainer,
    ScriptClassifier,
    VisionLLMTranscriber,
    ScriptRouter,
    apply_bidi_paragraph_formatting,
    apply_bidi_run_formatting,
    set_cell_box_borders,
    create_urdu_container_table,
)


# ==============================================================================
# Synthetic Fixtures & Generators
# ==============================================================================

def make_synthetic_page(
    width: int = 1200,
    height: int = 1600,
    containers: List[Tuple[int, int, int, int, bool, bool]] = None,
    body_text_blocks: List[Tuple[int, int, int, int]] = None,
) -> Tuple[PreprocessedPage, np.ndarray]:
    """
    Constructs a synthetic PreprocessedPage and text_mask.
    containers: list of (x, y, w, h, has_dividers, is_urdu)
    body_text_blocks: list of (x, y, w, h) representing surrounding body text ink.
    """
    rgb = Image.new("RGB", (width, height), (255, 255, 255))
    clahe_gray = np.ones((height, width), dtype=np.uint8) * 255
    binary_img = np.ones((height, width), dtype=np.uint8) * 255
    text_mask = np.zeros((height, width), dtype=np.uint8)

    draw = ImageDraw.Draw(rgb)

    if body_text_blocks:
        for (tx, ty, tw, th) in body_text_blocks:
            draw.rectangle([tx, ty, tx + tw, ty + th], fill=(20, 20, 20))
            binary_img[ty : ty + th, tx : tx + tw] = 0
            clahe_gray[ty : ty + th, tx : tx + tw] = 30
            text_mask[ty : ty + th, tx : tx + tw] = 255

    if containers:
        for (bx, by, bw, bh, has_dividers, is_urdu) in containers:
            border_thick = 4
            # Draw outer box border
            draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=border_thick)
            for t in range(border_thick):
                binary_img[by + t, bx : bx + bw] = 0
                binary_img[by + bh - 1 - t, bx : bx + bw] = 0
                binary_img[by : by + bh, bx + t] = 0
                binary_img[by : by + bh, bx + bw - 1 - t] = 0
                text_mask[by : by + bh, bx : bx + bw] = 255

            if has_dividers:
                mid_y = by + bh // 2
                draw.line([bx, mid_y, bx + bw, mid_y], fill=(0, 0, 0), width=border_thick)
                for t in range(border_thick):
                    binary_img[mid_y + t, bx : bx + bw] = 0

            # Fill interior ink
            if is_urdu:
                # Nuqta dots and wide ligatures
                for iy in range(by + 40, by + bh - 40, 35):
                    binary_img[iy : iy + 4, bx + 40 : bx + 280] = 0
                    clahe_gray[iy : iy + 4, bx + 40 : bx + 280] = 30
                    for dot_x in [bx + 80, bx + 140, bx + 200, bx + 260]:
                        binary_img[iy - 12 : iy - 8, dot_x : dot_x + 5] = 0
                        clahe_gray[iy - 12 : iy - 8, dot_x : dot_x + 5] = 30
            else:
                # Latin text vertical stems
                for iy in range(by + 40, by + bh - 40, 35):
                    for ix in range(bx + 40, bx + 280, 20):
                        binary_img[iy : iy + 20, ix : ix + 5] = 0
                        clahe_gray[iy : iy + 20, ix : ix + 5] = 30

    page = PreprocessedPage(
        page_number=1,
        rgb_image=rgb,
        clahe_gray=clahe_gray,
        binary_image=binary_img,
        skew_angle=0.0,
        dpi=300,
        width=width,
        height=height,
    )
    return page, text_mask


def deterministic_urdu_transcriber(crop: Image.Image) -> str:
    """Deterministic offline mock transcriber for Urdu instructions."""
    return (
        "1. امتحانی مرکز میں اصل شناختی کارڈ لانا لازمی ہے۔\n"
        "2. امتحانی ہال میں موبائل فون کا استعمال منع ہے۔\n"
        "3. تمام طلبہ و طالبات بروقت تشریف لائیں۔"
    )


# ==============================================================================
# Requirement 1: Single-Cell Container Detection
# ==============================================================================

class TestSingleCellContainerDetection:
    """Stress tests single-cell bordered callout container detection."""

    def test_synthetic_boxed_callout_detection(self):
        """Verify single-cell container detection on a synthetic boxed callout document."""
        box = (200, 1000, 800, 350, False, True)
        page, mask = make_synthetic_page(containers=[box])
        router = ScriptRouter(transcriber_fn=deterministic_urdu_transcriber)
        containers = router.detect_single_cell_containers(page, mask)

        assert len(containers) == 1, f"Expected 1 container, got {len(containers)}"
        c = containers[0]
        bx, by, bw, bh = c.bbox
        assert abs(bx - 200) <= 15
        assert abs(by - 1000) <= 15
        assert abs(bw - 800) <= 20
        assert abs(bh - 350) <= 20
        assert c.is_urdu is True
        assert c.confidence >= 0.90

    def test_multiple_callout_boxes_sorted_reading_order(self):
        """Verify that multiple callout containers are detected and sorted top-to-bottom."""
        box1 = (200, 400, 700, 200, False, True)
        box2 = (200, 1100, 700, 250, False, True)
        page, mask = make_synthetic_page(containers=[box2, box1])  # added out of order
        router = ScriptRouter(transcriber_fn=deterministic_urdu_transcriber)
        containers = router.detect_single_cell_containers(page, mask)

        assert len(containers) == 2, f"Expected 2 containers, got {len(containers)}"
        assert containers[0].bbox[1] < containers[1].bbox[1], "Containers must be sorted top-to-bottom"
        assert abs(containers[0].bbox[1] - 400) <= 20
        assert abs(containers[1].bbox[1] - 1100) <= 20

    def test_multi_row_table_rejected(self):
        """Verify that containers with internal horizontal dividers (tables) are rejected."""
        table_box = (150, 600, 900, 400, True, True)  # has_dividers=True
        page, mask = make_synthetic_page(containers=[table_box])
        router = ScriptRouter(transcriber_fn=deterministic_urdu_transcriber)
        containers = router.detect_single_cell_containers(page, mask)

        assert len(containers) == 0, "Containers with internal dividers must NOT be detected as single-cell"

    def test_sub_threshold_boxes_rejected(self):
        """Verify small noise boxes below minimum dimension thresholds are rejected."""
        small_box = (100, 100, 100, 30, False, False)  # bw=100 < 1200*0.15=180
        page, mask = make_synthetic_page(containers=[small_box])
        router = ScriptRouter(transcriber_fn=deterministic_urdu_transcriber)
        containers = router.detect_single_cell_containers(page, mask)

        assert len(containers) == 0, "Sub-threshold noise boxes must be rejected"


# ==============================================================================
# Requirement 2: Container Masking Zero Leakage (2px padding, 0.0% leakage)
# ==============================================================================

class TestContainerMaskingZeroLeakage:
    """Stress tests container masking zero-leakage invariant."""

    def test_container_extraction_zero_leakage_with_padding(self):
        """
        Verify that container extraction completely zeroes out the container area
        in text_mask with 2px padding (0.0% text leakage into body text).
        """
        bx, by, bw, bh = 200, 1000, 800, 350
        box = (bx, by, bw, bh, False, True)
        # Add external body text nearby (5px above and 5px below)
        body_above = (200, by - 40, 400, 25)
        body_below = (200, by + bh + 15, 400, 25)

        page, text_mask = make_synthetic_page(
            containers=[box], body_text_blocks=[body_above, body_below]
        )
        router = ScriptRouter(transcriber_fn=deterministic_urdu_transcriber)
        containers = router.detect_single_cell_containers(page, text_mask)
        assert len(containers) == 1

        lines, updated_mask = router.extract_and_route_containers(page, text_mask, containers)

        # 1. Container area must be 100% zeroed out (0.0% text leakage)
        cbx, cby, cbw, cbh = containers[0].bbox
        container_core_pixels = updated_mask[cby : cby + cbh, cbx : cbx + cbw]
        assert np.sum(container_core_pixels) == 0, "Text leakage detected inside container bounding box!"

        # 2. Check 2px padding zone around the container is also zeroed out
        pad = 2
        padded_region = updated_mask[
            max(0, cby - pad) : min(page.height, cby + cbh + pad),
            max(0, cbx - pad) : min(page.width, cbx + cbw + pad),
        ]
        assert np.sum(padded_region) == 0, "Text leakage detected in 2px padding perimeter!"

        # 3. External body text outside the 2px padding must be completely preserved
        tax, tay, taw, tah = body_above
        assert np.sum(updated_mask[tay : tay + tah, tax : tax + taw]) > 0, "External body text above was accidentally erased!"

        tbx, tby, tbw, tbh = body_below
        assert np.sum(updated_mask[tby : tby + tbh, tbx : tbx + tbw]) > 0, "External body text below was accidentally erased!"

    def test_original_text_mask_immutability(self):
        """Verify that the original input text_mask is not mutated in-place."""
        box = (200, 1000, 800, 350, False, True)
        page, text_mask = make_synthetic_page(containers=[box])
        original_sum = np.sum(text_mask)
        router = ScriptRouter(transcriber_fn=deterministic_urdu_transcriber)
        containers = router.detect_single_cell_containers(page, text_mask)

        _, updated_mask = router.extract_and_route_containers(page, text_mask, containers)
        assert np.sum(text_mask) == original_sum, "Input text_mask must not be mutated in-place"
        assert np.sum(updated_mask) < original_sum, "Updated mask must have zeroed out container ink"


# ==============================================================================
# Requirement 3: Script Classification (Unicode & Visual Cursive Ligatures)
# ==============================================================================

class TestScriptClassification:
    """Stress tests script classification: Latin vs Urdu Nastaliq."""

    def test_arabic_urdu_unicode_strings(self):
        """Verify correctly identifies Arabic/Urdu Unicode strings across various codepoint ranges."""
        classifier = ScriptClassifier()
        urdu_samples = [
            "امتحانی ہدایات برائے طلبہ و طالبات",
            "1. اصل قومی شناختی کارڈ ہمراہ لانا ضروری ہے۔",
            "علامہ اقبال اوپن یونیورسٹی اسلام آباد",
            "رول نمبر: 0000629245",
            "ﮎ ﮏ ﮐ ﮑ ﮪ ﮫ ﮬ ﮭ",  # Presentation forms
        ]
        for sample in urdu_samples:
            assert classifier.is_urdu_unicode(sample) is True, f"Failed to identify Urdu Unicode: {sample}"
            assert classifier.classify(np.zeros((0, 0), dtype=np.uint8), text_hint=sample) == "urdu_nastaliq"

    def test_latin_strings_rejected(self):
        """Verify correctly rejects pure Latin text."""
        classifier = ScriptClassifier()
        latin_samples = [
            "ALLAMA IQBAL OPEN UNIVERSITY",
            "ADMIT CARD 2026 SPRING",
            "NAME: SYED ZOHAIB HASSAN SHAH",
            "FATHER NAME: ABDUL RAZZAQ SHAH",
            "1234567890",
            "Roll No: 12345 - Semester: Spring",
            "",
            "   ",
            "--- === *** +++",
        ]
        for sample in latin_samples:
            assert classifier.is_urdu_unicode(sample) is False, f"Erroneously classified Latin as Urdu: {sample}"
            assert classifier.classify(np.zeros((0, 0), dtype=np.uint8), text_hint=sample) == "latin"

    def test_visual_cursive_ligature_crop(self):
        """Verify contour topology identifies visual cursive ligature crops with nuqta dots."""
        classifier = ScriptClassifier()
        roi = np.zeros((150, 400), dtype=np.uint8)
        # Elongated ligatures (bw/bh >= 2.0, area > 80)
        roi[50:56, 40:220] = 255
        roi[100:106, 60:250] = 255
        # Detached nuqta dots (area <= 75, aspect ratio 0.4 - 2.5)
        for x in [80, 130, 180, 220, 260, 300]:
            roi[30:36, x : x + 6] = 255

        assert classifier.is_urdu_contour_topology(roi) is True
        assert classifier.classify(roi, text_hint="") == "urdu_nastaliq"

    def test_visual_latin_crop_rejected(self):
        """Verify contour topology rejects Latin block text without nuqta dots."""
        classifier = ScriptClassifier()
        roi = np.zeros((150, 400), dtype=np.uint8)
        # Latin vertical stems
        for x in range(30, 360, 25):
            roi[30:80, x : x + 8] = 255

        assert classifier.is_urdu_contour_topology(roi) is False
        assert classifier.classify(roi, text_hint="") == "latin"

    def test_degenerate_roi_gracefully_handled(self):
        """Verify empty or degenerate ROIs return False without crashing."""
        classifier = ScriptClassifier()
        assert classifier.is_urdu_contour_topology(None) is False
        assert classifier.is_urdu_contour_topology(np.zeros((0, 0), dtype=np.uint8)) is False
        assert classifier.is_urdu_contour_topology(np.zeros((10, 10), dtype=np.uint8)) is False


# ==============================================================================
# Requirement 4: Vision-LLM API Key Guard (R1, R6)
# ==============================================================================

class TestVisionLLMKeyGuard:
    """Stress tests Vision-LLM API key guard and Latin bypass."""

    def test_missing_or_empty_api_key_raises_value_error(self):
        """Verify raises ValueError if VISION_API_KEY is missing or empty when Urdu is encountered."""
        for invalid_key in [None, "", "   "]:
            transcriber = VisionLLMTranscriber(api_key=None)
            transcriber.api_key = invalid_key
            test_img = Image.new("RGB", (100, 100), (255, 255, 255))
            with pytest.raises(ValueError, match="VISION_API_KEY is missing or empty"):
                transcriber.transcribe(test_img)

    def test_mock_key_raises_guard_error(self):
        """Verify MOCK_KEY raises explicit guard error per R1/R6."""
        transcriber = VisionLLMTranscriber(api_key="MOCK_KEY")
        test_img = Image.new("RGB", (100, 100), (255, 255, 255))
        with pytest.raises(ValueError, match="VISION_API_KEY is missing or empty"):
            transcriber.transcribe(test_img)

    def test_pure_latin_documents_succeed_without_api_key(self):
        """Verify pure Latin documents succeed without VISION_API_KEY."""
        router = ScriptRouter(api_key=None)
        crop = Image.new("RGB", (300, 50), (255, 255, 255))
        # Route a Latin text block
        fline = router.route_line_or_block(
            text="NAME: SYED ZOHAIB HASSAN SHAH",
            crop_image=crop,
            bbox=(100, 100, 400, 30),
            is_container=False,
        )
        assert fline.language_script == "latin"
        assert fline.alignment == "left"
        assert fline.urdu_container is False
        assert fline.text == "NAME: SYED ZOHAIB HASSAN SHAH"

    def test_verbatim_prompt_contract(self):
        """Verify Vision-LLM prompt contract matches verbatim specification."""
        expected = (
            "Transcribe exactly, Urdu RTL, no translation, no commentary. "
            "Output only the transcribed Urdu lines. Preserve all numbering (1, 2, 3...) exactly as shown."
        )
        assert VisionLLMTranscriber.DEFAULT_PROMPT == expected


# ==============================================================================
# Requirement 5: OpenXML BiDi Typography & Nastaliq Font Bindings
# ==============================================================================

class TestOpenXMLBiDiTypography:
    """Stress tests OpenXML BiDi typography tags, font bindings, and container tables."""

    def test_apply_bidi_paragraph_formatting_xml(self):
        """Verify <w:bidi/> and right alignment XML generation."""
        doc = docx.Document()
        p = doc.add_paragraph()
        apply_bidi_paragraph_formatting(p)

        xml = p._p.xml
        assert "<w:bidi" in xml, "Missing <w:bidi/> tag in paragraph properties!"
        assert 'w:val="1"' in xml or "w:bidi/>" in xml
        assert ('w:jc w:val="right"' in xml) or ('w:val="right"' in xml), "Missing right alignment XML!"
        assert p.alignment == docx.enum.text.WD_ALIGN_PARAGRAPH.RIGHT

    def test_apply_bidi_run_formatting_xml(self):
        """Verify <w:rtl/>, Jameel Noori Nastaleeq, and Noto Nastaliq Urdu font bindings."""
        doc = docx.Document()
        p = doc.add_paragraph()
        run = p.add_run("امتحانی ہدایات")
        apply_bidi_run_formatting(
            run,
            font_cs="Jameel Noori Nastaleeq",
            font_ascii="Noto Nastaliq Urdu",
            font_size_pt=11.0,
            is_bold=True,
        )

        xml = run._r.xml
        assert "<w:rtl" in xml, "Missing <w:rtl/> tag in run properties!"
        assert 'w:cs="Jameel Noori Nastaleeq"' in xml, "Missing Jameel Noori Nastaleeq complex script binding!"
        assert 'w:ascii="Noto Nastaliq Urdu"' in xml, "Missing Noto Nastaliq Urdu ascii font binding!"
        assert 'w:hAnsi="Noto Nastaliq Urdu"' in xml, "Missing Noto Nastaliq Urdu hAnsi font binding!"
        assert 'w:sz w:val="22"' in xml, "Expected font size 22 half-points (11 pt)!"
        assert 'w:szCs w:val="22"' in xml, "Expected complex script font size 22 half-points!"
        assert "<w:b" in xml, "Missing bold tag <w:b/>!"
        assert "<w:bCs" in xml, "Missing complex script bold tag <w:bCs/>!"

    def test_set_cell_box_borders_xml(self):
        """Verify solid 4-sided cell borders in <w:tcBorders>."""
        doc = docx.Document()
        tbl = doc.add_table(rows=1, cols=1)
        cell = tbl.cell(0, 0)
        set_cell_box_borders(cell, color="000000", sz="8")

        xml = cell._tc.xml
        assert "<w:tcBorders>" in xml
        assert 'w:top w:val="single"' in xml
        assert 'w:bottom w:val="single"' in xml
        assert 'w:left w:val="single"' in xml
        assert 'w:right w:val="single"' in xml

    def test_create_urdu_container_table_structure(self):
        """Verify create_urdu_container_table constructs 1x1 table with BiDi Nastaliq typography."""
        doc = docx.Document()
        lines = [
            FormattedLine(
                text="1. امتحانی مرکز میں اصل شناختی کارڈ لانا لازمی ہے۔",
                bbox=(200, 1000, 800, 40),
                font_size_pt=11.0,
                is_bold=False,
                alignment="right",
                is_key_value=False,
                language_script="urdu_nastaliq",
                urdu_container=True,
            ),
            FormattedLine(
                text="2. امتحانی ہال میں موبائل فون کا استعمال منع ہے۔",
                bbox=(200, 1040, 800, 40),
                font_size_pt=11.0,
                is_bold=False,
                alignment="right",
                is_key_value=False,
                language_script="urdu_nastaliq",
                urdu_container=True,
            ),
        ]
        table = create_urdu_container_table(doc, lines)

        # 1. Structural assertions
        assert len(table.rows) == 1, "Must be single-row table"
        assert len(table.columns) == 1, "Must be single-column table"
        assert table.style.name == "Table Grid"

        # 2. Content assertions
        cell = table.cell(0, 0)
        assert len(cell.paragraphs) == 2, "Must contain exactly 2 paragraphs for 2 lines"

        for p in cell.paragraphs:
            p_xml = p._p.xml
            assert "<w:bidi" in p_xml
            assert ('w:jc w:val="right"' in p_xml) or ('w:val="right"' in p_xml)

            r_xml = p.runs[0]._r.xml
            assert "<w:rtl" in r_xml
            assert 'w:cs="Jameel Noori Nastaleeq"' in r_xml
            assert 'w:ascii="Noto Nastaliq Urdu"' in r_xml


# ==============================================================================
# Anti-Hardcoding Audit
# ==============================================================================

class TestAntiHardcodingAudit:
    """Verifies that pipeline/script_router.py contains zero hardcoded student entities."""

    def test_zero_hardcoded_entities(self):
        router_file = Path(__file__).parent.parent / "pipeline" / "script_router.py"
        assert router_file.exists()
        content = router_file.read_text(encoding="utf-8")

        forbidden_patterns = [
            r"ALLAMA IQBAL",
            r"0000629245",
            r"SYED ZOHAIB",
            r"ABDUL RAZZAQ",
            r"AIOU-\s*464",
            r"SHP-SH:11",
        ]
        for pat in forbidden_patterns:
            assert not re.search(pat, content, re.IGNORECASE), f"Forbidden hardcoded pattern '{pat}' detected in script_router.py!"
