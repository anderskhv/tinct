// @vitest-environment jsdom
/**
 * A scanned PDF (no text layer) whose text the account has recognised (OCR,
 * §3 of the PDF editions plan): openUserBook fetches the recognised Tinct
 * text from the account (GET /api/user-books/ocr/{hex}/edition), keeps it on
 * the book's record like a text PDF's Tinct text, and opens it here. After
 * OCR the book opens as Tinct text unless the job found a paper (columns on
 * ≥30% of its pages and equations on ≥20%). IndexedDB is a small in-memory
 * stand-in (the store's own calls only); the account is a fake fetch.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { assembleOcrEdition, type OcrPage } from './ocrEdition'
import { fetchOcrEdition } from './ownAccount'
import { choosePdfPages } from './pdfEditions'
import { openUserBook } from './userBookStore'
import type { UserBookEdition } from './userEdition'

const OWNER = 'owner-1'
const HEX = 'cd'.repeat(12)
const SCAN = { v: 5, title: 'A Scanned Book', author: 'Jo', pages: 3, textPages: 0, nav: 'pages', entries: [], layout: { default: 'pages-only' } }

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

const prose = (): UserBookEdition => assembleOcrEdition({ title: 'A Scanned Book', author: 'Jo', pageCount: 3, pages: [1, 2, 3].map(n => ({ page: n, blocks: [{ t: 'p', x: `The text of page ${n}.` }] })) })
const paper = (): UserBookEdition => assembleOcrEdition({ title: 'A Paper', author: 'Jo', pageCount: 3, pages: [1, 2, 3].map((n): OcrPage => ({ page: n, columns: 2, blocks: [{ t: 'p', x: `Results ${n}.` }, { t: 'eq', x: 'x = 1' }] })) })

let records: Map<string, Record<string, unknown>>
beforeEach(() => {
  records = new Map()
  ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
})
afterEach(() => {
  delete (globalThis as { indexedDB?: unknown }).indexedDB
  localStorage.clear()
})

const keepScan = (extra: Record<string, unknown> = {}) => records.set(`pdf:${HEX}`, { key: `pdf:${HEX}`, kind: 'pdf', owner: OWNER, name: 'scan.pdf', bytes: new ArrayBuffer(8), scan: SCAN, layout: SCAN.layout, pages: 3, ...extra })
const never = vi.fn(async () => { throw new Error('a stored scan is not converted again') })

describe('fetchOcrEdition: the recognised Tinct text in the account', () => {
  const answer = (status: number, body?: unknown) => vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status }))

  it('reads GET /api/user-books/ocr/{hex}/edition with the reader’s token', async () => {
    const fetchImpl = answer(200, prose())
    const edition = await fetchOcrEdition(HEX, 'token-1', fetchImpl as unknown as typeof fetch)
    expect(edition).toMatchObject({ source: 'ocr', title: 'A Scanned Book' })
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`/api/user-books/ocr/${HEX}/edition`)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-1')
  })

  it('is none when there is none (404: not recognised, or the switch is off), signed out, offline, or not a recognised text', async () => {
    expect(await fetchOcrEdition(HEX, 'token-1', answer(404) as unknown as typeof fetch)).toBeNull()
    expect(await fetchOcrEdition(HEX, 'token-1', answer(503, { error: 'x' }) as unknown as typeof fetch)).toBeNull()
    const signedOut = answer(200, prose())
    expect(await fetchOcrEdition(HEX, null, signedOut as unknown as typeof fetch)).toBeNull()
    expect(signedOut).not.toHaveBeenCalled()
    expect(await fetchOcrEdition(HEX, 'token-1', vi.fn(async () => { throw new TypeError('offline') }) as unknown as typeof fetch)).toBeNull()
    expect(await fetchOcrEdition(HEX, 'token-1', answer(200, { ...prose(), source: 'pdf' }) as unknown as typeof fetch)).toBeNull()
    expect(await fetchOcrEdition(HEX, 'token-1', answer(200, { ...prose(), chapters: [] }) as unknown as typeof fetch)).toBeNull()
  })
})

describe('openUserBook: a scan whose text the account recognised', () => {
  it('fetches the recognised text, keeps it on the record and opens it as Tinct text', async () => {
    keepScan()
    const ocr = vi.fn(async () => prose())
    const result = await openUserBook(HEX, { owner: OWNER, ocr, convert: never })
    expect(ocr).toHaveBeenCalledWith(HEX)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book).toMatchObject({ kind: 'pdf', pdfPages: 3, edition: { source: 'ocr' } })
    expect(result.book.edition.chapters[0].paragraphs).toEqual(['The text of page 1.', 'The text of page 2.', 'The text of page 3.'])
    expect(records.get(`pdf:${HEX}`)!.edition).toMatchObject({ source: 'ocr' })
    // Kept: the next open reads it from this device.
    const again = await openUserBook(HEX, { owner: OWNER, ocr, convert: never })
    expect(again.ok).toBe(true)
    expect(ocr).toHaveBeenCalledTimes(1)
  })

  it('still opens the pages of a scan with nothing recognised', async () => {
    keepScan()
    expect(await openUserBook(HEX, { owner: OWNER, ocr: async () => null, convert: never })).toMatchObject({ ok: false, reason: 'pages_only' })
    expect(records.get(`pdf:${HEX}`)!.edition).toBeUndefined()
  })

  it('asks the account for a scan it is classifying for the first time', async () => {
    records.set(`pdf:${HEX}`, { key: `pdf:${HEX}`, kind: 'pdf', owner: OWNER, name: 'scan.pdf', bytes: new ArrayBuffer(8) })
    const convert = vi.fn(async () => ({ edition: null, scan: SCAN, fresh: true }))
    const result = await openUserBook(HEX, { owner: OWNER, convert: convert as never, ocr: async () => prose() })
    expect(result.ok && result.book.edition.source).toBe('ocr')
    expect(records.get(`pdf:${HEX}`)).toMatchObject({ scan: { textPages: 0 }, edition: { source: 'ocr' } })
  })

  it('opens the recognised text of a scan kept here without its file', async () => {
    keepScan({ bytes: undefined })
    const result = await openUserBook(HEX, { owner: OWNER, ocr: async () => prose(), convert: never })
    expect(result.ok).toBe(true)
  })

  it('after OCR opens as Tinct text, though the scan was read in its pages before', async () => {
    keepScan()
    localStorage.setItem(`tinct-addbook:pos:pdf:${HEX}`, JSON.stringify({ page: 2, frac: 0.5, zoom: 1, at: 99, edition: 'p' }))
    const result = await openUserBook(HEX, { owner: OWNER, ocr: async () => prose(), convert: never })
    expect(result.ok).toBe(true)
    // ...at the page it was left on.
    if (result.ok) expect(result.book.place).toMatchObject({ chapterNumber: 1, paragraphIndex: 1 })
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:edition:${HEX}`)!)).toBe('text')
    // The reader's later choice of its pages stands.
    if (result.ok) choosePdfPages(HEX, result.book.edition.chapters, result.book.place!)
    expect(await openUserBook(HEX, { owner: OWNER, ocr: async () => prose(), convert: never })).toMatchObject({ ok: false, reason: 'pages' })
  })

  it('after OCR opens a paper (columns on ≥30% of pages, equations on ≥20%) in its pages, with its Tinct text kept', async () => {
    keepScan()
    expect(await openUserBook(HEX, { owner: OWNER, ocr: async () => paper(), convert: never })).toMatchObject({ ok: false, reason: 'pages' })
    expect(records.get(`pdf:${HEX}`)!.edition).toMatchObject({ source: 'ocr' })
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:edition:${HEX}`)!)).toBe('pages')
    // Chosen in the viewer ("Tinct text"): it opens here.
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"text"')
    expect((await openUserBook(HEX, { owner: OWNER, convert: never })).ok).toBe(true)
  })
})
