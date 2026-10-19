"""
Empirical Challenger S2_M4_2 Test Suite: Diagnostics, Resource & Service Stress Tester.
Conforms strictly to Milestone M4 requirements, Interface Contracts, and Authoritative User Request.

Mission Requirements Tested:
1. Port 8002 Safety Guard: Configuring or passing port 8002 triggers an immediate
   RuntimeError("CRITICAL SAFETY VIOLATION: Port 8002 is reserved for production...").
2. Memory Tracking & Rapid Sequential Load: Memory tracking across consecutive conversions,
   staying well below 2048 MB cap, sequential explicit GC without deadlock or thread leak.
3. Upload Size Limit (413): Payloads strictly exceeding 10MB return HTTP 413; valid payloads
   under 10MB are accepted.
4. Format Validation (415 & 400): 0-byte files return HTTP 400 and corrupted byte payloads
   return HTTP 415.
5. Health Endpoint Schema: GET /health returns status 200 with service="compixor-img2word",
   version="8.0.0", and port=8003.
6. Diagnostic Headers: X-Processing-Time-Ms, X-Peak-Memory-MB, X-Tables-Detected, and
   X-Visuals-Extracted are present in response headers and exposed via CORS.
"""

from __future__ import annotations

import gc
import io
import os
import re
import time
import zipfile
from pathlib import Path
from typing import List
from unittest.mock import patch

import numpy as np
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from main import app, validate_port, DEV_PORT, MAX_UPLOAD_MB, MAX_FILE_SIZE_BYTES
from pipeline.diagnostics import (
    ConversionDiagnostics,
    ConfidenceTracker,
    PeakMemoryContext,
    ResourceMonitor,
    get_response_headers,
    release_page_intermediates,
    force_garbage_collection,
    VPS_TOTAL_RAM_MB,
    PER_DOC_BUDGET_MB,
    MEMORY_WARNING_THRESHOLD_MB,
    MEMORY_CRITICAL_THRESHOLD_MB,
)
from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage


# ==============================================================================
# Fixtures & Helpers
# ==============================================================================

@pytest.fixture
def client() -> TestClient:
    """Fixture providing a FastAPI TestClient."""
    return TestClient(app)


@pytest.fixture
def valid_png_bytes() -> bytes:
    """Generates a minimal valid 200x100 white PNG image with simple black text."""
    img = Image.new("RGB", (200, 100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def make_dummy_page(
    page_num: int = 1, width: int = 400, height: int = 300
) -> PreprocessedPage:
    """Generates a synthetic PreprocessedPage fixture for resource cleanup testing."""
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    clahe = np.zeros((height, width), dtype=np.uint8)
    binary = np.ones((height, width), dtype=np.uint8) * 255
    return PreprocessedPage(
        page_number=page_num,
        rgb_image=img,
        clahe_gray=clahe,
        binary_image=binary,
        skew_angle=0.0,
        dpi=300,
        width=width,
        height=height,
    )


# ==============================================================================
# 1. Port 8002 Safety Guard
# ==============================================================================

class TestPort8002SafetyGuard:
    """Stress tests Port 8002 Operational Safety Guard (Requirement R1)."""

    def test_port_8002_raises_runtime_error_with_exact_message(self):
        """Verify that passing port 8002 triggers an immediate RuntimeError."""
        with pytest.raises(RuntimeError) as exc_info:
            validate_port(8002)

        msg = str(exc_info.value)
        assert "CRITICAL SAFETY VIOLATION: Port 8002 is reserved for production" in msg

    def test_port_8003_allowed_as_dev_port(self):
        """Verify development port 8003 is validated and allowed."""
        assert validate_port(8003) == 8003

    def test_arbitrary_non_8002_ports_allowed(self):
        """Verify non-8002 ports (e.g. 8000, 8080) pass port validation."""
        assert validate_port(8000) == 8000
        assert validate_port(8080) == 8080

    def test_env_var_dev_port_8002_guard(self):
        """Verify that setting DEV_PORT=8002 triggers the safety guard."""
        with patch.dict(os.environ, {"DEV_PORT": "8002"}):
            with pytest.raises(RuntimeError, match="CRITICAL SAFETY VIOLATION: Port 8002 is reserved"):
                validate_port(int(os.environ["DEV_PORT"]))

    def test_default_dev_port_constant_is_8003(self):
        """Verify DEV_PORT constant in main is strictly 8003."""
        assert DEV_PORT == 8003


# ==============================================================================
# 2. Memory Tracking & Rapid Sequential Load
# ==============================================================================

class TestMemoryTrackingAndSequentialLoad:
    """Stress tests memory tracking, sequential load, and explicit GC (Requirement R7)."""

    def test_memory_rss_positive_and_well_below_2048mb_cap(self):
        """Verify process RSS memory is positive and well below the 2048 MB cap."""
        monitor = ResourceMonitor()
        rss = monitor.get_current_rss_mb()
        assert isinstance(rss, float)
        assert rss > 0.0
        assert rss < PER_DOC_BUDGET_MB, f"RSS {rss} MB exceeded 2048 MB cap!"

    def test_rapid_consecutive_conversions_no_deadlock(self):
        """
        Verify memory tracking across 10 rapid consecutive simulated conversions.
        Checks:
        - Memory stays well below the 2048 MB cap.
        - Background sampling threads terminate cleanly without deadlock or leak.
        - Sequential explicit GC runs without error.
        """
        monitor = ResourceMonitor()
        peak_values: List[float] = []

        for i in range(10):
            with monitor.track_peak_memory(interval_s=0.01) as tracker:
                # Simulate work allocation
                temp_buffers = [np.ones((200, 200, 3), dtype=np.uint8) for _ in range(5)]
                time.sleep(0.02)
                del temp_buffers

            peak_mb = tracker.peak_mb
            peak_values.append(peak_mb)
            assert peak_mb < PER_DOC_BUDGET_MB, f"Run {i}: Peak {peak_mb} MB exceeded {PER_DOC_BUDGET_MB} MB cap!"

            # Explicit sequential GC run
            freed = monitor.force_garbage_collection()
            assert isinstance(freed, int)

        assert len(peak_values) == 10
        assert all(p > 0.0 for p in peak_values)

    def test_track_peak_memory_as_float_contract(self):
        """Verify track_peak_memory satisfies Interface Contract 6 (evaluates as float)."""
        monitor = ResourceMonitor()
        peak = monitor.track_peak_memory()
        assert isinstance(peak, float)
        assert float(peak) > 0.0
        assert float(peak) < PER_DOC_BUDGET_MB

    def test_track_peak_memory_exception_resilience(self):
        """Verify that an exception inside track_peak_memory terminates sampling cleanly."""
        monitor = ResourceMonitor()
        with pytest.raises(ZeroDivisionError):
            with monitor.track_peak_memory(interval_s=0.01) as tracker:
                _ = 1 / 0

        # Thread must have terminated and stop event must be set
        assert tracker._stop_event.is_set()
        if tracker._thread is not None:
            assert not tracker._thread.is_alive()

    def test_sequential_page_gc_and_dereference(self):
        """Verify release_page_intermediates frees arrays and images cleanly."""
        page = make_dummy_page(1, 500, 500)
        assert page.clahe_gray is not None
        assert page.binary_image is not None

        freed = release_page_intermediates(page)
        assert isinstance(freed, int)
        assert page.clahe_gray is None
        assert page.binary_image is None

        # Double-release must be safe
        freed2 = release_page_intermediates(page)
        assert isinstance(freed2, int)

    def test_budget_threshold_warning_and_critical(self, caplog):
        """Verify budget threshold evaluation at warning and critical levels."""
        import logging
        monitor = ResourceMonitor()
        with caplog.at_level(logging.INFO):
            monitor.check_budget(100.0)
            monitor.check_budget(2500.0)
            assert "reached single-document budget" in caplog.text

            monitor.check_budget(6200.0)
            assert "HIGH MEMORY WARNING" in caplog.text

            monitor.check_budget(7200.0)
            assert "CRITICAL MEMORY" in caplog.text

    def test_is_memory_safe_predicate(self):
        """Verify is_memory_safe predicate."""
        monitor = ResourceMonitor()
        assert monitor.is_memory_safe() is True


# ==============================================================================
# 3. Upload Size Limit (413)
# ==============================================================================

class TestUploadSizeLimit:
    """Stress tests 10MB upload cap and boundary conditions (Requirement R2)."""

    def test_payload_strictly_exceeding_10mb_returns_413(self, client: TestClient):
        """Verify payload strictly exceeding 10MB returns HTTP 413."""
        oversized_bytes = b"X" * (MAX_FILE_SIZE_BYTES + 1024)  # 10MB + 1KB
        files = [("files", ("large_scan.png", oversized_bytes, "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 413
        data = resp.json()
        assert "exceeds" in data["detail"].lower()

    def test_single_byte_over_10mb_limit_returns_413(self, client: TestClient):
        """Verify payload exactly 1 byte over the 10MB limit returns HTTP 413."""
        one_byte_over = b"A" * (MAX_FILE_SIZE_BYTES + 1)
        files = [("files", ("boundary_over.png", one_byte_over, "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 413

    def test_multiple_files_cumulative_exceeding_10mb_returns_413(self, client: TestClient):
        """Verify multiple files whose cumulative size exceeds 10MB return HTTP 413."""
        file1 = b"B" * (6 * 1024 * 1024)  # 6 MB
        file2 = b"C" * (5 * 1024 * 1024)  # 5 MB (Total 11 MB > 10 MB)
        files = [
            ("files", ("page1.png", file1, "image/png")),
            ("files", ("page2.png", file2, "image/png")),
        ]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 413
        assert "exceeds" in resp.json()["detail"].lower()

    def test_preprocessor_validate_file_size_boundary(self):
        """Direct unit test of DocumentPreprocessor size validation boundary."""
        prep = DocumentPreprocessor(max_upload_mb=10)

        # 1 byte over limit
        oversized = b"\x89PNG\r\n\x1a\n" + b"\x00" * (10 * 1024 * 1024)
        with pytest.raises(ValueError, match="exceeds the 10MB limit"):
            prep.validate_file(oversized, "test.png")


# ==============================================================================
# 4. Format Validation (415 & 400)
# ==============================================================================

class TestFormatValidation:
    """Stress tests file format validation, 0-byte and corrupted payloads."""

    def test_zero_byte_empty_file_returns_400(self, client: TestClient):
        """Verify 0-byte file upload returns HTTP 400 Bad Request."""
        files = [("files", ("empty.png", b"", "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 400
        assert "empty" in resp.json()["detail"].lower()

    def test_no_files_parameter_returns_422_or_400(self, client: TestClient):
        """Verify request with missing files parameter is rejected."""
        resp = client.post("/api/convert-img-to-docx")
        assert resp.status_code in (400, 422)

    def test_corrupted_byte_payload_returns_415(self, client: TestClient):
        """Verify corrupted binary payload with image extension returns HTTP 415."""
        corrupt = b"\x00\xff\xfe\x01\x88\x99\xaa\xbb\xcc" * 100
        files = [("files", ("corrupted_scan.png", corrupt, "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 415
        assert "unsupported media type or corrupted" in resp.json()["detail"].lower()

    def test_text_file_disguised_as_jpg_returns_415(self, client: TestClient):
        """Verify plain ASCII text uploaded as .jpg returns HTTP 415."""
        fake_jpg = b"This is plain text pretending to be a JPG document."
        files = [("files", ("fake_photo.jpg", fake_jpg, "image/jpeg"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 415

    def test_unsupported_file_extension_returns_415(self, client: TestClient):
        """Verify disallowed file extension returns HTTP 415."""
        executable_data = b"MZ\x90\x00\x03\x00\x00\x00"
        files = [("files", ("payload.exe", executable_data, "application/octet-stream"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 415


# ==============================================================================
# 5. Health Endpoint Schema
# ==============================================================================

class TestHealthEndpointSchema:
    """Stress tests GET /health schema, service metadata, and HTTP method guards."""

    def test_get_health_status_code_and_schema(self, client: TestClient):
        """Verify GET /health returns status 200 with required schema fields."""
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()

        assert data["status"] == "healthy"
        assert data["service"] == "compixor-img2word"
        assert data["version"] == "8.0.0"
        assert data["port"] == 8003
        assert "engine" in data

    def test_health_disallowed_post_method(self, client: TestClient):
        """Verify POST /health returns HTTP 405 Method Not Allowed."""
        resp = client.post("/health")
        assert resp.status_code == 405

    def test_health_disallowed_put_method(self, client: TestClient):
        """Verify PUT /health returns HTTP 405 Method Not Allowed."""
        resp = client.put("/health")
        assert resp.status_code == 405

    def test_health_disallowed_delete_method(self, client: TestClient):
        """Verify DELETE /health returns HTTP 405 Method Not Allowed."""
        resp = client.delete("/health")
        assert resp.status_code == 405


# ==============================================================================
# 6. Diagnostic Headers
# ==============================================================================

class TestDiagnosticHeaders:
    """Stress tests conversion response headers and CORS exposure."""

    def test_diagnostic_headers_present_in_conversion_response(
        self, client: TestClient, valid_png_bytes: bytes
    ):
        """
        Verify all mandatory diagnostic headers are present on /api/convert-img-to-docx:
        - X-Processing-Time-Ms
        - X-Peak-Memory-MB
        - X-Tables-Detected
        - X-Visuals-Extracted
        """
        files = [("files", ("test_card.png", valid_png_bytes, "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 200

        headers = resp.headers
        assert "X-Processing-Time-Ms" in headers, "Missing X-Processing-Time-Ms header"
        assert "X-Peak-Memory-MB" in headers, "Missing X-Peak-Memory-MB header"
        assert "X-Tables-Detected" in headers, "Missing X-Tables-Detected header"
        assert "X-Visuals-Extracted" in headers, "Missing X-Visuals-Extracted header"

    def test_diagnostic_headers_values_sanity(
        self, client: TestClient, valid_png_bytes: bytes
    ):
        """Verify diagnostic header values are numerically sane and non-negative."""
        files = [("files", ("test_card.png", valid_png_bytes, "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 200

        headers = resp.headers
        t_ms = float(headers["X-Processing-Time-Ms"])
        mem_mb = float(headers["X-Peak-Memory-MB"])
        tables = int(headers["X-Tables-Detected"])
        visuals = int(headers["X-Visuals-Extracted"])

        assert t_ms >= 0.0
        assert mem_mb > 0.0
        assert mem_mb < PER_DOC_BUDGET_MB
        assert tables >= 0
        assert visuals >= 0

    def test_cors_exposed_headers_include_diagnostics(
        self, client: TestClient, valid_png_bytes: bytes
    ):
        """Verify CORS Access-Control-Expose-Headers exposes all diagnostic headers."""
        files = [("files", ("test_card.png", valid_png_bytes, "image/png"))]
        resp = client.post("/api/convert-img-to-docx", files=files)
        assert resp.status_code == 200

        expose = resp.headers.get("Access-Control-Expose-Headers", "")
        assert "X-Processing-Time-Ms" in expose
        assert "X-Peak-Memory-MB" in expose
        assert "X-Tables-Detected" in expose
        assert "X-Visuals-Extracted" in expose
        assert "Content-Disposition" in expose

    def test_get_response_headers_helper_contract(self):
        """Direct unit test of get_response_headers helper function."""
        diag = ConversionDiagnostics(
            processing_time_ms=152.34,
            peak_memory_mb=182.50,
            page_count=2,
            tables_detected=3,
            visual_elements_extracted=5,
            low_confidence_tokens=[
                {"token_text": "abc", "confidence": 45.0, "bbox": [0, 0, 10, 10], "page_number": 1}
            ],
        )
        h = get_response_headers(diag)
        assert h["X-Processing-Time-Ms"] == "152.34"
        assert h["X-Peak-Memory-MB"] == "182.50"
        assert h["X-Tables-Detected"] == "3"
        assert h["X-Visuals-Extracted"] == "5"
        assert h["X-Low-Confidence-Count"] == "1"


# ==============================================================================
# 7. Codebase Anti-Hardcoding Audit
# ==============================================================================

class TestAntiHardcodingAudit:
    """Verifies that pipeline/diagnostics.py and main.py contain zero hardcoded student entities."""

    def test_zero_hardcoded_entities(self):
        backend_dir = Path(__file__).parent.parent
        target_files = [
            backend_dir / "pipeline" / "diagnostics.py",
            backend_dir / "main.py",
        ]

        forbidden_patterns = [
            r"ALLAMA IQBAL",
            r"0000629245",
            r"SYED ZOHAIB",
            r"ABDUL RAZZAQ",
            r"AIOU-\s*464",
            r"SHP-SH:11",
        ]

        for file_path in target_files:
            assert file_path.exists(), f"Target file {file_path} not found"
            content = file_path.read_text(encoding="utf-8")
            for pat in forbidden_patterns:
                assert not re.search(pat, content, re.IGNORECASE), (
                    f"Forbidden pattern '{pat}' detected in {file_path.name}!"
                )
