import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '../types'
import { apiUrl } from '../utils/apiUrl'

function buildSystemPrompt(
  bookTitle: string,
  bookAuthor: string,
  chapterTitle: string,
  readingObjective?: string,
  previousChapters?: string[],
): string {
  // Structured "current state" block. The reader can jump between chapters
  // mid-conversation (especially in the Bible — cross-references, parallel
  // passages). The model needs to distinguish "what's on screen right now"
  // (a fact, the FIRST line below) from "what we've talked about earlier"
  // (history, recoverable but not authoritative). Without this separation,
  // the model anchors on the most-mentioned chapter from history and
  // ignores the actual current position. The reader experienced this: they
  // were on Ruth 1, the model insisted they were still on Psalm 31.
  const currentState =
    `[Current state]\n` +
    `Right now reading: ${bookTitle} by ${bookAuthor} — ${chapterTitle}\n` +
    (previousChapters && previousChapters.length > 0
      ? `Earlier in this conversation we discussed: ${previousChapters.join(', ')}\n` +
        `(Those are history. Default to the chapter on screen unless the reader explicitly references one of the earlier ones.)\n`
      : '')

  let prompt = `You are the built-in reading companion for Tinct, a deep reading platform at tinct.app. You are part of Tinct — not a third-party tool. When users ask about Tinct's features, answer directly as someone who knows the product.

${currentState}
Tinct features you should know about:
- **Editions**: Each book is available in multiple versions — Original, Modern English, and Modern Danish. Readers can switch between editions or compare them side-by-side in split view.
- **Cast**: A character tracker showing characters the reader has encountered so far, with per-chapter summaries that are spoiler-aware (only reveals up to the reader's current chapter). If a character isn't in the Cast, it may be because they haven't appeared prominently enough or the Cast focuses on the most significant characters.
- **Highlights**: Readers can highlight text in multiple colors. Highlighted text can be explained or discussed in chat.
- **Notes**: A personal reading journal where readers can write freeform notes and save insights from chat.
- **Audiobook**: Synced paragraph-by-paragraph audio that follows the reader's position.
- **Feed**: A timeline of all reading activity, highlights, notes, and chats organized by chapter.
- **Reading angle**: An optional focus the reader sets (e.g., "leadership themes") that shapes your responses.

You're knowledgeable about this work's historical context, themes, characters, literary techniques, and its place in the broader literary tradition. You know the plot, the characters, and can reference specific events.

When the reader highlights a passage, explain it clearly — what's happening, why it matters in the story, who the characters are, and any cultural or literary context that enriches understanding. Be conversational and warm, not academic. Think of yourself as a well-read friend sitting next to someone as they read.

If asked to explain something in simpler terms, do so without condescension. If asked for deeper analysis, go deeper. Match the reader's level.

Keep responses concise unless asked for more detail. Use short paragraphs. Reference specific characters by name and connect passages to the broader narrative.

Answer the reader's latest message only. Treat earlier user messages as history, not as pending questions to answer again, unless the latest message explicitly asks you to revisit them.

Tone: measured, literary, and calm. Do not use emoji, emoticons, exclamation-heavy phrasing, slang, hype, or chatty filler. Prefer precise, grounded prose over playful encouragement.`

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

/**
 * Inject the full text of the current chapter so the model can answer
 * chapter-level questions ("what is this chapter about", "reflect on
 * chapter 8") from the actual prose rather than from its training memory
 * — which mixes chapter numbering up across the catalog. The reader saw
 * this on The Awakening: asked to reflect on chapter 8, the model
 * returned chapter 7's content, then chapter 9's, then finally chapter
 * 8's only after being corrected twice. Cost: ~500-2000 tokens per turn,
 * worth it to ground the answer in the actual chapter.
 */
function buildChapterTextContext(chapterText?: string): string {
  if (!chapterText || chapterText.length < 40) return ''
  // Cap at ~12,000 chars (~3,000 tokens). Most chapters are well under
  // this; longer ones (e.g. an Iliad book) get the start clipped, which
  // is acceptable since the visibleText block above already carries the
  // exact paragraphs in front of the reader's eyes.
  const MAX = 12000
  const trimmed = chapterText.length > MAX ? chapterText.slice(0, MAX) + '\n[…chapter continues; rest is paginated below]' : chapterText
  return `\n\n[Full text of the chapter the reader is currently in. This is the authoritative source for any chapter-level question — use it instead of your training memory, which mixes chapter numbering across editions:\n${trimmed}\n]`
}

let messageIdCounter = 0
function generateId() {
  return `msg_${Date.now()}_${++messageIdCounter}`
}

class ChatStreamError extends Error {
  sawToken: boolean

  constructor(message: string, sawToken: boolean) {
    super(message)
    this.name = 'ChatStreamError'
    this.sawToken = sawToken
  }
}

export function selectChatRequestHistory(messages: ChatMessage[], currentChapter: number | undefined, limit: number): ChatMessage[] {
  if (currentChapter == null) return messages.slice(-limit)
  return messages
    .filter(message => message.chapterNumber === currentChapter)
    .slice(-limit)
}

function isStreamingEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem('tinct:chat-streaming') !== '0'
}

interface UseClaudeOptions {
  bookTitle: string
  bookAuthor: string
  chapterTitle: string
  readingObjective?: string
  /** Current visible text on the reader page (one page worth, ~1500 chars) */
  visibleText?: string
  /** Full text of the current chapter (all paragraphs joined). Injected
   *  into the system prompt so the model answers chapter-level questions
   *  from the actual prose, not from its training memory. */
  currentChapterText?: string
  /** Supabase auth token for authenticated requests */
  authToken?: string | null
  /** Callback when balance is insufficient */
  onInsufficientBalance?: () => void
  /** Callback with usage data after successful response */
  onUsage?: (inputTokens: number, outputTokens: number) => void
  /** Summary of past chat discussions for the current chapter */
  chatMemory?: string
  /** Current book id — stamped onto messages so cross-book races cannot persist */
  bookId?: string
  /** Current chapter number — tagged onto outgoing messages so the
   *  position-divider UI and ambient-grounding logic can detect cross-
   *  chapter conversations. */
  currentChapterNumber?: number
  /** Map of chapter number → human-readable label. Used to translate
   *  chapter numbers from message history into labels for the "earlier in
   *  this conversation" line of the system prompt. */
  chapterLabels?: Record<number, string>
}

export function useClaude(options?: UseClaudeOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const readStream = async (response: Response, assistantId: string, sendBookId: string | undefined, currentChapter: number | undefined, opts: UseClaudeOptions | undefined): Promise<void> => {
    if (!response.body) throw new Error('Empty stream')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let assistantText = ''
    let inputTokens = 0
    let outputTokens = 0
    let cacheCreationInputTokens = 0
    let cacheReadInputTokens = 0
    let sawToken = false

    const applyEvent = (data: string) => {
      if (!data || data === '[DONE]') return
      let event: {
        type?: string
        error?: { message?: string }
        message?: { usage?: { input_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number } }
        delta?: { type?: string; text?: string }
        usage?: { output_tokens?: number }
      }
      try {
        event = JSON.parse(data)
      } catch {
        throw new ChatStreamError('Malformed chat stream', sawToken)
      }
      if (event.type === 'error') {
        throw new ChatStreamError(event.error?.message || 'Chat stream failed', sawToken)
      }
      if (event.type === 'message_start') {
        inputTokens = event.message?.usage?.input_tokens || inputTokens
        cacheCreationInputTokens = event.message?.usage?.cache_creation_input_tokens || cacheCreationInputTokens
        cacheReadInputTokens = event.message?.usage?.cache_read_input_tokens || cacheReadInputTokens
      }
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        const text = event.delta.text || ''
        if (!text) return
        sawToken = true
        assistantText += text
        if (optionsRef.current?.bookId !== sendBookId) return
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantText } : m))
      }
      if (event.type === 'message_delta') {
        outputTokens = event.usage?.output_tokens || outputTokens
      }
    }

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split(/\n\n/)
        buffer = events.pop() ?? ''
        for (const raw of events) {
          const dataLines = raw.split(/\r?\n/).filter(line => line.startsWith('data:'))
          for (const line of dataLines) applyEvent(line.slice(5).trim())
        }
      }
      const tail = decoder.decode()
      if (tail) buffer += tail
      for (const raw of buffer.split(/\n\n/)) {
        const dataLines = raw.split(/\r?\n/).filter(line => line.startsWith('data:'))
        for (const line of dataLines) applyEvent(line.slice(5).trim())
      }
    } catch (error) {
      if (error instanceof ChatStreamError) throw error
      throw new ChatStreamError('Chat stream interrupted', sawToken)
    }

    if (optionsRef.current?.bookId !== sendBookId) return
    const totalInputTokens = inputTokens + cacheCreationInputTokens + cacheReadInputTokens
    const tokenCount = totalInputTokens + outputTokens
    if (totalInputTokens > 0 || outputTokens > 0) opts?.onUsage?.(totalInputTokens, outputTokens)
    setMessages(prev => prev.map(m => m.id === assistantId
      ? { ...m, content: assistantText || 'Sorry, I could not generate a response.', tokenCount, isComplete: true }
      : m
    ))
  }

  const sendMessage = useCallback(async (content: string, highlightedText?: string) => {
    const opts = optionsRef.current
    const currentChapter = opts?.currentChapterNumber
    const sendBookId = opts?.bookId

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      highlightedText,
      chapterNumber: currentChapter,
      bookId: sendBookId,
      isComplete: true,
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send only the most recent turns to keep the request small and the
      // token cost bounded. Older context is preserved via opts.chatMemory
      // (the per-chapter summary), which is injected into the system prompt
      // below. Long sessions used to blow past the worker's body cap and
      // return 413; trimming here is the structural fix.
      const HISTORY_TURNS = 20
      const recentHistory = selectChatRequestHistory(messages, currentChapter, HISTORY_TURNS)
      const apiMessages = [...recentHistory, userMessage].map(m => {
        let text = m.content
        if (m.highlightedText && m.role === 'user') {
          text = `[The reader highlighted this passage: "${m.highlightedText}"]\n\n${text}`
        }
        return { role: m.role, content: text }
      })

      // Distinct previously-discussed chapters (most-recent first), excluding
      // the chapter the reader is currently on. This is the data the model
      // needs to distinguish "history we can reference" from "where they are
      // now." Cap at 5 to keep the prompt compact.
      const previousChapterLabels: string[] = []
      const seenChapters = new Set<number>()
      const labels = opts?.chapterLabels
      for (let i = recentHistory.length - 1; i >= 0 && previousChapterLabels.length < 5; i--) {
        const ch = recentHistory[i].chapterNumber
        if (ch == null || ch === currentChapter || seenChapters.has(ch)) continue
        seenChapters.add(ch)
        previousChapterLabels.push(labels?.[ch] || `Chapter ${ch}`)
      }

      const basePrompt = opts
        ? buildSystemPrompt(opts.bookTitle, opts.bookAuthor, opts.chapterTitle, opts.readingObjective, previousChapterLabels)
        : 'You are a literary companion helping a reader deeply engage with what they\'re reading. Be warm but measured. Keep responses concise. Do not use emoji, emoticons, slang, hype, or chatty filler.'
      const memoryContext = opts?.chatMemory ? `\n\n[${opts.chatMemory}]` : ''
      const chapterContext = buildChapterTextContext(opts?.currentChapterText)
      const visibleContext = memoryContext + buildVisibleTextContext(opts?.visibleText)
      const systemPrompt = [
        { type: 'text', text: basePrompt + chapterContext, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: visibleContext || '[No additional page context.]' },
      ]

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (opts?.authToken) {
        headers['Authorization'] = `Bearer ${opts.authToken}`
      }

      const streamEnabled = isStreamingEnabled()
      const requestBody = JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages,
        ...(streamEnabled ? { stream: true } : {}),
      })

      // Retry loop for overloaded errors (up to 3 attempts)
      let data: any
      const assistantId = generateId()
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch(apiUrl('/api/chat'), {
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

        const contentType = response.headers.get('content-type') || ''
        if (streamEnabled && response.ok && contentType.includes('text/event-stream')) {
          const placeholder: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            chapterNumber: currentChapter,
            bookId: sendBookId,
            isComplete: false,
          }
          if (optionsRef.current?.bookId === sendBookId) setMessages(prev => [...prev, placeholder])
          try {
            await readStream(response, assistantId, sendBookId, currentChapter, opts)
            return
          } catch (error) {
            const failedAfterToken = error instanceof ChatStreamError && error.sawToken
            if (failedAfterToken) {
              throw error
            }
            setMessages(prev => prev.filter(m => m.id !== assistantId))
            if (attempt < 2) {
              await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
              continue
            }
            throw error
          }
        }

        data = await response.json()

        if (data.error) {
          const msg = (data.error.message || data.error || '').toLowerCase()
          const isRetryable = msg.includes('overloaded') || response.status === 529 || response.status === 500
          if (isRetryable && attempt < 2) {
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
            continue
          }
          throw new Error(data.error.message || data.error || 'API error')
        }
        break // success
      }

      const assistantText = data.content?.[0]?.text || 'Sorry, I could not generate a response.'
      const inputTokens = (data.usage?.input_tokens || 0) +
        (data.usage?.cache_creation_input_tokens || 0) +
        (data.usage?.cache_read_input_tokens || 0)
      const outputTokens = data.usage?.output_tokens || 0
      const tokenCount = inputTokens + outputTokens

      // Report usage for balance tracking
      if (inputTokens > 0 || outputTokens > 0) {
        opts?.onUsage?.(inputTokens, outputTokens)
      }

      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        tokenCount,
        chapterNumber: currentChapter,
        bookId: sendBookId,
        isComplete: true,
      }

      if (optionsRef.current?.bookId === sendBookId) setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Something went wrong. If this keeps happening, a page refresh usually fixes it.',
        timestamp: Date.now(),
        refreshAction: true,
        bookId: sendBookId,
        chapterNumber: currentChapter,
        isComplete: true,
      }
      if (optionsRef.current?.bookId === sendBookId) setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const loadMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs)
  }, [])

  return { messages, isLoading, sendMessage, clearMessages, loadMessages }
}
