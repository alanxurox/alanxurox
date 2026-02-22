#!/bin/bash
# HUD wrapper — runs OMC HUD, appends LiteLLM monthly spend from cache
# Cache written by ~/bin/cc on startup (LiteLLM mode only)

output=$(cat | /opt/homebrew/bin/node "$HOME/.claude/hud/omc-hud.mjs")

cache="$HOME/.better-litellm-spend.cache"
if [[ -f "$cache" ]]; then
    { read -r spend; read -r month; read -r budget; } < "$cache"
    if [[ -n "$spend" && "$spend" != "0.00" ]]; then
        # Build LiteLLM suffix with optional budget
        litellm_suffix="LiteLLM ${month}: \$${spend}"
        if [[ -n "$budget" && "$budget" =~ ^[0-9]+\.?[0-9]*$ && "$budget" != "0" ]]; then
            pct_icon=$(python3 -c "
s, b = float('$spend'), float('$budget')
p = int(s / b * 100)
i = '\U0001f534' if p >= 90 else '\U0001f7e1' if p >= 70 else '\U0001f7e2'
print(f'{i} {p}%')
" 2>/dev/null)
            [[ -n "$pct_icon" ]] && litellm_suffix="LiteLLM ${month}: \$${spend}/\$${budget} ${pct_icon}"
        fi
        # Append to the last line of the main HUD header
        first="${output%%$'\n'*}"
        rest="${output#*$'\n'}"
        printf '%s | %s\n' "$first" "$litellm_suffix"
        [[ "$rest" != "$output" ]] && printf '%s\n' "$rest"
        exit 0
    fi
fi
printf '%s\n' "$output"
