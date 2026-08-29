# Taskmaster Pro — Kiro Crew app

Execution engine from Collin's mockup: pick one task, isolate **one micro-step at a time**, run executable steps through the `taskmaster` agent (in an embedded per-task chat), sync completed solution paths to Crew memory, and watch everything on a console.

The in-repository [product spec](.kiro/specs/taskmaster-pro/) is authoritative. It contains the requirements, design, and prioritized [task backlog](.kiro/specs/taskmaster-pro/tasks.md). The original external narrative spec remains a historical artifact on Collin's machine; this repository no longer depends on it. The [steering rules](.kiro/steering/) define deployment and task tracking. Crew App Kit documentation is at [kiro.dev/docs/crew/apps](https://kiro.dev/docs/crew/apps/).

## Quick start

Use Node.js 22 and npm. The local harness uses synthetic data and mock KiroCrew SDK components, so no Crew gateway is required.

```bash
cd ui
npm ci
npm run dev
```

Open <http://localhost:5174>. Select the seeded task and run its current step. A scripted agent reply should produce a `STEP RESULT` marker, complete the step, and advance Focus. Drafting steps and running the remaining queue are also available in the harness.

## Project status

Taskmaster Pro is an active `0.2.0` prototype. Type checking, tests, the production build, and committed-bundle synchronization run in CI. The canonical current status and sequencing live in [`tasks.md`](.kiro/specs/taskmaster-pro/tasks.md); GitHub issues mirror that file but do not replace it.

Known limitation: task slots created through generic `POST /api/chat` appear as ordinary user sessions. True app-owned slots require an in-gateway hooks backend and are deferred.

## Repository map

| Path | Purpose |
|---|---|
| `ui/src/` | React UI and deterministic task/slot model |
| `ui/dev/` | Local mock SDK, UI components, and scripted gateway behavior |
| `ui/dist/` | Committed deployment artifact served by Crew |
| `agents/` and `skills/` | Taskmaster agent definition and execution method |
| `.kiro/specs/` and `.kiro/steering/` | Product authority, backlog, deployment, and tracking rules |

Sibling app: `apps/work-cockpit/` owns day-level focus; Taskmaster owns single-task decomposition and step execution.

## Architecture

**Backend-less.** Tasks/steps/settings persist as one JSON document in gateway app config (`GET/PUT /api/apps/taskmaster-pro/config` → `~/.kiro/crew/apps/taskmaster-pro/data/config.json`). Progress math, step navigation, and queue rendering are deterministic TypeScript; the agent is invoked only for judgment/execution — through a **per-task chat slot** (the spec-builder / ops-mission-control builtin pattern):

| Piece | Role |
|---|---|
| `ui/` (React, dashboard page) | Three views from the mockup — **Focus** (isolation mode, command runner, embedded task chat), **Backlog**, **Console** — plus the slot engine that parses agent replies. Theme tokens (`var(--bg)` etc.) with the mockup's dark palette as fallbacks |
| `agents/taskmaster.json` | Four jobs, prompt-separated: fenced-JSON breakdowns, run-one-step, run-remaining-steps, routine check-ins. Runs end with a machine-parseable `STEP RESULT [n]: done\|failed — summary` line; destructive commands refused |
| `skills/taskmaster-method/` | Breakdown rules (3–7 verb-first steps ≤15 min), executable-step safety, the STEP RESULT contract, one-lesson-per-task memory-sync convention |
| `skills/write-concisely/` | Strunk's *Elements of Style* writing rules for human-facing prose, vendored from [context-engineering-kit](https://github.com/NeoLabHQ/context-engineering-kit/blob/master/plugins/docs/skills/write-concisely/SKILL.md) (pinned commit + license in the file's provenance note) |

Gateway integration map (all failure-tolerant — errors land in the Console view, Focus keeps working):

| UI action | Gateway calls |
|---|---|
| ▶ Run Command Natively / ▶ Run Remaining / ✦ Draft Steps | `POST /api/chat {message, slot, agent}` into the task's slot, then poll `GET /api/chat/slots/{slot}` for `STEP RESULT [n]` markers (runs) or a fenced-JSON block (drafts) |
| Task Agent Session panel | SDK `ChatEmbed` (host component) — renders the same slot with streaming, markdown, tool cards, and inline Approve/Reject/Trust |
| 💬 Open in Chat | SDK `useChatLauncher().openChat({agent, message})` |
| 🧠 Memory Sync (task completes) | `POST /api/lessons {rule, category: "knowledge"}` — one lesson per task |
| ⏰ Schedule Routine | `POST /api/crons {name, message, cron: "0 9 * * 1-5", agent}` |
| Console status cards | `GET /api/status` |

## Gateway facts this app is built on (verified against KiroCrew source, 2026-08-24)

- **Gateway events do not reach installed-app pages yet**: `AppHost`'s `useAppEvents` bridge listens for `mc:app:{event}` CustomEvents, but the dashboard WS layer dispatches only `mc:app-reload`. Everything load-bearing here therefore **polls REST** (like `ChatEmbed` itself does). The app still subscribes to `notification` — harmless now, live the day forwarding ships.
- `permissions.events` entries are **scopes** (`notification`, `subagent:user`, `slots:user`…), not raw event names.
- REST cron create takes the schedule as `cron` (`handlers/cron.py`); the manifest's cron array uses `cron_expr`. The two spellings are not interchangeable.
- Lesson `category` is a fixed vocabulary: `tool | preference | knowledge` (`learn.py`).
- Bare `POST /api/spawn` hits the interactive spawn-approval gate with no way to approve from an app page — another reason runs go through the chat slot, where approval cards render inline.
- The host import map vendors `@kirocrew/app-sdk` **and `@kirocrew/ui`** (`shared-modules.ts`; the docs' `@kirocrew/app-sdk/ui` spelling is stale). Both are build externals.

Accepted tradeoff: task slots created via generic `POST /api/chat` are ordinary user sessions (visible in the dashboard session list, not app-owned). True app-owned slots need an in-gateway hooks backend — a possible later phase.

## Install on the work machine (Crew installed globally)

This folder is only the install *source* — Crew copies it to `~/.kiro/crew/apps/taskmaster-pro/` on install; nothing project-level is needed at runtime.

First-time verification: follow the step-by-step smoke-test run sheet in [`docs/work-machine-verification.md`](docs/work-machine-verification.md) (issue #19).

1. Copy this folder to the work machine (any path).
2. Install + enable (Gateway on default port 5476):
   ```bash
   curl -X POST http://localhost:5476/api/apps/install -H 'Content-Type: application/json' -d '{"source": "C:/path/to/taskmaster-pro"}'
   curl -X POST http://localhost:5476/api/apps/taskmaster-pro/enable
   ```
   Or `kirocrew app install C:/path/to/taskmaster-pro` + `kirocrew gateway restart`, or dashboard → App Store → Install from local path.
3. "Taskmaster" appears in the dashboard sidebar (route `/taskmaster-pro`, bolt icon from `ui/icon.svg`).
4. The daily `taskmaster-pro-selfheal` cron symlinks each skill folder (`skills/taskmaster-method`, `skills/write-concisely`) into `~/.kiro/crew/skills/` on its first run (the skill scanner only reads that flat namespace). To skip the wait, create the links/junctions manually.

`ui/dist/index.mjs` is **committed**, so no Node/npm is required on the work machine. Rebuild only when UI source changes: `cd ui && npm ci && npm run build`, then sanity-check with `node --check dist/index.mjs`. CI enforces this: it rebuilds on every push/PR and fails if the committed `ui/dist/index.mjs` doesn't match a fresh build.

## Local harness details

The dev harness aliases `@kirocrew/app-sdk` → `ui/dev/mockSdk.tsx` and `@kirocrew/ui` → `ui/dev/mockUi.tsx`: in-memory config seeded with the mockup's Tableau→SQL migration task, an in-memory chat-slot store with scripted taskmaster replies (~1.6 s: STEP RESULT reports for runs, fenced JSON for drafts, per-step markers for run-remaining), and a minimal `ChatEmbed` stand-in.

"Run Command Natively" sends into the task slot and auto-completes the step from the STEP RESULT marker; "Run Remaining" ticks steps off one by one (non-command steps come back `failed — needs Collin`); "Draft Steps with AI" appends four parsed micro-steps.

With a real gateway, use hot reload instead: `kirocrew app dev taskmaster-pro`.

## Contributing

1. Pick an eligible item from [`tasks.md`](.kiro/specs/taskmaster-pro/tasks.md) and respect its sequencing constraints.
2. Read [`AGENTS.md`](AGENTS.md) and the relevant requirement/design sections before editing.
3. Make a bounded change and preserve unrelated work already in the tree.
4. From `ui/`, run `npm run typecheck`, `npm test`, and `npm run build`; then run `node --check ui/dist/index.mjs` from the repository root and include the rebuilt bundle with any UI source change.
5. Update the canonical task status or record partial progress using the [tracking convention](.kiro/steering/task-tracking.md).

### Ponytail project adapters

Cursor and Kiro load the tracked Ponytail rules automatically. Codex discovers the pinned plugin
through [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json); its cache,
enablement, and mode state remain user-scoped, with [`AGENTS.md`](AGENTS.md) as the instruction
fallback. Claude Code registers the project marketplace after workspace trust; install
`ponytail@taskmaster-ponytail` once from `/plugin`. Both plugin sources are locked to Ponytail
`v4.9.0` commit `0a4dd63`. For Kiro, the actual content is tracked in-repo at the same pin: the
core rule is [`.kiro/steering/ponytail.md`](.kiro/steering/ponytail.md), and the five companion
skills (review, audit, debt, gain, help) are vendored under
[`.kiro/skills/`](.kiro/skills/) as `ponytail-*` skills.

## Doctrine

- **Isolation mode:** exactly one micro-step visible in Focus; the queue is one click away but never the default view.
- **The UI holds no shell.** Every command runs through the `taskmaster` agent's terminal tool inside the task's chat slot; the agent refuses destructive commands without explicit confirmation, and approvals render inline in the embedded session.
- **STEP RESULT is the contract.** Auto-completion only ever comes from the agent's `STEP RESULT [n]` line; a reply without one leaves the step for the manual toggle (graceful degradation, never guessing).
- **Memory sync is per task, not per step** — lessons store reusable solution paths, not activity logs.
- **Hallmark is not a runtime integration target.** It could be useful as an *external* contributor-side design exercise for a future UI polish pass, but the shipped app has one execution agent, a committed UI bundle, and no design-generation path in the product loop today.
- Sample data is the mockup's fictional migration task (generic `sqlcmd`, localhost). No Boeing names, servers, or data — deployment crosses to the work machine by Collin's hand only.
- **Cursor Automations** (prompts in [`.cursor/automations/`](.cursor/automations/)) are the cloud layer for CI, PR review, and spec/issue drift. They never run `kirocrew`, never talk to a gateway, and never touch work-machine state. Create them at [cursor.com/automations/new](https://cursor.com/automations/new); the files do not enable themselves.
