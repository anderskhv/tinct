import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '../types'

function buildSystemPrompt(bookTitle: string, bookAuthor: string, chapterTitle: string, readingObjective?: string): string {
  let prompt = `You are a literary companion helping a reader deeply engage with ${bookTitle} by ${bookAuthor}. The reader is currently on ${chapterTitle}.

You're knowledgeable about this work's historical context, themes, characters, literary techniques, and its place in the broader literary tradition. You know the plot, the characters, and can reference specific events.

When the reader highlights a passage, explain it clearly — what's happening, why it matters in the story, who the characters are, and any cultural or literary context that enriches understanding. Be conversational and warm, not academic. Think of yourself as a well-read friend sitting next to someone as they read.

If asked to explain something in simpler terms, do so without condescension. If asked for deeper analysis, go deeper. Match the reader's level.

Keep responses concise unless asked for more detail. Use short paragraphs. Reference specific characters by name and connect passages to the broader narrative.`

  if (readingObjective) {
    prompt += `\n\nThe reader's reading angle: "${readingObjective}". Connect your explanations to this perspective when there's a genuine, interesting connection. Don't force it.`
  }

  return prompt
}

function buildVisibleTextContext(visibleText?: string): string {
  if (!visibleText || visibleText.length < 20) return ''
  // Truncate to ~1500 chars to keep token cost down
  const trimmed = visibleText.length > 1500 ? visibleText.slice(0, 1500) + '...' : visibleText
  return `\n\n[The reader is currently looking at this text on their screen:\n"${trimmed}"]`
}

let messageIdCounter = 0
function generateId() {
  return `msg_${Date.now()}_${++messageIdCounter}`
}

interface UseClaudeOptions {
  bookTitle: string
  bookAuthor: string
  chapterTitle: string
  readingObjective?: string
  /** Current visible text on the reader page */
  visibleText?: string
  /** Supabase auth token for authenticated requests */
  authToken?: string | null
  /** Callback when balance is insufficient */
  onInsufficientBalance?: () => void
  /** Callback with usage data after successful response */
  onUsage?: (inputTokens: number, outputTokens: number) => void
  /** Summary of past chat discussions for the current chapter */
  chatMemory?: string
}

export function useClaude(options?: UseClaudeOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const optionsRef = useRef(options)
  optionsRef.current = options

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
      const apiMessages = [...messages, userMessage].map(m => {
        let text = m.content
        if (m.highlightedText && m.role === 'user') {
          text = `[The reader highlighted this passage: "${m.highlightedText}"]\n\n${text}`
        }
        return { role: m.role, content: text }
      })

      const opts = optionsRef.current
      const basePrompt = opts
        ? buildSystemPrompt(opts.bookTitle, opts.bookAuthor, opts.chapterTitle, opts.readingObjective)
        : 'You are a literary companion helping a reader deeply engage with what they\'re reading. Be conversational and warm. Keep responses concise.'
      const memoryContext = opts?.chatMemory ? `\n\n[${opts.chatMemory}]` : ''
      const systemPrompt = basePrompt + memoryContext + buildVisibleTextContext(opts?.visibleText)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (opts?.authToken) {
        headers['Authorization'] = `Bearer ${opts.authToken}`
      }

      const requestBody = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages,
      })

      // Retry loop for overloaded errors (up to 3 attempts)
      let data: any
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: requestBody,
        })

        // Handle insufficient balance
        if (response.status === 402) {
          opts?.onInsufficientBalance?.()
          const errorMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: 'Your AI chat balance is empty. Top up to continue our conversation.',
            timestamp: Date.now(),
          }
          setMessages(prev => [...prev, errorMessage])
          return
        }

        data = await response.json()

        if (data.error) {
          const msg = (data.error.message || '').toLowerCase()
          if ((msg.includes('overloaded') || response.status === 529) && attempt < 2) {
            // Wait 2s before retrying
            await new Promise(r => setTimeout(r, 2000))
            continue
          }
          throw new Error(data.error.message || 'API error')
        }
        break // success
      }

      const assistantText = data.content?.[0]?.text || 'Sorry, I could not generate a response.'
      const inputTokens = data.usage?.input_tokens || 0
      const outputTokens = data.usage?.output_tokens || 0
      const tokenCount = inputTokens + outputTokens

      // Report usage for balance tracking
      if (inputTokens > 0 || outputTokens > 0) {
        opts?.onUsage?.(inputTokens, outputTokens)
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        tokenCount,
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
