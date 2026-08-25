import { describe, expect, it } from 'vitest'
import type { Task } from './model'
import {
  firstIncompleteIndex,
  lessonFor,
  normalizeConfig,
  normalizeSlotData,
  parseBreakdown,
  parseStepResults,
  progress,
  taskSlotKey,
} from './model'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Migrate report',
    createdAt: '2026-08-24T00:00:00.000Z',
    subtasks: [],
    ...overrides,
  }
}

describe('parseStepResults (STEP RESULT contract)', () => {
  it('parses a single done marker with an em-dash summary', () => {
    const text = 'Ran the query.\nSTEP RESULT [3]: done — 42 rows returned'
    expect(parseStepResults(text)).toEqual([{ index: 3, ok: true, summary: '42 rows returned' }])
  })

  it('parses one marker per step from a run-remaining reply, in order', () => {
    const text = [
      'Working through the list.',
      'STEP RESULT [1]: done — linked servers listed',
      'Step 2 needs the user.',
      'STEP RESULT [2]: failed — needs Collin',
      'STEP RESULT [3]: done — file generated',
    ].join('\n')
    expect(parseStepResults(text)).toEqual([
      { index: 1, ok: true, summary: 'linked servers listed' },
      { index: 2, ok: false, summary: 'needs Collin' },
      { index: 3, ok: true, summary: 'file generated' },
    ])
  })

  it.each([
    ['em dash', 'STEP RESULT [1]: done — summary here'],
    ['en dash', 'STEP RESULT [1]: done – summary here'],
    ['hyphen', 'STEP RESULT [1]: done - summary here'],
    ['colon', 'STEP RESULT [1]: done : summary here'],
  ])('accepts the %s separator variant', (_name, line) => {
    expect(parseStepResults(line)).toEqual([{ index: 1, ok: true, summary: 'summary here' }])
  })

  it('tolerates a missing summary and leading whitespace', () => {
    expect(parseStepResults('  STEP RESULT [2]: failed')).toEqual([{ index: 2, ok: false, summary: '' }])
  })

  it('is case-insensitive on the status word', () => {
    expect(parseStepResults('STEP RESULT [1]: DONE — ok')).toEqual([{ index: 1, ok: true, summary: 'ok' }])
  })

  it('returns [] when no marker is present (graceful degradation)', () => {
    expect(parseStepResults('I ran the command but forgot the marker.')).toEqual([])
  })

  it('ignores markers that are not at the start of a line', () => {
    expect(parseStepResults('the contract is STEP RESULT [1]: done — never inline')).toEqual([])
  })

  it('is re-runnable (global regex lastIndex is reset between calls)', () => {
    const text = 'STEP RESULT [1]: done — first'
    expect(parseStepResults(text)).toHaveLength(1)
    expect(parseStepResults(text)).toHaveLength(1)
  })
})

describe('parseBreakdown (fenced-JSON contract)', () => {
  it('parses a fenced json block of {title, command?} objects', () => {
    const text = [
      '```json',
      '[{"title": "List linked servers", "command": "sqlcmd -Q \\"exec sp_linkedservers\\""}, {"title": "Draft mapping doc"}]',
      '```',
    ].join('\n')
    expect(parseBreakdown(text)).toEqual([
      { title: 'List linked servers', command: 'sqlcmd -Q "exec sp_linkedservers"' },
      { title: 'Draft mapping doc' },
    ])
  })

  it('accepts an unlabeled fence', () => {
    expect(parseBreakdown('```\n[{"title": "Step one"}]\n```')).toEqual([{ title: 'Step one' }])
  })

  it('falls back to the first [...] span when the reply has prose around bare JSON', () => {
    const text = 'Here you go:\n[{"title": "Step one"}, {"title": "Step two"}]\nGood luck!'
    expect(parseBreakdown(text)).toEqual([{ title: 'Step one' }, { title: 'Step two' }])
  })

  it('returns null for an unparseable reply', () => {
    expect(parseBreakdown('Sorry, I cannot break this down.')).toBeNull()
  })

  it('returns null when the JSON is not an array or the array has no usable steps', () => {
    expect(parseBreakdown('```json\n{"title": "not an array"}\n```')).toBeNull()
    expect(parseBreakdown('```json\n[{"command": "ls"}, 42, null]\n```')).toBeNull()
  })

  it('filters title-less items and trims titles/commands, dropping empty commands', () => {
    const text = '```json\n[{"title": "  Keep me  ", "command": "  ls  "}, {"title": "", "command": "rm"}, {"title": "No cmd", "command": "   "}]\n```'
    expect(parseBreakdown(text)).toEqual([{ title: 'Keep me', command: 'ls' }, { title: 'No cmd' }])
  })

  it('caps the breakdown at 12 steps', () => {
    const steps = Array.from({ length: 20 }, (_, i) => ({ title: `Step ${i + 1}` }))
    const parsed = parseBreakdown(`\`\`\`json\n${JSON.stringify(steps)}\n\`\`\``)
    expect(parsed).toHaveLength(12)
  })

  it('prefers the fenced block over a wider bare-bracket span', () => {
    const text = 'Context [irrelevant]\n```json\n[{"title": "Fenced step"}]\n```'
    expect(parseBreakdown(text)).toEqual([{ title: 'Fenced step' }])
  })
})

describe('normalizeConfig (defensive load)', () => {
  it.each([[null], [undefined], ['a string'], [42]])('returns the empty config for %s', (raw) => {
    expect(normalizeConfig(raw)).toEqual({
      version: 1,
      settings: { memorySync: true },
      activeTaskId: null,
      tasks: [],
    })
  })

  it('returns the empty config for {} (fresh gateway config)', () => {
    const config = normalizeConfig({})
    expect(config.tasks).toEqual([])
    expect(config.settings.memorySync).toBe(true)
    expect(config.activeTaskId).toBeNull()
  })

  it('drops non-object and title-less entries from tasks and subtasks', () => {
    const config = normalizeConfig({
      tasks: [{ title: 'Real task', subtasks: [{ title: 'Real step' }, { done: true }, 'junk', null] }, { notATask: true }, 7],
    })
    expect(config.tasks).toHaveLength(1)
    expect(config.tasks[0].subtasks).toHaveLength(1)
    expect(config.tasks[0].subtasks[0].title).toBe('Real step')
  })

  it('defaults subtask fields and keeps only valid runState/source values', () => {
    const config = normalizeConfig({
      tasks: [
        {
          title: 'T',
          subtasks: [
            { title: 'legacy step' },
            { title: 'failed step', done: false, runState: 'failed', source: 'agent', command: 'ls', output: 'boom' },
            { title: 'bogus runState', runState: 'exploded', source: 'robot' },
          ],
        },
      ],
    })
    const [legacy, failed, bogus] = config.tasks[0].subtasks
    expect(legacy).not.toHaveProperty('runState')
    expect(legacy.done).toBe(false)
    expect(typeof legacy.id).toBe('string')
    expect(failed).toMatchObject({ runState: 'failed', source: 'agent', command: 'ls', output: 'boom' })
    expect(bogus).not.toHaveProperty('runState')
    expect(bogus).not.toHaveProperty('source')
  })

  it('keeps a valid activeTaskId and falls back to the first task for an invalid one', () => {
    const tasks = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }]
    expect(normalizeConfig({ tasks, activeTaskId: 'b' }).activeTaskId).toBe('b')
    expect(normalizeConfig({ tasks, activeTaskId: 'ghost' }).activeTaskId).toBe('a')
    expect(normalizeConfig({ activeTaskId: 'ghost' }).activeTaskId).toBeNull()
  })

  it('honours memorySync only when explicitly false', () => {
    expect(normalizeConfig({ settings: { memorySync: false } }).settings.memorySync).toBe(false)
    expect(normalizeConfig({ settings: {} }).settings.memorySync).toBe(true)
  })

  it('drops non-positive estimates and rounds valid ones', () => {
    const config = normalizeConfig({ tasks: [{ title: 'A', estimateMinutes: 12.6 }, { title: 'B', estimateMinutes: -5 }] })
    expect(config.tasks[0].estimateMinutes).toBe(13)
    expect(config.tasks[1]).not.toHaveProperty('estimateMinutes')
  })
})

describe('progress / firstIncompleteIndex', () => {
  it('reports 0% for a task with no steps', () => {
    expect(progress(makeTask())).toEqual({ done: 0, total: 0, pct: 0 })
  })

  it('rounds the percentage from done/total', () => {
    const task = makeTask({
      subtasks: [
        { id: 's1', title: 'a', done: true },
        { id: 's2', title: 'b', done: false },
        { id: 's3', title: 'c', done: false },
      ],
    })
    expect(progress(task)).toEqual({ done: 1, total: 3, pct: 33 })
  })

  it('finds the first incomplete step, clamping to the last step when all are done', () => {
    const allDone = makeTask({
      subtasks: [
        { id: 's1', title: 'a', done: true },
        { id: 's2', title: 'b', done: true },
      ],
    })
    expect(firstIncompleteIndex(allDone)).toBe(1)
    const mixed = makeTask({
      subtasks: [
        { id: 's1', title: 'a', done: true },
        { id: 's2', title: 'b', done: false },
      ],
    })
    expect(firstIncompleteIndex(mixed)).toBe(1)
    expect(firstIncompleteIndex(makeTask())).toBe(0)
  })
})

describe('lessonFor / taskSlotKey / normalizeSlotData', () => {
  it('builds one lesson per task with numbered steps and inline commands', () => {
    const task = makeTask({
      title: 'Migrate report',
      subtasks: [
        { id: 's1', title: 'List servers', done: true, command: 'sqlcmd -Q "exec sp_linkedservers"' },
        { id: 's2', title: 'Draft mapping', done: true },
      ],
    })
    expect(lessonFor(task)).toBe(
      'Completed "Migrate report" via micro-steps: 1. List servers [sqlcmd -Q "exec sp_linkedservers"] 2. Draft mapping',
    )
  })

  it('derives a stable slot key from the task id', () => {
    expect(taskSlotKey({ id: 'task-abc' })).toBe('taskmaster-task-abc')
  })

  it('normalizes malformed slot payloads to an empty transcript', () => {
    expect(normalizeSlotData(null)).toEqual({ messages: [], running: false })
    expect(normalizeSlotData({ messages: 'nope', running: 'yes' })).toEqual({ messages: [], running: false })
    expect(normalizeSlotData({ messages: [{ role: 'user', content: 'hi' }, 'junk'], running: true })).toEqual({
      messages: [{ role: 'user', content: 'hi' }],
      running: true,
    })
  })
})
