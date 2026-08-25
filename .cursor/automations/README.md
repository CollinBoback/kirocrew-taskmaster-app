# Cursor Automations (this repo)

Open [cursor.com/automations/new](https://cursor.com/automations/new) and create **1. Artifact rebuild on CI fail** first. Paste the Prompt block from [`01-artifact-rebuild-on-ci-fail.md`](01-artifact-rebuild-on-ci-fail.md). Everything else waits until that one is quiet.

These files are the source of truth for dashboard copy. They do not enable anything by themselves.

## Shared rules (every automation)

- **Private** permission scope.
- **GitHub comments first.** Skip Send-to-Slack unless you have a public channel you actually read.
- **High-signal or silent.** One comment, one tiny PR, or nothing. No daily essay.
- **No work machine.** Never run `kirocrew`, never talk to a gateway, never install the app.
- **No proprietary data** in comments, PRs, or memories. Sample data stays the fictional Tableau→SQL migration task.
- **Memories** (when enabled) store only already-open PRs / already-commented drift — not activity logs.

## The five (ranked)

| # | File | Trigger | Tools | Do nothing when |
|---|---|---|---|---|
| 1 | [`01-artifact-rebuild-on-ci-fail.md`](01-artifact-rebuild-on-ci-fail.md) | CI / workflow run completed | PR creation, Memories | Run succeeded, or a flake with no code fix |
| 2 | [`02-visual-pr-check.md`](02-visual-pr-check.md) | PR opened or pushed | Comment on PR, Computer use | Diff does not touch `ui/src/` or `ui/dev/` |
| 3 | [`03-spec-issue-drift.md`](03-spec-issue-drift.md) | PR merged to `main` + weekday `0 14 * * 1-5` | Issue comments, Memories | Spec index and issues already match |
| 4 | [`04-autofix-review-comments.md`](04-autofix-review-comments.md) | Inline PR review comment | Comment on PR, push to existing branch | Design question, unclear ask, or style nit |
| 5 | [`05-cursor-run-label.md`](05-cursor-run-label.md) | `cursor-run` label added on an issue | PR creation, Memories | Issue is blocked on Task 2, or not a spec-index issue |

Also enable Cursor-managed [Bugbot](https://cursor.com/docs/bugbot.md) on this repo (dashboard, not a prompt file). Skip a daily digest — volume is too low.

## What these are not

KiroCrew crons on the work machine still own step execution, `STEP RESULT`, skill selfheal, and weekday task check-ins. Cowork LOCAL schedules (morning-sync, groom-prep) stay local. A Taskmaster → Cursor webhook is a later product idea; do not build it until 1–3 are boring.

Docs: [cursor.com/docs/cloud-agent/automations](https://cursor.com/docs/cloud-agent/automations).
