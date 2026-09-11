import { describe, expect, it, vi } from 'vitest'
import { chapterFixtures, sessionFor } from './fixtures.test-helpers'
import {
  RECAP_SUMMARY_PROMPT_VERSION,
  RECAP_SUMMARY_ROUTE,
  SUMMARY_MAX_ATTEMPTS,
  SUMMARY_RETRY_AFTER_MS,
  requestRecapSummary,
  summaryAttemptDue,
  summaryMatchesSession,
  withStoredSummary,
  withSummaryError,
} from './summary'
import { parseReadingSession } from './sessions'

const T0 = Date.UTC(2026, 8, 5, 9, 0)
const HOUR = 60 * 60 * 1000

function closedSession(fixtureIndex = 0) {
  const fixture = chapterFixtures()[fixtureIndex]
  return { fixture, session: sessionFor(fixture, { state: 'progressed', startedAt: T0, lastActiveAt: T0 + 10 * 60_000, endedAt: T0 + 10 * 60_000, page: 1 }) }
}

describe('automatic summary policy', () => {
  it.each(chapterFixtures())('is due only for a closed session without a summary ($bookId ch$chapterNumber)', (fixture) => {
    const open = sessionFor(fixture, { state: 'progressed', startedAt: T0, lastActiveAt: T0 + 60_000 })
    expect(summaryAttemptDue(open, T0 + HOUR)).toEqual({ attempt: false, reason: 'open' })
    const closed = { ...open, seq: 2, endedAt: open.lastActiveAt }
    expect(summaryAttemptDue(closed, T0 + HOUR)).toEqual({ attempt: true })
    const summarised = withStoredSummary(closed, { text: 'A recap.', model: 'm', version: 'v' }, T0 + HOUR)
    expect(summaryAttemptDue(summarised, T0 + 2 * HOUR)).toEqual({ attempt: false, reason: 'has-summary' })
  })

  it('stores the summary inside the session with provenance and a new seq', () => {
    const { session } = closedSession(2)
    const stored = withStoredSummary(session, { text: 'Socrates goes down to the Piraeus.', model: 'claude-x', version: RECAP_SUMMARY_PROMPT_VERSION }, T0 + HOUR)
    expect(stored.seq).toBe(session.seq + 1)
    expect(stored.summary).toEqual({
      text: 'Socrates goes down to the Piraeus.',
      model: 'claude-x',
      route: RECAP_SUMMARY_ROUTE,
      version: RECAP_SUMMARY_PROMPT_VERSION,
      generatedAt: T0 + HOUR,
      sessionSeq: session.seq,
      anchor: session.anchor,
    })
    expect(stored.summaryError).toBeUndefined()
    // Round-trips through the parser, so it survives the versioned row.
    expect(parseReadingSession(JSON.parse(JSON.stringify(stored)))).toEqual(stored)
    expect(summaryMatchesSession(stored)).toEqual(stored.summary)
  })

  it('ignores a stored summary grounded in a different anchor', () => {
    const { session } = closedSession(2)
    const other = sessionFor(chapterFixtures()[1], { state: 'completed', startedAt: T0, endedAt: T0 })
    const stored = withStoredSummary(session, { text: 'x', model: 'm', version: 'v' }, T0 + HOUR)
    const mismatched = { ...stored, anchor: other.anchor }
    expect(summaryMatchesSession(mismatched)).toBeNull()
    expect(summaryAttemptDue(mismatched, T0 + 2 * HOUR)).toEqual({ attempt: true })
  })

  it('backs off one hour after a failure and stops after the attempt cap', () => {
    const { session } = closedSession(1)
    const failed1 = withSummaryError(session, 'chat route returned 503', T0 + HOUR)
    expect(failed1.seq).toBe(session.seq + 1)
    expect(failed1.summaryError).toEqual({ at: T0 + HOUR, attempts: 1, message: 'chat route returned 503' })
    expect(summaryAttemptDue(failed1, T0 + HOUR + SUMMARY_RETRY_AFTER_MS - 1)).toEqual({ attempt: false, reason: 'backoff' })
    expect(summaryAttemptDue(failed1, T0 + HOUR + SUMMARY_RETRY_AFTER_MS)).toEqual({ attempt: true })
    // A user-initiated retry ignores the clock, never the cap.
    expect(summaryAttemptDue(failed1, T0 + HOUR + 1, { manual: true })).toEqual({ attempt: true })
    let current = failed1
    for (let attempt = 2; attempt <= SUMMARY_MAX_ATTEMPTS; attempt++) {
      current = withSummaryError(current, 'still failing', T0 + attempt * 2 * HOUR)
      expect(current.summaryError?.attempts).toBe(attempt)
    }
    expect(summaryAttemptDue(current, T0 + 100 * HOUR)).toEqual({ attempt: false, reason: 'exhausted' })
    expect(summaryAttemptDue(current, T0 + 100 * HOUR, { manual: true })).toEqual({ attempt: false, reason: 'exhausted' })
  })
})

describe('summary request through the worker chat path', () => {
  it('never calls the route without a bearer token (signed out)', async () => {
    const { fixture, session } = closedSession(0)
    const fetchImpl = vi.fn()
    const result = await requestRecapSummary({ token: null, session, paragraphs: fixture.paragraphs, fetchImpl })
    expect(result).toEqual({ ok: false, error: 'not signed in' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts the exact passage non-streaming with the bearer token and returns the model it ran on', async () => {
    const { fixture, session } = closedSession(2)
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { stream: boolean; messages: Array<{ content: string }> }
      expect(body.stream).toBe(false)
      expect(body.messages[0].content).toContain('I went down yesterday to the Piraeus')
      return { ok: true, status: 200, json: async () => ({ model: 'claude-served', content: [{ type: 'text', text: '  Socrates heads down to the port.  ' }] }) }
    })
    const result = await requestRecapSummary({ token: 'tok', session, paragraphs: fixture.paragraphs, fetchImpl, apiBase: 'https://x.test' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0][0]).toBe(`https://x.test${RECAP_SUMMARY_ROUTE}`)
    expect((fetchImpl.mock.calls[0][1].headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(result).toEqual({ ok: true, summary: { text: 'Socrates heads down to the port.', model: 'claude-served', version: RECAP_SUMMARY_PROMPT_VERSION } })
  })

  it('reports a failed route or empty answer instead of inventing text', async () => {
    const { fixture, session } = closedSession(1)
    const failing = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }))
    expect(await requestRecapSummary({ token: 'tok', session, paragraphs: fixture.paragraphs, fetchImpl: failing })).toEqual({ ok: false, error: 'chat route returned 503' })
    const empty = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ content: [] }) }))
    expect(await requestRecapSummary({ token: 'tok', session, paragraphs: fixture.paragraphs, fetchImpl: empty })).toEqual({ ok: false, error: 'chat route returned no text' })
    const thrown = vi.fn(async () => { throw new Error('offline') })
    expect(await requestRecapSummary({ token: 'tok', session, paragraphs: fixture.paragraphs, fetchImpl: thrown })).toEqual({ ok: false, error: 'offline' })
  })
})
