import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps } from 'react'
import { SourceMinimap, type SourceMapCard } from './SourceMinimap'
import { LabPassage } from '../LabPassage'
import { LabChapterHeading } from '../LabChapterHeading'
import { buildHighlightRange, type LabHighlight } from '../labHighlights'
import { continuousReaderWindows, continuousViewportWords } from './ContinuousReader'
import { type ContinuousReaderAnchor } from './continuousReaderWindow'
import type { ContinuousReaderEpoch } from './continuousReaderEpoch'
import { bookScrollMounted, chapterAtReadingLine, chapterWordEstimate, type BookScrollBlock, type BookScrollUnit } from './bookScroll'
import type { BookScrollChapterText } from './useBookScrollChapters'
import type { FollowTarget } from '../labFollow'
import './continuousReader.css'
import './bookScroll.css'

/**
 * Book scroll (try-out, 11 Nov 2026; `?bookScroll=1`): the Margin reader's scroller holding a whole
 * scroll unit (bookScroll.ts) instead of one chapter.
 *
 * One chapter is the reader's own, exactly as in ContinuousReader: its words carry the reader's
 * word coordinates, and every report (place, tail, read to the end) is about it and is checked
 * against the reader's epoch. The chapters around it are painted with the same typography but as
 * inert text (LabPassage `openingOnly`, whose words are "lab-opening-word", never "lab-word"), so
 * nothing that addresses the reader's words can land in a neighbour.
 *
 * When the reading line crosses into a neighbour the reader is asked to make that chapter its own
 * (`onCrossChapter`), at the word on the line. No place is reported for a chapter that is not the
 * reader's own, so a saved place is always a coherent chapter + paragraph + word. Far chapters are
 * placeholders of their measured (or estimated) height; the word on the reading line is held in
 * place across every mount, release and reflow, so the text never jumps.
 */

type Passage = ComponentProps<typeof LabPassage>
type Props = {
  passage: Pick<Passage, 'chapterTitle' | 'paragraphs' | 'chapterNumber' | 'highlights' | 'selectingRange' | 'onSelectRange' | 'onSelectingChange' | 'footnotes' | 'onFootnote' | 'onOpenFigure' | 'onPreviewChapter' | 'chapterActionsBusy' | 'chapterEnd' | 'follow' | 'followParagraphs' | 'playing' | 'browseWhileListening' | 'onSeekToWord' | 'inlineHearingPaint' | 'markedIndexes' | 'onMark' | 'focusParagraph' | 'discussedParagraph' | 'layoutKey'>
  epoch: ContinuousReaderEpoch
  anchor: ContinuousReaderAnchor
  unit: BookScrollUnit
  /** The loaded text of chapters other than the reader's own. */
  texts: ReadonlyMap<number, BookScrollChapterText>
  onRequestChapters: (numbers: readonly number[]) => void
  /** The reading line is in another chapter of the unit: make it the reader's own, at this word. */
  onCrossChapter: (chapterNumber: number, anchor: ContinuousReaderAnchor) => void
  onJumpChapter: (chapterNumber: number) => void
  /** Every highlight in the book: a neighbour paints its own. */
  bookHighlights?: readonly LabHighlight[]
  onVisible: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  onLanded: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  onTail?: (epoch: ContinuousReaderEpoch, tail: ContinuousReaderAnchor) => void
  onReadToEnd?: (epoch: ContinuousReaderEpoch, last: ContinuousReaderAnchor) => void
  cards?: readonly SourceMapCard[]
  onUserBrowse?: () => void
}

const EMPTY_COMPARE_PARAGRAPHS: string[] = []
const NO_FOLLOW: FollowTarget = { kind: 'none' }
const NO_FOLLOW_PARAGRAPHS: Passage['followParagraphs'] = []
const NO_MARKS = new Set<number>()
const NO_HIGHLIGHTS: LabHighlight[] = []
const WORDS = '[data-paragraph-index][data-word-index]:is([data-testid="lab-word"],[data-testid="lab-opening-word"])'
/** A handoff the reader did not take (its chapter failed to load) may be asked again after this long. */
const HANDOFF_RETRY_MS = 3000

type WordGeometry = { node: HTMLElement; top: number; bottom: number; height: number; anchor: ContinuousReaderAnchor }

const sameAnchor = (a: ContinuousReaderAnchor | undefined | null, b: ContinuousReaderAnchor) =>
  a?.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex

const lineOffset = (host: HTMLElement) => Math.min(host.clientHeight * .24, 140)

/** A neighbouring chapter: the reader's typography, inert words. */
const NeighbourChapter = memo(function NeighbourChapter({ number, title, paragraphs, highlights, layoutKey, onOpenFigure }: {
  number: number; title: string; paragraphs: string[]; highlights: LabHighlight[]; layoutKey?: string; onOpenFigure?: Passage['onOpenFigure']
}) {
  const page = continuousReaderWindows(paragraphs)[0]?.page
  return <div className="lab-passage lab-book is-reading is-touch-scroll book-scroll-neighbour">
    <LabChapterHeading title={title} measuring />
    <div className="lab-book-columns"><div className="lab-book-col">
      {page && <LabPassage openingOnly plainHighlights chapterTitle={title} chapterNumber={number} paragraphs={paragraphs} readingPage={page}
        compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" follow={NO_FOLLOW} followParagraphs={NO_FOLLOW_PARAGRAPHS}
        markedIndexes={NO_MARKS} highlights={highlights} tapZones="none" plannedHyphens={false} layoutKey={layoutKey} onOpenFigure={onOpenFigure} />}
    </div></div>
  </div>
})

export function BookScrollReader({ passage, epoch, anchor, unit, texts, onRequestChapters, onCrossChapter, onJumpChapter, bookHighlights, onVisible, onLanded, onTail, onReadToEnd, onUserBrowse, cards }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const nativeDragEpoch = useRef<string | null>(null)
  const live = passage.chapterNumber ?? epoch.chapterNumber
  const order = useMemo(() => unit.chapters.map(chapter => chapter.number), [unit])
  const liveIndex = order.indexOf(live)
  const epochKey = `${epoch.bookId}/${epoch.editionKey}/${epoch.chapterNumber}/${epoch.navigation}`
  const destinationKey = `${epochKey}/${anchor.paragraphIndex}:${anchor.wordIndex}`
  const [mapVisible, setMapVisible] = useState(anchor)
  const [mapJump, setMapJump] = useState(0)
  const [mapEnd, setMapEnd] = useState<ContinuousReaderAnchor | undefined>()
  const [mounted, setMounted] = useState<number[]>(() => bookScrollMounted(order, liveIndex, liveIndex, [], live))
  const mountedRef = useRef(mounted)
  mountedRef.current = mounted
  /** Bumped when a chapter is measured for the first time, so placeholders take the better estimate. */
  const [measured, setMeasured] = useState(0)
  const windows = useMemo(() => continuousReaderWindows(passage.paragraphs), [passage.paragraphs])
  const navigationKey = useRef(destinationKey)
  /** The chapter and anchor of the last destination, to tell a real navigation from the reader's own bookkeeping. */
  const lastDestination = useRef({ chapter: epoch.chapterNumber, anchor })
  const lastReported = useRef('')
  const landedKey = useRef('')
  const visibleRef = useRef(anchor)
  const userBrowseRef = useRef(false)
  const suppressScrollRef = useRef(false)
  const lastScrollTop = useRef(0)
  const restoring = useRef(true)
  const pendingJump = useRef<{ anchor: ContinuousReaderAnchor; offset: number } | null>(null)
  const holdLanding = useRef(false)
  /** The handoff asked of the reader and not yet taken. */
  const handoff = useRef<{ chapter: number; anchor: ContinuousReaderAnchor; at: number; arriving?: boolean } | null>(null)
  /** The word (or, where no word is painted, the chapter) on the reading line and where it sits in the text (content coordinates). */
  const hold = useRef<{ chapter: number; anchor: ContinuousReaderAnchor | null; y: number } | null>(null)
  const heights = useRef(new Map<number, number>())
  /** A placeholder's estimated height, fixed once made: only the chapter's measured height replaces it. */
  const estimates = useRef(new Map<number, number>())
  const metrics = useRef({ words: 0, paragraphs: 0, px: 0 })
  const epochRef = useRef(epoch)
  epochRef.current = epoch
  const liveRef = useRef(live)
  liveRef.current = live
  const playingRef = useRef(passage.playing)
  playingRef.current = passage.playing

  const blocksRef = useRef<BookScrollBlock[] | null>(null)
  const wordsRef = useRef(new Map<number, WordGeometry[]>())
  const invalidate = () => { blocksRef.current = null; wordsRef.current.clear() }
  const blockNode = useCallback((chapter: number) =>
    hostRef.current?.querySelector<HTMLElement>(`[data-book-scroll-chapter="${chapter}"]`) ?? null, [])
  const blocks = () => {
    const host = hostRef.current
    if (!host) return []
    if (blocksRef.current) return blocksRef.current
    const offset = host.scrollTop - host.getBoundingClientRect().top
    return blocksRef.current = Array.from(host.querySelectorAll<HTMLElement>('[data-book-scroll-chapter]'), node => ({
      chapterNumber: Number(node.dataset.bookScrollChapter), top: node.getBoundingClientRect().top + offset,
    }))
  }
  const wordsOf = (chapter: number): WordGeometry[] => {
    const host = hostRef.current
    const cached = wordsRef.current.get(chapter)
    if (cached) return cached
    const block = blockNode(chapter)
    if (!host || !block) return []
    const offset = host.scrollTop - host.getBoundingClientRect().top
    const words = Array.from(block.querySelectorAll<HTMLElement>(WORDS), node => {
      const rect = node.getBoundingClientRect()
      return { node, top: rect.top + offset, bottom: rect.bottom + offset, height: rect.height,
        anchor: { paragraphIndex: Number(node.dataset.paragraphIndex), wordIndex: Number(node.dataset.wordIndex) } }
    })
    wordsRef.current.set(chapter, words)
    return words
  }
  const wordNode = useCallback((chapter: number, place: ContinuousReaderAnchor) =>
    blockNode(chapter)?.querySelector<HTMLElement>(`[data-paragraph-index="${place.paragraphIndex}"][data-word-index="${place.wordIndex}"]:is([data-testid="lab-word"],[data-testid="lab-opening-word"])`) ?? null, [blockNode])

  /** Remember what is on the reading line, so it can be kept there when the text around it changes size. */
  const captureHold = () => {
    const host = hostRef.current
    if (!host) return
    const chapter = chapterAtReadingLine(blocks(), host.scrollTop + lineOffset(host)) ?? liveRef.current
    const first = continuousViewportWords(wordsOf(chapter), host.scrollTop, host.clientHeight).first
    if (first) { hold.current = { chapter, anchor: first.anchor, y: first.top }; return }
    const block = blocks().find(item => item.chapterNumber === chapter)
    hold.current = block ? { chapter, anchor: null, y: block.top } : null
  }
  /**
   * Put the held word back where it was. Its place is kept in content coordinates, so a scroll the
   * reader made since it was noted is kept too: only text that grew or shrank above it is undone.
   */
  const reanchor = () => {
    const host = hostRef.current
    const held = hold.current
    if (!host || !held) return 0
    const node = held.anchor ? wordNode(held.chapter, held.anchor) : blockNode(held.chapter)
    if (!node) return 0
    const y = node.getBoundingClientRect().top - host.getBoundingClientRect().top + host.scrollTop
    const delta = y - held.y
    if (Math.abs(delta) < .5) return 0
    held.y = y
    suppressScrollRef.current = true
    host.scrollTop += delta
    lastScrollTop.current += delta
    invalidate()
    return delta
  }

  /** Mount the chapters in and around the viewport, release the far ones, and ask for missing text. */
  const updateMounted = () => {
    const host = hostRef.current
    if (!host || !order.length) return
    const all = blocks()
    const from = host.scrollTop - host.clientHeight * .5
    const to = host.scrollTop + host.clientHeight * 1.5
    let first = -1
    let last = -1
    all.forEach((block, index) => {
      const bottom = all[index + 1]?.top ?? Number.POSITIVE_INFINITY
      if (bottom > from && block.top < to) { if (first < 0) first = index; last = index }
    })
    if (first < 0) { first = last = Math.max(0, order.indexOf(liveRef.current)) }
    const next = bookScrollMounted(order, first, last, mountedRef.current, liveRef.current)
    if (next.length !== mountedRef.current.length || next.some((number, index) => number !== mountedRef.current[index])) {
      mountedRef.current = next
      setMounted(next)
    }
    const missing = next.filter(number => number !== liveRef.current && !texts.has(number))
    if (missing.length) onRequestChapters(missing)
  }

  const structureKey = `${live}|${mounted.filter(number => number === live || texts.has(number)).join(',')}|${passage.layoutKey ?? ''}|${measured}`
  const structureRef = useRef('')

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    invalidate()
    // What is painted now has its real height: a released chapter keeps it as its placeholder.
    let learned = false
    for (const node of host.querySelectorAll<HTMLElement>('[data-book-scroll-chapter][data-book-scroll-painted="true"]')) {
      const number = Number(node.dataset.bookScrollChapter)
      const height = node.offsetHeight
      if (!(height > 0)) continue
      if (!heights.current.has(number)) {
        const chapter = unit.chapters.find(item => item.number === number)
        const paragraphs = number === live ? passage.paragraphs : texts.get(number)?.paragraphs
        if (chapter && paragraphs) {
          metrics.current.words += continuousReaderWindows(paragraphs)[0]?.wordCount ?? 0
          metrics.current.paragraphs += paragraphs.length
          metrics.current.px += height
          learned = true
        }
      }
      heights.current.set(number, height)
    }
    if (learned) setMeasured(count => count + 1)
    const structureChanged = structureRef.current !== structureKey
    structureRef.current = structureKey
    if (navigationKey.current !== destinationKey) {
      navigationKey.current = destinationKey
      const taken = handoff.current
      const before = lastDestination.current
      lastDestination.current = { chapter: epoch.chapterNumber, anchor }
      if (taken && before.chapter === epoch.chapterNumber && sameAnchor(before.anchor, anchor)) {
        // Only the navigation count moved: the reader has started loading the chapter that was asked
        // for and still shows this one, at the same anchor. Nothing lands; the page stays where it is.
        landedKey.current = destinationKey
        if (structureChanged) reanchor()
        return
      }
      handoff.current = null
      if (taken && taken.chapter === epoch.chapterNumber && sameAnchor(taken.anchor, anchor)) {
        // The reader took the chapter the reading line is in. Nothing moves: the same words stay
        // where they are, now as the reader's own.
        reanchor()
        visibleRef.current = anchor
        setMapVisible(anchor)
        lastReported.current = `${anchor.paragraphIndex}:${anchor.wordIndex}`
        landedKey.current = destinationKey
        restoring.current = false
        onLanded(epoch, anchor)
        return
      }
      if (taken && taken.chapter === epoch.chapterNumber && !taken.arriving) {
        // The chapter arrives one render before its anchor (the reader sets the anchor in a layout
        // effect of its own). Nothing lands on the outgoing chapter's anchor: wait for the real one.
        handoff.current = { ...taken, arriving: true }
        reanchor()
        return
      }
      pendingJump.current = null
      holdLanding.current = false
      lastReported.current = ''
      visibleRef.current = anchor
      setMapVisible(anchor)
      userBrowseRef.current = false
    }
    if (pendingJump.current) {
      const { anchor: place, offset } = pendingJump.current
      pendingJump.current = null
      const word = wordNode(live, place)
      if (word) {
        suppressScrollRef.current = true
        host.scrollTop += word.getBoundingClientRect().top - host.getBoundingClientRect().top - offset
        lastScrollTop.current = host.scrollTop
        invalidate()
        captureHold()
      }
      return
    }
    if (landedKey.current !== destinationKey) {
      restoring.current = true
      const target = wordNode(live, anchor)
      if (!target) return
      const top = target.getBoundingClientRect().top - host.getBoundingClientRect().top
      // Narration that reads on into a chapter already on screen leaves the page alone: the
      // follow effect below brings the spoken word up as it does inside a chapter.
      const heardInView = passage.playing && !passage.browseWhileListening && landedKey.current !== '' && top >= 0 && top < host.clientHeight * .7
      if (!heardInView) {
        suppressScrollRef.current = true
        // While narration reads, the word lands where the follow effect keeps it, so the page moves once.
        host.scrollTop += top - (passage.playing && !passage.browseWhileListening ? host.clientHeight * .24 : lineOffset(host))
        lastScrollTop.current = host.scrollTop
        invalidate()
      }
      restoring.current = false
      holdLanding.current = true
      landedKey.current = destinationKey
      onLanded(epoch, anchor)
      captureHold()
      updateMounted()
      return
    }
    if (structureChanged) reanchor()
  // Epoch/anchor changes, minimap jumps and the set of painted chapters are what move the page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationKey, windows, structureKey, mapJump])

  // The reader took a handoff: tell it the word that is on the line now (the reader may have read on meanwhile).
  useEffect(() => {
    const frame = requestAnimationFrame(() => handleScroll(true))
    return () => cancelAnimationFrame(frame)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const keep = () => { invalidate(); reanchor() }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(keep)
    observer?.observe(host)
    const paper = host.querySelector('.continuous-reader-paper')
    if (paper) observer?.observe(paper)
    window.addEventListener('resize', keep)
    const fonts = () => { invalidate() }
    document.fonts?.addEventListener('loadingdone', fonts)
    return () => { observer?.disconnect(); window.removeEventListener('resize', keep); document.fonts?.removeEventListener('loadingdone', fonts) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    if (!passage.playing || passage.browseWhileListening) return
    const follow = passage.follow
    if (!follow || follow.kind === 'none') return
    const place = { paragraphIndex: follow.paragraphIndex, wordIndex: follow.kind === 'word' ? follow.wordIndex : 0 }
    const host = hostRef.current
    const word = wordNode(live, place)
    if (!host || !word) return
    const top = word.getBoundingClientRect().top - host.getBoundingClientRect().top
    if (top >= host.clientHeight * .2 && top < host.clientHeight * .7) return
    holdLanding.current = false
    suppressScrollRef.current = true
    host.scrollTop += top - host.clientHeight * .24
    lastScrollTop.current = host.scrollTop
    invalidate()
    captureHold()
    updateMounted()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passage.follow, passage.playing, passage.browseWhileListening, wordNode, live])

  const onTailRef = useRef(onTail)
  onTailRef.current = onTail
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (mapEnd) onTailRef.current?.(epochRef.current, mapEnd) }, [mapEnd])
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const host = hostRef.current
      if (!host) return
      const { last } = continuousViewportWords(wordsOf(liveRef.current), host.scrollTop, host.clientHeight)
      if (last) setMapEnd(previous => sameAnchor(previous, last.anchor) ? previous : last.anchor)
      updateMounted()
    })
    return () => cancelAnimationFrame(frame)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows, passage.layoutKey, texts])

  function handleScroll(sync = false) {
    const host = hostRef.current
    if (!host || restoring.current || !windows.length) return
    const movement = host.scrollTop - lastScrollTop.current
    lastScrollTop.current = host.scrollTop
    const own = liveRef.current
    // Nothing was scrolled: if the text moved under the page since the last look, put it back first.
    if (sync) reanchor()
    const words = wordsOf(own)
    const viewport = continuousViewportWords(words, host.scrollTop, host.clientHeight)
    if (viewport.last) setMapEnd(previous => sameAnchor(previous, viewport.last!.anchor) ? previous : viewport.last!.anchor)
    const lineChapter = chapterAtReadingLine(blocks(), host.scrollTop + lineOffset(host)) ?? own
    captureHold()
    updateMounted()
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false
      if (movement === 0 && !sync) return
    }
    if (!userBrowseRef.current && !sync) return
    const end = words[words.length - 1]
    if (lineChapter === own) {
      handoff.current = null
      if (!viewport.hasInk || !viewport.first) return
      if (movement > 0 && end && viewport.last === end) onReadToEnd?.(epochRef.current, end.anchor)
      let visible = viewport.first.anchor
      const held = words.find(word => sameAnchor(word.anchor, visibleRef.current))
      if (held && held.bottom > host.scrollTop && held.top <= host.scrollTop + lineOffset(host)) visible = visibleRef.current
      visibleRef.current = visible
      setMapVisible(previous => sameAnchor(previous, visible) ? previous : visible)
      const signature = `${visible.paragraphIndex}:${visible.wordIndex}`
      if (lastReported.current !== signature) {
        lastReported.current = signature
        onVisible(epochRef.current, visible)
      }
      return
    }
    // The reading line has left the reader's chapter. Scrolling on past its last line is reading it to the end.
    if (movement > 0 && end && order.indexOf(lineChapter) > order.indexOf(own)) onReadToEnd?.(epochRef.current, end.anchor)
    // While narration plays, the reader's chapter is the one heard: browsing ahead is browsing, as inside a chapter.
    if (playingRef.current || !userBrowseRef.current) return
    const first = continuousViewportWords(wordsOf(lineChapter), host.scrollTop, host.clientHeight).first
    if (!first) return
    const asked = handoff.current
    const now = Date.now()
    if (asked && asked.chapter === lineChapter && now - asked.at < HANDOFF_RETRY_MS) return
    handoff.current = { chapter: lineChapter, anchor: first.anchor, at: now }
    onCrossChapter(lineChapter, first.anchor)
  }

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const cardTarget = (event: Event) => event.target instanceof Element && !!event.target.closest('.source-margin-item')
    const pointer = (event: PointerEvent) => { if (cardTarget(event)) userBrowseRef.current = false }
    const browse = () => { userBrowseRef.current = true; holdLanding.current = false; suppressScrollRef.current = false; onUserBrowse?.() }
    host.addEventListener('pointerdown', pointer, true)
    host.addEventListener('wheel', browse, { capture: true, passive: true })
    host.addEventListener('touchstart', browse, { capture: true, passive: true })
    return () => { host.removeEventListener('pointerdown', pointer, true); host.removeEventListener('wheel', browse, true); host.removeEventListener('touchstart', browse, true) }
  }, [onUserBrowse])
  const userBrowse = () => { userBrowseRef.current = true; holdLanding.current = false; suppressScrollRef.current = false; onUserBrowse?.() }

  // As ContinuousReader: a mouse drag begun on the paper outside the reader's own chapter text.
  const beginNativeDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    nativeDragEpoch.current = null
    const target = event.target instanceof Element ? event.target : null
    if (event.pointerType === 'touch' || (event.button != null && event.button !== 0)
      || !target || target.closest('[data-testid="lab-word"], .source-margin-item, button, a, input, textarea, select, .book-scroll-neighbour')
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
    const paper = blockNode(live)
    if (!paper || !paper.contains(native.startContainer) || !paper.contains(native.endContainer)) return
    const words = [...paper.querySelectorAll<HTMLElement>('[data-testid="lab-word"][data-paragraph-index][data-word-index]')]
      .filter(word => {
        if (!native.intersectsNode(word)) return false
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
    pendingJump.current = { anchor: place, offset: lineOffset(hostRef.current ?? ({ clientHeight: 600 } as HTMLElement)) }
  }

  const lastOfUnit = order[order.length - 1] === live
  const livePassage = useMemo(() => windows[0] ? <LabPassage {...passage} readingPage={windows[0].page}
    chapterEnd={lastOfUnit ? passage.chapterEnd : undefined}
    compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" desktopSpread={false} plannedHyphens={false} tapZones="none" keyboardSelection touchScroll /> : null,
  [windows, passage, lastOfUnit])
  const highlightsByChapter = useMemo(() => {
    const map = new Map<number, LabHighlight[]>()
    for (const mark of bookHighlights ?? []) {
      const list = map.get(mark.chapterNumber)
      if (list) list.push(mark)
      else map.set(mark.chapterNumber, [mark])
    }
    return map
  }, [bookHighlights])
  const mountedSet = useMemo(() => new Set(mounted), [mounted])
  const perWord = metrics.current.words > 0 ? metrics.current.px / metrics.current.words : 3.4
  const wordsPerParagraph = metrics.current.paragraphs > 0 ? metrics.current.words / metrics.current.paragraphs : 80
  // The chapters around the reader's own do not depend on the reader's passage: their elements are
  // reused across the reader's own renders (one per reported word), so only the own chapter is diffed.
  const onOpenFigure = passage.onOpenFigure
  const layoutKey = passage.layoutKey
  const others = useMemo(() => unit.chapters.map((chapter) => {
    if (chapter.number === live) return null
    const text = mountedSet.has(chapter.number) ? texts.get(chapter.number) : undefined
    if (text) return <section className="book-scroll-chapter is-neighbour" data-book-scroll-chapter={chapter.number} data-book-scroll-painted="true" key={chapter.number}>
      <NeighbourChapter number={chapter.number} title={text.title} paragraphs={text.paragraphs} layoutKey={layoutKey}
        highlights={highlightsByChapter.get(chapter.number) ?? NO_HIGHLIGHTS} onOpenFigure={onOpenFigure} />
    </section>
    let height = heights.current.get(chapter.number) ?? estimates.current.get(chapter.number)
    if (height == null) {
      height = Math.max(120, Math.round(chapterWordEstimate(chapter, wordsPerParagraph) * perWord) + 96)
      // Kept from the first estimate made with a measured chapter behind it, so the scroll height and the
      // tracker do not shift every time another chapter is measured.
      if (metrics.current.words > 0) estimates.current.set(chapter.number, height)
    }
    return <section className="book-scroll-chapter is-placeholder" data-book-scroll-chapter={chapter.number} key={chapter.number} style={{ height }} aria-hidden="true" />
  // `measured` stands for the heights and metrics refs: it moves when a chapter is first measured.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [unit, live, mountedSet, texts, layoutKey, highlightsByChapter, onOpenFigure, measured])
  const chapters = others.map((section, index) => section ?? <section className="book-scroll-chapter is-own" data-book-scroll-chapter={live} data-book-scroll-painted="true" key={unit.chapters[index].number}>{livePassage}</section>)
  return <><SourceMinimap cards={cards} highlights={passage.highlights?.filter(mark => mark.chapterNumber === passage.chapterNumber)}
    bookMap={unit.chapters.length > 1 ? { chapters: unit.chapters, chapterNumber: live, onJumpChapter: number => onJumpChapter(number) } : undefined}
    paragraphs={passage.paragraphs} visible={mapVisible} visibleEnd={mapEnd} onJump={jumpFromMap} chapterMarks />
  <div className="continuous-reader" data-testid="continuous-reader" data-book-scroll="true" data-book-scroll-unit={unit.key} ref={hostRef} onScroll={() => handleScroll()}
    onPointerDown={event => { beginNativeDrag(event); if (!(event.target instanceof Element && event.target.closest('.source-margin-item'))) userBrowse() }}
    onPointerUp={finishNativeDrag} onPointerCancel={() => { nativeDragEpoch.current = null }}
    onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) userBrowse() }}>
    <div className="continuous-reader-paper">
      <div className="continuous-reader-window book-scroll-unit">{chapters}</div>
    </div>
  </div></>
}
