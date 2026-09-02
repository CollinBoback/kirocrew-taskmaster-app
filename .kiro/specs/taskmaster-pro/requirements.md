# Taskmaster Pro — requirements

Status: **v0.2.0 shipped.** This file records the requirements the shipped app already
satisfies plus the ones it does not, so `tasks.md` can be read as a delta rather than a
wish list. Everything marked *met* was verified against the source on 2026-08-25.

This file, together with `design.md`, is the authoritative spec as of 2026-08-25
(`tasks.md` task 0, closed). It supersedes the original external narrative spec,
which remains on Collin's machine as a historical artifact.

## Product mandate

Kill activation energy. One task in focus, exactly one micro-step visible, every step
either doable in one sitting or executable as a single command. Progress moves only when
a step closes.

## Functional requirements

### R1 — Isolation mode (met)

Focus shows exactly one micro-step. The queue of all steps is reachable without leaving
Focus but is never the default reading order. Step navigation is manual (`◄`/`►`) and
defaults to the first incomplete step.

### R2 — Deterministic progress (met)

Progress percentage and the default incomplete index are pure functions of the task
document and live in `ui/src/model.ts` where they are unit tested. Step selection state
and queue rendering are also deterministic but remain in `App.tsx` and are not yet covered
by tests.

### R3 — The UI holds no shell (met)

Every command runs through the `taskmaster` agent's terminal tool inside the task's chat
slot. The app never executes anything itself. The agent refuses destructive commands
(delete, drop, truncate, overwrite, push, rm) without explicit confirmation in the same
conversation.

### R4 — STEP RESULT is the only auto-completion source (met)

A step is ticked off automatically when the agent emits a line beginning with
`STEP RESULT [n]:` with a matching index. The parser accepts leading whitespace,
case-insensitive status keywords, several separator styles, and even a bare status with no
summary. A reply without any matching marker leaves the step for the manual toggle and
logs a warning. Guessing is forbidden.

### R5 — Failed steps stay visible (met)

A step whose last run failed keeps `runState: 'failed'`, renders a `FAILED` chip in the
queue and a `LAST RUN FAILED` chip on the command box, and offers `↻ RETRY VIA AGENT`
instead of a fresh run label. A manual toggle clears the stale outcome.

### R6 — One lesson per completed task (met)

When a task's last step closes and memory sync is on, the app posts exactly one lesson
(`category: "knowledge"`) describing the step sequence that worked. `lessonPosted` and an
in-flight ref guard against re-toggle spam. Lessons record reusable solution paths, never
activity logs.

### R7 — Failure tolerance (met)

Config load failure renders a retry affordance rather than a blank page. Config save,
memory sync, cron registration, and gateway status failures land in the Console view and
never block Focus. Malformed gateway config normalizes to a usable document.

### R8 — Step editing (**not met**)

Steps can be added (manually or by the agent) and tasks can be deleted, but an individual
micro-step cannot be edited, deleted, or reordered. A bad agent-drafted step is permanent.
This directly undercuts R9: drafting is only safe to use if its output can be pruned.

### R9 — AI breakdown (partially met)

`✦ Draft Steps with AI` requests a fenced-JSON breakdown and appends the parsed steps,
deduplicating by lowercased title. Met, except that its output cannot be corrected (R8).

### R10 — Interruptibility (**not met**)

An in-flight agent request disables every action button and can only end by settling or by
the 15-minute timeout. There is no cancel affordance, so a hung run locks the UI.

### R11 — Concurrency across tasks (met)

Pending work and send locks are keyed by task ID. While one task has a request in flight,
another task can draft or run steps through its independent chat slot; the busy task still
refuses a conflicting second action. One polling interval sweeps all active tasks and
keeps settlement, timeout, and cancellation scoped to each task's exact request.

### R12 — Keyboard accessibility (**not met**)

Queue rows are `div` elements with `onClick` and no `role`, `tabIndex`, or key handler, so
step selection is mouse-only.

## Non-functional requirements

### N1 — Backend-less (met)

All state is one JSON document in gateway app config. No server, no database, no migration
story beyond `normalizeConfig`.

### N2 — No Node on the work machine (met, unenforced)

`ui/dist/index.mjs` is committed so installation never requires npm. Nothing verifies the
artifact matches source — see `tasks.md` task 1. Verified in sync at the time of writing.

### N3 — No proprietary data (met)

Sample data is the fictional Tableau→SQL migration task with generic `sqlcmd` against
localhost. No employer names, servers, or data appear in the repository. Deployment to the
work machine happens by hand.
