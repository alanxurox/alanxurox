#!/bin/bash
#
# Career Intel Extraction Script
# Queries claude-mem.db for recent activity and extracts career-relevant insights
# Output: ~/private/career-intel/YYYY-MM-DD.md
#
# Usage: ~/.claude/scripts/career-intel-extract.sh
# Runs every 4 hours via LaunchAgent
#

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

STATE_FILE="$HOME/.claude/scripts/.career-intel-state"
DB_PATH="$HOME/.claude-mem/claude-mem.db"
OUTPUT_DIR="$HOME/private/career-intel"
LOG_FILE="$HOME/.claude/logs/career-intel-extract.log"
TODAY=$(date +%Y-%m-%d)
NOW=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

# LiteLLM Configuration
LITELLM_URL="${LITELLM_BASE_URL:-https://litellm.prod.aws.lifelock.com}"
LITELLM_KEY="${LITELLM_API_KEY:-}"
# Try alternative model names - LiteLLM config may vary
LITELLM_MODEL="claude-3-haiku-20240307"

# ============================================================================
# LOGGING
# ============================================================================

log() {
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

get_last_run() {
    if [[ -f "$STATE_FILE" ]]; then
        cat "$STATE_FILE"
    else
        # First run: default to 48 hours ago
        date -v-48H +%s 2>/dev/null || date -d '48 hours ago' +%s
    fi
}

set_last_run() {
    echo "$1" > "$STATE_FILE"
}

# ============================================================================
# DATA EXTRACTION
# ============================================================================

extract_observations() {
    local since_epoch="$1"

    sqlite3 "$DB_PATH" <<EOF
.mode list
.separator '|'
SELECT
    datetime(created_at_epoch, 'unixepoch') as timestamp,
    type,
    COALESCE(title, '(untitled)'),
    COALESCE(narrative, text, '(no details)'),
    project
FROM observations
WHERE created_at_epoch >= $since_epoch
ORDER BY created_at_epoch DESC
LIMIT 100;
EOF
}

extract_user_prompts() {
    local since_epoch="$1"

    sqlite3 "$DB_PATH" <<EOF
.mode list
.separator '|'
SELECT
    datetime(created_at_epoch, 'unixepoch') as timestamp,
    substr(prompt_text, 1, 200) as prompt_preview
FROM user_prompts
WHERE created_at_epoch >= $since_epoch
ORDER BY created_at_epoch DESC
LIMIT 50;
EOF
}

extract_session_summaries() {
    local since_epoch="$1"

    sqlite3 "$DB_PATH" <<EOF
.mode list
.separator '|'
SELECT
    datetime(created_at_epoch, 'unixepoch') as timestamp,
    project,
    COALESCE(request, '(no request)'),
    COALESCE(completed, '(no completion)')
FROM session_summaries
WHERE created_at_epoch >= $since_epoch
ORDER BY created_at_epoch DESC
LIMIT 50;
EOF
}

# ============================================================================
# AI EXTRACTION (via LiteLLM)
# ============================================================================

extract_career_intel_ai() {
    local raw_data="$1"

    # Build prompt
    local prompt="You are a career intelligence analyst. Extract from this Claude Code session data:

1. **Projects worked on** (specific repo names, features, areas)
2. **Key decisions made** (architectural choices, tool selections, process changes)
3. **People mentioned** (colleagues, stakeholders, collaborators)
4. **Technologies used** (languages, frameworks, tools, platforms)
5. **Skills demonstrated** (technical abilities, problem-solving approaches)

Data:
\`\`\`
$raw_data
\`\`\`

Format as markdown with clear sections. Be concise. Focus on career-relevant insights."

    # Escape for JSON
    local prompt_json
    prompt_json=$(jq -Rs . <<< "$prompt")

    # Call LiteLLM
    local response
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$LITELLM_URL/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $LITELLM_KEY" \
        -d "{
            \"model\": \"$LITELLM_MODEL\",
            \"messages\": [{\"role\": \"user\", \"content\": $prompt_json}],
            \"max_tokens\": 2000,
            \"temperature\": 0.3
        }" 2>&1)

    # Extract HTTP code and body
    local http_code
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local body
    body=$(echo "$response" | sed '/HTTP_CODE:/d')

    # Check for success
    if [[ "$http_code" == "200" ]]; then
        echo "$body" | jq -r '.choices[0].message.content // empty' 2>/dev/null
    else
        log "LiteLLM API error: HTTP $http_code"
        echo ""
    fi
}

# ============================================================================
# MAIN LOGIC
# ============================================================================

main() {
    log "Starting career intel extraction"

    # Check database exists
    if [[ ! -f "$DB_PATH" ]]; then
        log_error "Database not found: $DB_PATH"
        exit 1
    fi

    # Get last run
    local last_run
    last_run=$(get_last_run)
    log "Processing records since: $(date -r "$last_run" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d "@$last_run" '+%Y-%m-%d %H:%M:%S')"

    # Extract data
    local observations
    local user_prompts
    local session_summaries

    observations=$(extract_observations "$last_run" 2>/dev/null || echo "")
    user_prompts=$(extract_user_prompts "$last_run" 2>/dev/null || echo "")
    session_summaries=$(extract_session_summaries "$last_run" 2>/dev/null || echo "")

    # Check if any data found
    if [[ -z "$observations" && -z "$user_prompts" && -z "$session_summaries" ]]; then
        log "No new data since last run"
        exit 0
    fi

    # Combine raw data
    local raw_data="## Observations
$observations

## User Prompts
$user_prompts

## Session Summaries
$session_summaries"

    # Prepare output file
    mkdir -p "$OUTPUT_DIR"
    local output_file="$OUTPUT_DIR/$TODAY.md"

    # Try AI extraction
    if [[ -n "$LITELLM_KEY" ]]; then
        log "Attempting AI extraction via LiteLLM (model: $LITELLM_MODEL)"
        local ai_insights
        ai_insights=$(extract_career_intel_ai "$raw_data" 2>&1)

        if [[ -n "$ai_insights" && ! "$ai_insights" =~ (error|Error|ERROR|authentication|Authentication) ]]; then
            # AI extraction succeeded
            cat > "$output_file" <<EOF
# Career Intel — $TODAY

> Generated: $NOW
> Period: $(date -r "$last_run" '+%Y-%m-%d %H:%M' 2>/dev/null || date -d "@$last_run" '+%Y-%m-%d %H:%M') to $NOW

$ai_insights

---

_Auto-generated by career-intel-extract.sh_
EOF
            log "AI extraction successful, output written to: $output_file"
        else
            # AI extraction failed, fallback to raw data
            log "AI extraction failed, falling back to raw output"
            cat > "$output_file" <<EOF
# Career Intel — $TODAY (Raw)

> Generated: $NOW
> Period: $(date -r "$last_run" '+%Y-%m-%d %H:%M' 2>/dev/null || date -d "@$last_run" '+%Y-%m-%d %H:%M') to $NOW
> Note: AI extraction unavailable, showing raw observations

$raw_data

---

_Auto-generated by career-intel-extract.sh (fallback mode)_
EOF
            log "Raw output written to: $output_file"
        fi
    else
        # No API key, raw output only
        log "No LiteLLM API key found, using raw output"
        cat > "$output_file" <<EOF
# Career Intel — $TODAY (Raw)

> Generated: $NOW
> Period: $(date -r "$last_run" '+%Y-%m-%d %H:%M' 2>/dev/null || date -d "@$last_run" '+%Y-%m-%d %H:%M') to $NOW

$raw_data

---

_Auto-generated by career-intel-extract.sh (no API key)_
EOF
        log "Raw output written to: $output_file"
    fi

    # Update state
    local current_epoch
    current_epoch=$(date +%s)
    set_last_run "$current_epoch"
    log "Updated last_run to: $current_epoch"

    log "Career intel extraction complete"
    exit 0
}

# ============================================================================
# EXECUTION
# ============================================================================

main "$@"
