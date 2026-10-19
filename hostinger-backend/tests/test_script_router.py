"""
Unit Test Suite for Language Script Routing, Urdu Nastaliq & BiDi Typography (Requirement R6).
Conforms to PROJECT.md § Interface Contracts § 4 and Milestone M3.

Tests:
1. ScriptClassifier: pure Latin string classified as 'latin'.
2. ScriptClassifier: Urdu Arabic Unicode string classified as 'urdu_nastaliq'.
3. ScriptClassifier: bilingual digits in Urdu instruction line classified as 'urdu_nastaliq'.
4. ScriptClassifier: contour topology classifies synthetic cursive strokes with dots as 'urdu_nastaliq'.
5. ScriptClassifier: contour topology classifies Latin block text as 'latin'.
6. SingleCellContainer detection: detects closed 1x1 rectangular outer box on synthetic page.
7. SingleCellContainer detection: rejects grid with internal divider lines.
8. SingleCellContainer masking: zeroes out container bbox in text_mask with padding.
9. VisionLLMTranscriber: resolves API key from explicit arg, env, or .env.
10. VisionLLMTranscriber: missing or empty API key raises ValueError for Urdu block per R1/R6.
11. VisionLLMTranscriber: MOCK_KEY raises guard error.
12. VisionLLMTranscriber: prompt contract matches verbatim specification.
13. ScriptRouter: mock transcriber injection (transcriber_fn) executes offline deterministically.
14. ScriptRouter: pure English document bypasses Vision-LLM and succeeds without API key.
15. ScriptRouter: transcribed Urdu lines assigned alignment='right', script='urdu_nastaliq', urdu_container=True.
16. ScriptRouter: numbered instruction items (1., 2., 3.) parsed into distinct FormattedLine entries.
17. OpenXML BiDi helpers: apply_bidi_paragraph_formatting adds w:bidi and right alignment.
18. OpenXML BiDi helpers: apply_bidi_run_formatting binds Jameel Noori Nastaleeq and Noto Nastaliq Urdu with w:rtl.
19. OpenXML BiDi helpers: set_cell_box_borders applies solid borders.
20. ScriptRouter: route_line_or_block handles individual line script routing.
21. Zero forbidden strings present in pipeline/script_router.py.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from unittest.mock import patch, MagicMock
import numpy as np
import pytest
from PIL import Image, ImageDraw
import docx

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
# Synthetic Fixture Helpers
# ==============================================================================

def create_synthetic_page_with_box(
    width: int = 1200,
    height: int = 1600,
    box_rect: tuple[int, int, int, int] = (200, 1000, 800, 350),
    has_internal_dividers: bool = False,
    is_urdu_inside: bool = True,
) -> tuple[PreprocessedPage, np.ndarray]:
    """
    Creates a PreprocessedPage and text_mask containing a rectangular box.
    """
    rgb = Image.new("RGB", (width, height), (255, 255, 255))
    clahe_gray = np.ones((height, width), dtype=np.uint8) * 255
    binary_img = np.ones((height, width), dtype=np.uint8) * 255
    text_mask = np.zeros((height, width), dtype=np.uint8)

    draw = ImageDraw.Draw(rgb)
    bx, by, bw, bh = box_rect

    # Draw solid border on binary_image (0 = ink, 255 = paper) and rgb
    border_thick = 4
    for t in range(border_thick):
        binary_img[by + t, bx : bx + bw] = 0
        binary_img[by + bh - 1 - t, bx : bx + bw] = 0
        binary_img[by : by + bh, bx + t] = 0
        binary_img[by : by + bh, bx + bw - 1 - t] = 0
        text_mask[by : by + bh, bx : bx + bw] = 255

    draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=border_thick)

    # Optional internal divider (making it a 2-cell table instead of a single-cell container)
    if has_internal_dividers:
        mid_y = by + bh // 2
        for t in range(border_thick):
            binary_img[mid_y + t, bx : bx + bw] = 0

    # Draw synthetic ink inside
    if is_urdu_inside:
        # Draw small nuqta dots and wide horizontal ligatures
        for iy in range(by + 50, by + bh - 50, 40):
            # Wide ligature
            binary_img[iy : iy + 5, bx + 50 : bx + 300] = 0
            clahe_gray[iy : iy + 5, bx + 50 : bx + 300] = 30
            # Nuqta dots (area < 60)
            binary_img[iy - 15 : iy - 10, bx + 100 : bx + 106] = 0
            binary_img[iy - 15 : iy - 10, bx + 180 : bx + 186] = 0
            binary_img[iy - 15 : iy - 10, bx + 240 : bx + 246] = 0
            clahe_gray[iy - 15 : iy - 10, bx + 100 : bx + 106] = 30
    else:
        # Draw standard Latin vertical strokes (low dot ratio)
        for iy in range(by + 50, by + bh - 50, 40):
            for ix in range(bx + 50, bx + 300, 25):
                binary_img[iy : iy + 25, ix : ix + 6] = 0
                clahe_gray[iy : iy + 25, ix : ix + 6] = 30

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


def mock_urdu_transcriber(crop: Image.Image) -> str:
    """Mock deterministic transcriber returning multi-line numbered Urdu."""
    return (
        "1. امتحانی مرکز میں اصل شناختی کارڈ لانا لازمی ہے۔\n"
        "2. امتحانی ہال میں موبائل فون کا استعمال منع ہے۔\n"
        "3. تمام طلبہ و طالبات بروقت تشریف لائیں۔"
    )


# ==============================================================================
# Test Cases: Script Classifier
# ==============================================================================

def test_classify_pure_latin_script():
    """T1: Pure Latin text string is classified as 'latin'."""
    classifier = ScriptClassifier()
    assert classifier.classify(np.zeros((0, 0), dtype=np.uint8), text_hint="OFFICIAL EXAMINATION CARD") == "latin"
    assert classifier.classify(np.zeros((0, 0), dtype=np.uint8), text_hint="Candidate Name: John Doe") == "latin"


def test_classify_urdu_nastaliq_unicode():
    """T2: Urdu Arabic Unicode codepoints classified as 'urdu_nastaliq'."""
    classifier = ScriptClassifier()
    text = "امتحانی ہدایات برائے طلبہ"
    assert classifier.classify(np.zeros((0, 0), dtype=np.uint8), text_hint=text) == "urdu_nastaliq"


def test_classify_bilingual_digits_in_urdu():
    """T3: Bilingual numbered instruction line classified as 'urdu_nastaliq'."""
    classifier = ScriptClassifier()
    text = "1. اصل قومی شناختی کارڈ ہمراہ لانا ضروری ہے۔"
    assert classifier.classify(np.zeros((0, 0), dtype=np.uint8), text_hint=text) == "urdu_nastaliq"


def test_classify_urdu_nastaliq_contour_topology():
    """T4: Binary ROI with high nuqta dot ratio & ligatures classified as 'urdu_nastaliq'."""
    classifier = ScriptClassifier()
    # Create synthetic binary ROI with dots and ligatures
    roi = np.zeros((150, 400), dtype=np.uint8)
    # 2 wide ligatures
    roi[50:56, 40:220] = 255
    roi[100:106, 60:250] = 255
    # 6 detached nuqta dots (5x5 square)
    for x in [80, 130, 180, 220, 260, 300]:
        roi[30:36, x : x + 6] = 255

    assert classifier.is_urdu_contour_topology(roi) is True
    assert classifier.classify(roi, text_hint="") == "urdu_nastaliq"


def test_classify_latin_contour_topology_rejected():
    """T5: Binary ROI with tall vertical stems and no dots classified as 'latin'."""
    classifier = ScriptClassifier()
    # Stems without dots
    roi = np.zeros((150, 400), dtype=np.uint8)
    for x in range(30, 350, 30):
        roi[30:80, x : x + 8] = 255

    assert classifier.is_urdu_contour_topology(roi) is False
    assert classifier.classify(roi, text_hint="") == "latin"


# ==============================================================================
# Test Cases: Single-Cell Container Detection & Masking
# ==============================================================================

def test_detect_single_cell_container():
    """T6: Closed 1x1 rectangular outer box detected as SingleCellContainer."""
    page, text_mask = create_synthetic_page_with_box(
        box_rect=(200, 1000, 800, 350), has_internal_dividers=False, is_urdu_inside=True
    )
    router = ScriptRouter(transcriber_fn=mock_urdu_transcriber)
    containers = router.detect_single_cell_containers(page, text_mask)

    assert len(containers) >= 1
    c = containers[0]
    bx, by, bw, bh = c.bbox
    assert abs(bx - 200) < 15
    assert abs(by - 1000) < 15
    assert abs(bw - 800) < 20
    assert abs(bh - 350) < 20
    assert c.is_urdu is True


def test_reject_container_with_internal_dividers():
    """T7: Boxes with internal dividers are rejected (handled by table extractor)."""
    page, text_mask = create_synthetic_page_with_box(
        box_rect=(200, 1000, 800, 350), has_internal_dividers=True, is_urdu_inside=True
    )
    router = ScriptRouter(transcriber_fn=mock_urdu_transcriber)
    containers = router.detect_single_cell_containers(page, text_mask)

    # Internal divider disqualifies it from single-cell callout container
    assert len(containers) == 0


def test_single_cell_container_masking_prevents_body_duplicate():
    """T8: extract_and_route_containers zeroes out container in text_mask with padding."""
    page, text_mask = create_synthetic_page_with_box(
        box_rect=(200, 1000, 800, 350), has_internal_dividers=False, is_urdu_inside=True
    )
    router = ScriptRouter(transcriber_fn=mock_urdu_transcriber)
    containers = router.detect_single_cell_containers(page, text_mask)

    lines, updated_mask = router.extract_and_route_containers(page, text_mask, containers)

    # 1. Output lines must contain transcribed Urdu
    assert len(lines) == 3
    assert all(l.urdu_container is True for l in lines)
    assert all(l.language_script == "urdu_nastaliq" for l in lines)
    assert all(l.alignment == "right" for l in lines)

    # 2. Container area in updated_mask must be completely zeroed out
    bx, by, bw, bh = containers[0].bbox
    container_region_ink = updated_mask[by : by + bh, bx : bx + bw]
    assert np.sum(container_region_ink) == 0


# ==============================================================================
# Test Cases: Vision-LLM API Key Guard & Prompt Contract
# ==============================================================================

def test_vision_llm_api_key_resolution():
    """T9: Resolves API key from explicit parameter or environment."""
    key = VisionLLMTranscriber.resolve_api_key("EXPLICIT_KEY_123")
    assert key == "EXPLICIT_KEY_123"

    with patch.dict(os.environ, {"VISION_API_KEY": "ENV_KEY_456"}):
        key = VisionLLMTranscriber.resolve_api_key(None)
        assert key == "ENV_KEY_456"


def test_vision_llm_missing_key_raises_error():
    """T10: Missing or empty API key raises ValueError when Urdu block is encountered."""
    transcriber = VisionLLMTranscriber(api_key=None)
    transcriber.api_key = None

    test_img = Image.new("RGB", (100, 100), (255, 255, 255))
    with pytest.raises(ValueError, match="VISION_API_KEY is missing or empty"):
        transcriber.transcribe(test_img)


def test_vision_llm_mock_key_raises_guard_error():
    """T11: MOCK_KEY raises explicit guard error."""
    transcriber = VisionLLMTranscriber(api_key="MOCK_KEY")
    test_img = Image.new("RGB", (100, 100), (255, 255, 255))
    with pytest.raises(ValueError, match="VISION_API_KEY is missing or empty"):
        transcriber.transcribe(test_img)


def test_vision_llm_prompt_contract():
    """T12: Exact prompt matches verbatim contract."""
    expected_prompt = (
        "Transcribe exactly, Urdu RTL, no translation, no commentary. "
        "Output only the transcribed Urdu lines. Preserve all numbering (1, 2, 3...) exactly as shown."
    )
    assert VisionLLMTranscriber.DEFAULT_PROMPT == expected_prompt


# ==============================================================================
# Test Cases: Script Routing & Pluggable Transcriber
# ==============================================================================

def test_script_router_mock_transcriber_injection():
    """T13: Injected transcriber_fn processes Urdu crops offline deterministically."""
    router = ScriptRouter(transcriber_fn=mock_urdu_transcriber)
    test_crop = Image.new("RGB", (400, 150), (255, 255, 255))
    draw = ImageDraw.Draw(test_crop)
    # Draw wide cursive ligatures and nuqta dots
    draw.rectangle([40, 50, 220, 56], fill=(0, 0, 0))
    draw.rectangle([60, 100, 250, 106], fill=(0, 0, 0))
    for x in [80, 130, 180, 220, 260, 300]:
        draw.rectangle([x, 30, x + 6, 36], fill=(0, 0, 0))

    fline = router.route_line_or_block(
        text="", crop_image=test_crop, bbox=(100, 500, 400, 100), is_container=True
    )
    assert fline is not None
    assert fline.language_script == "urdu_nastaliq"
    assert fline.alignment == "right"
    assert fline.urdu_container is True
    assert "امتحانی" in fline.text


def test_latin_document_bypasses_api_key():
    """T14: Pure Latin block never triggers Vision-LLM API or requires key."""
    router = ScriptRouter(api_key=None)
    crop = Image.new("RGB", (200, 40), (255, 255, 255))
    fline = router.route_line_or_block(
        text="UNIVERSITY ADMISSION FORM",
        crop_image=crop,
        bbox=(100, 100, 300, 30),
        is_container=False,
    )
    assert fline.language_script == "latin"
    assert fline.alignment == "left"
    assert fline.urdu_container is False


def test_urdu_lines_assigned_right_alignment():
    """T15: Routed Urdu container lines receive right alignment and proper metadata."""
    page, text_mask = create_synthetic_page_with_box(is_urdu_inside=True)
    router = ScriptRouter(transcriber_fn=mock_urdu_transcriber)
    containers = router.detect_single_cell_containers(page, text_mask)
    lines, _ = router.extract_and_route_containers(page, text_mask, containers)

    assert len(lines) > 0
    for l in lines:
        assert l.alignment == "right"
        assert l.language_script == "urdu_nastaliq"
        assert l.urdu_container is True


def test_numbered_instruction_items_parsed():
    """T16: Numbered lines (1., 2., 3.) parsed into distinct FormattedLine items."""
    page, text_mask = create_synthetic_page_with_box(is_urdu_inside=True)
    router = ScriptRouter(transcriber_fn=mock_urdu_transcriber)
    containers = router.detect_single_cell_containers(page, text_mask)
    lines, _ = router.extract_and_route_containers(page, text_mask, containers)

    assert len(lines) == 3
    assert lines[0].text.startswith("1.")
    assert lines[1].text.startswith("2.")
    assert lines[2].text.startswith("3.")


# ==============================================================================
# Test Cases: OpenXML BiDi Typography Helpers
# ==============================================================================

def test_openxml_bidi_paragraph_formatting():
    """T17: apply_bidi_paragraph_formatting inserts w:bidi and right alignment."""
    doc = docx.Document()
    p = doc.add_paragraph()
    apply_bidi_paragraph_formatting(p)

    xml = p._p.xml
    assert ("<w:bidi" in xml) or ("w:bidi/>" in xml)
    assert ('w:jc w:val="right"' in xml) or ('w:val="right"' in xml)


def test_openxml_bidi_run_formatting():
    """T18: apply_bidi_run_formatting inserts w:rtl, Jameel Noori Nastaleeq, and Noto Nastaliq Urdu."""
    doc = docx.Document()
    p = doc.add_paragraph()
    run = p.add_run("امتحانی ہدایات")
    apply_bidi_run_formatting(
        run,
        font_cs="Jameel Noori Nastaleeq",
        font_ascii="Noto Nastaliq Urdu",
        font_size_pt=12.0,
        is_bold=True,
    )

    xml = run._r.xml
    assert ("<w:rtl" in xml) or ("w:rtl/>" in xml)
    assert 'w:cs="Jameel Noori Nastaleeq"' in xml
    assert 'w:ascii="Noto Nastaliq Urdu"' in xml
    assert ('<w:b/>' in xml) or ('<w:b ' in xml)
    assert 'w:sz w:val="24"' in xml


def test_set_cell_box_borders():
    """T19: set_cell_box_borders creates w:tcBorders with solid borders on all 4 sides."""
    doc = docx.Document()
    table = doc.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    set_cell_box_borders(cell, color="000000", sz="8")

    xml = cell._tc.xml
    assert "<w:tcBorders>" in xml
    assert 'w:top w:val="single"' in xml
    assert 'w:bottom w:val="single"' in xml
    assert 'w:left w:val="single"' in xml
    assert 'w:right w:val="single"' in xml


def test_create_urdu_container_table():
    """T20: create_urdu_container_table constructs 1x1 table with BiDi formatting."""
    doc = docx.Document()
    lines = [
        FormattedLine(
            text="1. امتحانی ہدایات",
            bbox=(200, 1000, 800, 50),
            font_size_pt=11.0,
            is_bold=False,
            alignment="right",
            is_key_value=False,
            language_script="urdu_nastaliq",
            urdu_container=True,
        )
    ]
    tbl = create_urdu_container_table(doc, lines)
    assert len(tbl.rows) == 1
    assert len(tbl.columns) == 1

    cell = tbl.cell(0, 0)
    p = cell.paragraphs[0]
    assert "<w:bidi" in p._p.xml
    assert "Jameel Noori Nastaleeq" in p.runs[0]._r.xml


def test_zero_forbidden_strings_in_script_router():
    """T21: Pipeline script router contains zero forbidden strings from anti-hardcoding audit."""
    router_file = Path(__file__).parent.parent / "pipeline" / "script_router.py"
    assert router_file.exists()

    content = router_file.read_text(encoding="utf-8")
    forbidden = [
        r"ALLAMA IQBAL",
        r"0000629245",
        r"SYED ZOHAIB",
        r"ABDUL RAZZAQ",
        r"AIOU-\s*464",
        r"SHP-SH:11",
    ]
    for pat in forbidden:
        assert not re.search(pat, content, re.IGNORECASE), f"Forbidden pattern '{pat}' found in script_router.py!"
