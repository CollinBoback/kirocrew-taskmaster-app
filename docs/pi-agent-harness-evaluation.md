# Pi agent harness evaluation

Linear: `COL-358`

**Decision:** Adapt Pi's lifecycle vocabulary and privacy-conscious telemetry design when
Taskmaster next needs run visibility or resumable execution. Do not add Pi as a runtime
dependency.

**Evidence date:** 2026-09-02. Pi source was inspected at commit
[`4e69b0c`](https://github.com/earendil-works/pi/tree/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057).
This was a source-trace experiment; no Pi package or provider was installed or executed.

## AgentHarness implementation status

Pi contains two materially different runtime surfaces at the inspected commit:

- The working `Agent` loop documented below.
- A proposed durable `AgentHarness` with lanes, operation IDs, sequence cursors, recovery
  state, replay policies, and typed outcomes.

The second surface is not operational yet. Its
[`AgentHarness`](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/src/harness/agent-harness.ts)
can attach only to an empty session; restore throws `HarnessNotImplemented`, and `prompt`,
`resume`, `abort`, queues, lanes, hooks, events, watches, and driving methods all reject as
unimplemented. The normative
[`harness.md`](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/docs/harness.md)
calls itself an implementation specification and gives a future build order whose first
slice deletes the current harness scaffold.

The proposed design is still useful evidence: one durable operation per lane, immutable
conversation entries, a total operation-state program counter, atomic settlement, explicit
safe/never tool replay, monotonic sequence cursors, and snapshot-plus-event observation are
strong contracts. They are patterns to study, not production capabilities to adopt today.

## Smallest useful experiment: source-trace one tool-using run

The trace follows `agent.prompt("Read config.json")` through
[`Agent`](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/src/agent.ts)
and
[`runAgentLoop`](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/src/agent-loop.ts#L96-L272),
then maps it to Taskmaster's current single-step path.

| Phase | Working Pi `Agent` | Taskmaster / KiroCrew |
|---|---|---|
| Admit work | `Agent.prompt()` rejects a second concurrent prompt, creates an abort controller, snapshots state, and emits `agent_start` → `turn_start` → user `message_start/end`. | `runCommand()` takes a per-task send lock, reads the task slot before sending, establishes a transcript watermark, creates `PendingWork`, and posts to `/api/chat`. |
| Ask the model | The loop transforms app messages, converts only LLM-compatible messages, and calls the selected provider through `streamFn`. Assistant deltas arrive as `message_update`; `message_end` is authoritative. | KiroCrew selects the model and streams the `taskmaster` agent turn. The app deliberately does not own provider credentials, model APIs, or context conversion. |
| Execute a tool | An assistant tool call produces `tool_execution_start`, optional updates, and `tool_execution_end`. Validated calls pass through `beforeToolCall`, execute sequentially or in parallel, then pass through `afterToolCall`. A tool-result message is appended before `turn_end`. | The taskmaster agent invokes the host terminal tool. `ChatEmbed` can show tool and approval cards, but the app page receives no tool-lifecycle events; its Console sees only send, poll, and final result state. |
| Finish the run | A second turn consumes the tool result. The final assistant message emits `message_start/update/end`, then `turn_end` and `agent_end`. Awaited subscribers are part of settlement. | The agent ends with `STEP RESULT [n]: done\|failed — summary`. The app polls the slot, excludes the still-streaming message, parses only fresh messages, applies the marker, persists task state, and stops polling. A missing marker leaves the step manual. |
| Persist / resume | The coding-agent layer appends every completed message to an append-only JSONL session tree on `message_end`. Entry IDs and `parentId` preserve branches; compaction changes model context without deleting full history. | KiroCrew's per-task chat slot is the transcript authority. Task state lives separately in app config. The app's pending request and watermark are memory-only, so a page reload safely baselines past history but does not resume an in-flight settlement. |

The Pi event sequence is more precise than Taskmaster's current observer surface:

```text
agent_start
  turn_start
    message_start/end (user)
    message_start/update/end (assistant tool call)
    tool_execution_start/update/end
    message_start/end (tool result)
  turn_end
  turn_start
    message_start/update/end (final assistant response)
  turn_end
agent_end
```

Pi's coding-agent layer persists completed messages inside that flow; Taskmaster currently
reconstructs progress from slot snapshots and its `STEP RESULT` business contract.

## Pattern assessment

| Focus | Assessment | Decision |
|---|---|---|
| State and tool lifecycle | Working Pi `Agent` separates completed messages from ephemeral `isStreaming`, partial message, pending tool IDs, queues, and abort state. Its ordered events make state transitions observable and testable. The proposed `AgentHarness` goes further with durable operation IDs and sequence cursors, but is not implemented. Taskmaster already applies the smaller distinction through `PendingWork`, `seenRef`, `sawReplyRef`, and pure `evaluateSlotPoll()`. | **Adapt the event vocabulary**, not either state container. |
| Runtime versus UX | `pi-ai` handles providers, `pi-agent-core` handles the loop, and `pi-coding-agent` adds tools, sessions, CLI/TUI, extensions, retry, and compaction. This decomposition is clean. Taskmaster's corresponding runtime is KiroCrew, while the app is a focused client over REST and `ChatEmbed`. | **Keep the existing boundary.** Adding Pi would create two runtimes. |
| Self-extensibility | Pi extensions can register tools, intercept calls/results, alter context, and contribute UI. Project resources require trust, but extension code runs with the Pi process's authority. KiroCrew agents and skills already provide the needed extension surface. | **Do not import the extension model.** It is broader than this product needs. |
| Telemetry | `pi-telemetry` uses explicit callback-scoped spans, typed domain schemas, no ambient global context, a no-op default, and adapter conformance tests. Its guidance excludes prompts, tool arguments/results, file contents, headers, credentials, and free-form errors from normal attributes. | **Adapt the privacy and schema rules** if Taskmaster adds run telemetry. |
| Provider abstraction | Pi providers own model catalogs, auth, and streaming behind a unified collection. That helps standalone clients switch providers. Taskmaster intentionally delegates all of this to the KiroCrew gateway. | **Reject here.** A second provider layer increases credential and failure surfaces. |
| Sessions and handoff | Append-only, branchable JSONL sessions make resume, fork, compaction, and extension-state recovery explicit. Taskmaster already gets durable conversation history from one KiroCrew slot per task, but app-side settlement cannot resume after reload. Its embedded chat shares the task slot; “Open in Chat” transfers only a summary to a new chat. | **Adapt stable run identity/cursors only;** do not duplicate transcripts. |

## Integrity gaps exposed by the mapping

These are existing Taskmaster follow-ups, not reasons to adopt Pi:

- A single-step poll accepts any marker index within the task's range, rather than requiring
  the requested `work.stepIndex`. A wrong-but-valid marker can settle the request and mutate
  a different step.
- The 15-minute timeout clears pending state without applying the abandoned-slot watermark
  quarantine used by **Stop Waiting**. A late timed-out reply can therefore become eligible
  for a later request.

Both belong in a separate product task with focused model tests before adding observability.

## Security criterion

Pi explicitly has no built-in filesystem, process, network, or credential restriction.
`beforeToolCall` can block a call, and the coding agent asks whether to trust project-local
resources, but neither is a capability sandbox. Pi's pinned
[containerization guidance](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/coding-agent/docs/containerization.md)
recommends isolating the whole process or routing tools into an external sandbox.

That is disqualifying for an in-process Taskmaster runtime. The current architecture keeps
execution in KiroCrew, where host tool approvals render in the embedded chat. The app
manifest's API allowlist and disabled direct network access constrain the app page only;
the KiroCrew terminal agent still runs with its host-granted authority. Current safety
therefore depends on gateway approvals plus the taskmaster agent's destructive-command
refusal, not on an app-level sandbox. Adding Pi in process would introduce another
host-authority runtime without improving that boundary. Any future Pi adoption would
require a separate threat model, sandbox, credential boundary, and approval path before
functional evaluation.

## Recommendation

1. Keep KiroCrew as the only runtime and keep `STEP RESULT` as the only business-state
   completion contract.
2. Harden that contract by requiring the requested step index and routing timeouts through
   the same stale-reply quarantine as manual cancellation.
3. When run visibility becomes prioritized, define a small typed Taskmaster event union
   (`request_started`, `reply_observed`, `step_result_applied`, `request_settled`,
   `request_failed`) and derive it from the existing send/poll path.
4. Persist a gateway-issued run ID or message cursor when KiroCrew exposes one. Use it to
   resume settlement after reload; keep the slot transcript authoritative.
5. If telemetry is then added, keep correlation IDs separate from low-cardinality dimensions
   such as phase, outcome, error class, duration buckets, and counts. Never record prompts,
   commands, tool output, file contents, credentials, or proprietary task text.

The bounded next experiment, if approved as a product task, is to extend the existing
send/poll action flow and tests: emit `request_started` during send, project reply/result
events from `evaluateSlotPoll()`, and cover cancellation and timeout outcomes. Render that
typed chronology in Console. This needs no Pi dependency or second reducer and does not
alter execution semantics.

## Sources

- [Pi repository README](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/README.md)
- [`pi-agent-core` lifecycle and events](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/README.md)
- [Proposed durable AgentHarness specification](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/docs/harness.md)
- [Current `AgentHarness` scaffold](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/agent/src/harness/agent-harness.ts)
- [Coding-agent session format](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/coding-agent/docs/session-format.md)
- [Coding-agent extension lifecycle](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/coding-agent/docs/extensions.md)
- [Coding-agent containerization guidance](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/coding-agent/docs/containerization.md)
- [Telemetry contract and data-safety guidance](https://github.com/earendil-works/pi/blob/4e69b0c28060f0f02fbe38bfa7c21a2e2eb25057/packages/telemetry/README.md)
