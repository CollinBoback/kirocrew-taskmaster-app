# SEDW scope assessment — runbook

**Deliverable:** the assessment for Ryan and the SMEDW team — technical complexity and
dependencies, a recommended migration approach, an estimate, and one concrete next action.
Due per the commitment in `../comms/ryan-sedw-message.md`: **plan doc ready Sep 8 (Tue),
delivered Sep 9 (Wed).**

**This is scope + plan, not the migration.** Don't let the work quietly expand into actually
migrating anything — that's a different, later deliverable.

## Inputs (work-side only — never committed)

- The SEDW/report inventory: every object, job, or feed that's actually in scope. If this
  doesn't exist yet, step 1 below builds it.
- Whatever Ryan handed off in the technical scoping conversation. Per the issue, no further
  clarification from him is required — treat his handoff as complete and work from it plus
  what you can verify yourself.
- `SCOPE-TEMPLATE.md` (this folder) — copy to a **filled** copy (`SCOPE-TEMPLATE-filled.md`,
  gitignored) before writing anything real into it.
- `pipeline-inventory-template.md` (this folder) — copy to a **filled** copy
  (`pipeline-inventory-filled.md`, gitignored) before pasting real object/job names.

## Steps

Dates are the fixed calendar days from `ryan-sedw-message.md`; weekday labels are dropped
here to avoid a second, driftable copy of them (verify the actual weekday against the 2026
calendar if you need one).

| # | Step | Milestone (from ryan-sedw-message.md) | Done when |
|---|---|---|---|
| 1 | List every object/job/feed in scope, one line each, in your filled copy of the inventory | Aug 29 | Every known pipeline has a row |
| 2 | For each item: tag complexity (Low/Med/High) and list its hard dependencies | — | No blank complexity/dependency cells |
| 3 | Roll the per-item detail up into your filled `SCOPE-TEMPLATE-filled.md` §1–2 (complexity narrative + dependency graph in prose) | Sep 3 (draft scope) | §1–2 read as a coherent narrative, not a table dump |
| 4 | Fill each row's `In/Out/Deferred` column in your filled inventory copy; list open questions that block a full estimate in `SCOPE-TEMPLATE-filled.md`'s open-questions field | Sep 3 | Every inventory row has a disposition; open questions are written down, not just in your head |
| 5 | Pick **one** migration approach from §3's options (or write a new one), say why, and fill the phase table (sequenced phases, owner, risk per phase) | Sep 8 (plan doc) | A single recommended approach is named, not a menu, with a filled phase table |
| 6 | Turn the in-scope item count + complexity mix into a size estimate (range, not false precision) | Sep 8 | §4 has a number or range, with the assumption that breaks it |
| 7 | Write the next action: the one thing that happens first, who does it, by when | Sep 8 | §5 names an owner and a date, not "TBD" |
| 8 | Copy the finished §1–5 into your filled copy of `../comms/sedw-assessment-share-message.md`, review, send | **Sep 9 (Wed)** | Message sent to Ryan + SMEDW team |

**Step 5 is the one that's easy to dodge.** A menu of options with no pick isn't a
recommendation — it hands the decision back to Ryan, which is the opposite of what "Ryan
handed off the technical scoping work" means for this deliverable.

## Rules

- One recommended approach, not a comparison table with no conclusion — trade-offs go in a
  one-line "why not the alternatives" note, not a full menu.
- The estimate is a range with its breaking assumption stated, not a single confident number.
- Real object/job names, ticket internals, dependency detail, estimates, and any pasted
  inventory data stay in `*-filled.md` / `deliverables/**/local/` (gitignored) — never in
  `SCOPE-TEMPLATE.md`, `pipeline-inventory-template.md`, or `sedw-assessment-share-message.md`
  themselves. Work only in the `-filled` copies; check `git status` before any commit here.
- If day 1 (pipeline inventory) turns up scope Ryan didn't mention, that's a finding for
  §1, not a reason to go back and ask him — the issue says his handoff is complete.
