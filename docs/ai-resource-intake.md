# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [wshobson/agents marketplace](https://github.com/wshobson/agents) | GitHub (wshobson/agents) | Adopted (marketplace-pinned, curated 26) |

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

## 3. wshobson/agents marketplace

- **URL:** https://github.com/wshobson/agents
- **Type:** Claude Code plugin marketplace (marketplace name `claude-code-workflows`) — 93 plugins, 202 agents, 181 skills, 105 commands, organized `plugins/<name>/{agents,commands,skills}`
- **Category:** Agent/skill collection, multi-domain
- **Decision:** **Adopted (marketplace-pinned, curated 26)**

### What it is

A large third-party Claude Code plugin marketplace. Individual plugins install independently (`/plugin install <name>`); each pulls in only its own agents/commands/skills, not the whole marketplace. Several wshobson plugins were already individually verdicted in `docs/todoist-resource-intake-review.md` (mostly **experiment**/**adapt**; `avoid-ai-writing` **discard**).

### Mechanism decision

The repo previously reverted a bulk vendoring of third-party agent content (commit `04dd11a`) for two reasons: (1) unreviewed third-party instructions entering the environment, and (2) duplicate-maintenance overhead from copying files across `.kiro/skills/`, `.agents/skills/`, `.claude/skills/`. A **marketplace pin** avoids both: `.claude/settings.json` commits only a reference to the marketplace and a list of enabled plugin names — no third-party agent/skill files enter the tree. Pruning is deleting a line and committing.

Installed by:
- `.claude/settings.json` — `extraKnownMarketplaces.claude-code-workflows` (github `wshobson/agents`) + `enabledPlugins` (Claude Code, the primary dev-heavy client)
- `.cursor/settings.json` — mirrors the same 26 plugin names in Cursor's existing `plugins` block (the second dev-heavy client)

### Enabled set (26 plugins)

- **Data & analytics (6):** `data-engineering`, `database-design`, `database-migrations`, `database-cloud-optimization`, `data-validation-suite`, `business-analytics`
- **LLM / AI / agents (6):** `llm-application-dev`, `agent-orchestration`, `agent-teams`, `conductor`, `context-management`, `skill-forge-essentials`
- **Communication / stakeholder (4):** `team-collaboration`, `startup-business-analyst`, `before-you-build`, `pptx-deck-creation`
- **Documentation (4):** `code-documentation`, `documentation-generation`, `documentation-standards`, `c4-architecture`
- **Migration / cleanup (2):** `framework-migration`, `codebase-cleanup`
- **Dev core (4):** `javascript-typescript`, `git-pr-workflows`, `unit-testing`, `comprehensive-review`

Deliberately excluded: SEO, HR/legal, blockchain, game-dev, cloud/k8s infra (backend-less app), other-language plugins, and every **hook-installing / behavior-modifying** plugin (`pensyve`, `hol-guard`, `protect-mcp`, `block-no-verify`, `signed-audit-trails`, `review-agent-governance`) — those change harness behavior and warrant individual intake review, never a bulk enable. `avoid-ai-writing` stays out per its prior **discard** verdict.

### Pruning

Delete the plugin's line from `.claude/settings.json` `enabledPlugins` (and the matching entry in `.cursor/settings.json`), commit. No other cleanup needed since no plugin content is vendored into the tree.

### Codex (Boeing work machine)

Codex is not a marketplace-native consumer of this repo's `.claude/settings.json`. wshobson documents `npx codex-marketplace add wshobson/agents` for Codex/OpenCode/Cursor/Antigravity/Copilot, which emits generated harness artifacts locally (now gitignored: `.codex/`, `.opencode/`, `.antigravity/`, `.copilot/`). Per `AGENTS.md`'s hard boundary ("never run install ... commands from this development environment"), this is a **local, user-owned step** Collin runs on the work machine himself — not something this repository's automation performs.

### Kiro

Kiro is not a wshobson-supported harness; there is no marketplace or bulk-install path. After the curated 26 settle from real use, individual high-value skills can be vendored one at a time into `.kiro/skills/` through this intake process, using the house provenance convention already established by `sql-optimization`/`sql-server-table-reconciliation`:

> **Provenance:** Vendored from [wshobson/agents](https://github.com/wshobson/agents) (MIT licensed) at commit `<sha>`. Unmodified except for this note.
