/**
 * Named sections for a paper-like PDF without bookmarks (tester, 9 Nov 2026: "scan/create chapters to skip more
 * easily"). Deterministic and local: pdf.js text rows, their size and face, their place on the page and the way
 * papers number and name their sections. No AI. When the evidence is thin this returns null and the reader keeps
 * the units it had before (the scan's chapters or page ranges).
 *
 * A heading is accepted only when it is
 *  - set apart from the body: larger, or the body's size in a bold face, or in capitals when numbered or a known name;
 *  - shaped like a heading: a short line, mostly letters, not a sentence, caption, formula, address or page number;
 *  - not furniture (a running head or foot, repeated on several pages) and not the title block above the first
 *    numbered or known heading on page 1;
 *  - numbered in sequence ("1", "2", "2.1", "I.", "A.1" after the references) or a name papers use ("Abstract",
 *    "Related Work", "References"…), or set in the same style as such headings in an unnumbered paper.
 * Reading order follows the page's columns: a two-column page reads its left column, then its right.
 */

export interface PdfTextRow { y: number; x: number; x2: number; size: number; font: string | null; text: string; words: number }
export interface PdfSectionPage { n: number; x0: number; y0: number; w: number; h: number; rows: PdfTextRow[] }
/** frac: the heading's top as a fraction of its page's height, from the top (the reader's place). */
export interface PdfDetectedSection { title: string; page: number; frac: number; level: number }
export interface PdfSectionOptions {
  /** A font's face name ("Times-Bold", "CMBX12"); only asked for rows set at the body's size. */
  faceOf?: (page: number, font: string) => Promise<string> | string
  isFurniture?: (page: PdfSectionPage, row: PdfTextRow) => boolean
  live?: () => boolean
}

/** Papers and reports; a longer document's chapters come from its outline or the scan, as before. */
export const PDF_SECTION_PAGES = 60

const KNOWN = /^(?:abstract|summary|introduction|background|motivation|related work|related works|prior work|previous work|literature review|preliminaries|notation|problem (?:setup|setting|statement|formulation|definition)|methods?|methodology|materials and methods|methods and materials|approach|our approach|proposed method|model|framework|theory|data|datasets?|experiments?|experimental (?:setup|results|design|evaluation)|evaluation|results?(?: and discussion)?|findings|analysis|discussion|general discussion|limitations|conclusions?(?: and future work)?|concluding remarks|future work|acknowledge?ments?|references|bibliography|works cited|literature cited|appendix(?:es)?|appendices|supplementary (?:material|materials|information)|supporting information|data availability(?: statement)?|code availability|ethics statement|broader impacts?|impact statement|author contributions|competing interests|conflicts? of interest|declarations?|funding|keywords)$/i
const BACK = /^(?:references|bibliography|works cited|literature cited|acknowledge?ments?)$/i
const CAPTION = /^(?:fig(?:ure)?s?|table|tab|algorithm|alg|listing|eq(?:uation)?|scheme|chart|plate|box|exhibit)\.?\s*(?:\d|[IVX]+\b|S\d)/i
const MATH = /[=∑∫≡⊗⊕→←≈≤≥±×√∂∇∈∀∃]/
const BOLD = /bold|black|heavy|semibold|demi|medi(?:um)?\b|cmbx|-bd\b|\bbd$/i
const ITALIC = /italic|oblique|slanted|cmti|cmsl|-it\b|\bit$/i
const PAGE_NUMBER = /^(?:page\s*)?\d{1,4}(?:\s*(?:of|\/)\s*\d{1,4})?$/i
const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15 }

type Numbering = { kind: 'arabic' | 'roman' | 'letter' | 'appendix'; parts: number[]; dot: boolean; name: string }
/** "2.1 Method" -> arabic [2, 1]; "IV. RESULTS" -> roman [4]; "A.2 Proofs" -> letter [1, 2]; "Appendix B: Data" -> appendix [2]. */
export function sectionNumbering(text: string): Numbering | null {
  let m = /^(\d{1,2}(?:\.\d{1,2}){0,3})(\.?)\s+(\S.*)$/u.exec(text)
  if (m && /^\p{Lu}/u.test(m[3])) return { kind: 'arabic', parts: m[1].split('.').map(Number), dot: !!m[2], name: m[3] }
  m = /^([IVX]{1,4})\.\s+(\S.*)$/u.exec(text)
  if (m && ROMAN[m[1]] && /^\p{Lu}/u.test(m[2])) return { kind: 'roman', parts: [ROMAN[m[1]]], dot: true, name: m[2] }
  m = /^appendix\s+([A-H]|\d{1,2})\b[.:]?\s*(.*)$/iu.exec(text)
  if (m) return { kind: 'appendix', parts: [/\d/.test(m[1]) ? Number(m[1]) : m[1].toUpperCase().charCodeAt(0) - 64], dot: false, name: m[2] || text }
  m = /^([A-H])(?:\.(\d{1,2}))?(\.?)\s+(\S.*)$/u.exec(text)
  if (m && /^\p{Lu}/u.test(m[4])) return { kind: 'letter', parts: [m[1].charCodeAt(0) - 64, ...(m[2] ? [Number(m[2])] : [])], dot: !!m[3], name: m[4] }
  return null
}

const SMALL_WORDS = /^(?:a|an|and|as|at|by|for|from|in|into|of|on|or|the|to|vs|via|with)$/
/** "II. RELATED WORK" -> "II. Related Work"; "APPENDIX A. PROOFS" -> "Appendix A. Proofs". Mixed case stays as printed. */
export function readableCaps(text: string): string {
  if (/\p{Ll}/u.test(text)) return text
  return text.split(' ').map((word, index) => /^(?:[IVX]+|[A-Z])[.:]?$/.test(word) || !/\p{L}/u.test(word) ? word
    : index > 0 && SMALL_WORDS.test(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0) + word.slice(1).toLocaleLowerCase()).join(' ')
}
const bareName = (text: string) => text.replace(/[.:]+$/, '').replace(/\s+/g, ' ').trim()
export const knownSectionName = (text: string): boolean => KNOWN.test(bareName(text))

/** A short line that reads like a heading, not a sentence, caption, formula, address or page number. */
function headingShape(text: string, row: PdfTextRow): boolean {
  if (text.length < 3 || text.length > 90 || row.words > 12) return false
  const letters = (text.match(/\p{L}/gu) || []).length
  if (letters < 3 || letters < text.replace(/\s/g, '').length * 0.6) return false
  if (/[,;]$/.test(text) || CAPTION.test(text) || MATH.test(text) || PAGE_NUMBER.test(text)) return false
  if (/@|https?:|www\.|doi[:.]|\bet al\b|\(\d{4}\)/i.test(text)) return false
  // A sentence ends in a full stop; a heading does not ("Abstract." alone is still a heading).
  if (/[.!?]$/.test(text) && !knownSectionName(text)) return false
  return true
}

type Candidate = { row: PdfTextRow; page: PdfSectionPage; text: string; numbering: Numbering | null; known: boolean; caps: boolean; italic: boolean; style: string; column: number; order: number }

function bodyOf(pages: PdfSectionPage[]): { size: number; font: string | null } | null {
  const weight = new Map<string, number>()
  for (const page of pages) for (const row of page.rows) {
    if (row.words < 4) continue
    const key = `${Math.round(row.size * 2) / 2}|${row.font ?? ''}`
    weight.set(key, (weight.get(key) ?? 0) + row.text.length)
  }
  const top = [...weight].sort((a, b) => b[1] - a[1])[0]
  if (!top) return null
  const bar = top[0].indexOf('|')
  return { size: Number(top[0].slice(0, bar)), font: top[0].slice(bar + 1) || null }
}

/** 0 for a one-column page or the left column, 1 for the right column of a two-column page. */
function columnOf(page: PdfSectionPage) {
  const mid = page.x0 + page.w / 2, slack = page.w * 0.02
  const lines = page.rows.filter(row => row.words >= 5)
  const twoColumns = lines.filter(row => row.x2 < mid + slack).length >= 5 && lines.filter(row => row.x > mid - slack).length >= 5
  return (row: PdfTextRow) => twoColumns && row.x > mid - slack ? 1 : 0
}

export async function detectPdfSections(pages: PdfSectionPage[], options: PdfSectionOptions = {}): Promise<PdfDetectedSection[] | null> {
  const live = options.live ?? (() => true)
  if (!pages.length || pages.length > PDF_SECTION_PAGES) return null
  const body = bodyOf(pages)
  if (!body) return null
  const faces = new Map<string, string>()
  const faceOf = async (page: number, font: string | null) => {
    if (!font || !options.faceOf) return ''
    if (!faces.has(font)) { try { faces.set(font, await options.faceOf(page, font) || '') } catch { faces.set(font, '') } }
    return faces.get(font)!
  }
  // Candidates, in reading order.
  const candidates: Candidate[] = []
  for (const page of pages) {
    const column = columnOf(page)
    const found: Candidate[] = []
    for (const row of page.rows) {
      const text = row.text.replace(/\s+/g, ' ').trim()
      if (!headingShape(text, row) || options.isFurniture?.(page, row)) continue
      const numbering = sectionNumbering(text)
      const name = numbering?.name ?? text
      if (!/^\p{Lu}/u.test(name)) continue
      const known = knownSectionName(name) || numbering?.kind === 'appendix' || /^appendix$/i.test(bareName(text))
      const letters = name.replace(/[^\p{L}]/gu, '')
      const caps = letters.length >= 4 && letters === letters.toLocaleUpperCase()
      const larger = row.size > body.size * 1.08
      const same = Math.abs(row.size - body.size) <= body.size * 0.08
      if (!larger && !same) continue
      const face = await faceOf(page.n, row.font)
      if (!live()) return null
      const bold = BOLD.test(face), italic = ITALIC.test(face)
      // Italic lines are emphasis or quotation, unless an IEEE subsection ("A. Datasets") or set much larger.
      const ieeeSub = numbering?.kind === 'letter' && numbering.dot && italic && same
      if (italic && !ieeeSub && row.size < body.size * 1.3) continue
      const distinct = larger || (same && bold && row.font !== body.font) || (same && caps && (!!numbering || known)) || ieeeSub
      if (!distinct) continue
      found.push({ row, page, text, numbering, known, caps, italic, style: `${Math.round(row.size * 2) / 2}|${row.font ?? ''}|${caps ? 'C' : ''}`, column: column(row), order: 0 })
    }
    found.sort((a, b) => a.column - b.column || b.row.y - a.row.y)
    // Page 1: what stands above the first numbered or known heading is the title block (title, authors, affiliations).
    if (page.n === 1) {
      const first = found.findIndex(c => c.numbering || c.known)
      found.splice(0, found.length, ...found.filter((c, index) => index >= first && first >= 0 || c.known))
    }
    candidates.push(...found)
  }
  candidates.forEach((c, index) => { c.order = index })
  // A line in a heading's style repeated on three pages or more is a running head.
  const seen = new Map<string, Set<number>>()
  for (const c of candidates) { const key = c.text.toLocaleLowerCase(); seen.set(key, (seen.get(key) ?? new Set()).add(c.page.n)) }
  const repeated = (c: Candidate) => (seen.get(c.text.toLocaleLowerCase())?.size ?? 0) >= 3
  // Styles anchored by numbered or known headings. An unnumbered line in another style (a bold chart title, a
  // table's header) is not a section; nor is one in a style whose anchors are numbered (a paper numbers its sections).
  const anchors = new Map<string, { numbered: number; known: number }>()
  for (const c of candidates) {
    if (repeated(c) || !(c.numbering || c.known)) continue
    const a = anchors.get(c.style) ?? { numbered: 0, known: 0 }
    if (c.numbering) a.numbered++; else a.known++
    anchors.set(c.style, a)
  }
  // Numbering in sequence, read in order.
  const accepted: Array<Candidate & { level: number }> = []
  let lastTop = 0, lastRoman = 0, references = false
  for (const c of candidates) {
    if (repeated(c)) continue
    const n = c.numbering
    let level = 0
    if (n?.kind === 'arabic') {
      const top = n.parts[0]
      if (n.parts.length === 1) { if (top > lastTop && top <= lastTop + 3) { level = 1; lastTop = top } }
      else if (top === lastTop || (top === lastTop + 1 && n.parts.every((part, index) => index === 0 || part === 1))) { level = n.parts.length; lastTop = top }
    } else if (n?.kind === 'roman') {
      if (n.parts[0] > lastRoman && n.parts[0] <= lastRoman + 2) { level = 1; lastRoman = n.parts[0] }
    } else if (n?.kind === 'letter') {
      // "A. Datasets" under an IEEE section; "A Proofs" or "A.1 Lemma" in the appendix, after the references.
      if (lastRoman && n.dot && n.parts.length === 1) level = 2
      else if (references) level = n.parts.length
    } else if (n?.kind === 'appendix') level = 1
    else if (c.known) level = 1
    else {
      const a = anchors.get(c.style)
      if (a && a.known > a.numbered) level = 1
    }
    if (!level) continue
    if (c.known && BACK.test(bareName(n?.name ?? c.text))) references = true
    if (/^appendix/i.test(c.text)) references = true
    accepted.push({ ...c, level })
  }
  // An unnumbered known name smaller than the numbered sections ("Results" under "4 Experiments") is a subsection;
  // the paper's own apparatus (Abstract, Acknowledgments, References, appendices) is always a section of its own.
  const apparatus = (c: Candidate) => /^(?:abstract|summary|keywords|appendix(?:es)?|appendices)$/i.test(bareName(c.text)) || BACK.test(bareName(c.text)) || c.numbering?.kind === 'appendix'
  const median = (list: number[]) => list.sort((a, b) => a - b)[Math.floor(list.length / 2)]
  let topSize = median(accepted.filter(c => c.numbering?.kind === 'arabic' && c.level === 1).map(c => c.row.size))
  if (topSize === undefined) {
    // An unnumbered paper: its sections are the size most of its known names share ("Introduction", "Results").
    const sizes = new Map<number, number>()
    for (const c of accepted) if (!c.numbering && c.known && !apparatus(c)) { const k = Math.round(c.row.size * 2) / 2; sizes.set(k, (sizes.get(k) ?? 0) + 1) }
    topSize = [...sizes].filter(([, count]) => count >= 2).sort((a, b) => b[0] - a[0])[0]?.[0]
  }
  for (const c of accepted) if (!c.numbering && topSize !== undefined && !apparatus(c) && c.row.size < topSize - 0.25) c.level = 2
  const sections = accepted.map(c => ({
    title: readableCaps(c.text.replace(/[.:]+$/, '')), page: c.page.n, level: c.level,
    frac: Math.max(0, Math.min(1, (c.page.y0 + c.page.h - (c.row.y + c.row.size)) / c.page.h)),
  }))
  // Confident only with at least two numbered or known sections at the top level, and never a line on every page.
  const top = accepted.filter(c => c.level === 1)
  const strong = top.filter(c => c.numbering || c.known).length
  if (top.length < 2 || strong < 2 || (pages.length > 1 && top.every(c => c.page.n === 1))) return null
  if (accepted.length > pages.length * 8 || top.length > pages.length * 4 + 2) return null
  return sections
}

type ScanHelpers = {
  textRows: (items: unknown[]) => PdfTextRow[]
  furniture?: (pages: PdfSectionPage[], title?: string) => (page: PdfSectionPage, row: PdfTextRow) => boolean
}
type PdfPage = { view: number[]; getTextContent: () => Promise<{ items: unknown[] }>; getOperatorList: () => Promise<unknown>; commonObjs: { has: (id: string) => boolean; get: (id: string) => { name?: string } | undefined } }
type PdfDocument = { numPages: number; getPage: (n: number) => Promise<PdfPage> }

/** The sections of an open pdf.js document, with the scan's own line building (js/pdf-scan.js textRows, furniture). */
export async function detectPdfDocumentSections(pdf: PdfDocument, scan: ScanHelpers, live: () => boolean = () => true): Promise<PdfDetectedSection[] | null> {
  if (!pdf.numPages || pdf.numPages > PDF_SECTION_PAGES || typeof scan.textRows !== 'function') return null
  const pages: PdfSectionPage[] = [], handles = new Map<number, PdfPage>()
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n)
    if (!live()) return null
    const [x0, y0, x1, y1] = page.view
    pages.push({ n, x0, y0, w: x1 - x0, h: y1 - y0, rows: scan.textRows((await page.getTextContent()).items) })
    handles.set(n, page)
    if (!live()) return null
  }
  const isFurniture = scan.furniture?.(pages, '')
  return detectPdfSections(pages, {
    live, isFurniture,
    faceOf: async (n, id) => {
      const page = handles.get(n)
      if (!page) return ''
      if (!page.commonObjs.has(id)) await page.getOperatorList()
      return page.commonObjs.has(id) ? page.commonObjs.get(id)?.name ?? '' : ''
    },
  })
}
