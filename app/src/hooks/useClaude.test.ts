// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../types'
import { selectChatRequestHistory, useClaude } from './useClaude'

afterEach(() => vi.unstubAllGlobals())

function message(patch: Partial<ChatMessage>): ChatMessage {
  return {
    id: patch.id || 'm1',
    role: patch.role || 'user',
    content: patch.content || 'What is this about?',
    timestamp: patch.timestamp || 1_777_300_000_000,
    ...patch,
  }
}

describe('selectChatRequestHistory', () => {
  it('keeps old cross-chapter questions out of the next model request', () => {
    const history = [
      message({ id: 'jezebel-q', content: 'Why does Jezebel want to kill Elijah?', chapterNumber: 214 }),
      message({ id: 'jezebel-a', role: 'assistant', content: 'Jezebel is responding to Carmel.', chapterNumber: 214 }),
      message({ id: 'song-q', content: 'What is this part about?', chapterNumber: 645 }),
    ]

    expect(selectChatRequestHistory(history, 645, 20).map(m => m.id)).toEqual(['song-q'])
  })

  it('preserves recent same-chapter turns and applies the request limit', () => {
    const history = [
      message({ id: 'same-1', chapterNumber: 7 }),
      message({ id: 'same-2', role: 'assistant', chapterNumber: 7 }),
      message({ id: 'same-3', chapterNumber: 7 }),
    ]

    expect(selectChatRequestHistory(history, 7, 2).map(m => m.id)).toEqual(['same-2', 'same-3'])
  })
})

describe('useClaude stream completion', () => {
  it('keeps text from a clean premature EOF incomplete instead of saving it as a finished answer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A partial answer."}}\n\n',
      { headers: { 'Content-Type': 'text/event-stream' } },
    )))
    const { result } = renderHook(() => useClaude({
      bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterTitle: 'Book 1',
      bookId: 'odyssey', currentChapterNumber: 1, authToken: 'qa-token',
    }))

    await act(async () => { await result.current.sendMessage('What happens?') })

    const partial = result.current.messages.find(item => item.content === 'A partial answer.')
    expect(partial).toMatchObject({ role: 'assistant', bookId: 'odyssey', isComplete: false })
    expect(result.current.messages.some(item => item.role === 'assistant' && item.isComplete === true && item.content.includes('Something went wrong'))).toBe(true)
  })
})
