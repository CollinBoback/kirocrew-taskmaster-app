---
inclusion: always
---

# Deployment and install contract

How Taskmaster Pro gets from this repo onto a machine running KiroCrew, and the
constraints every change in this repo must respect. Human-facing step-by-step lives in
`README.md` ("Install on the work machine"); this file is the agent-facing contract.

## The install model

- This repo is only the **install source**. On install, Crew copies it to
  `~/.kiro/crew/apps/taskmaster-pro/` — that copy is what the gateway reads at runtime.
  App state lives beside it at `~/.kiro/crew/apps/taskmaster-pro/data/config.json`.
- Three equivalent install paths (all documented in `README.md`): CLI
  (`kirocrew app install <path>` + `kirocrew gateway restart`), REST
  (`POST /api/apps/install` then `POST /api/apps/taskmaster-pro/enable`), or
  dashboard → App Store → Install from local path.
- **Enable is a separate step from install.** The sidebar entry (route
  `/taskmaster-pro`) appears only after enable or a gateway restart.
- Current recommended path: **local-path install**, hand-carried to the work machine.
  Later graduation path: git-URL install or a personal federated registry (see
  [kiro.dev/docs/crew/apps](https://kiro.dev/docs/crew/apps/), "Federated app model") —
  a deployment-config change only; nothing in the app needs restructuring for it.
- The `taskmaster-method` skill registers via the daily `taskmaster-pro-selfheal` cron
  (symlinks it into `~/.kiro/crew/skills/`), or a manual link/junction to skip the wait.

## Hard constraints on work in this repo

1. **`ui/dist/index.mjs` is a committed deployment contract.** The work machine has no
   Node/npm; the gateway serves the committed bundle directly. Any change under
   `ui/src/` MUST be followed by `cd ui && npm run build` and a commit of the rebuilt
   `dist/index.mjs`, or the installed app silently keeps running the old UI — no error,
   no symptom. CI enforcement is spec Task 1 in
   `.kiro/specs/taskmaster-pro/tasks.md`; until it lands, this rule is manual.
   Docs-only or spec-only changes need no rebuild.
2. **Never run install, gateway, or `kirocrew` CLI commands from this dev
   environment.** There is no gateway here, and deployment crosses to the work machine
   by Collin's hand only (see `README.md` Doctrine). Document commands; do not execute
   them.
3. **No real employer, customer, or internal server names, and no proprietary data
   anywhere in the repo** — sample data stays the fictional migration task.
4. Keep `app.json` on the default gateway-managed lifecycle (`resources`/`lifecycle`
   omitted). The install flow assumes Crew wires up agents, skills, crons, and UI from
   the manifest; do not add self-managed lifecycle fields.

## Iterating against a real gateway (work machine only)

Documented for when Collin is at the installed copy — never run from here:
symlink/junction the source `ui/` into `~/.kiro/crew/apps/taskmaster-pro/ui`, then
`kirocrew app dev taskmaster-pro` for hot reload (`--off` when done).
