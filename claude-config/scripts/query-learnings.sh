#!/bin/bash
# Query learnings by keyword or type
# Usage: query-learnings.sh [keyword|type] [search_term]
#   query-learnings.sh keyword "memory"
#   query-learnings.sh type "DECISION"
#   query-learnings.sh recent 5

MEMORY_DIR="$HOME/.claude/memory/realtime"
ARCHIVE_DIR="$HOME/.claude/memory/archived"
PCB_FILE="$HOME/Desktop/ALAN-CONTEXT.md"

MODE="${1:-recent}"
SEARCH="${2:-5}"

case "$MODE" in
    keyword|k)
        # Search by keyword in content or keywords array
        find "$MEMORY_DIR" "$ARCHIVE_DIR" -name "*.json" 2>/dev/null | while read f; do
            if jq -e ".content | test(\"$SEARCH\"; \"i\") or (.keywords // []) | any(test(\"$SEARCH\"; \"i\"))" "$f" 2>/dev/null | grep -q true; then
                jq -r '"\(.type) [\(.timestamp | split("T")[0])]: \(.content)"' "$f" 2>/dev/null
            fi
        done | head -10
        ;;
    type|t)
        # Search by type (DECISION, INSIGHT, ACTION, FACT)
        find "$MEMORY_DIR" "$ARCHIVE_DIR" -name "*-${SEARCH}.json" 2>/dev/null | while read f; do
            jq -r '"\(.type) [\(.timestamp | split("T")[0])]: \(.content)"' "$f" 2>/dev/null
        done | tail -10
        ;;
    recent|r)
        # Get N most recent learnings
        ls -t "$MEMORY_DIR"/*.json 2>/dev/null | head -"$SEARCH" | while read f; do
            jq -r '"\(.type) [\(.timestamp | split("T")[0])]: \(.content)"' "$f" 2>/dev/null
        done
        ;;
    pcb)
        # Search PCB for pattern
        grep -i "$SEARCH" "$PCB_FILE" | head -10
        ;;
    *)
        echo "Usage: query-learnings.sh [keyword|type|recent|pcb] [search_term]"
        ;;
esac
