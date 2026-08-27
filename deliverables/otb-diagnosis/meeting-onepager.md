# Chatbot diagnosis — meeting one-pager

*Fill every blank from the adjudicated tags. This is the only artifact that needs to be open
at 10am.*

## The tally

| Lever | Count |
|---|---|
| 1 — System prompt | __ |
| 2 — Catalog quality | __ |
| 3 — View shape | __ |
| ? — Ambiguous | __ |
| **Total rows** | __ |

## The headline (three sentences)

1. **The finding:** "__ of __ failures trace to lever __ (____________)."
2. **The precedent:** "We're already running this exact pattern — the catalog as LLM
   context — on the in-flight datasets. This view is the same play."
3. **The next cycle:** "For the next pass I want to score these systematically rather than
   by judgment — a shared rubric with two binary signals per response (explicit
   dissatisfaction, behavioral quality issue), ambiguous cases scored neutral. Cheap to run
   on 20 prompts; the method is already written up."

> Note on sentence 3: the written method is deliberately **binary + neutral-on-ambiguity**,
> not a 1–5 scorecard. Pitching it that way is stronger — it sounds runnable next week, not
> like an evaluation program.

## Example rows to read aloud (one per lever)

| Lever | Row # | One-line setup before reading it |
|---|---|---|
| 1 | __ | |
| 2 | __ | |
| 3 | __ | |

## Caveats to narrate out loud (don't hide them)

- Tags are judgment calls from one evening pass (double-tagged and adjudicated — say so).
- __ rows were genuinely ambiguous and were left neutral rather than forced.
- The underlying supplier schema was ruled out of scope on purpose; that's a separate,
  later conversation.

## If the stretch landed

One before/after: current catalog definition vs. improved definition for column
`__________`, and the better answer it would have produced on row __. (See
`alation-before-after-template.md`.) The single most persuasive object in the room —
but only if steps 1–7 finished first.
