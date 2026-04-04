#!/bin/bash
echo "============================================"
echo "   PPTX Creator — Restarting"
echo "============================================"
echo ""

docker-compose down
echo ""
echo "Rebuilding..."
docker-compose up -d --build

echo ""
echo "============================================"
echo "Restart complete."
echo "Logs will resume in the start.sh window."
echo "============================================"
sleep 3
