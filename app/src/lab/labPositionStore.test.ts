// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LAB_POSITION_STORAGE_KEY,
  emptyLabPositionState,
  resumePlace,
  type LabBookPlace,
  type LabPositionState,
} from './labPosition'
import {
  clearLabPositionLocal,
  createLabPositionSync,
  migrateLegacyFinishedChapters,
  putLabPositionCloud,
  readLabPositionDirty,
  readLabPositionLocal,
  writeLabPositionLocal,
} from './labPositionStore'
import { bootLabReading } from './useLabPositionSync'

const DEVICE = 'store-device'

function romansWord(): LabBookPlace {
  return {
    bookId: 'romans',
    headerBook: 'Romans',
    chapterNumber: 8,
    sequentialChapter: 1054,
    paragraphIndex: 4,
    wordIndex: 11,
    updatedAt: 40_000,
    deviceId: DEVICE,
    rev: 3,
  }
}

function stateWithRomans(): LabPositionState {
  return {
    ...emptyLabPositionState(DEVICE),
    books: { romans: romansWord() },
    lastSettledBookId: 'romans',
    lastSettledAt: 40_000,
    updatedAt: 40_000,
  }
}

afterEach(() => {
  clearLabPositionLocal()
  try { localStorage.removeItem('tinct-lab-finished-chapters') } catch { /* jsdom */ }
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('lab position local store', () => {
  it('offline save + reload restores the word', () => {
    writeLabPositionLocal(stateWithRomans())
    const reloaded = readLabPositionLocal(DEVICE)
    expect(resumePlace(reloaded)).toMatchObject({
      bookId: 'romans',
      paragraphIndex: 4,
      wordIndex: 11,
      sequentialChapter: 1054,
    })
    expect(localStorage.getItem(LAB_POSITION_STORAGE_KEY)).toContain('romans')
  })

  it('guest has no cloud write', async () => {
    const put = vi.fn(async () => true)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const sync = createLabPositionSync({ token: null, put })
    expect(sync.canWriteCloud()).toBe(false)
    sync.persist(stateWithRomans())
    expect(put).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await sync.flush()).toBe(false)
    expect(put).not.toHaveBeenCalled()
  })

  it('signed-in queues a PUT and keeps local as the written truth', async () => {
    const put = vi.fn(async () => true)
    const sync = createLabPositionSync({ token: 'signed-in-token', put, online: () => true })
    expect(sync.canWriteCloud()).toBe(true)
    sync.persist(stateWithRomans())
    expect(put).toHaveBeenCalledTimes(1)
    expect(readLabPositionLocal(DEVICE).books.romans?.wordIndex).toBe(11)
  })
})

describe('merge-before-write', () => {
  it('lets an older tab write without regressing a newer record', () => {
    const newer: LabPositionState = {
      ...stateWithRomans(),
      books: {
        romans: romansWord(),
        hebrews: { ...romansWord(), bookId: 'hebrews', headerBook: 'Hebrews', chapterNumber: 3, sequentialChapter: 1136, updatedAt: 90_000, deviceId: 'other-tab' },
      },
      lastSettledBookId: 'hebrews',
      lastSettledAt: 90_000,
      updatedAt: 90_000,
    }
    writeLabPositionLocal(newer)

    // A stale tab still believes Romans (older) is the settled book.
    const stale: LabPositionState = {
      ...stateWithRomans(),
      books: { romans: { ...romansWord(), wordIndex: 2, updatedAt: 30_000, rev: 1 } },
    }
    const stored = writeLabPositionLocal(stale)
    expect(stored.lastSettledBookId).toBe('hebrews')
    expect(stored.books.hebrews?.sequentialChapter).toBe(1136)
    expect(stored.books.romans?.wordIndex).toBe(11)
    expect(readLabPositionLocal(DEVICE)).toEqual(stored)

    // The same tab moving forward still wins.
    const forward: LabPositionState = {
      ...stale,
      books: { romans: { ...romansWord(), wordIndex: 20, updatedAt: 95_000, rev: 4 } },
      lastSettledBookId: 'romans',
      lastSettledAt: 95_000,
      updatedAt: 95_000,
    }
    const next = writeLabPositionLocal(forward)
    expect(next.lastSettledBookId).toBe('romans')
    expect(next.books.romans?.wordIndex).toBe(20)
    expect(next.books.hebrews?.sequentialChapter).toBe(1136)
  })
})

describe('cloud PUT', () => {
  it('uses keepalive when asked (hide / pagehide)', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    await putLabPositionCloud('tok', stateWithRomans(), { keepalive: true })
    await putLabPositionCloud('tok', stateWithRomans())
    const [, hideInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const [, plainInit] = fetchMock.mock.calls[1] as unknown as [string, RequestInit]
    expect(hideInit.method).toBe('PUT')
    expect(hideInit.keepalive).toBe(true)
    expect(plainInit.keepalive).toBeUndefined()
  })

  it('remembers a failed PUT across reloads and flushes the local record later', async () => {
    const failing = vi.fn(async () => false)
    const sync = createLabPositionSync({ token: 'tok', put: failing, online: () => true })
    sync.persist(stateWithRomans())
    await Promise.resolve()
    expect(sync.isDirty()).toBe(true)
    expect(readLabPositionDirty()).toBe(true)

    // Reload: a fresh sync with no in-memory `last` still knows it owes a PUT.
    const put = vi.fn(async () => true)
    const reloaded = createLabPositionSync({ token: 'tok', put, online: () => true })
    expect(reloaded.isDirty()).toBe(true)
    expect(await reloaded.flush()).toBe(true)
    expect(put).toHaveBeenCalledTimes(1)
    expect((put.mock.calls[0] as unknown as [string, LabPositionState])[1].books.romans?.wordIndex).toBe(11)
    expect(reloaded.isDirty()).toBe(false)
    expect(readLabPositionDirty()).toBe(false)
  })

  it('marks dirty while offline and clears it once a PUT lands', async () => {
    let online = false
    const put = vi.fn(async () => true)
    const sync = createLabPositionSync({ token: 'tok', put, online: () => online })
    sync.persist(stateWithRomans())
    expect(put).not.toHaveBeenCalled()
    expect(sync.isDirty()).toBe(true)
    online = true
    expect(await sync.flush()).toBe(true)
    expect(sync.isDirty()).toBe(false)
  })
})

describe('boot restore', () => {
  it('restores Romans word immediately, not Genesis 1', () => {
    writeLabPositionLocal(stateWithRomans())
    const boot = bootLabReading()
    expect(boot.book.headerBook).toBe('Romans')
    expect(boot.book.chapterLabel).toBe('Romans 8')
    expect(boot.book.chapterNumber).toBe(1054)
    expect(boot.place).toEqual({ paragraphIndex: 4, wordIndex: 11 })
    expect(boot.book.headerBook).not.toBe('Genesis')
  })
})

describe('finished chapters in the local store', () => {
  it('folds the legacy device-only list into the record under bible once, then drops the key', () => {
    writeLabPositionLocal({ ...stateWithRomans(), finished: { bible: [1] } })
    localStorage.setItem('tinct-lab-finished-chapters', JSON.stringify([747, 2]))
    const migrated = migrateLegacyFinishedChapters(readLabPositionLocal(DEVICE))
    expect(migrated.finished).toEqual({ bible: [1, 2, 747] })
    expect(localStorage.getItem('tinct-lab-finished-chapters')).toBeNull()
    expect(readLabPositionLocal(DEVICE).finished).toEqual({ bible: [1, 2, 747] })
    expect(resumePlace(readLabPositionLocal(DEVICE))?.bookId).toBe('romans')
    expect(migrateLegacyFinishedChapters(readLabPositionLocal(DEVICE))).toEqual(readLabPositionLocal(DEVICE))
  })

  it('keeps finished chapters from an older tab when a newer record without them is written', () => {
    writeLabPositionLocal({ ...stateWithRomans(), finished: { bible: [746] } })
    const stored = writeLabPositionLocal({ ...stateWithRomans(), updatedAt: 41_000, finished: { bible: [747] } })
    expect(stored.finished).toEqual({ bible: [746, 747] })
    expect(readLabPositionLocal(DEVICE).finished).toEqual({ bible: [746, 747] })
  })
})
