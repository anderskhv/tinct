import { describe, expect, it } from 'vitest'
import type { BookReadingLog } from '../types'
import { findReadingActivity, readingPassageExcerpt } from './readingMemory'

const books = [
  { id: 'odyssey', title: 'The Odyssey', author: 'Homer' },
  { id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare' },
]

function localTime(day: number, hour: number): number {
  return new Date(2026, 7, day, hour, 0, 0, 0).getTime()
}

describe('findReadingActivity', () => {
  const now = localTime(31, 12)
  const logs: BookReadingLog[] = [{
    bookId: 'odyssey',
    updatedAt: localTime(31, 10),
    chapters: {
      4: {
        chapterNumber: 4,
        editions: ['original-en'],
        readCount: 1,
        firstReadAt: localTime(29, 20),
        lastReadAt: localTime(29, 20),
        completed: false,
        sessions: [{
          startedAt: localTime(29, 20),
          lastActiveAt: localTime(29, 20) + 10_000,
          editionKey: 'original-en',
          mode: 'read',
          startParagraphIndex: 1,
          lastParagraphIndex: 3,
        }],
      },
      5: {
        chapterNumber: 5,
        editions: ['original-en'],
        readCount: 2,
        firstReadAt: localTime(30, 18),
        lastReadAt: localTime(31, 10),
        completed: false,
        sessions: [
          {
            startedAt: localTime(30, 18),
            lastActiveAt: localTime(30, 18) + 10_000,
            editionKey: 'original-en',
            mode: 'read',
            startParagraphIndex: 4,
            lastParagraphIndex: 8,
          },
          {
            startedAt: localTime(31, 10),
            lastActiveAt: localTime(31, 10) + 10_000,
            editionKey: 'original-en',
            mode: 'listened',
            startParagraphIndex: 9,
            lastParagraphIndex: 12,
          },
        ],
      },
    },
  }]

  it('finds yesterday by local calendar day, even after revisiting the chapter today', () => {
    const hits = findReadingActivity({ logs, books, period: 'yesterday', now })
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ chapterNumber: 5, startParagraphIndex: 4, lastParagraphIndex: 8 })
  })

  it('finds the day before yesterday', () => {
    expect(findReadingActivity({ logs, books, period: 'day_before_yesterday', now }))
      .toMatchObject([{ chapterNumber: 4 }])
  })

  it('filters by a natural book title', () => {
    expect(findReadingActivity({ logs, books, period: 'last_session', now, bookQuery: 'Odyssey' }))
      .toMatchObject([{ bookId: 'odyssey', chapterNumber: 5, mode: 'listened' }])
    expect(findReadingActivity({ logs, books, period: 'last_session', now, bookQuery: 'Hamlet' }))
      .toEqual([])
  })

  it('falls back to the latest timestamp in a legacy chapter record', () => {
    const legacy: BookReadingLog = {
      bookId: 'hamlet',
      updatedAt: localTime(30, 9),
      chapters: {
        2: {
          chapterNumber: 2,
          editions: ['original-en'],
          readCount: 1,
          firstReadAt: localTime(30, 9),
          lastReadAt: localTime(30, 9),
          completed: false,
          lastParagraphIndex: 7,
        },
      },
    }
    expect(findReadingActivity({ logs: [legacy], books, period: 'yesterday', now }))
      .toMatchObject([{ bookId: 'hamlet', chapterNumber: 2, legacy: true, lastParagraphIndex: 7 }])
  })

  it('prefers a durable row and merges the matching legacy mirror without duplication', () => {
    const yesterday = localTime(30, 18)
    const hits = findReadingActivity({
      logs,
      durableSessions: [{
        sessionId: 'session-1',
        userId: 'user-1',
        bookId: 'odyssey',
        chapterNumber: 5,
        editionKey: 'original-en',
        mode: 'read',
        startedAt: yesterday,
        lastActiveAt: yesterday + 5_000,
        startParagraphIndex: 4,
        lastParagraphIndex: 6,
        clientRevision: 2,
      }],
      books,
      period: 'yesterday',
      now,
    })

    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({
      sessionId: 'session-1',
      source: 'durable',
      startParagraphIndex: 4,
      lastParagraphIndex: 8,
      lastActiveAt: yesterday + 10_000,
    })
  })
})

describe('readingPassageExcerpt', () => {
  it('samples the start, middle, and end of a long session range', () => {
    const paragraphs = Array.from({ length: 20 }, (_, index) => `Paragraph ${index}`)
    const excerpt = readingPassageExcerpt({ paragraphs, startParagraphIndex: 2, lastParagraphIndex: 16 })
    expect(excerpt).toContain('Paragraph 2')
    expect(excerpt).toContain('Paragraph 9')
    expect(excerpt).toContain('Paragraph 16')
    expect(excerpt).not.toContain('Paragraph 6\n')
  })

  it('caps large paragraph output', () => {
    const excerpt = readingPassageExcerpt({
      paragraphs: ['x'.repeat(5_000)],
      startParagraphIndex: 0,
      lastParagraphIndex: 0,
      maxCharacters: 100,
    })
    expect(excerpt.length).toBe(100)
    expect(excerpt.endsWith('…')).toBe(true)
  })
})
