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
