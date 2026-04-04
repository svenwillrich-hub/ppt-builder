#!/bin/sh
set -e

# Fix permissions on mounted credential files
if [ -d /home/appuser/.claude ]; then
  chmod -R a+rw /home/appuser/.claude/ 2>/dev/null || true
fi
if [ -f /home/appuser/.claude.json ]; then
  chmod a+rw /home/appuser/.claude.json 2>/dev/null || true
fi

# Pre-create session-env and other dirs Claude Code needs
mkdir -p /home/appuser/.claude/session-env 2>/dev/null || true
mkdir -p /home/appuser/.claude/shell-snapshots 2>/dev/null || true
mkdir -p /home/appuser/.claude/statsig 2>/dev/null || true
mkdir -p /home/appuser/.claude/todos 2>/dev/null || true
chown -R appuser:appuser /home/appuser/.claude/session-env 2>/dev/null || true
chown -R appuser:appuser /home/appuser/.claude/shell-snapshots 2>/dev/null || true
chown -R appuser:appuser /home/appuser/.claude/statsig 2>/dev/null || true
chown -R appuser:appuser /home/appuser/.claude/todos 2>/dev/null || true

# Fix output/upload/preview dirs
chmod -R a+rw /app/outputs /app/uploads /app/config /app/previews 2>/dev/null || true
chown -R appuser:appuser /app/outputs /app/uploads /app/config /app/previews 2>/dev/null || true

# Ensure /tmp is writable for prompt temp files
chmod 1777 /tmp 2>/dev/null || true

echo "[entrypoint] Permissions fixed, starting server as appuser"

# Drop to appuser
exec su -s /bin/sh appuser -c "node /app/server.js"
