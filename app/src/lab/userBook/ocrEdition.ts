/**
 * A scanned PDF's recognised text as a Tinct edition (`source: 'ocr'`). Pure:
 * no I/O, no DOM, importable by the Worker (ownOcrCoordinator.ts assembles
 * `edition.json` with it) and by the reader alike.
 *
 * Input is one recognised page per PDF page, as the vision model returned its
 * blocks (worker/lib/ocrVision.ts). The rules (OCR_EDITION_FORMAT 1):
 *  - running heads, footers and page numbers ('head', 'foot', 'num') are
 *    dropped, and so are captions ('cap'), as figures are left out of the text;
 *  - a paragraph runs on across a page when the model says so
 *    (`ends_mid_paragraph` / `starts_mid_paragraph`), when the next page starts
 *    in lower case, or when the page's last paragraph has no closing
 *    punctuation; blank pages in between do not break it, a failed page does;
 *  - a line-end hyphen before a lower-case letter is healed ("won-\nderful"),
 *    unless the book spells that compound with a hyphen elsewhere
 *    ("well-known"); soft hyphens are dropped;
 *  - h1 starts a chapter (consecutive h1s make one title); without any h1 the
 *    outline does, else every 20 pages ("Pages 1–20");
 *  - h2 is a heading paragraph, each line of a table or equation a 'line';
 *  - footnotes ('fn') are gathered at the end of their chapter under "Notes";
 *  - every paragraph records the PDF page it starts on (`pages`) and a page
 *    that begins inside a paragraph is a `pageBreaks` entry [paragraph, word, page],
 *    word being the first whole word on that page;
 *  - a page that could not be recognised stands as one placeholder paragraph.
 */
import type { UserBookParagraphKind } from './userEdition'
import { OCR_EDITION_FORMAT, USER_EDITION_FORMAT, type UserBookChapter, type UserBookEdition } from './userEdition'

export type OcrBlockType = 'h1' | 'h2' | 'p' | 'fn' | 'cap' | 'tbl' | 'eq' | 'head' | 'foot' | 'num'
export const OCR_BLOCK_TYPES: readonly OcrBlockType[] = ['h1', 'h2', 'p', 'fn', 'cap', 'tbl', 'eq', 'head', 'foot', 'num']

export interface OcrBlock { t: OcrBlockType; x: string }

/** One recognised PDF page (1-based `page`), as stored in `page/{n}.json`. */
export interface OcrPage {
  page: number
  printed_page?: string | null
  columns?: number
  starts_mid_paragraph?: boolean
  ends_mid_paragraph?: boolean
  blocks: OcrBlock[]
  /** Recognition gave up on this page (it stays in Original pages). */
  failed?: true
  /** Nothing to recognise: a blank or picture page. */
  blank?: true
}

export interface OcrAssembleInput {
  title: string
  author: string
  language?: string
  pages: OcrPage[]
  /** The PDF's own outline, when it has one: chapter starts by page. */
  outline?: Array<{ title: string; page: number }>
  /** Pages in the PDF; the last 20-page chapter ends here (else at the last page given). */
  pageCount?: number
}

export const OCR_PAGES_PER_CHAPTER = 20

export function ocrFailedPageText(page: number): string {
  return `Page ${page} could not be recognised. It is in Original pages.`
}

const DROPPED: ReadonlySet<OcrBlockType> = new Set(['head', 'foot', 'num', 'cap'])
/** Closing punctuation, allowing a footnote marker after it ("a claim.1", "said.*"). */
const TERMINAL = /[.?!:;"”’»)\]…][\d*†‡§¹²³⁴⁵⁶⁷⁸⁹⁰]*$/u
const LINE_HYPHEN = /(\p{L}+)-[ \t]*\n[ \t]*(\p{Ll}\p{L}*)/gu

/** Hyphenated compounds the book spells mid-line, lower-cased: such a line-end hyphen is kept. */
function knownCompounds(pages: OcrPage[]): Set<string> {
  const known = new Set<string>()
  for (const page of pages) {
    for (const block of page.blocks) {
      const text = block.x.replace(/-[ \t]*\n/g, '\u0000').replace(/-\s*$/, '\u0000')
      for (const match of text.matchAll(/\p{L}+(?:-\p{L}+)+/gu)) {
        const parts = match[0].toLowerCase().split('-')
        for (let i = 0; i < parts.length - 1; i++) known.add(`${parts[i]}-${parts[i + 1]}`)
      }
    }
  }
  return known
}

function heal(left: string, right: string, known: Set<string>): string {
  return known.has(`${left}-${right}`.toLowerCase()) ? `${left}-${right}` : `${left}${right}`
}

function clean(text: string, known: Set<string>): string {
  return text.replace(/­/g, '').replace(LINE_HYPHEN, (_, left: string, right: string) => heal(left, right, known)).replace(/\s+/g, ' ').trim()
}

const words = (text: string) => (text ? text.split(' ').length : 0)

interface Item { text: string; kind: UserBookParagraphKind | null; page: number; breaks: Array<[number, number]> }
interface Unit { title?: string; items: Item[]; notes: Item[]; page: number }

export function assembleOcrEdition(input: OcrAssembleInput): UserBookEdition {
  const pages = [...input.pages].filter(page => Number.isInteger(page.page) && page.page >= 1).sort((a, b) => a.page - b.page)
  const known = knownCompounds(pages)
  const hasH1 = pages.some(page => !page.failed && page.blocks.some(block => block.t === 'h1' && block.x.trim()))

  // One stream of body items and their footnotes, with chapter marks where an h1 stands.
  const units: Unit[] = [{ items: [], notes: [], page: pages[0]?.page ?? 1 }]
  let open: Item | null = null // the paragraph that may run on to the next page
  let openRuns = false // ...and whether its page said it does
  let titleOpen = false
  const current = () => units[units.length - 1]

  for (const page of pages) {
    if (page.blank) continue
    if (page.failed) {
      current().items.push({ text: ocrFailedPageText(page.page), kind: null, page: page.page, breaks: [] })
      open = null
      titleOpen = false
      continue
    }
    let first = true
    let last: Item | null = null
    for (const block of page.blocks) {
      if (DROPPED.has(block.t)) continue
      if (block.t === 'fn') {
        const text = clean(block.x, known)
        if (text) current().notes.push({ text, kind: null, page: page.page, breaks: [] })
        continue
      }
      if (block.t === 'h1') {
        const title = clean(block.x, known)
        if (!title) continue
        if (titleOpen) current().title = `${current().title}: ${title}`
        else if (current().items.length === 0 && current().notes.length === 0 && current().title === undefined) { current().title = title; current().page = page.page }
        else units.push({ title, items: [], notes: [], page: page.page })
        titleOpen = true
        first = false
        last = null
        continue
      }
      titleOpen = false
      if (block.t === 'tbl' || block.t === 'eq') {
        for (const line of block.x.split('\n')) {
          const text = clean(line, known)
          if (text) current().items.push({ text, kind: 'line', page: page.page, breaks: [] })
        }
        first = false
        last = null
        continue
      }
      const raw = block.x.replace(/­/g, '').trim()
      if (!raw) continue
      if (block.t === 'h2') {
        current().items.push({ text: clean(raw, known), kind: 'heading', page: page.page, breaks: [] })
        first = false
        last = null
        continue
      }
      // 'p': run on from the previous page?
      const continues = first && open && page.starts_mid_paragraph !== false
        && (page.starts_mid_paragraph === true || openRuns || /^\p{Ll}/u.test(raw) || !TERMINAL.test(open.text))
      first = false
      if (continues && open) {
        const at = words(open.text)
        const leftHyphen = /(\p{L}+)-$/u.exec(open.text)
        const rightWord = /^(\p{Ll}\p{L}*)/u.exec(raw)
        const tail = clean(raw, known)
        if (leftHyphen && rightWord) {
          const healed = heal(leftHyphen[1], rightWord[1], known)
          open.text = open.text.slice(0, open.text.length - leftHyphen[0].length) + healed + tail.slice(rightWord[1].length)
        } else {
          open.text = `${open.text} ${tail}`
        }
        if (at < words(open.text)) open.breaks.push([at, page.page])
        last = open
        continue
      }
      const item: Item = { text: clean(raw, known), kind: null, page: page.page, breaks: [] }
      current().items.push(item)
      last = item
    }
    // Only furniture or notes: the open paragraph stays open, as over a blank page.
    if (first) continue
    open = last
    openRuns = page.ends_mid_paragraph === true
  }

  // Without h1, chapters come from the outline, else from page ranges.
  let chapters: Unit[]
  if (hasH1) {
    chapters = units.filter(unit => unit.items.length || unit.notes.length)
  } else {
    const all = units[0]
    const lastPage = Math.max(input.pageCount ?? 0, pages[pages.length - 1]?.page ?? 1)
    const outline = (input.outline ?? []).filter(entry => entry.title?.trim() && Number.isInteger(entry.page) && entry.page >= 1).sort((a, b) => a.page - b.page)
    const starts: Array<{ title: string; page: number }> = outline.length
      ? outline.map(entry => ({ title: entry.title.trim(), page: entry.page }))
      : Array.from({ length: Math.ceil(lastPage / OCR_PAGES_PER_CHAPTER) }, (_, i) => {
        const from = i * OCR_PAGES_PER_CHAPTER + 1
        return { title: `Pages ${from}–${Math.min(lastPage, from + OCR_PAGES_PER_CHAPTER - 1)}`, page: from }
      })
    if (outline.length && outline[0].page > 1) starts.unshift({ title: input.title, page: 1 })
    chapters = starts.map((start, i) => {
      const end = starts[i + 1]?.page ?? Infinity
      const within = (item: Item) => item.page >= start.page && item.page < end
      return { title: start.title, page: start.page, items: all.items.filter(within), notes: all.notes.filter(within) }
    }).filter(unit => unit.items.length || unit.notes.length)
  }

  const out: UserBookChapter[] = chapters.map((unit, index) => {
    const items = unit.notes.length
      ? [...unit.items, { text: 'Notes', kind: 'heading' as const, page: unit.notes[0].page, breaks: [] }, ...unit.notes]
      : unit.items
    const chapter: UserBookChapter = {
      number: index + 1,
      title: unit.title ?? input.title,
      paragraphs: items.map(item => item.text),
      pages: items.map(item => item.page),
    }
    if (items.some(item => item.kind)) chapter.kinds = items.map(item => item.kind)
    const breaks = items.flatMap((item, at) => item.breaks.map(([word, page]) => [at, word, page] as [number, number, number]))
    if (breaks.length) chapter.pageBreaks = breaks
    return chapter
  })

  return {
    format: USER_EDITION_FORMAT,
    converter: OCR_EDITION_FORMAT,
    source: 'ocr',
    title: input.title,
    author: input.author,
    language: input.language ?? '',
    chapters: out,
    droppedImages: 0,
  }
}
