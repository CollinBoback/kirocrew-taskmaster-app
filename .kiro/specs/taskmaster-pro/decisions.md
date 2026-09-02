# Taskmaster Pro — Decision Log

A running record of product and technical decisions: what we considered, what we chose, and why.

---

## 2026-09 · DeepSeek Harness architecture

**Decision:** Use [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) as
design inspiration only; do not add it as a runtime or port its plugins.

**Options weighed:**

| Option | Summary |
|---|---|
| Run the Web profile | Add a second agent runtime and local Web UI beside KiroCrew. |
| Run a headless or SDK sidecar | Keep Taskmaster's UI but add a Node process, RPC, and state lifecycle. |
| Port plugins or plugin infrastructure | Adapt Cordis/Harness packages or recreate their contracts in KiroCrew. |
| Reuse architecture patterns | Apply selected ideas only when an actual extension seam appears. |

**Chosen:** Reuse architecture patterns without adding a Harness dependency.

**Reasoning:**

- Taskmaster's single step runner already has focused UX, inline KiroCrew approvals, a
  deterministic parser, and tested stale-result protection.
- Mapping that runner into Harness requires a service, provider, durable events, RPC,
  and profile bundle while retaining the KiroCrew chat-slot boundary; preserving Focus
  in the Web profile additionally requires a client renderer.
- Cordis offers useful capability seams, manifest discovery, and reversible lifecycle
  effects, but its isolation is service scoping rather than a security boundary.
- The evaluated `0.1.2-alpha.5` release is in developer preview and explicitly promises
  compatibility-breaking changes.
- Every runtime option conflicts with the backend-less and no-Node-on-the-work-machine
  product contracts, so adoption requires an approved spec change.

The evidence, capability mapping, tradeoff matrix, and revisit triggers are in
[`docs/deepseek-harness-architecture-evaluation.md`](../../../docs/deepseek-harness-architecture-evaluation.md).

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
