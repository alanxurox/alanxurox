"""TDD tests for Claude Code context architecture (progressive disclosure)."""
import pytest
from pathlib import Path

HOME = Path.home()


class TestCLAUDEmd:
    """Global CLAUDE.md must be lean (<60 lines) with progressive disclosure."""

    @pytest.fixture
    def claude_md(self):
        path = HOME / ".claude/CLAUDE.md"
        assert path.exists(), "~/.claude/CLAUDE.md missing"
        return path.read_text()

    def test_under_60_lines(self, claude_md):
        lines = claude_md.strip().split('\n')
        assert len(lines) <= 60, f"CLAUDE.md is {len(lines)} lines, must be ≤60"

    def test_has_identity(self, claude_md):
        assert "Alan Xu" in claude_md

    def test_has_p0_never_ask(self, claude_md):
        assert "NEVER ASK" in claude_md or "NEVER say" in claude_md

    def test_has_safety_rules(self, claude_md):
        assert "security-sensitive" in claude_md.lower() or "keychain" in claude_md.lower()

    def test_has_progressive_disclosure_pointers(self, claude_md):
        assert "docs/agent-routing.md" in claude_md
        assert "docs/infrastructure.md" in claude_md

    def test_no_archived_skills_table(self, claude_md):
        assert "ARCHIVED" not in claude_md
        assert "Replaced By" not in claude_md

    def test_no_not_this_skill_column(self, claude_md):
        assert "NOT This Skill" not in claude_md

    def test_has_skill_inventory(self, claude_md):
        assert "Active Skills" in claude_md

    def test_has_agent_quick_map(self, claude_md):
        assert "prometheus" in claude_md
        assert "momus" in claude_md
        assert "oracle" in claude_md


class TestDocsDir:
    """Progressive disclosure docs must exist with required content."""

    def test_docs_dir_exists(self):
        assert (HOME / ".claude/docs").is_dir()

    def test_agent_routing_exists(self):
        path = HOME / ".claude/docs/agent-routing.md"
        assert path.exists()
        content = path.read_text()
        assert "prometheus" in content
        assert "momus" in content
        assert "oracle" in content
        assert "librarian" in content
        assert "sisyphus-junior" in content
        assert "Roundtable" in content
        assert "Content Dev" in content

    def test_infrastructure_exists(self):
        path = HOME / ".claude/docs/infrastructure.md"
        assert path.exists()
        content = path.read_text()
        assert "vpc-worker" in content
        assert "claude-mem" in content.lower() or "claude_mem" in content.lower()
        assert "Screenpipe" in content or "screenpipe" in content
        assert "LiteLLM" in content or "litellm" in content
        assert "Project Directories" in content or "Key Project" in content


class TestSkillsCleanup:
    """Skills should be lean — no duplicates with content-dev plugin."""

    ARCHIVED_DUPES = [
        "ipm-dimensions", "ipm-functions", "ipm-snippets",
        "ipm-templates", "norton-light-classes", "placement-patterns",
    ]

    ARCHIVED_DEAD = [
        "career-asset-sync", "career-intel-cron", "gendigital-politics",
        "knowledge-index", "go-expert",
    ]

    EXPECTED_ACTIVE = [
        "alan-context", "company-knowledge", "frameworks",
        "glean-search", "memory-orchestration", "ai-agents-architect",
        "llm-app-patterns", "mcp-builder", "maker",
        "skill-authoring", "career-intel",
    ]

    def test_duplicates_archived(self):
        for skill in self.ARCHIVED_DUPES:
            active = HOME / f".claude/skills/{skill}"
            archived = HOME / f".claude/skills/_archive/{skill}"
            assert not active.exists(), f"{skill} should be archived, still in active"
            assert archived.exists(), f"{skill} not found in _archive"

    def test_dead_skills_archived(self):
        for skill in self.ARCHIVED_DEAD:
            active = HOME / f".claude/skills/{skill}"
            archived = HOME / f".claude/skills/_archive/{skill}"
            assert not active.exists(), f"{skill} should be archived, still in active"
            assert archived.exists(), f"{skill} not found in _archive"

    def test_expected_active_skills_exist(self):
        for skill in self.EXPECTED_ACTIVE:
            path = HOME / f".claude/skills/{skill}"
            assert path.exists(), f"Active skill {skill} missing"
            assert (path / "SKILL.md").exists(), f"{skill}/SKILL.md missing"

    def test_active_count_reasonable(self):
        active = [
            d for d in (HOME / ".claude/skills").iterdir()
            if d.is_dir() and d.name != "_archive" and d.name != "0"
        ]
        assert len(active) <= 15, f"Too many active skills: {len(active)}"


class TestHooks:
    """Hooks must be configured and executable."""

    def test_skill_eval_hook_exists(self):
        path = HOME / ".claude/hooks/skill-eval.sh"
        assert path.exists()
        assert path.stat().st_mode & 0o111, "skill-eval.sh not executable"

    def test_skill_eval_in_settings(self):
        import json
        settings = json.loads((HOME / ".claude/settings.json").read_text())
        hooks = settings.get("hooks", {})
        assert "UserPromptSubmit" in hooks, "UserPromptSubmit hook not configured"
        commands = [
            h["command"]
            for group in hooks["UserPromptSubmit"]
            for h in group.get("hooks", [])
        ]
        assert any("skill-eval" in c for c in commands), "skill-eval not in UserPromptSubmit"

    def test_agent_teams_enabled(self):
        import json
        settings = json.loads((HOME / ".claude/settings.json").read_text())
        env = settings.get("env", {})
        assert env.get("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS") == "1"


class TestMemoryOrchestrationSkill:
    """The memory-orchestration skill must be functional."""

    @pytest.fixture
    def skill(self):
        path = HOME / ".claude/skills/memory-orchestration/SKILL.md"
        assert path.exists()
        return path.read_text()

    def test_covers_all_4_systems(self, skill):
        assert "screenpipe" in skill.lower()
        assert "claude-mem" in skill.lower()
        assert "glean" in skill.lower()
        assert "vpc" in skill.lower()

    def test_has_mcp_tools(self, skill):
        assert "search-content" in skill
        assert "glean" in skill.lower()

    def test_under_400_lines(self, skill):
        assert len(skill.split('\n')) <= 400
