import { describe, expect, it } from 'vitest'
import { ensureReadingLogChapter, getReadingLogTransition, recordReadingLogActivity, sanitizeReadingLog } from './useReadingLog.guards'
import { getPersistableReaderHistoryLocation } from './useReadingPosition.guards'
import type { BookReadingLog } from '../types'

describe('sanitizeReadingLog', () => {
  it('drops logs whose internal bookId does not match the storage key book', () => {
    const log = {
      bookId: 'the-awakening',
      updatedAt: 123,
      chapters: {
        30: { chapterNumber: 30, editions: ['original-en'], readCount: 1, firstReadAt: 0, lastReadAt: 0, completed: false },
      },
    } satisfies BookReadingLog

    expect(sanitizeReadingLog({ bookId: 'bible', log, totalChapters: 1189 })).toEqual({
      bookId: 'bible',
      chapters: {},
      updatedAt: 0,
    })
  })

  it('removes chapters outside the current book bounds', () => {
    const log = {
      bookId: 'the-awakening',
      updatedAt: 123,
      chapters: {
        30: { chapterNumber: 30, editions: ['original-en'], readCount: 1, firstReadAt: 0, lastReadAt: 0, completed: false },
        483: { chapterNumber: 483, editions: ['kjv-en'], readCount: 1, firstReadAt: 0, lastReadAt: 0, completed: false },
      },
    } satisfies BookReadingLog

    const cleaned = sanitizeReadingLog({ bookId: 'the-awakening', log, totalChapters: 39 })
    expect(Object.keys(cleaned.chapters)).toEqual(['30'])
  })

  it('removes edition usage that belongs to another book', () => {
    const log = {
      bookId: 'the-awakening',
      updatedAt: 123,
      chapters: {
        1: {
          chapterNumber: 1,
          editions: ['original-en', 'kjv-en'],
          editionUsage: [
            { key: 'original-en', mode: 'read' },
            { key: 'kjv-en', mode: 'listened' },
          ],
          readCount: 1,
          firstReadAt: 0,
          lastReadAt: 0,
          completed: false,
        },
      },
    } satisfies BookReadingLog

    const cleaned = sanitizeReadingLog({
      bookId: 'the-awakening',
      log,
      totalChapters: 39,
      allowedEditionKeys: ['original-en', 'modern-en', 'modern-da'],
    })

    expect(cleaned.chapters[1].editions).toEqual(['original-en'])
    expect(cleaned.chapters[1].editionUsage).toEqual([{ key: 'original-en', mode: 'read' }])
  })
})

describe('ensureReadingLogChapter', () => {
  it('creates a missing current-chapter record without requiring a chapter transition', () => {
    const log: BookReadingLog = { bookId: 'bible', chapters: {}, updatedAt: 0 }

    const next = ensureReadingLogChapter({
      log,
      bookId: 'bible',
      chapterNumber: 967,
      editionKey: 'kjv-en',
      mode: 'read',
      countVisit: false,
      now: 123,
    })

    expect(next.chapters[967]).toMatchObject({
      chapterNumber: 967,
      editions: ['kjv-en'],
      editionUsage: [{ key: 'kjv-en', mode: 'read' }],
      readCount: 1,
      firstReadAt: 123,
      lastReadAt: 123,
      completed: false,
    })
    expect(next.updatedAt).toBe(123)
  })

  it('does not increment read count for same-chapter re-renders', () => {
    const log: BookReadingLog = {
      bookId: 'bible',
      updatedAt: 123,
      chapters: {
        967: {
          chapterNumber: 967,
          editions: ['kjv-en'],
          editionUsage: [{ key: 'kjv-en', mode: 'read' }],
          readCount: 1,
          firstReadAt: 123,
          lastReadAt: 123,
          completed: false,
        },
      },
    }

    const next = ensureReadingLogChapter({
      log,
      bookId: 'bible',
      chapterNumber: 967,
      editionKey: 'kjv-en',
      mode: 'read',
      countVisit: false,
      now: 456,
    })

    expect(next).toBe(log)
    expect(next.chapters[967].readCount).toBe(1)
  })

  it('increments read count on an actual visit transition', () => {
    const log: BookReadingLog = {
      bookId: 'bible',
      updatedAt: 123,
      chapters: {
        967: {
          chapterNumber: 967,
          editions: ['kjv-en'],
          editionUsage: [{ key: 'kjv-en', mode: 'read' }],
          readCount: 1,
          firstReadAt: 123,
          lastReadAt: 123,
          completed: false,
        },
      },
    }

    const next = ensureReadingLogChapter({
      log,
      bookId: 'bible',
      chapterNumber: 967,
      editionKey: 'web-en',
      mode: 'read',
      countVisit: true,
      now: 456,
    })

    expect(next.chapters[967]).toMatchObject({
      editions: ['kjv-en', 'web-en'],
      readCount: 2,
      lastReadAt: 456,
    })
  })
})

describe('getReadingLogTransition', () => {
  it('treats the first ready readerSession location as initialization, not a legacy currentChapter transition', () => {
    expect(getReadingLogTransition({
      previousBookId: 'odyssey',
      previousChapter: null,
      bookId: 'odyssey',
      activeChapter: 5,
    })).toEqual({
      isFirstPersistableLocation: true,
      isChapterChange: false,
      isBookChange: false,
      chapterToFlush: null,
    })
  })

  it('uses the previous persistable readerSession chapter for real transitions', () => {
    expect(getReadingLogTransition({
      previousBookId: 'odyssey',
      previousChapter: 5,
      bookId: 'odyssey',
      activeChapter: 6,
    })).toEqual({
      isFirstPersistableLocation: false,
      isChapterChange: true,
      isBookChange: false,
      chapterToFlush: 5,
    })
  })
})

describe('recordReadingLogActivity', () => {
  it('extends a recent session while preserving its starting paragraph', () => {
    const initial: BookReadingLog = { bookId: 'odyssey', chapters: {}, updatedAt: 0 }
    const first = recordReadingLogActivity({
      log: initial,
      bookId: 'odyssey',
      chapterNumber: 5,
      editionKey: 'original-en',
      mode: 'read',
      paragraphIndex: 3,
      totalParagraphs: 20,
      now: 1_000,
    })
    const second = recordReadingLogActivity({
      log: first,
      bookId: 'odyssey',
      chapterNumber: 5,
      editionKey: 'original-en',
      mode: 'read',
      paragraphIndex: 8,
      totalParagraphs: 20,
      now: 2_000,
    })

    expect(second.chapters[5].sessions).toEqual([{
      startedAt: 1_000,
      lastActiveAt: 2_000,
      editionKey: 'original-en',
      mode: 'read',
      startParagraphIndex: 3,
      lastParagraphIndex: 8,
    }])
    expect(second.chapters[5].lastReadAt).toBe(2_000)
  })

  it('starts a new session after the inactivity gap', () => {
    const first = recordReadingLogActivity({
      log: { bookId: 'odyssey', chapters: {}, updatedAt: 0 },
      bookId: 'odyssey',
      chapterNumber: 5,
      editionKey: 'original-en',
      mode: 'read',
      paragraphIndex: 3,
      now: 1_000,
    })
    const second = recordReadingLogActivity({
      log: first,
      bookId: 'odyssey',
      chapterNumber: 5,
      editionKey: 'original-en',
      mode: 'read',
      paragraphIndex: 4,
      now: 31 * 60 * 1_000,
    })

    expect(second.chapters[5].sessions).toHaveLength(2)
  })

  it('rejects a stale cross-book activity write', () => {
    const log: BookReadingLog = { bookId: 'odyssey', chapters: {}, updatedAt: 0 }
    expect(recordReadingLogActivity({
      log,
      bookId: 'bible',
      chapterNumber: 1,
      editionKey: 'kjv-en',
      mode: 'read',
      paragraphIndex: 0,
      now: 1_000,
    })).toBe(log)
  })
})

describe('getPersistableReaderHistoryLocation', () => {
  const location = {
    bookId: 'the-awakening',
    chapterNumber: 12,
    paragraphIndex: 4,
    scrollFraction: 0.5,
    editionKey: 'original-en',
    activeView: 'read',
    source: 'reader-layout',
    revision: 7,
  } as const

  it('accepts a ready same-book readerSession location', () => {
    expect(getPersistableReaderHistoryLocation({
      bookId: 'the-awakening',
      status: 'ready',
      location,
      totalChapters: 39,
      allowedEditionKeys: ['original-en'],
    })).toBe(location)
  })

  it('blocks history writes while the readerSession is switching books', () => {
    expect(getPersistableReaderHistoryLocation({
      bookId: 'the-awakening',
      status: 'switching-book',
      location,
      totalChapters: 39,
      allowedEditionKeys: ['original-en'],
    })).toBeNull()
  })

  it('blocks stale cross-book locations before they can write reading history', () => {
    expect(getPersistableReaderHistoryLocation({
      bookId: 'the-awakening',
      status: 'ready',
      location: { ...location, bookId: 'bible', chapterNumber: 967, editionKey: 'kjv-en' },
      totalChapters: 39,
      allowedEditionKeys: ['original-en'],
    })).toBeNull()
  })

  it('blocks chapters and editions outside the active book bounds', () => {
    expect(getPersistableReaderHistoryLocation({
      bookId: 'the-awakening',
      status: 'ready',
      location: { ...location, chapterNumber: 40 },
      totalChapters: 39,
      allowedEditionKeys: ['original-en'],
    })).toBeNull()

    expect(getPersistableReaderHistoryLocation({
      bookId: 'the-awakening',
      status: 'ready',
      location: { ...location, editionKey: 'kjv-en' },
      totalChapters: 39,
      allowedEditionKeys: ['original-en'],
    })).toBeNull()
  })
})
