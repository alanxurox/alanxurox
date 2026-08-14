# Alan Xu — AI Systems Engineer

I build AI systems that survive contact with production: explicit tools, approval gates, observability, deterministic evaluation, durable state, and verified delivery.

Based in Prague. Native Mandarin, professional English. Former GenDigital Senior Software Engineer (AI Focus); Babson + Olin background in technology entrepreneurship, analytics, and engineering.

## What I Work On

- **Production agent systems** — led engineering for an enterprise email-delivery agent at GenDigital; authored 13/13 PRs from prototype to production across guided workflows, persistent chat state, retrieval, preflight, and Langfuse observability
- **Agent reliability and evals** — queue/drain behavior, memory, permissions, scheduling, send acknowledgement, rubric leakage, and human-grounded evaluation
- **MCP and enterprise integration** — template retrieval, Jira, BigQuery/Postgres, enterprise search, and WeChat content tooling
- **Product systems** — production campaign platforms, audience targeting, experimentation, and translating customer incidents into bounded requirements

## Selected Public Work

| Project | What it demonstrates |
|---|---|
| **[mission-control](https://github.com/alanxurox/mission-control)** | Zero-dependency coordination for agent fleets using Bash + SQLite. Task queues, health checks, and fleet state. 36 stars / 6 forks |
| **[mcp-weixin-spider](https://github.com/alanxurox/mcp-weixin-spider)** | MCP server for crawling WeChat public-account articles with browser backends and anti-bot handling |
| **[oh-my-claudecode PR #839](https://github.com/Yeachan-Heo/oh-my-claudecode/pull/839)** | Merged standalone-hook reliability guard in a 37K+ star multi-agent coding framework |
| **[better-glean](https://github.com/alanxurox/better-glean)** | Precise enterprise-search patterns across 40+ data sources |

## Selected Systems Work

Some work is private or enterprise-internal; these descriptions intentionally omit internal URLs, customer data, and infrastructure identifiers.

- **Production email agent** — guided end-to-end delivery workflow, human approval, persistent chat state, catalog retrieval, targeting/QA preflight, and observability
- **WeCom conversation archive** — sole-authored async ingest, RSA decryption/key rotation, scoped query API, Postgres schema, and media preservation; 30 commits
- **AI-assistant reliability program** — reproduced failures across queueing, durable memory, timers, permissions, rendering, and egress; converted evidence into issues and SOPs
- **better-litellm** — internal zero-dependency Node.js proxy; six releases, setup reduced from roughly 30 minutes to 2 minutes, command-injection paths fixed

## Operating Principles

1. **Generated is not delivered.** Completion requires transport, acknowledgement, and user-visible proof.
2. **Prompts cannot repair missing state.** Persistence, identity, scheduling, and routing need explicit system contracts.
3. **A valid eval needs the right oracle.** Capability smoke tests are not evidence of persona or workflow alignment.
4. **Claims need evidence.** I distinguish shipped work, measured outcomes, hypotheses, and work in progress.

## Core Stack

**AI systems:** LangGraph, Model Context Protocol, Langfuse, LiteLLM, human-in-the-loop workflows, deterministic evaluation  
**Languages:** Python, TypeScript/JavaScript, SQL, Bash  
**Application:** FastAPI, Node.js, React, Playwright/Puppeteer  
**Data:** PostgreSQL, SQLite, Chroma, BigQuery  
**Infrastructure:** GCP, AWS Bedrock, Vertex AI, Docker, Kubernetes, TeamCity

## Background

- **GenDigital** — Frontend Developer → Software Engineer → Senior Software Engineer (AI Focus), October 2023–May 2026. Norton, Avast, and AVG; the brands reach 500M+ users
- **Babson College** — BS, Technology Entrepreneurship + Business Analytics (STEM)
- **Olin College of Engineering** — cross-registered in Design & Computing

## Connect

[LinkedIn](https://linkedin.com/in/alanxurox) · [Email](mailto:yxu6@alum.babson.edu)
