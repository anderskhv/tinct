import { describe, expect, it } from 'vitest'
import { advanceDurableReadingSession, mergePendingReadingActivity, type DurableReadingActivitySession } from './readingActivity'

const point = {
  userId: 'user-1',
  bookId: 'odyssey',
  chapterNumber: 5,
  editionKey: 'original-en',
  mode: 'read' as const,
  paragraphIndex: 3,
  now: 1_000,
}

describe('advanceDurableReadingSession', () => {
  it('keeps a stable id while extending one reading session', () => {
    const first = advanceDurableReadingSession({ previous: null, point, createId: () => 'session-1' })
    const second = advanceDurableReadingSession({
      previous: first,
      point: { ...point, paragraphIndex: 9, now: 2_000 },
      createId: () => 'should-not-be-used',
    })

    expect(second).toMatchObject({
      sessionId: 'session-1',
      startedAt: 1_000,
      lastActiveAt: 2_000,
      startParagraphIndex: 3,
      lastParagraphIndex: 9,
      clientRevision: 2,
    })
  })

  it('starts independent records across chapter, mode, user, and inactivity boundaries', () => {
    const first = advanceDurableReadingSession({ previous: null, point, createId: () => 'session-1' })
    const changes = [
      { ...point, chapterNumber: 6, now: 2_000 },
      { ...point, mode: 'listened' as const, now: 2_000 },
      { ...point, userId: 'user-2', now: 2_000 },
      { ...point, now: 31 * 60 * 1_000 },
    ]

    for (const changed of changes) {
      expect(advanceDurableReadingSession({ previous: first, point: changed, createId: () => 'session-2' }).sessionId)
        .toBe('session-2')
    }
  })
})

describe('mergePendingReadingActivity', () => {
  const current: DurableReadingActivitySession = {
    sessionId: 'session-1',
    userId: 'user-1',
    bookId: 'odyssey',
    chapterNumber: 5,
    editionKey: 'original-en',
    mode: 'read',
    startedAt: 1_000,
    lastActiveAt: 3_000,
    startParagraphIndex: 3,
    lastParagraphIndex: 8,
    clientRevision: 3,
  }

  it('keeps the newest revision when an older retry arrives later', () => {
    expect(mergePendingReadingActivity(current, {
      ...current,
      lastActiveAt: 2_000,
      lastParagraphIndex: 5,
      clientRevision: 2,
    })).toEqual(current)
  })

  it('accepts the newest end of the paragraph range', () => {
    expect(mergePendingReadingActivity(current, {
      ...current,
      lastActiveAt: 4_000,
      lastParagraphIndex: 11,
      clientRevision: 4,
    })).toMatchObject({ lastActiveAt: 4_000, lastParagraphIndex: 11, clientRevision: 4 })
  })
})
