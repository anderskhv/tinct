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
import * as sourceModule from './labSource'
import { bibleFallbackSource, type LabChapter, type LabSource } from './labSource'
import { bookFromResumePlace, bootLabReading, remoteResumeSelection, useLabPositionSync } from './useLabPositionSync'
import { readLabPrefs } from './labPrefs'

const PHONE = 'phone-device'
const READER = 'user-reader'
const OTHER_ACCOUNT = 'user-github'
const DESK = 'desk-device'

/** Enough of the real KJV manifest to place Proverbs and Hebrews. */
const MANIFEST: LabChapter[] = [
  { number: 1, title: 'Genesis 1', path: 'ch0001.json' },
  { number: 2, title: 'Genesis 2', path: 'ch0002.json' },
  { number: 773, title: 'Jeremiah 37', path: 'ch0773.json' },
  { number: 774, title: 'Jeremiah 38', path: 'ch0774.json' },
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

function jeremiah38(over: Partial<LabBookPlace> = {}): LabBookPlace {
  return {
    bookId: 'jeremiah',
    headerBook: 'Jeremiah',
    chapterNumber: 38,
    sequentialChapter: 774,
    paragraphIndex: 6,
    wordIndex: 3,
    pageIndex: 2,
    updatedAt: 500_000,
    deviceId: DESK,
    rev: 12,
    ...over,
  }
}

/** The account's real row: a long Bible history, settled in Jeremiah 38. */
function settledJeremiahCloud(owner?: string): LabPositionState {
  return {
    ...emptyLabPositionState(DESK),
    books: { jeremiah: jeremiah38(), proverbs: proverbs17() },
    finished: { bible: [773] },
    lastSettledBookId: 'jeremiah',
    lastSettledAt: 500_000,
    updatedAt: 500_000,
    ...(owner ? { owner } : {}),
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
  initialPositionResolved: boolean | null
  /** Every value `initialPositionResolved` took, in render order. */
  resolvedTrail: boolean[]
} = { notePlace: null, markChapterFinished: null, finishedChapters: new Set(), initialPositionResolved: null, resolvedTrail: [] }

function Harness(props: {
  book: LabSource
  placeRef: MutableRefObject<{ paragraphIndex: number; wordIndex: number }>
  onRemoteResume: (place: LabBookPlace) => void
  onResolvedPlace?: (place: LabBookPlace) => void
  interactedRef?: MutableRefObject<boolean>
  token?: string | null
  ownerId?: string | null
  sourceLocked?: boolean
  initialCloudWaitMs?: number
  resolveBeforePaint?: boolean
}) {
  const { notePlace, markChapterFinished, finishedChapters, initialPositionResolved } = useLabPositionSync({
    book: props.book,
    placeRef: props.placeRef,
    sourceLocked: props.sourceLocked ?? false,
    authToken: props.token === undefined ? 'signed-in' : props.token,
    ownerId: props.ownerId === undefined ? READER : props.ownerId,
    onRemoteResume: props.onRemoteResume,
    onResolvedPlace: props.onResolvedPlace,
    interactedRef: props.interactedRef,
    initialCloudWaitMs: props.initialCloudWaitMs,
    resolveBeforePaint: props.resolveBeforePaint,
  })
  harness.notePlace = notePlace
  harness.markChapterFinished = markChapterFinished
  harness.finishedChapters = finishedChapters
  if (harness.resolvedTrail[harness.resolvedTrail.length - 1] !== initialPositionResolved) harness.resolvedTrail.push(initialPositionResolved)
  harness.initialPositionResolved = initialPositionResolved
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
  harness.initialPositionResolved = null
  harness.resolvedTrail = []
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

  it('never merges the cloud while the book only has the fallback chapter list', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledHebrewsCloud()))
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }

    render(<Harness book={bootLabReading().book} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await settle()

    // The GET is warmed at once so the merge does not wait on the network,
    // but nothing is merged or followed against the Genesis fallback list.
    expect(api.gets()).toHaveLength(1)
    expect(onRemoteResume).not.toHaveBeenCalled()
    expect(harness.initialPositionResolved).toBe(false)
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

    // The failed answer resolved the first place: the reader painted Proverbs.
    expect(harness.initialPositionResolved).toBe(true)

    answer = settledHebrewsCloud()
    api.calls.length = 0
    vi.unstubAllGlobals()
    const retry = stubPositionApi(Promise.resolve(answer))
    view.rerender(<Harness book={manifestBook(646)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await waitFor(() => expect(retry.gets()).toHaveLength(1))
    // The retried record merges (Hebrews is the settled book for the next
    // open) but a painted reader is never moved to another book.
    await waitFor(() => expect(readLabPositionLocal(PHONE).lastSettledBookId).toBe('hebrews'))
    await settle()
    expect(onRemoteResume).not.toHaveBeenCalled()
  })
})

describe('initial resolution: one place before first paint', () => {
  function proverbs18(over: Partial<LabBookPlace> = {}): LabBookPlace {
    return proverbs17({ chapterNumber: 18, sequentialChapter: 646, paragraphIndex: 0, wordIndex: 0, pageIndex: 0, updatedAt: 300_000, deviceId: DESK, rev: 1, ...over })
  }

  it('signed out: resolved at once, the local place is final', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} token={null} />)
    await settle()
    expect(harness.resolvedTrail).toEqual([true])
    expect(api.gets()).toHaveLength(0)
    expect(onRemoteResume).not.toHaveBeenCalled()
  })

  it('a library handoff is the resolved place: the cloud never moves it', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} sourceLocked />)
    await settle()
    expect(harness.resolvedTrail).toEqual([true])
    expect(api.gets()).toHaveLength(0)
    expect(onRemoteResume).not.toHaveBeenCalled()
  })

  it('local Proverbs 17, cloud Hebrews 3 newer: stays unresolved until the merge, then moves exactly once', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const cloud = deferred<LabPositionState | null>()
    stubPositionApi(cloud.promise)
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }
    const view = render(<Harness book={bootLabReading().book} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    expect(harness.initialPositionResolved).toBe(false)
    view.rerender(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={onRemoteResume} />)
    await settle()
    // Manifest in, cloud still pending: nothing may paint yet.
    expect(harness.initialPositionResolved).toBe(false)
    expect(onRemoteResume).not.toHaveBeenCalled()
    await act(async () => { cloud.resolve(settledHebrewsCloud()) })
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
    expect(onRemoteResume).toHaveBeenCalledTimes(1)
    expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'hebrews', sequentialChapter: 1136 }))
    expect(harness.resolvedTrail).toEqual([false, true])
  })

  it('local Proverbs 17 newer than cloud Hebrews 3: resolves to the local place, no move', async () => {
    const local = settledProverbsLocal()
    local.books.proverbs = proverbs17({ updatedAt: 300_000, rev: 9 })
    local.lastSettledAt = 300_000
    local.updatedAt = 300_000
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(local))
    stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} />)
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
    await settle()
    expect(onRemoteResume).not.toHaveBeenCalled()
    expect(harness.resolvedTrail).toEqual([false, true])
  })

  it('cloud same chapter, further in: restores the place without a reload', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const further = { ...settledProverbsLocal(), books: { proverbs: proverbs17({ paragraphIndex: 9, wordIndex: 2, updatedAt: 250_000, deviceId: DESK }) }, lastSettledAt: 250_000, updatedAt: 250_000, deviceId: DESK }
    stubPositionApi(Promise.resolve(further))
    const onRemoteResume = vi.fn()
    const onResolvedPlace = vi.fn()
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }
    render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={onRemoteResume} onResolvedPlace={onResolvedPlace} />)
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
    expect(onRemoteResume).not.toHaveBeenCalled()
    expect(onResolvedPlace).toHaveBeenCalledWith(expect.objectContaining({ paragraphIndex: 9, wordIndex: 2 }))
    expect(placeRef.current).toEqual({ paragraphIndex: 9, wordIndex: 2 })
  })

  it('a failed cloud answer resolves to the local place', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    stubPositionApi(Promise.resolve(null))
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} />)
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
    expect(onRemoteResume).not.toHaveBeenCalled()
  })

  it('the bounded wait paints the local place; a late record for another book is merged, never followed', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const cloud = deferred<LabPositionState | null>()
    stubPositionApi(cloud.promise)
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} initialCloudWaitMs={5} />)
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
    await act(async () => { cloud.resolve(settledHebrewsCloud()) })
    await waitFor(() => expect(readLabPositionLocal(PHONE).lastSettledBookId).toBe('hebrews'))
    await settle()
    expect(onRemoteResume).not.toHaveBeenCalled()
  })

  it('a late record inside the same book is followed forward only, and never after the reader touched the page', async () => {
    const run = async (cloudState: LabPositionState, interacted: boolean) => {
      localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
      const cloud = deferred<LabPositionState | null>()
      stubPositionApi(cloud.promise)
      const onRemoteResume = vi.fn()
      const onResolvedPlace = vi.fn()
      const interactedRef = { current: interacted }
      const view = render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} onResolvedPlace={onResolvedPlace} interactedRef={interactedRef} initialCloudWaitMs={5} />)
      await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
      await act(async () => { cloud.resolve(cloudState) })
      await settle()
      await settle()
      view.unmount()
      clearLabPositionLocal()
      vi.unstubAllGlobals()
      return { onRemoteResume, onResolvedPlace }
    }
    const forward: LabPositionState = { ...emptyLabPositionState(DESK), books: { proverbs: proverbs18() }, lastSettledBookId: 'proverbs', lastSettledAt: 300_000, updatedAt: 300_000 }
    const back: LabPositionState = { ...emptyLabPositionState(DESK), books: { proverbs: proverbs17({ chapterNumber: 16, sequentialChapter: 644, updatedAt: 300_000, deviceId: DESK }) }, lastSettledBookId: 'proverbs', lastSettledAt: 300_000, updatedAt: 300_000 }
    const sameFurther: LabPositionState = { ...emptyLabPositionState(DESK), books: { proverbs: proverbs17({ paragraphIndex: 8, updatedAt: 300_000, deviceId: DESK }) }, lastSettledBookId: 'proverbs', lastSettledAt: 300_000, updatedAt: 300_000 }

    const followed = await run(forward, false)
    expect(followed.onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'proverbs', sequentialChapter: 646 }))

    const backward = await run(back, false)
    expect(backward.onRemoteResume).not.toHaveBeenCalled()
    expect(backward.onResolvedPlace).not.toHaveBeenCalled()

    const touched = await run(forward, true)
    expect(touched.onRemoteResume).not.toHaveBeenCalled()

    const further = await run(sameFurther, false)
    expect(further.onRemoteResume).not.toHaveBeenCalled()
    expect(further.onResolvedPlace).toHaveBeenCalledWith(expect.objectContaining({ paragraphIndex: 8 }))
  })
})

describe('writes from the reader', () => {
  it('writes a page turn to localStorage at once and seeds rev from the stored place', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const api = stubPositionApi(Promise.resolve(null))
    const placeRef = { current: { paragraphIndex: 3, wordIndex: 7 } }
    render(<Harness book={manifestBook(645)} placeRef={placeRef} onRemoteResume={() => {}} />)
    // The cloud answered (empty): the first place is resolved and notes flow.
    await settle()
    expect(harness.initialPositionResolved).toBe(true)

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
    await settle()

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

describe('remoteResumeSelection', () => {
  const prefs = { ...readLabPrefs('phone'), primaryEdition: 'kjv-en', compareEdition: 'web-en', compareOpen: false }

  it('a biblical pin is the Bible, in the current editions', () => {
    const selection = remoteResumeSelection(hebrews3(), { libraryBookId: 'bible', prefs })
    expect(selection).toMatchObject({ bookId: 'bible', primaryEditionKey: 'kjv-en', compareEditionKey: undefined })
    expect(selection?.prefs).toBe(prefs)
  })

  it('a registry pin is that book, never the open book\'s loader with its chapter number (Crito 3 is not Genesis 3)', () => {
    const crito: LabBookPlace = { ...hebrews3(), bookId: 'crito', headerBook: 'Crito', chapterNumber: 3, sequentialChapter: 3, primaryEditionKey: undefined }
    const selection = remoteResumeSelection(crito, { libraryBookId: 'bible', prefs })
    expect(selection?.bookId).toBe('crito')
    expect(selection?.primaryEditionKey).not.toBe('kjv-en')
    expect(selection?.prefs.primaryEdition).toBe(selection?.primaryEditionKey)
    expect(selection?.prefs).not.toBe(prefs)
  })

  it('keeps the edition the registry pin was read in when that book offers it', () => {
    const odyssey: LabBookPlace = { ...hebrews3(), bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2, primaryEditionKey: 'modern-en' }
    const selection = remoteResumeSelection(odyssey, { libraryBookId: 'crito', prefs })
    expect(selection).toMatchObject({ bookId: 'odyssey', primaryEditionKey: 'modern-en' })
  })
})

describe('sign-in restore (2026-09-07 Genesis 1 incident)', () => {
  /**
   * A device wiped by sign-out signs back in. The reader has nothing local,
   * paints the Genesis 1 fallback, and the bounded paint wait expires before
   * the account's record answers. Leaving the page must not settle that
   * fallback as the account's place, and the record that comes back must
   * still be the reader's real one.
   */
  it('a fallback painted before the cloud answers never becomes the account place', async () => {
    const cloud = deferred<LabPositionState | null>()
    const api = stubPositionApi(cloud.promise)
    const onRemoteResume = vi.fn()
    const placeRef = { current: { paragraphIndex: 0, wordIndex: 0 } }

    const boot = bootLabReading()
    expect(boot.book.headerBook).toBe('Genesis')
    const view = render(<Harness book={boot.book} placeRef={placeRef} onRemoteResume={onRemoteResume} initialCloudWaitMs={5} />)
    view.rerender(<Harness book={manifestBook(1)} placeRef={placeRef} onRemoteResume={onRemoteResume} initialCloudWaitMs={5} />)
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))

    // The reader leaves the page while the record is still in flight.
    act(() => { harness.notePlace!('hide') })
    await settle()
    expect(readLabPositionLocal(PHONE).lastSettledBookId).not.toBe('genesis')
    expect(api.puts().map(put => (JSON.parse(String(put.init?.body)) as LabPositionState).lastSettledBookId)).not.toContain('genesis')

    await act(async () => { cloud.resolve(settledJeremiahCloud(READER)) })
    await waitFor(() => expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'jeremiah', sequentialChapter: 774 })))
    const stored = readLabPositionLocal(PHONE)
    expect(stored.lastSettledBookId).toBe('jeremiah')
    expect(stored.books.jeremiah?.chapterNumber).toBe(38)
  })

  /**
   * The same device read Genesis 1 anonymously between sign-out and sign-in.
   * That pin is newer in wall-clock time than the account's record, but the
   * account's own place still wins: the local record was never this
   * account's.
   */
  it('an anonymous Genesis pin does not outrank the account record on first sign-in', async () => {
    const anonymous: LabPositionState = {
      ...emptyLabPositionState(PHONE),
      books: { genesis: { bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 900_000, deviceId: PHONE, rev: 1 } },
      lastSettledBookId: 'genesis',
      lastSettledAt: 900_000,
      updatedAt: 900_000,
    }
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(anonymous))
    stubPositionApi(Promise.resolve(settledJeremiahCloud(READER)))
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(1)} placeRef={{ current: { paragraphIndex: 0, wordIndex: 0 } }} onRemoteResume={onRemoteResume} />)

    await waitFor(() => expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'jeremiah', sequentialChapter: 774 })))
    const stored = readLabPositionLocal(PHONE)
    expect(stored.lastSettledBookId).toBe('jeremiah')
    // The anonymous pin is adopted, not thrown away.
    expect(stored.books.genesis?.chapterNumber).toBe(1)
    expect(stored.owner).toBe(READER)
  })

  /**
   * Signing in with a second provider makes a second account. That account
   * must not inherit — or push to its own row — the place the previous
   * account left on this device.
   */
  it('another account record on the device is never adopted or pushed', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ ...settledJeremiahCloud(READER) , deviceId: PHONE }))
    const api = stubPositionApi(Promise.resolve(emptyLabPositionState(OTHER_ACCOUNT)))
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(1)} placeRef={{ current: { paragraphIndex: 0, wordIndex: 0 } }} onRemoteResume={onRemoteResume} ownerId={OTHER_ACCOUNT} />)
    await waitFor(() => expect(harness.initialPositionResolved).toBe(true))
    await settle()

    act(() => { harness.notePlace!('hide') })
    await settle()

    const stored = readLabPositionLocal(PHONE)
    expect(stored.books.jeremiah).toBeUndefined()
    expect(stored.books.proverbs).toBeUndefined()
    expect(stored.finished.bible ?? []).not.toContain(773)
    expect(onRemoteResume).not.toHaveBeenCalled()
    for (const put of api.puts()) {
      const body = JSON.parse(String(put.init?.body)) as LabPositionState
      expect(body.books.jeremiah).toBeUndefined()
      expect(body.books.proverbs).toBeUndefined()
    }
  })
})

describe('verified return before first paint', () => {
  it('does not expose a stale place when the old paint deadline passes', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const cloud = deferred<LabPositionState | null>()
    stubPositionApi(cloud.promise)
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} initialCloudWaitMs={5} resolveBeforePaint />)
    await act(async () => { await new Promise(r => setTimeout(r, 25)) })
    expect(harness.initialPositionResolved).toBe(false)
    await act(async () => { cloud.resolve(settledHebrewsCloud()) })
    await waitFor(() => expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'hebrews', sequentialChapter: 1136 })))
    expect(harness.initialPositionResolved).toBe(true)
  })
  it('validates the cloud destination from its manifest while local chapter text is still loading', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    stubPositionApi(Promise.resolve(settledHebrewsCloud()))
    const load = vi.spyOn(sourceModule, 'loadLabChapterList').mockResolvedValue(MANIFEST)
    const onRemoteResume = vi.fn()
    render(<Harness book={bookFromResumePlace(proverbs17())} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} resolveBeforePaint />)
    await waitFor(() => expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ sequentialChapter: 1136 })))
    expect(load).toHaveBeenCalledWith('bible', expect.any(String))
    load.mockRestore()
  })
  it('also resolves a newer place in a different library book, using that book’s manifest', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(settledProverbsLocal()))
    const odyssey = { ...proverbs17(), bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 2, sequentialChapter: 2, updatedAt: 800000, primaryEditionKey: 'original-en' }
    stubPositionApi(Promise.resolve({ ...settledHebrewsCloud(), books: { odyssey }, lastSettledBookId: 'odyssey', lastSettledAt: 800000 }))
    const load = vi.spyOn(sourceModule, 'loadLabChapterList').mockResolvedValue([{ number: 1, title: 'Book 1' }, { number: 2, title: 'Book 2' }])
    const onRemoteResume = vi.fn()
    render(<Harness book={manifestBook(645)} placeRef={{ current: { paragraphIndex: 3, wordIndex: 7 } }} onRemoteResume={onRemoteResume} resolveBeforePaint />)
    await waitFor(() => expect(onRemoteResume).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'odyssey', sequentialChapter: 2 })))
    expect(load).toHaveBeenCalledWith('odyssey', 'original-en')
    load.mockRestore()
  })
})
