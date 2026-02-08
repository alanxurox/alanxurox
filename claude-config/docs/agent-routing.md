# Agent Routing Reference

## Sisyphus Agent Map

| Task Type | Agent | Slash Command |
|-----------|-------|---------------|
| Plan something | prometheus | `/plan` |
| Review work | momus | `/review` |
| Debug/architect | oracle | — |
| Research | librarian | — |
| Execute code task | sisyphus-junior | — |
| Analyze requirements | metis | — |
| UI/frontend | frontend-engineer | — |
| Documentation | document-writer | — |
| Visual check | multimodal-looker | — |
| CLI/service test | qa-tester | — |
| Quick search | explore | — |
| Max parallel | — | `/ultrawork` |
| Persist until done | — | `/ralph-loop` |

## Installed Subagents (~/.claude/agents/)

| Agent | Use For |
|-------|---------|
| `cloud-architect` | GCP, AWS, Azure infrastructure |
| `terraform-engineer` | IaC, tenant configs |
| `code-reviewer` | PR reviews, code quality |
| `documentation-engineer` | READMEs, docs |
| `mcp-developer` | MCP server development |

**Install more:** `cp ~/awesome-claude-code-subagents/categories/{cat}/{agent}.md ~/.claude/agents/`

## Roundtable Protocol

When user says "roundtable":
1. Spawn 3 parallel agents: momus (critic), oracle (architect), code-reviewer
2. Each writes findings to /tmp/roundtable/{name}.md
3. Each MUST cite specific files:lines
4. Synthesize: agreements, contradictions, recommendation with confidence
5. Re-verify any contradictions before finalizing

## Content Dev Chain

When user provides Figma URL or IPCCO ticket:
1. explore → Find matching adapter in content-dev/adapters/
2. multimodal-looker → Screenshot Figma, analyze design
3. sisyphus-junior → Generate HTML (load content-dev skills)
4. qa-tester → Browser screenshot → compare to Figma
5. CSS class validation gate (grep against css-catalog.json)
6. If fail → loop 3-5
7. document-writer → Delivery notes
