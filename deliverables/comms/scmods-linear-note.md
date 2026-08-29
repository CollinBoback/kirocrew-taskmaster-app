# SCMODS Alation Audit — project-level date correction

**Context (supersedes the earlier ticket-level version of this note):** the five audit
tickets (COL-64, COL-74, COL-75, COL-76, COL-77) were already corrected and show
Medium / `2026-12-31`. The remaining false-urgency source is the **project** itself:

| Field | Stale value | Corrected value |
|---|---|---|
| Target date | `2026-08-07` (past due) | `2026-12-31` |
| Priority | Urgent | Medium |
| Description | Embeds "Urgent and due July 17, 2026" | Correction note appended below |

**Confirmed on COL-322:** full path — new target `2026-12-31`, priority Urgent → Medium,
and the note appended to the existing description (preserved, not replaced).

## Note to append to the project description

> **Correction — previous dates superseded.** Both dates previously attached to this
> project were stale: the "due July 17, 2026" commitment in the description above and the
> `2026-08-07` target date were set against an earlier plan and had been generating false
> urgency since they passed. The real deadline is **2026-12-31**, and the project target
> now matches its tickets (COL-64/74/75/76/77, all Medium / 2026-12-31). Project priority
> lowered Urgent → Medium for the same reason. No change to scope — this workstream is
> active, not blocked.

## After the fix

- Verify the project **and** all five tickets show Medium / `2026-12-31`.
- Close COL-322 with the verification timestamp.
- No other edits — no re-scoping, no new tickets. Done means done.
