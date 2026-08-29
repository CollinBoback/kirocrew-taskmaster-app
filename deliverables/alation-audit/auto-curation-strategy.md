# Auto-curation strategy — Continuous Curation + Human-in-the-Loop

How AI accelerates the audit without ever being the author of record. Two rules govern
everything below: **no AI draft is published without steward approval**, and **enumerated
values come from profiling the data, never from the model's imagination**.

## The loop (per table)

```
inventory export ──▶ AI draft ──▶ steward review ──▶ publish to Alation ──▶ AI UAT
     (work-side)      (LLM)        (human, STOP)       (endorsed)          (protocol)
```

1. **Inventory.** Export the object list + existing metadata from Alation into the tracker.
   Schema DDL, column samples/profiles, and (where available) top query patterns are the
   draft inputs — collected work-side, never committed here.
2. **AI draft.** The LLM drafts the D1/D2/D5 content (description, column definitions, keys
   and join notes) against `curation-standards.md`. Distinct-value profiles are pasted in so
   coded columns get their real enumerations. Drafts are marked as AI-generated.
3. **Human-in-the-loop review. ← STOP point.** The steward (or owner, for unowned tables)
   corrects business meaning, confirms caveats, and approves or rejects. An approved draft
   loses the AI-generated mark and gets the endorsement flag; a rejected draft goes back to
   step 2 with the correction as context.
4. **Publish.** Approved content is entered in Alation; tracker row updated (scores + status).
5. **Validate.** Phase 2 pilot tables (and spot-checks later) run through
   `ai-uat-protocol.md` to prove the published context actually works for an LLM.

## Continuous curation (keeping it accurate after the audit)

- **Change triggers:** new tables/columns and schema changes enter the tracker as new rows at
  score 0 — the audit's standards apply to them automatically, forever.
- **Drift sweep:** monthly, re-check a sample of endorsed tables; any entry contradicted by
  current schema or profile is demoted (endorsement removed) until re-reviewed.
- **Staleness rule:** steward confirmations expire after 12 months; expiry drops D3 to 1 and
  the table off the AI-Ready list until re-confirmed.
- **Feedback channel:** every AI UAT failure and every user-reported bad answer becomes a
  tracker row correction, not a one-off fix — same discipline as the memory-sync rule: one
  reusable lesson per failure.

## Guardrails

- The LLM proposes; the steward disposes. No write access to Alation for any automated step.
- No real data leaves the work environment: drafting happens with work-approved tooling only.
- Unresolvable business meaning is a **question for the steward**, recorded in the tracker
  `Notes` column — never a plausible-sounding guess.
