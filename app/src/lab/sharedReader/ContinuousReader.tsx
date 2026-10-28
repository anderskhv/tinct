import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps } from 'react'
import { SourceMinimap, type SourceBookMap, type SourceMapCard } from './SourceMinimap'
import { LabPassage } from '../LabPassage'
import { tokenizeHearingWords } from '../labHearing'
import { buildHighlightRange } from '../labHighlights'
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

const EMPTY_COMPARE_PARAGRAPHS: string[] = []
const sourceChapters = new WeakMap<readonly string[], ContinuousReaderWindow[]>()

/** One mounted passage per chapter. Each LabPassage installs highlight/layout
 * observers, so retaining dozens of former window components would repeatedly
 * restyle and measure the whole chapter during its initial mount. */
export function continuousReaderWindows(paragraphs: readonly string[]): ContinuousReaderWindow[] {
  const cached = sourceChapters.get(paragraphs)
  if (cached) return cached
  const segments = paragraphs.map((paragraph, paragraphIndex) => ({
    paragraphIndex, from: 0, to: tokenizeHearingWords(paragraph).length,
  }))
  const windows: ContinuousReaderWindow[] = segments.length ? [{
    page: { ...segments[0], segments }, firstParagraph: 0, lastParagraph: paragraphs.length - 1,
    wordCount: segments.reduce((sum, segment) => sum + segment.to, 0), nextAnchor: null,
  }] : []
  sourceChapters.set(paragraphs, windows)
  return windows
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

/** A native chapter scroller. No position storage lives in this component. */
export function ContinuousReader({ passage, epoch, anchor, onVisible, onLanded, onUserBrowse, bookMap, cards }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const nativeDragEpoch = useRef<string | null>(null)
  const epochKey = `${epoch.bookId}/${epoch.editionKey}/${epoch.chapterNumber}/${epoch.navigation}`
  const destinationKey = `${epochKey}/${anchor.paragraphIndex}:${anchor.wordIndex}`
  const [mapVisible, setMapVisible] = useState(anchor)
  const [mapJump, setMapJump] = useState(0)
  const [mapEnd, setMapEnd] = useState<ContinuousReaderAnchor | undefined>()
  const windows = useMemo(() => continuousReaderWindows(passage.paragraphs), [passage.paragraphs])
  const navigationKey = useRef(destinationKey)
  const lastReported = useRef('')
  const landedKey = useRef('')
  const visibleRef = useRef(anchor)
  const layoutKeyRef = useRef(passage.layoutKey)
  const userBrowseRef = useRef(false)
  const suppressScrollRef = useRef(false)
  const lastScrollTop = useRef(0)
  const restoring = useRef(true)
  const pendingJump = useRef<{ anchor: ContinuousReaderAnchor; offset: number } | null>(null)

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
    if (navigationKey.current !== destinationKey) {
      pendingJump.current = null
      lastReported.current = ''
      visibleRef.current = anchor
      setMapVisible(anchor)
      userBrowseRef.current = false
      navigationKey.current = destinationKey
    }
    if (pendingJump.current) {
      const { anchor: place, offset } = pendingJump.current
      pendingJump.current = null
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
    // A refreshed paragraph array can rebuild the chapter fragments without any
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
  // Epoch/anchor changes and minimap jumps are intentional navigation.
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
  // A mouse drag can begin on paper outside LabPassage. Let the browser
  // select naturally, then translate only this reader's source words into the
  // same range used by drags that began on a word.
  const beginNativeDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    nativeDragEpoch.current = null
    const target = event.target instanceof Element ? event.target : null
    if (event.pointerType === 'touch' || (event.button != null && event.button !== 0)
      || !target || target.closest('[data-testid="lab-word"], .source-margin-item, button, a, input, textarea, select')
      || !(target === event.currentTarget || target.closest('.continuous-reader-paper'))) return
    const selection = window.getSelection()
    if (selection?.anchorNode && event.currentTarget.contains(selection.anchorNode)) selection.removeAllRanges()
    nativeDragEpoch.current = epochKey
  }
  const finishNativeDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const started = nativeDragEpoch.current
    nativeDragEpoch.current = null
    if (started !== epochKey || !passage.onSelectRange) return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return
    const native = selection.getRangeAt(0)
    const paper = event.currentTarget.querySelector('.continuous-reader-paper')
    if (!paper || !paper.contains(native.startContainer) || !paper.contains(native.endContainer)) return
    const words = [...paper.querySelectorAll<HTMLElement>('[data-testid="lab-word"][data-paragraph-index][data-word-index]')]
      .filter(word => {
        if (!native.intersectsNode(word)) return false
        // intersectsNode includes an endpoint at the end/start of a word.
        // Require selected characters, not merely a shared DOM boundary.
        const overlap = document.createRange()
        overlap.selectNodeContents(word)
        if (native.compareBoundaryPoints(Range.START_TO_START, overlap) > 0) overlap.setStart(native.startContainer, native.startOffset)
        if (native.compareBoundaryPoints(Range.END_TO_END, overlap) < 0) overlap.setEnd(native.endContainer, native.endOffset)
        return Boolean(overlap.toString().trim())
      })
    if (!words.length) return
    const place = (word: HTMLElement) => ({ paragraphIndex: Number(word.dataset.paragraphIndex), wordIndex: Number(word.dataset.wordIndex) })
    const range = buildHighlightRange(passage.paragraphs, place(words[0]), place(words[words.length - 1]))
    if (!range?.text.trim()) return
    selection.removeAllRanges()
    passage.onSelectRange(range, event.clientX, event.clientY)
  }
  const jumpFromMap = (place: ContinuousReaderAnchor) => {
    userBrowse()
    visibleRef.current = place
    setMapVisible(place)
    setMapEnd(undefined)
    setMapJump(revision => revision + 1)
    lastReported.current = `${place.paragraphIndex}:${place.wordIndex}`
    onVisible(epoch, place)
    pendingJump.current = { anchor: place, offset: Math.min((hostRef.current?.clientHeight ?? 600) * .24, 140) }
  }
  // Minimap position changes do not change the passage. Reuse its element so
  // tracking a scroll does not reconcile every word in a long chapter.
  const sourcePassages = useMemo(() => windows.map((window, index) => <div className="continuous-reader-window" data-window-first={window.firstParagraph} data-window-last={window.lastParagraph} key={`${window.page.paragraphIndex}:${window.page.from}`}>
      <LabPassage {...passage} readingPage={window.page} chapterEnd={window.nextAnchor ? undefined : passage.chapterEnd}
        onPreviewChapter={index === 0 ? passage.onPreviewChapter : undefined}
        compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" desktopSpread={false} plannedHyphens={false} tapZones="none" keyboardSelection />
    </div>), [windows, passage])
  return <><SourceMinimap cards={cards} highlights={passage.highlights?.filter(mark => mark.chapterNumber === passage.chapterNumber)} bookMap={bookMap} paragraphs={passage.paragraphs} visible={mapVisible} visibleEnd={mapEnd} onJump={jumpFromMap} />
  <div className="continuous-reader" data-testid="continuous-reader" ref={hostRef} onScroll={onScroll}
    onWheel={userBrowse} onTouchStart={userBrowse} onPointerDown={event => { beginNativeDrag(event); if (!(event.target instanceof Element && event.target.closest('.source-margin-item'))) userBrowse() }}
    onPointerUp={finishNativeDrag} onPointerCancel={() => { nativeDragEpoch.current = null }}
    onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) userBrowse() }}>
    <div className="continuous-reader-paper">
    {sourcePassages}
    </div>
  </div></>
}
