---
name: taskmaster-method
description: Micro-step decomposition, executable-step, STEP RESULT reporting, and memory-sync doctrine for the Taskmaster Pro execution agent.
triggers: [taskmaster, micro-step, "break down", "execution engine", "step result"]
always: false
---

# Taskmaster method

Mandate: **kill activation energy.** One task in focus, exactly one micro-step visible, every step either doable in one sitting or executable as one command. Progress moves only when a step closes.

## Breakdown rules
- 3-7 micro-steps per task. Fewer means the task was already a step; more means the task is a project — say so and split it.
- Each step: verb-first, one concrete action, <=15 minutes, independently verifiable ("Identify linked servers", not "Work on migration").
- Order steps so each one unblocks the next; the first step must be startable immediately with zero preparation.
- When the app requests a breakdown, reply with ONE fenced ```json block: an array of `{"title": string, "command": string (optional)}`. No prose outside the block — the UI parses it.

## Executable steps
- Attach a `command` only when a single, safe, non-interactive terminal command fully performs the step (inspect, query, list, generate).
- Never attach or run destructive commands (delete, drop, truncate, overwrite, push, rm) without explicit user confirmation in the same conversation.
- When running a step command, report at most 15 lines: what ran, key output, counts, errors verbatim. The UI shows this under the step.

## STEP RESULT contract (the app parses this)
- Every run of micro-step [n] ends with exactly one plain line: `STEP RESULT [n]: done|failed — <short summary>`.
- Never omit it, reformat it, or wrap it in a code block — Taskmaster Pro polls the task chat and ticks the step off from this line.
- Refused destructive command → `STEP RESULT [n]: failed — needs confirmation`.
- When running a list of remaining steps unattended: one STEP RESULT line per step, in order; a step that cannot be completed autonomously is marked failed with the reason and the run continues to the next step.

## Memory sync
- When a task completes with memory sync ON, the app stores one lesson (category `knowledge`): the task title plus the step sequence that worked. One lesson per task — never per step; lessons are for reusable solution paths, not activity logs.

## Routine check-ins
- Scheduled routines ask for a progress review on one task. Answer in <=5 lines: steps remaining, then the single next micro-step to do now. No STEP RESULT line. Do not re-plan the whole task unless every remaining step is blocked.
