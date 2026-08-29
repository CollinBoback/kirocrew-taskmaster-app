# Entry-readiness rubric — one card

> **STOP — owner review:** skim this card (2 minutes) and confirm the verdict definitions
> match your bar *before* scoring. Every scoring pass must use the same card or the
> coverage tally is meaningless.

## The test

**If a new analyst would need to ask a person about this object, so does the LLM.**
Score each catalog entry with the single verdict that describes it today, based only on
what the catalog page shows — not what you privately know about the object.

## Verdicts

### `ready` — a stranger could use it correctly
- Business definition states meaning, not just a restated column name
- Coded/enumerated values spelled out; units and grain explicit
- The caveat that bites is written down (timezone, late-arriving rows, soft deletes…)
- Steward assigned; trust flag current; object still exists in the source

### `fix` — exists but would mislead
- Definition missing, circular ("`ORD_STAT` — the order status"), or stale
- Enumerations, units, or grain absent where they matter
- Two similarly-named objects with nothing distinguishing them
- Endorse/Warn/Deprecate flag contradicts reality

### `retire` — should not be in the catalog
- Object no longer exists in the source, or is a dead copy/superseded version
- Nobody has queried it in memory and no steward claims it
- Action is archive/deprecate in Alation, not definition-writing

### `?` — cannot verdict from the catalog page
- Needs the steward or source owner to answer first
- Leave it `?` and note who can resolve it in Gaps — do not guess

## Tie-breakers

- `fix` vs `retire`: if you would have to research whether it's still used, it's `?`, not
  `retire`. Retire only on evidence.
- A `ready` definition with a wrong trust flag is `fix` — flags are ingested context too.
- Perfect is not the bar. A definition that passes the new-analyst test with one rough
  sentence is `ready`; polishing it is post-Dec-31 work.

## Tally interpretation

- % `ready` of tier A is **the** number for the close-out report — it is the LLM-context
  coverage figure.
- A `?` cluster under one steward (or steward-less) is an ownership finding; report it as
  such rather than grinding through it alone.
- `retire` count is a win, not a failure — every archived ghost object is context the LLM
  can no longer be misled by.
