"""
Integration Test Suite for FastAPI Service & Router (Milestone M4).
Uses TestClient(app) to test HTTP routing, operational safety guards,
file upload limits, MIME validation, and diagnostic response headers.
"""

from __future__ import annotations

import io
import os
import zipfile
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from main import app, validate_port, DEV_PORT


@pytest.fixture
def client() -> TestClient:
    """Fixture providing FastAPI TestClient."""
    return TestClient(app)


@pytest.fixture
def valid_png_bytes() -> bytes:
    """Fixture generating a minimal valid PNG image."""
    img = Image.new("RGB", (400, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


# ==============================================================================
# Service & Port Guard Tests
# ==============================================================================

def test_health_endpoint_schema(client: TestClient):
    """S1: GET /health returns 200 with service metadata and development port 8003."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "compixor-img2word"
    assert data["version"] == "8.0.0"
    assert data["port"] == DEV_PORT


def test_health_disallowed_method(client: TestClient):
    """S2: POST /health is rejected with 405 Method Not Allowed."""
    resp = client.post("/health")
    assert resp.status_code == 405


def test_port_guard_8002_raises_runtime_error():
    """S3: Port Guard immediately raises RuntimeError if port 8002 is ever configured."""
    with pytest.raises(RuntimeError, match="CRITICAL SAFETY VIOLATION: Port 8002 is reserved"):
        validate_port(8002)


def test_port_guard_8003_allowed():
    """S4: Development port 8003 is validated and allowed."""
    assert validate_port(8003) == 8003


# ==============================================================================
# File Validation & Error Handling Tests
# ==============================================================================

def test_convert_empty_file_returns_400(client: TestClient):
    """S5: Uploading an empty 0-byte file returns HTTP 400 Bad Request."""
    files = [("files", ("empty.png", b"", "image/png"))]
    resp = client.post("/api/convert-img-to-docx", files=files)
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


def test_convert_exceeds_10mb_returns_413(client: TestClient):
    """S6: Uploading a file exceeding 10MB returns HTTP 413 Payload Too Large."""
    oversized = b"0" * (10 * 1024 * 1024 + 1024)
    files = [("files", ("oversized.png", oversized, "image/png"))]
    resp = client.post("/api/convert-img-to-docx", files=files)
    assert resp.status_code == 413
    assert "exceeds" in resp.json()["detail"].lower()


def test_convert_corrupt_mime_returns_415(client: TestClient):
    """S7: Uploading corrupted binary bytes returns HTTP 415 Unsupported Media Type."""
    corrupt = b"\x00\xff\xfe\x01\x88\x99\xaa" * 50
    files = [("files", ("corrupt.png", corrupt, "image/png"))]
    resp = client.post("/api/convert-img-to-docx", files=files)
    assert resp.status_code == 415


# ==============================================================================
# Conversion & Diagnostic Headers Tests
# ==============================================================================

def test_convert_valid_image_success(client: TestClient, valid_png_bytes: bytes):
    """S8: Uploading a valid image converts successfully and returns valid .docx stream."""
    files = [("files", ("test_sample.png", valid_png_bytes, "image/png"))]
    data = {"language": "eng"}
    resp = client.post("/api/convert-img-to-docx", files=files, data=data)
    assert resp.status_code == 200
    assert "application/vnd.openxmlformats" in resp.headers.get("content-type", "")

    # Output bytes must be a valid zip archive (.docx)
    content = resp.content
    assert len(content) > 0
    assert zipfile.is_zipfile(io.BytesIO(content))


def test_convert_diagnostic_headers(client: TestClient, valid_png_bytes: bytes):
    """S9: Conversion response includes mandatory diagnostic and content headers."""
    files = [("files", ("doc.png", valid_png_bytes, "image/png"))]
    resp = client.post("/api/convert-img-to-docx", files=files)
    assert resp.status_code == 200

    headers = resp.headers
    assert "Content-Disposition" in headers
    assert "attachment;" in headers["Content-Disposition"]
    assert "X-Processing-Time-Ms" in headers
    assert float(headers["X-Processing-Time-Ms"]) >= 0.0
    assert "X-Peak-Memory-MB" in headers
    assert float(headers["X-Peak-Memory-MB"]) > 0.0
    assert "X-Tables-Detected" in headers
    assert "X-Visuals-Extracted" in headers


def test_convert_cors_exposed_headers(client: TestClient, valid_png_bytes: bytes):
    """S10: CORS Access-Control-Expose-Headers exposes diagnostic headers to browser client."""
    files = [("files", ("doc.png", valid_png_bytes, "image/png"))]
    resp = client.post("/api/convert-img-to-docx", files=files)
    assert resp.status_code == 200

    expose = resp.headers.get("Access-Control-Expose-Headers", "")
    assert "Content-Disposition" in expose
    assert "X-Processing-Time-Ms" in expose
    assert "X-Peak-Memory-MB" in expose
