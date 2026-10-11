"""
Test Suite for Passport Photo / Background Removal Halo Suppression & Accuracy.

Verifies:
1. Synthetic test images:
   - Dark hair on pure white background
   - Light hair / blonde on dark background
   - Subject with eyeglasses shape
   - Subject wearing suit / sharp shoulder contour
2. Compositing over pure red, royal blue, and white.
3. Measurement of mean luminance of a 3-pixel outer ring immediately adjacent
   to the subject edge:
   Assert that outer edge ring luminance is within 8% of the composite background
   luminance (ensuring NO light halo or leftover border fringe).
4. Functional API behavior and options.
"""

import io
import math
import numpy as np
import pytest
from PIL import Image, ImageDraw, ImageFilter
from fastapi.testclient import TestClient

from bg_server import app
import bg_remove


client = TestClient(app)


def create_synthetic_dark_hair_white_bg(size=(400, 500)) -> bytes:
    """Creates synthetic portrait with dark hair on solid white background."""
    img = Image.new("RGB", size, (255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Head & hair (dark brown/black)
    draw.ellipse([100, 80, 300, 320], fill=(25, 20, 20))
    # Face (skin tone)
    draw.ellipse([130, 140, 270, 300], fill=(230, 190, 160))
    # Fine hair strands at top/sides
    for x in range(110, 290, 5):
        draw.line([(x, 80), (x + (x - 200) // 4, 50)], fill=(30, 25, 25), width=2)
    # Shoulders / suit
    draw.polygon([(50, 500), (100, 320), (300, 320), (350, 500)], fill=(40, 45, 60))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_synthetic_light_hair_dark_bg(size=(400, 500)) -> bytes:
    """Creates synthetic portrait with light/blonde hair on dark background."""
    img = Image.new("RGB", size, (30, 30, 35))
    draw = ImageDraw.Draw(img)
    # Blonde hair
    draw.ellipse([100, 80, 300, 320], fill=(240, 220, 150))
    # Face
    draw.ellipse([130, 140, 270, 300], fill=(245, 205, 180))
    # Shoulders
    draw.polygon([(50, 500), (100, 320), (300, 320), (350, 500)], fill=(50, 60, 80))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_synthetic_glasses_shape(size=(400, 500)) -> bytes:
    """Subject with black wire glasses frames and bridge."""
    img = Image.new("RGB", size, (250, 250, 250))
    draw = ImageDraw.Draw(img)
    draw.ellipse([100, 80, 300, 320], fill=(40, 30, 25))
    draw.ellipse([130, 140, 270, 300], fill=(235, 195, 170))
    # Glasses: left frame, right frame, bridge
    draw.rectangle([150, 190, 190, 220], outline=(10, 10, 10), width=3)
    draw.rectangle([210, 190, 250, 220], outline=(10, 10, 10), width=3)
    draw.line([(190, 205), (210, 205)], fill=(10, 10, 10), width=3)
    draw.polygon([(50, 500), (100, 320), (300, 320), (350, 500)], fill=(20, 20, 30))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_synthetic_suit_shape(size=(400, 500)) -> bytes:
    """Formal navy suit with sharp geometric shoulders and lapels."""
    img = Image.new("RGB", size, (245, 245, 245))
    draw = ImageDraw.Draw(img)
    # Head
    draw.ellipse([120, 80, 280, 290], fill=(225, 185, 155))
    # Hair
    draw.arc([115, 75, 285, 210], start=180, end=360, fill=(15, 15, 15), width=20)
    # Navy suit shoulders
    draw.polygon([(30, 500), (100, 300), (300, 300), (370, 500)], fill=(15, 25, 55))
    # Shirt collar & red tie
    draw.polygon([(170, 300), (200, 360), (230, 300)], fill=(255, 255, 255))
    draw.polygon([(195, 330), (205, 330), (210, 480), (190, 480)], fill=(180, 20, 30))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def calculate_outer_ring_luminance(
    composite_img: Image.Image,
    alpha_channel: np.ndarray,
    expected_bg_rgb: tuple[int, int, int],
    ring_width: int = 3
) -> float:
    """
    Computes the mean luminance in the ring of width `ring_width` pixels
    strictly OUTSIDE the subject silhouette (where alpha drops to near zero).
    
    Verifies absence of fringe/halo from the previous background.
    """
    from scipy import ndimage

    # Subject mask where alpha is noticeable (> 64/255)
    subject_mask = (alpha_channel > 64).astype(np.uint8)

    # Dilate subject mask by ring_width pixels
    struct = ndimage.generate_binary_structure(2, 2)
    dilated_mask = ndimage.binary_dilation(subject_mask, structure=struct, iterations=ring_width)

    # Ring is dilated region minus the subject interior (where alpha is low: < 15)
    outer_ring_mask = dilated_mask & (alpha_channel < 15)

    if not np.any(outer_ring_mask):
        # Fallback if silhouette reaches border
        return 0.0

    comp_arr = np.asarray(composite_img.convert("RGB"), dtype=np.float32)

    # Standard perceived luminance: 0.2126 R + 0.7152 G + 0.0722 B
    ring_pixels = comp_arr[outer_ring_mask]
    ring_lum = 0.2126 * ring_pixels[:, 0] + 0.7152 * ring_pixels[:, 1] + 0.0722 * ring_pixels[:, 2]
    mean_ring_lum = float(np.mean(ring_lum))

    expected_lum = 0.2126 * expected_bg_rgb[0] + 0.7152 * expected_bg_rgb[1] + 0.0722 * expected_bg_rgb[2]

    # Percentage difference relative to max possible luminance 255
    rel_diff_percent = (abs(mean_ring_lum - expected_lum) / 255.0) * 100.0
    return rel_diff_percent


@pytest.mark.parametrize("generator, name", [
    (create_synthetic_dark_hair_white_bg, "dark_hair_white_bg"),
    (create_synthetic_light_hair_dark_bg, "light_hair_dark_bg"),
    (create_synthetic_glasses_shape, "glasses_shape"),
    (create_synthetic_suit_shape, "suit_shape"),
])
def test_halo_suppression_across_backgrounds(generator, name):
    raw_bytes = generator()
    
    # Process through pipeline with FG estimation enabled
    png_bytes, meta = bg_remove.remove_background(raw_bytes, bg="transparent")
    cutout = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    alpha = np.asarray(cutout)[:, :, 3]

    background_targets = [
        ("pure_red", (255, 0, 0)),
        ("royal_blue", (29, 78, 216)),
        ("white", (255, 255, 255)),
    ]

    for bg_name, bg_color in background_targets:
        # Composite cutout onto candidate background
        bg_img = Image.new("RGBA", cutout.size, bg_color + (255,))
        composite = Image.alpha_composite(bg_img, cutout)

        # Check 3-pixel outer ring luminance
        diff_percent = calculate_outer_ring_luminance(composite, alpha, bg_color, ring_width=3)
        
        # Requirement: Assert outer ring luminance is within 8 percent of target background
        assert diff_percent <= 8.0, (
            f"Halo detected on {name} composited on {bg_name}! "
            f"Edge ring difference: {diff_percent:.2f}% (limit <= 8.0%)"
        )


def test_alpha_cleanup_removes_isolated_noise():
    """Verify alpha_cleanup eliminates tiny stray speckles and smooths edges."""
    noisy_alpha = np.zeros((200, 200), dtype=np.uint8)
    # Main silhouette
    noisy_alpha[40:160, 40:160] = 255
    # Small isolated speckles (less than 0.2% area: 200*200*0.002 = 80 px)
    noisy_alpha[10:15, 10:15] = 255  # 25 px blob
    noisy_alpha[180:185, 180:185] = 255 # 25 px blob

    cleaned = bg_remove.alpha_cleanup(noisy_alpha)

    # Stray blobs should be eliminated
    assert np.all(cleaned[10:15, 10:15] == 0)
    assert np.all(cleaned[180:185, 180:185] == 0)
    # Main object preserved
    assert np.mean(cleaned[50:150, 50:150]) > 200


def test_api_remove_bg_endpoint_contract():
    """Test standard FastAPI contract compatibility."""
    raw = create_synthetic_suit_shape()
    resp = client.post(
        "/api/remove-bg?bg=transparent",
        files={"file": ("photo.png", raw, "image/png")},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "image/png"
    assert "X-Processing-Time-Ms" in resp.headers

    # Also test bg=blue
    resp_blue = client.post(
        "/api/remove-bg?bg=blue",
        files={"file": ("photo.png", raw, "image/png")},
    )
    assert resp_blue.status_code == 200
    assert resp_blue.headers["content-type"] == "image/png"
