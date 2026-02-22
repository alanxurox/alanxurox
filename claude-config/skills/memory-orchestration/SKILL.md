---
name: memory-orchestration
description: Use when searching memory, retrieving past work, or combining multiple knowledge sources (screenpipe temporal data, claude-mem learnings, Glean corporate docs, VPC backups). Triggers on "what did I work on", "find documentation about", "what happened when", or any cross-system query.
---

# Memory Orchestration

## Overview

Coordinates 4 memory systems to answer complex queries. Each system has distinct strengths — choosing the right one (or combining them) determines query success.

## System Comparison

| System | Scope | Strength | Latency | Tool |
|--------|-------|----------|---------|------|
| **screenpipe** | Temporal/spatial (screen OCR, audio, UI events) | "What happened when" — precise timestamps | Low (indexed SQLite) | `mcp__screenpipe__search-content` |
| **claude-mem** | Curated observations (learnings, patterns, mistakes) | "What matters" — high-signal insights | Low (SQLite FTS) | Query `~/.claude-mem/claude-mem.db` |
| **Glean** | Corporate knowledge (docs, wikis, people) | "What exists" — authoritative sources | Medium (REST API) | `mcp__glean_default__search` |
| **VPC** | Async replica of claude-mem | Backup/collaboration — markdown files | High (SSH + grep) | SSH to `vpc-worker` |

## Decision Tree: When to Use Which

### Temporal Queries ("when did X happen?")
→ **screenpipe** first
- "What was I working on at 2pm yesterday?"
- "When did that Slack message arrive?"
- "Show me screen activity during the meeting"
- Tool: `mcp__screenpipe__search-content` with `start_time`/`end_time`

### Learning Queries ("what did I learn about X?")
→ **claude-mem** first
- "What mistakes have I made with git rebase?"
- "What patterns did I discover about async/await?"
- "How should I approach database migrations?"
- Tool: Query `~/.claude-mem/claude-mem.db` via SQL or claude-mem plugin

### Corporate Knowledge ("where's the doc for X?")
→ **Glean** first
- "Find the onboarding guide"
- "Who owns the API gateway?"
- "Policy on VPN usage"
- Tool: `mcp__glean_default__search` with filters

### Backup/Recovery ("recover lost context")
→ **VPC** last resort
- claude-mem SQLite corrupted
- Need to audit what was synced
- Tool: SSH to `vpc-worker`, read `~/memory/YYYY-MM-DD.md`

## Combined Query Patterns

### Pattern 1: Temporal → Learning
"What did I learn during that debugging session last week?"

```
1. screenpipe: Find debugging session timerange
   → mcp__screenpipe__search-content(
       q="debug error traceback",
       start_time="2026-02-01T00:00:00Z",
       end_time="2026-02-08T00:00:00Z",
       content_type="ocr"
     )

2. claude-mem: Extract learnings from that period
   → Query claude-mem SQLite: SELECT * FROM observations WHERE content LIKE '%debug%'
```

### Pattern 2: Corporate → Temporal
"Did I read the deployment runbook before the incident?"

```
1. Glean: Find runbook URL
   → mcp__glean_default__search(query="deployment runbook")

2. screenpipe: Check if URL appeared on screen
   → mcp__screenpipe__search-content(
       q="<runbook-url>",
       start_time="<incident-time - 2h>",
       end_time="<incident-time>",
       content_type="ocr"
     )
```

### Pattern 3: Learning → Corporate
"We documented a fix for X — where's the wiki page?"

```
1. claude-mem: Find learning mention
   → Query claude-mem: SELECT * FROM observations WHERE content LIKE '%fix X%'

2. Glean: Find related wiki pages
   → mcp__glean_default__search(
       query="fix X wiki",
       from="me"
     )
```

## MCP Tool Reference

### Screenpipe Tools
- `mcp__screenpipe__search-content` — Query OCR/audio by time/app/window
  - Parameters: `q`, `start_time`, `end_time`, `app_name`, `content_type`
  - Use `content_type="ocr"` for screen text, `"audio"` for transcriptions
- `mcp__screenpipe__search-ui-events` — Keyboard/mouse/clipboard tracking
  - Parameters: `q`, `start_time`, `end_time`, `event_type`
- `mcp__screenpipe__export-video` — Generate MP4 from timerange
  - Parameters: `start_time`, `end_time`, `fps`

### Glean Tools
- `mcp__glean_default__search` — Find documents/wikis/policies
  - Parameters: `query`, `from`, `app`, `type`, `before`/`after`
  - Use filters to narrow: `from="me"`, `app="confluence"`, `type="slides"`
- `mcp__glean_default__chat` — AI-powered synthesis across multiple sources
  - Use for complex questions requiring analysis
- `mcp__glean_default__read_document` — Get full content by URL
  - Follow-up after search to get complete document

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using Glean for "what did I just work on" | Use screenpipe — Glean indexes documents, not screen activity |
| Using screenpipe for "best practices for X" | Use claude-mem — screenpipe has raw data, not curated learnings |
| Using claude-mem for "who owns service X" | Use Glean — corporate knowledge lives there |
| Querying VPC directly | VPC is async backup, always prefer claude-mem SQLite first |
| Forgetting ISO 8601 UTC timestamps | screenpipe requires: `2026-02-08T10:00:00Z` format |
| Broad screenpipe queries without time bounds | Always provide `start_time`/`end_time` for performance |

## Query Optimization

### Screenpipe Performance
- **Always bound time**: `start_time` + `end_time` for fast index scans
- **Filter by app**: `app_name="Google Chrome"` reduces result set
- **Use content_type**: `content_type="ocr"` OR `"audio"`, not `"all"`
- **Paginate**: Use `limit` + `offset` for large result sets

### Glean Performance
- **Use filters early**: `from="me"` OR `updated:past_week` in initial query
- **Specific apps**: `app="confluence"` OR `app="slack"` narrows scope
- **Follow search→read pattern**: Get URLs with search, full content with read_document

### claude-mem Performance
- **Query SQLite first**: `sqlite3 ~/.claude-mem/claude-mem.db "SELECT * FROM observations WHERE content LIKE '%pattern%' LIMIT 10"`
- **Use FTS**: `SELECT * FROM observations_fts WHERE observations_fts MATCH 'pattern'` for faster search

## Don't Do This

- **Don't use screenpipe for code search** — use Grep tool instead
- **Don't query VPC in normal flow** — it's a backup, not primary store
- **Don't combine all 4 systems for simple queries** — start with one, expand if needed
- **Don't forget app context** — screenpipe's `app_name`/`window_name` filters are critical
- **Don't ignore speaker_name in audio** — use for meeting attribution

## References

- Screenpipe docs: `~/.screenpipe/` (db.sqlite, data/, models/)
- claude-mem: `~/.claude-mem/claude-mem.db` (SQLite canonical store)
- Glean skill: `glean-search` for query pattern examples
- VPC sync: `~/.local/bin/sync-context-to-vpc` script
