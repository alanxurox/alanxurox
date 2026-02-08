---
name: skill-authoring
description: Use when creating, updating, or validating Agent Skills. Implements TDD pattern with tests before implementation.
---

# Skill Authoring (TDD)

## Core Principle: Tests First

**NEVER create a skill without tests.**

## TDD Workflow

### Step 1: Design Tests (RED)
Before writing SKILL.md, create `test_{skill_name}.py`:

```python
import pytest
from pathlib import Path

class TestMyNewSkill:
    @pytest.fixture
    def my_skill(self):
        path = Path.home() / ".cursor/skills/my-skill/SKILL.md"
        if not path.exists():
            pytest.skip("Skill not yet created")
        return path.read_text()
    
    def test_has_required_section(self, my_skill):
        assert "## Workflow" in my_skill
    
    def test_has_valid_frontmatter(self, my_skill):
        assert "---" in my_skill
        assert "name:" in my_skill
        assert "description:" in my_skill
    
    def test_name_format(self, my_skill):
        # Extract name from frontmatter
        lines = my_skill.split('\n')
        in_frontmatter = False
        for line in lines:
            if line.strip() == "---":
                in_frontmatter = not in_frontmatter
                continue
            if in_frontmatter and line.startswith("name:"):
                name = line.split(":", 1)[1].strip()
                assert name == name.lower()
                assert "-" in name or name.isalnum()
                assert len(name) <= 64
                break
```

### Step 2: Create Skill (GREEN)
Write SKILL.md that passes ALL tests. Start with minimal implementation, then expand.

### Step 3: Refine (REFACTOR)
Improve clarity, add examples, cross-references while keeping tests green.

## SKILL.md Template

```yaml
---
name: lowercase-max-64-chars
description: WHEN to use - triggers on X, Y, Z. Max 1024 chars.
---

# Skill Name

## When to Use
- Trigger pattern 1
- Trigger pattern 2
- When NOT to use

## Quick Reference
| Action | How |
|--------|-----|
| Do X | Use pattern Y |

## Workflow
1. Step one with verification
2. Step two with verification
3. Final verification gate

## Common Mistakes
| Mistake | Fix |
|---------|-----|
| Common error | Correct approach |

## References
- Related skill: `skill-name`
- External: https://example.com
```

## Guardrails Checklist

**Before creating any skill:**
- [ ] Tests exist in `tests/test_{name}.py`
- [ ] All tests currently FAIL (RED phase)
- [ ] Tests define WHAT skill must contain (sections, frontmatter, patterns)
- [ ] Tests use `pytest.skip()` for missing skills (graceful failure)

**After creating skill:**
- [ ] All tests PASS (GREEN phase)
- [ ] Skill under 200 lines (workflow) or 400 lines (reference)
- [ ] Cross-references related skills using informal pattern: `See skill-name for details`
- [ ] Added to meta-orchestrator catalog
- [ ] Description is actionable (says WHEN, not just WHAT)

## AgentSkills.io Requirements

From https://agentskills.io/specification:

**Frontmatter:**
- `name`: Required, lowercase-with-hyphens, max 64 chars
- `description`: Required, max 1024 chars, actionable (when to use)

**Body:**
- Markdown instructions
- Clear structure with sections
- Examples and patterns

**Validation:**
- Name format: `^[a-z0-9-]+$` (lowercase, numbers, hyphens only)
- Description: Must indicate triggers/use cases

## Integration with Meta-Orchestrator

After creating skill, update `~/.cursor/skills/meta-orchestrator/SKILL.md`:

1. **Add to catalog table** in appropriate category:
   ```markdown
   | `skill-name` | Brief description | Category |
   ```

2. **Add to routing table** if skill should be auto-invoked:
   ```markdown
   | Task Type | Skill |
   |-----------|------|
   | Your task pattern | `skill-name` |
   ```

3. **Test invocation**: Verify skill loads and executes correctly

## Anti-Patterns

| Bad | Good |
|-----|------|
| Write skill first, tests later | Tests first, then skill |
| Skip guardrails | Always validate before/after |
| Vague description ("Helper skill") | Actionable triggers ("Use when X, Y, Z") |
| 500+ lines | Under 200 lines (workflow) or 400 (reference) |
| No cross-references | Links to related skills |
| Tests that always pass | Tests that fail until skill exists |

## Quick Start

1. Create test file: `tests/test_my-skill.py`
2. Write failing tests (RED)
3. Create minimal SKILL.md that passes tests (GREEN)
4. Refine skill while keeping tests green (REFACTOR)
5. Add to meta-orchestrator catalog
6. Verify end-to-end skill invocation
