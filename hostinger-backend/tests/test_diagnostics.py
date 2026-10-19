"""
Unit & Integration Tests for Diagnostics, Resource Monitor & Memory Guard.
Tests all requirements of Milestone M4 (Requirement R7 and Interface Contract 6).
"""

from __future__ import annotations

import io
import json
import time
from dataclasses import dataclass
import pytest
import numpy as np
from PIL import Image

from pipeline.diagnostics import (
    ConversionDiagnostics,
    ConfidenceTracker,
    PeakMemoryContext,
    ResourceMonitor,
    normalize_confidence,
    extract_tokens_from_tesseract_data,
    force_garbage_collection,
    release_page_intermediates,
    get_response_headers,
    VPS_TOTAL_RAM_MB,
    PER_DOC_BUDGET_MB,
    MEMORY_WARNING_THRESHOLD_MB,
    MEMORY_CRITICAL_THRESHOLD_MB,
    LOW_CONFIDENCE_THRESHOLD,
)


# ==============================================================================
# 1. ResourceMonitor & Memory Tracking Tests
# ==============================================================================

def test_resource_monitor_get_current_rss_mb():
    """Verify get_current_rss_mb returns a positive floating point value."""
    monitor = ResourceMonitor()
    rss = monitor.get_current_rss_mb()
    assert isinstance(rss, float)
    assert rss > 0.0


def test_resource_monitor_track_peak_memory_context():
    """Verify track_peak_memory works as context manager and captures allocations."""
    monitor = ResourceMonitor()
    with monitor.track_peak_memory(interval_s=0.01) as tracker:
        assert isinstance(tracker, PeakMemoryContext)
        # Allocate some memory to cause a spike
        data = [bytearray(1024 * 1024) for _ in range(10)]  # ~10 MB allocation
        time.sleep(0.04)
        del data

    assert tracker.peak_mb >= tracker.start_mb
    assert monitor.peak_memory_mb >= tracker.start_mb


def test_resource_monitor_track_peak_memory_as_float():
    """Verify track_peak_memory evaluates as float per Interface Contract 6."""
    monitor = ResourceMonitor()
    peak = monitor.track_peak_memory()
    assert isinstance(peak, float)
    assert float(peak) > 0.0


def test_resource_monitor_budget_warning_and_critical(caplog):
    """Verify budget threshold logging at warning and critical levels."""
    import logging
    monitor = ResourceMonitor()
    with caplog.at_level(logging.INFO):
        # Normal
        monitor.check_budget(100.0)
        # 2GB doc budget info
        monitor.check_budget(2100.0)
        assert "reached single-document budget" in caplog.text

        # 6GB warning
        monitor.check_budget(6500.0)
        assert "HIGH MEMORY WARNING" in caplog.text

        # 7GB critical
        monitor.check_budget(7500.0)
        assert "CRITICAL MEMORY" in caplog.text


def test_resource_monitor_is_memory_safe():
    """Verify is_memory_safe boolean return."""
    monitor = ResourceMonitor()
    assert isinstance(monitor.is_memory_safe(), bool)


# ==============================================================================
# 2. Sequential Page GC & Cleanup Tests
# ==============================================================================

def test_force_garbage_collection():
    """Verify force_garbage_collection triggers gc and returns freed count."""
    monitor = ResourceMonitor()
    freed_method = monitor.force_garbage_collection()
    assert isinstance(freed_method, int)

    freed_func = force_garbage_collection()
    assert isinstance(freed_func, int)


def test_release_page_intermediates():
    """Verify release_page_intermediates dereferences arrays and closes images."""
    @dataclass
    class DummyPage:
        rgb_image: Image.Image
        clahe_gray: np.ndarray
        binary_image: np.ndarray

    img = Image.new("RGB", (100, 100), (255, 255, 255))
    page = DummyPage(
        rgb_image=img,
        clahe_gray=np.zeros((100, 100), dtype=np.uint8),
        binary_image=np.ones((100, 100), dtype=np.uint8),
    )

    freed = release_page_intermediates(page)
    assert isinstance(freed, int)
    assert page.clahe_gray is None
    assert page.binary_image is None


# ==============================================================================
# 3. Confidence Normalization & Tracking Tests
# ==============================================================================

def test_normalize_confidence():
    """Verify confidence values are properly normalized and clamped."""
    # 0-1 scale
    assert normalize_confidence(0.85) == 85.0
    assert normalize_confidence(1.0) == 100.0
    assert normalize_confidence(0.542) == 54.2
    assert normalize_confidence(0.0) == 0.0

    # 0-100 scale
    assert normalize_confidence(85.0) == 85.0
    assert normalize_confidence(58.3) == 58.3
    assert normalize_confidence(100.0) == 100.0

    # Negative / Invalid
    assert normalize_confidence(-1.0) == 0.0
    assert normalize_confidence("invalid") == 0.0
    assert normalize_confidence(120.0) == 100.0


def test_confidence_tracker_token_aggregation():
    """Verify token aggregation, statistics calculation, and low-confidence extraction."""
    tracker = ConfidenceTracker(low_confidence_threshold=60.0)
    tracker.add_token("HEADER", 95.0, (100, 50, 200, 30), page_number=1)
    tracker.add_token("SECTION", 85.0, (100, 90, 100, 30), page_number=1)
    tracker.add_token("BLURRY_WORD", 45.0, (100, 130, 80, 20), page_number=1)
    tracker.add_token("FAINT_MARK", 55.5, (100, 160, 60, 20), page_number=2)

    stats = tracker.compute_stats()
    assert stats["total_tokens"] == 4
    assert stats["low_confidence_count"] == 2
    assert stats["average_confidence"] == round((95.0 + 85.0 + 45.0 + 55.5) / 4, 2)
    assert stats["min_confidence"] == 45.0
    assert stats["max_confidence"] == 95.0

    low_tokens = stats["low_confidence_tokens"]
    assert len(low_tokens) == 2
    assert low_tokens[0]["token_text"] == "BLURRY_WORD"
    assert low_tokens[0]["confidence"] == 45.0
    assert low_tokens[0]["page_number"] == 1
    assert low_tokens[1]["token_text"] == "FAINT_MARK"
    assert low_tokens[1]["confidence"] == 55.5
    assert low_tokens[1]["page_number"] == 2


def test_confidence_tracker_page_stats():
    """Verify page-specific confidence stats calculation."""
    tracker = ConfidenceTracker()
    tracker.add_token("PAGE1_A", 90.0, page_number=1)
    tracker.add_token("PAGE1_B", 80.0, page_number=1)
    tracker.add_token("PAGE2_A", 50.0, page_number=2)

    p1_stats = tracker.compute_page_stats(1)
    assert p1_stats["total_tokens"] == 2
    assert p1_stats["average_confidence"] == 85.0
    assert p1_stats["low_confidence_count"] == 0

    p2_stats = tracker.compute_page_stats(2)
    assert p2_stats["total_tokens"] == 1
    assert p2_stats["average_confidence"] == 50.0
    assert p2_stats["low_confidence_count"] == 1


def test_confidence_tracker_table_cells():
    """Verify adding table cells extracts tokens and tracks low confidence."""
    @dataclass
    class DummyCell:
        text: str
        confidence: float
        bbox: tuple[int, int, int, int]

    cells = [
        DummyCell(text="Subject Title", confidence=92.0, bbox=(10, 10, 100, 20)),
        DummyCell(text="Low Conf Val", confidence=0.48, bbox=(10, 30, 80, 20)),
    ]

    tracker = ConfidenceTracker()
    tracker.add_table_cells(cells, page_number=1)

    stats = tracker.compute_stats()
    assert stats["total_tokens"] >= 2
    low_tokens = stats["low_confidence_tokens"]
    # 0.48 normalized to 48.0 < 60.0
    assert any("Low" in t["token_text"] for t in low_tokens)


# ==============================================================================
# 4. ConversionDiagnostics Contract & Serialization Tests
# ==============================================================================

def test_conversion_diagnostics_contract():
    """Verify ConversionDiagnostics dataclass conforms to Contract 6."""
    diag = ConversionDiagnostics(
        processing_time_ms=124.50,
        peak_memory_mb=185.32,
        page_count=2,
        tables_detected=1,
        visual_elements_extracted=4,
        low_confidence_tokens=[
            {"token_text": "SIG", "confidence": 42.0, "bbox": [10, 20, 30, 40], "page_number": 1}
        ],
    )

    d = diag.to_dict()
    assert d["processing_time_ms"] == 124.50
    assert d["peak_memory_mb"] == 185.32
    assert d["page_count"] == 2
    assert d["tables_detected"] == 1
    assert d["visual_elements_extracted"] == 4
    assert len(d["low_confidence_tokens"]) == 1
    assert d["low_confidence_count"] == 1

    # JSON Round-trip
    json_str = diag.to_json()
    parsed = ConversionDiagnostics.from_json(json_str)
    assert parsed.processing_time_ms == diag.processing_time_ms
    assert parsed.peak_memory_mb == diag.peak_memory_mb
    assert parsed.tables_detected == diag.tables_detected
    assert len(parsed.low_confidence_tokens) == 1


# ==============================================================================
# 5. HTTP Diagnostic Headers Tests
# ==============================================================================

def test_get_response_headers():
    """Verify get_response_headers returns the 5 required HTTP headers."""
    diag = ConversionDiagnostics(
        processing_time_ms=88.42,
        peak_memory_mb=145.10,
        page_count=1,
        tables_detected=2,
        visual_elements_extracted=3,
        low_confidence_tokens=[
            {"token_text": "A", "confidence": 30.0, "bbox": [0, 0, 10, 10], "page_number": 1}
        ],
    )

    headers = get_response_headers(diag)
    assert headers["X-Processing-Time-Ms"] == "88.42"
    assert headers["X-Peak-Memory-MB"] == "145.10"
    assert headers["X-Tables-Detected"] == "2"
    assert headers["X-Visuals-Extracted"] == "3"
    assert headers["X-Low-Confidence-Count"] == "1"
