---
name: company-knowledge
description: "Use when needing GenDigital context, understanding team structures, key people dynamics, or company architecture - organizational knowledge base"
---

# GenDigital Company Knowledge

## Organization Structure

### Alan's Position
- **Team:** CSM Marketing Ops AI
- **Reports to:** Allan Rogoyski (Sr. Director)
- **Colleagues:** Filip Brebera, Dzianis Hancharyk
- **Function:** AI engineering for marketing operations

### Key Teams & People

#### AI Team (CSM Marketing Ops)

| Person | Role | Status | Notes |
|--------|------|--------|-------|
| **Allan Rogoyski** | Sr. Director | Active | Has "vibe code" expectations |
| **Filip Brebera** | Engineering Lead | Leaving (Jan/Feb) | Email automation, React templates |
| **Dzianis Hancharyk** | QA Automation | Active | Copy checker, Design checker |
| **Alan Xu** | AI Engineer | Active | content-dev-skills, IPM |

#### Mobile Team (AI SDLC Reference)

| Person | Role | Notes |
|--------|------|-------|
| **Nikhil Salunke** | Mobile AI SDLC Creator | 7-phase AI-augmented workflow |
| **Tomas Motal** | Engineering Director | Allan meeting him about AI SDLC |
| **Vasile Butnaru** | IPM Platform | Evaluating Mobile SDLC framework |

#### Content Dev Adjacent

| Person | Role | Notes |
|--------|------|-------|
| **Andrea Bruni** | Content Dev | Has `ai-workspace-figma-to-html` repo |
| **Dan Kunz** | Templates | Mamba template expert |
| **Julian Xu** | IPM Content Dev | Same name = easy intro |
| **Ricardo Lucha** | IPM Team | Team structure knowledge |
| **Jan Preiss** | Business Owner | Filip's React email demo audience |

---

## Key Projects & Initiatives

### Mobile AI SDLC (Reference Model)
- 7-phase AI-augmented workflow
- Plugin architecture for Claude Code
- Marketplace distribution
- Results: PDF Scanner in 3 days (was estimated months)

**Key insight:** "AI is used to improve clarity, not to replace decision-making. Not a push button solution — human ownership remains essential."

### Agent Skills Adoption
- CTO KB adopted Agent Skills (Jan 19, 2026)
- VPN team using skills approach
- Mobile team has plugin marketplace

### Filip's Projects (May Inherit)
- AI-Powered Email Automation (Stage 1 CLOSED)
- React email templates
- DE Copy Connector
- LangGraph → Pydantic AI migration
- `deployment-skills` repo for LUFT

### Dzianis Projects
- MailChecker Automation (CLOSED/COMPLETE Jan 19)
- Copy checker + Design checker (production rollout)
- IPM use cases added to roadmap (Jan 16)

---

## Technical Architecture

### Repositories

| Repo | Purpose | Location |
|------|---------|----------|
| `content-dev-skills` | IPM style guides as Skills | `git.int.avast.com/ipm/content-dev-skills` |
| `ai-workspace-figma-to-html` | Andrea's Figma workflow | `git.int.avast.com/bruni/ai-workspace-figma-to-html` |
| `deployment-skills` | Filip's LUFT deployment | `git.int.avast.com/NEMO/deployment-skills` |
| `styleguide-standardized` | Actual CSS source of truth | Internal |

### Infrastructure

| System | Purpose | Notes |
|--------|---------|-------|
| OPSAI GCP | AI operations tenant | Owners: Alan, Filip, Dzianis |
| SFMC | Salesforce Marketing Cloud | Filip's email domain |
| Jira | Project management | MCP integration available |
| Figma | Design source | MCP integration available |
| Glean | Internal search | MCP server at `gendigital-be.glean.com` |

### Integration Patterns

- **MCP Servers:** Jira, Figma, Confluence, GitHub, Glean
- **Agent Skills:** `agentskills.io` standard
- **Claude Code:** Primary AI tool

---

## Political Dynamics

### Allan's Expectations
- Influenced by podcast demos of "vibe coding"
- Wants near-autonomous AI development
- Quote: "Unless you can vibe code it in a few hours, not my priority"
- Meeting Tomas Motal about AI SDLC

**Navigation:** Don't educate directly. Let results demonstrate nuance.

### Skills vs SDLC Positioning

| Mobile AI SDLC | Content-Dev Skills |
|---------------|--------------------|
| The workflow (when things happen) | The reference (what to use) |
| Works for any team | Specific to IPM content |
| Automates phases | Provides knowledge |

**Synergy:** SDLC could load Skills at "build content" phase.

### Filip Situation (Verified)

- Allan asked Filip to resign by end of January
- Filip refusing, forcing termination for extra month
- HR call was Jan 23 to negotiate exit
- Direct warning to Alan about handoff

**Action needed:**
1. Knowledge transfer before he leaves
2. Document boundaries (his work vs mine)
3. Negotiate with Allan what to drop if absorbing his work
4. Triage: what can be deprecated vs maintained

---

## Communication Channels

- **Slack:** Primary async communication
- **Confluence:** Documentation, wikis
- **Jira:** Task tracking
- **Zoom:** Meetings (transcripts saved locally)

### Key Slack Channels
- AI Team channels
- IPM content dev channels
- Consider: `#content-dev-ai-experiments` for Skills testing

---

## Validated Facts (Glean-Checked Jan 2026)

| Claim | Status |
|-------|--------|
| Agent Skills adopted by CTO KB | Verified Jan 19 |
| Nikhil's SDLC PDF Scanner 3 days | Verified (10x Tracker) |
| MailChecker CLOSED/COMPLETE | Verified Jan 19 |
| IPM use cases added to QA roadmap | Verified Jan 16 |
| Allan "vibe code in few hours" quote | Verified Slack Jan 22 |
| Filip leads AI-Powered Email Automation | Verified (Stage 1 CLOSED) |
| Filip asked to resign by end of Jan | Verified Slack Jan 19 |
| OPSAI GCP owners: Alan, Filip, Dzianis | Verified tenant.yaml |
