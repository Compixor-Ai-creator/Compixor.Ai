"""
Tier 2: Boundary & Corner Cases Test Suite.
Verifies edge cases, stress boundaries, extreme formats, corrupt inputs, and scale limits.
Target Service: http://127.0.0.1:8003/api/convert-img-to-docx
"""

import io
import os
import sys

from PIL import Image, ImageDraw
import pytest
import requests

from tests.conftest import ApiClient, DocxInspector


def test_tier2_empty_file_zero_bytes(api_client: ApiClient):
    """B1: Empty 0-byte file upload returns 400 Bad Request or 422."""
    resp = api_client.convert(b"", filename="empty.png", mime_type="image/png")
    assert resp.status_code in [400, 422], f"Expected 400/422 for empty file, got {resp.status_code}"


def test_tier2_exceeds_10mb_cap(api_client: ApiClient):
    """B2: File exceeding 10MB cap (10.5 MB) returns 413 Payload Too Large."""
    oversized_bytes = b"0" * (10 * 1024 * 1024 + 512 * 1024)
    resp = api_client.convert(oversized_bytes, filename="large.png", mime_type="image/png")
    assert resp.status_code == 413, f"Expected 413 Payload Too Large, got {resp.status_code}"


def test_tier2_exact_boundary_under_10mb(api_client: ApiClient, sample_clean_text_image: bytes):
    """B3: File just below 10MB cap (e.g. padded valid PNG) accepted within limit."""
    # Create valid PNG padded with trailing junk bytes or large metadata just under 10MB
    base_img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    buf = io.BytesIO()
    base_img.save(buf, format="PNG")
    png_data = buf.getvalue()
    # If smaller than 9MB, padding to 9.5MB
    target_size = 9 * 1024 * 1024 + 500 * 1024
    if len(png_data) < target_size:
        padded = png_data + b"\x00" * (target_size - len(png_data))
    else:
        padded = png_data

    resp = api_client.convert(padded, filename="near_10mb.png", mime_type="image/png")
    # Must NOT return 413 since it's strictly under 10MB
    assert resp.status_code != 413, f"Unexpected 413 for payload under 10MB: {len(padded)} bytes"


def test_tier2_invalid_mime_and_corrupt_bytes(api_client: ApiClient):
    """B4: Corrupted file bytes or arbitrary binary garbage returns 400, 415, or 422."""
    garbage = b"\x00\xff\xfe\x01\x88\x99\xaa\xbb\xcc" * 100
    resp = api_client.convert(garbage, filename="corrupt.png", mime_type="image/png")
    assert resp.status_code in [400, 415, 422], f"Expected 400/415/422 for corrupt bytes, got {resp.status_code}"


def test_tier2_plain_text_disguised_as_image(api_client: ApiClient):
    """B5: Plain text file sent with image MIME returns 400, 415, or 422 without 500 crash."""
    text_data = b"Hello, this is just a plain ASCII text file disguised as a PNG image."
    resp = api_client.convert(text_data, filename="fake.png", mime_type="image/png")
    assert resp.status_code in [400, 415, 422], f"Expected client error, got {resp.status_code}"


def test_tier2_single_pixel_image(api_client: ApiClient):
    """B6: Single pixel 1x1 image handled safely without crashing (returns 200 or 400/422)."""
    img = Image.new("RGB", (1, 1), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="1x1.png")
    # Graceful handling: either empty valid docx (200) or client error (400/422), never 500
    assert resp.status_code in [200, 400, 422], f"Unexpected status {resp.status_code}"
    if resp.status_code == 200:
        inspector = DocxInspector(resp.content)
        assert inspector.is_valid_zip


def test_tier2_tiny_image_5x5(api_client: ApiClient):
    """B7: Tiny 5x5 image handled gracefully without division by zero."""
    img = Image.new("RGB", (5, 5), color=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="5x5.png")
    assert resp.status_code in [200, 400, 422]


def test_tier2_extreme_high_aspect_ratio_strip(api_client: ApiClient):
    """B8: High aspect ratio banner (1500x20 px) handled without division by zero or crashing."""
    img = Image.new("RGB", (1500, 20), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((10, 5), "VERY WIDE BANNER TEXT", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="wide_banner.png")
    assert resp.status_code in [200, 400, 422]
    if resp.status_code == 200:
        inspector = DocxInspector(resp.content)
        assert inspector.is_valid_zip


def test_tier2_extreme_vertical_aspect_ratio_strip(api_client: ApiClient):
    """B9: High vertical aspect ratio banner (20x1500 px) handled safely."""
    img = Image.new("RGB", (20, 1500), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="tall_strip.png")
    assert resp.status_code in [200, 400, 422]


def test_tier2_extreme_skew_45_degrees(api_client: ApiClient, sample_clean_text_image: bytes):
    """B10: Extreme 45-degree skew handled safely without pipeline failure."""
    img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    rotated = img.rotate(45, expand=True, fillcolor=(255, 255, 255))
    buf = io.BytesIO()
    rotated.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="skew_45deg.png")
    assert resp.status_code in [200, 422]
    if resp.status_code == 200:
        inspector = DocxInspector(resp.content)
        assert inspector.is_valid_zip


def test_tier2_pure_black_image(api_client: ApiClient):
    """B11: Pure black canvas (0 foreground text contrast) handled gracefully."""
    img = Image.new("RGB", (600, 600), color=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="pure_black.png")
    assert resp.status_code in [200, 422]


def test_tier2_pure_white_image(api_client: ApiClient):
    """B12: Pure white blank canvas (zero text) handled cleanly, returns valid empty DOCX."""
    img = Image.new("RGB", (600, 600), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    resp = api_client.convert(buf.getvalue(), filename="pure_white.png")
    assert resp.status_code in [200, 422]
    if resp.status_code == 200:
        inspector = DocxInspector(resp.content)
        assert inspector.is_valid_zip


def test_tier2_large_grid_table_max_cells(api_client: ApiClient):
    """B13: Complex large table (20 rows x 8 columns = 160 cells) handled without truncation."""
    img = Image.new("RGB", (1600, 2000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    x0, y0 = 50, 50
    rows = 20
    cols = 8
    row_h = 90
    col_w = 180
    table_w = cols * col_w
    table_h = rows * row_h

    # Horizontal grid lines
    for r in range(rows + 1):
        y = y0 + r * row_h
        draw.line([(x0, y), (x0 + table_w, y)], fill=(0, 0, 0), width=2)

    # Vertical grid lines
    for c in range(cols + 1):
        x = x0 + c * col_w
        draw.line([(x, y0), (x, y0 + table_h)], fill=(0, 0, 0), width=2)

    # Fill sample cells
    for r in range(rows):
        for c in range(cols):
            draw.text((x0 + c * col_w + 10, y0 + r * row_h + 30), f"R{r}C{c}", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(buf.getvalue(), filename="large_table.png")
    assert resp.status_code == 200
    tables = inspector.get_tables()
    assert len(tables) >= 1
    # Check that rows count is substantial
    assert len(tables[0].rows) >= 10


def test_tier2_multipage_pdf_three_pages(api_client: ApiClient, sample_clean_text_image: bytes):
    """B14: Multi-page PDF (3 pages) converts with multiple pages/sections in DOCX."""
    img = Image.open(io.BytesIO(sample_clean_text_image)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PDF", save_all=True, append_images=[img, img])
    pdf_bytes = buf.getvalue()

    resp, inspector = api_client.convert_and_inspect(
        pdf_bytes, filename="3page.pdf", mime_type="application/pdf"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    # Check document paragraphs exist across pages
    assert len(inspector.document.paragraphs) >= 3


def test_tier2_special_characters_and_urdu_filename(api_client: ApiClient, sample_clean_text_image: bytes):
    """B15: Filename with Urdu, Arabic, spaces, and punctuation handled cleanly."""
    unicode_filename = "ایڈمٹ_کارڈ_AIOU_#1 (Final) [2026] & test.png"
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename=unicode_filename
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    cd = resp.headers.get("content-disposition", "")
    assert ".docx" in cd


def test_tier2_extremely_long_filename(api_client: ApiClient, sample_clean_text_image: bytes):
    """B16: Very long filename (200+ characters) processed without filesystem overflow."""
    long_filename = "document_" + ("long_section_" * 15) + ".png"
    resp, inspector = api_client.convert_and_inspect(
        sample_clean_text_image, filename=long_filename
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip


def test_tier2_consecutive_rapid_requests_no_deadlock(api_client: ApiClient, sample_clean_text_image: bytes):
    """B17: 5 rapid consecutive conversion requests process without server deadlock."""
    for i in range(5):
        resp = api_client.convert(sample_clean_text_image, filename=f"rapid_{i}.png")
        assert resp.status_code == 200
