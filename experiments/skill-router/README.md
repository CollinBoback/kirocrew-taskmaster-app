# Client-neutral skill router experiment (COL-359)

This is a contributor-side experiment, not a Taskmaster runtime feature. It tests the
portable parts of
[`reverse-skill`](https://github.com/zhaoxuya520/reverse-skill) without copying its
security workflows, bootstrap behavior, or tool catalog.

Research was pinned to upstream commit
[`71acc8e`](https://github.com/zhaoxuya520/reverse-skill/tree/71acc8e3115f76bad7a914c36466c1086232288c)
(MIT) on 2026-09-02.

## Result

The pattern is worth adapting as a testable routing layer, but there is not yet evidence
that Taskmaster needs it in production.

- A structured router passed **38/38** cases: 28/28 expected routes and 10/10 safe
  abstentions.
- A deterministic description-overlap proxy passed **29/38**: 25/28 expected routes and
  4/10 abstentions.
- The measured 23.7-point overall difference is evidence about this fixture only. Kiro currently
  exposes skill names and descriptions to a model; this repository has no supported API
  for replaying that model decision, so the proxy is **not** a measurement of Kiro's
  actual routing accuracy.
- The useful adoption trigger is observed skill-selection regressions with replayable
  examples, not the mere existence of more skills.

## What transferred

| Upstream pattern | Local experiment |
|---|---|
| [`routing.json`](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/config/routing.json) is the route-table source of truth | `routing.json` separates logical skill IDs and route rules from the Kiro path adapter |
| [Bash](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/master-route.sh) and PowerShell consume the same semantics | `router.mjs` is host-neutral; another host adds a skill-path adapter without changing route semantics |
| [`routing-benchmark.json`](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/tests/routing-benchmark.json) stores `(hint, expected route)` regressions | `benchmark.json` stores 28 route scenarios plus 10 boundary, unknown, and ambiguity abstentions |
| [`refresh-tool-index.sh`](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/scripts/refresh-tool-index.sh) detects instead of assuming | `tool-index` checks configured CLIs on `PATH` without executing or installing them |
| [Windows/Linux CI](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/.github/workflows/ci.yml) runs the same corpus | This repository runs the experiment on `ubuntu-latest` and `windows-latest` |

The five routed skills are:

1. `sql-server-table-reconciliation`
2. `validate-data`
3. `project-status-page`
4. `kpi-dashboard-design`
5. `sql-optimization`

## Run it

From the repository root:

```bash
node experiments/skill-router/router.mjs self-check
node experiments/skill-router/router.mjs benchmark
node experiments/skill-router/router.mjs route "Tune a slow SQL query using its execution plan"
node experiments/skill-router/router.mjs tool-index
```

An adapter may supply MCP names it discovered through its own supported tool API:

```bash
node experiments/skill-router/router.mjs tool-index --mcp linear
```

Without adapter input, MCP capability state is `unknown`, not `missing`. Adapter input is
reported as `adapter-reported`, not `available`; authentication and authorization remain
unknown. CLI discovery similarly reports `detected`, not ready. The core does not inspect
Claude, Codex, Cursor, or Kiro config files.

## Safety and auditability

The portable gates are narrower than the upstream security-specific
[`scope contract`](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/ops/scope-contract.md):

- Routing is advisory. A miss returns no route instead of guessing a fallback skill.
- Token boundaries prevent partial-word hits, low scores abstain, and tied top scores
  return ordered alternatives instead of selecting one.
- Capability indexing is detection-only; it never installs, authenticates, or starts a
  tool.
- Tool availability is not authorization. Taskmaster's existing approval and
  destructive-action rules remain authoritative.
- Route config references must resolve to regular files inside this repository after
  symlinks are resolved.
- Priority must contain every route exactly once, preventing silent configuration drift.
- The benchmark must include every route and at least one abstention; CI also executes
  capability discovery on Windows and Linux.

The upstream [Evidence → Finding → Path](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/ops/evidence-finding-path.md)
and [append-only timeline/work-item](https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/ops/timeline-workitem.md)
contracts are useful, but too heavy to impose on every benign task. The general enterprise
adaptation is:

1. **Evidence** — command, test, artifact, or source link.
2. **Finding** — claim that cites its evidence and confidence.
3. **Decision** — action, owner, and remaining verification.

Use an append-only timeline and explicit work items only for long-running or
high-consequence work. The existing `tasks.md` progress log already covers interrupted
Taskmaster development work.

## Limits

- The corpus is hand-authored and small; 38/38 proves deterministic replay, not broad
  intent understanding.
- Weighted phrase matching needs maintenance and can miss paraphrases.
- The description proxy is intentionally simple and cannot represent an LLM router.
- MCP discovery has no client-neutral filesystem convention. A real adapter must use the
  host's supported discovery API and pass only capability names to the core.
- No upstream bootstrap or auto-install behavior was copied. That behavior expands the
  supply-chain and authorization surface and is outside this experiment.
