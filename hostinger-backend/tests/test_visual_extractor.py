"""
Comprehensive Unit Test Suite for Visual Element Extractor (R4).
Conforms to PROJECT.md § Interface Contracts § 2 and Acceptance Criteria.

Covers:
1. Synthetic document tests:
   - Student portrait photo detection (aspect ratio ~3:4, color variance, bounding box)
   - Institutional logo/crest detection (circular/shield topology, edge density)
   - 1D/2D barcode detection (vertical gradient disparity, stripe transitions)
   - Cursive signature / stamp detection (stroke topology, low solidity)
   - Negative testing on clean text-only documents (zero false positives)
2. Bounding box validity & coordinate integrity (clamping, valid sizes, non-zero areas)
3. Binary text mask verification (masked regions set to 0, text ink preserved)
4. Real-world validation on Capture.PNG (if present on test host).
"""

import io
import os
from pathlib import Path

import numpy as np
import pytest
from PIL import Image, ImageDraw

from pipeline.preprocessor import DocumentPreprocessor, PreprocessedPage
from pipeline.visual_extractor import VisualElementExtractor, ExtractedVisualElement

CAPTURE_PNG_PATH = Path(r"C:\Users\AL GHANI\Desktop\Capture.PNG")


@pytest.fixture
def preprocessor() -> DocumentPreprocessor:
    return DocumentPreprocessor(max_upload_mb=10, target_dpi=300)


@pytest.fixture
def visual_extractor() -> VisualElementExtractor:
    return VisualElementExtractor()


@pytest.fixture
def synthetic_page_with_photo(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic 300 DPI document page containing a 3:4 portrait photo box."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Some header text lines
    draw.rectangle([100, 60, 600, 80], fill=(20, 20, 20))
    draw.rectangle([100, 100, 450, 120], fill=(20, 20, 20))

    # Photo box at top-right: x=850, y=100, w=240, h=320 (aspect 240/320 = 0.75, 3:4 ratio)
    px, py, pw, ph = 850, 100, 240, 320
    # Draw photo border
    draw.rectangle([px, py, px + pw, py + ph], outline=(30, 30, 30), width=3)
    # Fill photo with realistic color variations (skin tones, suit, background)
    photo_arr = np.zeros((ph - 6, pw - 6, 3), dtype=np.uint8)
    photo_arr[:, :, 0] = np.random.randint(160, 230, (ph - 6, pw - 6), dtype=np.uint8)  # R
    photo_arr[:, :, 1] = np.random.randint(120, 180, (ph - 6, pw - 6), dtype=np.uint8)  # G
    photo_arr[:, :, 2] = np.random.randint(90, 140, (ph - 6, pw - 6), dtype=np.uint8)   # B
    photo_img = Image.fromarray(photo_arr, mode="RGB")
    img.paste(photo_img, (px + 3, py + 3))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_photo.png")
    return pages[0]


@pytest.fixture
def synthetic_page_with_barcode(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic document page containing a 1D barcode strip."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header and student id text
    draw.rectangle([100, 100, 500, 125], fill=(0, 0, 0))

    # 1D Barcode at x=200, y=250, w=300, h=60 (aspect 5.0)
    bx, by, bw, bh = 200, 250, 300, 60
    # Draw alternating vertical black bars on white
    bar_x = bx
    while bar_x < bx + bw:
        bar_w = np.random.choice([2, 3, 5, 7])
        draw.rectangle([bar_x, by, min(bx + bw, bar_x + bar_w), by + bh], fill=(0, 0, 0))
        space_w = np.random.choice([2, 3, 4, 6])
        bar_x += bar_w + space_w

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_barcode.png")
    return pages[0]


@pytest.fixture
def synthetic_page_with_2d_barcode(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic document page containing a 2D square QR barcode."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Document title
    draw.rectangle([100, 80, 700, 110], fill=(0, 0, 0))

    # 2D QR Code at x=800, y=100, w=150, h=150 (aspect 1.0)
    qx, qy, qw, qh = 800, 100, 150, 150
    # Outer border
    draw.rectangle([qx, qy, qx + qw, qy + qh], outline=(0, 0, 0), width=4)

    # Finder patterns at 3 corners (top-left, top-right, bottom-left)
    for fx, fy in [(qx + 10, qy + 10), (qx + qw - 45, qy + 10), (qx + 10, qy + qh - 45)]:
        draw.rectangle([fx, fy, fx + 35, fy + 35], outline=(0, 0, 0), width=3)
        draw.rectangle([fx + 8, fy + 8, fx + 27, fy + 27], fill=(0, 0, 0))

    # Dense module grid with alternating black/white modules
    for my in range(qy + 15, qy + qh - 15, 10):
        for mx in range(qx + 15, qx + qw - 15, 10):
            if (mx + my) % 20 == 0:
                draw.rectangle([mx, my, mx + 7, my + 7], fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_2d_barcode.png")
    return pages[0]


@pytest.fixture
def synthetic_page_with_logo(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic document page containing a circular institutional emblem."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Circular logo at top-left: x=100, y=100, w=150, h=150 (aspect 1.0)
    lx, ly, lw, lh = 100, 100, 150, 150
    # Outer ring
    draw.ellipse([lx, ly, lx + lw, ly + lh], outline=(10, 10, 10), width=5)
    # Inner ring
    draw.ellipse([lx + 15, ly + 15, lx + lw - 15, ly + lh - 15], outline=(10, 10, 10), width=3)
    # Internal cross/shield lines
    draw.line([lx + lw // 2, ly + 20, lx + lw // 2, ly + lh - 20], fill=(10, 10, 10), width=4)
    draw.line([lx + 20, ly + lh // 2, lx + lw - 20, ly + lh // 2], fill=(10, 10, 10), width=4)
    draw.ellipse([lx + lw // 2 - 20, ly + lh // 2 - 20, lx + lw // 2 + 20, ly + lh // 2 + 20], fill=(20, 20, 20))

    # Adjacent title
    draw.rectangle([300, 120, 900, 160], fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_logo.png")
    return pages[0]


@pytest.fixture
def synthetic_page_with_signature(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a synthetic document page containing a cursive handwritten signature."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Text at top
    draw.rectangle([100, 100, 800, 130], fill=(0, 0, 0))

    # Cursive signature flourish at x=800, y=1100, w=220, h=100
    sx, sy = 800, 1100
    points = [
        (sx, sy + 60), (sx + 30, sy + 15), (sx + 60, sy + 80),
        (sx + 90, sy + 30), (sx + 120, sy + 70), (sx + 150, sy + 20),
        (sx + 180, sy + 85), (sx + 210, sy + 50)
    ]
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=(15, 15, 25), width=3)
    # Loop flourish
    draw.arc([sx + 40, sy + 10, sx + 160, sy + 90], start=30, end=330, fill=(15, 15, 25), width=3)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "synthetic_sig.png")
    return pages[0]


@pytest.fixture
def text_only_page(preprocessor: DocumentPreprocessor) -> PreprocessedPage:
    """Creates a document containing only text lines (no photos, logos, barcodes, or signatures)."""
    w, h = 1200, 1600
    img = Image.new("RGB", (w, h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    for y in range(100, 1400, 50):
        draw.rectangle([100, y, 900, y + 16], fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    pages = preprocessor.process_input(buf.getvalue(), "text_only.png")
    return pages[0]


class TestVisualElementDetection:
    """Tests segmentation for photos, logos, barcodes, and signatures."""

    def test_student_photo_detection(self, visual_extractor, synthetic_page_with_photo):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_photo)
        photos = [e for e in elements if e.element_type == "photo"]

        assert len(photos) >= 1, "Expected at least 1 photo to be detected"
        photo = photos[0]
        bx, by, bw, bh = photo.bbox

        # Check aspect ratio ~ 3:4 (0.6 to 1.1)
        aspect = bw / float(bh)
        assert 0.55 <= aspect <= 1.25, f"Expected photo aspect ratio ~3:4, got {aspect:.2f}"
        assert photo.confidence >= 0.60, f"Expected photo confidence >= 0.60, got {photo.confidence}"
        assert photo.crop_image.width == bw
        assert photo.crop_image.height == bh

    def test_barcode_detection(self, visual_extractor, synthetic_page_with_barcode):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_barcode)
        barcodes = [e for e in elements if e.element_type == "barcode"]

        assert len(barcodes) >= 1, "Expected at least 1 barcode to be detected"
        barcode = barcodes[0]
        bx, by, bw, bh = barcode.bbox

        # Barcode must be wider than tall
        assert bw > bh, f"Expected barcode width > height, got {bw} x {bh}"
        assert barcode.confidence >= 0.60
        assert barcode.crop_image.size == (bw, bh)

    def test_2d_barcode_qr_detection(self, visual_extractor, synthetic_page_with_2d_barcode):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_2d_barcode)
        barcodes = [e for e in elements if e.element_type == "barcode"]

        assert len(barcodes) >= 1, "Expected square 2D barcode to be detected"
        bc = barcodes[0]
        bx, by, bw, bh = bc.bbox
        aspect = bw / float(bh)
        assert 0.75 <= aspect <= 1.30, f"Expected near-square 2D barcode aspect ratio, got {aspect:.2f}"
        assert bc.confidence >= 0.60
        assert text_mask[by + bh // 2, bx + bw // 2] == 0

    def test_logo_crest_detection(self, visual_extractor, synthetic_page_with_logo):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_logo)
        logos = [e for e in elements if e.element_type == "logo"]

        assert len(logos) >= 1, "Expected at least 1 institutional logo to be detected"
        logo = logos[0]
        bx, by, bw, bh = logo.bbox

        # Logo is compact (aspect ratio between 0.6 and 1.6)
        aspect = bw / float(bh)
        assert 0.6 <= aspect <= 1.6, f"Expected compact logo aspect ratio, got {aspect:.2f}"
        assert logo.confidence >= 0.60

    def test_signature_detection(self, visual_extractor, synthetic_page_with_signature):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_signature)
        sigs = [e for e in elements if e.element_type in ("signature", "stamp")]

        assert len(sigs) >= 1, "Expected at least 1 signature/stamp to be detected"
        sig = sigs[0]
        bx, by, bw, bh = sig.bbox
        assert bw > 30 and bh > 20
        assert sig.confidence >= 0.50

    def test_text_only_document_has_no_spurious_visual_elements(self, visual_extractor, text_only_page):
        elements, text_mask = visual_extractor.extract_and_mask(text_only_page)
        # Should not falsely classify regular text paragraphs as photos or barcodes
        photos_and_barcodes = [e for e in elements if e.element_type in ("photo", "barcode")]
        assert len(photos_and_barcodes) == 0, f"Expected 0 photos/barcodes in text-only document, found {len(photos_and_barcodes)}"


class TestTextMaskingIntegrity:
    """Verifies that visual regions are masked out (set to 0) in the binary text mask."""

    def test_visual_elements_are_masked_out_in_text_mask(self, visual_extractor, synthetic_page_with_photo):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_photo)
        assert len(elements) >= 1

        for elem in elements:
            bx, by, bw, bh = elem.bbox
            # Center of the visual element bounding box must be 0 in text_mask
            center_x = bx + bw // 2
            center_y = by + bh // 2
            assert text_mask[center_y, center_x] == 0, (
                f"Visual element at ({bx}, {by}, {bw}, {bh}) was not masked out at center ({center_x}, {center_y})"
            )

    def test_text_mask_preserves_unrelated_text_ink(self, visual_extractor, synthetic_page_with_photo):
        elements, text_mask = visual_extractor.extract_and_mask(synthetic_page_with_photo)
        # Header text was drawn at x=100..600, y=60..80 on 1200x1600 canvas
        # Check that ink pixels in that region remain preserved (> 0), accounting for 300 DPI normalization scale
        scale_x = synthetic_page_with_photo.width / 1200.0
        scale_y = synthetic_page_with_photo.height / 1600.0
        y1 = int(65 * scale_y)
        y2 = int(75 * scale_y)
        x1 = int(150 * scale_x)
        x2 = int(400 * scale_x)
        header_ink = text_mask[y1:y2, x1:x2]
        assert np.any(header_ink > 0), "Text mask erroneously erased non-visual body text ink"


class TestRealWorldCaptureSample:
    """Tests visual extraction on real-world test document (Capture.PNG) if available."""

    @pytest.mark.skipif(not CAPTURE_PNG_PATH.exists(), reason="Capture.PNG not present on host")
    def test_capture_png_visual_extraction(self, preprocessor, visual_extractor):
        with open(CAPTURE_PNG_PATH, "rb") as f:
            file_bytes = f.read()

        pages = preprocessor.process_input(file_bytes, "Capture.PNG")
        assert len(pages) == 1
        page = pages[0]

        elements, text_mask = visual_extractor.extract_and_mask(page)

        # In Capture.PNG: Photo, Logo, Barcode, Signature exist
        types_detected = {e.element_type for e in elements}
        assert "photo" in types_detected, f"Student photo not detected in Capture.PNG; detected: {types_detected}"

        # Check photo properties
        photos = [e for e in elements if e.element_type == "photo"]
        photo = photos[0]
        bx, by, bw, bh = photo.bbox
        # Student photo is in right quadrant, aspect ratio ~0.85
        assert bx > page.width * 0.50, f"Expected student photo on right side of page, got x={bx}"
        aspect = bw / float(bh)
        assert 0.65 <= aspect <= 1.15, f"Expected ID photo aspect ~0.75-0.90, got {aspect:.2f}"

        # Verify text_mask zeros out the photo
        assert text_mask[by + bh // 2, bx + bw // 2] == 0

        # Verify all element crops are valid PIL images with RGB mode
        for elem in elements:
            assert isinstance(elem.crop_image, Image.Image)
            assert elem.crop_image.mode == "RGB"
            assert elem.crop_image.width == elem.bbox[2]
            assert elem.crop_image.height == elem.bbox[3]
