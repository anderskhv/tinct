// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { keepShownOrder, firstPaintRecord, FIRST_PAINT_KEY } from '../public/lab/library_2/reading-table-first-paint.js'

const row = (bookId: string, extra: Record<string, unknown> = {}) => ({ bookId, title: bookId, author: '', cover: `/lab/library_2/assets/${bookId}.jpg`, tone: null, chapterLabel: 'Chapter 1', headline: '', percent: 10, recap: null, ...extra })

describe('reading table: the account read reconciles quietly (2026-10-10)', () => {
  it('keeps the shown order when the fresh table holds the same books in another order, carrying the fresh facts', () => {
    const shown = { mode: 'returning', reading: [row('frankenstein'), row('pride-and-prejudice')], finished: [] }
    const fresh = { mode: 'returning', reading: [row('pride-and-prejudice', { percent: 2.3 }), row('frankenstein', { percent: 4.7, recap: 'Victor returns to Geneva.' })], finished: [], shelfReading: [] as unknown[] }
    fresh.shelfReading = fresh.reading
    const result = keepShownOrder(shown, fresh)
    expect(result.reading.map((b: { bookId: string }) => b.bookId)).toEqual(['frankenstein', 'pride-and-prejudice'])
    expect(result.reading[0].recap).toBe('Victor returns to Geneva.')
    expect(result.reading[1].percent).toBe(2.3)
    expect(result.shelfReading).toBe(result.reading)
    expect(result).not.toBe(fresh)
  })
  it('returns the fresh table as it is when the books differ or the order already agrees', () => {
    const shown = { mode: 'returning', reading: [row('frankenstein')], finished: [] }
    const added = { mode: 'returning', reading: [row('pride-and-prejudice'), row('frankenstein')], finished: [] }
    expect(keepShownOrder(shown, added)).toBe(added)
    const same = { mode: 'returning', reading: [row('frankenstein')], finished: [] }
    expect(keepShownOrder(shown, same)).toBe(same)
    expect(keepShownOrder(null, same)).toBe(same)
  })
})

describe('reading table: the record boot.js preloads the shown book from', () => {
  const cover = (book: { cover: string }) => book.cover
  function view(current: number, spine: string | null) {
    const el = document.createElement('div')
    el.innerHTML = [0, 1].map(i => `<button class="rt-b${i === current ? ' is-current' : ''}" data-i="${i}"><span class="rt-spine"${spine && i === current ? ` data-binding="${spine}"` : ''}></span></button>`).join('')
    return el
  }
  it('names the account, the shown book, its cover and spine texture, and nothing about the reading', () => {
    const table = { reading: [row('frankenstein', { percent: 42, recap: 'secret' }), row('meditations')] }
    expect(firstPaintRecord(table, view(0, 'green'), 'reader-a', cover)).toEqual({ v: 1, owner: 'reader-a', bookId: 'frankenstein', cover: '/lab/library_2/assets/frankenstein.jpg', spine: 'green' })
    expect(firstPaintRecord(table, view(1, 'navy'), 'reader-a', cover)).toEqual({ v: 1, owner: 'reader-a', bookId: 'meditations', cover: '/lab/library_2/assets/meditations.jpg', spine: 'navy' })
    expect(FIRST_PAINT_KEY).toBe('tinct:library-2-first-paint')
  })
  it('a paper spine is not a texture; an unknown binding leaves the spine out', () => {
    const table = { reading: [row('frankenstein')] }
    expect(firstPaintRecord(table, view(0, 'paper'), 'reader-a')?.spine).toBeNull()
    expect(firstPaintRecord(table, view(0, null), 'reader-a')?.spine).toBeNull()
  })
  it('writes nothing for a signed-out device or a reader\'s own book, whose cover stays on this device', () => {
    expect(firstPaintRecord({ reading: [row('frankenstein')] }, view(0, 'green'), null)).toBeNull()
    const own = { reading: [row('userbook-abc', { own: true, cover: 'data:image/jpeg;base64,AAAA' })] }
    expect(firstPaintRecord(own, view(0, 'green'), 'reader-a')).toBeNull()
  })
})
