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
  /** Called when user clicks a paragraph to start audio from there */
  onParagraphClick?: (paragraphIndex: number) => void
  /** Whether audio is currently available/active */
  hasAudio?: boolean
  /** Navigate to next/previous chapter */
  onNextChapter?: () => void
  onPrevChapter?: () => void
  /** Whether side panel is open — triggers column recalc on change */
  panelOpen?: boolean
  /** Disable highlight selection popup (e.g. on mobile) */
  disableHighlight?: boolean
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
  onParagraphClick,
  hasAudio,
  onNextChapter,
  onPrevChapter,
  panelOpen,
  disableHighlight,
}: ReaderProps) {
  const [selectionPopup, setSelectionPopup] = useState<SelectionInfo | null>(null)
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
  useEffect(() => {
    // targetParagraphIndex takes priority over initialPage
    if (targetParagraphRef.current !== undefined && totalPages > 1) {
      const content = contentRef.current
      if (!content) return
      const el = content.querySelector(`[data-paragraph-index="${targetParagraphRef.current}"]`) as HTMLElement
      if (el) {
        const colWidth = getColWidth()
        const gap = getGap()
        if (colWidth > 0) {
          const page = Math.floor(el.offsetLeft / (colWidth + gap))
          setCurrentPage(Math.min(page, totalPages - 1))
        }
      }
      targetParagraphRef.current = undefined
      initialPageRef.current = undefined
      return
    }
    const frac = initialPageRef.current
    if (frac !== undefined && frac >= 0 && frac <= 1 && totalPages > 1) {
      const targetPage = Math.round(frac * (totalPages - 1))
      setCurrentPage(targetPage)
      initialPageRef.current = undefined // only restore once
    }
  }, [totalPages, getColWidth, getGap])

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

  // Auto-scroll to playing paragraph when audio advances
  // Skip if user manually navigated away — don't snap back
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
    const page = Math.floor(el.offsetLeft / (colWidth + gap))
    const clamped = Math.min(page, totalPagesRef.current - 1)
    if (clamped !== currentPageRef.current) {
      setCurrentPage(clamped)
    }
  }, [playingParagraphIndex, getColWidth, getGap])

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

  // Click on left/right edge to turn pages, or click paragraph for audio
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
  }, [paragraphs, readerRef, disableHighlight])

  const handleColorClick = (color: HighlightColor) => {
    if (!selectionPopup) return
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
        if (playingParagraphIndex !== undefined && onParagraphClick) {
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
        className="reader-columns"
        ref={contentRef}
        style={{ transform: `translateX(${getTranslateX()}px)` }}
      >
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle}</h2>
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
                isVerse={isVerse}
                className={playingParagraphIndex === i ? 'paragraph-playing' : undefined}
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
