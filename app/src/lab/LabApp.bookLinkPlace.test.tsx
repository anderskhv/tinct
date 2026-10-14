// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { LAB_POSITION_STORAGE_KEY } from './labPosition'
import { readLabPositionLocal } from './labPositionStore'
import { resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

vi.mock('../data/audioAvailability', async importOriginal => ({ ...await importOriginal<typeof import('../data/audioAvailability')>(), isAudioHeld: () => false }))
vi.mock('./labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('./labNarration')>(),
  fetchNarrationPilotInfo: async () => ({ enabled: false, provider: 'google', voices: [] }),
}))

/**
 * `/reader?book=bible` (no chapter) is a book-only link: it resumes the
 * reader's own place in the book, like every other book (PR #426). The Bible
 * keeps its places per biblical book (genesis, psalms), never under `bible`,
 * so the link found no place, opened Genesis 1 at its start and wrote
 * paragraph 0 over the reader's Genesis place (QA 2026-10-14).
 */
const paragraphs = (label: string) => Array.from({ length: 20 }, (_, index) => `${label} paragraph ${index} has a few words in it.`)
const TODAY = Date.now()

function pin(bookId: string, headerBook: string, chapterNumber: number, sequentialChapter: number, paragraphIndex: number, wordIndex: number, updatedAt: number) {
  return { bookId, headerBook, chapterNumber, sequentialChapter, paragraphIndex, wordIndex, primaryEditionKey: 'kjv-en', updatedAt, deviceId: 'device-a', rev: 1 }
}

beforeEach(() => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en' }))
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('manifest.json')) {
      return { ok: true, json: async () => ({ chapters: [
        { number: 1, title: 'Genesis 1', path: 'ch1.json' },
        { number: 2, title: 'Genesis 2', path: 'ch2.json' },
        { number: 501, title: 'Psalms 23', path: 'ch501.json' },
      ] }) }
    }
    const chapter = url.match(/ch(\d+)\.json/)?.[1]
    if (chapter) return { ok: true, json: async () => ({ paragraphs: paragraphs(`Chapter ${chapter}`) }) }
    if (url.includes('threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
    return { ok: false, status: 503, json: async () => ({}) }
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

it('a /reader?book=bible link resumes the saved Bible place and never writes Genesis 1 paragraph 0 over it', async () => {
  localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({
    books: {
      genesis: pin('genesis', 'Genesis', 1, 1, 13, 50, TODAY - 60_000),
      psalms: pin('psalms', 'Psalms', 23, 501, 3, 4, TODAY - 30_000),
    },
    lastSettledBookId: 'psalms',
    lastSettledAt: TODAY - 30_000,
    finished: {},
  }))
  window.history.replaceState(null, '', '/reader?book=bible')
  render(<LabApp pathname="/reader" authToken={null} />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  await waitFor(() => expect(screen.getByTestId('lab-reading-stage').textContent).toContain('Chapter 501 paragraph 3'))
  expect(root.getAttribute('data-place')).toBe('3:4')
  const stored = readLabPositionLocal()
  expect(stored.books.psalms).toMatchObject({ sequentialChapter: 501, paragraphIndex: 3, wordIndex: 4 })
  expect(stored.books.genesis).toMatchObject({ sequentialChapter: 1, paragraphIndex: 13, wordIndex: 50 })
})

it('a /reader?book=bible link reopens a saved Genesis 1 place on reload, not the start of the chapter', async () => {
  localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({
    books: { genesis: pin('genesis', 'Genesis', 1, 1, 13, 50, TODAY - 60_000) },
    lastSettledBookId: 'genesis',
    lastSettledAt: TODAY - 60_000,
    finished: {},
  }))
  window.history.replaceState(null, '', '/reader?book=bible')
  render(<LabApp pathname="/reader" authToken={null} />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  expect(root.getAttribute('data-place')).toBe('13:50')
  expect(readLabPositionLocal().books.genesis).toMatchObject({ sequentialChapter: 1, paragraphIndex: 13, wordIndex: 50 })
})

it('a signed-in reader on a device without the place resumes the account\'s Bible place from the link, never Genesis 1 paragraph 0', async () => {
  const cloud = {
    books: { psalms: pin('psalms', 'Psalms', 23, 501, 3, 4, TODAY - 30_000) },
    lastSettledBookId: 'psalms',
    lastSettledAt: TODAY - 30_000,
    finished: {},
  }
  const writes: string[] = []
  const content = (globalThis.fetch as unknown as (input: RequestInfo | URL, init?: RequestInit) => Promise<unknown>)
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('/api/lab-position')) {
      if (init?.method === 'PUT') { writes.push(String(init.body)); return { ok: true, status: 200, json: async () => ({}) } }
      return { ok: true, status: 200, json: async () => cloud }
    }
    return content(input, init)
  }))
  window.history.replaceState(null, '', '/reader?book=bible')
  render(<LabApp pathname="/reader" authToken="token" />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  await waitFor(() => expect(screen.getByTestId('lab-reading-stage').textContent).toContain('Chapter 501 paragraph 3'))
  expect(root.getAttribute('data-place')).toBe('3:4')
  expect(readLabPositionLocal().books.genesis).toBeUndefined()
  expect(readLabPositionLocal().books.psalms).toMatchObject({ sequentialChapter: 501, paragraphIndex: 3, wordIndex: 4 })
  for (const body of writes) expect(JSON.parse(body).books?.genesis).toBeUndefined()
})

it('a /reader?book=odyssey link resumes the saved Odyssey place, not its first chapter', async () => {
  vi.stubGlobal('__BUILD_VERSION__', 'test')
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('odyssey') && url.includes('manifest.json')) {
      return { ok: true, json: async () => ({ format: 'tinct-edition-chapters-v1', bookId: 'odyssey', editionKey: 'original-en', chapters: [
        { number: 1, title: 'Book I', path: 'ch0001.json' },
        { number: 2, title: 'Book II', path: 'ch0002.json' },
        { number: 3, title: 'Book III', path: 'ch0003.json' },
      ] }) }
    }
    const chapter = url.match(/odyssey.*ch0*(\d+)\.json/)?.[1]
    if (chapter) return { ok: true, json: async () => ({ number: Number(chapter), title: `Book ${chapter}`, paragraphs: paragraphs(`Odyssey ${chapter}`) }) }
    return { ok: false, status: 503, json: async () => ({}) }
  }))
  localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({
    books: { odyssey: { ...pin('odyssey', 'The Odyssey', 3, 3, 6, 2, TODAY - 30_000), primaryEditionKey: 'original-en' } },
    lastSettledBookId: 'odyssey',
    lastSettledAt: TODAY - 30_000,
    finished: {},
  }))
  window.history.replaceState(null, '', '/reader?book=odyssey')
  render(<LabApp pathname="/reader" authToken={null} />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  await waitFor(() => expect(screen.getByTestId('lab-reading-stage').textContent).toContain('Odyssey 3 paragraph 6'))
  expect(root.getAttribute('data-place')).toBe('6:2')
  expect(readLabPositionLocal().books.odyssey).toMatchObject({ sequentialChapter: 3, paragraphIndex: 6, wordIndex: 2 })
})
