# Alan Xu — Senior Engineer | AI Workflow Systems

Frontend/product engineer who moved deep into AI workflow automation. I build production systems that survive real enterprise constraints: browser behavior, internationalization, approval gates, and the gap between what an LLM generates and what actually works.

## What I Build

- **Production email agent** (NEMO) — Figma-to-SFMC delivery pipeline with targeting, QA gates, sendout preflight, and Langfuse observability. Sole owner, 6 PRs shipped since Feb 2026
- **SFMC Catalog MCP server** — SQLite + Chroma-backed semantic search over email templates and snippets, deployed via TeamCity/Kubernetes
- **Deterministic validation systems** — CSS class validation via grep + whitelist (28% to 100% accuracy across 200+ screens), not prompt tuning
- **Campaign UIs at scale** — 100+ production campaign screens across Norton, Avast, AVG with full i18n/l10n in 30+ languages
- **Internal developer tooling** — better-litellm proxy (40 commits, 6 releases, security hardened), adopted org-wide

## Current Work

- Extending NEMO into full Rapid Response / DTC delivery workflow: proof chains, QA gates, targeting preview, Composer-triggered handoffs
- Building MCP servers for enterprise systems (SFMC catalog, Jira, BigQuery)
- Production observability: Langfuse tracing, eval sampling, build-stamped traces, health endpoints
- Shipped 74 revenue-facing campaigns including Product Recommender (8%+ bookings uplift, ~$3.4M program)

## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Python](https://img.shields.io/badge/Python-3.11-green) ![React](https://img.shields.io/badge/React-Production-blue) ![Claude](https://img.shields.io/badge/Claude-API-blue) ![MCP](https://img.shields.io/badge/MCP-Protocol-purple) ![GCP](https://img.shields.io/badge/GCP-Terraform-orange)

**Frontend:** TypeScript, React, HTML/CSS, Playwright, Figma API, i18n/l10n
**AI/ML:** Python, Claude API, Model Context Protocol, LangGraph/Pydantic AI, Langfuse
**Infrastructure:** GCP, Docker, Kubernetes, TeamCity, SQLite, ChromaDB

## By The Numbers

- **100+** campaign screens shipped to 500M+ users
- **74** revenue-facing campaigns delivered (Jira-verified)
- **$3.4M** program contribution (Product Recommender, 8%+ bookings uplift)
- **875** design system classes catalogued for AI consumption
- **178** TDD tests in content validation system
- **28% to 100%** CSS accuracy via deterministic gates
- **25** stars on mission-control (agent fleet coordination)

## Open Source

- **[mission-control](https://github.com/alanxurox/mission-control)** — Coordination layer for agent fleets. Bash + SQLite, zero dependencies. 25 stars
- **[better-litellm](https://github.com/alanxurox/better-litellm)** — HTTP proxy + CLI for Claude Code with LiteLLM. Security hardened, zero external deps
- **[oh-my-claudecode](https://github.com/jujumilk3/oh-my-claudecode)** — Multi-agent orchestration framework (7K+ stars). Contributor
- **[Voca](https://voca.zhengyishen.com)** — macOS speech-to-text (Swift/KMP). Shipped entitlement + audio fixes
- **ZenX ecosystem** — Contributing to ZenX (app OS), Frost (browser), Mark (markdown editor) with Zhengyi Shen

## Background

**Babson College** — Technology Entrepreneurship + Business Analytics (STEM)
**GenDigital** — Sr Software Engineer (AI Focus), Marketing Ops AI Team
**Prague, CZ** | Open to remote EU

I care about reliability over demos, honest assessment of what AI can and can't do, and building systems other people can actually operate.

## Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/alanxurox)
