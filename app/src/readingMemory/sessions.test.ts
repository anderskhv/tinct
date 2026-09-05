import { describe, expect, it } from 'vitest'
import { chapterFixtures, sessionFor } from './fixtures.test-helpers'
import {
  applyReadingMemoryEvent,
  applyReadingMemoryEvents,
  closeStaleSessions,
  emptyReadingMemory,
  eventFromSession,
  latestReadingSession,
  mergeReadingMemory,
  parseAnchor,
  parseReadingMemory,
  parseReadingSession,
  visibleToViewer,
} from './sessions'

const T0 = Date.UTC(2026, 8, 3, 9, 0)

describe('reading memory sessions', () => {
  it.each(chapterFixtures())('applies an event once and ignores the same (id, seq) replayed ($bookId ch$chapterNumber)', (fixture) => {
    const session = sessionFor(fixture, { state: 'started', startedAt: T0 })
    const once = applyReadingMemoryEvent(emptyReadingMemory(), eventFromSession(session))
    expect(once.sessions[session.id]).toEqual(session)
    const twice = applyReadingMemoryEvent(once, eventFromSession(session))
    expect(twice).toBe(once)
    const older = applyReadingMemoryEvent(once, eventFromSession({ ...session, seq: 0 } as typeof session))
    expect(older).toBe(once)
  })

  it('dedups out-of-order replays: the highest seq wins regardless of arrival order', () => {
    const fixture = chapterFixtures()[2]
    const s1 = sessionFor(fixture, { state: 'started', startedAt: T0, seq: 1 })
    const s2 = { ...sessionFor(fixture, { state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000, page: 2 }), seq: 2 }
    const s3 = { ...s2, seq: 3, endedAt: T0 + 120_000 }
    const forward = applyReadingMemoryEvents(emptyReadingMemory(), [s1, s2, s3].map(eventFromSession))
    const backward = applyReadingMemoryEvents(emptyReadingMemory(), [s3, s1, s2, s2, s3].map(eventFromSession))
    expect(forward).toEqual(backward)
    expect(forward.sessions[s1.id].seq).toBe(3)
    expect(forward.sessions[s1.id].endedAt).toBe(T0 + 120_000)
  })

  it('rejects a partially written anchor tuple', () => {
    const anchor = sessionFor(chapterFixtures()[0], { state: 'started', startedAt: T0 }).anchor
    expect(parseAnchor(anchor)).toEqual(anchor)
    expect(parseAnchor({ ...anchor, editionKey: undefined })).toBeNull()
    expect(parseAnchor({ ...anchor, chapterNumber: 0 })).toBeNull()
    expect(parseAnchor({ ...anchor, page: undefined })).toBeNull()
    expect(parseAnchor({ ...anchor, range: { ...anchor.range, lastWords: '' } })).toBeNull()
    expect(parseAnchor({ ...anchor, range: undefined })).toBeNull()
  })

  it('never accepts a completed state without its completion timestamp (or vice versa)', () => {
    const fixture = chapterFixtures()[1]
    const done = sessionFor(fixture, { state: 'completed', startedAt: T0, completedAt: T0 + 5_000 })
    expect(parseReadingSession(done)).toEqual(done)
    expect(parseReadingSession({ ...done, completedAt: null })).toBeNull()
    expect(parseReadingSession({ ...done, state: 'progressed' })).toBeNull()
    expect(parseReadingSession({ ...done, startedAt: 'yesterday' })).toBeNull()
  })

  it('drops malformed sessions when parsing a stored memory and keeps valid ones', () => {
    const fixture = chapterFixtures()[0]
    const good = sessionFor(fixture, { state: 'started', startedAt: T0 })
    const state = parseReadingMemory({
      v: 1,
      sessions: { [good.id]: good, junk: { id: 'junk' }, mismatched: { ...good, id: 'other' } },
      updatedAt: 'nope',
    })
    expect(Object.keys(state.sessions)).toEqual([good.id])
    expect(state.updatedAt).toBe(0)
  })

  it('merges device and cloud copies per session by seq and picks the latest by activity', () => {
    const [genesis, james] = chapterFixtures()
    const device = applyReadingMemoryEvents(emptyReadingMemory(), [
      eventFromSession(sessionFor(genesis, { id: 'g', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 1000, seq: 2 })),
    ])
    const cloud = applyReadingMemoryEvents(emptyReadingMemory(), [
      eventFromSession(sessionFor(genesis, { id: 'g', state: 'started', startedAt: T0, seq: 1 })),
      eventFromSession(sessionFor(james, { id: 'j', state: 'completed', startedAt: T0 + 5000, lastActiveAt: T0 + 9000, seq: 4 })),
    ])
    const merged = mergeReadingMemory(device, cloud)
    expect(merged.sessions.g.seq).toBe(2)
    expect(merged.sessions.j.state).toBe('completed')
    expect(latestReadingSession(merged)?.id).toBe('j')
  })

  it('reads a missing owner as no account, keeps a string owner, and ignores the extra keys the projection trigger does not read', () => {
    const fixture = chapterFixtures()[0]
    const session = sessionFor(fixture, { state: 'started', startedAt: T0 })
    const { owner: _omitted, ...legacy } = session
    void _omitted
    expect(parseReadingSession(legacy)?.owner).toBeNull()
    expect(parseReadingSession({ ...session, owner: 'user-a' })?.owner).toBe('user-a')
    expect(parseReadingSession({ ...session, owner: 42 })?.owner).toBeNull()
    // A malformed stored summary or error is dropped; the session survives.
    const parsed = parseReadingSession({ ...session, summary: { text: 'no provenance' }, summaryError: { at: 'never' } })
    expect(parsed).not.toBeNull()
    expect(parsed?.summary).toBeUndefined()
    expect(parsed?.summaryError).toBeUndefined()
  })

  it('closes open sessions older than the gap at their last real activity, idempotently', () => {
    const fixture = chapterFixtures()[1]
    const gap = 30 * 60_000
    const stale = sessionFor(fixture, { id: 'stale', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000 })
    const fresh = sessionFor(fixture, { id: 'fresh', state: 'started', startedAt: T0 + gap })
    const closed = sessionFor(fixture, { id: 'closed', state: 'started', startedAt: T0, endedAt: T0 })
    const state = applyReadingMemoryEvents(emptyReadingMemory(), [stale, fresh, closed].map(eventFromSession))
    const now = T0 + 60_000 + gap + 1
    const events = closeStaleSessions(state, now, gap)
    expect(events.map(event => event.sessionId)).toEqual(['stale'])
    expect(events[0].session).toMatchObject({ seq: stale.seq + 1, endedAt: stale.lastActiveAt, lastActiveAt: stale.lastActiveAt })
    const next = applyReadingMemoryEvents(state, events)
    expect(closeStaleSessions(next, now, gap)).toEqual([])
    expect(next.sessions.fresh.endedAt).toBeNull()
  })

  it('shows a viewer only unowned sessions and their own; the newest visible one wins', () => {
    const fixture = chapterFixtures()[2]
    const anonymous = sessionFor(fixture, { id: 'anon', state: 'started', startedAt: T0, owner: null })
    const mine = sessionFor(fixture, { id: 'mine', state: 'started', startedAt: T0 + 1000, owner: 'user-a' })
    const theirs = sessionFor(fixture, { id: 'theirs', state: 'started', startedAt: T0 + 2000, owner: 'user-b' })
    const state = applyReadingMemoryEvents(emptyReadingMemory(), [anonymous, mine, theirs].map(eventFromSession))
    expect(latestReadingSession(state)?.id).toBe('theirs')
    expect(latestReadingSession(state, visibleToViewer('user-a'))?.id).toBe('mine')
    expect(latestReadingSession(state, visibleToViewer(null))?.id).toBe('anon')
    expect(latestReadingSession(state, visibleToViewer('user-c'))?.id).toBe('anon')
  })
})
