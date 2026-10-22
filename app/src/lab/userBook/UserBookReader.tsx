/**
 * `/reader?userBook=<hex>`: a reader's own book, at its one address (Anders, 22 Oct 2026, "One Tinct").
 * Opens this account's file from this device (converting it the first time), or
 * the account's private copy when it is not on this device or the copy here
 * is damaged (userBookStore.ts). The place is reconciled with the account's
 * (ownSync.ts: the later read wins) before the reader draws its first page.
 * A text PDF opens here as its Tinct text (converted on this device, its
 * place shared with Original pages: pdfEditions.ts).
 *
 * The margin reader's books (an EPUB in Margin view, the desktop's default; a PDF read in Original pages; a
 * scan without text; a book not on this device yet; a link asking for the pages, `&pages`): on a desktop the
 * margin reader opens here, in the same shell as Tinct's books (MarginPreview.tsx MarginOwnBook: the frame at
 * /lab/addbook/book, the book reader's Reading now and Contents over it, reading time); the address stays
 * /reader?userBook=<hex>. The frame is then the only writer of the place: it reconciles a PDF's with the
 * account as it opens (reader.js placeSync), as it did on its own page; nothing here reads or writes it.
 * A phone goes on to the margin reader's page itself (/lab/addbook/book?userBook=<hex>), as before.
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { LabApp } from '../LabApp'
import { LabWait } from '../LabWait'
import { ownBookFrameUrl, USER_BOOKS_SHELF_URL } from './userBookId'
import { MARGIN_PREVIEW_KEY, MARGIN_PREVIEW_PARAM } from '../marginPreview/marginPreviewFlag'
import { registerUserBook } from './userBookSource'
import { openUserBook, type LoadedUserBook, type UserBookOpenResult } from './userBookStore'
import { reconcileOpenPlace, reconcilePdfPlace } from './ownSync'
import { readPdfTextPlace } from './pdfEditions'
import { epubViewHere, readEpubPlace, type EpubView } from './epubView'
import { registerFigureAssets } from '../labFigures'

// The margin reader's frame and its shell, loaded only for a book that opens there.
const MarginOwnBook = lazy(() => import('../marginPreview/MarginPreview').then(module => ({ default: module.MarginOwnBook })))

type ReaderState = { status: 'opening' } | { status: 'ready'; book: LoadedUserBook } | { status: 'margin' } | { status: 'failed'; message: string }

/**
 * `owner`: the account the page was opened with, read before anything else ran
 * (main.tsx). Supabase drops a lapsed session from storage as it starts, and Add
 * a book tags files with the account even when its sign-in has lapsed.
 */
const replaceLocation = (url: string) => window.location.replace(url)

const reconcilePlace = (hex: string, book: LoadedUserBook) => book.kind === 'pdf'
  ? reconcilePdfPlace(hex).then(() => {})
  : reconcileOpenPlace(hex, { chapters: book.edition.chapters })

/**
 * The phone's margin mode for an own book (the bar, the bottom cards, the chapter pills: LabApp `marginPhone`), on
 * the rule a Tinct book follows on this phone (marginPreviewMount.ts): `margin=1` / `margin=0` in the link, else
 * this device's opt-in. Own books follow it as Tinct books do (Anders, 22 Oct 2026).
 */
export function ownMarginPhone(search: string, read: (key: string) => string | null = key => { try { return localStorage.getItem(key) } catch { return null } }): boolean {
  let flag: string | null = null
  try { flag = new URLSearchParams(search).get(MARGIN_PREVIEW_PARAM) } catch { /* the device's choice */ }
  if (flag === '1') return true
  if (flag === '0') return false
  return read(MARGIN_PREVIEW_KEY) === '1'
}

/** The same query with `pages` (a scan: the margin reader shows its pages and never sends it back here). */
function withPages(search: string): string {
  const params = new URLSearchParams(search)
  params.set('pages', '1')
  return `?${params}`
}

/** A link's `&pages` (a look at a page, "Show page"): the margin reader's pages, whatever this device reads the book in. */
function pagesAsked(): boolean {
  try { return new URLSearchParams(window.location.search).has('pages') } catch { return false }
}

/** A link's `&page=<n>` (Original pages' "Tinct text" button): the page to open the text at. */
function pageParam(): number | null {
  try {
    const page = Number(new URLSearchParams(window.location.search).get('page'))
    return Number.isInteger(page) && page >= 1 ? page : null
  } catch { return null }
}

export function UserBookReader({ hex, owner, phone = false, open = openUserBook, forward = replaceLocation, reconcile = reconcilePlace }: {
  hex: string
  owner?: string | null
  /** The phone's reader (main.tsx: the same surface test as Tinct's books). A desktop shows the margin reader here. */
  phone?: boolean
  open?: (hex: string, options: { owner?: string | null; page?: number | null; epubView?: EpubView }) => Promise<UserBookOpenResult>
  forward?: (url: string) => void
  /** Bring this device's place in line with the account's (bounded; never rejects the open). */
  reconcile?: (hex: string, book: LoadedUserBook) => Promise<void>
}) {
  const [state, setState] = useState<ReaderState>({ status: 'opening' })
  const [marginSearch, setMarginSearch] = useState(() => typeof window === 'undefined' ? '' : window.location.search)
  useEffect(() => {
    let live = true
    setState({ status: 'opening' })
    const page = pageParam()
    // The margin reader's book: in this page's frame on a desktop, its own page on a phone. Nothing is written here.
    const toMargin = (pagesOnly = false) => {
      if (pagesOnly) setMarginSearch(withPages(window.location.search))
      if (phone) { forward(ownBookFrameUrl(hex, pagesOnly ? withPages(window.location.search) : window.location.search)); return }
      setState({ status: 'margin' })
    }
    // A look at a page (&pages): the margin reader's pages at once, for a signed-in reader (the frame needs the account).
    if (pagesAsked() && owner) { toMargin(); return () => { live = false } }
    // An EPUB read in Margin view on this device (the desktop's default) goes on to the margin reader.
    const epubView = epubViewHere(hex)
    void open(hex, { ...(owner !== undefined ? { owner } : {}), ...(page ? { page } : {}), epubView }).then(async result => {
      if (!live) return
      // A book not on this device yet, an EPUB in Margin view, a PDF read in its pages, or one without text to
      // reflow (a scan: the margin reader does not send it back here).
      if (!result.ok && (result.reason === 'missing' || result.reason === 'pages' || result.reason === 'margin')) { toMargin(); return }
      if (!result.ok && result.reason === 'pages_only') { toMargin(true); return }
      if (!result.ok) { setState({ status: 'failed', message: result.message }); return }
      // A place read later on another device of the account opens here.
      await reconcile(hex, result.book).catch(() => {})
      if (!live) return
      const book = { ...result.book, place: (result.book.kind === 'pdf' ? readPdfTextPlace(hex, result.book.edition, { page }) : readEpubPlace(hex, result.book.edition)) ?? result.book.place }
      registerUserBook(book.bookId, book.edition)
      // The pictures are handed over before the reader draws its first page.
      const images = book.images
      registerFigureAssets(key => images.get(key) ?? null)
      setState({ status: 'ready', book })
    }).catch(() => {
      if (live) setState({ status: 'failed', message: 'This file could not be opened as an EPUB. Choose another file.' })
    })
    return () => { live = false }
  }, [hex, open, owner, phone, forward, reconcile])

  // The book's pictures are drawn from this device while it is open (labFigures),
  // from object URLs made in this page load from the bytes kept on the device.
  const images = state.status === 'ready' ? state.book.images : null
  useEffect(() => {
    if (!images) return
    registerFigureAssets(key => images.get(key) ?? null)
    return () => registerFigureAssets(null)
  }, [images])

  if (state.status === 'ready') return <LabApp userBook={state.book} marginPhone={(phone && ownMarginPhone(window.location.search)) || undefined} />
  if (state.status === 'margin') return <Suspense fallback={null}><MarginOwnBook hex={hex} search={marginSearch} /></Suspense>
  return (
    <div className="lab is-desktop" data-testid="user-book-status" style={{ minHeight: '100vh' }}>
      {state.status === 'failed' ? (
        <div className="lab-reader-load-error" role="alert">
          <p>{state.message}</p>
          <a href={USER_BOOKS_SHELF_URL}>Return to your books</a>
        </div>
      ) : (
        // The whole page is what is loading: the reader's ring on the paper, no card (Anders, 10 Oct:
        // no pop-up saying "Opening…"); the wording stays for screen readers (LabWait).
        <div className="lab-reader-load-wait">
          <LabWait label="Opening…" testId="user-book-opening" />
        </div>
      )}
    </div>
  )
}
