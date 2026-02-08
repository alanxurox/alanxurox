# career-intel

> **Your work doesn't speak for itself. This system does.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Skills](https://img.shields.io/badge/Claude-Agent%20Skills-blueviolet)](https://docs.anthropic.com)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green)](https://modelcontextprotocol.io)

An always-on career evidence collection system for engineers. Collects proof of your contributions *before* you need it.

---

## The Problem

**Performance management is broken, and engineers are losing.**

| Statistic | Reality |
|-----------|---------|
| **43.6 per 1,000** | Workers currently on performance procedures |
| **+30%** | Increase in PIPs since 2020 |
| **1 in 3** | Survival rate for employees placed on PIP |
| **64%** | Wouldn't fight an unfair PIP (lack of evidence) |

Most engineers only start documenting their work when they smell trouble. By then, it's too late. Git history gets rewritten. Slack messages expire. JIRA tickets get reassigned. Memory fades.

**career-intel** runs continuously, collecting evidence while you work—not after you're threatened.

---

## Features

### 📊 Evidence Collection
Monitors your contributions across systems automatically:
- **GitHub**: commits, PRs, reviews, issues closed
- **Slack**: mentions, thank-yous, help requests answered (via MCP)
- **JIRA**: tickets completed, blockers resolved, cross-team collaboration

### 📬 Weekly Briefings
Every Monday, get a digest of:
- Your top contributions from the past week
- Visibility metrics (who mentioned you, cross-team impact)
- Anomalies worth noting (sudden silence, ownership changes)

### 🔄 Career Asset Sync
One command updates all your public-facing career assets:
```bash
career-intel sync
```
- GitHub profile README
- Resume PDF (from template)
- LinkedIn content blocks

### 🛡️ PIP Protection
When (not if) you need evidence:
- Chronological contribution timeline
- Searchable by project, date, impact type
- Export formats: PDF, Markdown, JSON

---

## Quick Start

### Prerequisites
- Claude Desktop or Cursor with Agent Skills support
- MCP servers configured for your internal tools
- GitHub personal access token

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/career-intel.git
cd career-intel

# Copy skill to your skills directory
cp -r skills/career-intel ~/.cursor/skills/

# Or for Claude Desktop
cp -r skills/career-intel ~/.claude/skills/
```

### First Run

```bash
# Initialize your evidence vault
career-intel init

# Run your first collection (manual)
career-intel collect --since "30 days ago"

# Verify it's working
career-intel status
```

---

## Configuration

Create `~/.career-intel/config.yaml`:

```yaml
# Data sources
sources:
  github:
    enabled: true
    username: "your-github-username"
    token: "${GITHUB_TOKEN}"
    include_private: true
    
  slack:
    enabled: true
    mcp_server: "user-slack"
    channels:
      - "engineering"
      - "team-platform"
    
  jira:
    enabled: true
    mcp_server: "user-jira"
    projects:
      - "PLATFORM"
      - "INFRA"

# Briefing schedule
briefings:
  frequency: "weekly"
  day: "monday"
  time: "09:00"
  
# Evidence retention
retention:
  raw_data: "2 years"
  summaries: "indefinite"
  
# Career asset templates
assets:
  github_readme: "~/.career-intel/templates/github-readme.md"
  resume: "~/.career-intel/templates/resume.tex"
  linkedin: "~/.career-intel/templates/linkedin-blocks.md"
```

### Environment Variables

```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export CAREER_INTEL_VAULT="~/.career-intel/vault"
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        career-intel                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│   │  GitHub  │   │   Slack  │   │   JIRA   │    Data Sources   │
│   │   API    │   │   MCP    │   │   MCP    │                   │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘                   │
│        │              │              │                          │
│        └──────────────┼──────────────┘                          │
│                       ▼                                         │
│              ┌────────────────┐                                 │
│              │   Collector    │    Scheduled + On-demand        │
│              │    Engine      │                                 │
│              └────────┬───────┘                                 │
│                       │                                         │
│                       ▼                                         │
│              ┌────────────────┐                                 │
│              │  Evidence Vault │   Structured, Searchable       │
│              │   (SQLite/MD)   │                                │
│              └────────┬───────┘                                 │
│                       │                                         │
│         ┌─────────────┼─────────────┐                          │
│         ▼             ▼             ▼                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│   │ Briefing │  │  Asset   │  │  Export  │   Output Modes     │
│   │ Generator│  │   Sync   │  │  Engine  │                    │
│   └──────────┘  └──────────┘  └──────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| **SKILL.md** | Agent skill definition | Claude Agent Skills |
| **Collector** | Pulls data from sources | MCP + GitHub API |
| **Vault** | Stores structured evidence | SQLite + Markdown |
| **Briefer** | Generates weekly digests | Claude summarization |
| **Syncer** | Updates career assets | Shell + templates |

### Skill Integration

career-intel is implemented as a Claude Agent Skill:

```markdown
# From SKILL.md
Triggers:
- "what's happening" → Weekly briefing
- "career update" → Recent evidence summary  
- "sync career" → Update all assets
- "evidence for [project]" → Targeted export
```

---

## Personas

### 🎯 Who This Is For

**The Quiet Achiever**
> Ships constantly, documents rarely. Has saved three production incidents this year but couldn't list them under pressure.

**The Cross-Team Collaborator**  
> Helps everyone, gets credit from no one. Slack history is a graveyard of "thanks, you saved me."

**The New Manager's Report**
> Previous manager knew your value. New manager only sees last 90 days. You need receipts.

**The Remote Worker**
> No water cooler visibility. Your work happens in commits and threads that nobody walks past.

### ❌ Who This Is NOT For

- Active job seekers (use a job tracker instead)
- Managers tracking reports (this is personal defense)
- Anyone looking for a quick fix (this is continuous, not reactive)

---

## Commands Reference

```bash
# Collection
career-intel collect              # Collect from all sources
career-intel collect --source github --since "7 days"
career-intel collect --dry-run    # Preview what would be collected

# Briefings
career-intel brief                # Generate this week's briefing
career-intel brief --format markdown
career-intel brief --period "2024-Q3"

# Asset Sync
career-intel sync                 # Update all career assets
career-intel sync --asset github  # Update only GitHub README
career-intel sync --preview       # Preview changes without writing

# Evidence Export
career-intel export --project "Platform Migration"
career-intel export --since "2024-01-01" --format pdf
career-intel export --tag impact:high

# Maintenance
career-intel status               # Check system health
career-intel vault stats          # Storage and coverage stats
career-intel vault search "production incident"
```

---

## Evidence Schema

Each evidence item follows this structure:

```json
{
  "id": "evt_2024_0215_github_pr_1234",
  "timestamp": "2024-02-15T14:32:00Z",
  "source": "github",
  "type": "pull_request",
  "title": "Fix critical auth bypass in OAuth flow",
  "impact": {
    "level": "high",
    "tags": ["security", "production", "cross-team"]
  },
  "visibility": {
    "reviewers": ["alice", "bob", "security-team"],
    "mentions": 3,
    "threads": 12
  },
  "artifacts": {
    "url": "https://github.com/org/repo/pull/1234",
    "diff_stats": "+142 -89",
    "files_changed": 8
  },
  "context": "Discovered during Q1 security audit. Prevented potential data breach affecting 50k users."
}
```

---

## Contributing

Contributions welcome. This is a tool by engineers, for engineers.

### Development Setup

```bash
git clone https://github.com/yourusername/career-intel.git
cd career-intel

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Lint
ruff check .
```

### Contribution Ideas

- [ ] Additional MCP adapters (Confluence, Linear, Notion)
- [ ] Evidence deduplication across sources
- [ ] Impact scoring algorithms
- [ ] Resume template variations
- [ ] Privacy-preserving sync options

### Code of Conduct

Be excellent to each other. We're all trying to protect our careers here.

---

## FAQ

**Q: Does this store sensitive company data?**  
A: By default, career-intel stores metadata and summaries, not full content. You control retention and can exclude specific channels/projects.

**Q: Can my employer see this?**  
A: career-intel runs locally on your machine. Nothing is transmitted externally unless you explicitly sync to GitHub or similar.

**Q: What if I switch jobs?**  
A: Your evidence vault is portable. Export everything before your last day.

**Q: Is this paranoid?**  
A: 43.6 per 1,000 workers are currently on performance procedures. That's not paranoia—that's probability.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built on the shoulders of:
- [Model Context Protocol](https://modelcontextprotocol.io) for internal tool access
- [Claude Agent Skills](https://docs.anthropic.com) for intelligent automation
- Every engineer who learned the hard way that documentation matters

---

<p align="center">
  <strong>Your contributions matter. Make sure there's proof.</strong>
</p>
