# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [project-artifact — Living Project Status Page](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/project-artifact) | GitHub (anthropics/claude-plugins-official) | Pending |
| 4 | [github-issue-creator — Structured GitHub Issues from Messy Input](https://officialskills.sh/microsoft/skills/github-issue-creator) | officialskills.sh → GitHub (microsoft/skills) | Adapt |

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

## 3. project-artifact — Living Project Status Page

- **URL:** https://github.com/anthropics/claude-plugins-official/tree/main/plugins/project-artifact
- **Type:** Claude Code plugin (one skill + HTML template; no commands, agents, or hooks)
- **Category:** Project tracking / status communication
- **Decision:** Pending (Linear: COL-336, AI Research project)

### What it is

An official Anthropic plugin that generates and publishes a **living status page** for a multi-workstream project (a migration, launch, or research effort). Contents:

- **`SKILL.md`** — the workflow: gather live state from the project's sources (repo/PRs via `gh`, tracker, docs), pick tabs from a fixed catalog (Overview + Workstreams always; Attention / Background / Plan / Risks / Decisions-FAQ only when they earn a tab), render one self-contained HTML file, publish via Claude Code's built-in `Artifact` tool to a default-private `claude.ai/code/artifact/<uuid>` page.
- **Refresh-in-place design** — each render embeds a hidden `artifact-state` JSON block (`as_of` + one entry per workstream). A per-project `config.md` in the plugin data dir records sources and the minted URL, so "refresh the artifact" re-gathers live state, edits the previous render in place, redeploys to the **same URL**, and reports only the delta.
- **`swe.md`** — software specialization for PR-driven projects: an X.Y PR-numbering convention that encodes dependency order (no DAG diagrams), exact `gh`/GraphQL queries for PR/CI/unresolved-review state, and a per-PR write-up fragment.
- **`template.html`** — a clean, self-contained skeleton: light/dark via `prefers-color-scheme`, status banner, always-visible next-steps strip, status pills, JS and pure-CSS tab mechanisms, system fonts only, everything inlined (the Artifact CSP blocks all external hosts).

### Proposed value / use case

- The **structure is the value**, and it is portable: the tab catalog, status banner + next-steps strip, "deltas not re-narratives" refresh model, and the machine-readable state block are a well-thought-out template for any recurring status page — directly reusable for BI project status reporting or a workshop artifact, regardless of publish target.
- The **freshness/trust rules** are best-practice and worth stealing on their own: as-of timestamps first, failed fetches mark data *stale, never invented*, inferred mappings stated with their basis, fetched text treated as untrusted data (prompt-injection flagging) *and* untrusted markup (entity-encoding, `\u003c` in JSON so a hostile branch name can't script-inject the published page).
- `swe.md`'s live-state `gh` queries (including the GraphQL unresolved-thread count, which REST miscounts) are useful reference material independent of the plugin.

### Caveats

- **Hard dependency on Claude Code's built-in `Artifact` tool**, which requires a claude.ai login (beta, Team/Enterprise plans; unavailable on API-key/Bedrock/Vertex sessions and in headless runs). Cursor and Kiro agents do not have this tool, so the publish step — the plugin's core deliverable — does not work in this environment as shipped.
- Per-project state lives in a machine-local plugin data dir (`${CLAUDE_PLUGIN_DATA}`), so configs don't follow the user across machines without manual copying.
- Publishing is interactive-only by design; automation can build pages but not publish them.

### Recommendation

**Adapt, don't adopt as-is.** The plugin cannot be installed usefully here because the Artifact publish tool doesn't exist outside Claude Code with a claude.ai login. But the template and conventions transfer cleanly: if a status-page workflow is wanted, vendor `template.html` plus the SKILL's tab catalog, state-block/delta-refresh convention, and freshness/trust rules as a local skill, and swap the publish step for a target available here (committed HTML in the repo, GitHub Pages, or a Linear document). Bounded follow-up if adopted: one local skill + template producing a status page for a single pilot project.

---

## 4. github-issue-creator — Structured GitHub Issues from Messy Input

- **URL:** https://officialskills.sh/microsoft/skills/github-issue-creator
- **Canonical source:** https://github.com/microsoft/skills — `.github/skills/github-issue-creator/SKILL.md`
- **Type:** Skill (agent skill, installable via `npx skills add https://github.com/microsoft/skills --skill github-issue-creator`)
- **Category:** Productivity / issue workflow
- **Linear:** COL-335 (AI Research project)
- **Decision:** **Adapt** (approved 2026-08-29) — adapted skill vendored at `.kiro/skills/github-issue-creator/SKILL.md`

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

### Decision record (2026-08-29)

**Adapt — approved.** Kept the template, extraction guidelines, severity rubric, and
sensitive-data placeholder rule. Two adaptations, per the caveats above:

1. **Output location:** the upstream `/issues/` committed-markdown rule is replaced
   with "draft the issue body and file it as a GitHub issue (auto-synced to Linear)";
   issue files are never committed to the repo.
2. **Examples:** the Azure-product examples are replaced with synthetic, generic ones
   per this repo's sample-data boundary.

The adapted skill is vendored at `.kiro/skills/github-issue-creator/SKILL.md`.
**Bounded follow-up (Q3 decision-gate requirement):** one low-risk pilot — take a
single real messy input (a dictated note or pasted error), run the adapted skill to
draft the issue, file it in GitHub, and judge whether the structured output beat
writing it by hand. Keep or trim the skill based on that pilot.
