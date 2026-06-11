import { describe, expect, it } from 'vitest'
import { ensureReadingLogChapter, sanitizeReadingLog } from './useReadingLog.guards'
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
