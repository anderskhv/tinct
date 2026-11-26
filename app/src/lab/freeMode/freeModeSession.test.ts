// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readerHandoffFromUrlParams } from '../labReaderHandoff'
import { LAB_POSITION_DEVICE_KEY, LAB_POSITION_STORAGE_KEY } from '../labPosition'

// FREE_MODE is decided once, when freeMode.ts is first loaded: each case loads it afresh at a free-mode address.
const FREE_ADDRESS = '/reader?book=meditations&mode=free&ref=modern-english'
const SESSION_KEY = 'sb-test-auth-token'

async function loadAt(address: string) {
  window.history.replaceState(null, '', address)
  vi.resetModules()
  return import('./freeMode')
}

afterEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.resetModules()
})

describe('free reading mode is for guests', () => {
  it('runs for a visitor with no Tinct session on this device, and keeps the address', async () => {
    const { FREE_MODE } = await loadAt(FREE_ADDRESS)
    expect(FREE_MODE).toBe(true)
    expect(window.location.pathname + window.location.search).toBe(FREE_ADDRESS)
  })

  it('gives a signed-in visitor the normal reader: mode=free is dropped before the app runs, book and ref kept', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access_token: 'x', user: { id: 'reader-1', email: 'reader@example.com' } }))
    const { FREE_MODE } = await loadAt(FREE_ADDRESS)
    expect(FREE_MODE).toBe(false)
    expect(window.location.pathname + window.location.search).toBe('/reader?book=meditations&ref=modern-english')
  })

  it('opens the signed-in visitor at the place a guest saved on this device in free mode', async () => {
    const device = 'free-device'
    const now = Date.now()
    localStorage.setItem(LAB_POSITION_DEVICE_KEY, device)
    // A place saved in free mode (the reader's own local position store), in the original.
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({
      version: 1, deviceId: device, updatedAt: now,
      books: { meditations: { bookId: 'meditations', headerBook: 'Meditations', chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 4, wordIndex: 2, pageIndex: 0, primaryEditionKey: 'original-en', updatedAt: now, deviceId: device, rev: 1 } },
      lastSettledBookId: 'meditations', lastSettledAt: now,
    }))
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access_token: 'x', user: { id: 'reader-1' } }))
    await loadAt(FREE_ADDRESS)
    const handoff = readerHandoffFromUrlParams(new URLSearchParams(window.location.search))!
    expect(handoff).toMatchObject({ bookId: 'meditations', primaryEditionKey: 'original-en', resumeLatest: true })
    expect(handoff.savedPlace).toMatchObject({ chapterNumber: 3, paragraphIndex: 4, wordIndex: 2 })
  })

  it('leaves other reader addresses alone, signed in or not', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access_token: 'x', user: { id: 'reader-1' } }))
    const { FREE_MODE } = await loadAt('/reader?book=meditations&ref=modern-english')
    expect(FREE_MODE).toBe(false)
    expect(window.location.search).toBe('?book=meditations&ref=modern-english')
  })
})
