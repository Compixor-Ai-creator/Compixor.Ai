"""
Diagnostics, Resource Monitoring & Memory Guard Engine.
Conforms to PROJECT.md § Interface Contracts § 6 and Requirement R7.

Responsibilities:
1. Resource Monitoring & Memory Tracking:
   - Tracks RSS memory in megabytes (MB) using psutil.Process(os.getpid()).memory_info().rss
     with graceful fallbacks for minimal environments.
   - Implements ResourceMonitor with get_current_rss_mb() -> float.
   - Provides track_peak_memory() background sampler & context manager.
   - Enforces 8 GB RAM VPS budget constraints (8192 MB total, 2048 MB per-document,
     6144 MB warning, 7168 MB critical thresholds).
2. Sequential Page Garbage Collection:
   - Provides force_garbage_collection() -> int running gc.collect() explicitly.
   - Provides release_page_intermediates() to dereference and collect large numpy arrays,
     PIL images, and OCR intermediates after each page.
3. Low-Confidence Token Tracking & Statistics:
   - Aggregates OCR confidence scores from pytesseract image_to_data and TableCell OCR.
   - Computes average, median, and minimum confidence per page and document-wide.
   - Extracts low_confidence_tokens (< 60.0%) recording token_text, confidence, bbox, page_number.
4. Structured JSON Diagnostics Contract:
   - Implements ConversionDiagnostics conforming to Interface Contract 6.
   - Provides to_dict(), to_json(), from_dict(), from_json().
5. HTTP Diagnostic Headers:
   - Implements get_response_headers(diag) providing:
     X-Processing-Time-Ms, X-Peak-Memory-MB, X-Tables-Detected,
     X-Visuals-Extracted, X-Low-Confidence-Count.
"""

from __future__ import annotations

import gc
import json
import logging
import os
import statistics
import sys
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple, Union

logger = logging.getLogger("compixor.pipeline.diagnostics")

# ==============================================================================
# VPS Hardware Budget Constants (Requirement R7: 8 GB RAM, 2 vCPU VPS)
# ==============================================================================

VPS_TOTAL_RAM_MB: float = 8192.0          # 8 GB VPS total memory
PER_DOC_BUDGET_MB: float = 2048.0         # 2 GB per single conversion limit
MEMORY_WARNING_THRESHOLD_MB: float = 6144.0  # 75% of 8 GB VPS
MEMORY_CRITICAL_THRESHOLD_MB: float = 7168.0 # 87.5% of 8 GB VPS
LOW_CONFIDENCE_THRESHOLD: float = 60.0       # Tesseract OCR confidence percentage cutoff


# ==============================================================================
# Interface Contract 6: Data Models
# ==============================================================================

@dataclass
class ConversionDiagnostics:
    """
    Structured diagnostic report for document conversion.
    Conforms strictly to PROJECT.md § Interface Contracts § 6.
    """
    processing_time_ms: float
    peak_memory_mb: float
    page_count: int
    tables_detected: int
    visual_elements_extracted: int
    low_confidence_tokens: list[dict] = field(default_factory=list)
    average_confidence: float = 0.0
    median_confidence: float = 0.0
    min_confidence: float = 0.0
    max_confidence: float = 0.0
    total_tokens: int = 0

    def to_dict(self) -> dict[str, Any]:
        """Serializes diagnostics to a clean JSON-serializable dictionary."""
        return {
            "processing_time_ms": round(float(self.processing_time_ms), 2),
            "peak_memory_mb": round(float(self.peak_memory_mb), 2),
            "page_count": int(self.page_count),
            "tables_detected": int(self.tables_detected),
            "visual_elements_extracted": int(self.visual_elements_extracted),
            "low_confidence_tokens": self.low_confidence_tokens,
            "low_confidence_count": len(self.low_confidence_tokens),
            "average_confidence": round(float(self.average_confidence), 2),
            "median_confidence": round(float(self.median_confidence), 2),
            "min_confidence": round(float(self.min_confidence), 2),
            "max_confidence": round(float(self.max_confidence), 2),
            "total_tokens": int(self.total_tokens),
        }

    def to_json(self, indent: Optional[int] = None) -> str:
        """Serializes diagnostics to a JSON formatted string."""
        return json.dumps(self.to_dict(), indent=indent)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ConversionDiagnostics:
        """Constructs ConversionDiagnostics from a dictionary."""
        tokens = list(data.get("low_confidence_tokens", []))
        return cls(
            processing_time_ms=float(data.get("processing_time_ms", 0.0)),
            peak_memory_mb=float(data.get("peak_memory_mb", 0.0)),
            page_count=int(data.get("page_count", 1)),
            tables_detected=int(data.get("tables_detected", 0)),
            visual_elements_extracted=int(data.get("visual_elements_extracted", 0)),
            low_confidence_tokens=tokens,
            average_confidence=float(data.get("average_confidence", 0.0)),
            median_confidence=float(data.get("median_confidence", 0.0)),
            min_confidence=float(data.get("min_confidence", 0.0)),
            max_confidence=float(data.get("max_confidence", 0.0)),
            total_tokens=int(data.get("total_tokens", len(tokens))),
        )

    @classmethod
    def from_json(cls, json_str: str) -> ConversionDiagnostics:
        """Constructs ConversionDiagnostics from a JSON string."""
        return cls.from_dict(json.loads(json_str))


# ==============================================================================
# Helper Functions: Confidence Normalization & Parsing
# ==============================================================================

def normalize_confidence(conf: Union[float, int, str]) -> float:
    """
    Normalizes confidence scores to 0.0 - 100.0 percentage scale.
    Handles:
      - 0.0 - 1.0 probability inputs (e.g. 0.85 -> 85.0)
      - 0.0 - 100.0 native tesseract scores (e.g. 85.0 -> 85.0)
      - Negative error values (e.g. -1 -> 0.0)
      - Clamps results strictly within [0.0, 100.0].
    """
    try:
        val = float(conf)
    except (ValueError, TypeError):
        return 0.0

    if val < 0.0:
        return 0.0
    if 0.0 < val <= 1.0:
        val = val * 100.0
    return min(100.0, max(0.0, round(val, 2)))


def extract_tokens_from_tesseract_data(
    data: dict[str, list], page_number: int = 1
) -> list[dict]:
    """
    Parses pytesseract image_to_data dictionary into clean token records.
    Filters for word-level entries (level == 5) with valid text and confidence.
    """
    tokens = []
    texts = data.get("text", [])
    confs = data.get("conf", [])
    lefts = data.get("left", [])
    tops = data.get("top", [])
    widths = data.get("width", [])
    heights = data.get("height", [])
    levels = data.get("level", [5] * len(texts))

    n = len(texts)
    for i in range(n):
        lvl = int(levels[i]) if i < len(levels) else 5
        text = str(texts[i]).strip() if i < len(texts) else ""
        if lvl == 5 and text:
            try:
                raw_c = float(confs[i]) if i < len(confs) else -1.0
            except (ValueError, TypeError):
                raw_c = -1.0

            if raw_c >= 0:
                x = int(lefts[i]) if i < len(lefts) else 0
                y = int(tops[i]) if i < len(tops) else 0
                w = int(widths[i]) if i < len(widths) else 0
                h = int(heights[i]) if i < len(heights) else 0
                tokens.append({
                    "token_text": text,
                    "confidence": normalize_confidence(raw_c),
                    "bbox": [x, y, w, h],
                    "page_number": int(page_number),
                })
    return tokens


# ==============================================================================
# Low-Confidence Token Tracking & Statistics Aggregator
# ==============================================================================

class ConfidenceTracker:
    """
    Aggregates OCR confidence scores across document text and table cells,
    computes average/median/min statistics, and identifies low-confidence tokens (< 60.0).
    """

    def __init__(self, low_confidence_threshold: float = LOW_CONFIDENCE_THRESHOLD):
        self.threshold = low_confidence_threshold
        self._tokens: list[dict] = []
        self._lock = threading.Lock()

    def add_token(
        self,
        token_text: str,
        confidence: Union[float, int, str],
        bbox: Union[tuple[int, int, int, int], list[int]] = (0, 0, 0, 0),
        page_number: int = 1,
    ) -> None:
        """Records an individual word or cell token."""
        text = str(token_text).strip()
        if not text:
            return
        conf = normalize_confidence(confidence)
        with self._lock:
            self._tokens.append({
                "token_text": text,
                "confidence": conf,
                "bbox": list(bbox),
                "page_number": int(page_number),
            })

    def add_tokens(self, tokens: list[dict]) -> None:
        """Batch adds token dictionaries."""
        for t in tokens:
            self.add_token(
                token_text=t.get("token_text", t.get("text", "")),
                confidence=t.get("confidence", t.get("conf", 0.0)),
                bbox=t.get("bbox", (0, 0, 0, 0)),
                page_number=t.get("page_number", 1),
            )

    def add_tesseract_data(self, data: dict[str, list], page_number: int = 1) -> None:
        """Extracts and adds tokens from a pytesseract image_to_data result."""
        extracted = extract_tokens_from_tesseract_data(data, page_number)
        with self._lock:
            self._tokens.extend(extracted)

    def add_table_cells(self, cells: list[Any], page_number: int = 1) -> None:
        """Extracts and adds tokens from TableCell objects."""
        for cell in cells:
            text = getattr(cell, "text", "")
            if not text or not str(text).strip():
                continue
            conf = getattr(cell, "confidence", 100.0)
            bbox = getattr(cell, "bbox", (0, 0, 0, 0))
            words = str(text).strip().split()
            if len(words) <= 1:
                self.add_token(text, conf, bbox, page_number)
            else:
                for w in words:
                    self.add_token(w, conf, bbox, page_number)

    def get_low_confidence_tokens(self) -> list[dict]:
        """Returns tokens with confidence below the threshold (< 60.0%)."""
        with self._lock:
            return [t for t in self._tokens if t["confidence"] < self.threshold]

    def compute_stats(self) -> dict[str, Any]:
        """Computes summary statistics across all accumulated tokens."""
        with self._lock:
            tokens_copy = list(self._tokens)

        if not tokens_copy:
            return {
                "average_confidence": 0.0,
                "median_confidence": 0.0,
                "min_confidence": 0.0,
                "max_confidence": 0.0,
                "total_tokens": 0,
                "low_confidence_count": 0,
                "low_confidence_tokens": [],
            }

        scores = [t["confidence"] for t in tokens_copy]
        low_tokens = [t for t in tokens_copy if t["confidence"] < self.threshold]

        return {
            "average_confidence": round(sum(scores) / len(scores), 2),
            "median_confidence": round(float(statistics.median(scores)), 2),
            "min_confidence": round(min(scores), 2),
            "max_confidence": round(max(scores), 2),
            "total_tokens": len(tokens_copy),
            "low_confidence_count": len(low_tokens),
            "low_confidence_tokens": low_tokens,
        }

    def compute_page_stats(self, page_number: int) -> dict[str, Any]:
        """Computes confidence statistics filtered to a single page."""
        with self._lock:
            page_tokens = [t for t in self._tokens if t["page_number"] == page_number]

        if not page_tokens:
            return {
                "average_confidence": 0.0,
                "median_confidence": 0.0,
                "min_confidence": 0.0,
                "max_confidence": 0.0,
                "total_tokens": 0,
                "low_confidence_count": 0,
                "low_confidence_tokens": [],
            }

        scores = [t["confidence"] for t in page_tokens]
        low_tokens = [t for t in page_tokens if t["confidence"] < self.threshold]

        return {
            "average_confidence": round(sum(scores) / len(scores), 2),
            "median_confidence": round(float(statistics.median(scores)), 2),
            "min_confidence": round(min(scores), 2),
            "max_confidence": round(max(scores), 2),
            "total_tokens": len(page_tokens),
            "low_confidence_count": len(low_tokens),
            "low_confidence_tokens": low_tokens,
        }


# ==============================================================================
# Resource Monitoring & Peak Memory Tracking (Requirement R7)
# ==============================================================================

class PeakMemoryContext(float):
    """
    Polymorphic context manager and float subclass for tracking peak memory.
    - Used as context manager: `with monitor.track_peak_memory() as tracker:`
      spawns a background sampling thread during execution.
    - Evaluated directly as a float: returns initial or recorded peak RSS in MB,
      satisfying Interface Contract 6 (`track_peak_memory() -> float`).
    """

    def __new__(cls, monitor: ResourceMonitor, interval_s: float = 0.02):
        initial_mb = monitor.get_current_rss_mb()
        instance = super().__new__(cls, initial_mb)
        instance.monitor = monitor
        instance.interval_s = interval_s
        instance.start_mb = initial_mb
        instance.peak_mb = initial_mb
        instance._stop_event = threading.Event()
        instance._thread: Optional[threading.Thread] = None
        return instance

    def _sampler_loop(self) -> None:
        while not self._stop_event.is_set():
            current = self.monitor.get_current_rss_mb()
            if current > self.peak_mb:
                self.peak_mb = current
            self._stop_event.wait(self.interval_s)

    def __enter__(self) -> PeakMemoryContext:
        self.start_mb = self.monitor.get_current_rss_mb()
        self.peak_mb = max(self.peak_mb, self.start_mb)
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._sampler_loop, daemon=True, name="CompixorMemSampler"
        )
        self._thread.start()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> bool:
        self._stop_event.set()
        if self._thread is not None and self._thread.is_alive():
            self._thread.join(timeout=0.5)

        final_mb = self.monitor.get_current_rss_mb()
        if final_mb > self.peak_mb:
            self.peak_mb = final_mb

        self.monitor.record_peak(self.peak_mb)
        self.monitor.check_budget(self.peak_mb)
        return False

    def __repr__(self) -> str:
        return f"PeakMemoryContext(peak_mb={self.peak_mb:.2f})"


class ResourceMonitor:
    """
    Monitors host and process memory usage via psutil, enforces the 8 GB VPS
    budget constraint, and coordinates sequential garbage collection.
    """

    def __init__(
        self,
        warning_threshold_mb: float = MEMORY_WARNING_THRESHOLD_MB,
        critical_threshold_mb: float = MEMORY_CRITICAL_THRESHOLD_MB,
        vps_total_ram_mb: float = VPS_TOTAL_RAM_MB,
    ):
        self.warning_threshold_mb = warning_threshold_mb
        self.critical_threshold_mb = critical_threshold_mb
        self.vps_total_ram_mb = vps_total_ram_mb
        self.peak_memory_mb: float = self.get_current_rss_mb()
        self._lock = threading.Lock()

    def get_current_rss_mb(self) -> float:
        """
        Retrieves the current process Resident Set Size (RSS) in megabytes (MB).
        Uses psutil with graceful multi-platform fallbacks.
        """
        try:
            import psutil
            proc = psutil.Process(os.getpid())
            rss_bytes = proc.memory_info().rss
            return round(rss_bytes / (1024.0 * 1024.0), 2)
        except Exception:
            return self._fallback_rss_mb()

    def _fallback_rss_mb(self) -> float:
        """Fallback memory query via resource module or Linux /proc/self/status."""
        # 1. resource module (Unix / Linux)
        try:
            import resource
            ru = resource.getrusage(resource.RUSAGE_SELF)
            if sys.platform == "darwin":
                return round(ru.ru_maxrss / (1024.0 * 1024.0), 2)
            else:
                return round(ru.ru_maxrss / 1024.0, 2)
        except Exception:
            pass

        # 2. Linux /proc/self/status
        try:
            if os.path.exists("/proc/self/status"):
                with open("/proc/self/status", "r") as f:
                    for line in f:
                        if line.startswith("VmRSS:"):
                            parts = line.split()
                            kb = float(parts[1])
                            return round(kb / 1024.0, 2)
        except Exception:
            pass

        # 3. Static safe baseline
        return 50.0

    def record_peak(self, mb: float) -> float:
        """Updates the recorded peak memory if mb exceeds previous maximum."""
        with self._lock:
            if mb > self.peak_memory_mb:
                self.peak_memory_mb = round(mb, 2)
            return self.peak_memory_mb

    def track_peak_memory(self, interval_s: float = 0.02) -> PeakMemoryContext:
        """
        Returns a PeakMemoryContext context manager and float subclass.
        Captures memory spikes via background sampling during block execution,
        while also evaluating directly to float.
        """
        return PeakMemoryContext(self, interval_s=interval_s)

    def force_garbage_collection(self) -> int:
        """
        Explicitly triggers full Python garbage collection across all 3 generations
        to free cyclic references from OpenCV, PIL, and pytesseract buffers.
        Returns the number of unreachable objects freed.
        """
        freed = gc.collect()
        current_mb = self.get_current_rss_mb()
        self.record_peak(current_mb)
        logger.debug(f"Sequential GC executed: freed {freed} objects; RSS={current_mb:.2f}MB")
        return freed

    def check_budget(self, current_or_peak_mb: Optional[float] = None) -> None:
        """
        Evaluates memory usage against 8 GB RAM VPS budget thresholds.
        Logs warnings if memory approaches capacity.
        """
        val = current_or_peak_mb if current_or_peak_mb is not None else self.get_current_rss_mb()

        if val >= self.critical_threshold_mb:
            logger.critical(
                f"CRITICAL MEMORY: Process RSS is {val:.1f} MB, exceeding critical threshold "
                f"{self.critical_threshold_mb:.1f} MB (8 GB VPS limit: {self.vps_total_ram_mb:.1f} MB). "
                f"Emergency GC triggered."
            )
            self.force_garbage_collection()
        elif val >= self.warning_threshold_mb:
            logger.warning(
                f"HIGH MEMORY WARNING: Process RSS is {val:.1f} MB, exceeding warning threshold "
                f"{self.warning_threshold_mb:.1f} MB (8 GB VPS limit: {self.vps_total_ram_mb:.1f} MB)."
            )
        elif val >= PER_DOC_BUDGET_MB:
            logger.info(
                f"Document processing memory ({val:.1f} MB) reached single-document budget "
                f"({PER_DOC_BUDGET_MB:.1f} MB)."
            )

    def is_memory_safe(self) -> bool:
        """Returns True if current process memory is safely below the warning threshold."""
        return self.get_current_rss_mb() < self.warning_threshold_mb


# ==============================================================================
# Sequential Page Cleanup Helper
# ==============================================================================

def force_garbage_collection() -> int:
    """Module-level function executing explicit full garbage collection."""
    freed = gc.collect()
    logger.debug(f"Global GC executed: freed {freed} objects.")
    return freed


def release_page_intermediates(*objects: Any) -> int:
    """
    Explicitly dereferences large page image buffers, numpy arrays, and
    intermediate structures, then triggers garbage collection.
    Prevents memory accumulation across multi-page document conversions.
    """
    for obj in objects:
        if obj is None:
            continue
        # Close PIL images
        if hasattr(obj, "rgb_image"):
            rgb = getattr(obj, "rgb_image")
            if hasattr(rgb, "close") and callable(rgb.close):
                try:
                    rgb.close()
                except Exception:
                    pass
        # Clear large numpy layers on PreprocessedPage
        if hasattr(obj, "clahe_gray"):
            setattr(obj, "clahe_gray", None)
        if hasattr(obj, "binary_image"):
            setattr(obj, "binary_image", None)
        # Generic closable
        if hasattr(obj, "close") and callable(obj.close):
            try:
                obj.close()
            except Exception:
                pass

    return gc.collect()


# ==============================================================================
# HTTP Response Headers Helper
# ==============================================================================

def get_response_headers(diag: ConversionDiagnostics) -> dict[str, str]:
    """
    Constructs HTTP response headers for FastAPI StreamingResponse.
    Provides:
      - X-Processing-Time-Ms
      - X-Peak-Memory-MB
      - X-Tables-Detected
      - X-Visuals-Extracted
      - X-Low-Confidence-Count
    """
    return {
        "X-Processing-Time-Ms": f"{diag.processing_time_ms:.2f}",
        "X-Peak-Memory-MB": f"{diag.peak_memory_mb:.2f}",
        "X-Tables-Detected": str(diag.tables_detected),
        "X-Visuals-Extracted": str(diag.visual_elements_extracted),
        "X-Low-Confidence-Count": str(len(diag.low_confidence_tokens)),
    }


__all__ = [
    "ConversionDiagnostics",
    "ConfidenceTracker",
    "PeakMemoryContext",
    "ResourceMonitor",
    "normalize_confidence",
    "extract_tokens_from_tesseract_data",
    "force_garbage_collection",
    "release_page_intermediates",
    "get_response_headers",
    "VPS_TOTAL_RAM_MB",
    "PER_DOC_BUDGET_MB",
    "MEMORY_WARNING_THRESHOLD_MB",
    "MEMORY_CRITICAL_THRESHOLD_MB",
    "LOW_CONFIDENCE_THRESHOLD",
]
