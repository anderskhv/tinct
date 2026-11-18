// @vitest-environment jsdom
/**
 * The library's Finished shelf, from one reader's own account rows (2026-10-20, ids as stored,
 * values as read from `public.user_data`): Finished must be The Awakening, Symposium and
 * War and Peace, never the Bible, whatever the partly read books and the shelf's tombstones say.
 */
import { describe, expect, it } from 'vitest'
import { completedBookIdsIn, completedLibraryBookId } from './preReader/libraryCompletion'
import { readingNowList, FINISHED_REMOVAL_SINCE } from './preReader/readingNow'
import type { LibraryBookInfo } from './preReader/libraryRecap'
import { ownFinished, ownReading, pdfReading, OWN_FINISHED_PERCENT, type OwnShelfBook, type OwnShelfReading } from './lab/userBook/ownShelf'
import { withOwnFinished, withOwnReading, type ReadingTableFinished } from './libraryTwoReading'

// The account's completion and progress rows (user_data), as the library mirrors them to tinct:<key>.
const ROWS: Record<string, unknown> = {
  'book-completed:symposium': { bookId: 'symposium', source: 'text', completedAt: 1785548118551 },
  'progress:war-and-peace': { bookId: 'war-and-peace', percent: 100, totalChapters: 365, positionPercent: 100, highestCompletedChapter: 364 },
  'progress:the-awakening': { bookId: 'the-awakening', percent: 97, totalChapters: 39, positionPercent: 100, highestCompletedChapter: 38 },
  'progress:bible': { bookId: 'bible', percent: 96, totalChapters: 1189, positionPercent: 72, highestCompletedChapter: 1146 },
  'progress:fear-and-trembling': { bookId: 'fear-and-trembling', percent: 38, totalChapters: 13, positionPercent: 38, highestCompletedChapter: 5 },
  'progress:imitation-of-christ': { bookId: 'imitation-of-christ', percent: 11, totalChapters: 114, positionPercent: 11, highestCompletedChapter: 12 },
  'progress:paradise-lost': { bookId: 'paradise-lost', percent: 33, totalChapters: 12, positionPercent: 33, highestCompletedChapter: 4 },
}
// The shelf: deleted rows (tombstones, before the new rule), Symposium saved, three saved with tableHidden.
const TOMBSTONE_AT = Date.UTC(2026, 9, 12)
const MEMBERSHIP = {
  removed: ['apology', 'candide', 'confessions', 'crime-and-punishment', 'frankenstein', 'hamlet', 'jane-eyre'],
  removedAt: Object.fromEntries(['apology', 'candide', 'confessions', 'crime-and-punishment', 'frankenstein', 'hamlet', 'jane-eyre'].map(id => [id, TOMBSTONE_AT])),
  tableHidden: ['antigone', 'pd-pg-135', 'pd-ws-en-q30055204-12ry0ne'],
  tableHiddenAt: { antigone: TOMBSTONE_AT, 'pd-pg-135': TOMBSTONE_AT, 'pd-ws-en-q30055204-12ry0ne': TOMBSTONE_AT },
}
const chapters = (n: number) => Array.from({ length: n }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, paragraphCount: 10 }))
// Symposium and War and Peace are held from the library's shelves (discoveryAvailable false) but are in its catalogue.
const BOOKS = new Map<string, LibraryBookInfo>([
  ['symposium', 8], ['war-and-peace', 365], ['the-awakening', 39], ['bible', 1189],
  ['fear-and-trembling', 13], ['imitation-of-christ', 114], ['paradise-lost', 12],
].map(([id, n]) => [id as string, { id: id as string, title: id as string, chapters: chapters(n as number) }]))

const storageOf = (rows: Record<string, unknown>) => {
  const entries = Object.entries(rows).map(([key, value]) => [`tinct:${key}`, JSON.stringify(value)] as const)
  return { length: entries.length, key: (i: number) => entries[i]?.[0] ?? null, getItem: (key: string) => entries.find(([k]) => k === key)?.[1] ?? null }
}
const finishedOf = (membership = MEMBERSHIP) => readingNowList({
  memory: { version: 1, sessions: {}, updatedAt: 0 } as never,
  viewer: 'viewer-a',
  positions: null,
  books: BOOKS,
  completedBookIds: completedBookIdsIn(storageOf(ROWS)),
  membership,
}).finished.map(row => row.bookId).sort()

describe('Finished, from the account rows', () => {
  it('is The Awakening, Symposium and War and Peace, never the Bible or a partly read book', () => {
    expect(finishedOf()).toEqual(['symposium', 'the-awakening', 'war-and-peace'])
  })

  it('counts a completion record always; only a removal from 2026-10-20 on takes it off', () => {
    expect(completedLibraryBookId('book-completed:symposium', ROWS['book-completed:symposium'])).toBe('symposium')
    const old = { ...MEMBERSHIP, removed: [...MEMBERSHIP.removed, 'symposium'], removedAt: { ...MEMBERSHIP.removedAt, symposium: TOMBSTONE_AT } }
    expect(finishedOf(old)).toEqual(['symposium', 'the-awakening', 'war-and-peace'])
    const now = { ...old, removedAt: { ...old.removedAt, symposium: FINISHED_REMOVAL_SINCE + 1 } }
    expect(finishedOf(now)).toEqual(['the-awakening', 'war-and-peace'])
  })

  it('reads a legacy progress record as finished when every chapter but the last is marked (1-based) and it is at least 95% through', () => {
    // The writer counted chapters from 1: 364 of 365 is all but the last.
    expect(completedLibraryBookId('progress:war-and-peace', { ...ROWS['progress:war-and-peace'] as object, percent: 99.7, positionPercent: 99 })).toBe('war-and-peace')
    expect(completedLibraryBookId('progress:the-awakening', { ...ROWS['progress:the-awakening'] as object, positionPercent: 97 })).toBe('the-awakening')
    // Two chapters short, or under 95%: not finished.
    expect(completedLibraryBookId('progress:x', { bookId: 'x', totalChapters: 39, highestCompletedChapter: 37, percent: 97, positionPercent: 97 })).toBeNull()
    expect(completedLibraryBookId('progress:x', { bookId: 'x', totalChapters: 39, highestCompletedChapter: 38, percent: 94, positionPercent: 94 })).toBeNull()
    expect(completedLibraryBookId('progress:bible', ROWS['progress:bible'])).toBeNull()
  })
})

describe('an own book is finished by its place (the place the account already keeps)', () => {
  const HEX = 'cc12cd34ef56ab12cd34ef56'
  const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
  const text = [
    { number: 1, title: 'One', paragraphs: [words(200)] },
    { number: 2, title: 'Two', paragraphs: [words(200)] },
    { number: 3, title: 'Three', paragraphs: [words(400)] },
  ]
  const store = (values: Record<string, unknown>) => (key: string) => values[key] ?? null
  const place = (p: object) => store({ [`tinct-addbook:place:${HEX}`]: { updatedAt: 500, ...p } })

  it('an EPUB: its last chapter, at least 95% through', () => {
    expect(OWN_FINISHED_PERCENT).toBe(95)
    expect(ownReading(HEX, text, 1, place({ chapterNumber: 3, paragraphIndex: 0, wordIndex: 380 }))?.finished).toBe(true)
    // In the last chapter but not far enough, or far along an earlier chapter: still being read.
    expect(ownReading(HEX, text, 1, place({ chapterNumber: 3, paragraphIndex: 0, wordIndex: 100 }))?.finished).toBe(false)
    // An account copy whose text is not here: the place's own percent decides.
    expect(ownReading(HEX, null, 1, place({ chapterNumber: 9, paragraphIndex: 0, wordIndex: 0, percent: 98 }))?.finished).toBe(true)
    expect(ownReading(HEX, null, 1, place({ chapterNumber: 9, paragraphIndex: 0, wordIndex: 0, percent: 60 }))?.finished).toBe(false)
    expect(ownFinished({ last: false, percent: 99 })).toBe(false)
  })

  it('a PDF: its last page, at least 95% through; an unknown page count is never finished', () => {
    const pos = (p: object) => store({ [`tinct-addbook:pos:pdf:${HEX}`]: { at: 900, ...p } })
    expect(pdfReading(HEX, { pages: 40 }, 1, pos({ page: 40, frac: 0.2, pages: 40 }))?.finished).toBe(true)
    expect(pdfReading(HEX, { pages: 40 }, 1, pos({ page: 39, frac: 0.9, pages: 40 }))?.finished).toBe(false)
    expect(pdfReading(HEX, {}, 1, pos({ page: 40, frac: 1 }))?.finished).toBe(false)
  })

  it('leaves the reading table for Finished, latest first, as Tinct’s finished books do', () => {
    const own = (hex: string, finished: boolean, at: number) => ({
      key: `pdf:${hex}`, kind: 'pdf', hex, title: `Own ${hex.slice(0, 2)}`, author: '', cover: null, at, href: `/lab/addbook/?userBook=${hex}`,
      reading: { bookId: `userbook-${hex}`, chapterNumber: 1, chapterLabel: 'p. 40 of 40', headline: '', percent: finished ? 99 : 40, wordCount: null, lastActiveAt: at, finished },
    }) as OwnShelfBook & { reading: OwnShelfReading }
    const books = [own('aa'.repeat(12), true, 300), own('bb'.repeat(12), false, 200)]
    const tinct: ReadingTableFinished[] = [{ bookId: 'the-awakening', title: 'The Awakening', author: 'Kate Chopin', cover: null, finishedAt: 100 }]
    const finished = withOwnFinished(tinct, books.filter(b => b.reading.finished))
    expect(finished.map(row => row.bookId)).toEqual([`userbook-${'aa'.repeat(12)}`, 'the-awakening'])
    expect(finished[0]).toMatchObject({ own: true, ownKey: `pdf:${'aa'.repeat(12)}`, kind: 'pdf', href: `/lab/addbook/?userBook=${'aa'.repeat(12)}`, finishedAt: 300 })
    expect(withOwnReading([], books.filter(b => !b.reading.finished)).map(row => row.bookId)).toEqual([`userbook-${'bb'.repeat(12)}`])
  })
})
