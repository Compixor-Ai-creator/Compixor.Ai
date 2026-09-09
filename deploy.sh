#!/bin/bash
# ==============================================================================
# VPS Automated Deployment Script for Flask rembg Background Remover
# Compatible with Ubuntu 20.04/22.04/24.04 and Debian 11/12
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$APP_DIR/venv"
SERVICE_NAME="rembg-flask"

echo "========================================================="
echo " Deploying Flask Rembg Background Remover on VPS..."
echo "========================================================="

# 1. Update package list & install system prerequisites
echo "[1/5] Installing OS dependencies (Python3, pip, venv, libgl1)..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv libgl1 libglib2.0-0 libgomp1

# 2. Setup isolated Python virtual environment
echo "[2/5] Creating Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

# 3. Upgrade pip and install Python packages
echo "[3/5] Installing requirements from requirements.txt..."
pip install --upgrade pip
pip install -r "$APP_DIR/requirements.txt"

# 4. Configure Systemd Service for 24/7 background operation & auto-restart
echo "[4/5] Setting up systemd service ($SERVICE_NAME)..."
CURRENT_USER=$(whoami)

sudo bash -c "cat > /etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Gunicorn instance to serve Flask Rembg Background Remover
After=network.target

[Service]
User=$CURRENT_USER
Group=$CURRENT_USER
WorkingDirectory=$APP_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/gunicorn -c gunicorn_config.py wsgi:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 5. Reload systemd, enable and start service
echo "[5/5] Starting and enabling ${SERVICE_NAME}.service..."
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

echo "========================================================="
echo " Deployment Complete!"
echo " Status: sudo systemctl status $SERVICE_NAME"
echo " Logs:   sudo journalctl -u $SERVICE_NAME -f"
echo " Test:   curl http://localhost:5000/health"
echo "========================================================="
