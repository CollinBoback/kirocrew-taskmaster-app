---
name: repo-migration
description: 'Reusable procedure for migrating a Git repository between owners, organizations, or platforms. Instantiates a per-migration checklist doc, then walks eight phases: inventory, planning, environment prep, integrations, dry run, execution, post-migration validation, and close-out. Use whenever a repository transfer, org move, or platform migration is requested.'
---

# Repository migration

Reusable procedure distilled from the [GitHub Well-Architected Repository Migration Checklist](https://learn.github.com/well-architected/scenarios/migrations/repository-checklist). This skill holds the *repeatable* method; per-migration state (checked boxes, repo-specific findings) belongs in a checklist doc, never in this file.

## Step 0 — Instantiate the checklist doc

Migration progress is state, and state lives in a doc:

1. Copy the phase structure below into `docs/<repo-name>-migration-checklist.md` as a checkbox list.
2. Pre-annotate every item you can verify immediately (repo size, collaborators, CI config) so the doc starts grounded in reality, not blank.
3. Link the tracking issue (Linear/GitHub) in the doc header.
4. Commit the doc; re-commit it every time items get checked so progress is visible in Git history.

An existing instantiation to crib from: `docs/github-repo-migration-checklist.md` (COL-308).

## The eight phases

Work top-to-bottom. Never skip phase 5 (dry run).

### 1 — Inventory and assessment
- Record canonical name, owner, URL, last-active date.
- Assess size: run [`git-sizer`](https://github.com/github/git-sizer); flag LFS objects and any file in history over the destination's hard limit (100 MB on GitHub).
- Count open PRs and issues; decide which must survive the move.

### 2 — Planning
- Choose migration type (self-serve vs. assisted) and tool (web UI transfer, `gh` CLI, [GitHub Enterprise Importer](https://github.com/github/gh-gei) for cross-org, `git clone --mirror` for cross-platform).
- Confirm the destination namespace **in writing** before execution.
- Export branch-protection rules, rulesets, and required status checks — they do not transfer.
- List all secrets and environment variables (Actions, Dependabot); every one must be rotated, not copied.

### 3 — Environment preparation
- Verify the target org exists, billing is configured, and visibility policy matches.
- Map teams and collaborator permissions from source to destination; permissions reset on transfer.
- Review Actions workflow token scopes against destination org policy.

### 4 — Integrations and webhooks
- Enumerate everything pointed at the repo URL: issue trackers (Linear), CI badges, Cursor Automations, CodeQL/GHAS, external webhooks.
- For each, note the reconnection step and who owns it.

### 5 — Dry-run validation (do not skip)
- Transfer to a temporary fork or staging org first.
- Verify: all branches present, commit count matches source, tags intact, CI triggers on the new remote, and any committed build artifacts (e.g. `ui/dist/*`) still pass their contract checks.
- Fix every dry-run failure before touching production.

### 6 — Execution
- Announce a repository freeze window; no pushes to the default branch during transfer.
- Take a final `git clone --mirror` backup.
- Execute the transfer, then immediately: re-apply protection rules, rotate all secrets, repoint integrations.

### 7 — Post-migration validation
- CI green on the first post-migration commit.
- One PR opened and merged end-to-end in the new location, with issue-tracker transitions confirmed.
- Install/clone instructions tested against the new URL.
- Archive or redirect the old URL — never delete until every item above is checked.

### 8 — Close-out
- Update README URLs, spec/task files, and any docs referencing the old location.
- Record the migration (date, tool, notable issues) in the project's decision log.
- Close the tracking issue only when the checklist doc has zero unchecked boxes.

## Guardrails

- Transfer, secret rotation, and freeze announcements are irreversible human actions — prepare them, verify them, but never execute them autonomously without explicit confirmation in the same conversation.
- Verification commands (git-sizer, branch/tag counts, artifact diffs) are safe to run and report autonomously.
