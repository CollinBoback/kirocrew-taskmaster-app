---
name: continuous-prompt-evaluation
description: "Use when evaluating prompt or agent-behavior changes with live conversation data. Runs a four-stage cycle (diagnose, design, test, evaluate), emphasizes evidence-based LLM judging, stable cohort assignment, and model-upgrade re-validation."
---

# Continuous Prompt Evaluation

Use this skill to evaluate prompt/configuration changes for agent quality with internal conversation evidence, not benchmark-only reasoning.

## Source and intent

This skill is based on the Kiro article:
"Continuous Prompt Evaluation: How We Use LLM Judges and Live Signals to Improve Kiro Agent Quality."

Purpose: convert the article's process into a practical, reusable workflow for this project.

## Core principles

- Prompt behavior is high-dimensional and cannot be exhaustively validated in advance.
- Benchmark scores are necessary but insufficient; include live workflow evidence.
- Judge outcomes must be evidence-backed from conversation text, not implied from hidden tool state.
- Small isolated cohorts are directional diagnostics; broader conclusions require larger follow-up comparisons.
- Prompt effects are model-dependent; re-validate after model upgrades.
- Remove outdated or brittle instructions to reduce prompt staleness.

## Four-stage evaluation cycle

Run this loop for each significant prompt/configuration candidate.

### 1) Diagnose

Goal: identify recurring quality complaints and tie them to specific prompt instructions (or missing instructions).

Checklist:
- Gather a recent traffic slice for the current baseline.
- Cluster high-frequency dissatisfaction/quality complaint patterns.
- For each cluster, identify likely contributing instruction(s) or omissions.
- Capture at least one concrete conversation example per major cluster.

Output:
- Ranked issue list by frequency/severity.
- Suspected prompt root cause for each issue.

### 2) Design

Goal: create targeted candidate changes with explicit expected behavior and regression risk.

Checklist:
- Write one candidate per diagnosed issue whenever possible.
- State intended behavior change in one sentence.
- State primary regression risk in one sentence.
- Keep candidate changes minimal and testable (avoid broad rewrites).

Output:
- Candidate set with traceability to diagnosed issues.

### 3) Test

Goal: isolate impact with cohort-based traffic comparisons.

Checklist:
- Keep a stable control cohort.
- Assign eligible users to stable buckets using deterministic identity hashing.
- Run isolated candidate cohorts; optionally run a combined-candidates cohort.
- Record sample sizes and experiment duration before interpreting deltas.

Interpretation rule:
- Treat undersized isolated cohorts as directional only.
- Use larger or follow-up cohorts for production-level conclusions.

### 4) Evaluate

Goal: compare cohorts using one shared rubric and decide ship/revise/reject.

Checklist:
- Apply the same judge rubric to control and all treatment cohorts.
- Compare explicit dissatisfaction rates and behavioral issue rates.
- Highlight category-level regressions (safety, verification, tone, behavior).
- Make one decision per candidate: ship, revise, or reject.

Decision guardrails:
- Do not ship based on anecdotes alone.
- If evidence is mixed, prefer revise/retest over broad rollout.

## Judge rubric requirements

Evaluate each conversation on two top-level signals:

1. Explicit dissatisfaction
- User explicitly expresses frustration, abandons task, or redoes agent work.
- Only count explicit evidence present in conversation text.

2. Behavioral quality issues
- Agent misses a quality standard (for example: incomplete task, unverified claims, repeated failing approach, style mismatch, destructive-action handling failures, poor tool choice, missing verification steps).

Scoring rule:
- Ambiguous conversations are neutral (do not force positive/negative labels).
- Apply identical criteria to all cohorts.

## Suggested quality dimensions

Use these as a default dimension set; adapt to project needs while preserving consistency across cohorts.

- Task completeness
- Claim accuracy via verification
- Project/style adherence
- Repeated unsuccessful approach recognition
- Destructive action caution
- Tool use appropriateness
- Verification behavior (tests/build/checks)
- Error-handling quality
- Context use quality
- Instruction-following precision
- Recovery after failed attempts
- Communication clarity
- Scope control (no over/under-solving)
- Safe autonomy on low-risk work
- Escalation on risky actions

## Model-upgrade re-validation

Every model change should trigger re-validation, even for previously successful prompt edits.

Run this sequence:
- Replay known complaint cases.
- Replay known successful cases as regression checks.
- Measure dissatisfaction, behavioral quality, regressions, and efficiency.
- Retune prompt/configuration before broad rollout.

Interpretation note:
- Smaller gains on newer baselines can still indicate positive impact (less headroom is expected).

## Practical operating template

When asked to run this process, produce a report in this format:

```markdown
# Continuous Prompt Evaluation Report

## Scope
- Baseline model/prompt:
- Candidate(s):
- Traffic window:
- Cohorts and sample sizes:

## Stage 1: Diagnose
- Top issue clusters:
- Root-cause prompt instructions/omissions:
- Representative conversation evidence:

## Stage 2: Design
- Candidate A:
  - Intended behavior:
  - Regression risk:
- Candidate B:
  - Intended behavior:
  - Regression risk:

## Stage 3: Test
- Cohort assignment method:
- Isolation/combined setup:
- Sample-size caveats:

## Stage 4: Evaluate
- Explicit dissatisfaction delta:
- Behavioral quality delta:
- Category-level regressions:
- Decision per candidate (ship/revise/reject):

## Re-validation plan
- Trigger conditions:
- Replay set:
- Metrics to compare:
```

## Constraints

- Do not treat benchmark-only improvement as sufficient evidence for shipping.
- Do not compare cohorts that were scored with different rubrics.
- Do not over-interpret low-sample directional cohorts.
- Do not assume a prompt change transfers unchanged across model versions.
