# Chatbot failure diagnosis — runbook

**Deliverable:** the diagnosis (tally + headline + 3 example rows) for the 10am review/working
session. Not the dashboard. The tally is the argument: "13 of 20 failures are lever 2" is a
finding; "we should invest in catalog quality" is an opinion.

**Set your stop time before opening the spreadsheet. Write it down. Not negotiable.**

## Inputs

- The test-prompt spreadsheet (~20 prompts + chatbot responses). Lives work-side or in the
  shared sheet — **never committed to this repo**.
- `rubric.md` (this folder) — **skim it first (1 minute) and confirm the lever definitions
  match your framing before anyone tags anything.** ← STOP point: owner sign-off.
- `tagging-template.xlsx` (this folder) — **copy it to `tagging-template-filled.xlsx` first
  and work only in the copy** (that name is gitignored; the tracked template must stay
  blank). Or add the two columns directly to a copy of the original sheet if that's faster —
  keep any such copy outside the repo or under a gitignored name.

## Steps

| # | Step | Time | Done when |
|---|---|---|---|
| 1 | Open the sheet, add `Lever` + `Why` columns (or paste rows into your **filled copy** of the template — never the tracked template itself), save | 5 min | Columns exist, file saved |
| 2 | **Gut-call a lever number on all rows. No prose.** | 15 min | Zero blank `Lever` cells |
| 3 | One line of `Why` per row | 20 min | Zero blank `Why` cells |
| 4 | Tally the counts per lever (template computes this automatically) | 2 min | Three numbers written down |
| 5 | Three-sentence headline: the count, the dominant lever, the first move | 10 min | Three sentences exist |
| 6 | Mark one example row per lever to read aloud | 10 min | Three row numbers marked |
| 7 | Fill `meeting-onepager.md` and put it wherever you'll present from | 10 min | Artifact openable at 10am |

**Step 2 is separate from step 3 on purpose.** Tag all rows before writing any prose, or row 1's
explanation gets perfected while the rest sit untouched. Speed first, words second.

## Blind second-opinion protocol (optional but planned)

Runs in parallel with steps 2–3; requires sharing the sheet with Claude **before your tags are
in it** (or a copy without them) so the second pass is genuinely blind.

1. You tag all rows (steps 2–3). Claude independently tags all rows against `rubric.md`,
   without seeing yours.
2. Claude produces the disagreement table (`diff-template.md`) — only rows where the two
   passes differ, with reasoning. Agreements need zero discussion.
3. **You adjudicate each disagreement. Your call is final** and goes into the sheet. ← STOP
   point: owner adjudication.
4. Tally and headline (steps 4–5) are computed from the adjudicated tags.

If the sheet never reaches Claude, run steps 1–7 solo — the runbook is complete without the
second opinion.

## Rules

- The underlying schema is fixed (external supplier) — out of scope. Don't tag rows to it;
  if a failure genuinely traces there, tag the nearest lever and note it in `Why`.
- Do not touch the dashboard tonight. Context, not deliverable.
- Stretch goal (`alation-before-after-template.md`) is gated on steps 1–7 complete AND stop
  time not passed. Reaching for it earlier is the perfectionism stall.

## In the meeting — say it in this order

1. **The finding.** "X of 20 failures trace to lever N."
2. **The precedent.** "We're already running this exact pattern — the catalog as LLM context —
   on the in-flight datasets. This view is the same play." In-flight precedent beats a backlog item.
3. **The next cycle.** "Next pass I want to score these systematically instead of by judgment."
   See `meeting-onepager.md` for the corrected one-sentence version of the method.

**Narrate rough edges out loud.** In a review/working session a spoken caveat reads as
competence; a hidden unfinished artifact reads as failure.
