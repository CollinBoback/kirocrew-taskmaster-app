# Tagging rubric — one card

> **STOP — owner review:** skim this card (1 minute) and confirm the lever definitions match
> your framing *before* anyone tags. Both tagging passes must use the same card or the diff
> is meaningless.

## The three levers

Tag each failing row with the **single cheapest lever that would have fixed it**. One lever
per row. If two would fix it, pick the cheaper one (1 < 2 < 3) and mention the other in `Why`.

### Lever 1 — System prompt
The bot had the right data and the right catalog context but used it badly.
Tag 1 when the fix is steering the bot per interaction.
- Wrong tone, format, or verbosity; ignored an instruction it was given
- Picked the wrong column/table despite an adequate definition existing
- Hallucinated logic or refused when the data could answer
- Failed to ask a clarifying question it obviously needed

### Lever 2 — Catalog quality (definitions the bot ingests)
The bot misread what a column *means*.
Tag 2 when a better column definition, enumeration, or nuance note would have let the LLM
infer the right meaning.
- Misinterpreted a coded/enumerated value (status codes, flags, units)
- Confused two similarly-named columns; missed a caveat a definition should carry
- Treated a technical column name literally because no business definition existed
- The "if a new analyst would need the data dictionary, so does the bot" test

### Lever 3 — The view itself (granularity / span / column set)
The right answer was not derivable from the data served to the bot.
Tag 3 when no prompt or definition could fix it because the view lacks the shape.
- Needed a grain the view doesn't have (daily vs weekly, item vs order)
- Needed history outside the view's time span
- Needed a column/measure the view doesn't expose

**Out of scope:** the underlying supplier schema. If a failure truly bottoms out there, tag
the nearest lever and note it — advocacy is a later conversation.

## Discipline (from `.kiro/skills/continuous-prompt-evaluation`, Stage 1)

- **Evidence from the response text only.** Tag what the response shows, not what you suspect
  about the internals.
- **Ambiguous rows stay ambiguous.** Mark `?` rather than forcing a lever — forced tags
  corrupt the tally. A handful of `?` rows is a finding in itself.
- **Gut-speed first, prose second.** All rows tagged before any `Why` is written.
- **One concrete example per lever** survives into the meeting — pick the row where the
  failure is most legible to a non-technical listener.

## Tally interpretation

- Dominant lever = the finding. Lead with the count, not the recommendation.
- Lever 2 dominant → the precedent argument applies directly (same pattern already in flight
  on other datasets).
- Lever 1 dominant → cheapest cycle: prompt iteration + the systematic scoring pitch.
- Lever 3 dominant → the conversation is with whoever owns the view; bring 2–3 concrete
  missing-shape examples rather than a redesign ask.
