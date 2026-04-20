import { useCallback, useRef, useState, useEffect } from 'react'
import { ParagraphRenderer } from './ParagraphRenderer'
import type { Highlight, HighlightColor, Edition, EditionKey } from '../types'
import { HIGHLIGHT_COLORS } from '../types'

interface SelectionInfo {
  x: number
  y: number
  text: string
  paragraphIndex: number
  startOffset: number
  endOffset: number
  side: 'left' | 'right'
  showBelow?: boolean
  existingHighlightId?: string
  existingNote?: string
  noteEditMode?: boolean
}

interface SplitReaderProps {
  leftParagraphs: string[]
  rightParagraphs: string[]
  chapterTitle: string
  leftLabel: string
  rightLabel: string
  isLoading: boolean
  leftHighlights: Highlight[]
  rightHighlights: Highlight[]
  /** Aligned editions available for the right column */
  alignedEditions: Edition[]
  currentRightEditionKey: EditionKey
  onRightEditionChange: (key: EditionKey) => void
  onHighlight: (
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
    side: 'left' | 'right',
  ) => void
  onTextSelect: (text: string) => void
  onReflect?: () => void
  onGenerateSummary?: () => void
  isGeneratingSummary?: boolean
  isFinalChapter?: boolean
  readerRef: React.RefObject<HTMLDivElement>
  /** Whether the left (primary) edition is verse */
  isLeftVerse?: boolean
  /** Whether the right (split) edition is verse */
  isRightVerse?: boolean
  /** Called when page changes with (currentPage, totalPages) */
  onPageChange?: (page: number, total: number) => void
  /** Initial scroll fraction (0–1) to restore on mount */
  initialPage?: number
  /** Paragraph index to restore to (takes priority over initialPage) */
  targetParagraphIndex?: number
  /** Called when the first visible paragraph changes */
  onFirstVisibleParagraph?: (index: number) => void
  /** Index of the paragraph currently being played by audio */
  playingParagraphIndex?: number
  /** Called when a paragraph is clicked (tap-to-play) */
  onParagraphClick?: (index: number) => void
  /** Whether audio is available for the current edition */
  hasAudio?: boolean
  /** Whether audio is currently playing (gates tap-to-play-paragraph on mobile) */
  isAudioPlaying?: boolean
  /** Whether side panel is open — triggers column recalc on change */
  panelOpen?: boolean
  /** Navigate to next/previous chapter */
  onNextChapter?: () => void
  onPrevChapter?: () => void
  onDeleteHighlight?: (id: string) => void
  onUpdateHighlightNote?: (id: string, note: string) => void
  onUpdateHighlightColor?: (id: string, color: HighlightColor) => void
  onShare?: (text: string) => void
  bookId?: string
  primaryEditionKey?: string
  currentChapter?: number
  authToken?: string
}

export function SplitReader({
  leftParagraphs,
  rightParagraphs,
  chapterTitle,
  leftLabel,
  rightLabel,
  isLoading,
  leftHighlights,
  rightHighlights,
  alignedEditions,
  currentRightEditionKey,
  onRightEditionChange,
  onHighlight,
  onTextSelect,
  onReflect,
  onGenerateSummary,
  isGeneratingSummary,
  isFinalChapter,
  readerRef,
  isLeftVerse,
  isRightVerse,
  onPageChange,
  initialPage,
  targetParagraphIndex,
  onFirstVisibleParagraph,
  playingParagraphIndex,
  onParagraphClick,
  hasAudio,
  panelOpen,
  onNextChapter,
  onPrevChapter,
  onDeleteHighlight,
  onUpdateHighlightNote,
  onUpdateHighlightColor,
  isAudioPlaying,
  onShare,
  bookId,
  primaryEditionKey,
  currentChapter,
  authToken,
}: SplitReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [popupMode, setPopupMode] = useState<'main' | 'colors' | 'issue' | 'note'>('main')
  const [issueTag, setIssueTag] = useState('')
  const [issueComment, setIssueComment] = useState('')
  const [issueSubmitting, setIssueSubmitting] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // === Pagination (CSS multi-column, same as Reader) ===
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const initialPageRef = useRef(initialPage)
  const userNavigatedRef = useRef(false) // true when user manually changed page

  // Read actual column-gap from CSS (60px desktop, 40px mobile)
  const getGap = useCallback(() => {
    const content = contentRef.current
    if (!content) return 60
    return parseFloat(getComputedStyle(content).columnGap) || 60
  }, [])

  // Get column width from actual padding (matches Reader approach)
  const getColWidth = useCallback(() => {
    const container = readerRef.current
    const content = contentRef.current
    if (!container || !content) return 0
    const style = getComputedStyle(content)
    const padLeft = parseFloat(style.paddingLeft) || 0
    const padRight = parseFloat(style.paddingRight) || 0
    return container.clientWidth - padLeft - padRight
  }, [readerRef])

  const updateColumnWidth = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    const colW = getColWidth()
    if (colW > 0) {
      content.style.columnWidth = `${colW}px`
    }
  }, [getColWidth])

  const recalcPages = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    updateColumnWidth()
    const colWidth = getColWidth()
    if (colWidth <= 0) return
    const gap = getGap()
    const pages = Math.max(1, Math.round((content.scrollWidth + gap) / (colWidth + gap)))
    setTotalPages(pages)
  }, [updateColumnWidth, getColWidth, getGap])

  // Track chapter title to know when chapter actually changes (vs edition swap)
  const prevChapterTitle = useRef(chapterTitle)

  useEffect(() => {
    recalcPages()
    const timer1 = setTimeout(recalcPages, 100)
    const timer2 = setTimeout(recalcPages, 500)
    const container = readerRef.current
    // Debounce ResizeObserver to avoid mid-transition recalcs when panel toggles
    let resizeTimer: ReturnType<typeof setTimeout>
    const observer = container ? new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(recalcPages, 350)
    }) : null
    if (container && observer) observer.observe(container)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(resizeTimer); observer?.disconnect() }
  }, [leftParagraphs, rightParagraphs, chapterTitle, recalcPages, panelOpen])

  // Reset page only on actual chapter change, not on edition swap
  useEffect(() => {
    if (chapterTitle !== prevChapterTitle.current) {
      setCurrentPage(0)
      prevChapterTitle.current = chapterTitle
    }
  }, [chapterTitle])

  // Restore position from targetParagraphIndex (paragraph-anchored) or initialPage fraction
  const targetParagraphRef = useRef(targetParagraphIndex)
  useEffect(() => {
    if (targetParagraphRef.current !== undefined && totalPages > 1) {
      const content = contentRef.current
      if (!content) return
      const el = content.querySelector(`.split-left[data-paragraph-index="${targetParagraphRef.current}"]`) as HTMLElement
      if (el) {
        const colWidth = getColWidth()
        const gap = getGap()
        if (colWidth > 0) {
          const page = Math.floor(el.offsetLeft / (colWidth + gap))
          setCurrentPage(Math.min(page, totalPages - 1))
        }
        targetParagraphRef.current = undefined
        initialPageRef.current = undefined
        return
      }
      // Element not found yet — retry on next totalPages change
      return
    }
    const frac = initialPageRef.current
    if (frac !== undefined && frac >= 0 && frac <= 1 && totalPages > 1) {
      const targetPage = Math.round(frac * (totalPages - 1))
      setCurrentPage(targetPage)
      initialPageRef.current = undefined
    }
  }, [totalPages, getColWidth, getGap])

  // Report page changes to parent
  useEffect(() => {
    onPageChange?.(currentPage, totalPages)
  }, [currentPage, totalPages, onPageChange])

  // Report first visible paragraph (left column) so App.tsx location stays accurate in split mode
  useEffect(() => {
    if (!onFirstVisibleParagraph) return
    const content = contentRef.current
    if (!content) return
    const colWidth = getColWidth()
    const gap = getGap()
    if (colWidth <= 0) return
    const pageLeft = currentPage * (colWidth + gap)
    const pageRight = pageLeft + colWidth
    const paraEls = content.querySelectorAll('.split-left[data-paragraph-index]')
    for (const el of paraEls) {
      const htmlEl = el as HTMLElement
      if (htmlEl.offsetLeft < pageRight && htmlEl.offsetLeft + htmlEl.offsetWidth > pageLeft) {
        const idx = parseInt(htmlEl.getAttribute('data-paragraph-index') || '0', 10)
        onFirstVisibleParagraph(idx)
        return
      }
    }
  }, [currentPage, totalPages, onFirstVisibleParagraph, getColWidth, getGap])

  // Auto-advance page when audio plays a paragraph not visible on current page
  // Only auto-advance if the user hasn't manually navigated away
  useEffect(() => {
    if (playingParagraphIndex === undefined || totalPages <= 1) return
    if (userNavigatedRef.current) return // user browsed away — don't snap back
    const content = contentRef.current
    const container = readerRef.current
    if (!content || !container) return
    const el = content.querySelector(`[data-paragraph-index="${playingParagraphIndex}"]`) as HTMLElement
    if (!el) return
    const colWidth = getColWidth()
    const gap = getGap()
    if (colWidth <= 0) return
    const page = Math.floor(el.offsetLeft / (colWidth + gap))
    const clamped = Math.min(page, totalPages - 1)
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }, [playingParagraphIndex, totalPages, getGap, currentPage, readerRef])

  // Reset userNavigated flag when audio stops or catches up to user's page
  useEffect(() => {
    if (playingParagraphIndex === undefined) {
      userNavigatedRef.current = false
    }
  }, [playingParagraphIndex])

  const goToPage = useCallback((page: number) => {
    userNavigatedRef.current = true
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }, [totalPages])

  // Keyboard navigation — use refs to avoid re-attaching on every page change
  const goToPageRef = useRef(goToPage)
  goToPageRef.current = goToPage
  const onNextChapterRef = useRef(onNextChapter)
  onNextChapterRef.current = onNextChapter
  const onPrevChapterRef = useRef(onPrevChapter)
  onPrevChapterRef.current = onPrevChapter
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage
  const totalPagesRef = useRef(totalPages)
  totalPagesRef.current = totalPages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
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

  // Click on left/right edge to turn pages
  const handleReaderClick = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return

    // Click on existing highlight mark in the left column — show highlight popup
    const markEl = (e.target as HTMLElement).closest?.('mark[data-highlight-id]') as HTMLElement | null
    if (markEl && markEl.closest('.split-left')) {
      const highlightId = markEl.getAttribute('data-highlight-id')!
      const markRect = markEl.getBoundingClientRect()
      if (markRect) {
        const paragraphEl = markEl.closest?.('[data-paragraph-index]')
        const paragraphIndex = paragraphEl ? parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10) : 0
        const existingNote = leftHighlights.find(h => h.id === highlightId)?.note || ''
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
          side: 'left',
          showBelow,
          existingHighlightId: highlightId,
          existingNote,
        })
      }
      return
    }

    if ((e.target as HTMLElement).closest('button, select, .selection-popup')) return
    const container = readerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const zone = rect.width * 0.2
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
    }
  }, [currentPage, totalPages, goToPage, readerRef, leftHighlights, onNextChapter, onPrevChapter])

  const getTranslateX = () => {
    const colWidth = getColWidth()
    if (colWidth <= 0) return 0
    return -(currentPage * (colWidth + getGap()))
  }

  // === Selection / Highlight ===
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setTimeout(() => setSelectionPopup(null), 200)
      return
    }

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

    // Block cross-column selections (bleed from left into right column)
    const focusNode = selection.focusNode
    const focusEl = focusNode?.nodeType === Node.TEXT_NODE ? focusNode.parentElement : focusNode as HTMLElement
    const focusParagraphEl = focusEl?.closest?.('[data-paragraph-index]')
    if (focusParagraphEl) {
      const anchorSide = paragraphEl.closest('.split-left') ? 'left' : 'right'
      const focusSide = focusParagraphEl.closest('.split-left') ? 'left' : 'right'
      if (anchorSide !== focusSide) {
        selection.removeAllRanges()
        setSelectionPopup(null)
        return
      }
    }

    const paragraphIndex = parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10)
    const side = paragraphEl.closest('.split-left') ? 'left' as const : 'right' as const
    const sourceParagraphs = side === 'left' ? leftParagraphs : rightParagraphs
    const paragraphText = sourceParagraphs[paragraphIndex] || ''
    const normalizedPara = paragraphText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
    const normalizedSelection = selectedText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
    let startOffset = normalizedPara.indexOf(normalizedSelection)
    let endOffset: number
    if (startOffset >= 0) {
      endOffset = startOffset + normalizedSelection.length
    } else {
      startOffset = paragraphText.indexOf(selectedText)
      endOffset = startOffset >= 0 ? startOffset + selectedText.length : 0
    }

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
      side,
      showBelow,
    })
  }, [leftParagraphs, rightParagraphs, readerRef])

  const handleColorClick = (color: HighlightColor) => {
    if (!selectionPopup) return
    if (selectionPopup.existingHighlightId) {
      onUpdateHighlightColor?.(selectionPopup.existingHighlightId, color)
      setSelectionPopup(null)
      return
    }
    onHighlight(
      selectionPopup.paragraphIndex,
      selectionPopup.startOffset,
      selectionPopup.endOffset,
      selectionPopup.text,
      color,
      selectionPopup.side,
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
          editionKey: selectionPopup.side === 'left' ? (primaryEditionKey || '') : '',
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
      if (data.reportId) {
        let attempts = 0
        const poll = setInterval(async () => {
          attempts++
          if (attempts > 20) { clearInterval(poll); return }
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

  const maxParagraphs = Math.max(leftParagraphs.length, rightParagraphs.length)

  return (
    <div
      className="reader reader-paginated"
      ref={readerRef}
      onMouseUp={handleMouseUp}
      onClick={handleReaderClick}
      onTouchEnd={(e) => {
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) return
        if ((e.target as HTMLElement).closest('button, select, .selection-popup, mark')) return
        const container = readerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const touch = e.changedTouches[0]
        if (!touch) return
        const touchX = touch.clientX - rect.left
        const zone = rect.width * 0.3
        if (touchX < zone) {
          if (currentPage <= 0 && onPrevChapter) {
            onPrevChapter()
          } else {
            goToPage(currentPage - 1)
          }
        } else if (touchX > rect.width - zone) {
          if (currentPage >= totalPages - 1 && onNextChapter) {
            onNextChapter()
          } else {
            goToPage(currentPage + 1)
          }
        }
      }}
    >
      <div
        className="reader-columns split-reader-columns"
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
            <p>Loading texts...</p>
          </div>
        ) : (
          <div className="split-reader-grid" ref={gridRef}>
            {Array.from({ length: maxParagraphs }, (_, i) => (
              <div className="split-row" key={i}>
                <div
                  className={`split-left${isAudioPlaying && playingParagraphIndex === i ? ' paragraph-playing' : ''}`}
                  data-paragraph-index={i}
                  onClick={isAudioPlaying && onParagraphClick ? () => onParagraphClick(i) : undefined}
                  style={isAudioPlaying && onParagraphClick ? { cursor: 'pointer' } : undefined}
                >
                  {leftParagraphs[i] && (
                    <ParagraphRenderer
                      text={leftParagraphs[i]}
                      paragraphIndex={i}
                      highlights={leftHighlights}
                      isVerse={isLeftVerse}
                    />
                  )}
                </div>
                <div className="split-right" data-paragraph-index={i}>
                  {rightParagraphs[i] && (
                    <ParagraphRenderer
                      text={rightParagraphs[i]}
                      paragraphIndex={i}
                      highlights={rightHighlights}
                      isVerse={isRightVerse}
                    />
                  )}
                </div>
              </div>
            ))}

            {maxParagraphs > 0 && onReflect && (
              <div className="split-row">
                <div className="split-left">
                  <div className="chapter-end">
                    <div className="chapter-end-ornament">* * *</div>
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
                </div>
                <div className="split-right" />
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
                    if (selectionPopup.side === 'left') {
                      onUpdateHighlightNote?.(selectionPopup.existingHighlightId!, noteInput.trim())
                    }
                    setSelectionPopup(null)
                  }}
                >Save</button>
              </div>
            </div>
          )}

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
