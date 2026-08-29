# Alation catalog audit — AI-readiness kit

Execution kit for auditing and curating the SCFE Alation data catalog so that customers and
AI/LLM systems can rely on it for context. Deadline for full readiness sign-off: **Dec 31**.

> ⚠️ This repo is public. Never commit real table names, column definitions, query logs,
> steward names/emails, server details, or exported catalog data into this directory.
> Templates and process docs only. Filled copies stay work-side (`*-filled.*` and all
> non-template spreadsheets under `deliverables/` are gitignored).

## Contents

| Path | What it is | Status |
|---|---|---|
| `curation-standards.md` | The AI-Readiness standard: five scoring dimensions, 0–3 scale, and the pass bar | **Needs 5-min owner review before any scoring** |
| `auto-curation-strategy.md` | Continuous Curation + Human-in-the-Loop: how AI drafts, humans approve, and drift gets caught | Ready to review |
| `ai-uat-protocol.md` | Blind AI UAT: prove the catalog context is sufficient for an LLM, per table | Ready to run in Phase 2 |
| `tracker-template.xlsx` | Per-table progress tracker with dimension dropdowns, self-computing AI-Ready flag and tally | Copy to `-filled` work-side, paste inventory |
| `management-gameplan.md` | Fill-in-the-blank gameplan + status-update skeleton for management | Fill dates → send |

## Phase map (Linear)

| Phase | Ticket | What it means here |
|---|---|---|
| 1 — Foundation, gameplan & tracker | COL-74 | This kit. Done when the owner signs off on `curation-standards.md` and the gameplan is sent. |
| 2 — Pilot curation & AI validation | COL-75 | Pick 3–5 critical tables, curate to the standard, run `ai-uat-protocol.md` on them. |
| 3 — Broad curation execution | COL-76 | Work the tracker in priority order, wave by wave, using the auto-curation loop. |
| 4 — Final audit & sign-off | COL-77 | Re-score everything, 100% coverage of in-scope objects, publish the readiness report. |
| Status updates | COL-341 | Send the update block in `management-gameplan.md` on the agreed cadence. |

## Workflow

1. **Remote (Claude):** builds/updates these docs and templates; no catalog access, no real data.
2. **Work-side (owner):** copies `tracker-template.xlsx` → `tracker-filled.xlsx`, exports the
   catalog inventory into it, executes phases 2–4 inside Alation.
3. **STOP points:** owner sign-off on the standard (before scoring), on the pilot table list
   (before Phase 2), and on every AI-drafted description (before it is published — see
   `auto-curation-strategy.md`).
4. Blocking questions flow through the Linear issue; done means the Phase 4 readiness report
   is published and COL-64 is closed.
