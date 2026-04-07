import { useState, useRef, useEffect } from 'react'
import type { Note, Highlight, ChatConversation, BookReadingLog, ChapterReadingRecord } from '../types'

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

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return '<1 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
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

type FilterType = 'all' | 'highlights' | 'notes' | 'chats'

type TimelineItem =
  | { type: 'highlight'; data: Highlight; para: number; timestamp: number }
  | { type: 'note'; data: Note; para: number; timestamp: number }
  | { type: 'chat'; data: ChatConversation; para: number; timestamp: number }

interface FeedProps {
  readingLog: BookReadingLog
  totalChapters: number
  currentChapter: number
  chapterLabels: string[]
  notes: Note[]
  highlights: Highlight[]
  allBookHighlights: Highlight[]
  allBookNotes: Note[]
  chatConversations: ChatConversation[]
  onAddNote: (content: string, sourceType?: Note['sourceType'], sourceId?: string) => void
  onDeleteNote: (id: string) => void
  onDeleteHighlight?: (id: string) => void
  onUpdateNote: (id: string, content: string) => void
  onNavigateToChapter: (chapter: number, paragraphIndex?: number, editionKey?: string) => void
  onSummarizeChat?: (convId: string) => void
  summarizingId?: string | null
}

function chapterArtifactCount(
  ch: number,
  currentChapter: number,
  highlights: Highlight[],
  allBookHighlights: Highlight[],
  notes: Note[],
  allBookNotes: Note[],
  chatConversations: ChatConversation[],
  filter: FilterType,
): number {
  let count = 0
  if (filter === 'all' || filter === 'highlights') {
    const hls = ch === currentChapter ? highlights : allBookHighlights.filter(h => h.chapterNumber === ch)
    count += hls.length
  }
  if (filter === 'all' || filter === 'notes') {
    const ns = ch === currentChapter ? notes : allBookNotes.filter(n => n.chapterNumber === ch)
    count += ns.length
  }
  if (filter === 'all' || filter === 'chats') {
    count += chatConversations.filter(c => c.chapterNumber === ch).length
  }
  return count
}

export function Feed({
  readingLog, totalChapters, currentChapter, chapterLabels,
  notes, highlights, allBookHighlights, allBookNotes, chatConversations,
  onAddNote, onDeleteNote, onDeleteHighlight, onUpdateNote,
  onNavigateToChapter, onSummarizeChat, summarizingId,
}: FeedProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([currentChapter]))
  const [expandedConvs, setExpandedConvs] = useState<Set<string>>(new Set())
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [newNote, setNewNote] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const currentRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    setExpanded(prev => {
      if (prev.has(currentChapter)) return prev
      return new Set([...prev, currentChapter])
    })
  }, [currentChapter])

  const toggleChapter = (ch: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch)
      else next.add(ch)
      return next
    })
  }

  const toggleConv = (id: string) => {
    setExpandedConvs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      onUpdateNote(editingNoteId, editContent.trim())
    }
    setEditingNoteId(null)
    setEditContent('')
  }

  function getChapterItems(chapterNum: number): TimelineItem[] {
    const items: TimelineItem[] = []
    if (filter === 'all' || filter === 'highlights') {
      const chapterHighlights = chapterNum === currentChapter
        ? highlights
        : allBookHighlights.filter(h => h.chapterNumber === chapterNum)
      for (const hl of chapterHighlights) {
        items.push({ type: 'highlight', data: hl, para: hl.paragraphIndex, timestamp: hl.timestamp })
      }
    }
    if (filter === 'all' || filter === 'notes') {
      const chapterNotes = chapterNum === currentChapter
        ? notes
        : allBookNotes.filter(n => n.chapterNumber === chapterNum)
      for (const note of chapterNotes) {
        items.push({ type: 'note', data: note, para: 0, timestamp: note.timestamp })
      }
    }
    if (filter === 'all' || filter === 'chats') {
      for (const conv of chatConversations) {
        if (conv.chapterNumber === chapterNum) {
          items.push({ type: 'chat', data: conv, para: conv.paragraphIndex ?? 0, timestamp: conv.startTimestamp })
        }
      }
    }
    items.sort((a, b) => a.para - b.para || a.timestamp - b.timestamp)
    return items
  }

  function renderChapterDetail(record: ChapterReadingRecord) {
    const progress = record.completed ? 100
      : (record.lastParagraphIndex !== undefined && record.totalParagraphs)
        ? Math.round(((record.lastParagraphIndex + 1) / record.totalParagraphs) * 100)
        : undefined

    const usage = record.editionUsage
    const pages = record.totalParagraphs
      ? `~${Math.ceil(record.totalParagraphs / 10)} pages`
      : undefined

    // Colors for edition+mode segments
    const SEGMENT_COLORS: Record<string, string> = {
      'read:original-en': 'var(--accent)',
      'read:modern-en': '#5b8a72',
      'read:modern-da': '#6b7ea8',
      'read:kjv-en': '#a0845b',
      'read:web-en': '#7a6b8a',
      'listened:original-en': '#c9a45c',
      'listened:modern-en': '#82b89a',
      'listened:modern-da': '#8b9ec8',
      'listened:kjv-en': '#c0a47b',
      'listened:web-en': '#9a8baa',
    }

    function segmentColor(mode: string, key: string): string {
      return SEGMENT_COLORS[`${mode}:${key}`] || (mode === 'listened' ? '#a08850' : 'var(--accent)')
    }

    return (
      <div className="feed-detail-block">
        {/* Progress bar with edition+mode segments */}
        {usage && usage.length > 0 && (
          <div className="feed-progress-bar-container">
            <div className="feed-progress-bar">
              {usage.map((u, i) => (
                <div
                  key={`${u.key}-${u.mode}-${i}`}
                  className="feed-progress-segment"
                  style={{
                    width: `${u.percent || 0}%`,
                    background: segmentColor(u.mode, u.key),
                    opacity: u.mode === 'listened' ? 0.7 : 1,
                  }}
                  title={`${u.mode === 'listened' ? '🎧 Listened' : '📖 Read'}: ${editionLabel(u.key)} — ${u.percent || 0}%`}
                />
              ))}
            </div>
            <div className="feed-progress-legend">
              {usage.map((u, i) => (
                <span key={`leg-${u.key}-${u.mode}-${i}`} className="feed-legend-item">
                  <span
                    className="feed-legend-dot"
                    style={{
                      background: segmentColor(u.mode, u.key),
                      opacity: u.mode === 'listened' ? 0.7 : 1,
                    }}
                  />
                  {u.mode === 'listened' ? '🎧' : '📖'} {editionLabel(u.key)} {u.percent ? `${u.percent}%` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="feed-detail">
          {progress !== undefined && (
            <span className="feed-detail-item">{progress}% read</span>
          )}
          {pages && <span className="feed-detail-item">{pages}</span>}
          {record.timeSpentSeconds && record.timeSpentSeconds > 0 && (
            <span className="feed-detail-item">{formatDuration(record.timeSpentSeconds)}</span>
          )}
          {!usage && record.editions.length > 0 && (
            <span className="feed-detail-editions">
              {record.editions.map(ed => (
                <span key={ed} className="feed-edition-badge">{editionLabel(ed)}</span>
              ))}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="feed">
      {/* Filter bar */}
      <div className="feed-filters">
        {(['all', 'highlights', 'notes', 'chats'] as const).map(f => (
          <button
            key={f}
            className={`feed-filter-btn ${filter === f ? 'feed-filter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'highlights' ? 'Highlights' : f === 'notes' ? 'Notes' : 'Chats'}
          </button>
        ))}
      </div>

      <div className="feed-chapters">
        {Array.from({ length: totalChapters }, (_, i) => {
          const ch = i + 1
          const record = readingLog.chapters[ch]
          const isCurrent = ch === currentChapter
          const isExpanded = expanded.has(ch)
          const isUnread = !record
          const title = chapterLabels[i] || `Chapter ${ch}`
          const artifactCount = chapterArtifactCount(ch, currentChapter, highlights, allBookHighlights, notes, allBookNotes, chatConversations, filter)
          const items = isExpanded && !isUnread ? getChapterItems(ch) : []

          return (
            <div
              key={ch}
              ref={isCurrent ? currentRef : undefined}
              className={`feed-row ${isCurrent ? 'feed-row--current' : ''} ${isUnread ? 'feed-row--unread' : ''} ${isExpanded && !isUnread ? 'feed-row--expanded' : ''}`}
            >
              <button
                className="feed-row-header"
                onClick={() => {
                  if (isUnread) return
                  toggleChapter(ch)
                }}
              >
                <span className="feed-row-check">
                  {record?.completed ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : isCurrent ? (
                    <span className="feed-row-dot" />
                  ) : null}
                </span>
                <span className="feed-row-title">{title}</span>
                {isCurrent && <span className="feed-current-badge">Now</span>}
                {!isCurrent && !isUnread && record?.lastParagraphIndex !== undefined && !record?.completed && (
                  <button
                    className="feed-resume"
                    onClick={(e) => { e.stopPropagation(); onNavigateToChapter(ch, record.lastParagraphIndex) }}
                  >
                    Resume
                  </button>
                )}
                {artifactCount > 0 && (
                  <span className="feed-artifact-count">{artifactCount}</span>
                )}
              </button>

              {isExpanded && !isUnread && (
                <div className="feed-expanded">
                  {record && renderChapterDetail(record)}

                  {items.length > 0 && (
                    <div className="feed-items">
                      {items.map(item => {
                        if (item.type === 'highlight') {
                          const hl = item.data
                          return (
                            <div
                              key={`hl-${hl.id}`}
                              className="timeline-item timeline-highlight"
                              onClick={() => onNavigateToChapter(hl.chapterNumber, hl.paragraphIndex, hl.editionKey)}
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
                                >&times;</button>
                              )}
                            </div>
                          )
                        }

                        if (item.type === 'note') {
                          const note = item.data
                          const isEditing = editingNoteId === note.id
                          return (
                            <div key={`note-${note.id}`} className="timeline-item timeline-note">
                              <div className="timeline-icon timeline-icon-note">&#9998;</div>
                              <div className="timeline-body">
                                <div className="note-entry-header">
                                  <span className="note-source">
                                    {note.sourceType === 'from-chat' ? 'From chat' :
                                     note.sourceType === 'from-highlight' ? 'From highlight' : ''}
                                  </span>
                                  <span className="timeline-time">{formatDate(note.timestamp)} {formatTime(note.timestamp)}</span>
                                  <button className="note-edit" onClick={() => isEditing ? saveEdit() : startEdit(note)}>
                                    {isEditing ? 'Save' : '\u270E'}
                                  </button>
                                  <button className="note-delete" onClick={() => onDeleteNote(note.id)}>&times;</button>
                                </div>
                                {isEditing ? (
                                  <textarea
                                    className="feed-edit-input"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Escape') { setEditingNoteId(null) } else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() } }}
                                    autoFocus
                                    rows={Math.max(5, editContent.split('\n').length + 1)}
                                  />
                                ) : (
                                  <div className="note-content">{renderMarkdown(note.content)}</div>
                                )}
                              </div>
                            </div>
                          )
                        }

                        if (item.type === 'chat') {
                          const conv = item.data
                          const isConvExpanded = expandedConvs.has(conv.id)
                          const msgCount = conv.messages.length
                          const isSummarizing = summarizingId === conv.id
                          return (
                            <div key={`chat-${conv.id}`} className="timeline-item timeline-chat">
                              <div className="timeline-icon timeline-icon-chat">&#128172;</div>
                              <div className="timeline-body">
                                <button className="timeline-chat-header" onClick={() => toggleConv(conv.id)}>
                                  <span className="timeline-chat-preview">
                                    {conv.summary
                                      ? conv.summary.slice(0, 80) + (conv.summary.length > 80 ? '...' : '')
                                      : conv.preview || 'Chat conversation'}
                                  </span>
                                  <span className="timeline-chat-meta">
                                    {msgCount} msg{msgCount !== 1 ? 's' : ''} &middot; {formatDate(conv.startTimestamp)} {formatTime(conv.startTimestamp)}
                                  </span>
                                  <span className="timeline-expand">{isConvExpanded ? '\u25B2' : '\u25BC'}</span>
                                </button>
                                {isConvExpanded && (
                                  <div className="timeline-chat-messages">
                                    {conv.summary ? (
                                      <div className="timeline-chat-summary">{renderMarkdown(conv.summary)}</div>
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
                                      <button className="timeline-chat-navigate" onClick={() => onNavigateToChapter(conv.chapterNumber, conv.paragraphIndex)}>
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
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Note input */}
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
        <button className="notes-save" onClick={handleAddNote} disabled={!newNote.trim()}>
          Save
        </button>
      </div>
    </div>
  )
}
