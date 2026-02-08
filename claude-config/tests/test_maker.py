import pytest
from pathlib import Path


class TestMakerSkill:
    @pytest.fixture
    def skill(self):
        path = Path.home() / ".cursor/skills/maker/SKILL.md"
        if not path.exists():
            pytest.skip("Skill not yet created")
        return path.read_text()

    def test_has_valid_frontmatter(self, skill):
        assert skill.startswith("---")
        lines = skill.split("\n")
        end_idx = lines[1:].index("---") + 1
        frontmatter = "\n".join(lines[1:end_idx])
        assert "name:" in frontmatter
        assert "description:" in frontmatter

    def test_name_is_maker(self, skill):
        lines = skill.split("\n")
        for line in lines:
            if line.startswith("name:"):
                assert "maker" in line.split(":", 1)[1].strip()
                break

    def test_description_actionable(self, skill):
        lines = skill.split("\n")
        in_fm = False
        for line in lines:
            if line.strip() == "---":
                in_fm = not in_fm
                continue
            if in_fm and line.startswith("description:"):
                desc = line.split(":", 1)[1].strip().strip('"')
                # Must indicate WHEN to use
                trigger_words = ["use when", "trigger", "build", "ship", "prototype", "rapid", "fast"]
                assert any(w in desc.lower() for w in trigger_words), f"Description not actionable: {desc}"
                break

    def test_has_when_to_use(self, skill):
        assert "## When to Use" in skill

    def test_has_workflow(self, skill):
        assert "## Workflow" in skill or "## Protocol" in skill

    def test_covers_speed(self, skill):
        lower = skill.lower()
        speed_terms = ["fast", "rapid", "quick", "speed", "mvp", "prototype", "ship"]
        assert any(t in lower for t in speed_terms)

    def test_covers_tech_stack_selection(self, skill):
        lower = skill.lower()
        assert "stack" in lower or "framework" in lower or "scaffold" in lower

    def test_covers_deployment(self, skill):
        lower = skill.lower()
        assert "deploy" in lower or "ship" in lower or "launch" in lower

    def test_covers_iteration(self, skill):
        lower = skill.lower()
        assert "iterate" in lower or "feedback" in lower or "loop" in lower

    def test_has_anti_patterns(self, skill):
        assert "Anti-Pattern" in skill or "anti-pattern" in skill or "Common Mistake" in skill

    def test_has_decision_framework(self, skill):
        """Maker should help decide build vs buy, which tools, etc."""
        lower = skill.lower()
        decision_terms = ["decide", "decision", "choose", "trade-off", "tradeoff", "when to"]
        assert any(t in lower for t in decision_terms)

    def test_under_400_lines(self, skill):
        lines = skill.strip().split("\n")
        assert len(lines) <= 400, f"Skill is {len(lines)} lines, should be under 400"
