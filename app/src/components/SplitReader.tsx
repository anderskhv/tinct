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
  /** Whether side panel is open — triggers column recalc on change */
  panelOpen?: boolean
  /** Navigate to next/previous chapter */
  onNextChapter?: () => void
  onPrevChapter?: () => void
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
}: SplitReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        goToPage(currentPage + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goToPage(currentPage - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, goToPage])

  // Click on left/right edge to turn pages
  const handleReaderClick = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return
    if ((e.target as HTMLElement).closest('button, select, .selection-popup, mark')) return
    const container = readerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const zone = rect.width * 0.2
    if (clickX < zone) {
      goToPage(currentPage - 1)
    } else if (clickX > rect.width - zone) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, goToPage, readerRef])

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

    const paragraphIndex = parseInt(paragraphEl.getAttribute('data-paragraph-index') || '0', 10)
    // Only allow highlighting in the primary (left) edition — right column is compare-only
    const side = paragraphEl.closest('.split-left') ? 'left' as const : 'right' as const
    if (side === 'right') {
      setTimeout(() => setSelectionPopup(null), 200)
      return
    }
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
    const readerRect = readerRef.current.getBoundingClientRect()

    const popupY = rect.top - readerRect.top - 10
    const showBelow = popupY < 50
    setSelectionPopup({
      x: rect.left - readerRect.left + rect.width / 2,
      y: showBelow ? rect.bottom - readerRect.top + 10 : popupY,
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
    onHighlight(
      selectionPopup.paragraphIndex,
      selectionPopup.startOffset,
      selectionPopup.endOffset,
      selectionPopup.text,
      color,
      selectionPopup.side,
    )
    onTextSelect(selectionPopup.text)
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
          goToPage(currentPage - 1)
        } else if (touchX > rect.width - zone) {
          goToPage(currentPage + 1)
        }
      }}
    >
      <div
        className="reader-columns split-reader-columns"
        ref={contentRef}
        style={{ transform: `translateX(${getTranslateX()}px)` }}
      >
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle}</h2>
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
                  className={`split-left${playingParagraphIndex === i ? ' paragraph-playing' : ''}`}
                  data-paragraph-index={i}
                  onClick={hasAudio && onParagraphClick ? () => onParagraphClick(i) : undefined}
                  style={hasAudio && onParagraphClick ? { cursor: 'pointer' } : undefined}
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
          style={{
            left: selectionPopup.x,
            top: selectionPopup.y,
          }}
        >
          <div className="popup-colors">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.key}
                className={`popup-color-dot highlight-${c.key}`}
                title={`Highlight ${c.label}`}
                onClick={() => handleColorClick(c.key)}
              />
            ))}
          </div>
          <div className="popup-divider" />
          <button onClick={handleExplain} className="popup-button">
            Explain
          </button>
        </div>
      )}
    </div>
  )
}
