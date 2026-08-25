import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { ChatEmbed, useAppApi, useAppEvents, useChatLauncher, useNavBadge, useNotify } from '@kirocrew/app-sdk'
import { MarkdownRenderer } from '@kirocrew/ui'
import type { DraftStep, PendingWork, SlotMessage, SlotPollAction, Subtask, Task, TaskmasterConfig } from './model'
import {
  baselineSlotWatermark,
  evaluateSlotPoll,
  firstIncompleteIndex,
  isActivePendingWork,
  isExplicitNotFoundError,
  isPendingTimedOut,
  lessonFor,
  normalizeConfig,
  normalizeSlotData,
  progress,
  rebaseSlotWatermark,
  taskSlotKey,
  uid,
} from './model'

const CONFIG_API = '/api/apps/taskmaster-pro/config'
const LOG_CAP = 200
// Gateway→app event forwarding is not implemented upstream yet (AppHost's
// subscribe bridge has no WS producer), so the working integration is REST
// polling of the task's chat slot — the same mechanism ChatEmbed uses.
const CONSOLE_MODE = 'notification scope · slot polling'
const POLL_MS = 2500

type View = 'focus' | 'backlog' | 'console'

interface LogEntry {
  ts: string
  level: 'info' | 'ok' | 'warn' | 'err'
  msg: string
}

interface GatewayStatus {
  version?: string
  uptime?: string | number
  provider?: string
  [key: string]: unknown
}

// Dashboard theme tokens with the mockup's dark slate palette as fallbacks.
// Emerald + indigo are Taskmaster brand accents and stay literal.
const T = {
  bg: 'var(--bg, #030712)',
  card: 'var(--card, #0b1329)',
  border: 'var(--border, #1e293b)',
  text: 'var(--text, #f1f5f9)',
  muted: 'var(--muted, #94a3b8)',
  focus: '#34d399',
  kiro: '#818cf8',
  warn: 'var(--warn, #d29922)',
  danger: 'var(--danger, #e5534b)',
}

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

function timeStamp(): string {
  return new Date().toTimeString().split(' ')[0]
}

export default function App() {
  const api = useAppApi()
  const notify = useNotify()
  const setNavBadge = useNavBadge()
  const { openChat } = useChatLauncher()

  const [config, setConfig] = useState<TaskmasterConfig | null>(null)
  const [view, setView] = useState<View>('focus')
  const [stepIdx, setStepIdx] = useState<Record<string, number>>({})
  const [log, setLog] = useState<LogEntry[]>([])
  const [gateway, setGateway] = useState<GatewayStatus | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEst, setNewTaskEst] = useState('')
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepCommand, setNewStepCommand] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [pending, setPending] = useState<Record<string, PendingWork>>({})

  const configRef = useRef<TaskmasterConfig | null>(null)
  configRef.current = config
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())
  const saveRevisionRef = useRef(0)
  const lessonPostingRef = useRef<Record<string, boolean>>({})
  /** Blocks a second send while the first request is baselining its slot. */
  const sendLockRef = useRef<Record<string, boolean>>({})
  // Async closures (send + poll tick) read these refs so they never act on a
  // stale pending after the state has moved on.
  const pendingRef = useRef<Record<string, PendingWork>>({})
  /** Per-slot watermark: how many slot messages have already been parsed. */
  const seenRef = useRef<Record<string, number>>({})
  /** Slots whose abandoned turn must finish before a new request can start. */
  const abandonedSlotsRef = useRef<Set<string>>(new Set())
  /** True once at least one agent reply arrived for the current pending. */
  const sawReplyRef = useRef<Record<string, boolean>>({})

  const beginPending = useCallback((work: PendingWork) => {
    // Update the ref synchronously so another click cannot start a second run
    // before React commits the state update.
    pendingRef.current[work.taskId] = work
    setPending((prev) => ({ ...prev, [work.taskId]: work }))
  }, [])

  const clearPending = useCallback((expected: PendingWork) => {
    if (pendingRef.current[expected.taskId] !== expected) return false
    // Invalidate in-flight poll/send continuations before scheduling render.
    delete pendingRef.current[expected.taskId]
    setPending((prev) => {
      const next = { ...prev }
      delete next[expected.taskId]
      return next
    })
    return true
  }, [])

  const addLog = useCallback((level: LogEntry['level'], msg: string) => {
    setLog((prev) => [{ ts: timeStamp(), level, msg }, ...prev].slice(0, LOG_CAP))
  }, [])

  const persist = useCallback(
    (next: TaskmasterConfig) => {
      setConfig(next)
      configRef.current = next
      const revision = ++saveRevisionRef.current
      saveChainRef.current = saveChainRef.current.then(async () => {
        if (revision !== saveRevisionRef.current) return
        try {
          await api.put(CONFIG_API, next)
        } catch (err) {
          addLog('warn', `Config save failed: ${String(err)}`)
        }
      })
    },
    [api, addLog],
  )

  const mutate = useCallback(
    (fn: (current: TaskmasterConfig) => TaskmasterConfig) => {
      const current = configRef.current
      if (current) persist(fn(current))
    },
    [persist],
  )

  const loadConfig = useCallback(
    (cancelled?: () => boolean) => {
      api
        .get(CONFIG_API)
        .then((raw) => {
          if (cancelled?.()) return
          setConfig(normalizeConfig(raw))
          setLoadError(null)
          addLog('info', 'Loaded task state from gateway app config.')
        })
        .catch((err) => {
          if (cancelled?.()) return
          setConfig(null)
          setLoadError(`Config load failed (${String(err)}) — retry to continue.`)
          addLog('warn', `Config load failed: ${String(err)}`)
        })
    },
    [api, addLog],
  )

  useEffect(() => {
    let cancelled = false
    loadConfig(() => cancelled)
    api
      .get('/api/status')
      .then((status) => {
        if (cancelled) return
        setGateway((typeof status === 'object' && status !== null ? status : {}) as GatewayStatus)
        addLog('ok', 'Connected to Kiro Crew gateway.')
      })
      .catch(() => {
        if (cancelled) return
        addLog('warn', 'Gateway status unavailable.')
      })
    addLog('info', `Console mode: ${CONSOLE_MODE} — gateway event forwarding to app pages is pending upstream.`)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConfig])

  const completeTaskSideEffects = useCallback(
    (task: Task) => {
      notify(`Task complete: ${task.title}`)
      addLog('ok', `Task "${task.title}" fully completed.`)
      const current = configRef.current
      if (!current?.settings.memorySync || task.lessonPosted || lessonPostingRef.current[task.id]) return
      lessonPostingRef.current[task.id] = true
      // Lesson categories are a fixed gateway vocabulary: tool | preference |
      // knowledge (learn.py). Solution paths are knowledge.
      api
        .post('/api/lessons', { rule: lessonFor(task), category: 'knowledge' })
        .then(() => {
          mutate((cfg) => ({
            ...cfg,
            tasks: cfg.tasks.map((item) => (item.id === task.id ? { ...item, lessonPosted: true } : item)),
          }))
          addLog('ok', 'Kiro Memory: appended solution path to lessons (category: knowledge).')
        })
        .catch((err) => addLog('warn', `Memory sync failed: ${String(err)}`))
        .finally(() => {
          delete lessonPostingRef.current[task.id]
        })
    },
    [api, notify, addLog, mutate],
  )

  const setStepState = useCallback(
    (taskId: string, subId: string, done: boolean, output?: string, runState?: Subtask['runState']) => {
      let completedTask: Task | null = null
      mutate((cfg) => {
        const tasks = cfg.tasks.map((task) => {
          if (task.id !== taskId) return task
          const subtasks = task.subtasks.map((sub) => {
            if (sub.id !== subId) return sub
            const next: Subtask = { ...sub, done, ...(output !== undefined ? { output } : {}) }
            // Manual toggles (no runState) clear any stale agent-run outcome.
            if (runState) next.runState = runState
            else delete next.runState
            return next
          })
          const next = { ...task, subtasks }
          const wasComplete = task.subtasks.length > 0 && task.subtasks.every((sub) => sub.done)
          const isComplete = subtasks.length > 0 && subtasks.every((sub) => sub.done)
          if (isComplete && !wasComplete) completedTask = next
          return next
        })
        return { ...cfg, tasks }
      })
      if (completedTask) completeTaskSideEffects(completedTask)
    },
    [mutate, completeTaskSideEffects],
  )

  // Future-proof, non-load-bearing: forwarding of gateway events to app pages
  // is pending upstream (AppHost bridge has no producer yet). When it lands,
  // notifications start appearing in the Console with no further change here.
  useAppEvents('notification', (event) => {
    const record = (typeof event === 'object' && event !== null ? event : {}) as Record<string, unknown>
    const title = typeof record.title === 'string' ? record.title : 'notification'
    const text = typeof record.text === 'string' ? record.text : ''
    addLog('info', `Gateway notification [${title}]: ${text.slice(0, 200)}`)
  })

  const appendDraftSteps = useCallback(
    (taskId: string, steps: DraftStep[]) => {
      mutate((cfg) => ({
        ...cfg,
        tasks: cfg.tasks.map((task) => {
          if (task.id !== taskId) return task
          const existing = new Set(task.subtasks.map((sub) => sub.title.toLowerCase()))
          const fresh: Subtask[] = steps
            .filter((step) => !existing.has(step.title.toLowerCase()))
            .map((step) => ({ id: uid('sub'), title: step.title, done: false, source: 'agent' as const, ...(step.command ? { command: step.command } : {}) }))
          return { ...task, subtasks: [...task.subtasks, ...fresh] }
        }),
      }))
      addLog('ok', `Taskmaster agent drafted ${steps.length} micro-step(s).`)
      notify(`Added ${steps.length} drafted micro-steps`)
    },
    [addLog, mutate, notify],
  )

  // -------------------------------------------------------------------------
  // Chat-slot engine (spec-builder pattern): every agent request is a message
  // to the task's own chat slot; results are read back by polling the slot —
  // the same REST surface ChatEmbed renders (POST /api/chat creates the slot
  // on first message; GET /api/chat/slots/{slot} returns {messages, running}).
  // -------------------------------------------------------------------------

  const fetchSlot = useCallback(
    async (slot: string) => normalizeSlotData(await api.get(`/api/chat/slots/${encodeURIComponent(slot)}`)),
    [api],
  )

  const setStepOutput = useCallback(
    (taskId: string, subId: string, output: string, runState?: Subtask['runState']) => {
      mutate((cfg) => ({
        ...cfg,
        tasks: cfg.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((sub) =>
                  sub.id === subId ? { ...sub, output, ...(runState ? { runState } : {}) } : sub,
                ),
              }
            : task,
        ),
      }))
    },
    [mutate],
  )

  async function sendToTaskSlot(task: Task, message: string, work: Omit<PendingWork, 'sentAt'>) {
    if (pendingRef.current[task.id] || sendLockRef.current[task.id]) return
    sendLockRef.current[task.id] = true
    const slot = taskSlotKey(task)
    // Baseline the watermark BEFORE sending so pre-existing transcript
    // history (old STEP RESULT lines included) is never re-parsed.
    const waitingForAbandonedTurn = abandonedSlotsRef.current.has(slot)
    if (seenRef.current[slot] === undefined || waitingForAbandonedTurn) {
      try {
        const slotData = await fetchSlot(slot)
        if (waitingForAbandonedTurn && slotData.running) {
          sendLockRef.current[task.id] = false
          addLog('info', 'The stopped agent turn is still running in chat; request was not sent.')
          notify('The previous agent turn is still finishing — retry after it ends')
          return
        }
        const historyLength = slotData.messages.length
        // A stopped turn may have appended after stopWaiting's snapshot. On
        // retry, rebase to the freshly loaded history before releasing the
        // abandoned guard, or that late reply could be parsed as this run's
        // result. Normal first-send baselining still preserves an existing
        // watermark so ordinary sends cannot rewind it.
        const baseline = waitingForAbandonedTurn
          ? rebaseSlotWatermark(seenRef.current[slot], historyLength)
          : baselineSlotWatermark(seenRef.current[slot], {
              status: 'loaded',
              messageCount: historyLength,
            })
        if (baseline === null) {
          sendLockRef.current[task.id] = false
          return
        }
        seenRef.current[slot] = baseline
        abandonedSlotsRef.current.delete(slot)
      } catch (err) {
        const explicitlyMissing = isExplicitNotFoundError(err)
        if (waitingForAbandonedTurn && !explicitlyMissing) {
          sendLockRef.current[task.id] = false
          addLog('info', `Could not verify that the stopped agent turn ended: ${String(err)}`)
          notify('Could not verify the previous agent turn — retry after it ends', { type: 'error' })
          return
        }
        const baseline = baselineSlotWatermark(
          seenRef.current[slot],
          explicitlyMissing ? { status: 'missing' } : { status: 'failed' },
        )
        if (baseline === null) {
          sendLockRef.current[task.id] = false
          addLog('warn', `Could not safely read task chat history; request was not sent: ${String(err)}`)
          notify('Could not verify task chat history — retry the run', { type: 'error' })
          return
        }
        seenRef.current[slot] = baseline
        abandonedSlotsRef.current.delete(slot)
      }
    }
    sawReplyRef.current[task.id] = false
    const nextWork = { ...work, sentAt: Date.now() }
    sendLockRef.current[task.id] = false
    beginPending(nextWork)
    if (!task.slotStarted) {
      mutate((cfg) => ({
        ...cfg,
        tasks: cfg.tasks.map((item) => (item.id === task.id ? { ...item, slotStarted: true } : item)),
      }))
    }
    // Fire-and-forget: POST /api/chat streams SSE for the whole agent turn, so
    // the SDK's JSON parse rejects at turn end (SyntaxError — expected, same as
    // ChatEmbed). Real transport errors clear the pending.
    api.post('/api/chat', { message, slot, agent: 'taskmaster' }).catch((err) => {
      if (err instanceof SyntaxError) return
      addLog('err', `Send to task slot failed: ${String(err)}`)
      notify('Could not reach the gateway', { type: 'error' })
      clearPending(nextWork)
    })
    addLog('info', `Sent to task slot ${slot}: ${message.split('\n')[0].slice(0, 120)}`)
  }

  async function stopWaiting(task: Task) {
    const work = pendingRef.current[task.id]
    if (!work || work.taskId !== task.id || !clearPending(work)) return
    const slot = taskSlotKey(task)
    abandonedSlotsRef.current.add(slot)
    // Keep all send entry points closed while the cancellation rebase reads a
    // final slot snapshot. The underlying agent turn may still be running.
    sendLockRef.current[task.id] = true
    addLog('warn', 'Stopped waiting for the agent; its turn may continue in the task chat.')
    notify('Stopped waiting — the agent may continue in the task chat')
    try {
      const slotData = await fetchSlot(slot)
      seenRef.current[slot] = rebaseSlotWatermark(seenRef.current[slot], slotData.messages.length)
    } catch {
      // The next send will retry the baseline while the abandoned-slot guard
      // prevents stale output from being accepted as a new request.
    } finally {
      sendLockRef.current[task.id] = false
    }
  }

  /** Translate pure slot-engine actions into React state, logs, and notices. */
  const applySlotActions = useCallback(
    (work: PendingWork, actions: SlotPollAction[]) => {
      for (const action of actions) {
        if (action.type === 'append-draft') {
          appendDraftSteps(work.taskId, action.steps)
          continue
        }
        if (action.type === 'unknown-step') {
          addLog('warn', `Agent reported STEP RESULT [${action.result.index}] but the task has no such step.`)
          continue
        }
        if (action.type === 'step-result') {
          const task = configRef.current?.tasks.find((item) => item.id === work.taskId)
          const sub = task?.subtasks[action.result.index - 1]
          if (!sub) continue
          if (action.result.ok) {
            setStepState(work.taskId, sub.id, true, action.output, 'done')
            addLog('ok', `Step ${action.result.index} completed by agent: ${action.result.summary || sub.title}`)
          } else {
            setStepOutput(work.taskId, sub.id, action.output, 'failed')
            addLog('warn', `Step ${action.result.index} failed: ${action.result.summary || '(no summary)'}`)
          }
          continue
        }
        if (action.kind === 'all') {
          addLog('ok', 'Agent finished the run — see per-step results above and the task chat.')
        } else if (action.kind === 'draft') {
          addLog('warn', 'Draft reply had no parseable json block — see the task chat.')
          notify('Agent reply was not parseable — see the task chat')
        } else {
          const task = configRef.current?.tasks.find((item) => item.id === work.taskId)
          const sub = work.stepIndex != null ? task?.subtasks[work.stepIndex] : undefined
          if (sub && action.output) setStepOutput(work.taskId, sub.id, action.output)
          addLog('warn', 'Agent reply had no STEP RESULT marker — step left for manual toggle.')
        }
      }
    },
    [addLog, appendDraftSteps, notify, setStepOutput, setStepState],
  )

  // Poll the pending tasks' slots until they settle, the agent turn
  // ends, or the timeout passes. Manual toggling always remains as fallback.
  useEffect(() => {
    let stopped = false
    const tick = async () => {
      const works = Object.values(pendingRef.current)
      if (works.length === 0) return
      
      for (const work of works) {
        if (stopped) return
        const slot = taskSlotKey({ id: work.taskId })
        if (!isActivePendingWork(pendingRef.current[work.taskId] ?? null, work, stopped)) continue
        if (isPendingTimedOut(work, Date.now())) {
          addLog('warn', 'Agent request timed out — check the task chat.')
          clearPending(work)
          continue
        }
        let data: { messages: SlotMessage[]; running: boolean }
        try {
          data = await fetchSlot(slot)
        } catch {
          continue // slot not created yet, or transient error — next tick retries
        }
        // A previous tick may have timed out/settled this request while this
        // fetch was in flight. Never let that stale response touch refs/state or
        // clear a newer request, even if it belongs to the same task.
        if (!isActivePendingWork(pendingRef.current[work.taskId] ?? null, work, stopped)) continue
        const seen = seenRef.current[slot] ?? 0
        const task = configRef.current?.tasks.find((item) => item.id === work.taskId)
        const decision = evaluateSlotPoll({
          work,
          data,
          seen,
          sawReply: sawReplyRef.current[work.taskId] ?? false,
          stepCount: task?.subtasks.length ?? null,
        })
        seenRef.current[slot] = decision.nextSeen
        sawReplyRef.current[work.taskId] = decision.sawReply
        applySlotActions(work, decision.actions)
        if (decision.settled) {
          if (work.kind === 'step' && decision.stepSucceeded) {
            notify('Step completed via taskmaster agent', { type: 'success' })
          }
          clearPending(work)
        }
      }
    }
    const timer = setInterval(() => void tick(), POLL_MS)
    void tick()
    return () => {
      stopped = true
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  function runCommand(task: Task, sub: Subtask, index: number) {
    if (!sub.command || pendingRef.current[task.id] || sendLockRef.current[task.id]) return
    addLog('info', `Kiro terminal execute (step ${index + 1}): ${sub.command}`)
    void sendToTaskSlot(
      task,
      `Run micro-step [${index + 1}] of task "${task.title}": ${sub.title}\nExecute this terminal command and report concise output:\n${sub.command}\nEnd your reply with exactly one line: STEP RESULT [${index + 1}]: done|failed — <short summary>`,
      { taskId: task.id, kind: 'step', stepIndex: index },
    )
  }

  function draftSteps(task: Task) {
    if (pendingRef.current[task.id] || sendLockRef.current[task.id]) return
    const existing = task.subtasks.map((sub) => sub.title).join('; ') || 'none'
    addLog('info', `Requesting micro-step breakdown for "${task.title}".`)
    notify('Taskmaster agent is drafting micro-steps…')
    void sendToTaskSlot(
      task,
      `Break the task "${task.title}"${task.estimateMinutes ? ` (~${task.estimateMinutes}m)` : ''} into micro-steps per the taskmaster-method skill. Reply with ONE fenced json code block containing an array of {"title", "command"?} objects and no prose outside it.\nExisting steps (do not duplicate): ${existing}`,
      { taskId: task.id, kind: 'draft' },
    )
  }

  function runRemaining(task: Task) {
    if (pendingRef.current[task.id] || sendLockRef.current[task.id]) return
    const remaining = task.subtasks
      .map((sub, index) => ({ sub, index }))
      .filter(({ sub }) => !sub.done)
    if (remaining.length === 0) return
    const listing = remaining
      .map(({ sub, index }) => `[${index + 1}] ${sub.title}${sub.command ? ` — command: ${sub.command}` : ''}`)
      .join('\n')
    addLog('info', `Running ${remaining.length} remaining step(s) unattended via taskmaster agent.`)
    notify(`Agent is running ${remaining.length} remaining step(s)…`)
    void sendToTaskSlot(
      task,
      `Execute the remaining micro-steps of task "${task.title}" in order, autonomously:\n${listing}\nAfter finishing each step output one line: STEP RESULT [n]: done|failed — <short summary>. If a step cannot be completed autonomously, mark it failed with the reason and continue to the next.`,
      { taskId: task.id, kind: 'all' },
    )
  }

  function openTaskInChat(task: Task) {
    const remaining = task.subtasks.filter((sub) => !sub.done).map((sub) => sub.title)
    openChat({
      agent: 'taskmaster',
      message: `Check in on task "${task.title}". Remaining micro-steps: ${remaining.join('; ') || 'none'}. Help me with the next one.`,
    })
  }

  async function scheduleRoutine(task: Task) {
    try {
      // REST cron create takes the schedule under `cron` (manifest crons use
      // cron_expr; the REST body key differs — handlers/cron.py).
      await api.post('/api/crons', {
        name: `taskmaster-${task.id}`,
        cron: '0 9 * * 1-5',
        agent: 'taskmaster',
        message: `Taskmaster routine check-in on task "${task.title}". Review current progress and report the single next micro-step.`,
      })
      addLog('ok', `Cron registered: weekday 09:00 routine check-in on "${task.title}".`)
      notify('Routine scheduled — weekdays 09:00')
    } catch (err) {
      addLog('err', `Cron registration failed: ${String(err)}`)
      notify('Could not register the cron')
    }
  }

  function addTask() {
    const title = newTaskTitle.trim()
    if (!title) return
    const estimate = Number.parseInt(newTaskEst, 10)
    const task: Task = {
      id: uid('task'),
      title,
      ...(Number.isFinite(estimate) && estimate > 0 ? { estimateMinutes: estimate } : {}),
      createdAt: new Date().toISOString(),
      subtasks: [],
    }
    mutate((cfg) => ({ ...cfg, tasks: [...cfg.tasks, task], activeTaskId: cfg.activeTaskId ?? task.id }))
    setNewTaskTitle('')
    setNewTaskEst('')
    addLog('info', `Task added to backlog: "${title}"`)
  }

  function addStep(task: Task) {
    const title = newStepTitle.trim()
    if (!title) return
    const command = newStepCommand.trim()
    const sub: Subtask = { id: uid('sub'), title, done: false, source: 'manual', ...(command ? { command } : {}) }
    mutate((cfg) => ({
      ...cfg,
      tasks: cfg.tasks.map((item) => (item.id === task.id ? { ...item, subtasks: [...item.subtasks, sub] } : item)),
    }))
    setNewStepTitle('')
    setNewStepCommand('')
  }

  function deleteTask(taskId: string) {
    mutate((cfg) => {
      const tasks = cfg.tasks.filter((task) => task.id !== taskId)
      return { ...cfg, tasks, activeTaskId: cfg.activeTaskId === taskId ? (tasks[0]?.id ?? null) : cfg.activeTaskId }
    })
    setConfirmDelete(null)
    addLog('info', 'Task removed from backlog.')
  }

  function focusTask(taskId: string) {
    mutate((cfg) => ({ ...cfg, activeTaskId: taskId }))
    setView('focus')
  }

  const activeTask = useMemo(() => {
    if (!config) return null
    return config.tasks.find((task) => task.id === config.activeTaskId) ?? config.tasks[0] ?? null
  }, [config])

  const activeIdx = activeTask
    ? Math.max(
        0,
        Math.min(stepIdx[activeTask.id] ?? firstIncompleteIndex(activeTask), Math.max(0, activeTask.subtasks.length - 1)),
      )
    : 0
  const activeSub = activeTask?.subtasks[activeIdx] ?? null
  const activeProgress = activeTask ? progress(activeTask) : null
  const remainingCount = activeTask ? activeTask.subtasks.filter((sub) => !sub.done).length : 0

  useEffect(() => {
    try {
      setNavBadge(remainingCount)
    } catch {
      // badge is a nicety; never let it break the app
    }
  }, [remainingCount, setNavBadge])

  function jumpStep(taskId: string, index: number) {
    setStepIdx((prev) => ({ ...prev, [taskId]: index }))
  }

  if (!config) {
    return (
      <div style={{ ...styles.root, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
          <span style={{ color: T.muted, fontSize: 13 }}>{loadError ?? 'Loading Taskmaster Pro…'}</span>
          {loadError ? (
            <button className="tm-btn" style={styles.primaryBtn} onClick={() => loadConfig()}>
              Retry load
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  const backlogCount = config.tasks.length
  const memorySync = config.settings.memorySync

  let body: ReactElement
  switch (view) {
    case 'focus':
      body = renderFocus()
      break
    case 'backlog':
      body = renderBacklog()
      break
    case 'console':
      body = renderConsole()
      break
    default: {
      const exhaustive: never = view
      throw new Error(`Unhandled view: ${String(exhaustive)}`)
    }
  }

  function renderTabs() {
    const tabs: Array<{ id: View; label: string }> = [
      { id: 'focus', label: '★ Focus' },
      { id: 'backlog', label: `Backlog (${backlogCount})` },
      { id: 'console', label: 'Console' },
    ]
    return (
      <div style={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="tm-btn"
            style={{ ...styles.tab, ...(view === tab.id ? styles.tabActive : {}) }}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  function renderAddTaskForm() {
    return (
      <div style={styles.addRow}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="New task title…"
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addTask()
          }}
        />
        <input
          style={{ ...styles.input, width: 74 }}
          placeholder="~min"
          inputMode="numeric"
          value={newTaskEst}
          onChange={(event) => setNewTaskEst(event.target.value)}
        />
        <button className="tm-btn" style={styles.btnPrimary} onClick={addTask}>
          ADD TASK
        </button>
      </div>
    )
  }

  function renderFocus() {
    if (!activeTask) {
      return (
        <section className="tm-card" style={{ ...styles.card, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>No task in focus</div>
          <p style={{ color: T.muted, fontSize: 12, margin: '6px 0 14px' }}>
            Add your first task — the taskmaster agent can draft its micro-steps.
          </p>
          {renderAddTaskForm()}
        </section>
      )
    }
    const task = activeTask
    const prog = activeProgress ?? { done: 0, total: 0, pct: 0 }
    const slotKey = taskSlotKey(task)
    const taskPending = pending[task.id] ?? null
    const running = Boolean(activeSub && taskPending?.kind === 'step' && taskPending.stepIndex === activeIdx)
    const drafting = taskPending?.kind === 'draft'
    const runningAll = taskPending?.kind === 'all'
    return (
      <>
        <section className="tm-card" style={{ ...styles.card, paddingTop: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={styles.gradientStrip} />
          <div style={styles.centerCol}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ ...styles.chip, color: T.focus, borderColor: 'rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.08)' }}>
                ★ TASKMASTER ACTIVE
              </span>
              <button
                className="tm-btn"
                style={{
                  ...styles.chip,
                  cursor: 'pointer',
                  ...(memorySync
                    ? { color: T.kiro, borderColor: 'rgba(129,140,248,0.35)', background: 'rgba(129,140,248,0.08)' }
                    : { color: T.muted, borderColor: T.border, background: 'transparent' }),
                }}
                title="One lesson is stored per completed task when ON"
                onClick={() => mutate((cfg) => ({ ...cfg, settings: { memorySync: !cfg.settings.memorySync } }))}
              >
                🧠 MEMORY SYNC: {memorySync ? 'ON' : 'OFF'}
              </button>
            </div>
            <p style={{ color: T.muted, fontSize: 11, fontStyle: 'italic', margin: '10px 0 6px' }}>
              Isolation mode active. Execute one step at a time.
            </p>
            <h2 style={styles.taskTitle}>{task.title}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {task.estimateMinutes != null && (
                <span style={{ ...styles.chip, color: '#38bdf8', borderColor: T.border, fontFamily: MONO }}>~{task.estimateMinutes}m</span>
              )}
              <button className="tm-btn" style={{ ...styles.chip, cursor: 'pointer', color: T.text, borderColor: T.border }} onClick={() => void scheduleRoutine(task)}>
                ⏰ SCHEDULE ROUTINE (CRON)
              </button>
              <button className="tm-btn" style={{ ...styles.chip, cursor: 'pointer', color: T.text, borderColor: T.border }} onClick={() => openTaskInChat(task)}>
                💬 OPEN IN CHAT
              </button>
            </div>
          </div>
          <div style={styles.progressTrack} role="progressbar" aria-valuenow={prog.pct} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ ...styles.progressFill, width: `${prog.pct}%` }} />
          </div>
          <div style={{ textAlign: 'right', color: T.muted, fontSize: 11, marginTop: 6, fontFamily: MONO }}>
            {prog.done}/{prog.total} · {prog.pct}%
          </div>
        </section>

        <section className="tm-card" style={{ ...styles.card, borderColor: 'rgba(52,211,153,0.3)' }}>
          <div style={styles.stepHeader}>
            <span style={{ ...styles.stepCounter, color: T.focus }}>
              <span className="tm-pulse" style={styles.pulseDot} />
              {task.subtasks.length === 0
                ? 'NO MICRO-STEPS YET'
                : `ACTIVE MICRO-STEP ${activeIdx + 1} OF ${task.subtasks.length}`}
            </span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {taskPending && (
                <button
                  className="tm-btn"
                  style={{ ...styles.btnGhost, color: T.danger, borderColor: 'rgba(229,83,75,0.45)' }}
                  title="Stops Taskmaster waiting; the underlying agent turn may continue in the task chat."
                  aria-label="Stop waiting for the agent run"
                  onClick={() => void stopWaiting(task)}
                >
                  STOP WAITING
                </button>
              )}
              <button className="tm-btn" style={styles.navBtn} onClick={() => jumpStep(task.id, Math.max(0, activeIdx - 1))}>
                ◄
              </button>
              <button
                className="tm-btn"
                style={styles.navBtn}
                onClick={() => jumpStep(task.id, Math.min(task.subtasks.length - 1, activeIdx + 1))}
              >
                ►
              </button>
            </span>
          </div>

          {activeSub ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <button
                className="tm-btn"
                style={styles.checkBtn}
                aria-label={activeSub.done ? 'Mark step incomplete' : 'Mark step complete'}
                onClick={() => setStepState(task.id, activeSub.id, !activeSub.done)}
              >
                {activeSub.done ? (
                  <span style={{ ...styles.checkCircle, background: 'rgba(52,211,153,0.18)', borderColor: 'rgba(52,211,153,0.5)', color: T.focus }}>✓</span>
                ) : (
                  <span style={{ ...styles.checkCircle, borderColor: '#475569', color: 'transparent' }}>✓</span>
                )}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: '2px 0 10px',
                    fontSize: 16,
                    fontWeight: 600,
                    ...(activeSub.done ? { textDecoration: 'line-through', color: T.muted } : {}),
                  }}
                >
                  {activeSub.title}
                </h3>

                {activeSub.command && (
                  <div style={styles.commandBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={styles.commandLabel}>KIRO TERMINAL EXECUTABLE</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {activeSub.runState === 'failed' && !running && (
                          <span style={{ ...styles.execChip, ...styles.failedChip }}>LAST RUN FAILED</span>
                        )}
                        <span style={{ ...styles.commandLabel, color: T.kiro }}>VIA TASKMASTER AGENT</span>
                      </span>
                    </div>
                    <code style={styles.commandCode}>{activeSub.command}</code>
                    <div>
                      <button
                        className="tm-btn"
                        style={{
                          ...styles.btnPrimary,
                          ...(activeSub.done ? { opacity: 0.5, cursor: 'default' } : {}),
                          ...(running ? { background: 'rgba(129,140,248,0.25)', color: T.kiro } : {}),
                        }}
                        disabled={activeSub.done || Boolean(taskPending)}
                        onClick={() => runCommand(task, activeSub, activeIdx)}
                      >
                        {running
                          ? '⚙ EXECUTING VIA AGENT…'
                          : activeSub.done
                            ? '✓ COMPLETED'
                            : activeSub.runState === 'failed'
                              ? '↻ RETRY VIA AGENT'
                              : '▶ RUN COMMAND NATIVELY'}
                      </button>
                    </div>
                    {(running || activeSub.output) && (
                      <div
                        style={{
                          ...styles.outputPre,
                          // Always longhand: toggling borderColor against the
                          // shorthand `border` triggers a React style warning.
                          borderColor: activeSub.runState === 'failed' && !running ? 'rgba(229,83,75,0.45)' : T.border,
                        }}
                      >
                        {running ? (
                          `$ ${activeSub.command}\n… taskmaster agent is executing — the reply lands here and in the task chat below`
                        ) : (
                          <MarkdownRenderer content={activeSub.output ?? ''} />
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p style={{ color: T.muted, fontSize: 11, marginTop: 10 }}>Focus purely on completing this single micro-step.</p>
              </div>
            </div>
          ) : (
            <p style={{ color: T.muted, fontSize: 12 }}>
              No micro-steps yet — add one, or let the taskmaster agent draft the breakdown.
            </p>
          )}

          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 18, paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
              <span style={styles.queueLabel}>
                ALL SUBTASKS ({prog.done}/{prog.total} COMPLETED)
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                <button
                  className="tm-btn"
                  style={{ ...styles.btnGhost, ...(drafting ? { color: T.kiro } : {}) }}
                  disabled={Boolean(taskPending)}
                  onClick={() => draftSteps(task)}
                >
                  {drafting ? '⚙ AGENT DRAFTING…' : '✦ DRAFT STEPS WITH AI'}
                </button>
                <button
                  className="tm-btn"
                  style={{ ...styles.btnGhost, ...(runningAll ? { color: T.kiro } : { color: T.focus, borderColor: 'rgba(52,211,153,0.3)' }) }}
                  disabled={Boolean(taskPending) || remainingCount === 0}
                  onClick={() => runRemaining(task)}
                >
                  {runningAll ? '⚙ AGENT RUNNING STEPS…' : `▶ RUN REMAINING (${remainingCount})`}
                </button>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {task.subtasks.map((sub, index) => {
                const isActive = index === activeIdx
                return (
                  <div
                    key={sub.id}
                    style={{ ...styles.queueRow, ...(isActive ? styles.queueRowActive : {}) }}
                    onClick={() => jumpStep(task.id, index)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <button
                        className="tm-btn"
                        style={styles.queueCheck}
                        aria-label={sub.done ? 'Mark incomplete' : 'Mark complete'}
                        onClick={(event) => {
                          event.stopPropagation()
                          setStepState(task.id, sub.id, !sub.done)
                        }}
                      >
                        {sub.done ? <span style={{ color: T.focus, fontWeight: 700 }}>✓</span> : <span style={{ color: '#475569' }}>○</span>}
                      </button>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 12, ...(sub.done ? { textDecoration: 'line-through', color: T.muted } : {}) }}>{sub.title}</span>
                        <span style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          {sub.runState === 'failed' && !sub.done && <span style={{ ...styles.execChip, ...styles.failedChip }}>FAILED</span>}
                          {sub.command && !sub.done && <span style={styles.execChip}>EXECUTABLE</span>}
                          {sub.source === 'agent' && <span style={{ ...styles.execChip, color: T.kiro, borderColor: 'rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.08)' }}>AGENT-DRAFTED</span>}
                        </span>
                      </span>
                    </span>
                    {isActive && <span style={styles.activeChip}>ACTIVE</span>}
                  </div>
                )
              })}
            </div>
            <div style={{ ...styles.addRow, marginTop: 10 }}>
              <input
                style={{ ...styles.input, flex: 2 }}
                placeholder="Add micro-step…"
                value={newStepTitle}
                onChange={(event) => setNewStepTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addStep(task)
                }}
              />
              <input
                style={{ ...styles.input, flex: 3, fontFamily: MONO, fontSize: 11 }}
                placeholder="optional terminal command"
                value={newStepCommand}
                onChange={(event) => setNewStepCommand(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addStep(task)
                }}
              />
              <button className="tm-btn" style={styles.btnGhost} onClick={() => addStep(task)}>
                ADD
              </button>
            </div>
          </div>
        </section>

        <section className="tm-card" style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span style={styles.queueLabel}>TASK AGENT SESSION</span>
            <span style={{ ...styles.execChip, color: T.kiro, borderColor: 'rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.08)' }}>
              {slotKey} · taskmaster
            </span>
          </div>
          <div style={{ height: 380 }}>
            <ChatEmbed
              slotKey={slotKey}
              agent="taskmaster"
              frameless
              startAtBottom
              placeholder="Message the taskmaster agent about this task…"
            />
          </div>
        </section>
      </>
    )
  }

  function renderBacklog() {
    return (
      <>
        <section className="tm-card" style={styles.card}>
          <div style={{ ...styles.queueLabel, marginBottom: 10 }}>ALL BACKLOGS ({backlogCount} TASKS)</div>
          {renderAddTaskForm()}
        </section>
        {config!.tasks.map((task) => {
          const prog = progress(task)
          const isFocused = task.id === activeTask?.id
          const taskPending = pending[task.id] ?? null
          const drafting = taskPending?.kind === 'draft'
          return (
            <section
              key={task.id}
              className="tm-card"
              style={{ ...styles.card, ...(isFocused ? { borderColor: 'rgba(52,211,153,0.4)' } : {}) }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 14, minWidth: 0 }}>{task.title}</span>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {task.estimateMinutes != null && (
                    <span style={{ ...styles.chip, color: '#38bdf8', borderColor: T.border, fontFamily: MONO }}>~{task.estimateMinutes}m</span>
                  )}
                  <button className="tm-btn" style={{ ...styles.btnGhost, color: T.focus, borderColor: 'rgba(52,211,153,0.3)' }} onClick={() => focusTask(task.id)}>
                    FOCUS
                  </button>
                  <button
                    className="tm-btn"
                    style={{ ...styles.btnGhost, ...(drafting ? { color: T.kiro } : {}) }}
                    disabled={Boolean(taskPending)}
                    onClick={() => draftSteps(task)}
                  >
                    {drafting ? '⚙ DRAFTING…' : '✦ DRAFT STEPS'}
                  </button>
                  <button className="tm-btn" style={styles.btnGhost} onClick={() => openTaskInChat(task)}>
                    💬 CHAT
                  </button>
                  <button
                    className="tm-btn"
                    style={{ ...styles.btnGhost, ...(confirmDelete === task.id ? { color: T.danger, borderColor: T.danger } : {}) }}
                    onClick={() => (confirmDelete === task.id ? deleteTask(task.id) : setConfirmDelete(task.id))}
                    onBlur={() => setConfirmDelete(null)}
                  >
                    {confirmDelete === task.id ? 'SURE?' : 'DELETE'}
                  </button>
                </span>
              </div>
              <div style={{ ...styles.progressTrack, marginTop: 12 }}>
                <div style={{ ...styles.progressFill, width: `${prog.pct}%` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                {task.subtasks.length === 0 && <span style={{ color: T.muted, fontSize: 11 }}>No micro-steps yet.</span>}
                {task.subtasks.map((sub) => {
                  const failed = sub.runState === 'failed' && !sub.done
                  return (
                    <div key={sub.id} style={styles.backlogSubRow}>
                      <span style={{ color: sub.done ? T.focus : failed ? T.danger : '#475569' }}>
                        {sub.done ? '✓' : failed ? '✗' : '○'}
                      </span>
                      <span style={{ fontSize: 11, ...(sub.done ? { textDecoration: 'line-through', color: T.muted } : {}) }}>{sub.title}</span>
                      {failed && <span style={{ ...styles.execChip, ...styles.failedChip }}>FAILED</span>}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </>
    )
  }

  function renderConsole() {
    return (
      <>
        <section className="tm-card" style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={styles.queueLabel}>KIRO GATEWAY</span>
            <button
              className="tm-btn"
              style={styles.btnGhost}
              onClick={() => {
                api
                  .get('/api/status')
                  .then((status) => {
                    setGateway((typeof status === 'object' && status !== null ? status : {}) as GatewayStatus)
                    addLog('ok', 'Gateway status refreshed.')
                  })
                  .catch((err) => addLog('warn', `Status refresh failed: ${String(err)}`))
              }}
            >
              REFRESH
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <StatBox label="STATUS" value={gateway ? 'ONLINE' : 'UNKNOWN'} accent={gateway ? T.focus : T.warn} />
            <StatBox label="VERSION" value={String(gateway?.version ?? '—')} accent={T.kiro} />
            <StatBox label="UPTIME" value={String(gateway?.uptime ?? '—')} accent={T.text} />
            <StatBox label="PROVIDER" value={String(gateway?.provider ?? '—')} accent={T.text} />
          </div>
        </section>
        <section className="tm-card" style={{ ...styles.card, fontFamily: MONO }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', borderBottom: `1px solid ${T.border}`, paddingBottom: 8, marginBottom: 10 }}>
            <span style={{ color: T.muted, fontSize: 11 }}>Taskmaster activity + gateway console</span>
            <span style={{ ...styles.execChip, color: T.muted }}>{CONSOLE_MODE}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto' }}>
            {log.length === 0 && <span style={{ color: T.muted, fontSize: 11 }}>No events yet.</span>}
            {log.map((entry, index) => (
              <div key={`${entry.ts}-${index}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#475569', fontSize: 10, flexShrink: 0, paddingTop: 1 }}>{entry.ts}</span>
                <span
                  style={{
                    ...styles.levelChip,
                    ...(entry.level === 'ok'
                      ? { background: 'rgba(52,211,153,0.15)', color: T.focus }
                      : entry.level === 'warn'
                        ? { background: 'rgba(210,153,34,0.15)', color: T.warn }
                        : entry.level === 'err'
                          ? { background: 'rgba(229,83,75,0.15)', color: T.danger }
                          : { background: 'rgba(148,163,184,0.12)', color: T.muted }),
                  }}
                >
                  {entry.level.toUpperCase()}
                </span>
                <span style={{ fontSize: 11, color: T.text, wordBreak: 'break-word' }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </section>
      </>
    )
  }

  return (
    <div style={styles.root}>
      <style>{globalCss}</style>
      <header style={styles.header}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={styles.logoBox} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <span>
            <span style={styles.brandTitle}>Taskmaster Pro</span>
            <span style={{ ...styles.chip, marginLeft: 8, color: T.kiro, borderColor: 'rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.08)' }}>
              EXECUTION ENGINE
            </span>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>Task focus · agent-run commands · memory sync</div>
          </span>
        </span>
        {renderTabs()}
      </header>
      {loadError && <div style={styles.errorBanner}>{loadError}</div>}
      {body}
    </div>
  )
}

function StatBox({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={styles.statBox}>
      <div style={{ color: T.muted, fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ color: accent, fontSize: 13, fontWeight: 700, fontFamily: MONO, wordBreak: 'break-all' }}>{value}</div>
    </div>
  )
}

const globalCss = `
  .tm-btn { cursor: pointer; transition: filter 120ms ease, background 120ms ease; }
  .tm-btn:hover:not(:disabled) { filter: brightness(1.25); }
  .tm-btn:disabled { cursor: default; }
  .tm-card { box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
  @keyframes tm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  .tm-pulse { animation: tm-pulse 1.6s ease-in-out infinite; }
`

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 18,
    maxWidth: 920,
    margin: '0 auto',
    minHeight: '100%',
    background: T.bg,
    color: T.text,
    fontFamily: "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif",
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    padding: '12px 16px',
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(45deg, ${T.kiro}, ${T.focus})`,
    flexShrink: 0,
  },
  brandTitle: { fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' },
  tabRow: {
    display: 'flex',
    gap: 4,
    padding: 4,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    background: T.bg,
  },
  tab: {
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    color: T.muted,
    background: 'transparent',
    border: '1px solid transparent',
  },
  tabActive: { background: T.focus, color: '#030712' },
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 },
  gradientStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${T.kiro}, ${T.focus}, #38bdf8)`,
  },
  centerCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 999,
    border: `1px solid ${T.border}`,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    background: 'transparent',
  },
  taskTitle: { fontSize: 20, fontWeight: 700, margin: '4px 0 0', lineHeight: 1.35, maxWidth: 640 },
  progressTrack: {
    marginTop: 18,
    height: 10,
    borderRadius: 999,
    border: `1px solid ${T.border}`,
    background: T.bg,
    overflow: 'hidden',
    padding: 2,
    boxSizing: 'border-box',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: `linear-gradient(90deg, ${T.kiro}, ${T.focus})`,
    transition: 'width 300ms ease',
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${T.border}`,
    paddingBottom: 12,
    marginBottom: 14,
  },
  stepCounter: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 7 },
  pulseDot: { width: 8, height: 8, borderRadius: 999, background: T.focus, display: 'inline-block' },
  navBtn: {
    padding: '4px 10px',
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.bg,
    color: T.text,
    fontSize: 11,
  },
  checkBtn: { background: 'transparent', border: 'none', padding: 0, marginTop: 2 },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 999,
    border: '2px solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    background: 'transparent',
  },
  commandBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    background: T.bg,
  },
  commandLabel: { fontSize: 9, letterSpacing: '0.14em', color: T.muted, fontFamily: MONO },
  commandCode: {
    display: 'block',
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.card,
    color: '#6ee7b7',
    fontSize: 11,
    fontFamily: MONO,
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  btnPrimary: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid transparent',
    background: '#4f46e5',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  btnGhost: {
    padding: '6px 10px',
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: 'transparent',
    color: T.muted,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  outputPre: {
    margin: 0,
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: '#000',
    color: '#cbd5e1',
    fontSize: 10.5,
    fontFamily: MONO,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 200,
    overflowY: 'auto',
  },
  queueLabel: { fontSize: 10, letterSpacing: '0.1em', fontWeight: 700, color: T.muted },
  queueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    background: 'rgba(3,7,18,0.4)',
    cursor: 'pointer',
  },
  queueRowActive: { borderColor: 'rgba(52,211,153,0.45)', background: 'rgba(52,211,153,0.08)' },
  queueCheck: { background: 'transparent', border: 'none', padding: 0, fontSize: 13, flexShrink: 0 },
  execChip: {
    display: 'inline-block',
    padding: '1px 5px',
    borderRadius: 4,
    border: '1px solid rgba(52,211,153,0.3)',
    background: 'rgba(52,211,153,0.08)',
    color: T.focus,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.08em',
    fontFamily: MONO,
  },
  failedChip: {
    color: T.danger,
    borderColor: 'rgba(229,83,75,0.35)',
    background: 'rgba(229,83,75,0.08)',
  },
  activeChip: {
    padding: '2px 8px',
    borderRadius: 6,
    background: 'rgba(52,211,153,0.2)',
    color: T.focus,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.08em',
    flexShrink: 0,
  },
  addRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  input: {
    padding: '8px 10px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.bg,
    color: T.text,
    fontSize: 12,
    outline: 'none',
    minWidth: 0,
  },
  backlogSubRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, background: 'rgba(3,7,18,0.45)' },
  statBox: {
    flex: '1 1 120px',
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    background: T.bg,
  },
  levelChip: { padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', flexShrink: 0 },
  errorBanner: {
    padding: '10px 14px',
    borderRadius: 12,
    border: `1px solid ${T.danger}`,
    background: 'rgba(229,83,75,0.08)',
    color: T.danger,
    fontSize: 12,
  },
}
