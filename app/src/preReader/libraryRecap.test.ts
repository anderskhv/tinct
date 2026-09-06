import { describe, expect, it } from 'vitest'
import { buildRecapCard } from '../readingMemory/recap'
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
  newestSessionsByBook,
  positionPlacesByBook,
  readingList,
  recapEyebrow,
  recapHeadline,
  type LibraryBookInfo,
} from './libraryRecap'

const T0 = 1_750_000_000_000

const books = new Map<string, LibraryBookInfo>([
  ['bible', { id: 'bible', title: 'The Bible', chapters: [{ number: 1, title: 'Genesis 1' }, { number: 857, title: 'Daniel 7' }, { number: 1147, title: 'James 1' }, { number: 1189, title: 'Revelation 22' }] }],
  ['plato-republic', { id: 'plato-republic', title: 'The Republic', chapters: [{ number: 1, title: 'Book I' }, { number: 2, title: 'Book II — The Just City' }, { number: 10, title: 'Book X' }] }],
  ['meditations', { id: 'meditations', title: 'Meditations', chapters: [{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }, { number: 12, title: 'Book 12' }] }],
  ['hamlet', { id: 'hamlet', title: 'Hamlet', chapters: [{ number: 1, title: 'Act 1' }, { number: 5, title: 'Act 5' }] }],
])

function place(partial: Partial<LabBookPlace> & Pick<LabBookPlace, 'bookId' | 'headerBook' | 'chapterNumber' | 'sequentialChapter' | 'updatedAt'>): LabBookPlace {
  return { paragraphIndex: 0, wordIndex: 0, deviceId: 'device-a', rev: 1, ...partial }
}

function positions(places: LabBookPlace[], lastSettledBookId: string | null = null): LabPositionState {
  return {
    books: Object.fromEntries(places.map(item => [item.bookId, item])),
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

  it('uses the stored summary as the headline when present', () => {
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const card = buildRecapCard({
      session,
      source: 'cloud',
      paragraphs: genesisOneFixture().paragraphs,
      summary: { text: 'God separates light from dark, sea from land, and makes the first people.', model: 'm', version: 'v1' },
    })
    expect(card.bodyKind).toBe('summary')
    expect(recapHeadline(card)).toBe('God separates light from dark, sea from land, and makes the first people.')
  })

  it('quotes and word-trims the exact excerpt when there is no summary', () => {
    const session = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const card = buildRecapCard({ session, source: 'device', paragraphs: genesisOneFixture().paragraphs })
    expect(card.bodyKind).toBe('excerpt')
    const headline = recapHeadline(card, 60)
    expect(headline.startsWith('“')).toBe(true)
    expect(headline.endsWith('…”')).toBe(true)
    expect(headline.length).toBeLessThanOrEqual(63)
    expect(card.body.startsWith(headline.slice(1, headline.indexOf('…')))).toBe(true)
    const short = recapHeadline({ body: 'In the beginning.', bodyKind: 'excerpt', headline: 'x' })
    expect(short).toBe('“In the beginning.”')
  })

  it('falls back to the truthful location line and never claims completion', () => {
    const stopped = sessionFor(genesisOneFixture(), { state: 'progressed', startedAt: T0 })
    const missing = buildRecapCard({ session: stopped, source: 'device', paragraphs: null })
    expect(missing.bodyKind).toBe('location-only')
    expect(recapHeadline(missing)).toBe('You stopped in Genesis 1')
    const finished = sessionFor(genesisOneFixture(), { state: 'completed', startedAt: T0 })
    const finishedCard = buildRecapCard({ session: finished, source: 'device', paragraphs: null })
    expect(recapHeadline(finishedCard)).toBe('You finished Genesis 1')
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

  it('resolves Continue to the position store when it is newer than the memory session', () => {
    // The bug: the recap's newest memory session (Daniel 7) is older than the
    // reader's own position record (James 1); Continue must use the reader's.
    const memory = sessionFor({ ...bibleChapterFixture(), chapterNumber: 857, chapterLabel: 'Daniel 7' }, { id: 'b-daniel', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 10_000, page: 2 })
    const james = place({ bookId: 'james', headerBook: 'James', chapterNumber: 1, sequentialChapter: 1147, paragraphIndex: 3, wordIndex: 12, pageIndex: 1, primaryEditionKey: 'kjv-en', updatedAt: T0 + 60_000 })
    const target = continueTargetFor({ book: books.get('bible'), session: memory, place: james })
    expect(target).toMatchObject({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1147, chapterLabel: 'James 1', pageIndex: 1, paragraphIndex: 3, source: 'position', at: T0 + 60_000 })

    const list = readingList({ memory: memoryOf(memory), viewer: null, positions: positions([james], 'james'), books })
    expect(list.readingNow).toHaveLength(1)
    expect(list.readingNow[0].target.source).toBe('position')
    expect(list.readingNow[0].target.chapterNumber).toBe(1147)
    expect(list.readingNow[0].lastActiveAt).toBe(T0 + 60_000)
    expect(list.readingNow[0].recap).toBeNull()
    expect(heroHeadline(list.readingNow[0], buildRecapCard({ session: memory, source: 'device', paragraphs: null }))).toBe('You stopped in James 1')
  })

  it('resolves Continue to the memory anchor when it is newer, keeping the recap', () => {
    const memory = sessionFor(genesisOneFixture(), { id: 'g1', state: 'progressed', startedAt: T0, lastActiveAt: T0 + 90_000, page: 2 })
    const older = place({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, pageIndex: 0, updatedAt: T0 + 1_000 })
    const target = continueTargetFor({ book: books.get('bible'), session: memory, place: older })
    expect(target).toMatchObject({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, chapterLabel: 'Genesis 1', pageIndex: 1, source: 'memory', at: T0 + 90_000 })
    const card = buildRecapCard({ session: memory, source: 'device', paragraphs: genesisOneFixture().paragraphs })
    const list = readingList({ memory: memoryOf(memory), viewer: null, positions: positions([older], 'genesis'), books })
    expect(heroHeadline(list.readingNow[0], card)).toBe(recapHeadline(card))
    expect(heroHeadline(list.readingNow[0], null)).toBe('You stopped in Genesis 1')
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
    expect(heroHeadline({ session: completedMidBook, target: continueTargetFor({ book: books.get('plato-republic'), session: completedMidBook, place: null })!, recap: null }, null)).toBe('You finished Book I')

    const readingAgain = place({ bookId: 'revelation', headerBook: 'Revelation', chapterNumber: 1, sequentialChapter: 1170, updatedAt: T0 + 20_000 })
    const again = readingList({ memory: memoryOf(finishedRevelation), viewer: null, positions: positions([readingAgain], 'revelation'), books })
    expect(again.finished).toEqual([])
    expect(again.readingNow[0]).toMatchObject({ bookId: 'bible', target: { source: 'position', chapterLabel: 'Revelation 1' } })
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
    expect(heroHeadline(other.readingNow[0], null)).toBe('You stopped in Genesis 2')
  })
})
