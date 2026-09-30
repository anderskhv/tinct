import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFunnel, FUNNEL_BATCH, FUNNEL_FLUSH_MS, FUNNEL_HEARTBEAT_MS, type FunnelDeps } from './utils/funnel'
import { createListenReporter, reportTalkSeconds, setUsageReportTransport } from './utils/usageReport'
import { gateLabAiAction } from './lab/labAccountPrompt'
import * as funnelModule from './utils/funnel'
import { createLibraryFunnel } from '../public/lab/library_2/funnel.js'

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

  it('batches listening into about a minute and reports the previous book on a switch', () => {
    const post = vi.fn()
    setUsageReportTransport(post)
    const reporter = createListenReporter(() => 'jwt')
    for (let i = 0; i < 11; i++) reporter.tick('odyssey', 5)
    expect(post).not.toHaveBeenCalled()
    reporter.tick('odyssey', 5)
    expect(post).toHaveBeenCalledWith('/api/narration/listen', { bookId: 'odyssey', seconds: 60 }, 'jwt')
    reporter.tick('odyssey', 5)
    reporter.tick('iliad', 5)
    expect(post).toHaveBeenLastCalledWith('/api/narration/listen', { bookId: 'odyssey', seconds: 5 }, 'jwt')
    reporter.flush()
    expect(post).toHaveBeenLastCalledWith('/api/narration/listen', { bookId: 'iliad', seconds: 5 }, 'jwt')
    reporter.flush() // nothing pending: no empty report
    expect(post).toHaveBeenCalledTimes(3)
  })
})
