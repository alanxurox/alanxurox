# Switch to LiteLLM (GenDigital Bedrock)

You've hit the Max plan rate limit. Here's how to continue immediately:

## Quick Resume

```bash
ccl -r
```

## The `ccl` wrapper (better-litellm v1.4.0)

LiteLLM is the default — just type your command and go:

| Command | What it does |
|---------|-------------|
| `ccl` | LiteLLM via proxy (default) |
| `ccl -r` | Resume last session |
| `ccl [flags]` | Any claude flags pass through |
| `ccl -d` | Direct Anthropic API (no proxy) |
| `ccl --stop-proxy` | Stop background proxy |

`-l` still works for back-compat but is no longer needed.

## Architecture

- `ccl` auto-starts a local proxy (`~/.local/bin/better-litellm-proxy.js`)
- Proxy strips `anthropic-beta` headers, `?beta=true` params, `context_management`, `cache_control` that LiteLLM rejects
- Claude Code → localhost:8787 → litellm.prod.aws.lifelock.com → Bedrock
- Config-driven: new CC update breaks something → edit `~/.claude-proxy.json`
- Budget tracking on every launch: `[INFO] Feb spend: $243`

## Available Models (via LiteLLM, Feb 2026)

| Model | ID |
|-------|-----|
| Opus 4.6 | `gen-premiumPlus-opus4.6` |
| Opus 4.5 | `us.anthropic.claude-opus-4-5-20251101-v1:0` |
| Sonnet 4.5 | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| Sonnet 4 | `us.anthropic.claude-sonnet-4-20250514-v1:0` |
| Haiku 4.5 | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |
| Gemini 3 Pro | `gemini-3-pro-preview` |
| Gemini 3 Flash | `gemini-3-flash-preview` |

Use `/model` inside Claude Code to switch anytime.

## Notes

- Requires Zscaler VPN
- LiteLLM budget: $200/month (`#help-litellm-support` to increase)
- Proxy PID: `~/.better-litellm.pid` — reuses across sessions
- Proxy log: `~/.better-litellm.log`
- Config: `~/.claude-proxy.json`
- Repo: https://git.int.avast.com/Alan-Xu/better-litellm
