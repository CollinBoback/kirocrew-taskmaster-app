# Taskmaster Pro — Decision Log

A running record of product and technical decisions: what we considered, what we chose, and why.

---

## 2026-09 · Client-neutral skill router

**Decision:** Keep the structured skill router as a contributor-side experiment; do not add
it to the Taskmaster runtime without observed, replayable skill-selection failures.

**Options weighed:**

| Option | Summary |
|---|---|
| Add a runtime MASTER-ROUTING layer now | Route every task through deterministic configuration before opening a skill. |
| Keep a regression harness outside the runtime | Test structured routing and capability discovery against benign local skills without changing product behavior. |
| Take no action | Continue relying only on client skill metadata with no replayable routing check. |

**Chosen:** Contributor-side regression harness.

**Reasoning:**

- The [`COL-359` experiment](../../../experiments/skill-router/README.md) passed 38/38
  hand-authored route, overlap, boundary, and abstention cases; a deterministic
  description-overlap proxy passed 29/38.
- The proxy is not Kiro's model, so these results do not prove a production routing gap.
- Configuration validation, detection-only capability indexing, and a cross-platform
  benchmark are useful now without introducing a second runtime router.
- A runtime layer becomes justified when real misroutes can be added to the replay corpus
  and the structured candidate fixes them without regressions.

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
