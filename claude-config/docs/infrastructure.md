# Infrastructure Reference

## VPC (Remote Agent Host)
- **SSH alias:** `vpc-worker` (NEVER other variations)
- **Host:** vm-201012773.onecloud.gendigital.com (root, via Zscaler)
- **Deploy agents on VPC** unless explicitly told to run locally
- **Worker health:** port 37777
- **Sync:** `~/.local/bin/sync-context-to-vpc`, `sync-artifacts-from-vpc`

## Claude Code Providers
- **Default:** Max plan (direct to Anthropic) — no ANTHROPIC_BASE_URL set
- **Fallback:** `claude-lite` alias → GenDigital LiteLLM (Bedrock)
- **Don't set global ANTHROPIC_BASE_URL** — overrides Max plan
- LiteLLM is CORPORATE (Norton/LifeLock AWS), NOT localhost

## Memory Architecture (SQLite Canonical)

| System | Role | Location |
|--------|------|----------|
| claude-mem SQLite | Canonical store | `~/.claude-mem/claude-mem.db` |
| Screenpipe | Temporal/screen/audio | `~/.screenpipe/db.sqlite` |
| VPC markdown | Async replica | `vpc-worker:~/memory/YYYY-MM-DD.md` |
| Consolidation | Pattern extraction | `~/memory/consolidation-*.md` (weekly) |
| PCB | Strategic context | `~/Desktop/ALAN-CONTEXT.md` (<300 lines) |

See `memory-orchestration` skill for query routing.

## Key Project Directories

| Directory | What |
|-----------|------|
| `~/Desktop/chatbot-poc/` | IPM Content Studio (SvelteKit + Flask) |
| `~/content-dev-skills/` | Agent Skills for IPM content dev |
| `~/email-agent/` | Filip's SFMC email agent |
| `~/agent-orchestrator/` | Mission Control CLI |
| `~/.claude-mem/` | claude-mem SQLite memory |
| `~/mamba/` | Mamba CMS source |
| `~/styleguide-standarized/` | CSS source of truth for Norton Light |

## Two Contexts (Don't Conflate)

| Context | Scope | Tools |
|---------|-------|-------|
| **Corporate (GenDigital)** | content-dev, Norton, IPM | Glean, internal repos |
| **Personal/Startup** | AI agents, side projects | External research, own infra |
