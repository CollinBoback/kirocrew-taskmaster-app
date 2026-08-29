# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [Linear plugin (official)](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/linear) | GitHub (anthropics/claude-plugins-official) | Defer |

---

## 1. Clean Code — Pragmatic AI Coding Standards

- **URL:** https://www.aitmpl.com/component/skill/development/clean-code
- **Type:** Skill (Claude Code / agent skill, installable via `npx claude-code-templates@latest --skill development/clean-code`)
- **Category:** Development
- **Decision:** Pending

### What it is

A compact, table-driven coding-standards skill that instructs an AI agent to be concise, direct, and solution-focused. Covers:

- **Core principles:** SRP, DRY, KISS, YAGNI, Boy Scout rule.
- **Naming rules:** intent-revealing variables, verb+noun functions, question-form booleans, SCREAMING_SNAKE constants.
- **Function rules:** max ~20 lines, one thing per function, max 3 args, no side effects.
- **Structure:** guard clauses, flat over nested (max 2 levels), composition, colocation.
- **AI behavior rules:** write code directly (no tutorials), fix bugs without preamble, ask when requirements are unclear.
- **Anti-pattern table:** no obvious comments, no one-liner helpers, no premature factories, no magic numbers, no god functions.
- **Impact-analysis checklist:** before editing a file, identify importers/imports/tests; update all dependents in the same task.
- **Mandatory self-check:** goal met, all files edited, code verified, lint/types pass.

### Proposed value / use case

- Directly applicable as an always-on rule or skill for Cursor and Kiro agents to reduce verbose, over-engineered agent output (redundant comments, unnecessary helpers/files, tutorial-style responses).
- The "before editing any file" dependency checklist and "self-check before completing" sections are practical guardrails that reduce broken-import and half-finished-change failures.
- Overlaps somewhat with guidance already common in agent system prompts (KISS/YAGNI, no narration comments), so value depends on what the current ruleset already covers.

### Caveats

- The "Verification Scripts" section is specific to the claude-code-templates agent ecosystem (frontend-specialist, ux_audit.py, etc.) and references `~/.claude/skills/` paths — that portion would not transfer without adaptation or trimming.
- The "wait for user confirmation before fixing" script-output workflow conflicts with autonomous cloud-agent operation; would need adjustment if adopted.

### Recommendation

Strong candidate for ingestion if trimmed: keep the principles, naming/function/structure rules, anti-patterns, dependency checklist, and self-check; drop or rewrite the ecosystem-specific verification-scripts section.

---

## 2. find-skills — Skill Discovery and Installation

- **URL:** https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md
- **Type:** Skill (agent skill, installable via `npx skills add vercel-labs/skills@find-skills`)
- **Category:** Productivity / agent tooling
- **Decision:** Pending

### What it is

A skill from `vercel-labs/skills` that teaches an agent to discover and install other skills from the open agent skills ecosystem via the Skills CLI (`npx skills`). It triggers on questions like "how do I do X" or "is there a skill for X", walks through checking the skills.sh leaderboard, running `npx skills find`, vetting results by install count / source reputation / GitHub stars, presenting options, and installing on request with `npx skills add <owner/repo@skill> -g -y`.

### Proposed value / use case

- Gives Cursor/Kiro agents a standard workflow for extending their own capabilities instead of ad-hoc web searching.
- Built-in quality checklist (install counts, source reputation, repo stars) is a reasonable filter for third-party skills.

### Caveats

- The skill instructs agents to search the open ecosystem and run `npx skills add` — including the `-g -y` global, no-confirmation form — so adopting it creates a path for further unreviewed third-party agent instructions to enter the environment. Any adoption should route discovered skills through this intake list rather than direct installation.
- Vendoring it would place identical copies under `.kiro/skills/`, `.agents/skills/`, and `.claude/skills/` plus a `skills-lock.json`, which adds duplicate-maintenance overhead.

### Recommendation

Hold until decided. If adopted, trim or replace the auto-install step (`-g -y`) with an instruction to record candidates here for a yes/no decision first.

---

## 3. Linear plugin (official)

- **URL:** https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/linear
- **Type:** Claude Code plugin (MCP-server wrapper, no skills/commands/agents)
- **Category:** Issue tracking / integrations
- **Tracked in:** Linear COL-337 (AI Research project, Q3 decision gate)
- **Decision:** Defer
- **Date reviewed:** 2026-08-29

### What it is

The entire plugin is two files:

- `.claude-plugin/plugin.json` — name, description, author ("Linear").
- `.mcp.json` — registers Linear's official hosted MCP server: `{"linear": {"type": "http", "url": "https://mcp.linear.app/mcp"}}`.

There are no skills, slash commands, agents, or prompts. Installing it does exactly one thing: it adds Linear's remote MCP endpoint to a Claude Code session, with OAuth handled by the client on first use.

### Evaluation against the current workflow

- **Cursor (primary agent surface):** the Linear MCP server is already connected — Cursor agent sessions are launched from Linear issues today (this review itself ran as one). The plugin adds nothing here; it is Claude Code-only packaging.
- **Claude Code (secondary surface, configured in `.claude/settings.json`):** if a Claude Code session ever needs Linear access, the identical result is a one-liner with no plugin or marketplace involved:

  ```bash
  claude mcp add --transport http linear https://mcp.linear.app/mcp
  ```

  or an equivalent `.mcp.json` entry in the project. Current Claude Code use in this repo (the pinned Ponytail plugin) has no Linear dependency.
- **Security/credentials:** the endpoint is Linear's first-party hosted server with OAuth; no tokens stored in the repo either way. Neutral.

This closes the loop on the Todoist intake review entry "Linear MCP Server (anthropics-linear-external-plugins-linear) — experiment: worth a bounded trial if Linear workflow expands." The workflow did expand, but it expanded through Cursor's native Linear integration, which already covers the plugin's only capability.

### Recommendation

**Defer.** The plugin duplicates a capability that is already adopted through Cursor's Linear MCP connection, and its only surface (Claude Code) can get the same endpoint with a one-line registration if the need arises. Bounded follow-up if that need materializes: add the `.mcp.json` entry directly — do not take on plugin/marketplace overhead for a config pointer.
