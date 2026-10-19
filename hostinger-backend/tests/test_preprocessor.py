"""
Unit tests for Document Preprocessing Pipeline (R2).
Covers:
1. 10MB upload limit validation, empty inputs, unsupported formats, and corruption.
2. PDF and image loading normalized to 300 DPI.
3. Deskewing functionality (Hough lines & minAreaRect).
4. Dual synchronized layers (RGB, CLAHE grayscale, Otsu binary).
5. Real-world sample validation (Capture.PNG if present).
"""

import io
import os
from pathlib import Path
import pytest
import numpy as np
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage


@pytest.fixture
def preprocessor() -> DocumentPreprocessor:
    return DocumentPreprocessor(max_upload_mb=10, target_dpi=300)


@pytest.fixture
def synthetic_text_image() -> bytes:
    """Generates a clean synthetic document image with dark horizontal text lines on white."""
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw several horizontal bands mimicking lines of text
    for y in range(80, 520, 40):
        draw.rectangle([60, y, 740, y + 14], fill=(20, 20, 20))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def synthetic_tilted_image() -> bytes:
    """Generates a synthetic document image tilted by 5 degrees."""
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    for y in range(80, 520, 40):
        draw.rectangle([60, y, 740, y + 14], fill=(20, 20, 20))
    tilted = img.rotate(5.0, expand=False, fillcolor=(255, 255, 255))
    buf = io.BytesIO()
    tilted.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def synthetic_multipage_pdf() -> bytes:
    """Generates a 3-page synthetic PDF document."""
    buf = io.BytesIO()
    pages = []
    for i in range(3):
        p = Image.new("RGB", (300, 400), color=(255, 255, 255))
        draw = ImageDraw.Draw(p)
        draw.rectangle([30, 50, 270, 70], fill=(0, 0, 0))
        draw.rectangle([30, 100 + i * 20, 270, 120 + i * 20], fill=(50, 50, 50))
        pages.append(p)
    pages[0].save(buf, format="PDF", save_all=True, append_images=pages[1:])
    return buf.getvalue()


class TestUploadValidation:
    """Tests file size enforcement and format validation."""

    def test_file_size_within_10mb_cap(self, preprocessor, synthetic_text_image):
        ext = preprocessor.validate_file(synthetic_text_image, "document.png")
        assert ext == ".png"

    def test_file_size_exceeding_10mb_cap_raises_error(self, preprocessor):
        # 10MB + 1 byte
        oversized = b"X" * (10 * 1024 * 1024 + 1)
        with pytest.raises(ValueError, match="exceeds the 10MB limit"):
            preprocessor.validate_file(oversized, "large.png")

    def test_empty_file_raises_error(self, preprocessor):
        with pytest.raises(ValueError, match="empty"):
            preprocessor.validate_file(b"", "empty.png")

    def test_unsupported_file_extension_raises_error(self, preprocessor):
        invalid_bytes = b"MZ\x90\x00\x03\x00\x00\x00"
        with pytest.raises(ValueError, match="Unsupported file format"):
            preprocessor.validate_file(invalid_bytes, "malware.exe")

    def test_magic_byte_sniffing_for_missing_extension(self, preprocessor, synthetic_text_image):
        # Filename without extension should infer .png from PNG header
        ext = preprocessor.validate_file(synthetic_text_image, "raw_upload_blob")
        assert ext == ".png"

    def test_corrupted_image_bytes_raises_error(self, preprocessor):
        corrupted = b"\x89PNG\r\n\x1a\nCORRUPTED_PAYLOAD_DATA"
        with pytest.raises(ValueError, match="Failed to decode image"):
            preprocessor.process_input(corrupted, "corrupted.png")


class TestImageAndPdfIngestion:
    """Tests loading, upscaling to ~300 DPI, and multi-page PDF parsing."""

    def test_raster_image_loading_and_300dpi_upscaling(self, preprocessor, synthetic_text_image):
        pages = preprocessor.process_input(synthetic_text_image, "test.png")
        assert len(pages) == 1
        page = pages[0]

        assert isinstance(page, PreprocessedPage)
        assert page.page_number == 1
        assert page.dpi == 300
        assert page.rgb_image.mode == "RGB"
        # Original was 800x600 at default ~96 DPI, should be upscaled to ~300 DPI
        assert page.width > 800
        assert page.height > 600
        assert page.rgb_image.size == (page.width, page.height)

    def test_already_300dpi_image_retained(self, preprocessor):
        # Image already at 300 DPI (2400x3000)
        img = Image.new("RGB", (2400, 3000), color=(255, 255, 255))
        buf = io.BytesIO()
        img.save(buf, format="PNG", dpi=(300, 300))
        pages = preprocessor.process_input(buf.getvalue(), "high_res.png")
        assert len(pages) == 1
        assert pages[0].width == 2400
        assert pages[0].height == 3000

    def test_jpeg_and_webp_ingestion(self, preprocessor):
        img = Image.new("RGB", (400, 300), color=(250, 250, 250))
        # JPEG
        buf_jpg = io.BytesIO()
        img.save(buf_jpg, format="JPEG")
        pages_jpg = preprocessor.process_input(buf_jpg.getvalue(), "photo.jpg")
        assert len(pages_jpg) == 1
        assert pages_jpg[0].dpi == 300

        # WebP
        buf_webp = io.BytesIO()
        img.save(buf_webp, format="WEBP")
        pages_webp = preprocessor.process_input(buf_webp.getvalue(), "graphic.webp")
        assert len(pages_webp) == 1
        assert pages_webp[0].dpi == 300

    def test_transparent_png_composited_on_white(self, preprocessor):
        # Create RGBA with semi-transparent background
        rgba = Image.new("RGBA", (200, 200), (0, 0, 0, 0))
        draw = ImageDraw.Draw(rgba)
        draw.rectangle([50, 50, 150, 150], fill=(255, 0, 0, 255))
        buf = io.BytesIO()
        rgba.save(buf, format="PNG")

        pages = preprocessor.process_input(buf.getvalue(), "transparent.png")
        assert len(pages) == 1
        rgb = pages[0].rgb_image
        assert rgb.mode == "RGB"
        # Transparent border corner (0, 0) should be pure white (255, 255, 255), not black
        corner_pixel = rgb.getpixel((0, 0))
        assert corner_pixel == (255, 255, 255)

    def test_multipage_pdf_ingestion(self, preprocessor, synthetic_multipage_pdf):
        pages = preprocessor.process_input(synthetic_multipage_pdf, "document.pdf")
        assert len(pages) == 3

        for i, page in enumerate(pages, start=1):
            assert page.page_number == i
            assert page.dpi == 300
            assert page.rgb_image.mode == "RGB"
            assert page.clahe_gray.ndim == 2
            assert page.binary_image.ndim == 2
            assert page.width == page.rgb_image.width
            assert page.height == page.rgb_image.height


class TestDeskewing:
    """Tests skew angle calculation and orientation correction."""

    def test_tilted_image_deskewed(self, preprocessor, synthetic_tilted_image):
        pages = preprocessor.process_input(synthetic_tilted_image, "tilted.png")
        assert len(pages) == 1
        page = pages[0]

        # The image was tilted by 5 degrees, detected skew angle should be non-zero
        assert abs(page.skew_angle) > 1.0

        # Verify that residual skew on the deskewed layer is corrected
        residual_skew = preprocessor.detect_skew_angle(page.clahe_gray)
        assert abs(residual_skew) < 1.0

    def test_straight_image_has_zero_skew(self, preprocessor, synthetic_text_image):
        pages = preprocessor.process_input(synthetic_text_image, "straight.png")
        assert len(pages) == 1
        page = pages[0]
        # Straight image should register ~0.0 skew angle
        assert abs(page.skew_angle) < 0.5


class TestSynchronizedLayers:
    """Tests the properties and consistency of RGB, CLAHE, and binary layers."""

    def test_synchronized_layer_dimensions_and_types(self, preprocessor, synthetic_text_image):
        pages = preprocessor.process_input(synthetic_text_image, "doc.png")
        page = pages[0]

        w, h = page.width, page.height

        # 1. RGB layer
        assert isinstance(page.rgb_image, Image.Image)
        assert page.rgb_image.mode == "RGB"
        assert page.rgb_image.size == (w, h)

        # 2. CLAHE grayscale layer
        assert isinstance(page.clahe_gray, np.ndarray)
        assert page.clahe_gray.dtype == np.uint8
        assert page.clahe_gray.shape == (h, w)
        # CLAHE layer should have varied grayscale tones
        assert np.min(page.clahe_gray) < 50
        assert np.max(page.clahe_gray) > 200

        # 3. Binary layer
        assert isinstance(page.binary_image, np.ndarray)
        assert page.binary_image.dtype == np.uint8
        assert page.binary_image.shape == (h, w)
        # Binary layer should contain only binary values (0 and 255)
        unique_vals = set(np.unique(page.binary_image))
        assert unique_vals.issubset({0, 255})

    def test_real_capture_sample_processing_if_available(self, preprocessor):
        capture_path = Path(r"C:\Users\AL GHANI\Desktop\Capture.PNG")
        if not capture_path.exists():
            pytest.skip("Capture.PNG not found on desktop")

        with open(capture_path, "rb") as f:
            data = f.read()

        pages = preprocessor.process_input(data, "Capture.PNG")
        assert len(pages) == 1
        page = pages[0]

        assert page.dpi == 300
        # Dimensions upscaled from 768x775 to ~2400x2422
        assert page.width >= 2000
        assert page.height >= 2000
        assert page.rgb_image.size == (page.width, page.height)
        assert page.clahe_gray.shape == (page.height, page.width)
        assert page.binary_image.shape == (page.height, page.width)
