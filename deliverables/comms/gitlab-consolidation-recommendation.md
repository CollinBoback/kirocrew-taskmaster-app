# GitLab consolidation — comparison worksheet + recommendation to Ryan

**State:** the conversation with Ryan happened. Outcome: your action item is to compare
`Kiro_BI` and `Kiro`, then recommend how to consolidate — merge and repurpose were the
two shapes discussed. This doc is the whole deliverable. Fill it work-side with both
repos open; nothing here requires real data to be committed.

> ⚠️ **Everything so far was decided without the repos open.** The "same thing built in
> parallel" framing, the merge-vs-repurpose binary, and this kit itself are all working
> from memory of the conversation, not from code. The worksheet is the first look at
> evidence — it is allowed to invalidate the premise, not just pick between the two
> pre-agreed options.

**Timebox: 45 minutes total.** 5 to check the premise, 20 for the worksheet, 10 for the
decision, 15 to draft the recommendation message (the premise check overlaps the
worksheet). The deliverable is a *recommendation*, not the migration and not a prototype
merge. If you catch yourself refactoring code, stop — that's the next task, after Ryan
agrees.

## Step 0 — Premise check (5 min, before the worksheet)

Open both repos and answer one question: *do these actually duplicate each other?*
Skim each README and top-level structure, nothing deeper.

- **Mostly yes** → continue to Step 1.
- **Mostly no** (different jobs, thin overlap, or one is a stub) → skip to Step 3 and
  tell Ryan the premise was off. That's a valid, complete outcome of this task — it is
  not a failure to deliver.

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

Read the filled table top to bottom, then pick the option the table supports. No option
is pre-preferred — the conversation with Ryan happened without the repos open, so the
filled worksheet outranks anything either of you assumed in it.

1. **Repurpose `Kiro_BI`** — if each repo has a real unique capability with distinct
   users. Narrow `Kiro_BI` to its unique scope, state that scope in both READMEs, done.
2. **Merge into `Kiro`** — if the overlap is high and `Kiro_BI`'s unique parts port in a
   few hours. Coworker's repo survives; you port your unique pieces; `Kiro_BI` gets
   archived with a pointer.
3. **Merge into `Kiro_BI`** — same test in reverse. Only recommend this if the worksheet
   clearly supports it; "it's mine" is not a reason, and this option costs the most
   goodwill, so the evidence should be visibly one-sided.
4. **Premise was off** — the Step 0 outcome: they don't meaningfully duplicate. Recommend
   a one-line scope statement in each README and no further consolidation work.

Decisive question if you're stuck between 1 and 2: *would a new teammate ever need both
repos for different jobs?* Yes → repurpose. No → merge into `Kiro`. If the table is too
thin to answer that, the honest recommendation is "here's what I found, here's what I
still can't tell — let's look at them together for 15 minutes," not a coin flip.

## Step 3 — Recommendation message to Ryan (15 min, copy and fill)

**STOP — owner review:** adjust names and specifics, then you send it. Claude never sends.

> Ryan — I compared `Kiro_BI` and `Kiro` like we discussed. Recommendation: **[repurpose
> `Kiro_BI` to X / merge into `Kiro` / merge into `Kiro_BI` / they don't actually
> duplicate — details below]**.
>
> The short version: [one sentence from the worksheet — e.g. "they overlap on N% of what
> they do, and the unique parts of mine port over in about H hours", "they actually
> serve different users: A vs B", or "now that I've had both open, they're doing
> different jobs — the overlap we assumed is only X"].
>
> If that sounds right, next step is [the one concrete migration/repurpose action, e.g.
> "I'll port the X module and archive `Kiro_BI` with a pointer" — with a rough date].
> If you or [coworker] see it differently, happy to do 10 minutes on it.

## Record the outcome (2 min, whenever Ryan replies)

- One line at the top of each README stating what survives / what each repo is for
- Archive or scope-narrow per the decision — as its own task, not today

Anything bigger than the message in Step 3 is scope creep on this item.
