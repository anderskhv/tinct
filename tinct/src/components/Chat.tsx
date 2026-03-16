import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '../types'

interface ChatProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSendMessage: (content: string, highlightedText?: string) => void
  onClear: () => void
  pendingHighlight: string | null
  onClearHighlight: () => void
}

export function Chat({ messages, isLoading, onSendMessage, onClear, pendingHighlight, onClearHighlight }: ChatProps) {
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
      <div className="chat-header">
        <h3>Chat</h3>
        {messages.length > 0 && (
          <button className="chat-clear" onClick={onClear} title="Clear chat">
            Clear
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !pendingHighlight && (
          <div className="chat-empty">
            <p className="chat-empty-title">Your reading companion</p>
            <p className="chat-empty-hint">
              Highlight any passage in the text and click "Explain this" to start a conversation. Or just type a question below.
            </p>
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
              {msg.content.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>
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
              "{pendingHighlight.length > 80 ? pendingHighlight.slice(0, 80) + '...' : pendingHighlight}"
            </span>
            <button
              type="button"
              className="chat-pending-dismiss"
              onClick={onClearHighlight}
            >
              x
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
            placeholder={pendingHighlight ? 'Ask about this passage... (Enter to explain)' : 'Ask about The Odyssey...'}
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
