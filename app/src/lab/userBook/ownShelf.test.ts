// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { ownReading, ownReadingNow, OWN_TABLE_HIDDEN_PREFIX, type OwnShelfBook } from './ownShelf'
import { ownQuickBookRows, withOwnBookRows, type QuickBookRow } from '../../preReader/quickBookSwitcher'
import { ownTableBook, withOwnReading, type ReadingTableBook } from '../../libraryTwoReading'

const HEX = 'cc12cd34ef56ab12cd34ef56'
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
const chapters = [
  { number: 1, title: 'Letter 1', paragraphs: [words(100), words(100)] },
  { number: 2, title: 'Chapter 1', paragraphs: [words(50), words(50), words(50), words(50)] },
  { number: 3, title: 'Chapter 2', paragraphs: [words(400)] },
]
const store = (values: Record<string, unknown>) => (key: string) => values[key] ?? null

describe('an own book being read', () => {
  it('names its chapter, how far through the book it is and its length, from this device', () => {
    const reading = ownReading(HEX, chapters, 1, store({ [`tinct-addbook:place:${HEX}`]: { chapterNumber: 2, paragraphIndex: 2, wordIndex: 10, updatedAt: 500 } }))!
    expect(reading).toMatchObject({ bookId: `userbook-${HEX}`, chapterNumber: 2, chapterLabel: 'Chapter 1', wordCount: 800, lastActiveAt: 500 })
    // 200 + 100 + 10 of 800 words.
    expect(reading.percent).toBeCloseTo(38.75)
    expect(reading.headline).toBe('You’re in the middle of Chapter 1')
  })

  it('is not being read without a saved place, and leaves the reading table when removed since', () => {
    expect(ownReading(HEX, chapters, 1, store({}))).toBeNull()
    const place = { [`tinct-addbook:place:${HEX}`]: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 500 } }
    expect(ownReading(HEX, chapters, 1, store({ ...place, [OWN_TABLE_HIDDEN_PREFIX + HEX]: '600' }))).toBeNull()
    // Reading on after the removal brings it back.
    expect(ownReading(HEX, chapters, 1, store({ ...place, [OWN_TABLE_HIDDEN_PREFIX + HEX]: '400' }))?.chapterLabel).toBe('Letter 1')
  })

  it('without its text on this device, keeps the place time and claims no progress line', () => {
    const reading = ownReading(HEX, null, 7, store({ [`tinct-addbook:place:${HEX}`]: { chapterNumber: 4, paragraphIndex: 0, wordIndex: 0 } }))!
    expect(reading).toMatchObject({ chapterLabel: '', headline: '', percent: null, wordCount: null, lastActiveAt: 7 })
  })
})

const own = (hex: string, title: string, lastActiveAt: number, cover: string | null = 'data:image/jpeg;base64,AAAA'): OwnShelfBook & { reading: NonNullable<OwnShelfBook['reading']> } => ({
  key: `epub:${hex}`, kind: 'epub', hex, title, author: 'A. Writer', cover, at: 1, href: `/reader?userBook=${hex}`,
  reading: { bookId: `userbook-${hex}`, chapterNumber: 3, chapterLabel: 'Chapter Three', headline: 'You’re in the middle of Chapter Three', percent: 25, wordCount: 90000, lastActiveAt },
})

describe('own books beside Tinct’s', () => {
  it('lists the most recently read first', () => {
    const books = [own('aa', 'Old', 1), { ...own('bb', 'Unread', 9), reading: null }, own('cc', 'New', 5)]
    expect(ownReadingNow(books).map(book => book.title)).toEqual(['New', 'Old'])
  })

  it('switcher rows open the own book at its own URL, ordered with Tinct’s rows by time', () => {
    const tinct = [{ bookId: 'frankenstein', title: 'Frankenstein', chapterLabel: 'Chapter 7', coverSrc: '/covers/v2/frankenstein.webp', coverSrcSet: null, coverTone: null, lastActiveAt: 4 }] as QuickBookRow[]
    const rows = withOwnBookRows(tinct, ownQuickBookRows([own('cc', 'The Sovereign Child', 6), own('dd', 'Notes', 2)]))
    expect(rows.map(row => [row.title, row.chapterLabel, row.href ?? null])).toEqual([
      ['The Sovereign Child', 'Chapter Three', '/reader?userBook=cc'],
      ['Frankenstein', 'Chapter 7', null],
      ['Notes', 'Chapter Three', '/reader?userBook=dd'],
    ])
    expect(rows[0].coverSrc).toBe('data:image/jpeg;base64,AAAA')
  })

  it('reading-table rows have the same fields as Tinct’s books, the hero going to the most recent', () => {
    const tinct = [{ bookId: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', cover: '/covers/v2/frankenstein.webp', wordCount: 75000, tone: '#0a1a0a', chapterLabel: 'Chapter 7', headline: 'You’re in the middle of Chapter 7', percent: 42, recap: null, lastActiveAt: 4 }] as ReadingTableBook[]
    const table = withOwnReading(tinct, [own('cc', 'The Sovereign Child', 6)])
    expect(table.map(book => book.bookId)).toEqual(['userbook-cc', 'frankenstein'])
    expect(table[0]).toEqual(ownTableBook(own('cc', 'The Sovereign Child', 6)))
    expect(table[0]).toMatchObject({ title: 'The Sovereign Child', author: 'A. Writer', cover: 'data:image/jpeg;base64,AAAA', chapterLabel: 'Chapter Three', percent: 25, wordCount: 90000, recap: null, own: true })
    expect(withOwnReading(tinct, [])).toBe(tinct)
  })
})
