import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../types'
import { selectChatRequestHistory } from './useClaude'

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
