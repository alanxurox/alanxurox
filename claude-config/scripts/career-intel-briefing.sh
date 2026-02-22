#!/bin/bash
# Career Intel Briefing — Weekly aggregation
# Usage: ~/.claude/scripts/career-intel-briefing.sh
# Best run: Monday mornings or before 1:1s

set -e

DATE=$(date +%Y-%m-%d)
OUTPUT=~/Desktop/briefing-${DATE}.md

echo "# Career Intel Briefing — ${DATE}" > $OUTPUT
echo "" >> $OUTPUT

# 1. Work GitHub Activity
echo "## 💼 Work GitHub Activity (git.int.avast.com)" >> $OUTPUT
echo '```' >> $OUTPUT
GH_HOST=git.int.avast.com gh api /users/Alan-Xu/events --jq '.[0:10] | .[] | "\(.created_at | split("T")[0]) | \(.type) | \(.repo.name)"' 2>/dev/null >> $OUTPUT || echo "Requires VPN" >> $OUTPUT
echo '```' >> $OUTPUT
echo "" >> $OUTPUT

# 2. Personal GitHub Activity
echo "## 👤 Personal GitHub (github.com/alanxurox)" >> $OUTPUT
echo '```' >> $OUTPUT
gh api /users/alanxurox/events --jq '.[0:5] | .[] | "\(.created_at | split("T")[0]) | \(.type) | \(.repo.name)"' 2>/dev/null >> $OUTPUT || echo "Auth issue" >> $OUTPUT
echo '```' >> $OUTPUT
echo "" >> $OUTPUT

# 3. Glean reminder
echo "## 🔔 Glean Mentions" >> $OUTPUT
echo "Run in Cursor/Claude Code:" >> $OUTPUT
echo '```' >> $OUTPUT
echo 'Glean search: "Alan Xu" updated:past_week sort_by_recency:true' >> $OUTPUT
echo '```' >> $OUTPUT
echo "" >> $OUTPUT

# 4. Upcoming events
echo "## 📅 Upcoming Events" >> $OUTPUT
echo "| Date | Event |" >> $OUTPUT
echo "|------|-------|" >> $OUTPUT
echo "| Feb 26, 2026 | AI Tinkerers Prague |" >> $OUTPUT
echo "| Mar 2, 2026 | Prague AI-Driven Software Meetup |" >> $OUTPUT
echo "" >> $OUTPUT

# 5. Job search reminder
echo "## 📋 Job Market Check" >> $OUTPUT
echo "WebSearch queries to run:" >> $OUTPUT
echo "- \"MCP Model Context Protocol\" jobs remote 2026" >> $OUTPUT
echo "- \"AI Engineer\" Prague senior 2026" >> $OUTPUT
echo "- Anthropic careers Europe" >> $OUTPUT
echo "" >> $OUTPUT

# 6. Actions
echo "## 🎯 Actions This Week" >> $OUTPUT
echo "- [ ] Review Glean mentions" >> $OUTPUT
echo "- [ ] Check job postings" >> $OUTPUT
echo "- [ ] Update LinkedIn if any new achievements" >> $OUTPUT
echo "" >> $OUTPUT

echo "✅ Briefing saved to: $OUTPUT"
open $OUTPUT
