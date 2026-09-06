// @vitest-environment jsdom

import { act, cleanup, render, waitFor } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LAB_POSITION_DEVICE_KEY,
  LAB_POSITION_STORAGE_KEY,
  emptyLabPositionState,
  type LabBookPlace,
  type LabPositionState,
} from './labPosition'
import { clearLabPositionLocal, readLabPositionLocal } from './labPositionStore'
import { bibleFallbackSource, type LabChapter, type LabSource } from './labSource'
import { bookFromResumePlace, bootLabReading, useLabPositionSync } from './useLabPositionSync'

const PHONE = 'phone-device'
const DESK = 'desk-device'

/** Enough of the real KJV manifest to place Proverbs and Hebrews. */
const MANIFEST: LabChapter[] = [
  { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
  { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
  { number: 644, title: 'Proverbs 16', path: 'ch0644.json' },
  { number: 645, title: 'Proverbs 17', path: 'ch0645.json' },
  { number: 646, title: 'Proverbs 18', path: 'ch0646.json' },
  { number: 1134, title: 'Hebrews 1', path: 'ch1134.json' },
  { number: 1135, title: 'Hebrews 2', path: 'ch1135.json' },
  { number: 1136, title: 'Hebrews 3', path: 'ch1136.json' },
]

function proverbs17(over: Partial<LabBookPlace> = {}): LabBookPlace {
  return {
    bookId: 'proverbs',
    headerBook: 'Proverbs',
    chapterNumber: 17,
    sequentialChapter: 645,
    paragraphIndex: 3,
    wordIndex: 7,
    pageIndex: 2,
    updatedAt: 100_000,
    deviceId: PHONE,
    rev: 3,
    ...over,
  }
}

function hebrews3(over: Partial<LabBookPlace> = {}): LabBookPlace {
  return {
    bookId: 'hebrews',
    headerBook: 'Hebrews',
    chapterNumber: 3,
    sequentialChapter: 1136,
    paragraphIndex: 1,
    wordIndex: 4,
    pageIndex: 1,
    updatedAt: 200_000,
    deviceId: DESK,
    rev: 1,
    ...over,
  }
}

function settledProverbsLocal(): LabPositionState {
  return {
    ...emptyLabPositionState(PHONE),
    books: { proverbs: proverbs17() },
    lastSettledBookId: 'proverbs',
    lastSettledAt: 100_000,
    updatedAt: 100_000,
  }
}

function settledHebrewsCloud(): LabPositionState {
  return {
    ...emptyLabPositionState(DESK),
    books: { proverbs: proverbs17(), hebrews: hebrews3() },
    lastSettledBookId: 'hebrews',
    lastSettledAt: 200_000,
    updatedAt: 200_000,
  }
}

/** The reader's book once `loadLabSource` has the real manifest. */
function manifestBook(sequentialChapter: number): LabSource {
  const entry = MANIFEST.find(item => item.number === sequentialChapter)!
  const [headerBook, headerChapter] = [entry.title.replace(/\s+\d+$/, ''), entry.title.match(/(\d+)$/)![1]]
  return {
    ...bibleFallbackSource(),
    chapterNumber: sequentialChapter,
    chapterTitle: entry.title,
    chapterLabel: entry.title,
    headerBook,
    headerChapter,
    paragraphs: ['¹ Text of the chapter.'],
    followParagraphs: [{ index: 0, text: '¹ Text of the chapter.' }],
    compareParagraphs: [],
    chapters: [...MANIFEST],
    chaptersProvisional: undefined,
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}

interface FetchCall { url: string; init?: RequestInit }

function stubPositionApi(cloud: Promise<LabPositionState | null>) {
  const calls: FetchCall[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    if (url.includes('/api/lab-position')) {
      if (init?.method === 'PUT') return { ok: true, json: async () => JSON.parse(String(init.body)) }
      const body = await cloud
      if (!body) return { ok: false, status: 503, json: async () => ({}) }
      return { ok: true, json: async () => body }
    }
    return { ok: false, status: 404, json: async () => ({}) }
  }))
  return {
    calls,
    gets: () => calls.filter(call => call.url.includes('/api/lab-position') && call.init?.method === 'GET'),
    puts: () => calls.filter(call => call.url.includes('/api/lab-position') && call.init?.method === 'PUT'),
  }
}

const harness: {
  notePlace: ReturnType<typeof useLabPositionSync>['notePlace'] | null
  markChapterFinished: ReturnType<typeof useLabPositionSync>['markChapterFinished'] | null
  finishedChapters: Set<number>
} = { notePlace: null, markChapterFinished: null, finishedChapters: new Set() }

function Harness(props: {
  book: LabSource
  placeRef: MutableRefObject<{ paragraphIndex: number; wordIndex: number }>
  onRemoteResume: (place: LabBookPlace) => void
  token?: string | null
}) {
  const { notePlace, markChapterFinished, finishedChapters } = useLabPositionSync({
    book: props.book,
    placeRef: props.placeRef,
    sourceLocked: false,
    authToken: props.token === undefined ? 'signed-in' : props.token,
    onRemoteResume: props.onRemoteResume,
  })
  harness.notePlace = notePlace
  harness.markChapterFinished = markChapterFinished
  harness.finishedChapters = finishedChapters
  return null
}

async function settle() {
  await act(async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve()
  })
}

beforeEach(() => {
  localStorage.setItem(LAB_POSITION_DEVICE_KEY, PHONE)
})

afterEach(() => {
  cleanup()
  harness.notePlace = null
  harness.markChapterFinished = null
  harness.finishedChapters = new Set()
  try { localStorage.removeItem('tinct-lab-finished-chapters') } catch { /* jsdom */ }
  clearLabPositionLocal()
  try { localStorage.removeItem(LAB_POSITION_DEVICE_KEY) } catch { /* jsdom */ }
  try { localStorage.removeItem('tinct-lab-position-dirty') } catch { /* jsdom */ }
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('cloud merge gate (Proverbs 17 / Hebrews 3 flip-flop)', () => {
  it('applies a newer cloud book that arrives before the real manifest', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const cloud = deferred<LabPositionState | null>()
    const api = stubPositionApi(cloud.promise)
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }

    // Boot render: the book is built from the local resume place and still
    // carries the Genesis fallback chapter list.
    const boot = bootLabReading()
    expect(boot.book.headerBook).toBe('Proverbs')
    const view = render(<Harness book={boot.book} placeRef={placeRef} onRemoteResume={onRemoteResume} />)

    // Cloud answers (Hebrews 3, newer) while the manifest is still loading.
    await act(async () => { cloud.resolve(settledHebrewsCloud()) })
    await settle()

    // Manifest arrives: the reader now knows Proverbs 17 and Hebrews 3 exist.
    view.rerender(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)

    await waitFor(() => {
      expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({
        bookId: 'hebrews',
        sequentialChapter: 1136,
        paragraphIndex: 1,
        wordIndex: 4,
      }))
    })
    const stored = readLabPositionLocal(PHONE)
    expect(stored.lastSettledBookId).toBe('hebrews')
    expect(stored.books.hebrews?.sequentialChapter).toBe(1136)
    expect(stored.books.proverbs?.wordIndex).toBe(7)
    expect(api.gets().length).toBeGreaterThan(0)
  })

  it('applies the same cloud book when the manifest arrives first', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const cloud = deferred<LabPositionState | null>()
    stubPositionApi(cloud.promise)
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }

    const view = render(<Harness book={bootLabReading().book} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    view.rerender(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await settle()
    await act(async () => { cloud.resolve(settledHebrewsCloud()) })

    await waitFor(() => {
      expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'hebrews', sequentialChapter: 1136 }))
    })
    expect(readLabPositionLocal(PHONE).lastSettledBookId).toBe('hebrews')
  })

  it('never asks the cloud while the book only has the fallback chapter list', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }

    render(<Harness book={bootLabReading().book} placeRef={placeRef} onRemoteResume={() => {}} />)
    await settle()

    expect(api.gets()).toHaveLength(0)
    expect(readLabPositionLocal(PHONE).lastSettledBookId).toBe('proverbs')
  })

  it('keeps a newer local place when the cloud record is older', async () => {
    const local = settledProverbsLocal()
    local.books.proverbs = proverbs17({ updatedAt: 300_000, rev: 9 })
    local.lastSettledAt = 300_000
    local.updatedAt = 300_000
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(local))
    stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }

    render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await settle()
    await settle()

    expect(onRemoteResume).not.toHaveBeenCalled()
    const stored = readLabPositionLocal(PHONE)
    expect(stored.lastSettledBookId).toBe('proverbs')
    expect(stored.books.hebrews?.sequentialChapter).toBe(1136)
  })

  it('retries the cloud fetch after a failed response once chapters change', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    let answer: LabPositionState | null = null
    const api = stubPositionApi(new Promise<LabPositionState | null>((resolve) => {
      setTimeout(() => resolve(answer), 0)
    }))
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }

    const view = render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await waitFor(() => expect(api.gets()).toHaveLength(1))
    await settle()
    expect(onRemoteResume).not.toHaveBeenCalled()

    answer = settledHebrewsCloud()
    api.calls.length = 0
    vi.unstubAllGlobals()
    const retry = stubPositionApi(Promise.resolve(answer))
    view.rerender(<Harness book={manifestBook(646)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await waitFor(() => expect(retry.gets()).toHaveLength(1))
    await waitFor(() => expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'hebrews' })))
  })
})

describe('writes from the reader', () => {
  it('writes a page turn to localStorage at once and seeds rev from the stored place', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(null))
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }
    render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={() => {}} />)

    act(() => { harness.notePlace!('page-turn', { paragraphIndex: 5, wordIndex: 0 }) })
    const stored = readLabPositionLocal(PHONE)
    expect(stored.books.proverbs).toMatchObject({ sequentialChapter: 645, chapterNumber: 17, paragraphIndex: 5, wordIndex: 0 })
    expect(stored.books.proverbs?.rev).toBe(4)
    expect(stored.lastSettledBookId).toBe('proverbs')
    expect(api.puts()).toHaveLength(0)
  })

  it('PUTs with keepalive on hide and flushes a dirty record when back online', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(null))
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }
    render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={() => {}} />)

    act(() => { harness.notePlace!('hide') })
    await settle()
    const hidePut = api.puts()[api.puts().length - 1]
    expect(hidePut?.init?.keepalive).toBe(true)
    const body = JSON.parse(String(hidePut?.init?.body)) as LabPositionState
    expect(body.books.proverbs).toMatchObject({ sequentialChapter: 645, paragraphIndex: 3, wordIndex: 7 })

    localStorage.setItem('tinct-lab-position-dirty', '1')
    const before = api.puts().length
    act(() => { window.dispatchEvent(new Event('online')) })
    await waitFor(() => expect(api.puts().length).toBe(before + 1))
  })
})

describe('bookFromResumePlace', () => {
  it('marks the boot book as provisional until the manifest replaces it', () => {
    const book = bookFromResumePlace(proverbs17())
    expect(book.headerBook).toBe('Proverbs')
    expect(book.chapterNumber).toBe(645)
    expect(book.chaptersProvisional).toBe(true)
    expect(bibleFallbackSource().chaptersProvisional).toBe(true)
  })
})

describe('finished chapters sync with the position record', () => {
  it('writes a finished chapter to the local record and PUTs it at once, and it is there after a reload', async () => {
    const api = stubPositionApi(Promise.resolve(null))
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }
    const { unmount } = render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={() => {}} />)
    await settle()
    expect(harness.finishedChapters.size).toBe(0)
    act(() => { harness.markChapterFinished!(645) })
    expect(harness.finishedChapters).toEqual(new Set([645]))
    expect(readLabPositionLocal(PHONE).finished).toEqual({ bible: [645] })
    await settle()
    const put = api.puts()[api.puts().length - 1]
    expect(put).toBeTruthy()
    expect(JSON.parse(String(put!.init?.body)).finished).toEqual({ bible: [645] })
    unmount()
    render(<Harness book={manifestBook(646)} placeRef={placeRef} onRemoteResume={() => {}} token={null} />)
    expect(harness.finishedChapters).toEqual(new Set([645]))
  })

  it('adopts finished chapters from the cloud and the legacy device list on boot', async () => {
    localStorage.setItem('tinct-lab-finished-chapters', JSON.stringify([644]))
    stubPositionApi(Promise.resolve({ ...settledProverbsLocal(), deviceId: DESK, finished: { bible: [1134], odyssey: [2] } }))
    const placeRef = { current: { paragraphIndex: 0, wordIndex: 0 } }
    render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={() => {}} />)
    expect(harness.finishedChapters).toEqual(new Set([644]))
    expect(localStorage.getItem('tinct-lab-finished-chapters')).toBeNull()
    await waitFor(() => {
      expect(harness.finishedChapters).toEqual(new Set([644, 1134]))
    })
    expect(readLabPositionLocal(PHONE).finished).toEqual({ bible: [644, 1134], odyssey: [2] })
  })
})
