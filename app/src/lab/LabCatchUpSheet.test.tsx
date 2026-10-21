// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 30_000 })
const slow = { timeout: 8_000 }
import { LabCatchUpSheet } from './LabCatchUpSheet'
import { CATCH_UP_CONCURRENCY, catchUpContextText, fetchCatchUpEntry, nextCatchUpKeys, resetCatchUpMemory } from './labCatchUp'
import { CATCH_UP_ROUTE } from '../catchUp'
import { LAB_RECAP_ROUTE } from '../recapSummary'
import { LAB_COPY } from './labCopy'

// Short early chapters (58 × 120 words, one group of about 23 pages), then chapters of normal length.
const chapters = Array.from({ length: 64 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, wordCount: i < 58 ? 120 : 3_000 }))

/** Chapters of normal length (ten pages each). */
const normal = chapters.map(chapter => ({ ...chapter, wordCount: 3_000 }))

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
    onClose: vi.fn(), onChat: vi.fn(), onTalk: vi.fn(), ...overrides,
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
  const titles = () => screen.getAllByTestId('lab-catch-up-entry').map(node => node.querySelector('h3')?.textContent)

  it('one compact block for the earlier chapters, then the last two chapters each, and ends at "You are here" — never the current chapter', async () => {
    const calls = stubFetch(okBodies)
    renderSheet()
    expect(titles()).toEqual(['Chapter 1 – Chapter 58', 'Chapter 59', 'Chapter 60'])
    const timeline = screen.getByTestId('lab-catch-up-body').querySelector('ol')!
    expect(timeline.lastElementChild?.textContent).toBe('You are here')
    expect(screen.getByTestId('lab-catch-up').querySelector('h2')?.textContent).toBe('Catch me up')
    await waitFor(() => expect(screen.getByText('Recap of chs-1-58.')).toBeTruthy(), slow)
    await waitFor(() => expect(calls).toHaveLength(3), slow)
    // Three requests (was 61), oldest first, ids only, nothing at or past chapter 61.
    expect(calls.map(call => call.body.unitId)).toEqual(['chs-1-58', 'ch-59', 'ch-60'])
    for (const call of calls) {
      expect(call.url).toBe(CATCH_UP_ROUTE)
      expect(Object.keys(call.body).sort()).toEqual(['bookId', 'bookTitle', 'editionKey', 'placeChapter', 'unitId'])
      // The reader's chapter travels with every request (the Worker refuses anything at or past it).
      expect(call.body.placeChapter).toBe(61)
    }
    expect(calls.some(call => call.url === LAB_RECAP_ROUTE)).toBe(false)
  })

  it('never asks for the chapter in progress, finished or not', async () => {
    for (const completed of [false, true]) {
      const calls = stubFetch(okBodies)
      renderSheet({ chapters: normal, chapterNumber: 3, completed })
      expect(titles()).toEqual(['Chapter 1', 'Chapter 2'])
      await waitFor(() => expect(calls).toHaveLength(2), slow)
      expect(calls.map(call => call.body.unitId)).toEqual(['ch-1', 'ch-2'])
      expect(calls.some(call => call.url === LAB_RECAP_ROUTE || call.body.chapterNumber === 3)).toBe(false)
      cleanup(); vi.unstubAllGlobals(); resetCatchUpMemory(); editionKey = `${editionKey}x`
    }
  })

  it('in the first chapter there is nothing to recap: only "You are here", and no request', async () => {
    const calls = stubFetch(okBodies)
    renderSheet({ chapterNumber: 1 })
    expect(screen.queryAllByTestId('lab-catch-up-entry')).toHaveLength(0)
    expect(screen.getByTestId('lab-catch-up-here').textContent).toBe('You are here')
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(calls).toHaveLength(0)
  })

  it('an empty answer or a reply asking for more text is never shown: the entry is left out, with no Retry', async () => {
    const complaint = 'I need to see the actual content of Chapter 2 to write an accurate summary. Could you provide the full text of the passage where the reader stopped?'
    const calls = stubFetch(call => call.body.unitId === 'chs-1-2' ? { status: 200, body: { summary: '', empty: true } }
      : call.body.unitId === 'ch-3' ? { status: 200, body: { summary: complaint } }
        : okBodies(call))
    renderSheet({ chapters: normal, chapterNumber: 5 })
    await waitFor(() => expect(screen.getByText('Recap of ch-4.')).toBeTruthy(), slow)
    await waitFor(() => expect(titles()).toEqual(['Chapter 4']), slow)
    expect(screen.queryByText(/I need to see/)).toBeNull()
    expect(screen.queryByTestId('lab-catch-up-retry')).toBeNull()
    expect(calls).toHaveLength(3)
    // Nothing was remembered for a reopen: the empty entries are asked again, never shown from memory.
    cleanup()
    renderSheet({ chapters: normal, chapterNumber: 5 })
    expect(screen.queryByText(/I need to see/)).toBeNull()
  })

  it('a failed entry shows a quiet retry, and the rest of the timeline still loads', async () => {
    let fail = true
    stubFetch(call => call.body.unitId === 'ch-59' && fail ? { status: 502, body: { error: 'x' } } : okBodies(call))
    renderSheet()
    const retry = await screen.findByTestId('lab-catch-up-retry', {}, slow)
    expect(retry.textContent).toBe('Retry')
    expect(await screen.findByText('Recap of ch-60.', {}, slow)).toBeTruthy()
    fail = false
    fireEvent.click(retry)
    await waitFor(() => expect(screen.getByText('Recap of ch-59.')).toBeTruthy(), slow)
  })

  it('a resting AI or a rate limit pauses new requests instead of failing the whole timeline', async () => {
    const calls = stubFetch(() => ({ status: 429, body: { error: 'limit' } }))
    renderSheet()
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-retry').length).toBeGreaterThan(0), slow)
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(calls.length).toBeLessThanOrEqual(CATCH_UP_CONCURRENCY)
  })

  it('a resting AI (503 ai_resting) says so above Retry, in the existing copy; any other failure is Retry alone', async () => {
    stubFetch(call => call.body.unitId === 'ch-59'
      ? { status: 503, body: { type: 'error', error: { type: 'ai_resting', message: 'AI is resting — try again later.' } } }
      : { status: 404, body: { error: 'Chapter not available' } })
    renderSheet()
    const resting = await screen.findByTestId('lab-catch-up-resting', {}, slow)
    expect(resting.textContent).toBe(LAB_COPY.aiResting)
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-retry').length).toBe(screen.getAllByTestId('lab-catch-up-entry').length), slow)
    expect(screen.getAllByTestId('lab-catch-up-resting')).toHaveLength(1)
  })

  it('the Bible: only the biblical book the reader is in; earlier books are never asked for', async () => {
    const calls = stubFetch(okBodies)
    const bible = [
      ...Array.from({ length: 3 }, (_, i) => ({ number: i + 1, title: `Ezra ${i + 1}`, wordCount: 600 })),
      ...Array.from({ length: 5 }, (_, i) => ({ number: i + 4, title: `Job ${i + 1}`, wordCount: 600 })),
      ...Array.from({ length: 6 }, (_, i) => ({ number: i + 9, title: `Psalms ${i + 1}`, wordCount: 600 })),
    ]
    renderSheet({ bookId: 'bible', editionKey: 'kjv-en', bookTitle: 'The Bible', chapters: bible, chapterNumber: 14, paragraphIndex: 2 })
    expect(titles()).toEqual(['Psalms 1 – Psalms 3', 'Psalms 4', 'Psalms 5'])
    expect(screen.queryByTestId('lab-catch-up-fold')).toBeNull()
    await waitFor(() => expect(calls).toHaveLength(3), slow)
    expect(calls.map(call => call.body.unitId)).toEqual(['chs-9-11', 'ch-12', 'ch-13'])
    expect(calls.every(call => !('throughChapter' in call.body))).toBe(true)
  })

  it('a short-story collection (library form): only the story the reader is in, so nothing in a story of one chapter', async () => {
    const calls = stubFetch(okBodies)
    const stories = ['A Scandal in Bohemia', 'The Red-Headed League', 'A Case of Identity'].map((title, i) => ({ number: i + 1, title }))
    renderSheet({ bookId: 'stories', bookTitle: 'Stories', chapters: stories, chapterNumber: 3, form: 'short-stories' })
    expect(screen.queryAllByTestId('lab-catch-up-entry')).toHaveLength(0)
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(calls).toHaveLength(0)
  })

  it('a novel with parts: every part has its own entry, never merged with another; the last two chapters each, whatever part they are in', async () => {
    const calls = stubFetch(okBodies)
    const parts = [
      ...[1, 2, 3].map(n => ({ number: n, title: `Book One — Chapter ${n}` })),
      ...[1, 2, 3].map(n => ({ number: n + 3, title: `Book Two — Chapter ${n}` })),
      ...[1, 2, 3].map(n => ({ number: n + 6, title: `Book Three — Chapter ${n}` })),
    ]
    renderSheet({ bookId: 'novel', bookTitle: 'Novel', chapters: parts, chapterNumber: 8, paragraphIndex: 3 })
    expect(titles()).toEqual(['Book One', 'Book Two — Chapter 1 – Book Two — Chapter 2', 'Book Two — Chapter 3', 'Book Three — Chapter 1'])
    await waitFor(() => expect(calls).toHaveLength(4), slow)
    expect(calls.map(call => call.body.unitId)).toEqual(['part-book-one', 'chs-4-5', 'ch-6', 'ch-7'])
    expect(calls.every(call => call.body.placeChapter === 8)).toBe(true)
  })

  it('Chat and Talk (the Explain icons, no Discuss) carry what the sheet showed; close and Escape close; a reopen is served from memory', async () => {
    const calls = stubFetch(okBodies)
    const props = renderSheet()
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-entry').filter(node => node.getAttribute('data-state') === 'ok')).toHaveLength(3), slow)
    expect(screen.queryByTestId('lab-catch-up-discuss')).toBeNull()
    expect(screen.queryByText('Discuss')).toBeNull()
    const chat = screen.getByTestId('lab-catch-up-chat')
    const talk = screen.getByTestId('lab-catch-up-talk')
    expect(chat.getAttribute('aria-label')).toBe('Chat')
    expect(chat.querySelector('svg[data-icon="chat"]')).toBeTruthy()
    expect(talk.getAttribute('aria-label')).toBe('Talk')
    expect(talk.querySelectorAll('svg rect')).toHaveLength(3)
    const shown = 'Chapter 1 – Chapter 58: Recap of chs-1-58.\nChapter 59: Recap of ch-59.\nChapter 60: Recap of ch-60.'
    fireEvent.click(chat)
    expect(props.onChat).toHaveBeenCalledWith(shown)
    fireEvent.click(talk)
    expect(props.onTalk).toHaveBeenCalledWith(shown)
    fireEvent.click(screen.getByTestId('lab-catch-up-close'))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledTimes(2)
    cleanup()
    renderSheet()
    expect(screen.getByText('Recap of chs-1-58.')).toBeTruthy()
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(calls.map(call => String(call.body.unitId))).toEqual(['chs-1-58', 'ch-59', 'ch-60'])
  })
})

describe('fetchCatchUpEntry: the client guard', () => {
  const entry = (chapters: number[], placeChapter: number) => ({
    key: `chs-${chapters[0]}-${chapters[chapters.length - 1]}`, kind: 'unit' as const, title: 't', chapters,
    request: { bookId: 'b', editionKey: 'e', unitId: `chs-${chapters[0]}-${chapters[chapters.length - 1]}`, placeChapter },
  })
  it('never asks for an entry that reaches the reader\'s chapter', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ summary: 'Later things happen.' }) }))
    expect(await fetchCatchUpEntry(entry([35, 36], 36), { fetchImpl })).toEqual({ ok: false, status: 0, beyond: true })
    expect(await fetchCatchUpEntry(entry([37], 36), { fetchImpl })).toEqual({ ok: false, status: 0, beyond: true })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('drops an answer that covers chapters it did not ask for, or any at or past the place', async () => {
    const answer = (chapters: number[]) => vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ summary: 'Something happens in these chapters.', chapters }) }))
    expect(await fetchCatchUpEntry(entry([30, 31], 35), { fetchImpl: answer([30, 31, 36]) })).toMatchObject({ ok: false, beyond: true })
    expect(await fetchCatchUpEntry(entry([30, 31], 35), { fetchImpl: answer([29, 30]) })).toMatchObject({ ok: false, beyond: true })
    expect(await fetchCatchUpEntry(entry([30, 31], 35), { fetchImpl: answer([30, 31]) })).toEqual({ ok: true, summary: 'Something happens in these chapters.' })
  })
  it('the sheet shows nothing for a dropped answer, and still ends at "You are here"', async () => {
    stubFetch(call => ({ status: 200, body: { summary: `Recap of ${call.body.unitId}.`, chapters: call.body.unitId === 'ch-60' ? [60, 61] : undefined } }))
    renderSheet()
    await waitFor(() => expect(screen.getByText('Recap of ch-59.')).toBeTruthy(), slow)
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-entry').map(node => node.querySelector('h3')?.textContent)).toEqual(['Chapter 1 – Chapter 58', 'Chapter 59']), slow)
    expect(screen.queryByText('Recap of ch-60.')).toBeNull()
    expect(screen.getByTestId('lab-catch-up-body').querySelector('ol')!.lastElementChild?.textContent).toBe('You are here')
  })
})

describe('nextCatchUpKeys', () => {
  it('starts wanted idle entries oldest first within the concurrency', () => {
    const keys = ['a', 'b', 'c', 'd']
    expect(nextCatchUpKeys({ keys, states: {}, wanted: new Set(keys), concurrency: 2 })).toEqual(['a', 'b'])
    expect(nextCatchUpKeys({ keys, states: { a: 'loading' }, wanted: new Set(keys), concurrency: 2 })).toEqual(['b'])
    expect(nextCatchUpKeys({ keys, states: { a: 'ok', b: 'error' }, wanted: new Set(keys), concurrency: 2 })).toEqual(['c', 'd'])
    expect(nextCatchUpKeys({ keys, states: {}, wanted: new Set(['a']), concurrency: 2 })).toEqual(['a'])
    expect(nextCatchUpKeys({ keys, states: { a: 'loading', b: 'loading' }, wanted: new Set(keys), concurrency: 2 })).toEqual([])
  })
})

describe('catchUpContextText', () => {
  it('lists loaded entries as "Title: recap" in reading order and skips the rest', () => {
    expect(catchUpContextText([
      { title: 'Chapter 1', summary: 'One  happens.\n' },
      { title: 'Chapter 2' },
      { title: 'Chapter 3', summary: 'Three happens.' },
    ])).toBe('Chapter 1: One happens.\nChapter 3: Three happens.')
    expect(catchUpContextText([{ title: 'Chapter 1' }])).toBe('')
  })

  it('past the bound drops the oldest entries, keeping the part nearest "You are here"', () => {
    const text = catchUpContextText([
      { title: 'Old', summary: 'x'.repeat(30) },
      { title: 'Mid', summary: 'y'.repeat(10) },
      { title: 'New', summary: 'z'.repeat(10) },
    ], 40)
    expect(text).toBe(`Mid: ${'y'.repeat(10)}\nNew: ${'z'.repeat(10)}`)
  })
})

describe('LabCatchUpSheet with the follow-up field (phone, iPhone feedback 21 Oct 2026)', () => {
  it('ends with the field in place of Chat and Talk; it carries what the sheet shows; follow-ups scroll with the timeline', async () => {
    stubFetch(okBodies)
    let shown: (() => string) | null = null
    renderSheet({ follow: get => { shown = get; return <input data-testid="follow" /> }, thread: <p data-testid="thread">A follow-up</p> })
    await waitFor(() => expect(screen.getAllByText(/Recap of/).length).toBeGreaterThan(0), slow)
    expect(screen.queryByTestId('lab-catch-up-chat')).toBeNull()
    expect(screen.queryByTestId('lab-catch-up-talk')).toBeNull()
    expect(screen.getByTestId('follow').closest('.lab-catch-up-foot')?.classList.contains('is-follow')).toBe(true)
    expect(screen.getByTestId('thread').closest('[data-testid="lab-catch-up-body"]')).not.toBeNull()
    expect(shown!()).toMatch(/Recap of/)
  })
})
