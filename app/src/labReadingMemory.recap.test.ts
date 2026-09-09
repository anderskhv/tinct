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
 *     drops out of the centre of the Reading-now row and carries no line of
 *     its own; scrolling it back to the middle shows the device's cached
 *     line at once, and orders a fresh one only once the row settles there.
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
  supabase: {
    auth: { getSession: async () => ({ data: { session: { user: { id: USER }, access_token: 'token-1' } } }) },
    from: () => ({ select: () => ({ eq: () => ({ or: async () => ({ data: [], error: null }) }) }) }),
  },
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
    hidden: {},
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
let cloudPositionGate: Promise<void> | null = null

function stubFetch() {
  vi.stubGlobal('fetch', vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input)
    if (url.startsWith('/lab/catalogue.json')) {
      return { ok: true, status: 200, json: async () => catalogueJson() } as unknown as Response
    }
    if (url.includes('/api/lab-position')) {
      if (cloudPositionGate) await cloudPositionGate
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
  sessionStorage.clear()
  recapCalls = []
  cloudPosition = null
  cloudPositionGate = null
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  document.body.innerHTML = ''
  localStorage.clear()
  sessionStorage.clear()
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
    // An optional recap with no text must not reserve blank space.
    const line = section.querySelector<HTMLElement>('[data-testid=lab-recap-summary]')!
    expect(line.classList.contains('is-shown')).toBe(false)
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
    expect(['fresh', 'cached']).toContain(section.dataset.summaryLine)
    const line = section.querySelector<HTMLElement>('[data-testid=lab-recap-summary]')!
    expect(line.classList.contains('is-shown')).toBe(true)
    expect(line.hidden).toBe(false)
    expect(line.textContent).toContain('So far in bible 645.')
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
    expect(section.querySelector('[data-testid=lab-recap-summary]')!.textContent).toContain('Cached line for Proverbs 17.')
  })

  it('falls back to the position record when the book has no reading-memory session', async () => {
    const section = await renderLibrary([], positionState([biblePlace(ago(20 * MINUTE))], 'proverbs'))
    expect(section.dataset.book).toBe('bible')
    expect(section.dataset.summaryLine).toBe('recent')
    expect(recapCalls).toEqual([])
  })
})

/**
 * Coming back to the library out of a book's own reader. The reader has just
 * been looking at the page: the hero says where they are and stops there —
 * no request, and not even a summary this device already holds. Every other
 * book keeps the ordinary rules. Both conditions live in
 * preReader/recapSummaryClient.ts (`recapSummaryPermission`).
 */
describe('back out of the book\u2019s own reader', () => {
  const leftReaderOn = (bookId: string, at = ago(20 * 1000)) => {
    sessionStorage.setItem('tinct:lab-reader-origin', JSON.stringify({ v: 1, bookId, at }))
  }

  it('shows the position line and nothing else for the book just left', async () => {
    leftReaderOn('bible')
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(30 * 1000))], 'proverbs'),
    )
    expect(section.querySelector('[data-testid=lab-recap-headline]')!.textContent)
      .toBe('You\u2019re in the middle of Proverbs 17')
    expect(section.dataset.summaryLine).toBe('from-reader')
    expect(recapCalls).toEqual([])
    // Nothing is going to arrive, so the block is not on the page at all —
    // and lab/library-boot.js leaves it out for the same reason, so the two
    // paints are the same height.
    expect(section.querySelector('[data-testid=lab-recap-summary]')).toBeNull()
  })

  it('does not even show a summary this device already cached for that place', async () => {
    cacheSummary(
      recapCacheKey({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 2, paragraphCount: 6, completed: false }),
      'Cached line for Proverbs 17.',
    )
    leftReaderOn('bible')
    const section = await renderLibrary(
      [bibleSession(ago(3 * DAY))],
      positionState([biblePlace(ago(3 * DAY))], 'proverbs'),
    )
    expect(section.dataset.summaryLine).toBe('from-reader')
    expect(section.querySelector('[data-testid=lab-recap-summary]')).toBeNull()
    expect(recapCalls).toEqual([])
  })

  it('recognises the reader\u2019s own Bible id: the boot redirect records `proverbs`, the hero is `bible`', async () => {
    leftReaderOn('proverbs')
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(30 * 1000))], 'proverbs'),
    )
    expect(section.dataset.book).toBe('bible')
    expect(section.dataset.summaryLine).toBe('from-reader')
    expect(recapCalls).toEqual([])
  })

  it('leaves a different book on the ordinary rules', async () => {
    leftReaderOn('plato-republic')
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(3 * HOUR) + MINUTE)], 'proverbs'),
    )
    expect(section.dataset.book).toBe('bible')
    expect(['fresh', 'cached']).toContain(section.dataset.summaryLine)
    expect(recapCalls.map(call => call.bookId)).toEqual(['bible'])
    expect(section.querySelector('[data-testid=lab-recap-summary]')!.textContent).toContain('So far in bible 645.')
  })

  it('summarises a fresh visit an hour later, when nothing says the reader came from the book', async () => {
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(3 * HOUR) + MINUTE)], 'proverbs'),
    )
    expect(['fresh', 'cached']).toContain(section.dataset.summaryLine)
    expect(recapCalls.map(call => call.bookId)).toEqual(['bible'])
  })

  it('stops honouring the marker once it is older than the away threshold', async () => {
    leftReaderOn('bible', ago(2 * HOUR))
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(3 * HOUR) + MINUTE)], 'proverbs'),
    )
    expect(['fresh', 'cached']).toContain(section.dataset.summaryLine)
    expect(recapCalls.map(call => call.bookId)).toEqual(['bible'])
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

  it('gives the focus — and the only generated summary — to the newest book, not to the Bible', async () => {
    const { sessions, positions } = morningBibleEveningRepublic()
    const section = await renderLibrary(sessions, positions)
    expect(section.dataset.book).toBe('plato-republic')
    expect(section.dataset.readingNow).toBe('2')
    expect(section.dataset.nowFocus).toBe('0')
    expect(recapCalls.map(call => call.bookId)).toEqual(['plato-republic'])
    // Every book in progress is a cover in the same row. The Bible is there,
    // named, but it carries no line of its own: the caption under the row
    // belongs to the book in the middle, and there is only one of it.
    const bibleCard = section.querySelector<HTMLElement>('[data-now-book="bible"]')!
    const bibleOpen = bibleCard.querySelector<HTMLElement>('[data-recap-open]')!
    expect(bibleOpen.getAttribute('aria-label')).toContain('Proverbs 17')
    expect(bibleOpen.getAttribute('aria-current')).toBe('false')
    expect(bibleCard.querySelector('[data-now-remove]')!.getAttribute('aria-label'))
      .toBe('Remove The Bible from currently reading')
    expect(section.querySelectorAll('[data-testid=lab-recap-summary]')).toHaveLength(1)
    expect(section.querySelector('.lib-recap-row-recap')).toBeNull()
  })

  it('shows the Bible the summary this device already has once it is the centred book, with no extra request', async () => {
    cacheSummary(
      recapCacheKey({ bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 2, paragraphCount: 6, completed: false }),
      'Solomon weighs quiet bread against a house of strife.',
    )
    const { sessions, positions } = morningBibleEveningRepublic()
    const section = await renderLibrary(sessions, positions)
    // Scrolling the Bible to the middle is a tap on a card that sits back.
    section.querySelector<HTMLElement>('[data-now-book="bible"] [data-recap-open]')!.click()
    await flush()
    expect(section.dataset.book).toBe('bible')
    expect(section.querySelector('[data-testid=lab-recap-summary]')!.textContent)
      .toContain('Solomon weighs quiet bread against a house of strife.')
    expect(section.dataset.summaryLine).toBe('cached')
    expect(recapCalls.map(call => call.bookId)).toEqual(['plato-republic'])
  })

  it('asks for the centred book only once the row settles on it, never while scrolling past', async () => {
    const { sessions, positions } = morningBibleEveningRepublic()
    const section = await renderLibrary(sessions, positions)
    section.querySelector<HTMLElement>('[data-now-book="bible"] [data-recap-open]')!.click()
    await flush()
    // The caption is the Bible's, but nothing has been ordered for it yet.
    expect(section.dataset.book).toBe('bible')
    expect(section.querySelector('[data-testid=lab-recap-summary]')!.classList.contains('is-shown')).toBe(false)
    expect(recapCalls.map(call => call.bookId)).toEqual(['plato-republic'])
    await vi.advanceTimersByTimeAsync(800)
    await flush()
    expect(recapCalls.map(call => call.bookId)).toEqual(['plato-republic', 'bible'])
    expect(section.querySelector('[data-testid=lab-recap-summary]')!.textContent).toContain('So far in bible 645.')
  })
})

/**
 * The "so far" block opens and closes. Three lines is what the library shows
 * without being asked; the reader who wants the rest taps the block. jsdom
 * has no layout, so the clamp itself is measured in the browser — here the
 * control's behaviour is pinned: which way the word points, what
 * aria-expanded says, and that it opens closed every time.
 */
describe('the so-far block opens and closes', () => {
  const heroSummary = (section: HTMLElement) =>
    section.querySelector<HTMLButtonElement>('[data-testid=lab-recap-summary]')!

  async function renderWithSummary() {
    const section = await renderLibrary(
      [bibleSession(ago(3 * HOUR))],
      positionState([biblePlace(ago(3 * HOUR) + MINUTE)], 'proverbs'),
    )
    return section
  }

  it('collapses to three lines, and a clamped summary becomes the control', async () => {
    const section = await renderWithSummary()
    const block = heroSummary(section)
    expect(block.tagName).toBe('BUTTON')
    expect(block.querySelector('.lib-recap-summary-text')!.textContent).toBe('So far in bible 645.')
    expect(block.classList.contains('is-open')).toBe(false)
    // jsdom reports no overflow, so this short line is not a control at all.
    expect(block.dataset.expandable).toBe('false')
    expect(block.disabled).toBe(true)
    expect(block.hasAttribute('aria-expanded')).toBe(false)
    expect(block.querySelector('.lib-recap-summary-more')!.textContent).toBe('')
  })

  it('opens on a tap and closes on the next one, and says which way it goes', async () => {
    const section = await renderWithSummary()
    const block = heroSummary(section)
    // A clamped summary in a real browser; here, said outright.
    block.dataset.expandable = 'true'
    block.disabled = false
    block.setAttribute('aria-expanded', 'false')
    block.querySelector('.lib-recap-summary-more')!.textContent = 'More'

    block.click()
    expect(block.classList.contains('is-open')).toBe(true)
    expect(block.getAttribute('aria-expanded')).toBe('true')
    expect(block.querySelector('.lib-recap-summary-more')!.textContent).toBe('Less')

    block.click()
    expect(block.classList.contains('is-open')).toBe(false)
    expect(block.getAttribute('aria-expanded')).toBe('false')
    expect(block.querySelector('.lib-recap-summary-more')!.textContent).toBe('More')
  })

  it('does nothing when there is no more of it to show', async () => {
    const section = await renderWithSummary()
    const block = heroSummary(section)
    block.click()
    expect(block.classList.contains('is-open')).toBe(false)
    expect(block.hasAttribute('aria-expanded')).toBe(false)
  })

  it('opens closed again when the row moves to another book', async () => {
    const { sessions, positions } = {
      sessions: [
        bibleSession(ago(9 * HOUR)),
        sessionFor(platoDialogueFixture(), { id: 'republic', state: 'progressed', startedAt: ago(2 * HOUR), lastActiveAt: ago(90 * MINUTE), page: 2, owner: USER }),
      ],
      positions: positionState([
        biblePlace(ago(9 * HOUR) + MINUTE),
        place({ bookId: 'plato-republic', headerBook: 'The Republic', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 1, primaryEditionKey: 'original-en', updatedAt: ago(89 * MINUTE) }),
      ], 'plato-republic'),
    }
    const section = await renderLibrary(sessions, positions)
    const block = heroSummary(section)
    block.dataset.expandable = 'true'
    block.disabled = false
    block.click()
    expect(block.classList.contains('is-open')).toBe(true)
    // Scrolling the Bible to the middle repaints the caption from scratch.
    section.querySelector<HTMLElement>('[data-now-book="bible"] [data-recap-open]')!.click()
    await flush()
    expect(section.dataset.book).toBe('bible')
    expect(heroSummary(section).classList.contains('is-open')).toBe(false)
  })
})

/**
 * Taking a book off Reading now. The control is the classic app's: a round ×
 * on the corner of the card, one tap, no confirmation. Removing must delete
 * nothing — the place, the notes, the highlights, the chat and the sessions
 * all survive — and reading the book again must list it once more, at the
 * page it was left on.
 */
describe('remove a book from Reading now', () => {
  const twoBooks = () => ({
    sessions: [
      bibleSession(ago(9 * HOUR)),
      sessionFor(platoDialogueFixture(), { id: 'republic', state: 'progressed', startedAt: ago(2 * HOUR), lastActiveAt: ago(90 * MINUTE), page: 2, owner: USER }),
    ],
    positions: positionState([
      biblePlace(ago(9 * HOUR) + MINUTE),
      place({ bookId: 'plato-republic', headerBook: 'The Republic', chapterNumber: 1, sequentialChapter: 1, paragraphIndex: 1, primaryEditionKey: 'original-en', updatedAt: ago(89 * MINUTE) }),
    ], 'plato-republic'),
  })

  /** Everything about a book that is not the list itself. */
  function seedBookBelongings() {
    localStorage.setItem('tinct:notes:bible', JSON.stringify([{ id: 'n1', text: 'Quiet bread.' }]))
    localStorage.setItem('chat-history:bible', JSON.stringify([{ role: 'user', content: 'Who is Solomon?', bookId: 'bible' }]))
    localStorage.setItem('tinct:highlights:bible', JSON.stringify([{ id: 'h1', color: 'amber' }]))
  }

  function storedPositions() {
    return JSON.parse(localStorage.getItem(LAB_POSITION_STORAGE_KEY)!) as LabPositionState
  }

  it('takes the centred book off the list, leaves everything else about it alone, and falls through to the next', async () => {
    const { sessions, positions } = twoBooks()
    seedBookBelongings()
    const section = await renderLibrary(sessions, positions)
    expect(section.dataset.readingNow).toBe('2')
    expect(section.dataset.book).toBe('plato-republic')

    section.querySelector<HTMLElement>('[data-now-book="plato-republic"] [data-now-remove]')!.click()
    await flush()

    // Off the list, and the hero is now the book behind it.
    expect(section.dataset.readingNow).toBe('1')
    expect(section.dataset.book).toBe('bible')
    expect(section.querySelector('[data-now-book="plato-republic"]')).toBeNull()
    expect(section.querySelector('[data-now-book="bible"]')).not.toBeNull()

    // Nothing was deleted. The place is byte-for-byte the place it was.
    const stored = storedPositions()
    expect(stored.books['plato-republic']).toEqual(positions.books['plato-republic'])
    expect(stored.hidden['plato-republic']).toBeGreaterThan(0)
    expect(localStorage.getItem('tinct:notes:bible')).toContain('Quiet bread.')
    expect(localStorage.getItem('chat-history:bible')).toContain('Who is Solomon?')
    expect(localStorage.getItem('tinct:highlights:bible')).toContain('h1')
    expect(Object.keys(JSON.parse(localStorage.getItem(READING_MEMORY_DEVICE_KEY)!).sessions)).toHaveLength(2)
  })

  it('lists the book again the moment it is read again, at the place it was left', async () => {
    const { sessions, positions } = twoBooks()
    const section = await renderLibrary(sessions, positions)
    section.querySelector<HTMLElement>('[data-now-book="plato-republic"] [data-now-remove]')!.click()
    await flush()
    expect(section.querySelector('[data-now-book="plato-republic"]')).toBeNull()

    // Reading it again writes a newer place. Nothing un-hides it explicitly.
    const hiddenAt = storedPositions().hidden['plato-republic']
    const reopened = {
      ...storedPositions(),
      books: {
        ...storedPositions().books,
        'plato-republic': { ...positions.books['plato-republic'], paragraphIndex: 3, updatedAt: hiddenAt + 1_000, rev: 2 },
      },
    }
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(reopened))
    await (window as unknown as { __tinctLabReadingMemory: { render: () => Promise<void> } }).__tinctLabReadingMemory.render()
    await flush()

    expect(section.dataset.readingNow).toBe('2')
    const card = section.querySelector<HTMLElement>('[data-now-book="plato-republic"]')!
    expect(card).not.toBeNull()
    expect(storedPositions().books['plato-republic'].paragraphIndex).toBe(3)
  })

  it('names the book in the control, the way the classic app does', async () => {
    const { sessions, positions } = twoBooks()
    const section = await renderLibrary(sessions, positions)
    const control = section.querySelector<HTMLElement>('[data-now-book="bible"] [data-now-remove]')!
    expect(control.getAttribute('aria-label')).toBe('Remove The Bible from currently reading')
    expect(control.textContent).toBe('×')
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


describe('cross-device library refresh', () => {
  it('refreshes the open library when returning from another tab', async () => {
    const local = { ...positionState([biblePlace(ago(DAY))], 'proverbs'), owner: USER, lastSettledAt: ago(DAY) }
    cloudPosition = local
    const section = await renderLibrary([], local)
    expect(section.dataset.readingNow).toBe('1')
    const republic = place({ bookId: 'plato-republic', headerBook: 'The Republic', sequentialChapter: 1, primaryEditionKey: 'original-en', updatedAt: ago(MINUTE) })
    cloudPosition = { ...positionState([biblePlace(ago(DAY)), republic], 'plato-republic'), owner: USER }
    window.dispatchEvent(new Event('focus'))
    await flush(40)
    expect(section.dataset.readingNow).toBe('2')
    expect(section.dataset.book).toBe('plato-republic')
    let release!: () => void
    cloudPositionGate = new Promise(resolve => { release = resolve })
    const refreshing = (window as unknown as { __tinctLabReadingMemory: { render: () => Promise<void> } }).__tinctLabReadingMemory.render()
    await flush()
    expect(section.dataset.readingNow).toBe('2')
    expect(section.dataset.book).toBe('plato-republic')
    release()
    await refreshing
  })
})
