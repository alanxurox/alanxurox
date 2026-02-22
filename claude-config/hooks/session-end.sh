#!/bin/bash

# Session persistence hook for Claude Code
# Registered under SessionEnd (session termination)
# Writes session summary to claude-mem SQLite database as primary store

set -euo pipefail

# Read JSON input from stdin
input=$(cat)

# Parse input using jq
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty')
session_id=$(echo "$input" | jq -r '.session_id // empty')
hook_event=$(echo "$input" | jq -r '.hook_event_name // "Stop"')

# Validate inputs
if [[ -z "$transcript_path" || -z "$session_id" ]]; then
    echo '{"continue": true}'
    exit 0
fi

# Check if transcript exists
if [[ ! -f "$transcript_path" ]]; then
    echo '{"continue": true}'
    exit 0
fi

# Size guard: skip processing for transcripts > 50MB (prevents timeout)
transcript_size=$(stat -f%z "$transcript_path" 2>/dev/null || stat -c%s "$transcript_path" 2>/dev/null || echo "0")
if [[ "$transcript_size" -gt 52428800 ]]; then
    echo '{"continue": true}'
    exit 0
fi

# Single jq pass to extract session data
combined=$(jq -rc '
    if .type == "user" then
        {k: "user", v: (
            .message.content |
            if type == "array" then [.[] | select(.type == "text") | .text] | join(" ")
            else . // "" end
        )}
    elif .type == "assistant" then
        (
            (.message.content // []) |
            if type == "array" then
                (.[] |
                    if .type == "tool_use" and .name == "Skill" then {k: "skill", v: (.input.skill // empty)}
                    elif .type == "tool_use" and .name == "Read" then {k: "file_read", v: (.input.file_path // empty)}
                    elif .type == "tool_use" and (.name == "Edit" or .name == "Write") then {k: "file_edit", v: (.input.file_path // empty)}
                    elif .type == "text" then {k: "text", v: .text}
                    else empty end
                )
            else empty end
        )
    else empty end
' "$transcript_path" 2>/dev/null)

# Skip sessions with no user messages (Happy bootstrap, queue-only, snapshot-only transcripts)
if [[ -z "$combined" ]]; then
    echo '{"continue": true}'
    exit 0
fi

# Parse combined output (|| true guards against grep exit 1 on no match with pipefail)
topic=$(echo "$combined" | jq -r 'select(.k == "user") | .v' 2>/dev/null | { grep -v '^\s*$' || true; } | { grep -v '^/' || true; } | head -1 | cut -c1-200)
skills=$(echo "$combined" | jq -r 'select(.k == "skill") | .v' 2>/dev/null | sort -u | head -5 | tr '\n' ',' | sed 's/,$//')
files_read=$(echo "$combined" | jq -r 'select(.k == "file_read") | .v' 2>/dev/null | sort -u | sed "s|$HOME|~|g" | head -10 | tr '\n' ',' | sed 's/,$//')
files_edited=$(echo "$combined" | jq -r 'select(.k == "file_edit") | .v' 2>/dev/null | sort -u | sed "s|$HOME|~|g" | head -10 | tr '\n' ',' | sed 's/,$//')
actions=$(echo "$combined" | jq -r 'select(.k == "text") | .v' 2>/dev/null | \
    { grep -iE "(fixed|applied|created|deleted|moved|added|removed|changed|updated|implemented|wired)" || true; } | \
    head -5 | head -c 500)

# Get project directory (current working directory or from transcript)
project_dir=$(pwd)

# Prepare SQLite values
now=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
now_epoch=$(date +%s)
request="${topic:-Session continuation}"
notes="Skills: ${skills:-none}
Actions: ${actions:-none}"

# Escape single quotes for SQLite
request_escaped="${request//\'/\'\'}"
files_read_escaped="${files_read//\'/\'\'}"
files_edited_escaped="${files_edited//\'/\'\'}"
notes_escaped="${notes//\'/\'\'}"
project_escaped="${project_dir//\'/\'\'}"

# Insert into claude-mem SQLite database
sqlite3 "$HOME/.claude-mem/claude-mem.db" \
    "PRAGMA trusted_schema=ON; INSERT OR IGNORE INTO session_summaries (memory_session_id, project, request, investigated, learned, completed, next_steps, files_read, files_edited, notes, prompt_number, created_at, created_at_epoch) VALUES ('$session_id', '$project_escaped', '$request_escaped', '', '', '', '', '$files_read_escaped', '$files_edited_escaped', '$notes_escaped', 0, '$now', $now_epoch);" \
    2>/dev/null || {
    echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ'): SQLite insert failed for session $session_id" >> "$HOME/.claude/logs/session-end-errors.log"
    true  # don't let this fail the script
}

# Generate HTML session report (background)
echo "$input" | "$HOME/.claude/hooks/generate-session-report.sh" 2>/dev/null &

# Persist session summary to VPC worker memory (shareable across all sessions) - BACKGROUND
(
    VPC_HOST="vpc-worker"
    today=$(date '+%Y-%m-%d')
    msg_count=$(echo "$combined" | wc -l | tr -d ' ')

    # Build memory entry
    memory_entry="## Session $(date '+%H:%M') — ${topic:-unknown}
- **Session ID:** ${session_id:0:12}
- **Messages:** $msg_count
- **Skills:** ${skills:-none}
- **Files Read:** ${files_read:-none}
- **Files Edited:** ${files_edited:-none}
${actions:+
### Actions
$actions}
"

    # Deduplicate on VPC: buffer each session block, skip blocks containing this session_id
    ssh_cmd="
        mkdir -p ~/memory
        flock ~/memory/.lock bash -c '
            memory_file=~/memory/${today}.md
            tmp_file=~/memory/.${today}.tmp
            new_entry=\$(cat)

            # If file exists, remove all blocks matching this session_id
            if [[ -f \"\$memory_file\" ]]; then
                awk -v sid=\"${session_id:0:12}\" '\"'\"'
                    /^## Session/ {
                        if (buf != \"\" && !skip) printf \"%s\", buf
                        buf = \$0 ORS; skip = 0; next
                    }
                    { if (\$0 ~ sid) skip = 1; buf = buf \$0 ORS }
                    END { if (buf != \"\" && !skip) printf \"%s\", buf }
                '\"'\"' \"\$memory_file\" > \"\$tmp_file\"
                mv \"\$tmp_file\" \"\$memory_file\"
            fi

            # Append new entry
            echo \"\$new_entry\" >> \"\$memory_file\"
        '
    "

    if echo "$memory_entry" | ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPC_HOST" "$ssh_cmd" 2>/dev/null; then
        : # success
    else
        # VPC unreachable — queue locally for later sync
        mkdir -p "$HOME/.claude/memory/unsent"
        echo "$memory_entry" >> "$HOME/.claude/memory/unsent/${today}.md"
        echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ'): VPC write failed, queued locally" >> "$HOME/.claude/logs/vpc-sync-errors.log"
    fi
) &

# Return continue signal
echo '{"continue": true}'
