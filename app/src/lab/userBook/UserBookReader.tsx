/**
 * `/reader?userBook=<hex>`: a reader's own EPUB in the Tinct reader. Opens
 * this account's file from this device (converting it the first time), then
 * hands it to the reader. Add a book downloads an account copy to the device
 * before it links here, so nothing is fetched on this page.
 */
import { useEffect, useState } from 'react'
import { LabApp } from '../LabApp'
import { USER_BOOKS_SHELF_URL } from './userBookId'
import { registerUserBook } from './userBookSource'
import { openUserBook, type LoadedUserBook, type UserBookOpenResult } from './userBookStore'
import { registerFigureAssets } from '../labFigures'

type ReaderState = { status: 'opening' } | { status: 'ready'; book: LoadedUserBook } | { status: 'failed'; message: string }

/**
 * `owner`: the account the page was opened with, read before anything else ran
 * (main.tsx). Supabase drops a lapsed session from storage as it starts, and Add
 * a book tags files with the account even when its sign-in has lapsed.
 */
export function UserBookReader({ hex, owner, open = openUserBook }: {
  hex: string
  owner?: string | null
  open?: (hex: string, options: { owner?: string | null }) => Promise<UserBookOpenResult>
}) {
  const [state, setState] = useState<ReaderState>({ status: 'opening' })
  useEffect(() => {
    let live = true
    setState({ status: 'opening' })
    void open(hex, owner !== undefined ? { owner } : {}).then(result => {
      if (!live) return
      if (!result.ok) { setState({ status: 'failed', message: result.message }); return }
      registerUserBook(result.book.bookId, result.book.edition)
      // The pictures are handed over before the reader draws its first page.
      const images = result.book.images
      registerFigureAssets(key => images.get(key) ?? null)
      setState({ status: 'ready', book: result.book })
    }).catch(() => {
      if (live) setState({ status: 'failed', message: 'This file could not be opened as an EPUB. Choose another file.' })
    })
    return () => { live = false }
  }, [hex, open, owner])

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
