# Alation catalog audit — runbook

**Deliverable:** the supply-chain Alation catalog audited and curated **before Dec 31** so
that every object an analyst or an LLM pipeline touches has an accurate, current definition.
Tracker: Linear COL-64. This kit is generic and public-safe — all object names, counts, and
catalog contents stay work-side, never in this repo.

**Why now:** the chatbot failure diagnosis (`../otb-diagnosis/`) established that catalog
quality is the lever — misread column meanings, not model behavior. This audit is the
systematic pass promised in that meeting: score every entry instead of judging by feel.

## Inputs

- Catalog inventory export (Alation Stewardship dashboard, a catalog set, or the API) —
  lives work-side, **never committed**.
- `rubric.md` (this folder) — **skim it (2 minutes) and confirm the verdict definitions
  before scoring anything.** ← STOP point: owner sign-off.
- `audit-tracker-template.xlsx` (this folder) — **copy to `audit-tracker-filled.xlsx` and
  work only in the copy** (that name is gitignored; the tracked template stays blank).

## Phases

Work in tiers so the deadline can never wipe out the high-value work: tier A done is a
defensible Dec 31 outcome even if tier C slips.

| # | Phase | Done when | Target |
|---|---|---|---|
| 1 | **Inventory.** Export every cataloged object (schemas, tables, columns, BI objects, glossary terms) into the tracker. Include last-updated date and steward. | Every object is one tracker row | Sept 19 |
| 2 | **Tier.** A = objects feeding LLM/chatbot context or the in-flight datasets; B = high-traffic (Alation popularity / top users); C = the rest. | Zero blank Tier cells | Sept 26 |
| 3 | **Score tier A, then B.** Gut-speed verdict per row against `rubric.md`; one-line gap note after all verdicts are in. | Zero blank Verdict cells in A+B | Oct 17 |
| 4 | **Curate.** Fix in verdict order: rewrite `fix` definitions (enumerations, units, caveats), set trust flags (Endorse / Warn / Deprecate), assign missing stewards, archive `retire` objects. | Tier A all `ready` or `retire`; tier B ≥ target % | Nov 28 |
| 5 | **Verify + report.** Re-score changed rows, capture before/after coverage from the tracker tally, write the close-out note on COL-64. | Coverage numbers written; issue updated | Dec 12 |

Buffer weeks (Dec 15–31) absorb slippage and holiday time off. Tier C is a stretch goal —
score it only after phase 5 is safe.

**Phase 3 discipline (from the tagging runbook):** verdict all rows before writing any gap
prose, or row 1 gets perfected while the rest sit untouched. Speed first, words second.

## Rules

- **One verdict per row.** Ambiguous stays `?` — forced verdicts corrupt the coverage tally,
  and a cluster of `?` rows is itself a finding (usually a missing steward).
- **Curate in Alation, not in side documents.** The catalog is the artifact the LLM ingests;
  a fixed definition that lives in a spreadsheet fixes nothing.
- **Deprecate loudly.** A stale object with an Endorse flag is worse for an LLM than no
  object at all — flags are part of the context it trusts.
- The underlying source schemas are out of scope (external suppliers own them). If an entry
  is wrong because the source is wrong, note it in Gaps and tag the nearest fixable verdict.
- Definition style: write for the new analyst — business meaning, enumerated values spelled
  out, units and grain, the one caveat that bites. Same bar as
  `../otb-diagnosis/alation-before-after-template.md`.

## Reporting cadence

After each phase, drop one comment on COL-64: phase done, tally screenshot-free numbers
(counts only, no object names), next phase target date. Five comments total; the phase-5
comment is the close-out with before/after coverage.
