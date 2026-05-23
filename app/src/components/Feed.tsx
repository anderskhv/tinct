import { useState, useRef, useEffect, useMemo } from 'react'
import type { Note, Highlight, ChatConversation, BookReadingLog, ChapterReadingRecord, Section } from '../types'
import { formatRelative, formatAbsolute } from '../utils/formatRelative'

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

/**
 * Render a feed entry's metadata line:
 *   <created relative> · Read N× · last read <relative>
 *
 * Read-count + last-read piggyback on chapter-level data from useReadingLog
 * (read-count is incremented every time the reader navigates to the chapter).
 * They only render when count ≥ 2 — showing "Read 1×" alongside "created
 * yesterday" is just noise. "last read" only renders if it's meaningfully
 * after the entry was created (>1 min later) — otherwise it duplicates the
 * created date.
 */
function entryMeta(createdAt: number, record?: ChapterReadingRecord): React.ReactNode {
  const count = record?.readCount ?? 0
  const last = record?.lastReadAt ?? 0
  const showCount = count >= 2
  const showLast = last > createdAt + 60_000 && count >= 2
  return (
    <span className="timeline-meta">
      <span className="timeline-meta-created" title={formatAbsolute(createdAt)}>
        {formatRelative(createdAt)}
      </span>
      {showCount && (
        <>
          <span className="timeline-meta-sep">·</span>
          <span className="timeline-meta-count">Read {count}×</span>
        </>
      )}
      {showLast && (
        <>
          <span className="timeline-meta-sep">·</span>
          <span className="timeline-meta-last" title={formatAbsolute(last)}>
            last read {formatRelative(last)}
          </span>
        </>
      )}
    </span>
  )
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
  /** Hierarchical sections from edition data (e.g., Bible: Old Testament > Pentateuch > Genesis) */
  sections?: Section[]
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

/** Collect all chapter numbers from a section tree */
function collectChapters(section: Section): number[] {
  const chs: number[] = []
  if (section.chapters) chs.push(...section.chapters)
  if (section.sections) section.sections.forEach(s => chs.push(...collectChapters(s)))
  return chs
}

export function Feed({
  readingLog, totalChapters, currentChapter, chapterLabels, sections,
  notes, highlights, allBookHighlights, allBookNotes, chatConversations,
  onAddNote, onDeleteNote, onDeleteHighlight, onUpdateNote,
  onNavigateToChapter, onSummarizeChat, summarizingId,
}: FeedProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([currentChapter]))
  const [expandedConvs, setExpandedConvs] = useState<Set<string>>(new Set())
  // Track which sections are expanded (by title path, e.g. "Old Testament" or "Old Testament/The Pentateuch")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    if (!sections) return new Set()
    // Auto-expand sections containing the current chapter
    const expanded = new Set<string>()
    const findPath = (secs: Section[], prefix: string): boolean => {
      for (const sec of secs) {
        const path = prefix ? `${prefix}/${sec.title}` : sec.title
        const chs = collectChapters(sec)
        if (chs.includes(currentChapter)) {
          expanded.add(path)
          if (sec.sections) findPath(sec.sections, path)
          return true
        }
      }
      return false
    }
    findPath(sections, '')
    return expanded
  })
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

  const toggleSection = (path: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  // When current chapter changes, auto-expand its section
  useEffect(() => {
    if (!sections) return
    setExpandedSections(prev => {
      const next = new Set(prev)
      const findPath = (secs: Section[], prefix: string): boolean => {
        for (const sec of secs) {
          const path = prefix ? `${prefix}/${sec.title}` : sec.title
          const chs = collectChapters(sec)
          if (chs.includes(currentChapter)) {
            next.add(path)
            if (sec.sections) findPath(sec.sections, path)
            return true
          }
        }
        return false
      }
      findPath(sections, '')
      return next
    })
  }, [currentChapter, sections])

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
        items.push({ type: 'note', data: note, para: note.paragraphIndex ?? 0, timestamp: note.timestamp })
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

    // Overall progress = furthest point reached across all modes
    const overallPercent = usage && usage.length > 0
      ? Math.max(...usage.map(u => u.percent || 0))
      : progress

    return (
      <div className="feed-detail-block">
        {/* Single progress bar showing overall reach */}
        {overallPercent !== undefined && overallPercent > 0 && (
          <div className="feed-progress-bar-container">
            <div className="feed-progress-bar">
              <div
                className="feed-progress-segment"
                style={{ width: `${overallPercent}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        )}

        {/* Stats row — single percent, no read-vs-listened split (intentionally
            removed 2026-05-06: the breakdown was confusing more than informative.
            Future: maybe surface a per-book read/listen ratio for completed
            books, but not as the per-chapter primary stat). */}
        <div className="feed-detail">
          {overallPercent !== undefined && (
            <span className="feed-detail-item">{overallPercent}% through</span>
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
        {(() => {
          // Render a single chapter row
          const renderChapterRow = (ch: number) => {
            const record = readingLog.chapters[ch]
            const isCurrent = ch === currentChapter
            const isChExpanded = expanded.has(ch)
            const isUnread = !record
            const title = chapterLabels[ch - 1] || `Chapter ${ch}`
            const artifactCount = chapterArtifactCount(ch, currentChapter, highlights, allBookHighlights, notes, allBookNotes, chatConversations, filter)
            const items = isChExpanded && !isUnread ? getChapterItems(ch) : []

            return (
              <div
                key={ch}
                ref={isCurrent ? currentRef : undefined}
                className={`feed-row ${isCurrent ? 'feed-row--current' : ''} ${isUnread ? 'feed-row--unread' : ''} ${isChExpanded && !isUnread ? 'feed-row--expanded' : ''}`}
              >
                <button
                  className="feed-row-header"
                  onClick={() => { if (!isUnread) toggleChapter(ch) }}
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
                      title="Jump to where you left off in this chapter"
                    >
                      Resume
                    </button>
                  )}
                  {!isCurrent && (
                    <button
                      className="feed-go"
                      onClick={(e) => { e.stopPropagation(); onNavigateToChapter(ch) }}
                      title="Open this chapter in the reader"
                      aria-label={`Open ${title}`}
                    >
                      ↗
                    </button>
                  )}
                  {artifactCount > 0 && (
                    <span className="feed-artifact-count">{artifactCount}</span>
                  )}
                </button>

              {isChExpanded && !isUnread && (
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
                            >
                              <div className="timeline-icon">
                                <div className={`highlight-dot highlight-${hl.color}`} />
                              </div>
                              <div className="timeline-body">
                                <p className="highlight-text">
                                  &ldquo;{hl.text.length > 100 ? hl.text.slice(0, 100) + '...' : hl.text}&rdquo;
                                </p>
                                {hl.note && <p className="highlight-note">{hl.note}</p>}
                                {entryMeta(hl.timestamp, record)}
                              </div>
                              <button
                                className="timeline-go"
                                onClick={(e) => { e.stopPropagation(); onNavigateToChapter(hl.chapterNumber, hl.paragraphIndex, hl.editionKey) }}
                                title="Jump to this highlight in the reader"
                                aria-label="Open in reader"
                              >↗</button>
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
                            <div
                              key={`note-${note.id}`}
                              className={`timeline-item timeline-note ${note.paragraphIndex !== undefined ? 'timeline-clickable' : ''}`}
                              onClick={() => {
                                if (!isEditing && note.paragraphIndex !== undefined) {
                                  onNavigateToChapter(note.chapterNumber, note.paragraphIndex, note.editionKey)
                                }
                              }}
                            >
                              <div className="timeline-icon timeline-icon-note">&#9998;</div>
                              <div className="timeline-body">
                                <div className="note-entry-header">
                                  <span className="note-source">
                                    {note.sourceType === 'from-chat' ? 'From chat' :
                                     note.sourceType === 'from-highlight' ? 'From highlight' : ''}
                                  </span>
                                  {entryMeta(note.timestamp, record)}
                                  <button className="note-edit" onClick={(e) => { e.stopPropagation(); isEditing ? saveEdit() : startEdit(note) }}>
                                    {isEditing ? 'Save' : '\u270E'}
                                  </button>
                                  <button className="note-delete" onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id) }}>&times;</button>
                                </div>
                                {note.quote && <p className="highlight-text">&ldquo;{note.quote.length > 100 ? note.quote.slice(0, 100) + '...' : note.quote}&rdquo;</p>}
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
                                <div className="timeline-chat-header-row">
                                  <button className="timeline-chat-header" onClick={() => toggleConv(conv.id)}>
                                    <span className="timeline-chat-preview">
                                      {conv.summary
                                        ? conv.summary.slice(0, 80) + (conv.summary.length > 80 ? '...' : '')
                                        : conv.preview || 'Chat conversation'}
                                    </span>
                                    <span className="timeline-chat-meta">
                                      <span>{msgCount} msg{msgCount !== 1 ? 's' : ''}</span>
                                      <span className="timeline-meta-sep">&middot;</span>
                                      {entryMeta(conv.startTimestamp, record)}
                                    </span>
                                    <span className="timeline-expand">{isConvExpanded ? '\u25B2' : '\u25BC'}</span>
                                  </button>
                                  <button
                                    className="timeline-go"
                                    onClick={(e) => { e.stopPropagation(); onNavigateToChapter(conv.chapterNumber, conv.paragraphIndex) }}
                                    title="Jump to where this chat happened in the book"
                                    aria-label="Open in reader"
                                  >&#x2197;</button>
                                </div>
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
          }

          // Render a section group with its children
          const renderSection = (sec: Section, prefix: string, depth: number): React.ReactNode => {
            const path = prefix ? `${prefix}/${sec.title}` : sec.title
            const allChs = collectChapters(sec)
            const hasAnyRead = allChs.some(ch => readingLog.chapters[ch])
            const containsCurrent = allChs.includes(currentChapter)
            const isSectionExpanded = expandedSections.has(path)
            const readCount = allChs.filter(ch => readingLog.chapters[ch]?.completed).length

            return (
              <div key={path} className={`feed-section feed-section--depth-${depth} ${!hasAnyRead && !containsCurrent ? 'feed-section--unread' : ''}`}>
                <button
                  className={`feed-section-header ${isSectionExpanded ? 'feed-section-header--expanded' : ''}`}
                  onClick={() => toggleSection(path)}
                >
                  <span className="feed-section-chevron">{isSectionExpanded ? '\u25BE' : '\u25B8'}</span>
                  <span className="feed-section-title">{sec.title}</span>
                  {readCount > 0 && (
                    <span className="feed-section-progress">{readCount}/{allChs.length}</span>
                  )}
                </button>
                {isSectionExpanded && (
                  <div className="feed-section-children">
                    {sec.sections
                      ? sec.sections.map(child => renderSection(child, path, depth + 1))
                      : (sec.chapters || []).map(ch => renderChapterRow(ch))
                    }
                  </div>
                )}
              </div>
            )
          }

          // Render: sections if available, otherwise flat list
          if (sections && sections.length > 0) {
            return sections.map(sec => renderSection(sec, '', 0))
          }
          return Array.from({ length: totalChapters }, (_, i) => renderChapterRow(i + 1))
        })()}
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
