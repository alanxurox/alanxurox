import pytest
from pathlib import Path


class TestMentalHealthSkill:
    @pytest.fixture
    def skill(self):
        path = Path(__file__).parent.parent / "skills" / "mental-health" / "SKILL.md"
        if not path.exists():
            pytest.skip("Skill not yet created")
        return path.read_text()

    def test_file_exists(self):
        path = Path(__file__).parent.parent / "skills" / "mental-health" / "SKILL.md"
        assert path.exists(), "SKILL.md must exist at skills/mental-health/SKILL.md"

    def test_has_valid_frontmatter(self, skill):
        lines = skill.split("\n")
        assert lines[0].strip() == "---", "Must start with frontmatter delimiter"
        closing = lines[1:].index("---") if "---" in lines[1:] else -1
        assert closing > 0, "Frontmatter must be closed with ---"

    def test_has_name_field(self, skill):
        assert "name: mental-health" in skill

    def test_name_format(self, skill):
        for line in skill.split("\n"):
            if line.startswith("name:"):
                name = line.split(":", 1)[1].strip()
                assert name == name.lower()
                assert len(name) <= 64
                import re
                assert re.match(r"^[a-z0-9-]+$", name), "Name must be lowercase-with-hyphens"
                break

    def test_has_description_field(self, skill):
        assert "description:" in skill

    def test_description_is_actionable(self, skill):
        for line in skill.split("\n"):
            if line.startswith("description:"):
                desc = line.split(":", 1)[1].strip().strip('"')
                assert len(desc) > 20, "Description must be meaningful"
                assert len(desc) <= 1024, "Description must be under 1024 chars"
                break

    def test_has_when_to_use_section(self, skill):
        assert "## When to Use" in skill

    def test_has_energy_check_in_section(self, skill):
        assert "check" in skill.lower() or "energy" in skill.lower()

    def test_has_energy_states(self, skill):
        assert "High" in skill
        assert "Low" in skill

    def test_references_alan_context(self, skill):
        assert "alan-context" in skill

    def test_has_cyclothymia_awareness(self, skill):
        assert "cyclothymia" in skill.lower() or "cycle" in skill.lower()

    def test_has_coping_strategies(self, skill):
        lower = skill.lower()
        assert any(w in lower for w in ["breathe", "break", "rest", "reset", "ground", "pause"])

    def test_has_workflow_or_protocol_section(self, skill):
        assert "## " in skill, "Must have at least one section header"
        sections = [l for l in skill.split("\n") if l.startswith("## ")]
        assert len(sections) >= 3, "Must have at least 3 sections"

    def test_under_400_lines(self, skill):
        lines = skill.split("\n")
        assert len(lines) <= 400, f"Skill must be under 400 lines, got {len(lines)}"

    def test_has_triggers(self, skill):
        lower = skill.lower()
        assert any(w in lower for w in ["trigger", "overwhelm", "anxious", "stressed", "burnout", "stuck"])
