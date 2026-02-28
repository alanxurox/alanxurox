# Migration Plan: Claude Code + OMC → OpenCode + Oh My OpenCode

**Date:** 2026-02-28
**Branch:** `claude/migrate-to-opencode-iQcw5`
**Author:** Alan Xu

---

## Current Stack Inventory

| Layer | Current | Target |
|-------|---------|--------|
| Terminal agent | Claude Code (Anthropic) | OpenCode (open-source) |
| Orchestration | oh-my-claudecode (OMC) v4.3.3 | oh-my-opencode (OMO) |
| Deep worker | Codex MCP (x provider) | Hephaestus agent (native OMO) |
| Orchestrator model | Claude Opus/Sonnet | Sisyphus → Claude Opus / Kimi K2.5 |
| IDE overlay | Cursor | OpenCode terminal (complement IDE) |
| Memory (primary) | claude-mem SQLite | OMO project-memory.json + SQLite adapter |
| Memory (replica) | VPC markdown sync | VPC sync hook (ported) |
| Memory (temporal) | Screenpipe OCR | Screenpipe (unchanged) |
| Context injection | session-start.sh | session-start.sh (adapted for OpenCode) |
| Skills | 11 SKILL.md files | AGENTS.md hierarchy |
| Custom agents | 5 agent .md files | OMO custom agent configs |
| Config format | settings.json + CLAUDE.md | opencode.json + oh-my-opencode.jsonc + AGENTS.md |

---

## Phase 0: Pre-Flight Audit

Before touching anything:

```bash
# Snapshot current state
cp -r ~/.claude ~/.claude.bak-$(date +%Y%m%d)
cp -r ~/.claude-mem ~/.claude-mem.bak-$(date +%Y%m%d)

# Export SQLite to JSON for portability
sqlite3 ~/.claude-mem/claude-mem.db ".mode json" \
  "SELECT * FROM observations ORDER BY created_at DESC" > ~/memory/observations-export.json
sqlite3 ~/.claude-mem/claude-mem.db ".mode json" \
  "SELECT * FROM session_summaries ORDER BY created_at_epoch DESC" > ~/memory/sessions-export.json
```

Verify current OMC version, confirm hooks are registered, note all active plugins.

---

## Phase 1: Install OpenCode + Oh My OpenCode

### 1.1 Install OpenCode

```bash
curl -fsSL https://opencode.ai/install | bash
opencode --version  # must be 1.0.150+
```

### 1.2 Install Oh My OpenCode

```bash
# Run with your subscription flags
bunx oh-my-opencode install --no-tui \
  --claude=max20 \      # you have Max plan
  --openai=yes \        # for Hephaestus (GPT-5.3-codex)
  --gemini=no \         # add later if needed
  --copilot=no
```

**Subscription flags based on your setup:**
- `--claude=max20` — you're on Max plan (Claude Opus/Sonnet via OAuth)
- `--openai=yes` — enables Hephaestus (Codex deep worker); requires OpenAI subscription

### 1.3 Auth

```bash
opencode auth login
# → Anthropic → Claude Pro/Max → OAuth in browser
opencode auth login
# → OpenAI → API key (for Codex/Hephaestus)
```

### 1.4 Verify Plugin Install

```bash
cat ~/.config/opencode/opencode.json | grep oh-my-opencode
```

---

## Phase 2: Base Config Migration

### 2.1 settings.json → opencode.json

**Source:** `claude-config/settings.json`
**Target:** `~/.config/opencode/opencode.json`

Key translations:

```jsonc
// opencode.json
{
  "plugin": ["oh-my-opencode"],
  "model": "anthropic/claude-opus-4-6",  // default model (Sisyphus uses this)
  "autoshare": false,
  "theme": "opencode"
}
```

**Not migrated (Claude Code-specific):**
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` — OMO replaces this natively
- `enabledPlugins` block — OMO manages agents internally
- `alwaysThinkingEnabled` — not applicable in OpenCode
- `skipDangerousModePermissionPrompt` — OpenCode has its own permission model
- `statusLine` — OMO has built-in HUD (see Phase 7)

### 2.2 omc-config.json → oh-my-opencode.jsonc

**Source:** `claude-config/omc-config.json`
**Target:** `.opencode/oh-my-opencode.jsonc`

```jsonc
// .opencode/oh-my-opencode.jsonc
{
  // Default execution: Sisyphus with parallel sub-delegation
  // OMO default is already equivalent to OMC "ultrawork"

  // Agent model overrides (optional — OMO defaults are good)
  // "agents": {
  //   "sisyphus": { "model": "anthropic/claude-opus-4-6" },
  //   "hephaestus": { "model": "openai/gpt-5.3-codex" }
  // }

  // OMC had maxAgents: 3 — OMO orchestrates this automatically
}
```

OMO's default config is already aggressive (parallel execution, Sisyphus orchestration). Start minimal, tune later.

### 2.3 claude-proxy.json

**LiteLLM proxy** is not OMO-specific — it's a network layer. For OpenCode:

```bash
# Option A: Continue using LiteLLM proxy for OpenAI-compatible endpoint
# In opencode.json, add a custom provider pointing to litellm:8787

# Option B: Direct Anthropic OAuth (Max plan) + direct OpenAI key
# Simpler, lower latency, already configured in Phase 1.3
```

**Recommendation:** Use direct auth for now. Add LiteLLM proxy when GenDigital Bedrock cost optimization is needed.

---

## Phase 3: CLAUDE.md → AGENTS.md Hierarchy

This is the most critical migration. OMO uses `AGENTS.md` for context injection instead of `CLAUDE.md`.

### 3.1 Root AGENTS.md (Global Identity)

**Source:** CLAUDE.md user customizations section (lines 326–end)
**Target:** `~/AGENTS.md`

Create `~/AGENTS.md` with:
- Identity block (Alan Xu, AI Engineer @ GenDigital)
- P0 rules (NEVER ASK JUST DO, merge gates, safety rules)
- Behavioral disciplines (TDD, verify before done, focus gate)
- Energy / capacity note (cyclothymic — check scope before planning)
- Tool stack

```bash
# Generate AGENTS.md hierarchy across all your project dirs
opencode  # inside a project
# Then run:
/init-deep
```

OMO's `/init-deep` walks the codebase and generates hierarchical `AGENTS.md` files at each level. Run this in:
- `~` (global)
- `~/voca-app`
- `~/content-dev-skills` (if applicable)
- `~/chatbot-poc` (if applicable)

### 3.2 OMC Agent Catalog → OMO Agent Catalog

**OMC → OMO agent mapping:**

| OMC Agent | OMO Equivalent | Notes |
|-----------|---------------|-------|
| `explore` (haiku) | Explore (MiniMax M2.5 Free → Haiku) | Same role, faster default |
| `planner` (opus) | Prometheus (Opus → GPT-5.2) | Interview-first strategist |
| `architect` (opus) | Prometheus / Sisyphus | Sisyphus handles architecture too |
| `executor` (sonnet) | Sisyphus | Main worker |
| `deep-executor` (opus) | Hephaestus | GPT-5.3-codex, goal-oriented deep work |
| `analyst` (opus) | Prometheus | Requirements + acceptance criteria |
| `verifier` (sonnet) | Sisyphus verify phase | Built into Sisyphus loop |
| `debugger` (sonnet) | Sisyphus | Root-cause, Sisyphus iterates |
| `quality-reviewer` (sonnet) | Momus | Critic role |
| `security-reviewer` (sonnet) | Oracle | Security + reasoning |
| `code-reviewer` (opus) | Oracle + Momus | Comprehensive review |
| `test-engineer` (sonnet) | Sisyphus (TDD mode) | TDD via Sisyphus instruction |
| `build-fixer` (sonnet) | Sisyphus | Build errors, iterative fix |
| `designer` (sonnet) | Multimodal Looker | Visual/UX, Kimi K2.5 |
| `writer` (haiku) | Librarian / Atlas | Docs, migration notes |
| `scientist` (sonnet) | Oracle | Data/statistical analysis |
| `document-specialist` (sonnet) | Librarian + Context7 MCP | External docs, faster via built-in MCP |
| `critic` (opus) | Momus | Plan/design critical challenge |

**OMC Team Pipeline → OMO equivalent:**
- `team-plan → team-prd → team-exec → team-verify → team-fix` maps directly to Sisyphus's internal loop
- Use `/team` in OMO for explicit multi-agent orchestration

### 3.3 OMC Skill Commands → OMO Equivalents

| OMC Command | OMO Equivalent | Keyword |
|-------------|---------------|---------|
| `/autopilot` | Sisyphus autonomous | "build me", "I want a" |
| `/ralph` | Sisyphus persistence | "don't stop", "must complete" |
| `/ultrawork` | Default parallel exec | "ultrawork", "ulw" |
| `/team` | Sisyphus + parallel | "team", "coordinated" |
| `/plan` | Prometheus interview | "plan this", "plan the" |
| `/deepinit` | `/init-deep` | "deepinit" |
| `/analyze` | Sisyphus debug | "analyze", "debug" |
| `/code-review` | Oracle + Momus | "review code" |
| `/security-review` | Oracle | "security review" |
| Roundtable | Prometheus → Oracle + Momus | "roundtable" |

---

## Phase 4: Hooks Migration

OpenCode supports the same hook events as Claude Code. All hooks are portable with minor adaptations.

### 4.1 Hook Event Mapping

| Claude Code Event | OpenCode Event | Status |
|-------------------|---------------|--------|
| `SessionStart` | `SessionStart` | Direct port |
| `SessionEnd` | `SessionEnd` | Direct port |
| `PreCompact` | `PreCompact` | Direct port |
| `UserPromptSubmit` | `UserPromptSubmit` | Direct port |
| `Stop` | `Stop` | Direct port |
| `PreToolUse` | `PreToolUse` | Direct port |
| `PostToolUse` | `PostToolUse` | Direct port |

### 4.2 Hook-by-Hook Migration

**session-start.sh** → Port as-is. OpenCode passes same JSON structure.
- Change output path from `~/.claude/hooks/` to `~/.config/opencode/hooks/`
- SQLite query logic unchanged (claude-mem.db stays)
- VPC sync logic unchanged

**session-end.sh** → Port as-is.
- SQLite insert unchanged
- VPC memory format unchanged
- Replace `generate-session-report.sh` path

**pre-compact-extract.sh** → Port as-is. OpenCode has same PreCompact event.

**time-inject.sh** → Port as-is. Returns `additionalContext` JSON.

**skill-eval.sh** → **Deprecated.** OMO handles skill/agent routing internally. Replace with OMO's built-in keyword detection. Remove from hooks.

**sync-to-vpc.sh** → Port as-is. `Stop` event fires on session end.

**jira-gate.sh** → Port as-is. `PreToolUse` matcher syntax is compatible if your Jira MCP tool names match.

**consolidate-learnings.sh**, **hourly-memory-sync.sh**, **mac-to-vpc-sync.sh** → External cron jobs. No changes needed — these run independently.

### 4.3 OpenCode Hook Registration via Plugins

**CRITICAL UPDATE:** OpenCode does NOT use a `hooks` config block like Claude Code. Instead, hooks are implemented as **JavaScript/TypeScript plugins** in `~/.config/opencode/plugins/` or `.opencode/plugins/`.

**Target:** `~/.config/opencode/plugins/claude-hooks.ts`

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export const ClaudeHooksPlugin: Plugin = async ({ directory, worktree }) => {
  // Session start hook
  const sessionStartResult = await execAsync(
    `$HOME/.config/opencode/hooks/session-start.sh`,
    { timeout: 10000, env: { ...process.env, CWD: directory, WORKTREE: worktree } }
  ).catch(e => ({ stdout: "", stderr: e.message }))
  
  return {
    // Session events
    "session.created": async ({ session }) => {
      // Re-run session start on new sessions if needed
    },
    
    "session.idle": async ({ session }) => {
      // Session end hook
      await execAsync(`$HOME/.config/opencode/hooks/session-end.sh`, { timeout: 30000 })
    },
    
    "session.compacted": async ({ session }) => {
      // Pre-compact hook
      await execAsync(`$HOME/.config/opencode/hooks/pre-compact-extract.sh`, { timeout: 30000 })
    },
    
    // Tool events (replaces PreToolUse)
    "tool.execute.before": async (input, output) => {
      // JIRA gate
      if (input.tool.match(/mcp__sdlc-jira__(create_issue|update_issue|add_comment)/)) {
        const result = await execAsync(`$HOME/.config/opencode/hooks/jira-gate.sh`, { timeout: 5000 })
        if (result.stderr) throw new Error(result.stderr)
      }
    },
  }
}
```

**Event Mapping (Claude Code → OpenCode Plugin):**

| Claude Code Event | OpenCode Plugin Event | Notes |
|-------------------|----------------------|-------|
| `SessionStart` | Plugin init + `session.created` | Plugin runs at load; use `session.created` for per-session logic |
| `SessionEnd` | `session.idle` | Fires when session becomes idle |
| `PreCompact` | `session.compacted` | Fires after compaction (use `experimental.session.compacting` for before) |
| `UserPromptSubmit` | `tui.command.execute` | TUI-specific; no direct CLI equivalent |
| `Stop` | `session.idle` | Use idle as proxy for stop |
| `PreToolUse` | `tool.execute.before` | Receives `input` with tool name, can throw to block |
| `PostToolUse` | `tool.execute.after` | Receives input and output |

**Key Differences:**
1. Hooks are JS/TS, not bash — but can shell out to existing scripts
2. No `matcher` regex in config — implement matching in JS
3. Timeout handled via `execAsync` options, not config
4. Plugin context provides `directory`, `worktree`, `client`, `$` (Bun shell)

---

## Phase 5: Memory Architecture Migration

### 5.1 What Stays the Same

- `~/.claude-mem/claude-mem.db` — SQLite canonical store. Untouched. Both systems can query it.
- `vpc-worker:~/memory/` — VPC markdown. Untouched.
- `~/memory/consolidation-*.md` — Pattern consolidation. Untouched.
- Screenpipe at `~/.screenpipe/db.sqlite` — Untouched.

### 5.2 OMO Memory Layers (Additive)

OMO adds two new memory surfaces that complement (not replace) existing memory:

**Project Memory** (`{project}/.omc/project-memory.json`):
- Tech stack, conventions, build commands, structural notes
- Persists across sessions within a project
- Use `project_memory_write` tool to populate after `/init-deep`

**Notepad** (`{project}/.omc/notepad.md`):
- Session working memory (auto-pruned after 7 days)
- Priority section (max 500 chars, loaded every session)
- Manual section (permanent)

### 5.3 Memory Continuity

Port your recent claude-mem observations to OMO project memory for the most active projects:

```bash
# Query recent observations for a project
sqlite3 ~/.claude-mem/claude-mem.db \
  "SELECT narrative FROM observations WHERE title LIKE '%voca%' ORDER BY created_at DESC LIMIT 10"

# Then seed OMO project memory via the tool inside OpenCode:
# project_memory_add_note("Voca: Re-signing invalidates accessibility TCC per-signature...")
```

### 5.4 claude-mem Plugin

The `claude-mem@thedotmack` plugin is Claude Code-specific. Options:
1. **Keep querying it externally** — your hooks already do this, no change needed.
2. **Write an OpenCode adapter** — thin script that writes session summaries to both claude-mem SQLite and OMO project memory.

**Recommendation:** Keep the hook-based SQLite writes. They work regardless of which tool you're in.

---

## Phase 6: Skills Migration

### 6.1 Skill-to-AGENTS.md Mapping

OMO doesn't use SKILL.md files — context lives in AGENTS.md and OMO's agent system prompts.

| OMC Skill | Migration Path |
|-----------|---------------|
| `alan-context` | Root `~/AGENTS.md` — Identity, energy, relationships, context sources |
| `company-knowledge` | Root `~/AGENTS.md` — GenDigital section |
| `memory-orchestration` | `session-start.sh` hook (already migrated in Phase 4) |
| `ai-agents-architect` | Root `~/AGENTS.md` — Architecture section OR custom Prometheus persona |
| `llm-app-patterns` | Root `~/AGENTS.md` — Patterns section |
| `mcp-builder` | Project-level AGENTS.md in MCP projects + OMO Librarian MCP (Context7) |
| `maker` | Root `~/AGENTS.md` — Maker mode section (speed-optimized, ship bias) |
| `skill-authoring` | Deprecated in OMO — AGENTS.md is the authoring surface |
| `frameworks` | Root `~/AGENTS.md` — Frameworks section |
| `glean-search` | Glean MCP server (port existing MCP, or use OMO built-in grep_app) |
| `career-intel` | Root `~/AGENTS.md` — Career context + `career-intel.sh` external cron |

### 6.2 Root AGENTS.md Template

```markdown
# Alan Xu — Global Agent Context

## Identity
- AI Engineer, CSM Marketing Ops AI @ GenDigital
- Cyclothymic capacity — ask scope before large commitments
- Style: direct feedback, no validation, disagree with rigor

## P0 Rules
### NEVER ASK, JUST DO
- Never say "Want me to...", "Should I...", "Shall I..."
- Execute the logical next step without confirmation
- Only ask when irreversible AND ambiguous

### Merge & Release Gates
- NEVER merge PRs without explicit approval
- Run code-reviewer + tests before any merge
- Force push to feature branches OK; main NEVER

### Safety
- Security-sensitive commands require explicit approval
- Test before pushing
- Use existing infrastructure before writing new scripts

## Tool Stack
- **Terminal AI:** OpenCode + Oh My OpenCode (Sisyphus orchestration)
- **Deep work:** Hephaestus (GPT-5.3-codex) — give goals, not recipes
- **Memory:** SQLite claude-mem + VPC markdown replica + Screenpipe
- **Infra:** GCP, Terraform, Docker, Tailscale VPC

## Behavioral Disciplines
- TDD: Write failing test first. No exceptions.
- Verify before done: Run the command. Check actual output.
- Focus gate: Unrelated topic? Add to BACKLOG.md, continue current work.

## Active Projects
- **Voca** (`~/voca-app`) — macOS menu bar voice-to-text, Swift/KMP
- **Content Dev** — 200+ screen automation, CSS validation gates
- **MCP infrastructure** — 32 adapters, enterprise scale

## Context Sources (load on-demand)
- `~/.config/opencode/docs/agent-routing.md`
- `~/.config/opencode/docs/infrastructure.md`
- `~/Desktop/ALAN-CONTEXT.md`
```

---

## Phase 7: HUD & Status Line

**Current:** `hud-wrapper.sh` in Claude Code status line.
**Target:** OMO has a built-in HUD that displays Sisyphus state, agent count, token usage.

The OMO HUD is enabled by default. Your `hud-wrapper.sh` can be retired or kept for supplementary info in tmux.

---

## Phase 8: MCP Server Migration

### 8.1 MCP Mapping

| Claude Code MCP | OpenCode/OMO Equivalent | Action |
|-----------------|------------------------|--------|
| `mcp__x__ask_codex` (Codex) | Hephaestus agent (native) | **Retire** — Hephaestus replaces this |
| `mcp__g__ask_gemini` (Gemini) | `opencode-antigravity-auth` plugin | **Port** if you need Gemini 3 Pro |
| Context7 | OMO built-in Context7 MCP | **Auto-included** |
| Exa/websearch | OMO built-in Exa MCP | **Auto-included** |
| `mcp__sdlc-jira__*` | Custom MCP (portable) | **Port as-is** |
| `mcp__mcp-teamcity__*` | Custom MCP (portable) | **Port as-is** |
| Figma | Custom MCP (portable) | **Port as-is** |
| Agent Skills (Glean) | Port Glean MCP to OpenCode | **Port** |

### 8.2 Adding Existing MCP Servers to OpenCode

```jsonc
// In opencode.json, under "mcp":
{
  "mcp": {
    "jira": {
      "command": "node",
      "args": ["/path/to/jira-mcp-server/index.js"],
      "env": { "JIRA_TOKEN": "${JIRA_TOKEN}" }
    },
    "teamcity": {
      "command": "...",
      "args": [...]
    }
  }
}
```

---

## Phase 9: Custom Agents Migration

**Current:** 5 agent `.md` files in `claude-config/agents/`
**Target:** OMO custom agent configs in `.opencode/oh-my-opencode.jsonc`

```jsonc
// .opencode/oh-my-opencode.jsonc
{
  "agents": {
    // Override Sisyphus model if preferred
    "sisyphus": { "model": "anthropic/claude-opus-4-6" },

    // Custom agent personas can be injected via project AGENTS.md
    // cloud-architect, terraform-engineer → add to root AGENTS.md sections
    // mcp-developer → project-level AGENTS.md in MCP projects
  }
}
```

The 5 custom agent definitions port cleanly into AGENTS.md sections:
- `cloud-architect.md` → `~/AGENTS.md` GCP/Infrastructure section
- `terraform-engineer.md` → `~/AGENTS.md` IaC section
- `code-reviewer.md` → OMO uses Oracle + Momus natively
- `documentation-engineer.md` → OMO uses Atlas/Librarian natively
- `mcp-developer.md` → Project AGENTS.md in MCP server projects

---

## Phase 10: Cursor Migration

Cursor (IDE with inline AI) and OpenCode (terminal agent) serve different surfaces and **can run simultaneously**. However, if using Cursor's AI was providing context you want to preserve:

1. **`.cursorrules`** → Port to root `~/AGENTS.md` (same principle: context for AI)
2. **Cursor inline autocomplete** → Not replaced by OpenCode (different surface). Cursor continues as IDE; OpenCode for agentic tasks.
3. **Cursor Composer/Agent** → Replaced by OpenCode + OMO for agentic workflows
4. **Decision:** Keep Cursor for editor, use OpenCode terminal for all agentic work.

---

## Phase 11: `cc` Launcher Migration

**Current:** `claude-config/bin/cc` — Composable Claude Code launcher
**Target:** New `oc` wrapper for OpenCode

```bash
#!/bin/bash
# ~/.local/bin/oc — OpenCode launcher

DIRECT_MODE=false
RESUME=false
WORKSPACE=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    -r|--resume) RESUME=true ;;
    --cds) WORKSPACE="$HOME/content-dev-skills" ;;
    *) break ;;
  esac
  shift
done

if [[ -n "$WORKSPACE" ]]; then
  cd "$WORKSPACE"
fi

if [[ "$RESUME" == true ]]; then
  exec opencode --continue-session
else
  exec opencode
fi
```

Update shell aliases in `.zshrc`:
```bash
alias oc='~/.local/bin/oc'                    # standard OpenCode
alias oc-cds='~/.local/bin/oc --cds'          # content-dev-skills
alias oc-voca='cd ~/voca-app && opencode'      # Voca project
```

---

## Phase 12: Run Config Directory

**Current:** `~/.claude/` (Claude Code)
**Target:** `~/.config/opencode/` (OpenCode)

```bash
mkdir -p ~/.config/opencode/{hooks,docs,agents,logs}

# Port hooks
cp claude-config/hooks/session-start.sh ~/.config/opencode/hooks/
cp claude-config/hooks/session-end.sh ~/.config/opencode/hooks/
cp claude-config/hooks/pre-compact-extract.sh ~/.config/opencode/hooks/
cp claude-config/hooks/time-inject.sh ~/.config/opencode/hooks/
cp claude-config/hooks/sync-to-vpc.sh ~/.config/opencode/hooks/
cp claude-config/hooks/jira-gate.sh ~/.config/opencode/hooks/
cp claude-config/hooks/generate-session-report.sh ~/.config/opencode/hooks/
chmod +x ~/.config/opencode/hooks/*.sh

# Port docs
cp claude-config/docs/agent-routing.md ~/.config/opencode/docs/
cp claude-config/docs/infrastructure.md ~/.config/opencode/docs/
```

---

## Migration Sequence (Recommended Order)

```
Week 1 — Foundation
  ✓ Phase 0: Pre-flight snapshot
  ✓ Phase 1: Install OpenCode + OMO
  ✓ Phase 2: Base config (opencode.json, oh-my-opencode.jsonc)
  ✓ Phase 12: Copy hooks to ~/.config/opencode/hooks/

Week 2 — Context & Identity
  ✓ Phase 3: AGENTS.md hierarchy (root + /init-deep in active projects)
  ✓ Phase 5: Memory migration (seed OMO project-memory from SQLite)
  ✓ Phase 6: Skills → AGENTS.md

Week 3 — Hooks & Automation
  ✓ Phase 4: Register + test hooks in OpenCode
  ✓ Phase 8: Port MCP servers (Jira, TeamCity, Figma, Glean)
  ✓ Phase 7: Retire OMC HUD, validate OMO HUD

Week 4 — Polish & Validation
  ✓ Phase 9: Custom agents → AGENTS.md sections
  ✓ Phase 10: Cursor decision + .cursorrules port
  ✓ Phase 11: oc launcher
  ✓ Run test suite (claude-config/tests/) against new setup
  ✓ Two-week parallel run (Claude Code + OpenCode side-by-side)
  ✓ Full cutover
```

---

## What Carries Over Without Change

- All hooks (bash scripts are tool-agnostic)
- claude-mem SQLite database (stays canonical)
- VPC memory infrastructure
- Screenpipe integration
- Cron jobs (consolidate-learnings, hourly-memory-sync, etc.)
- MCP servers (Jira, TeamCity, Figma)
- Python test suite (tests against your own logic, not the agent)
- zshrc (minor alias updates only)
- LiteLLM proxy (optional, can add back when needed)

## What Gets Retired

| Item | Replacement |
|------|-------------|
| CLAUDE.md (OMC block) | AGENTS.md + oh-my-opencode.jsonc |
| oh-my-claudecode plugin | oh-my-opencode plugin |
| claude-mem plugin | Hook-based SQLite writes (unchanged) |
| ralph-wiggum plugin | Sisyphus persistence (native OMO) |
| superpowers plugin | OMO built-in capabilities |
| agent-sdk-dev plugin | OMO agent system |
| Codex MCP (x provider) | Hephaestus agent (native) |
| Gemini MCP (g provider) | Antigravity plugin (optional) |
| skill-eval.sh hook | OMO keyword detection (built-in) |
| `cc` launcher | `oc` launcher |
| HUD wrapper | OMO built-in HUD |

## What Gets Added

- OpenCode LSP integration (30+ auto-configuring language servers)
- OpenCode git snapshotting (`/undo` per step)
- Hephaestus (GPT-5.3-codex) as native deep worker — no MCP overhead
- OMO built-in MCPs: Exa websearch, Context7, grep_app (on-demand, no persistent context cost)
- Hash-anchored edits (prevents stale-line errors, OMO's "Harness Problem" fix)
- Antigravity Gemini (1M context for large multi-file tasks, optional)
- Multi-provider fallback chains (OMO auto-routes when a provider is rate-limited)

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| Hook JSON format differences | Test each hook with `opencode --dry-run` or by reading OpenCode hook docs |
| SQLite access from OMO | Not needed — hooks handle SQLite; OMO gets memory via hook context injection |
| JIRA MCP tool name changes | Verify tool names match `mcp__sdlc-jira__*` pattern in OpenCode |
| OMO model availability (Codex rate limits) | OMO auto-falls back; Hephaestus has no fallback by design (GPT-codex specific) |
| Missing claude-mem plugin | Memory continuity via hooks — no functional gap |
| Parallel run confusion | Use `cc` for Claude Code, `oc` for OpenCode during transition |

---

---

## Appendix A: OpenCode TUI vs OMC HUD

### What You Had: `cc` + OMC HUD

The `cc` launcher was a lightweight wrapper for Claude Code. The OMC HUD ran as a `statusLine` command (`hud-wrapper.sh`) — a single-line bar at the bottom showing session mode, agent state, and task counts.

**Claude Code layout (flat):**
```
┌─────────────────────────────────────────────────────┐
│  Chat message stream (full width)                   │
│                                                     │
│  > prompt input                                     │
├─────────────────────────────────────────────────────┤
│  [OMC HUD: ultrawork | agents: 3 | tasks: 2 done]  │
└─────────────────────────────────────────────────────┘
```

### What You Get: OpenCode TUI

OpenCode's TUI is a full SolidJS + Zig-native 60fps terminal application. The OMC HUD is redundant because the sidebar surfaces more data natively.

**OpenCode layout (terminal > 120 cols):**
```
┌──────────────────────────────┬──────────────────────┐
│  Message stream (scrollable) │  SESSION SIDEBAR      │
│                              │  Session title        │
│  [tool use details]          │  Context: 42k / 200k  │
│  [assistant response]        │  Cost: $0.12          │
│  [thinking blocks]           │  ─────────────────── │
│                              │  MCP: jira ✓  tc ✓   │
│                              │  LSP: typescript ✓    │
│                              │  ─────────────────── │
│                              │  TODO: 3 items        │
│                              │  Files changed: 7     │
│                              │  +142 / -38           │
├──────────────────────────────┴──────────────────────┤
│  > @ file fuzzy  |  ! bash  |  / command            │
└─────────────────────────────────────────────────────┘
```

**Sidebar shows natively — no hook needed:**
- Token context usage + cost
- MCP server connection status (color-coded)
- Active LSP servers
- TODO items extracted from conversation
- Modified files + diff line counts

**Key navigation:**
| Action | Key |
|--------|-----|
| Command palette | `Ctrl+K` |
| Switch session | `Ctrl+S` |
| File picker | `Ctrl+F` |
| New session | `/new` |
| List sessions | `/sessions` |
| Export to markdown | `/export` |
| Undo last + file changes | `/undo` |
| Compact (summarize) | `/compact` |
| Toggle tool details | `/details` |
| Toggle thinking | `/thinking` |

**Migration impact:**
- `hud-wrapper.sh` → retire. Sidebar replaces it.
- `cc` launcher → `oc` wrapper (Phase 11) or use `/sessions` picker built-in.
- Narrow terminal (< 120 cols): sidebar hides, single-panel Claude Code-style layout resumes.
- OMO overlays its Sisyphus orchestration state on top of the native sidebar.

---

## Appendix B: Session Handoff — Claude Code → OpenCode

### Option 1: `cli-continues` (Best for one-off handoffs)

[`cli-continues`](https://github.com/yigitkonur/cli-continues) handles cross-tool session handoff and supports both Claude Code and OpenCode natively.

```bash
npx continues                                   # interactive session picker
continues resume <claude-session-id> --in opencode  # direct handoff
```

**Handoff document contains:**
- Conversation history (minimal/standard/verbose/full presets)
- Tool activity: bash commands, file reads/writes, MCP tool calls
- Session metadata: model, token usage, key decisions
- File change summary and architecture context

### Option 2: Your existing hook pipeline (Best for daily use)

Your `session-end.sh` already writes to `vpc-worker:~/memory/YYYY-MM-DD.md` and `claude-mem.db`. Your `session-start.sh` for OpenCode reads those same sources. Context from a Claude Code session surfaces automatically in the next OpenCode session via the hook. **No new tooling needed.**

This is the cleanest path given your existing memory infrastructure.

### Option 3: Claude.ai web → OpenCode

If you start something in Claude.ai browser chat and want to continue in OpenCode:
1. Key decisions/context → `~/Desktop/ALAN-CONTEXT.md` → `Open Questions` section
2. `session-start.sh` hook already injects that section into every OpenCode session start

---

## Appendix C: dataclaw — Session Archive

[`dataclaw`](https://github.com/peteromallet/dataclaw) exports AI coding agent conversation histories (Claude Code, OpenCode, Codex, Gemini) into structured datasets for Hugging Face. Privacy-first: path anonymization, username hashing, API key redaction.

```bash
pip install dataclaw
dataclaw update-skill claude    # install Claude Code skill
dataclaw prep                   # analyze available sessions
dataclaw export --no-push       # review locally first
```

**Relevant for your setup:**
- Export your 26-skill validated workflows as reusable training datasets
- Archive the 28% → 100% CSS validation sessions as structured data
- OpenCode sessions export natively (not just Claude Code)

Not on the migration critical path — optional value-add.

---

## Appendix D: amplifying.ai

Not a migration resource. It's an AI benchmarking research site analyzing Claude Code's package recommendations across 2,430 real repositories. No OpenCode or OMC migration guidance published there.

---

## References

- [Oh My OpenCode GitHub](https://github.com/code-yeongyu/oh-my-opencode)
- [Oh My OpenCode website](https://ohmyopencode.com/)
- [OpenCode GitHub](https://github.com/opencode-ai/opencode)
- [OpenCode official site](https://opencode.ai/)
- [OpenCode TUI docs](https://opencode.ai/docs/tui/)
- [OpenCode TUI architecture](https://deepwiki.com/opencode-ai/opencode/4-terminal-ui-system)
- [Oh My ClaudeCode (OMC) — source](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [OMO Installation Guide](https://github.com/code-yeongyu/oh-my-opencode/blob/dev/docs/guide/installation.md)
- [cli-continues — cross-tool session handoff](https://github.com/yigitkonur/cli-continues)
- [dataclaw — session history export](https://github.com/peteromallet/dataclaw)
- [amplifying.ai — AI benchmark research](https://amplifying.ai)
