/**
 * `/reader?userBook=<hex>`: a reader's own EPUB in the Tinct reader. Opens
 * this account's file from this device (converting it the first time), or
 * the account's private copy when it is not on this device or the copy here
 * is damaged (userBookStore.ts). The place is reconciled with the account's
 * (ownSync.ts: the later read wins) before the reader draws its first page.
 * A text PDF opens here as its Tinct text (converted on this device, its
 * place shared with Original pages: pdfEditions.ts). A PDF read in Original
 * pages, a scan without text, or a book in neither place goes on to Add a
 * book's page for it, which opens a PDF in its viewer.
 */
import { useEffect, useState } from 'react'
import { LabApp } from '../LabApp'
import { LabWait } from '../LabWait'
import { ownBookOpenUrl, USER_BOOKS_SHELF_URL } from './userBookId'
import { registerUserBook } from './userBookSource'
import { openUserBook, type LoadedUserBook, type UserBookOpenResult } from './userBookStore'
import { reconcileOpenPlace, reconcilePdfPlace } from './ownSync'
import { readPdfTextPlace } from './pdfEditions'
import { epubViewHere, readEpubPlace, type EpubView } from './epubView'
import { registerFigureAssets } from '../labFigures'

type ReaderState = { status: 'opening' } | { status: 'ready'; book: LoadedUserBook } | { status: 'failed'; message: string }

/**
 * `owner`: the account the page was opened with, read before anything else ran
 * (main.tsx). Supabase drops a lapsed session from storage as it starts, and Add
 * a book tags files with the account even when its sign-in has lapsed.
 */
const replaceLocation = (url: string) => window.location.replace(url)

const reconcilePlace = (hex: string, book: LoadedUserBook) => book.kind === 'pdf'
  ? reconcilePdfPlace(hex).then(() => {})
  : reconcileOpenPlace(hex, { chapters: book.edition.chapters })

/** A link's `&page=<n>` (Original pages' "Tinct text" button): the page to open the text at. */
function pageParam(): number | null {
  try {
    const page = Number(new URLSearchParams(window.location.search).get('page'))
    return Number.isInteger(page) && page >= 1 ? page : null
  } catch { return null }
}

export function UserBookReader({ hex, owner, open = openUserBook, forward = replaceLocation, reconcile = reconcilePlace }: {
  hex: string
  owner?: string | null
  open?: (hex: string, options: { owner?: string | null; page?: number | null; epubView?: EpubView }) => Promise<UserBookOpenResult>
  forward?: (url: string) => void
  /** Bring this device's place in line with the account's (bounded; never rejects the open). */
  reconcile?: (hex: string, book: LoadedUserBook) => Promise<void>
}) {
  const [state, setState] = useState<ReaderState>({ status: 'opening' })
  useEffect(() => {
    let live = true
    setState({ status: 'opening' })
    const page = pageParam()
    // An EPUB read in Margin view on this device (the desktop's default) goes on to Add a book's margin reader.
    const epubView = epubViewHere(hex)
    void open(hex, { ...(owner !== undefined ? { owner } : {}), ...(page ? { page } : {}), epubView }).then(async result => {
      if (!live) return
      if (!result.ok && (result.reason === 'missing' || result.reason === 'pages' || result.reason === 'margin')) { forward(ownBookOpenUrl(hex)); return }
      // No Tinct text to read (a scan): its pages, and the viewer does not send it back here.
      if (!result.ok && result.reason === 'pages_only') { forward(ownBookOpenUrl(hex) + '&pages=1'); return }
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
  }, [hex, open, owner, forward, reconcile])

  // The book's pictures are drawn from this device while it is open (labFigures),
  // from object URLs made in this page load from the bytes kept on the device.
  const images = state.status === 'ready' ? state.book.images : null
  useEffect(() => {
    if (!images) return
    registerFigureAssets(key => images.get(key) ?? null)
    return () => registerFigureAssets(null)
  }, [images])

  if (state.status === 'ready') return <LabApp userBook={state.book} />
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
