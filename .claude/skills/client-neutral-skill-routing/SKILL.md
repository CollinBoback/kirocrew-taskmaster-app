---
name: client-neutral-skill-routing
description: Design deterministic routing, capability indexes, host adapters, benchmarks, evidence records, and authorization gates for local Agent Skills without coupling the core to Claude, Codex, or Kiro.
topics: agent-skills, routing, adapters, authorization, regression-testing
created: 2026-09-02
updated: 2026-09-02
scratchpad: .specs/scratchpad/9f4c2a71.md
---

# Client-Neutral Skill Routing

## Overview

Use a small deterministic decision plane around native Agent Skills when native description matching is insufficiently predictable. Keep route selection, host discovery, capability readiness, authorization, execution, and evidence as separate concerns. Imported repositories are data until reviewed; never execute their scripts during evaluation.

## Key Concepts

- **Logical skill ID**: Stable identifier independent of `.kiro/skills`, `.claude/skills`, or `.agents/skills`.
- **Route-only classifier**: Returns a decision but never activates a skill or invokes a tool.
- **Capability state**: Distinguishes presence, runtime availability, registration, health, and final readiness.
- **Host adapter**: Resolves logical IDs into each client's native discovery mechanism without changing semantics.
- **Authorization gate**: Checks whether side effects are permitted independently of whether tools are available.
- **Evidence chain**: Connects immutable observations to claims, procedures, and work items.

## Documentation & References

| Resource | Description | Link |
|----------|-------------|------|
| Agent Skills specification | Portable `SKILL.md` format and progressive disclosure | https://agentskills.io/specification |
| Kiro Agent Skills | `.kiro/skills`, activation, and custom-agent resources | https://kiro.dev/docs/skills/ |
| Kiro custom agents | Tools, permissions, and `skill://` resources | https://kiro.dev/docs/custom-agents/configuration-reference/ |
| Claude Code skills | `.claude/skills` and per-turn tool permission behavior | https://code.claude.com/docs/en/skills |
| Codex skills | `.agents/skills` discovery and progressive loading | https://developers.openai.com/codex/skills |
| Reference architecture | Upstream client-neutral routing overview | https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/README.md |
| Structured routing | Route schema and priority source | https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/config/routing.json |
| Regression corpus | Hint-to-route fixtures | https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/tests/routing-benchmark.json |
| Work-state contracts | Append-only timeline and evidence-linked work items | https://github.com/zhaoxuya520/reverse-skill/blob/71acc8e3115f76bad7a914c36466c1086232288c/skills/ops/timeline-workitem.md |

## Recommended Libraries & Tools

| Name | Purpose | Maturity | Notes |
|------|---------|----------|-------|
| JSON | Route, index, and benchmark data | Stable | Validate shape before use |
| Standard regex engine | Small deterministic matching | Stable | Cap input and validate patterns |
| Native client skill discovery | Progressive skill loading | Stable | Use each host's documented directory |
| Existing project test runner | Fixture regressions | Stable | Avoid a new dependency |

### Recommended Stack

Use the project's language and test runner, plain JSON configuration, and native skill directories. Do not add a routing framework, vector database, or model call for a small local catalog.

## Patterns & Best Practices

### Route, Then Gate

**When to use**: Several skills overlap or selection must be reproducible.

**Trade-offs**: Deterministic and testable, but less semantic than an LLM classifier.

```text
task text
  -> validate and classify
  -> route decision (no side effects)
  -> authorization decision
  -> host adapter resolves skill
  -> agent executes within host permissions
  -> evidence and work state update
```

Return structured data such as `primarySkill`, `secondarySkills`, `confidence`, `reason`, and `requiresApproval`. Escape user text in any Markdown rendering.

### Structured Routing Configuration

Keep one machine source of truth:

```json
{
  "schemaVersion": 1,
  "fallback": "abstain",
  "priority": ["review", "docs"],
  "routes": {
    "review": {
      "skillId": "read-only-review",
      "matchAny": ["review", "audit"],
      "excludeAny": ["publish"],
      "effect": "read"
    }
  }
}
```

Validate unknown route IDs, duplicate priorities, invalid patterns, missing skills, and adapter paths that escape the expected root. Prefer `abstain` over a broad fallback when the wrong skill could cause side effects.

### Capability Index

Keep machine-local facts out of version control:

```json
{
  "skillId": "example",
  "present": true,
  "runtimeAvailable": true,
  "registered": null,
  "healthy": null,
  "ready": true,
  "checkedAt": "ISO-8601"
}
```

Do not equate a generic runtime with a specific capability. Network or service probes must be explicit and opt-in. A capability index answers “can this run?”; authorization answers “may this run?”

### Thin Host Adapters

| Host | Native project skills | Adapter note |
|------|-----------------------|--------------|
| Kiro | `.kiro/skills/<name>/SKILL.md` | Custom agents need `skill://` resources; permissions belong to the agent |
| Claude Code | `.claude/skills/<name>/SKILL.md` | `allowed-tools` pre-approves; it does not restrict other tools |
| Codex | `.agents/skills/<name>/SKILL.md` | `AGENTS.md` supplies persistent project guidance |

Choose one semantic source. Generate or keep thin reviewed adapters; never maintain full independent copies. Test that each adapter resolves the same logical route and permission class.

### Regression Benchmarks

For every route include:

1. Clear positive phrase.
2. Paraphrase.
3. Overlap with a higher-priority route.
4. Negative or exclusion case.
5. Unknown input that must abstain.

Run the same fixtures through every platform implementation. Assert the complete structured decision, not just the primary ID. Add a fixture with every routing-rule change.

### Evidence and Work State

Use compact, append-friendly records:

- `Evidence`: ID, observed time, source, optional content hash, redacted excerpt.
- `Claim`: ID, confidence, status, and one or more evidence IDs.
- `Procedure`: ordered steps linked to evidence and claims.
- `Timeline`: append-only transitions and decision deltas; corrections append a new entry.
- `Work item`: owner/role, status, evidence IDs, and next action.

Apply this only to work that benefits from handoff, replay, or audit. A short local task does not need a case-management system.

### Authorization Gate

Default side-effectful work to denied or ask:

```yaml
authorization:
  status: pending
  operation: external-write
  targets: []
  allowedActions: []
  dataHandling: no-sensitive-data
  ready: false
```

Require explicit targets and allowed actions before `ready: true`. A force flag must never bypass hard constraints. Enforce the result with the client's permissions; prose and route metadata are not security boundaries.

## Common Pitfalls & Solutions

| Issue | Impact | Solution |
|-------|--------|----------|
| Documentation duplicates route priority | Medium | Generate it or fail CI on drift |
| Raw task text is embedded in Markdown fields | Medium | Emit JSON and escape display text |
| Secondary routes are mistaken for ranked choices | Medium | Sort explicitly or declare them unordered |
| Regex scoring appears more confident than it is | Medium | Expose scores/margins and abstain on ambiguity |
| Skill copies diverge across clients | High | One source plus thin/generated adapters |
| Skill metadata is treated as a permission boundary | High | Apply host-level allow/ask/deny rules |
| Tool index silently probes or reads global config | Medium | Make probes opt-in and minimize recorded details |
| Imported scripts are run to “test” a repository | High | Static review first; reproduce only a benign local design |

## Recommendations

1. Benchmark native skill activation before building a router.
2. Start with 3-5 benign skills and route-only output.
3. Keep route IDs and contracts independent of host paths.
4. Gate side effects in host permissions, not prompts.
5. Promote the pilot only when fixtures show fewer wrong activations.

## Implementation Guidance

### Installation

No package installation is recommended. Reuse the existing runtime and test runner.

### Configuration

Version the route config and benchmark fixtures. Generate only machine-local indexes. Keep adapter permissions narrower than the union of all routed skills.

### Integration Points

- Project instructions describe the route-first contract.
- Native skill directories expose metadata to each host.
- A pure classifier returns decisions to adapters.
- Host permissions enforce side-effect policy.
- CI validates config, skill coverage, fixtures, and adapter parity.

## Sources & Verification

| Source | Type | Last Verified |
|--------|------|---------------|
| https://agentskills.io/specification | Official specification | 2026-09-02 |
| https://kiro.dev/docs/skills/ | Official Kiro docs | 2026-09-02 |
| https://code.claude.com/docs/en/skills | Official Claude docs | 2026-09-02 |
| https://developers.openai.com/codex/skills | Official Codex docs | 2026-09-02 |
| https://github.com/zhaoxuya520/reverse-skill/tree/71acc8e3115f76bad7a914c36466c1086232288c | Primary implementation source | 2026-09-02 |

## Changelog

| Date | Changes |
|------|---------|
| 2026-09-02 | Initial creation for COL-359 architecture research |
