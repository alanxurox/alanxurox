#!/bin/bash
# Mac→VPC Learning Sync (with timeout to prevent hang)
VPC_HOST="vpc-worker"
EXTRACT_DIR="$HOME/.claude/extracts"

# Use timeout to prevent blocking (5 second max)
if command -v gtimeout &>/dev/null; then
    gtimeout 5 rsync -az "$EXTRACT_DIR/" "$VPC_HOST:~/mac-extracts/" 2>/dev/null || true
elif command -v timeout &>/dev/null; then
    timeout 5 rsync -az "$EXTRACT_DIR/" "$VPC_HOST:~/mac-extracts/" 2>/dev/null || true
else
    rsync -az --timeout=5 "$EXTRACT_DIR/" "$VPC_HOST:~/mac-extracts/" 2>/dev/null || true
fi

echo "[$(date)] Mac→VPC sync" >> "$HOME/.claude/hooks/mac-to-vpc-sync.log"
echo '{"continue": true}'
