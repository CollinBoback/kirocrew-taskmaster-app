---
description: Generate a daily standup note from git history, tickets, and notes, then present it for review before posting.
---

# Standup Notes

Generate a concise daily standup note by analyzing available data sources, then present the draft for human review. Never post or save anywhere without approval.

Condensed from [wshobson/agents standup-notes](https://github.com/wshobson/agents/blob/main/plugins/team-collaboration/commands/standup-notes.md) (v2.0).

**Arguments (optional):** context about specific work areas, projects, or tickets to highlight. If empty, discover work automatically from the sources below.

## Step 1: Collect data

Use every source that is available in this session; skip gracefully (with a one-line note in the draft) when one is not.

1. **Git commits (always available):**
   - Identify the author: `git config user.name`.
   - `git log --author="<user>" --since="24 hours ago" --pretty=format:"%h|%s|%cr" --no-merges` (widen to 48h or "last friday" after weekends/holidays).
   - Parse messages for conventional-commit types (feat, fix, refactor, docs), ticket IDs (ABC-123, #456), and PR references.
2. **Issue tracker (Jira/Linear MCP, if connected):**
   - Completed: assigned to current user, moved to Done in the last day.
   - In progress: assigned, status In Progress.
   - Planned: assigned, To Do/Open with high priority.
3. **Notes vault (Obsidian MCP, if connected):** recent daily notes and `- [x]` task completions from the last 2 days; extract meeting outcomes and action items.
4. **Calendar (if connected):** today's meetings, for the Today section and capacity awareness.

Correlate across sources: link commits to tickets via ticket IDs in messages, and tickets to notes.

## Step 2: Analyze and summarize

- Group related commits into single accomplishment bullets (e.g. 5 auth commits become "Refactored auth module").
- Translate technical messages into delivered value: "Shipped user auth (ABC-123)", not "Worked on auth". Include impact when known.
- Order today's plans by priority: unblocking teammates first, then sprint commitments, production bugs, in-progress features, reviews, then new backlog work.
- Give each Today item a clear outcome and target ("Complete API integration by EOD", not "Work on API").
- Flag capacity issues: if meetings plus planned work exceed a realistic day, say so.
- Detect potential blockers: repeated commits attempting the same fix, no commits on a high-priority ticket, explicit blockers in notes or ticket comments.

## Step 3: Generate the note

Use this structure:

```markdown
# Standup - YYYY-MM-DD

## Yesterday

- [Delivered value] - [ticket/PR link]
- [Meeting outcomes or decisions]

## Today

- [Task with clear outcome] - [ticket] - [target, e.g. EOD]
- [Meetings: ...]

## Blockers / Notes

- [Blocker] - **Needs:** [specific action] - **From:** [@person/team]
- [Schedule notes, OOO, useful links]
```

Formatting rules:

- Bullets only, 1-2 lines each; link tickets/PRs/docs instead of explaining inline.
- Bold blockers and key asks; make every blocker actionable (specific request, named owner).
- Write "None" under Blockers when there are none; do not invent items.
- Distinguish hard blockers (work stopped) from soft ones (workaround exists). For a critical blocker add: blocked-since date, impact, what was tried, and the consequence if unresolved by a named date.
- Keep the tone human and direct; avoid vague words like "soon" or "eventually".
- If a target platform is named in the arguments (Slack, email, Obsidian), adapt formatting for it (e.g. Slack: bold section labels and emoji headers instead of markdown headings).

## Step 4: Review and follow-ups

1. Present the draft and state which sources were used and which were unavailable.
2. Ask the user to add context you cannot infer (conversations, priorities, soft-skills work) and to correct anything inaccurate.
3. Offer extracted follow-up tasks from the note (blockers to chase, promised deliverables with deadlines) as a short `- [ ]` checklist.
4. Only after explicit approval, post or save the note where the user directs.
