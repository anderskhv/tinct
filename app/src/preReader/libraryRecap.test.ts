import { describe, expect, it } from 'vitest'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from '../readingMemory/sessions'
import { bibleChapterFixture, genesisOneFixture, platoDialogueFixture, sessionFor } from '../readingMemory/fixtures.test-helpers'
import type { ReadingSession } from '../readingMemory/types'
import type { LabBookPlace, LabPositionState } from '../lab/labPosition'
import {
  catalogueBookIdForPlace,
  compactChapterTitle,
  continueTargetFor,
  heroHeadline,
  inProgressLabel,
  libraryModeFor,
  movedBackIntoBook,
  newestSessionsByBook,
  positionPlacesByBook,
  readingList,
  recapEyebrow,
  type LibraryBookInfo,
} from './libraryRecap'

const T0 = 1_750_000_000_000

const books = new Map<string, LibraryBookInfo>([
  ['bible', { id: 'bible', title: 'The Bible', chapters: [{ number: 1, title: 'Genesis 1', paragraphCount: 7 }, { number: 2, title: 'Genesis 2', paragraphCount: 6 }, { number: 644, title: 'Proverbs 16', paragraphCount: 7 }, { number: 645, title: 'Proverbs 17', paragraphCount: 6 }, { number: 646, title: 'Proverbs 18', paragraphCount: 5 }, { number: 857, title: 'Daniel 7', paragraphCount: 6 }, { number: 1147, title: 'James 1', paragraphCount: 5 }, { number: 1189, title: 'Revelation 22' }] }],
  ['plato-republic', { id: 'plato-republic', title: 'The Republic', chapters: [{ number: 1, title: 'Book I', paragraphCount: 40 }, { number: 2, title: 'Book II — The Just City', paragraphCount: 40 }, { number: 10, title: 'Book X' }] }],
  ['meditations', { id: 'meditations', title: 'Meditations', chapters: [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }, { number: 12, title: 'Book 12' }] }],
  ['hamlet', { id: 'hamlet', title: 'Hamlet', chapters: [{ number: 1, title: 'Act 1' }, { number: 5, title: 'Act 5' }] }],
])

function place(partial: Partial<LabBookPlace> & Pick<LabBookPlace, 'bookId' | 'headerBook' | 'chapterNumber' | 'sequentialChapter' | 'updatedAt'>): LabBookPlace {
  return { paragraphIndex: 0, wordIndex: 0, deviceId: 'device-a', rev: 1, ...partial }
}

function positions(places: LabBookPlace[], lastSettledBookId: string | null = null, finished: Record<string, number[]> = {}): LabPositionState {
  return {
    books: Object.fromEntries(places.map(item => [item.bookId, item])),
    finished,
    hidden: {},
    lastSettledBookId,
    lastSettledAt: lastSettledBookId ? T0 : 0,
    updatedAt: Math.max(0, ...places.map(item => item.updatedAt)),
    deviceId: 'device-a',
  }
}

function memoryOf(...sessions: ReadingSession[]) {
  return applyReadingMemoryEvents(emptyReadingMemory(), sessions.map(eventFromSession))
}

describe('library recap helpers', () => {
  it('decides returning only when something is being read or finished', () => {
    expect(libraryModeFor(null)).toBe('new')
    expect(libraryModeFor(undefined)).toBe('new')
    expect(libraryModeFor({ readingNow: [], finished: [] })).toBe('new')
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const list = readingList({ memory: memoryOf(session), viewer: null, positions: null, books })
    expect(libraryModeFor(list)).toBe('returning')
    expect(libraryModeFor({ readingNow: [], finished: [{ bookId: 'hamlet', finishedAt: null, session: null }] })).toBe('returning')
  })

  it('labels the eyebrow with the chapter Continue resumes in and compacts long chapter titles', () => {
    expect(recapEyebrow('Genesis 1')).toBe('Last time you read · Genesis 1')
    expect(compactChapterTitle('Chapter 1 — Loomings', 'Chapter 1')).toBe('Chapter 1')
    expect(compactChapterTitle('Book II — The Just City', 'x')).toBe('Book II')
    expect(compactChapterTitle('', 'Chapter 4')).toBe('Chapter 4')
    expect(compactChapterTitle(undefined, 'Chapter 4')).toBe('Chapter 4')
  })

  it('says where in the chapter the reader is from the paragraph and the chapter length', () => {
    const at = (paragraphIndex: number) => place({ bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, paragraphIndex, primaryEditionKey: 'kjv-en', updatedAt: T0 + 1_000 })
    const rowAt = (paragraphIndex: number, finished: Record<string, number[]> = {}) => readingList({ memory: memoryOf(), viewer: null, positions: positions([at(paragraphIndex)], 'proverbs', finished), books }).readingNow[0]
    expect(rowAt(0).progress).toBe('start')
    expect(heroHeadline(rowAt(0))).toBe('You’re at the start of Proverbs 17')
    expect(heroHeadline(rowAt(3))).toBe('You’re in the middle of Proverbs 17')
    expect(heroHeadline(rowAt(5))).toBe('You’re near the end of Proverbs 17')
    // The finished-chapter record makes it "finished" only while the pin still sits in the last paragraph.
    expect(heroHeadline(rowAt(5, { bible: [645] }))).toBe('You finished Proverbs 17')
    expect(heroHeadline(rowAt(2, { bible: [645] }))).toBe('You’re in the middle of Proverbs 17')
    expect(rowAt(5, { bible: [645] }).target.paragraphCount).toBe(6)
  })

  it('claims only start or middle when the catalogue does not know the chapter length', () => {
    const unknown = new Map<string, LibraryBookInfo>([['hamlet', { id: 'hamlet', title: 'Hamlet', chapters: [{ number: 1, title: 'Act 1' }] }]])
    const rowAt = (paragraphIndex: number) => readingList({ memory: memoryOf(), viewer: null, positions: positions([place({ bookId: 'hamlet', headerBook: 'Hamlet', chapterNumber: 1, sequentialChapter: 1, paragraphIndex, updatedAt: T0 })]), books: unknown }).readingNow[0]
    expect(rowAt(0).target.paragraphCount).toBeNull()
    expect(heroHeadline(rowAt(0))).toBe('You’re at the start of Act 1')
    expect(heroHeadline(rowAt(40))).toBe('You’re in the middle of Act 1')
  })

  it('reaches back to a finished previous chapter when the reader has just started the next one or read both in one sitting', () => {
    const startOf18 = place({ bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 18, sequentialChapter: 646, paragraphIndex: 0, primaryEditionKey: 'kjv-en', updatedAt: T0 + 1_000 })
    const fresh = readingList({ memory: memoryOf(), viewer: null, positions: positions([startOf18], 'proverbs', { bible: [645] }), books }).readingNow[0]
    expect(heroHeadline(fresh)).toBe('You’re at the start of Proverbs 18')
    expect(fresh.includePreviousChapter).toBe(true)
    // Not when the previous chapter was never finished.
    expect(readingList({ memory: memoryOf(), viewer: null, positions: positions([startOf18], 'proverbs'), books }).readingNow[0].includePreviousChapter).toBe(false)

    // Mid-chapter: only when the previous chapter was read in the same sitting.
    const proverbs = (chapterNumber: number, label: string) => ({ ...bibleChapterFixture(), chapterNumber, chapterLabel: label })
    const seventeen = sessionFor(proverbs(645, 'Proverbs 17'), { id: 'p17', state: 'completed', startedAt: T0, lastActiveAt: T0 + 10 * 60_000 })
    const eighteenSameSitting = sessionFor(proverbs(646, 'Proverbs 18'), { id: 'p18', state: 'progressed', startedAt: T0 + 11 * 60_000, lastActiveAt: T0 + 20 * 60_000, page: 2 })
    const same = readingList({ memory: memoryOf(seventeen, eighteenSameSitting), viewer: null, positions: null, books }).readingNow[0]
    expect(same.target.chapterNumber).toBe(646)
    expect(same.progress).not.toBe('start')
    expect(same.includePreviousChapter).toBe(true)
    const eighteenNextDay = sessionFor(proverbs(646, 'Proverbs 18'), { id: 'p18b', state: 'progressed', startedAt: T0 + 24 * 3_600_000, lastActiveAt: T0 + 24 * 3_600_000 + 60_000, page: 2 })
    expect(readingList({ memory: memoryOf(seventeen, eighteenNextDay), viewer: null, positions: null, books }).readingNow[0].includePreviousChapter).toBe(false)
    // Finished in the same sitting as the previous chapter: the sitting covered two chapters, so the summary does too (never more).
    const eighteenDone = sessionFor(proverbs(646, 'Proverbs 18'), { id: 'p18c', state: 'completed', startedAt: T0 + 11 * 60_000, lastActiveAt: T0 + 20 * 60_000 })
    const done = readingList({ memory: memoryOf(seventeen, eighteenDone), viewer: null, positions: null, books }).readingNow[0]
    expect(heroHeadline(done)).toBe('You finished Proverbs 18')
    expect(done.includePreviousChapter).toBe(true)
    const doneAlone = sessionFor(proverbs(646, 'Proverbs 18'), { id: 'p18d', state: 'completed', startedAt: T0 + 3 * 3_600_000, lastActiveAt: T0 + 3 * 3_600_000 + 60_000 })
    expect(readingList({ memory: memoryOf(seventeen, doneAlone), viewer: null, positions: null, books }).readingNow[0].includePreviousChapter).toBe(false)
  })

  it('keeps the newest visible session per book', () => {
    const platoOld = sessionFor(platoDialogueFixture(), { id: 'p1', state: 'started', startedAt: T0, lastActiveAt: T0 + 1_000 })
    const platoNew = sessionFor(platoDialogueFixture(), { id: 'p2', state: 'progressed', startedAt: T0 + 2_000, lastActiveAt: T0 + 3_000, page: 2 })
    const foreign = sessionFor({ ...platoDialogueFixture(), bookId: 'hamlet', chapterLabel: 'Act 1' }, { id: 'h1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 8_000, owner: 'someone-else' })
    const state = memoryOf(platoOld, platoNew, foreign)
    expect([...newestSessionsByBook(state, null).keys()]).toEqual(['plato-republic'])
    expect(newestSessionsByBook(state, null).get('plato-republic')?.id).toBe('p2')
    expect([...newestSessionsByBook(state, 'someone-else').keys()].sort()).toEqual(['hamlet', 'plato-republic'])
  })

  it('maps position records to catalogue books, biblical books to the Bible, settled Bible book first', () => {
    expect(catalogueBookIdForPlace({ bookId: 'meditations' }, books)).toBe('meditations')
    expect(catalogueBookIdForPlace({ bookId: 'daniel' }, books)).toBe('bible')
    expect(catalogueBookIdForPlace({ bookId: 'daniel' }, new Map([['hamlet', {}]]))).toBeNull()

    const genesis = place({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, updatedAt: T0 + 9_000 })
    const daniel = place({ bookId: 'daniel', headerBook: 'Daniel', chapterNumber: 7, sequentialChapter: 857, updatedAt: T0 + 5_000 })
    const meditations = place({ bookId: 'meditations', headerBook: 'Meditations', chapterNumber: 3, sequentialChapter: 3, updatedAt: T0 + 1_000 })
    const settled = positionPlacesByBook(positions([genesis, daniel, meditations], 'daniel'), books)
    expect(settled.get('bible')?.bookId).toBe('daniel')
    expect(settled.get('meditations')?.bookId).toBe('meditations')
    const unsettled = positionPlacesByBook(positions([daniel, genesis], null), books)
    expect(unsettled.get('bible')?.bookId).toBe('genesis')
    expect(positionPlacesByBook(null, books).size).toBe(0)
  })

  it('skips a record the catalogue cannot place instead of letting it take the Bible\u2019s row', () => {
    const bible = books.get('bible')!.chapters
    // With the Bible's chapter list in hand, only ids the Bible actually
    // contains resolve to it; records of dropped books resolve to nothing.
    expect(catalogueBookIdForPlace({ bookId: 'daniel' }, books, bible)).toBe('bible')
    expect(catalogueBookIdForPlace({ bookId: 'a-book-we-dropped' }, books, bible)).toBeNull()
    // No chapter list to check against: the historical assumption stands.
    expect(catalogueBookIdForPlace({ bookId: 'a-book-we-dropped' }, books)).toBe('bible')

    const daniel = place({ bookId: 'daniel', headerBook: 'Daniel', chapterNumber: 7, sequentialChapter: 857, updatedAt: T0 + 1_000 })
    const droppedOld = place({ bookId: 'a-book-we-dropped', headerBook: 'Dropped', chapterNumber: 2, sequentialChapter: 2, updatedAt: T0 + 2_000 })
    const droppedNew = place({ bookId: 'another-book-we-dropped', headerBook: 'Dropped', chapterNumber: 3, sequentialChapter: 3, updatedAt: T0 + 3_000 })
    // The defect: three records, one surviving row, and it is not even the Bible's.
    const collapsed = positionPlacesByBook(positions([daniel, droppedOld, droppedNew], null), books)
    expect(collapsed.get('bible')?.bookId).toBe('another-book-we-dropped')
    // Fixed: the unresolvable records are skipped and the Bible keeps its place.
    const kept = positionPlacesByBook(positions([daniel, droppedOld, droppedNew], null), books, bible)
    expect([...kept.keys()]).toEqual(['bible'])
    expect(kept.get('bible')?.bookId).toBe('daniel')
  })

  it('resolves Continue to the position store when it is newer than the memory session', () => {
    // The bug: the recap's newest memory session (Daniel 7) is older than the
    // reader's own position record (James 1); Continue must use the reader's.
    const memory = sessionFor({ ...bibleChapterFixture(), chapterNumber: 857, chapterLabel: 'Daniel 7' }, { id: 'b-daniel', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 10_000, page: 2 })
    const james = place({ bookId: 'james', headerBook: 'James', chapterNumber: 1, sequentialChapter: 1147, paragraphIndex: 3, wordIndex: 12, pageIndex: 1, primaryEditionKey: 'kjv-en', updatedAt: T0 + 60_000 })
    const target = continueTargetFor({ book: books.get('bible'), session: memory, place: james })
    expect(target).toMatchObject({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1147, chapterLabel: 'James 1', pageIndex: 1, paragraphIndex: 3, wordIndex: 12, source: 'position', at: T0 + 60_000 })

    const list = readingList({ memory: memoryOf(memory), viewer: null, positions: positions([james], 'james'), books })
    expect(list.readingNow).toHaveLength(1)
    expect(list.readingNow[0].target.source).toBe('position')
    expect(list.readingNow[0].target.chapterNumber).toBe(1147)
    expect(list.readingNow[0].lastActiveAt).toBe(T0 + 60_000)
    expect(list.readingNow[0].recap).toBeNull()
    expect(list.readingNow[0].target.paragraphCount).toBe(5)
    expect(heroHeadline(list.readingNow[0])).toBe('You’re in the middle of James 1')
  })

  it('resolves Continue to the memory anchor when it is newer, keeping the recap', () => {
    const memory = sessionFor(genesisOneFixture(), { id: 'g1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 90_000, page: 2 })
    const older = place({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, pageIndex: 0, updatedAt: T0 + 1_000 })
    const target = continueTargetFor({ book: books.get('bible'), session: memory, place: older })
    expect(target).toMatchObject({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, chapterLabel: 'Genesis 1', pageIndex: 1, source: 'memory', at: T0 + 90_000 })
    const list = readingList({ memory: memoryOf(memory), viewer: null, positions: positions([older], 'genesis'), books })
    expect(heroHeadline(list.readingNow[0])).toMatch(/^You’re (at the start|in the middle|near the end) of Genesis 1$/)
    expect(heroHeadline(list.readingNow[0])).not.toBe('You finished Genesis 1')
    expect(inProgressLabel(list.readingNow[0])).toBe('Last time · Genesis 1')
  })

  it('uses the position store alone for a book with no memory session, with the catalogue chapter label', () => {
    const republic = place({ bookId: 'plato-republic', headerBook: 'The Republic', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 4, pageIndex: 3, primaryEditionKey: 'modern-en', updatedAt: T0 + 5_000 })
    const target = continueTargetFor({ book: books.get('plato-republic'), session: null, place: republic })
    expect(target).toMatchObject({ bookId: 'plato-republic', editionKey: 'modern-en', chapterNumber: 2, chapterLabel: 'Book II', pageIndex: 3, paragraphIndex: 4, source: 'position' })
    const unknown = place({ bookId: 'hamlet', headerBook: 'Hamlet', chapterNumber: 3, sequentialChapter: 3, updatedAt: T0 })
    expect(continueTargetFor({ book: undefined, session: null, place: unknown })).toBeNull()
    expect(continueTargetFor({ book: books.get('hamlet'), session: null, place: null })).toBeNull()
  })

  it('orders Reading now by the newer of the two stores and lists every in-progress book', () => {
    const genesis = sessionFor(genesisOneFixture(), { id: 'g1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 5_000 })
    const plato = sessionFor({ ...platoDialogueFixture(), chapterLabel: 'Book I — What is justice?' }, { id: 'p1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 3_000 })
    const meditations = sessionFor({ ...platoDialogueFixture(), bookId: 'meditations', editionKey: 'original-en', chapterLabel: 'Book 1' }, { id: 'm1', state: 'started', startedAt: T0, lastActiveAt: T0 + 1_000 })
    const hamletPlace = place({ bookId: 'hamlet', headerBook: 'Hamlet', chapterNumber: 2, sequentialChapter: 2, updatedAt: T0 + 4_000 })
    const meditationsPlace = place({ bookId: 'meditations', headerBook: 'Meditations', chapterNumber: 2, sequentialChapter: 2, updatedAt: T0 + 9_000 })
    const list = readingList({ memory: memoryOf(genesis, plato, meditations), viewer: null, positions: positions([hamletPlace, meditationsPlace], 'meditations'), books })
    expect(list.readingNow.map(row => [row.bookId, row.target.source])).toEqual([
      ['meditations', 'position'],
      ['bible', 'memory'],
      ['hamlet', 'position'],
      ['plato-republic', 'memory'],
    ])
    expect(list.readingNow[0].target.chapterLabel).toBe('Book 2')
    expect(list.readingNow[3].target.chapterLabel).toBe('Book I')
    expect(inProgressLabel(list.readingNow[3])).toBe('Last time · Book I')
    expect(list.finished).toEqual([])
  })

  it('moves books to Finished only for a completed final chapter or an app mark, and back when read again', () => {
    const finishedRevelation = sessionFor({ ...bibleChapterFixture(), chapterNumber: 1189, chapterLabel: 'Revelation 22' }, { id: 'r22', state: 'completed', startedAt: T0, lastActiveAt: T0 + 7_000 })
    const completedMidBook = sessionFor(platoDialogueFixture(), { id: 'p1', state: 'completed', startedAt: T0, lastActiveAt: T0 + 6_000 })
    const hamletSession = sessionFor({ ...platoDialogueFixture(), bookId: 'hamlet', chapterLabel: 'Act 1' }, { id: 'h1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 2_000 })
    const list = readingList({
      memory: memoryOf(finishedRevelation, completedMidBook, hamletSession),
      viewer: null,
      positions: null,
      books,
      completedBookIds: new Set(['hamlet']),
    })
    expect(list.readingNow.map(row => row.bookId)).toEqual(['plato-republic'])
    expect(list.finished.map(row => [row.bookId, row.finishedAt])).toEqual([['bible', T0 + 7_000], ['hamlet', T0 + 2_000]])
    expect(list.readingNow[0].progress).toBe('finished')
    expect(heroHeadline(list.readingNow[0])).toBe('You finished Book I')

    const readingAgain = place({ bookId: 'revelation', headerBook: 'Revelation', chapterNumber: 1, sequentialChapter: 1170, updatedAt: T0 + 20_000 })
    const again = readingList({ memory: memoryOf(finishedRevelation), viewer: null, positions: positions([readingAgain], 'revelation'), books })
    expect(again.finished).toEqual([])
    expect(again.readingNow[0]).toMatchObject({ bookId: 'bible', target: { source: 'position', chapterLabel: 'Revelation 1' } })
  })

  it('keeps a finished book Finished when the reader only left the final page (a later hide write at that page)', () => {
    // Crito 3 completed on page 22 of 22; leaving the reader wrote the pin again at that page 40s later.
    const crito = { ...platoDialogueFixture(), bookId: 'crito', chapterNumber: 3, chapterLabel: 'The Laws of Athens Speak' }
    const completed = sessionFor(crito, { id: 'c3', state: 'completed', startedAt: T0, lastActiveAt: T0 + 5_000, page: 22, totalPages: 22 })
    const critoBooks = new Map(books)
    critoBooks.set('crito', { id: 'crito', title: 'Crito', chapters: [{ number: 1, title: 'The Visit at Dawn' }, { number: 2, title: 'The Plea' }, { number: 3, title: 'The Laws of Athens Speak' }] })
    const leftAtLastPage = place({ bookId: 'crito', headerBook: 'Crito', chapterNumber: 3, sequentialChapter: 3, pageIndex: 21, updatedAt: T0 + 45_000 })
    const list = readingList({ memory: memoryOf(completed), viewer: null, positions: positions([leftAtLastPage], 'crito'), books: critoBooks })
    expect(list.finished.map(row => row.bookId)).toEqual(['crito'])
    expect(list.readingNow).toEqual([])

    // Turning back to an earlier page of that chapter, or opening an earlier chapter, is reading again.
    const backAPage = { ...leftAtLastPage, pageIndex: 10, updatedAt: T0 + 60_000 }
    expect(readingList({ memory: memoryOf(completed), viewer: null, positions: positions([backAPage], 'crito'), books: critoBooks }).finished).toEqual([])
    const chapterOne = { ...leftAtLastPage, chapterNumber: 1, sequentialChapter: 1, pageIndex: 0, updatedAt: T0 + 60_000 }
    expect(readingList({ memory: memoryOf(completed), viewer: null, positions: positions([chapterOne], 'crito'), books: critoBooks }).readingNow[0]).toMatchObject({ bookId: 'crito', target: { chapterNumber: 1 } })
    // A pin older than the completion is stale, never "reading again".
    const stalePin = { ...chapterOne, updatedAt: T0 + 1_000 }
    expect(readingList({ memory: memoryOf(completed), viewer: null, positions: positions([stalePin], 'crito'), books: critoBooks }).finished.map(row => row.bookId)).toEqual(['crito'])
    expect(movedBackIntoBook({ place: stalePin, lastChapter: 3, session: completed })).toBe(false)
  })

  it('counts the position record\'s finished mark on the final chapter, even with no memory session left', () => {
    const atEnd = place({ bookId: 'meditations', headerBook: 'Meditations', chapterNumber: 12, sequentialChapter: 12, pageIndex: 4, updatedAt: T0 + 9_000 })
    const done = readingList({ memory: emptyReadingMemory(), viewer: null, positions: positions([atEnd], 'meditations', { meditations: [11, 12] }), books })
    expect(done.finished.map(row => row.bookId)).toEqual(['meditations'])
    // Back in Book 2 with the mark still set: reading again.
    const earlier = { ...atEnd, chapterNumber: 2, sequentialChapter: 2, updatedAt: T0 + 10_000 }
    const again = readingList({ memory: emptyReadingMemory(), viewer: null, positions: positions([earlier], 'meditations', { meditations: [11, 12] }), books })
    expect(again.finished).toEqual([])
    expect(again.readingNow[0]).toMatchObject({ bookId: 'meditations', target: { chapterNumber: 2 } })
  })

  it('shows the stored summary in a row only when it describes the Continue chapter', () => {
    const summarised: ReadingSession = {
      ...sessionFor(genesisOneFixture(), { id: 'g1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 5_000 }),
      seq: 2,
    }
    summarised.summary = { text: 'Light, land, and the first people.', model: 'm', route: '/api/chat', version: 'v1', generatedAt: T0 + 6_000, sessionSeq: 2, anchor: summarised.anchor }
    const same = readingList({ memory: memoryOf(summarised), viewer: null, positions: null, books })
    expect(same.readingNow[0].recap).toBe('Light, land, and the first people.')
    const moved = place({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 2, sequentialChapter: 2, updatedAt: T0 + 8_000 })
    const other = readingList({ memory: memoryOf(summarised), viewer: null, positions: positions([moved], 'genesis'), books })
    expect(other.readingNow[0].recap).toBeNull()
    expect(heroHeadline(other.readingNow[0])).toBe('You’re at the start of Genesis 2')
    // Genesis 1 was never finished, so the summary does not reach back into it.
    expect(other.readingNow[0].includePreviousChapter).toBe(false)
  })
})

it('includes finished books whose old reading sessions and positions are absent', () => {
  const list = readingList({ memory: emptyReadingMemory(), viewer: null, positions: null, books, completedBookIds: new Set(['hamlet']) })
  expect(list.finished.map(book => book.bookId)).toEqual(['hamlet'])
  expect(list.readingNow).toEqual([])
})
