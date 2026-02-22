#!/bin/bash
# jira-gate.sh — PreToolUse hook for sdlc-jira write operations
# Prints a human-readable summary of the Jira action about to execute.
# Exit 0 = allow (default mode still prompts for approval).

INPUT=$(cat)
TOOL_NAME="$CLAUDE_TOOL_NAME"

# Extract key fields from tool input JSON
issue_key=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('issue_key','') or d.get('issue_keys',''))" 2>/dev/null)
summary=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('summary','') or d.get('comment','')[:80] if d.get('comment') else '')" 2>/dev/null)

# Map tool to action verb
case "$TOOL_NAME" in
  *create_issue)    action="CREATE" ;;
  *update_issue)    action="UPDATE" ;;
  *add_comment)     action="COMMENT" ;;
  *bulk_update*)    action="BULK UPDATE" ;;
  *add_labels)      action="ADD LABELS" ;;
  *)                action="WRITE" ;;
esac

echo "[JIRA $action] ${issue_key:-(new)} ${summary:+— $summary}"
exit 0
