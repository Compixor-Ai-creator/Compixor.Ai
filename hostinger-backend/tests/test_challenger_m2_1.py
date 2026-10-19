"""
Empirical Challenger S2_M2_1 Test Suite.
Mission: Empirically stress-test Milestone M2 deliverables:
1. Verify documents with NO tables return 0 tables and preserve text mask ink.
2. Verify documents with NO visual elements return 0 elements and preserve text mask ink.
3. Verify single-cell containers (such as Urdu instructions box) are preserved and NOT falsely classified as data tables.
4. Verify table and visual masks zero out ink completely (100% zeroing).
5. Verify merged header spans and cell span invariants.
"""

from __future__ import annotations

import io
from typing import Tuple, List, Set

import cv2
import numpy as np
import pytest
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage
from pipeline.table_extractor import MorphologicalTableExtractor, ExtractedTable, TableCell
from pipeline.visual_extractor import VisualElementExtractor, ExtractedVisualElement


# ==============================================================================
# Helper Functions for Synthetic Document Generation
# ==============================================================================


def create_preprocessed_page(
    rgb_img: Image.Image, page_number: int = 1, dpi: int = 300
) -> PreprocessedPage:
    """Creates a validated PreprocessedPage directly from a PIL Image."""
    rgb = rgb_img.convert("RGB")
    w, h = rgb.width, rgb.height
    gray = np.array(rgb.convert("L"))

    # CLAHE enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    clahe_gray = clahe.apply(gray)

    # Otsu binarization: background 255, ink 0
    _, binary = cv2.threshold(clahe_gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    return PreprocessedPage(
        page_number=page_number,
        rgb_image=rgb,
        clahe_gray=clahe_gray,
        binary_image=binary,
        skew_angle=0.0,
        dpi=dpi,
        width=w,
        height=h,
    )


def mock_cell_ocr(crop: Image.Image) -> Tuple[str, float]:
    """Deterministic OCR mock for table testing."""
    return f"Cell_{crop.width}x{crop.height}", 0.95


@pytest.fixture
def table_extractor() -> MorphologicalTableExtractor:
    return MorphologicalTableExtractor(ocr_fn=mock_cell_ocr)


@pytest.fixture
def visual_extractor() -> VisualElementExtractor:
    return VisualElementExtractor()


# ==============================================================================
# SECTION 1: Documents with NO Tables (Requirement 1)
# ==============================================================================


class TestNoTablesNegativeTesting:
    """Stress-tests MorphologicalTableExtractor on documents containing no tables."""

    def test_blank_white_page_returns_empty_tables_list(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """A blank document must return an empty list of tables without error."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        page = create_preprocessed_page(img)

        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert isinstance(tables, list)
        assert len(tables) == 0, f"Expected 0 tables on blank page, got {len(tables)}"
        assert text_mask.shape == (h, w)
        assert np.sum(text_mask > 0) == 0

    def test_text_only_paragraphs_returns_empty_tables_list(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """A document with pure paragraphs and text lines must return 0 tables without error."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Draw multiple paragraph lines with word gaps
        for y in range(80, 1500, 45):
            cur_x = 100
            while cur_x < 1050:
                word_w = np.random.randint(40, 110)
                draw.rectangle([cur_x, y, cur_x + word_w, y + 18], fill=(20, 20, 20))
                cur_x += word_w + np.random.randint(15, 30)

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert isinstance(tables, list)
        assert len(tables) == 0, f"Expected 0 tables on text-only document, got {len(tables)}"
        assert np.sum(text_mask > 0) > 5000, "Text ink was erroneously removed from text mask"

    def test_isolated_horizontal_and_vertical_rules_do_not_form_table(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        Isolated divider lines (horizontal rule and vertical sidebar rule)
        that do not form a closed cell grid must NOT be classified as tables.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Horizontal separator line
        draw.line([(100, 400), (1100, 400)], fill=(0, 0, 0), width=3)
        # Vertical margin rule (not intersecting)
        draw.line([(80, 600), (80, 1400)], fill=(0, 0, 0), width=3)

        # Paragraph text between rules
        for y in range(450, 580, 40):
            draw.rectangle([100, y, 900, y + 16], fill=(30, 30, 30))

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, f"Isolated line rules must not form a table, found {len(tables)}"
        assert np.sum(text_mask > 0) > 1000

    def test_sub_threshold_tiny_grid_is_not_classified_as_table(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """A tiny grid below min_table_width_ratio (20% of page) must be rejected."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Tiny grid: width=150 (12.5% of 1200, < 20%), height=80
        tx, ty, tw, th = 200, 200, 150, 80
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=2)
        draw.line([(tx, ty + 40), (tx + tw, ty + 40)], fill=(0, 0, 0), width=2)
        draw.line([(tx + 75, ty), (tx + 75, ty + th)], fill=(0, 0, 0), width=2)

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, "Tiny sub-threshold grid should be excluded"

    def test_multi_column_newspaper_layout_returns_empty_tables(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Multi-column newspaper / article layout without border lines must return 0 tables."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Two side-by-side text columns separated by whitespace gutter (col 1: 100..550, col 2: 650..1100)
        for y in range(150, 1400, 30):
            # Column 1
            draw.rectangle([100, y, 550, y + 14], fill=(20, 20, 20))
            # Column 2
            draw.rectangle([650, y, 1100, y + 14], fill=(20, 20, 20))

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, f"Multi-column text layout without borders was falsely classified as table!"
        assert np.sum(text_mask > 0) > 5000

    def test_form_underline_rules_return_empty_tables(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Form fill underline rules (e.g., Name: ______ Date: ______) must not form a table."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 5 separate underline rows
        for y in [300, 450, 600, 750, 900]:
            draw.rectangle([100, y - 25, 250, y - 5], fill=(20, 20, 20))  # Label
            draw.line([(270, y), (800, y)], fill=(0, 0, 0), width=2)      # Underline

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, "Form underlines should not be detected as a table"
        assert np.sum(text_mask > 0) > 1000


# ==============================================================================
# SECTION 2: Documents with NO Visual Elements (Requirement 2)
# ==============================================================================


class TestNoVisualElementsNegativeTesting:
    """Stress-tests VisualElementExtractor on documents containing no visual elements."""

    def test_blank_white_page_returns_empty_visual_elements_list(
        self, visual_extractor: VisualElementExtractor
    ):
        """A blank document must return an empty list of visual elements without error."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        page = create_preprocessed_page(img)

        elements, text_mask = visual_extractor.extract_and_mask(page)

        assert isinstance(elements, list)
        assert len(elements) == 0, f"Expected 0 visual elements on blank page, got {len(elements)}"
        assert text_mask.shape == (h, w)
        assert np.sum(text_mask > 0) == 0

    def test_text_only_document_returns_empty_visual_elements_list(
        self, visual_extractor: VisualElementExtractor
    ):
        """A document with multi-line paragraphs, titles, and headers must have zero false positives."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Title
        draw.rectangle([100, 80, 800, 120], fill=(0, 0, 0))
        # Body text paragraphs
        for y in range(160, 1400, 40):
            draw.rectangle([100, y, 1050, y + 16], fill=(15, 15, 15))

        page = create_preprocessed_page(img)
        elements, text_mask = visual_extractor.extract_and_mask(page)

        assert isinstance(elements, list)
        assert len(elements) == 0, (
            f"Expected 0 visual elements on text-only document, found {len(elements)}: "
            f"{[e.element_type for e in elements]}"
        )
        assert np.sum(text_mask > 0) > 5000

    def test_table_grid_alone_is_not_classified_as_visual_element(
        self, visual_extractor: VisualElementExtractor
    ):
        """A multi-cell data table grid must not be falsely classified as photo or logo."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Table grid: 900x250 (large table)
        tx, ty, tw, th = 150, 400, 900, 250
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([(tx, ty + 70), (tx + tw, ty + 70)], fill=(0, 0, 0), width=3)
        for xs in [300, 600]:
            draw.line([(tx + xs, ty), (tx + xs, ty + th)], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        elements, text_mask = visual_extractor.extract_and_mask(page)

        assert len(elements) == 0, (
            f"Table grid should not be classified as visual element, got {[e.element_type for e in elements]}"
        )

    def test_large_bold_title_banner_is_not_classified_as_visual_element(
        self, visual_extractor: VisualElementExtractor
    ):
        """Large bold heading bands (e.g. ALLAMA IQBAL OPEN UNIVERSITY) must not trigger visual elements."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Big bold banner band (w=800, h=40)
        draw.rectangle([200, 100, 1000, 140], fill=(10, 10, 10))
        draw.rectangle([350, 160, 850, 195], fill=(10, 10, 10))

        page = create_preprocessed_page(img)
        elements, _ = visual_extractor.extract_and_mask(page)

        assert len(elements) == 0, f"Heading banners falsely detected as visuals: {[e.element_type for e in elements]}"

    def test_bullet_points_and_checkboxes_are_not_classified_as_visual_elements(
        self, visual_extractor: VisualElementExtractor
    ):
        """Checkboxes, bullet symbols, and small list markers must not be detected as logos or barcodes."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        for y in range(200, 1000, 80):
            # Small 16x16 checkbox
            draw.rectangle([100, y, 116, y + 16], outline=(0, 0, 0), width=2)
            # Associated text line
            draw.rectangle([140, y + 2, 700, y + 14], fill=(20, 20, 20))

        page = create_preprocessed_page(img)
        elements, _ = visual_extractor.extract_and_mask(page)

        assert len(elements) == 0, f"Checkboxes falsely classified as visuals: {[e.element_type for e in elements]}"


# ==============================================================================
# SECTION 3: Single-Cell Containers / Urdu Instruction Box (Requirement 3)
# ==============================================================================


class TestSingleCellContainerExclusion:
    """
    Stress-tests single-cell bordered containers (e.g. Urdu instruction boxes)
    to verify they are NOT falsely classified as multi-cell data tables, and
    their internal text is NOT masked out.
    """

    def test_single_cell_bordered_container_is_not_classified_as_table(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        A single-cell bordered box (width=850, height=350) with outer border and
        no internal divider lines must NOT be returned as a table.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Header text
        draw.rectangle([100, 80, 800, 110], fill=(0, 0, 0))

        # Single-cell bordered container: bx=150, by=300, bw=850, bh=350
        bx, by, bw, bh = 150, 300, 850, 350
        draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=3)

        # 4 internal text lines (instructions) with spaces between words
        for row_y in [360, 430, 500, 570]:
            x_cursor = bx + 50
            while x_cursor < bx + bw - 60:
                word_w = np.random.randint(40, 100)
                draw.rectangle([x_cursor, row_y, x_cursor + word_w, row_y + 18], fill=(25, 25, 25))
                x_cursor += word_w + np.random.randint(20, 40)

        # Footer text
        draw.rectangle([100, 800, 700, 825], fill=(0, 0, 0))

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, (
            f"Single-cell container was falsely classified as multi-cell data table! "
            f"Found {len(tables)} tables: {[(t.rows, t.cols) for t in tables]}"
        )

        # Text inside container MUST NOT be zeroed out
        container_text_ink = text_mask[by + 20:by + bh - 20, bx + 20:bx + bw - 20]
        assert np.sum(container_text_ink > 0) > 1000, (
            "Text inside single-cell container was erroneously erased from text mask!"
        )

    def test_single_cell_container_is_not_classified_as_visual_element(
        self, visual_extractor: VisualElementExtractor
    ):
        """
        A large single-cell bordered container must NOT be falsely classified
        as photo, barcode, logo, or signature by VisualElementExtractor.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        bx, by, bw, bh = 150, 300, 900, 350
        draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=3)

        for row_y in [350, 420, 490, 560]:
            draw.rectangle([bx + 40, row_y, bx + bw - 40, row_y + 16], fill=(20, 20, 20))

        page = create_preprocessed_page(img)
        elements, text_mask = visual_extractor.extract_and_mask(page)

        assert len(elements) == 0, (
            f"Single-cell container was falsely classified as visual element! "
            f"Detected: {[e.element_type for e in elements]}"
        )

    def test_urdu_box_with_slanted_nastaliq_strokes_excluded(
        self, table_extractor: MorphologicalTableExtractor, visual_extractor: VisualElementExtractor
    ):
        """
        Simulates an Urdu instruction box with slanted, cursive Nastaliq-like ink strokes.
        Neither table extractor nor visual extractor must falsely classify it.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Outer border
        bx, by, bw, bh = 100, 700, 1000, 400
        draw.rectangle([bx, by, bx + bw, by + bh], outline=(10, 10, 10), width=3)

        # Slanted cursive ligatures
        for y_center in range(by + 50, by + bh - 50, 60):
            for x_start in range(bx + 60, bx + bw - 80, 70):
                # Slanted stroke (top-right to bottom-left)
                draw.line([(x_start + 40, y_center - 10), (x_start, y_center + 12)], fill=(20, 20, 20), width=3)
                # Small diacritic / dot above
                draw.rectangle([x_start + 25, y_center - 18, x_start + 30, y_center - 14], fill=(20, 20, 20))

        page = create_preprocessed_page(img)

        # 1. Table extractor check
        tables, table_mask = table_extractor.extract_tables_and_mask(page)
        assert len(tables) == 0, "Urdu instruction box was falsely identified as a multi-cell table"

        # 2. Visual extractor check
        visuals, visual_mask = visual_extractor.extract_and_mask(page)
        assert len(visuals) == 0, f"Urdu instruction box falsely identified as visual: {[v.element_type for v in visuals]}"

    def test_multiple_single_cell_callout_containers_preserved_simultaneously(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Multiple distinct single-cell containers (e.g. Warning Box and Note Box) on same page."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Container 1: top callout
        draw.rectangle([150, 200, 1050, 450], outline=(0, 0, 0), width=3)
        draw.rectangle([200, 250, 950, 275], fill=(20, 20, 20))
        draw.rectangle([200, 320, 900, 345], fill=(20, 20, 20))

        # Container 2: bottom callout
        draw.rectangle([150, 800, 1050, 1100], outline=(0, 0, 0), width=3)
        draw.rectangle([200, 850, 920, 875], fill=(20, 20, 20))
        draw.rectangle([200, 920, 960, 945], fill=(20, 20, 20))

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, "Multiple callout boxes should both be excluded from table detection"
        assert np.sum(text_mask[250:350, 200:900] > 0) > 500
        assert np.sum(text_mask[850:950, 200:900] > 0) > 500

    def test_heavy_bordered_single_cell_preserves_text_mask_ink(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Single-cell container with thick 5px border retains 100% of internal text ink."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        bx, by, bw, bh = 150, 400, 900, 300
        draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=5)
        # Inner text
        draw.rectangle([bx + 50, by + 100, bx + 700, by + 130], fill=(20, 20, 20))

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0
        assert np.sum(text_mask[by + 80:by + 150, bx + 40:bx + 720] > 0) > 500


# ==============================================================================
# SECTION 4: Mask Zeroing Completeness (Requirement 4)
# ==============================================================================


class TestMaskZeroingCompleteness:
    """Verifies that table and visual element masks zero out pixels completely."""

    def test_table_mask_zeroes_out_pixels_completely(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        When a table is detected, every pixel within the table bounding box (plus padding)
        MUST be set to 0 in updated_text_mask, while body text outside remains intact.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Body text above table
        draw.rectangle([100, 80, 800, 100], fill=(0, 0, 0))
        draw.rectangle([100, 115, 600, 135], fill=(0, 0, 0))

        # 2x3 Table: tx=150, ty=300, tw=900, th=200
        tx, ty, tw, th = 150, 300, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([(tx, ty + 80), (tx + tw, ty + 80)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 300, ty), (tx + 300, ty + th)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 600, ty), (tx + 600, ty + th)], fill=(0, 0, 0), width=3)

        # Cell ink
        for cx in [200, 500, 800]:
            draw.rectangle([cx, ty + 30, cx + 100, ty + 50], fill=(0, 0, 0))
            draw.rectangle([cx, ty + 120, cx + 100, ty + 140], fill=(0, 0, 0))

        # Body text below table
        draw.rectangle([100, 600, 800, 620], fill=(0, 0, 0))

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1, "Expected 1 table detected"
        table = tables[0]
        tbx, tby, tbw, tbh = table.bbox

        # 1. VERIFY ENTIRE TABLE BBOX IS ZEROED OUT
        table_region_in_mask = text_mask[tby:tby + tbh, tbx:tbx + tbw]
        zero_count = np.sum(table_region_in_mask == 0)
        total_pixels = table_region_in_mask.size

        assert zero_count == total_pixels, (
            f"Table region is not 100% zeroed! "
            f"Non-zero pixels remaining: {np.sum(table_region_in_mask > 0)} / {total_pixels}"
        )

        # 2. VERIFY SAFETY PADDING (pad=2) IS ZEROED OUT
        pad = 2
        padded_region = text_mask[max(0, tby - pad):min(h, tby + tbh + pad), max(0, tbx - pad):min(w, tbx + tbw + pad)]
        assert np.sum(padded_region > 0) == 0, "Table padded border contains non-zero residual pixels"

        # 3. VERIFY SURROUNDING BODY TEXT IS PRESERVED
        above_ink = text_mask[80:135, 100:800]
        below_ink = text_mask[600:625, 100:800]
        assert np.sum(above_ink > 0) > 500, "Body text above table was improperly zeroed out"
        assert np.sum(below_ink > 0) > 300, "Body text below table was improperly zeroed out"

    def test_visual_element_mask_zeroes_out_pixels_completely(
        self, visual_extractor: VisualElementExtractor
    ):
        """
        When visual elements (photo, barcode) are detected, every pixel in their bounding
        boxes (plus padding) MUST be strictly 0 in the returned text_mask.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Text line above
        draw.rectangle([100, 50, 600, 70], fill=(0, 0, 0))

        # Photo at top right: 240x320
        px, py, pw, ph = 850, 100, 240, 320
        draw.rectangle([px, py, px + pw, py + ph], outline=(30, 30, 30), width=3)
        photo_arr = np.zeros((ph - 6, pw - 6, 3), dtype=np.uint8)
        photo_arr[:, :, 0] = np.random.randint(180, 240, (ph - 6, pw - 6), dtype=np.uint8)
        photo_arr[:, :, 1] = np.random.randint(130, 190, (ph - 6, pw - 6), dtype=np.uint8)
        photo_arr[:, :, 2] = np.random.randint(90, 150, (ph - 6, pw - 6), dtype=np.uint8)
        img.paste(Image.fromarray(photo_arr), (px + 3, py + 3))

        # Text line below photo
        draw.rectangle([100, 500, 700, 520], fill=(0, 0, 0))

        page = create_preprocessed_page(img)
        elements, text_mask = visual_extractor.extract_and_mask(page)

        photos = [e for e in elements if e.element_type == "photo"]
        assert len(photos) >= 1, "Expected at least 1 photo detected"

        for photo in photos:
            bx, by, bw, bh = photo.bbox
            photo_mask_region = text_mask[by:by + bh, bx:bx + bw]
            non_zero_count = np.sum(photo_mask_region > 0)
            assert non_zero_count == 0, (
                f"Photo region at {photo.bbox} contains {non_zero_count} non-zero pixels in text mask!"
            )

            padded_region = text_mask[max(0, by - 3):min(h, by + bh + 3), max(0, bx - 3):min(w, bx + bw + 3)]
            assert np.sum(padded_region > 0) == 0, "Photo padded border contains residual non-zero pixels"

        assert np.sum(text_mask[50:70, 100:600] > 0) > 200
        assert np.sum(text_mask[500:520, 100:700] > 0) > 200

    def test_sequential_pipeline_visual_and_table_zeroing_integrity(
        self, table_extractor: MorphologicalTableExtractor, visual_extractor: VisualElementExtractor
    ):
        """
        Tests the end-to-end extraction order specified in PROJECT.md:
        1. VisualElementExtractor.extract_and_mask(page) -> (visuals, mask_1)
        2. MorphologicalTableExtractor.extract_tables_and_mask(page, text_mask=mask_1) -> (tables, mask_2)
        Verifies BOTH visual element bboxes AND table bboxes are 100% zeroed in mask_2.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 1. Photo at (850, 100, 240, 320)
        px, py, pw, ph = 850, 100, 240, 320
        draw.rectangle([px, py, px + pw, py + ph], outline=(0, 0, 0), width=3)
        photo_arr = np.random.randint(100, 230, (ph - 6, pw - 6, 3), dtype=np.uint8)
        img.paste(Image.fromarray(photo_arr), (px + 3, py + 3))

        # 2. Body heading
        draw.rectangle([100, 150, 700, 180], fill=(0, 0, 0))

        # 3. 2x3 Table at (100, 600, 900, 200)
        tx, ty, tw, th = 100, 600, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([(tx, ty + 80), (tx + tw, ty + 80)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 300, ty), (tx + 300, ty + th)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 600, ty), (tx + 600, ty + th)], fill=(0, 0, 0), width=3)

        # 4. Body footer paragraph
        draw.rectangle([100, 900, 800, 920], fill=(0, 0, 0))

        page = create_preprocessed_page(img)

        # Stage 1: Visual Extractor
        visuals, mask_1 = visual_extractor.extract_and_mask(page)
        assert len(visuals) >= 1

        # Stage 2: Table Extractor passing mask_1
        tables, mask_2 = table_extractor.extract_tables_and_mask(page, text_mask=mask_1)
        assert len(tables) >= 1

        # Check ALL visual regions are 0 in mask_2
        for v in visuals:
            vx, vy, vw, vh = v.bbox
            assert np.sum(mask_2[vy:vy + vh, vx:vx + vw] > 0) == 0, (
                f"Visual element {v.element_type} at {v.bbox} was unmasked during table extraction!"
            )

        # Check ALL table regions are 0 in mask_2
        for t in tables:
            tx, ty, tw, th = t.bbox
            assert np.sum(mask_2[ty:ty + th, tx:tx + tw] > 0) == 0, (
                f"Table at {t.bbox} has residual non-zero pixels in mask_2!"
            )

        # Check remaining body paragraphs remain intact in mask_2
        heading_ink = mask_2[150:180, 100:700]
        footer_ink = mask_2[900:920, 100:800]
        assert np.sum(heading_ink > 0) > 500, "Heading text was erroneously erased"
        assert np.sum(footer_ink > 0) > 300, "Footer text was erroneously erased"

    def test_mask_zeroing_at_page_boundaries_and_corners(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Table flush against left edge (x=0) does not cause negative index overflow in padding."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Table at x=0
        tx, ty, tw, th = 0, 300, 800, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([(tx, ty + 80), (tx + tw, ty + 80)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 400, ty), (tx + 400, ty + th)], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        t = tables[0]
        assert np.sum(text_mask[t.bbox[1]:t.bbox[1] + t.bbox[3], 0:t.bbox[2]] > 0) == 0


# ==============================================================================
# SECTION 5: Merged Header Spans and Cell Span Invariants (Requirement 5)
# ==============================================================================


class TestMergedHeaderSpansAndCellInvariants:
    """Verifies merged header spans, multi-cell spans, and cell coverage invariants."""

    def test_proportional_column_widths_sum_to_exactly_one(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Column widths must represent proportional ratios and sum to exactly 1.0."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Table with asymmetric column widths: 150, 300, 450 out of 900
        tx, ty, tw, th = 100, 300, 900, 180
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([(tx, ty + 70), (tx + tw, ty + 70)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 150, ty), (tx + 150, ty + th)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 450, ty), (tx + 450, ty + th)], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        table = tables[0]
        assert table.cols == 3
        assert len(table.col_widths) == 3

        # Must sum to 1.0 within floating point precision
        assert abs(sum(table.col_widths) - 1.0) < 1e-4, f"Column widths sum ({sum(table.col_widths)}) != 1.0"
        assert table.col_widths[0] < table.col_widths[1] < table.col_widths[2]

    def test_header_cells_correctly_flagged_on_row_zero(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """Row 0 cells must have is_header=True, subsequent rows must have is_header=False."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 3-row, 2-col table
        tx, ty, tw, th = 100, 300, 800, 240
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([(tx, ty + 80), (tx + tw, ty + 80)], fill=(0, 0, 0), width=3)
        draw.line([(tx, ty + 160), (tx + tw, ty + 160)], fill=(0, 0, 0), width=3)
        draw.line([(tx + 400, ty), (tx + 400, ty + th)], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        table = tables[0]
        assert table.rows == 3
        assert table.cols == 2

        for cell in table.cells:
            if cell.row_idx == 0:
                assert cell.is_header is True, f"Row 0 cell ({cell.row_idx}, {cell.col_idx}) must be header"
            else:
                assert cell.is_header is False, f"Row {cell.row_idx} cell ({cell.row_idx}, {cell.col_idx}) must NOT be header"

    def test_merged_header_span_across_all_columns(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        A 2-row, 3-column table with a single merged header cell across all 3 columns on row 0.
        Row 0 must yield exactly 1 cell with col_span = 3 and is_header = True.
        Row 1 must yield 3 cells with col_span = 1 each.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # tx=100, ty=300, tw=900, th=200
        # Row 0: height 80 (header), Row 1: height 120 (data)
        tx, ty, tw, th = 100, 300, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        # Horizontal divider between row 0 and row 1
        draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)

        # Vertical dividers exist ONLY in row 1 (ty+80 to ty+th), NOT in row 0
        for xs in [300, 600]:
            draw.line([tx + xs, ty + 80, tx + xs, ty + th], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        table = tables[0]
        assert table.rows == 2
        assert table.cols == 3

        header_cells = [c for c in table.cells if c.row_idx == 0]
        data_cells = [c for c in table.cells if c.row_idx == 1]

        # Row 0 must have exactly 1 spanned header cell
        assert len(header_cells) == 1, f"Expected 1 merged header cell, got {len(header_cells)}"
        h_cell = header_cells[0]
        assert h_cell.col_span == 3, f"Expected header col_span=3, got {h_cell.col_span}"
        assert h_cell.row_span == 1
        assert h_cell.is_header is True
        assert h_cell.col_idx == 0

        # Row 1 must have 3 individual data cells
        assert len(data_cells) == 3
        for c_idx, d_cell in enumerate(data_cells):
            assert d_cell.col_idx == c_idx
            assert d_cell.col_span == 1
            assert d_cell.row_span == 1
            assert d_cell.is_header is False

    def test_merged_header_sub_spans_and_column_groups(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        A 2-row, 4-column table where header row groups columns in pairs:
        Group 1 (cols 0-1 merged, col_span=2) and Group 2 (cols 2-3 merged, col_span=2).
        Data row (row 1) has all 4 individual columns.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 2 rows (80px header, 120px data), 4 columns (each 200px wide, tw=800)
        tx, ty, tw, th = 100, 300, 800, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        # Horizontal divider across entire table
        draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)

        # Vertical divider between group 1 and group 2 spans FULL table height
        draw.line([tx + 400, ty, tx + 400, ty + th], fill=(0, 0, 0), width=3)

        # Internal dividers within groups exist ONLY in row 1
        draw.line([tx + 200, ty + 80, tx + 200, ty + th], fill=(0, 0, 0), width=3)
        draw.line([tx + 600, ty + 80, tx + 600, ty + th], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        table = tables[0]
        assert table.rows == 2
        assert table.cols == 4

        header_cells = [c for c in table.cells if c.row_idx == 0]
        assert len(header_cells) == 2, f"Expected 2 grouped header cells, got {len(header_cells)}"
        assert header_cells[0].col_idx == 0 and header_cells[0].col_span == 2
        assert header_cells[1].col_idx == 2 and header_cells[1].col_span == 2

    def test_vertical_row_span_in_data_cells(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        A 2-row, 3-column table where column 0 has a vertical row span (row_span=2)
        and rows 0 and 1 have individual cells in columns 1 and 2.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 2 rows (100px each), 3 columns (300px each, tw=900)
        tx, ty, tw, th = 100, 300, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)

        # Vertical dividers span FULL table height
        draw.line([tx + 300, ty, tx + 300, ty + th], fill=(0, 0, 0), width=3)
        draw.line([tx + 600, ty, tx + 600, ty + th], fill=(0, 0, 0), width=3)

        # Horizontal divider exists ONLY across columns 1 and 2 (from tx+300 to tx+tw), NOT col 0
        draw.line([tx + 300, ty + 100, tx + tw, ty + 100], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        table = tables[0]
        assert table.rows == 2
        assert table.cols == 3

        # Col 0 in row 0 must have row_span = 2
        col0_cell = [c for c in table.cells if c.row_idx == 0 and c.col_idx == 0][0]
        assert col0_cell.row_span == 2, f"Expected col 0 to span 2 rows, got row_span={col0_cell.row_span}"
        assert col0_cell.col_span == 1

        # Total number of cells should be 5 (1 spanned + 2 in row 0 + 2 in row 1)
        assert len(table.cells) == 5

    def test_cell_span_grid_coverage_invariant(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        MATHEMATICAL INVARIANT:
        For any table of R rows and C columns, every grid position (r, c)
        must be covered by EXACTLY ONE cell.
        Sum of (cell.row_span * cell.col_span) across all cells MUST equal R * C.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 2-row, 3-column table with merged header on row 0
        tx, ty, tw, th = 100, 300, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)
        for xs in [300, 600]:
            draw.line([tx + xs, ty + 80, tx + xs, ty + th], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        t = tables[0]

        # 1. Check exact area sum invariant
        total_cell_area = sum(cell.row_span * cell.col_span for cell in t.cells)
        expected_grid_area = t.rows * t.cols
        assert total_cell_area == expected_grid_area, (
            f"Area sum invariant violated: total {total_cell_area} != expected {expected_grid_area}"
        )

        # 2. Check 2D coverage matrix: every grid slot covered exactly once
        coverage_grid = np.zeros((t.rows, t.cols), dtype=int)
        for cell in t.cells:
            coverage_grid[
                cell.row_idx:cell.row_idx + cell.row_span,
                cell.col_idx:cell.col_idx + cell.col_span
            ] += 1

        assert np.all(coverage_grid == 1), (
            f"Grid slots not covered exactly once! Coverage matrix:\n{coverage_grid}"
        )

    def test_cell_boundary_and_non_overlap_invariants(
        self, table_extractor: MorphologicalTableExtractor
    ):
        """
        BOUNDARY & NON-OVERLAP INVARIANTS:
        Every cell must strictly satisfy:
        1. 0 <= row_idx < rows and 0 <= col_idx < cols
        2. row_idx + row_span <= rows
        3. col_idx + col_span <= cols
        4. Bounding box coordinates tx, ty, tw, th are strictly positive within table bounds.
        5. No two cells have overlapping row and column intervals.
        """
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 3-row, 3-column standard table
        tx, ty, tw, th = 100, 300, 900, 300
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        for ys in [100, 200]:
            draw.line([tx, ty + ys, tx + tw, ty + ys], fill=(0, 0, 0), width=3)
        for xs in [300, 600]:
            draw.line([tx + xs, ty, tx + xs, ty + th], fill=(0, 0, 0), width=3)

        page = create_preprocessed_page(img)
        tables, _ = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 1
        t = tables[0]

        for cell in t.cells:
            # 1. Index bounds
            assert 0 <= cell.row_idx < t.rows
            assert 0 <= cell.col_idx < t.cols
            assert cell.row_span >= 1
            assert cell.col_span >= 1

            # 2. Extent bounds
            assert cell.row_idx + cell.row_span <= t.rows
            assert cell.col_idx + cell.col_span <= t.cols

            # 3. Geometric bounds
            cx, cy, cw, ch = cell.bbox
            assert cx >= t.bbox[0] and cx + cw <= t.bbox[0] + t.bbox[2] + 2
            assert cy >= t.bbox[1] and cy + ch <= t.bbox[1] + t.bbox[3] + 2
            assert cw > 0 and ch > 0

        # 4. Pairwise non-overlap check
        for i, c1 in enumerate(t.cells):
            for j, c2 in enumerate(t.cells):
                if i >= j:
                    continue
                # Overlap in rows
                row_overlap = not (c1.row_idx + c1.row_span <= c2.row_idx or c2.row_idx + c2.row_span <= c1.row_idx)
                # Overlap in cols
                col_overlap = not (c1.col_idx + c1.col_span <= c2.col_idx or c2.col_idx + c2.col_span <= c1.col_idx)
                assert not (row_overlap and col_overlap), (
                    f"Cells {i} and {j} overlap! Cell 1: ({c1.row_idx}, {c1.col_idx}, span {c1.row_span}x{c1.col_span}), "
                    f"Cell 2: ({c2.row_idx}, {c2.col_idx}, span {c2.row_span}x{c2.col_span})"
                )
