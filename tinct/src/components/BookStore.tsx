import type { Book } from '../types'

interface BookStoreProps {
  books: Book[]
  libraryIds: string[]
  onAddBook: (bookId: string) => void
  onSelectBook: (bookId: string) => void
}

export function BookStore({ books, libraryIds, onAddBook, onSelectBook }: BookStoreProps) {
  const inLibrary = (id: string) => libraryIds.includes(id)

  return (
    <div className="store">
      <div className="store-inner">
        <div className="store-header">
          <h1 className="store-title">Tinct</h1>
          <p className="store-subtitle">Choose a book to begin reading</p>
        </div>

        <div className="store-grid">
          {books.map(book => (
            <div key={book.id} className="store-card">
              <div className="store-card-spine" />
              <div className="store-card-content">
                <h2 className="store-card-title">{book.title}</h2>
                <p className="store-card-author">{book.author}</p>
                {book.year && (
                  <p className="store-card-year">
                    {book.year < 0 ? `c. ${Math.abs(book.year)} BC` : book.year}
                  </p>
                )}
                <p className="store-card-description">{book.description}</p>

                <div className="store-card-meta">
                  <span className="store-card-editions">
                    {book.editions.length} editions
                  </span>
                  <span className="store-card-languages">
                    EN / DA
                  </span>
                </div>

                <div className="store-card-price">Free</div>

                {inLibrary(book.id) ? (
                  <button
                    className="store-card-button store-card-button-read"
                    onClick={() => onSelectBook(book.id)}
                  >
                    Continue reading
                  </button>
                ) : (
                  <button
                    className="store-card-button"
                    onClick={() => {
                      onAddBook(book.id)
                      onSelectBook(book.id)
                    }}
                  >
                    Add to library
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {libraryIds.length > 0 && (
          <p className="store-footer">
            {libraryIds.length} {libraryIds.length === 1 ? 'book' : 'books'} in your library
          </p>
        )}
      </div>
    </div>
  )
}
