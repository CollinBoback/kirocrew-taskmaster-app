# Taskmaster Pro — requirements

Status: **v0.2.0 shipped.** This file records the requirements the shipped app already
satisfies plus the ones it does not, so `tasks.md` can be read as a delta rather than a
wish list. Everything marked *met* was verified against the source on 2026-08-25.

The authoritative narrative spec is Collin's `memory/specs/2026-08-24-taskmaster-pro-kirocrew-app.md`,
which lives outside this repository. That is a gap in itself — see `tasks.md` task 0.

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

Progress percentage, step navigation, and queue rendering are pure functions of the task
document. No agent judgment participates in progress math. All of it lives in
`ui/src/model.ts` and is unit tested.

### R3 — The UI holds no shell (met)

Every command runs through the `taskmaster` agent's terminal tool inside the task's chat
slot. The app never executes anything itself. The agent refuses destructive commands
(delete, drop, truncate, overwrite, push, rm) without explicit confirmation in the same
conversation.

### R4 — STEP RESULT is the only auto-completion source (met)

A step is ticked off automatically if and only if the agent emits a line matching
`STEP RESULT [n]: done|failed — <summary>` at the start of a line. A reply without a
marker leaves the step for the manual toggle and logs a warning. Guessing is forbidden.

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

### R11 — Concurrency across tasks (**not met**)

`pending` is a single app-wide slot. While any task has a request in flight, agent actions
on *every* task are refused. A multi-task backlog cannot draft steps for one task while
another runs.

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
