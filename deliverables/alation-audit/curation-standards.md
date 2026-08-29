# AI-Readiness curation standard — one card

**What "curated" means for this audit.** A table is not done when a human can figure it out;
it is done when an LLM with no tribal knowledge can answer questions from the catalog entry
alone. Score every in-scope table on the five dimensions below. **← STOP point: owner
sign-off on this card before anything is scored.**

## The five dimensions (score each 0–3)

| # | Dimension | What a 3 looks like |
|---|---|---|
| D1 | Title & table description | States the business meaning, grain (one row = __), refresh cadence, and intended use. Does not just restate the table name. |
| D2 | Column definitions | Every column has business meaning, units, and **enumerated values spelled out** (`status: 1=Open, 2=Closed…`), plus the caveats a new analyst would trip on. |
| D3 | Ownership | Named steward and a working contact path; steward has confirmed the entry within this audit cycle. |
| D4 | Trust signals | Endorsed/deprecated flags set correctly; stale or duplicate objects flagged or removed; no misleading leftovers. |
| D5 | Relationships & keys | Primary/foreign keys identified, join paths to sibling tables documented, lineage or source noted. |

## The scale

- **0 — Missing.** Nothing there.
- **1 — Stub.** Auto-generated or name-restated; adds no information.
- **2 — Human-usable.** A teammate could use it after some poking around.
- **3 — AI-ready.** Self-contained; an LLM needs nothing else to use the object correctly.

## The bar

- **AI-Ready table = every dimension ≥ 2 and D2 = 3.** D2 is the load-bearing dimension:
  misread coded columns are the dominant chatbot failure mode (see
  `../otb-diagnosis/rubric.md`, lever 2).
- Catalog readiness metric for management: **% of in-scope tables that are AI-Ready** and
  **% with a confirmed steward** (D3 ≥ 2). Both must reach 100% of in-scope objects for the
  Phase 4 sign-off; objects deliberately excluded get a one-line reason in the tracker.

## Scoring discipline

- Score fast, dimension by dimension, no prose — same rule as the tagging runbook: speed
  first, words second. One `Notes` line per table only where a score needs defending.
- Deprecation counts as curation. Flagging a dead table (D4) is a completed row, not a skip.
- Scores live in `tracker-filled.xlsx` work-side; only the blank template is committed.
