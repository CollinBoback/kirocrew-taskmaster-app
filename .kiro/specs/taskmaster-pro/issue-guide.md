# Taskmaster Pro — plain-language issue guide

This is a readability companion for the GitHub issue queue. It does **not** replace
`.kiro/specs/taskmaster-pro/tasks.md`: `tasks.md` remains the source of truth for Task
2–6 status and progress. GitHub issues remain the work-queue mirror.

Reviewed against `main` on 2026-08-25 and, where relevant, against the public KiroCrew
source/guidance.

## Priority key

- **P0 — do first:** protects later changes from silent or hard-to-debug regressions.
- **P1 — high:** important product or reliability work to do next.
- **P2 — medium:** useful, but not blocking the core implementation sequence.
- **P3 — low / clarify first:** real concern, but the exact change should be re-scoped
  before an agent edits files.
- **P4 — queue cleanup:** already done, duplicate, or otherwise not implementation work.

## Recommended execution view

| Issue | Plain-English outcome | Priority | Who/when | Confidence |
|---|---|---:|---|---:|
| #13 | Make the agent-result decision logic testable before changing it | P0 | AI-ready; first | 97% |
| #15 | Let the user stop waiting on a hung agent run safely | P1 | AI-ready after #13 | 98% |
| #16 | Let different tasks run agent work independently | P1 | AI-ready after #13 | 99% |
| #14 | Let users correct, remove, and reorder micro-steps | P1 | AI-ready; safest after #13 in a single-agent queue | 96% |
| #17 | Make step selection usable from the keyboard | P2 | AI-ready; independent | 92% |
| #19 | Prove the install/runtime flow on the real work machine | P2 | Collin manually, before release confidence is claimed | 100% |
| #8 | Correct the real-gateway development instructions | P3 | Clarify first; do not blindly apply the current symlink prescription | 93% |
| #11 | Duplicate of #13 | P4 | Close duplicate | 100% |
| #12 | CI/build-artifact guard is already merged | P4 | Close completed | 100% |
| #22 | ADHD Cursor output rule is already merged | P4 | Close completed | 100% |

## #8 — Clarify the real-gateway development workflow

### In plain English

The repo currently makes `kirocrew app dev taskmaster-pro` sound like a command that
builds and serves the UI. It is not. KiroCrew dev mode is a **toggle**: it marks the
installed app as development-mode, disables UI caching, watches the installed app's
`ui/` tree, and reloads the dashboard when watched files change. It does not run Vite or
compile `ui/src/`.

### Why it matters

A developer can turn dev mode on, edit React source, and see nothing happen because the
compiled `ui/dist/index.mjs` never changed. The current repo also says the work machine
needs no Node/npm, so the docs must not quietly imply that machine can run a Vite watch
build.

### Important correction to the original issue

The original issue proposes symlinking only `ui/dist`. Upstream KiroCrew guidance
explicitly describes symlinking the installed app's **whole `ui/` directory** and the
watcher explicitly caps its scan at 2,000 files to protect against a runaway tree such as
`node_modules`. A `dist`-only symlink may be a sensible local optimization, but it is not
the documented watcher contract and should not be applied by an agent without verifying
that the watcher follows that nested symlink on the supported Python/platform set.

### Agent change

Re-scope this as a documentation decision, not a blind code edit:

1. State clearly that `kirocrew app dev ...` is a toggle, not a compiler or long-running
   build process.
2. Keep the default contributor loop as `npm run dev` with the repo's mock SDK.
3. For real-gateway iteration, document one verified build-to-installed-UI workflow and
   state its prerequisites (Crew + Node/npm on the same machine).
4. Keep the no-Node work-machine deployment path separate from the development loop.

### Done when

A reader can tell which machine each command runs on, what command actually rebuilds
`dist/index.mjs`, what dev mode itself does, and how to turn it off.

---

## #11 — Duplicate Task 2 issue

### In plain English

This is an older, much longer copy of #13. Keeping both open makes it look like there are
two separate refactors when there is only one.

### Action

Close #11 as a duplicate of #13. Keep #13 as the canonical GitHub mirror of Task 2.

### Done when

Only #13 remains open for the slot-engine extraction.

---

## #12 — CI/build artifact guard

### In plain English

This asked for GitHub Actions to run typecheck/tests/build and fail when
`ui/dist/index.mjs` is stale.

### Current reality

That workflow already exists in `.github/workflows/ci.yml` and Task 1 in `tasks.md` is
already marked done via PR #10.

### Action

Close #12 as completed. No implementation agent should pick it up again.

---

## #13 — Make the agent-result engine testable

### In plain English

When Taskmaster sends work to the agent, `App.tsx` decides which chat messages are new,
which messages are still streaming, when a step is allowed to auto-complete, when an AI
step draft is valid, and when a request has timed out. Those decisions are currently mixed
inside React callbacks/effects, so they are hard to test directly.

### Why it matters

Issues #15 and #16 both change this same pending/request lifecycle. Changing it first
without tests risks stale chat messages completing the wrong step, ending a run too early,
or breaking the fallback behavior that leaves uncertain work visible.

### Current code to recognize

`ui/src/App.tsx` currently owns `PendingWork`, `PENDING_TIMEOUT_MS`, `seenRef`,
`sawReplyRef`, `processAgentMessages`, and the polling effect. `ui/src/model.ts` is already
the pure/testable layer but does not own these decisions yet.

### Agent change

Move only the **decision logic** into a pure model function. Keep network calls, React
state updates, notifications, and logging in `App.tsx`. The pure function should receive a
snapshot of pending work + slot messages + watermark and return what should happen next.

### Done when

- Existing behavior is intentionally unchanged.
- Tests prove old messages are ignored.
- Tests prove the still-streaming last message is not parsed early.
- Tests cover `step`, `draft`, and `all` settlement behavior.
- Tests cover the 15-minute timeout and no-marker fallback.
- Typecheck, tests, build, and committed `ui/dist/index.mjs` verification all pass.

### Priority / sequence

**P0. Do first.** #15 and #16 depend on this safety net.

---

## #14 — Let users edit, delete, and reorder micro-steps

### In plain English

Today a user can add a micro-step, but once a step exists its title/command cannot be
edited, the step cannot be deleted, and the order cannot be changed. That is especially
frustrating after `Draft Steps with AI`, because an imperfect AI draft cannot be cleaned
up.

### Current code to recognize

`App.tsx` has `addStep()` and `deleteTask()`, but no step-level edit/delete/reorder
functions. The Focus queue renders each `task.subtasks` item directly.

### Agent change

Add step-level controls in the Focus queue:

- edit title and optional command;
- delete with an intentional confirmation interaction;
- move a step up or down.

Persist through the existing `mutate()` path.

### Done when

- Edited text survives a reload.
- Deleted steps stay deleted after reload.
- Reordered steps keep their order after reload.
- Deleting the active step leaves focus on a sensible remaining step.
- Deleting a step does **not** pretend unfinished work was completed and does not post a
  completion lesson by itself.

### Priority / sequence

**P1.** Technically independent of #13, but both touch `App.tsx`; in a single-agent queue,
do #13 first to reduce merge/conflict risk.

---

## #15 — Let the user stop waiting on a hung agent run

### In plain English

An agent request can stay pending for up to 15 minutes. While it is pending, the relevant
action buttons are disabled. There is currently no escape hatch.

### Important behavior

"Cancel" cannot truthfully mean "kill the agent turn." The app only controls whether it
keeps waiting/polling. The underlying chat-slot turn may continue and finish later.

### Agent change

After #13, add a cancel/abandon control near the running state. Clearing pending is only
half the fix: also rebase the slot watermark so a late reply from the abandoned turn is
not mistaken for the next request's result.

### Done when

- A user can stop waiting without waiting for the 15-minute timeout.
- The UI explains that the underlying agent turn may continue in chat.
- Late output from the abandoned turn cannot complete/fail a later request.
- The cancellation path has focused tests around watermark behavior.

### Priority / sequence

**P1. Do after #13.**

---

## #16 — Allow agent work on more than one task

### In plain English

The app already gives each task its own chat slot, but one global `pending` object means
one task's agent run blocks agent actions on every other task.

### Current code to recognize

`sendToTaskSlot`, `runCommand`, `draftSteps`, and `runRemaining` all reject work when
`pendingRef.current` is set. The poll effect also tracks only one pending request at a
time.

### Agent change

Store pending work by task id (or use an equivalent per-task structure), and poll each
active request safely. The UI should only disable agent actions for the task that is
already busy.

### Done when

- Task A can be running while Task B starts its own independent agent action.
- A single task still cannot accidentally launch conflicting work against itself.
- Results are applied only to the task/slot that owns them.
- Timeout/cancel/settlement behavior works independently per task.

### Priority / sequence

**P1. Do after #13.** Prefer #15 first so cancellation semantics are settled before
multiplying pending requests.

---

## #17 — Make step selection keyboard-accessible

### In plain English

The Focus queue looks selectable, but each row is a clickable `div`. A keyboard user can
reach the separate completion button, but cannot naturally focus/select the step title the
same way a mouse user clicks the row.

### Current code to recognize

The queue maps `task.subtasks` to a `div` with `onClick={() => jumpStep(...)}` and contains
a nested completion `<button>`.

### Agent change

Make the **step title/select area** a native button and keep the completion button as a
sibling so interactive controls are not nested. Add a visible keyboard focus style.
Optional `j`/`k` or arrow-key navigation can be added only if it stays scoped to Focus and
does not steal keystrokes from inputs.

### Done when

Every step can be selected by keyboard alone, focus is visibly obvious, completion remains
a separate control, and no invalid nested-button markup is introduced.

### Priority / sequence

**P2. Independent**, but it will be easier to land after #14 if #14 changes the same queue
row markup.

---

## #19 — Manual work-machine install/runtime verification

### In plain English

This is not a coding task. It is the final reality check that the committed app actually
installs and behaves correctly on the machine where KiroCrew is installed.

A step-by-step run sheet with pass criteria, triage hints, and a paste-ready results
template lives at `docs/work-machine-verification.md`.

### Why it cannot be delegated to the repo agent

`.kiro/steering/deploy-install.md` explicitly says install/gateway/`kirocrew` commands are
not run from the development environment. The work-machine boundary is intentional.

### Collin's checklist

1. Install/enable the app on the work machine using the documented path.
2. Confirm Taskmaster appears in the sidebar and all three views load.
3. Create a throwaway task + step and confirm it persists across reload.
4. Run one harmless executable step through the taskmaster agent and confirm a
   `STEP RESULT` updates the step.
5. Confirm the `taskmaster-method` skill is registered.
6. Comment on #19 with any difference between reality and the README/steering docs.

### Priority / sequence

**P2, manual.** Run before calling the release/install path verified.

---

## #22 — ADHD-friendly Cursor output rule

### In plain English

This asked for an always-applied Cursor rule that makes agent responses easier to act on.

### Current reality

PR #20 already added `.cursor/rules/i-have-adhd.mdc` with `alwaysApply: true`, and that PR
is merged to `main`.

### Action

Close #22 as completed. No implementation agent should pick it up again.

## Suggested single-agent order

For one AI agent working serially, use:

**#13 → #15 → #16 → #14 → #17**

Then Collin runs **#19** manually. Keep **#8** out of the implementation batch until its
real-gateway development workflow is explicitly chosen and verified. #11, #12, and #22
are queue cleanup, not implementation.
