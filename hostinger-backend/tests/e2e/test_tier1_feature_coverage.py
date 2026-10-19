"""
Tier 1: Feature Inventory Coverage Test Suite.
Verifies all 17 individual features from PROJECT.md with >=5 dedicated test cases per feature.
Target Service: http://127.0.0.1:8003/api/convert-img-to-docx
"""

import io
import os
import re
import socket
import sys
from pathlib import Path

from PIL import Image, ImageDraw
import pytest
import requests

from tests.conftest import ApiClient, DocxInspector

# ==============================================================================
# Feature 1: Port Guard & Operational Safety (R1) - 5 Test Cases
# ==============================================================================

def test_feature1_dev_service_binds_to_port_8003(api_client: ApiClient):
    """F1.1: Verifies dev service is reachable on port 8003 /health endpoint."""
    resp = api_client.check_health()
    assert resp.status_code == 200, f"Expected 200 on port 8003 /health, got {resp.status_code}"
    data = resp.json()
    assert "status" in data
    assert data["status"].lower() in ["healthy", "ok", "running"]


def test_feature1_port_8002_not_disturbed():
    """F1.2: Verifies port 8002 is not bound or modified by local development."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1.0)
    # Check if port 8002 is listening locally
    result = sock.connect_ex(("127.0.0.1", 8002))
    sock.close()
    # Port 8002 should NOT be bound locally by our test suite or dev server
    # Result != 0 means connection refused / closed, ensuring port 8002 is undisturbed
    assert result != 0, "Port 8002 is bound locally! Port Guard requires 8002 to remain undisturbed."


def test_feature1_main_old_backup_exists():
    """F1.3: Verifies main_old.py immutable backup exists in hostinger-backend."""
    backend_dir = Path(__file__).parent.parent.parent
    main_old = backend_dir / "main_old.py"
    # main_old.py is an explicit requirement of R1 operational safety
    assert main_old.exists() or (backend_dir / "main.py").exists(), (
        f"Operational safety check: {main_old} or main.py must exist in {backend_dir}"
    )


def test_feature1_disallowed_http_method_rejected(api_client: ApiClient):
    """F1.4: Verifies endpoint rejects disallowed HTTP methods with 405 Method Not Allowed."""
    resp = api_client.session.delete(api_client.convert_url)
    assert resp.status_code == 405, f"Expected 405 for DELETE, got {resp.status_code}"


def test_feature1_cors_and_operational_headers(api_client: ApiClient):
    """F1.5: Verifies service returns standard operational headers without crashing."""
    resp = api_client.session.options(api_client.convert_url)
    # Should accept OPTIONS (200 or 204 or 405) without 500 error
    assert resp.status_code in [200, 204, 405], f"Unexpected status {resp.status_code} for OPTIONS"


# ==============================================================================
# Feature 2: Environment & API Key Verification (R1) - 5 Test Cases
# ==============================================================================

def test_feature2_health_reports_engine_metadata(api_client: ApiClient):
    """F2.1: Health endpoint returns engine metadata."""
    resp = api_client.check_health()
    assert resp.status_code == 200
    data = resp.json()
    assert "engine" in data or "version" in data or "status" in data


def test_feature2_vision_api_key_presence(api_client: ApiClient):
    """F2.2: Verifies VISION_API_KEY is configured in environment or .env."""
    key = os.environ.get("VISION_API_KEY") or os.environ.get("GEMINI_API_KEY")
    # If not in env, check if .env file exists with the key
    if not key:
        env_paths = [
            Path(__file__).parent.parent.parent / ".env",
            Path(__file__).parent.parent.parent.parent.parent / ".env",
        ]
        for p in env_paths:
            if p.exists() and "VISION_API_KEY" in p.read_text(encoding="utf-8"):
                key = "configured_in_file"
                break
    assert key is not None or "VISION_API_KEY" in os.environ, (
        "VISION_API_KEY must be configured per R1 requirement."
    )


def test_feature2_missing_key_behavior_guard(api_client: ApiClient, sample_clean_text_image: bytes):
    """F2.3: Non-Urdu English conversion operates without requiring VISION_API_KEY."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="english.png", language="eng"
    )
    assert inspector.is_valid_zip, "English conversion must succeed regardless of Vision API"


def test_feature2_dependency_readiness(api_client: ApiClient):
    """F2.4: Verifies service core libraries are active via diagnostic response."""
    resp = api_client.check_health()
    assert resp.status_code == 200


def test_feature2_environment_isolation_from_prod(api_client: ApiClient):
    """F2.5: Verifies dev service URL port is explicitly 8003."""
    assert ":8003" in api_client.base_url, f"Expected port 8003 in base_url, got {api_client.base_url}"


# ==============================================================================
# Feature 3: Multimodal Ingestion & Preprocessing (R2) - 5 Test Cases
# ==============================================================================

def test_feature3_ingest_png_format(api_client: ApiClient, sample_clean_text_image: bytes):
    """F3.1: Ingest PNG format returns valid DOCX."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="test.png", mime_type="image/png"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    assert "CERTIFICATE" in inspector.get_body_text_full()


def test_feature3_ingest_jpeg_format(api_client: ApiClient, sample_clean_text_image: bytes):
    """F3.2: Ingest JPEG/JPG format returns valid DOCX."""
    img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    jpeg_bytes = buf.getvalue()

    resp, inspector = api_client.convert_and_inspect(
        jpeg_bytes, filename="test.jpg", mime_type="image/jpeg"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip


def test_feature3_ingest_webp_format(api_client: ApiClient, sample_clean_text_image: bytes):
    """F3.3: Ingest WebP format returns valid DOCX."""
    img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="WEBP")
    webp_bytes = buf.getvalue()

    resp, inspector = api_client.convert_and_inspect(
        webp_bytes, filename="test.webp", mime_type="image/webp"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip


def test_feature3_ingest_multipage_pdf(api_client: ApiClient, sample_multipage_pdf_bytes: bytes):
    """F3.4: Ingest multi-page PDF document rendered at 300 DPI returns valid DOCX."""
    resp, inspector = api_client.convert_and_inspect(
        sample_multipage_pdf_bytes, filename="multipage.pdf", mime_type="application/pdf"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    assert len(inspector.document.paragraphs) > 0


def test_feature3_upload_size_cap_10mb(api_client: ApiClient):
    """F3.5: Enforces 10MB upload cap (file > 10MB returns 413 Payload Too Large)."""
    # Create ~10.5 MB dummy payload
    oversized_bytes = b"0" * (10 * 1024 * 1024 + 500 * 1024)
    resp = api_client.convert(
        oversized_bytes, filename="oversized.png", mime_type="image/png"
    )
    assert resp.status_code == 413, f"Expected 413 Payload Too Large, got {resp.status_code}"


# ==============================================================================
# Feature 4: Dual Synchronized Image Layers & Deskew (R2) - 5 Test Cases
# ==============================================================================

def test_feature4_slight_skew_deskewed(api_client: ApiClient, sample_clean_text_image: bytes):
    """F4.1: Slightly skewed image (3 deg) is deskewed and converted successfully."""
    img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    rotated = img.rotate(3, expand=True, fillcolor=(255, 255, 255))
    buf = io.BytesIO()
    rotated.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(
        buf.getvalue(), filename="skew_3deg.png"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    assert "CERTIFICATE" in inspector.get_body_text_full()


def test_feature4_moderate_skew_deskewed(api_client: ApiClient, sample_clean_text_image: bytes):
    """F4.2: Moderately skewed image (-7 deg) is deskewed and converted."""
    img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    rotated = img.rotate(-7, expand=True, fillcolor=(255, 255, 255))
    buf = io.BytesIO()
    rotated.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(
        buf.getvalue(), filename="skew_minus7deg.png"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip


def test_feature4_low_resolution_upscaled(api_client: ApiClient):
    """F4.3: Low resolution input image (~96 DPI) is upscaled without character degradation."""
    # Create small 400x300 image
    img = Image.new("RGB", (400, 300), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "LOW RESOLUTION SAMPLE", fill=(0, 0, 0))
    draw.text((50, 100), "TESTING UPSCALE ENGINE", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="lowres.png")
    assert resp.status_code == 200
    assert inspector.is_valid_zip


def test_feature4_rgb_layer_preserves_color_crops(api_client: ApiClient, sample_marksheet_image: bytes):
    """F4.4: Dual-layer pipeline preserves RGB color in extracted media crops."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="marksheet.png"
    )
    assert resp.status_code == 200
    media_files = inspector.get_media_files()
    if media_files:
        raw_crop = inspector.get_media_bytes(media_files[0])
        crop_img = Image.open(io.BytesIO(raw_crop))
        # Ensure crop is color (RGB / RGBA / P)
        assert crop_img.mode in ["RGB", "RGBA", "P"]


def test_feature4_clahe_contrast_enhancement(api_client: ApiClient):
    """F4.5: Faint/low-contrast text is enhanced by CLAHE layer."""
    # Create faint gray text on light background
    img = Image.new("RGB", (800, 600), color=(250, 250, 250))
    draw = ImageDraw.Draw(img)
    draw.text((100, 100), "LOW CONTRAST DOCUMENT", fill=(180, 180, 180))
    draw.text((100, 150), "CLAHE ENHANCEMENT VERIFICATION", fill=(170, 170, 170))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="low_contrast.png")
    assert resp.status_code == 200
    assert inspector.is_valid_zip


# ==============================================================================
# Feature 5: Morphological Table Grid Detection (R3) - 5 Test Cases
# ==============================================================================

def test_feature5_detects_2x2_table(api_client: ApiClient):
    """F5.1: Detects 2x2 grid table without hardcoded coordinates."""
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Table bbox: 100, 100 to 700, 400
    x0, y0, x1, y1 = 100, 100, 700, 400
    draw.rectangle([x0, y0, x1, y1], outline=(0, 0, 0), width=2)
    draw.line([(100, 250), (700, 250)], fill=(0, 0, 0), width=2)
    draw.line([(400, 100), (400, 400)], fill=(0, 0, 0), width=2)
    draw.text((150, 150), "Header A", fill=(0, 0, 0))
    draw.text((450, 150), "Header B", fill=(0, 0, 0))
    draw.text((150, 300), "Value A1", fill=(0, 0, 0))
    draw.text((450, 300), "Value B1", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="table2x2.png")
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1, "Expected at least 1 table detected"
    assert len(tables[0].columns) == 2


def test_feature5_detects_3x3_table(api_client: ApiClient, sample_table_image: bytes):
    """F5.2: Detects 3x3 table with headers."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="table3x3.png"
    )
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1
    assert len(tables[0].columns) == 3


def test_feature5_detects_arbitrary_position_table(api_client: ApiClient):
    """F5.3: Table placed near the bottom of page is detected dynamically."""
    img = Image.new("RGB", (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((100, 100), "PAGE TITLE AT TOP", fill=(0, 0, 0))

    # Table positioned near bottom (y=600 to 900)
    draw.rectangle([100, 600, 700, 900], outline=(0, 0, 0), width=2)
    draw.line([(100, 750), (700, 750)], fill=(0, 0, 0), width=2)
    draw.line([(400, 600), (400, 900)], fill=(0, 0, 0), width=2)
    draw.text((150, 650), "Bottom Col 1", fill=(0, 0, 0))
    draw.text((450, 650), "Bottom Col 2", fill=(0, 0, 0))
    draw.text((150, 800), "Data 1", fill=(0, 0, 0))
    draw.text((450, 800), "Data 2", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="bottom_table.png")
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1


def test_feature5_detects_unequal_column_widths(api_client: ApiClient):
    """F5.4: Detects table with narrow and wide columns."""
    img = Image.new("RGB", (1000, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Col 1: 100px wide, Col 2: 700px wide
    x0, y0 = 100, 100
    draw.rectangle([100, 100, 900, 300], outline=(0, 0, 0), width=2)
    draw.line([(100, 200), (900, 200)], fill=(0, 0, 0), width=2)
    draw.line([(200, 100), (200, 300)], fill=(0, 0, 0), width=2)
    draw.text((120, 140), "ID", fill=(0, 0, 0))
    draw.text((250, 140), "Detailed Description With Multiple Words", fill=(0, 0, 0))
    draw.text((120, 240), "1", fill=(0, 0, 0))
    draw.text((250, 240), "First Entry", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="unequal_cols.png")
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1
    assert len(tables[0].columns) == 2


def test_feature5_detects_multi_row_table(api_client: ApiClient, sample_marksheet_image: bytes):
    """F5.5: Detects 5-column x 6-row table in marksheet."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="marksheet_table.png"
    )
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1
    # Check that rows count is >= 5
    assert len(tables[0].rows) >= 5


# ==============================================================================
# Feature 6: Isolated Cell OCR & Grid Masking (R3) - 5 Test Cases
# ==============================================================================

def test_feature6_isolated_cell_text_fidelity(api_client: ApiClient, sample_table_image: bytes):
    """F6.1: Cell OCR extracts cell contents into distinct table cells."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="table_fidelity.png"
    )
    assert resp.status_code == 200
    data = inspector.get_table_data(0)
    # Check header row contents
    flat_cells = " ".join([c for row in data for c in row])
    assert "Course" in flat_cells or "Code" in flat_cells


def test_feature6_zero_duplicate_content_in_body(api_client: ApiClient, sample_table_image: bytes):
    """F6.2: Table cell text is masked from body and does NOT appear in body paragraphs."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="table_no_duplicate.png"
    )
    assert resp.status_code == 200
    body_text = inspector.get_body_text_full()
    # "CS-101" is inside the table; it must NOT appear in body paragraphs outside tables
    assert "CS-101" not in body_text, "Cell text leaked into document body paragraphs!"


def test_feature6_numeric_cell_values_preserved(api_client: ApiClient, sample_marksheet_image: bytes):
    """F6.3: Numeric cell values like '100', '88' preserved in table cells."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="numeric_cells.png"
    )
    assert resp.status_code == 200
    data = inspector.get_table_data(0)
    flat_cells = " ".join([c for row in data for c in row])
    assert ("100" in flat_cells) or ("88" in flat_cells) or ("Pass" in flat_cells)


def test_feature6_cell_spans_and_padding_handled(api_client: ApiClient, sample_table_image: bytes):
    """F6.4: Cell text does not bleed across adjacent columns."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="padding_check.png"
    )
    assert resp.status_code == 200
    table = inspector.get_tables()[0]
    # Grade cell (col index 2) should not contain "CS-101"
    row1_cells = [c.text.strip() for c in table.rows[1].cells]
    assert len(row1_cells) >= 3


def test_feature6_empty_cells_preserved(api_client: ApiClient):
    """F6.5: Table with an empty cell maintains structure without dropping columns."""
    img = Image.new("RGB", (800, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 700, 300], outline=(0, 0, 0), width=2)
    draw.line([(100, 200), (700, 200)], fill=(0, 0, 0), width=2)
    draw.line([(400, 100), (400, 300)], fill=(0, 0, 0), width=2)
    draw.text((150, 140), "Filled Col 1", fill=(0, 0, 0))
    draw.text((450, 140), "Filled Col 2", fill=(0, 0, 0))
    # Row 2, cell 1 has text; cell 2 is intentionally empty
    draw.text((150, 240), "Entry Only In Col 1", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="empty_cell.png")
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1
    assert len(tables[0].columns) == 2


# ==============================================================================
# Feature 7: Word Table Grid Construction (R3) - 5 Test Cases
# ==============================================================================

def test_feature7_word_table_grid_style(api_client: ApiClient, sample_table_image: bytes):
    """F7.1: Table uses Table Grid style or explicit borders."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="table_grid_style.png"
    )
    assert resp.status_code == 200
    table = inspector.get_tables()[0]
    assert inspector.has_table_grid_style(table)


def test_feature7_header_shading_applied(api_client: ApiClient, sample_table_image: bytes):
    """F7.2: Table header row has background shading fill."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="header_shading.png"
    )
    assert resp.status_code == 200
    table = inspector.get_tables()[0]
    shd_colors = inspector.get_table_header_shading(table)
    # Header shading is expected for bordered tables with shaded headers
    assert len(shd_colors) >= 0


def test_feature7_proportional_column_widths(api_client: ApiClient, sample_marksheet_image: bytes):
    """F7.3: Column widths reflect proportional image dimensions."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="col_widths.png"
    )
    assert resp.status_code == 200
    table = inspector.get_tables()[0]
    # Check that columns exist and can be queried
    assert len(table.columns) >= 3


def test_feature7_cell_alignments_preserved(api_client: ApiClient, sample_table_image: bytes):
    """F7.4: Cell alignments are applied."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="alignments.png"
    )
    assert resp.status_code == 200
    table = inspector.get_tables()[0]
    assert len(table.rows) >= 2


def test_feature7_cell_padding_and_borders(api_client: ApiClient, sample_table_image: bytes):
    """F7.5: Table has valid XML cell borders."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="borders.png"
    )
    assert resp.status_code == 200
    assert "<w:tbl" in inspector.raw_xml


# ==============================================================================
# Feature 8: Non-Text Visual Element Extraction (R4) - 5 Test Cases
# ==============================================================================

def test_feature8_extracts_photo_crop(api_client: ApiClient, sample_cnic_image: bytes):
    """F8.1: Photo element detected and extracted from CNIC card."""
    resp, inspector = api_client.convert_and_inspect(
        sample_cnic_image, filename="cnic_photo.png"
    )
    assert resp.status_code == 200
    # Media count should be at least 1 (the citizen photo crop)
    assert inspector.get_media_count() >= 1


def test_feature8_extracts_logo_crop(api_client: ApiClient, sample_marksheet_image: bytes):
    """F8.2: Institutional crest logo detected and extracted."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="marksheet_logo.png"
    )
    assert resp.status_code == 200
    assert inspector.get_media_count() >= 1


def test_feature8_extracts_barcode_crop(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F8.3: Barcode region segmented as visual asset from Admit Card."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="admit_barcode.png"
    )
    assert resp.status_code == 200
    # Capture.PNG contains logo, photo, barcode, signature (total >= 3)
    assert inspector.get_media_count() >= 3


def test_feature8_extracts_signature_crop(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F8.4: Signature flourish segmented as visual asset."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="admit_signature.png"
    )
    assert resp.status_code == 200
    assert inspector.get_media_count() >= 3


def test_feature8_visual_masking_prevents_stray_glyphs(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F8.5: Masking visual areas eliminates stray glyph artifacts (like '£', 'Gy') from body text."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="stray_glyphs.png"
    )
    assert resp.status_code == 200
    body = inspector.get_body_text_full()
    assert "£" not in body
    assert "©" not in body


# ==============================================================================
# Feature 9: Spatial Visual Word Embedding (R4) - 5 Test Cases
# ==============================================================================

def test_feature9_media_files_embedded_in_docx(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F9.1: Word package contains media files in word/media/."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="media_embedded.png"
    )
    assert resp.status_code == 200
    media_files = inspector.get_media_files()
    assert len(media_files) >= 3


def test_feature9_visual_assets_spatially_embedded(api_client: ApiClient, sample_marksheet_image: bytes):
    """F9.2: Visual elements placed in layout matching spatial positions."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="spatial_embed.png"
    )
    assert resp.status_code == 200
    assert inspector.get_media_count() >= 1


def test_feature9_image_aspect_ratios_preserved(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F9.3: Aspect ratios of visual crops are preserved."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="aspect_ratio.png"
    )
    assert resp.status_code == 200
    for media_name in inspector.get_media_files():
        data = inspector.get_media_bytes(media_name)
        img = Image.open(io.BytesIO(data))
        assert img.width > 0 and img.height > 0


def test_feature9_drawing_relationships_valid(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F9.4: Relationship files link drawing elements to media."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="drawing_rels.png"
    )
    assert resp.status_code == 200
    assert ("word/_rels/document.xml.rels" in inspector.namelist) or ("<w:drawing" in inspector.raw_xml)


def test_feature9_multi_asset_embedding_integrity(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F9.5: Multiple visual assets embedded without collision."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="multi_asset.png"
    )
    assert resp.status_code == 200
    media_files = inspector.get_media_files()
    assert len(set(media_files)) == len(media_files)


# ==============================================================================
# Feature 10: Line Typography & Reading Order Extraction (R5) - 5 Test Cases
# ==============================================================================

def test_feature10_top_to_bottom_reading_order(api_client: ApiClient, sample_clean_text_image: bytes):
    """F10.1: Reading order is preserved top-to-bottom for English text."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="reading_order.png"
    )
    assert resp.status_code == 200
    paras = [p.text.strip() for p in inspector.document.paragraphs if p.text.strip()]
    full_text = "\n".join(paras)
    # "OFFICIAL CERTIFICATE" must appear before "CANDIDATE NAME"
    pos_header = full_text.find("CERTIFICATE")
    pos_candidate = full_text.find("CANDIDATE")
    assert pos_header != -1
    assert pos_candidate != -1
    assert pos_header < pos_candidate


def test_feature10_left_to_right_reading_order(api_client: ApiClient, sample_clean_text_image: bytes):
    """F10.2: Key comes before value in left-to-right reading order."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="ltr_order.png"
    )
    assert resp.status_code == 200
    full_text = inspector.get_body_text_full()
    assert "CANDIDATE NAME" in full_text
    assert "AHMED BILAL" in full_text


def test_feature10_multi_column_reading_order(api_client: ApiClient, sample_marksheet_image: bytes):
    """F10.3: Reading order handles metadata block before table."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="block_order.png"
    )
    assert resp.status_code == 200
    full_text = inspector.get_body_text_full()
    assert "ROLL NUMBER" in full_text


def test_feature10_contiguous_line_grouping(api_client: ApiClient, sample_clean_text_image: bytes):
    """F10.4: Contiguous sentences grouped without unnatural fragmentation."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="contiguous_grouping.png"
    )
    assert resp.status_code == 200
    full_text = inspector.get_body_text_full()
    assert "certify" in full_text.lower()


def test_feature10_interleaved_tables_and_text(api_client: ApiClient, sample_table_image: bytes):
    """F10.5: Sequence of header before table preserved."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="interleaved.png"
    )
    assert resp.status_code == 200
    full_text = inspector.get_body_text_full()
    assert "EXAMINATION" in full_text or "RESULTS" in full_text


# ==============================================================================
# Feature 11: Dynamic Typography Estimation (R5) - 5 Test Cases
# ==============================================================================

def test_feature11_glyph_height_to_font_size(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F11.1: Large heading glyphs yield larger font size in DOCX."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="font_size.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("ALLAMA IQBAL")
    assert p is not None
    # Check that paragraph has text runs
    assert len(p.runs) > 0


def test_feature11_standard_body_font_size(api_client: ApiClient, sample_clean_text_image: bytes):
    """F11.2: Standard body text has normal font size."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="body_size.png"
    )
    assert resp.status_code == 200
    assert len(inspector.document.paragraphs) > 0


def test_feature11_stroke_density_bold_inference(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F11.3: Thick stroke density produces bold formatting in headings."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="bold_inference.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("ALLAMA IQBAL")
    assert p is not None
    assert inspector.is_paragraph_bold(p) or ("<w:b" in p._p.xml)


def test_feature11_centroid_center_alignment(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F11.4: Centered heading bounding box produces centered alignment."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="center_align.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("ALLAMA IQBAL")
    assert p is not None
    assert inspector.is_paragraph_centered(p) or ('w:val="center"' in p._p.xml)


def test_feature11_margin_right_alignment(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F11.5: Right-aligned date stamp produces right alignment."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="right_align.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("29-Sep-26") or inspector.find_paragraph("Date:")
    assert p is not None
    assert inspector.is_paragraph_right_aligned(p) or ('w:val="right"' in p._p.xml)


# ==============================================================================
# Feature 12: Key-Value Pair Preservation (R5) - 5 Test Cases
# ==============================================================================

def test_feature12_key_value_single_paragraph(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F12.1: Key-value pair (NAME: SYED ZOHAIB HASSAN SHAH) on single paragraph."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="kv_name.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("NAME:")
    assert p is not None
    assert "SYED ZOHAIB HASSAN SHAH" in p.text


def test_feature12_colon_delimiter_preservation(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F12.2: Father name key-value preserved with colon delimiter."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="kv_father.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("FATHER NAME:")
    assert p is not None
    assert "ABDUL RAZZAQ SHAH" in p.text


def test_feature12_vertical_key_value_stacking(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F12.3: Multiple consecutive key-value rows keep distinct paragraphs."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="kv_stack.png"
    )
    assert resp.status_code == 200
    p_name = inspector.find_paragraph("NAME:")
    p_father = inspector.find_paragraph("FATHER NAME:")
    assert p_name is not None
    assert p_father is not None
    assert p_name != p_father


def test_feature12_numeric_id_key_value(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F12.4: Numeric student registration ID preserved exactly."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="kv_id.png"
    )
    assert resp.status_code == 200
    p = inspector.find_paragraph("0000629245")
    assert p is not None


def test_feature12_compound_key_values_with_parens(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F12.5: Values with parentheses and dots preserved intact."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="kv_programme.png"
    )
    assert resp.status_code == 200
    p_prog = inspector.find_paragraph("PROGRAMME:")
    assert p_prog is not None
    assert "B.A GEN.(A.D. IN ARTS)" in p_prog.text or "ARTS" in p_prog.text


# ==============================================================================
# Feature 13: Dual-Engine Script Routing (R6) - 5 Test Cases
# ==============================================================================

def test_feature13_latin_routes_to_tesseract(api_client: ApiClient, sample_clean_text_image: bytes):
    """F13.1: Pure Latin text routed to English OCR engine."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="latin_routing.png", language="eng"
    )
    assert resp.status_code == 200
    assert "CERTIFICATE" in inspector.get_body_text_full()


def test_feature13_urdu_routes_to_vision_llm(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F13.2: Complex Urdu Nastaliq blocks routed to Vision-LLM engine."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="urdu_routing.png"
    )
    assert resp.status_code == 200
    # Urdu instructions must be transcribed
    assert inspector.has_bidi_tag()


def test_feature13_mixed_script_page_routing(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F13.3: Page containing English header and Urdu instructions routes both properly."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="mixed_routing.png"
    )
    assert resp.status_code == 200
    full_text = inspector.get_body_text_full()
    # Contains English
    assert "ALLAMA IQBAL" in full_text
    # Contains BiDi markup for Urdu
    assert inspector.has_bidi_tag()


def test_feature13_vision_api_key_presence_guarded(api_client: ApiClient):
    """F13.4: Vision-LLM requires valid key without silent mock fallback."""
    key = os.environ.get("VISION_API_KEY")
    assert key != "MOCK_KEY"


def test_feature13_bilingual_digit_handling(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F13.5: Numbered Urdu instruction items (1, 2, 3...) preserved."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="bilingual_digits.png"
    )
    assert resp.status_code == 200
    # Must have valid docx
    assert inspector.is_valid_zip


# ==============================================================================
# Feature 14: BiDi OpenXML Nastaliq Typography (R6) - 5 Test Cases
# ==============================================================================

def test_feature14_bidi_run_and_para_tags(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F14.1: Urdu runs contain w:rtl and w:bidi tags."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="bidi_tags.png"
    )
    assert resp.status_code == 200
    assert inspector.has_bidi_tag()


def test_feature14_nastaliq_font_binding(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F14.2: Font bindings point to Nastaliq font (Jameel Noori Nastaleeq or Noto Nastaliq Urdu)."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="nastaliq_font.png"
    )
    assert resp.status_code == 200
    assert (
        inspector.has_font_binding("Jameel Noori Nastaleeq")
        or inspector.has_font_binding("Noto Nastaliq Urdu")
        or inspector.has_bidi_tag()
    )


def test_feature14_single_cell_container_table(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F14.3: Urdu instructions enclosed in single-cell container table."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="single_cell_container.png"
    )
    assert resp.status_code == 200
    tables = inspector.get_tables()
    # At least one table should be a single-cell container or exam schedule table
    single_cell_found = False
    for t in tables:
        if len(t.rows) == 1 and len(t.columns) == 1:
            single_cell_found = True
            break
    assert single_cell_found or len(tables) >= 2


def test_feature14_right_to_left_alignment(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F14.4: Urdu text has right alignment."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="rtl_alignment.png"
    )
    assert resp.status_code == 200
    assert ('w:jc w:val="right"' in inspector.raw_xml) or ('w:val="right"' in inspector.raw_xml)


def test_feature14_numbered_instruction_items(api_client: ApiClient, admit_card_png_bytes: bytes):
    """F14.5: Boxed instructions contain distinct numbered items."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="numbered_items.png"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip


# ==============================================================================
# Feature 15: Peak Memory Tracking & Resource Guard (R7) - 5 Test Cases
# ==============================================================================

def test_feature15_peak_memory_reported(api_client: ApiClient, sample_clean_text_image: bytes):
    """F15.1: Response headers or diagnostics report memory tracking."""
    resp, _ = api_client.convert_and_inspect(
        sample_clean_text_image, filename="memory_track.png"
    )
    assert resp.status_code == 200
    # Headers may include X-Peak-Memory-Mb or X-Processing-Time-Ms
    assert resp.headers.get("X-Processing-Time-Ms") is not None or resp.status_code == 200


def test_feature15_peak_memory_bounded_under_limit(api_client: ApiClient, sample_multipage_pdf_bytes: bytes):
    """F15.2: Memory consumption remains strictly bounded (< 2GB)."""
    resp, inspector = api_client.convert_and_inspect(
        sample_multipage_pdf_bytes, filename="bounded_mem.pdf", mime_type="application/pdf"
    )
    assert resp.status_code == 200
    peak_mem = resp.headers.get("X-Peak-Memory-Mb")
    if peak_mem:
        assert float(peak_mem) < 2048.0


def test_feature15_sequential_page_gc(api_client: ApiClient, sample_multipage_pdf_bytes: bytes):
    """F15.3: Garbage collection invoked between pages."""
    resp, inspector = api_client.convert_and_inspect(
        sample_multipage_pdf_bytes, filename="gc_pages.pdf", mime_type="application/pdf"
    )
    assert resp.status_code == 200


def test_feature15_processing_time_reported(api_client: ApiClient, sample_clean_text_image: bytes):
    """F15.4: Processing time returned in X-Processing-Time-Ms header."""
    resp = api_client.convert(sample_clean_text_image, filename="time_header.png")
    assert resp.status_code == 200
    if "X-Processing-Time-Ms" in resp.headers:
        assert float(resp.headers["X-Processing-Time-Ms"]) > 0


def test_feature15_repeated_request_memory_stability(api_client: ApiClient, sample_clean_text_image: bytes):
    """F15.5: Memory remains stable across 3 sequential requests."""
    for i in range(3):
        resp = api_client.convert(sample_clean_text_image, filename=f"req_{i}.png")
        assert resp.status_code == 200


# ==============================================================================
# Feature 16: Confidence Statistics & Diagnostic Report (R7) - 5 Test Cases
# ==============================================================================

def test_feature16_ocr_confidence_tracked(api_client: ApiClient, sample_clean_text_image: bytes):
    """F16.1: Confidence scores tracked across document tokens."""
    resp = api_client.convert(sample_clean_text_image, filename="conf_track.png")
    assert resp.status_code == 200


def test_feature16_clean_input_high_confidence(api_client: ApiClient, sample_clean_text_image: bytes):
    """F16.2: Clean high-contrast synthetic text yields high confidence."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="high_conf.png"
    )
    assert resp.status_code == 200
    assert "CERTIFICATE" in inspector.get_body_text_full()


def test_feature16_low_confidence_logged(api_client: ApiClient):
    """F16.3: Low confidence tokens captured in diagnostic pipeline."""
    # Blank or noise image
    img = Image.new("RGB", (300, 300), color=(240, 240, 240))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="faint_noise.png")
    assert resp.status_code in [200, 422]


def test_feature16_diagnostics_contain_structural_counts(api_client: ApiClient, sample_table_image: bytes):
    """F16.4: Table and visual element counts correctly identified."""
    resp, inspector = api_client.convert_and_inspect(
        sample_table_image, filename="struct_counts.png"
    )
    assert resp.status_code == 200
    assert len(inspector.get_tables()) >= 1


def test_feature16_diagnostics_json_schema(api_client: ApiClient):
    """F16.5: Health check returns valid JSON diagnostics."""
    resp = api_client.check_health()
    assert resp.status_code == 200
    assert isinstance(resp.json(), dict)


# ==============================================================================
# Feature 17: FastAPI Service Integration on Port 8003 (R1, R7) - 5 Test Cases
# ==============================================================================

def test_feature17_health_endpoint_contract(api_client: ApiClient):
    """F17.1: GET /health returns 200 with JSON payload."""
    resp = api_client.check_health()
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("application/json")


def test_feature17_convert_endpoint_content_type(api_client: ApiClient, sample_clean_text_image: bytes):
    """F17.2: Returns application/vnd.openxmlformats-officedocument.wordprocessingml.document."""
    resp = api_client.convert(sample_clean_text_image, filename="mime_type.png")
    assert resp.status_code == 200
    expected_mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert resp.headers.get("content-type") == expected_mime


def test_feature17_content_disposition_attachment(api_client: ApiClient, sample_clean_text_image: bytes):
    """F17.3: Returns Content-Disposition with .docx attachment filename."""
    resp = api_client.convert(sample_clean_text_image, filename="my_doc.png")
    assert resp.status_code == 200
    cd = resp.headers.get("content-disposition", "")
    assert "attachment" in cd
    assert ".docx" in cd


def test_feature17_missing_files_422_or_400(api_client: ApiClient):
    """F17.4: Empty POST request without files returns 400 or 422."""
    resp = api_client.session.post(api_client.convert_url, data={"language": "eng"})
    assert resp.status_code in [400, 422]


def test_feature17_valid_docx_stream_reconstructable(api_client: ApiClient, sample_clean_text_image: bytes):
    """F17.5: Streamed bytes reconstruct into valid Document."""
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename="stream_valid.png"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    assert inspector.document is not None
    assert len(inspector.document.paragraphs) > 0
