#!/bin/bash
# Forced skill evaluation hook (UserPromptSubmit)
# Increases skill activation from ~20% to ~84%
# Source: https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably

# Gate on stdin length (Claude Code pipes user prompt to stdin)
PROMPT=$(cat 2>/dev/null)
if [ ${#PROMPT} -lt 30 ]; then
  exit 0
fi

echo "IMPORTANT: Before responding, quickly scan your available skills list. If ANY skill's description matches this task, invoke it with the Skill tool. Skills contain critical reference data — skipping them leads to wrong approaches."
