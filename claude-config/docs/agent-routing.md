# Agent Routing Reference

## OMC Agent Map (oh-my-claudecode v4.2+)

| Task Type | Agent | Slash Command |
|-----------|-------|---------------|
| Plan something | planner | `/plan` |
| Review work | critic | `/review` |
| Debug/architect | architect | — |
| Research | researcher | — |
| Execute code task | executor | — |
| Analyze requirements | analyst | — |
| UI/frontend | designer | — |
| Documentation | writer | — |
| Visual check | vision | — |
| CLI/service test | qa-tester | — |
| Quick search | explore | — |
| Security audit | security-reviewer | — |
| Build errors | build-fixer | — |
| TDD workflow | test-engineer | — |
| Code quality | code-reviewer | — |
| Data analysis | scientist | — |
| Deep impl | deep-executor | — |
| Max parallel | — | `/ultrawork` |
| Persist until done | — | `/ralph` |
| Team orchestration | — | `/team` |

## Installed Subagents (~/.claude/agents/)

| Agent | Use For |
|-------|---------|
| `cloud-architect` | GCP, AWS, Azure infrastructure |
| `terraform-engineer` | IaC, tenant configs |
| `code-reviewer` | PR reviews, code quality |
| `documentation-engineer` | READMEs, docs |
| `mcp-developer` | MCP server development |

**Install more:** `cp ~/awesome-claude-code-subagents/categories/{cat}/{agent}.md ~/.claude/agents/`

## Roundtable Protocol (Dynamic)

When user says "roundtable":

### Phase 1: Triage (explore, haiku — fast/cheap)
- Classify the problem: security? perf? UX? architecture? logic bug? API contract?
- Identify affected domains and files
- Output: `problem_class[]`, `affected_files[]`, `risk_level`

### Phase 2: Expert Selection (map class → agents)

| Problem Class | Primary Expert | Secondary Expert |
|---------------|---------------|-----------------|
| Security concern | security-reviewer | architect |
| Performance issue | performance-reviewer | architect |
| API/contract change | api-reviewer | quality-reviewer |
| UI/UX problem | designer | ux-researcher |
| Logic bug | debugger | test-engineer |
| Architecture smell | architect | analyst |
| Code quality | quality-reviewer | style-reviewer |
| Data/analytics | scientist | analyst |
| Product direction | product-manager | analyst |

Always add **1 generalist** (critic or code-reviewer) as tie-breaker → total 3 experts.

For high risk_level: add a 4th expert from the secondary column.

### Phase 3: Roundtable Execution
1. Spawn selected experts in parallel (3-4 agents)
2. Each writes findings to `/tmp/roundtable/{name}.md`
3. Each MUST cite specific `file:line` references
4. Synthesize: agreements, contradictions, recommendation
5. Weight domain expert opinion > generalist on domain-specific questions
6. Re-verify any contradictions before finalizing

## Content Dev Chain

When user provides Figma URL or IPCCO ticket:
1. explore → Find matching adapter in content-dev/adapters/
2. vision → Screenshot Figma, analyze design
3. executor → Generate HTML (load content-dev skills)
4. qa-tester → Browser screenshot → compare to Figma
5. CSS class validation gate (grep against css-catalog.json)
6. If fail → loop 3-5
7. writer → Delivery notes
