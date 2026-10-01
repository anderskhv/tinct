import { useState } from 'react'
import { UNLISTED_READER_BOOKS } from '../data/readerBooks'
import { loadEdition } from '../data/editionLoader'
import { createOpenReaderIntent } from './readerHandoff'
import { LAB_READER_HANDOFF_KEY } from '../lab/labReaderHandoff'
import { readLabPositionLocal } from '../lab/labPositionStore'
import './addBookPilot.css'

export function AddBookPilot() {
  const book = UNLISTED_READER_BOOKS[0]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function openBook() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const edition = await loadEdition(book.id, 'original-en', { bypassCache: true })
      if (edition.chapters.length !== 17 || edition.chapters.some(ch => !ch.paragraphs.length)) {
        throw new Error('Incomplete edition')
      }
      const saved = readLabPositionLocal().books[book.id]
      const chapterNumber = saved && edition.chapters.some(ch => ch.number === saved.sequentialChapter)
        ? saved.sequentialChapter : 1
      const handoff = createOpenReaderIntent({ bookId: book.id, primaryEditionKey: 'original-en',
        savedPlace: { bookId: book.id, chapterNumber,
          paragraphIndex: saved?.sequentialChapter === chapterNumber ? saved.paragraphIndex : 0,
          wordIndex: saved?.sequentialChapter === chapterNumber ? saved.wordIndex : 0 },
        startAtSavedPlace: true,
      })
      if (!handoff) throw new Error('Cannot open this edition')
      // A one-use handoff opens the real reader. Nothing enters the library.
      sessionStorage.setItem(LAB_READER_HANDOFF_KEY, JSON.stringify(handoff))
      window.location.assign('/reader')
    } catch {
      setError('The book could not be opened. Check your connection and try again.')
      setBusy(false)
    }
  }
  return <main className="add-book-pilot">
    <a className="add-book-back" href="/reader">← Reader</a>
    <p className="add-book-eyebrow">Tinct · Add a book · Pilot</p>
    <h1>Add a book</h1>
    <p className="add-book-intro">Open a book in the reader. It stays out of the library.</p>
    <article className="add-book-card">
      <div className="add-book-cover" aria-hidden="true"><span>H. G. Wells</span><strong>The<br/>Time<br/>Machine</strong><span>1895</span></div>
      <div className="add-book-details">
        <p className="add-book-eyebrow">Original English · 1895</p>
        <h2>{book.title}</h2><p className="add-book-author">{book.author}</p>
        <p>16 chapters and an epilogue</p>
        <a href="https://www.gutenberg.org/ebooks/35" target="_blank" rel="noreferrer">Project Gutenberg · #35 ↗</a>
        <p className="add-book-note">Public domain in the USA. Original text; no comparison or audio.</p>
        <button type="button" disabled={busy} onClick={openBook}>{busy ? 'Opening book…' : error ? 'Try again' : 'Add and read'}</button>
        {error && <p role="alert">{error}</p>}
        {busy && <p role="status">Checking the complete text…</p>}
      </div>
    </article>
  </main>
}
