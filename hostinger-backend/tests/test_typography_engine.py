"""
Unit Test Suite for Typography Engine & Reading Order Extraction (Requirement R5).
Conforms to PROJECT.md § Interface Contracts § 4 and Milestone M3.

Tests:
1. Reading order: top-to-bottom line sequencing.
2. Reading order: left-to-right word order on horizontal baseline.
3. Vertical y-overlap clustering tolerance (>= 45%).
4. Horizontal gap splitting: centered heading and top-right date stamp.
5. Contiguous line grouping without fragmentation.
6. Empty text mask returns empty list cleanly.
7. Font size estimation: large heading glyphs (18.0 pt).
8. Font size estimation: main heading glyphs (16.0 pt).
9. Font size estimation: subheading glyphs (14.0 / 12.0 pt).
10. Font size estimation: standard body text glyphs (10.5 pt).
11. Font size estimation: small text glyphs (9.0 / 8.0 pt).
12. Font size monotonicity: taller glyphs yield >= font size.
13. Font size clamping bounds: clamped within [6.0, 72.0] pt.
14. Bold inference: heavy foreground ink density (>= 0.30) yields is_bold=True.
15. Bold inference: light foreground ink density (< 0.25) yields is_bold=False.
16. Bold inference: distance transform stroke width calculation.
17. Alignment derivation: centered heading.
18. Alignment derivation: right-aligned date stamp.
19. Alignment derivation: left-aligned body text.
20. Key-value detection: standard label-colon-value pair.
21. Key-value colon delimiter preservation.
22. Key-value numeric registration/ID field preservation.
23. Key-value compound label with parentheses and slashes.
24. Key-value negative: timestamp (e.g. 14:00) is not a form label.
25. Key-value negative: plain sentence without colon.
26. Key-value unification: trailing label merged with horizontal value.
27. Key-value vertical stacking: consecutive rows remain distinct lines.
28. Bounding box page boundary clamping.
29. Zero forbidden strings present in pipeline/typography_engine.py.
"""

from __future__ import annotations

import re
from pathlib import Path
import numpy as np
import pytest
from PIL import Image, ImageDraw

from pipeline.preprocessor import PreprocessedPage
from pipeline.typography_engine import (
    FormattedLine,
    TypographyEngine,
    TypographyAndScriptEngine,
    is_valid_key_value_label,
    is_key_value_line,
)


# ==============================================================================
# Synthetic Fixture Helpers
# ==============================================================================

def create_synthetic_page(
    width: int = 1200,
    height: int = 1600,
    dpi: int = 300,
) -> PreprocessedPage:
    """Creates a blank synthetic PreprocessedPage."""
    rgb = Image.new("RGB", (width, height), (255, 255, 255))
    clahe_gray = np.ones((height, width), dtype=np.uint8) * 255
    binary_img = np.ones((height, width), dtype=np.uint8) * 255
    return PreprocessedPage(
        page_number=1,
        rgb_image=rgb,
        clahe_gray=clahe_gray,
        binary_image=binary_img,
        skew_angle=0.0,
        dpi=dpi,
        width=width,
        height=height,
    )


def render_ink_on_page(
    page: PreprocessedPage,
    text_mask: np.ndarray,
    bbox: tuple[int, int, int, int],
    ink_density: float = 0.35,
) -> None:
    """Draws synthetic ink into binary_image, clahe_gray, and text_mask within bbox."""
    x, y, w, h = bbox
    text_mask[y : y + h, x : x + w] = 255

    # Draw dark ink on binary_image (0 = ink, 255 = paper)
    # and clahe_gray (30 = ink, 255 = paper)
    fill_h = max(1, int(h * ink_density))
    page.binary_image[y : y + fill_h, x : x + w] = 0
    page.clahe_gray[y : y + fill_h, x : x + w] = 30


def make_mock_ocr_data_fn(words_list: list[dict]):
    """Returns an ocr_data_fn callable that returns mock pytesseract image_to_data dict."""
    def _mock_fn(img: Image.Image) -> dict:
        return {
            "text": [w["text"] for w in words_list],
            "left": [w["bbox"][0] for w in words_list],
            "top": [w["bbox"][1] for w in words_list],
            "width": [w["bbox"][2] for w in words_list],
            "height": [w["bbox"][3] for w in words_list],
            "conf": [int(w.get("conf", 0.95) * 100) for w in words_list],
            "level": [5] * len(words_list),
        }
    return _mock_fn


# ==============================================================================
# Test Cases
# ==============================================================================

def test_reading_order_top_to_bottom():
    """T1: Lines positioned at Y=100, 300, 600 are sorted top-to-bottom."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "FOOTER_TEXT", "bbox": (100, 600, 150, 30)},
        {"text": "HEADER_TEXT", "bbox": (100, 100, 150, 30)},
        {"text": "BODY_TEXT", "bbox": (100, 300, 150, 30)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 3
    assert lines[0].text == "HEADER_TEXT"
    assert lines[1].text == "BODY_TEXT"
    assert lines[2].text == "FOOTER_TEXT"


def test_reading_order_left_to_right():
    """T2: Words on the same horizontal baseline are sorted left-to-right."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "THIRD", "bbox": (400, 200, 60, 25)},
        {"text": "FIRST", "bbox": (100, 200, 60, 25)},
        {"text": "SECOND", "bbox": (250, 200, 60, 25)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].text == "FIRST SECOND THIRD"


def test_vertical_y_overlap_grouping_tolerance():
    """T3: Words with slight vertical baseline jitter (overlap >= 45%) group together."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "WORD_ONE", "bbox": (100, 100, 80, 30)},
        {"text": "WORD_TWO", "bbox": (200, 106, 80, 30)},  # 24px vertical overlap (80%)
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].text == "WORD_ONE WORD_TWO"


def test_horizontal_gap_splitting_right_aligned_stamp():
    """T4: Centered heading and right date stamp on same Y-band split into 2 distinct lines."""
    page = create_synthetic_page(width=1200)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    # Centered title at x=400..600, Date stamp at x=1000..1150
    words = [
        {"text": "EXAMINATION", "bbox": (400, 100, 100, 35)},
        {"text": "CARD", "bbox": (510, 100, 80, 35)},
        {"text": "Date:", "bbox": (1000, 100, 50, 30)},
        {"text": "12-Oct-26", "bbox": (1060, 100, 90, 30)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 2
    assert lines[0].text == "EXAMINATION CARD"
    assert lines[0].alignment == "center"
    assert lines[1].text == "Date: 12-Oct-26"
    assert lines[1].alignment == "right"


def test_contiguous_line_grouping():
    """T5: Multi-word sentence grouped into single line without word drops."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    sentence = "This is a continuous official document paragraph"
    words = []
    x = 100
    for w in sentence.split():
        words.append({"text": w, "bbox": (x, 250, len(w) * 12, 28)})
        x += len(w) * 12 + 10

    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].text == sentence


def test_empty_text_mask_returns_empty_list():
    """T6: Completely zeroed text mask returns empty list without error."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    engine = TypographyEngine()
    lines = engine.analyze_page(page, text_mask)
    assert lines == []


def test_font_size_estimation_large_heading():
    """T7: Glyph height >= 54px at 300 DPI yields 18.0 pt."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "TITLE", "bbox": (300, 100, 200, 56)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].font_size_pt == 18.0


def test_font_size_estimation_main_heading():
    """T8: Glyph height ~48px at 300 DPI yields 16.0 pt."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "SUBTITLE", "bbox": (350, 150, 180, 48)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].font_size_pt == 16.0


def test_font_size_estimation_subheading():
    """T9: Glyph height ~40px at 300 DPI yields 14.0 pt."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "SECTION", "bbox": (100, 200, 140, 40)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].font_size_pt == 14.0


def test_font_size_estimation_standard_body():
    """T10: Glyph height ~31px at 300 DPI yields 10.5 pt."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "Standard", "bbox": (100, 300, 80, 31)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].font_size_pt == 10.5


def test_font_size_estimation_small_text():
    """T11: Glyph height ~26px at 300 DPI yields 9.0 pt."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "Footnote", "bbox": (100, 800, 70, 26)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].font_size_pt == 9.0


def test_font_size_monotonicity():
    """T12: Monotonicity: larger glyph height yields greater or equal font size."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "SMALL", "bbox": (100, 100, 100, 25)},
        {"text": "MEDIUM", "bbox": (100, 200, 100, 36)},
        {"text": "LARGE", "bbox": (100, 300, 100, 55)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 3
    assert lines[0].font_size_pt <= lines[1].font_size_pt
    assert lines[1].font_size_pt <= lines[2].font_size_pt


def test_font_size_clamping_bounds():
    """T13: Extreme heights (e.g. 5px or 300px) are clamped within [6.0, 72.0] pt."""
    page = create_synthetic_page(dpi=300)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "TINY", "bbox": (100, 100, 50, 8)},
        {"text": "GIANT", "bbox": (100, 300, 500, 250)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 2
    assert 6.0 <= lines[0].font_size_pt <= 72.0
    assert 6.0 <= lines[1].font_size_pt <= 72.0


def test_bold_inference_heavy_ink():
    """T14: Foreground ink density >= 0.30 yields is_bold=True."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "HEAVY_BOLD", "bbox": (100, 100, 150, 40)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"], ink_density=0.45)

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words), bold_density_threshold=0.30)
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].is_bold is True


def test_bold_inference_light_ink():
    """T15: Foreground ink density < 0.25 yields is_bold=False."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "LIGHT_REGULAR", "bbox": (100, 100, 150, 40)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"], ink_density=0.15)

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words), bold_density_threshold=0.30)
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].is_bold is False


def test_alignment_centered_heading():
    """T17: Symmetrical bbox centered horizontally yields alignment='center'."""
    page = create_synthetic_page(width=1200)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    # Centered at x=350, w=500 -> cx=600 (exact page middle)
    words = [{"text": "CENTERED HEADING", "bbox": (350, 100, 500, 45)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].alignment == "center"


def test_alignment_right_aligned_date():
    """T18: Bbox on right margin (mr <= 0.15W, x >= 0.52W) yields alignment='right'."""
    page = create_synthetic_page(width=1200)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    # Right margin: x=1020, w=120 -> mr=60 (0.05W)
    words = [{"text": "Date: 29-Sep-2026", "bbox": (1020, 80, 120, 25)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].alignment == "right"


def test_alignment_left_body():
    """T19: Text starting near left margin yields alignment='left'."""
    page = create_synthetic_page(width=1200)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "Left aligned text paragraph", "bbox": (80, 400, 400, 25)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].alignment == "left"


def test_key_value_name_field():
    """T20: Field formatted as LABEL: VALUE is flagged with is_key_value=True."""
    assert is_key_value_line("CANDIDATE NAME: JOHN DOE") is True
    assert is_key_value_line("PROGRAMME: COMPUTER SCIENCE") is True


def test_key_value_colon_delimiter_preservation():
    """T21: Key-value line preserves label and colon delimiter."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "FATHER", "bbox": (100, 200, 60, 25)},
        {"text": "NAME:", "bbox": (165, 200, 50, 25)},
        {"text": "ROBERT", "bbox": (225, 200, 60, 25)},
        {"text": "DOE", "bbox": (290, 200, 40, 25)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].is_key_value is True
    assert "FATHER NAME:" in lines[0].text
    assert "ROBERT DOE" in lines[0].text


def test_key_value_numeric_id():
    """T22: Numeric ID field keeps registration number and marks is_key_value=True."""
    assert is_key_value_line("REGISTRATION NO: 9876543210") is True
    assert is_key_value_line("ROLL NUMBER: 456789") is True


def test_key_value_compound_with_parentheses():
    """T23: Compound field name with slashes and parentheses is recognized."""
    assert is_key_value_line("PROGRAMME (GENERAL): B.S. IN ARTS") is True
    assert is_key_value_line("SEMESTER / SESSION: 2026 SPRING") is True


def test_key_value_negative_time_stamp():
    """T24: Time string like 14:00 is not marked as a key-value label."""
    assert is_key_value_line("Class time is 14:00") is False
    assert is_valid_key_value_label("14") is False


def test_key_value_negative_plain_sentence():
    """T25: Plain sentence without colon is not marked as key-value."""
    assert is_key_value_line("This is an ordinary sentence describing terms.") is False
    assert is_key_value_line("Examination instructions for all candidates") is False


def test_key_value_unification_trailing_label():
    """T26: Trailing label ending with colon is unified with horizontal value token."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    # Word 1: "NAME:" at x=100..160, y=200..230
    # Word 2: "ALEX SMITH" at x=180..300, y=202..232
    words = [
        {"text": "NAME:", "bbox": (100, 200, 60, 30)},
        {"text": "ALEX", "bbox": (180, 200, 50, 30)},
        {"text": "SMITH", "bbox": (235, 200, 65, 30)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    assert lines[0].text == "NAME: ALEX SMITH"
    assert lines[0].is_key_value is True


def test_key_value_vertical_stacking_distinct():
    """T27: Consecutive key-value rows keep distinct vertical lines."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "NAME: ALEX SMITH", "bbox": (100, 200, 200, 25)},
        {"text": "PROGRAMME: COMPUTER SCIENCE", "bbox": (100, 260, 250, 25)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 2
    assert lines[0].text == "NAME: ALEX SMITH"
    assert lines[1].text == "PROGRAMME: COMPUTER SCIENCE"


def test_bbox_page_boundary_clamping():
    """T28: Bbox coordinates are strictly clamped within page bounds [0..W, 0..H]."""
    page = create_synthetic_page(width=1000, height=1200)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "BOUNDARY_TEST", "bbox": (950, 1150, 80, 60)}]
    render_ink_on_page(page, text_mask, (950, 1150, 50, 50))

    engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
    lines = engine.analyze_page(page, text_mask)

    assert len(lines) == 1
    bx, by, bw, bh = lines[0].bbox
    assert 0 <= bx < page.width
    assert 0 <= by < page.height
    assert bx + bw <= page.width
    assert by + bh <= page.height


def test_zero_forbidden_strings_in_typography_engine():
    """T29: Pipeline typography engine contains zero forbidden strings from anti-hardcoding audit."""
    typography_file = Path(__file__).parent.parent / "pipeline" / "typography_engine.py"
    assert typography_file.exists()

    content = typography_file.read_text(encoding="utf-8")
    forbidden = [
        r"ALLAMA IQBAL",
        r"0000629245",
        r"SYED ZOHAIB",
        r"ABDUL RAZZAQ",
        r"AIOU-\s*464",
        r"SHP-SH:11",
    ]
    for pat in forbidden:
        assert not re.search(pat, content, re.IGNORECASE), f"Forbidden pattern '{pat}' found in typography_engine.py!"


# ==============================================================================
# Integration Tests: TypographyAndScriptEngine (Interface Contract 4)
# ==============================================================================

def test_typography_and_script_engine_integration():
    """T30: TypographyAndScriptEngine coordinates reading order, key-values, and Urdu routing."""
    page = create_synthetic_page(width=1200, height=1600)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [
        {"text": "OFFICIAL HEADING", "bbox": (350, 100, 500, 45)},
        {"text": "NAME: ALEX SMITH", "bbox": (100, 200, 250, 30)},
    ]
    for w in words:
        render_ink_on_page(page, text_mask, w["bbox"])

    mock_ocr = make_mock_ocr_data_fn(words)
    engine = TypographyAndScriptEngine(
        ocr_data_fn=mock_ocr,
        transcriber_fn=lambda crop: "1. امتحانی ہدایات برائے امیدواران",
        vision_api_key="TEST_API_KEY",
    )

    lines = engine.analyze_text_blocks(page, text_mask, vision_api_key="TEST_API_KEY")
    assert len(lines) >= 2
    assert lines[0].text == "OFFICIAL HEADING"
    assert lines[0].alignment == "center"
    assert lines[0].language_script == "latin"
    assert lines[1].text == "NAME: ALEX SMITH"
    assert lines[1].is_key_value is True


def test_typography_and_script_engine_empty_mask():
    """T31: TypographyAndScriptEngine on zero text mask returns empty list cleanly."""
    page = create_synthetic_page()
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    engine = TypographyAndScriptEngine()
    lines = engine.analyze_text_blocks(page, text_mask)
    assert lines == []


def test_typography_and_script_engine_pure_latin_without_api_key():
    """T32: Pure Latin text processes without requiring VISION_API_KEY."""
    page = create_synthetic_page(width=1200)
    text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

    words = [{"text": "GENERAL DOCUMENT TEXT", "bbox": (100, 100, 300, 30)}]
    render_ink_on_page(page, text_mask, words[0]["bbox"])

    engine = TypographyAndScriptEngine(
        ocr_data_fn=make_mock_ocr_data_fn(words),
        vision_api_key=None,
    )
    lines = engine.analyze_text_blocks(page, text_mask, vision_api_key=None)
    assert len(lines) == 1
    assert lines[0].text == "GENERAL DOCUMENT TEXT"
    assert lines[0].language_script == "latin"


def test_typography_and_script_engine_urdu_without_key_raises_error():
    """T33: Urdu container without valid VISION_API_KEY raises ValueError per R1/R6."""
    page, text_mask = create_synthetic_page(width=1200, height=1600), np.zeros((1600, 1200), dtype=np.uint8)
    # Render box with border
    bx, by, bw, bh = 200, 1000, 800, 350
    for t in range(4):
        page.binary_image[by + t, bx : bx + bw] = 0
        page.binary_image[by + bh - 1 - t, bx : bx + bw] = 0
        page.binary_image[by : by + bh, bx + t] = 0
        page.binary_image[by : by + bh, bx + bw - 1 - t] = 0
        text_mask[by : by + bh, bx : bx + bw] = 255

    # Draw nuqta dots and ligatures inside
    for iy in range(by + 50, by + bh - 50, 40):
        page.binary_image[iy : iy + 5, bx + 50 : bx + 300] = 0
        for x in [bx + 100, bx + 180, bx + 240]:
            page.binary_image[iy - 15 : iy - 10, x : x + 6] = 0

    engine = TypographyAndScriptEngine(vision_api_key=None, transcriber_fn=None)
    engine.script_router.transcriber_fn = None
    engine.script_router._transcriber.api_key = None

    with pytest.raises(ValueError, match="VISION_API_KEY is missing or empty"):
        engine.analyze_text_blocks(page, text_mask, vision_api_key=None)


