# Deliverables workspace

Work-side execution kits and drafted communications for the current deliverable cycle.
Built remotely without any real work data — clone this branch on the work laptop and
continue from here. Progress is tracked in GitHub issues; final review happens on the
pull request assigned to the repo owner.

> ⚠️ This repo is public. Never commit real prompt/response data, spreadsheet contents,
> ticket internals, or internal system details into this directory. Templates and
> process docs only. (`GAMEPLAN*.md` / `GRILL-LOG*.md` are gitignored for the same reason.)

## Contents

| Path | What it is | Status |
|---|---|---|
| `otb-diagnosis/RUNBOOK.md` | Step-by-step run packet for the chatbot failure diagnosis (the 10am meeting deliverable) | Ready to run |
| `otb-diagnosis/rubric.md` | One-card tagging rubric: the three levers + tagging discipline | **Needs 1-min owner review before tagging** |
| `otb-diagnosis/tagging-template.xlsx` | 20-row workbook with Lever dropdown + self-computing tally | Paste real rows in work-side |
| `otb-diagnosis/diff-template.md` | Blind second-opinion disagreement table | Fill after both passes |
| `otb-diagnosis/meeting-onepager.md` | Fill-in-the-blank presentation artifact (tally, headline, examples, talking points) | Fill from adjudicated tags |
| `otb-diagnosis/alation-before-after-template.md` | Stretch goal: one before/after catalog definition | Only after runbook steps 1–7 |
| `alation-audit/README.md` | Kit overview + phase map for the Alation catalog AI-readiness audit (due Dec 31) | Ready to review |
| `alation-audit/curation-standards.md` | AI-Readiness standard: five dimensions, 0–3 scale, pass bar | **Needs owner sign-off before scoring** |
| `alation-audit/auto-curation-strategy.md` | Continuous Curation + Human-in-the-Loop pipeline and guardrails | Ready to review |
| `alation-audit/ai-uat-protocol.md` | Blind AI UAT protocol proving catalog entries suffice for an LLM | Run in Phase 2 |
| `alation-audit/tracker-template.xlsx` | Per-table tracker: dimension dropdowns, self-computing AI-Ready flag + tally | Copy to `-filled` work-side |
| `alation-audit/management-gameplan.md` | Fill-in-the-blank gameplan + recurring status-update block | Fill dates → send |
| `comms/ryan-sedw-message.md` | Drafted commitment message + micro-schedule to the Sept 9 scope/plan date | Review → send |
| `comms/gitlab-consolidation-recommendation.md` | `Kiro_BI` vs `Kiro` comparison worksheet + recommendation message to Ryan | Fill a `-filled` copy work-side (45 min) |
| `comms/gitlab-readme-oneliners.md` | Consolidation conversation opener + fallback README headers | Superseded — headers only if Step 0 confirms overlap |
| `comms/scmods-linear-note.md` | Rationale note for correcting stale ticket target dates | Paste when dates are fixed |

## Workflow

1. **Remote (Claude):** builds/updates these kits, tracks progress in issues, opens a draft PR.
2. **Work-side (owner):** clones the branch, pastes real data locally (not committed), executes the runbook.
3. **Review gate:** the draft PR assigned to the owner is the official final review before merge.
4. Questions flow through issue mentions or Slack; blocking decisions are called out as **STOP** points in each doc.
