import { describe, expect, it } from 'vitest'
import { handleLabChatHistory } from './worker/routes/labChatHistory'
import type { LabChatHistoryState } from './lab/labTalkHistory'

const userId = '11111111-1111-4111-8111-111111111111'

function memoryKv(seed: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(seed))
  return {
    data,
    async get(key: string, type?: string) {
      const raw = data.get(key)
      if (raw == null) return null
      return type === 'json' ? JSON.parse(raw) : raw
    },
    async put(key: string, value: string) {
      data.set(key, value)
    },
  }
}

function romansState(): LabChatHistoryState {
  return {
    books: {
      romans: {
        bookId: 'romans',
        headerBook: 'Romans',
        updatedAt: 50_000,
        conversations: [{
          id: 'conv-romans',
          bookId: 'romans',
          chapterNumber: 8,
          startTimestamp: 50_000,
          endTimestamp: 50_000,
          preview: 'What would Keller say about this?',
          messages: [{
            id: 'keller',
            role: 'user',
            content: 'What would Keller say about this?',
            timestamp: 50_000,
            bookId: 'romans',
            isComplete: true,
            source: 'text',
          }],
        }],
      },
    },
    updatedAt: 50_000,
  }
}

describe('lab-chat-history route', () => {
  it('rejects guests: no cloud write without auth', async () => {
    const kv = memoryKv()
    const response = await handleLabChatHistory(
      new Request('https://tinct.app/api/lab-chat-history', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(romansState()),
      }),
      { RATE_LIMIT: kv as unknown as KVNamespace },
      async () => null,
    )
    expect(response.status).toBe(401)
    expect(kv.data.size).toBe(0)
  })

  it('GET requires a signed-in user', async () => {
    const response = await handleLabChatHistory(
      new Request('https://tinct.app/api/lab-chat-history'),
      { RATE_LIMIT: memoryKv() as unknown as KVNamespace },
      async () => null,
    )
    expect(response.status).toBe(401)
  })

  it('PUT stores Romans; older Genesis cloud does not overwrite the Keller thread', async () => {
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })

    const first = await handleLabChatHistory(
      new Request('https://tinct.app/api/lab-chat-history', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(romansState()),
      }),
      env,
      verify,
    )
    expect(first.status).toBe(200)

    const olderGenesis = {
      books: {
        genesis: {
          bookId: 'genesis',
          headerBook: 'Genesis',
          updatedAt: 9_000,
          conversations: [{
            id: 'conv-genesis',
            bookId: 'genesis',
            chapterNumber: 1,
            startTimestamp: 9_000,
            endTimestamp: 9_000,
            preview: 'Who is speaking?',
            messages: [{
              id: 'g1',
              role: 'user',
              content: 'Who is speaking in the beginning?',
              timestamp: 9_000,
              bookId: 'genesis',
            }],
          }],
        },
        romans: {
          bookId: 'romans',
          headerBook: 'Romans',
          updatedAt: 1_000,
          conversations: [{
            id: 'old-romans',
            bookId: 'romans',
            chapterNumber: 1,
            startTimestamp: 1_000,
            endTimestamp: 1_000,
            preview: 'stale',
            messages: [{
              id: 'stale',
              role: 'user',
              content: 'stale romans',
              timestamp: 1_000,
              bookId: 'romans',
            }],
          }],
        },
      },
      updatedAt: 9_000,
    }

    const second = await handleLabChatHistory(
      new Request('https://tinct.app/api/lab-chat-history', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(olderGenesis),
      }),
      env,
      verify,
    )
    const body = await second.json() as LabChatHistoryState
    expect(body.books.romans?.conversations[0].messages[0].content).toContain('Keller')
    expect(body.books.genesis?.conversations[0].messages[0].content).toContain('beginning')

    const got = await handleLabChatHistory(
      new Request('https://tinct.app/api/lab-chat-history'),
      env,
      verify,
    )
    const stored = await got.json() as LabChatHistoryState
    expect(stored.books.romans?.conversations[0].messages[0].id).toBe('keller')
    expect(stored.books.bible).toBeUndefined()
  })
})
