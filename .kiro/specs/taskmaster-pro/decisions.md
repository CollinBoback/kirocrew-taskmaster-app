# Taskmaster Pro — Decision Log

A running record of product and technical decisions: what we considered, what we chose, and why.

---

## 2026-09 · Pi agent harness patterns

**Decision:** Do not add [Pi](https://github.com/earendil-works/pi) as a Taskmaster runtime
dependency. Adapt the working `Agent` lifecycle vocabulary and the proposed durable
`AgentHarness` telemetry and operation-identity contracts only when run visibility or
reload-safe settlement becomes a prioritized product task.

**Reasoning:** KiroCrew already owns providers, credentials, tool execution, approvals, and
the durable per-task chat transcript. Embedding Pi would duplicate those layers, Pi
explicitly provides no built-in filesystem, process, network, or credential isolation, and
the inspected durable `AgentHarness` is still an unimplemented scaffold. The smallest
source-trace experiment and detailed pattern map are recorded in
[`docs/pi-agent-harness-evaluation.md`](../../../docs/pi-agent-harness-evaluation.md).

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
