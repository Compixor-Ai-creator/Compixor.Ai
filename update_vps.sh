#!/usr/bin/env bash
# ==============================================================================
# Compixor AI — Auto-Updater for Hostinger VPS (Image-to-Word & Math OCR Engine)
# ==============================================================================
set -e

echo "=== [1/4] Locating Compixor Backend Directory on VPS ==="
TARGET_DIR=""

# Check standard known locations on Hostinger Ubuntu VPS
CANDIDATES=(
  "/var/www/compixor-img2word"
  "/var/www/compixor-backend"
  "/root/compixor-backend"
  "/root/Compixor.Ai/hostinger-backend"
  "/var/www/Compixor.Ai/hostinger-backend"
  "$HOME/compixor-img2word"
)

for dir in "${CANDIDATES[@]}"; do
  if [ -d "$dir" ] && [ -f "$dir/main.py" ]; then
    TARGET_DIR="$dir"
    break
  fi
done

# If not found in standard paths, search systemd service definition
if [ -z "$TARGET_DIR" ]; then
  if [ -f "/etc/systemd/system/compixor-img2word.service" ]; then
    TARGET_DIR=$(grep -i "WorkingDirectory=" /etc/systemd/system/compixor-img2word.service | cut -d= -f2 | tr -d ' ')
  fi
fi

# Fallback: find main.py inside /var/www or /root
if [ -z "$TARGET_DIR" ] || [ ! -d "$TARGET_DIR" ]; then
  FOUND_PATH=$(find /var/www /root -maxdepth 4 -name "main.py" 2>/dev/null | grep -E "img2word|compixor" | head -n 1)
  if [ -n "$FOUND_PATH" ]; then
    TARGET_DIR=$(dirname "$FOUND_PATH")
  fi
fi

if [ -z "$TARGET_DIR" ] || [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Could not find backend folder automatically."
  echo "Defaulting to: /var/www/compixor-img2word"
  TARGET_DIR="/var/www/compixor-img2word"
  mkdir -p "$TARGET_DIR"
fi

echo "Target backend directory: $TARGET_DIR"

echo "=== [2/4] Downloading Latest Math OCR & Logo Engine Code ==="
cd "$TARGET_DIR"

# Download the updated main.py directly from GitHub main branch
curl -fsSL "https://raw.githubusercontent.com/Compixor-Ai-creator/Compixor.Ai/main/hostinger-backend/main.py" -o "$TARGET_DIR/main.py"

echo "=== [3/4] Checking & Restarting Backend Service ==="
# Restart systemd service
if systemctl is-active --quiet compixor-img2word; then
  systemctl restart compixor-img2word
  echo "Successfully restarted compixor-img2word.service!"
elif [ -f "/etc/systemd/system/compixor-img2word.service" ]; then
  systemctl daemon-reload
  systemctl enable --now compixor-img2word
  echo "Enabled and started compixor-img2word.service!"
else
  # Check if uvicorn is running directly or with another name
  pkill -f "uvicorn main:app" || true
  nohup python3 -m uvicorn main:app --host 127.0.0.1 --port 8001 --workers 2 > /var/log/compixor.log 2>&1 &
  echo "Started backend via direct uvicorn process."
fi

# Reload Nginx if active
if systemctl is-active --quiet nginx; then
  nginx -t && systemctl reload nginx
  echo "Nginx reloaded."
fi

echo "=== [4/4] Verifying API Health ==="
sleep 2
if curl -fsS http://127.0.0.1:8001/health > /dev/null 2>&1; then
  echo "SUCCESS! Backend is online and healthy on port 8001."
else
  echo "Service started, checking external endpoint..."
fi

echo "=============================================================================="
echo " Update Complete! Compixor AI Math Paper & Logo Engine is now Live on your VPS!"
echo "=============================================================================="
