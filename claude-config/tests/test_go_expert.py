import pytest
from pathlib import Path


class TestGoExpertSkill:
    @pytest.fixture
    def skill(self):
        path = Path.home() / ".cursor/skills/go-expert/SKILL.md"
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

    def test_name_is_go_expert(self, skill):
        lines = skill.split("\n")
        for line in lines:
            if line.startswith("name:"):
                assert "go-expert" in line.split(":", 1)[1].strip()
                break

    def test_description_mentions_go(self, skill):
        lines = skill.split("\n")
        in_fm = False
        for line in lines:
            if line.strip() == "---":
                in_fm = not in_fm
                continue
            if in_fm and line.startswith("description:"):
                desc = line.split(":", 1)[1].strip().strip('"')
                assert "go" in desc.lower() or "Go" in desc
                break

    def test_has_workflow_section(self, skill):
        assert "## Workflow" in skill or "## Patterns" in skill

    def test_has_when_to_use(self, skill):
        assert "## When to Use" in skill

    def test_covers_concurrency(self, skill):
        lower = skill.lower()
        assert "goroutine" in lower or "concurrency" in lower or "channel" in lower

    def test_covers_error_handling(self, skill):
        lower = skill.lower()
        assert "error" in lower

    def test_covers_testing(self, skill):
        lower = skill.lower()
        assert "test" in lower

    def test_covers_project_structure(self, skill):
        lower = skill.lower()
        assert "module" in lower or "go.mod" in lower or "package" in lower

    def test_has_anti_patterns(self, skill):
        assert "Anti-Pattern" in skill or "anti-pattern" in skill or "Common Mistake" in skill

    def test_has_tooling(self, skill):
        lower = skill.lower()
        assert "go vet" in lower or "golint" in lower or "staticcheck" in lower or "golangci" in lower

    def test_under_400_lines(self, skill):
        lines = skill.strip().split("\n")
        assert len(lines) <= 400, f"Skill is {len(lines)} lines, should be under 400"
