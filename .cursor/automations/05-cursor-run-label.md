# 5. Label-to-implement (`cursor-run`)

Create this last. You stay the start button: the agent implements only when you add the `cursor-run` label. It does not roam the backlog.

Create the `cursor-run` label on `CollinBoback/kirocrew-taskmaster-app` before enabling the automation (color/description: "Collin queued this spec task for a cloud agent").

Copy the **Prompt** block into the automation. Settings below are dashboard fields, not part of the prompt.

## Dashboard settings

| Field | Value |
|---|---|
| Name | Implement on cursor-run label |
| Trigger | GitHub **Issue label changed** when label `cursor-run` is **added** (not removed) on `CollinBoback/kirocrew-taskmaster-app` |
| Repository | This repo (`kirocrew-taskmaster-app`) |
| Tools | Pull request creation. Memories. No Slack. |
| Permissions | Private |
| Model | Default is fine |

## Prompt

```
You implement one spec-backlog task when Collin adds the `cursor-run` label to its GitHub issue.

## When to stop immediately

- The label event is a removal, not an add → stop. Post nothing.
- The issue is not one of the spec-index issues (see `.kiro/specs/taskmaster-pro/tasks.md` status index). Comment that `cursor-run` is only for spec tasks #13–#17 (or whatever Issue links the index currently has) and stop.
- The issue already has an open implementation PR that is not marked review-only. Comment the existing PR URL and stop.
- Read MEMORIES.md first. If you already opened a PR for this issue and it is still open, comment that URL and stop.

## Sequencing (do not skip)

Read `.kiro/specs/taskmaster-pro/tasks.md` and `.kiro/steering/task-tracking.md`.

Current constraints:

- Task 2 (#13) must be done (merged to main) before Task 4 (#15) or Task 5 (#16).
- If the labeled issue is #15 or #16 and Task 2 is still `not started`, `in progress`, or `partially done — paused`, comment that it is blocked on #13 and stop. Do not implement.
- Task 3 (#14) and Task 6 (#17) are not blocked on Task 2.
- Do not start a downstream task while its upstream is `not started` or `partially done — paused` unless the spec Progress log records why.

## Implement

1. Read the matching Task N section in `tasks.md` (acceptance criteria, watch-fors, size). That section is the spec, not the issue body.
2. Implement only that task. No drive-by refactors, no extra backlog items.
3. Follow repo contracts:
   - If you edit `ui/src/`, run `cd ui && npm run build` and commit `ui/dist/index.mjs` in the same change.
   - Run `cd ui && npm test` and `npm run typecheck` when you touch UI source or tests.
   - Never run `kirocrew`, install the app, or talk to a gateway.
   - No employer names, servers, or proprietary data. Sample data stays the fictional Tableau→SQL migration task.
4. Open a **draft** PR. Title it after the spec task (e.g. `Task 6 — Make step selection keyboard-accessible`). Body: spec permalink, what changed, how you validated, remaining risk.
5. If the work is incomplete, follow the partial-progress protocol: set the spec status to `partially done — paused`, add a Progress log with **Pick up here:** naming a file/function/test, and put the same text on the issue. Commit that `tasks.md` update in the same PR.

## After the PR is open

Comment on the issue, one block:

- Draft PR URL
- One-line **Pick up here:** so the next session starts in under a minute
- Remove nothing. Do not close the issue. Do not remove the `cursor-run` label (Collin does that after merge).

Record in MEMORIES.md: issue number, draft PR URL, status `open`, date. Delete the entry when the PR merges or is closed without merging (mark rejected if closed).

## Quality bar

- High-signal or silent. One draft PR plus one issue comment, or one "blocked / already exists" comment, or nothing.
- You do not roam. No second issue. No "while I was here" commits.
- Do not approve your own PR. Leave it draft.

## Output

Either a draft PR + issue comment, or a single issue comment explaining the stop reason.
```
