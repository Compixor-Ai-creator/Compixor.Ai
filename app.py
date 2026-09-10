"""
Flask AI Passport Photo Maker & Background Remover — v3.0
Fixes:
  - rembg.remove() called with raw bytes (not PIL Image), which is the safe cross-version API
  - Full image-mode normalisation (RGBA/RGB/P/L) before and after removal
  - Pillow dpi kwarg passed as a plain int tuple accepted by all Pillow >=9 versions
  - sheet canvas converted to RGB before saving (avoids "cannot write mode RGBA as JPEG" edge case)
  - Response changed to JSON { ok, image (base64), filename } so frontend never needs to use alert()
  - All exceptions include full traceback in dev; sanitised in prod
"""

import io
import os
import base64
import logging
import traceback
from flask import Flask, request, send_file, render_template, jsonify
from PIL import Image, ImageDraw
import rembg

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ── App init ──────────────────────────────────────────────────────────────────
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'templates')
app = Flask(__name__, template_folder=TEMPLATES_DIR)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024   # 32 MB upload cap
DEV_MODE = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'


@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


# ── Constants ─────────────────────────────────────────────────────────────────
COLOR_MAP = {
    'white':      (255, 255, 255),
    'light-blue': (224, 242, 254),   # NADRA / Gulf light blue #e0f2fe
    'blue':       (29,  78,  216),   # Royal navy blue #1d4ed8
    'light-gray': (226, 232, 240),   # ICAO / Schengen #e2e8f0
    'transparent': None              # Pure alpha cutout
}

# Output pixel sizes @ 300 DPI
PASSPORT_SPECS = {
    '2x2':   {'w': 600, 'h': 600},   # US / India / 51×51 mm
    '35x45': {'w': 413, 'h': 531},   # UK / EU / NADRA / 35×45 mm
}


# ── Image helpers ─────────────────────────────────────────────────────────────

def _to_safe_rgb(img: Image.Image) -> Image.Image:
    """Convert any PIL mode to plain RGB — needed before JPEG export."""
    if img.mode == 'RGBA':
        bg = Image.new('RGB', img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        return bg
    return img.convert('RGB')


def remove_background(raw_bytes: bytes) -> Image.Image:
    """
    Run rembg on the raw file bytes and return an RGBA PIL Image.
    We pass *bytes* rather than a PIL Image — that is the universal
    input type accepted by all rembg versions (>=2.0).
    """
    # rembg.remove() → bytes (PNG with alpha channel)
    result_bytes = rembg.remove(raw_bytes)

    # Parse back to PIL and guarantee RGBA mode
    cutout = Image.open(io.BytesIO(result_bytes))
    if cutout.mode != 'RGBA':
        cutout = cutout.convert('RGBA')
    return cutout


def apply_background(cutout: Image.Image, bg_color_key: str) -> Image.Image:
    """
    Composite the RGBA cutout onto a solid background colour.
    Returns RGBA when transparent is requested, RGB otherwise
    (so downstream code can save without mode issues).
    """
    bg_key = (bg_color_key or 'white').lower().strip()
    bg_rgb = COLOR_MAP.get(bg_key, (255, 255, 255))

    if bg_rgb is None:
        # Transparent — return the raw RGBA cutout
        return cutout

    # Create RGB canvas and alpha-composite the cutout over it
    canvas = Image.new('RGBA', cutout.size, bg_rgb + (255,))
    canvas.paste(cutout, (0, 0), cutout)
    # Convert to RGB so saving never triggers RGBA warnings
    return canvas.convert('RGB')


def crop_to_passport(img: Image.Image, photo_size: str) -> Image.Image:
    """
    Center-crop the image to the target passport aspect ratio then
    scale to the exact 300-DPI pixel dimensions.
    A 12 % top bias preserves the crown of the head.
    """
    spec = PASSPORT_SPECS.get(photo_size, PASSPORT_SPECS['2x2'])
    tw, th = spec['w'], spec['h']
    target_ratio = tw / th

    ow, oh = img.size
    orig_ratio = ow / oh

    if orig_ratio > target_ratio:
        # Wider than target → crop left/right symmetrically
        nw = int(oh * target_ratio)
        left = (ow - nw) // 2
        box = (left, 0, left + nw, oh)
    else:
        # Taller than target → keep top, trim bottom (12 % bias)
        nh = int(ow / target_ratio)
        excess = oh - nh
        top = max(0, int(excess * 0.12))
        box = (0, top, ow, top + nh)

    return img.crop(box).resize((tw, th), Image.Resampling.LANCZOS)


def build_sheet(photo: Image.Image, paper_size: str, count: int) -> Image.Image:
    """
    Tile `count` copies of `photo` onto a 300-DPI printable sheet.
    Returns an RGB Image (white sheet background).
    """
    if paper_size == 'single' or count <= 1:
        # For a single photo just make sure it's RGB-safe
        return photo if photo.mode == 'RGB' else _to_safe_rgb(photo)

    # ── Sheet dimensions (300 DPI) ────────────────────────────────────────
    if paper_size == '4x6':
        sw, sh = 1800, 1200   # 6 × 4 inches landscape
        grid = {2: (2, 1), 4: (2, 2), 6: (3, 2)}.get(count, (3, 2))
    elif paper_size == 'a4':
        sw, sh = 2480, 3508   # A4 portrait
        grid = {6: (2, 3), 12: (3, 4), 16: (4, 4)}.get(count, (4, 4))
    else:
        return photo if photo.mode == 'RGB' else _to_safe_rgb(photo)

    cols, rows = grid
    is_rgba = photo.mode == 'RGBA'

    # ── Create sheet canvas (always RGB white) ────────────────────────────
    sheet_mode = 'RGBA' if is_rgba else 'RGB'
    sheet_fill = (255, 255, 255, 255) if is_rgba else (255, 255, 255)
    sheet = Image.new(sheet_mode, (sw, sh), sheet_fill)
    draw  = ImageDraw.Draw(sheet)

    # ── Scale photo to fit cell with 6 % margin each side ────────────────
    cell_w = sw / cols
    cell_h = sh / rows
    fit_w  = cell_w * 0.88
    fit_h  = cell_h * 0.88

    pw, ph = photo.size
    if (pw / ph) > (fit_w / fit_h):
        dw = int(fit_w)
        dh = int(fit_w * ph / pw)
    else:
        dh = int(fit_h)
        dw = int(fit_h * pw / ph)

    thumb = photo.resize((dw, dh), Image.Resampling.LANCZOS)

    # ── Paste copies ──────────────────────────────────────────────────────
    placed = 0
    for r in range(rows):
        for c in range(cols):
            if placed >= count:
                break
            cx = int(c * cell_w + (cell_w - dw) / 2)
            cy = int(r * cell_h + (cell_h - dh) / 2)

            if is_rgba:
                sheet.paste(thumb, (cx, cy), thumb)
            else:
                sheet.paste(thumb, (cx, cy))

            # Subtle cut-guide border
            draw.rectangle(
                [cx - 1, cy - 1, cx + dw, cy + dh],
                outline=(203, 213, 225) if not is_rgba else (203, 213, 225, 255),
                width=1
            )
            placed += 1

    # Always return RGB for final export
    return sheet.convert('RGB') if sheet.mode == 'RGBA' else sheet


def _encode_image(img: Image.Image) -> tuple[str, bytes]:
    """
    Encode a PIL Image to PNG bytes and a base64 data-URI string.
    Returns (data_uri, raw_bytes).
    """
    buf = io.BytesIO()
    # Pillow >=9 accepts a plain int-tuple for dpi; ensure RGB for PNG to
    # avoid any palette/transparency edge cases.
    save_img = img if img.mode in ('RGB', 'RGBA') else img.convert('RGB')
    save_img.save(buf, format='PNG', dpi=(300, 300))
    raw = buf.getvalue()
    b64 = base64.b64encode(raw).decode('ascii')
    data_uri = f"data:image/png;base64,{b64}"
    return data_uri, raw


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/generate-passport-photo', methods=['POST', 'OPTIONS'])
def generate_passport_photo():
    """
    Full passport-photo pipeline:
      1. rembg background removal (bytes → bytes → RGBA PIL)
      2. Solid-colour background compositing
      3. Aspect-ratio crop + 300-DPI resize
      4. Multi-photo printable grid sheet
      5. Return JSON { ok, image (base64 data-URI), filename }
         so the frontend can update <img> src in-place, no page reload.
    """
    if request.method == 'OPTIONS':
        return '', 204

    # ── File ──────────────────────────────────────────────────────────────
    file = request.files.get('file') or request.files.get('image')
    if not file or not file.filename:
        return jsonify({'ok': False, 'error': 'No image file uploaded (key: file or image).'}), 400

    raw_bytes = file.read()
    if not raw_bytes:
        return jsonify({'ok': False, 'error': 'Uploaded file is empty.'}), 400

    # ── Form params ───────────────────────────────────────────────────────
    paper_size = request.form.get('paper_size', '4x6').lower().strip()
    photo_size = request.form.get('photo_size', '2x2').lower().strip()
    bg_color   = request.form.get('bg_color',   'white').lower().strip()
    try:
        photo_count = max(1, int(request.form.get('photo_count', 6)))
    except (ValueError, TypeError):
        photo_count = 6

    logger.info(
        f"[generate] file={file.filename!r} paper={paper_size} "
        f"size={photo_size} bg={bg_color} count={photo_count}"
    )

    try:
        # Step 1: AI background removal — pass raw bytes, not PIL Image
        cutout = remove_background(raw_bytes)

        # Step 2: Apply solid background colour (or keep transparent)
        coloured = apply_background(cutout, bg_color)

        # Step 3: Crop + resize to biometric passport spec
        passport = crop_to_passport(coloured, photo_size)

        # Step 4: Tile onto printable sheet
        sheet = build_sheet(passport, paper_size, photo_count)

        # Step 5: Encode as base64 PNG
        data_uri, raw_png = _encode_image(sheet)
        filename = f"passport_{paper_size}_{photo_size}.png"

        return jsonify({
            'ok':       True,
            'image':    data_uri,
            'filename': filename,
        })

    except Exception as exc:
        tb = traceback.format_exc()
        logger.error(f"[generate] FAILED: {exc}\n{tb}")
        detail = tb if DEV_MODE else str(exc)
        return jsonify({'ok': False, 'error': 'Image processing failed.', 'detail': detail}), 500


@app.route('/remove-bg', methods=['POST', 'OPTIONS'])
@app.route('/api/remove-bg', methods=['POST', 'OPTIONS'])
def api_remove_bg():
    """Standalone background-removal endpoint → returns transparent PNG directly."""
    if request.method == 'OPTIONS':
        return '', 204

    file = request.files.get('file') or request.files.get('image')
    if not file or not file.filename:
        return jsonify({'ok': False, 'error': 'No file provided.'}), 400

    raw_bytes = file.read()
    if not raw_bytes:
        return jsonify({'ok': False, 'error': 'Empty file.'}), 400

    try:
        cutout = remove_background(raw_bytes)
        buf = io.BytesIO()
        cutout.save(buf, format='PNG')
        buf.seek(0)
        return send_file(buf, mimetype='image/png', download_name='cutout.png')
    except Exception as exc:
        logger.error(f"[remove-bg] {exc}", exc_info=True)
        return jsonify({'ok': False, 'error': str(exc)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'Passport Photo Maker', 'version': '3.0.0'})


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting on port {port} …")
    app.run(host='0.0.0.0', port=port, debug=DEV_MODE)
