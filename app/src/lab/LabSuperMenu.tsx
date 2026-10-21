import { useEffect, useLayoutEffect, useRef } from 'react'
import { labSuperMenuRows, type LabSuperMenuId, type LabSuperMenuRow } from './labSuperMenu'
import { ChatIcon, TalkIcon } from './LabReaderIcons'

export interface LabSuperMenuProps {
  /** The phone's margin mode on a book's first chapter or its front matter: no Catch me up (labSuperMenuRows). */
  noCatchUp?: boolean
  open: boolean
  phone?: boolean
  /** A reader's own book: the rows that apply to it only. */
  privateBook?: boolean
  /** A reader's own PDF: Book editions holds its Tinct text and its Original pages. */
  ownPdf?: boolean
  /** Someone asks to be friends and this device has not shown it yet (social/followRequests.ts). */
  profileDot?: boolean
  onSelect: (id: LabSuperMenuId) => void
  onClose: () => void
}

/** The monoline icons from the canvas, all on the same 22 px, 1.6 weight. */
export function RowIcon({ id }: { id: LabSuperMenuId }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true } as const
  if (id === 'chat') return <ChatIcon size={18} />

  if (id === 'talk') {
    return (
      <svg {...common} fill="currentColor">
        <rect x="4.2" y="9" width="2.6" height="6" rx="1.1" />
        <rect x="10.7" y="5" width="2.6" height="14" rx="1.1" />
        <rect x="17.2" y="8" width="2.6" height="8" rx="1.1" />
      </svg>
    )
  }
  if (id === 'librarian') {
    // The librarian's dotted orb, reduced to a monoline glyph.
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="7.5" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="8.6" cy="10.4" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.4" cy="13.6" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'summarize') return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 6h12M8 12h12M8 18h12M3 6h.1M3 12h.1M3 18h.1" /></svg>
  if (id === 'catchup') return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6.6v3M6 12.6v3.2" />
      <circle cx="6" cy="5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="11" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="2.2" />
      <path d="M11 5h9M11 11h9M11 18h5" />
    </svg>
  )
  if (id === 'library') return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m10 5-7 7 7 7M3 12h18" /></svg>
  if (id === 'editions') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="4" height="16" rx="0.8" />
        <rect x="10" y="4" width="4" height="16" rx="0.8" />
        <path d="m14.6 5.2 3.9-.9 3 15.6-3.9.9z" />
      </svg>
    )
  }
  // Text and theme: the letters the theme buttons show, set in the book's face.
  if (id === 'text') return <span className="lab-super-row-aa">Aa</span>
  if (id === 'settings' || id === 'reading') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 7h7M15 7h5M4 17h5M13 17h7" />
        <circle cx="13" cy="7" r="2" />
        <circle cx="11" cy="17" r="2" />
      </svg>
    )
  }
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.8 20c.9-3.6 3.6-5.4 7.2-5.4s6.3 1.8 7.2 5.4" />
    </svg>
  )
}

/**
 * The super-menu.
 *
 * A translucent panel over the page, and a light dim between the two. The page
 * is never blurred — the reader must be able to read the words behind the
 * panel — so the blur lives on the panel's own backdrop.
 */
export function LabSuperMenu({ open, phone, privateBook, ownPdf, noCatchUp, profileDot, onSelect, onClose }: LabSuperMenuProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const layer = layerRef.current
    const header = layer?.closest('.lab')?.querySelector('.lab-header')
    if (!open || !phone || !layer || !header) return
    // Use the actual header, including font size and safe-area padding. The
    // menu has its own 12px breathing room below the chapter and close targets.
    const place = () => layer.style.setProperty('--lab-v2-menu-top',
      `${header.getBoundingClientRect().bottom - layer.getBoundingClientRect().top + 12}px`)
    place()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null
    observer?.observe(header)
    window.addEventListener('resize', place)
    return () => { observer?.disconnect(); window.removeEventListener('resize', place) }
  }, [open, phone])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const rows: LabSuperMenuRow[] = labSuperMenuRows({ phone, privateBook, ownPdf, noCatchUp })

  return (
    <div ref={layerRef} className="lab-super-layer" data-testid="lab-super-layer">
      <button
        type="button"
        className="lab-super-scrim"
        data-testid="lab-super-scrim"
        aria-label="Close menu"
        onClick={onClose}
      />
      <nav className="lab-super-panel" data-testid="lab-super-menu" aria-label="Menu">
        {/* The Librarian row is the one way to the librarian (2026-10-08): its
            body opens Chat, its icons open Chat or Talk directly. */}
        {rows.map(row => row.modes && row.id === 'conversation' ? (
          // The phone: Chat · Talk, one row, each half its own button.
          <div key={row.id} className="lab-super-row is-pair" data-row={row.id} role="group" aria-label="Chat or Talk">
            {row.modes.map((mode, index) => (
              <button
                key={mode}
                type="button"
                className={`lab-super-row-half${index ? ' is-second' : ''}`}
                data-mode={mode}
                data-testid={`lab-super-row-${mode}`}
                onClick={() => onSelect(mode)}
              >
                <span className="lab-super-row-icon" aria-hidden="true">{mode === 'chat' ? <ChatIcon size={18} /> : <TalkIcon size={18} />}</span>
                <span className="lab-super-row-label">{mode === 'chat' ? 'Chat' : 'Talk'}</span>
              </button>
            ))}
          </div>
        ) : row.modes ? (
          <div key={row.id} className={`lab-super-row is-librarian${row.ruleBefore ? ' has-rule' : ''}`} data-row={row.id} role="group" aria-label={row.label}>
            <button
              type="button"
              className="lab-super-row-main"
              data-testid={`lab-super-row-${row.id}`}
              onClick={() => onSelect(row.modes![0])}
            >
              <span className="lab-super-row-icon" aria-hidden="true"><RowIcon id={row.id} /></span>
              <span className="lab-super-row-label">{row.label}</span>
            </button>
            {row.modes.map(mode => (
              <button
                key={mode}
                type="button"
                className="lab-super-row-mode"
                aria-label={mode === 'chat' ? 'Chat' : 'Talk'}
                title={mode === 'chat' ? 'Chat' : 'Talk'}
                data-mode={mode}
                data-testid={`lab-super-row-${mode}`}
                onClick={() => onSelect(mode)}
              >
                {mode === 'chat' ? <RowIcon id="chat" /> : <TalkIcon size={18} />}
              </button>
            ))}
          </div>
        ) : (
          <button
            key={row.id}
            type="button"
            className={`lab-super-row${row.ruleBefore ? ' has-rule' : ''}`}
            data-row={row.id}
            data-testid={`lab-super-row-${row.id}`}
            onClick={() => onSelect(row.id)}
          >
            <span className="lab-super-row-icon" aria-hidden="true"><RowIcon id={row.id} /></span>
            <span className="lab-super-row-label">{row.label}</span>
            {row.id === 'account' && profileDot && <span className="lab-super-row-dot" data-testid="request-dot" aria-hidden="true" />}
            {row.chevron && <span className="lab-super-row-chevron" aria-hidden="true">›</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}

