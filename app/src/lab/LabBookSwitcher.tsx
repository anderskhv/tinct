import { useEffect, useMemo, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { QuickBookRow } from '../preReader/quickBookSwitcher'
import { LabWait } from './LabWait'
import { paperCoverUrl } from '../../public/lab/book-cover.js'
import { shortTitle } from '../../public/lab/book-title.js'

/**
 * The book's cover as the library draws it (book-cover.js): its image, else —
 * for a book without one (an own book with no picture, an added book before its
 * painting exists) — the same paper cover, else the bordered generated ground.
 */
function SwitcherCover({ src, srcSet, tone, title, author, kind }: { src: string | null; srcSet?: string | null; tone?: string | null; title: string; author?: string; kind?: string }) {
  const paper = useMemo(() => (src ? '' : paperCoverUrl(title, author ?? '', kind ?? '')), [src, title, author, kind])
  const image = src || paper
  return <span
    className={`lab-book-switcher-cover${image ? '' : ' is-fallback'}`}
    style={!image && tone ? { background: tone } : undefined}
    aria-hidden="true"
  >
    {/* `sizes`: the row's cover is 32 px wide, so a painting's small file serves it. */}
    {image && <img src={image} srcSet={src && srcSet ? srcSet : undefined} sizes={src && srcSet ? '32px' : undefined} alt="" decoding="async" />}
  </span>
}

interface LabBookSwitcherProps {
  current: { bookId: string; title: string; chapterLabel: string; coverSrc: string; coverSrcSet?: string | null; coverTone?: string | null }
  rows: QuickBookRow[]
  loading: boolean
  error: string
  onClose: () => void
  onSelect: (row: QuickBookRow) => void
  onLibrary: () => void
}

export function LabBookSwitcher({ current, rows, loading, error, onClose, onSelect, onLibrary }: LabBookSwitcherProps) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  // Put focus on the current book when the switcher opens or its rows first
  // arrive. A later catalogue refresh must not pull focus from a control the
  // reader has already moved to (e.g. Library).
  useEffect(() => {
    const focused = document.activeElement
    if (focused && focused !== activeRef.current && panelRef.current?.contains(focused)) return
    activeRef.current?.focus()
  }, [current.bookId, rows])

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
          <SwitcherCover src={current.coverSrc || null} srcSet={current.coverSrcSet} tone={current.coverTone} title={current.title} />
          <span className="lab-book-switcher-copy"><strong title={current.title}>{shortTitle(current.title)}</strong><small>{current.chapterLabel}</small></span>
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
            <SwitcherCover src={row.coverSrc} srcSet={row.coverSrcSet} tone={row.coverTone} title={row.title} author={row.author} kind={row.kind} />
            {/* The row is one line: the short title, fitted by ellipsis as a last resort (lab.css); the full one is the row's name. */}
            <span className="lab-book-switcher-copy"><strong title={row.title}>{shortTitle(row.title)}</strong><small>{row.chapterLabel}</small></span>
            {isActive && <span className="lab-book-switcher-check" aria-hidden="true">✓</span>}
          </button>
        })}
        {loading && ordered.length === 0 && <p className="lab-book-switcher-status"><LabWait label="Loading your books…" size={18} testId="lab-book-switcher-loading" /></p>}
        {error && <p className="lab-book-switcher-status" role="status">{error}</p>}
      </div>
      <button type="button" className="lab-book-switcher-library" onClick={onLibrary}><svg className="lab-book-switcher-library-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3-1 4 15-3 1z" /></svg><span>Library</span><span className="lab-book-switcher-library-arrow" aria-hidden="true">→</span></button>
    </section>
  </div>
}
