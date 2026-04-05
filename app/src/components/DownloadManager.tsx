import type { Book } from '../types'

interface OfflineBookInfo {
  bookId: string
  editions: string[]
  audioChapters: number[]
  hasThreads: boolean
}

interface DownloadState {
  bookId: string
  label: string
  percent: number
  downloading: boolean
}

interface DownloadManagerProps {
  books: Book[]
  offlineMeta: Record<string, OfflineBookInfo>
  downloadState: DownloadState | null
  storageMB: number
  isOnline: boolean
  onDownloadBook: (book: Book) => void
  onDownloadChapter: (book: Book, chapter: number) => void
  onRemove: (bookId: string) => void
  onCancel: () => void
  onClose: () => void
}

export function DownloadManager({
  books, offlineMeta, downloadState, storageMB, isOnline,
  onDownloadBook, onDownloadChapter, onRemove, onCancel, onClose,
}: DownloadManagerProps) {
  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="download-card" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">&times;</button>

        <h2 className="auth-title">Offline Reading</h2>

        {!isOnline && (
          <div className="download-offline-notice">
            You're offline. Downloaded books are available below.
          </div>
        )}

        {/* Active download */}
        {downloadState?.downloading && (
          <div className="download-active">
            <div className="download-active-label">{downloadState.label}</div>
            <div className="usage-progress-bar">
              <div className="usage-progress-fill" style={{ width: `${downloadState.percent}%` }} />
            </div>
            <button className="download-cancel" onClick={onCancel}>Cancel</button>
          </div>
        )}

        {/* Book list */}
        <div className="download-list">
          {books.map(book => {
            const info = offlineMeta[book.id]
            const isDownloaded = !!info?.editions.length
            const hasAudio = book.editions.some(ed => ed.hasAudio)
            const audioCount = info?.audioChapters.length || 0
            const isDownloading = downloadState?.bookId === book.id && downloadState.downloading

            return (
              <div key={book.id} className={`download-item ${isDownloaded ? 'download-item-cached' : ''}`}>
                <div className="download-item-info">
                  <span className="download-item-title">{book.title}</span>
                  <span className="download-item-meta">
                    {isDownloaded ? (
                      <>
                        {info.editions.length} edition{info.editions.length !== 1 ? 's' : ''}
                        {hasAudio && ` · ${audioCount} ch audio`}
                        {info.hasThreads && ' · Cast'}
                      </>
                    ) : (
                      <>{book.editions.length} edition{book.editions.length !== 1 ? 's' : ''}{hasAudio ? ' · Audio available' : ''}</>
                    )}
                  </span>
                </div>
                <div className="download-item-actions">
                  {isDownloading ? (
                    <span className="download-item-status">Downloading...</span>
                  ) : isDownloaded ? (
                    <button className="download-remove" onClick={() => onRemove(book.id)}>Remove</button>
                  ) : isOnline ? (
                    <button
                      className="download-btn"
                      onClick={() => onDownloadBook(book)}
                      disabled={!!downloadState?.downloading}
                    >
                      Download
                    </button>
                  ) : (
                    <span className="download-item-status">Not available</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Storage info */}
        <div className="download-storage">
          Using {storageMB < 1 ? '<1' : storageMB} MB of offline storage
        </div>
      </div>
    </div>
  )
}
