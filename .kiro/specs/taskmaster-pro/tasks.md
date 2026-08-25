# Taskmaster Pro — what to work on next

Prioritized backlog as of 2026-08-25, v0.2.0. Every item below was derived from reading
the shipped source, not from the roadmap. Baseline health at the time of writing:
`typecheck` clean, 35/35 tests pass, `ui/dist/index.mjs` in sync with a fresh build.

Ordering rationale: protect the deployment contract first, because a break there is
silent; then make the riskiest code testable; then close the functional gaps that make the
app frustrating in daily use.

## Status index

This table is canonical for task status; the linked GitHub issues mirror it. The
tracking convention (status vocabulary, partial-progress protocol, two-way linking)
lives in `.kiro/steering/task-tracking.md`. Update this table in the same commit as any
`Status:` line change below.

| Task | Status | Issue | Sequencing |
|---|---|---|---|
| 0 — Bring the spec into the repository | closed (won't do) — copy not needed; in-repo spec made authoritative instead | — | — |
| 1 — CI that guards the committed build artifact | done — merged 2026-08-25 ([#10](https://github.com/CollinBoback/kirocrew-taskmaster-app/pull/10)) | [#12](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/12) | First priority |
| 2 — Extract the slot engine and test it | not started | [#13](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/13) | Before tasks 4 and 5 |
| 3 — Steps: edit, delete, reorder | not started | [#14](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/14) | Second priority |
| 4 — Cancel an in-flight agent run | not started | [#15](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/15) | After task 2 |
| 5 — Per-task `pending` | not started | [#16](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/16) | After task 2 |
| 6 — Keyboard access to the step queue | not started | [#17](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/17) | Independent |

---

## Task 0 — Bring the spec into the repository (closed 2026-08-25)

Status: closed (won't do)

**Resolution:** Closed without the copy, per Collin. The in-repo spec in this directory
(`requirements.md` + `design.md`) has since been polished and improved and is now the
authoritative spec for Taskmaster Pro. The original narrative file,
`memory/specs/2026-08-24-taskmaster-pro-kirocrew-app.md` (external workspace, includes the
v0.2 revision), remains on Collin's machine as a historical artifact; nothing in this
repository depends on it any longer. The `README.md` spec pointer and the authority note in
`requirements.md` were updated as part of this closure.

**If the external file ever resurfaces material not captured here** (rationale, cut scope,
deferred ideas), fold it into `requirements.md`/`design.md` rather than committing it as a
parallel document — one source of truth, in-repo.

---

## Task 1 — CI that guards the committed build artifact

Status: done — merged 2026-08-25 via PR #10 (commit `4b67391`)
Issue: https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/12

**Why this is first.** There is no `.github/` directory at all. Nothing runs `typecheck`,
nothing runs the tests, and — the part that actually bites — nothing verifies that the
committed `ui/dist/index.mjs` matches its source.

That artifact is a deployment contract. `README.md` promises "`ui/dist/index.mjs` is
**committed**, so no Node/npm is required on the work machine." So the failure mode is:
someone edits `ui/src/App.tsx`, forgets `npm run build`, and the install on the work
machine silently keeps running the previous UI. No error, no warning, no symptom — just an
app that ignores the change. That is the worst kind of bug to leave undefended, and the
defence is about fifteen lines of YAML.

**Do:** Add `.github/workflows/ci.yml` running on push and pull request. Each step must
specify its working directory explicitly:

```yaml
- name: Install
  run: npm ci
  working-directory: ui
- name: Typecheck
  run: npm run typecheck
  working-directory: ui
- name: Test
  run: npm test
  working-directory: ui
- name: Build
  run: npm run build
  working-directory: ui
- name: Verify artifact in sync
  run: git diff --exit-code ui/dist/index.mjs
  working-directory: ${{ github.workspace }}  # must run from repo root for the path to resolve
```

The final step runs from the repository root (via `working-directory: ${{ github.workspace }}`) so `ui/dist/index.mjs` resolves correctly.

**Acceptance:** The workflow passes on `main` as-is (all four steps verified green and the
artifact verified in sync on 2026-08-25), and fails if `App.tsx` is edited without a
rebuild. Add a one-line note to `README.md` telling contributors CI enforces the rebuild.

**Size:** Small. New file, no source changes.

---

## Task 2 — Extract the slot engine into the pure model and test it

Status: not started
Issue: https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/13
(Note: that issue body's Sequencing line mispredicts the downstream numbers — the
correct ones are #15 for task 4 and #16 for task 5, as in the status index here.)

**Why:** The 35 existing tests all cover `ui/src/model.ts`. Meanwhile the most intricate
logic in the app is untested, because it lives inside `App.tsx` as closures over refs:

- the `seenRef` watermark, baselined before the first send so old transcript history is
  never re-parsed
- the `running` trim that hides the still-streaming last message
- per-kind settlement — `step` settles on its first marker, `draft` on its first parseable
  block, `all` deliberately never settles early
- the 15-minute timeout
- the "turn ended, reply had no marker" fallback that writes the raw reply into the step
  output and leaves the step for the manual toggle

Those are behavioural invariants of R4 and R5, the two rules the whole design rests on. A
regression in the watermark would silently re-tick steps from stale history; a regression in
the `all` settlement would abandon a run halfway. Neither would be caught today.

There is also a latent staleness bug in this area worth fixing while you are in it:
`processAgentMessages` is a `useCallback` over `[addLog, setStepState, setStepOutput]`, but
it calls `appendDraftSteps`, a plain function redefined every render and absent from the
dependency array. It works today only because `appendDraftSteps` closes over the stable
`mutate` and reads `configRef.current` rather than captured state. That is luck, not design,
and it is the kind of thing extraction eliminates by construction.

**Do:** Move the decision logic into `model.ts` as a pure function — given the pending work,
the slot payload, and the current watermark, return the actions to apply, the next
watermark, and whether the request settled. Leave `App.tsx` responsible only for issuing
the resulting effects. Then unit test the invariants above.

**Acceptance:** No intended behaviour change. New tests cover watermark baselining,
mid-stream trimming, all three settlement kinds, timeout, and the no-marker fallback.

**Size:** Medium, and the highest-value refactor available. Contained to two files.

---

## Task 3 — Let steps be edited, deleted, and reordered

Status: not started
Issue: https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/14

**Why:** Today you can add a step, add a task, and delete a task — but you cannot touch an
individual micro-step once it exists. There is no `deleteStep`, no `editStep`, no reorder.
A typo is permanent. More importantly this undermines the flagship feature: `✦ Draft Steps
with AI` appends whatever the agent returns, deduplicating only by lowercased title, and
you cannot prune the result. Users learn quickly not to trust a button whose output they
cannot correct, which quietly kills the feature.

Reordering matters for the same reason the breakdown rules demand it: "order steps so each
one unblocks the next." The agent gets that ordering approximately right, and there is
currently no way to finish the job.

**Do:** Add per-step delete (with the same confirm-on-second-click pattern already used for
task delete), inline title and command editing, and move up/down. Keep it in the Focus
queue rows where the steps already render.

**Watch for:** `activeIdx` is clamped against `subtasks.length`, so deleting the active step
must leave the focus index somewhere sane. Deletion does not trigger completion side
effects, even if it removes the last incomplete step — posting a lesson for work nobody
did is wrong. Memory sync fires exactly once through the normal step-toggle path only.

**Size:** Medium. The highest user-visible payoff on this list.

---

## Task 4 — Cancel an in-flight agent run

Status: not started
Issue: https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/15

**Why:** `PENDING_TIMEOUT_MS` is 15 minutes, and while `pending` is set every action button
is disabled. If a run hangs, the user watches a dead UI for a quarter of an hour with no
escape. There is no cancel affordance anywhere in the app.

**Do:** Add a cancel control next to the running indicator that clears `pending` and logs
the abandonment. Note honestly in the log line that cancelling stops the app from *waiting*
— the agent turn itself continues in the chat slot, and the embedded session below still
shows it. That is the truthful framing and it costs nothing to say.

**Watch for:** Cancelling stops the app from polling, but the abandoned agent turn continues
in the chat slot and may finish after the cancel. Without intervention `seenRef` still holds
the pre-cancel watermark, so the next send will slice from that old position and may apply
the abandoned turn's markers to the new pending work. Cancelling must advance `seenRef` to
the current slot length (or beyond) — rebasing the watermark to discard whatever the
abandoned turn eventually writes.

**Size:** Small. Pairs naturally with task 2, since both touch pending lifecycle.

---

## Task 5 — Make `pending` per task instead of app-wide

Status: not started
Issue: https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/16

**Why:** `sendToTaskSlot`, `runCommand`, `draftSteps`, and `runRemaining` all begin with
`if (pendingRef.current) return`. One in-flight request anywhere blocks agent actions on
every task. Slots are already per task and independent, so the restriction is incidental to
the implementation rather than a property of the design. With a real backlog you cannot
draft steps for one task while another is running.

**Do:** Key pending by task id. The Focus view already computes `taskPending` by comparing
`pending.taskId`, so most of the rendering logic is written for this shape.

**Watch for:** The poll effect keys on `pending?.sentAt` and drives a single interval. It
needs to become per task, or one interval that sweeps all pending work.

**Sequencing:** Do this *after* task 2. Doing it first means hand-editing the concurrency
rules in untested closure code; doing it after means changing a pure function with tests
around it.

**Size:** Medium.

---

## Task 6 — Keyboard access to the step queue

Status: not started
Issue: https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/17

**Why:** Queue rows are `div` elements with `onClick` and no `role`, `tabIndex`, or key
handler, so selecting a step is mouse-only. For an app whose entire premise is reducing
friction on the active step, reaching for the mouse to change focus is the wrong texture.
The `◄`/`►` buttons are real buttons and do work, so this is a gap rather than a wall.

**Do:** Replace the `div`'s `onClick` with a native `<button>` wrapping only the step title
area, keeping the existing completion button as a sibling rather than a child. Give the
title button a visible focus ring. Nesting the completion button inside a row-level
interactive element would produce invalid semantics and confuse screen readers. Consider
`j`/`k` or arrow keys for step navigation while Focus is active.

**Size:** Small.

---

## Recommendation

If only one thing gets done: **task 1**. It is the smallest item here and the only one
defending against a failure that produces no symptom.

If there is room for a real session: **task 1, then task 3.** CI makes the artifact safe to
change, and step editing is what users will actually feel. Task 2 is the one to schedule
before any further work on the slot engine, including tasks 4 and 5, because it converts
that area from "careful hand-editing" into "change a tested pure function."
