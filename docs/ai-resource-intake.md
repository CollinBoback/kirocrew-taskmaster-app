# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [github-issue-creator — Structured GitHub Issues from Messy Input](https://officialskills.sh/microsoft/skills/github-issue-creator) | officialskills.sh → GitHub (microsoft/skills) | Pending — recommended: Adapt |

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

## 3. github-issue-creator — Structured GitHub Issues from Messy Input

- **URL:** https://officialskills.sh/microsoft/skills/github-issue-creator
- **Canonical source:** https://github.com/microsoft/skills — `.github/skills/github-issue-creator/SKILL.md`
- **Type:** Skill (agent skill, installable via `npx skills add https://github.com/microsoft/skills --skill github-issue-creator`)
- **Category:** Productivity / issue workflow
- **Linear:** COL-335 (AI Research project)
- **Decision:** Pending — recommended disposition: **Adapt**

### What it is

A compact (~135-line) Microsoft skill that converts messy input — error logs, voice
dictation, raw notes, screenshots — into a consistent GitHub-flavored markdown issue.
It provides:

- **A fixed issue template:** Summary, Environment, Reproduction Steps, Expected/Actual
  Behavior, Error Details, Visual Evidence, Impact, Additional Context.
- **A severity rubric:** Critical (service down / data loss / security), High (major
  feature broken, no workaround), Medium (workaround exists), Low (cosmetic).
- **Extraction guidelines:** pull facts out of casual language, infer missing context
  from the conversation, be crisp.
- **A sensitive-data rule:** placeholder anything sensitive (`[PROJECT_NAME]`,
  `[USER_ID]`, etc.).
- **An output-location rule:** write each issue as a markdown file under `/issues/` at
  the repo root, named `YYYY-MM-DD-short-description.md`.

Upstream ships test scenarios and a 460-line acceptance-criteria document
(`tests/scenarios/github-issue-creator/`), which is a good quality signal relative to
most marketplace skills.

### Proposed value / use case

- Directly relevant to this issue-heavy workflow (GitHub issue queue mirrored to
  Linear): raw notes or dictated bug reports become well-formed, consistently structured
  issues instead of one-line stubs like the "❌ INCORRECT" examples the skill itself
  calls out.
- The severity rubric and template give agents and humans a shared definition of a
  complete issue, which complements `.kiro/specs/taskmaster-pro/issue-guide.md`.
- The placeholder-sensitive-data rule aligns with this repo's hard boundary against
  real employer/customer names and internal details.
- Already triaged as **experiment — "test on a low-risk issue first"** in the Todoist
  intake review (`docs/todoist-resource-intake-review.md`).

### Caveats

- **Output location conflicts with repo doctrine.** The skill commits issues as
  markdown files under `/issues/` at the repo root. This repository's tracking rule is
  `tasks.md` as source of truth with GitHub issues as the mirror (synced to Linear);
  committed `/issues/*.md` files would create a third, unsynced tracking surface.
  Any adoption must redirect output to a drafted issue body filed through GitHub/Linear
  instead of committed files.
- The template's Environment field and both worked examples are Azure-product specific
  (Azure AI Foundry, Copilot Studio); cosmetic, but worth trimming if vendored.
- Overlaps partially with issue-writing guidance agents already follow; value is the
  consistent template and severity rubric, not new capability.

### Recommendation

**Adapt.** Keep the template, extraction guidelines, severity rubric, and
sensitive-data placeholder rule; replace the `/issues/` directory output with "draft
the issue body and file it via GitHub (auto-synced to Linear)." Do not vendor until the
final yes/no here — per the find-skills precedent, unapproved vendored skills get
removed.

**Bounded follow-up if adopted (Q3 decision-gate requirement):** one low-risk pilot —
take a single real messy input (a dictated note or pasted error), run the adapted skill
to draft the issue, file it in GitHub, and judge whether the structured output beat
writing it by hand. Adopt into `.kiro/skills/` only if the pilot output needs no
manual restructuring.
