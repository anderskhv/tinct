import { useState, useRef } from 'react'
import type { Note, Highlight } from '../types'
import { HIGHLIGHT_COLORS } from '../types'

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
  onUpdateNote: (id: string, content: string) => void
  onCleanupNotes: (aggressive: boolean) => void
  onScrollToHighlight?: (paragraphIndex: number) => void
  isCleaningUp?: boolean
  // All-book highlights (merged from Highlights tab)
  allBookHighlights?: Highlight[]
  chapterLabels?: string[]
  currentChapter?: number
  onNavigateToChapter?: (chapter: number, paragraphIndex?: number, editionKey?: string) => void
}

export function Notes({
  notes,
  highlights,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  onCleanupNotes,
  onScrollToHighlight,
  isCleaningUp,
  allBookHighlights = [],
  chapterLabels = [],
  currentChapter,
  onNavigateToChapter,
}: NotesProps) {
  const [newNote, setNewNote] = useState('')
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

  // Group highlights by color
  const highlightsByColor = HIGHLIGHT_COLORS.map(c => ({
    ...c,
    highlights: highlights.filter(h => h.color === c.key),
  })).filter(g => g.highlights.length > 0)

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="notes">
      <div className="notes-header">
        <h3>Notes</h3>
      </div>

      <div className="notes-content">
        {/* Highlights section */}
        {highlightsByColor.length > 0 && (
          <div className="notes-section">
            <h4 className="notes-section-title">Highlights</h4>
            {highlightsByColor.map(group => (
              <div key={group.key} className="highlight-group">
                {group.highlights.map(hl => (
                  <div
                    key={hl.id}
                    className="highlight-entry"
                    onClick={() => onNavigateToChapter ? onNavigateToChapter(hl.chapterNumber, hl.paragraphIndex, hl.editionKey) : onScrollToHighlight?.(hl.paragraphIndex)}
                  >
                    <div className={`highlight-dot highlight-${hl.color}`} />
                    <div className="highlight-entry-content">
                      <p className="highlight-text">
                        &ldquo;{hl.text.length > 100 ? hl.text.slice(0, 100) + '...' : hl.text}&rdquo;
                      </p>
                      {hl.note && <p className="highlight-note">{hl.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Notes list */}
        {notes.length > 0 && (
          <div className="notes-section">
            <h4 className="notes-section-title">Your Notes</h4>
            {notes.map(note => (
              <div key={note.id} className="note-entry">
                <div className="note-entry-header">
                  <span className="note-source">
                    {note.sourceType === 'from-chat' ? 'From chat' :
                     note.sourceType === 'from-highlight' ? 'From highlight' : ''}
                  </span>
                  <span className="note-time">{formatTime(note.timestamp)}</span>
                  <button
                    className="note-delete"
                    onClick={() => onDeleteNote(note.id)}
                    title="Delete note"
                  >
                    &times;
                  </button>
                </div>
                <div className="note-content">{renderMarkdown(note.content)}</div>
              </div>
            ))}
          </div>
        )}

        {/* All-book highlights (other chapters) */}
        {(() => {
          const otherHighlights = allBookHighlights.filter(h => h.chapterNumber !== currentChapter)
          if (otherHighlights.length === 0) return null
          const byChapter = new Map<number, Highlight[]>()
          for (const hl of otherHighlights) {
            const existing = byChapter.get(hl.chapterNumber) || []
            existing.push(hl)
            byChapter.set(hl.chapterNumber, existing)
          }
          const chapters = Array.from(byChapter.entries()).sort((a, b) => a[0] - b[0])
          return (
            <div className="notes-section">
              <h4 className="notes-section-title">All Highlights</h4>
              {chapters.map(([chapterNum, chapterHighlights]) => (
                <div key={chapterNum} className="highlights-chapter-group" style={{ marginBottom: 12 }}>
                  <button
                    className="highlights-chapter-label"
                    onClick={() => onNavigateToChapter?.(chapterNum)}
                  >
                    {chapterLabels[chapterNum - 1] || `Chapter ${chapterNum}`}
                    <span className="highlights-chapter-count">{chapterHighlights.length}</span>
                  </button>
                  <div className="highlights-chapter-items">
                    {chapterHighlights
                      .sort((a, b) => a.paragraphIndex - b.paragraphIndex || a.startOffset - b.startOffset)
                      .map(hl => (
                        <div
                          key={hl.id}
                          className="highlight-entry"
                          onClick={() => onNavigateToChapter?.(hl.chapterNumber, hl.paragraphIndex, hl.editionKey)}
                        >
                          <div className={`highlight-dot highlight-${hl.color}`} />
                          <div className="highlight-entry-content">
                            <p className="highlight-text">
                              &ldquo;{hl.text.length > 120 ? hl.text.slice(0, 120) + '...' : hl.text}&rdquo;
                            </p>
                            {hl.note && <p className="highlight-note">{hl.note}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Empty state */}
        {highlightsByColor.length === 0 && notes.length === 0 && allBookHighlights.length === 0 && (
          <div className="notes-empty">
            <p className="notes-empty-title">No notes yet</p>
            <p className="notes-empty-hint">
              Highlight text in the reader to start annotating, or write a note below.
            </p>
          </div>
        )}
      </div>

      {/* AI Cleanup */}
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
