// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LAB_POSITION_DEVICE_KEY, LAB_POSITION_STORAGE_KEY, emptyLabPositionState, type LabBookPlace, type LabPositionState } from '../labPosition'
import { readLabPositionLocal } from '../labPositionStore'
import type { MarginPreviewBook, MarginPreviewChapter } from './marginPreviewModel'
import { useMarginPreviewPlace } from './useMarginPreviewPlace'

const para = (n: number) => ({ text: Array.from({ length: n }, (_, i) => `w${i}`).join(' ') })
const chapters: MarginPreviewChapter[] = [1, 2, 3].map(number => ({ number, title: `Chapter ${number}`, paragraphs: [para(8), para(12), para(6), para(9)] }))
const model: MarginPreviewBook = {
  bookId: 'frankenstein', editionKey: 'modern-en', editionLabel: 'Modern English', title: 'Frankenstein', author: 'Mary Shelley',
  language: 'en', chapters, start: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 5, updatedAt: 1000 }, normalHref: '/reader?book=frankenstein&margin=0',
}
const place = (over: Partial<LabBookPlace>): LabBookPlace => ({
  bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 1, wordIndex: 5,
  primaryEditionKey: 'modern-en', updatedAt: 1000, deviceId: 'phone', rev: 1, ...over,
})
const record = (p: LabBookPlace): LabPositionState => ({ ...emptyLabPositionState('phone', 'user-1'), books: { frankenstein: p }, lastSettledBookId: 'frankenstein', lastSettledAt: p.updatedAt, updatedAt: p.updatedAt })

let cloud: LabPositionState
let puts: LabPositionState[]
let answer: () => Promise<void>
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(LAB_POSITION_DEVICE_KEY, 'desk')
  puts = []
  answer = () => Promise.resolve()
  vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (!String(_input).includes('/api/lab-position')) return new Response('{}', { status: 404 })
    if (init?.method === 'PUT') { const body = JSON.parse(String(init.body)); puts.push(body); return new Response('{}', { status: 200 }) }
    await answer()
    return new Response(JSON.stringify(cloud), { status: 200 })
  }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers() })

const render = () => renderHook(() => useMarginPreviewPlace(model, 'user-1', { authToken: 'token', ownerId: 'user-1' }))

describe('useMarginPreviewPlace: the margin view\'s place through the book reader\'s position path', () => {
  it('waits for the account\'s record, then writes the restored word as the book\'s settled place', async () => {
    cloud = record(place({ updatedAt: 1000 }))
    let release!: () => void
    answer = () => new Promise(resolve => { release = resolve })
    const { result } = render()
    // Reported while the account has not answered: nothing written yet.
    act(() => result.current.report({ kind: 'open', spot: { page: 2, para: 1, word: 5 }, target: { page: 2, para: 1, word: 5 }, interactions: 0 }))
    expect(readLabPositionLocal().books.frankenstein).toBeUndefined()
    await waitFor(() => expect(typeof release).toBe('function'))
    await act(async () => { release(); await Promise.resolve() })
    await waitFor(() => expect(readLabPositionLocal().lastSettledBookId).toBe('frankenstein'))
    const written = readLabPositionLocal().books.frankenstein
    expect(written).toMatchObject({ chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 1, wordIndex: 5, primaryEditionKey: 'modern-en', pageIndex: 0, deviceId: 'desk' })
    expect(written.updatedAt).toBeGreaterThan(1000)
    await waitFor(() => expect(puts.some(p => p.books.frankenstein?.paragraphIndex === 1 && p.books.frankenstein.deviceId === 'desk')).toBe(true))
  })

  it('a move the reader made is written; a reflow back up without an action is not', async () => {
    cloud = record(place({ updatedAt: 1000 }))
    const { result } = render()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    await act(async () => { await Promise.resolve() })
    act(() => result.current.report({ kind: 'open', spot: { page: 2, para: 1, word: 5 }, target: { page: 2, para: 1, word: 5 }, interactions: 0 }))
    await waitFor(() => expect(readLabPositionLocal().books.frankenstein?.deviceId).toBe('desk'))
    act(() => result.current.report({ kind: 'move', spot: { page: 3, para: 2, word: 0 }, interactions: 4, screen: 1 }))
    expect(readLabPositionLocal().books.frankenstein).toMatchObject({ chapterNumber: 3, paragraphIndex: 2, wordIndex: 0 })
    // Read to its end on the way: chapter 2 is finished, as the book reader marks it.
    expect(readLabPositionLocal().finished.frankenstein).toEqual([2])
    act(() => result.current.report({ kind: 'move', spot: { page: 3, para: 1, word: 0 }, interactions: 4 }))
    expect(readLabPositionLocal().books.frankenstein).toMatchObject({ chapterNumber: 3, paragraphIndex: 2 })
  })

  it('follows a newer place from another device: the frame is moved there, and it is not written back', async () => {
    const phone = place({ chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 3, wordIndex: 2, updatedAt: Date.now() + 5000 })
    cloud = record(phone)
    // The device knew an older place in chapter 2 (as the frame opened).
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ ...record(place({ updatedAt: 1000, deviceId: 'desk' })), owner: 'user-1', deviceId: 'desk' }))
    const go = vi.fn()
    const { result } = render()
    act(() => { result.current.listen(go) })
    act(() => result.current.report({ kind: 'open', spot: { page: 2, para: 1, word: 5 }, target: { page: 2, para: 1, word: 5 }, interactions: 0 }))
    await waitFor(() => expect(go).toHaveBeenCalledWith({ page: 3, para: 3, word: 2 }))
    act(() => result.current.report({ kind: 'open', spot: { page: 3, para: 3, word: 2 }, target: { page: 3, para: 3, word: 2 }, interactions: 0 }))
    const stored = readLabPositionLocal().books.frankenstein
    expect(stored).toMatchObject({ chapterNumber: 3, paragraphIndex: 3, wordIndex: 2, deviceId: 'phone', updatedAt: phone.updatedAt })
  })

  it('does not move the frame to the account\'s first answer once the reader has acted', async () => {
    const phone = place({ chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 3, wordIndex: 2, updatedAt: Date.now() + 5000 })
    cloud = record(phone)
    let release!: () => void
    answer = () => new Promise(resolve => { release = resolve })
    const go = vi.fn()
    const { result } = render()
    act(() => { result.current.listen(go) })
    act(() => result.current.report({ kind: 'open', spot: { page: 2, para: 1, word: 5 }, target: { page: 2, para: 1, word: 5 }, interactions: 0 }))
    act(() => result.current.report({ kind: 'move', spot: { page: 2, para: 2, word: 0 }, interactions: 3 }))
    await waitFor(() => expect(typeof release).toBe('function'))
    await act(async () => { release(); await Promise.resolve() })
    await waitFor(() => expect(readLabPositionLocal().books.frankenstein?.deviceId).toBe('desk'))
    expect(go).not.toHaveBeenCalled()
    expect(readLabPositionLocal().books.frankenstein).toMatchObject({ chapterNumber: 2, paragraphIndex: 2, wordIndex: 0 })
  })
})
