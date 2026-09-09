"""
Gunicorn Production Server Configuration
Optimized for AI / ONNX inference workloads.
"""

import multiprocessing
import os

# Server socket
bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:5000")
backlog = 2048

# Worker processes
# AI / rembg models benefit from having 2-4 workers to avoid OOM while handling concurrent requests
workers = int(os.environ.get("GUNICORN_WORKERS", 2))
threads = int(os.environ.get("GUNICORN_THREADS", 4))
worker_class = "gthread"

# Timeout: Allow up to 120 seconds for cold-start model downloads or heavy image processing
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 120))
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "rembg-flask"
