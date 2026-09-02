# DeepSeek Harness architecture evaluation

**Linear:** [COL-356](https://linear.app/collinboback/issue/COL-356)
**Evaluated:** 2026-09-02
**Upstream snapshot:** [`deepseek-ai/deepseek-harness@49a606b`](https://github.com/deepseek-ai/deepseek-harness/tree/49a606bc5b5934603f22a26957a07dc799ab0291) (`0.1.2-alpha.5`)

## Decision

Use DeepSeek Harness as **design inspiration only** for now.

Do not add it as a second runtime and do not port its plugins. Reuse three ideas when a
real extension seam appears in KiroCrew or Taskmaster:

1. stable capability contracts that separate definition, provider, and consumer;
2. manifest-based discovery with an inspectable effective configuration; and
3. lifecycle-owned registrations that undo themselves on unload.

Taskmaster currently has one implementation of its step runner, one host platform, and a
focused UI that already exposes the complete run. Turning that path into a plugin system
would add packages and compatibility work without enabling a second provider. DeepSeek
Harness is also explicitly in developer preview and warns that compatibility-breaking
changes will occur.

## What is worth learning from

### Lifecycle, contracts, and discovery

Cordis gives each plugin five useful primitives:

- a plugin is a function or service with an `apply(ctx)` lifecycle;
- services live behind stable context keys such as `ctx.tools` and `ctx.sessions`;
- `inject` declares required services and delays activation until they exist;
- typed events provide observation, fan-out, interception, and short-circuiting; and
- registrations are reversible effects that unwind when their plugin unloads.

This is a stronger extension contract than “import a helper and remember to clean it up.”
It also makes runtime dependency requirements visible. DeepSeek Harness builds on that
contract with profiles and bundles:

- a package declares `dsh.bundle.patch` in `package.json`;
- a profile lists ordered bundles and owns out-of-tree dependencies;
- profile, home, and command-line patch layers can replace or insert configuration rows;
- `dsh plugin` delegates installation to pnpm, then discovers bundle packages from their
  manifests and reconciles the profile; and
- `dsh --profile ... --dump-config` shows the effective plugin tree before boot.

The discoverability pattern is portable. The package format is not: KiroCrew uses app,
agent, skill, and hook manifests with a different host lifecycle.

### Core and extensions

DeepSeek Harness has a small boot mechanism rather than a privileged product core. The
shipped product is assembled from the same plugin mechanisms offered to extensions:

| Layer | Responsibility |
|---|---|
| Profile | Selects an application surface such as `web`, `headless`, or `sdk` |
| Bundle | Adds an ordered set of configuration rows and plugin packages |
| Service definition | Declares a stable capability interface |
| Provider | Implements the capability |
| Consumer | Uses the capability without importing its provider |
| Events/effects | Intercept work and bind cleanup to the owning plugin lifecycle |

Its architecture guide explicitly recommends separating definition, provider, and
consumer when they evolve independently. A single-purpose feature can remain one package.
That qualification matters for Taskmaster: copying the full separation before a second
provider exists would be architecture without a current use.

### Runtime, tools, context, and UI communication

The communication model is coherent across the product:

1. The agent loop claims input and appends durable turn, message, tool, and result events
   to the session log.
2. Prompt and tool plugins register against `ctx.systemPrompt` and `ctx.tools`; guarded
   waterfalls can allow, deny, ask, wrap, or observe execution.
3. Host services expose typed methods and streams through generated Typert contracts.
4. The browser receives calls, remote streams, and selected host events through the API
   Gateway; client plugins register renderers and derive views from durable session events.
5. Client bundles are discovered from `dsh.client` manifests, served by the host, and
   materialized lazily in the browser.

The strongest idea is “model-visible means logged.” Replay, transcript rendering, and UI
state derive from one durable session event stream instead of separately inferred status.
Taskmaster cannot adopt that invariant by itself because the KiroCrew gateway owns chat
sessions and event forwarding. It can still prefer structured gateway events over polling
and text markers if KiroCrew later exposes them.

### Composability, isolation, and compatibility

Cordis solves several composition problems well:

- service dependencies replace manual load-order coordination;
- event modes make interception semantics explicit;
- effects give registrations deterministic teardown;
- profile layers make replacement configuration visible and patchable; and
- per-agent contexts and `isolate` realms can scope a provider with its consumers.

Those realms are **not a security boundary**. Plugins still execute in the Harness process,
and the browser executes enabled client bundles. Isolation here means service and
registration scope, not protection from malicious plugin code.

Compatibility is the current weak point for adoption:

- the evaluated release is `0.1.2-alpha.5`;
- the upstream README promises compatibility-breaking changes;
- out-of-tree plugins are ordinary pnpm dependencies using package versions and peer
  dependencies;
- `dsh plugin` discovers and activates bundles but does not perform an explicit Harness
  API compatibility negotiation; and
- startup diagnostics identify a failed plugin, while a rejected live patch preserves the
  last good tree, but these are recovery mechanisms rather than API stability.

Pinning an exact Harness and plugin set would reduce surprise, but it would also turn every
upgrade into a coordinated compatibility test. That cost is not justified for Taskmaster's
current single-provider runtime.

## Smallest useful experiment: run one Taskmaster micro-step

The existing capability is the Focus view's **Run Command Natively** action.

### Current KiroCrew path

1. `runCommand()` in `ui/src/App.tsx` sends the step and command to a task-specific chat
   slot through `POST /api/chat`.
2. The `taskmaster` agent executes through KiroCrew tools and emits
   `STEP RESULT [n]: done|failed — summary`.
3. Taskmaster polls the slot, and `evaluateSlotPoll()` in `ui/src/model.ts` rejects stale
   transcript history, ignores the streaming tail, parses the marker, and returns pure
   settlement actions.
4. `applySlotActions()` updates persisted task state, Focus, notifications, and Console.
5. The embedded `ChatEmbed` shows the same task slot, including output and approval cards.

The result contract is intentionally repeated in `agents/taskmaster.json`,
`skills/taskmaster-method/SKILL.md`, and the deterministic UI parser. That is coupling, but
it is a documented deployment contract rather than accidental duplication.

### Equivalent DeepSeek plugin shape

A Web-profile implementation that preserves the current Focus experience would need:

| Piece | Harness mapping |
|---|---|
| Step execution contract | `ctx.taskSteps` service definition |
| KiroCrew-backed execution | provider that posts to the task's KiroCrew chat slot |
| Lifecycle/status | durable `task-step/start`, `task-step/result`, and `task-step/failed` session events |
| UI action | client plugin calling a typed remote method |
| Focus rendering | client conversation definition and keyed renderer derived from those events |
| Registration | one profile bundle declaring host and client plugin rows |

This would make the boundary explicit and make step state replayable. It would not remove
the KiroCrew polling or `STEP RESULT` parser unless KiroCrew supplied structured events.
A Web-profile implementation would also duplicate the Focus UI surface. Headless or SDK
profiles avoid that UI duplication, but they still add a Node process, Harness profile,
RPC boundary, and state lifecycle around the existing KiroCrew runtime; they can omit the
client bundle and renderer because Taskmaster remains the only UI.

### Comparison

| Dimension | Current Taskmaster/KiroCrew | Harness-shaped version | Result |
|---|---|---|---|
| Complexity | Three existing contract surfaces; pure poll evaluator has focused tests | Web: service, provider, durable events, RPC, client bundle, renderer, bundle; headless/SDK: omit client pieces but keep the second runtime | Current path is materially smaller |
| Coupling | Coupled to KiroCrew chat-slot REST, `taskmaster` agent, and `STEP RESULT` | Consumer/provider coupling improves, but KiroCrew transport remains and Harness APIs are added | No net reduction until a second provider exists |
| Observability | Embedded transcript, per-step output, Console logs, pending state; polling is indirect | Durable typed events, replay, runtime plugin tree, failed-plugin diagnostics | Harness model is better, but the current evidence is adequate |
| UX | One focused button, one visible micro-step, inline approvals, automatic settlement | Web duplicates the surface; headless/SDK preserve Focus but provide no user-facing gain | Current UX better serves Taskmaster's mandate |
| Compatibility | Taskmaster owns its manifests, prompts, and parser on KiroCrew-owned platform contracts | Adds an alpha Harness, Cordis, profile, package, and optional client-module compatibility surface | Harness versioning is an avoidable risk |

**Experiment result:** the mapping is feasible but increases complexity and does not remove
the current transport boundary. Its main benefit—typed, replayable lifecycle events—must
come from KiroCrew's host layer to simplify Taskmaster rather than merely being mirrored in
another process.

## Option assessment

| Option | Decision | Why |
|---|---|---|
| Run the Web profile as an additional tool | No | Duplicates agent runtime, browser UI, credentials, and operational state without filling a Taskmaster gap |
| Run a headless or SDK sidecar | No | Avoids a second UI but still adds a Node service, RPC, credentials, state, and failure modes around KiroCrew |
| Port selected DeepSeek plugins or its plugin runtime | No | Plugins target Cordis/Harness contracts and are not portable to the KiroCrew host |
| Use the architecture as design inspiration | **Yes** | Capability seams, reversible effects, manifest discovery, and durable event projections are useful without adding a runtime |

Any runtime option would also violate Taskmaster's current backend-less architecture (N1)
and no-Node-on-the-work-machine distribution contract (N2). It therefore requires an
approved product-spec change, not an implementation experiment.

Revisit a concrete port only when one of these triggers exists:

- the product spec explicitly permits another runtime and Node deployment;
- Taskmaster needs two interchangeable providers for the same capability;
- KiroCrew exposes structured, replayable run events that can replace slot polling;
- multiple KiroCrew apps need a shared extension manifest and lifecycle; or
- DeepSeek Harness publishes a stable plugin compatibility policy beyond developer preview.

## Sources

Upstream facts were checked at commit
[`49a606b`](https://github.com/deepseek-ai/deepseek-harness/commit/49a606bc5b5934603f22a26957a07dc799ab0291):

- [README and developer-preview warning](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/README.md)
- [Architecture, profiles, events, and capability seams](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/docs/architecture.md)
- [Cordis plugin lifecycle and dispatch modes](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/docs/cordis-primer.md)
- [Profile boot, patching, and failure behavior](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/packages/boot/app-boot/README.md)
- [`dsh plugin` discovery and reconciliation](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/apps/cli/src/plugin.ts)
- [Host/client typed RPC and event forwarding](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/packages/api/gateway/README.md)
- [Client plugin discovery and lazy loading](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/packages/client/modules/README.md)
- [Tool registry, policy, and execution pipeline](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/packages/core/tools/README.md)
- [Conversation extension path from durable events to UI](https://github.com/deepseek-ai/deepseek-harness/blob/49a606bc5b5934603f22a26957a07dc799ab0291/docs/subsystems/conversation.md)
