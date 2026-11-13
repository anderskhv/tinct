import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentProps, type MutableRefObject, type ReactElement, type ReactNode, type SyntheticEvent } from 'react'
import { notePlainText } from '../notes/noteMarkdown'
import { SourceMinimap, type SourceMapCard, type SourceUnitMark } from './SourceMinimap'
import { tokenizeHearingWords } from '../labHearing'
import { LabPassage } from '../LabPassage'
import { LabChapterHeading } from '../LabChapterHeading'
import { buildHighlightRange, type LabHighlight, type LabHighlightRange } from '../labHighlights'
import { continuousReaderWindows } from './ContinuousReader'
import { type ContinuousReaderAnchor } from './continuousReaderWindow'
import type { ContinuousReaderEpoch } from './continuousReaderEpoch'
import { bookScrollMounted, chapterAtReadingLine, chapterWordEstimate, type BookScrollBlock, type BookScrollUnit } from './bookScroll'
import { chapterWords, NO_WORDS, type ChapterWords } from './bookScrollWords'
import type { BookScrollChapterText } from './useBookScrollChapters'
import type { FollowTarget } from '../labFollow'
import { useReaderScrollKeys } from './readerScrollKeys'
import './continuousReader.css'
import './bookScroll.css'

/**
 * Book scroll (Anders, 11 Nov 2026): the Margin reader's scroller holding a whole scroll unit
 * (bookScroll.ts) instead of one chapter.
 *
 * One chapter is the reader's own, exactly as in ContinuousReader: its words carry the reader's
 * word coordinates, and every report (place, tail, read to the end) is about it and is checked
 * against the reader's epoch. The chapters around it are the same LabPassage page with inert words
 * (LabPassage `inertWords`: "lab-opening-word", never "lab-word"), so nothing that addresses the
 * reader's words can land in a neighbour, and a chapter keeps its DOM when it changes role.
 *
 * When the reading line crosses into a neighbour the reader is asked to make that chapter its own
 * (`onCrossChapter`), at the word on the line. No place is reported for a chapter that is not the
 * reader's own, so a saved place is always a coherent chapter + paragraph + word. Far chapters are
 * placeholders of their measured (or estimated) height; the word on the reading line is held in
 * place across every mount, release and reflow, so the text never jumps.
 *
 * Acting on a neighbour (its pills, a selection in it, one of its margin cards) first makes it the
 * reader's own chapter where it stands (`adopt`, the same handoff as scrolling into it: nothing on the
 * page moves), then the action runs as it does in any chapter (LabApp `actOnChapter`).
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
  /** Go to a chapter of the unit (its start, or a place in it: a mark on the overview). */
  onJumpChapter: (chapterNumber: number, anchor?: ContinuousReaderAnchor) => void
  /** Every highlight in the book: a neighbour paints its own. */
  bookHighlights?: readonly LabHighlight[]
  onVisible: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  onLanded: (epoch: ContinuousReaderEpoch, anchor: ContinuousReaderAnchor) => void
  onTail?: (epoch: ContinuousReaderEpoch, tail: ContinuousReaderAnchor) => void
  onReadToEnd?: (epoch: ContinuousReaderEpoch, last: ContinuousReaderAnchor) => void
  cards?: readonly SourceMapCard[]
  /** The cards of the unit's other chapters (the overview marks the whole unit). */
  bookCards?: readonly { id: string; chapterNumber: number; paragraphIndex: number; wordIndex: number; label: string }[]
  onUserBrowse?: () => void
  /** A neighbouring chapter's end: its pills, acting on that chapter (LabApp). */
  neighbourEnd?: (chapterNumber: number) => ReactNode
  /** A selection made in a neighbouring chapter: LabApp makes the chapter the reader's own, then opens the selection there. */
  onSelectInChapter?: (chapterNumber: number, range: LabHighlightRange, x: number, y: number) => void
  /** The chapters painted now, in reading order, the reader's own included (for their margin cards and start actions). */
  onPaintedChange?: (chapters: readonly number[]) => void
  /** Lets LabApp make a neighbour the reader's own chapter where it stands, before acting on it. */
  controlRef?: MutableRefObject<BookScrollControl | null>
  /** The chapter at the reading line while the reader still owns another (the top bar names it at once); null once they agree. */
  onLineChapter?: (chapterNumber: number | null) => void
  /** A margin card is open: the reader's chapter is held while the card or that chapter is on screen (cardHolds). */
  cardOpen?: boolean
}

export interface BookScrollControl {
  /**
   * Make `chapterNumber` the reader's own where it stands, at its first word on screen (or its first or last word when
   * none is), without moving the page. False when the chapter is not painted.
   */
  adopt: (chapterNumber: number, where?: 'start' | 'end') => boolean
}

const EMPTY_COMPARE_PARAGRAPHS: string[] = []
/** A neighbour's text handles its own pointer events, as the inert opening passage it used to be did: they do not reach
 *  the reader's surface (its native drag, its browse signal). Its heading and end pills are not text. */
const stopInText = (event: SyntheticEvent) => { if (event.target instanceof Element && event.target.closest('.lab-hearing-stage')) event.stopPropagation() }
const NO_FOLLOW: FollowTarget = { kind: 'none' }
const NO_FOLLOW_PARAGRAPHS: Passage['followParagraphs'] = []
const NO_MARKS = new Set<number>()
const NO_HIGHLIGHTS: LabHighlight[] = []
/** A handoff the reader did not take (its chapter failed to load) may be asked again after this long. */
const HANDOFF_RETRY_MS = 3000
/** How long the scrolling rests before the chapter at the reading line becomes the reader's own. */
const CROSS_REST_MS = 160
/** A chapter the reading line has stayed in this long while the reader keeps scrolling is being read: it becomes
 *  the reader's own without waiting for a rest. A short chapter scrolled through slowly never rested at the line
 *  (WebKit, 11 Nov 2026) and passed without ever being the reader's. */
const CROSS_DWELL_MS = 900

const sameAnchor = (a: ContinuousReaderAnchor | undefined | null, b: ContinuousReaderAnchor) =>
  a?.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex

const lineOffset = (host: HTMLElement) => Math.min(host.clientHeight * .24, 140)

type EndStore = { node: ReactNode; listeners: Set<() => void> }
/** Put `node` in a chapter end's store: the end re-renders itself after this render commits, the passage does not. */
function setEnd(store: EndStore, node: ReactNode) {
  if (store.node === node) return
  store.node = node
  queueMicrotask(() => store.listeners.forEach(listener => listener()))
}

/** Two loads of the same chapter text: one array stands for both, so the chapter's page and memos stay the same objects. */
function sameParagraphs(a: readonly string[] | undefined, b: readonly string[]): boolean {
  if (!a) return false
  if (a === b) return true
  return a.length === b.length && a.every((paragraph, index) => paragraph === b[index])
}

/**
 * The reader's own chapter is one LabPassage holding every word of the chapter. The reader re-renders its props on
 * every reported place, so a fresh props object would reconcile every word of the chapter each time (most of the
 * main-thread time while scrolling a long chapter). The props are kept as one object until a value changes; the
 * callbacks are stable and always call the latest, and the chapter end renders itself from a small store.
 */
type PassageProps = Props['passage']
function useStablePassage(passage: PassageProps): PassageProps {
  const latest = useRef(passage)
  latest.current = passage
  const wrappers = useRef(new Map<string, (...args: unknown[]) => unknown>())
  const end = useRef<EndStore>({ node: passage.chapterEnd, listeners: new Set() })
  setEnd(end.current, passage.chapterEnd)
  const entries = Object.entries(passage).filter(([key]) => key !== 'chapterEnd')
  const signature = entries.map(([key, value]) => typeof value === 'function' ? `${key}:fn` : key)
  // The own chapter paints in reading mode; the audio follow only reaches its words through inline hearing paint.
  // Without it, a new follow object (the narration source catching up after a chapter swap) changes nothing on
  // the page, so it does not re-render every word. The props still carry the latest follow whenever they are rebuilt.
  const followPaints = !!passage.inlineHearingPaint
  const values = entries.map(([key, value]) => typeof value === 'function' ? true
    : !followPaints && (key === 'follow' || key === 'followParagraphs') ? followPaints : value)
  const hasEnd = passage.chapterEnd != null && passage.chapterEnd !== false
  const memo = useRef<{ signature: string; values: unknown[]; hasEnd: boolean; props: PassageProps } | null>(null)
  const key = signature.join('|')
  if (memo.current && memo.current.signature === key && memo.current.hasEnd === hasEnd
    && memo.current.values.length === values.length && memo.current.values.every((value, index) => Object.is(value, values[index]))) return memo.current.props
  const props: Record<string, unknown> = {}
  for (const [name, value] of entries) {
    if (typeof value !== 'function') { props[name] = value; continue }
    let wrapper = wrappers.current.get(name)
    if (!wrapper) {
      wrapper = (...args: unknown[]) => (latest.current as Record<string, unknown> & PassageProps)[name] instanceof Function
        ? ((latest.current as Record<string, unknown>)[name] as (...a: unknown[]) => unknown)(...args) : undefined
      wrappers.current.set(name, wrapper)
    }
    props[name] = wrapper
  }
  if (hasEnd) props.chapterEnd = <ChapterEndSlot store={end.current} />
  memo.current = { signature: key, values, hasEnd, props: props as PassageProps }
  return memo.current.props
}

function ChapterEndSlot({ store }: { store: EndStore }) {
  const node = useSyncExternalStore(listener => { store.listeners.add(listener); return () => { store.listeners.delete(listener) } }, () => store.node)
  return <>{node}</>
}

export function BookScrollReader({ passage: passageProps, epoch, anchor, unit, texts, onRequestChapters, onCrossChapter, onJumpChapter, bookHighlights, onVisible, onLanded, onTail, onReadToEnd, onUserBrowse, cards, bookCards, neighbourEnd, onSelectInChapter, onPaintedChange, controlRef, onLineChapter, cardOpen }: Props) {
  const passage = useStablePassage(passageProps)
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
  // The reader's chapter as it was painted while a neighbour, when it is the same text: its page and every memo on it
  // stay the same objects, so taking the chapter over changes no word on the page.
  const loadedLive = texts.get(live)?.paragraphs
  const paragraphs = useMemo(() => loadedLive && sameParagraphs(loadedLive, passage.paragraphs) ? loadedLive : passage.paragraphs, [loadedLive, passage.paragraphs])
  const windows = useMemo(() => continuousReaderWindows(paragraphs), [paragraphs])
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
  const idleMount = useRef(0)
  useEffect(() => () => { if (idleMount.current && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleMount.current) }, [])
  /** The live chapter changed because the reader took a handoff (not a landing). */
  const tookHandoff = useRef(false)
  /** The reader made a neighbour its own by acting on it: it stays so until the reader scrolls again. */
  const adoptedHold = useRef(false)
  const crossTimer = useRef(0)
  /** The chapter at the reading line that is not the reader's own, and since when it is there. */
  const lineSince = useRef<{ chapter: number; at: number } | null>(null)
  const clearCross = () => { if (crossTimer.current) { window.clearTimeout(crossTimer.current); crossTimer.current = 0 } }
  useEffect(() => clearCross, [])
  const lineReported = useRef<number | null>(null)
  const onLineRef = useRef(onLineChapter)
  onLineRef.current = onLineChapter
  const reportLine = (chapter: number | null) => {
    if (lineReported.current === chapter) return
    lineReported.current = chapter
    onLineRef.current?.(chapter)
  }
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
  const wordsRef = useRef(new Map<number, ChapterWords>())
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
  const wordsOf = (chapter: number): ChapterWords => {
    const host = hostRef.current
    const cached = wordsRef.current.get(chapter)
    if (cached) return cached
    const block = blockNode(chapter)
    if (!host || !block) return NO_WORDS
    const words = chapterWords(host, block)
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
    const first = wordsOf(chapter).viewport(host.scrollTop, host.clientHeight).first
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
    // Text that shrank above can leave the scroller pinned at its new end before this runs: the browser has clamped
    // the scroll then, and the place the page was at is the last one noted, not the clamped one.
    const pinned = host.scrollTop >= host.scrollHeight - host.clientHeight - 1 && lastScrollTop.current > host.scrollTop
    const base = pinned ? lastScrollTop.current : host.scrollTop
    host.scrollTop = base + delta
    // What the scroller took (it rounds to device pixels), so the scroll this makes reads as no movement: the fraction
    // made it look like the reader scrolling, and the hold was taken anew. A clamp at the end keeps the place asked for.
    lastScrollTop.current = Math.abs(host.scrollTop - (base + delta)) < 1 ? host.scrollTop : base + delta
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
    // The reader's own chapter too: it is painted from the same text when it becomes a neighbour, so it keeps its page.
    const missing = next.filter(number => !texts.has(number))
    if (missing.length) onRequestChapters(missing)
    if (next.length === mountedRef.current.length && next.every((number, index) => number === mountedRef.current[index])) return
    const was = new Set(mountedRef.current)
    const adds = next.some(number => !was.has(number))
    // Painting a chapter is the one long task left while scrolling (every word of it at once). A chapter not yet on
    // screen is painted when the main thread is free; one already in the viewport, or a release, at once.
    const visibleAdd = next.some(number => !was.has(number) && all.some((block, index) => block.chapterNumber === number && index >= first && index <= last))
    if (adds && !visibleAdd && typeof window.requestIdleCallback === 'function') {
      if (!idleMount.current) idleMount.current = window.requestIdleCallback(() => { idleMount.current = 0; mountNow() }, { timeout: 400 })
      return
    }
    mountedRef.current = next
    setMounted(next)
  }
  /** Mount what the viewport needs now (an idle callback's turn). */
  function mountNow() {
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
    if (next.length === mountedRef.current.length && next.every((number, index) => number === mountedRef.current[index])) return
    captureHold()
    mountedRef.current = next
    setMounted(next)
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
        const text = number === live ? paragraphs : texts.get(number)?.paragraphs
        if (chapter && text) {
          metrics.current.words += continuousReaderWindows(text)[0]?.wordCount ?? 0
          metrics.current.paragraphs += text.length
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
        tookHandoff.current = true
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
      adoptedHold.current = false
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
  // Only after a handoff: a landing (opening the book, a jump) keeps its exact word and writes nothing.
  useEffect(() => {
    if (!tookHandoff.current) return
    tookHandoff.current = false
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
      const { last } = wordsOf(liveRef.current).viewport(host.scrollTop, host.clientHeight)
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
    const viewport = words.viewport(host.scrollTop, host.clientHeight)
    if (viewport.last) setMapEnd(previous => sameAnchor(previous, viewport.last!.anchor) ? previous : viewport.last!.anchor)
    const lineChapter = chapterAtReadingLine(blocks(), host.scrollTop + lineOffset(host)) ?? own
    // The scroll reanchor made to keep the held word in place is not the reader moving: the same word stays held.
    // Taking a new one here (the word now beside the reading line) let each reflow hand the hold on a line, so a
    // run of resizes walked the place down the text a line at a time (13 Nov 2026: Sirach 40 went 3 lines on and
    // the word the reader was about to select slid under the header).
    if (!(suppressScrollRef.current && movement === 0 && !sync)) captureHold()
    updateMounted()
    if (suppressScrollRef.current) {
      suppressScrollRef.current = false
      if (movement === 0 && !sync) return
    }
    if (!userBrowseRef.current && !sync) return
    const end = words.length ? words.at(words.length - 1) : undefined
    // A chapter the reader acted on is the one named until they scroll on.
    reportLine(lineChapter === own || adoptedHold.current ? null : lineChapter)
    if (lineChapter === own) {
      handoff.current = null
      lineSince.current = null
      clearCross()
      if (!viewport.hasInk || !viewport.first) return
      if (movement > 0 && end && viewport.last === end) onReadToEnd?.(epochRef.current, end.anchor)
      let visible = viewport.first.anchor
      const held = words.find(visibleRef.current)
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
    // A chapter the reader acted on stays theirs until they scroll on.
    if (adoptedHold.current) return
    // The chapter becomes the reader's own once the scrolling rests (CROSS_REST_MS): making it the reader's own
    // re-renders the whole reader, which mid-scroll was the hitch at every chapter line. Only the top bar follows at once.
    // A chapter that stays at the line while the scrolling goes on (CROSS_DWELL_MS) is being read: it is handed over then.
    clearCross()
    const now = performance.now()
    if (lineSince.current?.chapter !== lineChapter) lineSince.current = { chapter: lineChapter, at: now }
    else if (now - lineSince.current.at >= CROSS_DWELL_MS) { crossNow(); return }
    crossTimer.current = window.setTimeout(() => { crossTimer.current = 0; crossNow() }, CROSS_REST_MS)
  }
  /**
   * An open margin card belongs to the reader's chapter, and a chapter swap closes it. While the card, or the chapter it
   * is about, is still on screen, the reader keeps that chapter (Anders, 12 Nov 2026: a long Explain in Luke 10 reached
   * past Luke 11's heading, and scrolling on to read it closed it). The top bar still names the chapter at the reading
   * line; the swap happens once both have left the screen or the card is closed. Focus in the card does not hold it:
   * a wheel does not blur the field, and the place would stop following the reader for as long as they read on.
   */
  function cardHolds() {
    const host = hostRef.current
    if (!host) return false
    const open = host.querySelectorAll<HTMLElement>('.source-margin-item.is-open:not(.is-actions)')
    if (!open.length) return false
    const view = host.getBoundingClientRect()
    const onScreen = (box: DOMRect) => box.height > 0 && box.bottom > view.top && box.top < view.bottom
    for (const card of open) if (onScreen(card.getBoundingClientRect())) return true
    const own = blockNode(liveRef.current)
    return !!own && onScreen(own.getBoundingClientRect())
  }
  /** Hand the reader the chapter at the reading line, at the first word on screen there. */
  function crossNow() {
    const host = hostRef.current
    if (!host || restoring.current || playingRef.current) return
    const own = liveRef.current
    const lineChapter = chapterAtReadingLine(blocks(), host.scrollTop + lineOffset(host)) ?? own
    if (lineChapter === own || cardHolds()) return
    const first = wordsOf(lineChapter).viewport(host.scrollTop, host.clientHeight).first
    if (!first) return
    const asked = handoff.current
    const now = Date.now()
    if (asked && asked.chapter === lineChapter && now - asked.at < HANDOFF_RETRY_MS) return
    handoff.current = { chapter: lineChapter, anchor: first.anchor, at: now }
    onCrossChapter(lineChapter, first.anchor)
  }

  // A drag or click on a neighbour's text. The neighbour's passage handles its own pointer events (and may stop them),
  // so these are watched in the capture phase: the selection is read once the pointer is up.
  const finishRef = useRef<(event: PointerEvent, neighbour: HTMLElement, from: { x: number; y: number }) => void>(() => {})
  finishRef.current = (event, neighbour, from) => {
    const chapter = Number(neighbour.dataset.bookScrollChapter)
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount !== 1) {
      // A click on a neighbour's text (no drag): the chapter becomes the reader's own, so its words answer the next click.
      if (Math.hypot(event.clientX - from.x, event.clientY - from.y) < 4) adopt(chapter)
      return
    }
    const native = selection.getRangeAt(0)
    const block = (node: Node) => (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>('.book-scroll-chapter.is-neighbour') ?? null
    if (!onSelectInChapter || block(native.startContainer) !== neighbour || block(native.endContainer) !== neighbour) return
    const paragraphs = texts.get(chapter)?.paragraphs
    if (!paragraphs) return
    const places = selectedPlaces(native, neighbour, '[data-testid="lab-opening-word"][data-paragraph-index][data-word-index]')
    if (!places.length) return
    const range = buildHighlightRange(paragraphs, places[0], places[places.length - 1])
    if (!range?.text.trim()) return
    onSelectInChapter(chapter, range, event.clientX, event.clientY)
  }
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let pressed: { neighbour: HTMLElement; from: { x: number; y: number } } | null = null
    const down = (event: PointerEvent) => {
      pressed = null
      if (event.pointerType === 'touch' || event.button !== 0 || !(event.target instanceof Element)) return
      const neighbour = event.target.closest<HTMLElement>('.book-scroll-chapter.is-neighbour')
      if (!neighbour || event.target.closest('button, a, input, textarea, select, .source-margin-item')) return
      pressed = { neighbour, from: { x: event.clientX, y: event.clientY } }
    }
    const up = (event: PointerEvent) => {
      const was = pressed
      pressed = null
      if (!was) return
      // After the browser has finished the selection.
      requestAnimationFrame(() => finishRef.current(event, was.neighbour, was.from))
    }
    host.addEventListener('pointerdown', down, true)
    window.addEventListener('pointerup', up, true)
    return () => { host.removeEventListener('pointerdown', down, true); window.removeEventListener('pointerup', up, true) }
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const cardTarget = (event: Event) => event.target instanceof Element && !!event.target.closest('.source-margin-item')
    const pointer = (event: PointerEvent) => { if (cardTarget(event)) userBrowseRef.current = false }
    const browse = () => { userBrowseRef.current = true; holdLanding.current = false; suppressScrollRef.current = false; adoptedHold.current = false; onUserBrowse?.() }
    host.addEventListener('pointerdown', pointer, true)
    host.addEventListener('wheel', browse, { capture: true, passive: true })
    host.addEventListener('touchstart', browse, { capture: true, passive: true })
    return () => { host.removeEventListener('pointerdown', pointer, true); host.removeEventListener('wheel', browse, true); host.removeEventListener('touchstart', browse, true) }
  }, [onUserBrowse])
  const userBrowse = () => { userBrowseRef.current = true; holdLanding.current = false; suppressScrollRef.current = false; onUserBrowse?.() }
  // Arrow, Page, Space, Home and End scroll the book as they scroll a page, wherever focus rests (12 Nov 2026).
  // Home and End go to the start and end of the chapter on the reading line, not of the whole book.
  useReaderScrollKeys(hostRef, {
    browse: () => { adoptedHold.current = false; userBrowse() },
    edge: (which, host) => {
      const chapter = chapterAtReadingLine(blocks(), host.scrollTop + lineOffset(host)) ?? liveRef.current
      const node = blockNode(chapter)
      if (!node) return null
      const top = node.getBoundingClientRect().top - host.getBoundingClientRect().top + host.scrollTop
      return which === 'start' ? top : Math.max(top, top + node.offsetHeight - host.clientHeight)
    },
  })

  // A card held the reader's chapter and is closed now: the chapter at the reading line becomes the reader's once the
  // page rests, as it would have when the scrolling did.
  useEffect(() => {
    if (cardOpen || lineReported.current == null || !userBrowseRef.current || adoptedHold.current) return
    clearCross()
    crossTimer.current = window.setTimeout(() => { crossTimer.current = 0; crossNow() }, CROSS_REST_MS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardOpen])

  /** Make a painted neighbour the reader's own where it stands: the handoff scrolling into it makes. */
  const adopt = (chapter: number, where: 'start' | 'end' = 'start') => {
    const host = hostRef.current
    if (!host || chapter === liveRef.current) return chapter === liveRef.current
    const words = wordsOf(chapter)
    if (!words.length) return false
    const seen = words.viewport(host.scrollTop, host.clientHeight).first
    const at = seen?.anchor ?? (where === 'end' ? words.at(words.length - 1).anchor : words.at(0).anchor)
    clearCross()
    adoptedHold.current = true
    reportLine(null)
    handoff.current = { chapter, anchor: at, at: Date.now() }
    onCrossChapter(chapter, at)
    return true
  }
  if (controlRef) controlRef.current = { adopt }

  // As ContinuousReader: a mouse drag begun on the paper outside the reader's own chapter text.
  const beginNativeDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    nativeDragEpoch.current = null
    const target = event.target instanceof Element ? event.target : null
    if (event.pointerType === 'touch' || (event.button != null && event.button !== 0)
      || !target || target.closest('[data-testid="lab-word"], .source-margin-item, button, a, input, textarea, select, .book-scroll-chapter.is-neighbour')
      || !(target === event.currentTarget || target.closest('.continuous-reader-paper'))) return
    const selection = window.getSelection()
    if (selection?.anchorNode && event.currentTarget.contains(selection.anchorNode)) selection.removeAllRanges()
    nativeDragEpoch.current = epochKey
  }
  /** The words of a native selection inside `paper`, as source places. */
  const selectedPlaces = (native: Range, paper: Element, selector: string) => [...paper.querySelectorAll<HTMLElement>(selector)]
    .filter(word => {
      if (!native.intersectsNode(word)) return false
      const overlap = document.createRange()
      overlap.selectNodeContents(word)
      if (native.compareBoundaryPoints(Range.START_TO_START, overlap) > 0) overlap.setStart(native.startContainer, native.startOffset)
      if (native.compareBoundaryPoints(Range.END_TO_END, overlap) < 0) overlap.setEnd(native.endContainer, native.endOffset)
      return Boolean(overlap.toString().trim())
    })
    .map(word => ({ paragraphIndex: Number(word.dataset.paragraphIndex), wordIndex: Number(word.dataset.wordIndex) }))
  const finishNativeDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const started = nativeDragEpoch.current
    nativeDragEpoch.current = null
    if (started !== epochKey) return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return
    const native = selection.getRangeAt(0)
    const paper = blockNode(live)
    if (paper && paper.contains(native.startContainer) && paper.contains(native.endContainer)) {
      if (!passage.onSelectRange) return
      const places = selectedPlaces(native, paper, '[data-testid="lab-word"][data-paragraph-index][data-word-index]')
      if (!places.length) return
      const range = buildHighlightRange(paragraphs, places[0], places[places.length - 1])
      if (!range?.text.trim()) return
      selection.removeAllRanges()
      passage.onSelectRange(range, event.clientX, event.clientY)
      return
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
    pendingJump.current = { anchor: place, offset: lineOffset(hostRef.current ?? ({ clientHeight: 600 } as HTMLElement)) }
  }

  // Every chapter ends with its own pills (Anders, 11 Nov 2026), not only the unit's last.
  // Every painted chapter, the reader's own or a neighbour, is one LabPassage in its section: a chapter that changes
  // role keeps every node of its page, and only what differs (the words' test ids, the reader's marks) is updated.
  // Remounting both chapters at each chapter line held the main thread for up to a second on a long book.
  const livePassage = useMemo(() => windows[0] ? <LabPassage {...passage} paragraphs={paragraphs} readingPage={windows[0].page}
    compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" desktopSpread={false} plannedHyphens={false} tapZones="none" keyboardSelection touchScroll measureEndOverflow={false} stableWords /> : null,
  [windows, passage, paragraphs])
  const highlightsByChapter = useMemo(() => {
    const map = new Map<number, LabHighlight[]>()
    for (const mark of bookHighlights ?? []) {
      const list = map.get(mark.chapterNumber)
      if (list) list.push(mark)
      else map.set(mark.chapterNumber, [mark])
    }
    return map
  }, [bookHighlights])
  // The overview marks the reader's highlights and cards in every chapter of the unit (Anders, 12 Nov 2026: only the
  // reader's own chapter's showed). A loaded chapter places them at their word; one not loaded by its paragraph.
  const wordStarts = useRef(new Map<number, { paragraphs: string[]; starts: number[]; total: number }>())
  const unitMarks = useMemo(() => {
    const inUnit = new Map(unit.chapters.map(chapter => [chapter.number, chapter]))
    const at = (chapterNumber: number, paragraphIndex: number, wordIndex: number) => {
      const paragraphs = texts.get(chapterNumber)?.paragraphs
      if (paragraphs) {
        let model = wordStarts.current.get(chapterNumber)
        if (model?.paragraphs !== paragraphs) {
          const starts: number[] = []
          let total = 0
          for (const paragraph of paragraphs) { starts.push(total); total += Math.max(1, tokenizeHearingWords(paragraph).length) }
          model = { paragraphs, starts, total: total || 1 }
          wordStarts.current.set(chapterNumber, model)
        }
        return Math.min(1, ((model.starts[paragraphIndex] ?? model.total) + wordIndex) / model.total)
      }
      const count = Math.max(1, inUnit.get(chapterNumber)?.paragraphCount ?? 1)
      return Math.min(1, paragraphIndex / count)
    }
    const marks: SourceUnitMark[] = []
    for (const mark of bookHighlights ?? []) {
      if (mark.chapterNumber === live || !inUnit.has(mark.chapterNumber) || mark.kind === 'chapter') continue
      marks.push({ id: `h:${mark.id}`, kind: 'highlight', chapterNumber: mark.chapterNumber, color: mark.color, label: `${mark.note ? 'Note' : 'Highlight'}: ${mark.note ? notePlainText(mark.note) : mark.text || ''}`.slice(0, 120),
        from: at(mark.chapterNumber, mark.paragraphIndex, mark.fromWord), to: at(mark.chapterNumber, mark.endParagraphIndex, mark.toWord),
        anchor: { paragraphIndex: mark.paragraphIndex, wordIndex: mark.fromWord } })
    }
    for (const card of bookCards ?? []) {
      if (card.chapterNumber === live || !inUnit.has(card.chapterNumber)) continue
      const from = at(card.chapterNumber, card.paragraphIndex, card.wordIndex)
      marks.push({ id: `c:${card.id}`, kind: 'card', chapterNumber: card.chapterNumber, label: card.label, from, to: from, anchor: { paragraphIndex: card.paragraphIndex, wordIndex: card.wordIndex } })
    }
    return marks
  }, [unit, live, texts, bookHighlights, bookCards])
  const mountedSet = useMemo(() => new Set(mounted), [mounted])
  const perWord = metrics.current.words > 0 ? metrics.current.px / metrics.current.words : 3.4
  const wordsPerParagraph = metrics.current.paragraphs > 0 ? metrics.current.words / metrics.current.paragraphs : 80
  // The chapters around the reader's own do not depend on the reader's passage: their elements are
  // reused across the reader's own renders (one per reported word), so only the own chapter is diffed.
  const onOpenFigure = passage.onOpenFigure
  const layoutKey = passage.layoutKey
  // A neighbour's end pills are rebuilt with the reader's state they show (busy, labels), not on every render.
  const neighbourEndRef = useRef(neighbourEnd)
  neighbourEndRef.current = neighbourEnd
  const endsKey = passage.chapterActionsBusy ? 'busy' : 'idle'
  const paintedKey = unit.chapters.filter(chapter => chapter.number === live || (mountedSet.has(chapter.number) && texts.has(chapter.number))).map(chapter => chapter.number).join(',')
  const onPaintedRef = useRef(onPaintedChange)
  onPaintedRef.current = onPaintedChange
  useEffect(() => { onPaintedRef.current?.(paintedKey ? paintedKey.split(',').map(Number) : []) }, [paintedKey])
  /** A neighbour's passage element, kept while its inputs are the same objects (React then skips its every word). */
  const neighbourPassages = useRef(new Map<number, { inputs: unknown[]; element: ReactElement }>())
  /** A neighbour's end pills: rebuilt into the chapter's end slot, so new pills never re-render its words. */
  const neighbourEnds = useRef(new Map<number, EndStore>())
  const others = useMemo(() => unit.chapters.map((chapter) => {
    if (chapter.number === live) return null
    const text = mountedSet.has(chapter.number) ? texts.get(chapter.number) : undefined
    if (text) {
      let end = neighbourEnds.current.get(chapter.number)
      if (!end) neighbourEnds.current.set(chapter.number, end = { node: null, listeners: new Set() })
      setEnd(end, neighbourEndRef.current?.(chapter.number))
      const page = continuousReaderWindows(text.paragraphs)[0]?.page
      const highlights = highlightsByChapter.get(chapter.number) ?? NO_HIGHLIGHTS
      const inputs: unknown[] = [text.title, text.paragraphs, page, highlights, layoutKey, onOpenFigure, end]
      let cached = neighbourPassages.current.get(chapter.number)
      if (!cached || cached.inputs.length !== inputs.length || cached.inputs.some((input, index) => !Object.is(input, inputs[index]))) {
        cached = { inputs, element: page ? <LabPassage inertWords stableWords chapterTitle={text.title} chapterNumber={chapter.number} paragraphs={text.paragraphs} readingPage={page}
          compareParagraphs={EMPTY_COMPARE_PARAGRAPHS} compare={false} mode="reading" desktopSpread={false} follow={NO_FOLLOW} followParagraphs={NO_FOLLOW_PARAGRAPHS}
          markedIndexes={NO_MARKS} highlights={highlights} plannedHyphens={false} tapZones="none" keyboardSelection touchScroll measureEndOverflow={false}
          layoutKey={layoutKey} onOpenFigure={onOpenFigure} chapterEnd={<ChapterEndSlot store={end} />} /> : <></> }
        neighbourPassages.current.set(chapter.number, cached)
      }
      return <section className="book-scroll-chapter is-neighbour" data-book-scroll-chapter={chapter.number} data-book-scroll-painted="true" key={chapter.number}
        onPointerDown={stopInText} onPointerMove={stopInText} onPointerUp={stopInText} onPointerCancel={stopInText} onContextMenu={stopInText}>
        {cached.element}
      </section>
    }
    neighbourPassages.current.delete(chapter.number)
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
  }), [unit, live, mountedSet, texts, layoutKey, highlightsByChapter, onOpenFigure, measured, endsKey])
  const onJumpRef = useRef(onJumpChapter)
  onJumpRef.current = onJumpChapter
  const bookMap = useMemo(() => unit.chapters.length > 1
    ? { chapters: unit.chapters, chapterNumber: live, onJumpChapter: (number: number, place?: ContinuousReaderAnchor) => onJumpRef.current(number, place) } : undefined, [unit, live])
  const chapters = others.map((section, index) => section ?? <section className="book-scroll-chapter is-own" data-book-scroll-chapter={live} data-book-scroll-painted="true" key={unit.chapters[index].number}>{livePassage}</section>)
  return <><SourceMinimap cards={cards} highlights={passage.highlights?.filter(mark => mark.chapterNumber === passage.chapterNumber)}
    bookMap={bookMap} unitMarks={unitMarks}
    paragraphs={paragraphs} visible={mapVisible} visibleEnd={mapEnd} onJump={jumpFromMap} chapterMarks />
  <div className="continuous-reader" data-testid="continuous-reader" data-book-scroll="true" data-book-scroll-unit={unit.key} data-book-scroll-gap={unit.gap} ref={hostRef} onScroll={() => handleScroll()}
    onPointerDown={event => { beginNativeDrag(event); if (!(event.target instanceof Element && event.target.closest('.source-margin-item'))) userBrowse() }}
    onPointerUp={finishNativeDrag} onPointerCancel={() => { nativeDragEpoch.current = null }}
    onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(event.key)) { adoptedHold.current = false; userBrowse() } }}>
    <div className="continuous-reader-paper">
      <div className="continuous-reader-window book-scroll-unit">{chapters}</div>
    </div>
  </div></>
}
