import { useCallback, useEffect, useRef, useState } from 'react'

interface ReaderProps {
  text: string
  chapterTitle: string
  translatorInfo: string
  isLoading: boolean
  onTextSelect: (text: string) => void
}

export function Reader({ text, chapterTitle, translatorInfo, isLoading, onTextSelect }: ReaderProps) {
  const readerRef = useRef<HTMLDivElement>(null)
  const [selectionPopup, setSelectionPopup] = useState<{
    x: number
    y: number
    text: string
  } | null>(null)

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      // Small delay to allow click-to-dismiss
      setTimeout(() => setSelectionPopup(null), 200)
      return
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length < 3) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const readerRect = readerRef.current?.getBoundingClientRect()

    if (readerRect) {
      setSelectionPopup({
        x: rect.left - readerRect.left + rect.width / 2,
        y: rect.top - readerRect.top - 10,
        text: selectedText,
      })
    }
  }, [])

  useEffect(() => {
    // Scroll to top when text changes
    if (readerRef.current) {
      readerRef.current.scrollTop = 0
    }
  }, [text, chapterTitle])

  const handleExplain = () => {
    if (selectionPopup) {
      onTextSelect(selectionPopup.text)
      setSelectionPopup(null)
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleAsk = () => {
    if (selectionPopup) {
      onTextSelect(selectionPopup.text)
      setSelectionPopup(null)
      window.getSelection()?.removeAllRanges()
    }
  }

  // Format text into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim())

  return (
    <div className="reader" ref={readerRef} onMouseUp={handleMouseUp}>
      <div className="reader-content">
        <div className="chapter-header">
          <h2 className="chapter-title">{chapterTitle}</h2>
          <p className="translator-info">{translatorInfo}</p>
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner" />
            <p>Loading text from Project Gutenberg...</p>
          </div>
        ) : (
          <div className="text-body">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-paragraph">
                {para.trim()}
              </p>
            ))}
          </div>
        )}
      </div>

      {selectionPopup && (
        <div
          className="selection-popup"
          style={{
            left: selectionPopup.x,
            top: selectionPopup.y,
          }}
        >
          <button onClick={handleExplain} className="popup-button">
            Explain this
          </button>
          <button onClick={handleAsk} className="popup-button popup-button-secondary">
            Ask about this
          </button>
        </div>
      )}
    </div>
  )
}
