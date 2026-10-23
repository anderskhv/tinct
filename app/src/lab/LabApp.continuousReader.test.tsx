// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { LAB_POSITION_STORAGE_KEY } from './labPosition'
import { readLabPositionLocal } from './labPositionStore'
import { resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

const chapter = Array.from({ length: 30 }, (_, index) => `Paragraph ${index} has source words to hold a nonzero resume position.`)

beforeEach(() => {
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en' }))
  localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({
    books: { genesis: { bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1,
      paragraphIndex: 13, wordIndex: 4, primaryEditionKey: 'kjv-en', updatedAt: Date.now() - 1000, deviceId: 'device-a', rev: 1 } },
    lastSettledBookId: 'genesis', lastSettledAt: Date.now() - 1000, finished: {},
  }))
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('manifest.json')) return { ok: true, json: async () => ({ chapters: [{ number: 1, title: 'Genesis 1', path: 'ch1.json' }] }) }
    if (url.includes('ch1.json')) return { ok: true, json: async () => ({ paragraphs: chapter }) }
    if (url.includes('threads.json')) return { ok: true, json: async () => ({ characters: [] }) }
    return { ok: false, status: 503, json: async () => ({}) }
  }))
})
afterEach(() => {
  cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

it('private desktop mounts bounded structured text at the saved word without an inactive paginator or reflow writer', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  await waitFor(() => expect(screen.getByTestId('continuous-reader').querySelector('[data-paragraph-index="13"][data-word-index="4"]')).toBeTruthy())
  expect(root.getAttribute('data-continuous-reader')).toBe('true')
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(root.querySelector('.lab-native-paginator, .lab-desktop-paginator, .lab-page-measure')).toBeNull()
  expect(readLabPositionLocal().books.genesis).toMatchObject({ paragraphIndex: 13, wordIndex: 4 })
  window.dispatchEvent(new Event('resize'))
  expect(root.getAttribute('data-place')).toBe('13:4')
})

it('private Classic deep link and in-place Margin/Classic settings preserve the saved source word', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1&view=two-page')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  expect(root.getAttribute('data-continuous-reader')).toBeNull()
  expect(root.getAttribute('data-place')).toBe('13:4')
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-editions'))
  expect(screen.getByTestId('lab-v2-layout-classic').getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  await waitFor(() => expect(screen.getByTestId('continuous-reader').querySelector('[data-paragraph-index="13"][data-word-index="4"]')).toBeTruthy())
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(window.location.search).toContain('sharedReader=1')
  expect(window.location.search).not.toContain('view=two-page')
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-editions'))
  fireEvent.click(screen.getByTestId('lab-v2-layout-classic'))
  await waitFor(() => expect(root.getAttribute('data-continuous-reader')).toBeNull())
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(window.location.search).toContain('view=two-page')
})
