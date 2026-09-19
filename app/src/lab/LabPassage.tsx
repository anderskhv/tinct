import { useTextRangeHighlights } from './useTextRangeHighlights'
import { comparisonSegment } from './LabDesktopPaginator'
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { LAB_COPY } from './labCopy'
import {
  buildHighlightRange,
  highlightColorAt,
  labHighlightGapCssClass,
  labHighlightCssClass,
  wordInHighlightRange,
  type LabHighlight,
  type LabHighlightRange,
  type LabWordPlace,
} from './labHighlights'
import { hearingFollowPaintActive, hearingReadingPageLines, hearingStageLines, isChapterFirstHearingPage, isChapterFirstReadingPage, isLabVerseMarker, labVerseMarkerDisplay, readingPageLines, tokenizeHearingWords } from './labHearing'
import type { ChapterHearingPage } from './labHearing'
import { followGranularity, followWordRole, type FollowParagraph, type FollowTarget } from './labFollow'
import { verseLineRanges } from './labVerseLines'
import { labSwipeCompareSwap, labSwipePageDirection, labTapPageDirection, labTapTurnAllowed, type LabPageTurnDirection, type LabTapTurnZones } from './labChrome'

/** Drag-to-select page turns: the strip at the top and bottom of the page
 *  that turns it, and how long the finger rests there first. 24px / 700ms
 *  was hard to reach on a full-width line (2026-09-19 phone QA). */
export const LAB_EDGE_ZONE_PX = 32
export const LAB_EDGE_HOLD_MS = 450

export type LabPassageMode = 'reading' | 'hearing'

interface LabPassageProps {
  pendingLayout?: boolean
  chapterEnd?: ReactNode
  chapterEndPage?: boolean
  onChapterEndFit?: (fits: boolean) => void
  desktopSpread?: boolean
  nextReadingPage?: ChapterHearingPage
  alignCompare?: boolean
  chapterTitle: string
  paragraphs: string[]
  compareParagraphs: string[]
  compare: boolean
  mode: LabPassageMode
  follow: FollowTarget
  followParagraphs: FollowParagraph[]
  clips?: Array<{ duration?: number }>
  playing?: boolean
  clipIndex?: number
  currentTime?: number
  speed?: number
  onTogglePlay?: () => void
  onSeek?: (deltaSeconds: number) => void
  onCycleSpeed?: () => void
  hideTransport?: boolean
  markedIndexes: Set<number>
  onMark?: (index: number) => void
  focusParagraph?: number | null
  /** The paragraph a voice conversation is about: tinted on the page. */
  discussedParagraph?: number | null
  dimmed?: boolean
  peek?: boolean
  readingPage?: ChapterHearingPage
  chapterPages?: ChapterHearingPage[]
  keyboardSelection?: boolean
  compareHighlights?: LabHighlight[]
  selectingComparison?: boolean
  highlights?: LabHighlight[]
  chapterNumber?: number
  selectingRange?: LabHighlightRange | null
  onSelectRange?: (range: LabHighlightRange, clientX: number, clientY: number, side?: 'compare', intent?: 'lookup') => void
  browseWhileListening?: boolean
  inlineHearingPaint?: boolean
  onSeekToWord?: (paragraphIndex: number, wordIndex: number) => void
  pageTurn?: { direction: 'next' | 'previous'; nonce: number } | null
  onPageTurn?: (direction: LabPageTurnDirection) => void
  onSelectionPageTurn?: (direction: LabPageTurnDirection) => void
  /** The range under the finger while a selection is being made, null when it ends. */
  onSelectingChange?: (range: LabHighlightRange | null) => void
  /**
   * Which pointers may turn the page by tapping the outer thirds. Set by the
   * pointer, never by the window width: 'none' where a mouse has visible
   * previous/next buttons instead, 'touch' on a machine that has both.
   */
  tapZones?: LabTapTurnZones
  /** Compare's whole-page swap. A vertical swipe, and nothing that says so. */
  onCompareSwap?: () => void
  onToggleControls?: () => void
  /**
   * Identity of the reader typography (font, size, alignment, spacing,
   * margins). Those arrive as root CSS variables rather than props; the
   * continued-tail measurement re-runs when this key changes.
   */
  layoutKey?: string
}

function wordSpacing(
  word: { text: string },
  wordIndex: number,
  previous?: { text: string },
): string {
  if (wordIndex <= 0 || word.text.startsWith("'") || word.text.startsWith(',') || word.text.startsWith('.')) return ''
  // After a verse marker the separator belongs to THIS word, not to the marker:
  // it is then inside the word's painted span, so a highlight that starts here
  // has no unpainted notch between the number and the first word. Non-breaking,
  // so the marker and its word still never split across a line.
  return previous && isLabVerseMarker(previous.text) ? '\u00a0' : ' '
}

function renderWordText(text: string, emphasis = false) {
  const content = isLabVerseMarker(text) ? (
    <span className="lab-verse-mark">{labVerseMarkerDisplay(text)}</span>
  ) : text
  return emphasis ? <em>{content}</em> : content
}

/**
 * Where a paragraph is lineated verse, `lineation` gives the paragraph's text
 * and the paragraph-local index of this slice's first word, and the words are
 * wrapped in one block per verse line. Passing nothing -- or a paragraph with
 * no recovered lineation, which is every paragraph of every other book --
 * returns exactly the markup this has always produced.
 */
export function renderWordGroups<T extends { text: string }>(
  words: T[],
  renderWord: (word: T, wordIndex: number, spacing: string) => ReactNode,
  lineation?: { text?: string; from: number },
  renderSpacing?: (spacing: string, wordIndex: number) => ReactNode,
): ReactNode[] {
  const rendered: Array<{ at: number; node: ReactNode }> = []
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex]
    if (isLabVerseMarker(word.text) && words[wordIndex + 1]) {
      const spacing = wordSpacing(word, wordIndex, words[wordIndex - 1])
      rendered.push({
        at: wordIndex,
        node: (
          <Fragment key={`verse-${wordIndex}`}>
            {renderSpacing ? renderSpacing(spacing, wordIndex) : spacing}
            <span className="lab-verse-unit">
              {renderWord(word, wordIndex, "")}
              {renderWord(words[wordIndex + 1], wordIndex + 1, wordSpacing(words[wordIndex + 1], wordIndex + 1, word))}
            </span>
          </Fragment>
        ),
      })
      wordIndex += 1
    } else {
      const spacing = wordSpacing(word, wordIndex, words[wordIndex - 1])
      rendered.push({
        at: wordIndex,
        node: (
          <Fragment key={`word-${wordIndex}`}>
            {renderSpacing ? renderSpacing(spacing, wordIndex) : spacing}
            {renderWord(word, wordIndex, "")}
          </Fragment>
        ),
      })
    }
  }
  // As in labMeasureParagraph: a trailing display fragment is not a word, so
  // it must not extend the verse-line ranges by one.
  const ownedCount = words.filter(word => !(word as { fragment?: boolean }).fragment).length
  const ranges = lineation
    ? verseLineRanges(lineation.text, lineation.from, lineation.from + ownedCount)
    : null
  if (!ranges) return rendered.map(item => item.node)
  const base = lineation!.from
  return ranges.map(([start, end], index) => (
    <span className="lab-verse-line" key={`verse-line-${index}`}>
      {rendered.filter(item => base + item.at >= start && base + item.at < end).map(item => item.node)}
    </span>
  ))
}

/**
 * Wrap an already-rendered, one-node-per-word run in one block per verse line.
 *
 * The Compare column paints its own word spans -- deliberately, since cloning
 * the reading column's verse-unit markup would change Bible line breaks -- so
 * it groups the finished nodes rather than routing through renderWordGroups.
 * Returns the nodes untouched for prose.
 */
function asVerseLines(text: string | undefined, from: number, nodes: ReactNode[]): ReactNode[] {
  const ranges = verseLineRanges(text, from, from + nodes.length)
  if (!ranges) return nodes
  return ranges.map(([start, end], index) => (
    <span className="lab-verse-line" key={`verse-line-${index}`}>{nodes.slice(start - from, end - from)}</span>
  ))
}

/**
 * A page-tail slice is painted as its own block, so its bottom line reads as a
 * paragraph end. Flag slices whose paragraph continues on the next page so the
 * renderer can justify that last line like any interior line.
 */
export function lineContinuesParagraph(
  paragraphs: string[],
  line: { paragraphIndex?: number; from?: number; words: Array<{ text: string }> },
): boolean {
  if (line.paragraphIndex == null || line.from == null || line.words.length === 0) return false
  const total = tokenizeHearingWords(paragraphs[line.paragraphIndex] || '').length
  return line.from + line.words.length < total
}

/**
 * Only a reasonably full last line may be stretched to the margin. Below this
 * fill a justified tail reads as rivers, so it stays start-aligned instead.
 */
export const LAB_CONTINUED_TAIL_MIN_FILL = 0.8

interface TailRect { left: number; right: number; bottom: number; height: number }

/** Natural fill (0..1) of the last painted line, from per-fragment word rects. */
export function continuedTailFill(
  contentLeft: number,
  contentRight: number,
  fragments: TailRect[],
): number {
  const width = contentRight - contentLeft
  const painted = fragments.filter(rect => rect.height > 0 && rect.right > rect.left)
  if (!(width > 0) || painted.length === 0) return 0
  const lastBottom = Math.max(...painted.map(rect => rect.bottom))
  const lastRight = Math.max(...painted
    .filter(rect => Math.abs(rect.bottom - lastBottom) < Math.max(8, rect.height / 2))
    .map(rect => rect.right))
  return Math.max(0, Math.min(1, (lastRight - contentLeft) / width))
}

/**
 * Measure each continued slice with its tail start-aligned, then mark the ones
 * whose last line is full enough to justify. Runs before paint, so the reader
 * never sees the intermediate state. Line breaks are untouched either way.
 */
export function markFullContinuedTails(root: HTMLElement | null): void {
  if (!root) return
  const lines = root.querySelectorAll<HTMLElement>('.lab-hearing-line.is-continued')
  lines.forEach(line => line.classList.remove('is-tail-full'))
  lines.forEach((line) => {
    try {
      const box = line.getBoundingClientRect()
      const style = root.ownerDocument.defaultView?.getComputedStyle(line)
      const padLeft = parseFloat(style?.paddingLeft || '0') || 0
      const padRight = parseFloat(style?.paddingRight || '0') || 0
      const fragments: TailRect[] = []
      line.querySelectorAll<HTMLElement>(
        ':scope > span:not(.lab-verse-line), :scope > .lab-verse-unit > span, :scope > .lab-verse-line > span',
      ).forEach((word) => {
        for (const rect of word.getClientRects()) fragments.push(rect)
      })
      const fill = continuedTailFill(box.left + padLeft, box.right - padRight, fragments)
      if (fill >= LAB_CONTINUED_TAIL_MIN_FILL) line.classList.add('is-tail-full')
    } catch { /* jsdom has no layout */ }
  })
}

function renderPlainWords(lines: ReturnType<typeof readingPageLines>, paragraphs: string[]) {
  return lines.map((line, lineIndex) => (
    <p key={lineIndex} className={`lab-hearing-line${lineContinuesParagraph(paragraphs, line) ? ' is-continued' : ''}`}>
      {renderWordGroups(line.words, (word, wordIndex, spacing) => (
        <span key={`${lineIndex}-${wordIndex}`} className="lab-hearing-word">
          {spacing}
          {renderWordText(word.text, word.emphasis)}
        </span>
      ), lineationFor(paragraphs, line))}
    </p>
  ))
}

/** The lineation of the paragraph a painted slice came from, if it has one. */
function lineationFor(
  paragraphs: string[],
  line: { paragraphIndex?: number; from?: number },
  fallbackParagraph = 0,
  fallbackFrom = 0,
): { text?: string; from: number } {
  return {
    text: paragraphs[line.paragraphIndex ?? fallbackParagraph],
    from: line.from ?? fallbackFrom,
  }
}

/** `data-follow-granularity` marks paragraphs whose weak sidecar alignment follows by sentence. */
function followGranularityAttr(followParagraphs: FollowParagraph[], paragraphIndex: number): 'sentence' | undefined {
  const paragraph = followParagraphs.find(item => item.index === paragraphIndex) || followParagraphs[paragraphIndex]
  return followGranularity(paragraph) === 'sentence' ? 'sentence' : undefined
}

function renderHearingWords(
  paragraph: FollowParagraph | undefined,
  follow: FollowTarget,
  paragraphs: string[],
  followParagraphs: FollowParagraph[],
  readingPage?: ChapterHearingPage,
  chapterPages?: ChapterHearingPage[],
  onSeekToWord?: (paragraphIndex: number, wordIndex: number) => void,
) {
  const fallbackParagraphIndex = paragraph?.index ?? 0
  const lines = readingPage
    ? hearingReadingPageLines(paragraphs, readingPage, follow)
    : hearingStageLines(paragraph, follow, chapterPages)
  return lines.map((line, lineIndex) => {
    const paragraphIndex = line.paragraphIndex ?? fallbackParagraphIndex
    const paragraphCurrent = follow.kind === 'paragraph' && paragraphIndex === follow.paragraphIndex
    return (
      <p
        key={lineIndex}
        className={`lab-hearing-line${paragraphCurrent ? ' is-paragraph-current' : ''}${lineContinuesParagraph(paragraphs, line) ? ' is-continued' : ''}`}
        data-follow-granularity={followGranularityAttr(followParagraphs, paragraphIndex)}
      >
        {renderWordGroups(line.words, (word, wordIndex, spacing) => {
          // A sentence-level follow widens "current" to the whole span; word-level is unchanged.
          const role = word.wordIndex != null ? followWordRole(follow, paragraphIndex, word.wordIndex) ?? word.role : word.role
          return (
            <span
              key={`${lineIndex}-${wordIndex}`}
              className={`lab-hearing-word is-${role}`}
              data-testid={role === 'current' ? 'lab-hearing-current' : undefined}
              data-paragraph-index={word.wordIndex != null ? paragraphIndex : undefined}
              data-word-index={word.wordIndex}
              onClick={word.wordIndex != null && onSeekToWord
                ? () => onSeekToWord(paragraphIndex, word.wordIndex!)
                : undefined}
            >
              {spacing}
              {renderWordText(word.text, word.emphasis)}
            </span>
          )
        }, lineationFor(paragraphs, line, fallbackParagraphIndex))}
      </p>
    )
  })
}

function wordPlaceFromTarget(target: EventTarget | null): LabWordPlace | null {
  const el = target instanceof Element ? target.closest('[data-testid="lab-word"]') : null
  if (!el) return null
  const paragraphIndex = Number(el.getAttribute('data-paragraph-index'))
  const wordIndex = Number(el.getAttribute('data-word-index'))
  if (!Number.isInteger(paragraphIndex) || !Number.isInteger(wordIndex)) return null
  return { paragraphIndex, wordIndex }
}

/**
 * The word of `line` nearest to a point, for touches that land between words
 * rather than on one. Vertical distance is weighted far above horizontal, so a
 * point past the ragged end of a short line resolves to that line's last word
 * rather than to whatever sits underneath on the line below — the same metric
 * the drag path uses, kept identical on purpose.
 */
function nearestWordPlaceIn(line: Element, clientX: number, clientY: number): LabWordPlace | null {
  let nearest: Element | null = null
  let best = Infinity
  for (const word of line.querySelectorAll('[data-testid="lab-word"]')) {
    const box = word.getBoundingClientRect()
    if (!box.width || !box.height) continue
    const dx = Math.max(box.left - clientX, 0, clientX - box.right)
    const dy = Math.max(box.top - clientY, 0, clientY - box.bottom)
    const distance = dy * dy * 10000 + dx * dx
    if (distance < best) { best = distance; nearest = word }
  }
  return wordPlaceFromTarget(nearest)
}

export function LabPassage({
  pendingLayout = false,
  chapterEnd,
  chapterEndPage = false,
  onChapterEndFit,
  desktopSpread = false,
  nextReadingPage,
  alignCompare = false,
  chapterTitle,
  paragraphs,
  compareParagraphs,
  compare,
  mode,
  follow,
  followParagraphs,
  clips,
  playing = false,
  clipIndex = 0,
  currentTime = 0,
  speed = 1,
  onTogglePlay,
  onSeek,
  onCycleSpeed,
  hideTransport = false,
  markedIndexes,
  focusParagraph,
  discussedParagraph = null,
  dimmed,
  peek,
  readingPage,
  chapterPages,
  keyboardSelection = false,
  compareHighlights = [],
  selectingComparison = false,
  highlights = [],
  chapterNumber = 0,
  selectingRange = null,
  onSelectRange,
  browseWhileListening = false,
  inlineHearingPaint = false,
  onSeekToWord,
  pageTurn,
  onPageTurn,
  onSelectionPageTurn,
  onSelectingChange,
  tapZones = 'all',
  onCompareSwap,
  onToggleControls,
  layoutKey = '',
}: LabPassageProps) {
  const hearing = mode === 'hearing'
  const followActive = hearingFollowPaintActive(mode, playing, follow) && !browseWhileListening
  const paintedFollow = readingPage
    ? { kind: 'word' as const, paragraphIndex: readingPage.paragraphIndex, wordIndex: readingPage.from }
    : null
  const spuriousStart = followActive && follow.kind === 'word'
    && follow.paragraphIndex === 0 && follow.wordIndex === 0
    && !!paintedFollow
    && (paintedFollow.paragraphIndex > 0 || paintedFollow.wordIndex > 0)
  const linesFollow = spuriousStart && paintedFollow ? paintedFollow : follow
  const paragraph = linesFollow.kind === 'none'
    ? followParagraphs[clipIndex] || followParagraphs[0]
    : followParagraphs.find(item => item.index === linesFollow.paragraphIndex) || followParagraphs[clipIndex]
  const readingLines = readingPageLines(paragraphs, readingPage)
  const showHeadline = followActive && linesFollow.kind === 'word'
    ? (readingPage
        ? isChapterFirstReadingPage(readingPage)
        : isChapterFirstHearingPage(paragraph, linesFollow, chapterPages))
    : isChapterFirstReadingPage(readingPage)

  const dragRef = useRef<{
    start: LabWordPlace | null
    end: LabWordPlace | null
    startX: number
    startY: number
    startedAt: number
    selecting: boolean
    touch: boolean
    comparison: boolean
    pointerType: string
  } | null>(null)
  const edgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const edgeDirectionRef = useRef<-1 | 1 | null>(null)
  /** One page per visit to the edge: after a turn the finger has to leave the
   *  zone before it can turn another. A timer alone re-fired under a finger
   *  that simply stayed put (2026-09-19 phone QA: the surprise second flip). */
  const edgeArmedRef = useRef(true)
  const pageTurnRef = useRef(onSelectionPageTurn ?? onPageTurn)
  pageTurnRef.current = onSelectionPageTurn ?? onPageTurn
  const cancelEdge = () => {
    if (edgeTimerRef.current) clearTimeout(edgeTimerRef.current)
    edgeTimerRef.current = null
    edgeDirectionRef.current = null
  }
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageStageRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  useTextRangeHighlights(articleRef)
  const [endOverflow, setEndOverflow] = useState(false)
  const [localSelecting, setLocalSelecting] = useState<LabHighlightRange | null>(null)
  const activeSelecting = localSelecting || selectingRange
  const selectingChangeRef = useRef(onSelectingChange)
  selectingChangeRef.current = onSelectingChange
  useEffect(() => { selectingChangeRef.current?.(localSelecting) }, [localSelecting])

  useEffect(() => () => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
    cancelEdge()
  }, [])

  useEffect(() => {
    dragRef.current = null
    setLocalSelecting(null)
    if (longPressRef.current) clearTimeout(longPressRef.current)
    cancelEdge()
  }, [chapterNumber, paragraphs, compareParagraphs])

  // Pointer cancellation alone does not cancel Safari's native long-press
  // selection. React touch listeners are passive, so own these native events
  // explicitly on the paginated passage (never on popup controls).
  useEffect(() => {
    const article = articleRef.current
    if (!article || hearing || !onSelectRange || onSeekToWord) return
    const preventNativeTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) return
      const target = event.target as Element | null
      if (target?.closest('button, a, input, textarea, select')) return
      if (dragRef.current || selectingRange || wordPlaceFromTarget(target)) {
        event.preventDefault()
      }
    }
    const preventNativeSelection = (event: Event) => {
      if (dragRef.current) event.preventDefault()
    }
    article.addEventListener('touchstart', preventNativeTouch, { passive: false })
    article.addEventListener('touchmove', preventNativeTouch, { passive: false })
    article.addEventListener('selectstart', preventNativeSelection)
    return () => {
      article.removeEventListener('touchstart', preventNativeTouch)
      article.removeEventListener('touchmove', preventNativeTouch)
      article.removeEventListener('selectstart', preventNativeSelection)
    }
  }, [hearing, onSelectRange, onSeekToWord, selectingRange])

  // The tail measurement strips `is-tail-full`, forces a layout with the tail
  // start-aligned, then puts the class back. Doing that after every commit
  // meant two forced relayouts per animation frame while audio follow moved
  // the highlight — the highlight itself never changes a word's box. So only
  // re-measure when what fills a line can change: the painted lines, the
  // stage branch, columns, the typography key, and (below) the width.
  const paintedLinesKey = readingLines
    .map(line => `${line.paragraphIndex}:${line.from}:${line.words.length}`)
    .join('|')
  const paintedBranch = hearing && followActive ? 'hearing' : hearing && !browseWhileListening ? 'plain' : 'reading'
  useLayoutEffect(() => {
    const article = articleRef.current
    if (!article) return
    article.scrollTop = 0
    const check = () => {
      if (chapterEndPage) return
      const card = article.querySelector<HTMLElement>('.lab-chapter-end')
      const overflow = Boolean(card && card.getBoundingClientRect().bottom > article.getBoundingClientRect().bottom - 8)
      setEndOverflow(overflow)
      onChapterEndFit?.(!overflow)
    }
    check()
    if (typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(check)
    observer.observe(article)
    return () => observer.disconnect()
  }, [paintedLinesKey, nextReadingPage, compare, Boolean(chapterEnd), chapterEndPage, onChapterEndFit, layoutKey])
  useLayoutEffect(() => {
    markFullContinuedTails(articleRef.current)
  }, [paintedLinesKey, nextReadingPage, paintedBranch, compare, showHeadline, layoutKey, paragraphs])

  useEffect(() => {
    const article = articleRef.current
    if (!article || typeof ResizeObserver !== 'function') return
    let lastWidth: number | null = null
    const observer = new ResizeObserver((entries) => {
      const width = entries[entries.length - 1]?.contentRect.width ?? article.clientWidth
      if (lastWidth != null && Math.abs(width - lastWidth) < 0.5) return
      lastWidth = width
      markFullContinuedTails(article)
    })
    observer.observe(article)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const stage = pageStageRef.current
    if (!stage || !pageTurn) return
    // Restart the same-direction transition without remounting the text. A
    // remount would sever an in-progress cross-page selection gesture.
    stage.style.animation = 'none'
    void stage.offsetWidth
    stage.style.animation = ''
  }, [pageTurn])

  const finishPointerSelection = (event: React.PointerEvent) => {
    cancelEdge()
    const drag = dragRef.current
    dragRef.current = null
    setLocalSelecting(null)
    if (!drag?.start || !drag.end || !onSelectRange) return
    const range = buildHighlightRange(drag.comparison ? compareParagraphs : paragraphs, drag.start, drag.end)
    if (!range?.text.trim()) return
    onSelectRange(range, event.clientX, event.clientY, drag.comparison ? 'compare' : undefined)
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (dragRef.current) return
    if (event.button != null && event.button !== 0) return
    if ((event.target as HTMLElement).closest('.lab-mark-btn, button, a, input, textarea, select')) return
    // Hearing still owns the same page surface. It must accept edge taps and
    // swipes even though text selection is intentionally reading-only.
    let place = hearing ? null : wordPlaceFromTarget(event.target)
    // A one- or two-character word ("I", "a") is a few pixels wide, so a finger
    // aimed at it usually lands on the separator beside it or on the paragraph
    // itself — `place` came back null and the long-press timer below was never
    // armed, which is why short words could not start a selection while longer
    // ones could. Resolve to the nearest word of the line actually touched.
    // Scoped to a line element, so taps in the page margins stay null and the
    // edge tap zones keep turning pages.
    if (!place && !hearing) {
      const line = (event.target as Element)?.closest?.('.lab-hearing-line')
      if (line) place = nearestWordPlaceIn(line, event.clientX, event.clientY)
    }
    if (place && onSeekToWord) return
    if (!place && !onPageTurn) return
    // A word at the left/right edge can still be long-pressed. A short release
    // remains an edge page turn, while the long-press timer wins for selection.
    const selectionPlace = place
    if (selectionPlace && onSelectRange) event.preventDefault()
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* jsdom */ }
    const touchSelection = event.pointerType === 'touch' && !!selectionPlace && !!onSelectRange
    const drag = {
      start: selectionPlace,
      end: selectionPlace,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: event.timeStamp,
      selecting: false,
      touch: touchSelection,
      comparison: !!(event.target as Element).closest('.lab-book-col-compare'),
      pointerType: event.pointerType,
    }
    dragRef.current = drag
    if (touchSelection && selectionPlace) {
      longPressRef.current = setTimeout(() => {
        if (dragRef.current !== drag) return
        drag.selecting = true
        const native = window.getSelection()
        if (native?.anchorNode && articleRef.current?.contains(native.anchorNode)) native.removeAllRanges()
        setLocalSelecting(buildHighlightRange(drag.comparison ? compareParagraphs : paragraphs, selectionPlace, selectionPlace))
      }, 160)
    }
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    if (!drag.selecting) {
      const distance = Math.max(Math.abs(event.clientX - drag.startX), Math.abs(event.clientY - drag.startY))
      if (drag.touch && distance > 10 && longPressRef.current
        && event.timeStamp - drag.startedAt < 100) {
        clearTimeout(longPressRef.current)
        longPressRef.current = null
        drag.start = null
        drag.end = null
        return
      }
      if (drag.touch || distance < 3 || !drag.start || !onSelectRange) return
      drag.selecting = true
      setLocalSelecting(buildHighlightRange(drag.comparison ? compareParagraphs : paragraphs, drag.start, drag.start))
    }
    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const direction = event.clientY >= bounds.bottom - LAB_EDGE_ZONE_PX ? 1 : event.clientY <= bounds.top + LAB_EDGE_ZONE_PX ? -1 : null
    if (!direction) edgeArmedRef.current = true
    if (direction !== edgeDirectionRef.current) cancelEdge()
    if (direction && edgeArmedRef.current && !edgeTimerRef.current && pageTurnRef.current && !drag.comparison) {
      edgeDirectionRef.current = direction
      const advance = () => {
        if (dragRef.current !== drag || !drag.selecting) { cancelEdge(); return }
        const visible = Array.from(articleRef.current?.querySelectorAll<HTMLElement>('[data-testid="lab-word"]') || [])
          .filter(word => !word.closest('.lab-book-col-compare'))
        const edge = wordPlaceFromTarget(direction === 1 ? visible[visible.length - 1] : visible[0])
        const lastP = paragraphs.length - 1
        const atEnd = edge && (direction === 1
          ? edge.paragraphIndex === lastP && edge.wordIndex >= tokenizeHearingWords(paragraphs[lastP] || '').length - 1
          : edge.paragraphIndex === 0 && edge.wordIndex === 0)
        if (!edge || atEnd) { cancelEdge(); return }
        edgeArmedRef.current = false
        pageTurnRef.current?.(direction)
        edgeTimerRef.current = setTimeout(() => {
          if (dragRef.current !== drag) return
          const after = Array.from(articleRef.current?.querySelectorAll<HTMLElement>('[data-testid="lab-word"]') || [])
            .filter(word => !word.closest('.lab-book-col-compare'))
          const next = wordPlaceFromTarget(direction === 1 ? after[0] : after[after.length - 1])
          if (next && drag.start) {
            drag.end = next
            setLocalSelecting(buildHighlightRange(paragraphs, drag.start, next))
          }
          // No further turn from here: the finger must leave the zone first.
          edgeTimerRef.current = null
        }, 200)
      }
      edgeTimerRef.current = setTimeout(advance, LAB_EDGE_HOLD_MS)
    }
    const pointTarget = typeof document.elementFromPoint === 'function'
      ? document.elementFromPoint(event.clientX, event.clientY)
      : null
    const target = pointTarget || event.target as Element
    let place = wordPlaceFromTarget(target)
    const sameSide = !!(target as Element)?.closest('.lab-book-col-compare') === drag.comparison
    // Selection follows the nearest line through whitespace, including short touch lines.
    // Keep Compare isolated; the second Read leaf still belongs to the primary.
    if (!place && sameSide) {
      // Prefer the line the finger is actually inside. Dragging to the ragged
      // end of a short last line means leaving the words behind — an
      // article-wide search can then answer with a word on the line below,
      // which is why a short trailing line was hard to capture. `sameSide`
      // has already established the column, so this line is the right one.
      const line = (target as Element)?.closest?.('.lab-hearing-line')
      if (line) place = nearestWordPlaceIn(line, event.clientX, event.clientY)
    }
    if (!place && sameSide) {
      let nearest: Element | null = null
      let best = Infinity
      for (const word of event.currentTarget.querySelectorAll('[data-testid="lab-word"]')) {
        if (!!word.closest('.lab-book-col-compare') !== drag.comparison) continue
        const box = word.getBoundingClientRect()
        if (!box.width || !box.height) continue
        const dx = Math.max(box.left - event.clientX, 0, event.clientX - box.right)
        const dy = Math.max(box.top - event.clientY, 0, event.clientY - box.bottom)
        const distance = dy * dy * 10000 + dx * dx
        if (distance < best) { best = distance; nearest = word }
      }
      place = wordPlaceFromTarget(nearest)
    }
    const changed = place && sameSide && (place.paragraphIndex !== drag.end?.paragraphIndex || place.wordIndex !== drag.end?.wordIndex)
    if (place && sameSide) drag.end = place
    if (changed && drag.start && drag.end && onSelectRange) {
      setLocalSelecting(buildHighlightRange(drag.comparison ? compareParagraphs : paragraphs, drag.start, drag.end))
    }
  }

  const onPointerEnd = (event: React.PointerEvent) => {
    cancelEdge()
    const drag = dragRef.current
    if (!drag) return
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    const duration = Math.max(0, event.timeStamp - drag.startedAt)
    const surfaceRect = event.currentTarget.getBoundingClientRect()
    const savedHighlight = drag.start
      ? (drag.comparison ? compareHighlights : highlights).find(mark => (
          mark.chapterNumber === chapterNumber
          && wordInHighlightRange(mark, drag.start!.paragraphIndex, drag.start!.wordIndex)
        ))
      : null
    // Precedence, decided once and used by everything below: a click or tap
    // that lands in a live page-turn zone turns the page and does nothing
    // else. It must never also open a word definition — one click cannot both
    // turn the page and pop a card. Where the pointer has visible
    // previous/next buttons the zones are off (`tapZones` is 'none'), so a
    // mouse click on a word anywhere on the page still defines it.
    const tap = onPageTurn
      && !savedHighlight
      && labTapTurnAllowed(tapZones, drag.pointerType)
      && !selectingRange
      && !drag.selecting
      && Math.abs(deltaX) <= 10
      && Math.abs(deltaY) <= 10
      && duration <= 500
      ? labTapPageDirection(event.clientX, surfaceRect.left, surfaceRect.width)
      : null
    if (tap == null && (drag.pointerType === 'mouse' || savedHighlight) && !drag.selecting && drag.start && onSelectRange
      && Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) {
      const range = buildHighlightRange(drag.comparison ? compareParagraphs : paragraphs, drag.start, drag.start)
      dragRef.current = null
      setLocalSelecting(null)
      if (range?.text.trim()) onSelectRange(range, event.clientX, event.clientY, drag.comparison ? 'compare' : undefined, 'lookup')
      return
    }
    // Compare's whole-page swap is the vertical swipe, and it is checked
    // first: the two gestures are on different axes and must never both fire.
    // A swipe is a finger. A mouse dragged down the page is selecting text,
    // and always has been; the menu's Compare row is the pointer's way in.
    if (
      onCompareSwap
      && drag.pointerType !== 'mouse'
      && !selectingRange
      && !drag.selecting
      && labSwipeCompareSwap(deltaX, deltaY)
    ) {
      dragRef.current = null
      setLocalSelecting(null)
      onCompareSwap()
      return
    }
    const swipe = onPageTurn && !selectingRange && !drag.selecting
      ? labSwipePageDirection(deltaX, deltaY)
      : null
    const direction = swipe ?? tap
    if (direction != null) {
      dragRef.current = null
      setLocalSelecting(null)
      onPageTurn?.(direction)
      return
    }
    if (!drag.selecting) {
      dragRef.current = null
      setLocalSelecting(null)
      const centeredTap = !selectingRange
        && !!onToggleControls
        && Math.abs(deltaX) <= 10
        && Math.abs(deltaY) <= 10
        && duration <= 500
        && tap == null
      if (centeredTap) onToggleControls()
      return
    }
    finishPointerSelection(event)
  }

  const onPointerCancel = () => {
    cancelEdge()
    if (longPressRef.current) clearTimeout(longPressRef.current)
    longPressRef.current = null
    dragRef.current = null
    setLocalSelecting(null)
  }

  const renderReadingLines = (pageLines: ReturnType<typeof readingPageLines>, secondary = false) => (
    pageLines.map((line, lineIndex) => {
                const paragraphIndex = line.paragraphIndex ?? readingPage?.paragraphIndex ?? 0
                const wordBase = line.from ?? readingPage?.from ?? 0
                return (
                  <p
                    key={lineIndex}
                    id={secondary ? undefined : `lab-p-${paragraphIndex}`}
                    className={[
                      'lab-hearing-line',
                      inlineHearingPaint && follow.kind === 'paragraph' && follow.paragraphIndex === paragraphIndex ? 'is-paragraph-current' : '',
                      lineContinuesParagraph(paragraphs, line) ? 'is-continued' : '',
                      markedIndexes.has(paragraphIndex) ? 'is-marked' : '',
                      focusParagraph === paragraphIndex ? 'is-focus' : '',
                      discussedParagraph === paragraphIndex ? 'is-discussed' : '',
                    ].filter(Boolean).join(' ')}
                    style={alignCompare && compare ? { gridColumn: 1, gridRow: lineIndex + 1 } : undefined}
                    data-follow-granularity={inlineHearingPaint ? followGranularityAttr(followParagraphs, paragraphIndex) : undefined}
                  >
                    {renderWordGroups(line.words, (word, wordIndex, spacing) => {
                      const absoluteWord = wordBase + wordIndex
                      const color = highlightColorAt(highlights, chapterNumber, paragraphIndex, absoluteWord)
                      const selecting = !((localSelecting && dragRef.current?.comparison) || (!localSelecting && selectingComparison)) && activeSelecting
                        && wordInHighlightRange(activeSelecting, paragraphIndex, absoluteWord)
                      const inlineRole = inlineHearingPaint
                        ? followWordRole(follow, paragraphIndex, absoluteWord)
                          ?? (follow.kind === 'paragraph' ? (paragraphIndex < follow.paragraphIndex ? 'spoken' : paragraphIndex > follow.paragraphIndex ? 'upcoming' : null) : null)
                        : null
                      // The page-edge fragment is decoration, not a word: no
                      // index, no test id, no selection, hidden from assistive
                      // technology, and its hyphen is drawn by CSS. Nothing
                      // that reads words or offsets can see it.
                      if (word.fragment) {
                        return (
                          <span
                            key={`${lineIndex}-${wordIndex}`}
                            className="lab-word-fragment"
                            data-testid="lab-word-fragment"
                            aria-hidden="true"
                          >
                            {spacing}
                            {word.text}
                          </span>
                        )
                      }
                      return (
                        <span
                          key={`${lineIndex}-${wordIndex}`}
                          className={`${labHighlightCssClass(color, selecting)}${inlineRole && (playing || inlineRole === 'current') ? ` is-${inlineRole}` : ''}`}
                          data-testid="lab-word"
                          data-paragraph-index={paragraphIndex}
                          data-word-index={absoluteWord}
                          onClick={onSeekToWord
                            ? (event) => {
                                event.stopPropagation()
                                onSeekToWord(paragraphIndex, absoluteWord)
                              }
                            : undefined}
                        >
                          {spacing}
                          {renderWordText(word.text, word.emphasis)}
                        </span>
                      )
                    }, { text: paragraphs[paragraphIndex], from: wordBase }, (spacing, wordIndex) => {
                      if (!spacing || wordIndex <= 0) return spacing
                      const absoluteWord = wordBase + wordIndex
                      const previousWord = absoluteWord - 1
                      const color = highlightColorAt(highlights, chapterNumber, paragraphIndex, absoluteWord)
                      const previousColor = highlightColorAt(highlights, chapterNumber, paragraphIndex, previousWord)
                      const onPrimary = !((localSelecting && dragRef.current?.comparison) || (!localSelecting && selectingComparison))
                      const selecting = !!activeSelecting && onPrimary && wordInHighlightRange(activeSelecting, paragraphIndex, absoluteWord)
                      const previousSelecting = !!activeSelecting && onPrimary && wordInHighlightRange(activeSelecting, paragraphIndex, previousWord)
                      const className = labHighlightGapCssClass(color, selecting, previousColor, previousSelecting)
                      return className ? <span className={className}>{spacing}</span> : spacing
                    })}
                  </p>
                )
              })
  )

  return (
    <article
      ref={articleRef}
      style={pendingLayout ? { visibility: 'hidden' } : undefined}
      className={[
        'lab-passage',
        'lab-book',
        'is-reading',
        !hearing && onSelectRange && !onSeekToWord ? 'owns-text-selection' : '',
        hearing && !browseWhileListening ? 'is-hearing' : '',
        (followActive || inlineHearingPaint) && linesFollow.kind === 'paragraph' ? 'has-paragraph-follow' : '',
        inlineHearingPaint ? 'is-inline-hearing' : '',
        browseWhileListening ? 'is-browse-listen' : '',
        dimmed ? 'is-dimmed' : '',
        compare ? 'is-compare' : '',
        desktopSpread ? 'is-spread' : '',
        chapterEnd ? 'has-chapter-end' : '',
        chapterEndPage ? 'is-chapter-end-page' : endOverflow ? 'has-overflowing-end' : '',
        alignCompare && compare ? 'is-aligned-compare' : '',
        peek ? 'is-peek' : '',
      ].filter(Boolean).join(' ')}
      data-testid="lab-book"
      data-passage-mode={mode}
      tabIndex={keyboardSelection && onSelectRange ? 0 : undefined}
      aria-keyshortcuts={keyboardSelection && onSelectRange ? 'Shift+F10' : undefined}
      onKeyDown={event => {
        if (!keyboardSelection || !onSelectRange || hearing || !(event.key === 'F10' && event.shiftKey)) return
        const selection = window.getSelection()
        const anchor = selection?.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection?.anchorNode as Element | null
        const focus = selection?.focusNode?.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection?.focusNode as Element | null
        if (!anchor || !focus || !event.currentTarget.contains(anchor) || !event.currentTarget.contains(focus)) return
        const start = wordPlaceFromTarget(anchor), end = wordPlaceFromTarget(focus)
        const comparison = !!anchor.closest('.lab-book-col-compare')
        if (!start || !end || comparison !== !!focus.closest('.lab-book-col-compare')) return
        const range = buildHighlightRange(comparison ? compareParagraphs : paragraphs, start, end)
        if (!range) return
        event.preventDefault(); event.stopPropagation()
        const rect = focus.getBoundingClientRect()
        onSelectRange(range, rect.left, rect.bottom, comparison ? 'compare' : undefined)
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerCancel}
      onContextMenu={(event) => {
        if (!hearing && onSelectRange) event.preventDefault()
      }}
    >
      {localSelecting && <span className="lab-selection-hint" role="status">Hold at the top or bottom edge to select across pages</span>}
      {showHeadline && !desktopSpread && (
        <header className="lab-passage-header">
          <h1 className="lab-passage-headline" data-testid="lab-passage-headline">
            {chapterTitle}
          </h1>
        </header>
      )}
      <div className="lab-book-columns">
        <div className="lab-book-col">
          {desktopSpread && showHeadline && <header className="lab-passage-header"><h1 className="lab-passage-headline" data-testid="lab-passage-headline">{chapterTitle}</h1></header>}
          {hearing && followActive ? (
            <div className="lab-hearing" data-testid="lab-hearing">
              <div className="lab-hearing-stage" data-testid="lab-hearing-stage">
                {renderHearingWords(paragraph, linesFollow, paragraphs, followParagraphs, readingPage, chapterPages, onSeekToWord)}
              </div>
            </div>
          ) : hearing && !browseWhileListening ? (
            <div className="lab-hearing" data-testid="lab-hearing">
              <div className="lab-hearing-stage" data-testid="lab-hearing-stage">
                {renderPlainWords(readingLines, paragraphs)}
              </div>
            </div>
          ) : (
            <div
              className="lab-hearing-stage"
              data-testid="lab-reading-stage"
              data-page-turn={pageTurn?.direction}
              data-page-turn-nonce={pageTurn?.nonce}
              ref={pageStageRef}
            >
              {renderReadingLines(readingLines)}
            </div>
          )}
          {!compare && !desktopSpread && !chapterEndPage && chapterEnd}
        </div>
        {desktopSpread && <div className="lab-book-col lab-book-col-next" data-testid="lab-next-page-col">
          <div className="lab-hearing-stage" data-testid="lab-next-reading-stage">
            {nextReadingPage && renderReadingLines(readingPageLines(paragraphs, nextReadingPage), true)}
          </div>
          {/* On the spread the end-of-chapter card always belongs to the
              second leaf. When the chapter's last text ends on the first leaf
              the second is empty, and the card fills it — the reader sees the
              text end and the card in one spread instead of turning a page to
              a card floating beside a blank leaf. */}
          {!chapterEndPage && chapterEnd}
        </div>}
        {compare && (
          <div className="lab-book-col lab-book-col-compare" data-testid="lab-compare-col">
            {readingLines.map((line, lineIndex) => {
              const source = compareParagraphs.length > 0 ? compareParagraphs : paragraphs
              const paragraphIndex = line.paragraphIndex ?? readingPage?.paragraphIndex ?? 0
              const words = tokenizeHearingWords(source[paragraphIndex] || '')
              const from = line.from ?? readingPage?.from ?? 0
              const segment = alignCompare ? comparisonSegment({ paragraphIndex, from, to: from + line.words.length }, paragraphs, source) : { from, to: from + line.words.length }
              const text = words.slice(segment.from, segment.to).map(word => word.text).join(' ')
              if (!alignCompare && !text) return null
              const compareSelecting = !!activeSelecting && !!(localSelecting ? dragRef.current?.comparison : selectingComparison)
              return <p key={lineIndex} className="lab-hearing-line" style={alignCompare ? { gridColumn: 2, gridRow: lineIndex + 1 } : undefined} data-compare-paragraph={paragraphIndex} data-compare-from={segment.from} data-compare-to={segment.to}>{asVerseLines(source[paragraphIndex], segment.from, words.slice(segment.from, segment.to).map((word, index) => {
                const absoluteWord = segment.from + index
                const color = highlightColorAt(compareHighlights, chapterNumber, paragraphIndex, absoluteWord)
                const selecting = compareSelecting && wordInHighlightRange(activeSelecting!, paragraphIndex, absoluteWord)
                const previousColor = index > 0 ? highlightColorAt(compareHighlights, chapterNumber, paragraphIndex, absoluteWord - 1) : null
                const previousSelecting = index > 0 && compareSelecting && wordInHighlightRange(activeSelecting!, paragraphIndex, absoluteWord - 1)
                const gapClass = index > 0 ? labHighlightGapCssClass(color, selecting, previousColor, previousSelecting) : ''
                return <Fragment key={index}>{index > 0 ? (gapClass ? <span className={gapClass}> </span> : ' ') : ''}<span className={labHighlightCssClass(color, selecting)} data-testid="lab-word" data-paragraph-index={paragraphIndex} data-word-index={absoluteWord}>{word.emphasis ? <em>{word.text}</em> : word.text}</span></Fragment>
              }))}</p>
            })}
          </div>
        )}
      </div>
      {compare && !chapterEndPage && chapterEnd}
      {chapterEndPage && <div className="lab-chapter-end-page" data-testid="lab-chapter-end-page">{chapterEnd}</div>}
      {hearing && !hideTransport && onTogglePlay && onSeek && onCycleSpeed && (
        <div className="lab-hearing-transport" data-testid="lab-hearing-transport">
          <button type="button" className="lab-text-btn" onClick={onTogglePlay} data-testid="lab-hearing-pause">
            {playing ? LAB_COPY.pause : LAB_COPY.play}
          </button>
          <button type="button" className="lab-text-btn" onClick={() => onSeek(-15)} data-testid="lab-hearing-back">
            {LAB_COPY.back15}
          </button>
          <button type="button" className="lab-text-btn" onClick={() => onSeek(15)} data-testid="lab-hearing-forward">
            {LAB_COPY.forward15}
          </button>
          <button type="button" className="lab-text-btn" onClick={onCycleSpeed} data-testid="lab-hearing-speed">
            {speed}×
          </button>
        </div>
      )}
    </article>
  )
}

/** Offscreen paint of one page so settle can measure every page without flipping. */
export function LabPageMeasurePaint(input: {
  chapterTitle: string
  paragraphs: string[]
  page: ChapterHearingPage
  hearingPaint?: boolean
}) {
  const lines = readingPageLines(input.paragraphs, input.page)
  return (
    <article className={`lab-passage lab-book is-reading${input.hearingPaint ? ' is-hearing' : ''}`}>
      {isChapterFirstReadingPage(input.page) && (
        <header className="lab-passage-header">
          <h1 className="lab-passage-headline">{input.chapterTitle}</h1>
        </header>
      )}
      <div className="lab-book-columns">
        <div className="lab-book-col">
          <div className="lab-hearing-stage">
            {lines.map((line, lineIndex) => (
              <p key={lineIndex} className="lab-hearing-line">
                {renderWordGroups(line.words, (word, wordIndex, spacing) => (
                  <span
                    key={`${lineIndex}-${wordIndex}`}
                    className={input.hearingPaint
                      ? `lab-hearing-word ${wordIndex === 0 ? 'is-current' : wordIndex < line.words.length / 2 ? 'is-spoken' : 'is-upcoming'}`
                      : 'lab-hearing-word'}
                  >
                    {spacing}
                    {renderWordText(word.text, word.emphasis)}
                  </span>
                ), lineationFor(input.paragraphs, line, input.page.paragraphIndex, input.page.from))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
