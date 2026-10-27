import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type WheelEvent } from 'react'
import { flushSync } from 'react-dom'
import { SourceMinimap, type SourceBookMap, type SourceMapCard } from './SourceMinimap'
import { LabPassage } from '../LabPassage'
import { isLabVerseMarker, tokenizeHearingWords } from '../labHearing'
import { type ContinuousReaderAnchor, type ContinuousReaderWindow } from './continuousReaderWindow'
import type { ContinuousReaderEpoch } from './continuousReaderEpoch'
import './continuousReader.css'

type Passage = ComponentProps<typeof LabPassage>
type Props = {
  passage: Pick<Passage, 'chapterTitle' | 'paragraphs' | 'chapterNumber' | 'highlights' | 'selectingRange' | 'onSelectRange' | 'onSelectingChange' | 'footnotes' | 'onFootnote' | 'onOpenFigure' | 'onPreviewChapter' | 'chapterActionsBusy' | 'chapterEnd' | 'follow' | 'followParagraphs' | 'playing' | 'browseWhileListening' | 'onSeekToWord' | 'inlineHearingPaint' | 'markedIndexes' | 'onMark' | 'focusParagraph' | 'discussedParagraph' | 'layoutKey'>
  epoch: ContinuousReaderEpoch
  anchor: ContinuousReaderAnchor
  onVisible: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  onLanded: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  cards?: readonly SourceMapCard[]
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

const sourceWindowPlans = new WeakMap<readonly string[], ContinuousReaderWindow[]>()

/** Stable source fragments: scrolling never changes where a paragraph wraps. */
function sourceWindowPlan(paragraphs: readonly string[]): ContinuousReaderWindow[] {
  const cached = sourceWindowPlans.get(paragraphs)
  if (cached) return cached
  const windows: ContinuousReaderWindow[] = []
  let segments: NonNullable<ContinuousReaderWindow['page']['segments']> = []
  let count = 0
  const flush = () => {
    if (!segments.length) return
    const first = segments[0]
    windows.push({ page: { ...first, segments }, firstParagraph: first.paragraphIndex,
      lastParagraph: segments[segments.length - 1].paragraphIndex, wordCount: count, nextAnchor: null })
    segments = []; count = 0
  }
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const tokens = tokenizeHearingWords(paragraph)
    let from = 0
    do {
      let to = Math.min(tokens.length, from + WINDOW_WORDS)
      if (to < tokens.length && isLabVerseMarker(tokens[to - 1]?.text || '')) to--
      const size = to - from
      // An ordinary paragraph is indivisible. A long paragraph's chunks always
      // start at the same source word, regardless of the current viewport.
      if (segments.length && (count + size > WINDOW_WORDS || segments.length >= WINDOW_PARAGRAPHS)) flush()
      segments.push({ paragraphIndex, from, to }); count += size
      from = to
      if (from < tokens.length) flush()
    } while (from < tokens.length)
  })
  flush()
  windows.forEach((window, index) => {
    const next = windows[index + 1]?.page
    window.nextAnchor = next ? { paragraphIndex: next.paragraphIndex, wordIndex: next.from } : null
  })
  sourceWindowPlans.set(paragraphs, windows)
  return windows
}

function containsWord(window: ContinuousReaderWindow, anchor: ContinuousReaderAnchor) {
  return window.page.segments?.some(segment => segment.paragraphIndex === anchor.paragraphIndex
    && segment.from <= anchor.wordIndex && (segment.to > anchor.wordIndex || segment.from === segment.to))
}

export function continuousReaderWindows(paragraphs: readonly string[], start: ContinuousReaderAnchor): ContinuousReaderWindow[] {
  const plan = sourceWindowPlan(paragraphs)
  const index = plan.findIndex(window => containsWord(window, start))
  return index < 0 ? [] : plan.slice(index, index + WINDOW_COUNT)
}

export function continuousRebaseStart(
  direction: 'previous' | 'next', visible: ContinuousReaderAnchor,
  start: ContinuousReaderAnchor, paragraphs: readonly string[],
): ContinuousReaderAnchor | null {
  const plan = sourceWindowPlan(paragraphs)
  const current = plan.findIndex(window => containsWord(window, start))
  const next = current + (direction === 'next' ? 1 : -1)
  if (current < 0 || next < 0 || next >= plan.length
    || !plan.slice(next, next + WINDOW_COUNT).some(window => containsWord(window, visible))) return null
  return { paragraphIndex: plan[next].page.paragraphIndex, wordIndex: plan[next].page.from }
}

type WordGeometry = { node: HTMLElement; top: number; bottom: number; height: number; anchor: ContinuousReaderAnchor }

/** Content coordinates remain stable while only the scroll offset changes. */
export function measureContinuousWords(host: HTMLElement): WordGeometry[] {
  const offset = host.scrollTop - host.getBoundingClientRect().top
  return Array.from(host.querySelectorAll<HTMLElement>('[data-testid="lab-word"][data-paragraph-index][data-word-index]'), node => {
    const rect = node.getBoundingClientRect()
    return { node, top: rect.top + offset, bottom: rect.bottom + offset, height: rect.height,
      anchor: { paragraphIndex: Number(node.dataset.paragraphIndex), wordIndex: Number(node.dataset.wordIndex) } }
  })
}

export function continuousViewportWords(words: readonly WordGeometry[], scrollTop: number, height: number) {
  const bottom = scrollTop + height
  const limit = scrollTop + Math.min(height * .24, 140)
  let previous: WordGeometry | undefined
  let first: WordGeometry | undefined
  let last: WordGeometry | undefined
  let hasInk = false
  for (const word of words) {
    if (word.bottom > scrollTop && word.top < bottom) {
      hasInk = true
      if (word.height > 0) last = word
    }
    if (!first && word.top >= limit) first = previous && previous.bottom > scrollTop ? previous : word
    previous = word
  }
  return { first: first ?? previous, last, hasInk }
}

const sameAnchor = (a: ContinuousReaderAnchor | undefined, b: ContinuousReaderAnchor) =>
  a?.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex

/** A bounded, scrollable source window. No position storage lives in this component. */
export function ContinuousReader({ passage, epoch, anchor, onVisible, onLanded, onUserBrowse, bookMap, cards }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const epochKey = `${epoch.bookId}/${epoch.editionKey}/${epoch.chapterNumber}/${epoch.navigation}`
  const destinationKey = `${epochKey}/${anchor.paragraphIndex}:${anchor.wordIndex}`
  const [mapVisible, setMapVisible] = useState(anchor)
  const [mapJump, setMapJump] = useState(0)
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
  const lastScrollTop = useRef(0)
  const restoring = useRef(true)
  const pendingRebase = useRef<{ anchor: ContinuousReaderAnchor; offset: number } | null>(null)

  const geometryRef = useRef<WordGeometry[] | null>(null)
  const sourceWords = () => {
    const host = hostRef.current
    if (!host) return []
    return geometryRef.current ?? (geometryRef.current = measureContinuousWords(host))
  }

  const wordNode = useCallback((place: ContinuousReaderAnchor) => {
    return hostRef.current?.querySelector<HTMLElement>(`[data-testid="lab-word"][data-paragraph-index="${place.paragraphIndex}"][data-word-index="${place.wordIndex}"]`) ?? undefined
  }, [])

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    geometryRef.current = null
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
        lastScrollTop.current = host.scrollTop
      }
      return
    }
    if (layoutKeyRef.current !== passage.layoutKey) {
      layoutKeyRef.current = passage.layoutKey
      const visible = wordNode(visibleRef.current)
      if (visible) {
        suppressScrollRef.current = true
        host.scrollTop += visible.getBoundingClientRect().top - host.getBoundingClientRect().top - Math.min(host.clientHeight * .24, 140)
        lastScrollTop.current = host.scrollTop
      }
      return
    }
    // A refreshed paragraph array can rebuild the bounded windows without any
    // navigation. Replaying the original anchor here jumps a scrolling reader
    // back to the place where this chapter was first opened.
    if (landedKey.current === destinationKey) return
    restoring.current = true
    const target = wordNode(anchor)
    if (!target) return
    suppressScrollRef.current = true
    host.scrollTop += target.getBoundingClientRect().top - host.getBoundingClientRect().top - Math.min(host.clientHeight * .24, 140)
    lastScrollTop.current = host.scrollTop
    restoring.current = false
    if (landedKey.current !== destinationKey) {
      landedKey.current = destinationKey
      onLanded(epoch, anchor)
    }
  // Epoch/anchor changes are intentional navigation. Window changes preserve the visible offset above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationKey, windows, passage.layoutKey, mapJump])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const keepVisible = () => {
      geometryRef.current = null
      const word = wordNode(visibleRef.current)
      if (!word) return
      suppressScrollRef.current = true
      host.scrollTop += word.getBoundingClientRect().top - host.getBoundingClientRect().top - Math.min(host.clientHeight * .24, 140)
      lastScrollTop.current = host.scrollTop
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(keepVisible)
    observer?.observe(host)
    // Font/image/paragraph reflow can change word coordinates without changing
    // the scroll viewport. Observe the paper separately; do not move the place.
    const paperObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { geometryRef.current = null })
    const paper = host.querySelector('.continuous-reader-paper')
    if (paper) paperObserver?.observe(paper)
    window.addEventListener('resize', keepVisible)
    const invalidateWords = () => { geometryRef.current = null }
    document.fonts?.addEventListener('loadingdone', invalidateWords)
    return () => { observer?.disconnect(); paperObserver?.disconnect(); window.removeEventListener('resize', keepVisible); document.fonts?.removeEventListener('loadingdone', invalidateWords) }
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
    lastScrollTop.current = host.scrollTop
  }, [passage.follow, passage.playing, passage.browseWhileListening, wordNode])

  const rebase = (direction: 'previous' | 'next', visible: ContinuousReaderAnchor) => {
    const nextStart = continuousRebaseStart(direction, visible, start, passage.paragraphs)
    if (!nextStart) return
    const host = hostRef.current
    if (!host) return
    const word = wordNode(visible)
    if (!word) return
    // A long companion is part of this same scroller. Removing its source
    // while its body/input is visible would hide the card during reading.
    const frame = host.getBoundingClientRect()
    const readingCard = [...host.querySelectorAll<HTMLElement>('.source-margin-item[data-open="true"]')].some(card => {
      const rect = card.getBoundingClientRect()
      return card.contains(document.activeElement) || rect.bottom > frame.top && rect.top < frame.bottom
    })
    if (readingCard) return
    // Do not remove preceding content while the next source window still
    // starts below the viewport top. Restoring the held word would require a
    // negative scrollTop, which browsers clamp and makes the next wheel stall.
    const following = host.querySelectorAll<HTMLElement>('.continuous-reader-window')[1]
    if (direction === 'next' && following && following.getBoundingClientRect().top > host.getBoundingClientRect().top) return
    pendingRebase.current = { anchor: visible, offset: word.getBoundingClientRect().top - host.getBoundingClientRect().top }
    // Commit the window and its layout-effect offset restoration together. A
    // deferred continuous-event update can otherwise restore an obsolete pixel
    // after native momentum has already advanced (or reversed) the scroller.
    flushSync(() => setWindowState({ key: destinationKey, start: nextStart }))
  }

  const measureMapEnd = () => {
    const host = hostRef.current
    if (!host) return
    const { last } = continuousViewportWords(sourceWords(), host.scrollTop, host.clientHeight)
    if (last) setMapEnd(previous => sameAnchor(previous, last.anchor) ? previous : last.anchor)
  }
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measureMapEnd)
    return () => cancelAnimationFrame(frame)
  // The mounted source window has its real viewport geometry after layout.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows, passage.layoutKey])

  const onScroll = () => {
    const host = hostRef.current
    if (!host || restoring.current || !windows.length) return
    const movement = host.scrollTop - lastScrollTop.current
    lastScrollTop.current = host.scrollTop
    const words = sourceWords()
    const viewport = continuousViewportWords(words, host.scrollTop, host.clientHeight)
    if (viewport.last) setMapEnd(previous => sameAnchor(previous, viewport.last!.anchor) ? previous : viewport.last!.anchor)
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false
      // Browsers can combine our offset correction and subsequent momentum
      // into one notification. Suppress only the correction itself.
      if (movement === 0) return
    }
    if (!userBrowseRef.current || !viewport.hasInk || !viewport.first) return
    let visible = viewport.first.anchor
    // Retain the semantic saved word while it is still on the top line.
    const held = words.find(word => sameAnchor(word.anchor, visibleRef.current))
    if (held && held.bottom > host.scrollTop
      && held.top <= host.scrollTop + Math.min(host.clientHeight * .24, 140)) visible = visibleRef.current
    visibleRef.current = visible
    setMapVisible(previous => sameAnchor(previous, visible) ? previous : visible)
    const signature = `${visible.paragraphIndex}:${visible.wordIndex}`
    if (lastReported.current !== signature) {
      lastReported.current = signature
      onVisible(epoch, visible)
    }
    // Keep three bounded source windows and retain the same visible pixel when moving the slice.
    const nearEnd = movement > 0 && host.scrollHeight - host.scrollTop - host.clientHeight < host.clientHeight
    const nearStart = movement < 0 && host.scrollTop < host.clientHeight / 2
    if ((nearEnd && windows[windows.length - 1].nextAnchor) || (nearStart && (start.paragraphIndex > 0 || start.wordIndex > 0))) {
      rebase(nearEnd ? 'next' : 'previous', visible)
    }
  }

  // Rail cards are React portals: their pointer/wheel events do not bubble
  // through this component's React tree, although they share its DOM scroller.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const cardTarget = (event: Event) => event.target instanceof Element && !!event.target.closest('.source-margin-item')
    const pointer = (event: PointerEvent) => { if (cardTarget(event)) userBrowseRef.current = false }
    const wheel = (event: globalThis.WheelEvent) => {
      if (!cardTarget(event)) return
      userBrowseRef.current = true; suppressScrollRef.current = false; onUserBrowse?.()
    }
    host.addEventListener('pointerdown', pointer, true)
    host.addEventListener('wheel', wheel, { capture: true, passive: true })
    return () => { host.removeEventListener('pointerdown', pointer, true); host.removeEventListener('wheel', wheel, true) }
  }, [onUserBrowse])
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
        flushSync(() => setWindowState({ key: destinationKey, start: nextStart }))
      } else rebase('next', visibleRef.current)
    }
  }
  const jumpFromMap = (place: ContinuousReaderAnchor) => {
    userBrowse()
    visibleRef.current = place
    setMapVisible(place)
    setMapEnd(undefined)
    setMapJump(revision => revision + 1)
    lastReported.current = `${place.paragraphIndex}:${place.wordIndex}`
    onVisible(epoch, place)
    pendingRebase.current = { anchor: place, offset: Math.min((hostRef.current?.clientHeight ?? 600) * .24, 140) }
    setWindowState({ key: destinationKey, start: continuousWindowStart(place, passage.paragraphs) })
  }
  return <><SourceMinimap cards={cards} highlights={passage.highlights?.filter(mark => mark.chapterNumber === passage.chapterNumber)} bookMap={bookMap} paragraphs={passage.paragraphs} visible={mapVisible} visibleEnd={mapEnd} onJump={jumpFromMap} />
  <div className="continuous-reader" data-testid="continuous-reader" ref={hostRef} onScroll={onScroll}
    onWheel={onWheel} onTouchStart={userBrowse} onPointerDown={event => { if (!(event.target instanceof Element && event.target.closest('.source-margin-item'))) userBrowse() }}
    onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) userBrowse() }}>
    <div className="continuous-reader-paper">
    {windows.map((window, index) => <div className="continuous-reader-window" data-window-first={window.firstParagraph} data-window-last={window.lastParagraph} key={`${window.page.paragraphIndex}:${window.page.from}`}>
      <LabPassage {...passage} readingPage={window.page} chapterEnd={window.nextAnchor ? undefined : passage.chapterEnd}
        onPreviewChapter={index === 0 ? passage.onPreviewChapter : undefined}
        compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" desktopSpread={false} plannedHyphens={false} tapZones="none" keyboardSelection />
    </div>)}
    </div>
  </div></>
}
