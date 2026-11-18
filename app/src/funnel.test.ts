import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFunnel, FUNNEL_BATCH, FUNNEL_FLUSH_MS, FUNNEL_HEARTBEAT_MS, type FunnelDeps } from './utils/funnel'
import { createListenReporter, LISTEN_REPORT_EVERY_SECONDS, LISTEN_REPORT_MAX_SECONDS, reportTalkSeconds, setUsageReportTransport } from './utils/usageReport'
import { NARRATION_LISTEN_MAX_SECONDS } from './worker/routes/narration'
import { gateLabAiAction } from './lab/labAccountPrompt'
import * as funnelModule from './utils/funnel'
import { createLibraryFunnel, BEAT_MS as LIBRARY_BEAT_MS } from '../public/lab/library_2/funnel.js'

function harness(overrides: Partial<FunnelDeps> = {}) {
  const sent: Array<{ body: { deviceId: string; sessionId: string; surface: string; path: string; events: Array<{ name: string; props: Record<string, unknown> }> }; token: string | null }> = []
  const timers = new Map<number, { fn: () => void; ms: number }>()
  let nextTimer = 1
  const clock = { now: 1_000_000, visible: true }
  const seen = new Set<string>()
  const deps: FunnelDeps = {
    enabled: () => true,
    deviceId: () => 'device-1234abcd',
    sessionId: () => 'session1234abcd',
    path: () => '/reader',
    referrer: () => '',
    attribution: () => ({ first_touch: null, last_touch: null }),
    token: () => null,
    visible: () => clock.visible,
    now: () => clock.now,
    send: (body, token) => { sent.push({ body: JSON.parse(body), token }) },
    once: { has: name => seen.has(name), add: name => { seen.add(name) } },
    setTimer: (fn, ms) => { timers.set(nextTimer, { fn, ms }); return nextTimer++ },
    clearTimer: handle => { timers.delete(handle as number) },
    ...overrides,
  }
  const runTimers = () => { for (const [id, timer] of [...timers]) { timers.delete(id); timer.fn() } }
  return { deps, sent, timers, clock, runTimers }
}

afterEach(() => { setUsageReportTransport(null); vi.restoreAllMocks() })

describe('reader funnel client', () => {
  it('batches events and sends them after a short delay, carrying the device id', () => {
    const { deps, sent, timers, runTimers } = harness()
    const funnel = createFunnel(deps)
    funnel.track('book_opened', { book_id: 'odyssey' })
    funnel.track('chapter_completed', { book_id: 'odyssey', chapter: 1 })
    expect(sent).toHaveLength(0)
    expect([...timers.values()].map(timer => timer.ms)).toEqual([FUNNEL_FLUSH_MS])
    runTimers()
    expect(sent).toHaveLength(1)
    expect(sent[0].body).toMatchObject({ deviceId: 'device-1234abcd', sessionId: 'session1234abcd', surface: 'reader', path: '/reader' })
    expect(sent[0].body.events.map(event => event.name)).toEqual(['book_opened', 'chapter_completed'])
  })

  it('flushes at once when a batch fills, and sends the signed-in token with the batch', () => {
    const { deps, sent } = harness({ token: () => 'jwt' })
    const funnel = createFunnel(deps)
    for (let i = 0; i < FUNNEL_BATCH; i++) funnel.track('first_page_turn')
    expect(sent).toHaveLength(1)
    expect(sent[0].token).toBe('jwt')
  })

  it('counts a once-per-device event a single time', () => {
    const { deps, sent } = harness()
    const funnel = createFunnel(deps)
    funnel.trackOnce('first_page_turn', { book_id: 'a' })
    funnel.trackOnce('first_page_turn', { book_id: 'b' })
    funnel.flush()
    expect(sent[0].body.events).toHaveLength(1)
    expect(sent[0].body.events[0].props).toEqual({ book_id: 'a' })
  })

  it('counts a book-scoped event once per book, so a second book still counts', () => {
    const { deps, sent } = harness()
    const funnel = createFunnel(deps)
    funnel.trackOnce('first_page_turn', { book_id: 'a' }, 'a')
    funnel.trackOnce('first_page_turn', { book_id: 'a' }, 'a')
    funnel.trackOnce('first_page_turn', { book_id: 'b' }, 'b')
    funnel.flush()
    expect(sent[0].body.events.map((event: { props: unknown }) => event.props)).toEqual([{ book_id: 'a' }, { book_id: 'b' }])
  })

  it('reports visible time only, flushing on hide and on the heartbeat', () => {
    const { deps, sent, clock, timers } = harness()
    const funnel = createFunnel(deps)
    funnel.start()
    expect([...timers.values()].some(timer => timer.ms === FUNNEL_HEARTBEAT_MS)).toBe(true)
    clock.now += 45_000
    funnel.visibility(false) // tab hidden: duration reported and everything flushed
    expect(sent).toHaveLength(1)
    expect(sent[0].body.events.map(event => event.name)).toEqual(['pageview', 'page_duration'])
    expect(sent[0].body.events[1].props.duration_ms).toBe(45_000)
    clock.now += 600_000 // time spent hidden is not counted
    funnel.visibility(true)
    clock.now += 2_000
    funnel.visibility(false)
    expect(sent[1].body.events[0]).toMatchObject({ name: 'page_duration', props: { duration_ms: 2_000 } })
  })

  it('beats every 5 minutes, and heartbeats plus the hide report sum to the visible time', () => {
    expect(FUNNEL_HEARTBEAT_MS).toBe(5 * 60_000)
    const { deps, sent, clock, timers } = harness()
    const funnel = createFunnel(deps)
    funnel.start()
    const fireHeartbeat = () => {
      const entry = [...timers].find(([, timer]) => timer.ms === FUNNEL_HEARTBEAT_MS)!
      timers.delete(entry[0])
      entry[1].fn()
    }
    clock.now += FUNNEL_HEARTBEAT_MS; fireHeartbeat()
    clock.now += FUNNEL_HEARTBEAT_MS; fireHeartbeat()
    clock.now += 123_000
    funnel.visibility(false)
    const durations = sent.flatMap(entry => entry.body.events).filter(event => event.name === 'page_duration').map(event => event.props.duration_ms as number)
    expect(durations).toEqual([FUNNEL_HEARTBEAT_MS, FUNNEL_HEARTBEAT_MS, 123_000])
    expect(durations.reduce((a, b) => a + b, 0)).toBe(2 * FUNNEL_HEARTBEAT_MS + 123_000)
  })

  it('sends nothing when disabled and never throws into the reader', () => {
    const off = harness({ enabled: () => false })
    const disabled = createFunnel(off.deps)
    disabled.start(); disabled.track('book_opened'); disabled.trackOnce('ai_first_use'); disabled.visibility(false); disabled.flush()
    expect(off.sent).toHaveLength(0)
    expect(off.timers.size).toBe(0)

    const broken = harness({ send: () => { throw new Error('network') }, deviceId: () => { throw new Error('storage') } })
    const funnel = createFunnel(broken.deps)
    expect(() => { funnel.start(); funnel.track('book_opened'); funnel.flush(); funnel.visibility(false); funnel.stop() }).not.toThrow()
  })

  it('keeps non-primitive props out of the wire', () => {
    const { deps, sent } = harness()
    const funnel = createFunnel(deps)
    funnel.track('book_opened', { book_id: 'x', nested: { a: 1 } as never, missing: undefined })
    funnel.flush()
    expect(sent[0].body.events[0].props).toEqual({ book_id: 'x' })
  })
})

describe('AI gate funnel events', () => {
  const storageWith = (count: number) => {
    const data = new Map<string, string>([['tinct:lab-ai-actions', String(count)]])
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v) }, removeItem: (k: string) => { data.delete(k) } }
  }

  it('an allowed anonymous use is the first AI use; the eleventh reaches the limit', () => {
    const track = vi.spyOn(funnelModule, 'trackFunnel').mockImplementation(() => {})
    const once = vi.spyOn(funnelModule, 'trackFunnelOnce').mockImplementation(() => {})
    gateLabAiAction({ signedIn: false, storage: storageWith(0) })
    expect(once).toHaveBeenCalledWith('ai_first_use', { signed_in: false })
    expect(track).not.toHaveBeenCalled()
    gateLabAiAction({ signedIn: false, storage: storageWith(10) })
    expect(track).toHaveBeenCalledWith('anon_limit_reached', { free_actions: 10 })
  })

  it('a signed-in use is a member AI use', () => {
    const track = vi.spyOn(funnelModule, 'trackFunnel').mockImplementation(() => {})
    vi.spyOn(funnelModule, 'trackFunnelOnce').mockImplementation(() => {})
    gateLabAiAction({ signedIn: true, storage: storageWith(99) })
    expect(track).toHaveBeenCalledWith('member_ai_use')
  })
})

describe('library funnel client (public/lab/library_2/funnel.js)', () => {
  function libraryHarness(enabled = true) {
    const sent: string[] = []
    const seen = new Set<string>()
    const once = new Set<string>()
    const clock = { now: 5_000 }
    const deps = {
      enabled: () => enabled, deviceId: () => 'device-1234abcd', sessionId: () => 'session1234abcd', path: () => '/library', referrer: () => '',
      attribution: () => ({ last_touch: { utm_source: 'newsletter' } }), visible: () => true, now: () => clock.now,
      sessionSeen: { has: (n: string) => seen.has(n), add: (n: string) => { seen.add(n) } },
      once: { has: (n: string) => once.has(n), add: (n: string) => { once.add(n) } },
      send: (body: string) => { sent.push(body) },
    }
    return { deps, sent, clock }
  }

  it('records the pageview and landing_view once per tab session, then the visible time on hide', () => {
    const { deps, sent, clock } = libraryHarness()
    const client = createLibraryFunnel(deps)
    client.start()
    client.start() // a second start in the same tab session is not a second landing
    clock.now += 12_000
    client.visibility(false)
    client.stop()
    const events = sent.flatMap(body => JSON.parse(body).events as Array<{ name: string; props: Record<string, unknown> }>)
    expect(events.filter(event => event.name === 'landing_view')).toHaveLength(1)
    expect(events.find(event => event.name === 'page_duration')?.props.duration_ms).toBe(12_000)
    expect(JSON.parse(sent[0])).toMatchObject({ surface: 'library', path: '/library', deviceId: 'device-1234abcd', attribution: { last_touch: { utm_source: 'newsletter' } } })
  })

  it('beats every 5 minutes and loses no visible time on hide', () => {
    vi.useFakeTimers()
    try {
      expect(LIBRARY_BEAT_MS).toBe(5 * 60_000)
      const { deps, sent, clock } = libraryHarness()
      const client = createLibraryFunnel(deps)
      client.start()
      clock.now += LIBRARY_BEAT_MS; vi.advanceTimersByTime(LIBRARY_BEAT_MS)
      clock.now += 30_000
      client.visibility(false)
      client.stop()
      vi.runAllTimers()
      const durations = sent.flatMap(body => JSON.parse(body).events as Array<{ name: string; props: Record<string, number> }>)
        .filter(event => event.name === 'page_duration').map(event => event.props.duration_ms)
      expect(durations).toEqual([LIBRARY_BEAT_MS, 30_000])
    } finally {
      vi.useRealTimers()
    }
  })

  it('sends nothing when disabled and swallows transport errors', () => {
    const off = libraryHarness(false)
    const quiet = createLibraryFunnel(off.deps)
    quiet.start(); quiet.visibility(false)
    expect(off.sent).toHaveLength(0)
    const broken = libraryHarness()
    const client = createLibraryFunnel({ ...broken.deps, send: () => { throw new Error('offline') } })
    expect(() => { client.start(); client.visibility(false); client.stop() }).not.toThrow()
  })
})

describe('usage reports', () => {
  it('reports Talk seconds only for a signed-in session of at least a second', () => {
    const post = vi.fn()
    setUsageReportTransport(post)
    reportTalkSeconds({ seconds: 75.4, authToken: 't', bookId: 'bible' })
    reportTalkSeconds({ seconds: 75, authToken: null })
    reportTalkSeconds({ seconds: 0.4, authToken: 't' })
    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith('/api/voice-usage', { seconds: 75, bookId: 'bible' }, 't')
  })

  it('batches listening into about five minutes and reports the previous book on a switch', () => {
    // Interval change (DB IO trim, 20 Oct 2026): was 60 s a report, now 300 s.
    expect(LISTEN_REPORT_EVERY_SECONDS).toBe(300)
    const post = vi.fn()
    setUsageReportTransport(post)
    const reporter = createListenReporter(() => 'jwt')
    for (let i = 0; i < 59; i++) reporter.tick('odyssey', 5)
    expect(post).not.toHaveBeenCalled()
    reporter.tick('odyssey', 5)
    expect(post).toHaveBeenCalledWith('/api/narration/listen', { bookId: 'odyssey', seconds: 300 }, 'jwt')
    reporter.tick('odyssey', 5)
    reporter.tick('iliad', 5)
    expect(post).toHaveBeenLastCalledWith('/api/narration/listen', { bookId: 'odyssey', seconds: 5 }, 'jwt')
    reporter.flush()
    expect(post).toHaveBeenLastCalledWith('/api/narration/listen', { bookId: 'iliad', seconds: 5 }, 'jwt')
    reporter.flush() // nothing pending: no empty report
    expect(post).toHaveBeenCalledTimes(3)
  })

  it('reports the same listened total in fewer rows, never above the Worker cap per report', () => {
    expect(LISTEN_REPORT_MAX_SECONDS).toBe(NARRATION_LISTEN_MAX_SECONDS)
    const post = vi.fn()
    setUsageReportTransport(post)
    const reporter = createListenReporter(() => null)
    // 17 minutes 35 seconds of playback in 5 s ticks, then a stop.
    for (let i = 0; i < 211; i++) reporter.tick('odyssey', 5)
    reporter.flush()
    const seconds = post.mock.calls.map(call => (call[1] as { seconds: number }).seconds)
    expect(seconds).toEqual([300, 300, 300, 155])
    expect(seconds.reduce((a, b) => a + b, 0)).toBe(211 * 5)
    // One odd large tick is split, so nothing is clipped by the Worker.
    post.mockClear()
    reporter.tick('odyssey', 700)
    expect(post.mock.calls.map(call => (call[1] as { seconds: number }).seconds)).toEqual([300, 300, 100])
  })
})

describe('internal traffic (?internal=1) in the funnel', () => {
  type Sent = { events: Array<{ name: string; props: Record<string, unknown> }> }

  it('reader: marks every event internal: true while the flag is set', () => {
    const { deps, sent, runTimers } = harness({ internal: () => true })
    const funnel = createFunnel(deps)
    funnel.start()
    funnel.track('book_opened', { book_id: 'odyssey' })
    runTimers()
    const events = sent.flatMap(entry => entry.body.events)
    expect(events.map(event => event.name)).toEqual(['pageview', 'book_opened'])
    for (const event of events) expect(event.props.internal).toBe(true)
    expect(events[1].props.book_id).toBe('odyssey')
  })

  it('reader: checks the flag when sending, so events queued just before it was set are marked too', () => {
    let internal = false
    const { deps, sent, runTimers } = harness({ internal: () => internal })
    const funnel = createFunnel(deps)
    funnel.track('first_page_turn')
    internal = true
    runTimers()
    expect(sent[0].body.events[0].props.internal).toBe(true)
  })

  it('reader: sends no internal prop without the flag', () => {
    const { deps, sent, runTimers } = harness({ internal: () => false })
    const funnel = createFunnel(deps)
    funnel.track('book_opened', { book_id: 'odyssey' })
    runTimers()
    expect(sent[0].body.events[0].props).not.toHaveProperty('internal')
  })

  it('library: marks every event internal: true while the flag is set, and nothing otherwise', () => {
    const run = (internal: boolean) => {
      const sent: string[] = []
      const seen = new Set<string>()
      const client = createLibraryFunnel({
        enabled: () => true, internal: () => internal, deviceId: () => 'device-1234abcd', sessionId: () => 'session1234abcd', path: () => '/library', referrer: () => '',
        attribution: () => ({}), visible: () => true, now: () => 1_000,
        sessionSeen: { has: (n: string) => seen.has(n), add: (n: string) => { seen.add(n) } },
        once: { has: () => false, add: () => {} },
        send: (body: string) => { sent.push(body) },
      })
      client.start()
      client.track('book_intro_viewed', { book_id: 'odyssey' })
      client.flush()
      client.stop()
      return sent.flatMap(body => (JSON.parse(body) as Sent).events)
    }
    const marked = run(true)
    expect(marked.map(event => event.name)).toEqual(['pageview', 'landing_view', 'book_intro_viewed'])
    for (const event of marked) expect(event.props.internal).toBe(true)
    for (const event of run(false)) expect(event.props).not.toHaveProperty('internal')
  })
})
