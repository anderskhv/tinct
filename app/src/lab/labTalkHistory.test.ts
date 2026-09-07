// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  LAB_CHAT_HISTORY_STORAGE_KEY,
  clearLabChatHistoryLocal,
  mergeLabChatHistoryStates,
  parseLabChatHistoryState,
  readLabChatHistoryLocal,
} from './labTalkHistory'

afterEach(() => {
  clearLabChatHistoryLocal()
})

const romans = {
  bookId: 'romans',
  headerBook: 'Romans',
  updatedAt: 1_777_300_000_100,
  conversations: [{
    id: 'conv_lab_romans_1',
    bookId: 'romans',
    chapterNumber: 1054,
    startTimestamp: 1_777_300_000_000,
    endTimestamp: 1_777_300_000_100,
    preview: 'What would Keller say?',
    messages: [
      { id: 'r1', role: 'user', content: 'What would Keller say?', timestamp: 1_777_300_000_000, bookId: 'romans' },
      { id: 'r2', role: 'assistant', content: 'Grace first.', timestamp: 1_777_300_000_100, bookId: 'romans' },
    ],
  }],
}

describe('legacy lab chat blob (retired; parsed for migration and the KV route)', () => {
  it('parses the per-biblical-book shape and drops bible / lab / odyssey keys and array legacy', () => {
    const state = parseLabChatHistoryState({
      updatedAt: 1_777_300_000_100,
      books: {
        romans,
        bible: { ...romans, bookId: 'bible', headerBook: 'Bible' },
        lab: { ...romans, bookId: 'lab', headerBook: 'Lab' },
      },
    })
    expect(Object.keys(state.books)).toEqual(['romans'])
    expect(state.books.romans.conversations[0].messages).toHaveLength(2)
    expect(parseLabChatHistoryState([{ id: 'x' }]).books).toEqual({})
  })

  it('reads the device blob and merges newer cloud books over older local ones', () => {
    localStorage.setItem(LAB_CHAT_HISTORY_STORAGE_KEY, JSON.stringify({ updatedAt: 1, books: { romans } }))
    const local = readLabChatHistoryLocal()
    expect(local.books.romans.headerBook).toBe('Romans')
    const newer = { ...romans, updatedAt: romans.updatedAt + 1, conversations: [] }
    const merged = mergeLabChatHistoryStates(local, { updatedAt: 2, books: { romans: newer } })
    expect(merged.books.romans.updatedAt).toBe(romans.updatedAt + 1)
    expect(merged.updatedAt).toBe(2)
  })
})
