#!/bin/bash
echo "============================================"
echo "   PPTX Creator — Restarting"
echo "============================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

docker-compose down
echo ""

# Extract Claude OAuth credentials from macOS Keychain
"$SCRIPT_DIR/extract-credentials.sh"

echo "Rebuilding..."
docker-compose up -d --build

echo ""
echo "============================================"
echo "Restart complete."
echo "Logs will resume in the start.sh window."
echo "============================================"
sleep 3
