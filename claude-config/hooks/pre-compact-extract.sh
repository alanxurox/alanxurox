#!/bin/bash
# Pre-compact hook: Extract valuable context before compaction
# V5: Removed dead dedup guard and broken people extraction

EXTRACT_DIR="$HOME/.claude/extracts"
EXTRACT_LOG="$HOME/.claude/hooks/last-extract.log"

mkdir -p "$EXTRACT_DIR"

# Read hook input from stdin
INPUT=$(cat)

# Get transcript path from hook input
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
    echo '{"continue": true}'
    exit 0
fi

TIMESTAMP=$(date "+%Y-%m-%d_%H%M%S")
EXTRACT_FILE="$EXTRACT_DIR/extract-$TIMESTAMP.md"

# GUARDRAIL: Atomic flock + 60-second cooldown (prevents concurrent extracts)
LOCKFILE="$EXTRACT_DIR/.extract.lock"
TIMEFILE="$EXTRACT_DIR/.last-extract-time"
exec 200>"$LOCKFILE"
if ! flock -n 200; then
    echo "Another extract in progress, skipping" >> "$EXTRACT_LOG"
    echo '{"continue": true}'
    exit 0
fi
if [ -f "$TIMEFILE" ]; then
    last_time=$(cat "$TIMEFILE" 2>/dev/null || echo 0)
    now=$(date +%s)
    if [ $((now - last_time)) -lt 60 ]; then
        echo "Cooldown active ($(( now - last_time ))s since last extract), skipping" >> "$EXTRACT_LOG"
        echo '{"continue": true}'
        exit 0
    fi
fi
date +%s > "$TIMEFILE"

# Extract user messages (last 50)
USER_MESSAGES=$(cat "$TRANSCRIPT_PATH" | \
    jq -r 'select(.type == "user") | .message.content | select(type == "string")' 2>/dev/null | \
    grep -v '^$' | \
    tail -50)

# Extract assistant text content with key patterns
ASSISTANT_CONTEXT=$(cat "$TRANSCRIPT_PATH" | \
    jq -r 'select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text // empty' 2>/dev/null | \
    grep -iE "should|recommend|suggest|important|decision|plan|next|action|talk|reach|contact|update|create|build|consider|note that|key point|insight|learn|realize|conclude|summary" | \
    tail -30)

# Create extract file
cat > "$EXTRACT_FILE" << EOF
# Session Extract: $TIMESTAMP
Session ID: $SESSION_ID

## Recent User Messages (Last 50)
$USER_MESSAGES

## Key Context (Patterns: should, recommend, plan, decision, etc.)
$ASSISTANT_CONTEXT

---
*Auto-extracted before compaction*
EOF

# Cleanup: delete extracts older than 14 days
find "$EXTRACT_DIR" -name "extract-*.md" -mtime +14 -delete 2>/dev/null

if [ -n "$USER_MESSAGES" ] || [ -n "$ASSISTANT_CONTEXT" ]; then
    echo "Extracted to $EXTRACT_FILE" >> "$EXTRACT_LOG"
else
    echo "No meaningful content to extract at $TIMESTAMP" >> "$EXTRACT_LOG"
fi

echo '{"continue": true, "additionalContext": "Session context extracted before compaction"}'
exit 0
