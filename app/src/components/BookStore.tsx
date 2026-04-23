import { useState, useMemo } from 'react'
import type { Book, ReadingProgress } from '../types'
import { getReadingProgress } from '../hooks/useReadingPosition'

interface BookStoreProps {
  books: Book[]
  libraryIds: string[]
  onAddBook: (bookId: string) => void
  onRemoveBook?: (bookId: string) => void
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

// ── Era grouping ──
// Books in the "All Books" list are grouped by publication era so the library
// feels like a library, not a flat pile. Book.year is the publication year of
// the original work (negative for BCE).
type Era = 'ancient' | 'medieval' | 'modern' | 'contemporary'
const ERA_LABELS: Record<Era, string> = {
  ancient: 'Ancient world',
  medieval: 'Medieval & Renaissance',
  modern: '18th–19th century',
  contemporary: '20th century & beyond',
}
const ERA_ORDER: Era[] = ['ancient', 'medieval', 'modern', 'contemporary']
function eraOf(year?: number): Era {
  if (year === undefined) return 'contemporary'
  if (year < 500) return 'ancient'
  if (year < 1700) return 'medieval'
  if (year < 1900) return 'modern'
  return 'contemporary'
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

export function BookStore({ books, libraryIds, onAddBook, onRemoveBook, onSelectBook, onClose }: BookStoreProps) {
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

  // Group "All Books" by era, sort within era by title
  const groupedOther = useMemo(() => {
    const groups: Record<Era, Book[]> = {
      ancient: [],
      medieval: [],
      modern: [],
      contemporary: [],
    }
    for (const b of otherBooks) {
      groups[eraOf(b.year)].push(b)
    }
    for (const era of ERA_ORDER) {
      groups[era].sort((a, b) => a.title.localeCompare(b.title))
    }
    return groups
  }, [otherBooks])

  // Handler: tapping a book always opens it. No intermediate BookDetail page —
  // the new 3-step BookOnboarding carousel handles edition/angle/cast picking.
  const handlePick = (book: Book) => {
    if (!libraryIds.includes(book.id)) onAddBook(book.id)
    onSelectBook(book.id)
  }

  const handleRemove = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onRemoveBook) return
    if (window.confirm(`Remove "${book.title}" from your library? Your reading position will be reset — highlights, notes, and chats are kept.`)) {
      onRemoveBook(book.id)
    }
  }

  const renderBook = (book: Book, showLang: boolean, inLibrary: boolean) => {
    const progress = getReadingProgress(book.id)
    const finished = isFinished(progress)
    const hasProgress = !!progress && (progress.percent > 0 || (progress.positionPercent ?? 0) > 0)
    const pct = progress?.positionPercent ?? progress?.percent ?? 0
    return (
      <div
        key={book.id}
        className={`store-book ${finished ? 'store-book-finished' : ''}`}
        onClick={() => handlePick(book)}
      >
        {inLibrary && onRemoveBook && (
          <button
            className="store-book-remove"
            onClick={(e) => handleRemove(book, e)}
            aria-label={`Remove ${book.title} from library`}
            title="Remove from library"
          >
            &times;
          </button>
        )}
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

  const anyOther = ERA_ORDER.some(era => groupedOther[era].length > 0)

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

        {myBooks.length === 0 && !anyOther && (
          <p className="store-empty">No books match &ldquo;{query}&rdquo;.</p>
        )}

        {myBooks.length > 0 && (
          <>
            <h2 className="store-section-title">My Library</h2>
            <div className="store-grid">
              {myBooks.map(b => renderBook(b, false, true))}
            </div>
          </>
        )}

        {ERA_ORDER.map(era => (
          groupedOther[era].length > 0 && (
            <section key={era} className="store-era">
              <h2 className="store-section-title">{ERA_LABELS[era]}</h2>
              <div className="store-grid">
                {groupedOther[era].map(b => renderBook(b, true, false))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  )
}
