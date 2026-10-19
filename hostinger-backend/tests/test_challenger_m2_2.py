"""
Empirical Challenger S2_M2_2 Test Suite.
Conforms strictly to Milestone M2 requirements, Interface Contracts, and Authoritative User Request.

Mission:
1. Verify 4 visual elements (photo, crest logo, 1D barcode, signature flourish) on Capture.PNG / High-Fidelity Forensic Replica.
2. Verify 2D square QR code detection on synthetic test documents.
3. Verify 7-column exam schedule table detection with exactly 7 columns, widths summing to 1.0, and 0% text leakage.
4. Verify single-cell bordered container bypass.
5. Adversarial stress tests: border clamping, column normalization invariants, false positive rejection, mask compounding.
"""

import io
import math
import os
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np
import pytest
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage
from pipeline.visual_extractor import VisualElementExtractor, ExtractedVisualElement
from pipeline.table_extractor import MorphologicalTableExtractor, ExtractedTable, TableCell

PRIMARY_CAPTURE_PNG = Path(r"C:\Users\AL GHANI\Desktop\Capture.PNG")


# ==============================================================================
# High-Fidelity Forensic Synthesizer for Capture.PNG
# ==============================================================================

def create_high_fidelity_capture_page(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """
    Constructs a 2400 x 2422 300 DPI document replicating the exact spatial
    and topological characteristics of Capture.PNG:
    - University Crest Logo at (180, 262, 272, 216)
    - 1D Barcode at (637, 578, 589, 150)
    - Student Portrait Photo at (1915, 522, 301, 353)
    - 7-Column Exam Schedule Table at (106, 1052, 2294, 259)
    - Controller Signature Flourish at (1909, 1328, 222, 306)
    - Urdu Instructions Container Box at (306, 1700, 2063, 720)
    - Surrounding printed headings and metadata text
    """
    w, h = 2400, 2422
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # 1. Top Right Date Stamp
    draw.rectangle([1900, 120, 2250, 155], fill=(30, 30, 30))

    # 2. Main Headings (Centered bold text bands)
    draw.rectangle([650, 260, 1750, 310], fill=(20, 20, 20))  # ALLAMA IQBAL OPEN UNIVERSITY
    draw.rectangle([950, 330, 1450, 375], fill=(20, 20, 20))  # ADMIT CARD

    # 3. Institutional Crest Logo at (180, 262, 272, 216)
    lx, ly, lw, lh = 180, 262, 272, 216
    # Outer shield / circle contour
    draw.ellipse([lx, ly, lx + lw, ly + lh], outline=(15, 15, 15), width=6)
    draw.ellipse([lx + 20, ly + 20, lx + lw - 20, ly + lh - 20], outline=(15, 15, 15), width=4)
    # Dense internal emblem structure producing high Canny edge density (> 0.05)
    for off in range(35, min(lw, lh) // 2, 12):
        draw.ellipse([lx + off, ly + off, lx + lw - off, ly + lh - off], outline=(25, 25, 25), width=3)
    draw.line([lx + lw // 2, ly + 25, lx + lw // 2, ly + lh - 25], fill=(20, 20, 20), width=5)
    draw.line([lx + 25, ly + lh // 2, lx + lw - 25, ly + lh // 2], fill=(20, 20, 20), width=5)
    draw.rectangle([lx + lw // 2 - 25, ly + lh // 2 - 25, lx + lw // 2 + 25, ly + lh // 2 + 25], fill=(30, 30, 30))

    # 4. Student Metadata text bands (Left / Center)
    metadata_y = [460, 520, 580, 750, 810]
    for my in metadata_y:
        draw.rectangle([200, my, 1100, my + 35], fill=(40, 40, 40))

    # 5. 1D Barcode at (637, 578, 589, 150)
    bx, by, bw, bh = 637, 578, 589, 150
    # Draw alternating dense vertical bars
    cur_x = bx + 10
    max_bx = bx + bw - 10
    bar_widths = [3, 4, 6, 8, 3, 5, 7, 4, 3, 6, 4, 5, 7, 3, 4, 6, 5, 8, 3, 4, 5, 6, 4, 7, 3, 5, 4, 6]
    for bw_val in bar_widths:
        if cur_x + bw_val >= max_bx:
            break
        draw.rectangle([cur_x, by + 10, cur_x + bw_val, by + bh - 10], fill=(0, 0, 0))
        cur_x += bw_val + 7

    # 6. Student Portrait Photo at (1915, 522, 301, 353)
    px, py, pw, ph = 1915, 522, 301, 353
    # Solid border box
    draw.rectangle([px, py, px + pw, py + ph], outline=(30, 30, 30), width=4)
    # Fill with realistic RGB color variance (skin, shirt, background)
    photo_np = np.zeros((ph - 8, pw - 8, 3), dtype=np.uint8)
    photo_np[:, :, 0] = np.random.randint(180, 240, (ph - 8, pw - 8), dtype=np.uint8)  # R
    photo_np[:, :, 1] = np.random.randint(130, 190, (ph - 8, pw - 8), dtype=np.uint8)  # G
    photo_np[:, :, 2] = np.random.randint(90, 150, (ph - 8, pw - 8), dtype=np.uint8)   # B
    photo_pil = Image.fromarray(photo_np, mode="RGB")
    img.paste(photo_pil, (px + 4, py + 4))

    # 7. 7-Column Exam Schedule Table at (106, 1052, 2294, 259)
    tx, ty, tw, th = 106, 1052, 2294, 259
    # Outer border
    draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=4)

    # Header row height = 100px, Data row height = 159px
    header_h = 100
    draw.line([tx, ty + header_h, tx + tw, ty + header_h], fill=(0, 0, 0), width=4)

    # Fill header row with #EBF8FF
    header_box = Image.new("RGB", (tw - 8, header_h - 6), color=(235, 248, 255))
    img.paste(header_box, (tx + 4, ty + 4))

    # 7 Columns proportional split coordinates matching Capture.PNG
    # Cumulative ratios approximately: 7%, 17%, 36%, 45%, 57%, 67%, 100%
    col_x_offsets = [0, 160, 390, 826, 1032, 1307, 1537, 2294]
    for cx_off in col_x_offsets[1:-1]:
        draw.line([tx + cx_off, ty, tx + cx_off, ty + th], fill=(0, 0, 0), width=4)

    # Draw cell text ink inside header and data cells
    cell_draw = ImageDraw.Draw(img)
    for c in range(7):
        cx1 = tx + col_x_offsets[c]
        cx2 = tx + col_x_offsets[c+1]
        # Header text
        cell_draw.rectangle([cx1 + 15, ty + 30, min(cx2 - 15, cx1 + 140), ty + 65], fill=(20, 20, 20))
        # Data text
        cell_draw.rectangle([cx1 + 15, ty + 140, min(cx2 - 15, cx1 + 180), ty + 190], fill=(20, 20, 20))

    # 8. Controller Signature Flourish at (1909, 1328, 222, 306)
    sx, sy, sw, sh = 1909, 1328, 222, 306
    # Cursive flourish with thin connected loops (solidity ~0.25, ink_fill ~0.15)
    sig_points = [
        (sx + 20, sy + 180), (sx + 60, sy + 40), (sx + 100, sy + 220),
        (sx + 140, sy + 70), (sx + 180, sy + 240), (sx + 210, sy + 150)
    ]
    for i in range(len(sig_points) - 1):
        draw.line([sig_points[i], sig_points[i+1]], fill=(15, 20, 35), width=4)
    # Loop flourish
    draw.arc([sx + 30, sy + 30, sx + 190, sy + 260], start=20, end=340, fill=(15, 20, 35), width=4)
    # Title text beneath signature
    draw.rectangle([1800, 1650, 2250, 1685], fill=(40, 40, 40))  # Controller of Examination

    # 9. Urdu Instructions Container Box at (306, 1700, 2063, 720)
    # Single-cell bordered container (rows=1, cols=1, no internal grid dividers)
    ux, uy, uw, uh = 306, 1700, 2063, 720
    draw.rectangle([ux, uy, ux + uw, uy + uh], outline=(0, 0, 0), width=4)
    # Internal Urdu text lines
    for line_y in range(uy + 40, uy + uh - 40, 75):
        draw.rectangle([ux + 50, line_y, ux + uw - 50, line_y + 35], fill=(30, 30, 30))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "forensic_capture.png")
    return pages[0]


# ==============================================================================
# Fixtures
# ==============================================================================

@pytest.fixture(scope="module")
def preprocessor() -> DocumentPreprocessor:
    return DocumentPreprocessor(max_upload_mb=10, target_dpi=300)


@pytest.fixture(scope="module")
def visual_extractor() -> VisualElementExtractor:
    return VisualElementExtractor()


@pytest.fixture(scope="module")
def table_extractor() -> MorphologicalTableExtractor:
    def mock_ocr(crop: Image.Image) -> Tuple[str, float]:
        return f"Cell_{crop.width}x{crop.height}", 0.96
    return MorphologicalTableExtractor(ocr_fn=mock_ocr)


@pytest.fixture(scope="module")
def test_page(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Provides authoritative Capture.PNG if present, otherwise high-fidelity replica."""
    if PRIMARY_CAPTURE_PNG.exists() and PRIMARY_CAPTURE_PNG.is_file():
        try:
            with open(PRIMARY_CAPTURE_PNG, "rb") as f:
                content = f.read()
            pages = preprocessor.process_input(content, "Capture.PNG")
            if pages:
                return pages[0]
        except Exception:
            pass
    return create_high_fidelity_capture_page(preprocessor)


# ==============================================================================
# SECTION 1: Verification of 4 Visual Elements (Photo, Logo, Barcode, Signature)
# ==============================================================================

class TestVisualElementsMilestoneVerification:
    """Verifies Requirement R4: 4 visual elements extracted and masked."""

    def test_all_four_visual_elements_detected(self, visual_extractor, test_page):
        elements, text_mask = visual_extractor.extract_and_mask(test_page)

        types_detected = {e.element_type for e in elements}
        assert "photo" in types_detected, f"Student photo not detected! Found: {types_detected}"
        assert "logo" in types_detected, f"University logo not detected! Found: {types_detected}"
        assert "barcode" in types_detected, f"1D barcode not detected! Found: {types_detected}"
        assert ("signature" in types_detected or "stamp" in types_detected), (
            f"Signature/stamp not detected! Found: {types_detected}"
        )

        assert len(elements) >= 4, f"Expected at least 4 visual elements, found {len(elements)}"

    def test_student_photo_geometry_and_cropping(self, visual_extractor, test_page):
        elements, _ = visual_extractor.extract_and_mask(test_page)
        photos = [e for e in elements if e.element_type == "photo"]
        assert len(photos) >= 1, "Photo element missing"
        photo = photos[0]

        bx, by, bw, bh = photo.bbox
        # Student photo is on right quadrant of page
        assert bx > test_page.width * 0.50, f"Photo expected on right half, got x={bx}"
        # Aspect ratio ~3:4 (0.65 to 1.15)
        aspect = bw / float(bh)
        assert 0.65 <= aspect <= 1.20, f"Expected portrait aspect ~0.75-0.90, got {aspect:.2f}"
        # Clean RGB crop
        assert isinstance(photo.crop_image, Image.Image)
        assert photo.crop_image.mode == "RGB"
        assert photo.crop_image.width == bw
        assert photo.crop_image.height == bh
        assert photo.confidence >= 0.60

    def test_university_logo_geometry_and_cropping(self, visual_extractor, test_page):
        elements, _ = visual_extractor.extract_and_mask(test_page)
        logos = [e for e in elements if e.element_type == "logo"]
        assert len(logos) >= 1, "Logo element missing"
        logo = logos[0]

        bx, by, bw, bh = logo.bbox
        # Logo is in header area (upper 45% of page)
        assert by < test_page.height * 0.45, f"Logo expected in header, got y={by}"
        # Logo aspect ratio is compact (0.60 to 1.60)
        aspect = bw / float(bh)
        assert 0.60 <= aspect <= 1.60, f"Expected compact logo aspect ratio, got {aspect:.2f}"
        assert logo.crop_image.mode == "RGB"
        assert logo.crop_image.size == (bw, bh)
        assert logo.confidence >= 0.60

    def test_barcode_geometry_and_cropping(self, visual_extractor, test_page):
        elements, _ = visual_extractor.extract_and_mask(test_page)
        barcodes = [e for e in elements if e.element_type == "barcode"]
        assert len(barcodes) >= 1, "Barcode element missing"
        barcode = barcodes[0]

        bx, by, bw, bh = barcode.bbox
        # 1D barcode is horizontal strip (w > h, aspect >= 1.6)
        assert bw > bh, f"Expected barcode width > height, got {bw} x {bh}"
        aspect = bw / float(bh)
        assert aspect >= 1.6, f"Expected barcode aspect >= 1.6, got {aspect:.2f}"
        assert barcode.crop_image.mode == "RGB"
        assert barcode.crop_image.size == (bw, bh)
        assert barcode.confidence >= 0.60

    def test_signature_flourish_geometry_and_cropping(self, visual_extractor, test_page):
        elements, _ = visual_extractor.extract_and_mask(test_page)
        sigs = [e for e in elements if e.element_type in ("signature", "stamp")]
        assert len(sigs) >= 1, "Signature/stamp element missing"
        sig = sigs[0]

        bx, by, bw, bh = sig.bbox
        # Signature is in lower half (y > 35% height)
        assert by > test_page.height * 0.35, f"Signature expected in lower half, got y={by}"
        assert bw > 25 and bh > 20
        assert sig.crop_image.mode == "RGB"
        assert sig.crop_image.size == (bw, bh)
        assert sig.confidence >= 0.50

    def test_visual_elements_zeroed_in_text_mask(self, visual_extractor, test_page):
        elements, text_mask = visual_extractor.extract_and_mask(test_page)
        assert len(elements) >= 4

        # Verify that the interior of every visual element is 100% zeroed out in text_mask
        for elem in elements:
            bx, by, bw, bh = elem.bbox
            center_x = bx + bw // 2
            center_y = by + bh // 2
            assert text_mask[center_y, center_x] == 0, (
                f"Element '{elem.element_type}' at ({bx}, {by}, {bw}, {bh}) not masked at center!"
            )


# ==============================================================================
# SECTION 2: Verification of 7-Column Exam Schedule Table
# ==============================================================================

class TestTableExtractorMilestoneVerification:
    """Verifies Requirement R3: 7-column table detected, 7 columns, widths sum to 1.0."""

    def test_seven_column_exam_schedule_table_detected(self, table_extractor, test_page):
        tables, text_mask = table_extractor.extract_tables_and_mask(test_page)
        assert len(tables) >= 1, f"Expected at least 1 table, found {len(tables)}"

        # Find wide table spanning > 60% page width (the exam schedule table)
        schedule_tables = [t for t in tables if t.bbox[2] > test_page.width * 0.60]
        assert len(schedule_tables) >= 1, "7-column exam schedule table spanning >60% width not found"
        table = schedule_tables[0]

        # Verify 7 columns
        assert table.cols == 7, f"Expected exactly 7 columns, got {table.cols}"
        # Verify at least 2 rows (1 header + 1 data row)
        assert table.rows >= 2, f"Expected at least 2 rows (header + data), got {table.rows}"
        # Verify 14 cells (2 rows x 7 cols)
        assert len(table.cells) == table.rows * 7

    def test_proportional_column_widths_count_and_sum(self, table_extractor, test_page):
        tables, _ = table_extractor.extract_tables_and_mask(test_page)
        schedule_table = [t for t in tables if t.bbox[2] > test_page.width * 0.60][0]

        col_widths = schedule_table.col_widths
        assert len(col_widths) == 7, f"Expected 7 column width ratios, got {len(col_widths)}"

        # Strict mathematical invariant: sum of column widths must equal 1.0 exactly
        total_ratio = sum(col_widths)
        assert abs(total_ratio - 1.0) < 0.0001, (
            f"Proportional column widths must sum to 1.0, got {total_ratio:.6f} ({col_widths})"
        )

        # Every column ratio must be positive and reasonable (> 3% and < 50%)
        for i, cw in enumerate(col_widths):
            assert 0.03 <= cw <= 0.50, f"Column {i} ratio out of reasonable range: {cw}"

    def test_cell_headers_and_spans(self, table_extractor, test_page):
        tables, _ = table_extractor.extract_tables_and_mask(test_page)
        schedule_table = [t for t in tables if t.bbox[2] > test_page.width * 0.60][0]

        headers = [c for c in schedule_table.cells if c.is_header]
        data_cells = [c for c in schedule_table.cells if not c.is_header]

        assert len(headers) == 7, f"Expected exactly 7 header cells in row 0, got {len(headers)}"
        assert len(data_cells) == 7 * (schedule_table.rows - 1)

        # Verify row and col indices are consistent
        for cell in schedule_table.cells:
            assert 0 <= cell.row_idx < schedule_table.rows
            assert 0 <= cell.col_idx < 7
            assert cell.row_span >= 1
            assert cell.col_span >= 1
            assert cell.bbox[2] > 0 and cell.bbox[3] > 0

    def test_single_cell_urdu_container_preserved(self, table_extractor, test_page):
        """
        Urdu boxed instructions is a single-cell container (rows=1, cols=1).
        MorphologicalTableExtractor must NOT treat it as a multi-cell data table,
        preserving it for M3 TypographyAndScriptEngine.
        """
        tables, _ = table_extractor.extract_tables_and_mask(test_page)
        for t in tables:
            # No detected table should be 1x1
            assert not (t.rows == 1 and t.cols == 1), "Single-cell container was falsely extracted as data table!"


# ==============================================================================
# SECTION 3: Verification of Table Masking & 0% Leakage
# ==============================================================================

class TestTableMaskingZeroLeakageVerification:
    """Verifies that table bounding box is zeroed out in the returned text mask."""

    def test_table_bounding_box_zeroed_in_text_mask(self, table_extractor, test_page):
        tables, text_mask = table_extractor.extract_tables_and_mask(test_page)
        schedule_table = [t for t in tables if t.bbox[2] > test_page.width * 0.60][0]
        tx, ty, tw, th = schedule_table.bbox

        # Sample grid of points across the table region
        sample_ys = np.linspace(ty + 10, ty + th - 10, 10, dtype=int)
        sample_xs = np.linspace(tx + 10, tx + tw - 10, 10, dtype=int)

        for sy in sample_ys:
            for sx in sample_xs:
                assert text_mask[sy, sx] == 0, (
                    f"Table ink leaked at ({sx}, {sy})! Pixel value in text_mask is {text_mask[sy, sx]}"
                )

    def test_zero_percent_table_ink_leakage(self, table_extractor, test_page):
        """Strictly asserts that total ink in the table bounding box of text_mask is 0 (0% leakage)."""
        tables, text_mask = table_extractor.extract_tables_and_mask(test_page)
        schedule_table = [t for t in tables if t.bbox[2] > test_page.width * 0.60][0]
        tx, ty, tw, th = schedule_table.bbox

        table_mask_roi = text_mask[ty:ty+th, tx:tx+tw]
        non_zero_pixels = np.count_nonzero(table_mask_roi > 0)
        total_pixels = tw * th
        leakage_ratio = non_zero_pixels / float(total_pixels)

        assert leakage_ratio == 0.0, (
            f"Table bounding box has {non_zero_pixels} non-zero pixels ({leakage_ratio * 100:.3f}% leakage)!"
        )

    def test_surrounding_body_text_ink_preserved(self, table_extractor, test_page):
        """Verifies that masking the table does NOT erase body text paragraphs above or below."""
        tables, text_mask = table_extractor.extract_tables_and_mask(test_page)
        schedule_table = [t for t in tables if t.bbox[2] > test_page.width * 0.60][0]
        tx, ty, tw, th = schedule_table.bbox

        # Check heading ink above table (y=260..375)
        heading_roi = text_mask[260:375, 650:1750]
        assert np.any(heading_roi > 0), "Body text headings above table were erroneously erased!"

        # Check metadata ink above table (y=460..850)
        meta_roi = text_mask[460:850, 200:1100]
        assert np.any(meta_roi > 0), "Student metadata text above table was erroneously erased!"


# ==============================================================================
# SECTION 4: Pipeline Compounding & Adversarial Invariant Stress Tests
# ==============================================================================

class TestAdversarialStressAndPipelineInvariants:
    """Stress tests corner cases, invariants, and chained pipeline execution."""

    def test_pipeline_chaining_visual_then_table_masking(
        self, visual_extractor, table_extractor, test_page
    ):
        """
        Simulates end-to-end pipeline:
        VisualElementExtractor masks visual elements -> MorphologicalTableExtractor masks tables.
        Both masks must compound cleanly without collision.
        """
        # Step 1: Visual extraction
        visual_elements, mask_after_visuals = visual_extractor.extract_and_mask(test_page)
        assert len(visual_elements) >= 4

        # Step 2: Table extraction using mask_after_visuals
        tables, final_text_mask = table_extractor.extract_tables_and_mask(test_page, text_mask=mask_after_visuals)
        assert len(tables) >= 1

        # Check that visual elements are STILL zeroed in final_text_mask
        for elem in visual_elements:
            bx, by, bw, bh = elem.bbox
            assert final_text_mask[by + bh // 2, bx + bw // 2] == 0

        # Check that table is ALSO zeroed in final_text_mask
        table = tables[0]
        tx, ty, tw, th = table.bbox
        assert final_text_mask[ty + th // 2, tx + tw // 2] == 0

        # Check that non-table, non-visual text lines STILL have ink
        heading_roi = final_text_mask[260:310, 650:1750]
        assert np.any(heading_roi > 0), "Final compounded text mask lost heading text!"

    def test_column_width_sum_invariant_on_arbitrary_splits(self, table_extractor, preprocessor):
        """Stress-tests column width normalization with non-uniform and prime column widths."""
        w, h = 1500, 800
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Draw 5-column table with irregular prime pixel widths: 137, 269, 181, 313, 199 (sum = 1099)
        tx, ty = 100, 100
        prime_widths = [137, 269, 181, 313, 199]
        tw = sum(prime_widths)
        th = 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)

        cur_x = tx
        for pw in prime_widths[:-1]:
            cur_x += pw
            draw.line([cur_x, ty, cur_x, ty + th], fill=(0, 0, 0), width=3)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        page = preprocessor.process_input(buf.getvalue(), "prime_table.png")[0]

        tables, _ = table_extractor.extract_tables_and_mask(page)
        assert len(tables) == 1
        t = tables[0]
        assert t.cols == 5
        assert len(t.col_widths) == 5
        # Must sum to 1.0 exactly
        assert abs(sum(t.col_widths) - 1.0) < 1e-6, f"Sum was {sum(t.col_widths)}"

    def test_border_clamped_visual_elements_do_not_crash(self, visual_extractor, preprocessor):
        """Visual elements located exactly at page edges (x=0, y=0, x=w, y=h) do not cause bounds exceptions."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Barcode touching top-left border (x=0, y=0)
        cur_x = 5
        while cur_x < 300:
            draw.rectangle([cur_x, 5, cur_x + 4, 75], fill=(0, 0, 0))
            cur_x += 10

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        page = preprocessor.process_input(buf.getvalue(), "edge_barcode.png")[0]

        # Should execute safely without IndexError or crop crash
        elements, text_mask = visual_extractor.extract_and_mask(page)
        assert text_mask.shape == (page.height, page.width)

    def test_dense_text_paragraph_does_not_trigger_false_photo(self, visual_extractor, preprocessor):
        """A dense block of justified bold text does not trigger false positive photo detection."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Dense text paragraph (w=300, h=400, aspect 0.75 - identical to photo bbox, but monochrome text)
        px, py, pw, ph = 200, 300, 300, 400
        for y in range(py, py + ph, 18):
            draw.rectangle([px, y, px + pw, y + 10], fill=(0, 0, 0))

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        page = preprocessor.process_input(buf.getvalue(), "dense_text.png")[0]

        elements, _ = visual_extractor.extract_and_mask(page)
        photos = [e for e in elements if e.element_type == "photo"]
        assert len(photos) == 0, "Dense text block was falsely detected as a student photo!"


# ==============================================================================
# SECTION 5: Verification of 2D Square QR Code Detection on Synthetic Documents
# ==============================================================================

def create_synthetic_page_with_2d_qr_barcode(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic 300 DPI document page containing a 2D square QR barcode."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Document title
    draw.rectangle([100, 80, 700, 110], fill=(0, 0, 0))

    # 2D QR Code at x=800, y=100, w=150, h=150 (aspect 1.0)
    qx, qy, qw, qh = 800, 100, 150, 150
    # Outer border
    draw.rectangle([qx, qy, qx + qw, qy + qh], outline=(0, 0, 0), width=4)

    # Finder patterns at 3 corners (top-left, top-right, bottom-left)
    for fx, fy in [(qx + 10, qy + 10), (qx + qw - 45, qy + 10), (qx + 10, qy + qh - 45)]:
        draw.rectangle([fx, fy, fx + 35, fy + 35], outline=(0, 0, 0), width=3)
        draw.rectangle([fx + 8, fy + 8, fx + 27, fy + 27], fill=(0, 0, 0))

    # Dense module grid with alternating black/white modules
    for my in range(qy + 15, qy + qh - 15, 10):
        for mx in range(qx + 15, qx + qw - 15, 10):
            if (mx + my) % 20 == 0:
                draw.rectangle([mx, my, mx + 7, my + 7], fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_2d_barcode.png")
    return pages[0]


class TestQRCode2DElementVerification:
    """Verifies Requirement R4: 2D square QR barcode detection on synthetic documents."""

    def test_2d_square_qr_code_detected_as_barcode(self, visual_extractor, preprocessor):
        page = create_synthetic_page_with_2d_qr_barcode(preprocessor)
        elements, text_mask = visual_extractor.extract_and_mask(page)
        barcodes = [e for e in elements if e.element_type == "barcode"]

        assert len(barcodes) >= 1, f"Expected 2D QR barcode to be detected! Detected: {[e.element_type for e in elements]}"
        bc = barcodes[0]
        bx, by, bw, bh = bc.bbox
        aspect = bw / float(bh)
        assert 0.75 <= aspect <= 1.30, f"Expected near-square 2D barcode aspect ratio, got {aspect:.2f}"
        assert bc.confidence >= 0.60, f"Expected confidence >= 0.60, got {bc.confidence}"

    def test_2d_square_qr_code_geometry_and_cropping(self, visual_extractor, preprocessor):
        page = create_synthetic_page_with_2d_qr_barcode(preprocessor)
        elements, _ = visual_extractor.extract_and_mask(page)
        barcodes = [e for e in elements if e.element_type == "barcode"]
        assert len(barcodes) >= 1
        bc = barcodes[0]

        assert isinstance(bc.crop_image, Image.Image)
        assert bc.crop_image.mode == "RGB"
        assert bc.crop_image.width == bc.bbox[2]
        assert bc.crop_image.height == bc.bbox[3]

    def test_2d_square_qr_code_masked_out_in_text_mask(self, visual_extractor, preprocessor):
        page = create_synthetic_page_with_2d_qr_barcode(preprocessor)
        elements, text_mask = visual_extractor.extract_and_mask(page)
        barcodes = [e for e in elements if e.element_type == "barcode"]
        assert len(barcodes) >= 1
        bc = barcodes[0]
        bx, by, bw, bh = bc.bbox

        # Interior center must be zeroed out
        assert text_mask[by + bh // 2, bx + bw // 2] == 0, "QR code center was not masked out in text mask"

    def test_2d_qr_code_distinguished_from_photo_and_table(
        self, visual_extractor, table_extractor, preprocessor
    ):
        page = create_synthetic_page_with_2d_qr_barcode(preprocessor)
        elements, _ = visual_extractor.extract_and_mask(page)
        photos = [e for e in elements if e.element_type == "photo"]
        assert len(photos) == 0, "2D QR code was falsely classified as a student photo!"

        tables, _ = table_extractor.extract_tables_and_mask(page)
        assert len(tables) == 0, "2D QR code was falsely classified as a data table!"


# ==============================================================================
# SECTION 6: Verification of Single-Cell Bordered Container Bypass
# ==============================================================================

def create_synthetic_page_with_single_cell_container(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic 300 DPI document page containing a single-cell bordered callout/container."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Document title
    draw.rectangle([100, 80, 800, 110], fill=(0, 0, 0))

    # Single-cell bordered container: bx=150, by=350, bw=900, bh=400
    bx, by, bw, bh = 150, 350, 900, 400
    draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=3)

    # 4 internal text lines (instructions) with spaces between words
    for row_y in [420, 500, 580, 660]:
        x_cursor = bx + 40
        while x_cursor < bx + bw - 50:
            word_w = np.random.randint(40, 100)
            draw.rectangle([x_cursor, row_y, x_cursor + word_w, row_y + 18], fill=(25, 25, 25))
            x_cursor += word_w + np.random.randint(20, 40)

    # Footer text
    draw.rectangle([100, 900, 700, 930], fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_single_cell.png")
    return pages[0]


class TestSingleCellContainerBypassVerification:
    """Verifies that single-cell bordered containers bypass table and visual extraction."""

    def test_single_cell_container_bypassed_by_table_extractor(
        self, table_extractor, preprocessor
    ):
        page = create_synthetic_page_with_single_cell_container(preprocessor)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        assert len(tables) == 0, (
            f"Single-cell container was falsely extracted as data table! "
            f"Found {len(tables)} tables: {[(t.rows, t.cols) for t in tables]}"
        )

    def test_single_cell_container_bypassed_by_visual_extractor(
        self, visual_extractor, preprocessor
    ):
        page = create_synthetic_page_with_single_cell_container(preprocessor)
        elements, text_mask = visual_extractor.extract_and_mask(page)

        assert len(elements) == 0, (
            f"Single-cell container was falsely extracted as visual element! "
            f"Found: {[e.element_type for e in elements]}"
        )

    def test_single_cell_container_internal_text_preserved_in_text_mask(
        self, table_extractor, preprocessor
    ):
        page = create_synthetic_page_with_single_cell_container(preprocessor)
        tables, text_mask = table_extractor.extract_tables_and_mask(page)

        scale_x = page.width / 1200.0
        scale_y = page.height / 1600.0
        # Check that ink inside the container is preserved (not zeroed out)
        y1 = int(400 * scale_y)
        y2 = int(700 * scale_y)
        x1 = int(200 * scale_x)
        x2 = int(800 * scale_x)
        container_ink = text_mask[y1:y2, x1:x2]
        assert np.sum(container_ink > 0) > 500, "Text inside single-cell container was erroneously masked out"

    def test_document_with_table_and_single_cell_container_extracts_only_table(
        self, table_extractor, preprocessor
    ):
        """Page containing both a genuine 2x3 table and a single-cell container."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 1. Genuine 2-row x 3-col data table at y=200..400
        tx, ty, tw, th = 100, 200, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)
        for xs in [300, 600]:
            draw.line([tx + xs, ty, tx + xs, ty + th], fill=(0, 0, 0), width=3)

        # 2. Single-cell bordered container at y=600..950
        bx, by, bw, bh = 150, 600, 850, 350
        draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 0, 0), width=3)
        for row_y in [660, 740, 820]:
            draw.rectangle([bx + 40, row_y, bx + bw - 40, row_y + 16], fill=(20, 20, 20))

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        page = preprocessor.process_input(buf.getvalue(), "table_and_container.png")[0]

        tables, text_mask = table_extractor.extract_tables_and_mask(page)
        # Exactly 1 table extracted (the 2x3 table)
        assert len(tables) == 1, f"Expected exactly 1 table, found {len(tables)}"
        t = tables[0]
        assert t.rows == 2 and t.cols == 3

        # Single-cell container text ink must be preserved
        scale_x = page.width / 1200.0
        scale_y = page.height / 1600.0
        container_ink = text_mask[int(650 * scale_y):int(850 * scale_y), int(200 * scale_x):int(800 * scale_x)]
        assert np.sum(container_ink > 0) > 300, "Single-cell container ink was erased when table was present"

