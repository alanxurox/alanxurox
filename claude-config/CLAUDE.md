# Alan Xu — Claude Code Global Context

## Identity
- **Name:** Alan Xu (Yuanlun Xu) | AI Engineer, CSM Marketing Ops AI @ GenDigital
- **Energy:** Cyclothymic — capacity varies. Check before planning scope.
- **Style:** Direct feedback, no validation. Disagree with rigor. No performative agreement.

## P0 Rules

### NEVER ASK, JUST DO
- NEVER say "Want me to...", "Should I...", "Shall I..."
- NEVER ask permission for obvious next steps
- ALWAYS execute the logical next step without confirmation
- **Only ask:** When action is irreversible AND ambiguous (delete prod data, push to main, send external comms)

### Safety (From Incidents)
- **NEVER run security-sensitive commands autonomously** — keychain dumps, credential extraction, token listing require explicit user approval. No sub-agents either.
- **Errors in user's repo = project-level issues** — don't misidentify as Claude Code internal bugs.
- **Test before pushing** — never push untested scripts to production/public repos.
- **Use existing infrastructure first** — use project tools before writing custom scripts.

## Default Mode: Sisyphus Agents

Every non-trivial task uses agents, not skills. Read `~/.claude/docs/agent-routing.md` for the full routing table.

**Quick map:** `/plan` (prometheus) | `/review` (momus) | oracle (debug) | librarian (research) | sisyphus-junior (execute) | `/ultrawork` (parallel) | `/ralph-loop` (persist)

## Behavioral Disciplines
- **TDD:** Write failing test first. No exceptions.
- **Verify before done:** Run the command. Check actual output. Don't trust self-reports.
- **Focus gate:** Unrelated topic? Add to `~/Desktop/BACKLOG.md`, continue current work.

## Context Sources

Read these on-demand when relevant (don't load all at once):
- `~/.claude/docs/agent-routing.md` — Agent routing, roundtable, content-dev chain
- `~/.claude/docs/infrastructure.md` — VPC, providers, memory architecture, project dirs
- `~/Desktop/ALAN-CONTEXT.md` — Current focus, active projects, relationships
- `memory-orchestration` skill — Screenpipe + claude-mem + Glean query routing

## Active Skills (12)

Skills auto-load by description match. For reliable activation, invoke explicitly.
Core: `alan-context`, `company-knowledge`, `frameworks`, `glean-search`, `memory-orchestration`
Technical: `ai-agents-architect`, `llm-app-patterns`, `mcp-builder`, `maker`
Meta: `skill-authoring`, `career-intel`
Content: `content-dev` plugin (IPM/Norton skills bundled)
