---
inclusion: always
---

# Task tracking: spec backlog + GitHub issues

How work items are tracked, marked partially done, and picked back up. Applies to the
sizable units ("Task N" sections) in `.kiro/specs/taskmaster-pro/tasks.md`.

## Source of truth

`tasks.md` is **canonical** for task status and progress, consistent with the Task 0
doctrine: one source of truth, in-repo. GitHub issues on
`CollinBoback/kirocrew-taskmaster-app` are the mirror — the notification/work-queue
surface — never the authority. If they disagree, `tasks.md` wins and the issue gets
corrected.

The plain-language companion `.kiro/specs/taskmaster-pro/issue-guide.md` exists to make
the queue easy to scan. It may summarize priorities, dependencies, and code evidence, but
it never overrides a task's canonical `Status:` line or acceptance criteria.

Tool/mechanism/service analysis decisions are logged once in
`.kiro/specs/taskmaster-pro/decisions.md` with the options considered and the why/why-not
reasoning. Treat that log as the closeout record; only reopen a decision when product
constraints or requirements materially change.

## Status vocabulary

Each task section carries a `Status:` line with exactly one of:

- `not started`
- `in progress` — actively being worked this session/PR
- `partially done — paused` — real work landed, then stopped; MUST have a Progress log
- `done` — acceptance criteria met, merged to `main`
- `closed (won't do)` — closed without the work, with the reasoning kept in the section

The status index table at the top of `tasks.md` must be updated in the same commit as
any `Status:` line change.

## Two-way canonical references

- Every open task section carries an `Issue:` line linking its GitHub issue.
- Every issue body begins with `Spec:` followed by a permalink to the task's heading
  anchor on `main` (e.g.
  `https://github.com/CollinBoback/kirocrew-taskmaster-app/blob/main/.kiro/specs/taskmaster-pro/tasks.md#task-1--ci-that-guards-the-committed-build-artifact`).
- An issue is closed only when its task section says `done` (or `closed (won't do)`)
  in a commit merged to `main` — close it in the same PR or immediately after merge,
  with a closing comment linking the merge commit.

## Readability contract for mirrored issues

A GitHub issue is the work surface, so it must make sense without forcing the reader to
decode internal variable names first. Keep the technical detail, but put it after the
plain-language explanation.

For Task 2–6 mirrors, use this order:

1. **In plain English** — one short paragraph explaining the user/developer problem.
2. **Why it matters** — the failure or friction this issue prevents.
3. **Current code to recognize** — the important files/functions/refs, only after the
   reader understands the problem.
4. **Agent change** — a bounded description of what should change; do not silently widen
   scope.
5. **Done when** — observable acceptance checks in bullets.
6. **Priority / sequence** — P0/P1/P2/P3/P4 plus explicit upstream/downstream dependencies.

Additional rules:

- Keep one outcome per issue. If two issues are duplicates, close one instead of keeping
  competing descriptions alive.
- Lead with behavior, not implementation jargon. Prefer "old chat results could affect a
  new run" before "watermark rebasing"; explain the term afterward.
- A manual-only issue says **Manual** near the top and names why an agent cannot perform
  it.
- An already-merged issue is queue cleanup, not an AI implementation candidate.
- If KiroCrew behavior is part of the premise, verify it against current public KiroCrew
  source/guidance before prescribing a command or filesystem layout.

## Partial-progress protocol (the important part)

When stopping mid-task, before ending the session:

1. Set the task's status to `partially done — paused` (section + index table).
2. Add or extend a **Progress log** block at the end of that task's section:

   ```markdown
   ### Progress log

   - **2026-08-25** — Done: <what landed, with commit SHAs / PR links>.
     Why stopped: <blocker, timebox, dependency, decision needed>.
     **Pick up here:** <the exact next action — file, function, or step — so the next
     session starts in under a minute>.
   ```

3. Mirror the same entry as a comment on the linked issue (copy, don't paraphrase).
4. Commit the `tasks.md` update in the same PR as the partial work itself — progress
   notes travel with the code they describe.

Entries are append-only and dated; never rewrite history in the log. "Pick up here"
must name a concrete artifact (a file, a failing test, a spec anchor), not a vibe.

## Sequencing constraints (respect the spec's ordering)

`tasks.md` encodes real dependencies — currently: Task 1 first (smallest, defends a
symptomless failure); Task 2 before Tasks 4 and 5 (converts the slot engine from
untested closures into a tested pure function before anyone edits its rules). Issues
carry these as "Do after" notes. Do not start a downstream task while its upstream is
`not started` or `partially done — paused` without recording why in the Progress log.
