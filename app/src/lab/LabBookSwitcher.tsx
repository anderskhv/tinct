import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { QuickBookRow } from '../preReader/quickBookSwitcher'

interface LabBookSwitcherProps {
  current: { bookId: string; title: string; chapterLabel: string; coverSrc: string }
  rows: QuickBookRow[]
  loading: boolean
  error: string
  onClose: () => void
  onSelect: (row: QuickBookRow) => void
}

export function LabBookSwitcher({ current, rows, loading, error, onClose, onSelect }: LabBookSwitcherProps) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  useEffect(() => { activeRef.current?.focus() }, [current.bookId, rows])

  const keepFocusInside = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  const active = rows.find(row => row.bookId === current.bookId)
  const ordered = active ? [active, ...rows.filter(row => row !== active)] : rows

  return <div
    className="lab-book-switcher-backdrop"
    data-testid="lab-book-switcher"
    onPointerDown={event => { if (event.target === event.currentTarget) onClose() }}
  >
    <section ref={panelRef} className="lab-book-switcher" role="dialog" aria-modal="true" aria-label="Switch books" onKeyDown={keepFocusInside}>
      <header className="lab-book-switcher-head">
        <span>Reading now</span>
        <button type="button" onClick={onClose} aria-label="Close book switcher">×</button>
      </header>
      <div className="lab-book-switcher-list">
        {!active && <button
          ref={activeRef}
          type="button"
          className="lab-book-switcher-row is-active"
          aria-current="true"
          onClick={onClose}
        >
          <span className="lab-book-switcher-cover" aria-hidden="true"><img src={current.coverSrc} alt="" decoding="async" /></span>
          <span className="lab-book-switcher-copy"><strong>{current.title}</strong><small>{current.chapterLabel}</small></span>
          <span className="lab-book-switcher-check" aria-hidden="true">✓</span>
        </button>}
        {ordered.map(row => {
          const isActive = row.bookId === current.bookId
          return <button
            key={row.bookId}
            ref={isActive ? activeRef : undefined}
            type="button"
            className={`lab-book-switcher-row${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => isActive ? onClose() : onSelect(row)}
          >
            <span className={`lab-book-switcher-cover${row.coverSrc ? '' : ' is-fallback'}`} aria-hidden="true">
              {row.coverSrc && <img src={row.coverSrc} srcSet={row.coverSrcSet || undefined} alt="" decoding="async" />}
            </span>
            <span className="lab-book-switcher-copy"><strong>{row.title}</strong><small>{row.chapterLabel}</small></span>
            {isActive && <span className="lab-book-switcher-check" aria-hidden="true">✓</span>}
          </button>
        })}
        {loading && ordered.length === 0 && <p className="lab-book-switcher-status">Loading your books…</p>}
        {error && <p className="lab-book-switcher-status" role="status">{error}</p>}
      </div>
    </section>
  </div>
}
