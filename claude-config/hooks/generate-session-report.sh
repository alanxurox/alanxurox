#!/bin/bash
# Generate session journal — what actually happened, decisions made, files changed
# Called by session-end.sh: echo "$input" | ./generate-session-report.sh
# Outputs: ~/.claude/reports/{category}_{topic}_{date}_{time}.html

set -eu
# Note: pipefail disabled — jq|head pipelines send SIGPIPE on large transcripts

# --- Config ---
VPC_HOST="vpc-worker"
SSH_OPTS="-o ConnectTimeout=10"
SYNC_LOG="$HOME/.claude/logs/report-sync.log"
mkdir -p "$HOME/.claude/logs"

REPORT_DIR="$HOME/.claude/reports"
LEARNINGS_DIR="$HOME/.claude/memory/learnings"
mkdir -p "$REPORT_DIR"

DATE_SHORT=$(date "+%Y-%m-%d")
TIME_SHORT=$(date "+%H%M")
DATE_DISPLAY=$(date "+%b %d, %Y at %H:%M")

# --- Read hook input ---
input=""
if [ ! -t 0 ]; then
    input=$(cat)
fi

session_id=$(echo "${input:-{}}" | jq -r '.session_id // "manual"' 2>/dev/null || echo "manual")
transcript_path=$(echo "${input:-{}}" | jq -r '.transcript_path // empty' 2>/dev/null || echo "")

# --- Extract session data from transcript ---
session_topic=""
session_topic_display=""
session_msg_count=0
skills_used=""
first_user_msg=""
all_user_msgs=""
category="session"
tools_used=""
files_changed=""
decisions=""
decisions_html=""
user_questions_html=""
files_changed_html=""

if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
    # Message count
    session_msg_count=$(jq -c 'select(.type == "user" or .type == "assistant")' "$transcript_path" 2>/dev/null | wc -l | tr -d ' ')

    # First substantive user message (skip system preambles — they're >500 chars)
    first_user_msg=$(jq -r '
        select(.type == "user") |
        .message.content |
        if type == "array" then
            [.[] | select(.type == "text") | .text] | join(" ")
        else
            . // ""
        end
    ' "$transcript_path" 2>/dev/null | \
        grep -v '^\s*$' | \
        grep -v '^/' | \
        grep -v '^!' | \
        grep -v 'system-reminder' | \
        awk 'length < 500 {print; exit}'| head -c 200)

    # All user messages (for questions section)
    all_user_msgs=$(jq -r '
        select(.type == "user") |
        .message.content |
        if type == "array" then
            [.[] | select(.type == "text") | .text] | join(" ")
        else
            . // ""
        end
    ' "$transcript_path" 2>/dev/null | \
        grep -v '^\s*$' | grep -v '^/' | grep -v '^!' | \
        grep -v 'system-reminder' | \
        awk 'length < 500' | \
        head -c 3000)

    # Skills invoked
    skills_used=$(jq -r '
        select(.type == "assistant") |
        .message.content[]? |
        select(.type == "tool_use" and .name == "Skill") |
        .input.skill // empty
    ' "$transcript_path" 2>/dev/null | sort -u | head -10 | tr '\n' ',' | sed 's/,$//')

    # Tools used (unique tool names)
    tools_used=$(jq -r '
        select(.type == "assistant") |
        .message.content[]? |
        select(.type == "tool_use") |
        .name // empty
    ' "$transcript_path" 2>/dev/null | sort | uniq -c | sort -rn | head -10 | \
        awk '{printf "%s (%s), ", $2, $1}' | sed 's/, $//')

    # Key decisions & actions (from assistant messages containing decision-like language)
    decisions=$(jq -r '
        select(.type == "assistant") |
        .message.content |
        if type == "array" then
            [.[] | select(.type == "text") | .text] | join("\n")
        else
            . // ""
        end
    ' "$transcript_path" 2>/dev/null | \
        grep -iE "(fixed|applied|created|deleted|moved|added|removed|changed|updated|implemented|wired|installed|configured|deployed|wrote|rewrote)" | \
        grep -v '^\s*$' | \
        head -c 200 | head -20 | \
        sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')

    # Files actually written/edited (from tool_use calls)
    files_changed=$(jq -r '
        select(.type == "assistant") |
        .message.content[]? |
        select(.type == "tool_use" and (.name == "Edit" or .name == "Write")) |
        .input.file_path // empty
    ' "$transcript_path" 2>/dev/null | sort -u | sed "s|$HOME|~|g" | head -30)

    # Build topic slug
    if [ -n "$first_user_msg" ]; then
        session_topic=$(echo "$first_user_msg" | \
            sed 's/[^a-zA-Z0-9 ]/ /g' | \
            tr '[:upper:]' '[:lower:]' | \
            tr -s ' ' | \
            sed 's/^ *//;s/ *$//' | \
            cut -d' ' -f1-5 | \
            tr ' ' '-' | \
            head -c 50)
        session_topic_display=$(echo "$first_user_msg" | head -c 80)
        [ -z "$session_topic" ] && session_topic="session"
    fi

    # Category detection
    if echo "$skills_used" | grep -qi "content-dev\|figma-to-html\|asset-extraction"; then
        category="content"
    elif echo "$skills_used" | grep -qi "roundtable\|cto-autonomous\|strategic-research"; then
        category="review"
    elif echo "$skills_used" | grep -qi "frameworks"; then
        category="strategy"
    elif echo "$files_changed" | grep -qi "hooks\|settings"; then
        category="infra"
    elif echo "$files_changed" | grep -qi "skills"; then
        category="skills"
    elif echo "$first_user_msg" | grep -qi "fix\|bug\|error\|broken"; then
        category="fix"
    elif echo "$first_user_msg" | grep -qi "build\|create\|add\|implement"; then
        category="feature"
    elif echo "$first_user_msg" | grep -qi "review\|roundtable\|check"; then
        category="review"
    fi

    # Build HTML for user questions
    if [ -n "$all_user_msgs" ]; then
        user_questions_html=$(echo "$all_user_msgs" | \
            sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g' | \
            while IFS= read -r line; do
                [ -n "$line" ] && echo "<div class=\"msg user\">${line:0:200}</div>"
            done | head -30)
    fi

    # Build HTML for decisions
    if [ -n "$decisions" ]; then
        decisions_html=$(echo "$decisions" | \
            while IFS= read -r line; do
                [ -n "$line" ] && echo "<li>${line:0:200}</li>"
            done)
    fi

    # Build HTML for files changed
    if [ -n "$files_changed" ]; then
        files_changed_html=$(echo "$files_changed" | \
            while IFS= read -r f; do
                [ -n "$f" ] && echo "<tr><td><code>$f</code></td></tr>"
            done)
    fi
fi

[ -z "$session_topic" ] && session_topic="session"
[ -z "$session_topic_display" ] && session_topic_display="Session"

# --- Filename: {category}_{topic}_{date}_{time}.html ---
REPORT_FILE="$REPORT_DIR/${category}_${session_topic}_${DATE_SHORT}_${TIME_SHORT}.html"

# --- Category colors ---
case "$category" in
    content) cat_color="#64dfdf"; cat_label="CONTENT DEV" ;;
    review)  cat_color="#a78bfa"; cat_label="REVIEW" ;;
    strategy) cat_color="#fbbf24"; cat_label="STRATEGY" ;;
    infra)   cat_color="#f4845f"; cat_label="INFRASTRUCTURE" ;;
    skills)  cat_color="#6ee7b7"; cat_label="SKILLS" ;;
    fix)     cat_color="#f87171"; cat_label="FIX" ;;
    feature) cat_color="#64dfdf"; cat_label="FEATURE" ;;
    *)       cat_color="#8b8a90"; cat_label="SESSION" ;;
esac

# --- Today's learnings ---
today=$(date "+%Y-%m-%d")
learnings_file="$LEARNINGS_DIR/${today}-session.md"
learnings_html=""
if [ -f "$learnings_file" ]; then
    if command -v pandoc &>/dev/null; then
        learnings_html=$(pandoc --from markdown-raw_html --to html "$learnings_file" 2>/dev/null || echo "<p>Could not parse learnings</p>")
    fi
fi

# --- Transcript highlights (last 15 exchanges) ---
transcript_items=""
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
    transcript_items=$(jq -r '
        select(.type == "assistant" or .type == "user") |
        (.type) as $t |
        .message.content |
        if type == "array" then
            [.[] | select(.type == "text") | .text] | join(" ")
        else
            . // ""
        end |
        if . != "" then (if $t == "user" then "USER: " + . else "CLAUDE: " + . end) else empty end
    ' "$transcript_path" 2>/dev/null | \
        grep -v '^$' | \
        tail -15 | \
        head -c 6000 | \
        sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g' | \
        while IFS= read -r line; do
            if echo "$line" | grep -q '^USER:'; then
                clean="${line#USER: }"
                echo "<div class=\"msg user\">${clean:0:300}</div>"
            else
                clean="${line#CLAUDE: }"
                echo "<div class=\"msg\">${clean:0:300}</div>"
            fi
        done)
fi

# --- Generate HTML ---
cat > "$REPORT_FILE" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Session Journal</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;500;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0c0c0f;--s:#16161a;--s2:#1e1e24;--b:#2a2a32;--t:#e0dfe4;--td:#8b8a90;--a:#64dfdf;--a2:#f4845f;--a3:#a78bfa;--g:#6ee7b7;--r:#f87171;--y:#fbbf24;--f:'DM Sans',sans-serif;--m:'JetBrains Mono',monospace}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--t);font-family:var(--f);line-height:1.6;min-height:100vh}
.hdr{padding:40px 40px 28px;border-bottom:1px solid var(--b)}
.hdr-top{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px}
.hdr h1{font-size:24px;font-weight:700;letter-spacing:-.5px;margin-top:8px}
.hdr .meta{font-family:var(--m);font-size:11px;color:var(--td);text-align:right}
.cat-badge{display:inline-block;font-family:var(--m);font-size:10px;font-weight:700;padding:3px 10px;border-radius:3px;letter-spacing:1.5px;text-transform:uppercase}
.topic-line{font-size:14px;color:var(--td);margin-top:6px;font-style:italic}
.content{max-width:960px;margin:0 auto;padding:24px 40px}
section{margin-bottom:32px}
.sl{font-family:var(--m);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:var(--a);margin-bottom:14px;display:flex;align-items:center;gap:10px}
.sl::after{content:'';flex:1;height:1px;background:var(--b)}
.stats{display:flex;gap:28px;flex-wrap:wrap;margin-bottom:24px}
.stat{text-align:center}
.stat-v{font-size:28px;font-weight:700;letter-spacing:-1px;line-height:1}
.stat-l{font-family:var(--m);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--td);margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:13px}
td{padding:6px 10px;border-bottom:1px solid var(--s2);vertical-align:top}
tr:last-child td{border-bottom:none}
code{font-family:var(--m);font-size:11px;background:var(--s);padding:2px 6px;border-radius:3px;color:var(--a)}
.msg{font-size:12px;color:var(--td);padding:8px 12px;border-left:2px solid var(--b);margin-bottom:6px;max-height:80px;overflow:hidden;word-break:break-word}
.msg.user{border-left-color:var(--a);color:var(--t);font-weight:500}
.sk{display:inline-block;font-family:var(--m);font-size:10px;padding:3px 8px;border-radius:4px;background:var(--s);border:1px solid var(--b);margin:2px}
ul{margin:8px 0 8px 20px}li{font-size:13px;margin:4px 0;color:var(--td)}
.ftr{padding:20px 40px;border-top:1px solid var(--b);font-family:var(--m);font-size:10px;color:var(--td);display:flex;justify-content:space-between;max-width:960px;margin:0 auto}
.tools-bar{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
h3{font-size:14px;font-weight:600;margin:12px 0 8px;color:var(--t)}
pre{background:var(--s);border:1px solid var(--b);border-radius:6px;padding:12px 16px;overflow-x:auto;margin:10px 0}
pre code{background:none;padding:0;font-size:11px;color:var(--t)}
a{color:var(--a);text-decoration:none}a:hover{text-decoration:underline}
blockquote{border-left:3px solid var(--a);padding:6px 14px;margin:10px 0;color:var(--td);background:var(--s);border-radius:0 4px 4px 0}
@media(max-width:700px){.hdr,.content,.ftr{padding-left:16px;padding-right:16px}.stats{gap:16px}}
</style>
</head>
<body>
HTMLEOF

# Header with category badge + topic
cat >> "$REPORT_FILE" << EOF
<div class="hdr">
<div class="hdr-top">
<div>
<span class="cat-badge" style="background:${cat_color}22;color:${cat_color};border:1px solid ${cat_color}44">${cat_label}</span>
<h1>$(echo "$session_topic_display" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')</h1>
</div>
<div class="meta">${DATE_DISPLAY}<br>${session_msg_count} messages &bull; ${session_id:0:8}</div>
</div>
</div>

<div class="content">
EOF

# Overview stats
cat >> "$REPORT_FILE" << EOF
<section>
<div class="stats">
<div class="stat"><div class="stat-v" style="color:var(--a)">${session_msg_count}</div><div class="stat-l">Messages</div></div>
EOF

# Count files changed
file_count=$(echo "$files_changed" | grep -c . 2>/dev/null || echo "0")
cat >> "$REPORT_FILE" << EOF
<div class="stat"><div class="stat-v" style="color:var(--a2)">${file_count}</div><div class="stat-l">Files Changed</div></div>
EOF

# Count skills
skill_count=$(echo "$skills_used" | tr ',' '\n' | grep -c . 2>/dev/null || echo "0")
cat >> "$REPORT_FILE" << EOF
<div class="stat"><div class="stat-v" style="color:var(--a3)">${skill_count}</div><div class="stat-l">Skills Used</div></div>
</div>
</section>
EOF

# Skills used (if any)
if [ -n "$skills_used" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">Skills Invoked</div>
<div class="tools-bar">$(echo "$skills_used" | tr ',' '\n' | while IFS= read -r s; do [ -n "$s" ] && echo "<span class=\"sk\">$s</span>"; done)</div>
</section>
EOF
fi

# Tools used
if [ -n "$tools_used" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">Tools Used</div>
<div style="font-family:var(--m);font-size:11px;color:var(--td)">${tools_used}</div>
</section>
EOF
fi

# What happened — actions/decisions
if [ -n "$decisions_html" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">Actions Taken</div>
<ul>${decisions_html}</ul>
</section>
EOF
fi

# Files changed
if [ -n "$files_changed_html" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">Files Changed</div>
<table>${files_changed_html}</table>
</section>
EOF
fi

# User questions / requests
if [ -n "$user_questions_html" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">User Requests</div>
${user_questions_html}
</section>
EOF
fi

# Learnings
if [ -n "$learnings_html" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">Learnings</div>
${learnings_html}
</section>
EOF
fi

# Transcript highlights
if [ -n "$transcript_items" ]; then
    cat >> "$REPORT_FILE" << EOF
<section>
<div class="sl">Conversation (last 15 exchanges)</div>
${transcript_items}
</section>
EOF
fi

# Footer
cat >> "$REPORT_FILE" << EOF
</div>
<div class="ftr">
<span>Auto-generated session journal &bull; Zero token cost</span>
<span>${DATE_SHORT} ${TIME_SHORT}</span>
</div>
</body></html>
EOF

# --- Sync to VPC with rich manifest ---
(
    # Ensure manifest generator script exists on VPC
    rsync -az --timeout=15 "$HOME/.claude/hooks/generate-manifest.py" "$VPC_HOST":~/session-reports/generate-manifest.py >>"$SYNC_LOG" 2>&1

    # Sync reports
    rsync -az --timeout=30 "$REPORT_DIR"/ "$VPC_HOST":~/session-reports/ >>"$SYNC_LOG" 2>&1
    if [ $? -eq 0 ]; then
        # Regenerate manifest using deployed script (no inline code)
        ssh $SSH_OPTS "$VPC_HOST" 'cd ~/session-reports && python3 generate-manifest.py' >>"$SYNC_LOG" 2>&1
    else
        echo "$(date): rsync failed" >>"$SYNC_LOG"
    fi
) &

# Cleanup old reports (keep last 30)
ls -t "$REPORT_DIR"/*.html 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true

echo "Report: $REPORT_FILE" >&2
