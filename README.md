# Alan Xu — AI Workflow Systems Engineer

Building production AI workflows that survive real enterprise constraints.

## What I Build

- **Production email agent** (NEMO) — Figma-to-SFMC delivery pipeline with targeting, QA gates, sendout preflight, and Langfuse observability. Sole owner, 6 PRs shipped since Feb 2026
- **SFMC Catalog MCP server** — SQLite + Chroma-backed semantic search over email templates and snippets, deployed via TeamCity/Kubernetes
- **Deterministic validation systems** — CSS class validation via grep + whitelist (28% to 100% accuracy across 200+ screens), not prompt tuning
- **Workflow automation for messy environments** — spec-driven automation, human-in-the-loop approval gates, preflight checks, reuse-first targeting
- **Internal developer tooling** — better-litellm proxy (40 commits, 6 releases, security hardened), adopted org-wide for Claude Code users

## Current Work

- Extending NEMO email agent into full Rapid Response / DTC delivery workflow: proof chains, QA gates, targeting preview, Composer-triggered handoffs
- Building MCP servers for enterprise systems (SFMC catalog, Jira, BigQuery)
- Production observability: Langfuse tracing, eval sampling, build-stamped traces, health endpoints
- Shipped 74 revenue-facing campaigns including Product Recommender (8%+ bookings uplift, ~$3.4M program)

## Tech Stack

![Python](https://img.shields.io/badge/Python-3.11-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Claude](https://img.shields.io/badge/Claude-API-blue) ![MCP](https://img.shields.io/badge/MCP-Protocol-purple) ![GCP](https://img.shields.io/badge/GCP-Terraform-orange)

**Core:** Python, TypeScript, Claude API, Model Context Protocol, LangGraph/Pydantic AI
**Infrastructure:** GCP, Docker, Kubernetes, TeamCity, Langfuse, SQLite, Chroma
**Domains:** AI workflow automation, email delivery systems, enterprise content pipelines, observability

## By The Numbers

- **13K+** lines shipped across 4 PRs in the last week alone
- **74** revenue-facing campaigns delivered (Jira-verified)
- **875** design system classes catalogued for AI consumption
- **178** TDD tests in content validation system
- **28% to 100%** CSS accuracy via deterministic gates
- **25** stars on mission-control (agent fleet coordination, Bash + SQLite)

## Open Source

- **[mission-control](https://github.com/alanxurox/mission-control)** — Coordination layer for agent fleets. Bash + SQLite, zero dependencies. 25 stars
- **[better-litellm](https://github.com/alanxurox/better-litellm)** — HTTP proxy + CLI for Claude Code with LiteLLM. Security hardened, zero external deps
- **[oh-my-claudecode](https://github.com/jujumilk3/oh-my-claudecode)** — Multi-agent orchestration framework (7K+ stars). Contributor
- **[Voca](https://voca.zhengyishen.com)** — macOS speech-to-text. Shipped entitlement + audio fixes in Swift/Xcode

## Background

**Babson College** — Technology Entrepreneurship + Business Analytics (STEM)
**GenDigital** — Sr Software Engineer (AI Focus), Marketing Ops AI Team
**Prague, CZ** | Open to remote EU

I care about reliability over demos, honest assessment of what AI can and can't do, and building systems other people can actually operate.

## Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/alanxurox)
