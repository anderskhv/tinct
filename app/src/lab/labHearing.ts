import type { FollowParagraph, FollowTarget } from './labFollow'
import {
  LAB_OVERFLOW_CLEAR_PX,
  labPageFitsPaint,
  labPageSlackPx,
  shouldGrowPaintedPage,
  growWordsFromSlack,
  type LabPageAdjust,
  type LabPaintedOverflow,
} from './labChrome'

export type HearingWordRole = 'spoken' | 'current' | 'upcoming' | 'line'

export interface HearingWord {
  text: string
  role: HearingWordRole
  /** Paragraph-local word index when known (hearing follow paint). */
  wordIndex?: number
}

export interface HearingLine {
  words: HearingWord[]
  paragraphIndex?: number
  from?: number
}

export interface HearingProgress {
  current: number
  total: number
}

export interface HearingSeekPoint {
  clipIndex: number
  offsetSeconds: number
}

function splitDisplaySentences(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [text]
}

function wordRole(index: number, current: number): HearingWordRole {
  if (index < current) return 'spoken'
  if (index === current) return 'current'
  return 'upcoming'
}

function isStrongStop(text: string): boolean {
  return /[.!?]["']?$/.test(text)
}

function isClauseStop(text: string): boolean {
  return /[.!?:;]["']?$/.test(text)
}

const LAB_WEAK_PAGE_END_RE = /^(?:a|after|am|an|and|are|as|at|be|been|before|being|but|by|can|could|each|every|for|from|had|has|have|her|his|if|in|into|is|its|let|may|might|must|nor|of|on|or|our|shall|should|so|than|that|the|their|then|to|unto|was|were|when|where|which|who|whose|will|with|would|yet|your)$/i
const LAB_SENTENCE_CONNECTOR_RE = /^(?:and|but|for|nor|or|so|then|yet)$/i

function isCommaStop(text: string): boolean {
  return /,["']?$/.test(text)
}

function barePageWord(text: string): string {
  return text.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
}

/**
 * Improve a fitted line break without forcing every page to end at a full
 * stop. Mature readers fill the page first, then avoid only a short dangling
 * connector/phrase that fits on the next line.
 */
export function polishPageEnd(
  words: Array<{ text: string }>,
  from: number,
  to: number,
  maxRollbackWords = 8,
): number {
  if (to <= from) return to
  if (to === from + 1) return isLabVerseMarker(words[from]?.text || '') ? from : to
  const rollbackLimit = Math.max(1, Math.min(12, maxRollbackWords))
  let end = to

  // A verse number or short function word must not sit alone at page bottom.
  while (end > from + 1 && to - end < rollbackLimit) {
    const text = words[end - 1]?.text || ''
    const bare = barePageWord(text)
    if (isClauseStop(text)) break
    if (!isLabVerseMarker(text) && !LAB_WEAK_PAGE_END_RE.test(bare)) break
    end -= 1
  }

  // “grass, and herb | yielding seed” is a worse boundary than
  // “grass, | and herb yielding seed”. Keep a two-word coordinated phrase
  // together when moving it does not discard another painted line.
  const phraseConnector = end - 2
  if (
    phraseConnector > from
    && LAB_SENTENCE_CONNECTOR_RE.test(barePageWord(words[phraseConnector]?.text || ''))
    && isCommaStop(words[phraseConnector - 1]?.text || '')
  ) {
    end = phraseConnector
  }

  // Move a tiny sentence fragment such as “And God” as one unit. Never roll
  // back more than roughly one painted line: that was the source of the large
  // blank areas in the reported Genesis pages.
  let priorStop = -1
  for (let i = end - 2; i >= from; i--) {
    if (isClauseStop(words[i].text)) {
      priorStop = i
      break
    }
  }
  const fragmentStart = priorStop + 1
  const fragmentWords = end - fragmentStart
  const leadIndex = isLabVerseMarker(words[fragmentStart]?.text || '')
    ? fragmentStart + 1
    : fragmentStart
  const fragmentLead = barePageWord(words[leadIndex]?.text || '')
  const lexicalFragmentWords = end - leadIndex
  const trimmedTailHasSpeechCue = words
    .slice(end, to)
    .some(word => barePageWord(word.text).toLowerCase() === 'let')
  if (
    priorStop >= from
    && fragmentWords > 0
    && fragmentWords <= rollbackLimit
    && (lexicalFragmentWords <= 2 || (trimmedTailHasSpeechCue && lexicalFragmentWords <= 4))
    && LAB_SENTENCE_CONNECTOR_RE.test(fragmentLead)
  ) {
    end = fragmentStart
  }
  return end > from ? end : to
}

function lastStrongStopBefore(words: Array<{ text: string }>, index: number): number {
  for (let i = index - 1; i >= 0; i--) {
    if (isStrongStop(words[i].text)) return i
  }
  return -1
}

/** First word of the sentence containing `wordIndex` (for tap-to-hear). */
export function sentenceStartWordIndex(words: Array<{ text: string }>, wordIndex: number): number {
  const stop = lastStrongStopBefore(words, wordIndex)
  return stop < 0 ? 0 : stop + 1
}

function nextStrongStopAtOrAfter(words: Array<{ text: string }>, index: number): number {
  for (let i = Math.max(0, index); i < words.length; i++) {
    if (isStrongStop(words[i].text)) return i
  }
  return words.length - 1
}

/** When peeling overflow, prefer ending the page after a sentence boundary. */
export function snapShrinkEndToSentence(
  words: Array<{ text: string }>,
  from: number,
  to: number,
  proposedTo: number,
  maxRollbackWords = 8,
): number {
  if (proposedTo >= to || proposedTo <= from + 1) return proposedTo
  return polishPageEnd(words, from, proposedTo, maxRollbackWords)
}

/** When a page already fits but ends mid-sentence, pull the end back to the prior stop. */
export function snapPageEndToPriorSentence(
  words: Array<{ text: string }>,
  from: number,
  to: number,
  maxRollbackWords = 8,
): number {
  return polishPageEnd(words, from, to, maxRollbackWords)
}

export function pageEndsMidSentence(words: Array<{ text: string }>, from: number, to: number): boolean {
  if (to <= from) return false
  return !isStrongStop(words[to - 1].text)
}

/** Pull words from the next page when remeasure shows visible slack below the ink. */
export function growPaintedPageIfSlack(
  pages: ChapterHearingPage[],
  pageIndex: number,
  painted: LabPaintedOverflow,
  lastAdjust: LabPageAdjust | null,
  paragraphs?: string[],
): ChapterHearingPage[] {
  if (!labPageFitsPaint(painted)) return pages
  const slack = labPageSlackPx(painted.lastBottom, painted.chromeTop)
  const lineH = painted.lineHeight > 8 ? painted.lineHeight : 24
  if (!shouldGrowPaintedPage(lastAdjust, slack, lineH)) return pages
  const fromNext = wordsAvailableOnNextPage(pages, pageIndex)
  const page = pages[pageIndex]
  const tail = chapterPageTail(page)
  let paraTail = 0
  if (fromNext <= 0 && paragraphs && tail) {
    const len = tokenizeHearingWords(paragraphs[tail.paragraphIndex] || '').length
    paraTail = Math.max(0, len - tail.to)
  }
  if (fromNext <= 0 && paraTail <= 0) return pages
  const words = growWordsFromSlack(painted.lastLineWords, slack, lineH)
  if (fromNext > 0) {
    const grown = growPageByWords(pages, pageIndex, words)
    return sameChapterPages(grown, pages) ? pages : grown
  }
  const len = tokenizeHearingWords(paragraphs![tail!.paragraphIndex] || '').length
  const grown = growPageTailInParagraph(pages, pageIndex, words, len)
  return sameChapterPages(grown, pages) ? pages : grown
}

export const HEARING_PAGE_MIN = 70
export const HEARING_PAGE_MAX = 90
/** A leftover page this short is an orphan line, not a real page. */
export const LAB_ORPHAN_PAGE_WORDS = 16
/** Short same-paragraph chapter tail after peel — merge into the previous page. */
export const LAB_CHAPTER_TAIL_MERGE_WORDS = 120

export interface HearingPageBounds {
  from: number
  to: number
}

export interface LabPageLineBox {
  from: number
  to: number
}

/** Measured readable-page budget. Never a rem guess — height comes from chrome.top. */
export interface LabPageBudget {
  height: number
  width: number
  lineHeight: number
  headlineHeight?: number
  measureText: (text: string) => number
}

export function canUseLabPageBudget(budget: LabPageBudget | null | undefined): budget is LabPageBudget {
  if (!budget) return false
  return budget.height >= budget.lineHeight
    && budget.width > 40
    && budget.lineHeight > 8
}

/** Measured chrome metrics → wrap budget. avgCharWidth stands in for canvas measure. */
export function labPageBudgetFromMetrics(metrics: {
  height: number
  width: number
  lineHeight: number
  headlineHeight?: number
  avgCharWidth: number
}): LabPageBudget {
  const avg = Math.max(0.01, metrics.avgCharWidth)
  return {
    height: metrics.height,
    width: metrics.width,
    lineHeight: metrics.lineHeight,
    headlineHeight: metrics.headlineHeight,
    measureText: (text) => Math.max(1, text.length * avg),
  }
}

export function wrapWordsToLineBoxes(
  words: Array<{ text: string }>,
  width: number,
  measureText: (text: string) => number,
): LabPageLineBox[] {
  if (words.length === 0 || width <= 0) return []
  const lines: LabPageLineBox[] = []
  let from = 0
  let used = 0
  const space = Math.max(0, measureText(' '))
  for (let i = 0; i < words.length; i++) {
    const w = Math.max(1, measureText(words[i].text))
    const next = used === 0 ? w : used + space + w
    if (used > 0 && next > width) {
      lines.push({ from, to: i })
      from = i
      used = w
    } else {
      used = next
    }
  }
  if (from < words.length) lines.push({ from, to: words.length })
  return lines
}

/**
 * Pack wrapped lines into pages whose last line bottom is strictly above
 * the chrome top (pageHeight). One line is allowed if a single line is taller.
 */
export function paginateLineBoxes(
  lines: LabPageLineBox[],
  lineHeight: number,
  pageHeight: number,
  firstPageExtra = 0,
): HearingPageBounds[] {
  if (lines.length === 0 || lineHeight <= 0) return []
  const pages: HearingPageBounds[] = []
  const limit = pageHeight - Math.max(0, LAB_OVERFLOW_CLEAR_PX)
  let i = 0
  let pageIndex = 0
  while (i < lines.length) {
    const extra = pageIndex === 0 ? Math.max(0, firstPageExtra) : 0
    let take = 0
    while (i + take < lines.length) {
      const nextBottom = extra + (take + 1) * lineHeight
      if (take > 0 && nextBottom >= limit) break
      take += 1
    }
    if (take === 0) take = 1
    const slice = lines.slice(i, i + take)
    pages.push({ from: slice[0].from, to: slice[slice.length - 1].to })
    i += take
    pageIndex += 1
  }
  return pages
}

export function pageIndexForWord(pages: HearingPageBounds[], wordIndex: number): number {
  const index = pages.findIndex(page => wordIndex >= page.from && wordIndex < page.to)
  return index >= 0 ? index : Math.max(0, pages.length - 1)
}

function hearingPagesByWordCount(words: Array<{ text: string }>): HearingPageBounds[] {
  const pages: HearingPageBounds[] = []
  const n = words.length
  let i = 0
  while (i < n) {
    const from = i
    let to = i
    while (to < n) {
      const next = nextStrongStopAtOrAfter(words, to) + 1
      if (to > from && next - from > HEARING_PAGE_MAX) break
      to = next
      if (to - from >= HEARING_PAGE_MIN) {
        if (to >= n) break
        const peek = nextStrongStopAtOrAfter(words, to) + 1
        if (peek - from > HEARING_PAGE_MAX) break
        break
      }
    }
    if (to === from) to = Math.min(n, from + HEARING_PAGE_MAX)
    pages.push({ from, to })
    i = to
  }
  return absorbOrphanWordBounds(pages)
}

function hearingPagesForBudget(
  words: Array<{ text: string }>,
  budget: LabPageBudget,
  firstPageExtra = 0,
): HearingPageBounds[] {
  const lines = wrapWordsToLineBoxes(words, budget.width, budget.measureText)
  const pages = paginateLineBoxes(lines, budget.lineHeight, budget.height, firstPageExtra)
  if (pages.length > 0) return pages
  return words.length > 0 ? [{ from: 0, to: words.length }] : []
}

/** Height-fit when a measured budget exists; otherwise the 70–90 word fallback. */
export function hearingPages(
  words: Array<{ text: string }>,
  budget?: LabPageBudget | null,
  firstPageExtra = 0,
): HearingPageBounds[] {
  if (canUseLabPageBudget(budget)) {
    return hearingPagesForBudget(words, budget, firstPageExtra)
  }
  return hearingPagesByWordCount(words)
}

export function hearingPageForWord(pages: HearingPageBounds[], wordIndex: number): HearingPageBounds {
  for (const page of pages) {
    if (wordIndex >= page.from && wordIndex < page.to) return page
  }
  return pages[pages.length - 1] ?? { from: 0, to: 0 }
}

/** Unicode superscript digits used as inline verse markers in Bible editions. */
export const LAB_VERSE_MARKER_RE = /^[\u00B9\u00B2\u00B3\u2070-\u2079\u2080-\u2089⁰¹²³⁴⁵⁶⁷⁸⁹]+$/

export function isLabVerseMarker(text: string): boolean {
  return LAB_VERSE_MARKER_RE.test(text)
}

const LAB_SUPERSCRIPT_DIGIT: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
}

/** Unicode superscript verse tokens → plain digits for stable superscript styling. */
export function labVerseMarkerDisplay(text: string): string {
  if (!isLabVerseMarker(text)) return text
  return [...text].map(ch => LAB_SUPERSCRIPT_DIGIT[ch] ?? ch).join('')
}

export function tokenizeHearingWords(text: string): Array<{ text: string }> {
  return text.split(/\s+/).map(part => part.trim()).filter(Boolean).map(word => ({ text: word }))
}

export interface LabChapterProgress {
  percent: number
  currentPage: number
  totalPages: number
  wordsRead: number
  wordsTotal: number
}

function chapterWordCount(paragraphs: string[]): number {
  return paragraphs.reduce((sum, text) => sum + tokenizeHearingWords(text).length, 0)
}

function wordsBeforePlace(paragraphs: string[], paragraphIndex: number, wordIndex: number): number {
  let read = 0
  for (let i = 0; i < paragraphs.length; i++) {
    const words = tokenizeHearingWords(paragraphs[i])
    if (i < paragraphIndex) read += words.length
    else if (i === paragraphIndex) read += Math.max(0, Math.min(wordIndex, words.length))
  }
  return read
}

/**
 * Percent of THIS CHAPTER (Book 1 pages / words).
 * Layout knobs can switch the printed strip; PAGE of CHAPTER stays the live default.
 */
export function labChapterProgress(input: {
  paragraphs: string[]
  pages: ChapterHearingPage[]
  pageIndex: number
  paragraphIndex?: number
  wordIndex?: number
}): LabChapterProgress {
  const wordsTotal = chapterWordCount(input.paragraphs)
  const pages = input.pages
  const { currentPage, totalPages } = chapterPageLabel(pages, input.pageIndex)
  const pageIndex = Math.max(0, Math.min(input.pageIndex, totalPages - 1))
  const page = pages[pageIndex]
  const wordsRead = typeof input.paragraphIndex === 'number' && typeof input.wordIndex === 'number'
    ? wordsBeforePlace(input.paragraphs, input.paragraphIndex, input.wordIndex)
    : page
      ? (() => {
          const tail = chapterPageTail(page)
          return tail ? wordsBeforePlace(input.paragraphs, tail.paragraphIndex, tail.to) : 0
        })()
      : 0
  const percent = wordsTotal > 0 ? Math.round((wordsRead / wordsTotal) * 100) : 0
  return {
    percent: Math.max(0, Math.min(100, percent)),
    currentPage,
    totalPages,
    wordsRead,
    wordsTotal,
  }
}

/** N and M come from the same page list. i is 1-based and never > M. */
export function chapterPageLabel(pages: ChapterHearingPage[], pageIndex: number): {
  currentPage: number
  totalPages: number
} {
  const totalPages = Math.max(1, pages.length)
  const currentPage = pages.length === 0 ? 1 : Math.max(1, Math.min(pageIndex + 1, totalPages))
  return { currentPage, totalPages }
}

export interface ChapterHearingPage {
  paragraphIndex: number
  from: number
  to: number
  /** Additional contiguous paragraph slices painted on the same visual page. */
  segments?: ChapterPageSegment[]
}

export interface ChapterPageSegment {
  paragraphIndex: number
  from: number
  to: number
}

export function chapterPageSegments(page: ChapterHearingPage | undefined): ChapterPageSegment[] {
  if (!page) return []
  if (page.segments && page.segments.length > 0) return page.segments
  return [{ paragraphIndex: page.paragraphIndex, from: page.from, to: page.to }]
}

function pageFromSegments(segments: ChapterPageSegment[]): ChapterHearingPage | null {
  const clean = segments.filter(segment => segment.to > segment.from)
  const first = clean[0]
  if (!first) return null
  return {
    ...first,
    segments: clean.length > 1 ? clean : undefined,
  }
}

export function chapterPageTail(page: ChapterHearingPage | undefined): ChapterPageSegment | null {
  const segments = chapterPageSegments(page)
  return segments[segments.length - 1] ?? null
}

export interface LabPageAnchor {
  paragraphIndex: number
  wordIndex: number
}

export function pageAnchorOf(page: ChapterHearingPage | undefined): LabPageAnchor | null {
  if (!page) return null
  return { paragraphIndex: page.paragraphIndex, wordIndex: page.from }
}

/** During settle, draft can run ahead of reading — nav must use the same list. */
export function labNavPageList(
  stable: boolean,
  working: ChapterHearingPage[],
  reading: ChapterHearingPage[],
): ChapterHearingPage[] {
  if (stable) return reading
  if (working.length > reading.length) return working
  return reading.length > 0 ? reading : working
}

/** Page turns are exactly ±1. Null at the chapter edge (do not hop). */
export function adjacentPageIndex(pageCount: number, current: number, delta: -1 | 1): number | null {
  const next = current + delta
  if (next < 0 || next >= pageCount) return null
  return next
}

export function restorePageIndexForAnchor(
  pages: ChapterHearingPage[],
  anchor: LabPageAnchor,
): number {
  const exact = pages.findIndex(page => (
    page.paragraphIndex === anchor.paragraphIndex && page.from === anchor.wordIndex
  ))
  if (exact >= 0) return exact
  return pageIndexForPlace(pages, anchor.paragraphIndex, anchor.wordIndex)
}

/**
 * If shrink/absorb merged the anchored page into a neighbor, split it back.
 * Prev/next then still land on the same page identity.
 */
export function ensurePageIdentity(
  pages: ChapterHearingPage[],
  anchor: LabPageAnchor,
): ChapterHearingPage[] {
  const exact = pages.findIndex(page => (
    page.paragraphIndex === anchor.paragraphIndex && page.from === anchor.wordIndex
  ))
  if (exact >= 0) return pages
  const idx = pageIndexForPlace(pages, anchor.paragraphIndex, anchor.wordIndex)
  const page = pages[idx]
  if (!page || page.paragraphIndex !== anchor.paragraphIndex) return pages
  if (anchor.wordIndex <= page.from || anchor.wordIndex >= page.to) return pages
  const next = pages.slice()
  next[idx] = { ...page, to: anchor.wordIndex }
  next.splice(idx + 1, 0, {
    paragraphIndex: page.paragraphIndex,
    from: anchor.wordIndex,
    to: page.to,
  })
  return next
}


export interface PaintShrinkOpts {
  /** Last painted line's word count — a leftover shorter than this is a widow. */
  lastLineWords?: number
  /** Overflowing paint: peel even a one-word last line and allow M to grow. */
  overflowing?: boolean
}

/** Move leftover words of a too-tall painted page onto the next page. */
export function applyPaintShrink(
  pages: ChapterHearingPage[],
  pageIndex: number,
  newTo: number,
  opts?: PaintShrinkOpts,
): ChapterHearingPage[] {
  const page = pages[pageIndex]
  if (!page || newTo >= page.to || newTo < page.from + 1) return pages
  const leftover = page.to - newTo
  const lastLineWords = opts?.lastLineWords ?? 0
  const overflowing = !!opts?.overflowing
  // One leftover word, or a widow shorter than a line: keep it — unless the page overflows.
  if (!overflowing) {
    if (leftover <= 1) return pages
    if (lastLineWords > 1 && leftover < lastLineWords) return pages
  }
  const after = pages[pageIndex + 1]
  const next = pages.slice()
  next[pageIndex] = { ...page, to: newTo }
  if (after && after.paragraphIndex === page.paragraphIndex) {
    next[pageIndex + 1] = { ...after, from: newTo }
    if (next[pageIndex + 1].to <= newTo) {
      next.splice(pageIndex + 1, 1)
    }
  } else {
    next.splice(pageIndex + 1, 0, {
      paragraphIndex: page.paragraphIndex,
      from: newTo,
      to: page.to,
    })
  }
  for (let i = 0; i < next.length - 1; i++) {
    if (next[i].paragraphIndex !== next[i + 1].paragraphIndex) continue
    if (next[i + 1].from !== next[i].to) {
      next[i + 1] = { ...next[i + 1], from: next[i].to }
    }
    if (next[i + 1].to <= next[i + 1].from) {
      next.splice(i + 1, 1)
      i -= 1
    }
  }
  // Overflow peel must keep a one-word leftover off this page.
  return overflowing ? next : absorbOneWordLeftoverPages(next)
}

/**
 * Cut an overflowing page, then paginate the REST of the chapter as a
 * complete set. M is that set — never a frozen underestimate.
 */
export function reflowAfterCut(
  paragraphs: string[],
  pages: ChapterHearingPage[],
  pageIndex: number,
  newTo: number,
  budget?: LabPageBudget | null,
  opts?: PaintShrinkOpts,
): ChapterHearingPage[] {
  const page = pages[pageIndex]
  if (!page || newTo >= page.to || newTo < page.from + 1) return pages
  const leftoverCount = page.to - newTo
  const lastLineWords = opts?.lastLineWords ?? 0
  const overflowing = !!opts?.overflowing
  if (!overflowing) {
    if (leftoverCount <= 1) return pages
    if (lastLineWords > 1 && leftoverCount < lastLineWords) return pages
  }
  const head: ChapterHearingPage[] = [
    ...pages.slice(0, pageIndex),
    { paragraphIndex: page.paragraphIndex, from: page.from, to: newTo },
  ]
  const words = tokenizeHearingWords(paragraphs[page.paragraphIndex] || '')
  const leftoverText = words.slice(newTo).map(word => word.text).join(' ')
  const rest: string[] = []
  if (leftoverText) rest.push(leftoverText)
  for (let i = page.paragraphIndex + 1; i < paragraphs.length; i++) rest.push(paragraphs[i])
  const tailRaw = chapterHearingPages(rest, budget)
  const firstIsLeftover = leftoverText.length > 0
  const tail = tailRaw.map(part => {
    if (firstIsLeftover && part.paragraphIndex === 0) {
      return {
        paragraphIndex: page.paragraphIndex,
        from: part.from + newTo,
        to: part.to + newTo,
      }
    }
    const orig = firstIsLeftover
      ? page.paragraphIndex + part.paragraphIndex
      : page.paragraphIndex + 1 + part.paragraphIndex
    return { paragraphIndex: orig, from: part.from, to: part.to }
  })
  const next = [...head, ...tail]
  return overflowing ? next : absorbOneWordLeftoverPages(next)
}

/** True when two chapter page lists have the same bounds. */
/** Pull words from the next page into the current one when remeasure finds slack. */
export function growPageByWords(
  pages: ChapterHearingPage[],
  pageIndex: number,
  wordCount: number,
): ChapterHearingPage[] {
  if (wordCount <= 0 || pageIndex < 0 || pageIndex >= pages.length - 1) return pages
  const page = pages[pageIndex]
  const next = pages[pageIndex + 1]
  if (!page || !next) return pages

  const currentSegments = chapterPageSegments(page)
  const nextSegments = chapterPageSegments(next)
  const head = nextSegments[0]
  const tail = currentSegments[currentSegments.length - 1]
  if (!head || !tail) return pages
  const available = head.to - head.from
  const take = Math.min(wordCount, available)
  if (take <= 0) return pages

  const pulled = { ...head, to: head.from + take }
  const grownSegments = currentSegments.slice()
  if (tail.paragraphIndex === pulled.paragraphIndex && tail.to === pulled.from) {
    grownSegments[grownSegments.length - 1] = { ...tail, to: pulled.to }
  } else {
    grownSegments.push(pulled)
  }
  const grownPage = pageFromSegments(grownSegments)
  if (!grownPage) return pages

  const remainderSegments = nextSegments.slice()
  if (pulled.to >= head.to) remainderSegments.shift()
  else remainderSegments[0] = { ...head, from: pulled.to }
  const remainder = pageFromSegments(remainderSegments)
  const grown = pages.slice()
  grown[pageIndex] = grownPage
  if (remainder) grown[pageIndex + 1] = remainder
  else grown.splice(pageIndex + 1, 1)
  return grown
}

/** Move the end of a multi-paragraph visual page back onto the following page. */
export function cutPageTailTo(
  pages: ChapterHearingPage[],
  pageIndex: number,
  newTo: number,
): ChapterHearingPage[] {
  const page = pages[pageIndex]
  const segments = chapterPageSegments(page)
  const tail = segments[segments.length - 1]
  if (!page || !tail || newTo < tail.from || newTo >= tail.to) return pages

  const keptSegments = segments.slice()
  if (newTo === tail.from) keptSegments.pop()
  else keptSegments[keptSegments.length - 1] = { ...tail, to: newTo }
  const kept = pageFromSegments(keptSegments)
  if (!kept) return pages

  const moved: ChapterPageSegment = { ...tail, from: newTo }
  const following = chapterPageSegments(pages[pageIndex + 1])
  if (
    following[0]
    && following[0].paragraphIndex === moved.paragraphIndex
    && following[0].from === moved.to
  ) {
    following[0] = { ...following[0], from: moved.from }
  } else {
    following.unshift(moved)
  }
  const nextPage = pageFromSegments(following)
  const next = pages.slice()
  next[pageIndex] = kept
  if (nextPage) next[pageIndex + 1] = nextPage
  else next.splice(pageIndex + 1, 0, moved)
  return next
}

/** Extend a page into unused words at the end of its paragraph (last page of chapter). */
export function growPageTailInParagraph(
  pages: ChapterHearingPage[],
  pageIndex: number,
  wordCount: number,
  paragraphLength: number,
): ChapterHearingPage[] {
  const page = pages[pageIndex]
  const segments = chapterPageSegments(page)
  const tail = segments[segments.length - 1]
  if (!page || !tail || wordCount <= 0 || paragraphLength <= tail.to) return pages
  const take = Math.min(wordCount, paragraphLength - tail.to)
  if (take <= 0) return pages
  const next = pages.slice()
  segments[segments.length - 1] = { ...tail, to: tail.to + take }
  next[pageIndex] = pageFromSegments(segments) ?? page
  return next
}

export function wordsAvailableOnNextPage(pages: ChapterHearingPage[], pageIndex: number): number {
  const next = pages[pageIndex + 1]
  const head = chapterPageSegments(next)[0]
  return head ? Math.max(0, head.to - head.from) : 0
}

export function sameChapterPages(a: ChapterHearingPage[], b: ChapterHearingPage[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  return a.every((page, pageIndex) => {
    const left = chapterPageSegments(page)
    const right = chapterPageSegments(b[pageIndex])
    return left.length === right.length && left.every((segment, segmentIndex) => (
      segment.paragraphIndex === right[segmentIndex]?.paragraphIndex
      && segment.from === right[segmentIndex]?.from
      && segment.to === right[segmentIndex]?.to
    ))
  })
}

/** N and M come from the same page list. Never report N > M. */
export function clampedChapterProgress(progress: LabChapterProgress): LabChapterProgress {
  const totalPages = Math.max(1, progress.totalPages)
  const currentPage = Math.max(1, Math.min(progress.currentPage, totalPages))
  return { ...progress, currentPage, totalPages }
}

function absorbOrphanWordBounds(pages: HearingPageBounds[]): HearingPageBounds[] {
  if (pages.length < 2) return pages
  const last = pages[pages.length - 1]
  if (last.to - last.from > LAB_ORPHAN_PAGE_WORDS || last.to - last.from <= 0) return pages
  const prev = pages[pages.length - 2]
  return [...pages.slice(0, -2), { from: prev.from, to: last.to }]
}

export function leftoverWordCount(page: ChapterHearingPage | undefined): number {
  return chapterPageSegments(page)
    .reduce((sum, segment) => sum + Math.max(0, segment.to - segment.from), 0)
}

export function isOrphanLeftoverPage(page: ChapterHearingPage | undefined): boolean {
  const words = leftoverWordCount(page)
  return words > 0 && words <= LAB_ORPHAN_PAGE_WORDS
}

export function isOneWordLeftoverPage(page: ChapterHearingPage | undefined): boolean {
  return leftoverWordCount(page) === 1
}

/** Absorb a lone leftover word into the previous page of the same paragraph. */
export function absorbOneWordLeftoverPages(
  pages: ChapterHearingPage[],
  keep?: LabPageAnchor | null,
): ChapterHearingPage[] {
  let next = pages
  for (let i = next.length - 1; i > 0; i--) {
    const leftover = next[i]
    if (keep && leftover.paragraphIndex === keep.paragraphIndex && leftover.from === keep.wordIndex) {
      continue
    }
    if (!isOneWordLeftoverPage(leftover)) continue
    const prev = next[i - 1]
    if (!prev || prev.paragraphIndex !== leftover.paragraphIndex) continue
    const merged = next.slice()
    merged[i - 1] = { ...prev, to: leftover.to }
    merged.splice(i, 1)
    next = merged
  }
  return next
}

/** Merge an orphan leftover page into the previous page of the same paragraph. */
export function applyPaintAbsorb(
  pages: ChapterHearingPage[],
  leftoverIndex: number,
): ChapterHearingPage[] {
  const leftover = pages[leftoverIndex]
  const prev = pages[leftoverIndex - 1]
  if (!leftover || !prev || leftoverIndex <= 0) return pages
  if (prev.paragraphIndex !== leftover.paragraphIndex) return pages
  if (!isOrphanLeftoverPage(leftover)) return pages
  const next = pages.slice()
  next[leftoverIndex - 1] = { ...prev, to: leftover.to }
  next.splice(leftoverIndex, 1)
  return next
}

/**
 * Collapse nearly-empty leftover pages into the previous page.
 * Never eats a full page, and never creates a page-1 verse-mark collapse
 * (that leftover is the rest of the paragraph, not an orphan line).
 */
export function absorbOrphanLeftoverPages(
  pages: ChapterHearingPage[],
  keep?: LabPageAnchor | null,
): ChapterHearingPage[] {
  let next = pages
  for (let i = next.length - 1; i > 0; i--) {
    const leftover = next[i]
    if (keep && leftover.paragraphIndex === keep.paragraphIndex && leftover.from === keep.wordIndex) {
      continue
    }
    const absorbed = applyPaintAbsorb(next, i)
    if (absorbed !== next) next = absorbed
  }
  return next
}

/**
 * Merge a short final page into the previous page of the same paragraph.
 * Peel often leaves a tiny chapter tail that cannot grow (no next page).
 */
export function absorbChapterTailPages(
  pages: ChapterHearingPage[],
  keep?: LabPageAnchor | null,
): ChapterHearingPage[] {
  if (pages.length < 2) return pages
  const lastIdx = pages.length - 1
  const last = pages[lastIdx]
  const prev = pages[lastIdx - 1]
  if (!last || !prev || prev.paragraphIndex !== last.paragraphIndex) return pages
  if (keep && last.paragraphIndex === keep.paragraphIndex && last.from === keep.wordIndex) return pages
  const words = leftoverWordCount(last)
  if (words <= 0 || words > LAB_CHAPTER_TAIL_MERGE_WORDS) return pages
  const next = pages.slice()
  next[lastIdx - 1] = { ...prev, to: last.to }
  next.splice(lastIdx, 1)
  return next
}

/** Whether the follow target sits on the page at pageIndex. */
export function followOnReadingPage(
  follow: { kind: string; paragraphIndex?: number; wordIndex?: number },
  pages: ChapterHearingPage[],
  pageIndex: number,
): boolean {
  if (follow.kind === 'none') return true
  const page = pages[pageIndex]
  if (!page) return false
  const segments = chapterPageSegments(page)
  if (follow.kind === 'paragraph') {
    return segments.some(segment => segment.paragraphIndex === follow.paragraphIndex)
  }
  if (follow.kind === 'word') {
    return typeof follow.wordIndex === 'number' && segments.some(segment => (
      segment.paragraphIndex === follow.paragraphIndex
      && follow.wordIndex! >= segment.from
      && follow.wordIndex! < segment.to
    ))
  }
  return false
}

export function pageIndexForPlace(
  pages: ChapterHearingPage[],
  paragraphIndex: number,
  wordIndex: number,
): number {
  if (pages.length === 0) return 0
  const exact = pages.findIndex(page => chapterPageSegments(page).some(segment => (
    segment.paragraphIndex === paragraphIndex && wordIndex >= segment.from && wordIndex < segment.to
  )))
  if (exact >= 0) return exact
  const nextOnParagraph = pages.findIndex(page => (
    page.paragraphIndex === paragraphIndex && page.from > wordIndex
  ))
  if (nextOnParagraph > 0) return nextOnParagraph - 1
  let lastSame = -1
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].paragraphIndex === paragraphIndex) lastSame = i
  }
  if (lastSame >= 0) return lastSame
  const nextParagraph = pages.findIndex(page => page.paragraphIndex > paragraphIndex)
  if (nextParagraph >= 0) return nextParagraph
  return pages.length - 1
}

/** Same pages Hearing uses, flattened across the chapter for Reading. */
/** True when every paragraph is covered, in order, with no gaps or N/M holes. */
export function chapterPagesCover(paragraphs: string[], pages: ChapterHearingPage[]): boolean {
  for (let i = 0; i < paragraphs.length; i++) {
    const n = tokenizeHearingWords(paragraphs[i]).length
    if (n === 0) continue
    const parts = pages.flatMap(page => chapterPageSegments(page)).filter(part => part.paragraphIndex === i)
    if (parts.length === 0 || parts[0].from !== 0 || parts[parts.length - 1].to !== n) return false
    for (let j = 0; j < parts.length - 1; j++) {
      if (parts[j].to !== parts[j + 1].from) return false
    }
  }
  return pages.length === 0 ? paragraphs.every(text => tokenizeHearingWords(text).length === 0) : true
}

export function chapterHearingPages(
  paragraphs: string[],
  budget?: LabPageBudget | null,
): ChapterHearingPage[] {
  const pages: ChapterHearingPage[] = []
  paragraphs.forEach((text, paragraphIndex) => {
    const words = tokenizeHearingWords(text)
    if (words.length === 0) return
    const extra = paragraphIndex === 0 ? (budget?.headlineHeight ?? 0) : 0
    for (const part of hearingPages(words, budget, extra)) {
      if (part.to > part.from) pages.push({ paragraphIndex, from: part.from, to: part.to })
    }
  })
  return absorbOneWordLeftoverPages(pages)
}

export function readingPageLines(paragraphs: string[], page: ChapterHearingPage | undefined): HearingLine[] {
  if (!page) return []
  return chapterPageSegments(page).map(segment => {
    const words = tokenizeHearingWords(paragraphs[segment.paragraphIndex] || '')
    return {
      paragraphIndex: segment.paragraphIndex,
      from: segment.from,
      words: words.slice(segment.from, segment.to).map(word => ({ text: word.text, role: 'line' as const })),
    }
  })
}

/** Paint narration progress over the exact slices used by the reading page. */
export function hearingReadingPageLines(
  paragraphs: string[],
  page: ChapterHearingPage | undefined,
  follow: FollowTarget,
): HearingLine[] {
  if (!page) return []
  return chapterPageSegments(page).map(segment => {
    const words = tokenizeHearingWords(paragraphs[segment.paragraphIndex] || '')
    return {
      paragraphIndex: segment.paragraphIndex,
      from: segment.from,
      words: words.slice(segment.from, segment.to).map((word, offset) => {
        const wordIndex = segment.from + offset
        let role: HearingWordRole = 'line'
        if (follow.kind === 'word') {
          if (segment.paragraphIndex < follow.paragraphIndex) role = 'spoken'
          else if (segment.paragraphIndex > follow.paragraphIndex) role = 'upcoming'
          else role = wordRole(wordIndex, follow.wordIndex)
        }
        return { text: word.text, role, wordIndex }
      }),
    }
  })
}

/** Word highlight / dim / bold follow only while Hearing is actually playing. */
export function hearingFollowPaintActive(
  mode: 'reading' | 'hearing',
  playing: boolean,
  follow: FollowTarget,
): boolean {
  return mode === 'hearing' && playing && follow.kind !== 'none'
}


export function isChapterFirstReadingPage(page: ChapterHearingPage | undefined): boolean {
  return !!page && page.paragraphIndex === 0 && page.from === 0
}

/** Headline only on the first hearing page of the chapter. */
export function isChapterFirstHearingPage(
  paragraph: FollowParagraph | undefined,
  follow: FollowTarget,
  chapterPages?: ChapterHearingPage[],
): boolean {
  if (!paragraph || paragraph.index !== 0) return false
  if (follow.kind === 'word' && paragraph.words && paragraph.words.length > 0) {
    const current = Math.max(0, Math.min(follow.wordIndex, paragraph.words.length - 1))
    const local = chapterPages
      ?.filter(page => page.paragraphIndex === 0)
      .map(page => ({ from: page.from, to: page.to }))
    const page = hearingPageForWord(local && local.length > 0 ? local : hearingPages(paragraph.words), current)
    return page.from === 0
  }
  return true
}

/**
 * Hearing stage: one stable page of the paragraph.
 * The word list stays put until current is past the last word on the page.
 */
export function hearingStageLines(
  paragraph: FollowParagraph | undefined,
  follow: FollowTarget,
  chapterPages?: ChapterHearingPage[],
): HearingLine[] {
  if (!paragraph) return []

  if (follow.kind === 'word' && paragraph.words && paragraph.words.length > 0) {
    const words = paragraph.words
    const current = Math.max(0, Math.min(follow.wordIndex, words.length - 1))
    const local = chapterPages
      ?.flatMap(page => chapterPageSegments(page))
      .filter(segment => segment.paragraphIndex === paragraph.index)
      .map(segment => ({ from: segment.from, to: segment.to }))
    const page = hearingPageForWord(local && local.length > 0 ? local : hearingPages(words), current)
    return [{
      words: words.slice(page.from, page.to).map((word, offset) => ({
        text: word.text,
        role: wordRole(page.from + offset, current),
        wordIndex: page.from + offset,
      })),
    }]
  }

  const sentences = splitDisplaySentences(paragraph.text)
  const text = sentences.join(' ')
  return [{
    words: [{ text, role: 'line' as const }],
  }]
}

export function hearingProgress(
  clips: Array<{ duration?: number }>,
  clipIndex: number,
  currentTime: number,
): HearingProgress | null {
  if (clips.length === 0) return null
  const durations = clips.map(clip => clip.duration)
  if (durations.some(duration => duration == null || duration <= 0)) return null
  const total = durations.reduce((sum, duration) => sum + (duration || 0), 0)
  const before = durations.slice(0, clipIndex).reduce((sum, duration) => sum + (duration || 0), 0)
  return {
    current: Math.max(0, Math.min(total, before + Math.max(0, currentTime))),
    total,
  }
}

export type SeekClip = {
  duration?: number
  words?: Array<{ end: number }>
}

/** Clip length from manifest duration, else last word end, else a known live duration. */
export function clipPlayDuration(clip: SeekClip | undefined, known?: number): number | undefined {
  if (clip && typeof clip.duration === 'number' && clip.duration > 0) return clip.duration
  const last = clip?.words?.[clip.words.length - 1]?.end
  if (typeof last === 'number' && last > 0) return last
  if (typeof known === 'number' && known > 0) return known
  return undefined
}

/**
 * Prefer the live element time when it is actually advancing.
 * A 0-read on the element must not wipe a known mid-clip time — that is why
 * −15 was snapping to clip 0 / word 0 mid-book.
 */
export function playbackTimeSeconds(audioTime: number, knownTime: number): number {
  const audio = Number.isFinite(audioTime) ? audioTime : 0
  const known = Number.isFinite(knownTime) ? knownTime : 0
  if (audio > 0) return audio
  if (known > 0) return known
  return 0
}

export function seekAcrossClips(input: {
  clips: Array<SeekClip>
  clipIndex: number
  currentTime: number
  deltaSeconds: number
  knownDuration?: number
}): HearingSeekPoint {
  const clips = input.clips
  if (clips.length === 0) return { clipIndex: 0, offsetSeconds: 0 }

  let index = Math.max(0, Math.min(input.clipIndex, clips.length - 1))
  let time = input.currentTime + input.deltaSeconds

  if (input.deltaSeconds < 0) {
    while (time < 0 && index > 0) {
      const fromIndex = index
      index -= 1
      const duration = clipPlayDuration(
        clips[index],
        fromIndex === input.clipIndex ? input.knownDuration : undefined,
      )
      if (duration == null) {
        // Cannot measure the previous clip. Stay at the start of the clip we
        // were in — never walk to clip 0 / offset 0 just because duration is missing.
        return { clipIndex: fromIndex, offsetSeconds: 0 }
      }
      time += duration
    }
    return { clipIndex: index, offsetSeconds: Math.max(0, time) }
  }

  while (index < clips.length) {
    const duration = clipPlayDuration(
      clips[index],
      index === input.clipIndex ? input.knownDuration : undefined,
    )
    if (duration == null || duration <= 0) {
      return { clipIndex: index, offsetSeconds: Math.max(0, time) }
    }
    if (time < duration) {
      return { clipIndex: index, offsetSeconds: time }
    }
    if (index === clips.length - 1) {
      return { clipIndex: index, offsetSeconds: duration }
    }
    time -= duration
    index += 1
  }

  return { clipIndex: clips.length - 1, offsetSeconds: 0 }
}

export function labProgressLabel(
  progress: LabChapterProgress,
  chapterNumber = 1,
  chapterLabel?: string,
): string {
  const chapter = (chapterLabel || '').trim() || `Chapter ${chapterNumber}`
  return `${chapter} — ${progress.currentPage} / ${progress.totalPages}`
}

export const LAB_HEARING_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

export function parseHearingSpeed(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isFinite(n)) return null
  return (LAB_HEARING_SPEEDS as readonly number[]).includes(n) ? n : null
}

export function nextHearingSpeed(current: number): number {
  const idx = LAB_HEARING_SPEEDS.indexOf(current as typeof LAB_HEARING_SPEEDS[number])
  return LAB_HEARING_SPEEDS[(idx + 1) % LAB_HEARING_SPEEDS.length]
}
