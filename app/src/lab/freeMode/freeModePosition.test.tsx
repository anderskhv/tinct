// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A signed-in reader: free reading mode must still never read or write the account's place.
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ session: { access_token: 'live-token', user: { id: 'reader-1' } }, user: { id: 'reader-1' }, likelyAuthenticated: true, isLoading: false }),
}))

import { LAB_POSITION_DEVICE_KEY, LAB_POSITION_STORAGE_KEY } from '../labPosition'
import { clearLabPositionLocal, readLabPositionLocal } from '../labPositionStore'
import { bibleFallbackSource, type LabSource } from '../labSource'
import { useLabPositionSync } from '../useLabPositionSync'
import { freeModeHandoff, readerHandoffFromUrlParams } from '../labReaderHandoff'

const DEVICE = 'free-device'

function proverbs17(): LabSource {
  return {
    ...bibleFallbackSource(),
    chapterNumber: 645, chapterTitle: 'Proverbs 17', chapterLabel: 'Proverbs 17', headerBook: 'Proverbs', headerChapter: '17',
    paragraphs: ['¹ Text.', '² More text.', '³ Still more.'],
    followParagraphs: [{ index: 0, text: '¹ Text.' }], compareParagraphs: [],
    chapters: [{ number: 644, title: 'Proverbs 16', path: 'ch0644.json' }, { number: 645, title: 'Proverbs 17', path: 'ch0645.json' }],
    chaptersProvisional: undefined,
  }
}

const harness: { notePlace: ReturnType<typeof useLabPositionSync>['notePlace'] | null; resolved: boolean | null } = { notePlace: null, resolved: null }

/** The position hook as LabApp mounts it in free reading mode: main.tsx passes `authToken={null}`, so ownerId is null. */
function FreeReader({ placeRef }: { placeRef: MutableRefObject<{ paragraphIndex: number; wordIndex: number }> }) {
  const sync = useLabPositionSync({ book: proverbs17(), placeRef, sourceLocked: false, resolveBeforePaint: true, authToken: null, ownerId: null })
  harness.notePlace = sync.notePlace
  harness.resolved = sync.initialPositionResolved
  return null
}

beforeEach(() => { localStorage.setItem(LAB_POSITION_DEVICE_KEY, DEVICE) })
afterEach(() => {
  cleanup()
  clearLabPositionLocal()
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('free reading mode keeps the place on this device only', () => {
  it('saves every place locally and never reads or writes the account, even when signed in', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(`${init?.method || 'GET'} ${String(input)}`)
      return new Response('{}', { status: 200 })
    }))
    const placeRef = { current: { paragraphIndex: 0, wordIndex: 0 } }
    render(<FreeReader placeRef={placeRef} />)
    await act(async () => { for (let i = 0; i < 6; i++) await Promise.resolve() })
    // No account to wait for: the local place is the answer at once.
    expect(harness.resolved).toBe(true)

    act(() => { harness.notePlace!('page-turn', { paragraphIndex: 2, wordIndex: 1 }) })
    act(() => { harness.notePlace!('hide') })
    await act(async () => { for (let i = 0; i < 6; i++) await Promise.resolve() })

    expect(readLabPositionLocal(DEVICE).books.proverbs).toMatchObject({ sequentialChapter: 645, paragraphIndex: 2, wordIndex: 1 })
    expect(localStorage.getItem(LAB_POSITION_STORAGE_KEY)).toContain('"paragraphIndex":2')
    expect(calls.filter(call => call.includes('/api/lab-position'))).toEqual([])
    // Nothing is left marked for a later upload either.
    expect(localStorage.getItem('tinct-lab-position-dirty')).toBeNull()
  })

  it('opens the saved place on this device, else chapter 1 in Modern English', () => {
    const first = freeModeHandoff('meditations')!
    expect(first).toMatchObject({ bookId: 'meditations', primaryEditionKey: 'modern-en', compareEditionKey: 'original-en', resumeLatest: true })
    expect(first.savedPlace).toMatchObject({ chapterNumber: 1, paragraphIndex: 0 })
    expect(readerHandoffFromUrlParams(new URLSearchParams('book=meditations&mode=free&ref=modern-english'))).toEqual(first)

    const now = Date.now()
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({
      version: 1, deviceId: DEVICE, updatedAt: now,
      books: { meditations: { bookId: 'meditations', headerBook: 'Meditations', chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 4, wordIndex: 2, pageIndex: 0, primaryEditionKey: 'original-en', updatedAt: now, deviceId: DEVICE, rev: 1 } },
      lastSettledBookId: 'meditations', lastSettledAt: now,
    }))
    const resumed = freeModeHandoff('meditations')!
    expect(resumed).toMatchObject({ primaryEditionKey: 'original-en', compareEditionKey: 'modern-en' })
    expect(resumed.savedPlace).toMatchObject({ chapterNumber: 3, paragraphIndex: 4, wordIndex: 2 })
  })
})
