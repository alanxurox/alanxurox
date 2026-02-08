---
name: career-intel
description: Monitor career-relevant data across all sources. Use for weekly briefings, before 1:1s, or to surface opportunities. Triggers on "what's happening", "career update", "any news", "briefing".
---

# Career Intelligence Monitor

Aggregate career-relevant signals from internal and external sources.

## When to Use
- Weekly briefing (Sunday/Monday morning)
- Before 1:1s with manager
- Before performance reviews
- When feeling disconnected from work activity
- Opportunistic job market monitoring

## Energy-Aware Usage (from alan-context)

| Energy State | Appropriate Career-Intel Actions |
|--------------|----------------------------------|
| **High** | Full briefing, job applications, LinkedIn posts, outreach |
| **Low** | Quick scan (Glean mentions only), defer applications |
| **Recovery** | Skip entirely — focus on rest |

**Check energy before deep career work.** Job applications during low energy = poor quality. LinkedIn posts during recovery = unnecessary stress.

Reference: `~/.cursor/skills/alan-context/SKILL.md` (Cyclothymia Pattern section)

## Data Sources

### 1. Internal (Glean MCP)

**Use precise queries — don't get 16 generic results.** See `~/.cursor/skills/glean-search/SKILL.md` for full patterns.

| Query | Arguments | What It Surfaces |
|-------|-----------|------------------|
| **Mentions of you** | `query="Alan Xu"`, `updated="past_week"`, `sort_by_recency=true` | All mentions, messages |
| **Your own activity** | `query="*"`, `owner="me"`, `sort_by_recency=true` | Docs you created |
| **Jira tickets** | `query="*"`, `app="jira"`, `from="me"`, `updated="past_week"` | Tickets you touched |
| **PRs** | `query="content-dev-skills"`, `app="githubenterprise"`, `type="pull"` | PRs matching term |
| **Slack discussions** | `query="AI SDLC"`, `app="slack"`, `updated="past_week"` | Threads on topic |
| **Slack DMs** | `query="handover"`, `app="slack"`, `type="direct message"` | DM discussions |

**Multi-Angle Strategy (from better-glean):**
1. **Specific terms:** Project names, repo names → finds artifacts
2. **Person + domain:** `"Filip Brebera handover"` → finds discussions
3. **Entity names:** Ticket numbers, config names → finds configs

**Anti-Patterns:**
- Generic query without filters → 16 useless results
- `exhaustive=true` for more results → refine query instead
- Searching public info → use WebSearch, Glean is internal only

**VPN Team Alternative (external_scout):**
The VPN team uses agent delegation with learning:
- `vpn_scout` → navigate local VPN folder
- `external_scout` → query Glean/Jira/Confluence
- `delegation_learning.json` → improves routing over time

See: `https://git.int.avast.com/ps/claude-code-adoption/blob/main/.claude/skills/vpn_documentation/`
```

### 2. GitHub Work (git.int.avast.com)

```bash
GH_HOST=git.int.avast.com gh api /users/Alan-Xu/events --jq '.[0:10] | .[] | {type, repo: .repo.name, created: .created_at}'
```

**What to look for:**
- PushEvents to content-dev-skills, SDLC_cursor, better-glean
- PullRequestEvents (PRs opened, merged)
- IssueCommentEvents (engagement on issues)

### 3. GitHub Personal (github.com)

**MCP Call (list repos):**
```json
{
  "server": "user-github",
  "toolName": "search_repositories",
  "arguments": {
    "query": "user:alanxurox"
  }
}
```

**What to look for:**
- Stars on alanxurox/alanxurox (profile views proxy)
- New followers
- Issues/PRs on any public repos

### 4. Job Market (WebSearch)

**Weekly searches:**
```
"MCP Model Context Protocol" jobs remote 2026
"AI Engineer" "Agent Skills" remote Europe
"Claude API" engineer remote
Prague AI Engineer senior 2026
```

**What to look for:**
- MCP-specific roles (rare, high signal)
- Remote EU AI Engineer roles
- Salary benchmarks in job postings
- Companies building agentic systems

### 5. Events & Community

**Prague AI Meetups:**
- AI Tinkerers Prague: https://prague.aitinkerers.org/
- Prague AI-Driven Software Meetup: https://www.meetup.com/prague-ai-driven-software-meetup/
- TransformPrague.AI: https://www.meetup.com/transform-prague-ai/

**WebSearch for events:**
```
Prague AI meetup February 2026
AI engineering conference Europe 2026
MCP Model Context Protocol conference
```

### 6. MCP Community (GitHub)

```bash
# Check trending MCP repos
gh api /search/repositories?q=mcp+model+context+protocol+stars:>100&sort=stars --jq '.items[0:5] | .[] | {name, stars: .stargazers_count, url: .html_url}'
```

**What to look for:**
- New MCP servers gaining traction
- Anthropic announcements
- Potential contribution opportunities

## Weekly Briefing Template

Run this every Sunday/Monday:

```markdown
# Career Intel Briefing — Week of [DATE]

## 🔔 Mentions & Activity (Glean)
- [X] mentions of "Alan Xu" in past week
- Key threads: [list top 3]
- Action items: [any follow-ups needed]

## 💼 Work GitHub Activity
- Commits: [count] across [repos]
- PRs: [opened/merged/reviewed]
- Notable: [any significant merges]

## 👤 Personal GitHub
- Profile views proxy: [stars/forks on alanxurox]
- Any new followers/issues

## 📋 Job Market Signals
- MCP roles found: [count]
- Notable: [company, role, salary if listed]
- Trend: [market direction]

## 📅 Upcoming Events
- [Event name] — [Date] — [Link]
- [Event name] — [Date] — [Link]

## 🎯 Actions This Week
- [ ] [Specific follow-up from briefing]
```

## Quick Commands

### Full Briefing (run all sources)
```bash
# 1. Glean (via MCP in Cursor/Claude Code)
# 2. Work GitHub
GH_HOST=git.int.avast.com gh api /users/Alan-Xu/events --jq '.[0:10]'

# 3. Personal GitHub
gh api /users/alanxurox/events --jq '.[0:5]'

# 4. Save briefing
echo "# Briefing $(date +%Y-%m-%d)" > ~/career/briefing-$(date +%Y-%m-%d).md
```

### Just Check Mentions
```bash
# Quick Glean search via MCP
# Query: "Alan Xu" updated:past_week sort_by_recency:true
```

### Just Check Jobs
```bash
# WebSearch: "MCP Model Context Protocol" jobs remote 2026
```

## Automation (IMPLEMENTED)

**The cron job is built.** See `career-intel-cron` skill for deploy/debug/config.

| Component | Location | Status |
|-----------|----------|--------|
| Runner script | `~/career-intel-cron/run-career-intel.sh` | Tested |
| Python fallback | `~/career-intel-cron/fallback-runner.py` | 3/4 sources working |
| Claude Code prompt | `~/career-intel-cron/career-intel-prompt.md` | Ready |
| Deploy script | `~/career-intel-cron/deploy-to-vpc.sh` | Blocked on Tailscale SSH |
| Cron skill | `~/.cursor/skills/career-intel-cron/SKILL.md` | 28/28 tests |
| Output | `~/career-intel/briefing-YYYY-MM-DD.md` | VPC |
| Delivery | WhatsApp via Clawdbot | VPC |

**Schedule:** Monday 7am UTC (8am CET)

**To deploy:** `~/career-intel-cron/deploy-to-vpc.sh` (after Tailscale SSH auth)

**Manual briefing (this skill)** is still useful for:
- Ad-hoc briefings before 1:1s
- Adding data sources the cron doesn't cover
- Debugging cron output quality

## Upcoming Events (Current)

| Date | Event | Link |
|------|-------|------|
| Feb 26, 2026 | AI Tinkerers Prague | https://prague.aitinkerers.org/ |
| Mar 2, 2026 | Prague AI-Driven Software Meetup: Agentic Startup Canvas | https://www.meetup.com/prague-ai-driven-software-meetup/ |

## Job Market Snapshot (Current)

| Company | Role | Location | Salary | Notes |
|---------|------|----------|--------|-------|
| Zapier | Engineering Manager - MCP | Remote NA | C$188-282K | Expired but signals MCP demand |
| Descope | MCP Software Engineer | Tel Aviv | Not listed | Active, requires 3+ yrs backend |

## References

**Related Skills:**
| Skill | Relationship |
|-------|--------------|
| `career-intel-cron` | **Autonomous version** — runs weekly on VPC, delivers WhatsApp |
| `alan-context` | Energy-aware scheduling, identity context |
| `knowledge-index` | Routes "career" queries here |
| `glean-search` | Precise Glean query patterns |
| `career-asset-sync` | Publish after gathering intel |
| `frameworks` | ET&A for career decisions (affordable loss, means mapping) |

**Files:**
| File | Purpose |
|------|---------|
| `~/career/ALAN-CONTEXT.md` | PCB with career status |
| `~/career/JOB-TARGETS-FEB.md` | Application tracker |
| `~/career/CAREER-ASSESSMENT-2026-02-01.md` | Full analysis |
| `~/career/BRAG-DOC-2026.md` | Evidence for reviews |
| `~/.claude/scripts/career-intel-briefing.sh` | Weekly automation |

**VPC Cron:** Mondays 7am UTC → `~/career-intel/briefing-YYYY-MM-DD.md` (see `career-intel-cron` skill)
