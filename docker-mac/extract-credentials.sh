#!/bin/bash
# Extract Claude Code OAuth credentials from macOS Keychain
# and write them to ~/.claude/.credentials.json for the Docker container.
#
# On macOS, Claude CLI stores tokens in the Keychain under
# service "Claude Code-credentials". On Linux (Docker), it reads
# from ~/.claude/.credentials.json instead. This script bridges the gap.

set -e

CRED_DIR="$HOME/.claude"
CRED_FILE="$CRED_DIR/.credentials.json"

# Ensure directory exists
mkdir -p "$CRED_DIR"

# Get current macOS username
MAC_USER="$(whoami)"

# Extract credentials from macOS Keychain
CRED_JSON=$(security find-generic-password -s "Claude Code-credentials" -a "$MAC_USER" -w 2>/dev/null) || {
  echo "[credentials] WARNING: Could not read Claude Code credentials from macOS Keychain."
  echo "[credentials] Please log in to Claude Code CLI on your Mac first: claude login"
  # Check if credentials file already exists (e.g. from previous extraction)
  if [ -f "$CRED_FILE" ]; then
    echo "[credentials] Using existing credentials file."
  fi
  exit 0
}

if [ -z "$CRED_JSON" ]; then
  echo "[credentials] WARNING: Keychain entry is empty. Please run: claude login"
  exit 0
fi

# Write to ~/.claude/.credentials.json (mounted into Docker container)
echo "$CRED_JSON" > "$CRED_FILE"
chmod 600 "$CRED_FILE"

echo "[credentials] OAuth token extracted from macOS Keychain -> $CRED_FILE"
