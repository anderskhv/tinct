/**
 * /reader?book=<id>&margin=1: a registered book in the margin reader, as a
 * preview for testing (Anders, 2026-10-19). The margin reader is the static
 * page at /lab/addbook/book (book.html), shown full screen in a same-origin frame so the
 * address stays /reader. The page asks this one for the book
 * (`window.TinctMarginPreview.load()`, js/tinct-book.js) and leaves through
 * the top window ("Back to normal reader", the library).
 *
 * The book reader (LabApp) is not mounted: nothing of it runs or writes.
 */
import { useEffect, useMemo, useState } from 'react'
import { getBook } from '../../data/bookRegistry'
import { readSupabaseAccessToken } from '../labAuth'
import { loadMarginPreviewBook } from './marginPreviewLoad'
import { normalReaderHref, type MarginPreviewBook } from './marginPreviewModel'

// book.html (served as /lab/addbook/book): the margin reader's page without the PDF-only scripts (round 2).
export const MARGIN_PREVIEW_FRAME_SRC = '/lab/addbook/book?tinctBook='

declare global {
  interface Window {
    TinctMarginPreview?: { bookId: string; load: () => Promise<MarginPreviewBook> }
  }
}

export function marginPreviewFrameSrc(bookId: string): string {
  return MARGIN_PREVIEW_FRAME_SRC + encodeURIComponent(bookId)
}

export function MarginPreview({ bookId, load = loadMarginPreviewBook }: { bookId: string; load?: typeof loadMarginPreviewBook }) {
  const [failed, setFailed] = useState(false)
  // One load per page, shared with the frame (it may ask before or after this renders).
  const pending = useMemo(() => {
    const task = load(bookId, { readToken: readSupabaseAccessToken })
    task.catch(() => setFailed(true))
    return task
  }, [bookId, load])
  useEffect(() => {
    window.TinctMarginPreview = { bookId, load: () => pending }
    const title = getBook(bookId)?.title
    if (title) document.title = `${title} · Margin preview · Tinct`
    return () => { if (window.TinctMarginPreview?.bookId === bookId) delete window.TinctMarginPreview }
  }, [bookId, pending])
  if (failed) {
    return (
      <main data-testid="margin-preview-error" style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p>This book could not open in the margin preview.</p>
        <p><a href={normalReaderHref(bookId)}>Open it in the normal reader</a></p>
      </main>
    )
  }
  return (
    <iframe
      data-testid="margin-preview-frame"
      title="Margin preview"
      src={marginPreviewFrameSrc(bookId)}
      allow="fullscreen; clipboard-write"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', background: 'var(--paper, #ece7db)' }}
    />
  )
}
