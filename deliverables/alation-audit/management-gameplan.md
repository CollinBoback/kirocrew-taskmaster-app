# Gameplan — Alation catalog AI-readiness audit (fill in and send)

Fill the blanks work-side, trim to taste, send as email/Slack to management. Keep it to one
screen. Real object counts and names get filled work-side only.

---

**Subject:** Alation catalog audit — plan to AI-ready by Dec 31

**The goal.** Audit and curate the SCFE Alation data catalog so that (a) customers can trust
it and (b) AI/LLM tools that read it for context answer correctly. Our chatbot failure
diagnosis showed catalog quality is the dominant failure lever — this is the fix, done
systematically.

**The standard.** A table is "AI-Ready" when its catalog entry is self-contained: business
meaning, every column defined with coded values spelled out, a confirmed steward, correct
trust flags, and documented keys/joins. Each entry is validated by a blind AI test — the
model must answer realistic questions from the entry alone.

**How we get there fast.** AI drafts the descriptions from schema and data profiles; a human
steward reviews and approves every entry before it's published (human-in-the-loop). New and
changed tables enter the same pipeline automatically, so the catalog stays accurate after
the audit ends (continuous curation).

**The plan.**

| Phase | What | Target date |
|---|---|---|
| 1 — Foundation | Standards, scoring, tracker, this plan | ✅ done __ /__ |
| 2 — Pilot | Curate __ critical tables end-to-end, validate with AI UAT | __ /__ |
| 3 — Execution | Work the remaining ~__ objects in priority waves | __ /__ → __ /__ |
| 4 — Sign-off | Final audit, 100% in-scope coverage, readiness report | **before Dec 31** |

**Current numbers (from the tracker).** __ in-scope objects; __% AI-Ready today; __% with a
confirmed steward. Targets: 100% / 100% at sign-off.

**What I need.** ~__ min per steward per owned table for review/approval; a decision on the
in-scope object list by __ /__ .

---

## Recurring status update (send every __ — reuse this block)

> **Alation audit — week of __ /__**
> - Coverage: __ /__ objects scored (__%), __ AI-Ready (__%), __ stewards confirmed (__%)
> - This week: ____
> - AI UAT: __ tables tested, __ passed
> - Blockers/asks: ____
> - On track for Dec 31: yes / at risk because ____
