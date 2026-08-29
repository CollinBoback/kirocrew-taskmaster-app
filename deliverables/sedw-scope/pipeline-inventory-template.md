# SEDW pipeline inventory

Copy this file to `pipeline-inventory-filled.md` (gitignored) before pasting real
object/job/feed names — the tracked template must stay blank.

One row per object, job, or feed that could plausibly be in scope. Don't pre-filter while
listing — name and a one-line description per row first, then move to tagging. The
`In/Out/Deferred` disposition for each row is decided and recorded **here, per row**, once
tagging starts; `SCOPE-TEMPLATE.md` §1 only summarizes the resulting counts and rationale,
it isn't where the per-item call gets made.

| # | Object/job/feed | One-line description | Complexity (L/M/H) | Hard dependencies | In/Out/Deferred |
|---|---|---|---|---|---|
| 1 | | | | | |

## Tagging notes

- **Complexity** is about this item alone: custom logic, undocumented transforms, or an
  external-supplier schema pushes it to High. A straight copy/rename is Low.
- **Hard dependencies** are other items in this table, other teams' pipelines, or upstream
  feeds this item can't run without.
- **In/Out/Deferred**: Out = not migrating this (say why in the description column).
  Deferred = migrating, but not in this phase.
