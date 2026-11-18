import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LabPositionState } from '../lab/labPosition'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { ReaderPositionCoordinator } from './readerPositionCoordinator'
import { handleLabPosition } from './routes/labPosition'
import { POSITION_HISTORY_MAX_AGE_MS } from './lib/positionHistory'

const owner = '11111111-1111-4111-8111-111111111111'
const now = 1_800_000_000_000
function state(paragraph: number, at: number, device = 'phone'): LabPositionState {
  return { owner, books: { master: { bookId: 'master', headerBook: 'master', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: paragraph,
    wordIndex: 0, primaryEditionKey: 'mm-en', updatedAt: at, deviceId: device, rev: at } },
  finished: {}, hidden: {}, lastSettledBookId: 'master', lastSettledAt: at, updatedAt: at, deviceId: device }
}

/** An in-memory reader_position table that understands the coordinator's few statements. */
function fixture(legacy: unknown = state(244, now - 60_000)) {
  const rows = new Map<number, string>()
  const kv = { get: vi.fn(async () => legacy), put: vi.fn(async () => {}) }
  const exec = vi.fn((query: string, value?: string) => {
    if (query.startsWith('CREATE')) return { toArray: () => [] }
    if (query.startsWith('SELECT id, value')) return { toArray: () => [...rows].sort(([a], [b]) => a - b).map(([id, v]) => ({ id, value: v })) }
    const id = Number(query.match(/(?:VALUES \(|id=)(\d)/)?.[1])
    if (query.startsWith('INSERT')) rows.set(id, value!)
    if (query.startsWith('DELETE')) rows.delete(id)
    return { toArray: () => rows.has(id) ? [{ value: rows.get(id) }] : [] }
  })
  let alarm: number | null = null
  const storage = { sql: { exec }, getAlarm: vi.fn(async () => alarm), setAlarm: vi.fn(async (v: number) => { alarm = v }),
    deleteAlarm: vi.fn(async () => { alarm = null }), deleteAll: vi.fn(async () => { rows.clear() }) }
  const coordinator = new ReaderPositionCoordinator({ storage } as any, { RATE_LIMIT: kv as unknown as KVNamespace })
  return { rows, coordinator }
}
const history = (rows: Map<number, string>) => JSON.parse(rows.get(5) ?? '[]')

describe('reader position write history', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(now) })
  afterEach(() => vi.useRealTimers())

  it('records each place-changing write with tab, build, reason and outcome, apart from the position row', async () => {
    const f = fixture()
    await f.coordinator.update(owner, state(62, now - 1_000), { tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'page-turn' })
    await f.coordinator.update(owner, state(10, now - 30_000, 'laptop'), { tab: 'bbbbbbbb.0001', build: 'old1', reason: 'hide' })
    expect(history(f.rows)).toEqual([
      { at: now, device: 'phone', tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'page-turn', book: 'master', edition: 'mm-en',
        chapter: 2, paragraph: 62, word: 0, placeAt: now - 1_000, rev: now - 1_000, outcome: 'accepted' },
      { at: now, device: 'laptop', tab: 'bbbbbbbb.0001', build: 'old1', reason: 'hide', book: 'master', edition: 'mm-en',
        chapter: 2, paragraph: 10, word: 0, placeAt: now - 30_000, rev: now - 30_000, outcome: 'ignored' },
    ])
    expect(JSON.parse(f.rows.get(1)!).books.master.paragraphIndex).toBe(62)
    expect(JSON.parse(f.rows.get(1)!)).not.toHaveProperty('client')
  })

  it('returns the same merged record with or without history, and a broken history row never fails a save', async () => {
    const plain = fixture(), logged = fixture()
    const a = await plain.coordinator.update(owner, state(62, now - 1_000))
    const b = await logged.coordinator.update(owner, state(62, now - 1_000), { tab: 'a1b2c3d4.ef01', reason: 'word' })
    expect(b).toEqual(a)
    const broken = fixture()
    broken.rows.set(5, '{not json')
    await broken.coordinator.read(owner)
    expect((await broken.coordinator.update(owner, state(80, now - 500))).books.master.paragraphIndex).toBe(80)
  })

  it('appends nothing when a write carries the stored place unchanged', async () => {
    const f = fixture()
    await f.coordinator.update(owner, state(244, now - 60_000))
    expect(f.rows.has(5)).toBe(false)
  })

  it('drops entries older than 30 days on append and hides them from the admin read', async () => {
    const f = fixture()
    await f.coordinator.update(owner, state(62, now - 1_000))
    vi.setSystemTime(now + POSITION_HISTORY_MAX_AGE_MS + 1)
    expect(f.coordinator.positionHistory()).toEqual([])
    await f.coordinator.update(owner, state(70, now + POSITION_HISTORY_MAX_AGE_MS))
    expect(history(f.rows).map((e: { paragraph: number }) => e.paragraph)).toEqual([70])
  })

  it('is in the account export and gone after purge', async () => {
    const f = fixture()
    await f.coordinator.update(owner, state(62, now - 1_000), { reason: 'page-turn' })
    const exported = f.coordinator.exportState()
    expect(exported.positionHistory).toMatchObject([{ book: 'master', paragraph: 62, reason: 'page-turn' }])
    expect(f.coordinator.positionHistory()).toHaveLength(1)
    await f.coordinator.purge()
    expect(f.coordinator.exportState()).toEqual({})
    expect(f.coordinator.positionHistory()).toEqual([])
  })

  it('the route passes the client labels to the coordinator and keeps them out of the merged record', async () => {
    const f = fixture()
    const env = { READER_POSITION: { getByName: () => f.coordinator } as any, RATE_LIMIT: {} as KVNamespace }
    const body = { ...state(62, now - 1_000), client: { tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'hide', junk: 'x' } }
    const response = await handleLabPosition(new Request('https://tinct.app/api/lab-position', { method: 'PUT', body: JSON.stringify(body) }),
      env, async () => ({ id: owner, email: 'fixture@example.invalid' }))
    const reply = await response.json() as Record<string, unknown>
    expect(reply).not.toHaveProperty('client')
    expect(history(f.rows)).toMatchObject([{ tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'hide', paragraph: 62 }])
    expect(history(f.rows)[0]).not.toHaveProperty('junk')
  })
})
