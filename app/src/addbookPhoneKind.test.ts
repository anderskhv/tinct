/**
 * Phones open a PDF by its kind (Anders, 16 Oct 2026, option C): public/lab/addbook/js/reader-layout.js
 * docKind, textHeavy, phoneEdition, openDefault and ownChoice, with TinctPdfText.choice (js/pdf-text.js).
 *   - the kind is told locally at open, before any AI call, from a few pages' text and the scan;
 *   - on a phone a narrative or an essay opens as its Tinct text, and so does a paper of running prose
 *     (Deutsch's "Constructor Theory"); papers dense with equations, figures or tables, textbooks and
 *     practical guides open in their pages at the column fit; unsure: the scan's own text-heaviness rule;
 *   - the reader's own choice always wins.
 * The desktop (Anders, 16 Oct 2026; reader-layout.js desktopEdition): every PDF opens as its pages, except
 * running prose (a narrative or an essay, or a text with no columns, mathematics, figures or tables that is
 * prose by the scan's signal or a paper or unsure kind), which opens as its Tinct text.
 * The night set's documents are read with the pdf.js the viewer ships when they are on this machine
 * (NIGHT_DOCS, default the release owner's scratchpad); otherwise the repository's fixture PDFs and
 * written stand-ins are used. No network and no AI.
 */
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { PDF_OPEN_RULE, PDF_OPEN_RULE_AT } from './lab/userBook/pdfEditions'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
const JS = ROOT + 'app/public/lab/addbook/js/'
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'
const FIXTURES = ROOT + 'addbooks/web/test/pdf-fixtures/'
const NIGHT = process.env.NIGHT_DOCS || '/tmp/claude-0/-home-user-tinct/35906d38-b552-59f0-819b-6f696b0ab988/scratchpad/night/docs/'
const READER = readFileSync(JS + 'reader.js', 'utf8')

type Layout = { default: string; score?: number; signals: Record<string, boolean> }
type Scan = { nav: string; pages: number; entries: Array<{ label: string }>; textPages: number; layout: Layout }
type Pages = Array<{ n: number; text: string }>
interface Kinds {
  KINDS: string[]
  kindPages(count: number): number[]
  docKind(o: { scan?: Partial<Scan> | null; pages?: Pages; count?: number; primerKind?: string | null }): { kind: string; sure: boolean; by: string }
  textHeavy(layout: Partial<Layout> | null): boolean
  phoneEdition(kind: string, layout?: Partial<Layout> | null): 'text' | 'pages'
  openDefault(o: { phone?: boolean; kind?: string | null; layout?: Partial<Layout> | null }): string | null
  desktopEdition(kind: string | null, layout?: Partial<Layout> | null): 'text' | 'pages'
  ownChoice(stored: unknown, auto: { edition: string } | null, desk?: { edition: string } | null): 'text' | 'pages' | null
}
type Item = { str: string; transform: number[]; width: number; height: number; hasEOL: boolean }
type Pdf = { numPages: number; getPage(n: number): Promise<{ view: number[]; getTextContent(): Promise<{ items: Item[] }> }>; destroy(): Promise<void> }
let L: Kinds
let choice: (pos: unknown, stored: unknown, layoutDefault: unknown) => 'text' | 'pages' | null
let scanApi: { scan(pdf: Pdf, o: { fileName: string }): Promise<Scan> }
let order: { roles(items: Item[], view: number[]): unknown; pageText(items: Item[], roles: unknown): string }
let pdfjs: { getDocument(o: unknown): { promise: Promise<Pdf> } }

beforeAll(() => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  const g = globalThis as unknown as Record<string, unknown>
  g.window = globalThis
  for (const f of ['reader-layout.js', 'pdf-scan.js', 'pdf-text.js', 'reading-order.js']) require(JS + f)
  L = g.TinctReaderLayout as Kinds
  choice = (g.TinctPdfText as { choice: typeof choice }).choice
  scanApi = g.TinctPdfScan as typeof scanApi
  order = g.TinctReadingOrder as typeof order
  pdfjs = g.pdfjsLib as typeof pdfjs
})

/** As the reader does at open (reader.js phoneKind): the scan, then the text of kindPages in reading order. */
async function readDoc(file: string) {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(file)), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
  const scan = await scanApi.scan(pdf, { fileName: file.split('/').pop() || '' })
  const pages: Pages = []
  for (const n of L.kindPages(pdf.numPages)) {
    const page = await pdf.getPage(n), items = (await page.getTextContent()).items
    pages.push({ n, text: order.pageText(items, order.roles(items, page.view)) })
  }
  const count = pdf.numPages
  await pdf.destroy()
  return { scan, pages, count, kind: L.docKind({ scan, pages, count }) }
}

/* Written stand-ins for the kinds no fixture PDF has, page by page. */
const textbookPages: Pages = [1, 2, 3, 40, 80, 120, 160, 200].map(n => ({ n, text: `${n} 3 — More about Inference\nThe probability of the data given the hypothesis is the likelihood, written P (D | H).\nWe now work through an example in which the prior is uniform and the posterior is computed exactly.\nExercise ${n % 9 + 1}.${n % 5 + 2}.[2, p.${n + 3}] Show that the entropy of the ensemble is maximized when the outcomes are equiprobable.\nThe posterior probability follows from Bayes' theorem, and the marginal is the sum over all hypotheses.\nSolution to exercise ${n % 7 + 1}.${n % 3 + 1} (p.${n}). The answer follows from the definition given in section ${n % 6 + 1}.\nIn this chapter we have seen how inference proceeds when the data are few and the model is simple, and how the result depends on the assumptions we bring to it.`.repeat(2) }))
const practicalPages: Pages = [1, 2, 3, 5, 8, 11, 14, 17].map(n => ({ n, text: `How do I keep the basement dry?\n■ Fix leaky plumbing and leaks in the building envelope as soon as possible.\n■ Keep heating, ventilation and air conditioning drip pans clean and flowing properly.\n■ Vent moisture-generating appliances, such as dryers, to the outside where possible.\nWhat should I do after a flood?\n■ Dry water-damaged areas and items within 24 to 48 hours to prevent mold growth.\n■ Remove and discard porous materials that cannot be cleaned, such as ceiling tiles and carpet.\nIf you smell a musty odor, check behind walls and under carpets for hidden mold.\nUse a dehumidifier when the humidity in your home stays above 60 percent for several days.` }))
const narrativePages: Pages = [1, 2, 3, 4, 6, 8, 10, 12].map(n => ({ n, text: `I never meant to stay the whole summer, but the house would not let me go.\n“You are imagining things,” John said, and laughed, and I laughed with him because it was easier.\nMy sister came on the Sunday. “Are you sleeping?” she asked me at the gate, and I told her I was.\nAt night I lay awake and watched the pattern on the wall, and in the morning I said nothing of it to anyone.\nShe looked at me a long time before she went in, and I knew she did not believe a word of what I had said.` }))
const PROSE: Layout = { default: 'text', signals: { columns: false, math: false, figures: false, tables: false, paper: false, short: false, prose: true } }

describe('telling the kind (docKind), from the text of a few pages and the scan', () => {
  it('reads the first three pages and five spread through the document', () => {
    expect(L.kindPages(640)).toEqual([1, 2, 3, 107, 213, 320, 427, 533])
    expect(L.kindPages(9)).toEqual([1, 2, 3, 5, 6, 8])
    expect(L.kindPages(2)).toEqual([1, 2])
    expect(L.kindPages(0)).toEqual([])
  })
  it('a primer kept for the book names its kind, and that wins', () => {
    expect(L.docKind({ pages: narrativePages, scan: { layout: PROSE }, primerKind: 'paper' })).toEqual({ kind: 'paper', sure: true, by: 'primer' })
    // An unknown primer kind is no kind: the text decides.
    expect(L.docKind({ pages: narrativePages, scan: { layout: PROSE, nav: 'pages' }, primerKind: 'poem' }).by).toBe('text')
  })
  it('too little text is unsure: other', () => {
    expect(L.docKind({ pages: [{ n: 1, text: 'Title page' }] })).toEqual({ kind: 'other', sure: false, by: 'text' })
  })
  it('stand-ins: exercises and numbered chapters are a textbook; bullets, steps and imperatives a practical guide; dialogue and first-person narration a narrative', () => {
    const chapters = Array.from({ length: 8 }, (_, i) => ({ label: `${i + 1} · Chapter ${i + 1}` }))
    expect(L.docKind({ pages: textbookPages, count: 640, scan: { nav: 'contents', entries: chapters, layout: { default: 'pages', signals: { math: true, tables: true } } } }).kind).toBe('textbook')
    expect(L.docKind({ pages: practicalPages, count: 20, scan: { nav: 'headings', entries: [], layout: { default: 'text', signals: { figures: true, short: true } } } }).kind).toBe('practical')
    expect(L.docKind({ pages: narrativePages, count: 13, scan: { nav: 'pages', entries: [], layout: PROSE } }).kind).toBe('narrative')
  })
})

// The night set: each document, its kind, and the edition it opens in on a phone and on the desktop.
// `stand` is the fixture read when the night set is not on this machine.
const NIGHT_SET = [
  { file: 'attention.pdf', kind: 'paper', phone: 'pages', desk: 'pages', stand: 'two_column_paper.pdf' },
  { file: 'gan.pdf', kind: 'paper', phone: 'pages', desk: 'pages', stand: 'two_column_paper.pdf' },
  { file: 'resnet.pdf', kind: 'paper', phone: 'pages', desk: 'pages', stand: 'two_column_paper.pdf' },
  { file: 'mackay.pdf', kind: 'textbook', phone: 'pages', desk: 'pages', stand: null },
  // Anders's 60-page extract of MacKay (16 Oct): scored 2 (mathematics only; the margin figures count as
  // neither columns nor figures), so the desktop opened it as Tinct text. A textbook: its pages now.
  { file: 'anders-test-1016.pdf', kind: 'textbook', phone: 'pages', desk: 'pages', stand: null },
  { file: 'epa-mold-guide.pdf', kind: 'practical', phone: 'pages', desk: 'pages', stand: null },
  { file: 'yellow-wallpaper.pdf', kind: 'narrative', phone: 'text', desk: 'text', stand: 'prose_book.pdf' },
  // A 40-page paper of running prose (arXiv 1210.7439): converted, as the scan's own rule already does.
  { file: 'constructor-theory.pdf', kind: null, phone: 'text', desk: 'text', stand: 'PossibleMinds Deutsch (1).pdf' },
] as const

describe('the night set (or its fixture stand-ins)', () => {
  for (const doc of NIGHT_SET) {
    const real = existsSync(NIGHT + doc.file)
    const file = real ? NIGHT + doc.file : doc.stand ? FIXTURES + doc.stand : null
    it.skipIf(!file)(`${doc.file}${real ? '' : ` (stand-in ${doc.stand})`}: ${doc.kind || 'a prose paper'}, opens on a phone ${doc.phone === 'text' ? 'as its Tinct text' : 'in its pages at the column fit'}, on the desktop ${doc.desk === 'text' ? 'as its Tinct text' : 'as its pages'}`, async () => {
      const { scan, kind } = await readDoc(file!)
      if (doc.kind) expect(kind.kind).toBe(doc.kind)
      expect(L.openDefault({ phone: true, kind: kind.kind, layout: scan.layout })).toBe(doc.phone)
      // The desktop: its pages unless running prose (desktopEdition), the same before the kind is told.
      expect(L.openDefault({ phone: false, kind: kind.kind, layout: scan.layout })).toBe(doc.desk)
      expect(L.desktopEdition(kind.kind, scan.layout)).toBe(doc.desk)
      if (doc.kind !== 'narrative') expect(L.openDefault({ phone: false, kind: null, layout: scan.layout })).toBe(doc.desk)
      if (real && doc.file === 'constructor-theory.pdf') {
        // What sent it to Tinct text before: the scan's layout score (a paper, short; no columns, mathematics, figures or tables) under 3.5.
        expect(scan.layout.default).toBe('text')
        expect(L.textHeavy(scan.layout)).toBe(true)
      }
      // What sent these to Tinct text on the desktop before: the scan's score under 3.5.
      if (real && doc.file === 'epa-mold-guide.pdf') expect(scan.layout.default).toBe('text')
      if (real && doc.file === 'anders-test-1016.pdf') expect(scan.layout).toMatchObject({ default: 'text', score: 2, signals: { math: true, columns: false, figures: false } })
    }, 120_000)
  }
  it('the textbook and the practical guide stand-ins open in their pages on a phone', () => {
    expect(L.phoneEdition(L.docKind({ pages: textbookPages, count: 640, scan: { nav: 'contents', entries: Array.from({ length: 8 }, (_, i) => ({ label: `${i + 1} · C` })), layout: { default: 'pages', signals: { math: true } } } }).kind)).toBe('pages')
    expect(L.phoneEdition('practical', { default: 'text', signals: {} })).toBe('pages')
  })
})

describe('kind -> the mode a phone opens in (phoneEdition, textHeavy)', () => {
  const heavy = (k: string) => ({ default: 'pages', signals: { [k]: true } })
  it('a narrative opens as its Tinct text; a textbook and a practical guide in their pages, prose or not', () => {
    expect(L.phoneEdition('narrative', heavy('math'))).toBe('text')
    expect(L.phoneEdition('textbook', PROSE)).toBe('pages')
    expect(L.phoneEdition('practical', PROSE)).toBe('pages')
  })
  it('a paper or an unsure kind follows the scan\'s text-heaviness: running prose converts, columns, mathematics, figures or tables keep the pages', () => {
    for (const k of ['paper', 'other']) {
      expect(L.phoneEdition(k, { default: 'text', signals: { paper: true, short: true } })).toBe('text')
      for (const sign of ['columns', 'math', 'figures', 'tables']) expect(L.phoneEdition(k, { default: 'text', signals: { [sign]: true } })).toBe('pages')
      expect(L.phoneEdition(k, { default: 'pages', signals: {} })).toBe('pages')
      expect(L.phoneEdition(k, null)).toBe('pages')
    }
  })
  it('a phone before the kind is known keeps the scan\'s default; a PDF without text has its pages only', () => {
    expect(L.openDefault({ phone: true, kind: null, layout: PROSE })).toBe('text')
    expect(L.openDefault({ phone: true, kind: null, layout: { default: 'text', signals: { math: true } } })).toBe('text')
    expect(L.openDefault({ phone: true, kind: 'narrative', layout: { default: 'pages-only', signals: {} } })).toBe('pages-only')
    expect(L.openDefault({ phone: true, kind: 'practical', layout: PROSE })).toBe('pages')
    expect(L.openDefault({ phone: false, kind: 'narrative', layout: { default: 'pages-only', signals: {} } })).toBe('pages-only')
    expect(L.openDefault({ phone: false, kind: 'narrative', layout: null })).toBeNull()
  })
})

describe('kind -> the mode the desktop opens in (desktopEdition: its pages unless running prose)', () => {
  const sign = (k: string, d = 'text') => ({ default: d, signals: { [k]: true } })
  it('a narrative or an essay opens as its Tinct text, whatever the scan finds', () => {
    expect(L.desktopEdition('narrative', PROSE)).toBe('text')
    expect(L.desktopEdition('narrative', sign('math', 'pages'))).toBe('text')
  })
  it('columns, mathematics, figures or tables keep the pages, for every other kind and an unknown one', () => {
    for (const kind of ['paper', 'textbook', 'practical', 'other', null]) for (const k of ['columns', 'math', 'figures', 'tables']) {
      expect(L.desktopEdition(kind, sign(k))).toBe('pages')
      expect(L.desktopEdition(kind, { ...sign(k), signals: { [k]: true, prose: true } })).toBe('pages')
    }
  })
  it('the scan\'s prose signal with none of them: Tinct text, whatever the kind', () => {
    for (const kind of ['paper', 'textbook', 'practical', 'other', null]) expect(L.desktopEdition(kind, PROSE)).toBe('text')
  })
  it('no prose signal and none of them: a paper or an unsure kind is running prose (Constructor Theory); a textbook or a practical guide keeps its pages', () => {
    const plain = { default: 'text', signals: { paper: true, short: true } }
    expect(L.desktopEdition('paper', plain)).toBe('text')
    expect(L.desktopEdition('other', plain)).toBe('text')
    expect(L.desktopEdition(null, plain)).toBe('text')
    expect(L.desktopEdition('textbook', plain)).toBe('pages')
    expect(L.desktopEdition('practical', plain)).toBe('pages')
  })
  it('no scan, or one that keeps the pages: the pages', () => {
    expect(L.desktopEdition('paper', null)).toBe('pages')
    expect(L.desktopEdition('other', { default: 'pages', signals: {} })).toBe('pages')
  })
  it('the phone\'s rule is unchanged beside it (a textbook of prose: the phone its pages, the desktop its Tinct text)', () => {
    expect(L.phoneEdition('textbook', PROSE)).toBe('pages')
    expect(L.desktopEdition('textbook', PROSE)).toBe('text')
  })
})

describe('the reader\'s choice wins (TinctPdfText.choice with ownChoice)', () => {
  const open = ({ phone, pos = null, stored = null, auto = null, desk = null, kind, layout }: { phone: boolean; pos?: unknown; stored?: unknown; auto?: { edition: string } | null; desk?: { edition: string } | null; kind: string; layout: Layout }) =>
    choice(pos, L.ownChoice(stored, auto, desk), L.openDefault({ phone, kind, layout }))
  const PAPER: Layout = { default: 'pages', signals: { math: true, paper: true } }
  it('nothing chosen: the phone opens by kind', () => {
    expect(open({ phone: true, kind: 'narrative', layout: PROSE })).toBe('text')
    expect(open({ phone: true, kind: 'practical', layout: PROSE })).toBe('pages')
    expect(open({ phone: true, kind: 'paper', layout: PAPER })).toBe('pages')
  })
  it('the reader\'s choice on this device wins over the kind, either way', () => {
    expect(open({ phone: true, stored: 'pages', kind: 'narrative', layout: PROSE })).toBe('pages')
    expect(open({ phone: true, stored: 'text', kind: 'paper', layout: PAPER })).toBe('text')
  })
  it('the edition the place was read in wins (here or on another device)', () => {
    expect(open({ phone: true, pos: { page: 3, edition: 'p' }, kind: 'narrative', layout: PROSE })).toBe('pages')
    expect(open({ phone: true, pos: { page: 3, edition: 't' }, kind: 'paper', layout: PAPER })).toBe('text')
  })
  it('the phone\'s own default kept as this device\'s edition is not a choice: the desktop ignores it and opens by its own rule', () => {
    expect(L.ownChoice('pages', { edition: 'pages' })).toBeNull()
    expect(open({ phone: false, stored: 'pages', auto: { edition: 'pages' }, kind: 'practical', layout: PROSE })).toBe('text')
    expect(open({ phone: false, stored: 'text', auto: { edition: 'text' }, kind: 'paper', layout: PAPER })).toBe('pages')
    // A choice of the reader's that differs from the phone's default is theirs.
    expect(L.ownChoice('text', { edition: 'pages' })).toBe('text')
    expect(L.ownChoice('odd', null)).toBeNull()
  })
  it('the desktop\'s own default kept as this device\'s edition is not a choice either; a choice that differs is the reader\'s', () => {
    expect(L.ownChoice('pages', null, { edition: 'pages' })).toBeNull()
    expect(L.ownChoice('text', { edition: 'pages' }, { edition: 'pages' })).toBe('text')
    expect(L.ownChoice('text', null, { edition: 'pages' })).toBe('text')
    // Kept as the desktop's default, then read on a phone of the same device: the phone opens by its kind.
    expect(open({ phone: true, stored: 'text', kind: 'textbook', layout: PROSE, desk: { edition: 'text' } })).toBe('pages')
  })
  it('the desktop with nothing chosen: its pages for every kind but running prose; the reader\'s choice and the place\'s edition win', () => {
    for (const kind of L.KINDS) expect(open({ phone: false, kind, layout: PAPER })).toBe(kind === 'narrative' ? 'text' : 'pages')
    for (const kind of L.KINDS) expect(open({ phone: false, kind, layout: PROSE })).toBe('text')
    expect(open({ phone: false, stored: 'text', kind: 'textbook', layout: PAPER })).toBe('text')
    expect(open({ phone: false, stored: 'pages', kind: 'narrative', layout: PROSE })).toBe('pages')
    expect(open({ phone: false, pos: { page: 3, edition: 'p' }, kind: 'narrative', layout: PROSE })).toBe('pages')
  })
})

describe('reader.js: the kind is told at open, before the Tinct text is forwarded to', () => {
  it('the stored scan\'s open and the first open\'s scan both tell the edition (openKind: phoneKind or deskKind) before forwardToText', () => {
    expect(READER).toMatch(/if \(scan\) await openKind\(scan, token\);\s*if \(token !== state\.token\) return;\s*if \(scan && forwardToText\(scan\)\) return;/)
    expect(READER).toMatch(/await openKind\(scan, token\);\s*if \(token !== state\.token\) return;\s*if \(sameSpot\(currentPlace\(\), state\.lastPlace\) && forwardToText\(scan\)\) return;/)
    expect(READER).toContain('await (isPhone() ? phoneKind(scan, token) : deskKind(scan, token));')
  })
  it('deskKind runs only on the desktop, for a text PDF the reader has chosen nothing for, makes no AI call, and keeps the desktop\'s default marked', () => {
    const body = READER.slice(READER.indexOf('async function deskKind'), READER.indexOf('async function openKind'))
    expect(body).toMatch(/if \(isPhone\(\) \|\| state\.kind !== 'pdf' \|\| !scan \|\| !\(scan\.textPages > 0\) \|\| isOcrText\(\) \|\| state\.pagesAsked\) return;/)
    expect(body).toContain('if (ownEdition()) return;')
    expect(body).toContain("store.set('desk-edition:' + hex, { edition, kind: found.kind, by: found.by, v: DESK_V });")
    expect(body).toContain('RL.desktopEdition(found.kind, scan.layout)')
    expect(body).not.toMatch(/companion|fetch\(|TinctAI/)
    // A place in Tinct text is followed when kept since the rule began, or once this device told it under the rule.
    expect(body).toContain("(pos?.edition === 't' && (store.get('open-rule:' + hex) >= OPEN_RULE || pos.at >= RULE_AT))")
    expect(READER).toContain('const OPEN_RULE = 2, RULE_AT = Date.UTC(2026, 9, 16, 17); // 2026-10-16T17:00:00Z')
    // The library and the Tinct reader read the same rule (pdfEditions.ts).
    expect([PDF_OPEN_RULE, PDF_OPEN_RULE_AT]).toEqual([2, Date.parse('2026-10-16T17:00:00Z')])
  })
  it('phoneKind runs only on a phone, for a text PDF the reader has chosen nothing for, and makes no AI call', () => {
    const body = READER.slice(READER.indexOf('async function phoneKind'), READER.indexOf('/* ---------- Recognising a scan'))
    expect(body).toMatch(/if \(!isPhone\(\) \|\| state\.kind !== 'pdf' \|\| !scan \|\| !\(scan\.textPages > 0\) \|\| isOcrText\(\) \|\| state\.pagesAsked\) return;/)
    expect(body).toContain("if (TinctPdfText.choice(store.get('pos:' + state.key), ownEdition(), null)) return;")
    expect(body).not.toMatch(/companion|fetch\(|TinctAI/)
  })
  it('a choice of the reader\'s (Convert to Tinct book, a recognised scan\'s pages) drops the phone\'s mark', () => {
    expect(READER).toContain("store.set('edition:' + hexOf(state.key), 'text'); store.del('phone-edition:' + hexOf(state.key)); store.del('desk-edition:' + hexOf(state.key));")
    expect(READER).toContain("store.set('edition:' + hex, 'pages'); store.del('phone-edition:' + hex); store.del('desk-edition:' + hex);")
  })
})
