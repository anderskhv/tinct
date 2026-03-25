import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '../types'
import { BalanceIndicator } from './BalanceIndicator'

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
  readingObjective?: string
  onEditObjective?: () => void
  // Balance indicator
  messagesRemaining?: number
  hasBalance?: boolean
  isAnonymous?: boolean
  onTopUp?: () => void
  onSignIn?: () => void
}

export function Chat({ messages, isLoading, onSendMessage, onClear, pendingHighlight, onClearHighlight, onCopyToNotes, bookTitle, chapterTitle, readingObjective, onEditObjective, messagesRemaining, hasBalance, isAnonymous, onTopUp, onSignIn }: ChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (pendingHighlight) {
      inputRef.current?.focus()
    }
  }, [pendingHighlight])

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
          <span />
          <button className="chat-clear" onClick={onClear} title="Clear chat">
            Clear
          </button>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && !pendingHighlight && (
          <div className="chat-welcome">
            <p className="chat-welcome-title" style={{ animationDelay: '0s' }}>
              {chapterTitle
                ? `I'm here as you read ${chapterTitle}. Highlight a passage, or ask me anything.`
                : 'Your reading companion'}
            </p>
            {readingObjective && (
              <div className="chat-welcome-objective" style={{ animationDelay: '0.1s' }}>
                <span className="chat-welcome-objective-label">Your angle:</span>
                <span className="chat-welcome-objective-text">{readingObjective}</span>
                {onEditObjective && (
                  <button className="chat-welcome-edit" onClick={onEditObjective}>edit</button>
                )}
              </div>
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

        {messages.map(msg => (
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
            {msg.role === 'assistant' && (
              <button
                className="chat-copy-to-notes"
                onClick={() => onCopyToNotes(msg.content)}
                title="Copy to Notes"
              >
                Copy to Notes
              </button>
            )}
          </div>
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
        {pendingHighlight && (
          <div className="chat-pending-highlight">
            <span className="chat-pending-label">About:</span>
            <span className="chat-pending-text">
              &ldquo;{pendingHighlight.length > 80 ? pendingHighlight.slice(0, 80) + '...' : pendingHighlight}&rdquo;
            </span>
            <button
              type="button"
              className="chat-pending-dismiss"
              onClick={onClearHighlight}
            >
              &times;
            </button>
          </div>
        )}
        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingHighlight ? 'Ask about this passage... (Enter to explain)' : 'Ask about what you\'re reading...'}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={isLoading && !input.trim() && !pendingHighlight}
          >
            &uarr;
          </button>
        </div>
      </form>
    </div>
  )
}
