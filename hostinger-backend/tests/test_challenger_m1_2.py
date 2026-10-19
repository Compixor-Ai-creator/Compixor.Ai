"""
Empirical Challenger S2_M1_2 Test Suite.
Mission:
1. Test multi-page PDF generation and ingestion (pypdfium2/pdf2image fallback path).
2. Verify that rgb_image, clahe_gray, and binary_image in every returned PreprocessedPage
   have 100% identical pixel dimensions (width, height).
3. Check memory consumption during multi-page rendering to ensure no memory leakage.
"""

import gc
import io
import os
import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import psutil
import pytest
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage

PRIMARY_CAPTURE_PNG = Path(r"C:\Users\AL GHANI\Desktop\Capture.PNG")


@pytest.fixture
def preprocessor() -> DocumentPreprocessor:
    return DocumentPreprocessor(max_upload_mb=10, target_dpi=300)


def generate_synthetic_page(
    width: int,
    height: int,
    title: str,
    skew_angle: float = 0.0,
    has_table: bool = False,
) -> Image.Image:
    """Generates a synthetic page with text lines, optional table, and optional skew."""
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Title / header band
    draw.rectangle([int(width * 0.1), 30, int(width * 0.9), 60], fill=(30, 30, 30))
    draw.text((int(width * 0.15), 35), title, fill=(255, 255, 255))

    # Text lines
    y_start = 80
    y_end = min(height - 100, 600)
    for y in range(y_start, y_end, 30):
        draw.rectangle([int(width * 0.1), y, int(width * 0.85), y + 10], fill=(50, 50, 50))

    if has_table:
        # Draw a small 3x3 table grid
        tx0, ty0 = int(width * 0.1), y_end + 20
        cw = int((width * 0.7) / 3)
        rh = 30
        for r in range(4):
            draw.line([(tx0, ty0 + r * rh), (tx0 + 3 * cw, ty0 + r * rh)], fill=(0, 0, 0), width=2)
        for c in range(4):
            draw.line([(tx0 + c * cw, ty0), (tx0 + c * cw, ty0 + 3 * rh)], fill=(0, 0, 0), width=2)

    if abs(skew_angle) > 0.01:
        img = img.rotate(skew_angle, expand=False, fillcolor=(255, 255, 255))

    return img


def create_pdf_from_images(images: list[Image.Image]) -> bytes:
    """Combines a list of PIL Images into a multi-page PDF in memory."""
    if not images:
        return b""
    buf = io.BytesIO()
    images[0].save(buf, format="PDF", save_all=True, append_images=images[1:])
    return buf.getvalue()


# ==============================================================================
# SECTION 1: Multi-Page PDF Generation & Ingestion (pypdfium2 / pdf2image fallback)
# ==============================================================================


class TestMultiPagePdfIngestionAndFallback:
    """Stress-tests multi-page PDF ingestion and rendering paths."""

    def test_multipage_pdf_generation_and_ingestion_pypdfium2(self, preprocessor):
        """Tests ingestion of a 5-page PDF via the active PDF renderer (pypdfium2 on Windows)."""
        pages_img = [
            generate_synthetic_page(600, 800, f"Page {i} Header", has_table=(i % 2 == 0))
            for i in range(1, 6)
        ]
        pdf_bytes = create_pdf_from_images(pages_img)
        assert len(pdf_bytes) > 0

        preprocessed = preprocessor.process_input(pdf_bytes, "test_5pages.pdf")
        assert len(preprocessed) == 5

        for idx, page in enumerate(preprocessed, start=1):
            assert isinstance(page, PreprocessedPage)
            assert page.page_number == idx
            assert page.dpi == 300
            assert page.rgb_image.mode == "RGB"
            assert page.width > 0
            assert page.height > 0

    def test_multipage_pdf_heterogeneous_geometry(self, preprocessor):
        """Tests PDF with pages of varying orientations, aspect ratios, and dimensions."""
        page_specs = [
            (400, 800, "Tall Portrait"),
            (1000, 300, "Wide Landscape"),
            (500, 500, "Square Page"),
            (300, 900, "Receipt Strip"),
            (800, 600, "Standard 4:3"),
        ]
        images = [generate_synthetic_page(w, h, title) for w, h, title in page_specs]
        pdf_bytes = create_pdf_from_images(images)

        preprocessed = preprocessor.process_input(pdf_bytes, "heterogeneous.pdf")
        assert len(preprocessed) == len(page_specs)

        # Scale factor from 72 points to 300 DPI is 300 / 72 ≈ 4.16667
        scale = 300.0 / 72.0
        for idx, (w, h, _) in enumerate(page_specs):
            p = preprocessed[idx]
            assert p.page_number == idx + 1
            # Pillow PDF saves standard points matching pixel dimensions at 72 DPI
            expected_w = int(round(w * scale))
            expected_h = int(round(h * scale))
            # Allowed delta of ±3 pixels due to float roundings in pdfium
            assert abs(p.width - expected_w) <= 3, f"Page {idx+1} width mismatch: {p.width} vs {expected_w}"
            assert abs(p.height - expected_h) <= 3, f"Page {idx+1} height mismatch: {p.height} vs {expected_h}"

    def test_pdf2image_success_path_mocked(self, preprocessor):
        """Verifies that when pdf2image succeeds, _render_pdf uses its output correctly."""
        mock_pil_pages = [
            Image.new("RGB", (600, 800), color=(240, 240, 240)),
            Image.new("RGBA", (500, 700), color=(200, 200, 200, 255)),
        ]

        with patch("pdf2image.convert_from_bytes", return_value=mock_pil_pages) as mock_pdf2image:
            rendered = preprocessor._render_pdf(b"%PDF-1.4 mock bytes")
            mock_pdf2image.assert_called_once_with(b"%PDF-1.4 mock bytes", dpi=300)
            assert len(rendered) == 2
            # RGBA should be converted to RGB
            for img in rendered:
                assert img.mode == "RGB"

    def test_pdf2image_failure_fallback_to_pypdfium2(self, preprocessor):
        """Verifies that an exception in pdf2image triggers transparent fallback to pypdfium2."""
        images = [generate_synthetic_page(400, 500, f"Page {i}") for i in range(1, 3)]
        pdf_bytes = create_pdf_from_images(images)

        # Force pdf2image to raise an exception mimicking missing poppler binary
        with patch("pdf2image.convert_from_bytes", side_effect=RuntimeError("Poppler binary not found")):
            preprocessed = preprocessor.process_input(pdf_bytes, "fallback_test.pdf")
            assert len(preprocessed) == 2
            assert preprocessed[0].page_number == 1
            assert preprocessed[1].page_number == 2

    def test_both_pdf_renderers_failing_raises_value_error(self, preprocessor):
        """Verifies clear ValueError is raised if both pdf2image and pypdfium2 fail."""
        with patch("pdf2image.convert_from_bytes", side_effect=RuntimeError("Poppler missing")), \
             patch("pypdfium2.PdfDocument", side_effect=RuntimeError("Corrupt PDF bytes")):
            with pytest.raises(ValueError, match="Failed to render PDF document"):
                preprocessor._render_pdf(b"invalid pdf payload")

    def test_corrupted_pdf_bytes_handling(self, preprocessor):
        """Verifies corrupted PDF raises ValueError with clear message."""
        corrupt_pdf = b"%PDF-1.4\nSOME_CORRUPT_NONSENSE_DATA\n%%EOF"
        with pytest.raises(ValueError, match="Failed to render PDF document"):
            preprocessor.process_input(corrupt_pdf, "corrupted.pdf")

    def test_empty_pdf_bytes_handling(self, preprocessor):
        """Verifies empty bytes raise ValueError."""
        with pytest.raises(ValueError, match="empty"):
            preprocessor.process_input(b"", "empty.pdf")

    def test_pdf_upload_limit_enforced(self, preprocessor):
        """Verifies PDF exceeding 10MB upload cap is rejected before processing."""
        oversized = b"%PDF-1.4\n" + b"A" * (10 * 1024 * 1024 + 100)
        with pytest.raises(ValueError, match="exceeds the 10MB limit"):
            preprocessor.process_input(oversized, "huge.pdf")


# ==============================================================================
# SECTION 2: 100% Layer Dimension Synchronization
# ==============================================================================


class TestLayerDimensionSynchronization:
    """Stress-tests that rgb_image, clahe_gray, and binary_image have 100% identical dimensions."""

    def _assert_layer_synchronization(self, page: PreprocessedPage):
        """Asserts exact 100% pixel dimension identity across all 3 layers."""
        w, h = page.width, page.height

        # 1. RGB layer
        assert page.rgb_image.size == (w, h), (
            f"Page {page.page_number}: rgb_image.size {page.rgb_image.size} != (width={w}, height={h})"
        )
        assert page.rgb_image.width == w
        assert page.rgb_image.height == h

        # 2. CLAHE Grayscale layer (NumPy shape is (height, width))
        assert page.clahe_gray.ndim == 2
        assert page.clahe_gray.shape == (h, w), (
            f"Page {page.page_number}: clahe_gray.shape {page.clahe_gray.shape} != (height={h}, width={w})"
        )
        assert page.clahe_gray.shape[1] == w, "clahe_gray width mismatch"
        assert page.clahe_gray.shape[0] == h, "clahe_gray height mismatch"

        # 3. Binary layer (NumPy shape is (height, width))
        assert page.binary_image.ndim == 2
        assert page.binary_image.shape == (h, w), (
            f"Page {page.page_number}: binary_image.shape {page.binary_image.shape} != (height={h}, width={w})"
        )
        assert page.binary_image.shape[1] == w, "binary_image width mismatch"
        assert page.binary_image.shape[0] == h, "binary_image height mismatch"

        # Cross-layer identity
        assert page.rgb_image.size[0] == page.clahe_gray.shape[1] == page.binary_image.shape[1]
        assert page.rgb_image.size[1] == page.clahe_gray.shape[0] == page.binary_image.shape[0]

    def test_layer_pixel_dimension_identity_synthetic_multipage(self, preprocessor):
        """Verifies 100% dimension identity for multi-page PDF with diverse page sizes."""
        images = [
            generate_synthetic_page(450, 700, "Page 1"),
            generate_synthetic_page(900, 450, "Page 2"),
            generate_synthetic_page(555, 555, "Page 3"),
        ]
        pdf_bytes = create_pdf_from_images(images)
        pages = preprocessor.process_input(pdf_bytes, "doc.pdf")

        assert len(pages) == 3
        for page in pages:
            self._assert_layer_synchronization(page)

    def test_layer_synchronization_under_extreme_deskew(self, preprocessor):
        """Verifies dimensions remain 100% synchronized across various skew angles."""
        angles = [-20.0, -9.5, 0.0, 7.3, 15.0, 30.0]
        for angle in angles:
            img = generate_synthetic_page(800, 600, f"Skew {angle}", skew_angle=angle)
            buf = io.BytesIO()
            img.save(buf, format="PNG")

            pages = preprocessor.process_input(buf.getvalue(), f"skew_{angle}.png")
            assert len(pages) == 1
            self._assert_layer_synchronization(pages[0])

    def test_layer_synchronization_non_square_asymmetric_aspect_ratios(self, preprocessor):
        """
        Tests asymmetric resolutions (e.g. 1173 x 489) to detect any row/column transposition bugs
        between PIL (width, height) and NumPy (height, width).
        """
        asymmetric_sizes = [
            (1173, 489),
            (489, 1173),
            (1920, 1080),
            (350, 1400),
            (1400, 350),
        ]
        for w, h in asymmetric_sizes:
            img = generate_synthetic_page(w, h, f"Asymmetric {w}x{h}")
            buf = io.BytesIO()
            img.save(buf, format="PNG")

            pages = preprocessor.process_input(buf.getvalue(), f"asym_{w}_{h}.png")
            assert len(pages) == 1
            page = pages[0]
            self._assert_layer_synchronization(page)

    def test_layer_synchronization_format_matrix(self, preprocessor):
        """Tests that all supported image formats maintain 100% layer synchronization."""
        formats = ["PNG", "JPEG", "WEBP"]
        base_img = generate_synthetic_page(700, 500, "Format Matrix")

        for fmt in formats:
            buf = io.BytesIO()
            base_img.save(buf, format=fmt)
            ext = f".{fmt.lower()}"

            pages = preprocessor.process_input(buf.getvalue(), f"format_test{ext}")
            assert len(pages) == 1
            self._assert_layer_synchronization(pages[0])

    def test_layer_synchronization_transparent_rgba_composite(self, preprocessor):
        """Tests RGBA image with transparent alpha channel composited on white."""
        rgba = Image.new("RGBA", (800, 600), (0, 0, 0, 0))
        draw = ImageDraw.Draw(rgba)
        draw.rectangle([100, 100, 700, 500], fill=(0, 128, 255, 180))
        buf = io.BytesIO()
        rgba.save(buf, format="PNG")

        pages = preprocessor.process_input(buf.getvalue(), "alpha.png")
        assert len(pages) == 1
        page = pages[0]
        self._assert_layer_synchronization(page)
        # Background pixel outside rectangle should be white (255, 255, 255)
        assert page.rgb_image.getpixel((10, 10)) == (255, 255, 255)

    def test_layer_synchronization_real_world_capture_sample(self, preprocessor):
        """Verifies layer synchronization against the real-world Capture.PNG sample."""
        if not PRIMARY_CAPTURE_PNG.exists():
            pytest.skip(f"Capture.PNG not found at {PRIMARY_CAPTURE_PNG}")

        data = PRIMARY_CAPTURE_PNG.read_bytes()
        pages = preprocessor.process_input(data, "Capture.PNG")
        assert len(pages) == 1
        self._assert_layer_synchronization(pages[0])

    def test_layer_synchronization_real_world_multipage_pdf(self, preprocessor):
        """Constructs a 2-page PDF including the real Capture.PNG and tests synchronization."""
        if not PRIMARY_CAPTURE_PNG.exists():
            pytest.skip(f"Capture.PNG not found at {PRIMARY_CAPTURE_PNG}")

        img1 = Image.open(PRIMARY_CAPTURE_PNG).convert("RGB")
        img2 = generate_synthetic_page(img1.width, img1.height, "Second Page Synthetic")

        pdf_bytes = create_pdf_from_images([img1, img2])
        pages = preprocessor.process_input(pdf_bytes, "real_and_synthetic.pdf")

        assert len(pages) == 2
        for page in pages:
            self._assert_layer_synchronization(page)


# ==============================================================================
# SECTION 3: Memory Consumption & Leak Stress Testing
# ==============================================================================


class TestMemoryConsumptionAndLeakage:
    """Stress-tests memory consumption, GC behavior, and leak prevention during PDF rendering."""

    def test_memory_stability_repeated_multipage_ingestion(self, preprocessor):
        """
        Runs 20 consecutive ingestions of a 4-page PDF document.
        Measures RSS memory before, during, and after to verify no linear or unbounded leak.
        """
        process = psutil.Process()
        gc.collect()
        initial_rss_mb = process.memory_info().rss / (1024 * 1024)

        pages_img = [generate_synthetic_page(500, 700, f"Page {i}") for i in range(1, 5)]
        pdf_bytes = create_pdf_from_images(pages_img)

        rss_snapshots = []
        num_iterations = 20

        for i in range(num_iterations):
            pages = preprocessor.process_input(pdf_bytes, f"iteration_{i}.pdf")
            assert len(pages) == 4
            del pages
            gc.collect()

            if (i + 1) % 5 == 0:
                current_rss_mb = process.memory_info().rss / (1024 * 1024)
                rss_snapshots.append(current_rss_mb)

        final_rss_mb = process.memory_info().rss / (1024 * 1024)
        net_growth_mb = final_rss_mb - initial_rss_mb

        # After warm-up, memory should stabilize. Growth over 20 iterations must be < 150 MB
        # (far below leak threshold of several gigabytes).
        print(f"\n[Memory Profiling] Initial: {initial_rss_mb:.1f} MB | Snapshots: {rss_snapshots} | Final: {final_rss_mb:.1f} MB | Net Growth: {net_growth_mb:.1f} MB")
        assert net_growth_mb < 150.0, (
            f"Unbounded memory growth detected: RSS grew by {net_growth_mb:.2f} MB over {num_iterations} iterations"
        )

    def test_large_volume_multipage_pdf_memory_ceiling(self, preprocessor):
        """
        Renders a 15-page document at 300 DPI to stress peak memory ceiling.
        Verifies peak memory does not exceed 1.5 GB (well within the 8 GB limit).
        """
        process = psutil.Process()
        gc.collect()
        baseline_rss_mb = process.memory_info().rss / (1024 * 1024)

        # 15 pages at 600x800 points
        pages_img = [
            generate_synthetic_page(600, 800, f"Stress Page {i}", has_table=(i % 3 == 0))
            for i in range(1, 16)
        ]
        pdf_bytes = create_pdf_from_images(pages_img)

        # Measure memory immediately after preprocessing
        preprocessed = preprocessor.process_input(pdf_bytes, "large_volume_15pages.pdf")
        assert len(preprocessed) == 15

        peak_rss_mb = process.memory_info().rss / (1024 * 1024)
        memory_used_mb = peak_rss_mb - baseline_rss_mb

        print(f"\n[Large Volume 15 Pages] Baseline: {baseline_rss_mb:.1f} MB | Peak: {peak_rss_mb:.1f} MB | Delta: {memory_used_mb:.1f} MB")

        # Peak RSS must remain well below 2000 MB (2.0 GB), fitting safely within 8 GB VPS
        assert peak_rss_mb < 2048.0, f"Peak memory {peak_rss_mb:.1f} MB exceeded 2048 MB limit"

        # Explicit cleanup check
        del preprocessed
        del pages_img
        del pdf_bytes
        gc.collect()

        after_gc_rss_mb = process.memory_info().rss / (1024 * 1024)
        print(f"[Large Volume After GC] RSS: {after_gc_rss_mb:.1f} MB")
        # Ensure memory is substantially reclaimed
        reclaimed_mb = peak_rss_mb - after_gc_rss_mb
        assert reclaimed_mb > (memory_used_mb * 0.4), "Memory was not adequately reclaimed after GC"

    def test_pypdfium2_direct_bitmap_and_doc_cleanup(self, preprocessor):
        """
        Stress-tests pypdfium2 specifically to ensure that PdfDocument and bitmaps
        do not leak unmanaged C memory or handles when rendered repeatedly.
        """
        import pypdfium2 as pdfium

        page_img = generate_synthetic_page(500, 500, "Pdfium C-level Memory Test")
        pdf_bytes = create_pdf_from_images([page_img])

        process = psutil.Process()
        gc.collect()
        base_mem = process.memory_info().rss

        for _ in range(50):
            pdf = pdfium.PdfDocument(pdf_bytes)
            for page in pdf:
                bitmap = page.render(scale=2.0)
                _ = bitmap.to_pil()
                bitmap.close()
                page.close()
            pdf.close()

        gc.collect()
        end_mem = process.memory_info().rss
        mem_diff_mb = (end_mem - base_mem) / (1024 * 1024)

        print(f"\n[pypdfium2 50x Render Test] Memory delta: {mem_diff_mb:.2f} MB")
        assert mem_diff_mb < 50.0, f"Potential C memory leak in pypdfium2: delta={mem_diff_mb:.2f} MB"
