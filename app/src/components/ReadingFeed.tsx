import type { Book, BookReadingLog, ChapterReadingRecord } from '../types'

interface ReadingFeedProps {
  book: Book
  log: BookReadingLog
  currentChapter: number
  totalChapters: number
  chapterTitles?: string[]
  onNavigateToChapter?: (chapter: number) => void
}

function timeAgo(ms: number): string {
  if (ms === 0) return ''
  const seconds = Math.floor((Date.now() - ms) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function editionLabel(key: string): string {
  const labels: Record<string, string> = {
    'original-en': 'Original',
    'modern-en': 'Modern EN',
    'modern-da': 'Moderne DK',
    'kjv-en': 'KJV',
    'web-en': 'WEB',
  }
  return labels[key] || key
}

function ChapterNode({ record, chapterNumber, title, isCurrent, onNavigate }: {
  record?: ChapterReadingRecord
  chapterNumber: number
  title: string
  isCurrent: boolean
  onNavigate?: () => void
}) {
  const status = isCurrent ? 'current' : record?.completed ? 'completed' : record ? 'read' : 'unread'

  return (
    <div
      className={`feed-chapter feed-chapter--${status}`}
      onClick={onNavigate}
      role={onNavigate ? 'button' : undefined}
      tabIndex={onNavigate ? 0 : undefined}
    >
      <div className="feed-node-col">
        <div className={`feed-node feed-node--${status}`}>
          {status === 'completed' && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
      <div className="feed-info">
        <span className="feed-title">{title}</span>
        {record && (
          <div className="feed-meta">
            {record.editions.map(ed => (
              <span key={ed} className="feed-edition-badge">{editionLabel(ed)}</span>
            ))}
            {record.lastParagraphIndex !== undefined && record.totalParagraphs && !record.completed && (
              <span className="feed-progress-text">
                {Math.round((record.lastParagraphIndex / record.totalParagraphs) * 100)}%
              </span>
            )}
            {record.readCount > 1 && (
              <span className="feed-read-count">{record.readCount}x</span>
            )}
            {record.lastReadAt > 0 && (
              <span className="feed-time">{timeAgo(record.lastReadAt)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ReadingFeed({ book, log, currentChapter, totalChapters, chapterTitles, onNavigateToChapter }: ReadingFeedProps) {
  const chaptersRead = Object.keys(log.chapters).length
  const chaptersCompleted = Object.values(log.chapters).filter(r => r.completed).length

  return (
    <div className="reading-feed">
      <h3 className="book-detail-section-title">Reading Feed</h3>
      <p className="feed-summary">
        {chaptersRead === 0
          ? 'No chapters read yet'
          : `${chaptersCompleted} of ${totalChapters} chapters completed`}
      </p>
      <div className="feed-timeline">
        {Array.from({ length: totalChapters }, (_, i) => {
          const ch = i + 1
          const record = log.chapters[ch]
          const title = chapterTitles?.[i] || `Chapter ${ch}`
          return (
            <ChapterNode
              key={ch}
              record={record}
              chapterNumber={ch}
              title={title}
              isCurrent={ch === currentChapter}
              onNavigate={onNavigateToChapter ? () => onNavigateToChapter(ch) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
