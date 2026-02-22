#!/bin/bash
# Injects current timestamps into every prompt as system-reminder
# Fixes: Claude losing track of current time during long sessions
# Hook: UserPromptSubmit

# Consume stdin (hook protocol)
cat > /dev/null

NOW_UTC=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
NOW_LOCAL=$(date '+%Y-%m-%d %H:%M:%S %Z')
HOUR=$(date '+%H')

echo "Current time: ${NOW_LOCAL} (UTC: ${NOW_UTC}). Use these for screenpipe queries."
