// Pure data model + helpers for Taskmaster Pro. No React, no SDK — everything
// here is deterministic and unit-testable (work-cockpit doctrine: agent
// judgment stays out of this layer).

export interface Subtask {
  id: string
  title: string
  done: boolean
  /** Single safe non-interactive terminal command that performs the step. */
  command?: string
  /** Last execution report from the taskmaster agent. */
  output?: string
  /** Outcome of the last agent run (STEP RESULT marker). Absent = never run. */
  runState?: 'done' | 'failed'
  source?: 'manual' | 'agent'
}

export interface Task {
  id: string
  title: string
  estimateMinutes?: number
  createdAt: string
  subtasks: Subtask[]
  /** Guards the one-lesson-per-task memory sync against re-toggle spam. */
  lessonPosted?: boolean
  /** True once the task's chat slot has received a message (gates polling). */
  slotStarted?: boolean
}

/**
 * Chat-slot key for a task's agent session. Task ids embed a creation
 * timestamp, so the derived key never collides across delete/re-add (the
 * name-reuse trap spec-builder's ChatColumn documents).
 */
export function taskSlotKey(task: Pick<Task, 'id'>): string {
  return `taskmaster-${task.id}`
}

export interface Settings {
  memorySync: boolean
}

export interface TaskmasterConfig {
  version: 1
  settings: Settings
  activeTaskId: string | null
  tasks: Task[]
}

let uidCounter = 0

export function uid(prefix: string): string {
  uidCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${uidCounter.toString(36)}`
}

export function emptyConfig(): TaskmasterConfig {
  return { version: 1, settings: { memorySync: true }, activeTaskId: null, tasks: [] }
}

/** Defensive load: gateway config may be {}, null, or an older shape. */
export function normalizeConfig(raw: unknown): TaskmasterConfig {
  const base = emptyConfig()
  if (typeof raw !== 'object' || raw === null) return base
  const record = raw as Record<string, unknown>
  const tasks = Array.isArray(record.tasks)
    ? record.tasks.filter(isTaskLike).map(normalizeTask)
    : base.tasks
  const settings = (typeof record.settings === 'object' && record.settings !== null
    ? { memorySync: (record.settings as Record<string, unknown>).memorySync !== false }
    : base.settings)
  const activeTaskId = typeof record.activeTaskId === 'string' ? record.activeTaskId : null
  return {
    version: 1,
    settings,
    activeTaskId: tasks.some((task) => task.id === activeTaskId) ? activeTaskId : (tasks[0]?.id ?? null),
    tasks,
  }
}

function isTaskLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>).title === 'string'
}

function normalizeTask(record: Record<string, unknown>): Task {
  const subtasks = Array.isArray(record.subtasks)
    ? (record.subtasks as unknown[]).filter(isTaskLike).map((sub) => ({
        id: typeof sub.id === 'string' ? sub.id : uid('sub'),
        title: String(sub.title),
        done: sub.done === true,
        ...(typeof sub.command === 'string' && sub.command.trim() ? { command: sub.command } : {}),
        ...(typeof sub.output === 'string' && sub.output ? { output: sub.output } : {}),
        ...(sub.runState === 'done' || sub.runState === 'failed' ? { runState: sub.runState as 'done' | 'failed' } : {}),
        ...(sub.source === 'agent' || sub.source === 'manual' ? { source: sub.source as 'agent' | 'manual' } : {}),
      }))
    : []
  return {
    id: typeof record.id === 'string' ? record.id : uid('task'),
    title: String(record.title),
    ...(typeof record.estimateMinutes === 'number' && record.estimateMinutes > 0
      ? { estimateMinutes: Math.round(record.estimateMinutes) }
      : {}),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
    subtasks,
    ...(record.lessonPosted === true ? { lessonPosted: true } : {}),
    ...(record.slotStarted === true ? { slotStarted: true } : {}),
  }
}

export interface Progress {
  done: number
  total: number
  pct: number
}

export function progress(task: Task): Progress {
  const total = task.subtasks.length
  const done = task.subtasks.filter((sub) => sub.done).length
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function firstIncompleteIndex(task: Task): number {
  const index = task.subtasks.findIndex((sub) => !sub.done)
  return index === -1 ? Math.max(0, task.subtasks.length - 1) : index
}

export interface DraftStep {
  title: string
  command?: string
}

/**
 * Parse the taskmaster agent's breakdown reply: one fenced ```json block with
 * an array of {title, command?}. Falls back to the first [...] span. Returns
 * null when nothing parseable is found (caller logs the raw text instead).
 */
export function parseBreakdown(text: string): DraftStep[] | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text)
  const candidates: string[] = []
  if (fenced?.[1]) candidates.push(fenced[1])
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start !== -1 && end > start) candidates.push(text.slice(start, end + 1))
  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (!Array.isArray(parsed)) continue
      const steps = parsed
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title.trim() : '',
          ...(typeof item.command === 'string' && item.command.trim() ? { command: item.command.trim() } : {}),
        }))
        .filter((item) => item.title.length > 0)
        .slice(0, 12)
      if (steps.length > 0) return steps
    } catch {
      // try the next candidate
    }
  }
  return null
}

/** One lesson per completed task (never per step) — taskmaster-method doctrine. */
export function lessonFor(task: Task): string {
  const steps = task.subtasks.map((sub, index) => `${index + 1}. ${sub.title}${sub.command ? ` [${sub.command}]` : ''}`)
  return `Completed "${task.title}" via micro-steps: ${steps.join(' ')}`
}

// ---------------------------------------------------------------------------
// Chat-slot integration (GET /api/chat/slots/{slot} — the shape ChatEmbed
// consumes; verified against website/src/app-sdk/ChatEmbed.tsx).
// ---------------------------------------------------------------------------

export interface SlotMessage {
  role?: string
  content?: string
}

export interface SlotData {
  messages?: SlotMessage[]
  running?: boolean
  title?: string
}

/**
 * One in-flight agent request against a task's chat slot. `step` waits for a
 * single STEP RESULT marker, `all` collects markers until the turn ends, and
 * `draft` waits for a parseable breakdown.
 */
export interface PendingWork {
  taskId: string
  kind: 'step' | 'draft' | 'all'
  stepIndex?: number
  sentAt: number
}

export const PENDING_TIMEOUT_MS = 15 * 60 * 1000

export function isPendingTimedOut(work: PendingWork, now: number, timeoutMs = PENDING_TIMEOUT_MS): boolean {
  return now - work.sentAt > timeoutMs
}

export type SlotBaselineRead =
  | { status: 'loaded'; messageCount: number }
  | { status: 'missing' }
  | { status: 'failed' }

/** Recognize only explicit slot/HTTP 404s; generic network failures are unsafe. */
export function isExplicitNotFoundError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    if (record.status === 404 || record.statusCode === 404) return true
    if (typeof record.response === 'object' && record.response !== null) {
      if ((record.response as Record<string, unknown>).status === 404) return true
    }
  }
  const message = error instanceof Error ? error.message : String(error)
  return /(?:^|\D)404(?:\D|$)|slot not found/i.test(message)
}

/**
 * Resolve the pre-send transcript watermark. A known-missing slot is new and
 * safely starts at zero; an unknown read failure must abort the send rather
 * than risk replaying stale history. Null means "unsafe to send".
 */
export function baselineSlotWatermark(current: number | undefined, read: SlotBaselineRead): number | null {
  if (current !== undefined) return current
  if (read.status === 'loaded') return read.messageCount
  return read.status === 'missing' ? 0 : null
}

/** Object identity prevents a late poll from mutating a replacement request. */
export function isActivePendingWork(
  current: PendingWork | null,
  expected: PendingWork,
  stopped = false,
): boolean {
  return !stopped && current === expected
}

export function normalizeSlotData(raw: unknown): Required<Pick<SlotData, 'messages' | 'running'>> {
  if (typeof raw !== 'object' || raw === null) return { messages: [], running: false }
  const record = raw as Record<string, unknown>
  const messages = Array.isArray(record.messages)
    ? record.messages.filter((m): m is SlotMessage => typeof m === 'object' && m !== null)
    : []
  return { messages, running: record.running === true }
}

export interface StepResult {
  /** 1-based micro-step number from the marker. */
  index: number
  ok: boolean
  summary: string
}

const STEP_RESULT_RE = /^\s*STEP RESULT \[(\d+)\]:\s*(done|failed)\s*(?:[—–:-]\s*)?(.*)$/gim

/**
 * Parse every `STEP RESULT [n]: done|failed — summary` marker line out of an
 * agent reply (the taskmaster reply contract; run-remaining replies carry one
 * line per step). Returns [] when no marker is present.
 */
export function parseStepResults(text: string): StepResult[] {
  const results: StepResult[] = []
  STEP_RESULT_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = STEP_RESULT_RE.exec(text)) !== null) {
    results.push({
      index: Number.parseInt(match[1], 10),
      ok: match[2].toLowerCase() === 'done',
      summary: match[3].trim(),
    })
  }
  return results
}

const SLOT_OUTPUT_CAP = 4000

export type SlotPollAction =
  | { type: 'append-draft'; steps: DraftStep[] }
  | { type: 'step-result'; result: StepResult; output: string }
  | { type: 'unknown-step'; result: StepResult }
  | { type: 'turn-ended'; kind: PendingWork['kind']; output?: string }

export interface SlotPollDecision {
  /** Actions for App.tsx to translate into state, notifications, and logs. */
  actions: SlotPollAction[]
  /** Watermark after excluding any still-streaming final message. */
  nextSeen: number
  /** Carries reply detection across poll ticks. */
  sawReply: boolean
  /** True when this request should stop polling. */
  settled: boolean
  /** Used only for the existing success notification on a single-step run. */
  stepSucceeded: boolean
}

export interface SlotPollInput {
  work: PendingWork
  data: Required<Pick<SlotData, 'messages' | 'running'>>
  seen: number
  sawReply: boolean
  /** Null means the task disappeared while its request was in flight. */
  stepCount: number | null
}

/**
 * Decide what a single slot poll means without performing React or SDK side
 * effects. This preserves the shipped polling rules while making watermark,
 * streaming, parsing, settlement, and no-marker fallback behavior testable.
 */
export function evaluateSlotPoll(input: SlotPollInput): SlotPollDecision {
  const { work, data, seen, stepCount } = input
  const visible = data.running ? Math.max(0, data.messages.length - 1) : data.messages.length
  const fresh = data.messages.slice(seen, visible)
  const nextSeen = Math.max(seen, visible)

  // The old component callback settled immediately if its task disappeared.
  if (stepCount === null) {
    return { actions: [], nextSeen, sawReply: input.sawReply, settled: true, stepSucceeded: false }
  }

  const actions: SlotPollAction[] = []
  let sawReply = input.sawReply
  let settled = false
  let stepSucceeded = false

  for (const message of fresh) {
    if (message.role === 'user' || !message.content) continue
    sawReply = true
    const content = message.content

    if (work.kind === 'draft') {
      const steps = parseBreakdown(content)
      if (steps) {
        actions.push({ type: 'append-draft', steps })
        settled = true
      }
      continue
    }

    const results = parseStepResults(content)
    for (const result of results) {
      if (result.index < 1 || result.index > stepCount) {
        actions.push({ type: 'unknown-step', result })
        continue
      }
      const output =
        results.length === 1
          ? content.slice(0, SLOT_OUTPUT_CAP)
          : `${result.ok ? 'done' : 'failed'} — ${result.summary || '(no summary)'}`
      actions.push({ type: 'step-result', result, output })
      if (result.ok) stepSucceeded = true
      if (work.kind === 'step') settled = true
    }
  }

  // Single-step and draft requests preserve their early-settlement behavior.
  if (settled && work.kind !== 'all') {
    return { actions, nextSeen, sawReply, settled: true, stepSucceeded }
  }

  // A reply ended without the expected marker/JSON, or a run-all turn ended.
  if (!data.running && sawReply) {
    const lastReply = [...fresh].reverse().find((message) => message.role !== 'user' && message.content)
    actions.push({
      type: 'turn-ended',
      kind: work.kind,
      ...(work.kind === 'step' && lastReply?.content
        ? { output: lastReply.content.slice(0, SLOT_OUTPUT_CAP) }
        : {}),
    })
    settled = true
  }

  return { actions, nextSeen, sawReply, settled, stepSucceeded }
}
