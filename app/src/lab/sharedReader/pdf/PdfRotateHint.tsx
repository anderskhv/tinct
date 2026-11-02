import { useEffect, useState } from 'react'

const key = (bookId: string) => 'tinct.pdfRotateHint.' + bookId
const seen = (bookId: string) => { try { return localStorage.getItem(key(bookId)) === '1' } catch { return false } }
const remember = (bookId: string) => { try { localStorage.setItem(key(bookId), '1') } catch { /* Shown again next time. */ } }

/**
 * "Turn your phone sideways" (approved mockup, 2 Nov 2026): once per book, on a phone held upright in Original
 * pages, the standard phone-and-turning-arrow sign. Closing it, or turning the phone, keeps it away for that book.
 */
export function PdfRotateHint({ bookId, handheld, landscape, ready }: { bookId: string; handheld: boolean; landscape: boolean; ready: boolean }) {
  const [hidden, setHidden] = useState(() => seen(bookId))
  useEffect(() => { setHidden(seen(bookId)) }, [bookId])
  useEffect(() => { if (handheld && landscape && ready && !hidden) { remember(bookId); setHidden(true) } }, [handheld, landscape, ready, hidden, bookId])
  if (hidden || !handheld || landscape || !ready) return null
  return <div className="pdf-rotate-hint" role="status" data-testid="pdf-rotate-hint">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="9" width="14" height="23" rx="2.5" />
      <path d="M11.5 28.5h3" />
      <rect x="15" y="22" width="20" height="12" rx="2.5" strokeDasharray="2.6 2.4" opacity=".75" />
      <path d="M24 6.5c5 0 9 3.6 9.6 8.4" />
      <path d="M30.6 13.2l3 1.9 1.6-3.2" />
    </svg>
    <p>Turn your phone sideways to read the page larger.</p>
    <button type="button" aria-label="Close" onClick={() => { remember(bookId); setHidden(true) }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>
}
