/**
 * Share a highlight as an image: page layout (docs/share-quote/SPEC.md).
 *
 * The image is the reader's own page: justified EB Garamond, the highlight
 * bold on the gold highlight colour, everything else greyed, opening one
 * sentence before the highlight. Fitting follows the spec in order: reader
 * size on one page; (desktop) reader size across the spread; shrink the body
 * in 1% steps to 75%; then keep 75% and cut the highlight at a sentence with
 * "…". The words themselves are never changed.
 *
 * Geometry mirrors docs/share-quote/mockup.html (its `cqw` values times the
 * image width). Pure: fonts come in as metrics, output is positioned runs
 * that shareSvg.ts draws.
 */

import { stripUnderscoreEmphasis } from '../lab/emphasisText'
import type { FontMetrics } from './fontMetrics'

export type ShareLook = 'paper' | 'night' | 'eink'
export type ShareFormat = 'phone' | 'desktop' | 'og'

export interface ShareRange {
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  /** Exclusive, as in the reader's highlight records. */
  toWord: number
}

export interface ShareFonts {
  regular: FontMetrics
  semibold: FontMetrics
  italic: FontMetrics
}

export interface ShareContent {
  bookTitle: string
  chapterLabel: string
  /** "tr. George Long", "Tinct Modern English", "Original (1831)": always shown on the page. */
  credit: string
  /**
   * The credit names a translation, a modern rewording or a Bible version, so
   * the quote card keeps it too. False only for an author's own original text;
   * missing counts as true.
   */
  creditOnQuote?: boolean
  paragraphs: string[]
  range: ShareRange
}

export interface ShareOptions {
  format: ShareFormat
  look: ShareLook
  /** Show surrounding text (greyed). */
  context: boolean
  /** Add "Read free at tinct.app". */
  tagline: boolean
}

export const SHARE_TAGLINE = 'Read free at tinct.app'
export const SHARE_ELLIPSIS = '…'
export const SHARE_SCALE_FLOOR = 0.75
const LINE_HEIGHT = 1.52
const PARAGRAPH_GAP = 0.55
/** Following paragraphs laid out after the highlight; the page cuts them off. */
const FOLLOWING_PARAGRAPHS = 8

// ---------------------------------------------------------------------------
// Superscript digits (Bible verse numbers, note markers)

/**
 * Superscript digits as the regular digits they stand for. The share fonts
 * have no glyphs for U+2070 and U+2074–2079, so these are drawn as small
 * raised regular digits instead (shareSvg.ts); ¹ ² ³ follow suit so a number
 * like ¹⁰ is drawn in one style.
 */
const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '\u2070': '0', '\u00b9': '1', '\u00b2': '2', '\u00b3': '3', '\u2074': '4',
  '\u2075': '5', '\u2076': '6', '\u2077': '7', '\u2078': '8', '\u2079': '9',
}
const SUPERSCRIPT_RE = /[\u2070\u00b9\u00b2\u00b3\u2074-\u2079]+/g
/** Raised digits: size and rise as fractions of the body size. */
export const SUPERSCRIPT_SCALE = 0.6
export const SUPERSCRIPT_RISE = 0.34

export interface TextRun {
  text: string
  /** Raised small digits (converted from superscript characters). */
  sup: boolean
}

/** A word split into plain text and raised digits. */
export function superscriptRuns(text: string): TextRun[] {
  const runs: TextRun[] = []
  let last = 0
  for (const match of text.matchAll(SUPERSCRIPT_RE)) {
    const index = match.index ?? 0
    if (index > last) runs.push({ text: text.slice(last, index), sup: false })
    runs.push({ text: [...match[0]].map(char => SUPERSCRIPT_DIGITS[char]).join(''), sup: true })
    last = index + match[0].length
  }
  if (last < text.length) runs.push({ text: text.slice(last), sup: false })
  return runs
}

/** A word that is only a verse (or note) number, such as "⁷" or "¹⁰". */
export function isVerseMarker(text: string): boolean {
  return /^[\u2070\u00b9\u00b2\u00b3\u2074-\u2079]+$/.test(text)
}

export interface Token {
  text: string
  italic: boolean
  hl: boolean
  /** The source had a line break before this word (verse). */
  lineBreakBefore: boolean
  /** Ends a sentence: a cut point for an over-long highlight. */
  sentenceEnd: boolean
}

export interface Paragraph {
  tokens: Token[]
}

const ABBREVIATIONS = new Set(['mr.', 'mrs.', 'ms.', 'dr.', 'st.', 'sr.', 'jr.', 'mt.', 'no.', 'vs.', 'etc.', 'i.e.', 'e.g.', 'viz.', 'cf.', 'ch.', 'vol.'])

function endsSentence(word: string): boolean {
  const bare = word.replace(/["'”’)\]]+$/, '')
  if (!/[.!?…]$/.test(bare)) return false
  if (ABBREVIATIONS.has(bare.toLowerCase())) return false
  // A single capital initial ("J.") is a name, not a sentence end.
  if (/^[A-Z]\.$/.test(bare)) return false
  return true
}

/** Whitespace tokens exactly as the reader counts them (emphasis delimiters stripped). */
export function tokenizeParagraph(raw: string): Token[] {
  const { text, ranges } = stripUnderscoreEmphasis(raw)
  const tokens: Token[] = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  let last = 0
  while ((match = re.exec(text))) {
    const start = match.index
    const end = start + match[0].length
    tokens.push({
      text: match[0],
      italic: ranges.some(([a, b]) => start < b && end > a),
      hl: false,
      lineBreakBefore: tokens.length > 0 && text.slice(last, start).includes('\n'),
      sentenceEnd: endsSentence(match[0]),
    })
    last = end
  }
  return tokens
}

/** Word count of each paragraph, for validating a shared range. */
export function paragraphWordCounts(paragraphs: string[]): number[] {
  return paragraphs.map(paragraph => tokenizeParagraph(paragraph).length)
}

export function isValidShareRange(paragraphs: string[], range: ShareRange, maxWords = 1500): boolean {
  const { paragraphIndex, fromWord, endParagraphIndex, toWord } = range
  if (![paragraphIndex, fromWord, endParagraphIndex, toWord].every(n => Number.isSafeInteger(n) && n >= 0)) return false
  if (endParagraphIndex < paragraphIndex || endParagraphIndex >= paragraphs.length) return false
  if (endParagraphIndex === paragraphIndex && toWord <= fromWord) return false
  const counts = paragraphWordCounts(paragraphs)
  if (fromWord >= counts[paragraphIndex] || toWord > counts[endParagraphIndex] || toWord < 1) return false
  let words = 0
  for (let p = paragraphIndex; p <= endParagraphIndex; p++) {
    words += (p === endParagraphIndex ? toWord : counts[p]) - (p === paragraphIndex ? fromWord : 0)
  }
  return words > 0 && words <= maxWords
}

/** The highlighted words as plain text (titles, alt text). */
export function shareRangeText(paragraphs: string[], range: ShareRange): string {
  const parts: string[] = []
  for (let p = range.paragraphIndex; p <= range.endParagraphIndex; p++) {
    const tokens = tokenizeParagraph(paragraphs[p] ?? '')
    const from = p === range.paragraphIndex ? range.fromWord : 0
    const to = p === range.endParagraphIndex ? range.toWord : tokens.length
    parts.push(tokens.slice(from, to).map(token => token.text).join(' '))
  }
  return parts.filter(Boolean).join(' ')
}

function sentenceStart(tokens: Token[], index: number): number {
  let i = index
  while (i > 0 && !tokens[i - 1].sentenceEnd) i--
  return i
}

function ellipsisToken(hl: boolean): Token {
  return { text: SHARE_ELLIPSIS, italic: false, hl, lineBreakBefore: false, sentenceEnd: false }
}

/** Glue "…" onto a neighbouring word so it never sits alone on a line. */
function withLeadingEllipsis(token: Token): Token {
  return { ...token, text: SHARE_ELLIPSIS + token.text }
}

function withTrailingEllipsis(token: Token): Token {
  return { ...token, text: token.text + SHARE_ELLIPSIS }
}

/**
 * The passage for the page. With context: from one sentence before the
 * highlight (the start of the sentence the highlight begins in, or the
 * sentence before when it begins on a sentence) through the highlight and on
 * into the following paragraphs. Without: the highlight alone, with "…"
 * where it begins or ends mid-sentence.
 */
export function buildPassage(paragraphs: string[], range: ShareRange, context: boolean): Paragraph[] {
  const all = paragraphs.map(tokenizeParagraph)
  const marked = all.map((tokens, p) => tokens.map((token, w) => {
    const after = p > range.paragraphIndex || (p === range.paragraphIndex && w >= range.fromWord)
    const before = p < range.endParagraphIndex || (p === range.endParagraphIndex && w < range.toWord)
    return { ...token, hl: after && before }
  }))
  const out: Paragraph[] = []
  if (!context) {
    for (let p = range.paragraphIndex; p <= range.endParagraphIndex; p++) {
      const tokens = marked[p].filter(token => token.hl)
      if (tokens.length) out.push({ tokens })
    }
    if (!out.length) return out
    // A verse number opening the quote is dropped: the header says where it is from.
    if (isVerseMarker(out[0].tokens[0].text) && (out[0].tokens.length > 1 || out.length > 1)) {
      out[0].tokens.shift()
      if (!out[0].tokens.length) out.shift()
    }
    const first = out[0].tokens
    // A verse number before the sentence is not part of it ("⁷ The LORD’s…" from "The").
    const opening = marked[range.paragraphIndex]
    let start = sentenceStart(opening, range.fromWord)
    while (start < range.fromWord && isVerseMarker(opening[start].text)) start++
    if (start !== range.fromWord) first[0] = withLeadingEllipsis(first[0])
    const last = out[out.length - 1].tokens
    if (!last[last.length - 1].sentenceEnd) last[last.length - 1] = withTrailingEllipsis(last[last.length - 1])
    return out
  }
  let startParagraph = range.paragraphIndex
  let startWord = sentenceStart(marked[startParagraph], range.fromWord)
  if (startWord === range.fromWord) {
    if (range.fromWord > 0) startWord = sentenceStart(marked[startParagraph], range.fromWord - 1)
    else {
      let previous = startParagraph - 1
      while (previous >= 0 && marked[previous].length === 0) previous--
      if (previous >= 0) {
        startParagraph = previous
        startWord = sentenceStart(marked[previous], marked[previous].length - 1)
      }
    }
  }
  const lastParagraph = Math.min(marked.length - 1, range.endParagraphIndex + FOLLOWING_PARAGRAPHS)
  for (let p = startParagraph; p <= lastParagraph; p++) {
    const tokens = p === startParagraph ? marked[p].slice(startWord) : marked[p]
    if (tokens.length) out.push({ tokens: [...tokens] })
  }
  if (startWord > 0 && out.length) out[0].tokens[0] = withLeadingEllipsis(out[0].tokens[0])
  return out
}

/**
 * Cut the highlight after its `keep`-th word: later highlight words and all
 * text after them are dropped, and "…" follows the last kept word.
 */
export function cutPassage(passage: Paragraph[], keep: number): Paragraph[] {
  const out: Paragraph[] = []
  let seen = 0
  for (const paragraph of passage) {
    const tokens: Token[] = []
    for (const token of paragraph.tokens) {
      if (token.hl) {
        if (seen >= keep) {
          if (tokens.length) out.push({ tokens })
          finishCut(out)
          return out
        }
        seen++
      }
      tokens.push(token)
    }
    if (tokens.length) out.push({ tokens })
  }
  return out
}

function finishCut(out: Paragraph[]): void {
  const last = out[out.length - 1]
  if (!last) return
  last.tokens[last.tokens.length - 1] = withTrailingEllipsis(last.tokens[last.tokens.length - 1])
}

/** Highlight word counts at which a sentence ends: where a cut may fall. */
export function sentenceCutPoints(passage: Paragraph[]): number[] {
  const points: number[] = []
  let seen = 0
  for (const paragraph of passage) for (const token of paragraph.tokens) {
    if (!token.hl) continue
    seen++
    if (token.sentenceEnd) points.push(seen)
  }
  return points
}

export function highlightWordCount(passage: Paragraph[]): number {
  return passage.reduce((sum, paragraph) => sum + paragraph.tokens.filter(token => token.hl).length, 0)
}

// ---------------------------------------------------------------------------
// Lines and columns

export interface PlacedWord {
  text: string
  x: number
  width: number
  style: 'regular' | 'semibold' | 'italic'
  hl: boolean
}

export interface PlacedLine {
  column: number
  /** Top of the line box, relative to the text box. */
  top: number
  words: PlacedWord[]
}

export interface ColumnBox {
  width: number
  height: number
  columns: number
  gap: number
  /** Ragged right (the quote card). Default: justified, as in the reader. */
  ragged?: boolean
  /** Line height as a multiple of the size. Default: the reader's 1.52. */
  leading?: number
}

export interface ColumnLayout {
  lines: PlacedLine[]
  fontSize: number
  lineHeight: number
  /** Every highlight word was placed. */
  fits: boolean
  /** Height used in the last column (for vertical centring). */
  usedHeight: number
  placedWords: number
}

function styleOf(token: Token): PlacedWord['style'] {
  if (token.hl) return 'semibold'
  return token.italic ? 'italic' : 'regular'
}

function widthOf(fonts: ShareFonts, token: Token, size: number): number {
  const font = fonts[styleOf(token)]
  let width = 0
  for (const run of superscriptRuns(token.text)) {
    let units = 0
    for (const char of run.text) units += font.advance(char.codePointAt(0) ?? 32)
    width += (units / font.unitsPerEm) * size * (run.sup ? SUPERSCRIPT_SCALE : 1)
  }
  return width
}

export function layoutColumns(passage: Paragraph[], fonts: ShareFonts, fontSize: number, box: ColumnBox): ColumnLayout {
  const lineHeight = fontSize * (box.leading ?? LINE_HEIGHT)
  const gapAfterParagraph = fontSize * PARAGRAPH_GAP
  const space = (fonts.regular.advance(32) / fonts.regular.unitsPerEm) * fontSize
  const totalHl = highlightWordCount(passage)
  const lines: PlacedLine[] = []
  let column = 0
  let y = 0
  let placedHl = 0
  let placedWords = 0
  let full = false

  const newLineFits = () => {
    if (y + lineHeight <= box.height + 0.5) return true
    if (column + 1 < box.columns) { column++; y = 0; return true }
    return false
  }

  for (let p = 0; p < passage.length && !full; p++) {
    const tokens = passage[p].tokens
    if (p > 0 && y > 0) y += gapAfterParagraph
    let i = 0
    while (i < tokens.length) {
      // Fill one line greedily.
      const words: { token: Token; width: number }[] = []
      let natural = 0
      let j = i
      while (j < tokens.length) {
        if (j > i && tokens[j].lineBreakBefore) break
        const width = widthOf(fonts, tokens[j], fontSize)
        const next = words.length ? natural + space + width : width
        if (words.length && next > box.width) break
        words.push({ token: tokens[j], width })
        natural = next
        j++
      }
      if (!newLineFits()) { full = true; break }
      const lastOfParagraph = j >= tokens.length
      const forcedBreak = !lastOfParagraph && tokens[j].lineBreakBefore
      const justify = !box.ragged && !lastOfParagraph && !forcedBreak && words.length > 1
      const gap = justify ? space + (box.width - natural) / (words.length - 1) : space
      const offset = column * (box.width + box.gap)
      let x = 0
      const placed: PlacedWord[] = words.map(({ token, width }) => {
        const word: PlacedWord = { text: token.text, x: offset + x, width, style: styleOf(token), hl: token.hl }
        x += width + gap
        return word
      })
      lines.push({ column, top: y, words: placed })
      placedHl += words.filter(word => word.token.hl).length
      placedWords += words.length
      y += lineHeight
      i = j
    }
  }
  return { lines, fontSize, lineHeight, fits: placedHl >= totalHl, usedHeight: y, placedWords }
}

// ---------------------------------------------------------------------------
// The page

export interface ShareCanvas {
  width: number
  height: number
}

export interface ShareFrame {
  canvas: ShareCanvas
  padding: { top: number; side: number; bottom: number }
  header: { size: number; align: 'left' | 'center'; boxHeight: number; gap: number }
  footer: { size: number; padTop: number; boxHeight: number; align?: 'left' | 'center' }
  /** Desktop: the paper page card(s) behind the text. */
  page?: { x: number; y: number; width: number; height: number; padTop: number; padSide: number; padBottom: number; numbers: { size: number; padTop: number; boxHeight: number } }
  text: { x: number; y: number; width: number; height: number }
  /** Reader body size in px at 100%. */
  baseSize: number
}

const NORMAL_LINE = 1.305 // EB Garamond (ascent + descent) / unitsPerEm

function phoneFrame(): ShareFrame {
  const cq = 1080 / 100
  const padding = { top: 7 * cq, side: 7 * cq, bottom: 4 * cq }
  const header = { size: 4.6 * cq, align: 'left' as const, boxHeight: 4.6 * cq * NORMAL_LINE, gap: 4.5 * cq }
  const footer = { size: 3.9 * cq, padTop: 2.6 * cq, boxHeight: 3.9 * cq * NORMAL_LINE }
  const top = padding.top + header.boxHeight + header.gap
  const bottom = 1350 - padding.bottom - footer.boxHeight - footer.padTop
  return { canvas: { width: 1080, height: 1350 }, padding, header, footer, text: { x: padding.side, y: top, width: 1080 - 2 * padding.side, height: bottom - top }, baseSize: 5.9 * cq }
}

function desktopFrame(spread: boolean): ShareFrame {
  const cq = 1600 / 100
  const padding = { top: 2.4 * cq, side: 3 * cq, bottom: 1.6 * cq }
  const header = { size: 2.3 * cq, align: 'center' as const, boxHeight: 2.3 * cq * NORMAL_LINE, gap: 1.8 * cq }
  const footer = { size: 1.55 * cq, padTop: 1.1 * cq, boxHeight: 1.55 * cq * NORMAL_LINE }
  const contentWidth = 1600 - 2 * padding.side
  const pageWidth = spread ? contentWidth : contentWidth * 0.56
  const pageX = padding.side + (contentWidth - pageWidth) / 2
  const pageY = padding.top + header.boxHeight + header.gap
  const pageBottom = 1000 - padding.bottom - footer.boxHeight - footer.padTop
  const numbers = { size: 1 * cq, padTop: 1 * cq, boxHeight: 1 * cq * NORMAL_LINE }
  const page = { x: pageX, y: pageY, width: pageWidth, height: pageBottom - pageY, padTop: 3.2 * cq, padSide: 3.4 * cq, padBottom: 1.6 * cq, numbers }
  const text = {
    x: pageX + page.padSide,
    y: pageY + page.padTop,
    width: pageWidth - 2 * page.padSide,
    height: page.height - page.padTop - page.padBottom - numbers.padTop - numbers.boxHeight,
  }
  return { canvas: { width: 1600, height: 1000 }, padding, header, footer, page, text, baseSize: (spread ? 1.9 : 2.15) * cq }
}

/** The 1.91:1 link preview: the page treatment, cropped to the highlight. */
function ogFrame(): ShareFrame {
  const cq = 1200 / 100
  const padding = { top: 4 * cq, side: 6 * cq, bottom: 2.6 * cq }
  const header = { size: 2.9 * cq, align: 'center' as const, boxHeight: 2.9 * cq * NORMAL_LINE, gap: 2.4 * cq }
  const footer = { size: 2.3 * cq, padTop: 1.6 * cq, boxHeight: 2.3 * cq * NORMAL_LINE }
  const top = padding.top + header.boxHeight + header.gap
  const bottom = 630 - padding.bottom - footer.boxHeight - footer.padTop
  return { canvas: { width: 1200, height: 630 }, padding, header, footer, text: { x: padding.side, y: top, width: 1200 - 2 * padding.side, height: bottom - top }, baseSize: 3.4 * cq }
}

export interface SharePage {
  options: ShareOptions
  content: Pick<ShareContent, 'bookTitle' | 'chapterLabel' | 'credit'>
  frame: ShareFrame
  layout: ColumnLayout
  /** `quote`: the highlight alone on a card sized to it (phone and desktop images). */
  mode: 'single' | 'spread' | 'quote'
  /** Body size as a fraction of the reader's size. */
  scale: number
  /** The highlight was cut at a sentence. */
  cut: boolean
  /** Vertical offset of the text inside its box (quote alone is centred). */
  offsetY: number
  /** Desktop page numbers under each column. */
  pageNumbers: number[]
}

function steps(): number[] {
  const out: number[] = []
  for (let i = 100; i >= SHARE_SCALE_FLOOR * 100; i--) out.push(i / 100)
  return out
}

function boxFor(frame: ShareFrame, spread: boolean): ColumnBox {
  if (!spread) return { width: frame.text.width, height: frame.text.height, columns: 1, gap: 0 }
  const gap = 7 * (1600 / 100)
  return { width: (frame.text.width - gap) / 2, height: frame.text.height, columns: 2, gap }
}

/**
 * Lay out the page, following the spec's fitting order. Deterministic: the
 * same record always yields the same image.
 */
export function composeSharePage(content: ShareContent, options: ShareOptions, fonts: ShareFonts): SharePage {
  const passage = buildPassage(content.paragraphs, content.range, options.context)
  if (!options.context && options.format !== 'og') {
    const card = composeQuoteCard(content, options, fonts, passage)
    if (card) return card
  }
  const candidates: Array<{ frame: ShareFrame; spread: boolean; scales: number[] }> = options.format === 'desktop'
    ? [{ frame: desktopFrame(false), spread: false, scales: [1] }, { frame: desktopFrame(true), spread: true, scales: steps() }]
    : [{ frame: options.format === 'og' ? ogFrame() : phoneFrame(), spread: false, scales: steps() }]

  let chosen: { frame: ShareFrame; spread: boolean; scale: number; layout: ColumnLayout; cut: boolean } | null = null
  for (const candidate of candidates) {
    const box = boxFor(candidate.frame, candidate.spread)
    for (const scale of candidate.scales) {
      const layout = layoutColumns(passage, fonts, candidate.frame.baseSize * scale, box)
      if (layout.fits) { chosen = { ...candidate, scale, layout, cut: false }; break }
    }
    if (chosen) break
  }
  if (!chosen) {
    // Still too long at 75%: keep 75% and cut at the longest sentence that fits.
    const last = candidates[candidates.length - 1]
    const box = boxFor(last.frame, last.spread)
    const size = last.frame.baseSize * SHARE_SCALE_FLOOR
    const points = sentenceCutPoints(passage).reverse()
    const total = highlightWordCount(passage)
    let layout: ColumnLayout | null = null
    for (const keep of points) {
      if (keep >= total) continue
      const attempt = layoutColumns(cutPassage(passage, keep), fonts, size, box)
      if (attempt.fits) { layout = attempt; break }
    }
    if (!layout) {
      // Not even the first sentence fits: cut at the last whole word that does.
      let lo = 1
      let hi = total - 1
      let best = layoutColumns(cutPassage(passage, 1), fonts, size, box)
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const attempt = layoutColumns(cutPassage(passage, mid), fonts, size, box)
        if (attempt.fits) { best = attempt; lo = mid + 1 } else hi = mid - 1
      }
      layout = best
    }
    chosen = { frame: last.frame, spread: last.spread, scale: SHARE_SCALE_FLOOR, layout, cut: true }
  }

  const centre = !options.context && !chosen.spread
  const offsetY = centre ? Math.max(0, (chosen.frame.text.height - chosen.layout.usedHeight) / 2) : 0
  const pageNumbers = options.format === 'desktop' ? estimatePageNumbers(content, chosen.spread) : []
  return {
    options,
    content: { bookTitle: content.bookTitle, chapterLabel: content.chapterLabel, credit: content.credit },
    frame: chosen.frame,
    layout: chosen.layout,
    mode: chosen.spread ? 'spread' : 'single',
    scale: chosen.scale,
    cut: chosen.cut,
    offsetY,
    pageNumbers,
  }
}

// ---------------------------------------------------------------------------
// The quote card: the highlight alone, without the page around it

interface QuoteCardSpec {
  width: number
  margin: number
  minHeight: number
  maxHeight: number
  /** Body size range in px: the largest that fits is used. */
  maxSize: number
  minSize: number
  header: number
  footer: number
}

/**
 * Phone 1080 wide, from 5:3 up to 4:5; desktop 1600 wide, from 2:1 up to 5:4.
 * The smallest phone size is the page's 75% floor; desktop stays above it.
 */
export const QUOTE_CARDS: Record<'phone' | 'desktop', QuoteCardSpec> = {
  phone: { width: 1080, margin: 92, minHeight: 648, maxHeight: 1350, maxSize: 92, minSize: 48, header: 34, footer: 30 },
  desktop: { width: 1600, margin: 128, minHeight: 800, maxHeight: 1280, maxSize: 88, minSize: 40, header: 34, footer: 28 },
}

/** Display leading: the highlight bands of consecutive lines almost meet. */
const QUOTE_LEADING = 1.32

function quoteFrame(spec: QuoteCardSpec, footer: boolean, height: number): ShareFrame {
  const padding = { top: spec.margin * 0.8, side: spec.margin, bottom: spec.margin * 0.8 }
  const header = { size: spec.header, align: 'left' as const, boxHeight: spec.header * NORMAL_LINE, gap: spec.margin * 0.45 }
  const foot = { size: spec.footer, padTop: footer ? spec.margin * 0.45 : 0, boxHeight: footer ? spec.footer * NORMAL_LINE : 0, align: 'left' as const }
  const top = padding.top + header.boxHeight + header.gap
  const bottom = height - padding.bottom - foot.boxHeight - foot.padTop
  return { canvas: { width: spec.width, height }, padding, header, footer: foot, text: { x: padding.side, y: top, width: spec.width - 2 * padding.side, height: bottom - top }, baseSize: spec.maxSize }
}

/**
 * The highlight alone: the card's height follows the text, between the
 * format's shortest and tallest card. The type is as large as fits (short
 * quotes read large), down to the smallest size. No page, page number or
 * surrounding text; the edition credit only when it names a translation or
 * rewording. Null when the whole highlight does not fit even the tallest card
 * at the smallest size: the page layout then takes it (the desktop spread, or
 * the page's 75% floor and sentence cut), so a long quote never loses words
 * that the page would have shown.
 */
function composeQuoteCard(content: ShareContent, options: ShareOptions, fonts: ShareFonts, passage: Paragraph[]): SharePage | null {
  const spec = QUOTE_CARDS[options.format === 'desktop' ? 'desktop' : 'phone']
  const credit = content.creditOnQuote === false ? '' : content.credit
  const hasFooter = Boolean(credit) || options.tagline
  const tallest = quoteFrame(spec, hasFooter, spec.maxHeight)
  const box: ColumnBox = { width: tallest.text.width, height: tallest.text.height, columns: 1, gap: 0, ragged: true, leading: QUOTE_LEADING }
  let layout: ColumnLayout | null = null
  for (let size = spec.maxSize; size >= spec.minSize; size -= 1) {
    const attempt = layoutColumns(passage, fonts, size, box)
    if (attempt.fits) { layout = attempt; break }
  }
  if (!layout) return null
  const chrome = spec.maxHeight - tallest.text.height
  const height = Math.round(Math.min(spec.maxHeight, Math.max(spec.minHeight, chrome + layout.usedHeight)))
  const frame = quoteFrame(spec, hasFooter, height)
  return {
    options,
    content: { bookTitle: content.bookTitle, chapterLabel: content.chapterLabel, credit },
    frame,
    layout,
    mode: 'quote',
    scale: layout.fontSize / spec.maxSize,
    cut: false,
    offsetY: Math.max(0, (frame.text.height - layout.usedHeight) / 2),
    pageNumbers: [],
  }
}

/**
 * The reader's page number for the passage, estimated from the words before
 * it at the desktop reader's density (about 260 words a page).
 */
function estimatePageNumbers(content: ShareContent, spread: boolean): number[] {
  const counts = paragraphWordCounts(content.paragraphs)
  let before = content.range.fromWord
  for (let p = 0; p < content.range.paragraphIndex; p++) before += counts[p]
  const page = Math.floor(before / 260) + 1
  if (!spread) return [page]
  const left = page % 2 === 0 ? page - 1 : page
  return [Math.max(1, left), Math.max(2, left + 1)]
}
