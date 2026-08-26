# GitHub repository migration checklist

> **Source:** [GitHub Well-Architected — Repository Migration Checklist](https://learn.github.com/well-architected/scenarios/migrations/repository-checklist)
>
> **Linear issue:** [COL-308](https://linear.app/collinboback/issue/COL-308/github-repo-merge)
>
> This checklist tracks the migration of the `kirocrew-taskmaster-app` repository against
> the GitHub Well-Architected framework. Work through each section in order; check items
> off as they are verified and commit the updated file so progress is visible in Git history.

---

## 1 — Repository inventory and assessment

- [x] Repository is identified with a canonical name, owner, and URL
  (`CollinBoback/kirocrew-taskmaster-app`).
- [x] Last-active date recorded — actively maintained as of 2026-08.
- [x] Repository size assessed — small; no large binary files or LFS objects.
- [x] Open pull request and issue counts reviewed (see GitHub issues tab).
- [ ] Run [`git-sizer`](https://github.com/github/git-sizer) to confirm no hidden
  pack-file anomalies before a cross-org or cross-platform transfer.
- [ ] Confirm no files in history exceed GitHub's 100 MB hard limit
  (`git log --all --stat | grep -E '[0-9]{9,}'`).

---

## 2 — Migration planning

- [x] Migration type determined: **self-serve** (no GitHub Expert Services engagement
  needed — repository is small and low-complexity).
- [x] Migration tool selected: GitHub web UI / `gh` CLI — sufficient for same-platform
  transfers; [GitHub Enterprise Importer](https://github.com/github/gh-gei) available
  as a fallback for cross-org migrations.
- [ ] Destination organization / namespace confirmed in writing before execution.
- [ ] Any branch-protection rules, rulesets, or required status checks documented so
  they can be re-applied post-migration.
- [ ] Secrets and environment variables (Actions, Dependabot) listed and flagged for
  rotation — they do **not** transfer automatically.

---

## 3 — GitHub environment preparation

- [x] Target organization exists and billing is configured.
- [x] Repository visibility policy reviewed (currently public; confirm target policy
  matches).
- [ ] Teams and collaborator permissions mapped from source to destination.
  - Current collaborators: `CollinBoback` (owner), `Copilot` (agent).
  - Recreate team membership explicitly after transfer; permissions reset on transfer.
- [ ] Branch protection / ruleset configuration exported (`gh api` or Settings UI
  screenshot) and ready to re-apply.
- [ ] Actions workflow permissions (`GITHUB_TOKEN` scopes) reviewed against destination
  org policy — current CI workflow uses `contents: read` + `pull-requests: read`.

---

## 4 — Integrations and webhooks

- [x] **Linear ↔ GitHub** integration active and confirmed — issue state transitions
  fire correctly via the existing webhook.
- [ ] **Linear ↔ GitLab** integration assessed separately (see
  [`docs/linear-gitlab-integration.md`](linear-gitlab-integration.md) if present).
  Reconnect the Linear workspace to the new repo URL after migration.
- [ ] Any Cursor Automations pointed at this repository updated with the new URL
  (automations live at [cursor.com/automations](https://cursor.com/automations)).
- [ ] CI badge URL in `README.md` updated to new workflow path after migration.
- [ ] CodeQL / GHAS settings re-enabled on the destination repository if they were
  enabled on the source.

---

## 5 — Testing and dry-run validation

- [ ] Perform a **dry-run** transfer to a temporary fork or staging org before the real
  cut-over.
- [ ] After dry run, verify:
  - All branches present (`git branch -r`).
  - Full commit history intact (`git log --oneline | wc -l` matches source).
  - Tags present (`git tag | wc -l`).
  - CI workflow triggers correctly on the new remote.
  - `ui/dist/index.mjs` artifact is in sync with source (`git diff --exit-code
    ui/dist/index.mjs`) — this is the deployment-contract check enforced by CI.
- [ ] Fix any issues found in the dry run before proceeding to production migration.

---

## 6 — Execution

- [ ] Announce a **repository freeze** window to all contributors (no pushes to `main`
  during the transfer window).
- [ ] Take a final local backup: `git clone --mirror <source-url> backup.git`.
- [ ] Execute transfer via chosen tool (web UI transfer or `gh-gei`).
- [ ] Re-apply branch protection rules and rulesets immediately after transfer.
- [ ] Rotate all secrets (Actions secrets, PATs, webhook secrets) that were scoped to
  the old repository.
- [ ] Update Linear workspace integration to point at the new repository URL.
- [ ] Update any Cursor Automations with the new repository URL.

---

## 7 — Post-migration validation

- [ ] CI passes on the first post-migration commit (`main` branch green).
- [ ] `ui/dist/index.mjs` artifact verification step passes in CI.
- [ ] At least one pull request opened and merged successfully in the new location.
- [ ] Linear issue state transitions verified (open PR → *In Progress*; merge → *Done*).
- [ ] `README.md` install instructions tested end-to-end on the work machine against the
  new repository URL.
- [ ] Old repository URL either archived or redirected — do not delete until the above
  items are all checked.

---

## 8 — Documentation and close-out

- [ ] Update `README.md` clone/install URL if the repository URL changed.
- [ ] Update `.kiro/specs/taskmaster-pro/tasks.md` status index if any tasks reference
  old PR or issue URLs.
- [ ] Record the completed migration in `.kiro/specs/taskmaster-pro/decisions.md`
  (date, tool used, any notable issues).
- [ ] Close [COL-308](https://linear.app/collinboback/issue/COL-308/github-repo-merge)
  in Linear once all sections above are fully checked.

---

*Last updated: 2026-08-26. Work through each section top-to-bottom; do not skip the
dry-run step (section 5).*
