/**
 * /reader?book=<id>&margin=1: a registered book in the margin reader, as a
 * preview for testing (Anders, 2026-10-19). The margin reader is the static
 * page at /lab/addbook/book (book.html), shown full screen in a same-origin frame so the
 * address stays /reader. The page asks this one for the book
 * (`window.TinctMarginPreview.load()`, js/tinct-book.js) and leaves through
 * the top window ("Back to normal reader", the library).
 *
 * The book reader (LabApp) is not mounted. What the margin view keeps goes through the book reader's own stores
 * (MarginPreviewSync, mounted once the book is loaded): the place, highlights and notes, cards.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getBook } from '../../data/bookRegistry'
import { readSupabaseAccessToken } from '../labAuth'
import { LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import { marginPreviewAtForPage } from './marginPreviewFlag'
import { loadMarginPreviewBookParts, type MarginPreviewParts } from './marginPreviewLoad'
import { marginPreviewMenu, type MarginPreviewMenuApi } from './marginPreviewMenu'
import { MarginPreviewSync, type MarginPreviewSyncBridge } from './MarginPreviewSync'
import { useMarginListen, type MarginListenApi } from './useMarginListen'
import {
  marginPreviewCompareEdition,
  marginPreviewLayoutHref,
  marginPreviewPaper,
  normalReaderHref,
  type MarginPreviewBook,
  type MarginPreviewPaper,
  type MarginPreviewPlace,
  type MarginPreviewView,
} from './marginPreviewModel'

import { marginPreviewFrameSrc } from './marginPreviewFrame'
export { MARGIN_PREVIEW_FRAME_SRC, marginPreviewFrameSrc } from './marginPreviewFrame'

declare global {
  interface Window {
    TinctMarginPreview?: {
      bookId: string
      load: () => Promise<MarginPreviewBook>
      /**
       * The first chapter first (22 Oct 2026): the chapters at the place, as soon as they are in, the others pending
       * (MarginPreviewBook.partial); null when the book opens whole. `load` stays the whole book.
       */
      first?: () => Promise<MarginPreviewBook | null>
      /** The desktop paper for a window this wide: the book reader's text, as it sets it now. */
      paper: (viewportWidth: number) => MarginPreviewPaper
      /** Two-page or Compare: the book reader at this place, in that layout. */
      layoutHref: (view: MarginPreviewView, place: MarginPreviewPlace) => string
      /** The account's sync (MarginPreviewSync), once the book is loaded; null before and after. */
      sync?: MarginPreviewSyncBridge | null
      /** Listen: the book reader's player, run in this page (useMarginListen.ts; the frame's js/tinct-listen.js). */
      listen?: MarginListenApi
      /** The t menu's Profile and Reading settings (marginPreviewMenu.ts). */
      menu?: MarginPreviewMenuApi
    }
  }
}

/** The book reader's desktop preferences on this device, read only. */
function desktopPrefs() {
  let raw: unknown = null
  try { raw = JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null') } catch { /* defaults */ }
  return parseLabPrefs(raw, 'desktop')
}

export function marginPreviewBridge(bookId: string, pending: Promise<MarginPreviewBook>, listen?: MarginListenApi, first?: Promise<MarginPreviewBook | null>): NonNullable<Window['TinctMarginPreview']> {
  const book = getBook(bookId)
  return {
    bookId,
    ...(listen ? { listen } : {}),
    load: () => pending,
    first: () => first ?? Promise.resolve(null),
    menu: marginPreviewMenu(bookId, pending),
    paper: width => marginPreviewPaper(desktopPrefs(), width, { shakespeare: book?.author === 'William Shakespeare' }),
    layoutHref: (view, place) => marginPreviewLayoutHref(bookId, view, place, book ? marginPreviewCompareEdition(book, desktopPrefs(), place.editionKey) : undefined),
  }
}

export function MarginPreview({ bookId, load = loadMarginPreviewBookParts, frame = null }: { bookId: string; load?: (bookId: string, deps: Parameters<typeof loadMarginPreviewBookParts>[1]) => MarginPreviewParts; frame?: HTMLIFrameElement | null }) {
  const [failed, setFailed] = useState(false)
  // One load per page, shared with the frame (it may ask before or after this renders): the chapters at the place
  // first, then the whole book (the first chapter first, 22 Oct 2026).
  const parts = useMemo(() => {
    const task = load(bookId, { readToken: readSupabaseAccessToken, at: marginPreviewAtForPage() })
    task.full.catch(() => setFailed(true))
    return task
  }, [bookId, load])
  const pending = parts.full
  // The sync outlives the bridge object (rebuilt as Listen changes): kept here and put on each one.
  const syncRef = useRef<MarginPreviewSyncBridge | null>(null)
  const onBridge = useCallback((sync: MarginPreviewSyncBridge | null) => {
    syncRef.current = sync
    if (window.TinctMarginPreview?.bookId === bookId) window.TinctMarginPreview.sync = sync
  }, [bookId])
  const [shown, setShown] = useState<MarginPreviewBook | null>(null)
  useEffect(() => {
    let current = true
    pending.then(model => { if (current) setShown(model) }, () => {})
    return () => { current = false }
  }, [pending])
  const chapterTitles = useMemo(() => new Map((shown?.chapters ?? []).map(c => [c.number, c.title])), [shown])
  // The edition the frame shows is the one heard.
  const listen = useMarginListen({ bookId, editionKey: shown?.editionKey ?? null, chapterTitles })
  useEffect(() => {
    window.TinctMarginPreview = { ...marginPreviewBridge(bookId, pending, listen, parts.first), sync: syncRef.current }
    const title = getBook(bookId)?.title
    if (title) document.title = `${title} · Margin preview · Tinct`
    return () => { if (window.TinctMarginPreview?.bookId === bookId) delete window.TinctMarginPreview }
  }, [bookId, pending, listen, parts.first])
  // The frame main.tsx started before this chunk loaded (marginPreviewFrame.ts) is this one's; it goes with an error.
  useEffect(() => { if (failed) frame?.remove() }, [failed, frame])
  if (failed) {
    return (
      <main data-testid="margin-preview-error" style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p>This book could not open in the margin preview.</p>
        <p><a href={normalReaderHref(bookId)}>Open it in the normal reader</a></p>
      </main>
    )
  }
  return (
    <>
    {shown && shown.bookId === bookId ? <MarginPreviewSync model={shown} onBridge={onBridge} /> : null}
    {frame ? null : <iframe
      data-testid="margin-preview-frame"
      title="Margin preview"
      src={marginPreviewFrameSrc(bookId)}
      allow="fullscreen; clipboard-write"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', background: 'var(--paper, #ece7db)' }}
    />}
    </>
  )
}
