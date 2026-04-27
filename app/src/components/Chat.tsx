import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { ChatMessage, ChatConversation } from '../types'
import { BalanceIndicator } from './BalanceIndicator'
import { ContextualAnglePrompt } from './ContextualAnglePrompt'

/** Human-readable "3 min ago" / "Yesterday" / "Apr 12". */
function formatRelativeTime(ts: number): string {
  const now = Date.now()
  const diff = Math.max(0, now - ts)
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return 'Just now'
  if (diff < hour) return `${Math.floor(diff / min)} min ago`
  if (diff < day) return `${Math.floor(diff / hour)} hr ago`
  if (diff < 2 * day) return 'Yesterday'
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Web Speech API types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionEvent = any
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: Event) => void) | null
    onend: (() => void) | null
  }
}

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

/** Render markdown: headings, lists, paragraphs with inline formatting */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) { i++; continue }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = renderInline(headingMatch[2])
      if (level === 1) elements.push(<h4 key={key++} className="chat-md-h1">{content}</h4>)
      else if (level === 2) elements.push(<h5 key={key++} className="chat-md-h2">{content}</h5>)
      else elements.push(<h6 key={key++} className="chat-md-h3">{content}</h6>)
      i++; continue
    }

    // Bullet list (collect consecutive - lines)
    if (line.match(/^\s*[-*]\s+/)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        items.push(<li key={key++}>{renderInline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>)
        i++
      }
      elements.push(<ul key={key++} className="chat-md-list">{items}</ul>)
      continue
    }

    // Numbered list
    if (line.match(/^\s*\d+[.)]\s+/)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\s*\d+[.)]\s+/)) {
        items.push(<li key={key++}>{renderInline(lines[i].replace(/^\s*\d+[.)]\s+/, ''))}</li>)
        i++
      }
      elements.push(<ol key={key++} className="chat-md-list">{items}</ol>)
      continue
    }

    // Regular paragraph — collect lines until empty line or special line
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^#{1,3}\s/) && !lines[i].match(/^\s*[-*]\s+/) && !lines[i].match(/^\s*\d+[.)]\s+/)) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      elements.push(<p key={key++}>{renderInline(paraLines.join(' '))}</p>)
    }
  }

  return elements
}

interface ChatProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSendMessage: (content: string, highlightedText?: string) => void
  onClear: () => void
  pendingHighlight: string | null
  onClearHighlight: () => void
  onCopyToNotes: (content: string) => void
  bookTitle?: string
  chapterTitle?: string
  chapterLabels?: Record<number, string>
  readingObjective?: string
  onEditObjective?: () => void
  bookId?: string
  messagesRemaining?: number
  hasBalance?: boolean
  isAnonymous?: boolean
  onTopUp?: () => void
  onSignIn?: () => void
  /**
   * Past conversations for this book. Rendered chronologically (most
   * recent first) when there are no live messages, so the Chat tab opens
   * on the user's history instead of a blank welcome.
   */
  chatConversations?: ChatConversation[]
  /** Click a message's position tag to jump back in the book to where it was sent. */
  onNavigateToChapter?: (chapter: number, paragraphIndex?: number, editionKey?: string) => void
}

export function Chat({ messages, isLoading, onSendMessage, onClear, pendingHighlight, onClearHighlight, onCopyToNotes, bookTitle, chapterTitle, chapterLabels, readingObjective, onEditObjective, bookId, messagesRemaining, hasBalance, isAnonymous, onTopUp, onSignIn, chatConversations, onNavigateToChapter }: ChatProps) {
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const voiceTranscriptRef = useRef('')
  // Tracks whether the user is parked near the bottom of the thread. We only
  // auto-scroll on new messages when this is true — otherwise scrolling
  // hijacks a reader who's looking at older context.
  const stickToBottomRef = useRef(true)

  // Voice input availability — pure feature detection. The earlier
  // !isEink guard hid the mic on e-ink devices (Boox), but Anders flagged
  // that voice input is just as useful on Boox as anywhere else. If
  // window.SpeechRecognition exists at runtime, show the icon — let the
  // browser tell us. Boox Chromium DOES expose webkitSpeechRecognition,
  // so the icon will now appear there.
  const hasSpeechRecognition = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  // Watch scroll position so we know whether to follow new messages or stay put.
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop
      stickToBottomRef.current = distFromBottom < 80
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!stickToBottomRef.current) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (pendingHighlight) {
      inputRef.current?.focus()
    }
  }, [pendingHighlight])

  // Auto-grow textarea (like Claude's app)
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  // Voice input
  const toggleVoice = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }
    if (!hasSpeechRecognition) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      voiceTranscriptRef.current = transcript
      setInput(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isListening, hasSpeechRecognition])

  // Search filter
  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => !m.chapterDivider && m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  // Past conversations — chronological, most recent first. Only rendered
  // when there are no live messages, so the Chat tab opens on your
  // history instead of a blank welcome.
  const sortedHistory = useMemo(
    () => (chatConversations || [])
      .filter(c => c.messages && c.messages.length > 0)
      .sort((a, b) => b.endTimestamp - a.endTimestamp),
    [chatConversations],
  )
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)

  const getChapterLabel = (chapterNum: number) => {
    return chapterLabels?.[chapterNum] || `Chapter ${chapterNum}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = input.trim() || (pendingHighlight ? 'Explain this passage to me.' : '')
    if (!message && !pendingHighlight) return

    onSendMessage(message, pendingHighlight || undefined)
    setInput('')
    onClearHighlight()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat">
      {messages.length > 0 && (
        <div className="chat-header">
          {showSearch ? (
            <input
              className="chat-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              autoFocus
            />
          ) : <span />}
          <div className="chat-header-actions">
            <button className="chat-clear" onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery('') }} title="Search">
              {showSearch ? '✕' : '⌕'}
            </button>
            <button className="chat-clear" onClick={onClear} title="Clear chat">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 && !pendingHighlight && sortedHistory.length > 0 && (
          <div className="chat-history">
            <div className="chat-history-head">Past conversations</div>
            {sortedHistory.map(c => {
              const isOpen = expandedHistoryId === c.id
              const time = formatRelativeTime(c.endTimestamp)
              const chapLabel = c.chapterNumber ? getChapterLabel(c.chapterNumber) : null
              return (
                <div key={c.id} className={`chat-history-item ${isOpen ? 'chat-history-item-open' : ''}`}>
                  <button
                    className="chat-history-row"
                    onClick={() => setExpandedHistoryId(prev => prev === c.id ? null : c.id)}
                  >
                    <div className="chat-history-meta">
                      <span className="chat-history-time">{time}</span>
                      {chapLabel && <span className="chat-history-chapter">{chapLabel}</span>}
                    </div>
                    <div className="chat-history-preview">{c.preview}</div>
                  </button>
                  {isOpen && (
                    <div className="chat-history-messages">
                      {c.messages.map((m, i) => (
                        <div key={i} className={`chat-message chat-message-${m.role}`}>
                          {m.highlightedText && (
                            <div className="chat-highlight">
                              <span className="chat-highlight-label">Selected passage:</span>
                              <blockquote>{m.highlightedText.length > 200 ? m.highlightedText.slice(0, 200) + '...' : m.highlightedText}</blockquote>
                            </div>
                          )}
                          <div className="chat-message-content">
                            {renderMarkdown(m.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {messages.length === 0 && !pendingHighlight && (
          <div className="chat-welcome">
            <p className="chat-welcome-title" style={{ animationDelay: '0s' }}>
              {chapterTitle
                ? `I'm here as you read ${chapterTitle}. Highlight a passage, or ask me anything.`
                : 'Your reading companion'}
            </p>
            {readingObjective ? (
              <div className="chat-welcome-objective" style={{ animationDelay: '0.1s' }}>
                <span className="chat-welcome-objective-label">Your angle:</span>
                <span className="chat-welcome-objective-text">{readingObjective}</span>
                {onEditObjective && (
                  <button className="chat-welcome-edit" onClick={onEditObjective}>edit</button>
                )}
              </div>
            ) : (
              bookId && onEditObjective && (
                <div style={{ animationDelay: '0.1s' }}>
                  <ContextualAnglePrompt
                    bookId={bookId}
                    onSetAngle={onEditObjective}
                    onSkip={() => { /* remembered in localStorage by the component */ }}
                  />
                </div>
              )
            )}
            <div className="chat-suggestion-chips" style={{ animationDelay: '0.2s' }}>
              <button
                className="chat-suggestion-chip"
                onClick={() => onSendMessage(`What's ${chapterTitle || 'this chapter'} about?`)}
              >
                What's this chapter about?
              </button>
              <button
                className="chat-suggestion-chip"
                onClick={() => onSendMessage(`Who are the key characters in ${chapterTitle || 'this chapter'}?`)}
              >
                Who are the key characters?
              </button>
              <button
                className="chat-suggestion-chip"
                onClick={() => onSendMessage(`What should I watch for as I read ${chapterTitle || 'this chapter'}?`)}
              >
                What should I watch for?
              </button>
            </div>
            {messagesRemaining != null && onTopUp && onSignIn && (
              <div style={{ animationDelay: '0.3s' }}>
                <BalanceIndicator
                  messagesRemaining={messagesRemaining}
                  hasBalance={hasBalance ?? true}
                  isAnonymous={isAnonymous ?? true}
                  onTopUp={onTopUp}
                  onSignIn={onSignIn}
                />
              </div>
            )}
          </div>
        )}

        {filteredMessages.map(msg => (
          msg.chapterDivider ? null : (
            <div key={msg.id} className={`chat-message chat-message-${msg.role}`}>
              {msg.chapterNumber !== undefined && msg.role === 'user' && (
                <button
                  className="chat-message-position"
                  onClick={() => onNavigateToChapter?.(msg.chapterNumber!, msg.paragraphIndex)}
                  title="Jump to this place in the book"
                  disabled={!onNavigateToChapter}
                >
                  {getChapterLabel(msg.chapterNumber)}
                  {msg.paragraphIndex !== undefined ? ` · ¶${msg.paragraphIndex + 1}` : ''}
                </button>
              )}
              {msg.highlightedText && (
                <div className="chat-highlight">
                  <span className="chat-highlight-label">Selected passage:</span>
                  <blockquote>{msg.highlightedText.length > 200 ? msg.highlightedText.slice(0, 200) + '...' : msg.highlightedText}</blockquote>
                </div>
              )}
              <div className="chat-message-content">
                {renderMarkdown(msg.content)}
              </div>
              {msg.refreshAction && (
                <button
                  className="chat-refresh-action"
                  onClick={() => window.location.reload()}
                >
                  Refresh page
                </button>
              )}
            </div>
          )
        ))}

        {isLoading && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        {isListening ? (
          <div className="chat-voice-active">
            <div className="chat-voice-waveform">
              <span /><span /><span /><span /><span />
            </div>
            <span className="chat-voice-label">{input || 'Listening...'}</span>
            <button
              type="button"
              className="chat-voice-stop"
              onClick={() => {
                if (recognitionRef.current) recognitionRef.current.stop()
                setIsListening(false)
                // Send the transcript (use ref for latest value, not stale closure)
                const transcript = voiceTranscriptRef.current.trim()
                voiceTranscriptRef.current = ''
                setInput('')
                if (transcript) {
                  onSendMessage(transcript, pendingHighlight || undefined)
                  onClearHighlight()
                }
              }}
              title="Stop and send"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pendingHighlight ? 'Ask about this passage...' : 'Ask about what you\'re reading...'}
              rows={1}
              disabled={isLoading}
            />
            {hasSpeechRecognition && (
              <button
                type="button"
                className="chat-mic"
                onClick={toggleVoice}
                title="Voice input"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="chat-send"
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
          </div>
        )}
      </form>
    </div>
  )
}
