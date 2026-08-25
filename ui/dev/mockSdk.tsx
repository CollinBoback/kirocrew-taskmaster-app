// Mock of @kirocrew/app-sdk for the dev harness (no Crew gateway needed).
// - useAppApi(): routes the gateway endpoints the app uses to an in-memory
//   store, seeded with the sample migration task from Collin's mockup.
// - POST /api/chat: appends to an in-memory chat slot and schedules a scripted
//   taskmaster reply ~1.6s later — a fenced-JSON breakdown, a fake sqlcmd
//   report ending in a STEP RESULT line, or per-step STEP RESULT lines for a
//   run-remaining request. GET /api/chat/slots/{slot} serves what ChatEmbed
//   and the app's marker polling both consume.
// - ChatEmbed: minimal stand-in for the host component (same props surface).
// - useNotify(): DOM toast. useNavBadge(): tab title. useChatLauncher(): toast.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type Listener = (payload: unknown) => void
const listeners = new Map<string, Set<Listener>>()

function emit(event: string, payload: unknown) {
  listeners.get(event)?.forEach((cb) => cb(payload))
}

const seedConfig = {
  version: 1,
  settings: { memorySync: true },
  activeTaskId: 'task-sample-1',
  tasks: [
    {
      id: 'task-sample-1',
      title: 'Scope out request to migrate Tableau data source into SQL Server',
      estimateMinutes: 45,
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-sample-1',
          title: 'Identify active cross-database linked server references',
          done: false,
          command: 'sqlcmd -S localhost -d master -Q "SELECT name, product, data_source FROM sys.servers WHERE is_linked = 1;"',
        },
        {
          id: 'sub-sample-2',
          title: 'Audit T-SQL modules for hardcoded OPENQUERY calls',
          done: false,
          command: 'sqlcmd -S localhost -d master -Q "SELECT OBJECT_NAME(object_id) AS ProcName FROM sys.sql_modules WHERE definition LIKE \'%OPENQUERY%\';"',
        },
        { id: 'sub-sample-3', title: 'Extract embedded SQL scripts from Tableau workbook', done: false },
        {
          id: 'sub-sample-4',
          title: 'Generate mock staging schemas for target environment',
          done: false,
          command: 'sqlcmd -S localhost -d master -Q "CREATE SCHEMA [stg_tableau];"',
        },
      ],
    },
  ],
}

let mockConfig: unknown = seedConfig

interface MockSlotMessage {
  role: 'user' | 'assistant'
  content: string
}

interface MockSlot {
  messages: MockSlotMessage[]
  running: boolean
  title: string
}

const slots = new Map<string, MockSlot>()

const RUN_OUTPUT = (command: string, n: string) => `Ran \`${command.slice(0, 90)}\`

\`\`\`
name          product      data_source
------------  -----------  --------------------
TABLEAU_EXT   SQL Server   tcp:legacy-dw,1433
FINANCE_LNK   SQL Server   tcp:finance-dw,1433

(2 rows affected)
\`\`\`

STEP RESULT [${n}]: done — 2 rows affected, no errors`

const DRAFT_RESULT = `\`\`\`json
[
  { "title": "List candidate tables and row counts in the source", "command": "sqlcmd -S localhost -Q \\"SELECT t.name, p.rows FROM sys.tables t JOIN sys.partitions p ON t.object_id = p.object_id WHERE p.index_id IN (0,1);\\"" },
  { "title": "Draft the target staging DDL from the source schema" },
  { "title": "Validate row counts match between source and staging", "command": "sqlcmd -S localhost -Q \\"SELECT COUNT(*) FROM stg_tableau.sample_extract;\\"" },
  { "title": "Write a one-page scoping summary with effort estimate" }
]
\`\`\``

function scriptedReply(message: string): string {
  if (message.includes('into micro-steps')) return DRAFT_RESULT
  const runMatch = /^Run micro-step \[(\d+)\]/.exec(message)
  if (runMatch) {
    const commandLine = message.split('\n').find((line) => !line.startsWith('Run micro-step') && !line.startsWith('Execute this') && !line.startsWith('End your reply') && line.trim()) ?? ''
    return RUN_OUTPUT(commandLine.trim(), runMatch[1])
  }
  if (message.startsWith('Execute the remaining micro-steps')) {
    const lines = message.split('\n').filter((line) => /^\[\d+\]/.test(line.trim()))
    const results = lines.map((line) => {
      const n = /^\[(\d+)\]/.exec(line.trim())?.[1] ?? '?'
      return line.includes('— command:')
        ? `Executed step ${n}.\nSTEP RESULT [${n}]: done — completed via terminal`
        : `Step ${n} needs a human.\nSTEP RESULT [${n}]: failed — needs Collin (no runnable command)`
    })
    return results.join('\n\n')
  }
  return 'Got it — I am tracking this task. Ask me to run a step, or use the app buttons.'
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function route(method: string, path: string, body?: unknown): Promise<unknown> {
  await delay(120)
  if (path === '/api/apps/taskmaster-pro/config') {
    if (method === 'GET') return mockConfig
    mockConfig = body
    return { ok: true }
  }
  if (path === '/api/status') {
    return { version: '0.9.0-mock', uptime: '4h 20m', provider: 'mock-gateway', slots: slots.size }
  }
  if (path.startsWith('/api/chat/slots/')) {
    const key = decodeURIComponent(path.slice('/api/chat/slots/'.length))
    const slot = slots.get(key)
    if (!slot) throw new Error('404: slot not found')
    return { messages: [...slot.messages], running: slot.running, title: slot.title }
  }
  if (path === '/api/chat' && method === 'POST') {
    const record = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>
    const key = String(record.slot ?? 'default')
    const message = String(record.message ?? '')
    let slot = slots.get(key)
    if (!slot) {
      slot = { messages: [], running: false, title: key }
      slots.set(key, slot)
    }
    slot.messages.push({ role: 'user', content: message })
    slot.running = true
    setTimeout(() => {
      slot.messages.push({ role: 'assistant', content: scriptedReply(message) })
      slot.running = false
    }, 1600)
    return { ok: true }
  }
  if (path === '/api/crons') return { ok: true, id: 'mock-cron-1' }
  if (path === '/api/lessons') return { ok: true }
  throw new Error(`mock: no route for ${method} ${path}`)
}

// Stable singleton — the real @kirocrew/app-sdk returns a stable api handle, so
// the mock must too. Returning a fresh object each render would make every
// consumer's useCallback/useEffect deps churn (App's load effect calls addLog →
// setLog → re-render → new api → effect re-runs → "Maximum update depth").
const mockApi = {
  get: (path: string) => route('GET', path),
  post: (path: string, body?: unknown) => route('POST', path, body),
  put: (path: string, body?: unknown) => route('PUT', path, body),
  patch: (path: string, body?: unknown) => route('PATCH', path, body),
  del: (path: string) => route('DELETE', path),
}

export function useAppApi() {
  return mockApi
}

const SCRIPTED_NOTIFICATION = {
  title: 'crew',
  text: 'Mock gateway notification — event forwarding to app pages lands upstream; this arrives via the dev harness only.',
}

export function useAppEvents(event: string, cb: (payload: unknown) => void): void {
  useEffect(() => {
    let set = listeners.get(event)
    if (!set) {
      set = new Set()
      listeners.set(event, set)
    }
    set.add(cb)
    return () => {
      set.delete(cb)
    }
  }, [event, cb])
  useEffect(() => {
    if (event !== 'notification') return
    const timer = setTimeout(() => emit('notification', SCRIPTED_NOTIFICATION), 18_000)
    return () => clearTimeout(timer)
  }, [event])
}

// These hooks also return stable references, matching the real SDK. App keeps
// them in useCallback/useEffect deps, so unstable identities would re-run those
// effects on every render.
function notifyToast(text: string, _opts?: { type?: 'info' | 'success' | 'error' }) {
  const toast = document.createElement('div')
  toast.textContent = text
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    background: '#052e22', color: '#34d399', border: '1px solid #10b981',
    borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '700',
    zIndex: '100', fontFamily: 'sans-serif',
  })
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

export function useNotify() {
  return notifyToast
}

function setNavBadge(count: number) {
  document.title = count > 0 ? `(${count}) Taskmaster Pro — dev harness` : 'Taskmaster Pro — dev harness'
}

export function useNavBadge() {
  return useCallback((count: number) => {
    document.title = count > 0 ? `(${count}) Taskmaster Pro — dev harness` : 'Taskmaster Pro — dev harness'
  }, [])
}

export function useChatLauncher() {
  return chatLauncher
}

// ---------------------------------------------------------------------------
// ChatEmbed stand-in — same props surface as the host component, backed by the
// in-memory slot store with 800ms polling.
// ---------------------------------------------------------------------------

const embedStyles: Record<string, CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#030712', fontFamily: 'sans-serif' },
  scroller: { flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  bubbleUser: { alignSelf: 'flex-end', maxWidth: '80%', background: '#1e293b', color: '#f1f5f9', borderRadius: 10, padding: '8px 10px', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  bubbleAgent: { alignSelf: 'flex-start', maxWidth: '85%', background: '#0b1329', border: '1px solid #1e293b', color: '#cbd5e1', borderRadius: 10, padding: '8px 10px', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  inputRow: { display: 'flex', gap: 8, padding: 10, borderTop: '1px solid #1e293b' },
  input: { flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #1e293b', background: '#0b1329', color: '#f1f5f9', fontSize: 12, outline: 'none' },
  sendBtn: { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  empty: { color: '#64748b', fontSize: 12, textAlign: 'center', paddingTop: 30 },
}

export function ChatEmbed({
  slotKey,
  agent,
  placeholder,
}: {
  slotKey: string
  agent?: string
  placeholder?: string
  frameless?: boolean
  startAtBottom?: boolean
  onSend?: (message: string) => Promise<unknown> | void
  aboveComposer?: ReactNode
}) {
  const [messages, setMessages] = useState<MockSlotMessage[]>([])
  const [running, setRunning] = useState(false)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const slot = slots.get(slotKey)
      setMessages(slot ? [...slot.messages] : [])
      setRunning(slot?.running ?? false)
    }, 800)
    return () => clearInterval(timer)
  }, [slotKey])

  useEffect(() => {
    endRef.current?.scrollIntoView()
  }, [messages.length, running])

  const send = () => {
    const message = input.trim()
    if (!message) return
    setInput('')
    void route('POST', '/api/chat', { message, slot: slotKey, agent: agent ?? '' })
  }

  return (
    <div style={embedStyles.root}>
      <div style={embedStyles.scroller}>
        {messages.length === 0 && !running && <div style={embedStyles.empty}>Session ready — type a message to start.</div>}
        {messages.map((message, index) => (
          <div key={index} style={message.role === 'user' ? embedStyles.bubbleUser : embedStyles.bubbleAgent}>
            {message.content}
          </div>
        ))}
        {running && <div style={{ ...embedStyles.bubbleAgent, color: '#818cf8' }}>… taskmaster is working</div>}
        <div ref={endRef} />
      </div>
      <div style={embedStyles.inputRow}>
        <input
          style={embedStyles.input}
          value={input}
          placeholder={placeholder ?? 'Message…'}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send()
          }}
        />
        <button style={embedStyles.sendBtn} onClick={send}>
          SEND
        </button>
      </div>
    </div>
  )
}
