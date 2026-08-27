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
