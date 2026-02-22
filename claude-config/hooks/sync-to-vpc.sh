#!/bin/bash
# Sync observations to VPC after Mac session
# Called from Stop hook - NO CRON
#
# SECURITY: This script ONLY syncs claude-mem observations (structured data).
# It does NOT sync:
# - ~/Desktop/ALAN-CONTEXT.md (may contain corporate context)
# - ~/private/ (contains personal/sensitive data, NEVER syncs)
# - Any files from ~/Desktop or ~/ directories

VPC_HOST="vpc-worker"
WORKER_PORT=37777

# Run entire sync in background to avoid blocking session close
(
    # Check if VPC worker is reachable
    if ! ssh -o ConnectTimeout=2 -o BatchMode=yes "$VPC_HOST" "curl -s http://127.0.0.1:$WORKER_PORT/health" >/dev/null 2>&1; then
        exit 0  # VPC not reachable or worker not running, skip silently
    fi

    # Export recent observations and send to VPC
    if [[ -f ~/.claude-mem/claude-mem.db ]]; then
        sqlite3 ~/.claude-mem/claude-mem.db "SELECT json_object(
            'type', type,
            'title', title,
            'subtitle', subtitle,
            'narrative', narrative,
            'concepts', concepts,
            'created_at', created_at,
            'source', 'mac-sync'
        ) FROM observations WHERE created_at > datetime('now', '-1 hour')" 2>/dev/null | while read -r obs; do
            [[ -n "$obs" ]] && ssh "$VPC_HOST" "curl -s -X POST http://127.0.0.1:$WORKER_PORT/api/import -H 'Content-Type: application/json' -d '$obs'" 2>/dev/null
        done
    fi
) &
