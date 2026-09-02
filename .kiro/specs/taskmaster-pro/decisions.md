# Taskmaster Pro — Decision Log

A running record of product and technical decisions: what we considered, what we chose, and why.

---

## 2026-09 · Matt Pocock skills as a workflow layer

**Decision:** Selectively translate the useful patterns from
[`mattpocock/skills`](https://github.com/mattpocock/skills) rather than installing the
suite or making its tracker model authoritative. Evaluation pinned to upstream commit
[`6654f6b`](https://github.com/mattpocock/skills/tree/6654f6b60cd9d5be8b54c6fafe44346dabeb3b76)
(MIT).

**Options weighed:**

| Option | Summary |
|---|---|
| Adopt the full flow verbatim | Run `grill-with-docs → to-spec → to-tickets → implement`, with `docs/agents/` configuration and tracker-published specs. |
| Translate selected patterns | Keep this repository's authority model and adapt only the parts that close a demonstrated gap. |
| Do not use it | Retain the current spec, task, handoff, and research conventions unchanged. |

**Chosen:** Translate selected patterns; adopt none verbatim.

| Skill | Disposition | Reason |
|---|---|---|
| `research` | Adapt; pilot passed | Primary-source review, a background agent, and one cited note worked for this evaluation. Output must follow the repository's existing documentation and data-boundary rules. |
| `handoff` | Pilot before deciding | The pointer-only, redacted shape is promising, but no pickup benchmark was run. For spec work, the durable source remains the canonical task's Progress log. |
| `grill-with-docs` | Pilot before deciding | Its interactive design-tree interview was not exercised in this unattended evaluation. |
| `domain-modeling` | Adapt for unresolved decisions | Code/term conflict checks, concrete edge scenarios, and the strict ADR gate were useful. Reuse existing domain/spec/decision locations instead of adding a parallel hierarchy. |
| `to-spec` | Replace with the readiness check below | Test-seam selection is useful. Publishing another parent spec to a tracker, then applying `ready-for-agent`, conflicts with this project's source of truth and can trigger whole-spec automation. |

**Tracker and client mapping:**

- Declare authority per project. For Taskmaster Pro, product behavior and design update
  `requirements.md`/`design.md`, tool and service choices update `decisions.md`, executable
  work updates `tasks.md`, GitHub issues are mirrors, and Linear carries operational
  workflow state. Other projects may choose Linear as their authority, but no project gets
  two.
- Keep deterministic state transitions in TypeScript or existing automations. These
  conversational workflows do not justify new runtime hooks.
- Keep project-local Kiro skills under `.kiro/skills/<name>/SKILL.md`; add thin
  cross-client discovery wrappers only for clients that require them. The portable layer
  is the tracked instruction contract in `AGENTS.md`, not upstream installer state.
- Do not adopt `setup-matt-pocock-skills` as the project convention. Its inspectable
  Markdown configuration is useful, but a prompt-driven generator is not a better
  convention than the existing `AGENTS.md` + steering pointers. A reusable template should
  ask for one authority, its mirrors, and the domain/decision locations, then add only
  missing pointers to the instruction file every client reads.

**Handoff experiment gate:** Use a temporary handoff only when an active session contains
uncommitted context that is not already in a spec, task, issue, commit, or diff. It must
point to those artifacts, name one next action and suggested local skills, contain no
secrets, and be discarded after pickup. Adopt the pattern only if a fresh agent can start
the named action in under two minutes without a correction; otherwise keep the Progress
log alone.

**Spec-readiness check:** Before implementation, read the current conversation or research,
the code, the declared authority, and related tracker items. Then:

1. detect duplicates and drift before writing;
2. identify unresolved terms, decisions, boundaries, and out-of-scope behavior;
3. name the highest existing behavioral test seam and observable acceptance checks;
4. update only the existing authority: behavior in `requirements.md`, interfaces/seams in
   `design.md`, and bounded work/dependencies in `tasks.md`.

The output is exactly one of `READY` (canonical task + test seam), `NEEDS DECISION`
(unanswered decision frontier), `SYNC REQUIRED` (authority/mirror drift + exact repair), or
`NO-OP/DUPLICATE` (evidence link). It never creates a parallel spec issue or applies an
execution label to a parent spec.

**Smallest experiment:** A product-code-read-only, three-pattern trial used this COL-355
evaluation as the real flow.

- `research` read the pinned upstream skills and local workflow through background agents,
  then produced this cited decision in the repository's existing closeout location.
- `domain-modeling` challenged "common workflow layer" against the code and authority
  rules. It resolved the term to a tracked instruction contract plus one per-project
  authority; no reusable glossary term or additional ADR hierarchy was earned.
- The adapted `to-spec` readiness check inspected Task 5 as a concrete implementation
  candidate. R11 + the Task 5 section already supplied the problem and acceptance criteria,
  so no new spec was needed. The result was `SYNC REQUIRED`: commit
  [`d4ac68c`](https://github.com/CollinBoback/kirocrew-taskmaster-app/commit/d4ac68c6bd9d195b39484a0d43fa01cb09419cd6)
  implemented per-task pending and [issue #16](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/16)
  was closed while `tasks.md` still said `not started`. The authoritative requirements,
  design, task status, and issue guide were corrected in this change. A useful workflow
  must check repository and tracker reality before creating artifacts.

**Limit:** This validates the artifact and authority discipline, not the quality of an
interactive grilling session. Trial that interaction on the next genuinely unresolved
feature before translating `grill-with-docs`.

---

## 2026-08 · Hallmark integration

**Decision:** Do not integrate [Hallmark](https://github.com/Nutlope/hallmark) into the Taskmaster Pro runtime.

**Options weighed:**

| Option | Summary |
|---|---|
| Integrate Hallmark into the runtime loop | Add a design-generation agent/skill that uses Hallmark to produce or refresh UI components at runtime. |
| Use Hallmark as an external contributor-side tool | Treat it as a reference for UI polish passes done outside the shipped product. |
| Skip entirely | No action taken; Hallmark remains unrelated to this project. |

**Chosen:** External contributor-side reference only (no runtime integration).

**Reasoning:**

- The shipped product has a deliberately narrow runtime loop: one execution agent, one committed UI bundle (`ui/dist/index.mjs`), and no live design-generation path.
- Adding a second agent/skill surface for design generation introduces complexity with no current user problem in the focus → backlog → console flow that Hallmark solves on its own.
- Hallmark *could* be useful if a contributor wants to explore a UI polish pass; that work lives outside the product loop and does not need runtime wiring.

---

<!-- Add new decisions above this line in reverse-chronological order. -->
