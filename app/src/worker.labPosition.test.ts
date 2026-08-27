import { describe, expect, it } from 'vitest'
import { handleLabPosition } from './worker/routes/labPosition'
import type { LabPositionState } from './lab/labPosition'

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

function romansState(): LabPositionState {
  return {
    books: {
      romans: {
        bookId: 'romans',
        headerBook: 'Romans',
        chapterNumber: 8,
        sequentialChapter: 1054,
        paragraphIndex: 4,
        wordIndex: 11,
        updatedAt: 50_000,
        deviceId: 'phone',
        rev: 4,
      },
    },
    lastSettledBookId: 'romans',
    lastSettledAt: 50_000,
    updatedAt: 50_000,
    deviceId: 'phone',
  }
}

describe('lab-position route', () => {
  it('rejects guests: no cloud write without auth', async () => {
    const kv = memoryKv()
    const response = await handleLabPosition(
      new Request('https://tinct.app/api/lab-position', {
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
    const response = await handleLabPosition(
      new Request('https://tinct.app/api/lab-position'),
      { RATE_LIMIT: memoryKv() as unknown as KVNamespace },
      async () => null,
    )
    expect(response.status).toBe(401)
  })

  it('PUT stores the map; older cloud for another book does not overwrite Romans', async () => {
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })

    const first = await handleLabPosition(
      new Request('https://tinct.app/api/lab-position', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(romansState()),
      }),
      env,
      verify,
    )
    expect(first.status).toBe(200)

    const olderJames = {
      books: {
        james: {
          bookId: 'james',
          headerBook: 'James',
          chapterNumber: 1,
          sequentialChapter: 1147,
          paragraphIndex: 0,
          wordIndex: 0,
          updatedAt: 9_000,
          deviceId: 'tablet',
          rev: 1,
        },
        romans: {
          bookId: 'romans',
          headerBook: 'Romans',
          chapterNumber: 1,
          sequentialChapter: 1047,
          paragraphIndex: 0,
          wordIndex: 0,
          updatedAt: 1_000,
          deviceId: 'tablet',
          rev: 1,
        },
      },
      lastSettledBookId: 'james',
      lastSettledAt: 9_000,
      updatedAt: 9_000,
      deviceId: 'tablet',
    }

    const second = await handleLabPosition(
      new Request('https://tinct.app/api/lab-position', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(olderJames),
      }),
      env,
      verify,
    )
    const body = await second.json() as LabPositionState
    expect(body.books.romans?.wordIndex).toBe(11)
    expect(body.books.romans?.sequentialChapter).toBe(1054)
    expect(body.books.james?.sequentialChapter).toBe(1147)
    expect(body.lastSettledBookId).toBe('romans')

    const got = await handleLabPosition(
      new Request('https://tinct.app/api/lab-position'),
      env,
      verify,
    )
    const stored = await got.json() as LabPositionState
    expect(stored.books.romans?.paragraphIndex).toBe(4)
  })
})
