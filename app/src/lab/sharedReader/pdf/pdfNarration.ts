/**
 * What read-aloud of an own PDF speaks, and in what order (Anders, 16 Nov 2026).
 *
 * The page is drawn and selectable exactly as before; this only decides which of its pdf.js text
 * items are spoken. Deterministic, on the device, no AI: positioned text items (and, when known,
 * the boxes of the page's images and vector graphics) in, a plan out.
 *
 *  1. Running headers and footers: a segment in the top or bottom 10% of the page whose text, digits
 *     normalised, repeats at the edge of 3 or more pages (30% of a short document, at least 2).
 *  2. Lone page numbers at the top or bottom edge: "4", "iv", "Page 4", "4 / 48", "- 4 -".
 *  3. Columns: a vertical gutter (an x-range almost no text crosses, text on both sides at the same
 *     heights) splits a band into columns, read left to right, each top to bottom; text that spans
 *     the gutter (a heading over the columns) is read where it stands.
 *  4. Figures: text inside an image or vector-graphics region that is labels (many short fragments)
 *     is not read. A caption ("Figure …", "Fig.", "Chart", "Exhibit", or a lone short line right
 *     above or below) is read as "Figure: <caption>". Sentences set in a diagram's boxes are read.
 *  5. Tables: three or more left-aligned columns of short cells is a table: its cells are not read,
 *     a caption beside it is read as "Table: <caption>". A grid whose cells are sentences is read.
 *  6. Footnote markers (small raised digits after a word) and the footnote block in small type at the
 *     foot of the page are not read; on a contents page the page numbers and dot leaders are not read.
 *
 * Added after a listening check on a real report (Anders, 16 Nov 2026):
 *  7. Pieces of one word: pdf.js often splits a word into touching items ("F" "e" "bruary"). Items in the same type
 *     on the same baseline with no gap are one spoken word.
 *  8. Boxes and tables: columns are found locally as well (boxes side by side under a centred heading, a table in
 *     part of a page), not only across the whole page. A table of rows (a short first column, cells lined up with
 *     the rows of the longest column) is read row by row; a table of short cells is still left out, and announced
 *     when it is long ("Table, not read aloud.").
 *  9. Chart values: four or more bare numbers ("56%", "1975") inside a drawn region, panels included, are not read;
 *     the region's title is announced as "Figure: …" as for figures.
 * 10. Links and source lists: web addresses are not read; a page that is a list of sources (many links, or a
 *     "References" heading over numbered entries) has its entries left out with "Sources list, not read aloud.".
 * 11. Pauses: a full stop after a block that ends without punctuation when a new block begins (a box title, a
 *     legend entry, a "Source:" line, a table cell).
 *
 * Every spoken token maps to one rendered word (pdfOriginalFollowRect counts words as /\S+/ per item,
 * in item order) so the follow highlight lands only on words that are read. An inserted word
 * ("Figure:", "Table:") maps to -1: nothing is highlighted while it is heard.
 */

export type PdfNarrationItem = { str: string; transform: number[]; width: number; height?: number }
export type PdfNarrationView = { width: number; height: number; transform: number[] }
/** A graphics box in the viewport's top-left units (the same space as the view). */
export type PdfNarrationBox = { x: number; y: number; w: number; h: number }
export interface PdfNarrationPageInput { items: PdfNarrationItem[]; view: PdfNarrationView; graphics?: PdfNarrationBox[] }
export type PdfNarrationSkipReason = 'running header/footer' | 'page number' | 'figure labels' | 'table cells'
  | 'footnote marker' | 'footnote' | 'contents page number' | 'link' | 'reference list'
export interface PdfNarrationContext {
  /** Edge texts that repeat across the document (pdfRunningKeys). */
  running?: ReadonlySet<string>
  /** The document's body type size (pdfBodySize over several pages); the page's own when absent. */
  bodySize?: number
}
export interface PdfNarrationPlan {
  /** The spoken text: tokens joined by single spaces. */
  text: string
  /** Per spoken token, the rendered word index it is (-1 for an inserted word). */
  words: number[]
  /** The rendered page extraction the indices refer to (items' str joined by spaces, trimmed). */
  source: string
  skipped: Array<{ text: string; reason: PdfNarrationSkipReason }>
}

/** `glue`: this word touches the one before it (a piece of the same word, rule 7): spoken joined to it. */
type Word = { text: string; index: number; skip?: PdfNarrationSkipReason; glue?: boolean }
type Frag = { x: number; x2: number; base: number; size: number; words: Word[]; text: string; raw: string }
/** `marker`: a place-holder with no words that carries an announcement (a table left out). `pause`: a table cell's end. */
type Seg = { frags: Frag[]; x: number; x2: number; top: number; bottom: number; base: number; size: number; text: string
  words: Word[]; line: number; prefix?: string; pause?: boolean; marker?: boolean; caption?: boolean }

/** The edge zone, as a fraction of the page height, at the top and at the bottom. */
export const PDF_EDGE_ZONE = 0.1
const GAP_EM = 1.25
const median = (values: number[]) => { const s = [...values].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0 }
const letters = (text: string) => (text.match(/\p{L}/gu) ?? []).length

/** Rendered words in pdfOriginalFollowRect's order: /\S+/ per item with text, items in order. */
function wordsOf(items: PdfNarrationItem[]): Word[][] {
  let index = 0
  return items.map(item => typeof item?.str === 'string' && item.str ? [...item.str.matchAll(/\S+/gu)].map(match => ({ text: match[0], index: index++ })) : [])
}

/** Items to upright fragments in viewport units; everything else (rotated, unplaceable) stays unclassified, kept. */
function fragmentsOf(page: PdfNarrationPageInput, words: Word[][]) {
  const [v0, v1, v2, v3, v4, v5] = page.view.transform
  const scale = Math.hypot(v0, v1) || 1
  const upright: Frag[] = [], other: Word[][] = []
  page.items.forEach((item, i) => {
    if (!words[i].length) return
    const t = item.transform
    if (!Array.isArray(t) || t.length < 6 || !t.every(Number.isFinite)) { other.push(words[i]); return }
    const [a, b, c, d, e, f] = t
    const dirX = v0 * a + v2 * b, dirY = v1 * a + v3 * b
    const size = Math.hypot(v1 * c + v3 * d, v0 * c + v2 * d)
    if (!(size > 0) || dirX <= 0 || Math.abs(dirY) > Math.abs(dirX) * 0.05) { other.push(words[i]); return }
    const x = v0 * e + v2 * f + v4, base = v1 * e + v3 * f + v5
    upright.push({ x, x2: x + Math.max(0, (item.width || 0) * scale), base, size, words: words[i], text: item.str.trim(), raw: item.str })
  })
  return { upright, other }
}

/**
 * Fragments into lines: baselines within half the smaller type size. A raised mark in small type (a footnote
 * number, an exponent) set right after a word, or opening a footnote, joins that word's line; a large initial or step number never
 * pulls the smaller lines beside it into one.
 */
function linesOf(frags: Frag[]): Frag[][] {
  type Line = { base: number; size: number; frags: Frag[] }
  const lines: Line[] = []
  for (const frag of [...frags].sort((a, b) => a.base - b.base || a.x - b.x)) {
    const line = lines.find(l => Math.abs(l.base - frag.base) <= 0.5 * Math.min(l.size, frag.size))
    if (!line) { lines.push({ base: frag.base, size: frag.size, frags: [frag] }); continue }
    line.frags.push(frag)
    if (frag.size > line.size) { line.size = frag.size; line.base = frag.base }
  }
  const raisedMark = (small: Line, into: Line) => small.frags.every(f => f.size <= into.size * 0.8 && f.words.length <= 2
    && f.base < into.base - into.size * 0.1 && f.base >= into.base - into.size * 0.75
    && into.frags.some(o => o.size > f.size && (Math.abs(f.x - o.x2) <= into.size * 0.3 || Math.abs(o.x - f.x2) <= into.size * 0.6)))
  for (let i = lines.length - 1; i >= 0; i--) {
    const into = lines.find(other => other !== lines[i] && raisedMark(lines[i], other))
    if (into) { into.frags.push(...lines[i].frags); lines.splice(i, 1) }
  }
  return lines.sort((a, b) => a.base - b.base).map(line => line.frags.sort((a, b) => a.x - b.x))
}

function segment(frags: Frag[], line: number): Seg {
  const chars = new Map<number, number>()
  for (const f of frags) chars.set(f.size, (chars.get(f.size) ?? 0) + f.text.length)
  const size = [...chars].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0]
  const main = frags.find(f => f.size === size)!
  return { frags, x: Math.min(...frags.map(f => f.x)), x2: Math.max(...frags.map(f => f.x2)), top: main.base - size, bottom: main.base + size * 0.25,
    base: main.base, size, text: frags.map((f, i) => (i && f.words[0]?.glue ? '' : ' ') + f.text).join('').replace(/\s+/g, ' ').trim(),
    words: frags.flatMap(f => f.words), line }
}

/**
 * Rule 7: two items are pieces of one word when they touch (no gap, at most a sliver of overlap) on the same baseline
 * in the same type, and neither has a space at the join. A raised mark in smaller type never joins.
 */
function touches(a: Frag, b: Frag): boolean {
  const size = Math.min(a.size, b.size), gap = b.x - a.x2
  return a.words.length > 0 && b.words.length > 0 && Math.abs(a.size - b.size) <= 0.1 * Math.max(a.size, b.size)
    && Math.abs(a.base - b.base) <= 0.15 * size && gap >= -0.25 * size && gap <= 0.08 * size && !/\s$/u.test(a.raw) && !/^\s/u.test(b.raw)
}

/** Lines split into segments where the horizontal gap is wider than 1.25 em (a gutter, a page number set apart). */
function segmentsOf(frags: Frag[]): Seg[] {
  const segs: Seg[] = []
  linesOf(frags).forEach((line, n) => {
    let run: Frag[] = []
    for (const frag of line) {
      const prev = run[run.length - 1]
      // A large step number or initial set beside its text (three times the type or more) stands apart from it.
      if (prev && (frag.x - Math.max(...run.map(f => f.x2)) > GAP_EM * Math.min(prev.size, frag.size)
        || Math.max(prev.size, frag.size) >= 3 * Math.min(prev.size, frag.size))) { segs.push(segment(run, n)); run = [] }
      else if (prev && touches(prev, frag)) frag.words[0].glue = true
      run.push(frag)
    }
    if (run.length) segs.push(segment(run, n))
  })
  return segs
}

const isEdge = (seg: Seg, height: number) => {
  const middle = (seg.top + seg.bottom) / 2
  return middle < height * PDF_EDGE_ZONE || middle > height * (1 - PDF_EDGE_ZONE)
}
const ROMAN = /^(?=[ivxlcdm]+$)m{0,3}(?:cm|cd|d?c{0,3})(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3})$/i
const bare = (text: string) => text.trim().replace(/^[-–—|•·.\s]+|[-–—|•·\s]+$/gu, '').replace(/(\d)\s+(?=\d)/g, '$1')
/** "4", "iv", "Page 4", "p. 4", "4 / 48", "4 of 48", "- 4 -". */
export function isPdfPageNumber(text: string): boolean {
  const t = bare(text)
  if (!t) return false
  const m = /^(?:(?:page|pg\.?|p\.|side|seite)\s*)?(\d{1,4}|[ivxlcdm]{1,8})(?:\s*(?:\/|of|af|von|de)\s*\d{1,4})?$/i.exec(t)
  return !!m && (/^\d+$/.test(m[1]) || ROMAN.test(m[1]))
}
/** An edge text's identity across pages: case, spacing and digits normalised, with its type size. */
const edgeKey = (seg: Seg) => `${Math.round(seg.size)}|${seg.text.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim()}`

function pageSegments(page: PdfNarrationPageInput) {
  const words = wordsOf(page.items)
  const { upright, other } = fragmentsOf(page, words)
  return { words, segs: segmentsOf(upright), other }
}

/** The edge texts of one page that could be running heads or feet (with letters; numbers alone are page numbers). */
export function pdfEdgeKeys(page: PdfNarrationPageInput): string[] {
  const height = page.view.height
  return [...new Set(pageSegments(page).segs.filter(seg => isEdge(seg, height) && letters(seg.text) >= 2).map(edgeKey))]
}

/** Edge texts on at least 3 of the pages given (30% of a short run of pages, never fewer than 2). */
export function pdfRunningKeys(pages: string[][]): Set<string> {
  const need = Math.min(3, Math.max(2, Math.ceil(pages.length * 0.3)))
  const count = new Map<string, number>()
  for (const keys of pages) for (const key of new Set(keys)) count.set(key, (count.get(key) ?? 0) + 1)
  return pages.length < 2 ? new Set() : new Set([...count].filter(([, n]) => n >= need).map(([key]) => key))
}

/** The body type size: the character-weighted median size of the pages' text away from the edges. */
export function pdfBodySize(pages: PdfNarrationPageInput[]): number {
  const sizes: number[] = []
  for (const page of pages) for (const seg of pageSegments(page).segs) {
    if (isEdge(seg, page.view.height)) continue
    for (let n = Math.min(400, seg.text.length); n > 0; n -= 4) sizes.push(seg.size)
  }
  return median(sizes)
}

const skipAll = (seg: Seg, reason: PdfNarrationSkipReason) => { for (const w of seg.words) w.skip ??= reason }
const kept = (seg: Seg) => seg.words.some(w => !w.skip)
const MARKER = /^[([]?(?:\d{1,3}|[*∗†‡§¶]{1,3})[)\]]?[,.;:]?$/u
const FOOTNOTE_START = /^(?:\d{1,3}|[*∗†‡§¶]{1,3})(?:[\s.)]|$)/u
const CAPTION = /^(?:figure|fig\.|chart|exhibit|diagram|graph|illustration|table|tab\.)(?=[\s\d.:]|$)/i

/**
 * A footnote mark: small type (at most 0.75 of the line's), raised, digits or a symbol, after a word of four letters
 * or more or after punctuation. Digits raised after a short base ("m2", "10" then "18") are an exponent and read.
 */
function footnoteMarkers(segs: Seg[]) {
  for (const seg of segs) seg.frags.forEach((frag, i) => {
    if (i === 0 || frag.size > seg.size * 0.75 || frag.base > seg.base - seg.size * 0.15 || !MARKER.test(frag.text)) return
    const before = seg.frags[i - 1].text
    if (/\d/.test(frag.text) && !/(?:\p{L}{4,}|[.,;:)\]”"’'])$/u.test(before)) return
    for (const w of frag.words) w.skip ??= 'footnote marker'
  })
}

/** The footnote block: the lowest lines of the page in small type, from the first that opens with a mark. */
function footnoteBlock(segs: Seg[], height: number, body: number) {
  const lowest = segs.filter(seg => kept(seg)).sort((a, b) => b.top - a.top)
  const run: Seg[] = []
  for (const seg of lowest) {
    if (seg.top < height * 0.6 || seg.size > body * 0.85) break
    run.push(seg)
  }
  run.reverse()
  const startsWithMark = (seg: Seg) => {
    const first = seg.frags[0], next = seg.frags[1]
    return FOOTNOTE_START.test(seg.text) || (!!next && MARKER.test(first.text) && first.size <= next.size * 0.8)
  }
  const from = run.findIndex(startsWithMark)
  if (from >= 0) for (const seg of run.slice(from)) skipAll(seg, 'footnote')
}

/** A contents page: three or more lines (40% of its lines) end in a page number set apart or after dot leaders. */
function contentsNumbers(segs: Seg[]) {
  const lines = new Map<number, Seg[]>()
  for (const seg of segs) if (kept(seg)) lines.set(seg.line, [...(lines.get(seg.line) ?? []), seg])
  const LEADERS = /^[.·…_‥]{2,}$/u
  const entries: Array<() => void> = []
  let withLetters = 0
  for (const line of lines.values()) {
    if (!line.some(seg => letters(seg.text) > 0)) continue
    withLetters++
    const last = line[line.length - 1]
    const words = line.flatMap(seg => seg.words.filter(w => !w.skip))
    const lastWord = words[words.length - 1]
    if (line.length >= 2 && isPdfPageNumber(last.text) && line.slice(0, -1).some(seg => letters(seg.text) > 0)) {
      entries.push(() => { for (const w of last.words) w.skip ??= 'contents page number'; for (const w of words) if (LEADERS.test(w.text)) w.skip ??= 'contents page number' })
    } else if (lastWord && /^\d{1,4}$/.test(lastWord.text) && words.length >= 3 && (LEADERS.test(words[words.length - 2].text) || /[.·…]{3,}\d{0,4}$/u.test(words[words.length - 2].text))) {
      entries.push(() => { lastWord.skip ??= 'contents page number'; for (const w of words) if (LEADERS.test(w.text) || /^[.·…]{3,}$/u.test(w.text)) w.skip ??= 'contents page number' })
    }
  }
  if (entries.length >= 3 && entries.length >= withLetters * 0.4) for (const skip of entries) skip()
}

type Region = { x: number; y: number; x2: number; y2: number }
const inside = (seg: Seg, r: Region) => { const cx = (seg.x + seg.x2) / 2, cy = (seg.top + seg.bottom) / 2; return cx >= r.x && cx <= r.x2 && cy >= r.y && cy <= r.y2 }
const wordCount = (seg: Seg) => seg.words.length

/** Lines into text blocks: the next line below, overlapping, in the same type, at most 0.9 em further down. */
function blocksOf(segs: Seg[]): Seg[][] {
  const blocks: Seg[][] = []
  for (const seg of [...segs].sort((a, b) => a.top - b.top)) {
    const block = blocks.find(b => { const last = b[b.length - 1]; return last.x < seg.x2 && seg.x < last.x2 && seg.top >= last.top
      && seg.top - last.bottom <= last.size * 0.9 && Math.abs(seg.size - last.size) <= last.size * 0.15 })
    if (block) block.push(seg); else blocks.push([seg])
  }
  return blocks
}
/** The share of the words that stand in blocks of eight words or more (sentences, not labels or cells). */
function proseShare(segs: Seg[]): number {
  const total = segs.reduce((n, s) => n + wordCount(s), 0)
  const prose = blocksOf(segs).map(b => b.reduce((n, s) => n + wordCount(s), 0)).filter(n => n >= 8).reduce((a, b) => a + b, 0)
  return total ? prose / total : 0
}
/**
 * Graphics boxes merged into regions: images and drawn shapes, not hairlines, not page backgrounds, and not
 * panels (a box holding a line of eight words or more is a frame around text, not a picture).
 */
function graphicRegions(boxes: PdfNarrationBox[], segs: Seg[], width: number, height: number): Region[] {
  const pad = width * 0.015
  const list = boxes.filter(b => [b.x, b.y, b.w, b.h].every(Number.isFinite) && b.w >= width * 0.03 && b.h >= height * 0.02
    && b.w * b.h <= width * height * 0.6).map(b => ({ x: b.x, y: b.y, x2: b.x + b.w, y2: b.y + b.h }))
    .filter(r => !segs.some(seg => wordCount(seg) >= 8 && inside(seg, r)))
  let merged = true
  while (merged) {
    merged = false
    for (let i = 0; i < list.length && !merged; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]
      if (a.x - pad <= b.x2 && b.x - pad <= a.x2 && a.y - pad <= b.y2 && b.y - pad <= a.y2) {
        list[i] = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) }
        list.splice(j, 1); merged = true; break
      }
    }
  }
  return list
}

/** A caption beside a region: a line opening "Figure", "Chart", "Table" …, or a lone short line right above or below. */
function captionOf(region: Region, segs: Seg[], body: number): Seg[] {
  const near = segs.filter(seg => kept(seg) && !inside(seg, region) && seg.x < region.x2 && seg.x2 > region.x
    && (region.y - seg.bottom >= -seg.size && region.y - seg.bottom <= 3 * body || seg.top - region.y2 >= -seg.size && seg.top - region.y2 <= 3 * body))
  const named = near.find(seg => CAPTION.test(seg.text))
  const blockFrom = (first: Seg) => {
    const block = [first]
    for (;;) {
      const last = block[block.length - 1]
      const next = segs.filter(seg => kept(seg) && !block.includes(seg) && !inside(seg, region) && Math.abs(seg.x - first.x) < first.size * 2
        && seg.top >= last.bottom - last.size * 0.5 && seg.top - last.bottom <= last.size * 0.9 && Math.abs(seg.size - last.size) <= last.size * 0.15)
        .sort((a, b) => a.top - b.top)[0]
      if (!next || block.length >= 4) return block
      block.push(next)
    }
  }
  if (named) return blockFrom(named)
  // Otherwise a short block (one or two lines, twelve words at most per line, twenty in all) standing alone right
  // above or below: alone on its line (side-by-side legend entries are not a caption), not a "Source:" or "Note:"
  // line, flush with the region's left edge or centred on it (a stray word beside a table is not its caption), and
  // not in heading type, except a title right above (up to 1.6 times the body size).
  const above = (seg: Seg) => seg.bottom <= region.y + seg.size
  const distance = (seg: Seg) => above(seg) ? Math.abs(region.y - seg.bottom) : Math.abs(seg.top - region.y2)
  const placed = (seg: Seg) => seg.x <= region.x + (region.x2 - region.x) * 0.1
    || Math.abs((seg.x + seg.x2) / 2 - (region.x + region.x2) / 2) <= (region.x2 - region.x) * 0.15
  const outside = segs.filter(other => kept(other) && !inside(other, region))
  for (const seg of near.sort((a, b) => distance(a) - distance(b))) {
    if (distance(seg) > 2 * body || seg.size > body * (above(seg) ? 1.6 : 1.15) || !placed(seg)
      || /^(?:sources?|notes?)\b/i.test(seg.text) || segs.some(other => other !== seg && other.line === seg.line)) continue
    const block = blocksOf(outside).find(b => b.includes(seg))!
    if (block.length <= 2 && block.every(line => wordCount(line) <= 12) && block.reduce((n, line) => n + wordCount(line), 0) <= 20) return block
  }
  return []
}

function announce(caption: Seg[], kind: 'Figure' | 'Table') {
  if (!caption.length) return
  for (const seg of caption) seg.caption = true
  if (!CAPTION.test(caption[0].text)) caption[0].prefix = `${kind}:`
}

/** Tables: three or more left-aligned columns of short cells at the same heights. */
function tables(segs: Seg[], width: number, body: number): Region[] {
  // Cells start at the same x to within 2pt: centred labels (a diagram's) do not line up like that.
  const tol = width * 0.0035
  const cells = segs.filter(seg => kept(seg) && wordCount(seg) <= 8 && seg.x2 - seg.x <= width * 0.3).sort((a, b) => a.x - b.x)
  const clusters: Seg[][] = []
  for (const seg of cells) {
    const cluster = clusters.find(c => Math.abs(c[0].x - seg.x) <= tol)
    if (cluster) cluster.push(seg); else clusters.push([seg])
  }
  type Run = { x: number; top: number; bottom: number; segs: Seg[] }
  const runs: Run[] = []
  for (const cluster of clusters) {
    const sorted = cluster.sort((a, b) => a.top - b.top)
    let run: Seg[] = []
    const close = () => { if (run.length >= 3) runs.push({ x: run[0].x, top: run[0].top, bottom: Math.max(...run.map(s => s.bottom)), segs: run }); run = [] }
    for (const seg of sorted) {
      if (run.length && seg.top - run[run.length - 1].bottom > 4 * body) close()
      run.push(seg)
    }
    close()
  }
  const overlap = (a: Run, b: Run) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >= 0.5 * Math.min(a.bottom - a.top, b.bottom - b.top)
  const seen = new Set<Run>(), found: Region[] = []
  for (const start of runs) {
    if (seen.has(start)) continue
    const group = [start]; seen.add(start)
    for (let i = 0; i < group.length; i++) for (const other of runs) if (!seen.has(other) && overlap(group[i], other)) { seen.add(other); group.push(other) }
    const xs = new Set(group.map(r => Math.round(r.x / tol)))
    if (xs.size < 3) continue
    // A table's rows have cells side by side: a line alone at its height in the group (a title or caption set
    // flush with the first column) is not a cell.
    const rowed = group.flatMap(r => r.segs.filter(seg => group.some(o => o !== r && o.segs.some(other =>
      Math.min(seg.bottom, other.bottom) - Math.max(seg.top, other.top) > 0))))
    if (rowed.length < 9) continue
    const region = { x: Math.min(...rowed.map(s => s.x)), x2: Math.max(...rowed.map(s => s.x2)),
      y: Math.min(...rowed.map(s => s.top)), y2: Math.max(...rowed.map(s => s.bottom)) }
    const within = segs.filter(seg => kept(seg) && inside(seg, region))
    const aligned = within.filter(seg => group.some(r => Math.abs(r.x - seg.x) <= tol))
    // Cells of a few words; a grid whose cells are sentences is read (column by column) rather than dropped.
    if (within.length < 9 || aligned.length < within.length * 0.75 || median(within.map(wordCount)) > 4 || proseShare(within) > 0.4) continue
    found.push(region)
  }
  return found
}

/** Figures: an image or graphics region whose text is labels (many short fragments in type no larger than the body's). */
function figures(segs: Seg[], boxes: PdfNarrationBox[], width: number, height: number, body: number): Region[] {
  const found: Region[] = []
  for (const region of graphicRegions(boxes, segs, width, height)) {
    // Labels often sit just outside the drawing: short ones within 3% of the page width count too, and an axis's
    // bare figures ("100%", "1975") within 8%.
    const grow = (m: number) => ({ x: region.x - m, y: region.y - m, x2: region.x2 + m, y2: region.y2 + m })
    const near = grow(width * 0.03), axis = grow(width * 0.08)
    const within = segs.filter(seg => kept(seg) && (inside(seg, region) || seg.size <= body * 1.05
      && (inside(seg, near) && wordCount(seg) <= 3 || inside(seg, axis) && /^[\d\s.,%$€£+−-]+$/u.test(seg.text))))
    if (within.length < 4) continue
    const short = within.filter(seg => wordCount(seg) <= 4)
    if (median(within.map(wordCount)) > 4 || short.length < within.length * 0.7 || median(within.map(s => s.size)) > body * 1.05) continue
    // Sentences set in boxes (a diagram's step descriptions, a table of prose) are read: only labels are left out.
    if (proseShare(within) > 0.4) continue
    found.push({ x: Math.min(region.x, ...within.map(s => s.x)), y: Math.min(region.y, ...within.map(s => s.top)),
      x2: Math.max(region.x2, ...within.map(s => s.x2)), y2: Math.max(region.y2, ...within.map(s => s.bottom)) })
  }
  return found
}

const byLine = (a: Seg, b: Seg) => a.line - b.line || a.x - b.x
const topOf = (list: Seg[]) => Math.min(...list.map(s => s.top))
const bottomOf = (list: Seg[]) => Math.max(...list.map(s => s.bottom))
/** Lines with a word of letters in them (a column of bullets or step numbers alone is not a column of text). */
const textLines = (list: Seg[]) => new Set(list.filter(s => letters(s.text) >= 2).map(s => s.line)).size

/**
 * Columns in a region (rules 3 and 8): x-ranges that no segment of the region crosses, at least 0.8 em wide, with three
 * or more lines of text on each side at overlapping heights, the columns beginning at the same height (boxes side by
 * side, a table's columns, a page's columns). A centred heading over boxes is not a column: it begins higher up.
 */
function columnsOf(segs: Seg[], width: number, body: number): { columns: Seg[][]; gap: number } | null {
  if (segs.filter(s => !s.marker).length < 6) return null
  const left = Math.min(...segs.map(s => s.x)), right = Math.max(...segs.map(s => s.x2))
  const step = Math.max(0.5, width / 1200)
  const bins = Math.max(1, Math.ceil((right - left) / step))
  const cover = new Array<number>(bins).fill(0)
  for (const seg of segs) for (let i = Math.max(0, Math.floor((seg.x - left) / step)); i < Math.min(bins, Math.ceil((seg.x2 - left) / step)); i++) cover[i]++
  const cuts: Array<[number, number]> = []
  let start = -1
  for (let i = 0; i <= bins; i++) {
    const open = i < bins && cover[i] === 0
    if (open && start < 0) start = i
    if (!open && start >= 0) {
      const from = left + start * step, to = left + i * step
      if (start > 0 && i < bins && to - from >= Math.max(width * 0.012, body * 0.8)) {
        const l = segs.filter(s => s.x2 <= from + step), r = segs.filter(s => s.x >= to - step)
        if (textLines(l) >= 3 && textLines(r) >= 3
          && Math.min(bottomOf(l), bottomOf(r)) - Math.max(topOf(l), topOf(r)) >= 0.3 * Math.min(bottomOf(l) - topOf(l), bottomOf(r) - topOf(r))) cuts.push([from, to])
      }
      start = -1
    }
  }
  if (!cuts.length) return null
  const columns: Seg[][] = cuts.map(() => [])
  columns.push([])
  for (const seg of segs) columns[cuts.filter(([from]) => seg.x >= from).length].push(seg)
  const present = columns.filter(c => c.some(s => !s.marker))
  const tops = present.map(c => topOf(c.filter(s => !s.marker)))
  if (present.length < 2 || Math.max(...tops) - Math.min(...tops) > 1.5 * body) return null
  return { columns: present, gap: Math.max(...cuts.map(([from, to]) => to - from)) }
}

/** The widest horizontal strip of white across a region: where it can be cut into what is above and what is below. */
function rowCut(segs: Seg[]): { gap: number; above: Seg[]; below: Seg[] } | null {
  const sorted = [...segs].sort((a, b) => a.top - b.top || a.x - b.x)
  let lowest = -Infinity, best: { gap: number; at: number } | null = null
  sorted.forEach((seg, i) => {
    if (i && seg.top - lowest > 0 && (!best || seg.top - lowest > best.gap)) best = { gap: seg.top - lowest, at: i }
    lowest = Math.max(lowest, seg.bottom)
  })
  const cut = best as { gap: number; at: number } | null
  return cut ? { gap: cut.gap, above: sorted.slice(0, cut.at), below: sorted.slice(cut.at) } : null
}

type Cell = { segs: Seg[]; top: number; bottom: number; col: number }
const center = (cell: { top: number; bottom: number }) => (cell.top + cell.bottom) / 2

/**
 * Rule 8, a table of rows: three or more rows in its longest column, a first column of short cells set flush left (a
 * label, a step, a name), and the cells of the other columns lined up with those rows (top, middle, or the middle of rows they span).
 * Read row by row: each cell of the other columns before the first row it stands beside, columns left to right.
 * Text flowing from one column into the next (a sentence carried over) is never a table.
 */
function tableOrder(columns: Seg[][], body: number): Seg[] | null {
  // A column's cells: its blocks, those beside each other merged (a large step number and its label), in block order.
  const cols: Cell[][] = columns.map((column, col) => {
    const cells: Cell[] = []
    for (const block of blocksOf(column).sort((a, b) => topOf(a) - topOf(b))) {
      const top = topOf(block), bottom = bottomOf(block), with_ = cells.find(cell => Math.min(cell.bottom, bottom) - Math.max(cell.top, top) > 0)
      if (with_) { with_.segs.push(...[...block].sort(byLine)); with_.top = Math.min(with_.top, top); with_.bottom = Math.max(with_.bottom, bottom) }
      else cells.push({ segs: [...block].sort(byLine), top, bottom, col })
    }
    return cells
  })
  // Cells wholly above where every column has begun (a paragraph's last line), or below where one has ended, are not
  // the table's: read before and after it.
  const begun = Math.max(...cols.map(cells => Math.min(...cells.map(c => c.top)))), ended = Math.min(...cols.map(cells => Math.max(...cells.map(c => c.bottom))))
  const before: Cell[] = [], after: Cell[] = []
  for (const cells of cols) for (let k = cells.length - 1; k >= 0; k--) {
    if (cells[k].bottom < begun - 0.5 * body) before.push(...cells.splice(k, 1))
    else if (cells[k].top > ended + 0.5 * body) after.push(...cells.splice(k, 1))
  }
  // A table is most of what stands in its columns, and its columns run about the same height.
  const total = cols.reduce((n, cells) => n + cells.length, 0), heights = cols.map(cells => cells.length ? bottomOf(cells.flatMap(c => c.segs)) - topOf(cells.flatMap(c => c.segs)) : 0)
  if (cols.some(cells => !cells.length) || before.length + after.length > 0.25 * (total + before.length + after.length)
    || Math.min(...heights) < 0.5 * Math.max(...heights)) return null
  let rowCol = 0
  cols.forEach((cells, i) => { if (cells.length >= cols[rowCol].length) rowCol = i })
  const rows = [...cols[rowCol]].sort((a, b) => a.top - b.top)
  const words = (cell: Cell) => cell.segs.reduce((n, s) => n + wordCount(s), 0)
  // The first column's cells are short and set flush left (a diagram's labels set flush right to their lines are not).
  const lefts = cols[0].map(cell => Math.min(...cell.segs.map(s => s.x))), flush = median(lefts)
  if (rows.length < 3 || median(cols[0].map(words)) > 8 || lefts.filter(x => Math.abs(x - flush) <= 0.5 * body).length < lefts.length * 0.7) return null
  const tol = 1.5 * body
  const others = cols.flatMap((cells, i) => i === rowCol ? [] : cells)
  const lined = others.filter(cell => rows.some((row, i) => Math.abs(row.top - cell.top) <= tol || Math.abs(center(row) - center(cell)) <= tol
    || rows.slice(i + 1).some(last => Math.abs((row.top + last.bottom) / 2 - center(cell)) <= tol)))
  if (!others.length || lined.length < others.length * 0.6) return null
  const end = cols[0][cols[0].length - 1], next = cols[1]?.[0]
  if (end && next && !/[.!?:;”"’)]$/u.test(end.segs[end.segs.length - 1].text) && /^\p{Ll}/u.test(next.segs[0].text)) return null
  const at = new Map<Cell, number>()
  rows.forEach((row, i) => at.set(row, i))
  cols.forEach((cells, col) => {
    if (col === rowCol) return
    const sorted = [...cells].sort((a, b) => a.top - b.top)
    sorted.forEach((cell, k) => {
      // A header (the column's first cell, beside the first row only) owns that row alone: the rows after it are the
      // next cell's to share.
      const prev = sorted[k - 1], meets = (c: Cell) => rows.filter(r => Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top) > 0)
      const header = k === 1 && meets(prev).length === 1 && meets(prev)[0] === rows[0]
      const lo = !prev ? -Infinity : header ? Math.min(center(rows[0]) + 0.01, (center(prev) + center(cell)) / 2) : (center(prev) + center(cell)) / 2
      const hi = k < sorted.length - 1 ? (center(cell) + center(sorted[k + 1])) / 2 : Infinity
      // The first row it stands beside: the first that meets it, or (a cell centred on the rows it spans) the first
      // whose middle lies in its share of the column.
      const found = [rows.findIndex(r => center(r) >= lo && center(r) < hi), rows.findIndex(r => Math.min(r.bottom, cell.bottom) - Math.max(r.top, cell.top) > 0)].filter(n => n >= 0)
      at.set(cell, found.length ? Math.min(...found)
        : rows.reduce((best, r, i) => Math.abs(center(r) - center(cell)) < Math.abs(center(rows[best]) - center(cell)) ? i : best, 0))
    })
  })
  const order = cols.flat().sort((a, b) => at.get(a)! - at.get(b)! || a.col - b.col || a.top - b.top)
  for (const cell of order) cell.segs[cell.segs.length - 1].pause = true
  const byTop = (a: Cell, b: Cell) => a.top - b.top || a.col - b.col
  return [...before.sort(byTop), ...order, ...after.sort(byTop)].flatMap(cell => cell.segs)
}

/**
 * Gutters: x-ranges that almost no narrow segment crosses, with text on both sides at overlapping heights.
 * Lines wider than 60% of the text's width (a heading or paragraph over the columns) are not counted: they span.
 */
function gutters(all: Seg[], width: number): Array<[number, number]> {
  if (all.length < 6) return []
  const step = Math.max(0.5, width / 600)
  const left = Math.min(...all.map(s => s.x)), right = Math.max(...all.map(s => s.x2))
  const segs = all.filter(s => s.x2 - s.x <= (right - left) * 0.6)
  if (segs.length < 6) return []
  const bins = Math.max(1, Math.ceil((right - left) / step))
  const cover = new Array<number>(bins).fill(0)
  for (const seg of segs) for (let i = Math.floor((seg.x - left) / step); i < Math.min(bins, Math.ceil((seg.x2 - left) / step)); i++) cover[i]++
  const limit = Math.max(1, Math.floor(segs.length * 0.05))
  const found: Array<[number, number]> = []
  let start = -1
  for (let i = 0; i <= bins; i++) {
    const open = i < bins && cover[i] <= limit
    if (open && start < 0) start = i
    if (!open && start >= 0) {
      const from = left + start * step, to = left + i * step
      if (start > 0 && i < bins && to - from >= width * 0.012) {
        const l = segs.filter(s => s.x2 <= from + step), r = segs.filter(s => s.x >= to - step)
        const span = (list: Seg[]) => [Math.min(...list.map(s => s.top)), Math.max(...list.map(s => s.bottom))]
        // Columns: each side stacks text on at least three lines (not one or two rows of labels side by side).
        const lines = (list: Seg[]) => new Set(list.map(s => s.line)).size
        if (lines(l) >= 3 && lines(r) >= 3 && l.length >= segs.length * 0.15 && r.length >= segs.length * 0.15) {
          const [lt, lb] = span(l), [rt, rb] = span(r)
          // Page columns are of a size with each other: one narrow box beside a wide stack (boxes under a centred
          // heading) is left to the local cuts (readingOrder).
          const wide = (list: Seg[]) => Math.max(...list.map(s => s.x2)) - Math.min(...list.map(s => s.x))
          if (Math.min(lb, rb) - Math.max(lt, rt) >= 0.3 * Math.min(lb - lt, rb - rt) && Math.min(wide(l), wide(r)) >= 0.4 * Math.max(wide(l), wide(r))) found.push([from, to])
        }
      }
      start = -1
    }
  }
  return found
}

/**
 * Reading order (rules 3 and 8). Page columns first, as before: bands between segments that span a gutter, each band
 * column by column (a band whose columns are a table, row by row). Everything else, and each column, is cut like a
 * printer's layout: down between columns when a region has them (boxes side by side under their titles, a table),
 * otherwise across at the widest white strip (between paragraphs, under a heading), and each part again.
 */
function readingOrder(segs: Seg[], width: number, body: number): Seg[] {
  const cuts = gutters(segs.filter(s => !s.marker), width)
  if (!cuts.length) return localOrder(segs, width, body)
  const spans = (seg: Seg) => !seg.marker && cuts.some(([from, to]) => seg.x < from + (to - from) * 0.5 && seg.x2 > to - (to - from) * 0.5)
  const column = (seg: Seg) => cuts.filter(([from]) => seg.x >= from).length
  const order: Seg[] = []
  let band: Seg[] = []
  const flush = () => {
    const columns = cuts.map(() => [] as Seg[]).concat([[]])
    for (const seg of band) columns[column(seg)].push(seg)
    const present = columns.filter(c => c.some(s => !s.marker))
    // A table in the band: by its own columns (a narrow first column the page's gutters pass by), or by the page's.
    const local = present.length >= 2 ? columnsOf(band, width, body) : null
    order.push(...(local && tableOrder(local.columns, body) || present.length >= 2 && tableOrder(present, body)
      || columns.flatMap(c => localOrder(c, width, body))))
    band = []
  }
  for (const seg of [...segs].sort(byLine)) {
    if (spans(seg)) { flush(); order.push(seg) } else band.push(seg)
  }
  flush()
  return order
}

function localOrder(segs: Seg[], width: number, body: number, depth = 0): Seg[] {
  if (segs.length < 2 || depth > 40) return [...segs].sort(byLine)
  const down = columnsOf(segs, width, body)
  if (down) return tableOrder(down.columns, body) ?? down.columns.flatMap(column => localOrder(column, width, body, depth + 1))
  const across = rowCut(segs)
  if (across) return [...localOrder(across.above, width, body, depth + 1), ...localOrder(across.below, width, body, depth + 1)]
  return [...segs].sort(byLine)
}

const headingLike = (seg: Seg, body: number) => seg.size >= body * 1.15 || (letters(seg.text) >= 3 && !/\p{Ll}/u.test(seg.text) && wordCount(seg) <= 10)

/** A chart's value label: a bare number, percentage or amount ("56%", "1,250", "$4.2bn", "-3.5"). */
const VALUE = /^[([]?[-+−–]?[$€£¥]?\d[\d.,]*\s?(?:%|[kKmMbB]n?|pp|pts?)?[)\]]?$/u
/**
 * Rule 9: chart values. Graphics boxes merged into regions as for figures, but panels (a frame behind a chart and
 * its title) included; four or more value labels in body type or smaller inside one (or just beside it) are not read.
 */
function chartValues(segs: Seg[], boxes: PdfNarrationBox[], width: number, height: number, body: number): Region[] {
  const pad = width * 0.015
  const list = boxes.filter(b => [b.x, b.y, b.w, b.h].every(Number.isFinite) && b.w >= width * 0.03 && b.h >= height * 0.02
    && b.w * b.h <= width * height * 0.6).map(b => ({ x: b.x, y: b.y, x2: b.x + b.w, y2: b.y + b.h }))
  let merged = true
  while (merged) {
    merged = false
    for (let i = 0; i < list.length && !merged; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]
      if (a.x - pad <= b.x2 && b.x - pad <= a.x2 && a.y - pad <= b.y2 && b.y - pad <= a.y2) {
        list[i] = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) }
        list.splice(j, 1); merged = true; break
      }
    }
  }
  const found: Region[] = []
  for (const region of list) {
    const m = width * 0.08, grown = { x: region.x - m, y: region.y - m, x2: region.x2 + m, y2: region.y2 + m }
    const values = segs.filter(seg => kept(seg) && seg.size <= body * 1.1 && VALUE.test(seg.text) && inside(seg, grown))
    if (values.length < 4) continue
    for (const seg of values) skipAll(seg, 'figure labels')
    found.push(region)
  }
  return found
}

/** A web address, a DOI, or a domain with a path ("weforum.org/stories/…"). */
const URL_WORD = /^[(<[“"‘]?(?:https?:\/\/|www\.|doi:|10\.\d{4,}\/|[\w-]+(?:\.[\w-]+)*\.(?:com|org|net|edu|gov|int|io|co|uk|eu|de|dk|fr|info)\/)/iu
/**
 * Rule 10: web addresses are not read. An address broken over lines goes on into the first word of the next line
 * when the address ends in a break ("/", "-", ".") or that word is clearly part of one ("org/stories/2025/").
 */
function links(order: Seg[]) {
  let previous: { word: Word; seg: Seg; last: boolean } | null = null
  for (const seg of order) {
    const spoken = seg.words.filter(w => !w.skip)
    spoken.forEach((word, i) => {
      const carried = previous?.word.skip === 'link' && (i === 0 && previous.last && previous.seg !== seg
        && (/[/.\-_=&?#]$/u.test(previous.word.text) || /[/=?&_%]/u.test(word.text)) && !/^\p{Lu}\p{Ll}+[,.;:]?$/u.test(word.text) && !/^\[?\d{1,3}[.)\]]$/u.test(word.text)
        || previous.seg === seg && /^[-–]$/u.test(word.text))
      if (URL_WORD.test(word.text) || carried) word.skip = 'link'
      previous = { word, seg, last: i === spoken.length - 1 }
    })
  }
}

const SOURCES_HEADING = /^(?:\d+[.)]?\s*)?(?:references|bibliography|sources|works cited|literature cited|further reading|endnotes|notes and references)\b/iu
const ENTRY = /^(?:\[\d{1,3}\]|\d{1,3}[.)])(?:\s|$)/u
/**
 * Rule 10: a list of sources. On a page whose lines are largely addresses (three or more, on a fifth of its lines),
 * under a "References"/"Sources" heading over four or more numbered entries, or of bracketed entries ("[12] …"), the
 * entries are left out: from a line that opens an entry ("12.", "[12]") or holds an address, through the lines that
 * carry it on, with a short title line set right over its address. Headings and paragraphs between them are read.
 * Each run of entries is announced once where it begins.
 */
function sourcesList(order: Seg[], body: number) {
  const linked = (seg: Seg) => seg.words.some(w => w.skip === 'link')
  const entries = order.filter(seg => ENTRY.test(seg.text))
  const titled = order.some(seg => headingLike(seg, body) && SOURCES_HEADING.test(seg.text))
  const real = order.filter(seg => !seg.marker)
  const list = real.filter(linked).reduce((n, seg) => n + seg.words.filter(w => w.skip === 'link').length, 0) >= 3 && real.filter(linked).length >= real.length * 0.2
    || titled && entries.length >= 4 || entries.filter(seg => /^\[\d/u.test(seg.text)).length >= Math.max(4, real.length * 0.25)
  if (!list) return
  let inEntry = false, run = false, previous: Seg | null = null
  real.forEach((seg, i) => {
    const starts = ENTRY.test(seg.text) || linked(seg)
    const heading = headingLike(seg, body) && !starts
    // A title of one or two short lines set right over its address belongs to its entry.
    const titles = (k: number, lines: number): boolean => lines <= 2 && wordCount(real[k]) <= 12 && !!real[k + 1] && continues(real[k], real[k + 1])
      && (linked(real[k + 1]) || titles(k + 1, lines + 1))
    inEntry = !heading && (starts || inEntry && !!previous && continues(previous, seg) || titles(i, 1))
    previous = seg
    if (!inEntry) { run = false; return }
    if (!seg.words.some(w => !w.skip)) return
    if (!run) { seg.prefix = [seg.prefix, 'Sources list, not read aloud.'].filter(Boolean).join(' '); run = true }
    for (const w of seg.words) w.skip ??= 'reference list'
  })
}

/** Whether `b` goes on the block `a` is in: the next line, below it, overlapping, in the same type (blocksOf's rule). */
const continues = (a: Seg, b: Seg) => b.line !== a.line && b.top >= a.top && a.x < b.x2 && b.x < a.x2 && b.top - a.bottom <= a.size * 0.9
  && Math.abs(b.size - a.size) <= a.size * 0.15

/** A figure's or table's caption, found beside it or opening "Figure", "Table" …: it gets no pause rule of its own. */
const captioned = (seg: Seg) => !!seg.caption || CAPTION.test(seg.text)
/**
 * A title over its text in slightly larger type (a box's title in bold over its body): the line after it stands
 * further off than the title's own lines do from each other.
 */
const titleOver = (before: Seg | undefined, a: Seg, b: Seg) => a.size - b.size > 0.05 * a.size && !captioned(b)
  && (b.top - a.bottom) - (before && continues(before, a) ? a.top - before.bottom : 0) > 0.4 * a.size

/** The plan for one page: what is spoken, in order, and what is not and why. */
export function pdfNarrationPlan(page: PdfNarrationPageInput, context: PdfNarrationContext = {}): PdfNarrationPlan {
  const source = page.items.map(item => item.str).join(' ').trim()
  const { words, segs, other } = pageSegments(page)
  const { width, height } = page.view
  const body = context.bodySize && context.bodySize > 0 ? context.bodySize
    : median(segs.filter(s => !isEdge(s, height)).flatMap(s => Array(Math.max(1, Math.round(s.text.length / 4))).fill(s.size))) || 10
  const running = context.running ?? new Set<string>()
  // 1–2: furniture at the edges.
  for (const seg of segs) {
    if (!isEdge(seg, height)) continue
    if (isPdfPageNumber(seg.text)) skipAll(seg, 'page number')
    else if (running.has(edgeKey(seg))) skipAll(seg, 'running header/footer')
  }
  // 6: footnote marks first (they are part of body lines), contents numbers.
  footnoteMarkers(segs)
  contentsNumbers(segs)
  // 5, 4: tables (aligned cells), then figures (labels inside graphics).
  const regionSkips: Array<{ region: Region; reason: PdfNarrationSkipReason; kind: 'Table' | 'Figure' }> = []
  for (const region of tables(segs, width, body)) regionSkips.push({ region, reason: 'table cells', kind: 'Table' })
  // A long table left out without a caption is announced where it stands, once a page (rule 8); a small grid is passed
  // over quietly.
  const markers: Seg[] = []
  for (const { region } of regionSkips) {
    const cells = segs.filter(seg => kept(seg) && inside(seg, region))
    for (const seg of cells) skipAll(seg, 'table cells')
    if (!markers.length && !captionOf(region, segs, body).length && cells.reduce((n, seg) => n + wordCount(seg), 0) >= 40) {
      const first = [...cells].sort(byLine)[0]
      markers.push({ frags: [], x: region.x, x2: region.x + 1, top: region.y, bottom: region.y + body, base: region.y + body * 0.8, size: body,
        text: '', words: [], line: first ? first.line - 0.5 : 0, prefix: 'Table, not read aloud.', marker: true })
    }
  }
  for (const region of chartValues(segs, page.graphics ?? [], width, height, body)) regionSkips.push({ region, reason: 'figure labels', kind: 'Figure' })
  for (const region of figures(segs, page.graphics ?? [], width, height, body)) {
    regionSkips.push({ region, reason: 'figure labels', kind: 'Figure' })
    for (const seg of segs) if (kept(seg) && inside(seg, region)) skipAll(seg, 'figure labels')
  }
  for (const { region, kind } of regionSkips) announce(captionOf(region, segs, body), kind)
  // 6: the footnote block, once figures and tables are out of the way.
  footnoteBlock(segs, height, body)
  // 3: order what is left; then links and lists of sources (rule 10), which need the order.
  const ordered = readingOrder([...segs.filter(kept), ...markers], width, body)
  links(ordered)
  sourcesList(ordered, body)
  // A block's full words, for the pause rule (rule 11): its widest line.
  const blockWidth = new Map<Seg, number>()
  for (const block of blocksOf(ordered.filter(seg => !seg.marker))) {
    const left = Math.min(...block.map(s => s.x)), right = Math.max(...block.map(s => s.x2))
    for (const seg of block) blockWidth.set(seg, block.length > 1 ? right - left : 0)
  }
  // Contents entries stay a plain list (their page numbers are left out, rule 6).
  const contentsLines = new Set(segs.filter(seg => seg.words.some(w => w.skip === 'contents page number')).map(seg => seg.line))
  const tokens: string[] = [], map: number[] = []
  const firstSpoken = (seg: Seg) => seg.prefix ?? seg.words.find(w => !w.skip)?.text ?? ''
  ordered.forEach((seg, i) => {
    if (seg.prefix) for (const word of seg.prefix.split(' ')) { tokens.push(word); map.push(-1) }
    let spoke = false, said: Word | null = null
    seg.words.forEach((w, k) => {
      if (w.skip) return
      // Rule 7: a piece of the word just spoken joins it; the token keeps the first piece's rendered word.
      if (w.glue && said && said === seg.words[k - 1]) { tokens[tokens.length - 1] += w.text; said = w; return }
      tokens.push(w.text); map.push(w.index); spoke = true; said = w
    })
    if (seg.marker || !spoke) return
    // A heading ends where its block does: a full stop gives the voice its pause. A heading runs on into the
    // next line when that line opens in the same type right below it (a lead-in sentence wrapping).
    const next = ordered[i + 1]
    const end = seg.frags[seg.frags.length - 1]
    const last = tokens[tokens.length - 1]
    if (next && headingLike(seg, body) && end.size >= seg.size * 0.9
      && !(next.frags.length && Math.abs(next.frags[0].size - end.size) <= end.size * 0.1 && next.top - seg.bottom < seg.size * 0.8)
      && tokens.length && !/[.!?:;,…]$/u.test(last)) tokens[tokens.length - 1] += '.'
    // Rule 11: a block that ends without punctuation before a new one (a box title, a legend entry, a "Source:"
    // line), or a table cell, gets a full stop. The last line of a full paragraph carried on elsewhere does not, nor
    // a line a figure's caption interrupts.
    else if (!captioned(seg) && !contentsLines.has(seg.line) && /[\p{L}\p{N})\]”"’]$/u.test(last) && !/[.!?:;,…]["”’)\]]?$/u.test(last)
      && (seg.pause || next && next.line !== seg.line && !captioned(next) && /^[“"‘'([]?[\p{Lu}\p{N}•▪◦●■–—-]/u.test(firstSpoken(next))
        && (titleOver(ordered[i - 1], seg, next) || !continues(seg, next)
          && (Math.abs(next.size - seg.size) > seg.size * 0.15 || (seg.x2 - seg.x) < 0.85 * (blockWidth.get(seg) || Infinity))))) tokens[tokens.length - 1] += '.'
  })
  for (const list of other) for (const w of list) { tokens.push(w.text); map.push(w.index) }
  const skipped: PdfNarrationPlan['skipped'] = []
  let previous = -2
  for (const list of words) for (const w of list) {
    if (!w.skip) continue
    const last = skipped[skipped.length - 1]
    if (last && last.reason === w.skip && w.index === previous + 1) last.text += ` ${w.text}`
    else skipped.push({ text: w.text, reason: w.skip })
    previous = w.index
  }
  return { text: tokens.join(' '), words: map, source, skipped }
}

/** The rendered word to highlight for a spoken token, or null (an inserted word, or out of range). */
export function pdfNarrationRenderedWord(plan: Pick<PdfNarrationPlan, 'words'>, spoken: number): number | null {
  const index = Number.isInteger(spoken) && spoken >= 0 ? plan.words[spoken] : undefined
  return index === undefined || index < 0 ? null : index
}

/**
 * Where the voice starts for a rendered word (Listen from here on a selection): the spoken token that is that word or
 * that it is a piece of (rule 7); a word that is not read (a table cell, a link) starts at the first word read after
 * it on the page. Null when nothing after it is read.
 */
export function pdfNarrationSpokenIndex(plan: Pick<PdfNarrationPlan, 'words' | 'text' | 'source'>, rendered: number): number | null {
  if (!Number.isInteger(rendered) || rendered < 0 || !plan.words.length) return null
  const exact = plan.words.indexOf(rendered)
  if (exact >= 0) return exact
  const tokens = plan.text.split(' '), source = plan.source.match(/\S+/gu) ?? []
  if (rendered >= source.length) return null
  let piece = -1
  plan.words.forEach((index, i) => {
    if (index < 0 || index >= rendered || (piece >= 0 && plan.words[piece] > index)) return
    const joined = source.slice(index, rendered + 1).join('')
    if (tokens[i] && tokens[i].replace(/\.$/u, '').length >= joined.replace(/\.$/u, '').length && tokens[i].startsWith(joined.replace(/\.$/u, ''))) piece = i
  })
  if (piece >= 0) return piece
  let after = -1
  plan.words.forEach((index, i) => { if (index > rendered && (after < 0 || index < plan.words[after])) after = i })
  return after >= 0 ? after : null
}

type Matrix = [number, number, number, number, number, number]
const multiply = (m: number[], n: number[]): Matrix => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]

/** Image and filled or stroked path boxes from a pdf.js operator list, in the viewport's top-left units. */
export function pdfGraphicBoxes(list: { fnArray: number[]; argsArray: unknown[] }, ops: Record<string, number>, view: PdfNarrationView): PdfNarrationBox[] {
  const boxes: PdfNarrationBox[] = []
  let ctm = view.transform.slice(0, 6) as Matrix
  const stack: Matrix[] = []
  let path: number[] | null = null
  const add = (x0: number, x1: number, y0: number, y1: number) => {
    const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]])
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
    const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
    if ([box.x, box.y, box.w, box.h].every(Number.isFinite)) boxes.push(box)
  }
  const paints = new Set([ops.fill, ops.eoFill, ops.stroke, ops.fillStroke, ops.eoFillStroke, ops.closeStroke, ops.closeFillStroke, ops.closeEOFillStroke].filter(n => n !== undefined))
  const images = new Set([ops.paintImageXObject, ops.paintInlineImageXObject, ops.paintImageMaskXObject, ops.paintImageXObjectRepeat].filter(n => n !== undefined))
  for (let i = 0; i < list.fnArray.length && boxes.length < 5000; i++) {
    const fn = list.fnArray[i], args = list.argsArray[i] as unknown[] | null
    if (fn === ops.save) stack.push(ctm)
    else if (fn === ops.restore) ctm = stack.pop() ?? ctm
    else if (fn === ops.transform && Array.isArray(args) && args.length >= 6) ctm = multiply(ctm, args as number[])
    else if (fn === ops.paintFormXObjectBegin) { stack.push(ctm); const m = Array.isArray(args) ? args[0] : null; if (Array.isArray(m) && m.length >= 6) ctm = multiply(ctm, m as number[]) }
    else if (fn === ops.paintFormXObjectEnd) ctm = stack.pop() ?? ctm
    else if (fn === ops.constructPath) { const mm = Array.isArray(args) ? args[2] : null; path = Array.isArray(mm) && mm.length === 4 && mm.every(n => Number.isFinite(n)) ? mm as number[] : null }
    else if (paints.has(fn)) { if (path) add(path[0], path[1], path[2], path[3]); path = null }
    else if (fn === ops.endPath) path = null
    else if (images.has(fn)) add(0, 1, 0, 1)
  }
  return boxes
}
