// @vitest-environment jsdom
/**
 * A phone's first open of a PDF applies the phone's open rule in the Tinct reader (D's trace, 22 Oct 2026: told
 * only by Add a book's viewer, the open went reader → viewer → reader). The rule is the viewer's own
 * (reader-layout.js docKind / phoneEdition), and what is kept is what the viewer keeps (reader.js phoneKind and
 * openKind), so either path opens the next time the same way.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ADDBOOK_SCRIPT_TAG, addbookScriptTag, convertPdf } from './pdfEdition'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book tests
import { pdfFixtures } from '../../../../addbooks/web/test/make-pdf.mjs'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import { openUserBook } from './userBookStore'
import { applyPhoneOpenRule, keptPdfPrimerKind, pdfEditionChoice, pdfEditionUntold } from './pdfEditions'

const OWNER = 'owner-1'
const HEX = 'cd'.repeat(12)
const ROOT = process.cwd().replace(/\/app\/?$/, '') + '/'
const READER = readFileSync(ROOT + 'app/public/lab/addbook/js/reader.js', 'utf8')

let records: Map<string, Record<string, unknown>>
let width = 0
beforeEach(() => {
  records = new Map()
  ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
  width = window.innerWidth
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
})
afterEach(() => {
  delete (globalThis as { indexedDB?: unknown }).indexedDB
  localStorage.clear()
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
})

describe("the phone's open rule in the Tinct reader", () => {
  let fixtures: Record<string, Buffer>
  let engine: () => Promise<never>
  beforeAll(() => {
    const require = createRequire(ROOT + 'app/package.json')
    const quiet = console.log
    console.log = () => {}
    require(ROOT + 'app/public/lab/addbook/vendor/pdfjs/pdf.worker.min.js')
    require(ROOT + 'app/public/lab/addbook/vendor/pdfjs/pdf.min.js')
    console.log = quiet
    for (const file of ['pdf-scan.js', 'pdf-text.js', 'reading-order.js', 'reader-layout.js']) require(ROOT + 'app/public/lab/addbook/js/' + file)
    const g = globalThis as unknown as Record<string, never>
    engine = async () => ({ pdfjs: g.pdfjsLib, scan: g.TinctPdfScan, text: g.TinctPdfText, order: g.TinctReadingOrder, layout: g.TinctReaderLayout }) as never
    fixtures = (pdfFixtures as () => Record<string, Buffer>)()
  })
  const keep = (name: string) => records.set(`pdf:${HEX}`, { key: `pdf:${HEX}`, kind: 'pdf', owner: OWNER, name, bytes: Uint8Array.from(fixtures[name]).buffer })
  const converter = () => vi.fn((bytes: ArrayBuffer, options: Record<string, unknown>) => convertPdf(bytes, { ...options, engine, crops: false } as never))
  const kept = () => ({
    phone: JSON.parse(localStorage.getItem(`tinct-addbook:phone-edition:${HEX}`) || 'null'),
    edition: JSON.parse(localStorage.getItem(`tinct-addbook:edition:${HEX}`) || 'null'),
    rule: JSON.parse(localStorage.getItem(`tinct-addbook:open-rule:${HEX}`) || 'null'),
  })

  it('opens running prose as its Tinct text on the first open, keeping what the viewer keeps', async () => {
    keep('prose_book.pdf')
    const convert = converter()
    const result = await openUserBook(HEX, { owner: OWNER, convert })
    expect(result.ok).toBe(true)
    expect(convert).toHaveBeenCalledTimes(1)
    expect(kept()).toEqual({ phone: { edition: 'text', kind: 'narrative', by: 'text', v: 1 }, edition: 'text', rule: 2 })
    // Told: the next open is the Tinct text at once, as after the viewer's round trip.
    expect(pdfEditionChoice(HEX, 'text')).toBe('text')
    expect(pdfEditionUntold(HEX, 'text')).toBe(false)
    expect((await openUserBook(HEX, { owner: OWNER, convert })).ok).toBe(true)
    expect(convert).toHaveBeenCalledTimes(1)
  })

  it('sends a PDF whose rule says pages to the viewer', async () => {
    // A paper the scan reads as pages: on to the viewer, untold here, as before (the viewer tells its kind).
    keep('two_column_paper.pdf')
    expect(await openUserBook(HEX, { owner: OWNER, convert: converter() })).toMatchObject({ ok: false, reason: 'pages' })
    expect(kept()).toEqual({ phone: null, edition: null, rule: null })
    // Text the phone's rule reads as pages (a textbook): told and kept here as the viewer keeps it, then on to the viewer.
    localStorage.clear()
    records.clear()
    keep('prose_book.pdf')
    const textbook = vi.fn(async (bytes: ArrayBuffer, options: Record<string, unknown>) => ({ ...await convertPdf(bytes, { ...options, engine, crops: false } as never), phone: { kind: 'textbook', by: 'text', edition: 'pages' as const } }))
    expect(await openUserBook(HEX, { owner: OWNER, convert: textbook })).toMatchObject({ ok: false, reason: 'pages' })
    expect(kept()).toEqual({ phone: { edition: 'pages', kind: 'textbook', by: 'text', v: 1 }, edition: 'pages', rule: 2 })
  })

  it('leaves the desktop to the margin reader, untold, as before', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    keep('prose_book.pdf')
    const convert = converter()
    expect(await openUserBook(HEX, { owner: OWNER, convert })).toMatchObject({ ok: false, reason: 'pages' })
    expect(kept()).toEqual({ phone: null, edition: null, rule: null })
  })

  it('a reader’s own choice on this phone stands: nothing is told over it', async () => {
    keep('two_column_paper.pdf')
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"text"')
    expect((await openUserBook(HEX, { owner: OWNER, convert: converter() })).ok).toBe(true)
    expect(kept()).toEqual({ phone: null, edition: 'text', rule: null })
  })

  it('writes exactly the keys and values reader.js phoneKind and openKind write', () => {
    // The viewer's writes, as the source has them (store.set: 'tinct-addbook:' + key, JSON).
    expect(READER).toContain("const STORE_PREFIX = 'tinct-addbook:';")
    expect(READER).toContain('set(k, v) { try { localStorage.setItem(STORE_PREFIX + k, JSON.stringify(v)) } catch {} }')
    expect(READER).toContain('const KIND_V = 1;')
    expect(READER).toContain('const OPEN_RULE = 2;')
    expect(READER).toContain("store.set('phone-edition:' + hex, { edition, kind: found.kind, by: found.by, v: KIND_V });")
    expect(READER).toContain("store.set('edition:' + hex, edition);")
    expect(READER).toContain("store.set('open-rule:' + hexOf(state.key), OPEN_RULE);")
    expect(READER).toContain('found = RL.docKind({ scan, pages, count: state.pdf.numPages, primerKind });')
    expect(READER).toContain('const edition = RL.phoneEdition(found.kind, scan.layout);')
    const writes: Record<string, string> = {}
    applyPhoneOpenRule(HEX, { kind: 'narrative', by: 'text', edition: 'text' }, (key, value) => { writes[key] = value })
    expect(writes).toEqual({
      [`tinct-addbook:phone-edition:${HEX}`]: JSON.stringify({ edition: 'text', kind: 'narrative', by: 'text', v: 1 }),
      [`tinct-addbook:edition:${HEX}`]: JSON.stringify('text'),
      [`tinct-addbook:open-rule:${HEX}`]: JSON.stringify(2),
    })
  })

  it('takes a kept primer’s kind as the viewer does (the newest, a known kind)', () => {
    const kinds = ['paper', 'textbook', 'narrative', 'practical', 'other']
    localStorage.setItem(`tinct-addbook:primer:pdf:${HEX}:all`, JSON.stringify({ kind: 'paper', madeAt: '2026-10-20T10:00:00Z' }))
    localStorage.setItem(`tinct-addbook:primer:pdf:${HEX}:outline-2`, JSON.stringify({ kind: 'textbook', madeAt: '2026-10-21T10:00:00Z' }))
    localStorage.setItem(`tinct-addbook:primer:pdf:${HEX}:outline-3`, JSON.stringify({ kind: 'poem', madeAt: '2026-10-22T10:00:00Z' }))
    expect(keptPdfPrimerKind(HEX, kinds)).toBe('textbook')
    expect(keptPdfPrimerKind('ef'.repeat(12), kinds)).toBeNull()
    expect(READER).toContain("const prefix = STORE_PREFIX + 'primer:' + key + ':';")
  })
})

describe("Add a book's scripts: one stamp in the reader and the viewer", () => {
  it('asks for them with the build stamp the viewer\u2019s pages carry: this page\u2019s bundle hash', () => {
    const doc = (src: string | null) => ({ querySelector: () => (src === null ? null : { getAttribute: () => src }) }) as unknown as Document
    expect(addbookScriptTag(doc('/assets/index-GDRC9WDO.js'))).toBe('GDRC9WDO')
    expect(addbookScriptTag(doc('https://tinct.app/assets/index-a_b-C1.js'))).toBe('a_b-C1')
    expect(addbookScriptTag(doc(null))).toBe(ADDBOOK_SCRIPT_TAG)
    expect(addbookScriptTag(null)).toBe(ADDBOOK_SCRIPT_TAG)
    // The viewer's pages are stamped with the same hash (scripts/stamp-lab-entry-tags.cjs bundleHash).
    const stamp = readFileSync(ROOT + 'app/scripts/stamp-lab-entry-tags.cjs', 'utf8')
    expect(stamp).toContain(String.raw`/\/assets\/index-([A-Za-z0-9_-]+)\.js/`)
  })
})
