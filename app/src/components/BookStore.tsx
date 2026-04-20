import { useState, useMemo } from 'react'
import type { Book, ReadingProgress } from '../types'
import { getReadingProgress } from '../hooks/useReadingPosition'

interface BookStoreProps {
  books: Book[]
  libraryIds: string[]
  onAddBook: (bookId: string) => void
  onSelectBook: (bookId: string) => void
  onClose?: () => void
}

/** A book is "finished" once the highest-completed chapter equals the total.
 * Stays sticky — re-reading it (current positionPercent dropping) doesn't
 * unmark it. `percent` is derived from `highestCompletedChapter` in
 * useReadingPosition so 100 is a safe signal. */
function isFinished(p: ReadingProgress | null | undefined): boolean {
  if (!p) return false
  if (p.totalChapters > 0 && p.highestCompletedChapter >= p.totalChapters) return true
  return p.percent >= 100
}

function BookCover({ book, size = 'normal' }: { book: Book; size?: 'normal' | 'large' }) {
  const bg = book.coverColor || '#2c2417'
  const accent = book.coverAccent || '#c9a45c'
  const isLarge = size === 'large'

  return (
    <div
      className={`book-cover ${isLarge ? 'book-cover-large' : ''}`}
      style={{ background: bg }}
    >
      <div className="book-cover-spine" style={{ background: accent }} />
      <div className="book-cover-inner">
        <div className="book-cover-rule" style={{ borderColor: accent }} />
        <h3 className="book-cover-title" style={{ color: accent }}>
          {book.title}
        </h3>
        <div className="book-cover-rule" style={{ borderColor: accent }} />
        <p className="book-cover-author" style={{ color: `${accent}cc` }}>
          {book.author}
        </p>
        {book.year && (
          <p className="book-cover-year" style={{ color: `${accent}88` }}>
            {book.year < 0 ? `c. ${Math.abs(book.year)} BC` : book.year}
          </p>
        )}
      </div>
    </div>
  )
}

function BookDetail({ book, inLibrary, onAddBook, onSelectBook, onBack }: {
  book: Book
  inLibrary: boolean
  onAddBook: (bookId: string) => void
  onSelectBook: (bookId: string) => void
  onBack: () => void
}) {
  const languages = [...new Set(book.editions.map(e => e.language))]
  const langLabels: Record<string, string> = { en: 'English', da: 'Danish' }
  const progress = getReadingProgress(book.id)

  return (
    <div className="book-detail">
      <button className="book-detail-back" onClick={onBack}>
        &larr; Library
      </button>

      <div className="book-detail-layout">
        <div className="book-detail-cover">
          <BookCover book={book} size="large" />
        </div>

        <div className="book-detail-info">
          <h1 className="book-detail-title">{book.title}</h1>
          <p className="book-detail-author">by {book.author}</p>
          {book.year && (
            <p className="book-detail-year">
              First published {book.year < 0 ? `c. ${Math.abs(book.year)} BC` : book.year}
            </p>
          )}

          <p className="book-detail-description">{book.description}</p>

          {progress && (progress.percent > 0 || (progress.positionPercent && progress.positionPercent > 0)) && (
            <div className="book-detail-progress">
              <div className="book-detail-progress-bar">
                <div className="book-detail-progress-fill" style={{ width: `${progress.positionPercent || progress.percent}%` }} />
                {progress.percent > 0 && progress.percent < (progress.positionPercent || 0) && (
                  <div className="book-detail-progress-read" style={{ width: `${progress.percent}%` }} />
                )}
              </div>
              <span className="book-detail-progress-text">
                {progress.positionPercent ? `${progress.positionPercent}% position` : ''}
                {progress.positionPercent && progress.percent > 0 ? ' · ' : ''}
                {progress.percent > 0 ? `${progress.percent}% read` : ''}
              </span>
            </div>
          )}

          <div className="book-detail-section">
            <h3 className="book-detail-section-title">Available editions</h3>
            <div className="book-detail-editions">
              {book.editions.map(ed => (
                <div key={ed.key} className="book-detail-edition">
                  <div className="book-detail-edition-main">
                    <span className="book-detail-edition-label">{ed.label}</span>
                    <span className="book-detail-edition-lang">{langLabels[ed.language] || ed.language}</span>
                  </div>
                  <div className="book-detail-edition-formats">
                    <span className="book-detail-format book-detail-format-text">Text</span>
                    {ed.hasAudio && (
                      <span className="book-detail-format book-detail-format-audio">Audiobook</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="book-detail-section">
            <h3 className="book-detail-section-title">Languages</h3>
            <p className="book-detail-languages">
              {languages.map(l => langLabels[l] || l).join(', ')}
            </p>
          </div>

          {book.wordCount && (
            <div className="book-detail-section">
              <h3 className="book-detail-section-title">Length</h3>
              <p className="book-detail-languages">
                ~{Math.round(book.wordCount / 1000)}k words
                &middot; ~{Math.round(book.wordCount / 250 / 60)} hours reading time
              </p>
            </div>
          )}

          <div className="book-detail-actions">
            {inLibrary ? (
              <button
                className="book-detail-cta"
                onClick={() => onSelectBook(book.id)}
              >
                Continue reading
              </button>
            ) : (
              <button
                className="book-detail-cta"
                onClick={() => {
                  onAddBook(book.id)
                  onSelectBook(book.id)
                }}
              >
                Start reading — free
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BookStore({ books, libraryIds, onAddBook, onSelectBook, onClose }: BookStoreProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const matches = (b: Book) =>
    q === '' ||
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q)

  const myBooks = useMemo(
    () => books.filter(b => libraryIds.includes(b.id)).filter(matches),
    [books, libraryIds, q],
  )
  const otherBooks = useMemo(
    () => books.filter(b => !libraryIds.includes(b.id)).filter(matches),
    [books, libraryIds, q],
  )

  if (selectedBook) {
    return (
      <div className="store">
        <BookDetail
          book={selectedBook}
          inLibrary={libraryIds.includes(selectedBook.id)}
          onAddBook={onAddBook}
          onSelectBook={onSelectBook}
          onBack={() => setSelectedBook(null)}
        />
      </div>
    )
  }

  const renderBook = (book: Book, showLang: boolean) => {
    const progress = getReadingProgress(book.id)
    const finished = isFinished(progress)
    const hasProgress = !!progress && (progress.percent > 0 || (progress.positionPercent ?? 0) > 0)
    const pct = progress?.positionPercent ?? progress?.percent ?? 0
    const inLibrary = libraryIds.includes(book.id)
    return (
      <div
        key={book.id}
        className={`store-book ${finished ? 'store-book-finished' : ''}`}
        onClick={() => (inLibrary && hasProgress) ? onSelectBook(book.id) : setSelectedBook(book)}
      >
        <BookCover book={book} />
        {finished && (
          <span className="store-book-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Finished
          </span>
        )}
        {hasProgress && !finished && (
          <div className="store-book-progress">
            <div className="store-book-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
        <p className="store-book-title">{book.title}</p>
        <p className="store-book-author">
          {book.author}
          {hasProgress && !finished && (
            <span className="store-book-percent"> &middot; {pct}%</span>
          )}
        </p>
        {showLang && !hasProgress && !finished && (
          <p className="store-book-languages">
            {[...new Set(book.editions.map(e => e.language))].map(l => l.toUpperCase()).join(' / ')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="store">
      <div className="store-inner">
        <div className="store-header">
          <h1 className="store-title">Tinct<span className="store-title-dot">.</span></h1>
          <p className="store-subtitle">A new way to read</p>
          {onClose && (
            <button className="store-close" onClick={onClose}>&times;</button>
          )}
        </div>

        <div className="store-search">
          <svg className="store-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <input
            className="store-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author"
            aria-label="Search library"
          />
          {query && (
            <button className="store-search-clear" onClick={() => setQuery('')} aria-label="Clear search">&times;</button>
          )}
        </div>

        {myBooks.length === 0 && otherBooks.length === 0 && (
          <p className="store-empty">No books match &ldquo;{query}&rdquo;.</p>
        )}

        {myBooks.length > 0 && (
          <>
            <h2 className="store-section-title">My Library</h2>
            <div className="store-grid">
              {myBooks.map(b => renderBook(b, false))}
            </div>
          </>
        )}

        {otherBooks.length > 0 && (
          <>
            <h2 className="store-section-title">
              {myBooks.length > 0 ? 'All Books' : 'Choose a book to begin'}
            </h2>
            <div className="store-grid">
              {otherBooks.map(b => renderBook(b, true))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
