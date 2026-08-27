# GitLab consolidation — comparison worksheet + recommendation to Ryan

**State:** the conversation with Ryan happened. Outcome: your action item is to compare
`Kiro_BI` and `Kiro`, then recommend either a merge or a slight repurpose of `Kiro_BI`.
This doc is the whole deliverable. Fill it work-side with both repos open; nothing here
requires real data to be committed.

**Timebox: 45 minutes total.** 20 for the worksheet, 10 for the decision, 15 to draft the
recommendation message. The deliverable is a *recommendation*, not the migration and not
a prototype merge. If you catch yourself refactoring code, stop — that's the next task,
after Ryan agrees.

## Step 1 — Comparison worksheet (20 min, both repos side by side)

One line per cell. "Don't know" is a valid answer — mark it `?` and move on.

| Question | `Kiro_BI` (yours) | `Kiro` (coworker's) |
|---|---|---|
| One-sentence purpose as built | | |
| Who uses it today (people/jobs) | | |
| Unique capability the other repo lacks | | |
| Roughly how much code overlaps the other repo (%) | | |
| Effort to port its unique parts into the other repo (hours) | | |
| Anything pointing at it (schedules, dashboards, links) | | |

Stop when the table is full. Do not audit code quality, style, or test coverage — that
only matters for the surviving repo, and can be fixed after the decision.

## Step 2 — Pick the recommendation (10 min)

Read the filled table top to bottom, then pick the first option that fits:

1. **Repurpose `Kiro_BI`** — if each repo has a real unique capability with distinct
   users. Narrow `Kiro_BI` to its unique scope, state that scope in both READMEs, done.
   This is the cheapest outcome and Ryan already floated it; prefer it on a tie.
2. **Merge into `Kiro`** — if the overlap is high and `Kiro_BI`'s unique parts port in a
   few hours. Coworker's repo survives; you port your unique pieces; `Kiro_BI` gets
   archived with a pointer.
3. **Merge into `Kiro_BI`** — same test in reverse. Only recommend this if the worksheet
   clearly supports it; "it's mine" is not a reason, and this option costs the most
   goodwill, so the evidence should be visibly one-sided.

Decisive question if you're stuck between 1 and 2: *would a new teammate ever need both
repos for different jobs?* Yes → repurpose. No → merge into `Kiro`.

## Step 3 — Recommendation message to Ryan (15 min, copy and fill)

**STOP — owner review:** adjust names and specifics, then you send it. Claude never sends.

> Ryan — I compared `Kiro_BI` and `Kiro` like we discussed. Recommendation: **[repurpose
> `Kiro_BI` to X / merge into `Kiro` / merge into `Kiro_BI`]**.
>
> The short version: [one sentence from the worksheet — e.g. "they overlap on N% of what
> they do, and the unique parts of mine port over in about H hours" or "they actually
> serve different users: A vs B"].
>
> If that sounds right, next step is [the one concrete migration/repurpose action, e.g.
> "I'll port the X module and archive `Kiro_BI` with a pointer" — with a rough date].
> If you or [coworker] see it differently, happy to do 10 minutes on it.

## Record the outcome (2 min, whenever Ryan replies)

- One line at the top of each README stating what survives / what each repo is for
- Archive or scope-narrow per the decision — as its own task, not today

Anything bigger than the message in Step 3 is scope creep on this item.
