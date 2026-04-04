#!/bin/bash
echo "============================================"
echo "   PPTX Creator — Log Window"
echo "============================================"
echo ""
echo "This window shows live container logs."
echo "Use ./restart.sh to rebuild/restart."
echo "Press Ctrl+C to stop watching logs."
echo ""

while true; do
  echo "Waiting for containers..."
  if ! docker-compose ps --services --filter "status=running" 2>/dev/null | grep -q .; then
    echo "Containers not running. Starting..."
    docker-compose up -d --build
  fi

  echo ""
  echo "============================================"
  echo "Logs streaming — http://localhost:8090"
  echo "============================================"
  echo ""

  docker-compose logs -f

  echo ""
  echo "Log stream interrupted. Reconnecting in 3s..."
  sleep 3
done
