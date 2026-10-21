// @vitest-environment jsdom
/**
 * How long the Leaderboard takes to show, measured end to end with mocked
 * latency (Anders, 21 Oct 2026: "leaderboard still takes too long to load"):
 * the real cards (openCards, cardViews, boardMemory, the flush) in the DOM,
 * talking to the real Worker route (social.ts handleSocial) over a store whose
 * every read waits like a Supabase round trip.
 *
 *   NET_MS     the browser's round trip to the Worker (default 40)
 *   BOARD_RTT_MS  each Supabase round trip from the Worker (default 80)
 *
 * The clock is vitest's fake one, so the timings are the model's alone (no
 * machine noise). Set BOARD_SPEED_LOG=1 to print them (the PR's table).
 * The flush is modelled as its Worker route does it: a rate-limit and a
 * flush-id check (Durable Object, ~30 ms each), the yearly-merge read and one
 * add_reading_time call per entry (a Supabase round trip each).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { closeAccountCards, openAccountCards } from './openCards'
import { forgetBoards, loadDefaultBoard } from './boardMemory'
import { addPending, resetLedgerSends, resetReadingTimeSwitch } from '../lab/labReadingTime'
import { handleSocial, type SocialDeps } from '../worker/routes/social'
import type { ProfileStore, ReaderProfileRow } from '../worker/lib/profileStore'
import type { LedgerDayRow, SocialStore } from '../worker/lib/socialStore'
import type { BoardCard } from '../social/socialRules'

const NET = Number(process.env.NET_MS) || 40
const RTT = Number(process.env.BOARD_RTT_MS) || 80
const DO_MS = 30
const LOG = Boolean(process.env.BOARD_SPEED_LOG)

// The viewer: a new account per test, so nothing this page read for another test paints.
let A = ''
let viewers = 0
const nextViewer = () => `aaaaaaaa-aaaa-4aaa-8aaa-${String(++viewers).padStart(12, '0')}`
const B = '22222222-2222-4222-8222-222222222222'
const C = '33333333-3333-4333-8333-333333333333'
const D = '44444444-4444-4444-8444-444444444444'
const NAMES: Record<string, string> = { [B]: 'Bea', [C]: 'Carl', [D]: 'Dora' }
const nameOf = (id: string) => (id === A ? 'Anders' : NAMES[id])

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function today(): string {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** The tables a board reads, in memory: every profile is Everyone, on the leaderboard, with time shown. */
class Tables {
  follows: [string, string][] = []
  ledger: LedgerDayRow[] = []
  ids = [A, B, C, D]
  row(id: string): ReaderProfileRow {
    return {
      id, display_name: nameOf(id), handle: nameOf(id).toLowerCase(), picture_kind: 'initial', picture_value: null, picture_review: 'none',
      background_kind: 'library', background_value: null, background_review: 'none', visibility: 'everyone', show_reading: true, show_time: true,
      on_leaderboard: true, new_books_open_in: 'modern', auto_created: false, set_up_at: '2026-10-01T00:00:00Z', prompted_at: null,
    }
  }
  card(id: string): BoardCard {
    const row = this.row(id)
    return { id, handle: row.handle, display_name: row.display_name, picture_kind: 'initial', picture_value: null, visibility: 'everyone', show_reading: true, show_time: true, on_leaderboard: true, internal: false }
  }
  befriend(x: string, y: string) { this.follows.push([x, y], [y, x]) }
  /** Sets a reader's minutes today (replacing what was there). */
  minutes(id: string, value: number) {
    this.ledger = this.ledger.filter(row => row.user_id !== id)
    this.ledger.push({ user_id: id, day: today(), book_id: 'frankenstein', read_seconds: value * 60, listen_seconds: 0 })
  }
  add(id: string, seconds: number) {
    const row = this.ledger.find(item => item.user_id === id)
    if (row) row.read_seconds += seconds
    else this.ledger.push({ user_id: id, day: today(), book_id: 'frankenstein', read_seconds: seconds, listen_seconds: 0 })
  }
}

/** The stores social.ts reads, each read one round trip; `calls` lists them. */
function stores(tables: Tables, calls: string[]): ProfileStore & SocialStore {
  const store: Partial<ProfileStore & SocialStore> & Record<string, unknown> = {
    getOwn: async id => tables.row(id),
    following: async id => tables.follows.filter(([f]) => f === id).map(([, t]) => t),
    followers: async id => tables.follows.filter(([, t]) => t === id).map(([f]) => f),
    blockedEitherWay: async () => new Set<string>(),
    cardsByIds: async ids => tables.ids.filter(id => ids.includes(id)).map(id => tables.card(id)),
    everyoneBoardCards: async () => tables.ids.map(id => tables.card(id)),
    everyoneReaderCount: async () => tables.ids.length,
    testAccounts: async () => new Set<string>(),
    weekLedger: async (ids, since) => tables.ledger.filter(row => ids.includes(row.user_id) && row.day >= since),
    boardSeconds: async () => new Map(),
    boardRefreshedAt: async () => null,
    refreshBoard: async () => {},
  }
  return new Proxy(store, {
    get(target, key) {
      const value = target[key as string]
      if (typeof value !== 'function') return value
      return async (...args: unknown[]) => {
        calls.push(String(key))
        await sleep(RTT)
        return (value as (...a: unknown[]) => unknown)(...args)
      }
    },
  }) as ProfileStore & SocialStore
}

interface World {
  tables: Tables
  calls: string[]
  store: ProfileStore & SocialStore
  /** How long a flush takes on the Worker beyond the network (default: the modelled route). */
  flushMs: number | null
  verified: Set<string>
  boardRequests: number
}

function world(): World {
  const tables = new Tables()
  const calls: string[] = []
  return { tables, calls, store: stores(tables, calls), flushMs: null, verified: new Set(), boardRequests: 0 }
}

function socialDeps(w: World): SocialDeps {
  return {
    profiles: w.store, social: w.store,
    // The Worker caches a verified token per isolate: the first request pays one auth round trip.
    verifyUser: async request => {
      const token = request.headers.get('authorization')?.slice(7) ?? ''
      if (!w.verified.has(token)) { await sleep(RTT); w.verified.add(token) }
      return { id: token, email: `${token}@readers.tinct.app` }
    },
    verifySiteAdmin: async () => false,
    everyoneMinReaders: 1,
  }
}

/** The browser's fetch: the board and rank through the real Worker route, the rest modelled. */
function browserFetch(w: World) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const headers = new Headers(init?.headers)
    await sleep(NET / 2)
    let response: Response
    if (url.startsWith('/api/social/board') || url.startsWith('/api/social/rank')) {
      w.boardRequests += 1
      response = await handleSocial(new Request(`https://tinct.app${url}`, { headers }), { SOCIAL_PROFILES: '1', SOCIAL_FRIENDS: '1' } as never, socialDeps(w))
    } else if (url.startsWith('/api/reading-time/status')) {
      response = Response.json({ enabled: true })
    } else if (url.startsWith('/api/reading-time/flush')) {
      const body = JSON.parse(String(init?.body)) as { entries: Array<{ read: number; listen: number }> }
      await sleep(w.flushMs ?? (2 * DO_MS + RTT + RTT * body.entries.length))
      for (const entry of body.entries) w.tables.add(A, entry.read + entry.listen)
      response = Response.json({ enabled: true, credited: 1 })
    } else if (url.startsWith('/api/reading-time')) {
      await sleep(2 * RTT)
      response = Response.json({ enabled: true, rows: w.tables.ledger.filter(row => row.user_id === A).map(row => ({ day: row.day, bookId: row.book_id, read: row.read_seconds, listen: row.listen_seconds })) })
    } else if (url.startsWith('/api/profile')) {
      await sleep(RTT)
      response = Response.json({ enabled: true, available: true, profile: { handle: 'anders', link: 'tinct.app/@anders', name: 'Anders', picture: { kind: 'initial', value: null, url: null, review: 'none' }, background: { kind: 'library', value: null, url: null, review: 'none' }, visibility: 'everyone', effectiveVisibility: 'everyone', showReading: true, showTime: true, onLeaderboard: true, newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false, emailConfirmed: true, emailOptIn: false, googlePhoto: false } })
    } else if (url.startsWith('/api/social/find')) {
      await sleep(3 * RTT)
      response = Response.json({ followingYou: [], alsoReading: [], link: 'tinct.app/@anders' })
    } else {
      response = Response.json({}, { status: 404 })
    }
    await sleep(NET / 2)
    return response
  })
}

const session = () => ({ token: A, userId: A, email: 'anders@example.com', accountName: 'Anders' })

const rowsText = () => [...document.querySelectorAll('.tc-card:not(.is-under) [data-testid="board-rows"] > *')].map(node => node.textContent ?? '')

/**
 * Opens the Leaderboard and times, on the fake clock (so the numbers are the
 * modelled latency, never this machine's speed): rows on screen, the fresh
 * rows, and the viewer's row with the flushed time.
 */
async function timeOpen(w: World, fresh: (rows: string[]) => boolean, final: (rows: string[]) => boolean, limitMs = 4000) {
  const started = Date.now()
  const marks: { atOpen?: number; paint?: number; fresh?: number; final?: number } = {}
  const ok = await openAccountCards({ session: session(), social: true, dark: false, start: 'leaderboard' })
  expect(ok).toBe(true)
  // Rows on screen as the open returns: painted from memory, before any answer.
  marks.atOpen = rowsText().length
  while (Date.now() - started < limitMs && marks.final === undefined) {
    const rows = rowsText()
    const at = Date.now() - started
    if (rows.length && marks.paint === undefined) marks.paint = at
    if (rows.length && marks.fresh === undefined && fresh(rows)) marks.fresh = at
    if (rows.length && marks.fresh !== undefined && final(rows)) marks.final = at
    await vi.advanceTimersByTimeAsync(1)
  }
  return marks
}

const shows = (rows: string[], name: string, text: string) => rows.some(row => row.includes(name) && row.includes(text))

function report(name: string, marks: Record<string, number | undefined>, w: World) {
  if (LOG) process.stderr.write(`[board-speed] ${name}: rows at open ${marks.atOpen ?? 0}, paint ${marks.paint ?? '-'} ms, fresh ${marks.fresh ?? '-'} ms, own row final ${marks.final ?? '-'} ms; board requests ${w.boardRequests}; store reads ${w.calls.length} (NET ${NET} ms, RTT ${RTT} ms)\n`)
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'] })
  A = nextViewer()
  forgetBoards()
  localStorage.clear()
  resetReadingTimeSwitch()
  resetLedgerSends()
  document.body.innerHTML = '<main id="page"></main>'
})
afterEach(() => {
  closeAccountCards()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Leaderboard open, mocked latency (21 Oct 2026)', () => {
  function friendsWorld(): World {
    const w = world()
    w.tables.befriend(A, B); w.tables.befriend(A, C)
    w.tables.minutes(B, 50); w.tables.minutes(C, 30); w.tables.minutes(A, 12)
    return w
  }

  it('warm page (the idle warm-up read the board): the last board paints at once, the fresh one follows, the viewer\'s row ends on the flushed time', async () => {
    const w = friendsWorld()
    vi.stubGlobal('fetch', browserFetch(w))
    const warm = loadDefaultBoard(A, A)
    await vi.advanceTimersByTimeAsync(1000)
    expect(await warm).toBeTruthy()
    // A minute later.
    vi.setSystemTime(Date.now() + 60_000)
    // Since the warm-up: Bea read ten minutes more, and this device holds four minutes not yet sent.
    w.tables.minutes(B, 60)
    addPending(A, today(), 'frankenstein', { read: 4 * 60 })
    w.calls.length = 0; w.boardRequests = 0
    const marks = await timeOpen(w, rows => shows(rows, 'Bea', '1 h'), rows => shows(rows, 'You', '16 m'))
    report('warm page, friends, 1 pending entry', marks, w)
    expect(marks.atOpen).toBe(3)
    expect(marks.paint).toBeLessThan(150)
    expect(marks.fresh).toBeLessThan(800)
    expect(marks.final).toBeLessThan(800)
    // One board request: the Leaderboard shares the open's.
    expect(w.boardRequests).toBe(1)
  })

  it('cold page (nothing read yet), with time pending: the board does not wait for the flush', async () => {
    const w = friendsWorld()
    vi.stubGlobal('fetch', browserFetch(w))
    addPending(A, today(), 'frankenstein', { read: 4 * 60 })
    const marks = await timeOpen(w, rows => shows(rows, 'Bea', '50 m'), rows => shows(rows, 'You', '16 m'))
    report('cold page, friends, 1 pending entry', marks, w)
    expect(marks.fresh).toBeLessThan(800)
    expect(marks.final).toBeLessThan(800)
  })

  it('cold page, a slow flush (1.5 s): the board shows on time, the viewer\'s row catches up when the flush lands', async () => {
    const w = friendsWorld()
    w.flushMs = 1500
    vi.stubGlobal('fetch', browserFetch(w))
    addPending(A, today(), 'frankenstein', { read: 4 * 60 })
    const marks = await timeOpen(w, rows => shows(rows, 'Bea', '50 m'), rows => shows(rows, 'You', '16 m'))
    report('cold page, friends, slow flush 1.5 s', marks, w)
    expect(marks.fresh).toBeLessThan(800)
  })

  it('cold page, a flush that never answers: the board still shows on time (it used to wait the full 2 s)', async () => {
    const w = friendsWorld()
    w.flushMs = 10_000
    vi.stubGlobal('fetch', browserFetch(w))
    addPending(A, today(), 'frankenstein', { read: 4 * 60 })
    const marks = await timeOpen(w, rows => shows(rows, 'Bea', '50 m'), rows => shows(rows, 'You', '12 m'))
    report('cold page, friends, flush never answers', marks, w)
    expect(marks.fresh).toBeLessThan(800)
  })

  it('cold page, no friends while Everyone is open: one board request, not Friends and then Everyone', async () => {
    const w = world()
    w.tables.minutes(B, 50); w.tables.minutes(C, 30); w.tables.minutes(D, 20); w.tables.minutes(A, 12)
    vi.stubGlobal('fetch', browserFetch(w))
    const marks = await timeOpen(w, rows => shows(rows, 'Bea', '50 m'), rows => shows(rows, 'You', '12 m'))
    report('cold page, no friends, Everyone open, nothing pending', marks, w)
    expect(marks.fresh).toBeLessThan(800)
    expect(w.boardRequests).toBe(1)
  })
})
