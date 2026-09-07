// @vitest-environment jsdom

/**
 * The library recap hero, end to end over the real module: seeded reading
 * memory + position store in localStorage, a stubbed catalogue and a stubbed
 * `/api/lab-recap`, and the DOM the lab library actually renders.
 *
 * Two things are pinned here:
 *
 *  1. The away-threshold (owner rule, 2026-09-07). Back inside the hour: the
 *     position line only, and NOT ONE request. Back after three hours: the
 *     request goes out and the summary appears. A summary the device already
 *     cached for that exact place is shown either way.
 *  2. A daily Bible reader who read something else afterwards. The Bible
 *     drops out of the hero slot, and a quiet row's line comes from the
 *     stored session summary or the device cache — never from a request.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { READING_MEMORY_DEVICE_KEY } from './readingMemory/deviceStore'
import { LAB_POSITION_STORAGE_KEY, type LabBookPlace, type LabPositionState } from './lab/labPosition'
import { emptyReadingMemory } from './readingMemory/sessions'
import { bibleChapterFixture, platoDialogueFixture, sessionFor } from './readingMemory/fixtures.test-helpers'
import { RECAP_SUMMARY_STORAGE_KEY } from './preReader/recapSummaryClient'
import { recapCacheKey } from './recapSummary'
import type { ReadingMemoryState, ReadingSession } from './readingMemory/types'

const USER = 'user-anders'
vi.mock('./services/supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { user: { id: USER }, access_token: 'token-1' } } }) } },
  isSupabaseConfigured: () => true,
}))
// The cloud copy is exercised in readingMemory/recapLoad.test.ts; here the
// device mirror is the whole truth.
vi.mock('./readingMemory/cloud', () => ({
  createSupabaseReadingMemoryCloud: () => null,
  clearCloudReadingMemory: async () => true,
}))

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const NOW = Date.UTC(2026, 8, 7, 20, 0, 0)
const ago = (ms: number) => NOW - ms

const BIBLE_CHAPTERS = [
  { number: 1, title: 'Genesis 1', paragraphCount: 7 },
  { number: 631, title: 'Psalms 150', paragraphCount: 3 },
  { number: 644, title: 'Proverbs 16', paragraphCount: 7 },
  { number: 645, title: 'Proverbs 17', paragraphCount: 6 },
]

function catalogueJson() {
  return {
    books: [
      {
        id: 'bible',
        title: 'The Bible',
        author: 'Various',
        editions: [
          { key: 'kjv-en', label: 'King James Version (1611)', style: 'kjv', language: 'en', availability: { chapterText: true } },
          { key: 'modern-en', label: 'Modern English', style: 'modern', language: 'en', availability: { chapterText: true } },
          { key: 'modern-da', label: 'Moderne Dansk', style: 'modern', language: 'da', availability: { chapterText: true } },
        ],
        readingStructure: { editionKey: 'modern-en', chapters: BIBLE_CHAPTERS },
      },
      {
        id: 'plato-republic',
        title: 'The Republic',
        author: 'Plato',
        editions: [{ key: 'original-en', label: 'Original', style: 'original', language: 'en', availability: { chapterText: true } }],
        readingStructure: { editionKey: 'original-en', chapters: [{ number: 1, title: 'Book I', paragraphCount: 4 }] },
      },
    ],
  }
}

function place(input: Partial<LabBookPlace> & { bookId: string; sequentialChapter: number; updatedAt: number }): LabBookPlace {
  return {
    headerBook: input.bookId,
    chapterNumber: 1,
    paragraphIndex: 2,
    wordIndex: 4,
    pageIndex: 1,
    primaryEditionKey: 'kjv-en',
    readerMode: 'read',
    deviceId: 'device-a',
    rev: 1,
    ...input,
  } as LabBookPlace
}

function positionState(places: LabBookPlace[], settled: string | null, finished: Record<string, number[]> = {}): LabPositionState {
  return {
    books: Object.fromEntries(places.map(item => [item.bookId, item])),
    finished,
    lastSettledBookId: settled,
    lastSettledAt: NOW,
    updatedAt: NOW,
    deviceId: 'device-a',
  }
}

function seed(sessions: ReadingSession[], positions: LabPositionState) {
  const state: ReadingMemoryState = {
    ...emptyReadingMemory(),
    sessions: Object.fromEntries(sessions.map(item => [item.id, item])),
    updatedAt: NOW,
  }
  localStorage.setItem(READING_MEMORY_DEVICE_KEY, JSON.stringify(state))
  localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(positions))
}

function cacheSummary(key: string, summary: string) {
  localStorage.setItem(RECAP_SUMMARY_STORAGE_KEY, JSON.stringify({ v: 1, entries: { [key]: { summary, at: NOW - DAY } } }))
}

/** jsdom ships no `CSS` global; every browser Tinct supports has CSS.escape. */
function installCssEscape() {
  vi.stubGlobal('CSS', { escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`) })
}

function mountShell() {
  document.body.innerHTML = '<div id="tinct-onboarding-worlds-v5"><section data-reading-memory-recap hidden></section></div>'
}

let recapCalls: Array<Record<string, unknown>> = []
let cloudPosition: LabPositionState | null = null

function stubFetch() {
  vi.stubGlobal('fetch', vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input)
    if (url.startsWith('/lab/catalogue.json')) {
      return { ok: true, status: 200, json: async () => catalogueJson() } as unknown as Response
    }
    if (url.includes('/api/lab-position')) {
      if (!cloudPosition) return { ok: false, status: 404, json: async () => ({}) } as unknown as Response
      return { ok: true, status: 200, json: async () => cloudPosition } as unknown as Response
    }
    if (url.includes('/api/lab-recap')) {
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>
      recapCalls.push(body)
      return {
        ok: true,
        status: 200,
        json: async () => ({
          summary: `So far in ${String(body.bookId)} ${String(body.chapterNumber)}.`,
          coverage: { chapterNumber: body.chapterNumber, throughParagraph: body.paragraphIndex, paragraphCount: 6, complete: false, fromChapterNumber: null },
          model: 'test-model',
          version: 'lab-recap-v1',
          cached: false,
        }),
      } as unknown as Response
    }
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response
  }))
}

async function flush(times = 16) {
  for (let index = 0; index < times; index++) await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
  for (let index = 0; index < times; index++) await Promise.resolve()
}

async function renderLibrary(sessions: ReadingSession[], positions: LabPositionState) {
  seed(sessions, positions)
  installCssEscape()
  mountShell()
  stubFetch()
  await import('./labReadingMemory')
  await flush()
  return document.querySelector<HTMLElement>('[data-reading-memory-recap]')!
}

const proverbs17 = { ...bibleChapterFixture(), chapterNumber: 645, chapterLabel: 'Proverbs 17' }

function bibleSession(lastActiveAt: number): ReadingSession {
  return sessionFor(proverbs17, { id: 'bible-today', state: 'progressed', startedAt: lastActiveAt - 20 * MINUTE, lastActiveAt, page: 2, owner: USER })
}

function biblePlace(updatedAt: number): LabBookPlace {
  return place({ bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, paragraphIndex: 2, updatedAt })
}

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  recapCalls = []
  cloudPosition = null
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  document.body.innerHTML = ''
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('recap hero: a short absence is not summarised', () => {
  it('shows the position line only and sends no request five minutes after reading', async () => {
    const section = await renderLibrary(
      [bibleSession(ago(5 * MINUTE))],
      positionState([biblePlace(ago(4 * MINUTE))], 'proverbs'),
    )
    expect(section.dataset.book).toBe('bible')
    expect(section.querySelector('[data-testid=lab-recap-headline]')!.textContent).toBe('You’re in the middle of Proverbs 17')
    expect(section.dataset.summaryLine).toBe('recent')
    expect(recapCalls).toEqual([])
    const line = section.querySelector<HTMLElement>('[data-testid=lab-recap-summary]')!
    expect(line.hidden).toBe(true)
    expect(line.textContent).toBe('')
  })

  it('asks for the summary and shows it three hours after reading', async () => {
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(3 * HOUR) + MINUTE)], 'proverbs'),
    )
    expect(recapCalls).toEqual([{
      bookId: 'bible',
      editionKey: 'kjv-en',
      chapterNumber: 645,
      paragraphIndex: 2,
      completed: false,
      bookTitle: 'The Bible',
    }])
    expect(section.dataset.summaryLine).toBe('fresh')
    const line = section.querySelector<HTMLElement>('[data-testid=lab-recap-summary]')!
    expect(line.hidden).toBe(false)
    expect(line.textContent).toBe('So far in bible 645.')
  })

  it('still shows a summary the device already cached for that exact place, without a request', async () => {
    cacheSummary(
      recapCacheKey({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 2, paragraphCount: 6, completed: false }),
      'Cached line for Proverbs 17.',
    )
    const section = await renderLibrary(
      [bibleSession(ago(5 * MINUTE))],
      positionState([biblePlace(ago(4 * MINUTE))], 'proverbs'),
    )
    expect(recapCalls).toEqual([])
    expect(section.dataset.summaryLine).toBe('cached')
    expect(section.querySelector('[data-testid=lab-recap-summary]')!.textContent).toBe('Cached line for Proverbs 17.')
  })

  it('falls back to the position record when the book has no reading-memory session', async () => {
    const section = await renderLibrary([], positionState([biblePlace(ago(20 * MINUTE))], 'proverbs'))
    expect(section.dataset.book).toBe('bible')
    expect(section.dataset.summaryLine).toBe('recent')
    expect(recapCalls).toEqual([])
  })
})

describe('a daily Bible reader who opens another book afterwards', () => {
  /** Bible read this morning; the Republic read 90 minutes ago — the newest book wins the hero. */
  const morningBibleEveningRepublic = () => ({
    sessions: [
      bibleSession(ago(9 * HOUR)),
      sessionFor(platoDialogueFixture(), { id: 'republic', state: 'progressed', startedAt: ago(2 * HOUR), lastActiveAt: ago(90 * MINUTE), page: 2, owner: USER }),
    ],
    positions: positionState([
      biblePlace(ago(9 * HOUR) + MINUTE),
      place({ bookId: 'plato-republic', headerBook: 'The Republic', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 1, primaryEditionKey: 'original-en', updatedAt: ago(89 * MINUTE) }),
    ], 'plato-republic'),
  })

  it('gives the hero — and the only generated summary — to the newest book, not to the Bible', async () => {
    const { sessions, positions } = morningBibleEveningRepublic()
    const section = await renderLibrary(sessions, positions)
    expect(section.dataset.book).toBe('plato-republic')
    expect(section.dataset.readingNow).toBe('2')
    expect(recapCalls.map(call => call.bookId)).toEqual(['plato-republic'])
    const bibleRow = section.querySelector<HTMLElement>('[data-recap-open="bible"]')!
    expect(bibleRow.textContent).toContain('Last time · Proverbs 17')
  })

  it('shows the Bible row the summary this device already has for that place, with no extra request', async () => {
    cacheSummary(
      recapCacheKey({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 2, paragraphCount: 6, completed: false }),
      'Solomon weighs quiet bread against a house of strife.',
    )
    const { sessions, positions } = morningBibleEveningRepublic()
    const section = await renderLibrary(sessions, positions)
    const bibleRow = section.querySelector<HTMLElement>('[data-recap-open="bible"]')!
    expect(bibleRow.querySelector('.lib-recap-row-recap')!.textContent).toBe('Solomon weighs quiet bread against a house of strife.')
    expect(recapCalls.map(call => call.bookId)).toEqual(['plato-republic'])
  })

  it('leaves the row line out when the device has no summary for the place it resumes at', async () => {
    cacheSummary(
      recapCacheKey({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 631, paragraphIndex: 0, paragraphCount: 3, completed: false }),
      'A summary of yesterday’s chapter.',
    )
    const { sessions, positions } = morningBibleEveningRepublic()
    const section = await renderLibrary(sessions, positions)
    const bibleRow = section.querySelector<HTMLElement>('[data-recap-open="bible"]')!
    expect(bibleRow.querySelector('.lib-recap-row-recap')).toBeNull()
  })
})

/**
 * The 2026-09-07 incident, at the library. The device record is a signed-out
 * Genesis 1 pin written minutes ago; the account's row is a real Bible
 * history settled in Proverbs 17 a day earlier. The hero must say what the
 * account read, not what this device last guessed.
 */
describe('recap hero after a sign-in', () => {
  it('the account row wins the resume over a signed-out Genesis pin on the device', async () => {
    cloudPosition = {
      ...positionState([biblePlace(ago(DAY))], 'proverbs'),
      owner: USER,
      lastSettledAt: ago(DAY),
      updatedAt: ago(DAY),
      deviceId: 'device-b',
    }
    const genesis = place({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 0, updatedAt: ago(MINUTE) })
    const section = await renderLibrary(
      [bibleSession(ago(DAY))],
      { ...positionState([genesis], 'genesis'), lastSettledAt: ago(MINUTE), updatedAt: ago(MINUTE) },
    )
    expect(section.dataset.book).toBe('bible')
    expect(section.querySelector('[data-testid=lab-recap-headline]')!.textContent).toBe('You’re in the middle of Proverbs 17')
  })

  it('another account’s device record is not this viewer’s library', async () => {
    cloudPosition = { ...positionState([], null), owner: USER, deviceId: 'device-b', lastSettledAt: 0, updatedAt: 0 }
    const section = await renderLibrary(
      [],
      { ...positionState([biblePlace(ago(MINUTE))], 'proverbs'), owner: 'user-someone-else' },
    )
    expect(section.hidden).toBe(true)
  })
})
