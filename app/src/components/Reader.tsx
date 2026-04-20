import { useCallback, useRef, useState, useEffect } from 'react'
import { ParagraphRenderer } from './ParagraphRenderer'
import type { Highlight, HighlightColor } from '../types'
import { HIGHLIGHT_COLORS } from '../types'

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
  onDeleteHighlight?: (id: string) => void
  onUpdateHighlightNote?: (id: string, note: string) => void
  onUpdateHighlightColor?: (id: string, color: HighlightColor) => void
  onShare?: (text: string) => void
  /** Context for issue reporting */
  bookId?: string
  editionKey?: string
  currentChapter?: number
  authToken?: string
}

export function Reader({
  paragraphs,
  chapterTitle,
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
}: ReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [popupMode, setPopupMode] = useState<'main' | 'colors' | 'issue' | 'note'>('main')
  const [issueTag, setIssueTag] = useState('')
  const [issueComment, setIssueComment] = useState('')
  const [issueSubmitting, setIssueSubmitting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage
  const totalPagesRef = useRef(totalPages)
  totalPagesRef.current = totalPages
  const initialPageRef = useRef(initialPage)
  const userNavigatedRef = useRef(false)

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

  // CSS multi-column pagination: count columns from scrollWidth
  const recalcPages = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    updateColumnWidth()
    const colWidth = getColWidth()
    if (colWidth <= 0) return
    const gap = getGap()
    // Total scrollWidth includes all columns and gaps between them
    const pages = Math.max(1, Math.round((content.scrollWidth + gap) / (colWidth + gap)))
    setTotalPages(pages)
  }, [updateColumnWidth, getColWidth, getGap])

  useEffect(() => {
    recalcPages()
    // Recalc after fonts load and layout settles — multiple attempts for mobile
    const timer1 = setTimeout(recalcPages, 100)
    const timer2 = setTimeout(recalcPages, 500)
    const timer3 = setTimeout(recalcPages, 1500)
    const container = readerRef.current
    // Debounce ResizeObserver to avoid mid-transition recalcs when panel toggles
    let resizeTimer: ReturnType<typeof setTimeout>
    const observer = container ? new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(recalcPages, 300)
    }) : null
    if (container && observer) observer.observe(container)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(resizeTimer); observer?.disconnect() }
  }, [paragraphs, chapterTitle, recalcPages, panelOpen])

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
    setCurrentPage(Math.min(page, Math.max(0, totalPages - 1)))
    targetParagraphRef.current = undefined
    initialPageRef.current = undefined
    return true
  }, [getColWidth, getGap, totalPages])

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
      setCurrentPage(targetPage)
      initialPageRef.current = undefined // only restore once
    }
  }, [totalPages, tryScrollToParagraph])

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
        setCurrentPage(Math.min(page, totalPages - 1))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetParagraphNonce])

  // Report page changes to parent
  useEffect(() => {
    onPageChange?.(currentPage, totalPages)
  }, [currentPage, totalPages, onPageChange])

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
  useEffect(() => {
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
      setCurrentPage(clamped)
    }
  }, [playingParagraphIndex, playingParagraphProgress, getColWidth, getGap])

  // Reset userNavigated flag when audio stops
  useEffect(() => {
    if (playingParagraphIndex === undefined) {
      userNavigatedRef.current = false
    }
  }, [playingParagraphIndex])

  const goToPage = useCallback((page: number) => {
    const container = readerRef.current
    if (!container) return
    userNavigatedRef.current = true
    const clamped = Math.max(0, Math.min(page, totalPages - 1))
    setCurrentPage(clamped)
  }, [totalPages, readerRef])

  // Keyboard navigation — use refs to avoid re-attaching on every page change
  const goToPageRef = useRef(goToPage)
  goToPageRef.current = goToPage
  const onNextChapterRef = useRef(onNextChapter)
  onNextChapterRef.current = onNextChapter
  const onPrevChapterRef = useRef(onPrevChapter)
  onPrevChapterRef.current = onPrevChapter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        if (currentPageRef.current >= totalPagesRef.current - 1 && onNextChapterRef.current) {
          onNextChapterRef.current()
        } else {
          goToPageRef.current(currentPageRef.current + 1)
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        if (currentPageRef.current <= 0 && onPrevChapterRef.current) {
          onPrevChapterRef.current()
        } else {
          goToPageRef.current(currentPageRef.current - 1)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Track whether onTouchEnd already handled a tap (avoid double page turn on mobile)
  const touchHandledRef = useRef(false)

  // Click on left/right edge to turn pages, or click paragraph for audio
  const handleReaderClick = useCallback((e: React.MouseEvent) => {
    // Skip if touch already handled this interaction (mobile fires both touchend + click)
    if (touchHandledRef.current) {
      touchHandledRef.current = false
      return
    }
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return

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

    const container = readerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const zone = rect.width * 0.25

    if (clickX < zone) {
      if (currentPage <= 0 && onPrevChapter) {
        onPrevChapter()
      } else {
        goToPage(currentPage - 1)
      }
    } else if (clickX > rect.width - zone) {
      if (currentPage >= totalPages - 1 && onNextChapter) {
        onNextChapter()
      } else {
        goToPage(currentPage + 1)
      }
    } else if (hasAudio && onParagraphClick) {
      // Middle zone: check if click is on a paragraph for audio playback
      const target = e.target as HTMLElement
      const paraEl = target.closest?.('[data-paragraph-index]')
      if (paraEl) {
        const idx = parseInt(paraEl.getAttribute('data-paragraph-index') || '0', 10)
        onParagraphClick(idx)
      }
    }
  }, [currentPage, goToPage, readerRef, hasAudio, onParagraphClick])

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setTimeout(() => setSelectionPopup(null), 200)
      return
    }

    if (disableHighlight) return

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) return

    const anchorNode = selection.anchorNode
    if (!anchorNode || !readerRef.current) return

    const startEl = anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : anchorNode as HTMLElement
    const paragraphEl = startEl?.closest?.('[data-paragraph-index]')
      ?? startEl?.querySelector?.('[data-paragraph-index]')
    if (!paragraphEl) return

    const paragraphIndex = parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10)

    const paragraphText = paragraphs[paragraphIndex] || ''
    // Normalize newlines → spaces for matching (prose text has embedded \n)
    const normalizedPara = paragraphText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
    const normalizedSelection = selectedText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')

    // Primary: use DOM-based offset calculation (works regardless of text normalization)
    let startOffset = -1
    let endOffset = 0
    try {
      const range = selection.getRangeAt(0)
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
    console.log('[Highlight] selection:', { paragraphIndex, startOffset, endOffset, selectedText: selectedText.slice(0, 40), found: startOffset >= 0 })

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const showBelow = rect.top < 120
    setPopupMode('main')
    setIssueTag('')
    setIssueComment('')
    setSelectionPopup({
      x: Math.max(150, Math.min(window.innerWidth - 150, rect.left + rect.width / 2)),
      y: showBelow ? rect.bottom + 10 : rect.top - 10,
      text: selectedText,
      paragraphIndex,
      startOffset: Math.max(0, startOffset),
      endOffset: Math.max(0, endOffset),
      showBelow,
    })
  }, [paragraphs, readerRef, disableHighlight])

  const handleColorClick = (color: HighlightColor) => {
    if (!selectionPopup) return
    if (selectionPopup.existingHighlightId) {
      onUpdateHighlightColor?.(selectionPopup.existingHighlightId, color)
      setSelectionPopup(null)
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
    setSelectionPopup(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleExplain = () => {
    if (selectionPopup) {
      onTextSelect(selectionPopup.text)
      setSelectionPopup(null)
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleIssueSubmit = async () => {
    if (!selectionPopup || !issueTag) return
    setIssueSubmitting(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`
      const res = await fetch('/api/report-issue', {
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
      window.dispatchEvent(new CustomEvent('tinct:toast', { detail: { message: 'Thank you — we\'re reviewing your report now. For every 5 approved fixes, you get a free month.' } }))
      // Poll for evaluation result
      if (data.reportId) {
        let attempts = 0
        const poll = setInterval(async () => {
          attempts++
          if (attempts > 20) { clearInterval(poll); return } // stop after ~60s
          try {
            const statusRes = await fetch(`/api/report-status?id=${data.reportId}`)
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
    setSelectionPopup(null)
    window.getSelection()?.removeAllRanges()
  }

  // Compute translateX for current page
  const getTranslateX = () => {
    const colWidth = getColWidth()
    if (colWidth <= 0) return 0
    return -(currentPage * (colWidth + getGap()))
  }

  return (
    <div
      className="reader reader-paginated"
      ref={readerRef}
      onMouseUp={handleMouseUp}
      onClick={handleReaderClick}
      onTouchEnd={(e) => {
        // Mobile tap-to-turn: check if it's a simple tap (not a selection)
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) return
        if ((e.target as HTMLElement).closest('button, select, .selection-popup, mark')) return

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

        // Reading mode: left/right edge tap for page/chapter navigation
        const container = readerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const touch = e.changedTouches[0]
        if (!touch) return
        const touchX = touch.clientX - rect.left
        const zone = rect.width * 0.3
        if (touchX < zone) {
          touchHandledRef.current = true
          if (currentPage <= 0 && onPrevChapter) {
            onPrevChapter()
          } else {
            goToPage(currentPage - 1)
          }
        } else if (touchX > rect.width - zone) {
          touchHandledRef.current = true
          if (currentPage >= totalPages - 1 && onNextChapter) {
            onNextChapter()
          } else {
            goToPage(currentPage + 1)
          }
        }
      }}
    >
      <div
        className="reader-columns"
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

      {/* Page indicator & nav — always visible */}
      <div className="page-nav">
        <button
          className="page-nav-arrow"
          onClick={(e) => { e.stopPropagation(); currentPage <= 0 && onPrevChapter ? onPrevChapter() : goToPage(currentPage - 1) }}
          disabled={currentPage <= 0 && !onPrevChapter}
        >
          &larr;
        </button>
        <span className="page-nav-label">{currentPage + 1} / {totalPages}</span>
        <button
          className="page-nav-arrow"
          onClick={(e) => { e.stopPropagation(); currentPage >= totalPages - 1 && onNextChapter ? onNextChapter() : goToPage(currentPage + 1) }}
          disabled={currentPage >= totalPages - 1 && !onNextChapter}
        >
          &rarr;
        </button>
      </div>

      {selectionPopup && (
        <div
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
                    setSelectionPopup(null)
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

              <button className="popup-icon-btn" onClick={() => { onShare?.(selectionPopup.text); setSelectionPopup(null); window.getSelection()?.removeAllRanges() }} title="Share this quote">
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
                    onClick={() => { onDeleteHighlight?.(selectionPopup.existingHighlightId!); setSelectionPopup(null) }}
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
