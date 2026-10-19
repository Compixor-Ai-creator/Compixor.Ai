"""
Tier 4 Scenario 2: Real-World Generalization Test Suite (Unseen Document — CNIC / Marksheet).
Verifies that the conversion pipeline operates dynamically without hardcoded coordinates,
labels, or magic constants, successfully generalizing across completely unseen documents.
Target Service: http://127.0.0.1:8003/api/convert-img-to-docx
"""

import io
import os
import re
from pathlib import Path

import pytest

from tests.conftest import ApiClient, DocxInspector


@pytest.fixture(scope="module")
def marksheet_conversion(api_client: ApiClient, sample_marksheet_image: bytes) -> tuple:
    """Converts the unseen academic marksheet document."""
    resp, inspector = api_client.convert_and_inspect(
        sample_marksheet_image, filename="Unseen_Marksheet.png", mime_type="image/png"
    )
    return resp, inspector


@pytest.fixture(scope="module")
def cnic_conversion(api_client: ApiClient, sample_cnic_image: bytes) -> tuple:
    """Converts the unseen National Identity Card (CNIC) document."""
    resp, inspector = api_client.convert_and_inspect(
        sample_cnic_image, filename="Unseen_CNIC.png", mime_type="image/png"
    )
    return resp, inspector


def test_scenario2_marksheet_valid_docx(marksheet_conversion: tuple):
    """S2.1: Unseen marksheet converts to valid DOCX with healthy status."""
    resp, inspector = marksheet_conversion
    assert resp.status_code == 200
    assert inspector.is_valid_zip
    assert inspector.document is not None


def test_scenario2_marksheet_dynamic_table_columns_not_hardcoded_to_7(marksheet_conversion: tuple):
    """S2.2: Dynamic table detection adapts to 5 columns on marksheet (does NOT assume 7 columns)."""
    _, inspector = marksheet_conversion
    tables = inspector.get_tables()
    assert len(tables) >= 1, "At least one table must be detected on marksheet"

    marks_table = tables[0]
    # Marksheet has 5 columns: S.No, Subject, Max Marks, Marks Obtained, Remarks
    assert len(marks_table.columns) == 5, (
        f"Dynamic table must detect exactly 5 columns, but found {len(marks_table.columns)}"
    )


def test_scenario2_marksheet_table_rows_extracted(marksheet_conversion: tuple):
    """S2.3: Marksheet table contains multiple data rows (header + 5 subjects = 6 rows)."""
    _, inspector = marksheet_conversion
    table = inspector.get_tables()[0]
    assert len(table.rows) >= 5, f"Expected >= 5 rows in marksheet table, got {len(table.rows)}"


def test_scenario2_marksheet_zero_duplicate_content_in_body(marksheet_conversion: tuple):
    """S2.4: Marksheet subjects (e.g. 'Mathematics', 'Chemistry') must not leak into body paragraphs."""
    _, inspector = marksheet_conversion
    body = inspector.get_body_text_full()
    # "Mathematics" and "Physics" are in table cells; should NOT appear in body paragraphs outside table
    assert "Physics Theory & Practical" not in body, (
        "Table cell content 'Physics Theory & Practical' leaked into body paragraphs!"
    )


def test_scenario2_marksheet_visual_assets_extracted(marksheet_conversion: tuple):
    """S2.5: Marksheet logo and official seal stamp cropped as visual assets."""
    _, inspector = marksheet_conversion
    media_files = inspector.get_media_files()
    assert len(media_files) >= 1, (
        f"Expected at least 1 visual asset (logo/stamp) in word/media/, found {len(media_files)}"
    )


def test_scenario2_marksheet_centered_headings(marksheet_conversion: tuple):
    """S2.6: Marksheet institutional heading renders centered."""
    _, inspector = marksheet_conversion
    p_head = inspector.find_paragraph("BOARD OF INTERMEDIATE")
    assert p_head is not None, "Marksheet board heading missing"
    assert inspector.is_paragraph_centered(p_head) or ('w:val="center"' in p_head._p.xml)


def test_scenario2_marksheet_key_values_unified(marksheet_conversion: tuple):
    """S2.7: Marksheet student metadata fields unified as key-value pairs."""
    _, inspector = marksheet_conversion
    body = inspector.get_body_text_full()
    assert "ROLL NUMBER:" in body, "Field label 'ROLL NUMBER:' missing"
    assert "489201" in body, "Roll number value missing"
    assert "CANDIDATE NAME:" in body
    assert "MUHAMMAD USMAN" in body


def test_scenario2_cnic_valid_docx(cnic_conversion: tuple):
    """S2.8: Unseen CNIC document converts to valid DOCX."""
    resp, inspector = cnic_conversion
    assert resp.status_code == 200
    assert inspector.is_valid_zip


def test_scenario2_cnic_citizen_photo_crop_extracted(cnic_conversion: tuple):
    """S2.9: CNIC citizen photo extracted to word/media/."""
    _, inspector = cnic_conversion
    media_files = inspector.get_media_files()
    assert len(media_files) >= 1, (
        f"Expected citizen photo in word/media/, found {len(media_files)}"
    )


def test_scenario2_cnic_identity_number_and_fields_extracted(cnic_conversion: tuple):
    """S2.10: CNIC identity number (35201-1234567-9) and metadata fields extracted."""
    _, inspector = cnic_conversion
    body = inspector.get_body_text_full()
    assert "35201-1234567-9" in body, "CNIC identity number missing or corrupted"
    assert "HAMZA KHALID" in body, "CNIC citizen name missing"


def test_scenario2_codebase_anti_hardcoding_audit():
    """S2.11: Static audit of pipeline codebase asserting zero hardcoded AIOU coordinates or magic strings.
    Inspects all Python files in pipeline/ to ensure generic layout logic.
    """
    backend_dir = Path(__file__).parent.parent.parent
    pipeline_dir = backend_dir / "pipeline"

    if not pipeline_dir.exists():
        pytest.skip("pipeline/ directory does not exist yet (M1-M4 in progress)")

    forbidden_patterns = [
        r"ALLAMA IQBAL",
        r"0000629245",
        r"SYED ZOHAIB",
        r"ABDUL RAZZAQ",
        r"AIOU-\s*464",
        r"SHP-SH:11",
    ]

    violations = []
    for py_file in pipeline_dir.rglob("*.py"):
        content = py_file.read_text(encoding="utf-8", errors="replace")
        for pat in forbidden_patterns:
            if re.search(pat, content, re.IGNORECASE):
                violations.append(f"{py_file.name}: matches forbidden pattern '{pat}'")

    assert not violations, (
        f"Hardcoding violations found in pipeline codebase:\n" + "\n".join(violations)
    )
