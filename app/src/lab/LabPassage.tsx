import { useRef, useState } from 'react'
import { LAB_COPY } from './labCopy'
import {
  buildHighlightRange,
  highlightColorAt,
  labHighlightCssClass,
  wordInHighlightRange,
  type LabHighlight,
  type LabHighlightRange,
  type LabWordPlace,
} from './labHighlights'
import { hearingFollowPaintActive, hearingStageLines, isChapterFirstHearingPage, isChapterFirstReadingPage, isLabVerseMarker, labVerseMarkerDisplay, readingPageLines, tokenizeHearingWords } from './labHearing'
import type { ChapterHearingPage } from './labHearing'
import type { FollowParagraph, FollowTarget } from './labFollow'
import { labSwipePageDirection, labTapPageDirection, type LabPageTurnDirection } from './labChrome'

export type LabPassageMode = 'reading' | 'hearing'

interface LabPassageProps {
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
  onMark: (index: number) => void
  focusParagraph?: number | null
  dimmed?: boolean
  peek?: boolean
  readingPage?: ChapterHearingPage
  chapterPages?: ChapterHearingPage[]
  highlights?: LabHighlight[]
  chapterNumber?: number
  selectingRange?: LabHighlightRange | null
  onSelectRange?: (range: LabHighlightRange, clientX: number, clientY: number) => void
  browseWhileListening?: boolean
  onSeekToWord?: (paragraphIndex: number, wordIndex: number) => void
  onPageTurn?: (direction: LabPageTurnDirection) => void
}

function wordSpacing(
  word: { text: string },
  wordIndex: number,
  previous?: { text: string },
): string {
  if (wordIndex <= 0 || word.text.startsWith("'") || word.text.startsWith(',') || word.text.startsWith('.')) return ''
  return previous && isLabVerseMarker(previous.text) ? '\u00a0' : ' '
}

function renderWordText(text: string) {
  if (!isLabVerseMarker(text)) return text
  return <span className="lab-verse-mark">{labVerseMarkerDisplay(text)}</span>
}

function renderPlainWords(lines: ReturnType<typeof readingPageLines>) {
  return lines.map((line, lineIndex) => (
    <p key={lineIndex} className="lab-hearing-line">
      {line.words.map((word, wordIndex) => (
        <span key={`${lineIndex}-${wordIndex}`}>
          {wordSpacing(word, wordIndex, line.words[wordIndex - 1])}
          {renderWordText(word.text)}
        </span>
      ))}
    </p>
  ))
}

function renderHearingWords(
  paragraph: FollowParagraph | undefined,
  follow: FollowTarget,
  chapterPages?: ChapterHearingPage[],
  onSeekToWord?: (paragraphIndex: number, wordIndex: number) => void,
) {
  const paragraphIndex = paragraph?.index ?? 0
  const lines = hearingStageLines(paragraph, follow, chapterPages)
  return lines.map((line, lineIndex) => (
    <p key={lineIndex} className="lab-hearing-line">
      {line.words.map((word, wordIndex) => (
        <span
          key={`${lineIndex}-${wordIndex}`}
          className={`lab-hearing-word is-${word.role}`}
          data-testid={word.role === 'current' ? 'lab-hearing-current' : undefined}
          data-paragraph-index={word.wordIndex != null ? paragraphIndex : undefined}
          data-word-index={word.wordIndex}
          onClick={word.wordIndex != null && onSeekToWord
            ? () => onSeekToWord(paragraphIndex, word.wordIndex!)
            : undefined}
        >
          {wordSpacing(word, wordIndex, line.words[wordIndex - 1])}
          {renderWordText(word.text)}
        </span>
      ))}
    </p>
  ))
}

function wordPlaceFromTarget(target: EventTarget | null): LabWordPlace | null {
  const el = target instanceof Element ? target.closest('[data-testid="lab-word"]') : null
  if (!el) return null
  const paragraphIndex = Number(el.getAttribute('data-paragraph-index'))
  const wordIndex = Number(el.getAttribute('data-word-index'))
  if (!Number.isInteger(paragraphIndex) || !Number.isInteger(wordIndex)) return null
  return { paragraphIndex, wordIndex }
}

export function LabPassage({
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
  onMark,
  focusParagraph,
  dimmed,
  peek,
  readingPage,
  chapterPages,
  highlights = [],
  chapterNumber = 0,
  selectingRange = null,
  onSelectRange,
  browseWhileListening = false,
  onSeekToWord,
  onPageTurn,
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
    ? isChapterFirstHearingPage(paragraph, linesFollow, chapterPages)
    : isChapterFirstReadingPage(readingPage)

  const dragRef = useRef<{
    start: LabWordPlace | null
    end: LabWordPlace | null
    startX: number
    startY: number
    startedAt: number
  } | null>(null)
  const [localSelecting, setLocalSelecting] = useState<LabHighlightRange | null>(null)
  const activeSelecting = localSelecting || selectingRange

  const finishPointerSelection = (event: React.PointerEvent) => {
    const drag = dragRef.current
    dragRef.current = null
    setLocalSelecting(null)
    if (!drag?.start || !drag.end || !onSelectRange) return
    const range = buildHighlightRange(paragraphs, drag.start, drag.end)
    if (!range.text.trim()) return
    onSelectRange(range, event.clientX, event.clientY)
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (hearing || (event.target as HTMLElement).closest('.lab-mark-btn, button, a, input, textarea, select')) return
    const place = wordPlaceFromTarget(event.target)
    if (place && onSeekToWord) return
    if (!place && !onPageTurn) return
    if (place && onSelectRange) event.preventDefault()
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* jsdom */ }
    dragRef.current = {
      start: place,
      end: place,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: event.timeStamp,
    }
    if (place && onSelectRange) setLocalSelecting(buildHighlightRange(paragraphs, place, place))
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const place = wordPlaceFromTarget(event.target)
      || wordPlaceFromTarget(document.elementFromPoint(event.clientX, event.clientY))
    if (!place) return
    drag.end = place
    if (drag.start && onSelectRange) {
      setLocalSelecting(buildHighlightRange(paragraphs, drag.start, drag.end))
    }
  }

  const onPointerEnd = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    const duration = Math.max(0, event.timeStamp - drag.startedAt)
    const swipe = onPageTurn && !selectingRange
      ? labSwipePageDirection(deltaX, deltaY)
      : null
    const rect = event.currentTarget.getBoundingClientRect()
    const tap = onPageTurn
      && !selectingRange
      && Math.abs(deltaX) <= 10
      && Math.abs(deltaY) <= 10
      && duration <= 500
      ? labTapPageDirection(event.clientX, rect.left, rect.width)
      : null
    const direction = swipe ?? tap
    if (direction != null) {
      dragRef.current = null
      setLocalSelecting(null)
      onPageTurn?.(direction)
      return
    }
    finishPointerSelection(event)
  }

  const onPointerCancel = () => {
    dragRef.current = null
    setLocalSelecting(null)
  }

  return (
    <article
      className={[
        'lab-passage',
        'lab-book',
        hearing && !browseWhileListening ? 'is-hearing' : 'is-reading',
        browseWhileListening ? 'is-browse-listen' : '',
        dimmed ? 'is-dimmed' : '',
        compare ? 'is-compare' : '',
        peek ? 'is-peek' : '',
      ].filter(Boolean).join(' ')}
      data-testid="lab-book"
      data-passage-mode={mode}
      onContextMenu={(event) => {
        if (!hearing && onSelectRange) event.preventDefault()
      }}
    >
      {showHeadline && (
        <header className="lab-passage-header">
          <h1 className="lab-passage-headline" data-testid="lab-passage-headline">
            {chapterTitle}
          </h1>
        </header>
      )}
      <div className="lab-book-columns">
        <div className="lab-book-col">
          {hearing && followActive ? (
            <div className="lab-hearing" data-testid="lab-hearing">
              <div className="lab-hearing-stage" data-testid="lab-hearing-stage">
                {renderHearingWords(paragraph, linesFollow, chapterPages, onSeekToWord)}
              </div>
            </div>
          ) : hearing && !browseWhileListening ? (
            <div className="lab-hearing" data-testid="lab-hearing">
              <div className="lab-hearing-stage" data-testid="lab-hearing-stage">
                {renderPlainWords(readingLines)}
              </div>
            </div>
          ) : (
            <div
              className="lab-hearing-stage"
              data-testid="lab-reading-stage"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerCancel}
            >
              {readingLines.map((line, lineIndex) => {
                const paragraphIndex = line.paragraphIndex ?? readingPage?.paragraphIndex ?? 0
                const wordBase = line.from ?? readingPage?.from ?? 0
                return (
                  <p
                    key={lineIndex}
                    id={`lab-p-${paragraphIndex}`}
                    className={[
                      'lab-hearing-line',
                      markedIndexes.has(paragraphIndex) ? 'is-marked' : '',
                      focusParagraph === paragraphIndex ? 'is-focus' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {line.words.map((word, wordIndex) => {
                      const absoluteWord = wordBase + wordIndex
                      const color = highlightColorAt(highlights, chapterNumber, paragraphIndex, absoluteWord)
                      const selecting = activeSelecting
                        && wordInHighlightRange(activeSelecting, paragraphIndex, absoluteWord)
                      return (
                        <span
                          key={`${lineIndex}-${wordIndex}`}
                          className={labHighlightCssClass(color, selecting)}
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
                          {wordSpacing(word, wordIndex, line.words[wordIndex - 1])}
                          {renderWordText(word.text)}
                        </span>
                      )
                    })}
                    <button
                      type="button"
                      className="lab-mark-btn"
                      onClick={() => onMark(paragraphIndex)}
                    >
                      {LAB_COPY.markAction}
                    </button>
                  </p>
                )
              })}
            </div>
          )}
        </div>
        {compare && (
          <div className="lab-book-col lab-book-col-compare" data-testid="lab-compare-col">
            {readingLines.map((line, lineIndex) => {
              const source = compareParagraphs.length > 0 ? compareParagraphs : paragraphs
              const paragraphIndex = line.paragraphIndex ?? readingPage?.paragraphIndex ?? 0
              const words = tokenizeHearingWords(source[paragraphIndex] || '')
              const from = line.from ?? readingPage?.from ?? 0
              const text = words.slice(from, from + line.words.length).map(word => word.text).join(' ')
              return text ? <p key={lineIndex} className="lab-hearing-line">{text}</p> : null
            })}
          </div>
        )}
      </div>
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
    <article className={`lab-passage lab-book ${input.hearingPaint ? 'is-hearing' : 'is-reading'}`}>
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
                {line.words.map((word, wordIndex) => (
                  <span
                    key={`${lineIndex}-${wordIndex}`}
                    className={input.hearingPaint
                      ? `lab-hearing-word ${wordIndex === 0 ? 'is-current' : wordIndex < line.words.length / 2 ? 'is-spoken' : 'is-upcoming'}`
                      : 'lab-hearing-word'}
                  >
                    {wordSpacing(word, wordIndex, line.words[wordIndex - 1])}
                    {renderWordText(word.text)}
                  </span>
                ))}
                <button type="button" className="lab-mark-btn" tabIndex={-1}>{LAB_COPY.markAction}</button>
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
