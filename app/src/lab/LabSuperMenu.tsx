import { useEffect } from 'react'
import { labSuperMenuRows, type LabSuperMenuId, type LabSuperMenuRow } from './labSuperMenu'

export interface LabSuperMenuProps {
  open: boolean
  /** No compare edition chosen means no Compare row at all. */
  compare: boolean
  compareActive?: boolean
  phone?: boolean
  onSelect: (id: LabSuperMenuId) => void
  onClose: () => void
}

/** The monoline icons from the canvas, all on the same 22 px, 1.6 weight. */
function RowIcon({ id }: { id: LabSuperMenuId }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': true } as const
  if (id === 'chat') {
    return (
      <svg {...common} fill="none">
        <path d="M4.4 10.8c0-3.1 2.9-5.6 6.5-5.6s6.5 2.5 6.5 5.6-2.9 5.6-6.5 5.6c-.7 0-1.4-.1-2.1-.3L5 17.6l.5-2.8c-.7-1.1-1.1-2.5-1.1-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M11.2 16.6c.6.2 1.3.4 2.1.4 3.6 0 6.5-2.2 6.5-5 0-1.1-.5-2.2-1.2-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'talk') {
    return (
      <svg {...common} fill="currentColor">
        <rect x="4.2" y="9" width="2.6" height="6" rx="1.1" />
        <rect x="10.7" y="5" width="2.6" height="14" rx="1.1" />
        <rect x="17.2" y="8" width="2.6" height="8" rx="1.1" />
      </svg>
    )
  }
  if (id === 'compare') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.75" y="4.25" width="8" height="15.5" rx="1.65" />
        <rect x="13.25" y="4.25" width="8" height="15.5" rx="1.65" />
        <path d="M5.25 8h3M5.25 11h3M15.75 8h3M15.75 11h3" />
      </svg>
    )
  }
  if (id === 'library') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="4" height="16" rx="0.8" />
        <rect x="10" y="4" width="4" height="16" rx="0.8" />
        <path d="m14.6 5.2 3.9-.9 3 15.6-3.9.9z" />
      </svg>
    )
  }
  if (id === 'settings') {
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
export function LabSuperMenu({ open, compare, compareActive, phone, onSelect, onClose }: LabSuperMenuProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const rows: LabSuperMenuRow[] = labSuperMenuRows({ compare, compareActive, phone })

  return (
    <div className="lab-super-layer" data-testid="lab-super-layer">
      <button
        type="button"
        className="lab-super-scrim"
        data-testid="lab-super-scrim"
        aria-label="Close menu"
        onClick={onClose}
      />
      <nav className="lab-super-panel" data-testid="lab-super-menu" aria-label="Menu">
        {rows.map(row => (
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
            {row.chevron && <span className="lab-super-row-chevron" aria-hidden="true">›</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}
