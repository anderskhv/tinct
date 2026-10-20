/**
 * The PDF reader on phones and two devices (the PM's full battery on release train 3, 15 Oct 2026,
 * docs/margin/gloss-test/full-battery.html, "Phones"), public/lab/addbook:
 *   1. the whole-document chat is "Chat" in the t menu, as its margin card says (the book reader keeps Librarian);
 *   2. on a phone a PDF opens with its text column filling the width (js/reader-layout.js textColumn,
 *      columnZoom, columnScroll), read from the two fixture PDFs with the pdf.js the viewer ships;
 *   3. the phone's page pill shortens to the page and never shows empty (pillStages);
 *   4. Escape closes the Aa panel and focus goes back to the Aa button;
 *   5. a link with &pages stays in the pages after the first open's scan (the &pages race);
 *   6. two devices writing cards at once: a 409 is merged and written again, silently, nothing lost.
 * No network and no AI.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
const JS = ROOT + 'app/public/lab/addbook/js/'
const READER = readFileSync(JS + 'reader.js', 'utf8')
const CSS = readFileSync(ROOT + 'app/public/lab/addbook/css/reader.css', 'utf8')

type Row = { x: number; x2: number; words: number }
type Column = { left: number; right: number; columns: number }
interface LayoutApi {
  textColumn(rows: Row[], sides?: Array<number | string> | null): Column | null
  documentColumn(list: Array<Column | null>): Column | null
  columnZoom(o: { column: Column | null; pageWidth: number; room: number; cropX?: number; gutter?: number }): number
  columnScroll(o: { column: Column | null; pageWidth: number; x0?: number; cropX?: number; sheetLeft: number; sheetWidth: number; room: number; gutter?: number }): number
  pillStages(o: { chapter?: string; page?: string; pct?: string; epub?: boolean }): Array<{ label: string; chevron: boolean; cut?: boolean }>
  shortChapter(label: string): string
  cutLabel(label: string): { head: string; tail: string }
  COLUMN_FIT_MIN: number
}
type Item = { str: string; transform: number[]; width: number; height: number }
type Pdf = { numPages: number; getPage(n: number): Promise<{ view: number[]; getTextContent(): Promise<{ items: Item[] }> }> }
let L: LayoutApi
let scanApi: { textRows(items: Item[]): Row[] }
let textApi: { columnsOf(rows: Row[], x0: number, w: number): Array<number | string> | null }
let pdfjs: { getDocument(o: unknown): { promise: Promise<Pdf> } }

beforeAll(() => {
  const quiet = console.log
  console.log = () => {}
  require(JS + '../vendor/pdfjs/pdf.worker.min.js')
  require(JS + '../vendor/pdfjs/pdf.min.js')
  console.log = quiet
  ;(globalThis as unknown as { window: unknown }).window = globalThis
  for (const f of ['reader-layout.js', 'pdf-scan.js', 'pdf-text.js', 'margin.js']) require(JS + f)
  const g = globalThis as unknown as { TinctReaderLayout: LayoutApi; TinctPdfScan: typeof scanApi; TinctPdfText: typeof textApi; pdfjsLib: typeof pdfjs }
  L = g.TinctReaderLayout; scanApi = g.TinctPdfScan; textApi = g.TinctPdfText; pdfjs = g.pdfjsLib
})

describe('1. one name for the whole-document chat', () => {
  it('the PDF reader’s t menu says Chat (the margin card’s name) and opens the chat', () => {
    expect(READER).toMatch(/const MENU = \[\['chat', 'Chat'\],/)
    expect(READER).toContain("if (id === 'chat') return openChat();")
    expect(READER).not.toMatch(/\['librarian', 'Librarian'\]/)
  })
  it('the book reader keeps its Librarian row (src/lab is unchanged)', () => {
    expect(readFileSync(ROOT + 'app/src/lab/labSuperMenu.ts', 'utf8')).toContain("{ id: 'librarian', label: 'Librarian', modes: ['chat', 'talk'] }")
  })
})

describe('2. phones: the text column fills the width', () => {
  const lines = (n: number, x: number, x2: number) => Array.from({ length: n }, () => ({ x, x2, words: 10 }))
  it('finds one column’s edges, ignoring headings, page numbers and indents', () => {
    const rows = [...lines(30, 72, 540), { x: 300, x2: 310, words: 1 }, { x: 72, x2: 200, words: 3 }, ...lines(4, 90, 540)]
    expect(L.textColumn(rows)).toEqual({ left: 72, right: 540, columns: 1 })
  })
  it('takes a two-column page’s first column, as wide as the wider of the two', () => {
    const rows = [...lines(20, 50, 290), ...lines(20, 320, 566)]
    const sides = rows.map(r => (r.x < 300 ? 0 : 1))
    expect(L.textColumn(rows, sides)).toEqual({ left: 50, right: 296, columns: 2 })
  })
  it('says nothing for a page with too little running text (a title page, a scan)', () => {
    expect(L.textColumn(lines(3, 72, 540))).toBeNull()
    expect(L.textColumn([])).toBeNull()
    expect(L.documentColumn([null, null])).toBeNull()
  })
  it('the document’s column is the median of its pages', () => {
    const one = { left: 70, right: 540, columns: 1 }
    expect(L.documentColumn([one, { left: 72, right: 542, columns: 1 }, { left: 200, right: 300, columns: 2 }, null])).toEqual({ left: 72, right: 542, columns: 1 })
  })
  it('zooms until the column fills the width less a 10px gutter, from 1.1 to 3', () => {
    // A 612pt page on a 390px phone, a 246pt column: 2.32.
    expect(L.columnZoom({ column: { left: 50, right: 296, columns: 2 }, pageWidth: 612, room: 390 })).toBeCloseTo((370 * 612) / (246 * 390), 2)
    // Nearly full already: the page stays at fit.
    expect(L.columnZoom({ column: { left: 20, right: 592, columns: 1 }, pageWidth: 612, room: 390 })).toBe(1)
    // A narrow column is held at 3.
    expect(L.columnZoom({ column: { left: 100, right: 160, columns: 2 }, pageWidth: 612, room: 390 })).toBe(3)
    expect(L.columnZoom({ column: null, pageWidth: 612, room: 390 })).toBe(1)
    // Trim page margins: the page shown is narrower, so less zoom is needed.
    expect(L.columnZoom({ column: { left: 50, right: 296, columns: 2 }, pageWidth: 612, room: 390, cropX: 0.08 })).toBeLessThan(L.columnZoom({ column: { left: 50, right: 296, columns: 2 }, pageWidth: 612, room: 390 }))
  })
  it('pans to the column and never off the page', () => {
    const column = { left: 50, right: 296, columns: 2 }
    // The page 900px wide at the scroller's left: the column starts 50pt in, 10px gutter.
    expect(L.columnScroll({ column, pageWidth: 612, sheetLeft: 0, sheetWidth: 900, room: 390 })).toBe(Math.round((50 * 900) / 612 - 10))
    // A column at the page's left edge: no pan left of the page.
    expect(L.columnScroll({ column: { left: 2, right: 240, columns: 1 }, pageWidth: 612, sheetLeft: 0, sheetWidth: 900, room: 390 })).toBe(0)
    // A right column near the edge: no pan past the page's right edge.
    expect(L.columnScroll({ column: { left: 600, right: 610, columns: 1 }, pageWidth: 612, sheetLeft: 0, sheetWidth: 900, room: 390 })).toBe(510)
  })

  const fixture = async (name: string) => {
    const bytes = readFileSync(ROOT + `addbooks/web/test/pdf-fixtures/${name}.pdf`)
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
    const found: Array<Column | null> = []
    let width = 0
    for (let n = 2; n <= Math.min(4, pdf.numPages); n++) {
      const page = await pdf.getPage(n)
      const [x0, , x1] = page.view
      width = x1 - x0
      const rows = scanApi.textRows((await page.getTextContent()).items)
      found.push(L.textColumn(rows, textApi.columnsOf(rows, x0, x1 - x0)))
    }
    return { column: L.documentColumn(found), width }
  }
  it('on the two-column paper fixture: one column fills a 390px phone (about 2.7×), text near 14px', async () => {
    const { column, width } = await fixture('two_column_paper')
    expect(column?.columns).toBe(2)
    const z = L.columnZoom({ column, pageWidth: width, room: 390 })
    expect(z).toBeGreaterThan(2.3)
    expect(z).toBeLessThanOrEqual(3)
    // The column, zoomed, fills 390px less the gutters.
    expect(Math.abs(((column!.right - column!.left) * 390 * z) / width - 370)).toBeLessThan(4)
  }, 60_000)
  it('on the one-column book fixture: the text block fills the width (about 1.5×)', async () => {
    const { column, width } = await fixture('prose_book')
    expect(column?.columns).toBe(1)
    const z = L.columnZoom({ column, pageWidth: width, room: 390 })
    expect(z).toBeGreaterThan(1.3)
    expect(z).toBeLessThan(1.8)
  }, 60_000)

  it('reader.js: a phone opens at the reader’s own zoom there, else the column fit; the desktop as before', () => {
    expect(READER).toContain("state.zoom = isPhone() ? await phoneZoom(saved, token) : saved?.zoom || 1;")
    expect(READER).toMatch(/const own = Number\(saved\?\.phoneZoom\);\n  if \(own > 0\) \{ state\.fit = null; return own \}/)
    // The phone's own zoom is kept apart and only once the reader chose it; the desktop's stays `zoom`.
    expect(READER).toContain("const zoom = state.kind === 'pdf' && isPhone() ? (state.fit ? {} : { phoneZoom: state.zoom }) : { zoom: state.zoom };")
    // A pinch, the size slider and the keys are the reader's choice.
    expect(READER.match(/state\.fit = null;\s*setZoom\(/g)?.length).toBeGreaterThanOrEqual(5)
    // Panned to the column after the place is gone back to.
    expect(READER).toContain("else $('scroll').scrollTop = 0; panToColumn(); onScroll() });")
  })
  it('reader.css: zoomed pages on a phone have no side padding, so the pan stays inside the page', () => {
    expect(CSS).toContain('.lab.byob.is-phone.is-page-zoomed .pdf-column { padding-left: 0; padding-right: 0; }')
    expect(READER).toContain("return Number.isFinite(v) ? v : 32")
  })
})

describe('3. the phone’s header', () => {
  it('the pill goes from the chapter to the page, then drops its chevron; never empty', () => {
    expect(L.pillStages({ chapter: '3 Model Architecture', page: '4' })).toEqual([
      { label: '3 Model Architecture', chevron: true }, { label: 'p. 4', chevron: true }, { label: 'p. 4', chevron: false },
    ])
    expect(L.pillStages({ chapter: 'p. 4 of 15', page: '4' }).at(-1)).toEqual({ label: 'p. 4', chevron: false })
    expect(L.pillStages({ chapter: 'Part II', pct: '42%', epub: true }).at(-1)).toEqual({ label: '42%', chevron: false })
    for (const o of [{}, { chapter: '' }, { page: '' }]) expect(L.pillStages(o).every(s => s.label.trim().length > 0)).toBe(true)
  })
  it('an EPUB chapter (the margin preview of a Tinct book) is tried shorter and then cut before the percent alone (round 2)', () => {
    // To the Lighthouse on a 390 px phone showed "33%" alone: its chapter is cut, its number kept, before the percent.
    expect(L.pillStages({ chapter: 'The Window · 1', pct: '33%', epub: true })).toEqual([
      { label: 'The Window · 1', chevron: true }, { label: 'The Window · 1', chevron: false, cut: true }, { label: '33%', chevron: true }, { label: '33%', chevron: false },
    ])
    expect(L.pillStages({ chapter: 'Book One (1805) — Chapter 1', pct: '0%', epub: true }).slice(0, 3)).toEqual([
      { label: 'Book One (1805) — Chapter 1', chevron: true }, { label: 'Chapter 1', chevron: true }, { label: 'Chapter 1', chevron: false, cut: true },
    ])
    expect(L.shortChapter('Act 1, Scene 1 — Venice. A street')).toBe('Act 1, Scene 1')
    expect(L.shortChapter('Chapter 1 — Loomings')).toBe('Chapter 1')
    expect(L.shortChapter('Book VI: The Widow And The Wife — Chapter LVIII')).toBe('Chapter LVIII')
    expect(L.shortChapter('Agamemnon — Prologue')).toBe('Agamemnon — Prologue')
    expect(L.shortChapter('Letter 1')).toBe('Letter 1')
    expect(L.cutLabel('The Window · 1')).toEqual({ head: 'The Window', tail: ' · 1' })
    expect(L.cutLabel('Time Passes')).toEqual({ head: 'Time Passes', tail: '' })
    // A PDF's pill is as before: no cut stage.
    expect(L.pillStages({ chapter: '3 Model Architecture', page: '4' }).some(s => s.cut)).toBe(false)
    expect(READER).toContain('if (stages[at].cut && whole(title) && readable()) break;')
    expect(CSS).toContain('.lab.byob.is-phone .lab-header-chapter[data-fit="cut"] { flex: 0 1 auto; }')
  })
  it('reader.js tries each stage until the title and the label are whole, the last one always', () => {
    expect(READER).toContain("if (at === stages.length - 1 || (whole(title) && whole(label))) break;")
    // onScroll writes the full label each time: the stage found for the same labels, width and title is shown again.
    expect(READER).toContain("if (key === pill.key) { show(stages[pill.at]); return }")
    expect(READER).toMatch(/fitPill\(window\.TinctReaderLayout\.pillStages\(\{ chapter: ch \? ch\.label : `p\. \$\{at\} of \$\{of\}`, page: at \}\)\);/)
  })
  it('reader.css: the pill keeps its width, no dot on the phone, the chevron hidden when asked', () => {
    expect(CSS).toContain('.lab.byob.is-phone .lab-header-chapter { flex: 0 0 auto; min-width: 0; }')
    expect(CSS).toContain('.lab.byob.is-phone .lab-header-chapter[data-chevron="off"] .lab-header-chevron { display: none; }')
    expect(CSS).toContain('.lab.byob.is-phone .lab-title-sep { display: none; }')
  })
})

describe('4. Escape closes the Aa panel', () => {
  it('from anywhere in it (the size slider too), and focus goes back to the Aa button', () => {
    expect(READER).toContain("layer.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDisplay({ focus: true }) } });")
    expect(READER).toMatch(/if \(panel && \(focus \|\| inside\)\) \$\('aaBtn'\)\.focus\(\{ preventScroll: true \}\);/)
  })
})

describe('5. a link with &pages', () => {
  it('is read once when the PDF opens, so a first open’s late scan does not send it to the Tinct reader', () => {
    expect(READER).toContain("const pagesAsked = new URLSearchParams(location.search).has('pages');")
    expect(READER).toContain("if (!scan || !(scan.textPages > 0) || state.pagesAsked || editionChoice(scan) !== 'text') return false;")
    // The address the reader pushes keeps it, so a reload stays in the pages too.
    // (Since 19 Oct 2026 an EPUB in Margin view has its own address too, without &pages.)
    expect(READER).toContain("const url = kind === 'pdf' ? bookUrl(key) + (state.pagesAsked ? '&pages' : '') : epubMargin() ? bookUrl(key) : null;")
    // forwardToText reads it nowhere else.
    const forward = READER.slice(READER.indexOf('function forwardToText('), READER.indexOf('function readAsText('))
    expect(forward).not.toContain('location.search')
  })
})

describe('6. two devices writing cards at once (409)', () => {
  type Card = { id: string; page: number; at: number; text?: string }
  const HEX = 'ab12cd34ef56ab12cd34ef56'
  // setSync, as reader.js has it, with this test's stand-ins for the page around it.
  const source = READER.slice(READER.indexOf('function setSync({'), READER.indexOf('const marksSync = setSync('))
  function device(server: { cards: Card[]; rev: number; conflicts: number; puts: number }, toasts: string[]) {
    const kept = new Map<string, unknown>()
    const store = { get: (k: string) => kept.get(k), set: (k: string, v: unknown) => { kept.set(k, v) }, del: (k: string) => { kept.delete(k) } }
    const state = { kind: 'pdf', key: 'pdf:' + HEX }
    const fetchImpl = async (_url: string, init: { method: string; body?: string }) => {
      if (init.method === 'GET') return { status: 200, json: async () => ({ cards: server.cards, rev: server.rev }) }
      const body = JSON.parse(init.body!)
      server.puts++
      if (server.conflicts > 0 || body.rev !== server.rev) {
        if (server.conflicts > 0) server.conflicts--
        return { status: 409, json: async () => ({ error: 'conflict', cards: server.cards, rev: server.rev }) }
      }
      server.cards = body.cards; server.rev++
      return { status: 200, json: async () => ({ rev: server.rev }) }
    }
    const win = { TinctAI: { session: () => ({ token: 'tok' }) } }
    const M = (globalThis as unknown as { TinctMargin: { mergeMarks(...s: Card[][]): Card[]; sameMarks(a: Card[], b: Card[]): boolean } }).TinctMargin
    const make = new Function('state', 'store', 'toast', 'TinctMargin', 'hexOf', 'strip', 'fetch', 'window', 'navigator', 'MARKS_SYNC_MS', 'CONFLICT_ROUNDS', source + '\nreturn setSync;')
    const setSync = make(state, store, (m: string) => toasts.push(m), M, (k: string) => k.slice(4), null, fetchImpl, win, { onLine: true }, 1500, 4)
    const sync = setSync({
      path: 'cards', field: 'cards', prefix: 'cards', failed: 'Your margin cards could not be saved to your account. They are kept on this device.',
      local: () => (store.get('cards:' + state.key) as Card[]) || [],
      apply(merged: Card[]) { store.set('cards:' + state.key, merged) },
    })
    const add = (card: Card) => { store.set('cards:' + state.key, [...((store.get('cards:' + state.key) as Card[]) || []), card]); store.set('cards-dirty:' + state.key, true) }
    return { sync, store, state, add, cards: () => (store.get('cards:' + state.key) as Card[]) || [] }
  }
  afterEach(() => { vi.useRealTimers() })

  it('both devices’ cards end up in the account and on both devices, with nothing said', async () => {
    const server = { cards: [] as Card[], rev: 0, conflicts: 0, puts: 0 }, toasts: string[] = []
    const phone = device(server, toasts), desk = device(server, toasts)
    await phone.sync.open(); await desk.sync.open()
    phone.add({ id: 'p1', page: 3, at: 100, text: 'phone' })
    desk.add({ id: 'd1', page: 5, at: 101, text: 'desktop' })
    // Written at the same moment: one of them meets a 409, merges the account's set and writes again.
    await Promise.all([phone.sync.push(), desk.sync.push()])
    expect(server.puts).toBe(3)
    expect(server.cards.map(c => c.id).sort()).toEqual(['d1', 'p1'])
    expect(toasts).toEqual([])
    // The one that met the conflict holds both already; the other has both on its next open.
    await phone.sync.open(); await desk.sync.open()
    expect(phone.cards().map(c => c.id).sort()).toEqual(['d1', 'p1'])
    expect(desk.cards().map(c => c.id).sort()).toEqual(['d1', 'p1'])
    expect(phone.store.get('cards-dirty:' + phone.state.key)).toBeUndefined()
    expect(desk.store.get('cards-dirty:' + desk.state.key)).toBeUndefined()
  })

  it('a conflict on every try: the merged set is kept, sent again a moment later, and nothing is said', async () => {
    vi.useFakeTimers()
    const server = { cards: [{ id: 'd1', page: 5, at: 101 }] as Card[], rev: 7, conflicts: 3, puts: 0 }, toasts: string[] = []
    const phone = device(server, toasts)
    phone.add({ id: 'p1', page: 3, at: 100 })
    await phone.sync.push()
    // Three 409s in a row: the account's card is adopted here, this device's kept, still to send.
    expect(server.puts).toBe(3)
    expect(phone.cards().map(c => c.id).sort()).toEqual(['d1', 'p1'])
    expect(phone.store.get('cards-dirty:' + phone.state.key)).toBe(true)
    expect(toasts).toEqual([])
    await vi.advanceTimersByTimeAsync(1600)
    expect(server.cards.map(c => c.id).sort()).toEqual(['d1', 'p1'])
    expect(phone.store.get('cards-dirty:' + phone.state.key)).toBeUndefined()
    expect(toasts).toEqual([])
  })

  it('a refusal that is not a conflict is still said once (unchanged)', async () => {
    const server = { cards: [] as Card[], rev: 0, conflicts: 0, puts: 0 }, toasts: string[] = []
    const phone = device(server, toasts)
    phone.add({ id: 'p1', page: 3, at: 100 })
    // Signed out on the way: a 401 is a failure, not a conflict.
    phone.sync.call = async () => ({ status: 401, json: {} })
    await phone.sync.push()
    expect(toasts).toEqual(['Your margin cards could not be saved to your account. They are kept on this device.'])
    expect(phone.cards().map(c => c.id)).toEqual(['p1'])
  })
})

describe('the night checklist (15 Oct): a phone card’s ×, and a large PDF that failed to open once', () => {
  it('closing a phone card keeps the Before you start card away at this unit, so × closes it for good', () => {
    const close = READER.slice(READER.indexOf('function closeSheet2() {'), READER.indexOf('function sheetSwipe('))
    expect(close).toContain("if (id !== 'primer') { const u = currentUnit(); if (u) primer.away.add(u.key) }")
  })

  const HEX = 'ab12cd34ef56ab12cd34ef56'
  const KEY = 'pdf:' + HEX
  const source = READER.slice(READER.indexOf('const bytesMatch = '), READER.indexOf('async function openPdf('))
  function harness({ library = null as Uint8Array | null, remote = [] as Uint8Array[], open = [] as Array<'fail' | 'ok' | 'password'> } = {}) {
    const good = new Uint8Array([1, 2, 3]), downloads: string[] = [], touched: unknown[] = [], opened: Uint8Array[] = []
    const state = { token: 1 }
    const engine = { digest: async (b: Uint8Array) => (b[0] === 1 ? HEX : 'ffffffffffffffffffffffff') }
    const lib = { get: async () => (library ? { bytes: library.buffer } : null), touch: async (_k: string, patch: unknown) => { touched.push(patch) } }
    const cloud = { get: () => (remote.length ? { id: 'acct-1' } : null) }
    const win = { TinctAI: { books: { download: async (id: string) => { downloads.push(id); return remote.shift() ?? good } } } }
    const pdfjsLib = { getDocument: ({ data }: { data: Uint8Array }) => { opened.push(data); const r = open.shift() ?? 'ok'; return { promise: r === 'ok' ? Promise.resolve({ numPages: 1 }) : Promise.reject(Object.assign(new Error(r), { name: r === 'password' ? 'PasswordException' : 'InvalidPDFException' })) } } }
    const make = new Function('state', 'engine', 'library', 'cloud', 'window', 'pdfjsLib', 'hexOf', 'console', source + '\nreturn { loadPdf, downloadChecked };')
    const api = make(state, engine, lib, cloud, win, pdfjsLib, (k: string) => k.slice(k.indexOf(':') + 1), { warn: () => {} })
    return { ...api, good, downloads, touched, opened, state }
  }
  it('a first failure is tried once more with this device’s copy read again', async () => {
    const h = harness({ library: new Uint8Array([1, 2, 3]), open: ['fail', 'ok'] })
    await expect(h.loadPdf(new Uint8Array([1, 2, 3]), KEY, 1)).resolves.toEqual({ numPages: 1 })
    expect(h.opened).toHaveLength(2)
    expect(h.downloads).toEqual([])
  })
  it('a device copy that is not the book is replaced by the account’s, checked against the key', async () => {
    const h = harness({ library: new Uint8Array([9, 9]), remote: [new Uint8Array([1, 2, 3])], open: ['fail', 'ok'] })
    await expect(h.loadPdf(new Uint8Array([9, 9]), KEY, 1)).resolves.toEqual({ numPages: 1 })
    expect(h.downloads).toEqual(['acct-1'])
    expect(h.touched).toHaveLength(1)
  })
  it('a password is not tried again, and a second failure still says so', async () => {
    await expect(harness({ library: new Uint8Array([1]), open: ['password'] }).loadPdf(new Uint8Array([1]), KEY, 1)).rejects.toMatchObject({ name: 'PasswordException' })
    await expect(harness({ library: new Uint8Array([1]), open: ['fail', 'fail'] }).loadPdf(new Uint8Array([1]), KEY, 1)).rejects.toThrow()
  })
  it('a download that does not match its book is asked for once more, then refused', async () => {
    const once = harness({ remote: [new Uint8Array([7]), new Uint8Array([1, 2, 3])] })
    await expect(once.downloadChecked('acct-1', KEY)).resolves.toEqual(new Uint8Array([1, 2, 3]))
    expect(once.downloads).toHaveLength(2)
    const twice = harness({ remote: [new Uint8Array([7]), new Uint8Array([8])] })
    await expect(twice.downloadChecked('acct-1', KEY)).rejects.toMatchObject({ code: 'corrupt' })
  })
})
