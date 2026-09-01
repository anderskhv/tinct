// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabase', () => ({ supabase: null }))

import { persistReadingActivity, type DurableReadingActivitySession } from './readingActivity'

const PENDING_KEY = 'tinct:pending-reading-activity-v1'

describe('durable reading activity offline queue', () => {
  beforeEach(() => localStorage.clear())

  it('stores the newest session revision before a network attempt', async () => {
    const session: DurableReadingActivitySession = {
      sessionId: 'session-1',
      userId: 'user-1',
      bookId: 'odyssey',
      chapterNumber: 5,
      editionKey: 'original-en',
      mode: 'read',
      startedAt: 1_000,
      lastActiveAt: 1_000,
      startParagraphIndex: 3,
      lastParagraphIndex: 3,
      clientRevision: 1,
    }

    persistReadingActivity(session)
    persistReadingActivity({
      ...session,
      lastActiveAt: 2_000,
      lastParagraphIndex: 8,
      clientRevision: 2,
    })
    await Promise.resolve()

    expect(JSON.parse(localStorage.getItem(PENDING_KEY) || '[]')).toEqual([
      expect.objectContaining({
        sessionId: 'session-1',
        lastActiveAt: 2_000,
        lastParagraphIndex: 8,
        clientRevision: 2,
      }),
    ])
  })
})
