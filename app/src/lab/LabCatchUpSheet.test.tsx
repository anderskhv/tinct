// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 30_000 })
const slow = { timeout: 8_000 }
import { LabCatchUpSheet } from './LabCatchUpSheet'
import { CATCH_UP_INITIAL_WANTED, nextCatchUpKeys, resetCatchUpMemory } from './labCatchUp'
import { CATCH_UP_ROUTE } from '../catchUp'
import { LAB_RECAP_ROUTE } from '../recapSummary'

const chapters = Array.from({ length: 64 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}` }))

type Call = { url: string; body: Record<string, unknown> }

function stubFetch(respond: (call: Call) => { status: number; body: unknown } = () => ({ status: 200, body: {} })) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const call = { url, body: JSON.parse(String(init.body)) }
    calls.push(call)
    const { status, body } = respond(call)
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  }))
  return calls
}

const okBodies = (call: Call) => ({
  status: 200,
  body: call.url === LAB_RECAP_ROUTE
    ? { summary: `So far in ${call.body.chapterNumber}.`, coverage: { chapterNumber: call.body.chapterNumber } }
    : { summary: `Recap of ${call.body.unitId}.` },
})

function renderSheet(overrides: Partial<Parameters<typeof LabCatchUpSheet>[0]> = {}) {
  const props = {
    bookId: 'plain', editionKey, bookTitle: 'Plain', chapters,
    chapterNumber: 61, paragraphIndex: 4, completed: false,
    onClose: vi.fn(), onDiscuss: vi.fn(), ...overrides,
  }
  render(<LabCatchUpSheet {...props} />)
  return props
}

// Each test reads its own edition key: a request still in flight from the previous test may land in the per-tab memory.
let run = 0
let editionKey = 'e0'
beforeEach(() => { run += 1; editionKey = `e${run}`; resetCatchUpMemory() })
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('LabCatchUpSheet', () => {
  it('lists every chapter read so far oldest first and ends at "You are here"', async () => {
    stubFetch(okBodies)
    renderSheet()
    const titles = screen.getAllByTestId('lab-catch-up-entry').map(node => node.querySelector('h3')?.textContent)
    expect(titles).toHaveLength(61)
    expect(titles[0]).toBe('Chapter 1')
    expect(titles.at(-1)).toBe('Chapter 61')
    const timeline = screen.getByTestId('lab-catch-up-body').querySelector('ol')!
    expect(timeline.lastElementChild?.textContent).toBe('You are here')
    expect(screen.getByTestId('lab-catch-up').querySelector('h2')?.textContent).toBe('Catch me up')
    await waitFor(() => expect(screen.getByText('So far in 61.')).toBeTruthy(), slow)
  })

  it('loads progressively, newest first, never everything at once — and never past the reader', async () => {
    const calls = stubFetch(okBodies)
    renderSheet()
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-entry').filter(node => node.getAttribute('data-state') === 'ok')).toHaveLength(CATCH_UP_INITIAL_WANTED), slow)
    // Without a scroll observer only the newest few are asked for.
    expect(calls).toHaveLength(CATCH_UP_INITIAL_WANTED)
    expect(calls[0]).toEqual({ url: LAB_RECAP_ROUTE, body: { bookId: 'plain', editionKey, bookTitle: 'Plain', chapterNumber: 61, paragraphIndex: 4, completed: false } })
    expect(calls[1]).toMatchObject({ url: CATCH_UP_ROUTE, body: { unitId: 'ch-60' } })
    for (const call of calls.slice(1)) {
      expect(call.url).toBe(CATCH_UP_ROUTE)
      expect(Object.keys(call.body).sort()).toEqual(['bookId', 'bookTitle', 'editionKey', 'unitId'])
      expect(Number(String(call.body.unitId).replace('ch-', ''))).toBeLessThan(61)
    }
    expect(screen.getAllByTestId('lab-catch-up-entry')[0].getAttribute('data-state')).toBe('idle')
    expect(screen.getAllByTestId('lab-catch-up-entry')[0].querySelector('.lab-catch-up-placeholder')).toBeTruthy()
  })

  it('a failed entry shows a quiet retry, and the rest of the timeline still loads', async () => {
    let fail = true
    stubFetch(call => call.body.unitId === 'ch-60' && fail ? { status: 502, body: { error: 'x' } } : okBodies(call))
    renderSheet()
    const retry = await screen.findByTestId('lab-catch-up-retry', {}, slow)
    expect(retry.textContent).toBe('Retry')
    expect(await screen.findByText('Recap of ch-59.', {}, slow)).toBeTruthy()
    fail = false
    fireEvent.click(retry)
    await waitFor(() => expect(screen.getByText('Recap of ch-60.')).toBeTruthy(), slow)
  })

  it('a resting AI or a rate limit pauses new requests instead of failing the whole timeline', async () => {
    const calls = stubFetch(() => ({ status: 429, body: { error: 'limit' } }))
    renderSheet()
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-retry').length).toBeGreaterThan(0), slow)
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(calls.length).toBeLessThanOrEqual(2)
  })

  it('the Bible: earlier books come from reading records, the current book is split at the reader\'s chapter', async () => {
    const calls = stubFetch(okBodies)
    const bible = [
      ...Array.from({ length: 3 }, (_, i) => ({ number: i + 1, title: `Ezra ${i + 1}` })),
      ...Array.from({ length: 5 }, (_, i) => ({ number: i + 4, title: `Job ${i + 1}` })),
      ...Array.from({ length: 4 }, (_, i) => ({ number: i + 9, title: `Psalms ${i + 1}` })),
    ]
    renderSheet({ bookId: 'bible', editionKey: 'kjv-en', bookTitle: 'The Bible', chapters: bible, chapterNumber: 11, paragraphIndex: 2, readChapters: () => new Set([2]) })
    const titles = screen.getAllByTestId('lab-catch-up-entry').map(node => node.querySelector('h3')?.textContent)
    expect(titles).toEqual(['Ezra', 'Psalms', 'Psalms 3'])
    await waitFor(() => expect(calls).toHaveLength(3), slow)
    expect(calls.find(call => call.body.unitId === 'book-psalms')?.body.throughChapter).toBe(10)
  })

  it('Discuss hands over to chapter chat; close and Escape close; a reopen is served from memory', async () => {
    const calls = stubFetch(okBodies)
    const props = renderSheet()
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-entry').filter(node => node.getAttribute('data-state') === 'ok')).toHaveLength(CATCH_UP_INITIAL_WANTED), slow)
    fireEvent.click(screen.getByTestId('lab-catch-up-discuss'))
    expect(props.onDiscuss).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByTestId('lab-catch-up-close'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledTimes(2)
    cleanup()
    renderSheet()
    expect(screen.getByText('Recap of ch-60.')).toBeTruthy()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(calls.map(call => String(call.body.unitId ?? call.body.chapterNumber))).toEqual(['61', 'ch-60', 'ch-59', 'ch-58', 'ch-57'])
  })
})

describe('nextCatchUpKeys', () => {
  it('starts wanted idle entries newest first within the concurrency', () => {
    const keys = ['a', 'b', 'c', 'd']
    expect(nextCatchUpKeys({ keys, states: {}, wanted: new Set(keys), concurrency: 2 })).toEqual(['d', 'c'])
    expect(nextCatchUpKeys({ keys, states: { d: 'loading' }, wanted: new Set(keys), concurrency: 2 })).toEqual(['c'])
    expect(nextCatchUpKeys({ keys, states: { d: 'ok', c: 'error' }, wanted: new Set(keys), concurrency: 2 })).toEqual(['b', 'a'])
    expect(nextCatchUpKeys({ keys, states: {}, wanted: new Set(['a']), concurrency: 2 })).toEqual(['a'])
    expect(nextCatchUpKeys({ keys, states: { a: 'loading', b: 'loading' }, wanted: new Set(keys), concurrency: 2 })).toEqual([])
  })
})
