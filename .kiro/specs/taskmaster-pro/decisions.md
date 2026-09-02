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
| `research` | Translate first | Its primary-source, background-agent, single-note discipline fits, but output must follow the repository's existing documentation and data-boundary rules. |
| `handoff` | Translate | Pointer-only, redacted handoffs are useful for a live session. The durable pickup source remains the canonical task's Progress log, not an ephemeral OS-temp file. |
| `grill-with-docs` | Translate only when decisions are unresolved | Its design-tree questioning and strict ADR gate are useful. A new `CONTEXT.md`/`docs/adr/` hierarchy would duplicate `requirements.md`, `design.md`, and this decision log. |
| `to-spec` | Replace with a spec-readiness check | Test-seam selection is useful. Publishing another parent spec to a tracker, then applying `ready-for-agent`, conflicts with `tasks.md` as the source of truth and can trigger whole-spec automation. |

**Tracker and client mapping:**

- For Taskmaster Pro, decisions update `requirements.md`/`design.md`, executable work
  updates `tasks.md`, GitHub issues remain mirrors, and Linear remains an integration
  surface. No skill may create a second project-management authority.
- Keep deterministic state transitions in TypeScript or existing automations. These
  conversational workflows do not justify new runtime hooks.
- Keep project-local Kiro skills under `.kiro/skills/<name>/SKILL.md`; add thin
  cross-client discovery wrappers only for clients that require them. The portable layer
  is the tracked instruction contract in `AGENTS.md`, not upstream installer state.
- Do not adopt `setup-matt-pocock-skills` as the project convention. Its inspectable
  Markdown configuration is a useful idea, but this repository already records tracker,
  domain, and sequencing contracts in `AGENTS.md` and `.kiro/steering/`.

**Smallest experiment:** A fresh-context, read-only trial applied `handoff`,
`grill-with-docs`, and `to-spec` to Task 5 (per-task agent concurrency).

- The pointer-only handoff added modest pickup value without duplicating the task.
- The decision frontier was empty, so grilling correctly produced no glossary or ADR.
- The existing R11 + Task 5 section already supplied the problem, sequence, and acceptance
  criteria; a new spec would have been duplication.
- The trial found more important drift: commit
  [`d4ac68c`](https://github.com/CollinBoback/kirocrew-taskmaster-app/commit/d4ac68c6bd9d195b39484a0d43fa01cb09419cd6)
  implemented per-task pending and [issue #16](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/16)
  was closed while `tasks.md` still said `not started`. The authoritative requirements,
  design, task status, and issue guide were corrected in this change. A useful workflow
  must check repository and tracker reality before creating artifacts.

**Pilot gate:** Before translating more skills, trial a project-local `research` skill on
one bounded public-source question. It passes only if it writes one cited note in the
existing location, creates no duplicate tracker state, respects data boundaries, and a
fresh agent can identify the next action from canonical artifacts in under two minutes.

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
