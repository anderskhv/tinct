/**
 * The save-your-place boxes for signed-out readers (labSavePlace.ts holds the rules): one under a chapter's end, one
 * welcoming a reader back. Quiet, in the page, no dismiss control: a box is seen after about two seconds on screen,
 * and once seen it goes the moment it leaves the screen, for good.
 *
 * Never moves the reader's place: the chapter-end box sits below the chapter's last line. In a scrolling reader it
 * is in the flow below the chapter end; leaving the screen above the reader, it is removed with the scroll kept so
 * the text in view does not move. In a paged reader it is laid over the free space under the chapter end, out of the
 * flow, so the pages are measured exactly as without it, and it is not shown where that space is too small.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { trackFunnel } from '../utils/funnel'
import { LAB_COPY } from './labCopy'
import { labCurrentPath, labSignInHref } from './labAccountPrompt'
import { chapterEndKey, decideChapterEndBox, markChapterEndBoxSeen, markWelcomeBackSeen, readSavePlace, SAVE_PLACE_SEEN_MS, type ChapterEndDecision } from './labSavePlace'
import { rememberSignInBook } from './signInEntry'

/** The signed-out reader's book, for the chapter-end box; null when signed in (or in free reading mode): no boxes. */
export interface SavePlaceReader {
  bookId: string
  bookTitle: string
  /** Chapters of this book finished on this device. */
  finished: ReadonlySet<number>
  /**
   * The phone's pages: the paginator's measuring copy of the chapter end keeps room for the box under the actions
   * (LabSavePlaceRoom), so the box lies in that room on the final page without moving a word.
   */
  reserveRoom?: boolean
  /**
   * A scrolling reader (the Margin reader): every chapter end keeps the box's room in the flow, shown or not, so the
   * chapter's physical end and the scroll extent never change when the box is decided, shown or taken away.
   */
  scrolling?: boolean
}
export const SavePlaceContext = createContext<SavePlaceReader | null>(null)

/** Share of the box that must be on screen for it to count as on screen. */
const ON_SCREEN_RATIO = 0.6

/** The chapter ends decided in this page load, so every copy of one chapter end (and a remount) agrees. */
const decided = new Map<string, ChapterEndDecision>()
/** Tests only. */
export function resetSavePlaceDecisions(): void { decided.clear() }

/**
 * A chapter end's state as a copy mounts: decided earlier in this load, or not yet. One whose box was seen since (a page
 * turned away before it left the screen) is gone.
 */
function decidedState(key: string | null): ChapterEndDecision | 'pending' {
  if (!key) return 'none'
  const decision = decided.get(key)
  if (decision === 'show' && readSavePlace().ends.includes(key)) { decided.set(key, 'none'); return 'none' }
  return decision ?? 'pending'
}

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
  }
  return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null
}

/**
 * Remove a box without moving the text on screen: a box still on or below the screen goes as it is (only what is below
 * it moves); one that left above the screen goes with the scroll corrected by however far the text in view moved.
 */
export function removeKeepingView(box: HTMLElement | null, remove: () => void): void {
  const scroller = box?.isConnected ? scrollParent(box) : null
  if (!box || !scroller) { remove(); return }
  const view = scroller === document.scrollingElement ? { top: 0, left: 0, width: innerWidth, height: innerHeight } : scroller.getBoundingClientRect()
  const rect = box.getBoundingClientRect()
  if (!rect.height || rect.bottom > view.top) { remove(); return }
  const probe = document.elementFromPoint?.(view.left + view.width / 2, view.top + Math.min(view.height / 2, 160))
  const before = probe && !box.contains(probe) ? probe.getBoundingClientRect().top : null
  flushSync(remove)
  if (probe && before != null && probe.isConnected) {
    const moved = probe.getBoundingClientRect().top - before
    if (moved) scroller.scrollTop += moved
  }
}

/**
 * Seen after SAVE_PLACE_SEEN_MS mostly on screen; once seen, gone when it is wholly off screen (or, with `goneKey`,
 * when that changes: a page turn on the phone, where the box stays put above the page).
 */
function useSeenThenGone(ref: RefObject<HTMLElement | null>, active: boolean, onSeen: () => void, onGone: () => void, goneKey?: string | number) {
  const calls = useRef({ onSeen, onGone })
  calls.current = { onSeen, onGone }
  const goneKeyRef = useRef(goneKey)
  goneKeyRef.current = goneKey
  const [seenAt, setSeenAt] = useState<{ key: string | number | undefined } | null>(null)
  useEffect(() => {
    const element = ref.current
    if (!active || !element || typeof IntersectionObserver !== 'function') return
    let timer: ReturnType<typeof setTimeout> | null = null
    let seen = false
    const observer = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      const onScreen = entry.isIntersecting && entry.intersectionRatio >= ON_SCREEN_RATIO
      if (!seen && onScreen && timer == null) {
        timer = setTimeout(() => { timer = null; seen = true; calls.current.onSeen(); setSeenAt({ key: goneKeyRef.current }) }, SAVE_PLACE_SEEN_MS)
      } else if (!seen && !onScreen && timer != null) {
        clearTimeout(timer)
        timer = null
      }
      if (seen && !entry.isIntersecting) calls.current.onGone()
    }, { threshold: [0, ON_SCREEN_RATIO] })
    observer.observe(element)
    return () => { observer.disconnect(); if (timer != null) clearTimeout(timer) }
  }, [active, ref])
  useEffect(() => {
    if (seenAt && goneKey !== undefined && goneKey !== seenAt.key) calls.current.onGone()
  }, [goneKey, seenAt])
}

function SavePlaceLink({ children, bookTitle, moment, chapters, testId }: { children: string; bookTitle: string | null; moment: 'chapter_end' | 'return'; chapters: number; testId: string }) {
  return <a className="lab-save-place-link" data-testid={testId} href={labSignInHref('create', labCurrentPath(), 'save_place')}
    onClick={event => {
      // The address may have moved on (another chapter) since this rendered: sign-in returns to where the reader is now.
      event.currentTarget.href = labSignInHref('create', labCurrentPath(), 'save_place')
      rememberSignInBook(bookTitle)
      trackFunnel('save_place_prompt_clicked', { moment, chapters })
    }}>{children}</a>
}

/** Under a chapter's end actions (LabChapterEnd), for a signed-out reader: "You've read {n} chapters of {book}…". */
export function LabSavePlaceChapterEnd({ chapterNumber }: { chapterNumber?: number }) {
  const reader = useContext(SavePlaceContext)
  const key = reader && chapterNumber != null ? chapterEndKey(reader.bookId, chapterNumber) : null
  const [state, setState] = useState<ChapterEndDecision | 'pending'>(() => decidedState(key))
  const [fits, setFits] = useState(true)
  const sentinel = useRef<HTMLSpanElement>(null)
  const box = useRef<HTMLParagraphElement>(null)
  useEffect(() => { setState(decidedState(key)) }, [key])
  // Reached: the chapter end comes on screen from below (a reader going back up past it is not reaching it).
  useEffect(() => {
    const section = sentinel.current?.parentElement
    if (!key || state !== 'pending' || !section || typeof IntersectionObserver !== 'function') return
    const observer = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1]
      if (!entry?.isIntersecting) return
      const top = entry.rootBounds?.top ?? 0
      if (entry.boundingClientRect.top < top) return
      observer.disconnect()
      const decision = decided.get(key) ?? decideChapterEndBox(key)
      decided.set(key, decision)
      setState(decision)
    })
    observer.observe(section)
    return () => observer.disconnect()
  }, [key, state])
  // A paged reader: shown only where the page has room for it under the chapter end.
  useLayoutEffect(() => {
    const element = box.current
    if (state !== 'show' || !element || element.closest('.continuous-reader')) return
    const page = element.closest('article') ?? element.closest('.lab-page-wrap')
    const wrap = element.closest('.lab-page-wrap')
    const rect = element.getBoundingClientRect()
    const bottom = Math.min(page?.getBoundingClientRect().bottom ?? innerHeight, wrap?.getBoundingClientRect().bottom ?? innerHeight, innerHeight)
    setFits(rect.height > 0 && rect.bottom <= bottom - 4)
  }, [state])
  const chapters = reader && chapterNumber != null ? new Set([...reader.finished, chapterNumber]).size : 0
  const showing = state === 'show' && fits && !!reader
  useSeenThenGone(box, showing, () => {
    if (!key) return
    markChapterEndBoxSeen(key)
    trackFunnel('save_place_prompt_shown', { moment: 'chapter_end', chapters })
  }, () => {
    if (!key) return
    decided.set(key, 'none')
    // In a scrolling reader the room stays: hiding the box moves nothing.
    if (reader?.scrolling) setState('none')
    else removeKeepingView(box.current, () => setState('none'))
  })
  if (!key) return null
  const line = (chapters <= 1 ? LAB_COPY.savePlaceFirstChapter : LAB_COPY.savePlaceChapters.replace('{n}', String(chapters))).replace('{book}', reader!.bookTitle)
  return <>
    <span ref={sentinel} hidden />
    {state === 'show' ? <p ref={box} className={`lab-save-place is-chapter-end${fits ? '' : ' is-unfit'}`} data-testid="lab-save-place-chapter-end" aria-hidden={fits ? undefined : true}>
      {line}<SavePlaceLink bookTitle={reader!.bookTitle} moment="chapter_end" chapters={chapters} testId="lab-save-place-link">{LAB_COPY.savePlaceLink}</SavePlaceLink>
    </p> : reader!.scrolling && <p className="lab-save-place is-chapter-end is-room" aria-hidden="true">
      {line}<span className="lab-save-place-link">{LAB_COPY.savePlaceLink}</span>
    </p>}
  </>
}

/**
 * The room the chapter-end box takes, in the paginators' measuring copy of the chapter end (phone pages only). Always
 * reserved for a signed-out reader whether or not a box will show, so the page map never depends on the box: the
 * longer of the two lines, invisible, in the flow.
 */
export function LabSavePlaceRoom() {
  const reader = useContext(SavePlaceContext)
  if (!reader?.reserveRoom) return null
  return <p className="lab-save-place is-room" aria-hidden="true">
    {LAB_COPY.savePlaceFirstChapter.replace('{book}', reader.bookTitle)}<span className="lab-save-place-link">{LAB_COPY.savePlaceLink}</span>
  </p>
}

/**
 * Welcome back (labSavePlace.ts welcomeBackDue): in the desktop margin, or above the phone's page. `goneKey` is the
 * phone's page: once seen, turning the page takes the box away.
 */
export function LabSavePlaceWelcome({ bookTitle, chapters, phone = false, goneKey, onGone }: {
  bookTitle: string | null
  chapters: number
  phone?: boolean
  goneKey?: string | number
  onGone: () => void
}) {
  const box = useRef<HTMLParagraphElement>(null)
  useSeenThenGone(box, true, () => {
    markWelcomeBackSeen()
    trackFunnel('save_place_prompt_shown', { moment: 'return', chapters })
  }, () => { if (phone) onGone(); else removeKeepingView(box.current, onGone) }, goneKey)
  return <p ref={box} className={`lab-save-place is-welcome${phone ? ' is-phone-band' : ''}`} data-testid="lab-save-place-welcome">
    {LAB_COPY.savePlaceWelcomeBack}
    <SavePlaceLink bookTitle={bookTitle} moment="return" chapters={chapters} testId="lab-save-place-welcome-link">{LAB_COPY.savePlaceWelcomeBackLink}</SavePlaceLink>
    {LAB_COPY.savePlaceWelcomeBackTail}
  </p>
}
