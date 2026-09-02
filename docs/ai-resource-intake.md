# AI Resource Intake List

Running list of AI agents, skills, ideas, and info under evaluation for formal ingestion into the Cursor/Kiro system. Each entry gets a research summary (fetched from the source URL) to inform a final yes/no decision.

| # | Title | Source | Decision |
|---|-------|--------|----------|
| 1 | [Clean Code — Pragmatic AI Coding Standards](https://www.aitmpl.com/component/skill/development/clean-code) | aitmpl.com (claude-code-templates) | Pending |
| 2 | [find-skills — Skill Discovery and Installation](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) | GitHub (vercel-labs/skills) | Pending |
| 3 | [project-artifact — Living Project Status Page](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/project-artifact) | GitHub (anthropics/claude-plugins-official) | **Adapt** (2026-08-29) |
| 4 | [archify — Verifiable Architecture/Workflow Diagrams](https://github.com/tt-a1i/archify) | GitHub (tt-a1i/archify) | **Adopt** (2026-09-02) |
| 5 | [How to evaluate LLMs before production](https://github.blog/ai-and-ml/llms/how-to-evaluate-llms-before-production/) | GitHub Blog (secret-scanning team) | Pending |

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
- **Decision:** **Adapt** — decided 2026-08-29 (Linear: COL-336, AI Research project). Vendored as [`.kiro/skills/project-status-page/`](../.kiro/skills/project-status-page/SKILL.md) (pinned upstream commit `4a3e656`, Apache-2.0) with the publish step swapped from the claude.ai Artifact tool to committed HTML under `docs/status/`. Pilot page: [`docs/status/ai-research.html`](status/ai-research.html).

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

## 4. archify — Verifiable Architecture/Workflow Diagrams

- **URL:** https://github.com/tt-a1i/archify
- **Type:** Agent skill with a bundled zero-dependency Node.js renderer (`npx skills add tt-a1i/archify`)
- **Category:** Diagramming / communication artifacts
- **Decision:** **Adopt** — decided 2026-09-02 (Linear: COL-347, "Implement in AGV"). Vendored at tag `v2.16.0` (commit `c826e6c`, MIT) as [`.agents/skills/archify/`](../.agents/skills/archify/SKILL.md). First triaged **experiment** in the [Todoist intake review](todoist-resource-intake-review.md).

### What it is

An agent skill that turns a system description (or repository evidence, or pasted Mermaid) into a polished, self-contained interactive HTML diagram. The agent authors typed JSON IR for one of five diagram types — architecture, workflow, sequence, data flow, lifecycle — and the bundled renderer (`bin/archify.mjs`, Node ≥18, no npm dependencies at runtime) deterministically compiles and validates it: schema, layout, route, and label-clearance checks must all pass before `deliver` atomically replaces the output. Failures return machine-readable diagnostics with supported fixes instead of a retry guess. Output is one HTML file with dark/light themes, search/trace/story interactions, and PNG/SVG/WebM export.

### Proposed value / use case

- Directly useful for BI work: data-lineage/ETL maps, architecture overviews for docs and reviews, and share-card images for READMEs and status pages — produced in chat with a validation receipt instead of hand-drawn Mermaid.
- The validate-before-deliver contract fits this repo's determinism doctrine: the agent supplies judgment (topology, emphasis), deterministic code checks the artifact.
- Complements the vendored `project-status-page` skill (a delivered diagram can be inlined into a status page).

### Caveats

- Heavier than the usual vendored skill: the install unit is a ~2.5 MB runtime (74 files), not a lone SKILL.md. Vendored trimmed — upstream's `test/` directory and pre-rendered `examples/*.html` showcases are dropped; the `examples/*.json` sources the authoring path requires are retained, and `doctor` passes all checks after the trim.
- The skill's optional update-awareness step GETs a static manifest from `tt-a1i.github.io`. It never auto-updates, but on restricted machines set `ARCHIFY_UPDATE_CHECK_DISABLED=1` (noted in the vendored provenance).
- Upstream `main` tracks a dev version (`2.17.0-dev.1`); the vendored copy pins the latest stable tag. Updates are a deliberate re-vendor, never automatic.

### Placement

Workspace scope in `.agents/skills/` is the one location Antigravity, Codex CLI, and opencode all read, so a single copy covers "implement in AGV" plus the existing Codex toolbox with no duplication into `.kiro/skills/` or `.claude/skills/`. Making it available to Antigravity in *other* workspaces is a user-owned global install: `npx skills add tt-a1i/archify -g --agent antigravity` (lands in `~/.gemini/antigravity/skills/`).

---

## 5. How to evaluate LLMs before production

- **URL:** https://github.blog/ai-and-ml/llms/how-to-evaluate-llms-before-production/
- **Type:** Article (GitHub Blog, 2026-08-25; lessons from evaluating an LLM false-positive filter for GitHub secret scanning)
- **Category:** LLM evaluation methodology
- **Decision:** Pending (Linear: COL-352, Supplier OTB Launch project)

### What it is

A practitioner write-up of how GitHub's secret-scanning team evaluated an LLM system *offline, before production* — the pre-production complement to the live-signal cycle already vendored as [`continuous-prompt-evaluation`](../.kiro/skills/continuous-prompt-evaluation/SKILL.md). Its eight practices:

1. **Start with the product decision, not the model.** Organize metrics into three levels: *primary outcome* (what improves for the user), *safety constraint* (a floor an experiment may not cross — for them, recall), *operational guardrails* (latency, cost, reliability). A big precision win that violates the recall floor is a "don't advance", not an improvement.
2. **Treat offline evaluation like integration testing.** Rerun it on every meaningful prompt/model/input/pipeline change; record prompt, model, dataset version, and config per run so runs compare against a known baseline. Change one major variable at a time; version prompts like code, with rollback.
3. **Keep offline evaluation close to production** — preserve ambiguity, distractors, and input formatting. Their example: the model reasons about a nearby credential-*looking* variable instead of the flagged candidate, a failure clean single-candidate datasets never surface.
4. **Treat production labels as signals, not ground truth.** A "resolved" alert can mean rotated, risk-accepted, or unblocked — not "false positive". Ask how the label was created before trusting it; manually review important subsets.
5. **Use synthetic/open datasets to fill coverage gaps**, never as a stand-in for production-like data.
6. **Use error analysis to find what aggregate metrics hide.** Classify each failure by source — *model, prompt, input, pipeline, dataset, or label* — because each source implies a different fix.
7. **Use LLM-as-judge for triage, not truth**: auto-handle clear cases, route low-confidence/high-impact cases to humans, sample high-confidence cases for systematic errors, track judge/system/human disagreement, version the judge prompt like any other component.
8. Result: 95% offline false-positive reduction within the recall guardrail — presented as evidence to justify *online* experimentation, not proof of production behavior.

Closes with a pre-production checklist (product goals, data/labels, evaluation rigor, error analysis).

### Proposed value / use case

- **Direct methodological backing for the OTB diagnosis kit.** The [rubric's](../deliverables/otb-diagnosis/rubric.md) three-lever tagging *is* this article's practice 6 (error-source classification: one cheapest-fix source per failure, evidence from response text only, ambiguous stays ambiguous), and the [runbook's](../deliverables/otb-diagnosis/RUNBOOK.md) blind-Claude-pass-plus-owner-adjudication is practice 7 (judge as triage, human as final call). Useful as the citable external precedent when pitching the method in review sessions.
- **The "next cycle" pitch, written out.** The one-pager promises "score these systematically instead of by judgment" for the next pass; this article is that method for the offline side: a run-tracking table (prompt version × model × metrics), one-variable-at-a-time changes, and the primary/safety/guardrail metric split. For the OTB chatbot, the natural mapping is answer accuracy as primary outcome and "never fabricate a number a view can't support" as the safety constraint.
- **Fills the pre-production gap** in the vendored `continuous-prompt-evaluation` skill, which starts from live traffic and cohorts. This article covers the stage before there is traffic: offline datasets, label skepticism, synthetic coverage. Together they span the full lifecycle.

### Caveats

- It is an article, not an installable skill — there is nothing to vendor verbatim. Ingestion means folding its additions (three-level metric hierarchy, run-tracking table, label-provenance questions, error-source taxonomy) into the existing skill or a new offline-eval card, which is authoring work, not copying.
- The worked example (secret scanning) is a binary classifier with crisp precision/recall; the OTB chatbot is open-ended SQL/NL answering, so the metric hierarchy transfers but the specific metrics need defining before the method is runnable.
- Overlaps with the existing skill on judge discipline (evidence-based, neutral-on-ambiguity, same rubric across cohorts) — an adapted version should reference, not restate, those sections.

### Recommendation

**Adapt, not adopt-verbatim.** Cheapest useful form: extend [`continuous-prompt-evaluation`](../.kiro/skills/continuous-prompt-evaluation/SKILL.md) with a short "Stage 0 — offline evaluation before traffic" section carrying the three-level metric hierarchy, the run-tracking table, the label-provenance questions, and the model/prompt/input/pipeline/dataset/label error taxonomy, each traced to this article. Defer until the OTB next-cycle scoring pass is actually scheduled — the article is already fully summarized here for the pitch itself.
