#!/bin/bash
# Extract Claude Code OAuth credentials from macOS Keychain
# and write them to .credentials.json for the Docker container.
#
# On macOS, Claude CLI stores tokens in the Keychain under
# service "Claude Code-credentials". On Linux (Docker), it reads
# from ~/.claude/.credentials.json instead. This script bridges the gap.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CRED_FILE="$PROJECT_DIR/.credentials.json"

# Get current macOS username
MAC_USER="$(whoami)"

# Extract credentials from macOS Keychain
CRED_JSON=$(security find-generic-password -s "Claude Code-credentials" -a "$MAC_USER" -w 2>/dev/null) || {
  echo "[credentials] WARNING: Could not read Claude Code credentials from macOS Keychain."
  echo "[credentials] Please log in to Claude Code CLI on your Mac first: claude login"
  exit 0
}

if [ -z "$CRED_JSON" ]; then
  echo "[credentials] WARNING: Keychain entry is empty. Please run: claude login"
  exit 0
fi

# Write to .credentials.json (used by Docker container)
echo "$CRED_JSON" > "$CRED_FILE"
chmod 600 "$CRED_FILE"

echo "[credentials] OAuth token extracted from macOS Keychain -> .credentials.json"
