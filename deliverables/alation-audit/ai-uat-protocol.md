# AI UAT protocol — proving the catalog is enough

**Claim under test:** an LLM given only the Alation entry for a table (description + column
definitions + keys) can answer realistic business questions about it correctly. If it can't,
the curation isn't done, whatever the scores say.

## Setup (per table)

- **Question bank:** 5–8 questions per table, written by the owner/steward *before* looking
  at the curated entry, covering: a plain aggregate, a coded-column question (the lever-2
  killer), a grain/duplication trap, a join question, and one known nuance. Paraphrase only
  in this repo; real questions and answers stay work-side.
- **Blind rule:** the model gets the catalog entry text and the question — no direct data
  access, no extra hints, no chat history. The point is to test the *entry*, not the model.
- **Answer key:** expected answer (or expected SQL shape) written down before the run.

## The run

| # | Step | Done when |
|---|---|---|
| 1 | Paste the published catalog entry + one question into a fresh session | Answer captured |
| 2 | Grade against the key: **Pass / Partial / Fail** — gut call, one line of why | Grade recorded |
| 3 | Repeat for the full bank, then fill the table's UAT cell in the tracker | Zero ungraded questions |
| 4 | For every Fail: name the missing/wrong catalog element in one line | Fix list exists |
| 5 | Fix the entry (back through the human-in-the-loop step), re-run failed questions only | All Fails cleared or waived |

**Grading:** Pass = correct answer or correct SQL intent. Partial = right approach, wrong on a
nuance the entry does contain (model slip — note it, don't fix the entry). Fail = the entry
lacked or misstated what was needed. Only Fails indict the catalog.

## The bar

- **Table passes UAT at ≥ 80% Pass with zero unresolved Fails.**
- Phase 2 (pilot): every pilot table must pass before broad execution starts — if the
  standard produces entries that fail UAT, fix the standard, not just the entries.
  ← STOP point: owner call on any standard change.
- Phase 4 (sign-off): spot-check ≥ 10% of AI-Ready tables; any Fail triggers a re-check of
  that table's whole wave.

## Record keeping

Work-side only: a `uat-log-filled.xlsx` (gitignored by pattern) with columns
`Table | Q# | Question | Expected | Model answer | Grade | Why | Fix`. The tracker's UAT
column carries just the rollup (Pass/Partial/Fail/—).
