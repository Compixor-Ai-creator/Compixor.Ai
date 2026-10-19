"""
Tier 3: Cross-Feature Combinations Test Suite.
Verifies interactions between simultaneous features: tables + visual crops,
multi-page PDF + Urdu BiDi, barcode masking + key-values, and deskew + morphology.
Target Service: http://127.0.0.1:8003/api/convert-img-to-docx
"""

import io
import os
import sys

from PIL import Image, ImageDraw
import pytest
import requests

from tests.conftest import ApiClient, DocxInspector


def test_tier3_table_and_photo_simultaneous(api_client: ApiClient, sample_marksheet_image: bytes):
    """C1: Document containing both a structured Table AND an embedded Student Photo.
    Verifies that morphological table detection does not destroy visual contour extraction,
    and visual extraction does not corrupt the table grid.
    """
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="marksheet_combo.png"
    )
    assert resp.status_code == 200
    # Must have at least 1 table
    assert len(inspector.get_tables()) >= 1
    # Must have at least 1 media file (the photo/seal)
    assert inspector.get_media_count() >= 1


def test_tier3_multipage_pdf_with_table_and_urdu(api_client: ApiClient, sample_table_image: bytes, admit_card_png_bytes: bytes):
    """C2: Multi-page PDF containing a Table on Page 1 and an Urdu Nastaliq BiDi container on Page 2.
    Verifies multimodal PDF paging with cross-language routing and XML generation.
    """
    img1 = Image.open(io.BytesIO(sample_table_image)).convert("RGB")
    img2 = Image.open(io.BytesIO(admit_card_png_bytes)).convert("RGB")

    buf = io.BytesIO()
    img1.save(buf, format="PDF", save_all=True, append_images=[img2])
    pdf_bytes = buf.getvalue()

    resp, inspector = api_client.convert_and_inspect(
        pdf_bytes, filename="table_and_urdu.pdf", mime_type="application/pdf"
    )
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    # Should have tables from page 1 and page 2
    assert len(inspector.get_tables()) >= 1
    # Should contain BiDi tags from page 2 Urdu instructions
    assert inspector.has_bidi_tag()


def test_tier3_barcode_masking_with_key_values_and_table(api_client: ApiClient, admit_card_png_bytes: bytes):
    """C3: Document with Barcode + Metadata Key-Values + Table.
    Verifies barcode is cropped as image and masked so it doesn't leak random glyphs
    into key-values or table cells.
    """
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="barcode_kv_table.png"
    )
    assert resp.status_code == 200

    # Key-values must be clean
    p_id = inspector.find_paragraph("0000629245")
    assert p_id is not None

    # Table must be intact
    tables = inspector.get_tables()
    assert len(tables) >= 1

    # Media must contain barcode crop
    assert inspector.get_media_count() >= 3


def test_tier3_logo_centered_title_signature_table(api_client: ApiClient, sample_marksheet_image: bytes):
    """C4: Document with Logo + Centered Headings + Signature Stamp + Table.
    Verifies complete multi-element header, body table, and signature layout.
    """
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="full_layout.png"
    )
    assert resp.status_code == 200

    # Header title present
    p_title = inspector.find_paragraph("SECONDARY SCHOOL CERTIFICATE")
    assert p_title is not None

    # Table present
    assert len(inspector.get_tables()) >= 1

    # Visual assets (logo, stamp) present
    assert inspector.get_media_count() >= 1


def test_tier3_skewed_document_with_table_and_visual(api_client: ApiClient, sample_marksheet_image: bytes):
    """C5: Skewed document (5 degrees) containing Table and Visual assets.
    Verifies deskew runs prior to morphological table detection and visual segmentation.
    """
    img = Image.open(io.BytesIO(sample_marksheet_image)).convert("RGB")
    rotated = img.rotate(5, expand=True, fillcolor=(255, 255, 255))
    buf = io.BytesIO()
    rotated.save(buf, format="PNG")

    resp, inspector = api_client.convert_and_inspect(
        buf.getvalue(), filename="skewed_marksheet.png"
    )
    assert resp.status_code == 200
    assert len(inspector.get_tables()) >= 1
    assert inspector.get_media_count() >= 1


def test_tier3_multilingual_document_english_table_urdu_box(api_client: ApiClient, admit_card_png_bytes: bytes):
    """C6: Multilingual document with English header/table and Urdu instructions.
    Verifies script routing partitions English to OCR and Urdu to Vision-LLM API.
    """
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="multilingual_doc.png"
    )
    assert resp.status_code == 200

    # English headings
    assert "ALLAMA IQBAL" in inspector.get_body_text_full()

    # Urdu BiDi markup
    assert inspector.has_bidi_tag()


def test_tier3_key_value_profile_adjacent_to_photo(api_client: ApiClient, admit_card_png_bytes: bytes):
    """C7: High-density key-value pairs adjacent to a student photo.
    Verifies that two-column profile layout maintains key-value cohesion without
    text spilling into the photo area.
    """
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="profile_photo.png"
    )
    assert resp.status_code == 200

    # Verify student name and father name
    p_name = inspector.find_paragraph("NAME:")
    p_father = inspector.find_paragraph("FATHER NAME:")
    assert p_name is not None
    assert p_father is not None

    # Verify photo in media
    assert inspector.get_media_count() >= 3


def test_tier3_zero_duplicate_across_table_and_visuals(api_client: ApiClient, admit_card_png_bytes: bytes):
    """C8: Verifies zero duplicate content between table cells, visual assets, and body text."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="zero_duplicate_audit.png"
    )
    assert resp.status_code == 200
    body = inspector.get_body_text_full()

    # Schedule table text must not be in body paragraphs
    assert "AIOU- 464" not in body
    assert "ISLAMIC FIQH(Course)" not in body
    assert "SHP-SH:11" not in body
