// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatConversation, ChatMessage } from '../types'
import { localStorageProvider, setStorageProvider, type StorageProvider } from '../services/storage'
import { appendReaderSessionShadow } from '../readerSession/shadow'
import { useChatHistory } from './useChatHistory'

vi.mock('../readerSession/shadow', () => ({
  appendReaderSessionShadow: vi.fn(),
}))

function message(patch: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'm1',
    role: 'user',
    content: 'What is happening here?',
    timestamp: 1_777_300_000_000,
    ...patch,
  }
}

function conversation(bookId: string, patch: Partial<ChatConversation> = {}): ChatConversation {
  return {
    id: `conv-${bookId}`,
    bookId,
    chapterNumber: 1,
    startTimestamp: 1_777_300_000_000,
    endTimestamp: 1_777_300_000_000,
    messages: [message({ id: `${bookId}-m1`, bookId, chapterNumber: 1 })],
    preview: 'What is happening here?',
    ...patch,
  }
}

function createMemoryStorage(): { provider: StorageProvider; store: Map<string, unknown> } {
  const store = new Map<string, unknown>()
  return {
    store,
    provider: {
      get<T>(key: string): T | null {
        return (store.get(key) as T | undefined) ?? null
      },
      set<T>(key: string, value: T): void {
        store.set(key, value)
      },
      delete(key: string): void {
        store.delete(key)
      },
      getAll<T>(prefix: string): T[] {
        return Array.from(store.entries())
          .filter(([key]) => key.startsWith(prefix))
          .map(([, value]) => value as T)
      },
    },
  }
}

describe('useChatHistory book scoping guards', () => {
  let store: Map<string, unknown>

  beforeEach(() => {
    const memory = createMemoryStorage()
    store = memory.store
    setStorageProvider(memory.provider)
    vi.mocked(appendReaderSessionShadow).mockClear()
  })

  afterEach(() => {
    setStorageProvider(localStorageProvider)
  })

  it('rejects a message stamped for another book before it can persist', () => {
    const { result } = renderHook(() => useChatHistory('odyssey', true, 0))

    act(() => {
      result.current.recordMessage(message({ bookId: 'bible' }), 1)
    })

    expect(result.current.conversations).toEqual([])
    expect(store.has('chat-history:odyssey')).toBe(false)
    expect(appendReaderSessionShadow).toHaveBeenCalledWith({
      kind: 'chat',
      detail: {
        rejected: true,
        reason: 'book-mismatch',
        targetBookId: 'odyssey',
        messageBookId: 'bible',
        messageId: 'm1',
      },
    })
  })

  it('stamps persisted messages and conversations with the active book and location tuple', () => {
    const { result } = renderHook(() => useChatHistory('odyssey', true, 0))

    act(() => {
      result.current.recordMessage(message(), 3, 2)
    })

    const written = store.get('chat-history:odyssey') as ChatConversation[]
    expect(written).toHaveLength(1)
    expect(written[0]).toMatchObject({
      bookId: 'odyssey',
      chapterNumber: 3,
      paragraphIndex: 2,
    })
    expect(written[0].messages[0]).toMatchObject({
      id: 'm1',
      bookId: 'odyssey',
      chapterNumber: 3,
      paragraphIndex: 2,
    })
  })

  it('deduplicates repeated records for the same message id', () => {
    const { result } = renderHook(() => useChatHistory('odyssey', true, 0))
    const repeated = message({ id: 'assistant-1', role: 'assistant', timestamp: 1_777_300_001_000 })

    act(() => {
      result.current.recordMessage(repeated, 2)
      result.current.recordMessage(repeated, 2)
    })

    const written = store.get('chat-history:odyssey') as ChatConversation[]
    expect(written).toHaveLength(1)
    expect(written[0].messages.map(m => m.id)).toEqual(['assistant-1'])
  })

  it('does not expose the previous book conversations during the first render after a book switch', async () => {
    store.set('chat-history:odyssey', [conversation('odyssey')])

    const { result, rerender } = renderHook(
      ({ bookId }) => useChatHistory(bookId, true, 0),
      { initialProps: { bookId: 'odyssey' } },
    )

    await waitFor(() => expect(result.current.conversations).toHaveLength(1))

    act(() => {
      rerender({ bookId: 'bible' })
    })

    expect(result.current.conversations).toEqual([])
  })
})
