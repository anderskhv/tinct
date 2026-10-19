// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { accountOnlyBook, flushOwnPlaces, flushPdfPlaces, noteOwnPlace, notePdfPlace, pullAccountPlaces, pushOwnPlace, pushPdfPlace, reconcileOpenPlace, reconcileOwnBooks, reconcilePdfPlace } from './ownSync'
import { fetchAccountCopy, fetchAccountPlaces, type AccountPagePlace, type AccountPlace } from './ownAccount'
import { readUserBookPlace, storedPlaceConverter, writeUserBookPlace } from './userBookPlace'
import type { UserBookEdition } from './userEdition'
import { choosePdfPages, pdfEditionChoice, pdfEditionUntold, readPdfTextPlace } from './pdfEditions'

const forget = vi.hoisted(() => vi.fn(async () => [] as string[]))
vi.mock('./ownShelf', async original => ({ ...await original<typeof import('./ownShelf')>(), forgetRemovedOwnBooks: forget }))

const HEX = 'ab12cd34ef56ab12cd34ef56'
const KEY = `tinct-addbook:place:${HEX}`
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
const chapters = [
  { number: 1, title: 'One', paragraphs: [words(50), words(50)] },
  { number: 2, title: 'Two', paragraphs: [words(50), words(50)] },
]
const edition = { title: 'Mine', chapters } as unknown as UserBookEdition
const kept = () => JSON.parse(localStorage.getItem(KEY) || 'null')

/** The account's places endpoint, in memory: versioned like worker/routes/userBooks.ts. */
function account(initial: Record<string, AccountPlace | AccountPagePlace> = {}) {
  const places = { ...initial }
  const calls: Array<{ method: string; url: string; body: unknown; keepalive?: boolean }> = []
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input)
    const method = init.method ?? 'GET'
    const body = init.body ? JSON.parse(String(init.body)) : null
    calls.push({ method, url, body, keepalive: init.keepalive })
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    if (url === '/api/user-books/places') return Response.json({ places })
    const hex = url.split('/').pop()!
    const current = places[hex]
    if ((current?.rev ?? 0) !== body.rev) return Response.json({ error: 'conflict', place: current ?? null }, { status: 409 })
    places[hex] = { ...body.place, rev: (current?.rev ?? 0) + 1 }
    return Response.json({ place: places[hex] })
  }) as unknown as typeof fetch
  return { places, calls, fetchImpl }
}

beforeEach(() => { localStorage.clear(); forget.mockClear() })
afterEach(() => { vi.useRealTimers() })

describe('own-book places across devices', () => {
  it('takes an account place read later on another device, and keeps this device\'s newer one', async () => {
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 100 })
    const { fetchImpl } = account({ [HEX]: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 3, updatedAt: 200, percent: 75, rev: 4 } })
    await pullAccountPlaces('tok', fetchImpl)
    expect(readUserBookPlace(HEX, edition)).toEqual({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 3, updatedAt: 200 })
    expect(kept()).toMatchObject({ rev: 4, savedAt: 200 })

    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 9, updatedAt: 300 })
    await pullAccountPlaces('tok', fetchImpl)
    expect(readUserBookPlace(HEX, edition)?.wordIndex).toBe(9)
    // The revision seen stays with the place this device noted since.
    expect(kept().rev).toBe(4)
  })

  it('saves this device\'s place with the revision it saw, the percent from its text, and no title', async () => {
    const { places, calls, fetchImpl } = account()
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('saved')
    expect(places[HEX]).toEqual({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500, percent: 50, rev: 1 })
    expect(kept()).toMatchObject({ rev: 1, savedAt: 500, percent: 50 })
    expect(JSON.stringify(calls)).not.toContain('Mine')
    // Nothing new: nothing sent.
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('current')
    expect(calls).toHaveLength(1)
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 600 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('saved')
    expect(calls[1].body).toMatchObject({ rev: 1 })
    expect(places[HEX].rev).toBe(2)
  })

  it('on a stale revision: an older account place is replaced, a newer one is taken here instead', async () => {
    const older = account({ [HEX]: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 100, rev: 7 } })
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 900 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl: older.fetchImpl, chapters })).toBe('saved')
    expect(older.calls.map(call => (call.body as { rev: number }).rev)).toEqual([0, 7])
    expect(older.places[HEX]).toMatchObject({ chapterNumber: 2, rev: 8 })

    localStorage.clear()
    const newer = account({ [HEX]: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 5, updatedAt: 2_000, rev: 3 } })
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 1_000 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl: newer.fetchImpl, chapters })).toBe('adopted')
    expect(newer.places[HEX]).toMatchObject({ chapterNumber: 2, wordIndex: 5, rev: 3 })
    expect(readUserBookPlace(HEX, edition)).toMatchObject({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 5, updatedAt: 2_000 })
  })

  it('a place keeps the conversion rules it was read under, to the account and back (storedPlaceConverter)', async () => {
    const { places, fetchImpl } = account()
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500, converter: 6 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('saved')
    expect(places[HEX]).toMatchObject({ converter: 6, rev: 1 })
    localStorage.clear()
    await pullAccountPlaces('tok', fetchImpl)
    expect(storedPlaceConverter(HEX)).toBe(6)
    expect(readUserBookPlace(HEX, edition)).toMatchObject({ chapterNumber: 2, converter: 6 })
    // A newer place on this device keeps its own rules and the revision it saw.
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 600, converter: 6 })
    expect(kept()).toMatchObject({ converter: 6, rev: 1 })
  })

  it('never sends the opening mark (no reading time) or anything signed out', async () => {
    const { calls, fetchImpl } = account()
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl })).toBe('current')
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 10 })
    expect(await pushOwnPlace(HEX, { token: null, fetchImpl })).toBe('unavailable')
    expect(calls).toEqual([])
  })

  it('the reader\'s notes are sent a moment later, the last one only, and at once when the page is hidden', async () => {
    vi.useFakeTimers()
    const { calls, fetchImpl } = account()
    const send = vi.spyOn(globalThis, 'fetch').mockImplementation(fetchImpl)
    const token = await import('./ownAccount')
    const tokenSpy = vi.spyOn(token, 'ownBookToken').mockResolvedValue('tok')
    try {
      writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 10 })
      noteOwnPlace(HEX, chapters)
      writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 20 })
      noteOwnPlace(HEX, chapters)
      expect(calls).toHaveLength(0)
      flushOwnPlaces()
      await vi.waitFor(() => expect(calls).toHaveLength(1))
      expect(calls[0]).toMatchObject({ method: 'PUT', keepalive: true, body: { rev: 0, place: { chapterNumber: 2, updatedAt: 20 } } })
      await vi.advanceTimersByTimeAsync(5_000)
      expect(calls).toHaveLength(1)
    } finally {
      send.mockRestore()
      tokenSpy.mockRestore()
    }
  })

  it('before the reader opens: a newer account place is taken, a newer device place is saved; offline opens at once', async () => {
    const { places, fetchImpl } = account({ [HEX]: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 500, rev: 1 } })
    await reconcileOpenPlace(HEX, { token: 'tok', fetchImpl, chapters })
    expect(readUserBookPlace(HEX, edition)?.chapterNumber).toBe(2)

    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 900 })
    await reconcileOpenPlace(HEX, { token: 'tok', fetchImpl, chapters })
    await vi.waitFor(() => expect(places[HEX]).toMatchObject({ chapterNumber: 1, updatedAt: 900, rev: 2 }))

    const never = vi.fn(() => new Promise<Response>(() => {})) as unknown as typeof fetch
    const started = Date.now()
    await reconcileOpenPlace(HEX, { token: 'tok', fetchImpl: never, timeoutMs: 50 })
    expect(Date.now() - started).toBeLessThan(1_000)
  })
})

// Add a book's PDF viewer keeps its place as `tinct-addbook:pos:pdf:<hex>` = { page, frac, zoom, pages, at }.
describe('PDF places across devices', () => {
  const PDF = 'fe12cd34ef56ab12cd34ef56'
  const POS = `tinct-addbook:pos:pdf:${PDF}`
  const pos = () => JSON.parse(localStorage.getItem(POS) || 'null')
  const readTo = (page: number, at: number, extra: Record<string, unknown> = {}) =>
    localStorage.setItem(POS, JSON.stringify({ ...(pos() ?? {}), page, frac: 0.5, zoom: 1, pages: 40, at, ...extra }))
  /** Two devices: what Add a book's viewer keeps in each browser. */
  const devices = () => {
    const kept: Record<string, string | null> = { desktop: null, phone: null }
    let on = 'desktop'
    return {
      use(name: 'desktop' | 'phone') {
        kept[on] = localStorage.getItem(POS)
        localStorage.clear()
        on = name
        if (kept[name]) localStorage.setItem(POS, kept[name]!)
      },
    }
  }

  it('round-trips a page place: read to p. 12 on one device, opened at p. 12 on the other; then p. 20 back', async () => {
    const { places, calls, fetchImpl } = account()
    const device = devices()
    device.use('desktop')
    readTo(12, 1_000)
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(places[PDF]).toEqual({ page: 12, frac: 0.5, updatedAt: 1_000, percent: 28.75, rev: 1 })
    expect(pos()).toMatchObject({ page: 12, rev: 1, savedAt: 1_000 })
    // Nothing new: nothing sent.
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('current')
    expect(calls).toHaveLength(1)

    device.use('phone')
    readTo(1, 500, { zoom: 1.4 })
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    // The account's page and how far down it; this device's zoom is its own.
    expect(pos()).toMatchObject({ page: 12, frac: 0.5, at: 1_000, zoom: 1.4, rev: 1, savedAt: 1_000 })

    readTo(20, 2_000)
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(calls[calls.length - 1].body).toMatchObject({ rev: 1, place: { page: 20, updatedAt: 2_000 } })

    device.use('desktop')
    expect(pos()).toMatchObject({ page: 12 })
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    expect(pos()).toMatchObject({ page: 20, at: 2_000, rev: 2, savedAt: 2_000 })
    expect(JSON.stringify(calls)).not.toContain('zoom')
  })

  it('the newer place wins both ways: a newer device place is saved on open, a newer account place is taken', async () => {
    const { places, fetchImpl } = account({ [PDF]: { page: 5, frac: 0, updatedAt: 500, rev: 3 } })
    readTo(9, 900, { rev: 3, savedAt: 400 })
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('kept')
    await vi.waitFor(() => expect(places[PDF]).toMatchObject({ page: 9, updatedAt: 900, rev: 4 }))
    expect(pos()).toMatchObject({ page: 9, at: 900 })

    // Read later on another device while this device's write names an old revision: that place stands here.
    places[PDF] = { page: 30, frac: 0.1, updatedAt: 5_000, rev: 9 }
    readTo(10, 1_200, { rev: 4 })
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    expect(pos()).toMatchObject({ page: 30, frac: 0.1, at: 5_000, rev: 9 })
    expect(places[PDF]).toMatchObject({ page: 30, rev: 9 })

    // An older account place on a newer revision: this device's newer place replaces it.
    places[PDF] = { page: 2, frac: 0, updatedAt: 100, rev: 12 }
    readTo(31, 6_000)
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(places[PDF]).toMatchObject({ page: 31, updatedAt: 6_000, rev: 13 })
  })

  it('a stale account place never replaces a newer one here, on open or in a listing', async () => {
    const { fetchImpl } = account({ [PDF]: { page: 3, frac: 0, updatedAt: 100, rev: 2 } })
    readTo(17, 800, { rev: 2, savedAt: 800 })
    await pullAccountPlaces('tok', fetchImpl)
    expect(pos()).toMatchObject({ page: 17, at: 800 })
    await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })
    expect(pos()).toMatchObject({ page: 17, at: 800 })
  })

  it('offline: the place stays on this device and is saved on a later open', async () => {
    const { places, fetchImpl } = account()
    readTo(12, 1_000)
    const offline = vi.fn(async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl: offline })).toBe('unavailable')
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl: offline })).toBe('unavailable')
    expect(pos()).toMatchObject({ page: 12, at: 1_000 })
    expect(pos().savedAt).toBeUndefined()
    // Back online: the next open saves it.
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('kept')
    await vi.waitFor(() => expect(places[PDF]).toMatchObject({ page: 12, updatedAt: 1_000, rev: 1 }))
    await vi.waitFor(() => expect(pos()).toMatchObject({ rev: 1, savedAt: 1_000 }))
    // Slow or unreachable: the book opens at this device's place at once.
    const never = vi.fn(() => new Promise<Response>(() => {})) as unknown as typeof fetch
    const started = Date.now()
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl: never, timeoutMs: 50 })).toBe('unavailable')
    expect(Date.now() - started).toBeLessThan(1_000)
    // Signed out: nothing is asked.
    expect(await reconcilePdfPlace(PDF, { token: null, fetchImpl: never })).toBe('unavailable')
  })

  it('the viewer\'s notes are sent a moment later, the last one only, and at once when the page is hidden', async () => {
    vi.useFakeTimers()
    const { calls, fetchImpl } = account()
    readTo(3, 10)
    notePdfPlace(PDF, { fetchImpl, token: 'tok' })
    readTo(4, 20)
    notePdfPlace(PDF, { fetchImpl, token: 'tok' })
    expect(calls).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({ method: 'PUT', body: { rev: 0, place: { page: 4, updatedAt: 20 } } })
    readTo(5, 30)
    notePdfPlace(PDF, { fetchImpl, token: 'tok' })
    flushPdfPlaces()
    await vi.waitFor(() => expect(calls).toHaveLength(2))
    expect(calls[1]).toMatchObject({ keepalive: true, body: { rev: 1, place: { page: 5 } } })
    await vi.advanceTimersByTimeAsync(5_000)
    expect(calls).toHaveLength(2)
  })

  it('keeps EPUB and PDF places apart; the shelf shows a PDF read on another device at its page', async () => {
    const { fetchImpl } = account({ [PDF]: { page: 7, frac: 0, updatedAt: 700, percent: 15, rev: 1 }, [HEX]: { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 600, rev: 1 } })
    expect(Object.keys(await fetchAccountPlaces('tok', fetchImpl) ?? {})).toEqual([HEX])
    await pullAccountPlaces('tok', fetchImpl)
    expect(localStorage.getItem(`tinct-addbook:place:${PDF}`)).toBeNull()
    expect(pos()).toMatchObject({ page: 7, at: 700, rev: 1 })
    expect(kept()).toMatchObject({ chapterNumber: 2 })
    const pdf = accountOnlyBook({ id: 'e'.repeat(32), type: 'pdf', sha256: PDF + '0'.repeat(40), title: 'Slides', name: 'slides.pdf', author: '', size: 1, createdAt: '' })
    expect(pdf.reading).toMatchObject({ bookId: `userbook-${PDF}`, chapterLabel: 'p. 7', lastActiveAt: 700 })
  })
})

describe('a PDF read in both its editions (Tinct text and Original pages)', () => {
  const PDF = 'fe12cd34ef56ab12cd34ef56'
  const POS = `tinct-addbook:pos:pdf:${PDF}`
  const pos = () => JSON.parse(localStorage.getItem(POS) || 'null')
  // Pages 1–3: chapter 1 (its second paragraph runs from page 1 onto page 2); pages 4–5: chapter 2.
  const pdfChapters = [
    { number: 1, title: 'One', paragraphs: [words(40), words(60), words(30)], pages: [1, 1, 3], pageBreaks: [[1, 20, 2]] as Array<[number, number, number]> },
    { number: 2, title: 'Two', paragraphs: [words(50), words(50)], pages: [4, 5] },
  ]
  const pdfEdition = { format: 'tinct-user-edition-v1', converter: 1, source: 'pdf', title: 'Paper', author: '', language: 'en', droppedImages: 0, chapters: pdfChapters } as unknown as UserBookEdition
  // A phone's rule (jsdom's window is a desktop's): the desktop opens every PDF in its pages unless chosen (19 Oct 2026).
  const PHONE = { phone: true }

  // Rewritten 19 Oct 2026 (Anders: a PDF's view is chosen per device; only the place syncs): the place read
  // in Tinct text no longer opens the other device in Tinct text; its spot does, once that device's view is.
  it('keeps one place for both editions: read as Tinct text on one device, the other opens at the same word in its own view', async () => {
    vi.useFakeTimers()
    const AT = Date.UTC(2026, 9, 17)
    const { places, calls, fetchImpl } = account()
    // Desktop, in the Tinct text: chapter 1, paragraph 1, word 30 (on page 2).
    writeUserBookPlace(PDF, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 30, updatedAt: AT, converter: 1 })
    noteOwnPlace(PDF, pdfChapters, { pdf: { pages: 5 } })
    // The place it shares with its pages: page, spot on it, the same word and the edition read.
    expect(pos()).toEqual({ page: 2, frac: 0.25, at: AT, chapterNumber: 1, paragraphIndex: 1, wordIndex: 30, converter: 1, edition: 't', pages: 5 })
    // Saved as the PDF's one place (not a text place), with both coordinates.
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(places[PDF]).toEqual({ page: 2, frac: 0.25, updatedAt: AT, percent: 25, chapterNumber: 1, paragraphIndex: 1, wordIndex: 30, converter: 1, edition: 't', rev: 1 })
    expect(calls.every(call => !JSON.stringify(call.body).includes('Paper'))).toBe(true)
    vi.useRealTimers()

    // The phone: nothing of it yet. The account's place carries 't', but that is not the phone's view:
    // its viewer tells it first (untold), and the Tinct text, once that is the phone's, opens at the same word.
    localStorage.clear()
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    expect(pdfEditionChoice(PDF, undefined, undefined, PHONE)).toBeNull()
    expect(pdfEditionUntold(PDF, undefined, undefined, PHONE)).toBe(true)
    // A desktop opens it in its pages (Margin view), whatever the place says.
    expect(pdfEditionChoice(PDF, undefined, undefined, { phone: false })).toBe('pages')
    localStorage.setItem(`tinct-addbook:edition:${PDF}`, '"text"')
    expect(pdfEditionChoice(PDF, undefined, undefined, PHONE)).toBe('text')
    expect(readPdfTextPlace(PDF, pdfEdition)).toEqual({ chapterNumber: 1, paragraphIndex: 1, wordIndex: 30, updatedAt: AT, converter: 1 })
    // Listed with the account's places, it is a PDF's place, never an EPUB's.
    expect(await fetchAccountPlaces('tok', fetchImpl)).toEqual({})
  })

  it('switches to Original pages at the same spot, and back to the same word after reading on in the pages', async () => {
    const { places, fetchImpl } = account()
    writeUserBookPlace(PDF, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 25, updatedAt: 1_000, converter: 1 })
    // Original pages, picked in Book editions: page 4, half way down its words, read in the pages from now.
    const page = choosePdfPages(PDF, pdfChapters, readUserBookPlace(PDF, pdfEdition)!, 5)
    expect(page).toBe(4)
    expect(pos()).toMatchObject({ page: 4, frac: 0.5, chapterNumber: 2, paragraphIndex: 0, wordIndex: 25, edition: 'p' })
    expect(pdfEditionChoice(PDF)).toBe('pages')
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(places[PDF]).toMatchObject({ page: 4, edition: 'p', chapterNumber: 2, wordIndex: 25 })
    // Back without moving: the same word.
    expect(readPdfTextPlace(PDF, pdfEdition)).toMatchObject({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 25 })

    // Read on in the pages on another device to the top of page 5 (its viewer knows no Tinct text).
    places[PDF] = { page: 5, frac: 0, updatedAt: Date.now() + 5_000, edition: 'p', rev: 7 }
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    // The spot in the text from before is not kept with the new page; the text is found from the page.
    expect(pos().chapterNumber).toBeUndefined()
    expect(readPdfTextPlace(PDF, pdfEdition)).toMatchObject({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 })
  })

  // Rewritten 19 Oct 2026: a place read in its pages (or before Tinct text existed) no longer keeps a device in
  // its pages, and a place read in Tinct text (before or since the desktop rule of 16 Oct) no longer opens it in
  // Tinct text: the edition kept on this device decides, else the scan's default, else the viewer tells it.
  it('opens a PDF by this device\'s edition, never by its place: else by its scan, told by the viewer first', () => {
    for (const place of [{ page: 3, frac: 0.25, zoom: 1, at: 50 }, { page: 3, frac: 0.25, at: 50, edition: 'p' }, { page: 3, frac: 0.25, at: Date.UTC(2026, 9, 18), edition: 't' }, null]) {
      localStorage.clear()
      if (place) localStorage.setItem(POS, JSON.stringify(place))
      // The scan's Tinct text is followed once the viewer has told the edition on this device (reader.js openKind).
      expect(pdfEditionChoice(PDF, 'text', undefined, PHONE)).toBeNull()
      expect(pdfEditionUntold(PDF, 'text', undefined, PHONE)).toBe(true)
      localStorage.setItem(`tinct-addbook:open-rule:${PDF}`, '2')
      expect(pdfEditionChoice(PDF, 'text', undefined, PHONE)).toBe('text')
      expect(pdfEditionUntold(PDF, 'text', undefined, PHONE)).toBe(false)
      localStorage.removeItem(`tinct-addbook:open-rule:${PDF}`)
      expect(pdfEditionChoice(PDF, 'pages', undefined, PHONE)).toBe('pages')
      // Not scanned here: the viewer tells it when there is a place to open at; a book never read converts first.
      expect(pdfEditionChoice(PDF, undefined, undefined, PHONE)).toBeNull()
      expect(pdfEditionUntold(PDF, undefined, undefined, PHONE)).toBe(!!place)
      // The edition kept on this device (the reader's choice, or the default its viewer told), as Add a book writes it.
      localStorage.setItem(`tinct-addbook:edition:${PDF}`, '"text"')
      expect(pdfEditionChoice(PDF, 'pages', undefined, PHONE)).toBe('text')
      localStorage.setItem(`tinct-addbook:edition:${PDF}`, '"pages"')
      expect(pdfEditionChoice(PDF, 'text', undefined, PHONE)).toBe('pages')
      expect(pdfEditionUntold(PDF, 'text', undefined, PHONE)).toBe(false)
      // The desktop: its pages unless the reader chose Tinct text here (19 Oct 2026); a kept default is no choice.
      localStorage.removeItem(`tinct-addbook:edition:${PDF}`)
      expect(pdfEditionChoice(PDF, 'text', undefined, { phone: false })).toBe('pages')
      expect(pdfEditionUntold(PDF, 'text', undefined, { phone: false })).toBe(false)
      localStorage.setItem(`tinct-addbook:edition:${PDF}`, '"text"')
      expect(pdfEditionChoice(PDF, 'pages', undefined, { phone: false })).toBe('text')
      localStorage.setItem(`tinct-addbook:desk-edition:${PDF}`, JSON.stringify({ edition: 'text', kind: 'paper', by: 'text', v: 1 }))
      expect(pdfEditionChoice(PDF, 'text', undefined, { phone: false })).toBe('pages')
    }
  })

  it('two devices, one place: the desktop reads pages, the phone opens its Tinct text at the same spot, and back, with the same progress', async () => {
    const { places, fetchImpl } = account()
    const DESK = 'tinct-addbook:desk-edition:' + PDF
    const devices: Record<'desk' | 'phone', Record<string, string>> = { desk: {}, phone: {} }
    const use = (name: 'desk' | 'phone') => { localStorage.clear(); for (const [k, v] of Object.entries(devices[name])) localStorage.setItem(k, v) }
    const keep = (name: 'desk' | 'phone') => { devices[name] = Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)!])) }
    // Each viewer told its own default (reader.js deskKind / phoneKind): the desktop pages, the phone Tinct text.
    devices.desk = { [`tinct-addbook:edition:${PDF}`]: '"pages"', [DESK]: JSON.stringify({ edition: 'pages', kind: 'paper', by: 'text', v: 1 }), [`tinct-addbook:open-rule:${PDF}`]: '2' }
    devices.phone = { [`tinct-addbook:edition:${PDF}`]: '"text"', [`tinct-addbook:phone-edition:${PDF}`]: JSON.stringify({ edition: 'text', kind: 'paper', by: 'text', v: 1 }), [`tinct-addbook:open-rule:${PDF}`]: '2' }

    // The desktop, in its pages: half way down page 4 (the viewer's savePlaceNow, with the spot in its Tinct text).
    use('desk')
    expect(pdfEditionChoice(PDF, 'text')).toBe('pages')
    localStorage.setItem(POS, JSON.stringify({ page: 4, frac: 0.5, at: 5_000, edition: 'p', chapterNumber: 2, paragraphIndex: 0, wordIndex: 25, converter: 1, pages: 5 }))
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(places[PDF]).toMatchObject({ page: 4, frac: 0.5, percent: 70, edition: 'p' })
    keep('desk')

    // The phone: its Tinct text, though the place was read in pages, at the same word.
    use('phone')
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    expect(pdfEditionChoice(PDF, 'text', undefined, PHONE)).toBe('text')
    expect(readPdfTextPlace(PDF, pdfEdition)).toMatchObject({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 25 })
    // Read on in the Tinct text to chapter 2, paragraph 1, word 10 (page 5).
    writeUserBookPlace(PDF, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 10, updatedAt: 9_000, converter: 1 })
    noteOwnPlace(PDF, pdfChapters, { pdf: { pages: 5 } })
    expect(pos()).toMatchObject({ page: 5, frac: 0.2, edition: 't' })
    expect(await pushPdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('saved')
    expect(places[PDF]).toMatchObject({ page: 5, frac: 0.2, percent: 84, edition: 't', chapterNumber: 2, paragraphIndex: 1, wordIndex: 10 })
    keep('phone')

    // Back on the desktop: its pages still, at the page and spot the phone read to.
    use('desk')
    expect(await reconcilePdfPlace(PDF, { token: 'tok', fetchImpl })).toBe('adopted')
    expect(pdfEditionChoice(PDF, 'text')).toBe('pages')
    expect(pos()).toMatchObject({ page: 5, frac: 0.2, edition: 't' })
    // Only the place went to the account: no device's view.
    expect(Object.keys(places[PDF]).sort()).toEqual(['chapterNumber', 'converter', 'edition', 'frac', 'page', 'paragraphIndex', 'percent', 'rev', 'updatedAt', 'wordIndex'])
  })

  it('"Original pages" is this device\'s own choice: the defaults kept here are dropped, so it wins on a phone or a desktop of this browser', () => {
    localStorage.setItem(`tinct-addbook:edition:${PDF}`, '"text"')
    localStorage.setItem(`tinct-addbook:phone-edition:${PDF}`, JSON.stringify({ edition: 'text', v: 1 }))
    localStorage.setItem(`tinct-addbook:desk-edition:${PDF}`, JSON.stringify({ edition: 'pages', v: 1 }))
    writeUserBookPlace(PDF, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 3, updatedAt: 1_000, converter: 1 })
    choosePdfPages(PDF, pdfChapters, readUserBookPlace(PDF, pdfEdition)!, 5)
    expect(pdfEditionChoice(PDF, 'text')).toBe('pages')
    expect(localStorage.getItem(`tinct-addbook:phone-edition:${PDF}`)).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:desk-edition:${PDF}`)).toBeNull()
  })

  it('never keeps the opening mark (no reading time) as a place', () => {
    writeUserBookPlace(PDF, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 })
    noteOwnPlace(PDF, pdfChapters, { pdf: {} })
    expect(pos()).toBeNull()
  })

  it('opens the Tinct text at a link\'s page when its place is on another one', () => {
    writeUserBookPlace(PDF, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 3, updatedAt: 1_000, converter: 1 })
    expect(readPdfTextPlace(PDF, pdfEdition, { page: 3 })).toMatchObject({ chapterNumber: 1, paragraphIndex: 2, wordIndex: 0 })
    expect(readPdfTextPlace(PDF, pdfEdition, { page: 3 })).toMatchObject({ chapterNumber: 1, paragraphIndex: 2, wordIndex: 0 })
  })
})

describe('own books removed on another device', () => {
  it('forgets on this device the books the account no longer lists, then takes the account\'s places', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => String(input) === '/api/user-books'
      ? Response.json({ books: [{ id: 'f'.repeat(32), type: 'epub', sha256: 'c'.repeat(64), title: 'Kept', name: 'kept.epub', author: '', size: 1, createdAt: '2026-10-01T00:00:00Z' }] })
      : Response.json({ places: {} })) as unknown as typeof fetch
    const books = await reconcileOwnBooks('owner-1', { token: 'tok', fetchImpl })
    expect(books).toHaveLength(1)
    expect(forget).toHaveBeenCalledWith('owner-1', new Set([`epub:${'c'.repeat(24)}`]))
  })

  it('forgets nothing when the account cannot be read (offline, signed out, an error)', async () => {
    const failing = vi.fn(async () => new Response('', { status: 500 })) as unknown as typeof fetch
    expect(await reconcileOwnBooks('owner-1', { token: 'tok', fetchImpl: failing })).toBeNull()
    expect(await reconcileOwnBooks('owner-1', { token: null, fetchImpl: failing })).toBeNull()
    const offline = vi.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
    expect(await reconcileOwnBooks('owner-1', { token: 'tok', fetchImpl: offline })).toBeNull()
    expect(forget).not.toHaveBeenCalled()
  })

  // Since 19 Oct 2026 (epubView.ts) an EPUB opens in Add a book's margin reader on the desktop, which fetches it; a phone keeps the Tinct reader.
  it('lists an account EPUB not on this device to open in its view (the margin reader on the desktop, the reader on a phone), with the place and progress read elsewhere', () => {
    localStorage.setItem(`tinct-addbook:place:${'d'.repeat(24)}`, JSON.stringify({ chapterNumber: 3, paragraphIndex: 2, wordIndex: 0, updatedAt: 700, percent: 41.5 }))
    const listed = () => accountOnlyBook({ id: 'e'.repeat(32), type: 'epub', sha256: 'd'.repeat(64), title: 'River Notes', name: 'river.epub', author: 'Me', size: 1, createdAt: '2026-10-01T00:00:00Z' })
    const width = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    expect(listed()).toMatchObject({ href: `/reader?userBook=${'d'.repeat(24)}` })
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    const book = listed()
    expect(book).toMatchObject({ key: `epub:${'d'.repeat(24)}`, href: `/lab/addbook/?userBook=${'d'.repeat(24)}`, title: 'River Notes', cover: null })
    expect(book.reading).toMatchObject({ bookId: `userbook-${'d'.repeat(24)}`, percent: 41.5, lastActiveAt: 700 })
    const pdf = accountOnlyBook({ id: 'e'.repeat(32), type: 'pdf', sha256: 'a'.repeat(64), title: '', name: 'notes.pdf', author: '', size: 1, createdAt: '' })
    expect(pdf).toMatchObject({ title: 'notes', href: `/lab/addbook/?userBook=${'a'.repeat(24)}`, reading: null })
  })
})

describe('an account copy downloaded to this device', () => {
  const bytes = new TextEncoder().encode('an epub file').buffer
  async function hexOf(data: ArrayBuffer) {
    const digest = await crypto.subtle.digest('SHA-256', data)
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
  }
  it('is fetched by the book\'s hex and used only when its bytes match it', async () => {
    const sha = await hexOf(bytes)
    const list = { books: [{ id: 'a'.repeat(32), type: 'epub', sha256: sha, title: 'T', name: 't.epub', author: '', size: 12, createdAt: '' }] }
    const ok = vi.fn(async (input: RequestInfo | URL) => String(input) === '/api/user-books' ? Response.json(list) : new Response(bytes)) as unknown as typeof fetch
    const copy = await fetchAccountCopy(sha.slice(0, 24), 'tok', ok)
    expect(copy.status).toBe('found')
    const altered = vi.fn(async (input: RequestInfo | URL) => String(input) === '/api/user-books' ? Response.json(list) : new Response('something else')) as unknown as typeof fetch
    expect((await fetchAccountCopy(sha.slice(0, 24), 'tok', altered)).status).toBe('unavailable')
    expect((await fetchAccountCopy('0'.repeat(24), 'tok', ok)).status).toBe('gone')
    expect((await fetchAccountCopy(sha.slice(0, 24), null, ok)).status).toBe('unavailable')
    const pdfList = vi.fn(async () => Response.json({ books: [{ ...list.books[0], type: 'pdf' }] })) as unknown as typeof fetch
    expect((await fetchAccountCopy(sha.slice(0, 24), 'tok', pdfList)).status).toBe('pdf')
  })
})
