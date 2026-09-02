# Taskmaster Pro — design as built

Verified against source on 2026-08-25 at v0.2.0. This describes what exists, so that
`tasks.md` can reference concrete seams instead of hypothetical ones.

## Layering

| Layer | File | Character |
|---|---|---|
| Pure model | `ui/src/model.ts` | No React, no SDK. Types, `normalizeConfig`, `progress`, `firstIncompleteIndex`, `parseBreakdown`, `parseStepResults`, `normalizeSlotData`, `lessonFor`, `taskSlotKey`. Fully unit tested (35 cases). |
| Everything else | `ui/src/App.tsx` | ~1360 lines: React state, gateway calls, the slot-polling engine, all three views, and the inline style sheet. Untested. |
| Agent | `agents/taskmaster.json` | Four prompt-separated jobs: breakdown, run-one-step, run-remaining, routine check-in. |
| Doctrine | `skills/taskmaster-method/SKILL.md` | Breakdown rules, executable-step safety, the STEP RESULT contract, memory-sync convention. |

The layering is sound and the reason the model is well tested. The problem is where the
line was drawn: the slot engine is behaviour, not rendering, but it lives in `App.tsx`.

## Persistence

One JSON document, `GET`/`PUT /api/apps/taskmaster-pro/config`. Writes go through
`persist`, which chains saves on `saveChainRef` and stamps `saveRevisionRef` so a
superseded revision is skipped rather than written out of order. Reads go through
`normalizeConfig`, which tolerates `{}`, `null`, junk entries, and older shapes.

## The slot engine

This is the intricate part and the reason task 2 exists.

Every agent request becomes a message posted to the task's own chat slot
(`taskmaster-{task.id}`, keyed by the task's timestamped ID). A re-added task receives a
new ID and therefore a new slot, which avoids collisions with any transcript left behind
by the deleted task. Results are read back by polling `GET /api/chat/slots/{slot}` every
2500 ms. Gateway→app event forwarding does
not exist upstream yet — `AppHost`'s `useAppEvents` bridge has no WS producer — so polling
is the only working mechanism, the same one `ChatEmbed` uses.

State involved:

- `pending: Record<string, PendingWork>` — at most one in-flight request per task,
  tagged `kind: 'step' | 'draft' | 'all'`.
- `pendingRef[taskId]` — so async closures accept only the exact request object still
  owned by that task and never act on a superseded pending.
- `sendLockRef[taskId]` — closes the gap before React commits pending state, preventing
  two launches against one task without blocking another task.
- `seenRef[slot]` — a per-slot watermark of how many messages have already been parsed.
  Baselined *before* the first send so pre-existing transcript history, including old
  STEP RESULT lines, is never re-parsed.
- `sawReplyRef[taskId]` — whether an agent reply arrived for that task's request, used to
  distinguish "turn ended without the expected marker" from "nothing has happened yet".

One interval sweeps `pendingRef` and polls active task slots concurrently. For each exact
request, the pure slot engine trims the last message when `running` is true (it is still
streaming), slices `[seen, visible)`, advances the watermark, and returns actions for
`App.tsx` to apply. Settlement differs by kind: `step` settles on its first marker,
`draft` on its first parseable fenced-JSON block, and `all` never settles early — it
collects markers until the turn ends. Anything still pending after 15 minutes is dropped
with a warning.

`POST /api/chat` streams SSE for the whole turn, so the SDK's JSON parse rejects at turn
end. That `SyntaxError` is expected and swallowed; only real transport errors clear the
pending.

The slot decision rules are covered in `model.test.ts`. Per-task orchestration and the
React/network effects remain in `App.tsx`.

## Gateway integration

| Action | Call |
|---|---|
| Run step / run remaining / draft steps | `POST /api/chat {message, slot, agent}`, then poll `GET /api/chat/slots/{slot}` |
| Task agent session panel | SDK `ChatEmbed` on the same slot |
| Open in chat | SDK `useChatLauncher().openChat()` |
| Memory sync | `POST /api/lessons {rule, category: "knowledge"}` |
| Schedule routine | `POST /api/crons {name, cron, agent, message}` |
| Console status | `GET /api/status` |

Gateway facts the app depends on, all verified against KiroCrew source: `permissions.events`
entries are scopes rather than raw event names; REST cron create takes `cron` while the
manifest uses `cron_expr`; lesson `category` is the fixed vocabulary `tool | preference |
knowledge`; bare `POST /api/spawn` hits an approval gate with no way to approve from an app
page, which is why runs go through the chat slot where approval cards render inline.

## Build and distribution

`vite build` emits a single `ui/dist/index.mjs` (~49.6 kB) with `react`, `react-dom`,
`@kirocrew/app-sdk`, and `@kirocrew/ui` as externals supplied by the host import map. That
artifact is committed so the work machine needs no Node. Local development aliases the two
SDK packages to `ui/dev/mockSdk.tsx` and `ui/dev/mockUi.tsx`, which provide an in-memory
config and scripted agent replies.

The committed artifact is a deployment contract enforced by nothing but memory.

## Known intentional slack

`parseBreakdown` also accepts a bare JSON array as a fallback — it first tries to extract
a fenced-JSON block, and if none is found it attempts to parse the whole response as a
JSON array. This makes draft settlement permissive: any response that contains either a
fenced block or a top-level array settles a `draft` request, not just the agent's nominal
format. The parser caps a breakdown at 12 steps, while the skill and the agent prompt both
ask for 3–7; the cap is defensive, not a contradiction.

Hallmark-style design generation is deliberately out of band. It is a useful reference for
future contributor-led UI polish, but integrating it into the shipped app would add another
agent/skill surface to a product whose runtime loop is intentionally narrow: one execution
agent, one committed bundle, no live design-generation workflow, and no user problem in the
current focus/backlog/console flow that Hallmark solves by itself.
