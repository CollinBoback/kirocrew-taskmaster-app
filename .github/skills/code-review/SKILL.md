---
name: code-review
description: Code review guidelines for the Taskmaster Pro Crew app. Use this when reviewing pull requests or diffs in this repository to focus feedback on gateway-contract correctness, failure tolerance, and spec consistency.
---

# Code review skill for Taskmaster Pro

When reviewing changes in this repository, prioritize the checks below. Report only issues you are confident about; skip stylistic nitpicks unless they hide a bug.

## What this repo is

A backend-less KiroCrew Crew app: React UI (`ui/`), one agent definition (`agents/taskmaster.json`), skills under `skills/` (`taskmaster-method`, `write-concisely`), and a manifest (`app.json`). All state persists as a single JSON document via the gateway config API. The agent is invoked only through per-task chat slots.

## High-priority review checks

### Gateway contract correctness
- REST cron creation uses `cron`; the `app.json` manifest cron array uses `cron_expr` / `every`. Flag any code that mixes these spellings up.
- Lesson `category` must be one of `tool | preference | knowledge`. Flag any other value passed to `POST /api/lessons`.
- `permissions.events` entries are scopes (`notification`, `subagent:user`, `slots:user`, …), not raw event names.
- Gateway events do not reach installed-app pages; load-bearing data must poll REST. Flag new code that relies on `useAppEvents` / CustomEvents for anything critical.
- Imports of `@kirocrew/app-sdk` and `@kirocrew/ui` must stay build externals; flag bundling them or using the stale `@kirocrew/app-sdk/ui` spelling.
- Runs must go through chat slots (`POST /api/chat` + polling `GET /api/chat/slots/{slot}`), never bare `POST /api/spawn`.

### Failure tolerance
- Every gateway call from the UI must be failure-tolerant: errors should surface in the Console view and never break the Focus view. Flag unhandled promise rejections or fetches without error paths.

### Slot-engine and agent-protocol invariants
- Executable-step runs must end with a machine-parseable `STEP RESULT [n]: done|failed — summary` line. Flag changes to the agent prompts or the slot parser that break this contract on either side.
- Breakdowns are fenced-JSON blocks of 3–7 verb-first steps of ≤15 minutes each. Parser and prompt changes must stay in sync with `skills/taskmaster-method/`.
- Destructive commands must be refused by the agent; flag prompt edits that weaken this.

### Spec and docs consistency
- `.kiro/specs/taskmaster-pro/` is authoritative. Behavior changes should update `requirements.md` / `design.md` / `tasks.md` `Status:` lines, and the README architecture tables when they drift.
- One lesson per completed task is the memory-sync convention; flag code that syncs more.

## General checks

- TypeScript: progress math, step navigation, and queue rendering must remain deterministic (no agent calls for things computable locally).
- No secrets, tokens, or machine-specific absolute paths committed.
- New UI state must round-trip through the single config JSON document, not ad-hoc storage.
