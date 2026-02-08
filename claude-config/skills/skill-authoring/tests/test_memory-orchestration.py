import pytest
from pathlib import Path

class TestMemoryOrchestration:
    @pytest.fixture
    def skill(self):
        path = Path.home() / ".claude/skills/memory-orchestration/SKILL.md"
        if not path.exists():
            pytest.skip("Skill not yet created")
        return path.read_text()

    def test_has_valid_frontmatter(self, skill):
        """Skill must have valid frontmatter with name and description"""
        assert skill.startswith("---\n")
        lines = skill.split('\n')
        in_frontmatter = False
        has_name = False
        has_description = False

        for line in lines:
            if line.strip() == "---":
                in_frontmatter = not in_frontmatter
                if not in_frontmatter and has_name and has_description:
                    break
                continue

            if in_frontmatter:
                if line.startswith("name:"):
                    has_name = True
                    name = line.split(":", 1)[1].strip()
                    assert name == "memory-orchestration"
                    assert len(name) <= 64
                    assert name == name.lower()

                if line.startswith("description:"):
                    has_description = True
                    desc = line.split(":", 1)[1].strip()
                    assert len(desc) <= 1024
                    # Description must indicate WHEN to use
                    assert any(word in desc.lower() for word in ["when", "use", "search", "query", "find"])

        assert has_name, "Missing 'name:' in frontmatter"
        assert has_description, "Missing 'description:' in frontmatter"

    def test_has_system_comparison_table(self, skill):
        """Must have table comparing all 4 memory systems"""
        assert "| System |" in skill or "| **System** |" in skill
        assert "screenpipe" in skill.lower()
        assert "claude-mem" in skill.lower()
        assert "glean" in skill.lower()
        assert "vpc" in skill.lower()

    def test_has_decision_tree(self, skill):
        """Must provide decision tree or routing logic"""
        # Should have some decision structure
        assert any(phrase in skill for phrase in [
            "Decision Tree",
            "When to Use Which",
            "Routing Logic",
            "System Selection"
        ])

    def test_covers_screenpipe_use_cases(self, skill):
        """Must document screenpipe-specific patterns"""
        assert "search-content" in skill or "search_content" in skill
        assert any(phrase in skill.lower() for phrase in [
            "temporal",
            "when did",
            "what happened",
            "screen",
            "audio"
        ])

    def test_covers_claude_mem_use_cases(self, skill):
        """Must document claude-mem patterns"""
        assert any(phrase in skill.lower() for phrase in [
            "learning",
            "mistake",
            "pattern",
            "observation"
        ])

    def test_covers_glean_use_cases(self, skill):
        """Must document Glean corporate knowledge patterns"""
        assert any(phrase in skill.lower() for phrase in [
            "document",
            "wiki",
            "corporate",
            "company",
            "policy"
        ])

    def test_has_combined_query_examples(self, skill):
        """Must show how to combine multiple systems"""
        assert "combine" in skill.lower() or "together" in skill.lower()
        # Should have at least one multi-system example
        assert skill.count("screenpipe") >= 2 or skill.count("claude-mem") >= 2

    def test_has_mcp_tool_reference(self, skill):
        """Must reference actual MCP tool names"""
        assert "mcp__screenpipe__search-content" in skill or "search-content" in skill
        assert "mcp__glean_default__search" in skill or "glean" in skill.lower()

    def test_skill_length_reasonable(self, skill):
        """Skill should be under 400 lines (reference skill)"""
        lines = skill.split('\n')
        assert len(lines) <= 400, f"Skill is {len(lines)} lines, should be ≤400"

    def test_has_anti_patterns(self, skill):
        """Should document what NOT to do"""
        assert "don't" in skill.lower() or "avoid" in skill.lower() or "not" in skill.lower()
