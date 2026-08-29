# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [office-hours — Two-Mode Brainstorming / Design-Doc Skill](https://officialskills.sh/garrytan/skills/office-hours) | officialskills.sh → GitHub (garrytan/gstack) | Defer |

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

## 3. office-hours — Two-Mode Brainstorming / Design-Doc Skill

- **URL:** https://officialskills.sh/garrytan/skills/office-hours (directory listing) → https://github.com/garrytan/gstack/tree/main/office-hours (source)
- **Type:** Skill (Claude Code / agent skill, installable via `npx skills add https://github.com/garrytan/gstack --skill office-hours`)
- **Category:** Product thinking / brainstorming
- **Linear:** COL-333 (AI Research project)
- **Decision:** Defer (owner confirmed 2026-08-29) — do not install; if the method is wanted later, extract the six-question diagnostic and alternatives format into a standalone lightweight skill

### What it is

A "YC office hours" simulation with two modes, ending in a saved design document (no code — the skill hard-gates against implementation):

- **Startup mode:** six forcing questions testing demand reality, the status-quo workaround, customer specificity, minimum viable wedge, user observation, and future-fit.
- **Builder mode:** a brainstorming partner for side projects, hackathons, learning, and open source.
- Later phases add a premise challenge, an optional cross-model second opinion (Codex CLI or a Claude subagent), mandatory 2–3 alternatives with a recommendation, optional visual mockups, and a design doc plus "assignment" handoff.

The full SKILL.md was fetched from the GitHub raw source and reviewed line by line (67.5 KB, 1,133 lines, plus three on-demand section files it requires reading at runtime).

### Proposed value / use case

- The six-question demand diagnostic and the "mandatory alternatives with one minimal-viable and one ideal-architecture option" pattern are genuinely good idea-vetting structure, usable when scoping new workshops or side projects.
- The decision-brief format (ELI10, stakes, completeness scores, explicit recommendation) is a thoughtful pattern for agent-to-user questions.

### Caveats

- **Heavy runtime coupling.** Most of the file is gstack framework plumbing, not the office-hours method: it shells out to `~/.claude/skills/gstack/bin/*` binaries (skill-start, telemetry, question-preference hooks, learnings log, brain cache, developer profile), writes analytics/profile JSONL under `~/.gstack/`, and mentions an artifacts-sync "remote-mode". None of that runtime exists in this environment, and the sync/telemetry surface would need a privacy review before ever running on a work machine.
- **Instruction-injection channel by design.** The preamble tells the agent to obey `GSTACK_INSTRUCTION_BEGIN/END` blocks emitted by a vendored shell script's output. It is session-ID-gated, but it is still a mechanism where executable output becomes new agent instructions.
- **Self-invoking trigger.** The skill instructs agents to "proactively invoke this skill (do NOT answer directly)" whenever the user describes a product idea — conflicting with this repo's rule that deterministic behavior stays in code and the agent is used only for judgment or execution.
- **Network installer.** Setup can download and run the bun install script (checksum-pinned, but still a remote-code path), and one section repeatedly promotes downloading a specific third-party AI browser ("Aside") by name. The hosting directory (officialskills.sh) is itself sponsor-supported, not an official registry.
- **Provenance not verified.** The GitHub repo shows an anomalous 130k-stars / 0-forks profile, and no independent confirmation was found that the account is actually Garry Tan's. Treat authorship as unverified.
- **Context cost.** ~67 KB always-loaded SKILL.md plus mandatory section reads is far above the footprint of anything in `skills/` today.

### Recommendation

Defer as-is; do not install (installation is also blocked here by the AGENTS.md no-install boundary). The reusable part is small and separable: if the method is wanted for future workshop scoping, extract just the six-question startup diagnostic and the mandatory-alternatives format into a standalone lightweight skill with no gstack runtime, no telemetry, no proactive self-invocation, and no external installers.
