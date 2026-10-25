import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type WheelEvent } from 'react'
import { SourceMinimap, type SourceBookMap } from './SourceMinimap'
import { LabPassage } from '../LabPassage'
import { tokenizeHearingWords } from '../labHearing'
import { continuousReaderWindow, type ContinuousReaderAnchor, type ContinuousReaderWindow } from './continuousReaderWindow'
import type { ContinuousReaderEpoch } from './continuousReaderEpoch'
import './continuousReader.css'

type Passage = ComponentProps<typeof LabPassage>
type Props = {
  passage: Pick<Passage, 'chapterTitle' | 'paragraphs' | 'chapterNumber' | 'highlights' | 'selectingRange' | 'onSelectRange' | 'onSelectingChange' | 'footnotes' | 'onFootnote' | 'onOpenFigure' | 'onPreviewChapter' | 'chapterActionsBusy' | 'chapterEnd' | 'follow' | 'followParagraphs' | 'playing' | 'browseWhileListening' | 'onSeekToWord' | 'inlineHearingPaint' | 'markedIndexes' | 'onMark' | 'focusParagraph' | 'discussedParagraph' | 'layoutKey'>
  epoch: ContinuousReaderEpoch
  anchor: ContinuousReaderAnchor
  onVisible: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  onLanded: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  bookMap?: SourceBookMap
  onUserBrowse?: () => void
}

const WINDOW_COUNT = 3
const WINDOW_WORDS = 450
const WINDOW_PARAGRAPHS = 12
const EMPTY_COMPARE_PARAGRAPHS: string[] = []

/** Find a preceding source coordinate so a resumed word has context above it. */
export function continuousWindowStart(anchor: ContinuousReaderAnchor, paragraphs: readonly string[] = []): ContinuousReaderAnchor {
  if (anchor.wordIndex > 0) return { paragraphIndex: anchor.paragraphIndex, wordIndex: Math.max(0, anchor.wordIndex - WINDOW_WORDS / 2) }
  // Never put an unbounded preceding paragraph ahead of the requested word.
  // A resumed anchor must be in the mounted window even in a book of long paragraphs.
  let first = anchor.paragraphIndex
  let words = 0
  while (first > 0 && anchor.paragraphIndex - first < 3) {
    const count = paragraphs[first - 1]?.trim().split(/\s+/).length ?? WINDOW_WORDS
    if (words + count > WINDOW_WORDS / 2) break
    words += count
    first--
  }
  return { paragraphIndex: first, wordIndex: 0 }
}

export function continuousReaderWindows(paragraphs: readonly string[], start: ContinuousReaderAnchor): ContinuousReaderWindow[] {
  const windows: ContinuousReaderWindow[] = []
  let next: ContinuousReaderAnchor | null = start
  while (next && windows.length < WINDOW_COUNT) {
    const window = continuousReaderWindow(paragraphs, next, { maxWords: WINDOW_WORDS, maxParagraphs: WINDOW_PARAGRAPHS })
    if (!window) break
    windows.push(window)
    next = window.nextAnchor
  }
  return windows
}

export function continuousRebaseStart(
  direction: 'previous' | 'next',
  visible: ContinuousReaderAnchor,
  start: ContinuousReaderAnchor,
  paragraphs: readonly string[],
): ContinuousReaderAnchor | null {
  const candidate = direction === 'next'
    ? { paragraphIndex: visible.paragraphIndex, wordIndex: Math.max(0, visible.wordIndex - WINDOW_WORDS / 2) }
    : start.wordIndex > 0
      ? { paragraphIndex: start.paragraphIndex, wordIndex: Math.max(0, start.wordIndex - WINDOW_WORDS / 2) }
      : { paragraphIndex: start.paragraphIndex - 1,
          wordIndex: Math.max(0, tokenizeHearingWords(paragraphs[start.paragraphIndex - 1] || '').length - WINDOW_WORDS / 2) }
  if (candidate.paragraphIndex < 0 || (candidate.paragraphIndex === start.paragraphIndex && candidate.wordIndex === start.wordIndex)) return null
  const windows = continuousReaderWindows(paragraphs, candidate)
  return windows.some(window => window.page.segments?.some(segment => segment.paragraphIndex === visible.paragraphIndex
    && segment.from <= visible.wordIndex && segment.to > visible.wordIndex)) ? candidate : null
}

function firstVisibleWord(host: HTMLElement): ContinuousReaderAnchor | null {
  const limit = host.getBoundingClientRect().top + Math.min(host.clientHeight * .24, 140)
  const words = host.querySelectorAll<HTMLElement>('[data-testid="lab-word"][data-paragraph-index][data-word-index]')
  let previous: HTMLElement | null = null
  for (const word of words) {
    if (word.getBoundingClientRect().top >= limit) {
      const chosen = previous && previous.getBoundingClientRect().bottom > host.getBoundingClientRect().top ? previous : word
      return { paragraphIndex: Number(chosen.dataset.paragraphIndex), wordIndex: Number(chosen.dataset.wordIndex) }
    }
    previous = word
  }
  return previous ? { paragraphIndex: Number(previous.dataset.paragraphIndex), wordIndex: Number(previous.dataset.wordIndex) } : null
}

/** A bounded, scrollable source window. No position storage lives in this component. */
export function ContinuousReader({ passage, epoch, anchor, onVisible, onLanded, onUserBrowse, bookMap }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const epochKey = `${epoch.bookId}/${epoch.editionKey}/${epoch.chapterNumber}/${epoch.navigation}`
  const destinationKey = `${epochKey}/${anchor.paragraphIndex}:${anchor.wordIndex}`
  const [mapVisible, setMapVisible] = useState(anchor)
  const [mapEnd, setMapEnd] = useState<ContinuousReaderAnchor | undefined>()
  const [windowState, setWindowState] = useState(() => ({ key: destinationKey, start: continuousWindowStart(anchor, passage.paragraphs) }))
  const start = windowState.key === destinationKey ? windowState.start : continuousWindowStart(anchor, passage.paragraphs)
  const windows = useMemo(() => continuousReaderWindows(passage.paragraphs, start), [passage.paragraphs, start.paragraphIndex, start.wordIndex])
  const lastReported = useRef('')
  const landedKey = useRef('')
  const visibleRef = useRef(anchor)
  const layoutKeyRef = useRef(passage.layoutKey)
  const userBrowseRef = useRef(false)
  const suppressScrollRef = useRef(false)
  const restoring = useRef(true)
  const pendingRebase = useRef<{ anchor: ContinuousReaderAnchor; offset: number } | null>(null)

  const wordNode = useCallback((place: ContinuousReaderAnchor) => {
    const words = hostRef.current?.querySelectorAll<HTMLElement>('[data-testid="lab-word"][data-paragraph-index][data-word-index]')
    return [...(words ?? [])].find(word => Number(word.dataset.paragraphIndex) === place.paragraphIndex && Number(word.dataset.wordIndex) === place.wordIndex)
  }, [])

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (windowState.key !== destinationKey) {
      pendingRebase.current = null
      lastReported.current = ''
      visibleRef.current = anchor
      setMapVisible(anchor)
      userBrowseRef.current = false
      setWindowState({ key: destinationKey, start: continuousWindowStart(anchor, passage.paragraphs) })
    }
    if (pendingRebase.current) {
      const { anchor: place, offset } = pendingRebase.current
      pendingRebase.current = null
      const word = wordNode(place)
      if (word) {
        suppressScrollRef.current = true
        host.scrollTop += word.getBoundingClientRect().top - host.getBoundingClientRect().top - offset
      }
      return
    }
    if (layoutKeyRef.current !== passage.layoutKey) {
      layoutKeyRef.current = passage.layoutKey
      const visible = wordNode(visibleRef.current)
      if (visible) {
        suppressScrollRef.current = true
        host.scrollTop += visible.getBoundingClientRect().top - host.getBoundingClientRect().top - Math.min(host.clientHeight * .24, 140)
      }
      return
    }
    restoring.current = true
    const target = wordNode(anchor)
    if (!target) return
    suppressScrollRef.current = true
    host.scrollTop += target.getBoundingClientRect().top - host.getBoundingClientRect().top - Math.min(host.clientHeight * .24, 140)
    restoring.current = false
    if (landedKey.current !== destinationKey) {
      landedKey.current = destinationKey
      onLanded(epoch, anchor)
    }
  // Epoch/anchor changes are intentional navigation. Window changes preserve the visible offset above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationKey, windows, passage.layoutKey])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const keepVisible = () => {
      const word = wordNode(visibleRef.current)
      if (!word) return
      suppressScrollRef.current = true
      host.scrollTop += word.getBoundingClientRect().top - host.getBoundingClientRect().top - Math.min(host.clientHeight * .24, 140)
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(keepVisible)
    observer?.observe(host)
    window.addEventListener('resize', keepVisible)
    return () => { observer?.disconnect(); window.removeEventListener('resize', keepVisible) }
  }, [wordNode])

  useLayoutEffect(() => {
    if (!passage.playing || passage.browseWhileListening) return
    const follow = passage.follow
    if (!follow || follow.kind === 'none') return
    const place = { paragraphIndex: follow.paragraphIndex, wordIndex: follow.kind === 'word' ? follow.wordIndex : 0 }
    const host = hostRef.current
    const word = wordNode(place)
    if (!host || !word) return
    const top = word.getBoundingClientRect().top - host.getBoundingClientRect().top
    if (top >= host.clientHeight * .2 && top < host.clientHeight * .7) return
    suppressScrollRef.current = true
    host.scrollTop += top - host.clientHeight * .24
  }, [passage.follow, passage.playing, passage.browseWhileListening, wordNode])

  const rebase = (direction: 'previous' | 'next', visible: ContinuousReaderAnchor) => {
    const nextStart = continuousRebaseStart(direction, visible, start, passage.paragraphs)
    if (!nextStart) return
    const host = hostRef.current
    if (!host) return
    const word = wordNode(visible)
    if (!word) return
    pendingRebase.current = { anchor: visible, offset: word.getBoundingClientRect().top - host.getBoundingClientRect().top }
    setWindowState({ key: destinationKey, start: nextStart })
  }

  const measureMapEnd = () => {
    const host = hostRef.current
    if (!host) return
    const bounds = host.getBoundingClientRect()
    const last = [...host.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')].reverse().find(word => {
      const rect = word.getBoundingClientRect()
      return rect.height > 0 && rect.top < bounds.bottom && rect.bottom > bounds.top
    })
    if (last) setMapEnd({ paragraphIndex: Number(last.dataset.paragraphIndex), wordIndex: Number(last.dataset.wordIndex) })
  }
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measureMapEnd)
    return () => cancelAnimationFrame(frame)
  // The mounted source window has its real viewport geometry after layout.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows, passage.layoutKey])

  const onScroll = () => {
    measureMapEnd()
    const host = hostRef.current
    if (!host || restoring.current || !windows.length) return
    if (suppressScrollRef.current) { suppressScrollRef.current = false; return }
    if (!userBrowseRef.current) return
    const bounds = host.getBoundingClientRect()
    if (![...host.querySelectorAll<HTMLElement>('[data-testid="lab-word"]')].some(word => { const rect=word.getBoundingClientRect(); return rect.bottom > bounds.top && rect.top < bounds.bottom })) return
    let visible = firstVisibleWord(host)
    if (!visible) return
    // The first word of the restored line may precede its semantic saved word.
    // Retain the saved coordinate while that word is still on the top line.
    const held = wordNode(visibleRef.current)
    if (held && held.getBoundingClientRect().bottom > host.getBoundingClientRect().top
      && held.getBoundingClientRect().top <= host.getBoundingClientRect().top + Math.min(host.clientHeight * .24, 140)) visible = visibleRef.current
    visibleRef.current = visible
    setMapVisible(visible)
    const signature = `${visible.paragraphIndex}:${visible.wordIndex}`
    if (lastReported.current !== signature) {
      lastReported.current = signature
      onVisible(epoch, visible)
    }
    // Keep three bounded source windows and retain the same visible pixel when moving the slice.
    const nearEnd = host.scrollHeight - host.scrollTop - host.clientHeight < host.clientHeight
    const nearStart = host.scrollTop < host.clientHeight / 2
    if ((nearEnd && windows[windows.length - 1].nextAnchor) || (nearStart && (start.paragraphIndex > 0 || start.wordIndex > 0))) {
      rebase(nearEnd ? 'next' : 'previous', visible)
    }
  }

  const userBrowse = () => { userBrowseRef.current = true; suppressScrollRef.current = false; onUserBrowse?.() }
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    userBrowse()
    const host = hostRef.current
    if (!host || pendingRebase.current) return
    // At the physical edge no scroll event fires. Move the bounded source
    // window here so the wheel can reach the preceding/following prose.
    if (event.deltaY < 0 && host.scrollTop <= 0 && (start.paragraphIndex > 0 || start.wordIndex > 0))
      rebase('previous', visibleRef.current)
    else if (event.deltaY > 0 && host.scrollTop + host.clientHeight >= host.scrollHeight - 1 && windows[windows.length - 1]?.nextAnchor) {
      if (host.scrollHeight <= host.clientHeight + 1 && windows.length > 1) {
        // Very short paragraphs can put all three windows on one screen. The
        // next wheel advances by one overlapping window, or p0 would pin the
        // start forever and hide everything after the third window.
        const nextStart = windows[1].nextAnchor ? { paragraphIndex: windows[1].page.paragraphIndex, wordIndex: windows[1].page.from }
          : windows[windows.length - 1].nextAnchor!
        const nextWindows = continuousReaderWindows(passage.paragraphs, nextStart)
        const nextWord = nextWindows[0]?.page.segments?.find(segment => segment.to > segment.from)
        if (!nextWord) return
        const nextVisible = { paragraphIndex: nextWord.paragraphIndex, wordIndex: nextWord.from }
        visibleRef.current = nextVisible
        lastReported.current = `${nextVisible.paragraphIndex}:${nextVisible.wordIndex}`
        onVisible(epoch, nextVisible)
        pendingRebase.current = { anchor: nextVisible, offset: 0 }
        setWindowState({ key: destinationKey, start: nextStart })
      } else rebase('next', visibleRef.current)
    }
  }
  const jumpFromMap = (place: ContinuousReaderAnchor) => {
    userBrowse()
    visibleRef.current = place
    setMapVisible(place)
    lastReported.current = `${place.paragraphIndex}:${place.wordIndex}`
    onVisible(epoch, place)
    pendingRebase.current = { anchor: place, offset: Math.min((hostRef.current?.clientHeight ?? 600) * .24, 140) }
    setWindowState({ key: destinationKey, start: continuousWindowStart(place, passage.paragraphs) })
  }
  return <><SourceMinimap bookMap={bookMap} paragraphs={passage.paragraphs} visible={mapVisible} visibleEnd={mapEnd} onJump={jumpFromMap} />
  <div className="continuous-reader" data-testid="continuous-reader" ref={hostRef} onScroll={onScroll}
    onWheel={onWheel} onTouchStart={userBrowse} onPointerDown={userBrowse}
    onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) userBrowse() }}>
    {windows.map((window, index) => <div className="continuous-reader-window" data-window-first={window.firstParagraph} data-window-last={window.lastParagraph} key={`${window.page.paragraphIndex}:${window.page.from}`}>
      <LabPassage {...passage} readingPage={window.page} chapterEnd={window.nextAnchor ? undefined : passage.chapterEnd}
        onPreviewChapter={index === 0 ? passage.onPreviewChapter : undefined}
        compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" desktopSpread={false} plannedHyphens={false} tapZones="none" keyboardSelection />
    </div>)}
  </div></>
}
