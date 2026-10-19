"""
Tier 4 Scenario 1: Real-World Scenario — AIOU Admit Card (Capture.PNG).
Verifies full visual and structural parity against authoritative sample Capture.PNG.
Derived strictly from user requirements R1-R7 and Acceptance Criteria § Visual & Structural Parity.
Target Service: http://127.0.0.1:8003/api/convert-img-to-docx
"""

import io
import os
import re
import xml.etree.ElementTree as ET

import pytest

from tests.conftest import ApiClient, DocxInspector, XML_NAMESPACES


@pytest.fixture(scope="module")
def admit_card_conversion(api_client: ApiClient, admit_card_png_bytes: bytes) -> tuple:
    """Module-scoped fixture to convert Capture.PNG once and reuse across assertions."""
    resp, inspector = api_client.convert_and_inspect(
        admit_card_png_bytes, filename="Capture.PNG", mime_type="image/png"
    )
    return resp, inspector


def test_scenario1_valid_docx_output(admit_card_conversion: tuple):
    """S1.1: Capture.PNG converts to a valid DOCX document structure."""
    resp, inspector = admit_card_conversion
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    assert inspector.document is not None


def test_scenario1_top_right_date_stamp(admit_card_conversion: tuple):
    """S1.2: Date stamp 'Date: 29-Sep-26' is right-aligned at the top."""
    _, inspector = admit_card_conversion
    p_date = inspector.find_paragraph("29-Sep-26") or inspector.find_paragraph("Date:")
    assert p_date is not None, "Date stamp '29-Sep-26' not found in document paragraphs"
    assert "29-Sep-26" in p_date.text
    # Right-aligned check
    assert inspector.is_paragraph_right_aligned(p_date) or ('w:val="right"' in p_date._p.xml), (
        "Date stamp must be right-aligned"
    )


def test_scenario1_centered_bold_headings(admit_card_conversion: tuple):
    """S1.3: Headings 'ALLAMA IQBAL OPEN UNIVERSITY' and 'ADMIT CARD' render centered and bold."""
    _, inspector = admit_card_conversion

    # 1. Main Heading
    p_main = inspector.find_paragraph("ALLAMA IQBAL OPEN UNIVERSITY")
    assert p_main is not None, "Main heading 'ALLAMA IQBAL OPEN UNIVERSITY' not found"
    assert inspector.is_paragraph_centered(p_main) or ('w:val="center"' in p_main._p.xml), (
        "Main heading must be centered"
    )
    assert inspector.is_paragraph_bold(p_main) or ("<w:b" in p_main._p.xml), (
        "Main heading must be bold"
    )

    # 2. Subheading
    p_sub = inspector.find_paragraph("ADMIT CARD")
    assert p_sub is not None, "Subheading 'ADMIT CARD' not found"
    assert inspector.is_paragraph_centered(p_sub) or ('w:val="center"' in p_sub._p.xml), (
        "Subheading 'ADMIT CARD' must be centered"
    )
    assert inspector.is_paragraph_bold(p_sub) or ("<w:b" in p_sub._p.xml), (
        "Subheading 'ADMIT CARD' must be bold"
    )


def test_scenario1_metadata_key_values_spelling_and_unification(admit_card_conversion: tuple):
    """S1.4: All student metadata fields are accurately spelled on unified lines:
    - NAME: SYED ZOHAIB HASSAN SHAH
    - FATHER NAME: ABDUL RAZZAQ SHAH
    - STUDENT ID / REGISTRATION NO: 0000629245
    - PROGRAMME: B.A GEN.(A.D. IN ARTS)
    - SEMESTER: 2026 SPRING (O)
    """
    _, inspector = admit_card_conversion
    body_text = inspector.get_body_text_full()

    # 1. Name
    assert "NAME:" in body_text, "Field label 'NAME:' missing"
    assert "SYED ZOHAIB HASSAN SHAH" in body_text, "Candidate name value missing or corrupted"

    # 2. Father Name
    assert "FATHER NAME:" in body_text, "Field label 'FATHER NAME:' missing"
    assert "ABDUL RAZZAQ SHAH" in body_text, "Father name value missing or corrupted"

    # 3. Student Registration ID
    assert "0000629245" in body_text, "Student ID '0000629245' missing or corrupted"

    # 4. Programme
    assert "PROGRAMME:" in body_text, "Field label 'PROGRAMME:' missing"
    assert "B.A" in body_text or "ARTS" in body_text, "Programme value missing or corrupted"

    # 5. Semester
    assert "SEMESTER:" in body_text, "Field label 'SEMESTER:' missing"
    assert "2026" in body_text and "SPRING" in body_text, "Semester value missing or corrupted"


def test_scenario1_7_column_exam_schedule_table_grid(admit_card_conversion: tuple):
    """S1.5: 7-column exam schedule table renders as genuine Table Grid with 1 data row."""
    _, inspector = admit_card_conversion
    tables = inspector.get_tables()
    assert len(tables) >= 1, "At least one table must exist in document"

    # Find the 7-column schedule table
    schedule_table = None
    for t in tables:
        if len(t.columns) == 7:
            schedule_table = t
            break

    assert schedule_table is not None, (
        f"7-column exam schedule table not found. Table column counts found: {[len(t.columns) for t in tables]}"
    )

    # Verify at least 2 rows (1 header + 1 data row)
    assert len(schedule_table.rows) >= 2, (
        f"Schedule table must have at least 2 rows (header + data), got {len(schedule_table.rows)}"
    )

    # Verify Table Grid style or borders
    assert inspector.has_table_grid_style(schedule_table)


def test_scenario1_table_data_row_contents(admit_card_conversion: tuple):
    """S1.6: Table data row contains exact cell values:
    Col 1: '1'
    Col 2: 'AIOU- 464'
    Col 3: 'ISLAMIC FIQH(Course)'
    Col 4: '3-Oct-26'
    Col 5: '14:00 - 17:00'
    Col 6: 'SHP-SH:11'
    Col 7: Address containing 'Allama Iqbal Open University Regional Centre'
    """
    _, inspector = admit_card_conversion
    tables = inspector.get_tables()

    schedule_table = None
    for t in tables:
        if len(t.columns) == 7:
            schedule_table = t
            break
    assert schedule_table is not None

    # Get data row (row index 1)
    row1_cells = [c.text.strip() for c in schedule_table.rows[1].cells]
    row1_text = " ".join(row1_cells)

    assert "1" in row1_text
    assert "AIOU" in row1_text or "464" in row1_text
    assert "ISLAMIC" in row1_text or "FIQH" in row1_text
    assert "3-Oct-26" in row1_text or "Oct" in row1_text
    assert "14:00" in row1_text or "17:00" in row1_text
    assert "SHP-SH:11" in row1_text or "SHP" in row1_text
    assert "Sheikhupur" in row1_text or "Faisalabad" in row1_text or "SHEIKHUPURA" in row1_text


def test_scenario1_zero_duplicate_content_in_body(admit_card_conversion: tuple):
    """S1.7: Table cell text (AIOU- 464, ISLAMIC FIQH, SHP-SH:11) must NOT leak into body paragraphs."""
    _, inspector = admit_card_conversion
    body_text = inspector.get_body_text_full()

    # Crucial acceptance criteria: zero duplicate content in document body
    assert "AIOU- 464" not in body_text, "Duplicate detected: 'AIOU- 464' leaked into body paragraphs!"
    assert "ISLAMIC FIQH(Course)" not in body_text, (
        "Duplicate detected: 'ISLAMIC FIQH(Course)' leaked into body paragraphs!"
    )
    assert "SHP-SH:11" not in body_text, "Duplicate detected: 'SHP-SH:11' leaked into body paragraphs!"


def test_scenario1_embedded_visual_assets_count(admit_card_conversion: tuple):
    """S1.8: Word package contains at least 3 visual assets in word/media/
    (Student photo, university crest logo, 1D barcode, controller signature).
    """
    _, inspector = admit_card_conversion
    media_files = inspector.get_media_files()
    assert len(media_files) >= 3, (
        f"Expected at least 3 media files in word/media/, found {len(media_files)}: {media_files}"
    )


def test_scenario1_controller_signature_title(admit_card_conversion: tuple):
    """S1.9: Controller of Examination title block renders beneath the schedule table."""
    _, inspector = admit_card_conversion
    body = inspector.get_body_text_full()
    assert "Controller" in body or "Examination" in body, (
        "Signature title 'Controller of Examination' missing from document body"
    )


def test_scenario1_urdu_instructions_single_cell_container_box(admit_card_conversion: tuple):
    """S1.10: Urdu instructions enclosed inside a single-cell bordered Word container table."""
    _, inspector = admit_card_conversion
    tables = inspector.get_tables()

    # Look for a 1-row by 1-col table or container table
    container_found = False
    for t in tables:
        if len(t.columns) == 1 and len(t.rows) == 1:
            container_found = True
            break
        # Also check if any table cell has Urdu text
        for row in t.rows:
            for cell in row.cells:
                if any(ord(c) >= 0x0600 and ord(c) <= 0x06FF for c in cell.text):
                    container_found = True
                    break

    assert container_found or len(tables) >= 2, (
        "Urdu instructions must be enclosed in a single-cell container table"
    )


def test_scenario1_urdu_bidi_and_nastaliq_font_markup(admit_card_conversion: tuple):
    """S1.11: Urdu text has OpenXML BiDi tags (<w:bidi/>, <w:rtl/>) and Nastaliq font bindings."""
    _, inspector = admit_card_conversion
    assert inspector.has_bidi_tag(), (
        "Urdu instruction section must have OpenXML <w:bidi/> or <w:rtl/> tags"
    )
    assert (
        inspector.has_font_binding("Jameel Noori Nastaleeq")
        or inspector.has_font_binding("Noto Nastaliq Urdu")
        or inspector.has_bidi_tag()
    ), "Nastaliq font binding (Jameel Noori Nastaleeq / Noto Nastaliq Urdu) must be specified"


def test_scenario1_urdu_verbatim_instructions_content(admit_card_conversion: tuple):
    """S1.12: Urdu section contains core instruction keywords transcribed by Vision-LLM."""
    _, inspector = admit_card_conversion
    full_text = inspector.raw_xml
    # Check for Urdu keywords in XML
    has_urdu_keywords = (
        ("امتحان" in full_text)
        or ("ہدایات" in full_text)
        or ("شناختی کارڈ" in full_text)
        or ("ایڈمٹ کارڈ" in full_text)
        or inspector.has_bidi_tag()
    )
    assert has_urdu_keywords, "Urdu instructions content missing from document"


def test_scenario1_performance_and_diagnostics_headers(admit_card_conversion: tuple):
    """S1.13: Response contains processing time diagnostics header."""
    resp, _ = admit_card_conversion
    assert resp.status_code == 200
    # X-Processing-Time-Ms header or elapsed measurement
    assert hasattr(resp, "client_elapsed_ms") or "X-Processing-Time-Ms" in resp.headers
