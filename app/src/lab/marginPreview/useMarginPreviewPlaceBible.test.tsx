// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LAB_POSITION_DEVICE_KEY, LAB_POSITION_STORAGE_KEY, emptyLabPositionState, type LabBookPlace, type LabPositionState } from '../labPosition'
import { readLabPositionLocal } from '../labPositionStore'
import { pendingBibleChapter } from './marginPreviewBible'
import type { MarginPreviewBook, MarginPreviewChapter } from './marginPreviewModel'
import { useMarginPreviewPlace } from './useMarginPreviewPlace'

// The Bible's place in the margin view goes through the Bible reader's own position path: one pin per biblical book
// (labPosition.ts), never one under `bible`, and another book's pin is left as it was (AGENTS.md, position invariants).
const para = (n: number) => ({ text: Array.from({ length: n }, (_, i) => `w${i}`).join(' ') })
const loaded = (number: number, title: string): MarginPreviewChapter => ({ number, title, section: title.replace(/ \d+$/, ''), paragraphs: [para(8), para(12), para(6), para(9)] })
const chapters: MarginPreviewChapter[] = [
  loaded(1, 'Genesis 1'), loaded(2, 'Genesis 2'),
  pendingBibleChapter({ number: 3, title: 'Genesis 3', paragraphCount: 4 }),
  loaded(500, 'Psalms 22'), loaded(501, 'Psalms 23'), loaded(502, 'Psalms 24'),
]
const model: MarginPreviewBook = {
  bookId: 'bible', editionKey: 'bsb-en', editionLabel: 'Berean Standard Bible', title: 'The Bible', author: 'Various',
  language: 'en', chapters, start: { chapterNumber: 501, paragraphIndex: 1, wordIndex: 5, updatedAt: 1000 }, normalHref: '/reader?book=bible&margin=0',
}
const pin = (over: Partial<LabBookPlace>): LabBookPlace => ({
  bookId: 'psalms', headerBook: 'Psalms', chapterNumber: 23, sequentialChapter: 501, paragraphIndex: 1, wordIndex: 5,
  primaryEditionKey: 'bsb-en', updatedAt: 1000, deviceId: 'phone', rev: 1, ...over,
})
const genesis = pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 3, wordIndex: 1, updatedAt: 900 })
const record = (...pins: LabBookPlace[]): LabPositionState => ({
  ...emptyLabPositionState('phone', 'user-1'), books: Object.fromEntries(pins.map(p => [p.bookId, p])),
  lastSettledBookId: pins[0].bookId, lastSettledAt: pins[0].updatedAt, updatedAt: pins[0].updatedAt,
})

let cloud: LabPositionState
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(LAB_POSITION_DEVICE_KEY, 'desk')
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!String(input).includes('/api/lab-position')) return new Response('{}', { status: 404 })
    if (init?.method === 'PUT') return new Response('{}', { status: 200 })
    return new Response(JSON.stringify(cloud), { status: 200 })
  }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const render = () => renderHook(() => useMarginPreviewPlace(model, 'user-1', { authToken: 'token', ownerId: 'user-1' }))

describe('useMarginPreviewPlace: the Bible', () => {
  it('writes the place as its biblical book\'s pin; another book\'s pin is untouched; nothing under `bible`', async () => {
    cloud = record(pin({}), genesis)
    const { result } = render()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await act(async () => { await Promise.resolve() })
    act(() => result.current.report({ kind: 'open', spot: { page: 5, para: 1, word: 5 }, target: { page: 5, para: 1, word: 5 }, interactions: 0 }))
    await waitFor(() => expect(readLabPositionLocal().books.psalms?.deviceId).toBe('desk'))
    act(() => result.current.report({ kind: 'move', spot: { page: 6, para: 2, word: 0 }, interactions: 3 }))
    const state = readLabPositionLocal()
    expect(state.books.psalms).toMatchObject({ bookId: 'psalms', headerBook: 'Psalms', chapterNumber: 24, sequentialChapter: 502, paragraphIndex: 2, wordIndex: 0, primaryEditionKey: 'bsb-en' })
    expect(state.books.bible).toBeUndefined()
    expect(state.books['the-bible']).toBeUndefined()
    expect(state.books.genesis).toMatchObject({ chapterNumber: 2, paragraphIndex: 3, wordIndex: 1, updatedAt: 900 })
    expect(state.lastSettledBookId).toBe('psalms')
    // Psalms 23 read through on the way: finished under the Bible's numbers, as the Bible reader keeps them.
    expect(state.finished.bible).toEqual([501])
  })

  it('a view in a chapter not loaded yet writes nothing', async () => {
    cloud = record(pin({}))
    const { result } = render()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await act(async () => { await Promise.resolve() })
    act(() => result.current.report({ kind: 'open', spot: { page: 5, para: 1, word: 5 }, target: { page: 5, para: 1, word: 5 }, interactions: 0 }))
    await waitFor(() => expect(readLabPositionLocal().books.psalms?.deviceId).toBe('desk'))
    const before = readLabPositionLocal().books.psalms
    act(() => result.current.report({ kind: 'move', spot: { page: 3, para: 0, word: 0 }, interactions: 4 }))
    expect(readLabPositionLocal().books.psalms).toEqual(before)
    expect(readLabPositionLocal().books.genesis).toBeUndefined()
  })

  it('follows another device\'s newer pin in another biblical book to its chapter in the list', async () => {
    const phone = pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 2, wordIndex: 4, updatedAt: Date.now() + 5000 })
    cloud = record(phone)
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ ...record(pin({ deviceId: 'desk' })), owner: 'user-1', deviceId: 'desk' }))
    const go = vi.fn()
    const { result } = render()
    act(() => { result.current.listen(go) })
    act(() => result.current.report({ kind: 'open', spot: { page: 5, para: 1, word: 5 }, target: { page: 5, para: 1, word: 5 }, interactions: 0 }))
    await waitFor(() => expect(go).toHaveBeenCalledWith({ page: 2, para: 2, word: 4 }))
  })
})
