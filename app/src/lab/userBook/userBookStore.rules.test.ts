// @vitest-environment jsdom
/**
 * openUserBook never re-cuts a book a reader already has: a stored conversion
 * made under rules 5 opens as it is (healed in memory only), and a book that
 * must be converted again on this device, with a place saved under rules 5,
 * is converted under rules 5. Only a book never converted here gets rules 6.
 * IndexedDB is a small in-memory stand-in (the store's own calls only).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { zip } from '../../../../addbooks/web/test/make-epub.mjs'
import { openUserBook } from './userBookStore'
import { USER_EDITION_FORMAT, type UserBookEdition } from './userEdition'

const OWNER = 'owner-1'
const HEX = 'ab'.repeat(12)

function fakeIndexedDb(records: Map<string, Record<string, unknown>>) {
  const db = {
    objectStoreNames: { contains: () => true },
    createObjectStore() {},
    close() {},
    transaction() {
      const tx: Record<string, unknown> & { oncomplete?: () => void } = {}
      setTimeout(() => tx.oncomplete?.(), 5)
      tx.objectStore = () => ({
        get(key: string) {
          const request: { result?: unknown; onsuccess?: () => void } = {}
          setTimeout(() => { request.result = records.get(key); request.onsuccess?.() }, 0)
          return request
        },
        put(value: Record<string, unknown>) { records.set(String(value.key), value) },
      })
      return tx
    },
  }
  return {
    open() {
      const request: { result?: unknown; onsuccess?: () => void } = {}
      setTimeout(() => { request.result = db; request.onsuccess?.() }, 0)
      return request
    },
  }
}

const CONTAINER = '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
const page = (body: string) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>x</title></head><body>${body}</body></html>`
/** The Importance of Being Earnest's first act, as Project Gutenberg sets it: rules 5 call the chapter "Scene", rules 6 "First Act". */
function earnest(): ArrayBuffer {
  const speeches = Array.from({ length: 24 }, (_, i) => `<p>${['ALGERNON', 'LANE', 'JACK'][i % 3]}.<br/>Line ${i} of the scene, sir.</p>`).join('')
  const bytes: Uint8Array = zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', CONTAINER],
    ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">t</dc:identifier><dc:title>The Importance of Being Earnest</dc:title><dc:creator>Oscar Wilde</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="a" href="a.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/></spine></package>'],
    ['OEBPS/nav.xhtml', page('<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc"><ol><li><a href="a.xhtml#a">FIRST ACT</a><ol><li><a href="a.xhtml#s">SCENE</a></li></ol></li></ol></nav>')],
    ['OEBPS/a.xhtml', page(`<h2 id="a">FIRST ACT</h2><h3 id="s">SCENE</h3><p>Morning-room in Algernon’s flat in Half-Moon Street.</p>${speeches}`)],
  ])
  return Uint8Array.from(bytes).buffer
}

let records: Map<string, Record<string, unknown>>
beforeEach(() => {
  records = new Map()
  ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
})
afterEach(() => {
  delete (globalThis as { indexedDB?: unknown }).indexedDB
  localStorage.clear()
})

describe('openUserBook keeps every book already converted as it was', () => {
  it('opens a conversion stored under rules 5 as it is, healed in memory only', async () => {
    const stored: UserBookEdition = {
      format: USER_EDITION_FORMAT, converter: 5, title: 'War and Peace', author: 'graf Leo Tolstoy', language: 'en', droppedImages: 0, bylines: true,
      chapters: [{ number: 1, title: 'Chapter 1', paragraphs: ['BOOK ONE: 1805', '“Well, Prince, so Genoa and Lucca are now just family estates.”'] }, { number: 2, title: 'Chapter 2', paragraphs: ['Anna Pávlovna’s drawing room was gradually filling.'] }],
    }
    // No file on the record: converting it again could not even happen.
    records.set(`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, edition: stored })
    const result = await openUserBook(HEX, { owner: OWNER })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book.edition.converter).toBe(5)
    expect(result.book.edition.chapters.map(chapter => [chapter.number, chapter.title, chapter.paragraphs])).toEqual(stored.chapters.map(chapter => [chapter.number, chapter.title, chapter.paragraphs]))
    expect(result.book.edition.author).toBe('Leo Tolstoy')
    // The stored conversion itself is untouched.
    expect((records.get(`epub:${HEX}`)!.edition as UserBookEdition).author).toBe('graf Leo Tolstoy')
  })

  it('converts a book read before rules 6 again under rules 5, so its saved place points at the same words', async () => {
    records.set(`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, bytes: earnest() })
    localStorage.setItem(`tinct-addbook:place:${HEX}`, JSON.stringify({ chapterNumber: 1, paragraphIndex: 4, wordIndex: 0, updatedAt: 1 }))
    const result = await openUserBook(HEX, { owner: OWNER })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book.edition.converter).toBe(5)
    expect(result.book.edition.chapters.map(chapter => chapter.title)).toEqual(['Scene'])
    // Paragraph 4 is still the line it was: the speaker alone, as rules 5 set it.
    expect(result.book.edition.chapters[0].paragraphs.slice(0, 5)).toEqual(['FIRST ACT', 'Morning-room in Algernon’s flat in Half-Moon Street.', 'ALGERNON.', 'Line 0 of the scene, sir.', 'LANE.'])
    expect(result.book.place?.paragraphIndex).toBe(4)
    expect((records.get(`epub:${HEX}`)!.edition as UserBookEdition).converter).toBe(5)
  })

  it('converts a book never read here under the current rules', async () => {
    records.set(`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, bytes: earnest() })
    const result = await openUserBook(HEX, { owner: OWNER })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book.edition.converter).toBe(6)
    expect(result.book.edition.chapters.map(chapter => chapter.title)).toEqual(['First Act'])
    expect(result.book.edition.chapters[0].paragraphs[2]).toBe('ALGERNON. Line 0 of the scene, sir.')
    expect(result.book.edition.speakers).toBe(true)
  })
})
