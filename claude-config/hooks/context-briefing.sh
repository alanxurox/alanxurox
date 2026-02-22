#!/bin/bash
# context-briefing.sh — Generates comprehensive context briefing from all sources
# Run manually: ~/.claude/hooks/context-briefing.sh
# Output: ~/.claude/context-briefing.md (consumable by any new session)
#
# Sources:
#   1. ALAN-CONTEXT.md (strategic PCB)
#   2. All learnings files (decisions, patterns, research)
#   3. Memory index + graph (structured knowledge)
#   4. Cursor rules (.mdc files)
#   5. Skills catalog (28 skills)
#   6. Hooks status
#   7. Recent extracts (last 3)
#   8. Plans
#   9. VPC Clawdbot memory (SSH pull)
#  10. claude-mem observations (SQLite)

set -euo pipefail

VPC_HOST="vpc-worker"
SSH_OPTS="-o ConnectTimeout=10 -o ServerAliveInterval=5 -o ServerAliveCountMax=2"
LOG="$HOME/.claude/logs/context-briefing.log"
mkdir -p "$(dirname "$LOG")"

OUT="$HOME/.claude/context-briefing.md"
LEARNINGS="$HOME/.claude/memory/learnings"
EXTRACTS="$HOME/.claude/extracts"
SKILLS="$HOME/.claude/skills"
AGENTS="$HOME/.claude/agents"
HOOKS="$HOME/.claude/hooks"
PCB="$HOME/Desktop/ALAN-CONTEXT.md"
PLANS="$HOME/.claude/plans"
CURSOR_RULES="$HOME/.cursor/rules"
MEM_INDEX="$HOME/.claude/memory/index.json"
MEM_GRAPH="$HOME/.claude/memory/graph.json"

timestamp=$(date '+%Y-%m-%d %H:%M')

# Atomic write: build in temp, then mv
TMP_OUT=$(mktemp "${OUT}.XXXXXX")
trap 'rm -f "$TMP_OUT"' EXIT INT TERM

cat > "$TMP_OUT" << EOF
# Comprehensive Context Briefing
**Generated:** $timestamp
**Source:** context-briefing.sh (manual import of all accumulated context)

---

EOF

# --- 1. Strategic PCB ---
if [ -f "$PCB" ]; then
    echo "## 1. Strategic Context (ALAN-CONTEXT.md)" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    # Extract key sections only (not the full 37KB)
    # Get everything up to "## Archived" or first 200 lines
    head -200 "$PCB" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    echo "*(Truncated — full file at ~/Desktop/ALAN-CONTEXT.md)*" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    echo "---" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
fi

# --- 2. All Learnings (consolidated) ---
echo "## 2. Session Learnings (All Sessions)" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

if [ -d "$LEARNINGS" ]; then
    # Sort by date, newest first (safe glob — no word-splitting)
    for f in "$LEARNINGS"/*.md; do
        [ -f "$f" ] || continue
        basename_f=$(basename "$f")
        size=$(wc -c < "$f" | tr -d ' ')
        # Skip empty files
        if [ "$size" -lt 10 ]; then continue; fi

        echo "### $basename_f" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"

        # For large files, extract key sections only
        if [ "$size" -gt 5000 ]; then
            # Extract headers and first line after each
            grep -E '^#{1,4} |^- \*\*|^\| ' "$f" | head -50 >> "$TMP_OUT"
            echo "" >> "$TMP_OUT"
            echo "*(${size} bytes — key sections shown)*" >> "$TMP_OUT"
        else
            cat "$f" >> "$TMP_OUT"
        fi
        echo "" >> "$TMP_OUT"
        echo "---" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
    done
fi

# --- 3. Memory Graph ---
if [ -f "$MEM_INDEX" ] && [ -f "$MEM_GRAPH" ]; then
    echo "## 3. Structured Memory (Index + Graph)" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    echo "### Memory Index" >> "$TMP_OUT"
    echo '```json' >> "$TMP_OUT"
    cat "$MEM_INDEX" >> "$TMP_OUT"
    echo '```' >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    echo "### Memory Graph" >> "$TMP_OUT"
    echo '```json' >> "$TMP_OUT"
    cat "$MEM_GRAPH" >> "$TMP_OUT"
    echo '```' >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    echo "---" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
fi

# --- 4. Cursor Rules ---
if [ -d "$CURSOR_RULES" ]; then
    echo "## 4. Cursor Rules" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    for f in "$CURSOR_RULES"/*.mdc; do
        [ -f "$f" ] || continue
        echo "### $(basename "$f")" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
        cat "$f" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
    done
    echo "---" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
fi

# --- 5. Skills Catalog ---
echo "## 5. Skills Catalog ($( ls -d "$SKILLS"/*/ 2>/dev/null | wc -l | tr -d ' ') skills)" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
echo "| Skill | Has SKILL.md | Size |" >> "$TMP_OUT"
echo "|-------|-------------|------|" >> "$TMP_OUT"
for d in "$SKILLS"/*/; do
    [ -d "$d" ] || continue
    name=$(basename "$d")
    if [ -f "$d/SKILL.md" ]; then
        size=$(wc -l < "$d/SKILL.md" | tr -d ' ')
        echo "| $name | Yes | ${size} lines |" >> "$TMP_OUT"
    else
        echo "| $name | No | - |" >> "$TMP_OUT"
    fi
done
echo "" >> "$TMP_OUT"
echo "---" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

# --- 6. Agents ---
echo "## 6. Installed Agents" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
if [ -d "$AGENTS" ]; then
    for f in "$AGENTS"/*.md; do
        [ -f "$f" ] || continue
        name=$(basename "$f" .md)
        desc=$(head -5 "$f" | grep -i 'description\|expert\|special' | head -1 || echo "")
        echo "- **$name**: $desc" >> "$TMP_OUT"
    done
fi
echo "" >> "$TMP_OUT"
echo "---" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

# --- 7. Hooks Status ---
echo "## 7. Active Hooks" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
echo "| Script | Size | Executable |" >> "$TMP_OUT"
echo "|--------|------|-----------|" >> "$TMP_OUT"
for f in "$HOOKS"/*.sh; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    size=$(wc -l < "$f" | tr -d ' ')
    if [ -x "$f" ]; then exec_status="Yes"; else exec_status="No"; fi
    echo "| $name | ${size} lines | $exec_status |" >> "$TMP_OUT"
done
echo "" >> "$TMP_OUT"
echo "---" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

# --- 8. Recent Extracts (last 3) ---
echo "## 8. Recent Session Extracts (last 3)" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
if [ -d "$EXTRACTS" ]; then
    for f in "$EXTRACTS"/extract-*.md; do
        [ -f "$f" ] || continue
        # Only last 3 (counter-based since glob is sorted)
        extract_i=$((${extract_i:-0} + 1)); [ "$extract_i" -gt 3 ] && break
        echo "### $(basename "$f")" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
        # First 40 lines of each
        head -40 "$f" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
        echo "*(truncated)*" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
    done
fi
echo "---" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

# --- 9. Plans ---
if [ -d "$PLANS" ]; then
    plan_count=$(ls "$PLANS"/*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$plan_count" -gt 0 ]; then
        echo "## 9. Active Plans" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
        for f in "$PLANS"/*.md; do
            [ -f "$f" ] || continue
            echo "### $(basename "$f")" >> "$TMP_OUT"
            echo "" >> "$TMP_OUT"
            head -30 "$f" >> "$TMP_OUT"
            echo "" >> "$TMP_OUT"
            echo "*(truncated)*" >> "$TMP_OUT"
            echo "" >> "$TMP_OUT"
        done
        echo "---" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
    fi
fi

# --- 10. Desktop Plans ---
desktop_plans=$(ls "$HOME/Desktop"/crowdsourcing-plan-*.md 2>/dev/null || true)
if [ -n "$desktop_plans" ]; then
    echo "## 10. Desktop Plans" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    for f in $desktop_plans; do
        echo "### $(basename "$f")" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
        head -40 "$f" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
        echo "*(truncated)*" >> "$TMP_OUT"
        echo "" >> "$TMP_OUT"
    done
    echo "---" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
fi

# --- 11. VPC Clawdbot Memory ---
echo "## 11. VPC Clawdbot Memory" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
vpc_memory=$(ssh $SSH_OPTS "$VPC_HOST" 'bash --norc -c "for f in ~/memory/*.md; do [ -f \"\$f\" ] && echo \"### \$(basename \"\$f\")\" && echo && cat \"\$f\" && echo && echo \"---\" && echo; done"' 2>>"$LOG" || echo "*(VPC unreachable — skipped)*")
echo "$vpc_memory" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

# --- 12. claude-mem Observations ---
CLAUDE_MEM_DB="$HOME/.claude-mem/claude-mem.db"
if [ -f "$CLAUDE_MEM_DB" ]; then
    echo "## 12. claude-mem Observations" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    obs_count=$(sqlite3 "$CLAUDE_MEM_DB" "SELECT COUNT(*) FROM observations;" 2>/dev/null || echo "0")
    prompt_count=$(sqlite3 "$CLAUDE_MEM_DB" "SELECT COUNT(*) FROM user_prompts;" 2>/dev/null || echo "0")
    session_count=$(sqlite3 "$CLAUDE_MEM_DB" "SELECT COUNT(*) FROM sdk_sessions;" 2>/dev/null || echo "0")
    echo "**Stats:** $obs_count observations, $prompt_count user prompts, $session_count sessions" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    echo "### Observations (all)" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
    sqlite3 -separator '|' "$CLAUDE_MEM_DB" \
        "SELECT id, title, type, narrative, created_at FROM observations ORDER BY created_at_epoch DESC;" 2>/dev/null | \
        while IFS='|' read -r id title type narrative created_at; do
            echo "- **[$type]** $title — $narrative *(${created_at})*" >> "$TMP_OUT"
        done
    echo "" >> "$TMP_OUT"
    echo "---" >> "$TMP_OUT"
    echo "" >> "$TMP_OUT"
fi

# --- 13. Claude.ai Desktop ---
echo "## 13. Claude.ai Desktop" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
echo "Conversations stored server-side on claude.ai — not extractable locally." >> "$TMP_OUT"
echo "App data at ~/Library/Application Support/Claude/ contains only browser state." >> "$TMP_OUT"
echo "To import: use claude.ai export feature or API if available." >> "$TMP_OUT"
echo "" >> "$TMP_OUT"
echo "---" >> "$TMP_OUT"
echo "" >> "$TMP_OUT"

# --- Summary stats ---
learnings_count=$(ls "$LEARNINGS"/*.md 2>/dev/null | wc -l | tr -d ' ')
extract_count=$(ls "$EXTRACTS"/extract-*.md 2>/dev/null | wc -l | tr -d ' ')
skill_count=$(ls -d "$SKILLS"/*/ 2>/dev/null | wc -l | tr -d ' ')
agent_count=$(ls "$AGENTS"/*.md 2>/dev/null | wc -l | tr -d ' ')
hook_count=$(ls "$HOOKS"/*.sh 2>/dev/null | wc -l | tr -d ' ')
pcb_size=$(wc -c < "$PCB" 2>/dev/null | tr -d ' ' || echo "0")
briefing_size=$(wc -c < "$TMP_OUT" | tr -d ' ')

cat >> "$TMP_OUT" << EOF
## Stats

| Source | Count | Notes |
|--------|-------|-------|
| Learnings | $learnings_count files | Jan 27-29, 2026 |
| Extracts | $extract_count files | Pre-compact snapshots |
| Skills | $skill_count | Canonical in meta-orchestrator |
| Agents | $agent_count | Installed from awesome-claude-code-subagents |
| Hooks | $hook_count scripts | 3 active (start, end, pre-compact) |
| PCB | ${pcb_size} bytes | ~/Desktop/ALAN-CONTEXT.md |
| VPC Memory | 3 files | Clawdbot memory (Jan 27-29) |
| claude-mem | 4 observations | SQLite DB (3MB) |
| claude.ai | N/A | Server-side only |
| **This briefing** | **${briefing_size} bytes** | **Generated $timestamp** |

---
*Generated by ~/.claude/hooks/context-briefing.sh*
EOF

# Atomic replace
mv "$TMP_OUT" "$OUT"
trap - EXIT INT TERM

echo "Context briefing generated: $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)" >&2
echo "$OUT"
