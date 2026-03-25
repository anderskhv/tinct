import { useEffect, useRef } from 'react'

interface TocOverlayProps {
  chapters: { number: number; title: string }[]
  currentChapter: number
  onSelectChapter: (n: number) => void
  onClose: () => void
}

export function TocOverlay({ chapters, currentChapter, onSelectChapter, onClose }: TocOverlayProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="toc-overlay" onClick={onClose}>
      <div className="toc-panel" onClick={e => e.stopPropagation()}>
        <div className="toc-header">
          <h2 className="toc-title">Table of Contents</h2>
          <button className="toc-close" onClick={onClose}>&times;</button>
        </div>
        <div className="toc-list">
          {chapters.map(ch => (
            <button
              key={ch.number}
              ref={ch.number === currentChapter ? activeRef : null}
              className={`toc-item ${ch.number === currentChapter ? 'toc-active' : ''}`}
              onClick={() => { onSelectChapter(ch.number); onClose() }}
            >
              <span className="toc-item-number">{ch.number}</span>
              <span className="toc-item-title">{ch.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
