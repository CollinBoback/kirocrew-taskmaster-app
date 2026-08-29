---
name: ponytail-gain
description: >
  Show ponytail's measured impact as a compact scoreboard: less code, less
  cost, more speed, from the benchmark medians. One-shot display, not a
  persistent mode, and not a per-repo number. Trigger: /ponytail-gain,
  "ponytail gain", "what does ponytail save", "show ponytail impact",
  "ponytail scoreboard".
---

> **Provenance:** Vendored from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/blob/v4.9.0/skills/ponytail-gain/SKILL.md) (MIT licensed) at tag `v4.9.0`, commit `0a4dd63` — the same pin as [`.agents/plugins/marketplace.json`](../../../.agents/plugins/marketplace.json). Unmodified except for this note.
>
> **Caveats:** The `/ponytail-gain` slash command is a plugin-host trigger; in Kiro, invoke this skill by name or with the trigger phrases above. The `benchmarks/` and README sources cited below live in the upstream repo, not this one. The 80–94% LOC figure is the upstream single-shot benchmark; the upstream README's corrected agentic benchmark reports a −54% mean (per-task ceiling 94%), so treat the scoreboard as the upstream marketing card, and the honesty boundary below as the binding part.

# Ponytail Gain

Display this scoreboard when invoked. One-shot: do NOT change mode, write flag
files, or persist anything.

The figures are the published benchmark medians (5 everyday tasks: email
validator, debounce, CSV sum, countdown timer, rate limiter; three models:
Haiku, Sonnet, Opus). They are measured, not computed from the current repo.
Source: `benchmarks/` and the README.

## Scoreboard

Render plain ASCII bars. The bar length shows the measured range; the label
carries the exact figure:

```
  ponytail gain                     benchmark median · 5 tasks · 3 models

  Lines of code   no-skill  ████████████████████  100%
                  ponytail  ██▌·················    6–20%   ▼ 80–94%
  Cost            no-skill  ████████████████████  100%
                  ponytail  █████▌··············   23–53%  ▼ 47–77%
  Speed           ponytail  ▸ 3–6× faster

  This repo:  /ponytail-debt  (shortcuts you deferred)
              /ponytail-audit (what's still cuttable)
```

## Honesty boundary

These are benchmark medians, not this repo. NEVER print a per-repo savings
number ("you saved X lines/tokens here"): the unbuilt version was never
written, so there is no real baseline to subtract from in a live repo. The
only real per-repo figures come from `/ponytail-debt` (a counted ledger), and
this card points there instead of inventing one.

## Boundaries

One-shot display. Edits nothing, changes no mode.
"stop ponytail" or "normal mode": revert.
