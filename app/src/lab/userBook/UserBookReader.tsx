/**
 * `/reader?userBook=<hex>`: a reader's own EPUB in the Tinct reader. Opens
 * this account's file from this device (converting it the first time), or
 * the account's private copy when it is not on this device or the copy here
 * is damaged (userBookStore.ts). The place is reconciled with the account's
 * (ownSync.ts: the later read wins) before the reader draws its first page.
 * A PDF, or a book in neither place, goes on to Add a book's page for it,
 * which opens a PDF in its viewer.
 */
import { useEffect, useState } from 'react'
import { LabApp } from '../LabApp'
import { ownBookOpenUrl, USER_BOOKS_SHELF_URL } from './userBookId'
import { registerUserBook } from './userBookSource'
import { openUserBook, type LoadedUserBook, type UserBookOpenResult } from './userBookStore'
import { readUserBookPlace } from './userBookPlace'
import { reconcileOpenPlace } from './ownSync'
import { registerFigureAssets } from '../labFigures'

type ReaderState = { status: 'opening' } | { status: 'ready'; book: LoadedUserBook } | { status: 'failed'; message: string }

/**
 * `owner`: the account the page was opened with, read before anything else ran
 * (main.tsx). Supabase drops a lapsed session from storage as it starts, and Add
 * a book tags files with the account even when its sign-in has lapsed.
 */
const replaceLocation = (url: string) => window.location.replace(url)

const reconcilePlace = (hex: string, book: LoadedUserBook) => reconcileOpenPlace(hex, { chapters: book.edition.chapters })

export function UserBookReader({ hex, owner, open = openUserBook, forward = replaceLocation, reconcile = reconcilePlace }: {
  hex: string
  owner?: string | null
  open?: (hex: string, options: { owner?: string | null }) => Promise<UserBookOpenResult>
  forward?: (url: string) => void
  /** Bring this device's place in line with the account's (bounded; never rejects the open). */
  reconcile?: (hex: string, book: LoadedUserBook) => Promise<void>
}) {
  const [state, setState] = useState<ReaderState>({ status: 'opening' })
  useEffect(() => {
    let live = true
    setState({ status: 'opening' })
    void open(hex, owner !== undefined ? { owner } : {}).then(async result => {
      if (!live) return
      if (!result.ok && result.reason === 'missing') { forward(ownBookOpenUrl(hex)); return }
      if (!result.ok) { setState({ status: 'failed', message: result.message }); return }
      // A place read later on another device of the account opens here.
      await reconcile(hex, result.book).catch(() => {})
      if (!live) return
      const book = { ...result.book, place: readUserBookPlace(hex, result.book.edition) ?? result.book.place }
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
      <div className="lab-reader-load-error" role={state.status === 'failed' ? 'alert' : 'status'}>
        <p>{state.status === 'failed' ? state.message : 'Opening…'}</p>
        {state.status === 'failed' && <a href={USER_BOOKS_SHELF_URL}>Return to your books</a>}
      </div>
    </div>
  )
}
