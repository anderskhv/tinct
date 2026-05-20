import { useCallback, useRef, useState, useEffect, useLayoutEffect } from 'react'
import { ParagraphRenderer } from './ParagraphRenderer'
import type { Highlight, HighlightColor } from '../types'
import { HIGHLIGHT_COLORS } from '../types'
import { apiUrl } from '../utils/apiUrl'
import { lookup as dictLookup } from '../services/dictionary'
import type { DictResult } from '../services/dictionary'

interface SelectionInfo {
  x: number
  y: number
  text: string
  paragraphIndex: number
  startOffset: number
  endOffset: number
  showBelow?: boolean
  existingHighlightId?: string
  existingNote?: string
  noteEditMode?: boolean
}

interface ReaderProps {
  paragraphs: string[]
  chapterTitle: string
  /** Right side of the running footer — formatted progress per user's
   * `progressDisplay` preference (percent/page/time/location × book/
   * chapter/section). Computed in App.tsx via `formatProgressLabel`.
   * If absent, the footer falls back to `currentPage / totalPages`. */
  progressLabel?: string
  editionLabel: string
  isLoading: boolean
  highlights: Highlight[]
  onHighlight: (
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
  ) => void
  onTextSelect: (text: string) => void
  onReflect?: () => void
  onGenerateSummary?: () => void
  isGeneratingSummary?: boolean
  isFinalChapter?: boolean
  readerRef: React.RefObject<HTMLDivElement>
  /** Called when page changes with (currentPage, totalPages) */
  onPageChange?: (page: number, total: number) => void
  /** Called with the index of the first paragraph visible on the current page */
  onFirstVisibleParagraph?: (paragraphIndex: number) => void
  /** Initial scroll fraction (0–1) to restore on mount, or absolute page number (>1) for backwards compat */
  initialPage?: number
  /** Whether this edition is verse (preserve line breaks) */
  isVerse?: boolean
  /** Target paragraph to scroll to after layout (from highlight/thread navigation) */
  targetParagraphIndex?: number
  /** Change this value to force re-sync to targetParagraphIndex even if the index is the same */
  targetParagraphNonce?: number
  /** Index of the paragraph currently being played by AudioPlayer */
  playingParagraphIndex?: number
  /**
   * Fraction (0-1) through the currently-playing paragraph's audio.
   * Used to keep the visible page in sync when a single paragraph
   * wraps across a page break — interpolates linearly across the
   * paragraph's visual width.
   */
  playingParagraphProgress?: number
  /** Called when user clicks a paragraph to start audio from there */
  onParagraphClick?: (paragraphIndex: number) => void
  /** Whether audio is currently available/active */
  hasAudio?: boolean
  /** Whether audio is currently playing (gates tap-to-play-paragraph on mobile) */
  isAudioPlaying?: boolean
  /** Navigate to next/previous chapter */
  onNextChapter?: () => void
  onPrevChapter?: () => void
  /** Whether side panel is open — triggers column recalc on change */
  panelOpen?: boolean
  /** Disable highlight selection popup (e.g. on mobile) */
  disableHighlight?: boolean
  /** Whether this Reader instance should respond to window-level events
   * (keydown, tinct:page-nav). On mobile, two Readers are mounted at once
   * (view 0 primary, view 1 compare) — only the active one should listen,
   * or both would fire onNextChapter/onPrevChapter for every page-nav event.
   * Defaults to true so desktop (single Reader) works without the prop. */
  isActive?: boolean
  onDeleteHighlight?: (id: string) => void
  onUpdateHighlightNote?: (id: string, note: string) => void
  onUpdateHighlightColor?: (id: string, color: HighlightColor) => void
  onShare?: (text: string) => void
  /** Context for issue reporting */
  bookId?: string
  editionKey?: string
  currentChapter?: number
  authToken?: string
  /** Reader typography. Passed in (rather than read from CSS) so a change
   * to either re-runs the recalc effect — without this, the column count
   * stays stale after the user changes font size and pagination breaks
   * (current page no longer matches current content). */
  fontSize?: string
  fontFamily?: string
}

export function Reader({
  paragraphs,
  chapterTitle,
  progressLabel,
  editionLabel,
  isLoading,
  highlights,
  onHighlight,
  onTextSelect,
  onReflect,
  onGenerateSummary,
  isGeneratingSummary,
  isFinalChapter,
  readerRef,
  onPageChange,
  onFirstVisibleParagraph,
  initialPage,
  isVerse,
  targetParagraphIndex,
  targetParagraphNonce,
  playingParagraphIndex,
  playingParagraphProgress,
  onParagraphClick,
  hasAudio,
  onNextChapter,
  onPrevChapter,
  panelOpen,
  disableHighlight,
  onDeleteHighlight,
  onUpdateHighlightNote,
  onUpdateHighlightColor,
  isAudioPlaying,
  onShare,
  bookId,
  editionKey,
  currentChapter,
  authToken,
  fontSize,
  fontFamily,
  isActive = true,
}: ReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [popupMode, setPopupMode] = useState<'main' | 'colors' | 'issue' | 'note' | 'define'>('main')
  const [defineQuery, setDefineQuery] = useState('')
  const [defineResult, setDefineResult] = useState<DictResult | null>(null)
  const [defineLoading, setDefineLoading] = useState(false)
  const [defineNotFound, setDefineNotFound] = useState(false)
  const [issueTag, setIssueTag] = useState('')
  const [issueComment, setIssueComment] = useState('')
  const [issueSubmitting, setIssueSubmitting] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Temp DOM mark that keeps the visual selection highlight visible while the
  // popup is open, even after we clear the native selection on mobile (which
  // we do to suppress Safari's edit menu). Removed when the popup dismisses.
  const selectionPreviewMarkRef = useRef<HTMLElement | null>(null)
  const clearSelectionPreview = useCallback(() => {
    const m = selectionPreviewMarkRef.current
    selectionPreviewMarkRef.current = null
    if (!m || !m.parentNode) return
    const parent = m.parentNode
    while (m.firstChild) parent.insertBefore(m.firstChild, m)
    parent.removeChild(m)
    if ((parent as Element).normalize) (parent as Element).normalize()
  }, [])
  // Wrapper: dismissing the popup also clears the preview mark.
  const dismissPopup = useCallback(() => {
    clearSelectionPreview()
    setSelectionPopup(null)
  }, [clearSelectionPreview])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  // Reactive layout metric. Driven by ResizeObserver so any container width
  // change (panel toggle, split-pane toggle, font-size change, window resize)
  // forces a React re-render. Without this, `updateColumnWidth` mutated DOM
  // directly without changing React state — the inline `transform` on the
  // content element kept its old value while DOM columns had reflowed,
  // leaving 1-2 paragraphs of bleed on the left edge (B13). Tabbing to
  // another app triggered a browser-level layout pass that masked the bug.
  // The fix is structural: derive the transform from a value React owns.
  const [colWidthState, setColWidthState] = useState(0)
  const [gapState, setGapState] = useState(60)
  const [chapterEndPage, setChapterEndPage] = useState<number | null>(null)
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage
  const totalPagesRef = useRef(totalPages)
  totalPagesRef.current = totalPages
  const initialPageRef = useRef(initialPage)
  const userNavigatedRef = useRef(false)
  // Phantom-click guard. On chapter advance the Reader unmounts/remounts
  // at the same DOM coordinates; on Boox/Capacitor WebView the touch
  // driver re-dispatches the click ~60ms later to the freshly-mounted
  // page-nav button at the tap location. That stale-closure click reads
  // currentPage from the first render's snapshot and calls
  // goToPage(currentPage ± 1), undoing the correct chapter-cross
  // restore. Ignore any page-arrow click within 500ms of mount.
  const mountedAtRef = useRef(Date.now())

  // Read actual column-gap from CSS (60px desktop, 40px mobile)
  const getGap = useCallback(() => {
    const content = contentRef.current
    if (!content) return 60
    return parseFloat(getComputedStyle(content).columnGap) || 60
  }, [])

  // Get actual padding from DOM (adapts to mobile CSS)
  const getColWidth = useCallback(() => {
    const container = readerRef.current
    const content = contentRef.current
    if (!container || !content) return 0
    const style = getComputedStyle(content)
    const padLeft = parseFloat(style.paddingLeft) || 0
    const padRight = parseFloat(style.paddingRight) || 0
    return container.clientWidth - padLeft - padRight
  }, [readerRef])

  // Set column-width CSS property to match container
  const updateColumnWidth = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    const colW = getColWidth()
    if (colW > 0) {
      content.style.columnWidth = `${colW}px`
    }
  }, [getColWidth])

  // CSS multi-column pagination: count columns from scrollWidth, AND publish
  // the measured colWidth/gap into React state so the transform stays in sync.
  const recalcPages = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    updateColumnWidth()
    const colWidth = getColWidth()
    if (colWidth <= 0) return
    const gap = getGap()
    // Total scrollWidth includes all columns and gaps between them
    const pages = Math.max(1, Math.round((content.scrollWidth + gap) / (colWidth + gap)))
    // Preserve reading position across layout changes (window resize, panel
    // toggle, font-size change). currentPage is absolute — page 14 of 18 is
    // different content than page 14 of 33. Convert via scroll fraction so
    // the reader stays at the same content position after reflow.
    // Skip when initialPageRef is set — mount-time restore handles that path.
    const oldPages = totalPagesRef.current
    if (initialPageRef.current === undefined && oldPages > 1 && pages > 1 && pages !== oldPages) {
      const frac = currentPageRef.current / (oldPages - 1)
      const newPage = Math.round(frac * (pages - 1))
      currentPageRef.current = newPage
      setCurrentPage(newPage)
    }
    setTotalPages(pages)
    setColWidthState(colWidth)
    setGapState(gap)
  }, [updateColumnWidth, getColWidth, getGap])

  // Initial measurement runs synchronously before paint via useLayoutEffect.
  // Without this, the first paint shows translateX(0) (page 1) because
  // colWidthState starts at 0 and refs aren't measurable until commit phase.
  // Then the second paint after observer fires animates to the correct
  // position — visible flash on every chapter advance, especially in
  // split-pane where the chapter header is the first column. Running the
  // measurement in useLayoutEffect lets the first paint already have the
  // correct transform; no transition-from-page-1 ever happens.
  // Centralized setCurrentPage proxy that traces every call. Identifies which
  // of the 6+ effects competing for the page state actually fired on a
  // chapter cross, so Anders can paste tinctDebug() after a repro and we
  // can see the actual sequence in his APK / WebView environment.
  const tracePageSet = useCallback((source: string, target: number, extra?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return
    const w = window as Window & { __tinctNavDebug?: unknown[] }
    w.__tinctNavDebug = w.__tinctNavDebug || []
    w.__tinctNavDebug.push({ at: Date.now(), kind: 'reader.setPage', source, target, chapterTitle, isAudioPlaying, playingParagraphIndex, ...extra })
    if (w.__tinctNavDebug.length > 80) w.__tinctNavDebug.shift()
  }, [chapterTitle, isAudioPlaying, playingParagraphIndex])

  useLayoutEffect(() => {
    recalcPages()
    const content = contentRef.current
    const dbg = (note: string, extra?: Record<string, unknown>) => {
      if (typeof window === 'undefined') return
      const w = window as Window & { __tinctNavDebug?: unknown[] }
      w.__tinctNavDebug = w.__tinctNavDebug || []
      w.__tinctNavDebug.push({ at: Date.now(), kind: 'reader.layout', note, initialPageProp: initialPage, initialPageRef: initialPageRef.current, ...extra })
      if (w.__tinctNavDebug.length > 80) w.__tinctNavDebug.shift()
    }
    if (!content) { dbg('no-content'); return }
    const cw = getColWidth()
    const gp = getGap()
    if (cw <= 0) { dbg('cw-zero', { cw, gp }); return }
    const pages = Math.max(1, Math.round((content.scrollWidth + gp) / (cw + gp)))
    if (pages <= 1) { dbg('pages-le-1', { pages, scrollWidth: content.scrollWidth, cw, gp }); return }
    if (targetParagraphRef.current !== undefined) { dbg('target-para-set', { para: targetParagraphRef.current }); return }
    const frac = initialPageRef.current
    if (frac !== undefined && frac >= 0 && frac <= 1) {
      const targetPage = Math.round(frac * (pages - 1))
      dbg('restore', { frac, pages, targetPage })
      tracePageSet('layout-restore', targetPage, { frac, pages })
      setCurrentPage(targetPage)
    } else {
      dbg('frac-undef-or-oor', { frac })
    }
  }, [recalcPages, paragraphs, chapterTitle, getColWidth, getGap, initialPage, tracePageSet])

  // Re-apply initial fraction whenever totalPages changes during layout
  // settle. The layout effect above converts frac→page on mount, but async
  // recalcPages (100ms/500ms/1500ms timers, ResizeObserver) can change
  // totalPages afterward — especially on mobile where column widths are
  // narrower and scrollWidth rounding is more volatile. Without this,
  // backward chapter nav lands on second-to-last or first page instead of
  // last. Stops once the user manually navigates.
  useEffect(() => {
    const frac = initialPageRef.current
    if (frac === undefined || totalPages <= 1) return
    if (userNavigatedRef.current) return
    const targetPage = Math.round(frac * (totalPages - 1))
    if (targetPage !== currentPageRef.current) {
      tracePageSet('frac-reapply', targetPage, { frac, totalPages })
      currentPageRef.current = targetPage
      setCurrentPage(targetPage)
    }
  }, [totalPages, tracePageSet])

  useEffect(() => {
    // Async recalc retries cover late-arriving font/layout changes (mobile
    // especially). Initial measurement already happened synchronously
    // above; these are the safety net.
    const timer1 = setTimeout(recalcPages, 100)
    const timer2 = setTimeout(recalcPages, 500)
    const timer3 = setTimeout(recalcPages, 1500)
    const container = readerRef.current
    // Two recalc passes per observed resize: one immediate (snaps the
    // transform straight away — no visible bleed) and one after the CSS
    // transition settles (~320ms; final value once panel slide is done).
    let postTransitionTimer: ReturnType<typeof setTimeout>
    const observer = container ? new ResizeObserver(() => {
      recalcPages()
      clearTimeout(postTransitionTimer)
      postTransitionTimer = setTimeout(recalcPages, 320)
    }) : null
    if (container && observer) observer.observe(container)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(postTransitionTimer); observer?.disconnect() }
    // fontSize/fontFamily change content scrollWidth without changing the
    // container's box, so ResizeObserver doesn't fire — depend on them
    // explicitly so the timer-driven recalc fires after the reflow settles.
  }, [paragraphs, chapterTitle, recalcPages, panelOpen, fontSize, fontFamily])

  // Restore position from initialPage fraction or targetParagraphIndex after layout settles
  const targetParagraphRef = useRef(targetParagraphIndex)

  const tryScrollToParagraph = useCallback(() => {
    const paraIdx = targetParagraphRef.current
    if (paraIdx === undefined) return false
    const content = contentRef.current
    if (!content) return false
    const el = content.querySelector(`[data-paragraph-index="${paraIdx}"]`) as HTMLElement
    if (!el) return false
    const colWidth = getColWidth()
    const gap = getGap()
    if (colWidth <= 0) return false
    const page = Math.floor(el.offsetLeft / (colWidth + gap))
    // offsetLeft is 0 for all elements when layout hasn't settled — don't consume if page=0 and para>0
    if (page === 0 && paraIdx > 0 && el.offsetLeft === 0) return false
    const pageClamped = Math.min(page, Math.max(0, totalPages - 1))
    tracePageSet('paragraph-target', pageClamped, { paraIdx, rawPage: page })
    setCurrentPage(pageClamped)
    targetParagraphRef.current = undefined
    initialPageRef.current = undefined
    return true
  }, [getColWidth, getGap, totalPages, tracePageSet])

  useEffect(() => {
    // targetParagraphIndex takes priority over initialPage
    if (targetParagraphRef.current !== undefined) {
      if (totalPages > 1 && tryScrollToParagraph()) return
      // Not ready yet — retry after layout settles
      return
    }
    const frac = initialPageRef.current
    if (frac !== undefined && frac >= 0 && frac <= 1 && totalPages > 1) {
      const targetPage = Math.round(frac * (totalPages - 1))
      tracePageSet('totalPages-restore', targetPage, { frac, totalPages })
      setCurrentPage(targetPage)
      initialPageRef.current = undefined // only restore once
    }
  }, [totalPages, tryScrollToParagraph, tracePageSet])

  // Respond to targetParagraphIndex prop changes after mount (e.g. mobile tab sync)
  // targetParagraphNonce forces re-sync even when the paragraph index hasn't changed
  useEffect(() => {
    if (targetParagraphNonce === undefined) return
    if (targetParagraphIndex === undefined || totalPages <= 1) return
    const content = contentRef.current
    if (!content) return
    const el = content.querySelector(`[data-paragraph-index="${targetParagraphIndex}"]`) as HTMLElement
    if (el) {
      const colWidth = getColWidth()
      const gap = getGap()
      if (colWidth > 0) {
        const page = Math.floor(el.offsetLeft / (colWidth + gap))
        const pageClamped = Math.min(page, totalPages - 1)
        tracePageSet('paragraph-nonce', pageClamped, { targetParagraphIndex, targetParagraphNonce })
        setCurrentPage(pageClamped)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetParagraphNonce])

  // Report page changes to parent
  useEffect(() => {
    onPageChange?.(currentPage, totalPages)
  }, [currentPage, totalPages, onPageChange])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const end = content.querySelector('.chapter-end') as HTMLElement | null
    if (!end) {
      setChapterEndPage(null)
      return
    }
    const colWidth = getColWidth()
    const gap = getGap()
    if (colWidth <= 0) return
    const page = Math.floor(end.offsetLeft / (colWidth + gap))
    setChapterEndPage(Math.max(0, Math.min(page, Math.max(0, totalPages - 1))))
  }, [paragraphs, currentPage, totalPages, getColWidth, getGap])

  // Report first visible paragraph on current page
  useEffect(() => {
    if (!onFirstVisibleParagraph) return
    const content = contentRef.current
    if (!content) return
    const colWidth = getColWidth()
    const gap = getGap()
    if (colWidth <= 0) return
    const pageLeft = currentPage * (colWidth + gap)
    const pageRight = pageLeft + colWidth
    const paraEls = content.querySelectorAll('[data-paragraph-index]')
    for (const el of paraEls) {
      const htmlEl = el as HTMLElement
      // Element is visible if it starts within the current page column
      if (htmlEl.offsetLeft < pageRight && htmlEl.offsetLeft + htmlEl.offsetWidth > pageLeft) {
        const idx = parseInt(htmlEl.getAttribute('data-paragraph-index') || '0', 10)
        onFirstVisibleParagraph(idx)
        return
      }
    }
  }, [currentPage, totalPages, onFirstVisibleParagraph, getColWidth, getGap])

  // Auto-scroll to keep the playing paragraph visible as the audio
  // progresses. Interpolates across the paragraph's visual width so the
  // page also flips mid-paragraph when a long paragraph spans two pages
  // (otherwise the reader visibly stalls while the audio keeps reading).
  // Skip if user manually navigated away — don't snap back.
  //
  // CRITICAL: gated on isAudioPlaying. Without that gate, this effect
  // fired on every Reader mount with a stale playingParagraphIndex left
  // over from a prior audio session, hijacking the page after a chapter
  // cross. Anders saw "Prologue → Parodos lands on page 2 of Parodos"
  // and "Ch 2 → Ch 1 lands on first page of Ch 1" — both the same root
  // cause: paragraph index leaked from a previous chapter, the new
  // Reader mounted at the correct restore page (0 or last), then this
  // effect snapped it to wherever the stale paragraph lived. We only
  // trust playingParagraphIndex while audio is actually playing.
  useEffect(() => {
    if (!isAudioPlaying) return
    if (playingParagraphIndex === undefined || totalPagesRef.current <= 1) return
    if (userNavigatedRef.current) return
    const content = contentRef.current
    if (!content) return
    const el = content.querySelector(`[data-paragraph-index="${playingParagraphIndex}"]`) as HTMLElement
    if (!el) return
    const colWidth = getColWidth()
    const gap = getGap()
    if (colWidth <= 0) return

    // Where within the paragraph is the audio right now?
    const progress = Math.max(0, Math.min(1, playingParagraphProgress ?? 0))
    const currentX = el.offsetLeft + progress * el.offsetWidth
    const page = Math.floor(currentX / (colWidth + gap))
    const clamped = Math.min(page, totalPagesRef.current - 1)
    if (clamped !== currentPageRef.current) {
      tracePageSet('audio-autoscroll', clamped, { playingParagraphIndex, isAudioPlaying })
      setCurrentPage(clamped)
    }
  }, [isAudioPlaying, playingParagraphIndex, playingParagraphProgress, getColWidth, getGap, tracePageSet])

  // Reset userNavigated flag only when audio stops entirely. Rationale:
  // during playback, the user's manual page turn must stick — otherwise
  // auto-follow snaps the page back ~300ms later on the next progress
  // tick, making page-turn buttons appear broken while audio is playing.
  // A page turn is a page turn, always.
  useEffect(() => {
    if (playingParagraphIndex === undefined) {
      userNavigatedRef.current = false
    }
  }, [playingParagraphIndex])

  // Keep the selection popup inside the viewport. The initial position
  // is a best-effort (we pick above/below the selection based on room),
  // but the popup's size isn't known until it has rendered — especially
  // in the issue-form state where the Submit button used to fall off the
  // bottom of mobile screens. One post-render nudge. The ref-flag guards
  // against a re-render loop: once clamped, the next pass is in bounds
  // and the effect becomes a no-op.
  useLayoutEffect(() => {
    if (!selectionPopup) return
    const el = popupRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 8

    let dx = 0
    let dy = 0
    if (rect.left < margin) dx = margin - rect.left
    else if (rect.right > vw - margin) dx = (vw - margin) - rect.right
    if (rect.top < margin) dy = margin - rect.top
    else if (rect.bottom > vh - margin) dy = (vh - margin) - rect.bottom

    if (dx === 0 && dy === 0) return
    setSelectionPopup(sp => sp ? { ...sp, x: sp.x + dx, y: sp.y + dy } : null)
  }, [selectionPopup?.x, selectionPopup?.y, selectionPopup?.showBelow, popupMode, issueTag])

  const goToPage = useCallback((page: number) => {
    // Phantom-tap guard at the goToPage gate — single chokepoint for ALL
    // page-nav callers (button onClick, onTouchEnd tap-zone, onClick tap-
    // zone, keyboard, custom event). On Boox + Capacitor the chapter-
    // boundary tap fires onPrevChapter/onNextChapter, Reader unmounts/
    // remounts at the same DOM coordinates, then the WebView re-dispatches
    // the original touch ~25ms later. That phantom click can land on ANY
    // of the page-nav handlers above. A guard at each handler missed
    // some paths; placing it inside goToPage means any caller within
    // 500ms of mount is rejected. Legitimate clicks come much later — the
    // trace shows >2000ms between the chapter cross and the next real
    // user tap. This is the structural fix for the +1/-1 chapter-cross
    // page skip Anders reported (forward jumps to second page, backward
    // jumps to second-to-last).
    if (Date.now() - mountedAtRef.current < 500) {
      tracePageSet('goToPage-blocked', page, { req: page, sinceMount: Date.now() - mountedAtRef.current })
      return
    }
    const container = readerRef.current
    if (!container) return
    userNavigatedRef.current = true
    initialPageRef.current = undefined
    // Re-measure pages from the live DOM at click time. Trusting the
    // totalPages state alone is fragile: scrollWidth / colWidth rounding
    // can leave the state one short of reality, and goToPage's clamp then
    // refuses to advance past that wrong value (the "stuck between page
    // 15 and 16" bug Anders saw on desktop). The live measurement is
    // authoritative; it also seeds the state in case it was stale.
    const content = contentRef.current
    let pages = totalPages
    if (content) {
      const cw = getColWidth()
      const gp = getGap()
      if (cw > 0) {
        pages = Math.max(1, Math.round((content.scrollWidth + gp) / (cw + gp)))
        if (pages !== totalPages) setTotalPages(pages)
      }
    }
    const clamped = Math.max(0, Math.min(page, pages - 1))
    tracePageSet('goToPage', clamped, { req: page, measuredPages: pages })
    // CRITICAL: update the ref immediately, before the React state flushes.
    // The keyboard / page-nav handler computes the next target page via
    // `currentPageRef.current + 1`. Without immediate ref update, multiple
    // rapid presses within the same render tick all read the same stale
    // currentPageRef value and dispatch identical setCurrentPage(N+1) calls
    // — React bails on equal values, the user perceives "stuck after rapid
    // forward/back" (Anders's report). With the ref updated here, each
    // press in a rapid burst sees the just-incremented value and advances
    // by one. The render-time `currentPageRef.current = currentPage`
    // assignment is harmless (overwrites with the same value).
    currentPageRef.current = clamped
    setCurrentPage(clamped)
  }, [totalPages, readerRef, getColWidth, getGap, tracePageSet])

  // Keyboard navigation — use refs to avoid re-attaching on every page change
  const goToPageRef = useRef(goToPage)
  goToPageRef.current = goToPage
  const onNextChapterRef = useRef(onNextChapter)
  onNextChapterRef.current = onNextChapter
  const onPrevChapterRef = useRef(onPrevChapter)
  onPrevChapterRef.current = onPrevChapter
  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      // Guard: `totalPagesRef.current > 1` prevents the transient post-remount
      // state (currentPage=0, totalPages=1 before recalcPages runs) from
      // satisfying the "at last page" condition and firing a spurious
      // onNextChapter. That transient-state misfire, combined with an e-ink
      // ghost tap, was causing reliable x → x+2 chapter skipping on Boox.
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        if (totalPagesRef.current > 1 && currentPageRef.current >= totalPagesRef.current - 1 && onNextChapterRef.current) {
          onNextChapterRef.current()
        } else {
          goToPageRef.current(currentPageRef.current + 1)
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        if (totalPagesRef.current > 1 && currentPageRef.current <= 0 && onPrevChapterRef.current) {
          onPrevChapterRef.current()
        } else {
          goToPageRef.current(currentPageRef.current - 1)
        }
      }
    }
    // Custom page-nav event: used by on-screen nav buttons (BottomBar,
    // ReadingProgressBar) and the Boox hardware page-turn buttons (via
    // MainActivity.dispatchKeyEvent). Synthetic KeyboardEvents don't fire
    // reliably in Capacitor Android WebView, so we use a CustomEvent instead.
    const handlePageNav = (e: Event) => {
      const direction = (e as CustomEvent<{ direction: 'next' | 'prev' }>).detail?.direction
      const w = typeof window !== 'undefined' ? (window as Window & { __tinctNavDebug?: unknown[] }) : null
      const log = (action: string, extra?: Record<string, unknown>) => {
        if (!w) return
        w.__tinctNavDebug = w.__tinctNavDebug || []
        w.__tinctNavDebug.push({ at: Date.now(), kind: 'reader.pageNav', dir: direction, action, curPage: currentPageRef.current, totPages: totalPagesRef.current, ...extra })
        if (w.__tinctNavDebug.length > 60) w.__tinctNavDebug.shift()
      }
      if (direction === 'next') {
        if (totalPagesRef.current > 1 && currentPageRef.current >= totalPagesRef.current - 1 && onNextChapterRef.current) {
          log('chapter-next')
          onNextChapterRef.current()
        } else {
          log('goToPage-next', { req: currentPageRef.current + 1 })
          goToPageRef.current(currentPageRef.current + 1)
        }
      } else if (direction === 'prev') {
        if (totalPagesRef.current > 1 && currentPageRef.current <= 0 && onPrevChapterRef.current) {
          log('chapter-prev')
          onPrevChapterRef.current()
        } else {
          log('goToPage-prev', { req: currentPageRef.current - 1 })
          goToPageRef.current(currentPageRef.current - 1)
        }
      }
    }
    // Skip listener registration when this Reader isn't the active one.
    // On mobile two Readers are mounted at once; without this guard both
    // fire for every tinct:page-nav event, causing handleNextChapter to
    // be called twice (and chapter-skip on some races).
    if (!isActiveRef.current) {
      return () => { /* noop */ }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('tinct:page-nav', handlePageNav)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('tinct:page-nav', handlePageNav)
    }
  }, [isActive])

  // Track whether onTouchEnd already handled a tap (avoid double page turn on mobile)
  const touchHandledRef = useRef(false)
  // Tracks the start point of the current pointer interaction so a drag
  // (selection, swipe) is never treated as a page-turn tap on release.
  // Was causing right-to-left selection drags to end in the left zone and
  // fire onPrevChapter, even though no selection ultimately registered.
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const DRAG_THRESHOLD_PX = 10
  const effectiveTotalPages = chapterEndPage !== null ? Math.min(totalPages, chapterEndPage + 1) : totalPages
  const effectiveCurrentPage = Math.min(currentPage, Math.max(0, effectiveTotalPages - 1))
  const atEffectiveFirstPage = effectiveCurrentPage <= 0
  const atEffectiveLastPage = effectiveCurrentPage >= effectiveTotalPages - 1

  // Click on left/right edge to turn pages, or click paragraph for audio
  const handleReaderClick = useCallback((e: React.MouseEvent) => {
    // Skip if touch already handled this interaction (mobile fires both touchend + click)
    if (touchHandledRef.current) {
      touchHandledRef.current = false
      return
    }
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return

    // Drag guard: if the cursor moved more than DRAG_THRESHOLD_PX between
    // mousedown and mouseup, treat as a drag-selection (even if the final
    // selection collapsed) and skip page-turn logic. Prevents right-to-left
    // drag-highlights from firing the left-zone "previous page" tap.
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (start) {
      const dx = Math.abs(e.clientX - start.x)
      const dy = Math.abs(e.clientY - start.y)
      if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) return
    }

    // Click on existing highlight mark — show highlight popup
    const markEl = (e.target as HTMLElement).closest?.('mark[data-highlight-id]') as HTMLElement | null
    if (markEl && !disableHighlight) {
      const highlightId = markEl.getAttribute('data-highlight-id')!
      const markRect = markEl.getBoundingClientRect()
      if (markRect) {
        const paragraphEl = markEl.closest?.('[data-paragraph-index]')
        const paragraphIndex = paragraphEl ? parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10) : 0
        const existingNote = highlights.find(h => h.id === highlightId)?.note || ''
        const showBelow = markRect.top < 120
        setNoteInput(existingNote)
        setPopupMode('main')
        setIssueTag('')
        setIssueComment('')
        setSelectionPopup({
          x: Math.max(150, Math.min(window.innerWidth - 150, markRect.left + markRect.width / 2)),
          y: showBelow ? markRect.bottom + 10 : markRect.top - 10,
          text: markEl.textContent || '',
          paragraphIndex,
          startOffset: 0,
          endOffset: 0,
          showBelow,
          existingHighlightId: highlightId,
          existingNote,
        })
      }
      return
    }

    if ((e.target as HTMLElement).closest('button, .selection-popup')) return

    // Audio is playing: a click on the reader should play the clicked
    // paragraph, never turn the page. Page navigation in this state has to
    // go through the explicit arrows (or keyboard ← / →). Matches the
    // mobile touchend behavior so the two platforms feel the same.
    if (isAudioPlaying && playingParagraphIndex !== undefined && onParagraphClick) {
      const target = e.target as HTMLElement
      const paraEl = target.closest?.('[data-paragraph-index]')
      if (paraEl) {
        const idx = parseInt(paraEl.getAttribute('data-paragraph-index') || '0', 10)
        onParagraphClick(idx)
      }
      return
    }

    const container = readerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const zone = rect.width * 0.25

    // Phantom-click guard for chapter-advance branches. goToPage has its
    // own gate, but onPrevChapter/onNextChapter bypass it.
    const sinceMount = Date.now() - mountedAtRef.current
    if (clickX < zone) {
      if (sinceMount < 500) return
      if (effectiveTotalPages > 1 && atEffectiveFirstPage && onPrevChapter) {
        onPrevChapter()
      } else {
        goToPage(currentPage - 1)
      }
    } else if (clickX > rect.width - zone) {
      if (sinceMount < 500) return
      if (effectiveTotalPages > 1 && atEffectiveLastPage && onNextChapter) {
        onNextChapter()
      } else {
        goToPage(currentPage + 1)
      }
    } else if (isAudioPlaying && onParagraphClick) {
      // Middle zone, audio mode active (strip open OR actively playing):
      // clicking a paragraph seeks/starts playback from there.
      //
      // Previously gated on `hasAudio` (= "this book has audio") which
      // was too broad — middle-zone clicks on any audio-enabled book
      // would START playback unprompted. Anders saw this after a burst
      // of arrow-key navigation: a stray click on the text triggered
      // audio. Now requires audio mode to be explicitly active first
      // (audioStripOpen via the headphones toggle, OR already playing).
      const target = e.target as HTMLElement
      const paraEl = target.closest?.('[data-paragraph-index]')
      if (paraEl) {
        const idx = parseInt(paraEl.getAttribute('data-paragraph-index') || '0', 10)
        onParagraphClick(idx)
      }
    }
  }, [currentPage, goToPage, readerRef, hasAudio, onParagraphClick, isAudioPlaying, playingParagraphIndex, onNextChapter, onPrevChapter, effectiveTotalPages, atEffectiveFirstPage, atEffectiveLastPage])

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setTimeout(() => dismissPopup(), 200)
      return
    }

    if (disableHighlight) return

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) return

    let range: Range
    try {
      range = selection.getRangeAt(0)
    } catch {
      return
    }

    const rangeNode = range.commonAncestorContainer
    const rangeEl = rangeNode.nodeType === Node.TEXT_NODE
      ? rangeNode.parentElement
      : rangeNode as HTMLElement
    let paragraphEl = rangeEl?.closest?.('[data-paragraph-index]')
      ?? rangeEl?.querySelector?.('[data-paragraph-index]')
      ?? null
    if (!paragraphEl || !readerRef.current?.contains(paragraphEl)) return

    const paragraphIndex = parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10)
    let resolvedParagraphIndex = paragraphIndex

    let paragraphText = paragraphs[resolvedParagraphIndex] || ''
    if (paragraphText && !paragraphText.includes(selectedText)) {
      const exactMatch = paragraphs
        .map((text, index) => ({ text, index }))
        .filter(({ text }) => text.includes(selectedText))
      if (exactMatch.length === 1) {
        resolvedParagraphIndex = exactMatch[0].index
        paragraphText = exactMatch[0].text
        const candidate = readerRef.current.querySelector(`[data-paragraph-index="${resolvedParagraphIndex}"]`)
        if (candidate) paragraphEl = candidate
      }
    }
    // Normalize newlines → spaces for matching (prose text has embedded \n)
    const normalizedPara = paragraphText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
    const normalizedSelection = selectedText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')

    // Primary: use DOM-based offset calculation (works regardless of text normalization)
    let startOffset = -1
    let endOffset = 0
    try {
      // Walk text nodes inside the paragraph element to compute character offsets
      const walker = document.createTreeWalker(paragraphEl, NodeFilter.SHOW_TEXT)
      let charCount = 0
      let foundStart = false
      let node: Node | null
      while ((node = walker.nextNode())) {
        const nodeLen = (node.textContent || '').length
        if (!foundStart && node === range.startContainer) {
          startOffset = charCount + range.startOffset
          foundStart = true
        }
        if (node === range.endContainer) {
          endOffset = charCount + range.endOffset
          break
        }
        charCount += nodeLen
      }
    } catch {
      // Fallback: indexOf on normalized text
    }

    // Fallback: indexOf if DOM walk failed
    if (startOffset < 0 || endOffset <= startOffset) {
      startOffset = normalizedPara.indexOf(normalizedSelection)
      if (startOffset >= 0) {
        endOffset = startOffset + normalizedSelection.length
      } else {
        startOffset = paragraphText.indexOf(selectedText)
        endOffset = startOffset >= 0 ? startOffset + selectedText.length : 0
      }
    }
    console.log('[Highlight] selection:', { paragraphIndex: resolvedParagraphIndex, startOffset, endOffset, selectedText: selectedText.slice(0, 40), found: startOffset >= 0 })

    const rect = range.getBoundingClientRect()

    // Pick the side with more room. The issue-form state can be ~220px tall,
    // so we need to be deliberate — a naive "show below if near the top"
    // rule left the submit button off-screen on mobile.
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    const showBelow = spaceBelow >= spaceAbove
    setPopupMode('main')
    setIssueTag('')
    setIssueComment('')
    setSelectionPopup({
      x: Math.max(150, Math.min(window.innerWidth - 150, rect.left + rect.width / 2)),
      y: showBelow ? rect.bottom + 10 : rect.top - 10,
      text: selectedText,
      paragraphIndex: resolvedParagraphIndex,
      startOffset: Math.max(0, startOffset),
      endOffset: Math.max(0, endOffset),
      showBelow,
    })

    // Wrap the selected range in a temp <mark> so the user still sees what
    // the popup is about after the native selection is cleared (see below).
    // surroundContents throws when the range spans multiple elements — in
    // that case we just skip the preview, popup still works.
    clearSelectionPreview()
    try {
      const previewRange = selection.getRangeAt(0).cloneRange()
      const mark = document.createElement('mark')
      mark.className = 'tinct-selection-preview'
      previewRange.surroundContents(mark)
      selectionPreviewMarkRef.current = mark
    } catch { /* range crosses element boundaries — skip visual preview */ }

    // Mobile: clear the native selection so Safari's edit menu doesn't
    // compete with ours. Text is captured in popup state + visible via the
    // preview mark above; user acts through our UI (Copy, Highlight, etc.).
    if (window.matchMedia('(max-width: 768px)').matches) {
      setTimeout(() => window.getSelection()?.removeAllRanges(), 50)
    }
  }, [paragraphs, readerRef, disableHighlight, clearSelectionPreview])

  // Android WebView (Capacitor / Boox) consumes the touch in its native
  // selection mode, so onTouchEnd on our React div never fires when the
  // user finalises a selection by lifting their finger. The
  // `selectionchange` event on document DOES fire reliably on all
  // platforms when the selection changes — we debounce it (selection
  // events fire continuously during drag) and run the same logic as
  // mouseup/touchend once it stabilises. Without this listener, long-
  // press text selection on Boox showed neither our popup nor (after
  // setCustomSelectionActionModeCallback) the system bar.
  useEffect(() => {
    if (disableHighlight) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const onSelectionChange = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed) return
        const text = selection.toString().trim()
        if (text.length < 3) return
        // Only act on selections inside our reader. The selectionchange
        // event is document-wide; we don't want to fire for selections in
        // the chat panel, settings sheet, etc.
        const anchor = selection.anchorNode
        const node = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as HTMLElement | null)
        if (!node || !readerRef.current?.contains(node)) return
        handleMouseUp()
      }, 350)
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange)
      if (timer) clearTimeout(timer)
    }
  }, [disableHighlight, handleMouseUp, readerRef])

  const handleDefine = useCallback(() => {
    if (!selectionPopup) return
    const raw = selectionPopup.text.trim()
    // Single word → look up directly. Multi-word → open the panel with the
    // full selected phrase as a starting query the user can edit.
    const isSingleWord = !/\s/.test(raw)
    setDefineQuery(isSingleWord ? raw : '')
    setDefineResult(null)
    setDefineNotFound(false)
    setPopupMode('define')
    if (isSingleWord) {
      setDefineLoading(true)
      dictLookup(raw).then(res => {
        setDefineLoading(false)
        setDefineResult(res)
        setDefineNotFound(!res)
      })
    }
  }, [selectionPopup])

  const runDefine = useCallback((q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setDefineResult(null)
      setDefineNotFound(false)
      return
    }
    setDefineLoading(true)
    setDefineNotFound(false)
    dictLookup(trimmed).then(res => {
      setDefineLoading(false)
      setDefineResult(res)
      setDefineNotFound(!res)
    })
  }, [])

  const handleCopy = useCallback(() => {
    if (!selectionPopup) return
    const text = selectionPopup.text
    const done = () => {
      dismissPopup()
      window.getSelection()?.removeAllRanges()
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).finally(done)
    } else {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      } catch { /* noop */ }
      done()
    }
  }, [selectionPopup])

  const handleColorClick = (color: HighlightColor) => {
    if (!selectionPopup) return
    if (selectionPopup.existingHighlightId) {
      onUpdateHighlightColor?.(selectionPopup.existingHighlightId, color)
      dismissPopup()
      return
    }
    // Guard: don't create zero-length highlights (indexOf failed)
    if (selectionPopup.startOffset >= selectionPopup.endOffset) {
      console.warn('[Highlight] Blocked zero-length highlight', selectionPopup)
      return
    }
    console.log('[Highlight] Creating:', { color, paragraphIndex: selectionPopup.paragraphIndex, start: selectionPopup.startOffset, end: selectionPopup.endOffset })
    onHighlight(
      selectionPopup.paragraphIndex,
      selectionPopup.startOffset,
      selectionPopup.endOffset,
      selectionPopup.text,
      color,
    )
    dismissPopup()
    window.getSelection()?.removeAllRanges()
  }

  const handleExplain = () => {
    if (selectionPopup) {
      onTextSelect(selectionPopup.text)
      dismissPopup()
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleIssueSubmit = async () => {
    if (!selectionPopup || !issueTag) return
    setIssueSubmitting(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`
      const res = await fetch(apiUrl('/api/report-issue'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bookId: bookId || '',
          editionKey: editionKey || '',
          chapterNumber: currentChapter ?? 0,
          paragraphIndex: selectionPopup.paragraphIndex,
          selectedText: selectionPopup.text,
          tag: issueTag,
          comment: issueComment.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json() as { reportId?: string }
      window.dispatchEvent(new CustomEvent('tinct:toast', { detail: { message: 'Thank you. We\'re reviewing your report now. For every 5 approved fixes, you get a free month.' } }))
      // Poll for evaluation result
      if (data.reportId) {
        let attempts = 0
        const poll = setInterval(async () => {
          attempts++
          if (attempts > 20) { clearInterval(poll); return } // stop after ~60s
          try {
            const statusRes = await fetch(apiUrl(`/api/report-status?id=${data.reportId}`))
            const statusData = await statusRes.json() as { status: string }
            if (statusData.status === 'confirmed') {
              clearInterval(poll)
              window.dispatchEvent(new CustomEvent('tinct:issue-fixed'))
            } else if (statusData.status === 'rejected' || statusData.status === 'needs_review') {
              clearInterval(poll)
            }
          } catch { /* keep polling */ }
        }, 3000)
      }
    } catch {
      window.dispatchEvent(new CustomEvent('tinct:toast', { detail: { message: 'Something went wrong submitting the report. Please try again.' } }))
    }
    setIssueSubmitting(false)
    dismissPopup()
    window.getSelection()?.removeAllRanges()
  }

  // Compute translateX for current page.
  //
  // Reads from React state (colWidthState, gapState) rather than the DOM.
  // That's deliberate: this transform is rendered into JSX, so it only
  // updates when React re-renders. By driving from state, every observed
  // container resize triggers a fresh transform. The fallback to direct
  // DOM read is for the very first render before the observer has fired.
  const getTranslateX = () => {
    const colWidth = colWidthState > 0 ? colWidthState : getColWidth()
    if (colWidth <= 0) return 0
    const gap = gapState > 0 ? gapState : getGap()
    return -(currentPage * (colWidth + gap))
  }

  return (
    <div
      className="reader reader-paginated"
      ref={readerRef}
      onMouseDown={(e) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY }
      }}
      onMouseUp={handleMouseUp}
      onClick={handleReaderClick}
      onTouchStart={(e) => {
        const t = e.touches[0]
        if (t) pointerStartRef.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchEnd={(e) => {
        // Mobile text selection: iOS fires touchend, not mouseup, when the
        // user releases a selection drag. If we return early here we lose
        // the chance to show our own popup and Safari's native menu wins.
        // Tiny delay so iOS has finalized the selection + its handles.
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed && (selection.toString().trim().length >= 3)) {
          setTimeout(handleMouseUp, 50)
          pointerStartRef.current = null
          return
        }
        if ((e.target as HTMLElement).closest('button, select, .selection-popup, mark')) {
          pointerStartRef.current = null
          return
        }

        const touch = e.changedTouches[0]
        const start = pointerStartRef.current
        pointerStartRef.current = null
        if (!touch) return

        // Drag guard: if the finger traveled more than DRAG_THRESHOLD_PX
        // between touchstart and touchend, this was a selection or swipe
        // attempt — never a page-turn tap. Was causing right-to-left drag
        // selections to turn the page backward when the selection didn't
        // fully register.
        if (start) {
          const dx = Math.abs(touch.clientX - start.x)
          const dy = Math.abs(touch.clientY - start.y)
          if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) return
        }

        // Audio mode: tap on a paragraph to play from there (no page turning)
        // Only intercept taps when audio is actively playing — not just when a paragraph was previously played
        if (isAudioPlaying && playingParagraphIndex !== undefined && onParagraphClick) {
          const target = e.target as HTMLElement
          const paraEl = target.closest?.('[data-paragraph-index]')
          if (paraEl) {
            const idx = parseInt(paraEl.getAttribute('data-paragraph-index') || '0', 10)
            onParagraphClick(idx)
          }
          return
        }

        // Reading mode: left/right edge tap for page/chapter navigation.
        // Phantom-tap guard for chapter-cross paths lives inside goToPage
        // (covers all callers). Here we ALSO need to suppress the
        // chapter-advance fire path on the new Reader, otherwise a phantom
        // tap on the left edge of a fresh Reader would call onPrevChapter
        // and skip yet another chapter. Same 500ms window.
        const container = readerRef.current
        if (!container) return
        if (Date.now() - mountedAtRef.current < 500) return
        const rect = container.getBoundingClientRect()
        const touchX = touch.clientX - rect.left
        const zone = rect.width * 0.3
        if (touchX < zone) {
          touchHandledRef.current = true
          if (totalPages > 1 && currentPage <= 0 && onPrevChapter) {
            onPrevChapter()
          } else {
            goToPage(currentPage - 1)
          }
        } else if (touchX > rect.width - zone) {
          touchHandledRef.current = true
          if (totalPages > 1 && currentPage >= totalPages - 1 && onNextChapter) {
            onNextChapter()
          } else {
            goToPage(currentPage + 1)
          }
        }
      }}
    >
      <div
        className={`reader-columns ${colWidthState > 0 ? '' : 'reader-columns--measuring'}`}
        ref={contentRef}
        style={{ transform: `translateX(${getTranslateX()}px)` }}
      >
        <div className="chapter-header">
          {currentChapter != null && (
            <span className="chapter-stamp">&sect; Chapter {currentChapter}</span>
          )}
          <h2 className="chapter-title">{chapterTitle}</h2>
          <div className="chapter-rule" aria-hidden="true">
            <div className="chapter-rule-line" />
            <div className="chapter-rule-diamond" />
            <div className="chapter-rule-line" />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner" />
            <p>Loading text...</p>
          </div>
        ) : (
          <div className="text-body">
            {paragraphs.map((para, i) => {
              const classes: string[] = []
              if (i === 0 && !isVerse) classes.push('drop-cap')
              if (isAudioPlaying && playingParagraphIndex === i) classes.push('paragraph-playing')
              return (
                <ParagraphRenderer
                  key={i}
                  text={para}
                  paragraphIndex={i}
                  highlights={highlights}
                  isVerse={isVerse}
                  className={classes.length > 0 ? classes.join(' ') : undefined}
                />
              )
            })}

            {paragraphs.length > 0 && onReflect && (
              <div className="chapter-end">
                <div className="chapter-end-ornament">&middot; &middot; &middot;</div>
                <button className="chapter-reflect-button" onClick={onReflect}>
                  Reflect on this chapter
                </button>
                {isFinalChapter && onGenerateSummary && (
                  <button
                    className="chapter-summary-button"
                    onClick={onGenerateSummary}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? 'Generating summary...' : 'Generate reading journal'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Single-line running footer — replaces the old BottomBar chrome.
          Format: "← Book I — 4 / 15 →" (chapter italic, page mono,
          minimal arrows on either side). Arrows step a page and fall
          through to chapter advance at chapter boundaries. */}
      <div className="page-nav">
        <button
          className="page-nav-tick"
          onClick={(e) => {
            e.stopPropagation()
            if (effectiveTotalPages > 1 && atEffectiveFirstPage && onPrevChapter) onPrevChapter()
            else goToPage(currentPage - 1)
          }}
          disabled={effectiveTotalPages > 1 && atEffectiveFirstPage && !onPrevChapter}
          aria-label="Previous page"
        >
          &larr;
        </button>
        <span className="page-nav-label">
          {/* Short label only — long descriptive titles (Odyssey Butler summaries,
              Hamlet act+scene+location) overflow the running footer. The full
              title appears in the chapter h2 at the top of the chapter content. */}
          {currentChapter != null && currentChapter > 0 && (
            <em className="page-nav-chapter">
              {chapterTitle && /^book\s/i.test(chapterTitle) ? `Book ${currentChapter}` : `Chapter ${currentChapter}`}
            </em>
          )}
          {currentChapter != null && currentChapter > 0 && <span className="page-nav-sep"> — </span>}
          {progressLabel || `${effectiveCurrentPage + 1} / ${effectiveTotalPages}`}
        </span>
        <button
          className="page-nav-tick"
          onClick={(e) => {
            e.stopPropagation()
            if (effectiveTotalPages > 1 && atEffectiveLastPage && onNextChapter) onNextChapter()
            else goToPage(currentPage + 1)
          }}
          disabled={effectiveTotalPages > 1 && atEffectiveLastPage && !onNextChapter}
          aria-label="Next page"
        >
          &rarr;
        </button>
      </div>

      {selectionPopup && (
        <div
          ref={popupRef}
          className={`selection-popup ${selectionPopup.showBelow ? 'selection-popup-below' : ''}`}
          style={{ left: selectionPopup.x, top: selectionPopup.y, position: 'fixed' }}
          onClick={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
        >
          {/* Color submenu */}
          {popupMode === 'colors' && (
            <>
              <button className="popup-back-btn" onClick={() => setPopupMode('main')} title="Back">‹</button>
              <div className="popup-colors">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.key}
                    className={`popup-color-dot highlight-${c.key}`}
                    title={`Highlight ${c.label}`}
                    onClick={() => { handleColorClick(c.key); setPopupMode('main') }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Dictionary panel */}
          {popupMode === 'define' && (
            <div className="popup-define">
              <div className="popup-define-head">
                <button className="popup-back-btn" onClick={() => setPopupMode('main')} title="Back">‹</button>
                <input
                  className="popup-define-input"
                  type="text"
                  value={defineQuery}
                  onChange={e => setDefineQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runDefine(defineQuery) }}
                  onBlur={() => runDefine(defineQuery)}
                  placeholder="Look up a word…"
                  autoFocus
                />
              </div>
              {defineLoading && <div className="popup-define-status">Looking up…</div>}
              {!defineLoading && defineResult && (
                <div className="popup-define-result">
                  <div className="popup-define-word">{defineResult.word}</div>
                  {defineResult.resolvedFrom && defineResult.resolvedFrom !== defineResult.word && (
                    <div className="popup-define-note">from &ldquo;{defineResult.resolvedFrom}&rdquo;</div>
                  )}
                  <ol className="popup-define-list">
                    {defineResult.definitions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ol>
                </div>
              )}
              {!defineLoading && defineNotFound && (
                <div className="popup-define-status popup-define-empty">
                  No definition found for &ldquo;{defineQuery}&rdquo;.
                </div>
              )}
              {!defineLoading && !defineResult && !defineNotFound && !defineQuery && (
                <div className="popup-define-status">
                  Type a word and press Enter to look it up.
                </div>
              )}
            </div>
          )}

          {/* Issue form */}
          {popupMode === 'issue' && (
            <div className="popup-issue-form">
              <div className="popup-tag-chips">
                {['Translation', 'Wrong text', 'Formatting', 'Other'].map(tag => (
                  <button
                    key={tag}
                    className={`popup-tag-chip ${issueTag === tag ? 'selected' : ''}`}
                    onClick={() => setIssueTag(tag)}
                  >{tag}</button>
                ))}
              </div>
              <textarea
                className="popup-note-input"
                value={issueComment}
                onChange={e => setIssueComment(e.target.value)}
                placeholder="Optional comment..."
                rows={2}
                onClick={e => e.stopPropagation()}
              />
              <div className="popup-note-actions">
                <button className="popup-button" onClick={() => { setPopupMode('main'); setIssueTag(''); setIssueComment('') }}>Cancel</button>
                <button
                  className="popup-button popup-button-primary"
                  onClick={handleIssueSubmit}
                  disabled={!issueTag || issueSubmitting}
                >{issueSubmitting ? '…' : 'Report'}</button>
              </div>
            </div>
          )}

          {/* Note editor */}
          {popupMode === 'note' && selectionPopup.existingHighlightId && (
            <div className="popup-issue-form">
              <textarea
                className="popup-textarea"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add a note to this highlight..."
                rows={3}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
              <div className="popup-note-actions">
                <button className="popup-button" onClick={() => setPopupMode('main')}>Cancel</button>
                <button
                  className="popup-button popup-button-primary"
                  onClick={() => {
                    onUpdateHighlightNote?.(selectionPopup.existingHighlightId!, noteInput.trim())
                    dismissPopup()
                  }}
                >Save</button>
              </div>
            </div>
          )}

          {/* Main icon toolbar */}
          {popupMode === 'main' && (
            <>
              <button className="popup-icon-btn" onClick={() => setPopupMode('colors')} title="Highlight">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.5 2.5 L13.5 5.5 L6 13 L2 14 L3 10 Z" />
                  <line x1="8.5" y1="4.5" x2="11.5" y2="7.5" />
                </svg>
                <span className="popup-icon-label">Highlight</span>
              </button>

              <div className="popup-divider" />

              <button className="popup-icon-btn" onClick={handleDefine} title="Define">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2 H12 A1 1 0 0 1 13 3 V13 A1 1 0 0 1 12 14 H4 A1 1 0 0 1 3 13 Z" />
                  <line x1="5.5" y1="5" x2="10.5" y2="5" />
                  <line x1="5.5" y1="8" x2="10.5" y2="8" />
                  <line x1="5.5" y1="11" x2="8.5" y2="11" />
                </svg>
                <span className="popup-icon-label">Define</span>
              </button>

              <div className="popup-divider" />

              <button className="popup-icon-btn" onClick={handleExplain} title="Chat about this">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" />
                </svg>
                <span className="popup-icon-label">Chat</span>
              </button>

              <div className="popup-divider" />

              <button className="popup-icon-btn" onClick={() => setPopupMode('issue')} title="Report an issue">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2 L13 2 L10 9 L6 9 Z" />
                  <circle cx="8" cy="13" r="1" fill="currentColor" stroke="none" />
                </svg>
                <span className="popup-icon-label">Issue</span>
              </button>

              <div className="popup-divider" />

              <button className="popup-icon-btn" onClick={handleCopy} title="Copy text">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="5" width="9" height="9" rx="1" />
                  <path d="M11 5 V3 a1 1 0 0 0 -1 -1 H3 a1 1 0 0 0 -1 1 v7 a1 1 0 0 0 1 1 h2" />
                </svg>
                <span className="popup-icon-label">Copy</span>
              </button>

              <div className="popup-divider" />

              <button className="popup-icon-btn" onClick={() => { onShare?.(selectionPopup.text); dismissPopup(); window.getSelection()?.removeAllRanges() }} title="Share this quote">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2 L8 11" />
                  <path d="M5 5 L8 2 L11 5" />
                  <path d="M3 9 L3 13 L13 13 L13 9" />
                </svg>
                <span className="popup-icon-label">Share</span>
              </button>

              {selectionPopup.existingHighlightId && (
                <>
                  <div className="popup-divider" />
                  <button className="popup-icon-btn" onClick={() => setPopupMode('note')} title="Add/edit note">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 2h12v12H2z" />
                      <line x1="5" y1="5" x2="11" y2="5" />
                      <line x1="5" y1="8" x2="11" y2="8" />
                      <line x1="5" y1="11" x2="8" y2="11" />
                    </svg>
                    <span className="popup-icon-label">Note</span>
                  </button>
                </>
              )}

              {selectionPopup.existingHighlightId && (
                <>
                  <div className="popup-divider" />
                  <button
                    className="popup-icon-btn popup-icon-btn-delete"
                    onClick={() => { onDeleteHighlight?.(selectionPopup.existingHighlightId!); dismissPopup() }}
                    title="Delete highlight"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,4 13,4" />
                      <path d="M6 4 V2 h4 V4" />
                      <path d="M4 4 L5 14 h6 L12 4" />
                    </svg>
                    <span className="popup-icon-label">Delete</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
