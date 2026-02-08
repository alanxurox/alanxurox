import pytest
from pathlib import Path


class TestResearchSprintSkill:
    @pytest.fixture
    def skill(self):
        path = Path.home() / ".claude/skills/research-sprint/SKILL.md"
        if not path.exists():
            pytest.skip("Skill not yet created")
        return path.read_text()

    def test_has_valid_frontmatter(self, skill):
        lines = skill.split("\n")
        assert lines[0].strip() == "---", "Must start with frontmatter"
        # Find closing ---
        closing = None
        for i, line in enumerate(lines[1:], 1):
            if line.strip() == "---":
                closing = i
                break
        assert closing is not None, "Must have closing frontmatter"

    def test_name_format(self, skill):
        lines = skill.split("\n")
        for line in lines[1:]:
            if line.strip() == "---":
                break
            if line.startswith("name:"):
                name = line.split(":", 1)[1].strip()
                assert name == "research-sprint"
                assert len(name) <= 64
                break

    def test_description_actionable(self, skill):
        lines = skill.split("\n")
        for line in lines[1:]:
            if line.strip() == "---":
                break
            if line.startswith("description:"):
                desc = line.split(":", 1)[1].strip()
                assert len(desc) <= 1024
                # Must indicate WHEN to use
                assert any(
                    trigger in desc.lower()
                    for trigger in ["use when", "when", "trigger", "launch"]
                ), "Description must say WHEN to use"
                break

    def test_has_phases_section(self, skill):
        assert "## Phase" in skill or "## Phases" in skill, "Must define phases"

    def test_has_three_phases(self, skill):
        """Research sprint has 3 phases: research, synthesis, generation"""
        lower = skill.lower()
        assert "research" in lower, "Must mention research phase"
        assert "synth" in lower, "Must mention synthesis phase"
        assert "generat" in lower or "deliverable" in lower or "writer" in lower, (
            "Must mention generation/deliverable phase"
        )

    def test_has_agent_dispatch_pattern(self, skill):
        """Must document how to launch parallel agents"""
        assert "Task" in skill or "agent" in skill.lower(), "Must reference agent dispatch"
        assert "parallel" in skill.lower(), "Must mention parallel execution"

    def test_has_failure_recovery(self, skill):
        """Must document what to do when agents fail/timeout"""
        lower = skill.lower()
        assert any(
            term in lower for term in ["timeout", "fail", "killed", "recover", "retry"]
        ), "Must document failure recovery"

    def test_has_pre_digest_pattern(self, skill):
        """Key learning: pass pre-digested context to writer agents"""
        lower = skill.lower()
        assert any(
            term in lower for term in ["pre-digest", "context", "don't make", "pre-processed"]
        ), "Must document pre-digesting research for writer agents"

    def test_has_output_template(self, skill):
        """Must define what the output files look like"""
        assert "output" in skill.lower() or "deliverable" in skill.lower() or "file" in skill.lower()

    def test_under_200_lines(self, skill):
        lines = skill.split("\n")
        assert len(lines) <= 200, f"Workflow skill must be under 200 lines, got {len(lines)}"

    def test_has_anti_patterns(self, skill):
        lower = skill.lower()
        assert "anti-pattern" in lower or "don't" in lower or "mistake" in lower or "avoid" in lower


class TestEvidenceCollectorSkill:
    @pytest.fixture
    def skill(self):
        path = Path.home() / ".claude/skills/evidence-collector/SKILL.md"
        if not path.exists():
            pytest.skip("Skill not yet created")
        return path.read_text()

    def test_has_valid_frontmatter(self, skill):
        lines = skill.split("\n")
        assert lines[0].strip() == "---"
        closing = None
        for i, line in enumerate(lines[1:], 1):
            if line.strip() == "---":
                closing = i
                break
        assert closing is not None

    def test_name_format(self, skill):
        lines = skill.split("\n")
        for line in lines[1:]:
            if line.strip() == "---":
                break
            if line.startswith("name:"):
                name = line.split(":", 1)[1].strip()
                assert name == "evidence-collector"
                assert len(name) <= 64
                break

    def test_description_actionable(self, skill):
        lines = skill.split("\n")
        for line in lines[1:]:
            if line.strip() == "---":
                break
            if line.startswith("description:"):
                desc = line.split(":", 1)[1].strip()
                assert len(desc) <= 1024
                assert any(
                    trigger in desc.lower()
                    for trigger in ["use when", "when", "trigger", "evidence", "review"]
                )
                break

    def test_has_three_evidence_sources(self, skill):
        """Must cover git, Glean, and architecture analysis"""
        lower = skill.lower()
        assert "git" in lower, "Must cover git history analysis"
        assert "glean" in lower, "Must cover Glean internal search"
        assert any(
            term in lower for term in ["architecture", "quality", "codebase", "repo"]
        ), "Must cover architecture/codebase analysis"

    def test_has_git_analysis_pattern(self, skill):
        """Must document how to extract narrative from git history"""
        lower = skill.lower()
        assert any(
            term in lower for term in ["commit", "log", "history", "evolution"]
        ), "Must document git history analysis"

    def test_has_glean_search_pattern(self, skill):
        """Must document multi-angle Glean search strategy"""
        lower = skill.lower()
        assert "search" in lower or "query" in lower, "Must document search patterns"

    def test_has_scoring_rubric(self, skill):
        """Must include quality scoring (like the 7/10 architecture assessment)"""
        lower = skill.lower()
        assert any(
            term in lower for term in ["score", "rating", "rubric", "assess", "/10"]
        ), "Must include scoring methodology"

    def test_has_output_format(self, skill):
        """Must define output format for evidence"""
        lower = skill.lower()
        assert "output" in lower or "format" in lower or "template" in lower

    def test_under_200_lines(self, skill):
        lines = skill.split("\n")
        assert len(lines) <= 200, f"Workflow skill must be under 200 lines, got {len(lines)}"

    def test_has_anti_patterns(self, skill):
        lower = skill.lower()
        assert "anti-pattern" in lower or "don't" in lower or "mistake" in lower or "avoid" in lower
