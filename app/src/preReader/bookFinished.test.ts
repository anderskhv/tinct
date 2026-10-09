import { describe, expect, it } from 'vitest'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from '../readingMemory/sessions'
import { platoDialogueFixture, sessionFor } from '../readingMemory/fixtures.test-helpers'
import type { ReadingSession } from '../readingMemory/types'
import { emptyLabPositionState, type LabBookPlace, type LabPositionState } from '../lab/labPosition'
import { readingTimeStats } from '../readingTime/model'
import { yourReadingView, type CatalogueEntry } from '../readingTime/yourReading'
import { isBookFinished } from './bookFinished'
import { readingList, type LibraryBookInfo } from './libraryRecap'

/**
 * Production report 2026-10-09 (Anders, desktop, signed in): the library's
 * Finished shelf showed Gorgias (barely read; only its last chapter opened)
 * and not War and Peace, which he finished; Your reading showed War and Peace.
 * Both views now use one rule (bookFinished.ts); these fixtures mirror the case.
 */

const T0 = Date.UTC(2026, 9, 9, 8)
const GORGIAS = 'pd-pg-1672'
const WAR_AND_PEACE = 'war-and-peace'
const numbered = (count: number) => Array.from({ length: count }, (_, index) => ({ number: index + 1, title: `Chapter ${index + 1}`, paragraphCount: 20 }))
const gorgiasChapters = [{ number: 1, title: 'Introduction', paragraphCount: 60 }, { number: 2, title: 'Gorgias', paragraphCount: 1119 }]
const warAndPeaceChapters = numbered(20)

const catalogue = new Map<string, CatalogueEntry>([
  [GORGIAS, { id: GORGIAS, title: 'Gorgias', author: 'Plato', readingStructure: { chapters: gorgiasChapters } }],
  [WAR_AND_PEACE, { id: WAR_AND_PEACE, title: 'War and Peace', author: 'Leo Tolstoy', readingStructure: { chapters: warAndPeaceChapters } }],
])
const books = new Map<string, LibraryBookInfo>([...catalogue.values()].map(book => [book.id, { id: book.id, title: book.title, chapters: book.readingStructure?.chapters ?? [] }]))

function place(bookId: string, sequentialChapter: number, updatedAt: number, extra: Partial<LabBookPlace> = {}): LabBookPlace {
  return { bookId, headerBook: bookId, chapterNumber: sequentialChapter, sequentialChapter, paragraphIndex: 0, wordIndex: 0, updatedAt, deviceId: 'device-a', rev: 1, ...extra }
}

function positionsOf(places: LabBookPlace[], finished: Record<string, number[]>): LabPositionState {
  return { ...emptyLabPositionState('device-a'), books: Object.fromEntries(places.map(item => [item.bookId, item])), finished }
}

const memoryOf = (...sessions: ReadingSession[]) => applyReadingMemoryEvents(emptyReadingMemory(), sessions.map(eventFromSession))

/** Finished ids as each view shows them, for the same records. */
function finishedInBothViews(input: { positions: LabPositionState; memory?: ReturnType<typeof memoryOf>; completedBookIds?: Set<string> }) {
  const memory = input.memory ?? emptyReadingMemory()
  const library = readingList({ memory, viewer: null, positions: input.positions, books, completedBookIds: input.completedBookIds })
  const yours = yourReadingView({ stats: readingTimeStats([], '2026-10-09'), positions: input.positions, catalogue, completedBookIds: input.completedBookIds, memory, viewer: null })
  return { library: library.finished.map(row => row.bookId).sort(), yourReading: yours.finished.map(book => book.bookId).sort(), list: library, yours }
}

describe('the finished-book rule', () => {
  it('needs more than the last chapter: all chapters, or the last one plus 90% of them', () => {
    expect(isBookFinished({ chapterNumbers: [1, 2], finishedChapters: [2] })).toBe(false)
    expect(isBookFinished({ chapterNumbers: [1, 2], finishedChapters: [1, 2] })).toBe(true)
    const ten = Array.from({ length: 10 }, (_, i) => i + 1)
    expect(isBookFinished({ chapterNumbers: ten, finishedChapters: [1, 2, 3, 4, 5, 6, 7, 8, 10] })).toBe(true)
    expect(isBookFinished({ chapterNumbers: ten, finishedChapters: [1, 2, 3, 4, 5, 6, 7, 10] })).toBe(false)
    // 90% without the last chapter is still being read.
    expect(isBookFinished({ chapterNumbers: ten, finishedChapters: [1, 2, 3, 4, 5, 6, 7, 8, 9] })).toBe(false)
    expect(isBookFinished({ chapterNumbers: [], finishedChapters: [1] })).toBe(false)
  })

  it('takes a completion record or a read mark on its own', () => {
    expect(isBookFinished({ chapterNumbers: [1, 2], finishedChapters: [], completionRecord: true })).toBe(true)
    expect(isBookFinished({ chapterNumbers: [1, 2], finishedChapters: [], markedRead: true })).toBe(true)
  })
})

describe('Finished in the library and Your reading (production report 2026-10-09)', () => {
  it('Gorgias: only chapter 2 opened and marked at its last page is not finished in either view', () => {
    // The reader opened chapter 2 from Contents; its final-page effect marked
    // chapter 2 finished and the memory session completed with it.
    const chapterTwo = sessionFor({ ...platoDialogueFixture(), bookId: GORGIAS, chapterNumber: 2, chapterLabel: 'Gorgias' }, { id: 'g2', state: 'completed', startedAt: T0, lastActiveAt: T0 + 60_000 })
    const positions = positionsOf([place(GORGIAS, 2, T0 + 60_000, { paragraphIndex: 3 })], { [GORGIAS]: [2] })
    const views = finishedInBothViews({ positions, memory: memoryOf(chapterTwo) })
    expect(views.library).toEqual([])
    expect(views.yourReading).toEqual([])
    // It is still a book being read.
    expect(views.list.readingNow.map(row => row.bookId)).toEqual([GORGIAS])
  })

  it('War and Peace with a legacy completion record is finished in both views', () => {
    // Finished in the classic reader; the lab record has an older mid-book place.
    const positions = positionsOf([place(WAR_AND_PEACE, 7, T0 - 30 * 86_400_000)], { [WAR_AND_PEACE]: [1, 2, 3] })
    const views = finishedInBothViews({ positions, completedBookIds: new Set([WAR_AND_PEACE]) })
    expect(views.library).toEqual([WAR_AND_PEACE])
    expect(views.yourReading).toEqual([WAR_AND_PEACE])
  })

  it('War and Peace finished chapter by chapter stays Finished after looking back into an earlier chapter', () => {
    // Every chapter finished; later the reader opened chapter 5 again. The
    // library used to drop the book from Finished ("reading again") while
    // Your reading kept it.
    const all = warAndPeaceChapters.map(chapter => chapter.number)
    const positions = positionsOf([place(WAR_AND_PEACE, 5, T0 + 10_000)], { [WAR_AND_PEACE]: all })
    const views = finishedInBothViews({ positions })
    expect(views.library).toEqual([WAR_AND_PEACE])
    expect(views.yourReading).toEqual([WAR_AND_PEACE])
    // Continue still resumes the re-read in the library.
    expect(views.list.readingNow.map(row => [row.bookId, row.target.chapterNumber])).toEqual([[WAR_AND_PEACE, 5]])
  })

  it('a book finished by its chapters is Finished even when no place or session is left for it', () => {
    const positions = positionsOf([], { [WAR_AND_PEACE]: warAndPeaceChapters.map(chapter => chapter.number) })
    const views = finishedInBothViews({ positions })
    expect(views.library).toEqual([WAR_AND_PEACE])
    expect(views.yourReading).toEqual([WAR_AND_PEACE])
  })

  it('counts a completed reading-memory session as a finished chapter in both views', () => {
    // Chapters 1-2 of Gorgias: chapter 1 only in reading memory, chapter 2 in the record.
    const chapterOne = sessionFor({ ...platoDialogueFixture(), bookId: GORGIAS, chapterNumber: 1, chapterLabel: 'Introduction' }, { id: 'g1', state: 'completed', startedAt: T0, lastActiveAt: T0 + 1_000 })
    const positions = positionsOf([place(GORGIAS, 2, T0 + 90_000, { paragraphIndex: 1118 })], { [GORGIAS]: [2] })
    const views = finishedInBothViews({ positions, memory: memoryOf(chapterOne) })
    expect(views.library).toEqual([GORGIAS])
    expect(views.yourReading).toEqual([GORGIAS])
  })
})
