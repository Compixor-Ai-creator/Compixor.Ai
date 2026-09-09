"""
Flask Background Remover API
Replaces legacy tint/filter effects with deep-learning AI background removal using rembg and PIL.
"""

import io
import os
import logging
from flask import Flask, request, send_file, render_template_string, jsonify
from PIL import Image
import rembg

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Initialize Flask application
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # Allow up to 32MB image uploads

# Enable Cross-Origin Resource Sharing (CORS) headers for frontend integration
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


# ==============================================================================
# IMAGE PROCESSING CORE: REMBG BACKGROUND REMOVAL
# ==============================================================================
def remove_background(input_image_bytes: bytes) -> bytes:
    """
    Core AI background removal pipeline.
    
    Replaces legacy tint/color-grading logic:
      - Takes raw image buffer
      - Loads into PIL.Image with RGBA conversion
      - Runs rembg.remove() for studio-grade portrait & object background removal
      - Exports clean transparent PNG buffer
    """
    # 1. Open image using PIL
    input_image = Image.open(io.BytesIO(input_image_bytes)).convert("RGBA")
    
    # 2. Run rembg dynamic background removal
    # (Replaced legacy tint/filter transformation with state-of-the-art AI matting)
    output_image = rembg.remove(input_image)
    
    # 3. Save resulting image with alpha channel to an in-memory PNG byte stream
    output_buffer = io.BytesIO()
    output_image.save(output_buffer, format="PNG", optimize=True)
    output_buffer.seek(0)
    
    return output_buffer.getvalue()


# ==============================================================================
# ROUTES & ENDPOINTS
# ==============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for container probes and load balancers."""
    return jsonify({
        "status": "healthy",
        "service": "Flask Rembg Background Remover",
        "version": "1.0.0"
    }), 200


@app.route('/remove-bg', methods=['POST', 'OPTIONS'])
@app.route('/api/remove-bg', methods=['POST', 'OPTIONS'])
@app.route('/api/process', methods=['POST', 'OPTIONS'])
def process_remove_background():
    """
    API endpoint: Takes an uploaded image file, processes it through rembg.remove(),
    and returns a clean PNG file with transparent background.
    """
    if request.method == 'OPTIONS':
        return '', 204

    # 1. Check for uploaded file in multipart form data
    file = None
    if 'file' in request.files:
        file = request.files['file']
    elif 'image' in request.files:
        file = request.files['image']

    if not file or file.filename == '':
        return jsonify({
            "error": "No file uploaded. Please provide an image file with key 'file' or 'image' in multipart/form-data."
        }), 400

    try:
        logger.info(f"Processing background removal for file: {file.filename}")
        raw_bytes = file.read()
        
        # Verify valid image content
        if len(raw_bytes) == 0:
            return jsonify({"error": "Uploaded file is empty."}), 400

        # Execute rembg background removal
        clean_png_bytes = remove_background(raw_bytes)

        # Return transparent PNG
        return send_file(
            io.BytesIO(clean_png_bytes),
            mimetype='image/png',
            as_attachment=False,
            download_name='transparent_output.png'
        )

    except Exception as e:
        logger.error(f"Error processing image {file.filename}: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Failed to process image.",
            "details": str(e)
        }), 500


# ==============================================================================
# BUILT-IN INTERACTIVE WEB UI (GET /)
# ==============================================================================
UI_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Background Remover Studio</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #090d16;
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            width: 100%;
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.3);
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        h1 {
            font-size: 38px;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 30%, #818cf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        p.subtitle {
            color: #94a3b8;
            font-size: 15px;
        }
        .card {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .dropzone {
            border: 2px dashed #374151;
            border-radius: 16px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(17, 24, 39, 0.6);
        }
        .dropzone:hover, .dropzone.dragover {
            border-color: #6366f1;
            background: rgba(99, 102, 241, 0.05);
        }
        .icon {
            font-size: 40px;
            margin-bottom: 12px;
        }
        .upload-text {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 6px;
        }
        .upload-hint {
            color: #64748b;
            font-size: 13px;
        }
        .btn {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: #ffffff;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.4);
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .preview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 28px;
        }
        @media (max-width: 640px) {
            .preview-grid { grid-template-columns: 1fr; }
        }
        .preview-box {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 14px;
            padding: 16px;
            text-align: center;
        }
        .preview-title {
            font-size: 13px;
            font-weight: 700;
            color: #94a3b8;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .img-wrapper {
            width: 100%;
            height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 10px;
        }
        .checkerboard {
            background-color: #1e293b;
            background-image:
                linear-gradient(45deg, #0f172a 25%, transparent 25%),
                linear-gradient(-45deg, #0f172a 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #0f172a 75%),
                linear-gradient(-45deg, transparent 75%, #0f172a 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .img-wrapper img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .download-btn {
            background: #10b981;
            margin-top: 14px;
            padding: 10px 18px;
            font-size: 13px;
        }
        .download-btn:hover {
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4);
        }
        .api-info {
            margin-top: 32px;
            padding: 20px;
            background: #0b1120;
            border: 1px solid #1e293b;
            border-radius: 14px;
            font-size: 13px;
            color: #94a3b8;
        }
        code {
            background: #1e293b;
            color: #818cf8;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="badge">Production AI Service</span>
            <h1>Background Remover API</h1>
            <p class="subtitle">Deep-learning background separation powered by rembg &amp; Python Flask</p>
        </div>

        <div class="card">
            <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
                <div class="icon">✨</div>
                <div class="upload-text">Click to choose a photo or drag &amp; drop here</div>
                <div class="upload-hint">Supports PNG, JPG, JPEG, WEBP (up to 32MB)</div>
                <input type="file" id="fileInput" accept="image/*" style="display: none;">
            </div>

            <button class="btn" id="processBtn" disabled onclick="removeBg()">
                <span>Remove Background</span>
            </button>

            <div class="preview-grid" id="previewGrid" style="display: none;">
                <div class="preview-box">
                    <div class="preview-title">Original Photo</div>
                    <div class="img-wrapper">
                        <img id="origImg" src="" alt="Original">
                    </div>
                </div>
                <div class="preview-box">
                    <div class="preview-title">Transparent Cutout</div>
                    <div class="img-wrapper checkerboard">
                        <img id="resultImg" src="" alt="Output">
                    </div>
                    <a id="downloadLink" class="btn download-btn" download="cutout.png">
                        ⬇ Download Transparent PNG
                    </a>
                </div>
            </div>
        </div>

        <div class="api-info">
            <strong style="color: #f1f5f9;">Direct REST API Endpoint:</strong><br><br>
            <code>curl -X POST -F "file=@photo.jpg" http://localhost:5000/remove-bg --output cutout.png</code>
        </div>
    </div>

    <script>
        const fileInput = document.getElementById('fileInput');
        const dropzone = document.getElementById('dropzone');
        const processBtn = document.getElementById('processBtn');
        const previewGrid = document.getElementById('previewGrid');
        const origImg = document.getElementById('origImg');
        const resultImg = document.getElementById('resultImg');
        const downloadLink = document.getElementById('downloadLink');

        let currentFile = null;

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        function handleFile(file) {
            currentFile = file;
            origImg.src = URL.createObjectURL(file);
            previewGrid.style.display = 'grid';
            resultImg.src = '';
            downloadLink.style.display = 'none';
            processBtn.disabled = false;
        }

        async function removeBg() {
            if (!currentFile) return;

            processBtn.disabled = true;
            processBtn.innerHTML = '<span class="spinner"></span> Processing with AI...';

            const formData = new FormData();
            formData.append('file', currentFile);

            try {
                const response = await fetch('/remove-bg', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const err = await response.json();
                    alert('Error: ' + (err.error || 'Failed to remove background'));
                    return;
                }

                const blob = await response.blob();
                const cutoutUrl = URL.createObjectURL(blob);
                resultImg.src = cutoutUrl;
                downloadLink.href = cutoutUrl;
                downloadLink.style.display = 'flex';
            } catch (err) {
                alert('Network error: ' + err.message);
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<span>Remove Background</span>';
            }
        }
    </script>
</body>
</html>
"""

@app.route('/', methods=['GET'])
def index():
    """Serve modern interactive browser UI."""
    return render_template_string(UI_TEMPLATE)


# ==============================================================================
# MAIN ENTRY POINT (LOCAL DEVELOPMENT)
# ==============================================================================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    logger.info(f"Starting Flask Background Remover service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
