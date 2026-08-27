# Gameplan — source of truth

**Written 2026-08-26 evening.** Reasoning and how we got here: `GRILL-LOG-2026-08-26.md`.
This file is the plan only. Act from this one.

> ⚠️ This repo is public on GitHub. Gitignore this file and the grill log, or move them out.

---

## 🔥 IF YOU ONLY DO ONE THING TONIGHT

**Open Erin's spreadsheet. Add two columns — `Lever` and `Why`. Save.**

Everything below follows from that. It is the only work with a hard clock on it.

---

## TONIGHT — OTB chatbot diagnosis (~72 min, one block)

**Why this and nothing else:** in-person meeting at 10am tomorrow, Review + Working session.
Erin populated a sheet with ~20 test prompts and the chatbot's responses. It is currently unread.
**The deliverable is the diagnosis, not the dashboard.**

### The three levers (your framing)

1. **System prompt** — steer the bot better per interaction.
2. **Alation catalog quality** — better column definitions, nuances, enumerations on the SQL
   Server view the bot ingests, so the LLM can infer meaning.
3. **The SQL Server view** — different granularity, time span, or column set.

Out of scope: the underlying **schema** is fixed (external supplier). Advocate later; not
interesting for tomorrow.

### Steps

| # | Step | Time | Done when |
|---|---|---|---|
| 1 | Open Erin's sheet, add `Lever` + `Why`, save | 5 min | Columns exist, file saved |
| 2 | **Gut-call a lever number on all 20 rows. No prose.** | 15 min | Zero blank `Lever` cells |
| 3 | One line of `Why` per row | 20 min | Zero blank `Why` cells |
| 4 | Tally the counts per lever | 2 min | Three numbers written down |
| 5 | Write the three-sentence headline: the count, the dominant lever, the first move | 10 min | Three sentences exist |
| 6 | Mark one example row per lever to read aloud | 10 min | Three row numbers marked |
| 7 | Paste tally + headline wherever you'll present from | 10 min | Artifact openable at 10am |

**Step 2 is separate from step 3 on purpose.** Gut-tag all 20 before writing any prose, or you
will perfect row 1's explanation while rows 2–20 sit untouched. Speed first, words second.

### Rules for tonight

- **The tally is the argument.** "We should invest in catalog quality" is an opinion.
  "13 of 20 failures are lever 2" is a finding.
- **Do not touch the dashboard.** It is context for the meeting, not the deliverable.
- **Do not open the eval/context-engineering skills** (see gated item below).
- **Set your stop time before you open the spreadsheet**, not later while you're interested.

### Stretch — only after steps 1–7 are complete

Take one OTB column, write the improved Alation definition, and note the better answer it would
have produced on a specific failing row. One before/after is the most persuasive object you can
put in that room. Reaching for it before step 7 is the perfectionism stall wearing a tie.

---

## TOMORROW MORNING — before 10am

**GitLab `Kiro_BI` / `Kiro` — 10-minute conversation, not a merge.**

Cause is established: you and a coworker built the same thing in parallel, unaware. That makes it
a real consolidation — and **not unilaterally yours to merge.** Talk to them about which repo
survives. If the conversation slips, add a one-line header to each README saying what it is and
which to use, and move on. "Due tomorrow morning" is almost certainly self-imposed.

---

## TOMORROW 10am — the meeting

**Bring:** the annotated sheet, the tally, the three-sentence headline, three example rows.

**Say, in this order:**

1. **The finding.** "X of 20 failures trace to lever N."
2. **The precedent.** "We're already running this exact pattern — Alation as LLM context — on the
   Skylar/SCAI datasets. The OTB view is the same play." *In-flight precedent beats a backlog
   item; this is what makes lever 2 credible rather than aspirational.*
3. **The next cycle.** "For the next pass I want to score these systematically rather than by
   judgment." Stages 2–4 of your own `continuous-prompt-evaluation` skill are the method — the
   proposal is already written in `.kiro/skills/continuous-prompt-evaluation/SKILL.md`.

**Narrate rough edges out loud.** In a Review + Working session, a spoken caveat reads as
competence. An unfinished artifact you try to hide reads as failure.

---

## TOMORROW — after the meeting

**SEDW — tell Ryan the date.** He confirmed today it's still urgent and still blocking the other
team's SQL Server decom. The June target blew ~2 months ago; there is no date now because nobody
owned the pipeline. You own it. Nobody will hand you a date, so you set one:

> Ryan — since the June target slipped and there's no date now, I'll own one. I'll have the SEDW
> scope and a migration plan by **Wednesday, September 9**. If that works I'll take it to their
> team so they can re-plan the decom.

**Scope and plan by Sept 9 — not the migration.** You can't size the migration yet, and an
unhittable date restarts the stall.

**SCMODS Alation — fix the stale dates.** The Linear target of `2026-08-07` is wrong; the real
deadline is December. Four Urgent tickets have been generating false urgency for 19 days. Correct
the dates, then leave it alone. Alation work is *not* stalled — it's actively pointed at the
Skylar/SCAI datasets.

---

## Priority order

| Rank | Item | Clock | Next action |
|---|---|---|---|
| 1 | **OTB chatbot diagnosis** | 🔴 10am tomorrow | Steps 1–7, tonight |
| 2 | **GitLab consolidation** | 🟡 Self-imposed | 10-min conversation with coworker |
| 3 | **SEDW migration** | 🟠 **Sept 9** (self-set) | Tell Ryan the date |
| 4 | **SCMODS Alation** | 🟢 December | Fix stale Linear dates |
| 5 | **Taskmaster Pro** | ⚪ None | Product code only — see rules |

---

## Standing rules — next two weeks

1. **Taskmaster Pro: no commits to `.kiro/`, `.github/`, `.cursor/`, or `*.md`.** Product code
   only. The repo is currently ~3,260 lines of app against ~5,900 lines of scaffolding. If this
   rule feels painful, that confirms the diagnosis.
2. **Load the gun during the day, fire it at night.** Before you close out each workday, write one
   sentence: the exact first *physical action* for that evening's block. Not the task — the
   action. Your peak window is too expensive to spend deciding.
3. **Job work claims the first 30 minutes** of every evening block. Side projects open after.

---

## 📌 Gated — LLM eval / context-engineering exploration

**Status: parked, not cancelled. Your call to attempt it, made with the tradeoff stated.**

**Gate — both conditions:** steps 1–7 complete, **and** a wall-clock cutoff set *before* you open
the spreadsheet.

**Largely resolved already:** `.kiro/skills/continuous-prompt-evaluation/SKILL.md` (committed
2026-08-25) exists, and its **Stage 1 — Diagnose** is tonight's task verbatim: cluster the
failure patterns, tie each to a root cause, capture one concrete example per cluster, output a
ranked issue list. You already wrote the method. Stages 2–4 are tomorrow's pitch.

Take the *rubric discipline* from it — one shared rubric, evidence from response text only,
ambiguous cases stay neutral. Leave the cohort machinery (identity hashing, sample-size gates)
alone; it's built for Kiro-scale traffic, not 20 supplier prompts.

Other sources, if you still want to browse later:

- `~/.copilot/installed-plugins/awesome-copilot` (and `/context-engineering`,
  `/skills-for-copilot-studio`, `/ai-team-orchestration`)
- `.kiro/skills/` in this repo and in `.worktrees/codex-consolidate-main/`
- Possibly more current in Cursor Cloud Agent

---

## The rule underneath all of this

**External clocks drive your execution. Importance does not.**

OTB has 10am and people in a room → happening tonight. SCMODS has a vague "December" → six weeks
untouched. SEDW had no date at all → stalled longest. Taskmaster Pro has intrinsic pull and no
deadline → 36 commits in three days.

**Any important work without an external clock needs one manufactured, or it will not happen.**
That's why SEDW now has September 9 on it.

---

## Open / unresolved

- Your original enumeration skipped a **"#3"** — never established whether it exists. Check.
- OTB dashboard build state was deliberately never assessed. Fine for tomorrow; revisit after.
