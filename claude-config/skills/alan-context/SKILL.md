---
name: alan-context
description: "Use when needing Alan's full personal context, understanding his work patterns, relationships, or cyclothymia considerations - comprehensive personal knowledge base"
---

# Alan Xu — Full Context

## Identity

| Field | Value |
|-------|-------|
| **Name** | Alan Xu (Yuanlun Xu) |
| **Role** | AI Engineer, CSM Marketing Ops AI @ GenDigital |
| **Manager** | Allan Rogoyski (Sr. Director, CSM Marketing Ops) |
| **Location** | Prague (visa-locked 2 years) |
| **Age** | 25 |
| **Partner** | Jin Tian (瑾田) |

## Cyclothymia Pattern

**This affects planning. Always consider.**

- Energy and capacity fluctuate in cycles
- Some days: high output, deep focus, long sessions
- Some days: low energy, need recovery
- Pattern: Often productive burst → need rest → productive burst

### Planning Implications

| Energy State | Appropriate Work |
|--------------|------------------|
| **High** | Deep implementation, complex problems, outreach |
| **Low** | Admin tasks, reading, light planning |
| **Unknown** | Ask before assuming capacity |

### What Helps
- Don't overcommit on low-energy days
- Batch social/outreach tasks for high-energy windows
- Acknowledge the pattern, don't fight it
- Recovery is productive (enables next burst)

## Communication Preferences

- **Direct over diplomatic** — Say what you mean
- **Rigor over agreement** — Disagree if warranted
- **Evidence over opinion** — Show the reasoning
- **Strategic thinking** — Consider workplace politics
- **No performative validation** — "You're absolutely right" is useless

### What to Avoid
- Excessive praise or validation
- Hedging when you have a clear view
- Agreeing to avoid friction
- Time estimates (I'll judge timing myself)
- Asking user to clarify before trying a search (if about to ask → search first; if confident → just act)
- Building/architecting without checking industry standards first

### When Building or Updating Skills/Systems
**Always research first:** Before creating or modifying any skill, architecture, or system:
1. Search for industry standards, open source patterns, proven approaches
2. Check GitHub stars, community sentiment, "awesome-X" lists
3. Compare multiple approaches — don't just pick first result
4. Look for: hackathon winners, highly-starred repos, expert recommendations
5. Adopt good patterns, don't reinvent poorly
6. Cite sources when implementing

**Evaluation criteria:**
- GitHub stars/forks (community validation)
- Recent activity (maintained?)
- Quality of documentation
- Does it solve the actual problem?
- Complexity vs benefit tradeoff

**Critical check: Syntactic vs Semantic problems**
Before dismissing a complex solution as "overkill":
1. Ask: Is this problem fundamentally **syntactic** (patterns, structure) or **semantic** (meaning, concepts)?
2. If semantic (e.g., "names", "action items", "things that matter"), pattern matching WILL fail
3. Don't optimize for simplicity when correctness requires understanding
4. Clues you're in semantic territory: user mentions "recall", "what did I say about", "anything related to"

**Anti-pattern caught [2026-01]:** Dismissed claude-mem as "too complex" when building memory hooks, then used grep patterns for semantic extraction. Pattern matching can't solve "what matters" — that requires LLM understanding.

Examples: `everything-claude-code` (6k+ stars), `claude-mem`, `Continuous-Claude`, agentskills.io spec

## Work Context (Jan 2026)

### Current Situation
- Solo developer on multiple initiatives
- No dedicated mentorship
- $300 in personal Claude Code invoices (Allan pursuing team licenses)
- Feeling professionally isolated at times

### Key Relationships

#### Allan Rogoyski (Manager)
- Has "vibe code" expectations from podcast demos
- Wants AI to be nearly autonomous
- Quote (Jan 22): "Unless you can vibe code it in a few hours, not my priority"
- **Approach:** Don't try to educate directly. Let results speak.

#### Filip Brebera (Colleague — LEAVING)
- Asked to resign by end of January (verified)
- Strategy: Let them fire him for 1 extra month
- Will hand off email automation work to me
- Direct warning: "you will need to take over my genius vibecoded slop email agent"
- **Risk:** Absorbing his work is unsustainable without tradeoffs

#### Dzianis Hancharyk (Colleague)
- QA Automation: Copy checker, Design checker
- Shares OPSAI GCP ownership with me and Filip
- If Filip leaves, more falls to us

### Political Navigation

- Allan may conflate "AI-driven" with "fully autonomous"
- Don't position collaboration as "education for Allan"
- Frame meetings as "synergy opportunities"
- Let discoveries happen through engagement, not lectures

## Tools & Workflow

### Primary: Claude Code
- Main development tool
- Skills-based approach for domain knowledge
- Personal invoices accumulating (~$300)

### Knowledge Management
- **No Notion/Obsidian** — AI conversations only
- Context transfers via handoff markdown files
- Skills capture procedural knowledge
- Session continuity through ledgers/handoffs

### Projects
- `content-dev-skills` — IPM style guides as Agent Skills
- May inherit Filip's email automation
- OPSAI GCP tenant ownership

### Career Management
- **Salary gap:** 85K CZK/month (31% below Prague median 123K)
- **BATNA building:** Anthropic, HuggingFace, Cohere, Mistral targets
- **Review timing:** March-May 2026
- **Career skills:** `/career-intel` (monitoring), `/career-asset-sync` (publishing)
- **Deliverables:** `~/career/CAREER-ASSESSMENT-2026-02-01.md`, `BRAG-DOC-2026.md`, etc.

## Personal Context

- Partner: 瑾田 (Jin Tian)
- Manages energy cycles consciously
- Values autonomy and direct communication
- Thinks strategically about workplace dynamics
- Prague-based, visa constraints for 2 years
