import { useEffect, useMemo, useState } from 'react'
import { biblicalBookId, placeFromChapterRef, resumePlace, type LabBookPlace, type LabPositionState } from './labPosition'
import { readLabPositionLocal, writeLabPositionLocal } from './labPositionStore'
import { bibleFallbackSource, loadLabSource, type LabSource } from './labSource'
import './labRoutes.css'

export interface LabLibraryBook {
  id: string
  title: string
  firstChapter: number
  chapterCount: number
  testament: 'Old Testament' | 'New Testament'
}

export function labLibraryBooks(source: LabSource): LabLibraryBook[] {
  const firstNewTestament = source.chapters.find(chapter => /^Matthew\s+1$/i.test(chapter.title))?.number ?? Number.POSITIVE_INFINITY
  const grouped = new Map<string, LabLibraryBook>()
  for (const chapter of source.chapters) {
    const match = chapter.title.trim().match(/^(.*\S)\s+(\d+)$/)
    if (!match) continue
    const title = match[1]
    const id = biblicalBookId(title)
    const known = grouped.get(id)
    if (known) {
      known.chapterCount += 1
      continue
    }
    grouped.set(id, {
      id,
      title,
      firstChapter: chapter.number,
      chapterCount: 1,
      testament: chapter.number >= firstNewTestament ? 'New Testament' : 'Old Testament',
    })
  }
  return [...grouped.values()]
}

export function selectLabLibraryBook(
  book: LabLibraryBook,
  chapters: LabSource['chapters'],
  state: LabPositionState = readLabPositionLocal(),
  now = Date.now(),
): LabPositionState {
  const existing = state.books[book.id]
  const place: LabBookPlace = existing ?? placeFromChapterRef({
    chapters,
    sequentialChapter: book.firstChapter,
    paragraphIndex: 0,
    wordIndex: 0,
    deviceId: state.deviceId,
    now,
    rev: 0,
  })
  const next: LabPositionState = {
    ...state,
    books: { ...state.books, [book.id]: place },
    lastSettledBookId: book.id,
    lastSettledAt: now,
    updatedAt: Math.max(state.updatedAt, now),
  }
  writeLabPositionLocal(next)
  return next
}

function BookCover({ book, index }: { book: LabLibraryBook; index: number }) {
  return (
    <span className={`lab-library-cover tone-${index % 6}`} aria-hidden="true">
      <i>{book.testament === 'Old Testament' ? 'OLD' : 'NEW'}</i>
      <b>{book.title}</b>
      <small>{book.chapterCount} {book.chapterCount === 1 ? 'chapter' : 'chapters'}</small>
    </span>
  )
}

export function LabLibrary({ source }: { source?: LabSource }) {
  const [librarySource, setLibrarySource] = useState<LabSource>(() => source ?? bibleFallbackSource())
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState(() => readLabPositionLocal())

  useEffect(() => {
    if (source) return
    let live = true
    void loadLabSource().then(loaded => { if (live) setLibrarySource(loaded) })
    return () => { live = false }
  }, [source])

  const books = useMemo(() => labLibraryBooks(librarySource), [librarySource])
  const filtered = query.trim()
    ? books.filter(book => book.title.toLowerCase().includes(query.trim().toLowerCase()))
    : books
  const current = resumePlace(position)
  const currentBook = current ? books.find(book => book.id === current.bookId) : books[0]

  const choose = (book: LabLibraryBook) => {
    const next = selectLabLibraryBook(book, librarySource.chapters, position)
    setPosition(next)
  }

  return (
    <main className="lab-entry lab-library" data-testid="lab-library">
      <header className="lab-library-head">
        <a href="/lab/landing" className="lab-library-brand">Tinct.</a>
        <a href="/lab/phone" className="lab-library-reader">Open reader</a>
        <p>Library close-up</p>
        <h1>Popular</h1>
      </header>
      <section className="lab-library-surface">
        {currentBook && (
          <a className="lab-library-current" href="/lab/phone" onClick={() => choose(currentBook)}>
            <BookCover book={currentBook} index={0} />
            <span>
              <small>Continue reading</small>
              <strong>{current?.headerBook ?? currentBook.title} {current?.chapterNumber ?? 1}</strong>
              <em>Return to your saved place</em>
            </span>
            <b aria-hidden="true">→</b>
          </a>
        )}
        <section className="lab-library-librarian">
          <span className="lab-library-orb" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <div>
            <strong>Not sure where to begin?</strong>
            <small>Ask the librarian.</small>
            <div><button type="button">◖ Talk</button><button type="button">□ Chat</button></div>
          </div>
        </section>
        <label className="lab-library-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search 90+ classics" aria-label="Search the library" />
        </label>
        {(['Old Testament', 'New Testament'] as const).map(testament => {
          const testamentBooks = filtered.filter(book => book.testament === testament)
          if (testamentBooks.length === 0) return null
          return (
            <section className="lab-library-section" key={testament}>
              <header><h2>{testament}</h2><span>{testamentBooks.length} books</span></header>
              <div className="lab-library-grid">
                {testamentBooks.map((book, index) => {
                  const saved = position.books[book.id]
                  return (
                    <a href="/lab/phone" key={book.id} onClick={() => choose(book)} data-testid={`lab-library-book-${book.id}`}>
                      <BookCover book={book} index={index} />
                      <strong>{book.title}</strong>
                      <small>{saved ? `Continue at ${saved.headerBook} ${saved.chapterNumber}` : 'Begin reading'}</small>
                    </a>
                  )
                })}
              </div>
            </section>
          )
        })}
      </section>
    </main>
  )
}
