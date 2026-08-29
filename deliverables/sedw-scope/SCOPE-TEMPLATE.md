# SEDW migration — scope, dependencies, approach, estimate, next action

**Status:** draft — fill in work-side, then copy the finished sections into
`../comms/sedw-assessment-share-message.md` for delivery to Ryan and the SMEDW team.
**Audience:** Ryan + SMEDW team. **Owner:** Collin. **Target delivery:** Wed Sep 9, 2026.

---

## 1. Technical complexity

_Summarize the pipeline inventory (see `pipeline-inventory-template.md`) into a narrative:
how many objects/jobs/feeds are in scope, what makes the hard ones hard (custom
transforms, undocumented logic, external-supplier schemas, etc.), and what's genuinely
routine._

- In-scope item count: `___`
- Breakdown by complexity — Low: `___` · Medium: `___` · High: `___`
- What drives the High-complexity items: `___`
- What's out of scope and why (e.g. externally-owned schema — not ours to migrate): `___`

## 2. Dependencies

_What has to happen, or be true, before migration work can start or finish. Both
technical (upstream feeds, shared jobs, other teams' pipelines) and organizational
(approvals, access, other teams' timelines)._

| Dependency | Type (technical/org) | Blocks | Status |
|---|---|---|---|
| `___` | `___` | `___` | `___` |

- Hardest/most uncertain dependency: `___`
- Anything blocking that isn't resolvable by this team alone: `___`

## 3. Recommended migration approach

_Pick one. State it as a decision, not a menu._

**Recommended approach:** `___`

**Why this one:** `___` (one paragraph — what it optimizes for: speed, risk, minimizing
disruption to the other team's decom timeline, etc.)

**Why not the alternatives** (one line each, only if genuinely considered):
- `___`

## 4. Estimate

**Range:** `___` (e.g. "N–M weeks of effort" or "N sprints") — not a single number.

**Assumption that breaks this estimate:** `___` (the thing that, if wrong, blows the range —
e.g. "assumes the upstream feed schema doesn't change mid-migration")

**Confidence:** Low / Medium / High — and why.

## 5. Next action

**The one thing that happens first:** `___`

**Owner:** `___` **By when:** `___`

**What unblocks after that:** `___` (what this next action enables, so Ryan/SMEDW can see
the sequence continues, not just the first step)

---

## Reviewer checklist before sending

- [ ] §3 names exactly one approach (not a comparison with no pick)
- [ ] §4 is a range with a stated breaking assumption (not false precision)
- [ ] §5 has a real owner and date (not "TBD")
- [ ] No real object/job names, ticket internals, or proprietary details leaked into this
      tracked file — those stay in the gitignored `*-filled` copy
