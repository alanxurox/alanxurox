#!/bin/bash
# Career Asset Sync — one-command publish
# Usage: ~/.claude/scripts/sync-career-assets.sh

set -e

echo "=== Career Asset Sync ==="

# 1. GitHub Profile README
echo "[1/4] Pushing GitHub README..."
cp ~/Desktop/GITHUB-README.md ~/alanxurox/README.md
cd ~/alanxurox && git add README.md && git commit -m "Update profile — $(date +%Y-%m-%d)" 2>/dev/null && git push origin main || echo "Already up to date"

# 2. Resume PDF
echo "[2/4] Generating Resume PDF..."
pandoc ~/Desktop/RESUME-CONTENT-2026.md \
  -o ~/Desktop/RESUME-2026.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=11pt 2>/dev/null || \
pandoc ~/Desktop/RESUME-CONTENT-2026.md -o ~/Desktop/RESUME-2026.html --standalone

# 3. VPC Backup
echo "[3/4] Syncing to VPC..."
rsync -az ~/Desktop/CAREER-ASSESSMENT-*.md \
          ~/Desktop/BRAG-DOC-*.md \
          ~/Desktop/LINKEDIN-PACK.md \
          ~/Desktop/GITHUB-README.md \
          ~/Desktop/RESUME-CONTENT-*.md \
          ~/Desktop/JOB-TARGETS-*.md \
          ~/Desktop/RESUME-*.pdf \
          ubuntu@100.113.93.28:~/career-assets/ 2>/dev/null

# 4. LinkedIn (manual)
echo "[4/4] LinkedIn content ready for paste:"
echo ""
echo "=== HEADLINE (copy this) ==="
echo "AI Engineer | Agent Skills & MCP | Claude API Production Systems | GenDigital Prague"
echo ""
echo "Opening LinkedIn edit page..."
open "https://www.linkedin.com/in/alanxurox/edit/forms/intro/new/?profileFormEntryPoint=PROFILE_SECTION"

echo ""
echo "✅ Done! GitHub pushed, PDF generated, VPC synced."
echo "📋 Paste headline + about section in LinkedIn manually."
