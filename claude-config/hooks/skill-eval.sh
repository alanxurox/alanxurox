#!/bin/bash
# Forced skill evaluation hook (UserPromptSubmit)
# Increases skill activation from ~20% to ~84%
# Source: https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably

# Only run on substantive prompts (skip single-word commands)
PROMPT_LENGTH=${#CLAUDE_USER_PROMPT}
if [ "$PROMPT_LENGTH" -lt 20 ]; then
  exit 0
fi

echo "IMPORTANT: Before responding, quickly scan your available skills list. If ANY skill's description matches this task, invoke it with the Skill tool. Skills contain critical reference data — skipping them leads to wrong approaches."
