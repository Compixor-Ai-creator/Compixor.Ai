"""
Comprehensive Unit Test Suite for Morphological Table Extractor (R3).
Conforms to PROJECT.md § Interface Contracts § 3 and Acceptance Criteria.

Covers:
1. Synthetic table detection & grid morphology (horizontal & vertical kernels)
2. Cell segmentation & bounding box accuracy (rows, cols, cell count)
3. Proportional column width calculations (ratios matching image geometry, sum = 1.0)
4. Isolated per-cell OCR and alignment inference
5. Table region masking (table bbox set to 0 in updated text mask, body text preserved)
6. Negative testing on documents with no tables (empty table list, uncorrupted mask)
7. Real-world validation on Capture.PNG (7-column exam schedule table).
"""

import io
import os
from pathlib import Path
from typing import Tuple

import numpy as np
import pytest
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage
from pipeline.table_extractor import MorphologicalTableExtractor, ExtractedTable, TableCell

CAPTURE_PNG_PATH = Path(r"C:\Users\AL GHANI\Desktop\Capture.PNG")


@pytest.fixture
def preprocessor() -> DocumentPreprocessor:
    return DocumentPreprocessor(max_upload_mb=10, target_dpi=300)


@pytest.fixture
def mock_ocr_fn():
    """Mock OCR function returning deterministic strings based on cell dimensions."""
    def _ocr(crop: Image.Image) -> Tuple[str, float]:
        # Return simple mock string
        return f"Cell_{crop.width}x{crop.height}", 0.95
    return _ocr


@pytest.fixture
def table_extractor(mock_ocr_fn) -> MorphologicalTableExtractor:
    return MorphologicalTableExtractor(ocr_fn=mock_ocr_fn)


@pytest.fixture
def synthetic_page_with_grid_table(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """
    Creates a synthetic 300 DPI document page containing a 2-row, 3-column table
    with clear grid lines and surrounding body text.
    """
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Paragraph text above table
    draw.rectangle([100, 100, 800, 125], fill=(0, 0, 0))
    draw.rectangle([100, 150, 700, 175], fill=(0, 0, 0))

    # Table specifications: tx=100, ty=300, tw=900, th=200
    # 2 rows: row 0 (header) height=80, row 1 (data) height=120
    # 3 columns: col 0 width=200, col 1 width=400, col 2 width=300
    tx, ty, tw, th = 100, 300, 900, 200
    x_splits = [0, 200, 600, 900]
    y_splits = [0, 80, 200]

    # Draw outer border
    draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)

    # Draw horizontal divider
    draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)

    # Draw vertical dividers
    for xs in [200, 600]:
        draw.line([tx + xs, ty, tx + xs, ty + th], fill=(0, 0, 0), width=3)

    # Shading for header row
    header_fill = Image.new("RGB", (tw - 6, 76), color=(235, 248, 255))
    img.paste(header_fill, (tx + 3, ty + 3))

    # Draw sample text markers inside each cell (realistic text strokes rather than solid blocks)
    cell_draw = ImageDraw.Draw(img)
    # Header cells - realistic text strokes (height 12-14px with spaces between words)
    cell_draw.rectangle([tx + 30, ty + 25, tx + 90, ty + 38], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 105, ty + 25, tx + 160, ty + 38], fill=(20, 20, 20))

    cell_draw.rectangle([tx + 240, ty + 25, tx + 330, ty + 38], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 350, ty + 25, tx + 450, ty + 38], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 470, ty + 25, tx + 560, ty + 38], fill=(20, 20, 20))

    cell_draw.rectangle([tx + 640, ty + 25, tx + 730, ty + 38], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 750, ty + 25, tx + 840, ty + 38], fill=(20, 20, 20))

    # Data cells - realistic text strokes
    cell_draw.rectangle([tx + 30, ty + 125, tx + 100, ty + 138], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 115, ty + 125, tx + 165, ty + 138], fill=(20, 20, 20))

    cell_draw.rectangle([tx + 240, ty + 125, tx + 350, ty + 138], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 370, ty + 125, tx + 480, ty + 138], fill=(20, 20, 20))

    cell_draw.rectangle([tx + 640, ty + 125, tx + 740, ty + 138], fill=(20, 20, 20))
    cell_draw.rectangle([tx + 760, ty + 125, tx + 830, ty + 138], fill=(20, 20, 20))

    # Paragraph text below table
    draw.rectangle([100, 600, 800, 625], fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_table.png")
    return pages[0]


@pytest.fixture
def page_without_table(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a document containing only text and no tables."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    for y in range(100, 1200, 60):
        draw.rectangle([100, y, 900, y + 20], fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "no_table.png")
    return pages[0]


class TestTableGridDetectionAndSegmentation:
    """Tests morphological table grid line detection and cell segmentation."""

    def test_detects_grid_table_rows_and_cols(self, table_extractor, synthetic_page_with_grid_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(synthetic_page_with_grid_table)

        assert len(tables) == 1, f"Expected exactly 1 table, found {len(tables)}"
        table = tables[0]

        assert table.rows == 2, f"Expected 2 rows, got {table.rows}"
        assert table.cols == 3, f"Expected 3 columns, got {table.cols}"
        assert len(table.cells) == 6, f"Expected 6 cells (2x3), got {len(table.cells)}"

        # Check table bounding box accounting for 300 DPI normalization scale
        scale_x = synthetic_page_with_grid_table.width / 1200.0
        scale_y = synthetic_page_with_grid_table.height / 1600.0
        tx, ty, tw, th = table.bbox
        assert int(80 * scale_x) <= tx <= int(120 * scale_x)
        assert int(280 * scale_y) <= ty <= int(320 * scale_y)
        assert int(870 * scale_x) <= tw <= int(930 * scale_x)
        assert int(180 * scale_y) <= th <= int(220 * scale_y)

    def test_proportional_column_widths_sum_to_one(self, table_extractor, synthetic_page_with_grid_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(synthetic_page_with_grid_table)
        assert len(tables) >= 1
        table = tables[0]

        col_widths = table.col_widths
        assert len(col_widths) == 3
        # Synthetic table col widths were 200, 400, 300 out of 900 -> approx 22.2%, 44.4%, 33.3%
        assert 0.18 <= col_widths[0] <= 0.26
        assert 0.40 <= col_widths[1] <= 0.48
        assert 0.29 <= col_widths[2] <= 0.37
        assert abs(sum(col_widths) - 1.0) < 0.001, f"Column widths must sum to 1.0, got {sum(col_widths)}"

    def test_cell_headers_and_indices(self, table_extractor, synthetic_page_with_grid_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(synthetic_page_with_grid_table)
        table = tables[0]

        header_cells = [c for c in table.cells if c.is_header]
        data_cells = [c for c in table.cells if not c.is_header]

        assert len(header_cells) == 3, "Row 0 should have 3 header cells"
        assert len(data_cells) == 3, "Row 1 should have 3 data cells"

        # Check row and col indices
        for cell in table.cells:
            assert cell.row_idx in (0, 1)
            assert cell.col_idx in (0, 1, 2)
            assert cell.row_span == 1
            assert cell.col_span == 1
            assert cell.bbox[2] > 0 and cell.bbox[3] > 0

    def test_merged_header_cell_spans(self, table_extractor, preprocessor):
        """A table with a merged header row across all columns must resolve col_span > 1."""
        w, h = 1200, 1600
        img = Image.new("RGB", (w, h), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # 2-row, 3-column table with row 0 merged across all 3 columns
        tx, ty, tw, th = 100, 300, 900, 200
        draw.rectangle([tx, ty, tx + tw, ty + th], outline=(0, 0, 0), width=3)
        draw.line([tx, ty + 80, tx + tw, ty + 80], fill=(0, 0, 0), width=3)
        # Vertical dividers only in row 1 (data row from ty+80 to ty+th)
        for xs in [300, 600]:
            draw.line([tx + xs, ty + 80, tx + xs, ty + th], fill=(0, 0, 0), width=3)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        page = preprocessor.process_input(buf.getvalue(), "merged_header_table.png")[0]

        tables, _ = table_extractor.extract_tables_and_mask(page)
        assert len(tables) == 1
        table = tables[0]
        header_cells = [c for c in table.cells if c.is_header]
        assert len(header_cells) == 1
        assert header_cells[0].col_span == 3
        assert header_cells[0].row_span == 1

    def test_cell_ocr_execution(self, table_extractor, synthetic_page_with_grid_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(synthetic_page_with_grid_table)
        table = tables[0]

        for cell in table.cells:
            assert cell.text.startswith("Cell_"), f"Unexpected cell OCR text: {cell.text}"
            assert cell.confidence > 0.5


class TestTableRegionMasking:
    """Verifies that all detected table regions are masked out (set to 0) from the text mask."""

    def test_table_region_is_zeroed_in_text_mask(self, table_extractor, synthetic_page_with_grid_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(synthetic_page_with_grid_table)
        assert len(tables) >= 1
        table = tables[0]
        tx, ty, tw, th = table.bbox

        # Sample points inside table must be 0 in text_mask
        center_x = tx + tw // 2
        center_y = ty + th // 2
        assert text_mask[center_y, center_x] == 0, "Table interior was not masked out in text_mask"

        # Check corners of table region
        assert text_mask[ty + 10, tx + 10] == 0
        assert text_mask[ty + th - 10, tx + tw - 10] == 0

    def test_surrounding_body_text_is_retained_in_text_mask(self, table_extractor, synthetic_page_with_grid_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(synthetic_page_with_grid_table)
        # Header text was drawn at y=100..125, y=150..175 on 1200x1600 canvas
        # Bottom paragraph was drawn at y=600..625
        # Check that ink pixels remain preserved, accounting for 300 DPI normalization scale
        scale_x = synthetic_page_with_grid_table.width / 1200.0
        scale_y = synthetic_page_with_grid_table.height / 1600.0
        top_ink = text_mask[int(105 * scale_y):int(120 * scale_y), int(200 * scale_x):int(500 * scale_x)]
        bottom_ink = text_mask[int(605 * scale_y):int(620 * scale_y), int(200 * scale_x):int(500 * scale_x)]

        assert np.any(top_ink > 0), "Body text above table was erroneously masked out"
        assert np.any(bottom_ink > 0), "Body text below table was erroneously masked out"

    def test_document_without_tables_preserves_text_mask(self, table_extractor, page_without_table):
        tables, text_mask = table_extractor.extract_tables_and_mask(page_without_table)
        assert len(tables) == 0, f"Expected 0 tables on text-only document, found {len(tables)}"

        # Text mask should preserve text lines
        assert np.sum(text_mask > 0) > 1000, "Text mask should retain text lines when no tables exist"


class TestRealWorldCaptureTableExtraction:
    """Tests 7-column exam schedule table extraction on real-world sample (Capture.PNG)."""

    @pytest.mark.skipif(not CAPTURE_PNG_PATH.exists(), reason="Capture.PNG not present on host")
    def test_capture_png_7_column_table_detection(self, preprocessor):
        with open(CAPTURE_PNG_PATH, "rb") as f:
            file_bytes = f.read()

        pages = preprocessor.process_input(file_bytes, "Capture.PNG")
        page = pages[0]

        extractor = MorphologicalTableExtractor()
        tables, text_mask = extractor.extract_tables_and_mask(page)

        # In Capture.PNG: The 7-column exam schedule table is present
        assert len(tables) >= 1, "Expected exam schedule table in Capture.PNG"

        # Find the exam schedule table (spans majority of page width)
        exam_tables = [t for t in tables if t.bbox[2] > page.width * 0.70]
        assert len(exam_tables) >= 1, "Expected wide exam schedule table spanning >70% page width"

        table = exam_tables[0]
        assert table.cols == 7, f"Expected 7 columns in exam schedule table, got {table.cols}"
        assert table.rows >= 2, f"Expected at least 2 rows (header + data), got {table.rows}"
        assert len(table.col_widths) == 7

        # Check proportional widths
        assert abs(sum(table.col_widths) - 1.0) < 0.005, f"Column widths must sum to 1.0, got {sum(table.col_widths)}"

        # Check table is masked out in text mask
        tx, ty, tw, th = table.bbox
        assert text_mask[ty + th // 2, tx + tw // 2] == 0
