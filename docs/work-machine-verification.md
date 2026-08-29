# Work-machine install verification run sheet

> **Run this on the KiroCrew work machine only.** Never run these commands from the
> development environment — this repo is only the install source
> (`.kiro/steering/deploy-install.md`). This sheet supports
> [issue #19](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/19); paste the
> results template at the bottom into that issue when done.

Estimated time: **15–20 minutes**. Prerequisite: KiroCrew installed and the gateway
running (default port 5476). Fresh source copy of this repo hand-carried to the work
machine.

---

## Step 1 — Install + enable

**Do:** pick one of the three documented paths (README "Install on the work machine"):

```bash
# REST (gateway on default port)
curl -X POST http://localhost:5476/api/apps/install -H 'Content-Type: application/json' -d '{"source": "C:/path/to/taskmaster-pro"}'
curl -X POST http://localhost:5476/api/apps/taskmaster-pro/enable
```

```bash
# CLI alternative
kirocrew app install C:/path/to/taskmaster-pro
kirocrew gateway restart
```

Or dashboard → App Store → Install from local path.

**Pass:** install call succeeds; a copy exists at `~/.kiro/crew/apps/taskmaster-pro/`.

**If it fails:** enable is a **separate step** from install — the sidebar entry appears
only after enable or a gateway restart. Check the gateway is actually on 5476.

## Step 2 — Sidebar + all three views load

**Do:** open the dashboard. Click **Taskmaster** in the sidebar (route `/taskmaster-pro`,
bolt icon). Visit **Focus**, **Backlog**, and **Console**.

**Pass:** the entry is present and each of the three views renders without errors.

**If it fails:** no sidebar entry → step 1's enable/restart didn't happen. Views blank or
visibly stale → the installed copy's `ui/dist/index.mjs` is stale; re-copy a fresh source
checkout and reinstall (the gateway serves the committed bundle directly; a stale bundle
often shows no console/runtime error and may simply look like an older UI).

## Step 3 — Persistence across reload

**Do:** create a **throwaway task** plus one **micro-step**. Hard-reload the dashboard
(Ctrl+Shift+R / Cmd+Shift+R).

**Pass:** the task and step are still there. State lives at
`~/.kiro/crew/apps/taskmaster-pro/data/config.json` — the throwaway task should appear in
that file.

**If it fails:** check that `data/config.json` exists and is writable beside the installed
app copy.

## Step 4 — Run a harmless executable step

**Do:** give the throwaway step a harmless command (e.g. `echo hello`) and run it through
the **taskmaster agent** ("Run Command Natively" — the UI holds no shell; everything runs
via the agent's terminal tool inside the task's chat slot).

**Pass:** the run starts and `hello` appears in the embedded session output.

## Step 5 — `STEP RESULT` contract

**Do:** watch the embedded session from step 4.

**Pass:** the agent's reply contains a valid `STEP RESULT [n]` line **and** the step's
status updates automatically in the UI.

**If it fails:** a reply without a `STEP RESULT` line intentionally leaves the step for
the manual toggle (graceful degradation) — that is by design. But `echo hello` succeeding
*without* the step auto-completing means the marker or the completion wiring is broken:
capture the agent's exact reply text in your #19 comment.

## Step 6 — skills registered

**Do:** check Crew skills for `taskmaster-method` and `write-concisely`. The daily
`taskmaster-pro-selfheal` cron symlinks each folder under `skills/` into
`~/.kiro/crew/skills/` on its first run; to skip the wait, create the links/junctions
manually (repeat for each skill name):

```bash
# macOS/Linux
ln -s ~/.kiro/crew/apps/taskmaster-pro/skills/taskmaster-method ~/.kiro/crew/skills/taskmaster-method
ln -s ~/.kiro/crew/apps/taskmaster-pro/skills/write-concisely ~/.kiro/crew/skills/write-concisely
```

```powershell
# Windows (junctions)
cmd /c mklink /J "%USERPROFILE%\.kiro\crew\skills\taskmaster-method" "%USERPROFILE%\.kiro\crew\apps\taskmaster-pro\skills\taskmaster-method"
cmd /c mklink /J "%USERPROFILE%\.kiro\crew\skills\write-concisely" "%USERPROFILE%\.kiro\crew\apps\taskmaster-pro\skills\write-concisely"
```

**Pass:** both skills show up under Crew skills (the scanner only reads that flat
namespace).

## Step 7 — Report back

**Do:** delete the throwaway task, then comment on
[#19](https://github.com/CollinBoback/kirocrew-taskmaster-app/issues/19) using the
template below. Any mismatch between reality and `README.md` /
`.kiro/steering/deploy-install.md` must either be fixed or captured as a follow-up issue
before #19 closes.

---

## Results template (paste into #19)

```markdown
## Work-machine verification results (YYYY-MM-DD)

Install path used: REST / CLI / dashboard

| # | Check | Result |
|---|-------|--------|
| 1 | Install + enable | ✅ / ❌ |
| 2 | Sidebar + Focus/Backlog/Console load | ✅ / ❌ |
| 3 | Task + step survive reload | ✅ / ❌ |
| 4 | `echo hello` runs via agent | ✅ / ❌ |
| 5 | `STEP RESULT [n]` auto-updates step | ✅ / ❌ |
| 6 | `taskmaster-method` + `write-concisely` registered (selfheal / manual link) | ✅ / ❌ |

### Differences from README / deploy-install.md

- (none, or list each mismatch — fixed in <commit/PR> or filed as <issue>)
```
