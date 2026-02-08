---
name: glean-search
description: Precise Glean MCP query patterns — stop getting 16 generic results, start getting exactly what you need
triggers:
  - glean
  - internal search
  - find in slack
  - find in jira
  - find in confluence
  - who wrote
  - company docs
---

# Glean Search Patterns

Your Glean MCP has 12 search parameters. Most AI agents use one: `query`. This skill teaches precise queries.

## The Problem

```
# What most agents do:
search(query="deployment automation")
→ 16 generic results across all sources

# What this skill teaches:
search(query="migration", app="slack", updated="past_week")
→ This week's Slack discussions about the migration

search(query="*", owner="me", sort_by_recency=true)
→ Everything you authored recently
```

## Three Tools

| Tool | When | Token Cost |
|------|------|------------|
| `mcp__glean_default__search` | Find documents, get snippets + URLs | Low |
| `mcp__glean_default__chat` | Ask questions, get synthesized answers | Medium |
| `mcp__glean_default__read_document` | Get full content of known URLs | Variable |

**Workflow:** `search` → find URLs → `read_document` for full content. Use `chat` when you need synthesis across sources.

## Query Patterns

### Find someone's recent work
```
search(query="*", from="Person Name", sort_by_recency=true)
```
`from` = updated by, commented on, or created by (broad — includes commenters). Use `owner` to restrict to docs they actually created.

### Find Slack discussions
```
search(query="content dev skills beta", app="slack")
```
Add `channel="channel-name"` for a specific channel. Add `sort_by_recency=true` for latest.

### Find Slack DMs
```
search(query="handover notes", app="slack", type="direct message")
```

### Find Jira tickets
```
search(query="style guide automation", app="jira")
```
Add `from="me"` for tickets you're assigned to or commented on.

### Find Confluence docs
```
search(query="email automation architecture", app="confluence")
```
Add `owner="Person Name"` for docs a specific person authored.

### Find PRs / code reviews
```
search(query="content-dev-skills", app="githubenterprise", type="pull")
```
Combine with `owner="me"` for PRs you authored, or `from="me"` for PRs you touched (includes reviews/comments).

### Find recent changes
```
search(query="deployment skills", updated="past_week")
```
Options: `today`, `yesterday`, `past_week`, `past_2_weeks`, `past_month`, or month names like `"January"`.

### Find docs in a date range
```
search(query="AI SDLC", after="2026-01-01", before="2026-02-01")
```

### Find presentations
```
search(query="quarterly review", type="slides")
```
Types: `pull`, `spreadsheet`, `slides`, `email`, `direct message`, `folder`.

### Find your team's work
```
search(query="*", from="myteam", sort_by_recency=true)
```
Only `"me"` and `"myteam"` work as special values. Don't use other team names.

### Exhaustive search
```
search(query="GCP tenant", exhaustive=true)
```
Use when you need "all", "every", or "each" result. Not just "more results."

### Refine with discovered filters
After a first search, check each result's `matching_filters`. Rerun with:
```
search(query="original query", dynamic_search_result_filters="brand:Norton|product:VPN")
```
Format: `key:value` pairs joined by `|`. Only use keys/values you saw in actual results.

## App Filter Reference

**Common sources:**

| Value | Source |
|-------|--------|
| `slack` | Slack messages & threads |
| `confluence` | Confluence pages |
| `jira` | Jira tickets |
| `githubenterprise` | GitHub repos, PRs, issues |
| `o365` | Office 365 docs |
| `o365sharepoint` | SharePoint sites |
| `o365onedrive` | OneDrive files |
| `outlook` | Outlook emails |
| `microsoftteams` | Teams messages |
| `zoom` | Zoom recordings/transcripts |
| `people` | People directory |

**Cloud & DevOps:**

| Value | Source |
|-------|--------|
| `gcp` | Google Cloud Platform |
| `azure` | Azure DevOps |
| `jfrog` | JFrog Artifactory |
| `datadog` | Datadog monitors/dashboards |
| `servicenow` | ServiceNow tickets |

**Salesforce:**

| Value | Source |
|-------|--------|
| `salescloud` | Salesforce Sales Cloud |
| `servicecloud` | Salesforce Service Cloud |

**Productivity & PM:**

| Value | Source |
|-------|--------|
| `notion` | Notion pages |
| `trello` | Trello boards |
| `smartsheet` | Smartsheet |
| `airtable` | Airtable |
| `workday` | Workday HR |
| `testrail` | TestRail |

**Design:**

| Value | Source |
|-------|--------|
| `zeplin` | Zeplin |
| `invision` | InVision |
| `lucid` | Lucidchart |
| `bynder` | Bynder DAM |

**Reporting:**

| Value | Source |
|-------|--------|
| `tableau` | Tableau dashboards |
| `gdatastudio` | Google Data Studio |
| `googlesites` | Google Sites |

**Glean-native:**

| Value | Source |
|-------|--------|
| `collections` | Glean collections |
| `answers` | Glean answers |
| `announcements` | Glean announcements |

Not all apps are indexed in every Glean instance. If a filter returns nothing, try without it.

## Multi-Angle Strategy

For thorough research, search 3 times with different angles:

1. **Specific terms:** Project names, repo names, tool names → finds artifacts
2. **Person + domain:** `"Person Name Vertex AI"` → finds discussions, reviews
3. **Entity names:** System IDs, config names, ticket numbers → finds configs, PRs

Specific technical terms beat broad role queries. `"OPSAI tenant GCP"` > `"my cloud work"`.

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Generic query, no filters | Add `app`, `from`, or date filter |
| `sort_by_recency` on every query | Only when "latest" or "most recent" matters |
| `exhaustive` to get more results | Refine query or add filters instead |
| Search for public/external info | Use WebSearch — Glean is internal only |
| Guess `dynamic_search_result_filters` | Only use values from actual results |
| Broad queries ("my work") | Specific terms ("content-dev-skills repo") |

## Rate Limiting

Glean MCP enforces rate limits. When you hit them:

**Symptoms:** Empty results, errors, or degraded responses after many rapid queries.

**Workarounds:**
- **Batch your intent** — combine filters in one query instead of running 5 separate searches
- **Use `chat` for synthesis** — one `chat` call replaces multiple `search` + `read_document` rounds
- **Cache URLs** — if you already have a document URL, use `read_document` directly instead of re-searching
- **Space out exhaustive searches** — `exhaustive=true` is expensive; don't chain them
- **Retry with backoff** — if a query fails, wait a few seconds before retrying

**Detection:** If you get 0 results on a query that should return results, or get an error response, you're likely rate-limited. Try a simpler query after a short pause.

## DM Privacy Note

`search(query="...", app="slack", type="direct message")` only returns DMs that Glean has indexed based on your organization's privacy settings. Not all DMs may be searchable.

## Agent Delegation

When spawning sub-agents for research:
- **Parent agent** queries Glean directly (keeps context in main conversation)
- **Sub-agents** handle external web research
- This prevents token drain — Glean results stay where they're most useful
