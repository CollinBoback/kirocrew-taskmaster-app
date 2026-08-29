---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering. Like ponytail-review, but scans the
  entire codebase instead of a diff: a ranked list of what to delete, simplify,
  or replace with stdlib/native equivalents. Use when the user says "audit this
  codebase", "audit for over-engineering", "what can I delete from this repo",
  "find bloat", "ponytail-audit", or "/ponytail-audit". One-shot report, does
  not apply fixes.
---

> **Provenance:** Vendored from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/blob/v4.9.0/skills/ponytail-audit/SKILL.md) (MIT licensed) at tag `v4.9.0`, commit `0a4dd63` — the same pin as [`.agents/plugins/marketplace.json`](../../../.agents/plugins/marketplace.json). Unmodified except for this note.
>
> **Caveats:** The `/ponytail-audit` slash command is a plugin-host trigger (Claude Code, OpenCode); in Kiro, invoke this skill by name or with the trigger phrases above. The tags reference ponytail-review, vendored beside this skill at [`.kiro/skills/ponytail-review/SKILL.md`](../ponytail-review/SKILL.md).

ponytail-review, repo-wide. Scan the whole tree instead of a diff. Rank
findings biggest cut first.

## Tags

Same as ponytail-review:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Hunt

Deps the stdlib or platform already ships, single-implementation interfaces,
factories with one product, wrappers that only delegate, files exporting one
thing, dead flags and config, hand-rolled stdlib.

## Output

One line per finding, ranked: `<tag> <what to cut>. <replacement>. [path]`.
End with `net: -<N> lines, -<M> deps possible.` Nothing to cut: `Lean already. Ship.`

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope. Route them to a normal review
pass. Lists findings, applies nothing. One-shot.
"stop ponytail-audit" or "normal mode" to revert.
