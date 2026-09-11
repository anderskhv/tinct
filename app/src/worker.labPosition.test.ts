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
    finished: {},
    hidden: {},
    lastSettledBookId: 'romans',
    lastSettledAt: 50_000,
    updatedAt: 50_000,
    deviceId: 'phone',
  }
}


function jeremiahState(): LabPositionState {
  return {
    books: {
      jeremiah: {
        bookId: 'jeremiah',
        headerBook: 'Jeremiah',
        chapterNumber: 38,
        sequentialChapter: 774,
        paragraphIndex: 6,
        wordIndex: 3,
        updatedAt: 500_000,
        deviceId: 'phone',
        rev: 12,
      },
    },
    finished: {},
    lastSettledBookId: 'jeremiah',
    lastSettledAt: 500_000,
    updatedAt: 500_000,
    deviceId: 'phone',
  }
}

/** What a wiped device settles when it paints the Bible fallback chapter. */
function genesisFallbackState(now: number): LabPositionState {
  return {
    books: {
      genesis: {
        bookId: 'genesis',
        headerBook: 'Genesis',
        chapterNumber: 1,
        sequentialChapter: 1,
        paragraphIndex: 0,
        wordIndex: 0,
        updatedAt: now,
        deviceId: 'wiped-phone',
        rev: 1,
      },
    },
    finished: {},
    lastSettledBookId: 'genesis',
    lastSettledAt: now,
    updatedAt: now,
    deviceId: 'wiped-phone',
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

  it('PUT unions finished chapters across devices instead of last-write-wins', async () => {
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })
    const put = (body: unknown) => handleLabPosition(
      new Request('https://tinct.app/api/lab-position', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      env,
      verify,
    )
    await put({ ...romansState(), finished: { bible: [780, 781] } })
    const second = await put({ ...romansState(), updatedAt: 1_000, deviceId: 'tablet', finished: { bible: [746], odyssey: [1] } })
    expect((await second.json() as LabPositionState).finished).toEqual({ bible: [746, 780, 781], odyssey: [1] })
    const get = await handleLabPosition(new Request('https://tinct.app/api/lab-position', { method: 'GET' }), env, verify)
    expect((await get.json() as LabPositionState).finished).toEqual({ bible: [746, 780, 781], odyssey: [1] })
  })

  it('a device that never saw the stored resume cannot demote it to its boot fallback', async () => {
    // The 2026-09-07 incident. The account's row resumes Jeremiah 38. A
    // device whose local record was wiped (sign-out) paints the Genesis 1
    // fallback, settles it, and PUTs before the GET it started has answered.
    // The row of record must keep the reader's real place.
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })
    const put = (body: unknown) => handleLabPosition(
      new Request('https://tinct.app/api/lab-position', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      env,
      verify,
    )

    await put(jeremiahState())
    const after = await put(genesisFallbackState(900_000))
    const body = await after.json() as LabPositionState

    expect(body.lastSettledBookId).toBe('jeremiah')
    expect(body.lastSettledAt).toBe(500_000)
    // The fallback pin is still kept — nothing the reader did is thrown away.
    expect(body.books.genesis?.chapterNumber).toBe(1)
    expect(body.books.jeremiah?.chapterNumber).toBe(38)
  })

  it('a device that carries the stored resume may still move it on', async () => {
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })
    const put = (body: unknown) => handleLabPosition(
      new Request('https://tinct.app/api/lab-position', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      env,
      verify,
    )

    await put(jeremiahState())
    const informed = genesisFallbackState(900_000)
    informed.books.jeremiah = jeremiahState().books.jeremiah
    const after = await put(informed)
    const body = await after.json() as LabPositionState

    expect(body.lastSettledBookId).toBe('genesis')
    expect(body.lastSettledAt).toBe(900_000)
  })

  it('stamps the row with its owner so a client can tell whose record it is', async () => {
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })
    const stored = await handleLabPosition(
      new Request('https://tinct.app/api/lab-position', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...romansState(), owner: 'someone-else' }) }),
      env,
      verify,
    )
    expect((await stored.json() as LabPositionState).owner).toBe(userId)
    const got = await handleLabPosition(new Request('https://tinct.app/api/lab-position'), env, verify)
    expect((await got.json() as LabPositionState).owner).toBe(userId)
  })

  it('PUT carries "off the Reading-now list" between devices, newest hide per book', async () => {
    const kv = memoryKv()
    const env = { RATE_LIMIT: kv as unknown as KVNamespace }
    const verify = async () => ({ id: userId, email: 'reader@example.com' })
    const put = (body: unknown) => handleLabPosition(
      new Request('https://tinct.app/api/lab-position', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
      env,
      verify,
    )
    await put({ ...romansState(), hidden: { odyssey: 5_000 } })
    const second = await put({ ...romansState(), updatedAt: 1_000, deviceId: 'tablet', hidden: { odyssey: 2_000, bible: 9_000 } })
    expect((await second.json() as LabPositionState).hidden).toEqual({ odyssey: 5_000, bible: 9_000 })
    const get = await handleLabPosition(new Request('https://tinct.app/api/lab-position', { method: 'GET' }), env, verify)
    expect((await get.json() as LabPositionState).hidden).toEqual({ odyssey: 5_000, bible: 9_000 })
  })
})

it('round-trips chapter bookmarks through the authenticated endpoint and retains them for older clients', async () => {
  const kv = memoryKv()
  const env = { RATE_LIMIT: kv as unknown as KVNamespace }
  const verify = async () => ({ id: userId, email: 'fixture@example.invalid' })
  const state = romansState()
  state.recentChapters = { 'romans:1054': state.books.romans }
  for (const body of [state, romansState()]) {
    const response = await handleLabPosition(new Request('https://tinct.app/api/lab-position', {
      method: 'PUT', body: JSON.stringify(body),
    }), env, verify)
    expect(response.status).toBe(200)
  }
  const response = await handleLabPosition(new Request('https://tinct.app/api/lab-position'), env, verify)
  const stored = await response.json() as LabPositionState
  expect(stored.recentChapters?.['romans:1054']).toEqual(state.books.romans)
  expect(stored.owner).toBe(userId)
})
