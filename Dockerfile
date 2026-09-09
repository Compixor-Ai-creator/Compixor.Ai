FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    U2NET_HOME=/root/.u2net

# Install essential system dependencies required for OpenCV, Pillow, and ONNX Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download the default u2net model to make cold starts instant
RUN python -c "import rembg; rembg.new_session('u2net')"

# Copy application source code
COPY . .

EXPOSE 5000

# Run with Gunicorn using production WSGI configuration
CMD ["gunicorn", "-c", "gunicorn_config.py", "wsgi:app"]
