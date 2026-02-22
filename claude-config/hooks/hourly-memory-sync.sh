#!/bin/bash
# Hourly sync of PCB JSONL to VPC Clawdbot memory
# Created 2026-01-28 based on session continuity research

PCB_DIR="$HOME/.claude/pcb"
VPC_HOST="vpc-worker"
VPC_PCB_DIR="~/claude-pcb"
LOG_FILE="$HOME/.claude/hooks/memory-sync.log"

# Ensure PCB directory exists
if [ ! -d "$PCB_DIR" ]; then
    echo "[$(date)] No PCB directory found at $PCB_DIR" >> "$LOG_FILE"
    exit 0
fi

# Count JSONL files
JSONL_COUNT=$(find "$PCB_DIR" -name "*.jsonl" -type f | wc -l)
if [ "$JSONL_COUNT" -eq 0 ]; then
    echo "[$(date)] No JSONL files to sync" >> "$LOG_FILE"
    exit 0
fi

# Sync to VPC
echo "[$(date)] Syncing $JSONL_COUNT JSONL files to VPC..." >> "$LOG_FILE"
rsync -avz "$PCB_DIR/*.jsonl" "$VPC_HOST:$VPC_PCB_DIR/" 2>&1 >> "$LOG_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Sync successful" >> "$LOG_FILE"

    # Index on VPC (if worker memory command exists)
    ssh "$VPC_HOST" "command -v claude-mem && claude-mem index $VPC_PCB_DIR/*.jsonl" 2>&1 >> "$LOG_FILE"
else
    echo "[$(date)] Sync failed" >> "$LOG_FILE"
fi
