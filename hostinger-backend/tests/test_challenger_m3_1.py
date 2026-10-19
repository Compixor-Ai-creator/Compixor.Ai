"""
Empirical Challenger S2_M3_1 Test Suite: Typography & Reading Order Stress Tester.
Conforms to PROJECT.md § Interface Contracts § 4 and Milestone M3 Requirements.

Adversarial Stress-Testing Focus:
1. Empty / completely zeroed text masks: return [] cleanly without division by zero.
2. Vertical reading order: lines sorted strictly top-to-bottom even with baseline jitter.
3. Horizontal gap splitting: centered heading and right-aligned date stamp decoupled.
4. Font size scaling: monotonicity across glyph heights (54px->18pt, 48px->16pt, 40px->14pt, 31px->10.5pt) and clamping within [6.0, 72.0] pt.
5. Bold inference: bold heading vs thin regular text classification.
6. Key-value unification: compound labels, colon normalization, prevention of consecutive row merging.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import List, Dict, Any, Tuple

import cv2
import numpy as np
import pytest
from PIL import Image

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
    stroke_thickness: int = 2,
) -> None:
    """Renders synthetic ink on binary_image, clahe_gray, and text_mask."""
    x, y, w, h = bbox
    # Clamp to page boundaries
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(page.width, x + w), min(page.height, y + h)
    if x2 <= x1 or y2 <= y1:
        return

    text_mask[y1:y2, x1:x2] = 255

    # Draw ink: 0 on binary, 30 on grayscale
    fill_h = max(1, int((y2 - y1) * ink_density))
    page.binary_image[y1 : y1 + fill_h, x1:x2] = 0
    page.clahe_gray[y1 : y1 + fill_h, x1:x2] = 30


def make_mock_ocr_data_fn(words_list: List[Dict[str, Any]]):
    """Returns an ocr_data_fn callable returning mock pytesseract image_to_data dict."""
    def _mock_fn(img: Image.Image) -> Dict[str, list]:
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
# SECTION 1: Empty / Completely Zeroed Text Masks (Requirement 1)
# ==============================================================================

class TestEmptyMaskRobustness:
    """Stress tests empty, zeroed, None, and degenerate text masks for division-by-zero guards."""

    def test_completely_zeroed_text_mask_returns_empty_list(self):
        """Standard page with all-zero text mask must return [] cleanly."""
        page = create_synthetic_page(width=1200, height=1600)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        engine = TypographyEngine()
        lines = engine.analyze_page(page, text_mask)
        assert lines == [], f"Expected [], got {lines}"

    def test_none_text_mask_returns_empty_list(self):
        """None text mask must return [] cleanly without AttributeError."""
        page = create_synthetic_page()
        engine = TypographyEngine()
        lines = engine.analyze_page(page, None)
        assert lines == [], f"Expected [], got {lines}"

    def test_zero_dimensions_text_mask_returns_empty_list(self):
        """Degenerate text mask with shape (0, 0) returns [] cleanly."""
        page = create_synthetic_page(width=0, height=0)
        text_mask = np.zeros((0, 0), dtype=np.uint8)

        engine = TypographyEngine()
        lines = engine.analyze_page(page, text_mask)
        assert lines == []

    def test_noise_pixels_without_ocr_tokens_returns_empty_list(self):
        """Mask has sparse isolated non-zero pixels, but OCR returns 0 tokens -> returns []."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)
        text_mask[100:105, 100:105] = 255  # 5x5 noise patch

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn([]))
        lines = engine.analyze_page(page, text_mask)
        assert lines == []

    def test_facade_empty_and_none_text_mask(self):
        """TypographyAndScriptEngine facade on zero/None text mask returns []."""
        page = create_synthetic_page()
        text_mask_zero = np.zeros((page.height, page.width), dtype=np.uint8)

        engine = TypographyAndScriptEngine()
        assert engine.analyze_text_blocks(page, text_mask_zero) == []
        assert engine.analyze_text_blocks(page, None) == []

    def test_pure_white_binary_image_no_division_by_zero_in_bold(self):
        """All-white binary image (0 ink pixels) evaluates without ZeroDivisionError."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)
        # Bbox defined on white paper
        words = [{"text": "GHOST_TEXT", "bbox": (100, 100, 150, 30)}]
        text_mask[100:130, 100:250] = 255
        # binary_image left completely 255 (paper)

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)
        assert len(lines) == 1
        assert lines[0].is_bold is False


# ==============================================================================
# SECTION 2: Vertical Reading Order & Baseline Jitter (Requirement 2)
# ==============================================================================

class TestVerticalReadingOrder:
    """Stress tests vertical sequencing, baseline jitter clustering, and horizontal order."""

    def test_multiline_shuffled_sequence_sorted_top_to_bottom(self):
        """Multiple lines fed in shuffled vertical order are sorted strictly top-to-bottom."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # 5 distinct lines at Y = 80, 200, 450, 750, 1100
        words = [
            {"text": "LINE_4_SEVEN_FIFTY", "bbox": (100, 750, 200, 28)},
            {"text": "LINE_1_EIGHTY", "bbox": (100, 80, 200, 28)},
            {"text": "LINE_5_ELEVEN_HUNDRED", "bbox": (100, 1100, 200, 28)},
            {"text": "LINE_2_TWO_HUNDRED", "bbox": (100, 200, 200, 28)},
            {"text": "LINE_3_FOUR_FIFTY", "bbox": (100, 450, 200, 28)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 5
        assert lines[0].text == "LINE_1_EIGHTY"
        assert lines[1].text == "LINE_2_TWO_HUNDRED"
        assert lines[2].text == "LINE_3_FOUR_FIFTY"
        assert lines[3].text == "LINE_4_SEVEN_FIFTY"
        assert lines[4].text == "LINE_5_ELEVEN_HUNDRED"

        # Verify strict monotonicity of Y coordinates
        for idx in range(len(lines) - 1):
            assert lines[idx].bbox[1] < lines[idx + 1].bbox[1]

    def test_vertical_jitter_within_clustering_threshold(self):
        """Words with vertical baseline jitter (overlap >= 45%) group into single line."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Line height = 30px.
        # Word 1: y=200..230
        # Word 2: y=210..240 (20px overlap = 66.7% >= 45%)
        # Word 3: y=205..235 (25px overlap = 83.3% >= 45%)
        words = [
            {"text": "TOKEN_A", "bbox": (100, 200, 80, 30)},
            {"text": "TOKEN_B", "bbox": (200, 210, 80, 30)},
            {"text": "TOKEN_C", "bbox": (300, 205, 80, 30)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].text == "TOKEN_A TOKEN_B TOKEN_C"

    def test_vertical_jitter_exceeding_clustering_threshold_decouples(self):
        """Words with vertical separation (< 45% overlap) decouple into distinct lines."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Word 1: y=200..230 (h=30)
        # Word 2: y=220..250 (10px overlap with [200, 230] = 10/30 = 33.3% < 45%)
        words = [
            {"text": "UPPER_LINE", "bbox": (100, 200, 100, 30)},
            {"text": "LOWER_LINE", "bbox": (100, 220, 100, 30)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 2
        assert lines[0].text == "UPPER_LINE"
        assert lines[1].text == "LOWER_LINE"

    def test_same_baseline_words_shuffled_sorted_left_to_right(self):
        """Tokens on identical baseline fed in random order are sorted left-to-right."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        words = [
            {"text": "FOURTH", "bbox": (550, 300, 80, 25)},
            {"text": "FIRST", "bbox": (100, 300, 80, 25)},
            {"text": "FIFTH", "bbox": (700, 300, 80, 25)},
            {"text": "SECOND", "bbox": (250, 300, 80, 25)},
            {"text": "THIRD", "bbox": (400, 300, 80, 25)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].text == "FIRST SECOND THIRD FOURTH FIFTH"


# ==============================================================================
# SECTION 3: Horizontal Gap Splitting (Requirement 3)
# ==============================================================================

class TestHorizontalGapSplitting:
    """Stress tests decoupling of centered title and right date stamp on same Y-band."""

    def test_centered_title_and_right_date_stamp_decoupled(self):
        """Title at x=400..700 and Date at x=1020..1180 decouple into 2 distinct lines."""
        page = create_synthetic_page(width=1200)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Centered Title (cx=550) + Right Date (mr=20px)
        words = [
            {"text": "ALLAMA", "bbox": (400, 100, 90, 35)},
            {"text": "IQBAL", "bbox": (500, 100, 80, 35)},
            {"text": "OPEN", "bbox": (590, 100, 70, 35)},
            {"text": "Date:", "bbox": (1020, 100, 50, 30)},
            {"text": "2026-10-08", "bbox": (1080, 100, 100, 30)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 2, f"Expected 2 lines, got {len(lines)}: {[l.text for l in lines]}"
        assert lines[0].text == "ALLAMA IQBAL OPEN"
        assert lines[0].alignment == "center"
        assert lines[1].text == "Date: 2026-10-08"
        assert lines[1].alignment == "right"

    def test_normal_sentence_on_right_half_does_not_split(self):
        """Standard sentence with normal inter-word spaces (gap < threshold) does NOT split."""
        page = create_synthetic_page(width=1200)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Sentence located on right half (x >= 650), words spaced by 12px
        words = [
            {"text": "Right", "bbox": (650, 200, 60, 25)},
            {"text": "aligned", "bbox": (722, 200, 80, 25)},
            {"text": "clause", "bbox": (814, 200, 70, 25)},
            {"text": "notice", "bbox": (896, 200, 70, 25)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].text == "Right aligned clause notice"

    def test_wide_gap_on_left_half_does_not_split(self):
        """Wide gap (>100px) where right token is still on left half (x < 0.52W) is not split."""
        page = create_synthetic_page(width=1200)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Word 1 at x=100..180, Word 2 at x=350..450 (gap=170px, but 350 < 0.52*1200=624)
        words = [
            {"text": "LEFT_COLUMN", "bbox": (100, 200, 80, 25)},
            {"text": "MID_COLUMN", "bbox": (350, 200, 80, 25)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].text == "LEFT_COLUMN MID_COLUMN"


# ==============================================================================
# SECTION 4: Font Size Scaling & Clamping (Requirement 4)
# ==============================================================================

class TestFontSizeScalingAndClamping:
    """Stress tests font size estimation across target glyph heights, monotonicity, and bounds."""

    @pytest.mark.parametrize(
        "glyph_height, expected_pt",
        [
            (54, 18.0),  # Large heading
            (48, 16.0),  # Main heading
            (40, 14.0),  # Subheading
            (31, 10.5),  # Standard body text
            (26, 9.0),   # Footnote
            (22, 8.0),   # Tiny text
        ],
    )
    def test_mandated_font_size_targets_at_300dpi(self, glyph_height: int, expected_pt: float):
        """Target glyph heights scale precisely to expected Word point sizes at 300 DPI."""
        page = create_synthetic_page(dpi=300)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        words = [{"text": f"GLYPH_{glyph_height}", "bbox": (100, 100, 150, glyph_height)}]
        render_ink_on_page(page, text_mask, words[0]["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].font_size_pt == expected_pt

    def test_font_size_fine_grained_monotonicity(self):
        """Monotonicity: As glyph height increases from 15px to 80px, font_size_pt never decreases."""
        page = create_synthetic_page(dpi=300)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        height_sweep = list(range(15, 85, 5))  # [15, 20, 25, 30, ..., 80]
        words = [
            {"text": f"H_{h}", "bbox": (100, idx * 80 + 50, 120, h)}
            for idx, h in enumerate(height_sweep)
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == len(height_sweep)
        for i in range(len(lines) - 1):
            assert lines[i].font_size_pt <= lines[i + 1].font_size_pt, (
                f"Monotonicity violation between {lines[i].text} ({lines[i].font_size_pt}pt) "
                f"and {lines[i + 1].text} ({lines[i + 1].font_size_pt}pt)"
            )

    @pytest.mark.parametrize("extreme_height", [1, 2, 5, 200, 500, 1000])
    def test_font_size_clamping_within_bounds(self, extreme_height: int):
        """Extreme glyph heights (degenerate tiny or massive) remain strictly in [6.0, 72.0] pt."""
        page = create_synthetic_page(dpi=300)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        words = [{"text": "EXTREME", "bbox": (100, 100, 200, extreme_height)}]
        render_ink_on_page(page, text_mask, words[0]["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert 6.0 <= lines[0].font_size_pt <= 72.0


# ==============================================================================
# SECTION 5: Bold Inference (Requirement 5)
# ==============================================================================

class TestBoldInference:
    """Stress tests bold weight classification via ink fill density and stroke width."""

    def test_bold_heading_high_density_classified_bold(self):
        """Ink density 0.45 >= 0.30 threshold yields is_bold=True."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        words = [{"text": "BOLD_TITLE", "bbox": (100, 100, 200, 40)}]
        render_ink_on_page(page, text_mask, words[0]["bbox"], ink_density=0.45)

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words), bold_density_threshold=0.30)
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].is_bold is True

    def test_regular_text_thin_density_classified_not_bold(self):
        """Ink density 0.15 < 0.30 threshold yields is_bold=False."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        words = [{"text": "REGULAR_TEXT", "bbox": (100, 100, 200, 30)}]
        render_ink_on_page(page, text_mask, words[0]["bbox"], ink_density=0.15)

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words), bold_density_threshold=0.30)
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].is_bold is False

    def test_stroke_width_distance_transform_heading(self):
        """Heading with density 0.28 (<0.30) but thick stroke (>=3.5px) and 16pt is bold."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Create 48px heading (16pt) with solid thick stroke bars
        words = [{"text": "THICK_STROKE_HEADING", "bbox": (100, 100, 300, 48)}]
        x, y, w, h = words[0]["bbox"]
        text_mask[y : y + h, x : x + w] = 255
        # Draw thick 6px stroke lines (distance transform median ~ 6px)
        page.binary_image[y : y + 6, x : x + w] = 0
        page.binary_image[y + 20 : y + 26, x : x + w] = 0
        page.binary_image[y + 40 : y + 46, x : x + w] = 0

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words), bold_density_threshold=0.30)
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].is_bold is True

    def test_out_of_bounds_bbox_does_not_crash_bold_inference(self):
        """Bbox extending past image boundary clamps safely without IndexErrors."""
        page = create_synthetic_page(width=1000, height=1200)
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Bbox spilling over right and bottom edges
        words = [{"text": "EDGE_OVERFLOW", "bbox": (950, 1150, 200, 100)}]
        text_mask[1150:1200, 950:1000] = 255

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].text == "EDGE_OVERFLOW"


# ==============================================================================
# SECTION 6: Key-Value Unification (Requirement 6)
# ==============================================================================

class TestKeyValueUnification:
    """Stress tests key-value detection, compound labels, colon normalization, and distinct rows."""

    @pytest.mark.parametrize(
        "label_line",
        [
            "NAME: SYED ZOHAIB HASSAN SHAH",
            "FATHER NAME: ABDUL RAZZAQ SHAH",
            "STUDENT ID / REGISTRATION NO: 0000629245",
            "PROGRAMME: B.A GEN.(A.D. IN ARTS)",
            "SEMESTER: 2026 SPRING (O)",
            "ROLL NUMBER: 9944321",
            "EXAMINATION CENTRE: ISLAMABAD SECTOR H-8",
        ],
    )
    def test_admit_card_metadata_fields_recognized_as_key_value(self, label_line: str):
        """All typical multi-word and compound admit card metadata fields match key-value format."""
        assert is_key_value_line(label_line) is True

    @pytest.mark.parametrize(
        "delimiter_line",
        [
            "STUDENT NAME: JOHN DOE",
            "STUDENT NAME; JOHN DOE",  # Semicolon OCR error
            "STUDENT NAME - JOHN DOE",  # Hyphen delimiter
        ],
    )
    def test_delimiter_normalization_colon_semicolon_hyphen(self, delimiter_line: str):
        """Colon, semicolon (OCR misread), and hyphen delimiters are recognized."""
        assert is_key_value_line(delimiter_line) is True

    def test_consecutive_rows_remain_distinct_lines(self):
        """Consecutive key-value lines are NOT merged together into a single paragraph."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        words = [
            {"text": "NAME: SYED ZOHAIB", "bbox": (100, 200, 250, 25)},
            {"text": "FATHER NAME: ABDUL RAZZAQ", "bbox": (100, 240, 300, 25)},
            {"text": "REGISTRATION NO: 0000629245", "bbox": (100, 280, 280, 25)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 3, f"Expected 3 distinct lines, got {len(lines)}"
        assert lines[0].text == "NAME: SYED ZOHAIB"
        assert lines[0].is_key_value is True
        assert lines[1].text == "FATHER NAME: ABDUL RAZZAQ"
        assert lines[1].is_key_value is True
        assert lines[2].text == "REGISTRATION NO: 0000629245"
        assert lines[2].is_key_value is True

    def test_trailing_label_unified_with_horizontal_value(self):
        """Trailing label ending with delimiter merges horizontally with value token."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Label: x=100..200, y=150..180
        # Value: x=220..380, y=152..182
        words = [
            {"text": "PROGRAMME:", "bbox": (100, 150, 100, 30)},
            {"text": "COMPUTER", "bbox": (220, 150, 80, 30)},
            {"text": "SCIENCE", "bbox": (310, 150, 70, 30)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 1
        assert lines[0].text == "PROGRAMME: COMPUTER SCIENCE"
        assert lines[0].is_key_value is True
        # Bbox should encompass both label and value
        bx, by, bw, bh = lines[0].bbox
        assert bx == 100
        assert bx + bw >= 380

    def test_trailing_label_does_not_merge_with_next_row_key_value(self):
        """Trailing label is NOT merged with a subsequent vertical row that is also a key-value."""
        page = create_synthetic_page()
        text_mask = np.zeros((page.height, page.width), dtype=np.uint8)

        # Row 1 has trailing label "NOTES:" at y=200
        # Row 2 has "DATE: 2026-10-08" at y=250
        words = [
            {"text": "NOTES:", "bbox": (100, 200, 80, 25)},
            {"text": "DATE: 2026-10-08", "bbox": (100, 250, 180, 25)},
        ]
        for w in words:
            render_ink_on_page(page, text_mask, w["bbox"])

        engine = TypographyEngine(ocr_data_fn=make_mock_ocr_data_fn(words))
        lines = engine.analyze_page(page, text_mask)

        assert len(lines) == 2
        assert lines[0].text == "NOTES:"
        assert lines[1].text == "DATE: 2026-10-08"

    @pytest.mark.parametrize(
        "negative_text",
        [
            "Class time is 14:00",
            "14:00",
            "Page 1 of 5",
            "Important instructions for candidates are listed below.",
            "There are several terms: item 1 and item 2",
            "The candidate was present: confirmed",
            "Candidate has completed: full course",
            "12345678: ABC",
            "A: B",
            ": missing label",
            "This is an excessively long label text that exceeds the word limit: value",
        ],
    )
    def test_negative_cases_not_classified_as_key_value(self, negative_text: str):
        """Timestamps, sentences with verbs, digit-only labels, and length limits are rejected."""
        assert is_key_value_line(negative_text) is False

    @pytest.mark.xfail(
        reason="Adversarial finding: regex character class [A-Za-z0-9\\s/_\\.\\-\\(\\)] omits apostrophe (') so 'FATHER'S NAME' is not matched",
        strict=False,
    )
    def test_adversarial_apostrophe_in_key_value_label(self):
        """Apostrophe in label (e.g. FATHER'S NAME) is currently not recognized by regex."""
        assert is_key_value_line("FATHER'S NAME: JOHN DOE") is True

    @pytest.mark.xfail(
        reason="Adversarial finding: sentences with non-auxiliary verbs before colon (e.g. 'starts at 14:00') bypass sentence_markers check",
        strict=False,
    )
    def test_adversarial_sentence_with_non_auxiliary_verb_and_time(self):
        """Sentences with verbs outside the 10 auxiliary markers followed by time can be misidentified."""
        assert is_key_value_line("Exam starts at 14:00 sharp") is False



# ==============================================================================
# SECTION 7: Anti-Hardcoding Audit for Typography Engine
# ==============================================================================

class TestAntiHardcodingAudit:
    """Verifies that pipeline/typography_engine.py contains zero hardcoded sample values."""

    def test_zero_forbidden_patterns_in_typography_engine(self):
        """Verify zero forbidden strings exist in typography_engine.py source code."""
        source_path = Path(__file__).resolve().parent.parent / "pipeline" / "typography_engine.py"
        assert source_path.exists(), f"File not found: {source_path}"

        code = source_path.read_text(encoding="utf-8")
        forbidden = [
            r"ALLAMA IQBAL",
            r"0000629245",
            r"SYED ZOHAIB",
            r"ABDUL RAZZAQ",
            r"AIOU-\s*464",
            r"SHP-SH:11",
        ]
        for pattern in forbidden:
            match = re.search(pattern, code, re.IGNORECASE)
            assert not match, f"Anti-hardcoding violation: pattern '{pattern}' found in {source_path}"
