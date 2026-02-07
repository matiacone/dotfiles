---
description: Create a new Agent Skill with proper SKILL.md format and directory structure
---

Create an Agent Skill based on the user's request: $ARGUMENTS

## Agent Skills Format Specification

### Directory Structure

A skill is a directory containing at minimum a `SKILL.md` file:

```
skill-name/
├── SKILL.md          # Required - main skill definition
├── scripts/          # Optional - executable code
├── references/       # Optional - additional documentation
└── assets/           # Optional - templates, images, data files
```

### SKILL.md Format

The file must contain YAML frontmatter followed by Markdown instructions.

#### Required Frontmatter Fields

```yaml
---
name: skill-name
description: What this skill does and when to use it (max 1024 chars)
---
```

#### Optional Frontmatter Fields

```yaml
---
name: skill-name
description: Description of the skill
license: Apache-2.0
compatibility: Designed for Claude Code
metadata:
  author: org-name
  version: "1.0"
allowed-tools: Bash(git:*) Read
---
```

### Field Constraints

**name** (required):
- Max 64 characters
- Lowercase letters, numbers, and hyphens only (`a-z`, `0-9`, `-`)
- Must NOT start or end with a hyphen
- Must NOT contain consecutive hyphens (`--`)
- Must match the parent directory name

**description** (required):
- Max 1024 characters
- Describe what the skill does AND when to use it
- Include keywords that help agents identify relevant tasks

**license** (optional):
- License name or reference to bundled license file

**compatibility** (optional):
- Max 500 characters
- Environment requirements (product, system packages, network access)

**metadata** (optional):
- Key-value mapping for additional properties

**allowed-tools** (optional, experimental):
- Space-delimited list of pre-approved tools

### Body Content Best Practices

The Markdown body should include:
- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

Keep `SKILL.md` under 500 lines. Move detailed reference material to `references/` directory.

### Progressive Disclosure

Structure for efficient context use:
1. **Metadata** (~100 tokens): name/description loaded at startup
2. **Instructions** (<5000 tokens): Full SKILL.md loaded on activation
3. **Resources** (as needed): scripts/, references/, assets/ loaded on demand

### File References

Use relative paths from skill root:
```markdown
See [reference guide](references/REFERENCE.md) for details.
Run: scripts/extract.py
```

## Instructions

1. Ask the user what the skill should do if `$ARGUMENTS` is empty or unclear
2. Determine an appropriate skill name following the naming constraints
3. Ask where to create the skill directory (suggest `.claude/skills/` for personal skills)
4. Create the directory structure with at minimum `SKILL.md`
5. Write clear, actionable instructions in the body
6. If the skill needs scripts, create them in `scripts/`
7. If the skill needs reference docs, create them in `references/`
8. Validate the skill follows all constraints:
   - Name matches directory name
   - Name is lowercase with hyphens only
   - Description is meaningful and includes trigger keywords
   - SKILL.md is under 500 lines
9. Inform user they can validate with: `skills-ref validate ./skill-name`

## Example Valid SKILL.md

```yaml
---
name: code-review
description: Reviews code for bugs, security issues, and best practices. Use when asked to review, audit, or check code quality.
---
```

```markdown
# Code Review Skill

Review the provided code following these steps:

## Process

1. Check for syntax errors and bugs
2. Identify security vulnerabilities
3. Evaluate code style and readability
4. Suggest improvements

## Output Format

Provide findings as:
- **Critical**: Must fix before deployment
- **Warning**: Should address soon
- **Suggestion**: Nice to have improvements
```
