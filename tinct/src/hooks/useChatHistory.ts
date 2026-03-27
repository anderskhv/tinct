import { useState, useCallback, useEffect, useRef } from 'react'
import type { ChatMessage, ChatConversation } from '../types'
import { storage } from '../services/storage'

const CONVERSATION_GAP_MS = 5 * 60 * 1000 // 5 minutes = new conversation

let convIdCounter = 0
function generateConvId() {
  return `conv_${Date.now()}_${++convIdCounter}`
}

function storageKey(bookId: string) {
  return `chat-history:${bookId}`
}

/** Truncate to first ~80 chars for preview */
function makePreview(text: string): string {
  if (text.length <= 80) return text
  return text.slice(0, 77) + '...'
}

export function useChatHistory(bookId: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const conversationsRef = useRef(conversations)
  conversationsRef.current = conversations

  // Load on mount / book change
  useEffect(() => {
    const data = storage.get<ChatConversation[]>(storageKey(bookId))
    setConversations(data || [])
  }, [bookId])

  // Save to storage
  const persist = useCallback((convs: ChatConversation[]) => {
    storage.set(storageKey(bookId), convs)
  }, [bookId])

  /** Record a message into chat history */
  const recordMessage = useCallback((
    message: ChatMessage,
    chapterNumber: number,
    paragraphIndex?: number,
  ) => {
    setConversations(prev => {
      const now = message.timestamp
      const last = prev[prev.length - 1]

      // Attach location to message
      const enrichedMessage: ChatMessage = {
        ...message,
        bookId,
        chapterNumber,
        paragraphIndex,
      }

      let updated: ChatConversation[]

      // Continue existing conversation if same chapter and within gap
      if (
        last &&
        last.chapterNumber === chapterNumber &&
        now - last.endTimestamp < CONVERSATION_GAP_MS
      ) {
        const updatedConv: ChatConversation = {
          ...last,
          endTimestamp: now,
          messages: [...last.messages, enrichedMessage],
        }
        updated = [...prev.slice(0, -1), updatedConv]
      } else {
        // Start new conversation
        const newConv: ChatConversation = {
          id: generateConvId(),
          bookId,
          chapterNumber,
          paragraphIndex,
          startTimestamp: now,
          endTimestamp: now,
          messages: [enrichedMessage],
          preview: message.role === 'user' ? makePreview(message.content) : '',
        }
        updated = [...prev, newConv]
      }

      persist(updated)
      return updated
    })
  }, [bookId, persist])

  /** Get conversations for a specific chapter */
  const getChapterConversations = useCallback((chapterNumber: number): ChatConversation[] => {
    return conversationsRef.current.filter(c => c.chapterNumber === chapterNumber)
  }, [])

  /** Generate a client-side summary of past discussions for a chapter (for system prompt injection) */
  const getChapterChatSummary = useCallback((chapterNumber: number): string | null => {
    const chapterConvs = conversationsRef.current.filter(c => c.chapterNumber === chapterNumber)
    if (chapterConvs.length === 0) return null

    // Extract key user questions and topics from past conversations
    const userMessages = chapterConvs.flatMap(c =>
      c.messages.filter(m => m.role === 'user').map(m => m.content)
    )
    if (userMessages.length === 0) return null

    // Take up to 5 most recent user messages as summary
    const recent = userMessages.slice(-5)
    const topics = recent.map(m => makePreview(m)).join('; ')

    return `The reader previously discussed this chapter. Topics covered: ${topics}`
  }, [])

  /** Set an AI-generated summary on a conversation (replaces clutter with clean summary) */
  const setSummary = useCallback((convId: string, summary: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === convId ? { ...c, summary } : c)
      persist(updated)
      return updated
    })
  }, [persist])

  return {
    conversations,
    recordMessage,
    getChapterConversations,
    getChapterChatSummary,
    setSummary,
  }
}
