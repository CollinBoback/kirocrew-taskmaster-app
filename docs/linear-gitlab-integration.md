# Linear ↔ GitLab Integration — Investigation

**Closes:** #52  
**Date investigated:** 2026-08-26

---

## TL;DR

**Recommended: Yes — set it up.**  
The Linear/GitLab integration is a native, officially supported connector that requires only a personal access token and a webhook. It mirrors exactly the same GitHub↔Linear sync you already rely on, so your GitLab projects gain the same automatic issue-state transitions at zero ongoing overhead.

---

## What the integration does

Once configured, Linear and your GitLab instance stay in sync bidirectionally:

| GitLab event | Linear effect |
|---|---|
| MR opened / converted to ready | Issue moves to *In Progress* |
| MR merged | Issue moves to *Done* |
| Branch name contains Linear issue ID | MR auto-linked to that issue |
| MR description contains `Closes LIN-123` / magic words | Issue linked from description |

Additionally:
- A **linkback** from GitLab MR → Linear issue is inserted automatically.
- The keyboard shortcut **`g` → `c`** in Linear generates a branch name, assigns the issue, and moves it to *In Progress* in one action — same UX as the GitHub integration.
- Per-team **workflow automations** let you customise which Linear status each MR state maps to.

---

## Self-hosted / enterprise GitLab compatibility

Linear explicitly supports self-hosted installations. The setup requires:

1. A **GitLab personal access token** (scopes: `api`, `read_user`) — which you already have.
2. A **webhook** on the GitLab side pointing to Linear's webhook URL (provided during setup).
3. A **Linear admin** account to enable the integration at the workspace level.

The advanced self-hosted instructions live at: <https://linear.app/docs/gitlab#steps>

---

## How it fits this project

This repo already syncs one-to-one with Linear via the GitHub integration. Adding GitLab means:

- Issues you work in GitLab (MRs, branches) will move through the same Linear board without any manual status updates — identical to the current GitHub experience.
- No duplicate operational boards: Linear remains the workflow-state surface whether the
  code lands in GitHub or GitLab.
- The `.kiro/specs/taskmaster-pro/tasks.md` status index remains canonical for Taskmaster
  Pro. If Linear and that file disagree, the in-repository spec wins and the mirror is
  corrected; neither GitHub nor GitLab merge-request state silently rewrites it.

---

## Setup steps (when ready)

1. Go to **Linear → Settings → Integrations → GitLab** (<https://linear.app/settings/integrations/gitlab>).
2. Authenticate with your GitLab personal access token.
3. Select which GitLab repositories to connect.
4. Follow the self-hosted webhook prompt (Linear provides the exact webhook URL and secret).
5. On the GitLab side: add the webhook under **Project → Settings → Webhooks**.
6. Optionally configure per-team workflow automations in Linear to match MR stages.

Total setup time: ~10 minutes.

---

## Verdict

The integration is stable, zero-maintenance once configured, and directly parallels the existing GitHub↔Linear setup. There is no meaningful downside. Enable it when you next open a GitLab MR you want tracked in Linear.
