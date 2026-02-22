#!/bin/bash

# SessionStart hook for Claude Code
# PRIMARY: Local SQLite (claude-mem) — instant reads
# BACKGROUND: VPC sync (non-blocking replica sync)
# Injects: ALAN-CONTEXT.md sections + recent observations + session summaries + today's learnings

set -euo pipefail

CONTEXT_FILE="$HOME/Desktop/ALAN-CONTEXT.md"
CLAUDE_MEM_DB="$HOME/.claude-mem/claude-mem.db"

# Consume stdin (required by hook protocol)
cat > /dev/null

# === PRIMARY SOURCE: Local SQLite (instant) ===
local_memory=""
if [[ -f "$CLAUDE_MEM_DB" ]]; then
  # Query recent observations (last 20)
  observations=$(sqlite3 "$CLAUDE_MEM_DB" \
    "SELECT datetime(created_at, 'localtime') || ' | ' || title || COALESCE(': ' || subtitle, '') || char(10) || narrative
     FROM observations
     ORDER BY created_at DESC
     LIMIT 20" 2>/dev/null | head -100) || observations=""

  # Query recent session summaries (last 5)
  summaries=$(sqlite3 "$CLAUDE_MEM_DB" \
    "SELECT datetime(created_at, 'localtime') || ' | ' || COALESCE(request, '') || char(10) || COALESCE(completed, '') || char(10) || COALESCE(learned, '')
     FROM session_summaries
     ORDER BY created_at_epoch DESC
     LIMIT 5" 2>/dev/null | head -60) || summaries=""

  if [[ -n "$observations" ]]; then
    local_memory+="**Recent Observations:**\n${observations}\n\n"
  fi

  if [[ -n "$summaries" ]]; then
    local_memory+="**Recent Session Summaries:**\n${summaries}\n\n"
  fi
fi

# === BACKGROUND: VPC sync + unsent queue (non-blocking) ===
{
  # VPC memory pull (non-blocking)
  vpc_memory=$(ssh -o ConnectTimeout=5 -o BatchMode=yes vpc-worker \
    "today=\$(date '+%Y-%m-%d'); yesterday=\$(date -d '1 day ago' '+%Y-%m-%d' 2>/dev/null || date -v-1d '+%Y-%m-%d'); \
     for f in ~/memory/\$today.md ~/memory/\$yesterday.md; do \
       [ -f \"\$f\" ] && tail -40 \"\$f\"; \
     done" 2>/dev/null | head -60) || true

  # Retry unsent memory queue (if VPC online)
  if [[ -n "$vpc_memory" ]]; then
    unsent_dir="$HOME/.claude/memory/unsent"
    if [[ -d "$unsent_dir" ]] && ls "$unsent_dir"/*.md &>/dev/null 2>&1; then
      for qf in "$unsent_dir"/*.md; do
        day=$(basename "$qf" .md)
        if ssh -o ConnectTimeout=5 -o BatchMode=yes vpc-worker \
          "mkdir -p ~/memory && flock ~/memory/.lock -c 'cat >> ~/memory/${day}.md'" < "$qf" 2>/dev/null; then
          rm -f "$qf"
        fi
      done
    fi
  fi
} &

# === ALAN-CONTEXT.md Section Extraction ===
extract_section() {
  local section_name="$1"
  awk -v section="$section_name" '
    /^## / {
      if (found) exit
      if ($0 ~ section) {
        found=1
        next
      }
    }
    found { print }
  ' "$CONTEXT_FILE" | sed '/^$/d' | head -n 40
}

current_focus=""
project_state=""
open_questions=""

if [[ -f "$CONTEXT_FILE" ]]; then
  current_focus=$(extract_section "Current Focus")
  project_state=$(extract_section "Active Project State")
  open_questions=$(extract_section "Open Questions")
fi

# === Build Context Summary ===
summary=""

if [[ -n "$current_focus" ]]; then
  summary+="**Current Focus:**\n${current_focus}\n\n"
fi

if [[ -n "$project_state" ]]; then
  summary+="**Active Project State:**\n${project_state}\n\n"
fi

if [[ -n "$open_questions" ]]; then
  summary+="**Open Questions:**\n${open_questions}\n\n"
fi

# Inject local memory (SQLite observations + summaries)
if [[ -n "$local_memory" ]]; then
  summary+="${local_memory}"
fi

# === SELF-EVOLUTION: Inject recent mistake from consolidation loop ===
RECENT_MISTAKE=""
CONSOLIDATION_DIR="$HOME/memory"
latest_consolidation=$(ls -t "$CONSOLIDATION_DIR"/consolidation-*.md 2>/dev/null | head -1) || true
if [[ -n "$latest_consolidation" && -f "$latest_consolidation" ]]; then
  RECENT_MISTAKE=$(grep -A1 "## Mistakes & Fixes" "$latest_consolidation" 2>/dev/null | tail -1 | head -c 200)
  if [[ -n "$RECENT_MISTAKE" && "$RECENT_MISTAKE" != "--" ]]; then
    summary+="**⚠️ Recent Mistake (don't repeat):**\n${RECENT_MISTAKE}\n"
  fi
fi

# Fallback if nothing found
if [[ -z "$summary" ]]; then
  summary="No recent context found."
fi

# Output JSON with additionalContext
jq -n --arg ctx "$summary" '{additionalContext: $ctx}'
