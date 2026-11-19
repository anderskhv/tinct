import { describe, expect, it } from 'vitest'
import { emptyLabPositionState, type LabPositionState } from './labPosition'
import type { ReadingMemoryState, ReadingSession } from '../readingMemory'
import type { BookReadingLog, ChatConversation } from '../types'
import {
  biblicalSlugsOf,
  compressChapterRanges,
  readingCoverageByBook,
  readingCoverageLines,
  type ReadingCoverageOutline,
} from './labReadingCoverage'

// Ezra is sequential chapters 404–413 and Nehemiah 414–426 in the Tinct Bible (BSB manifest).
const bible: ReadingCoverageOutline = {
  chapters: [
    ...Array.from({ length: 10 }, (_, i) => ({ number: 404 + i, title: `Ezra ${i + 1}` })),
    ...Array.from({ length: 13 }, (_, i) => ({ number: 414 + i, title: `Nehemiah ${i + 1}` })),
  ],
  sections: [{ title: 'Old Testament', sections: [{ title: 'History', sections: [
    { title: 'Ezra', chapters: Array.from({ length: 10 }, (_, i) => 404 + i) },
    { title: 'Nehemiah', chapters: Array.from({ length: 13 }, (_, i) => 414 + i) },
  ] }] }] as never,
}
const DAY = Date.UTC(2026, 9, 5, 12)

function session(id: string, bookId: string, chapterNumber: number, state: ReadingSession['state'], at: number, owner: string | null = null): ReadingSession {
  return {
    id, seq: 1, deviceId: 'phone', owner, state,
    anchor: {
      bookId, editionKey: 'bsb-en', chapterNumber, chapterLabel: `ch ${chapterNumber}`, page: 1, totalPages: 4,
      paragraphIndex: 0, wordIndex: 0,
      range: { startParagraphIndex: 0, startWordIndex: 0, startCharOffset: 0, endParagraphIndex: 0, endWordIndex: 3, endCharOffset: 12, firstWords: 'a', lastWords: 'b' },
    },
    startedAt: at - 1000, lastActiveAt: at, endedAt: at, completedAt: state === 'completed' ? at : null,
  }
}
function memory(...sessions: ReadingSession[]): ReadingMemoryState {
  return { v: 1, updatedAt: 0, sessions: Object.fromEntries(sessions.map(item => [item.id, item])) }
}
function chat(bookId: string, chapterNumber: number, at: number): ChatConversation {
  return { id: `${bookId}-${chapterNumber}`, bookId, chapterNumber, startTimestamp: at, endTimestamp: at, messages: [], preview: '' }
}
const isRegistryBook = (id: string) => ['bible', 'odyssey', 'hamlet'].includes(id)
const books = [
  { bookId: 'bible', title: 'The Bible', outline: bible },
  { bookId: 'odyssey', title: 'The Odyssey', outline: { chapters: Array.from({ length: 24 }, (_, i) => ({ number: i + 1, title: `Book ${i + 1}` })) } },
  { bookId: 'hamlet', title: 'Hamlet', outline: null },
]

describe('reading coverage summary', () => {
  it('compresses chapter ranges', () => {
    expect(compressChapterRanges([3, 1, 2, 5, 7, 8, 9, 9])).toBe('1–3, 5, 7–9')
    expect(compressChapterRanges([4])).toBe('4')
  })

  it('summarises a fully finished biblical book from the position record, as Contents does', () => {
    const position: LabPositionState = {
      ...emptyLabPositionState('phone'),
      finished: { bible: Array.from({ length: 10 }, (_, i) => 404 + i) },
      books: { ezra: { bookId: 'ezra', headerBook: 'Ezra', chapterNumber: 10, sequentialChapter: 413, paragraphIndex: 2, wordIndex: 0, updatedAt: DAY, deviceId: 'phone', rev: 3 } },
    }
    // Old chats only touch Ezra 2, 8 and 10: coverage must not shrink to them.
    const coverage = readingCoverageByBook({ position, conversations: [chat('bible', 405, 1), chat('bible', 411, 2), chat('bible', 413, 3)] }, { biblicalSlugs: biblicalSlugsOf(bible), isRegistryBook })
    const lines = readingCoverageLines({ coverage, books, question: 'Have I read all of Ezra?', openBookId: 'bible' })
    expect(lines[0]).toBe('The Bible, Ezra: Ezra 1–10 finished (all 10 chapters finished); last read 2026-10-05.')
    expect(lines.join('\n')).not.toContain('Nehemiah')
  })

  it('reports mixed states per book and lists the open and named books even without records', () => {
    const position: LabPositionState = {
      ...emptyLabPositionState('phone'),
      finished: { bible: [414, 415, 416], odyssey: [1, 2, 3] },
      books: {
        odyssey: { bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 4, sequentialChapter: 4, paragraphIndex: 0, wordIndex: 0, updatedAt: DAY - 86_400_000, deviceId: 'phone', rev: 1 },
      },
    }
    const coverage = readingCoverageByBook({
      position,
      memory: memory(session('s1', 'bible', 417, 'paused', DAY), session('s2', 'bible', 418, 'completed', DAY - 1000)),
      conversations: [chat('bible', 426, DAY - 5000)],
    }, { biblicalSlugs: biblicalSlugsOf(bible), isRegistryBook })
    const lines = readingCoverageLines({ coverage, books, question: 'Did I finish Ezra? And Hamlet?', openBookId: 'odyssey' })
    expect(lines).toContain('The Bible, Nehemiah: Nehemiah 1–3, 5 finished, 4 in progress, 13 visited (4 of 13 chapters finished); last read 2026-10-05.')
    expect(lines).toContain('The Odyssey: chapters 1–3 finished, 4 in progress (3 of 24 chapters finished); last read 2026-10-04.')
    expect(lines).toContain('The Bible, Ezra: no chapter records (10 chapters).')
    expect(lines).toContain('Hamlet: no chapter records.')
    // Named books first, then the open book.
    expect(lines.indexOf('The Bible, Ezra: no chapter records (10 chapters).')).toBeLessThan(lines.findIndex(line => line.startsWith('The Odyssey')))
  })

  it('never states an extent it cannot know, and ignores another account', () => {
    const position: LabPositionState = { ...emptyLabPositionState('phone', 'other-reader'), finished: { hamlet: [1, 2] } }
    const coverage = readingCoverageByBook({
      position,
      viewer: 'me',
      memory: memory(session('s1', 'hamlet', 3, 'completed', DAY, 'me'), session('s2', 'hamlet', 5, 'completed', DAY, 'other-reader')),
    }, { isRegistryBook })
    expect(readingCoverageLines({ coverage, books })).toEqual(['Hamlet: chapters 3 finished; last read 2026-10-05.'])
  })

  it('keeps private user books out', () => {
    const userBook = 'userbook-0123456789abcdef01234567'
    const position: LabPositionState = { ...emptyLabPositionState('phone'), finished: { [userBook]: [1, 2] } }
    const coverage = readingCoverageByBook({ position, conversations: [chat(userBook, 3, DAY)] }, { isRegistryBook })
    expect(coverage.size).toBe(0)
    expect(readingCoverageLines({ coverage, books: [...books, { bookId: userBook, title: 'My diary', outline: null }], openBookId: userBook })).toEqual([])
  })

  it('merges a legacy reading log when one is still on the device', () => {
    const log: BookReadingLog = { bookId: 'odyssey', updatedAt: 0, chapters: {
      5: { chapterNumber: 5, editions: ['original-en'], readCount: 1, firstReadAt: 0, lastReadAt: DAY, completed: true },
      6: { chapterNumber: 6, editions: ['original-en'], readCount: 1, firstReadAt: 0, lastReadAt: DAY, completed: false },
    } } as BookReadingLog
    const coverage = readingCoverageByBook({ legacyLogs: [log] }, { isRegistryBook })
    expect(readingCoverageLines({ coverage, books })).toEqual(['The Odyssey: chapters 5 finished, 6 visited (1 of 24 chapters finished); last read 2026-10-05.'])
  })

  it('falls back to sequential numbers when the Bible outline is unavailable', () => {
    const position: LabPositionState = { ...emptyLabPositionState('phone'), finished: { bible: [404, 405] } }
    const coverage = readingCoverageByBook({ position }, { isRegistryBook })
    expect(readingCoverageLines({ coverage, books: [{ bookId: 'bible', title: 'The Bible', outline: null }] }))
      .toEqual(['The Bible: sequential chapters 404–405 finished.'])
  })
})
