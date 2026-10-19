"""
Empirical Adversarial Test Harness for Document Preprocessor (Milestone M1).
Adversarial Challenger Suite:
1. Corrupt bytes & 0-byte inputs (PNG, JPG, WebP, PDF, random noise, truncated headers).
2. Upload cap boundary testing (10MB boundary, 10MB + 1 byte, configurable limits).
3. Non-standard aspect ratios (1x1, 2x2, 10000x50 panoramic, 50x10000 vertical ribbon).
4. Extreme skew angles (+30°, -30°, +44°, -44°, 0°).
5. Deskewing verification: sensible output without distortion or dimension inversion.
6. Transparent PNG compositing: anti-aliasing edge analysis, dirty alpha, and black fringe detection.
"""

import io
import math
import os
from pathlib import Path
import pytest
import numpy as np
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage


@pytest.fixture
def preprocessor() -> DocumentPreprocessor:
    return DocumentPreprocessor(max_upload_mb=10, target_dpi=300)


def create_text_document_image(width: int = 1200, height: int = 1600, tilt_angle: float = 0.0) -> bytes:
    """Generates a clean synthetic document image with dark horizontal text lines, optionally tilted."""
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    line_spacing = max(20, int(height * 0.035))
    line_height = max(8, int(line_spacing * 0.35))
    margin_x = int(width * 0.08)

    for y in range(int(height * 0.1), int(height * 0.9), line_spacing):
        draw.rectangle([margin_x, y, width - margin_x, y + line_height], fill=(20, 20, 20))

    if abs(tilt_angle) >= 0.1:
        # In PIL, rotate(angle) rotates counter-clockwise.
        img = img.rotate(tilt_angle, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=(255, 255, 255))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


# ==============================================================================
# SECTION 1: Corrupt Bytes & 0-Byte Inputs
# ==============================================================================
class TestCorruptAndZeroByteInputs:
    """Adversarial testing on corrupt, truncated, malformed, and empty inputs."""

    def test_zero_byte_input_rejected_for_all_extensions(self, preprocessor):
        for ext in [".png", ".jpg", ".jpeg", ".webp", ".pdf", "", ".unknown"]:
            with pytest.raises(ValueError, match="File content is empty"):
                preprocessor.validate_file(b"", f"empty{ext}")

            with pytest.raises(ValueError, match="File content is empty"):
                preprocessor.process_input(b"", f"empty{ext}")

    @pytest.mark.parametrize("filename, corrupt_bytes", [
        ("truncated_png_header.png", b"\x89PNG\r\n\x1a\n"),
        ("invalid_chunk_crc.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x00\x00\x00\x01\x00\x08\x06\x00\x00\x00\xff\xff\xff\xff"),
        ("truncated_jpeg.jpg", b"\xff\xd8"),
        ("corrupted_jpeg_body.jpg", b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00CORRUPTED_GARBAGE_PAYLOAD"),
        ("truncated_webp.webp", b"RIFF\x20\x00\x00\x00WEBPVP8 "),
        ("corrupted_pdf_trailer.pdf", b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF_CORRUPT"),
        ("random_noise.png", b"\x89PNG\r\n\x1a\n" + os.urandom(512)),
        ("html_as_png.png", b"<!DOCTYPE html><html><body>Not an image</body></html>"),
        ("executable_as_jpg.jpg", b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"),
    ])
    def test_corrupt_payloads_raise_value_error(self, preprocessor, filename, corrupt_bytes):
        with pytest.raises(ValueError) as excinfo:
            preprocessor.process_input(corrupt_bytes, filename)
        # Verify clean error handling without unhandled crash
        assert any(term in str(excinfo.value).lower() for term in ["failed to decode", "failed to render", "unsupported"])


# ==============================================================================
# SECTION 2: Upload Cap Boundary Testing (>10MB)
# ==============================================================================
class TestUploadSizeLimits:
    """Boundary testing of the 10MB limit."""

    def test_exact_10mb_boundary_is_accepted(self, preprocessor):
        exact_10mb = 10 * 1024 * 1024
        # Create valid PNG payload padded to exact boundary
        img = Image.new("RGB", (10, 10), (255, 255, 255))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        base_bytes = buf.getvalue()

        # Pad with PNG trailing ancillary chunk or raw padding
        padded = base_bytes + b"\x00" * (exact_10mb - len(base_bytes))
        assert len(padded) == exact_10mb

        ext = preprocessor.validate_file(padded, "ten_mb.png")
        assert ext == ".png"

    def test_10mb_plus_one_byte_is_rejected(self, preprocessor):
        over_10mb = (10 * 1024 * 1024) + 1
        payload = b"\x89PNG\r\n\x1a\n" + b"A" * (over_10mb - 8)
        assert len(payload) == over_10mb

        with pytest.raises(ValueError, match="exceeds the 10MB limit"):
            preprocessor.validate_file(payload, "overflow.png")

        with pytest.raises(ValueError, match="exceeds the 10MB limit"):
            preprocessor.process_input(payload, "overflow.png")

    def test_extreme_file_size_rejected(self, preprocessor):
        huge_size = 25 * 1024 * 1024  # 25MB
        payload = b"\x89PNG\r\n\x1a\n" + b"X" * (huge_size - 8)
        with pytest.raises(ValueError, match="exceeds the 10MB limit"):
            preprocessor.validate_file(payload, "huge.png")


# ==============================================================================
# SECTION 3: Non-Standard Aspect Ratios & Extreme Geometries
# ==============================================================================
class TestExtremeAspectRatios:
    """Stress-test aspect ratios: panoramic, extreme vertical ribbons, 1x1, 2x2."""

    def test_minimal_1x1_image(self, preprocessor):
        img = Image.new("RGB", (1, 1), (200, 200, 200))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        pages = preprocessor.process_input(buf.getvalue(), "tiny_1x1.png")
        assert len(pages) == 1
        page = pages[0]
        assert page.width >= 1
        assert page.height >= 1
        assert page.clahe_gray.shape == (page.height, page.width)
        assert page.binary_image.shape == (page.height, page.width)

    def test_minimal_2x2_image(self, preprocessor):
        img = Image.new("RGB", (2, 2), (255, 0, 0))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        pages = preprocessor.process_input(buf.getvalue(), "tiny_2x2.png")
        assert len(pages) == 1
        page = pages[0]
        assert page.width >= 2
        assert page.height >= 2
        assert page.clahe_gray.shape == (page.height, page.width)
        assert page.binary_image.shape == (page.height, page.width)

    def test_panoramic_horizontal_ribbon_aspect_ratio_100_to_1(self, preprocessor):
        # 5000 x 50 (100:1 aspect ratio)
        img = Image.new("RGB", (5000, 50), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.line([(0, 25), (5000, 25)], fill=(0, 0, 0), width=4)
        buf = io.BytesIO()
        img.save(buf, format="PNG")

        pages = preprocessor.process_input(buf.getvalue(), "panoramic.png")
        assert len(pages) == 1
        page = pages[0]
        # Aspect ratio must remain horizontal ribbon
        assert page.width > page.height
        assert page.width / page.height > 50.0
        assert page.clahe_gray.shape == (page.height, page.width)
        assert page.binary_image.shape == (page.height, page.width)

    def test_vertical_ribbon_aspect_ratio_1_to_100(self, preprocessor):
        # 50 x 5000 (1:100 aspect ratio)
        img = Image.new("RGB", (50, 5000), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.line([(25, 0), (25, 5000)], fill=(0, 0, 0), width=4)
        buf = io.BytesIO()
        img.save(buf, format="PNG")

        pages = preprocessor.process_input(buf.getvalue(), "vertical.png")
        assert len(pages) == 1
        page = pages[0]
        # Aspect ratio must remain vertical ribbon
        assert page.height > page.width
        assert page.height / page.width > 50.0
        assert page.clahe_gray.shape == (page.height, page.width)
        assert page.binary_image.shape == (page.height, page.width)


# ==============================================================================
# SECTION 4: Extreme Skew Angles (+30°, -30°, and Boundary Angles)
# ==============================================================================
class TestExtremeSkewAngles:
    """Stress-test deskewing with extreme skew angles (+30°, -30°, +44°, -44°)."""

    @pytest.mark.parametrize("tilt_angle", [30.0, -30.0, 15.0, -15.0, 44.0, -44.0])
    def test_extreme_skew_detection_and_deskewing(self, preprocessor, tilt_angle):
        raw_bytes = create_text_document_image(width=1200, height=1600, tilt_angle=tilt_angle)
        pages = preprocessor.process_input(raw_bytes, f"skew_{tilt_angle}.png")
        assert len(pages) == 1
        page = pages[0]

        # In PIL, rotating by +theta rotates counter-clockwise.
        # detect_skew_angle calculates angle from Hough lines (dy/dx).
        # Counter-clockwise rotation tilts lines so dy/dx < 0, skew_angle should be ~ -tilt_angle.
        # Deskew rotates by skew_angle (in PIL, -tilt_angle rotates clockwise), restoring upright horizontal text.
        expected_detected = -tilt_angle
        assert abs(page.skew_angle - expected_detected) < 2.0, (
            f"Expected detected skew near {expected_detected}°, got {page.skew_angle}°"
        )

        # Residual skew on the resulting clahe_gray layer must be near 0° (< 1.5°)
        residual_skew = preprocessor.detect_skew_angle(page.clahe_gray)
        assert abs(residual_skew) < 1.5, f"Residual skew {residual_skew}° exceeds 1.5° threshold"

    def test_straight_document_zero_skew(self, preprocessor):
        raw_bytes = create_text_document_image(width=1200, height=1600, tilt_angle=0.0)
        pages = preprocessor.process_input(raw_bytes, "straight.png")
        page = pages[0]
        assert abs(page.skew_angle) < 0.5


# ==============================================================================
# SECTION 5: Deskewing Sensible Output, Distortion & Dimension Inversion
# ==============================================================================
class TestDeskewingFidelity:
    """Verify deskewing produces sensible output without distortion or dimension inversion."""

    def test_no_dimension_inversion_after_deskew(self, preprocessor):
        # A portrait document (1200x1600) tilted by +30°
        raw_bytes = create_text_document_image(width=1200, height=1600, tilt_angle=30.0)
        pages = preprocessor.process_input(raw_bytes, "portrait_30.png")
        page = pages[0]

        # The document was portrait (height > width).
        # Check that dimensions are NOT inverted (width should still be < height).
        assert page.height > page.width, f"Dimension inversion detected! width={page.width}, height={page.height}"
        assert page.rgb_image.size == (page.width, page.height)
        assert page.clahe_gray.shape == (page.height, page.width)
        assert page.binary_image.shape == (page.height, page.width)

    def test_no_aspect_ratio_collapse(self, preprocessor):
        # A landscape document (1600x1200) tilted by -30°
        raw_bytes = create_text_document_image(width=1600, height=1200, tilt_angle=-30.0)
        pages = preprocessor.process_input(raw_bytes, "landscape_neg30.png")
        page = pages[0]

        # Must remain landscape
        assert page.width > page.height, f"Dimension inversion detected in landscape! width={page.width}, height={page.height}"
        ratio = page.width / page.height
        assert 1.2 <= ratio <= 1.5, f"Aspect ratio distorted: {ratio}"


# ==============================================================================
# SECTION 6: Transparent PNG Compositing & Black Edge Artifact Verification
# ==============================================================================
class TestTransparentCompositing:
    """Verify transparent PNGs composite onto white without black edge artifacts."""

    def test_antialiased_colored_shape_composited_without_black_edge(self, preprocessor):
        """
        Adversarial test: A pure bright red circle (255, 0, 0) with smooth anti-aliased edge
        on a transparent background.
        When properly composited onto solid white (255, 255, 255):
        R channel must remain 255 everywhere across the image (since both red and white have R=255).
        G and B channels vary smoothly from 0 (solid red) to 255 (background white).
        If black edge fringing occurs (e.g. from unmultiplied alpha with black or erroneous blend),
        R channel will drop below 255 (forming dark red or dark gray/black borders).
        """
        w, h = 200, 200
        # Draw 4x supersampled circle for smooth anti-aliasing
        hi_res = Image.new("RGBA", (w * 4, h * 4), (0, 0, 0, 0))
        draw = ImageDraw.Draw(hi_res)
        draw.ellipse([80, 80, (w * 4) - 80, (h * 4) - 80], fill=(255, 0, 0, 255))
        antialiased = hi_res.resize((w, h), Image.Resampling.LANCZOS)

        buf = io.BytesIO()
        antialiased.save(buf, format="PNG")

        pages = preprocessor.process_input(buf.getvalue(), "antialiased_red.png")
        rgb = pages[0].rgb_image
        rgb_arr = np.array(rgb)

        # Inspect all edge pixels (where G or B are between 10 and 245)
        edge_mask = (rgb_arr[:, :, 1] > 10) & (rgb_arr[:, :, 1] < 245)
        assert np.any(edge_mask), "Anti-aliased edge pixels must exist"

        edge_R_values = rgb_arr[:, :, 0][edge_mask]
        # In a correct composite onto white:
        # Source: R=255, A in (0, 255). Dest: R=255.
        # Composite R = round(255 * (A/255) + 255 * (1 - A/255)) = 255!
        # If black fringe exists, edge_R_values will be noticeably less than 255.
        min_R_at_edge = np.min(edge_R_values)
        assert min_R_at_edge >= 250, (
            f"Black edge artifact detected! Minimum R at edge is {min_R_at_edge} (expected >= 250)"
        )

    def test_transparent_png_with_dirty_alpha_composites_to_pure_white(self, preprocessor):
        """
        Transparent pixels often have RGB=(0, 0, 0) and Alpha=0 in graphics files.
        They must composite to pure white (255, 255, 255), never black.
        """
        img = Image.new("RGBA", (100, 100), (0, 0, 0, 0))  # Zero alpha with black RGB
        draw = ImageDraw.Draw(img)
        # Put a blue square in center
        draw.rectangle([30, 30, 70, 70], fill=(0, 0, 255, 255))

        buf = io.BytesIO()
        img.save(buf, format="PNG")

        pages = preprocessor.process_input(buf.getvalue(), "dirty_alpha.png")
        rgb = pages[0].rgb_image
        rgb_arr = np.array(rgb)

        # Corners should be pure white
        assert tuple(rgb_arr[0, 0]) == (255, 255, 255)
        assert tuple(rgb_arr[0, -1]) == (255, 255, 255)
        assert tuple(rgb_arr[-1, 0]) == (255, 255, 255)
        assert tuple(rgb_arr[-1, -1]) == (255, 255, 255)

        # Center should be pure blue
        center = rgb_arr[page.height // 2, page.width // 2]
        assert center[0] == 0 and center[1] == 0 and center[2] == 255

    def test_palette_image_with_transparency_composited_on_white(self, preprocessor):
        """Palette 'P' mode with transparency info."""
        rgba = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
        draw = ImageDraw.Draw(rgba)
        draw.rectangle([25, 25, 75, 75], fill=(0, 200, 0, 255))
        # Quantize to palette with transparency
        palette_img = rgba.quantize(colors=16)

        buf = io.BytesIO()
        palette_img.save(buf, format="PNG", transparency=0)

        pages = preprocessor.process_input(buf.getvalue(), "palette_transp.png")
        rgb = pages[0].rgb_image
        rgb_arr = np.array(rgb)

        # Transparent corner should be white
        assert tuple(rgb_arr[0, 0]) == (255, 255, 255)
        # Center green
        assert rgb_arr[50, 50][1] > 150
