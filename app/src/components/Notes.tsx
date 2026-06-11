import { useState, useRef } from 'react'
import type { Note, Highlight, ChatConversation } from '../types'
import { HIGHLIGHT_COLORS } from '../types'

type FilterType = 'all' | 'highlights' | 'notes' | 'chats'

/** Render inline markdown: **bold**, *italic* */
function renderInline(text: string): React.ReactNode {
  if (!text.includes('*')) return text
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[2]) parts.push(<strong key={key++}>{match[2]}</strong>)
    else if (match[3]) parts.push(<em key={key++}>{match[3]}</em>)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
}

/** Render markdown: headings, lists, paragraphs */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = renderInline(headingMatch[2])
      if (level === 1) elements.push(<h4 key={key++} className="chat-md-h1">{content}</h4>)
      else if (level === 2) elements.push(<h5 key={key++} className="chat-md-h2">{content}</h5>)
      else elements.push(<h6 key={key++} className="chat-md-h3">{content}</h6>)
      i++; continue
    }
    if (line.match(/^\s*[-*]\s+/)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        items.push(<li key={key++}>{renderInline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>)
        i++
      }
      elements.push(<ul key={key++} className="chat-md-list">{items}</ul>)
      continue
    }
    if (line.match(/^\s*\d+[.)]\s+/)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\s*\d+[.)]\s+/)) {
        items.push(<li key={key++}>{renderInline(lines[i].replace(/^\s*\d+[.)]\s+/, ''))}</li>)
        i++
      }
      elements.push(<ol key={key++} className="chat-md-list">{items}</ol>)
      continue
    }
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^#{1,3}\s/) && !lines[i].match(/^\s*[-*]\s+/) && !lines[i].match(/^\s*\d+[.)]\s+/)) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      elements.push(<p key={key++} style={{ marginBottom: '0.5em' }}>{renderInline(paraLines.join(' '))}</p>)
    }
  }
  return elements
}

interface NotesProps {
  notes: Note[]
  highlights: Highlight[]
  onAddNote: (content: string, sourceType?: Note['sourceType'], sourceId?: string) => void
  onDeleteNote: (id: string) => void
  onDeleteHighlight?: (id: string) => void
  onUpdateNote: (id: string, content: string) => void
  onCleanupNotes: (aggressive: boolean) => void
  onScrollToHighlight?: (paragraphIndex: number) => void
  isCleaningUp?: boolean
  allBookHighlights?: Highlight[]
  chapterLabels?: string[]
  currentChapter?: number
  onNavigateToChapter?: (chapter: number, paragraphIndex?: number, editionKey?: string) => void
  chatConversations?: ChatConversation[]
  onSummarizeChat?: (convId: string) => void
  summarizingId?: string | null
}

export function Notes({
  notes,
  highlights,
  onAddNote,
  onDeleteNote,
  onDeleteHighlight,
  onUpdateNote,
  onCleanupNotes,
  onScrollToHighlight,
  isCleaningUp,
  allBookHighlights = [],
  chapterLabels = [],
  currentChapter,
  onNavigateToChapter,
  chatConversations = [],
  onSummarizeChat,
  summarizingId,
}: NotesProps) {
  const [newNote, setNewNote] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedConvs, setExpandedConvs] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAddNote = () => {
    const content = newNote.trim()
    if (!content) return
    onAddNote(content)
    setNewNote('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
  }

  const toggleConv = (id: string) => {
    setExpandedConvs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Build items per chapter, sorted by paragraph position
  type TimelineItem =
    | { type: 'highlight'; data: Highlight; chapter: number; para: number; timestamp: number }
    | { type: 'note'; data: Note; chapter: number; para: number; timestamp: number }
    | { type: 'chat'; data: ChatConversation; chapter: number; para: number; timestamp: number }

  const allItems: TimelineItem[] = []

  if (filter === 'all' || filter === 'highlights') {
    for (const hl of highlights) {
      allItems.push({ type: 'highlight', data: hl, chapter: hl.chapterNumber, para: hl.paragraphIndex, timestamp: hl.timestamp })
    }
    for (const hl of allBookHighlights) {
      if (hl.chapterNumber !== currentChapter) {
        allItems.push({ type: 'highlight', data: hl, chapter: hl.chapterNumber, para: hl.paragraphIndex, timestamp: hl.timestamp })
      }
    }
  }

  if (filter === 'all' || filter === 'notes') {
    for (const note of notes) {
      allItems.push({ type: 'note', data: note, chapter: note.chapterNumber, para: note.paragraphIndex ?? 0, timestamp: note.timestamp })
    }
  }

  if (filter === 'all' || filter === 'chats') {
    for (const conv of chatConversations) {
      allItems.push({ type: 'chat', data: conv, chapter: conv.chapterNumber, para: conv.paragraphIndex ?? 0, timestamp: conv.startTimestamp })
    }
  }

  // Group by chapter
  const byChapter = new Map<number, TimelineItem[]>()
  for (const item of allItems) {
    const existing = byChapter.get(item.chapter) || []
    existing.push(item)
    byChapter.set(item.chapter, existing)
  }

  // Sort chapters: current chapter first, then ascending
  const chapters = Array.from(byChapter.keys()).sort((a, b) => {
    if (a === currentChapter) return -1
    if (b === currentChapter) return 1
    return a - b
  })

  // Within each chapter, sort by paragraph position, then by timestamp
  for (const items of byChapter.values()) {
    items.sort((a, b) => a.para - b.para || a.timestamp - b.timestamp)
  }

  const highlightCount = highlights.length + allBookHighlights.filter(h => h.chapterNumber !== currentChapter).length
  const chatCount = chatConversations.length

  return (
    <div className="notes">
      <div className="notes-header">
        <h3>Notes</h3>
      </div>

      {/* Filter chips */}
      <div className="notes-filters">
        <button
          className={`notes-filter-chip ${filter === 'all' ? 'notes-filter-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`notes-filter-chip ${filter === 'highlights' ? 'notes-filter-active' : ''}`}
          onClick={() => setFilter('highlights')}
        >
          Highlights{highlightCount > 0 && <span className="notes-filter-count">{highlightCount}</span>}
        </button>
        <button
          className={`notes-filter-chip ${filter === 'notes' ? 'notes-filter-active' : ''}`}
          onClick={() => setFilter('notes')}
        >
          Notes{notes.length > 0 && <span className="notes-filter-count">{notes.length}</span>}
        </button>
        <button
          className={`notes-filter-chip ${filter === 'chats' ? 'notes-filter-active' : ''}`}
          onClick={() => setFilter('chats')}
        >
          Chats{chatCount > 0 && <span className="notes-filter-count">{chatCount}</span>}
        </button>
      </div>

      <div className="notes-content">
        {chapters.length === 0 && (
          <div className="notes-empty">
            <p className="notes-empty-title">
              {filter === 'all' ? 'No notes yet' :
               filter === 'highlights' ? 'No highlights yet' :
               filter === 'notes' ? 'No notes yet' :
               'No chat conversations yet'}
            </p>
            <p className="notes-empty-hint">
              {filter === 'chats'
                ? 'Start a conversation in the Chat tab. Your discussions will appear here.'
                : 'Highlight text in the reader to start annotating, or write a note below.'}
            </p>
          </div>
        )}

        {chapters.map(chapterNum => {
          const items = byChapter.get(chapterNum)!
          const isCurrent = chapterNum === currentChapter
          return (
            <div key={chapterNum} className="chapter-group">
              <button
                className={`chapter-group-header ${isCurrent ? 'chapter-group-current' : ''}`}
                onClick={() => !isCurrent && onNavigateToChapter?.(chapterNum)}
              >
                {chapterLabels[chapterNum - 1] || `Chapter ${chapterNum}`}
                {isCurrent && <span className="chapter-group-badge">Current</span>}
                <span className="chapter-group-count">{items.length}</span>
              </button>

              <div className="chapter-group-items">
                {items.map(item => {
                  if (item.type === 'highlight') {
                    const hl = item.data
                    return (
                      <div
                        key={`hl-${hl.id}`}
                        className="timeline-item timeline-highlight"
                        onClick={() => onNavigateToChapter
                          ? onNavigateToChapter(hl.chapterNumber, hl.paragraphIndex, hl.editionKey)
                          : onScrollToHighlight?.(hl.paragraphIndex)}
                      >
                        <div className="timeline-icon">
                          <div className={`highlight-dot highlight-${hl.color}`} />
                        </div>
                        <div className="timeline-body">
                          <p className="highlight-text">
                            &ldquo;{hl.text.length > 100 ? hl.text.slice(0, 100) + '...' : hl.text}&rdquo;
                          </p>
                          {hl.note && <p className="highlight-note">{hl.note}</p>}
                        </div>
                        {onDeleteHighlight && (
                          <button
                            className="note-delete"
                            onClick={(e) => { e.stopPropagation(); onDeleteHighlight(hl.id) }}
                            title="Delete highlight"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    )
                  }

                  if (item.type === 'note') {
                    const note = item.data
                    return (
                      <div
                        key={`note-${note.id}`}
                        className={`timeline-item timeline-note ${note.paragraphIndex !== undefined ? 'timeline-clickable' : ''}`}
                        onClick={() => {
                          if (note.paragraphIndex !== undefined) onNavigateToChapter?.(note.chapterNumber, note.paragraphIndex, note.editionKey)
                        }}
                      >
                        <div className="timeline-icon timeline-icon-note">&#9998;</div>
                        <div className="timeline-body">
                          <div className="note-entry-header">
                            <span className="note-source">
                              {note.sourceType === 'from-chat' ? 'From chat' :
                               note.sourceType === 'from-highlight' ? 'From highlight' : ''}
                            </span>
                            <span className="timeline-time">{formatDate(note.timestamp)} {formatTime(note.timestamp)}</span>
                            <button
                              className="note-delete"
                              onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id) }}
                              title="Delete note"
                            >
                              &times;
                            </button>
                          </div>
                          {note.quote && <p className="highlight-text">&ldquo;{note.quote.length > 100 ? note.quote.slice(0, 100) + '...' : note.quote}&rdquo;</p>}
                          <div className="note-content">{renderMarkdown(note.content)}</div>
                        </div>
                      </div>
                    )
                  }

                  if (item.type === 'chat') {
                    const conv = item.data
                    const isExpanded = expandedConvs.has(conv.id)
                    const msgCount = conv.messages.length
                    const isSummarizing = summarizingId === conv.id
                    return (
                      <div key={`chat-${conv.id}`} className="timeline-item timeline-chat">
                        <div className="timeline-icon timeline-icon-chat">&#128172;</div>
                        <div className="timeline-body">
                          <button
                            className="timeline-chat-header"
                            onClick={() => toggleConv(conv.id)}
                          >
                            <span className="timeline-chat-preview">
                              {conv.summary
                                ? conv.summary.slice(0, 80) + (conv.summary.length > 80 ? '...' : '')
                                : conv.preview || 'Chat conversation'}
                            </span>
                            <span className="timeline-chat-meta">
                              {msgCount} msg{msgCount !== 1 ? 's' : ''} &middot; {formatDate(conv.startTimestamp)} {formatTime(conv.startTimestamp)}
                              {conv.summary && ' \u2022 Summarized'}
                            </span>
                            <span className="timeline-expand">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                          </button>
                          {isExpanded && (
                            <div className="timeline-chat-messages">
                              {conv.summary ? (
                                <>
                                  <div className="timeline-chat-summary">
                                    {renderMarkdown(conv.summary)}
                                  </div>
                                  {conv.summaryPrompt && (
                                    <details className="timeline-chat-summary-source">
                                      <summary>Prompt used</summary>
                                      <pre>{conv.summaryPrompt}</pre>
                                    </details>
                                  )}
                                </>
                              ) : (
                                conv.messages.map(msg => (
                                  <div key={msg.id} className={`timeline-chat-msg timeline-chat-${msg.role}`}>
                                    <span className="timeline-chat-role">{msg.role === 'user' ? 'You' : 'Tinct'}</span>
                                    <div className="timeline-chat-content">
                                      {msg.highlightedText && (
                                        <blockquote className="timeline-chat-quote">&ldquo;{msg.highlightedText}&rdquo;</blockquote>
                                      )}
                                      {renderMarkdown(msg.content)}
                                    </div>
                                  </div>
                                ))
                              )}
                              <div className="timeline-chat-actions">
                                <button
                                  className="timeline-chat-navigate"
                                  onClick={() => onNavigateToChapter?.(conv.chapterNumber, conv.paragraphIndex)}
                                >
                                  Go to passage
                                </button>
                                {!conv.summary && onSummarizeChat && msgCount >= 4 && (
                                  <button
                                    className="timeline-chat-summarize"
                                    onClick={() => onSummarizeChat(conv.id)}
                                    disabled={isSummarizing}
                                  >
                                    {isSummarizing ? 'Summarizing...' : 'Clean the clutter'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Cleanup for freeform notes */}
      {notes.length > 0 && (
        <div className="notes-cleanup">
          <button
            className="cleanup-button"
            onClick={() => onCleanupNotes(false)}
            disabled={isCleaningUp}
          >
            Light cleanup
          </button>
          <button
            className="cleanup-button cleanup-aggressive"
            onClick={() => onCleanupNotes(true)}
            disabled={isCleaningUp}
          >
            Deep cleanup
          </button>
        </div>
      )}

      {/* New note input */}
      <div className="notes-input-area">
        <textarea
          ref={textareaRef}
          className="notes-input"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a note... (Enter to save)"
          rows={2}
        />
        <button
          className="notes-save"
          onClick={handleAddNote}
          disabled={!newNote.trim()}
        >
          Save
        </button>
      </div>
    </div>
  )
}
