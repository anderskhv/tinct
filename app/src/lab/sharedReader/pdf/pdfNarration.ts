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
  | 'footnote marker' | 'footnote' | 'contents page number'
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

type Word = { text: string; index: number; skip?: PdfNarrationSkipReason }
type Frag = { x: number; x2: number; base: number; size: number; words: Word[]; text: string }
type Seg = { frags: Frag[]; x: number; x2: number; top: number; bottom: number; base: number; size: number; text: string
  words: Word[]; line: number; prefix?: string }

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
    upright.push({ x, x2: x + Math.max(0, (item.width || 0) * scale), base, size, words: words[i], text: item.str.trim() })
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
    base: main.base, size, text: frags.map(f => f.text).join(' ').replace(/\s+/g, ' ').trim(), words: frags.flatMap(f => f.words), line }
}

/** Lines split into segments where the horizontal gap is wider than 1.25 em (a gutter, a page number set apart). */
function segmentsOf(frags: Frag[]): Seg[] {
  const segs: Seg[] = []
  linesOf(frags).forEach((line, n) => {
    let run: Frag[] = []
    for (const frag of line) {
      const prev = run[run.length - 1]
      if (prev && frag.x - Math.max(...run.map(f => f.x2)) > GAP_EM * Math.min(prev.size, frag.size)) { segs.push(segment(run, n)); run = [] }
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
          if (Math.min(lb, rb) - Math.max(lt, rt) >= 0.3 * Math.min(lb - lt, rb - rt)) found.push([from, to])
        }
      }
      start = -1
    }
  }
  return found
}

/** Reading order: bands between gutter-spanning segments; in a band, columns left to right, each top to bottom. */
function readingOrder(segs: Seg[], width: number): Seg[] {
  const byLine = (a: Seg, b: Seg) => a.line - b.line || a.x - b.x
  const cuts = gutters(segs, width)
  if (!cuts.length) return [...segs].sort(byLine)
  const spans = (seg: Seg) => cuts.some(([from, to]) => seg.x < from + (to - from) * 0.5 && seg.x2 > to - (to - from) * 0.5)
  const column = (seg: Seg) => cuts.filter(([from]) => seg.x >= from).length
  const order: Seg[] = []
  let band: Seg[] = []
  const flush = () => { order.push(...band.sort((a, b) => column(a) - column(b) || byLine(a, b))); band = [] }
  for (const seg of [...segs].sort(byLine)) {
    if (spans(seg)) { flush(); order.push(seg) } else band.push(seg)
  }
  flush()
  return order
}

const headingLike = (seg: Seg, body: number) => seg.size >= body * 1.15 || (letters(seg.text) >= 3 && !/\p{Ll}/u.test(seg.text) && wordCount(seg) <= 10)

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
  for (const { region, reason } of regionSkips) for (const seg of segs) if (kept(seg) && inside(seg, region)) skipAll(seg, reason)
  for (const region of figures(segs, page.graphics ?? [], width, height, body)) {
    regionSkips.push({ region, reason: 'figure labels', kind: 'Figure' })
    for (const seg of segs) if (kept(seg) && inside(seg, region)) skipAll(seg, 'figure labels')
  }
  for (const { region, kind } of regionSkips) announce(captionOf(region, segs, body), kind)
  // 6: the footnote block, once figures and tables are out of the way.
  footnoteBlock(segs, height, body)
  // 3: order what is left.
  const ordered = readingOrder(segs.filter(kept), width)
  const tokens: string[] = [], map: number[] = []
  ordered.forEach((seg, i) => {
    if (seg.prefix) { tokens.push(seg.prefix); map.push(-1) }
    for (const w of seg.words) if (!w.skip) { tokens.push(w.text); map.push(w.index) }
    // A heading ends where its block does: a full stop gives the voice its pause. A heading runs on into the
    // next line when that line opens in the same type right below it (a lead-in sentence wrapping).
    const next = ordered[i + 1]
    const end = seg.frags[seg.frags.length - 1]
    if (next && headingLike(seg, body) && end.size >= seg.size * 0.9
      && !(Math.abs(next.frags[0].size - end.size) <= end.size * 0.1 && next.top - seg.bottom < seg.size * 0.8)
      && tokens.length && !/[.!?:;,…]$/u.test(tokens[tokens.length - 1])) tokens[tokens.length - 1] += '.'
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
