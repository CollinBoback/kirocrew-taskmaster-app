# Agent guide

Use this file as the operating contract for coding agents working in this repository.
Human-facing setup and usage belong in `README.md`; detailed project rules live in
`.kiro/steering/`.

## Start here

1. Read `README.md` for the product, repository map, and local development path.
2. Read `.kiro/specs/taskmaster-pro/requirements.md` and `design.md` before changing behavior.
3. Check `.kiro/specs/taskmaster-pro/tasks.md` before selecting or updating work.
4. Follow both files in `.kiro/steering/`, including task sequencing and partial-progress rules.
5. Inspect the working tree and preserve unrelated user changes.

The in-repository spec is authoritative. If another document disagrees with it, follow the
spec and call out the conflict rather than silently choosing a third behavior.

## Hard boundaries

- Never run install, gateway, or `kirocrew` CLI commands from this development environment.
  Deployment to the work machine is a manual, user-owned step.
- Never add real employer or customer names, internal server details, secrets, proprietary
  data, or production credentials. Keep samples synthetic and generic.
- Preserve the backend-less architecture unless an approved spec change explicitly requires
  otherwise.
- Do not add self-managed `resources` or `lifecycle` fields to `app.json`; Crew owns the app
  lifecycle.
- Do not discard, overwrite, or reformat unrelated work in a dirty working tree.

## Product invariants

- Focus shows exactly one micro-step; the queue is available but is not the default view.
- Only a valid `STEP RESULT [n]: done|failed — summary` marker can automatically settle a step.
- A missing or malformed result marker leaves the step available for manual handling.
- Memory synchronization stores one reusable lesson per completed task, never per-step logs.
- Commands execute through the taskmaster agent; destructive actions require explicit approval.

## Change rules

- Keep deterministic task, progress, parsing, and queue behavior in testable TypeScript.
- Use the agent only for judgment or execution; do not move deterministic behavior into prompts.
- When `ui/src/` changes, rebuild and commit `ui/dist/index.mjs`. The bundle is part of the
  deployment contract, not disposable generated output.
- Update `agents/taskmaster.json`, `skills/taskmaster-method/SKILL.md`, and UI parsing together
  when changing the `STEP RESULT` or draft-response contracts.
- Keep documentation task-oriented and link to the canonical spec or steering rule instead of
  duplicating it.

## Required verification

Run from `ui/` after code changes:

```bash
npm run typecheck
npm test
npm run build
```

Then run from the repository root:

```bash
node --check ui/dist/index.mjs
git status --short ui/dist/index.mjs
```

When UI source changed, confirm the rebuilt bundle is included in the same change. CI performs a
fresh build and fails if the committed artifact differs. For documentation-only or spec-only
changes, no UI rebuild is required. Report exactly which checks ran and any check that could not
run.

## Task completion

1. Meet the task's acceptance criteria and respect dependency ordering in `tasks.md`.
2. Update the task section and status index in the same change.
3. If stopping mid-task, use the Progress log format in `.kiro/steering/task-tracking.md`.
4. Keep GitHub issues as mirrors; `tasks.md` remains the source of truth.
5. Summarize what now works, verification performed, and any remaining limitation.
