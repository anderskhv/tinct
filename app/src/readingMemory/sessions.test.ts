import { describe, expect, it } from 'vitest'
import { chapterFixtures, sessionFor } from './fixtures.test-helpers'
import {
  applyReadingMemoryEvent,
  applyReadingMemoryEvents,
  emptyReadingMemory,
  eventFromSession,
  latestReadingSession,
  mergeReadingMemory,
  parseAnchor,
  parseReadingMemory,
  parseReadingSession,
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
})
