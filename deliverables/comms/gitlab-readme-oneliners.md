# GitLab consolidation — conversation opener + fallback headers

> **Superseded:** the conversation with Ryan happened. The current deliverable is the
> comparison + recommendation in `gitlab-consolidation-recommendation.md`. The fallback
> README headers below are still usable until the final decision is recorded.

**Goal tomorrow morning: a 10-minute conversation, not a merge.** You and a coworker built
the same thing in parallel; which repo survives is a joint call, not unilaterally yours.
The "due tomorrow" clock is self-imposed — if the conversation slips, apply the fallback
and move on.

## Conversation opener (3 bullets, say it in this order)

1. "I realized we built the same thing in parallel — my `Kiro_BI` and your `Kiro`. Nobody's
   fault, we just didn't know."
2. "I don't want to unilaterally merge over your work. Can we pick which one survives, or
   split what each is for?"
3. "10 minutes now, or I'll drop a one-line header on each README so nobody else gets
   confused, and we decide later."

## Fallback README headers (if the conversation doesn't happen)

Paste at the very top of each README:

**On `Kiro_BI`:**

> **Note:** This repo overlaps with `Kiro` (built in parallel, unaware of each other).
> Consolidation is being discussed — check with the maintainers before building on either.

**On `Kiro`** (offer this text to the coworker rather than editing their repo):

> **Note:** This repo overlaps with `Kiro_BI` (built in parallel, unaware of each other).
> Consolidation is being discussed — check with the maintainers before building on either.

## Decision to capture (whenever the conversation happens)

- Which repo survives (or what each one's distinct purpose is)
- Who migrates what, by roughly when
- One line in both READMEs recording the outcome

That's the whole item. Anything bigger than this is scope creep on a self-imposed deadline.
