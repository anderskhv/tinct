import { useState, useCallback } from 'react'
import type { ChatMessage } from '../types'

const SYSTEM_PROMPT = `You are a literary companion helping a reader deeply engage with Homer's Odyssey. You're knowledgeable about ancient Greek literature, mythology, history, and literary analysis.

When the reader highlights a passage, explain it clearly — what's happening, why it matters, and any cultural or literary context that enriches understanding. Be conversational and warm, not academic. Think of yourself as a well-read friend sitting next to someone as they read.

If asked to explain something in simpler terms, do so without condescension. If asked for deeper analysis, go deeper. Match the reader's level.

Keep responses concise unless asked for more detail. Use short paragraphs.`

let messageIdCounter = 0
function generateId() {
  return `msg_${Date.now()}_${++messageIdCounter}`
}

export function useClaude() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string, highlightedText?: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      highlightedText,
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Build the messages array for the API
      const apiMessages = [...messages, userMessage].map(m => {
        let text = m.content
        if (m.highlightedText && m.role === 'user') {
          text = `[The reader highlighted this passage: "${m.highlightedText}"]\n\n${text}`
        }
        return { role: m.role, content: text }
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message || 'API error')
      }

      const assistantText = data.content?.[0]?.text || 'Sorry, I could not generate a response.'

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isLoading, sendMessage, clearMessages }
}
