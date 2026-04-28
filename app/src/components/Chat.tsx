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

/** Tokenize for comparison: lowercase, strip punctuation. */
function normalizeWords(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean)
}

/**
 * Merge two transcript chunks, deduping overlap. Used both within a single
 * recognition session (Boox emits each refinement as a fresh isFinal
 * result, often with different punctuation: "What's Blake?" then "What's
 * Blake condoning?") and ACROSS session restarts (Boox carries audio
 * context across timeouts; the new session re-emits the prior transcript
 * plus new words, often with one or two words misheard). Strategy:
 *   - empty operand → return the other
 *   - longest common WORD prefix covers ≥80% of the shorter transcript →
 *     same utterance refined/restated → keep the longer one entirely
 *   - tail of `a` shares ≥1 word with head of `b` → splice them
 *   - otherwise disjoint → concatenate with a space
 * Comparison is word-level so trailing punctuation differences don't
 * defeat the dedupe ("What's Blake?" vs "What's Blake condoning?").
 */
function mergeTranscripts(a: string, b: string): string {
  a = a.trim(); b = b.trim()
  if (!a) return b
  if (!b) return a

  const aWords = normalizeWords(a)
  const bWords = normalizeWords(b)
  if (aWords.length === 0) return b
  if (bWords.length === 0) return a

  // Longest common word-aligned prefix
  let prefixLen = 0
  const maxPrefix = Math.min(aWords.length, bWords.length)
  while (prefixLen < maxPrefix && aWords[prefixLen] === bWords[prefixLen]) prefixLen++

  // If the prefix covers most of the shorter transcript, treat both as
  // refinements of the same utterance — keep the longer raw text. Threshold
  // 0.8 catches "I want pizza" / "I want pizza tonight" (1.0) and the
  // pause/pulse mishear case (0.96) without gluing genuinely different
  // sentences that happen to share a couple of leading words.
  if (prefixLen / maxPrefix >= 0.8) {
    return aWords.length >= bWords.length ? a : b
  }

  // Tail-head splice: longest tail of a's words matching head of b's words.
  for (let len = Math.min(aWords.length, bWords.length); len >= 1; len--) {
    let match = true
    for (let i = 0; i < len; i++) {
      if (aWords[aWords.length - len + i] !== bWords[i]) { match = false; break }
    }
    if (match) {
      // Drop the overlapping `len` words from the start of b's raw text.
      // Walk b char-by-char, counting word starts.
      let wordsSeen = 0
      let inWord = false
      let cut = b.length
      for (let i = 0; i < b.length; i++) {
        const isWordChar = /[a-zA-Z0-9]/.test(b[i])
        if (isWordChar && !inWord) {
          wordsSeen++
          if (wordsSeen > len) { cut = i; break }
        }
        inWord = isWordChar
      }
      const bRest = b.slice(cut).trim()
      return (a + (bRest ? ' ' + bRest : '')).replace(/\s+/g, ' ').trim()
    }
  }

  return (a + ' ' + b).replace(/\s+/g, ' ').trim()
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
}

export function Chat({ messages, isLoading, onSendMessage, onClear, pendingHighlight, onClearHighlight, onCopyToNotes, bookTitle, chapterTitle, chapterLabels, readingObjective, onEditObjective, bookId, messagesRemaining, hasBalance, isAnonymous, onTopUp, onSignIn, chatConversations }: ChatProps) {
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const voiceTranscriptRef = useRef('')
  // Snapshot of "finalized" transcript that survives across recognition
  // sessions. Boox auto-stops the audio engine after ~5s of silence even
  // with continuous=true, so we restart it from onend; each restart's
  // event.results starts empty, so we accumulate here.
  const committedTranscriptRef = useRef('')
  // Mirrors isListening so the onend handler (closure over old state)
  // can decide whether to auto-restart or honour an explicit stop.
  const isListeningRef = useRef(false)
  isListeningRef.current = isListening

  // Voice input availability — pure feature detection. The earlier
  // !isEink guard hid the mic on e-ink devices (Boox), but voice input is
  // just as useful there as anywhere else. Boox Chromium exposes
  // webkitSpeechRecognition, so the icon now appears there too.
  const hasSpeechRecognition = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
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

  // Detach all SpeechRecognition handlers and call stop(). Critical: handlers
  // MUST be nulled before stop() because stop() is async and mobile WebKit
  // (and Boox) flush late onresult events that would otherwise re-populate
  // the textarea after we've cleared it for send.
  const stopRecognition = useCallback(() => {
    const r = recognitionRef.current
    if (!r) return
    r.onresult = null
    r.onend = null
    r.onerror = null
    try { r.stop() } catch { /* already stopped */ }
    recognitionRef.current = null
  }, [])

  // Build a fresh recognition instance wired with our handlers. Pulled out
  // of toggleVoice so the onend auto-restart path can call it too.
  const createRecognition = useCallback((): SpeechRecognition | null => {
    if (!hasSpeechRecognition) return null
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'

    // onresult — robust across spec-compliant browsers AND Boox's
    // non-compliant impl. Two pathologies seen on Boox:
    //   1. Each new partial appended as a SEPARATE result entry with the
    //      running transcript ("why", "why is", "why is the snake", ...)
    //   2. Each refinement marked isFinal=true, so concat-only-finals
    //      still piles up duplicates ("What's Blake?", "What's Blake?",
    //      "What's Blake condoning?", "What's Blake condoning?")
    // Strategy: walk results, dedupe overlaps (if a result is a prefix or
    // extension of the previous, replace with the longer version). Take
    // only the latest interim. This preserves spec-compliant browsers
    // (where finals are truly distinct utterances) and tames Boox.
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const finals: string[] = []
      let lastInterim = ''
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i]
        const text = String(r[0].transcript || '').trim()
        if (!text) continue
        if (r.isFinal) {
          // Use the same merge rules as cross-session merging — handles
          // punctuation drift and pause/pulse-style mishears.
          const prev = finals.length > 0 ? finals[finals.length - 1] : ''
          if (prev) finals[finals.length - 1] = mergeTranscripts(prev, text)
          else finals.push(text)
        } else {
          lastInterim = text
        }
      }
      const sessionText = (finals.join(' ') + ' ' + lastInterim).trim().replace(/\s+/g, ' ')
      // Merge across the session restart boundary using the same overlap
      // rules as within a session. Boox carries context across the auto-
      // restart, so the new session's first results often re-emit the
      // entire committed transcript plus new words — naive concat would
      // duplicate. mergeTranscripts handles full-contain, prefix, and
      // word-boundary overlap cases.
      const display = mergeTranscripts(committedTranscriptRef.current, sessionText)
      voiceTranscriptRef.current = display
      setInput(display)
    }

    recognition.onerror = (e: Event) => {
      // 'no-speech' and 'aborted' fire normally; let onend handle restart.
      const errType = (e as unknown as { error?: string }).error
      if (errType === 'not-allowed' || errType === 'service-not-allowed') {
        // Permission denied or service blocked — give up and surface UI off.
        isListeningRef.current = false
        setIsListening(false)
      }
    }

    // onend — the engine ended this session. If the user hasn't tapped
    // stop, snapshot whatever we have into committed and start a fresh
    // session. This is what makes voice feel "always on" on Boox even
    // though the underlying engine times out every few seconds.
    recognition.onend = () => {
      committedTranscriptRef.current = voiceTranscriptRef.current
      if (isListeningRef.current && recognitionRef.current === recognition) {
        const next = createRecognitionRef.current?.()
        if (next) {
          recognitionRef.current = next
          try { next.start() } catch { setIsListening(false) }
        } else {
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }
    return recognition
  }, [hasSpeechRecognition])
  // Self-reference so onend (defined inside createRecognition) can call
  // back into createRecognition without the stale-closure dance.
  const createRecognitionRef = useRef(createRecognition)
  createRecognitionRef.current = createRecognition

  // Voice input
  const toggleVoice = useCallback(() => {
    if (isListening) {
      isListeningRef.current = false
      stopRecognition()
      setIsListening(false)
      return
    }
    if (!hasSpeechRecognition) return
    // Fresh session — clear any prior committed text from a previous toggle.
    committedTranscriptRef.current = ''
    voiceTranscriptRef.current = ''
    const recognition = createRecognition()
    if (!recognition) return
    recognitionRef.current = recognition
    isListeningRef.current = true
    try {
      recognition.start()
      setIsListening(true)
    } catch {
      isListeningRef.current = false
    }
  }, [isListening, hasSpeechRecognition, stopRecognition, createRecognition])

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

      <div className="chat-messages">
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
          msg.chapterDivider ? (
            <div key={msg.id} className="chat-chapter-divider">
              <span>{getChapterLabel(msg.chapterDivider)}</span>
            </div>
          ) : (
            <div key={msg.id} className={`chat-message chat-message-${msg.role}`}>
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
                // Detach handlers BEFORE stop() — see stopRecognition comment.
                // Without this, mobile WebKit flushes a late onresult after
                // we've cleared the textarea, repopulating it post-send.
                stopRecognition()
                setIsListening(false)
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
