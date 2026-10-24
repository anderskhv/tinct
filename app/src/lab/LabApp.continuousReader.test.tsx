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
  localStorage.setItem('tinct:reader-desktop-layout', JSON.stringify({ bible: 'margin' }))
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
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  expect(screen.getByTestId('lab-v2-layout-two-page').getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByTestId('lab-v2-layout-compare')).toBeTruthy()
  fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  await waitFor(() => expect(screen.getByTestId('continuous-reader').querySelector('[data-paragraph-index="13"][data-word-index="4"]')).toBeTruthy())
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(window.location.search).toContain('sharedReader=1')
  expect(window.location.search).not.toContain('view=two-page')
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  fireEvent.click(screen.getByTestId('lab-v2-layout-two-page'))
  await waitFor(() => expect(root.getAttribute('data-continuous-reader')).toBeNull())
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(window.location.search).toContain('view=two-page')
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  fireEvent.click(screen.getByTestId('lab-v2-layout-compare'))
  await waitFor(() => expect(root.getAttribute('data-desktop-view')).toBe('compare'))
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(window.location.search).toContain('view=compare')
})

it('Aa offers Compare before a second version is chosen and asks for a real compatible version first', async () => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'kjv-en', compareOpen: false, compareChosen: true }))
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  expect(screen.getByTestId('lab-v2-layout-compare')).toBeTruthy()
  fireEvent.click(screen.getByTestId('lab-v2-layout-compare'))
  expect(screen.getByRole('heading', { name: 'Compare version' })).toBeTruthy()
  expect(root.getAttribute('data-desktop-view')).toBe('read')
  expect(root.getAttribute('data-place')).toBe('13:4')
  fireEvent.click(document.querySelector('[data-edition="web-en"]')!)
  expect(screen.getByTestId('lab-v2-layout-compare')).toBeTruthy()
  await waitFor(() => expect(screen.getByTestId('lab-v2-layout-compare').hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByTestId('lab-v2-layout-compare'))
  await waitFor(() => expect(root.getAttribute('data-desktop-view')).toBe('compare'))
  expect(root.getAttribute('data-place')).toBe('13:4')
})


it('fresh desktop text opens Two-page and remembers an explicit Margin choice on reopen', async () => {
  localStorage.removeItem('tinct:reader-desktop-layout')
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  const view = render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-reader-ready')).toBe('true'))
  expect(screen.getByTestId('lab-root').getAttribute('data-continuous-reader')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  expect(screen.getByTestId('lab-v2-layout-two-page').getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4')
  view.unmount()
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  await waitFor(() => expect(screen.getByTestId('continuous-reader')).toBeTruthy())
  expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4')
})
