// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { chapterHearingPages, chapterPageSegments, pageIndexForPlace } from './labHearing'
import { resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

vi.mock('../data/audioAvailability', async importOriginal => ({ ...await importOriginal<typeof import('../data/audioAvailability')>(), isAudioHeld: () => false }))
vi.mock('./labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('./labNarration')>(),
  fetchNarrationPilotInfo: async () => ({ enabled: false, provider: 'google', voices: [] }),
}))

/**
 * A shared highlight opens `/reader?…&paragraph=P&word=W&share=ID` (nightly QA,
 * /q/fv7btyc: Frankenstein ch. 9, paragraph 2, word 61). The reader must open
 * the page that holds that word as the chapter naturally lays out — the page
 * the sharer was reading — not a page cut to begin at the word, which showed
 * the highlight's few lines and then blank paper.
 */
const WORDS = Array.from({ length: 260 }, (_, index) => `w${index}${index % 9 === 8 ? '.' : ''}`)
const PARAGRAPHS = [WORDS.join(' ')]
const TARGET = { paragraphIndex: 0, wordIndex: 151 }

beforeEach(() => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en' }))
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('manifest.json')) return { ok: true, json: async () => ({ chapters: [{ number: 1054, title: 'Romans 8', path: 'ch1054.json' }] }) }
    if (url.includes('ch1054.json')) return { ok: true, json: async () => ({ paragraphs: PARAGRAPHS }) }
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
})

it('opens a shared word on the natural page that holds it, not a page cut to start there', async () => {
  sessionStorage.setItem('tinct:lab-reader-handoff', JSON.stringify({
    kind: 'open-reader', bookId: 'bible', primaryEditionKey: 'kjv-en', startAtSavedPlace: true,
    savedPlace: { bookId: 'bible', chapterNumber: 1054, ...TARGET, page: 0 },
  }))
  render(<LabApp pathname="/lab/phone" authToken={null} />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  const natural = chapterHearingPages(PARAGRAPHS, null)
  const page = natural[pageIndexForPlace(natural, TARGET.paragraphIndex, TARGET.wordIndex)]
  const [segment] = chapterPageSegments(page)
  // The fixture is only a test if the word sits inside its page, not at its top.
  expect(segment.from).toBeLessThan(TARGET.wordIndex)
  await waitFor(() => {
    const shown = [...screen.getByTestId('lab-reading-stage').querySelectorAll<HTMLElement>('[data-testid="lab-word"][data-word-index]')]
      .map(word => Number(word.dataset.wordIndex))
    expect(shown).toContain(TARGET.wordIndex)
    expect(shown[0]).toBe(segment.from)
    expect(shown[shown.length - 1]).toBe(segment.to - 1)
  })
  // The reader's place is still the shared word, so a reload reopens this page.
  expect(root.getAttribute('data-place')).toBe(`${TARGET.paragraphIndex}:${TARGET.wordIndex}`)
})
