# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [linear — Manage Linear issues via MCP](https://officialskills.sh/openai/skills/linear) | officialskills.sh (openai/skills) | Pending |

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

## 3. linear — Manage Linear issues via MCP

- **URL:** https://officialskills.sh/openai/skills/linear (source: https://github.com/openai/skills/tree/main/skills/.curated/linear)
- **Type:** Skill (Codex agent skill, installable via `npx skills add https://github.com/openai/skills --skill linear`)
- **Category:** Productivity / project management
- **Decision:** Pending

### What it is

A curated OpenAI Codex skill that wraps the official Linear MCP server (`https://mcp.linear.app/mcp`). Contents:

- **Step 0 (setup):** Codex-specific MCP configuration — `codex mcp add linear`, enabling `rmcp_client` in `config.toml`, `codex mcp login` OAuth, and a Windows/WSL fallback config.
- **Steps 1–4 (workflow):** clarify goal and scope → pick a workflow and confirm identifiers (issue ID, project ID, team key) → execute MCP calls in batches, reads before writes, explain grouping logic before bulk changes → summarize results and propose next actions.
- **Tool inventory:** the Linear MCP tool surface (issue CRUD, projects/teams/users, documents, comments, cycles).
- **Nine practical workflows:** sprint planning, bug triage, documentation audit, workload balancing, release planning, cross-project dependencies, status updates, smart labeling, retrospectives.
- **Tips and troubleshooting:** batching to respect rate limits, OAuth/auth recovery, tool-calling error handling.

### Proposed value / use case

- The read-before-write ordering, identifier confirmation before tool calls, and "explain grouping logic before bulk changes" rules are sensible guardrails for any agent doing batch Linear operations.
- The nine-workflow catalog is a decent prompt menu for recurring Linear chores (triage, sprint prep, labeling passes).

### Caveats

- Mostly redundant here: the Cursor environment already has the Linear MCP connected natively, and agents can already read/create/update issues without this skill. The main unique content is Codex setup instructions that don't transfer.
- Step 0 is entirely Codex-specific (`codex mcp`, `config.toml`, `rmcp_client`, restart-Codex instruction) and would be dead weight or confusing in Cursor/Kiro.
- The skill encourages batch create/update/assign operations with no explicit approval gate; any adaptation should add a confirm-before-bulk-write step, consistent with how destructive actions are gated elsewhere in this repo.

### Recommendation

Skip ingestion as-is (defer). Native Linear MCP access already covers the capability, and the setup half of the skill is Codex-only. If a Linear-workflow rule is ever wanted, extract only the Steps 1–4 guardrails and the workflow catalog into a short local rule rather than vendoring this skill.
