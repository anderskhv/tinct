import { useState } from 'react'
import type { Book } from '../types'
import { getReadingProgress } from '../hooks/useReadingPosition'

interface BookStoreProps {
  books: Book[]
  libraryIds: string[]
  onAddBook: (bookId: string) => void
  onSelectBook: (bookId: string) => void
  onClose?: () => void
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

          {progress && progress.percent > 0 && (
            <div className="book-detail-progress">
              <div className="book-detail-progress-bar">
                <div className="book-detail-progress-fill" style={{ width: `${progress.percent}%` }} />
              </div>
              <span className="book-detail-progress-text">{progress.percent}% complete</span>
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
  const myBooks = books.filter(b => libraryIds.includes(b.id))
  const otherBooks = books.filter(b => !libraryIds.includes(b.id))

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

  return (
    <div className="store">
      <div className="store-inner">
        <div className="store-header">
          <h1 className="store-title">Tinct</h1>
          <p className="store-subtitle">A new way to read</p>
          {onClose && (
            <button className="store-close" onClick={onClose}>&times;</button>
          )}
        </div>

        {myBooks.length > 0 && (
          <>
            <h2 className="store-section-title">My Library</h2>
            <div className="store-grid">
              {myBooks.map(book => {
                const progress = getReadingProgress(book.id)
                const hasProgress = progress && progress.percent > 0
                return (
                  <div
                    key={book.id}
                    className="store-book"
                    onClick={() => hasProgress ? onSelectBook(book.id) : setSelectedBook(book)}
                  >
                    <BookCover book={book} />
                    {hasProgress && (
                      <div className="store-book-progress">
                        <div className="store-book-progress-fill" style={{ width: `${progress.percent}%` }} />
                      </div>
                    )}
                    <p className="store-book-title">{book.title}</p>
                    <p className="store-book-author">
                      {book.author}
                      {hasProgress && (
                        <span className="store-book-percent"> · {progress.percent}%</span>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {otherBooks.length > 0 && (
          <>
            <h2 className="store-section-title">
              {myBooks.length > 0 ? 'All Books' : 'Choose a book to begin'}
            </h2>
            <div className="store-grid">
              {otherBooks.map(book => (
                <div key={book.id} className="store-book" onClick={() => setSelectedBook(book)}>
                  <BookCover book={book} />
                  <p className="store-book-title">{book.title}</p>
                  <p className="store-book-author">{book.author}</p>
                  <p className="store-book-languages">
                    {[...new Set(book.editions.map(e => e.language))].map(l => l.toUpperCase()).join(' / ')}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
