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
}: SplitReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // === Pagination (CSS multi-column, same as Reader) ===
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const PAD_X = 24

  // Read actual column-gap from CSS (60px desktop, 40px mobile)
  const getGap = useCallback(() => {
    const content = contentRef.current
    if (!content) return 60
    return parseFloat(getComputedStyle(content).columnGap) || 60
  }, [])

  const updateColumnWidth = useCallback(() => {
    const container = readerRef.current
    const content = contentRef.current
    if (!container || !content) return
    const colW = container.clientWidth - PAD_X * 2
    if (colW > 0) {
      content.style.columnWidth = `${colW}px`
    }
  }, [readerRef])

  const recalcPages = useCallback(() => {
    const content = contentRef.current
    const container = readerRef.current
    if (!content || !container) return
    updateColumnWidth()
    const colWidth = container.clientWidth - PAD_X * 2
    if (colWidth <= 0) return
    const gap = getGap()
    const pages = Math.max(1, Math.round((content.scrollWidth + gap) / (colWidth + gap)))
    setTotalPages(pages)
  }, [readerRef, updateColumnWidth, getGap])

  // Track chapter title to know when chapter actually changes (vs edition swap)
  const prevChapterTitle = useRef(chapterTitle)

  useEffect(() => {
    // Save current page before recalc
    const savedPage = currentPage
    recalcPages()
    const timer1 = setTimeout(() => {
      recalcPages()
      // After recalc, clamp to saved page (don't reset on edition change)
      setCurrentPage(prev => Math.min(prev, Math.max(0, totalPages - 1)))
    }, 100)
    const timer2 = setTimeout(recalcPages, 500)
    const container = readerRef.current
    const observer = container ? new ResizeObserver(recalcPages) : null
    if (container && observer) observer.observe(container)
    return () => { clearTimeout(timer1); clearTimeout(timer2); observer?.disconnect() }
  }, [leftParagraphs, rightParagraphs, chapterTitle, recalcPages])

  // Reset page only on actual chapter change, not on edition swap
  useEffect(() => {
    if (chapterTitle !== prevChapterTitle.current) {
      setCurrentPage(0)
      prevChapterTitle.current = chapterTitle
    }
  }, [chapterTitle])

  const goToPage = useCallback((page: number) => {
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
    const container = readerRef.current
    if (!container) return 0
    const colWidth = container.clientWidth - PAD_X * 2
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
    >
      <div
        className="reader-columns split-reader-columns"
        ref={contentRef}
        style={{ transform: `translateX(${getTranslateX()}px)` }}
      >
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle}</h2>
        </div>

        {/* Column headers */}
        <div className="split-column-headers">
          <div className="split-column-label">{leftLabel}</div>
          <div className="split-column-label">
            <select
              className="split-edition-select"
              value={currentRightEditionKey}
              onChange={e => onRightEditionChange(e.target.value)}
            >
              {alignedEditions.map(ed => (
                <option key={ed.key} value={ed.key}>{ed.label}</option>
              ))}
            </select>
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
                <div className="split-left" data-paragraph-index={i}>
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
