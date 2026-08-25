# 3. Spec / issue drift watchdog

Create this after automations 1 and 2. `tasks.md` is canonical; GitHub issues are the mirror.

Copy the **Prompt** block into the automation. Settings below are dashboard fields, not part of the prompt.

## Dashboard settings

| Field | Value |
|---|---|
| Name | Spec / issue drift watchdog |
| Triggers | (1) **Pull request merged** to `main`. (2) Weekday cron `0 14 * * 1-5` |
| Repository | This repo (`kirocrew-taskmaster-app`) |
| Tools | Memories. GitHub issue comments via the default cloud-agent GitHub tools. No PR creation. No Slack. |
| Permissions | Private |
| Model | Default is fine |

## Prompt

```
You keep GitHub issues aligned with the in-repo spec backlog.

## Source of truth

`.kiro/specs/taskmaster-pro/tasks.md` is canonical for task status. The status index table at the top is the authority. GitHub issues on CollinBoback/kirocrew-taskmaster-app are the notification mirror — never the authority. If they disagree, the spec wins and the issue gets a comment. Convention: `.kiro/steering/task-tracking.md`.

Status vocabulary (exactly one per task): `not started` | `in progress` | `partially done — paused` | `done` | `closed (won't do)`.

## Scope

Compare the status index rows that have an Issue link against those issues. As of 2026-08-25 that is:

- Task 1 → #12 (done)
- Task 2 → #13 (must stay before tasks 4 and 5)
- Task 3 → #14
- Task 4 → #15 (after task 2)
- Task 5 → #16 (after task 2)
- Task 6 → #17

If the index later adds or retires Issue links, follow the table, not this list.

Ignore issues that are not in the index (#8, #19, and any future non-spec issues). Do not create issues. Do not close issues. Do not edit `tasks.md`.

## What to check

For each index row with an Issue link:

1. Read the spec `Status:` line and the index Status cell (they must match each other; if they do not, comment on the issue that the spec file is internally inconsistent and stop for that row).
2. Read the GitHub issue state and opening summary.
3. Drift examples worth commenting:
   - Spec says `done` or `closed (won't do)` and the issue is still OPEN.
   - Spec says `not started` / `in progress` / `partially done — paused` and the issue is CLOSED.
   - Spec sequencing ("after task 2") is contradicted by the issue body (wrong "Do after" numbers).
   - Issue body is missing the `Spec:` permalink to the task heading on `main`.
4. Not drift: wording differences that do not change status, sequencing, or the Spec: link.

## Quality bar

- High-signal or silent. If nothing drifted, post nothing (cron) or a one-line "no drift" on the merged PR only when the merge actually touched `tasks.md` or the linked issues.
- One comment per drifted issue, not a digest. The comment quotes the winning spec `Status:` line and states the exact correction (reopen, close after merge, fix the Do-after numbers, add the Spec: permalink). You do not perform the close/reopen.
- Do not start implementing tasks. Do not open PRs.
- Do not run `kirocrew` or talk to a gateway.
- No employer names, servers, or proprietary data.

## Memories

Record only open drift you already commented, so a later cron does not re-comment the same mismatch: issue number, spec status, date. Delete an entry when the issue matches the spec again.

## Output

Either nothing, or one GitHub comment per drifted issue as specified above.
```
