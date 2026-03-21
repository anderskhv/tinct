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
  /** Initial page to restore on mount */
  initialPage?: number
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
  initialPage,
}: ReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const GAP = 60

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
    // Total scrollWidth includes all columns and gaps between them
    const pages = Math.max(1, Math.round((content.scrollWidth + GAP) / (colWidth + GAP)))
    setTotalPages(pages)
  }, [updateColumnWidth, getColWidth])

  useEffect(() => {
    recalcPages()
    // Recalc after fonts load and layout settles
    const timer1 = setTimeout(recalcPages, 100)
    const timer2 = setTimeout(recalcPages, 500)
    const container = readerRef.current
    const observer = container ? new ResizeObserver(recalcPages) : null
    if (container && observer) observer.observe(container)
    return () => { clearTimeout(timer1); clearTimeout(timer2); observer?.disconnect() }
  }, [paragraphs, chapterTitle, recalcPages])

  // Report page changes to parent
  useEffect(() => {
    onPageChange?.(currentPage, totalPages)
  }, [currentPage, totalPages, onPageChange])

  // Track actual chapter changes (not just title text changes from loading)
  const prevChapterTitle = useRef(chapterTitle)
  const hasRestoredInitial = useRef(false)

  useEffect(() => {
    // On first render, restore initial page if provided
    if (!hasRestoredInitial.current && initialPage != null) {
      setCurrentPage(initialPage)
      hasRestoredInitial.current = true
      prevChapterTitle.current = chapterTitle
      return
    }
    // Only reset to 0 when chapter actually changes (user navigated)
    if (chapterTitle !== prevChapterTitle.current) {
      setCurrentPage(0)
      prevChapterTitle.current = chapterTitle
    }
  }, [chapterTitle, initialPage])

  const goToPage = useCallback((page: number) => {
    const container = readerRef.current
    if (!container) return
    const clamped = Math.max(0, Math.min(page, totalPages - 1))
    setCurrentPage(clamped)
  }, [totalPages, readerRef])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

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
    if ((e.target as HTMLElement).closest('button, .selection-popup, mark')) return

    const container = readerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const zone = rect.width * 0.25

    if (clickX < zone) {
      goToPage(currentPage - 1)
    } else if (clickX > rect.width - zone) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, goToPage, readerRef])

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

    const paragraphText = paragraphs[paragraphIndex] || ''
    // Normalize newlines → spaces for matching (prose text has embedded \n)
    const normalizedPara = paragraphText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
    const normalizedSelection = selectedText.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
    let startOffset = normalizedPara.indexOf(normalizedSelection)
    let endOffset: number
    if (startOffset >= 0) {
      // Map back to original text offsets by counting characters
      // The normalized positions correspond to original positions when \n→space
      endOffset = startOffset + normalizedSelection.length
    } else {
      // Fallback: try original text directly
      startOffset = paragraphText.indexOf(selectedText)
      endOffset = startOffset >= 0 ? startOffset + selectedText.length : 0
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const readerRect = readerRef.current.getBoundingClientRect()

    const popupY = rect.top - readerRect.top - 10
    // If popup would be clipped at top, show below selection instead
    const showBelow = popupY < 50
    setSelectionPopup({
      x: rect.left - readerRect.left + rect.width / 2,
      y: showBelow ? rect.bottom - readerRect.top + 10 : popupY,
      text: selectedText,
      paragraphIndex,
      startOffset: Math.max(0, startOffset),
      endOffset: Math.max(0, endOffset),
      showBelow,
    })
  }, [paragraphs, readerRef])

  const handleColorClick = (color: HighlightColor) => {
    if (!selectionPopup) return
    onHighlight(
      selectionPopup.paragraphIndex,
      selectionPopup.startOffset,
      selectionPopup.endOffset,
      selectionPopup.text,
      color,
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

  // Compute translateX for current page
  const getTranslateX = () => {
    const colWidth = getColWidth()
    if (colWidth <= 0) return 0
    return -(currentPage * (colWidth + GAP))
  }

  return (
    <div
      className="reader reader-paginated"
      ref={readerRef}
      onMouseUp={handleMouseUp}
      onClick={handleReaderClick}
    >
      <div
        className="reader-columns"
        ref={contentRef}
        style={{ transform: `translateX(${getTranslateX()}px)` }}
      >
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle}</h2>
          <p className="translator-info">{editionLabel}</p>
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner" />
            <p>Loading text...</p>
          </div>
        ) : (
          <div className="text-body">
            {paragraphs.map((para, i) => (
              <ParagraphRenderer
                key={i}
                text={para}
                paragraphIndex={i}
                highlights={highlights}
              />
            ))}

            {paragraphs.length > 0 && onReflect && (
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
            )}
          </div>
        )}
      </div>

      {/* Page indicator & nav */}
      {totalPages > 1 && (
        <div className="page-nav">
          <button
            className="page-nav-arrow"
            onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1) }}
            disabled={currentPage <= 0}
          >
            &larr;
          </button>
          <span className="page-nav-label">{currentPage + 1} / {totalPages}</span>
          <button
            className="page-nav-arrow"
            onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1) }}
            disabled={currentPage >= totalPages - 1}
          >
            &rarr;
          </button>
        </div>
      )}

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
