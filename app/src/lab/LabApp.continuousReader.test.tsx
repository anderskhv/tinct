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

it('menu Chat anchors at the current nonzero source word with no selection or position movement', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('13:4'))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  const field = await screen.findByPlaceholderText('Ask about this passage')
  const entry = field.closest<HTMLElement>('.source-margin-item')!
  expect(document.activeElement).toBe(field)
  expect(Number(entry.dataset.sourceOrder)).toBe(13 * 100000 + 4)
  expect(entry.dataset.open).toBe('true')
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(readLabPositionLocal().books.genesis).toMatchObject({ paragraphIndex: 13, wordIndex: 4 })
  expect(root.getAttribute('data-desktop-panel')).not.toBe('chat')
})

it('folds an unsent margin Ask when entering Two-page and restores its draft when reopened in Margin', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('13:4'))
  fireEvent.click(screen.getByTestId('lab-super')); fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  fireEvent.change(screen.getByPlaceholderText('Ask about this passage'), { target: { value: 'Keep this unsent margin question.' } })
  fireEvent.click(screen.getByTestId('lab-header-aa')); fireEvent.click(screen.getByTestId('lab-v2-layout-two-page'))
  expect(root.getAttribute('data-continuous-reader')).toBeNull()
  expect(screen.queryByPlaceholderText('Ask about this passage')).toBeNull()
  expect(root.querySelector('.lab-desktop-card')).toBeNull()
  expect(root.getAttribute('data-place')).toBe('13:4')
  fireEvent.click(screen.getByTestId('lab-header-aa')); fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  expect(screen.getByTestId('source-margin-item').dataset.open).toBe('false')
  fireEvent.click(screen.getByTestId('source-margin-open'))
  expect((screen.getByPlaceholderText('Ask about this passage') as HTMLTextAreaElement).value).toBe('Keep this unsent margin question.')
  expect(root.getAttribute('data-place')).toBe('13:4')
})

it('folds a saved margin thread on Compare transition without changing its history or follow-up draft', async () => {
  const history = [{ id: 'mc_saved-thread', bookId: 'bible', chapterNumber: 1, paragraphIndex: 13, startTimestamp: 1000, endTimestamp: 1001, preview: 'Saved source question', messages: [{ id: 'saved-u', role: 'user', content: 'Saved source question', timestamp: 1000, bookId: 'bible', chapterNumber: 1 }, { id: 'saved-a', role: 'assistant', content: 'Saved source answer', timestamp: 1001, bookId: 'bible', chapterNumber: 1 }], card: { id: 'saved-thread', kind: 'ask', chapterNumber: 1, at: 1000, u: 1001, text: 'A source passage', anchor: { editionKey: 'kjv-en', chapterNumber: 1, paragraphIndex: 13, fromWord: 4, endParagraphIndex: 13, toWord: 7 } } }]
  localStorage.setItem('tinct:chat-history:bible', JSON.stringify(history))
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en', compareEdition: 'web-en', compareChosen: true }))
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('13:4'))
  fireEvent.click(document.querySelector('[data-card-id="mc_saved-thread"] .source-margin-label')!)
  fireEvent.change(screen.getByPlaceholderText('Ask a follow-up'), { target: { value: 'An unsent saved-thread follow-up.' } })
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  await waitFor(() => expect(screen.getByTestId('lab-v2-layout-compare').hasAttribute('disabled')).toBe(false))
  fireEvent.click(screen.getByTestId('lab-v2-layout-compare'))
  expect(root.getAttribute('data-desktop-view')).toBe('compare')
  expect(root.querySelector('.lab-desktop-card')).toBeNull()
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(JSON.parse(localStorage.getItem('tinct:chat-history:bible')!)).toEqual(history)
  fireEvent.click(screen.getByTestId('lab-header-aa')); fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  expect(screen.getByTestId('source-margin-item').dataset.open).toBe('false')
  fireEvent.click(screen.getByTestId('source-margin-open'))
  expect((screen.getByPlaceholderText('Ask a follow-up') as HTMLTextAreaElement).value).toBe('An unsent saved-thread follow-up.')
  expect(root.getAttribute('data-place')).toBe('13:4')
})

it.each([false, true])('keeps a fresh %s single-word drag inside a saved highlight exact when released and copied', async singleWord => {
  vi.stubGlobal('PointerEvent', MouseEvent)
  const groupText = 'source words to hold a nonzero resume'
  localStorage.setItem('tinct-lab-highlights', JSON.stringify([{ id: 'saved-wide-mark', bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, paragraphIndex: 13, fromWord: 3, endParagraphIndex: 13, toWord: 10, text: groupText, groupText, groupId: 'kept-group', color: 'gold', updatedAt: Date.now() }]))
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4'))
  const from = document.querySelector('[data-testid="lab-word"][data-paragraph-index="13"][data-word-index="4"]')!
  const to = document.querySelector(`[data-testid="lab-word"][data-paragraph-index="13"][data-word-index="${singleWord ? 4 : 6}"]`)!
  fireEvent.pointerDown(from, { button: 0, clientX: 10, clientY: 10 })
  fireEvent.pointerMove(to, { clientX: 20, clientY: 10 })
  const during = [...document.querySelectorAll('[data-testid="lab-word"].is-selecting')].map(word => word.textContent?.trim())
  fireEvent.pointerUp(to, { clientX: 20, clientY: 10 })
  expect([...document.querySelectorAll('[data-testid="lab-word"].is-selecting')].map(word => word.textContent?.trim())).toEqual(during)
  expect(during).toEqual(singleWord ? ['words'] : ['words', 'to', 'hold'])
  const setData = vi.fn()
  fireEvent.copy(document, { clipboardData: { setData } })
  expect(setData).toHaveBeenCalledWith('text/plain', singleWord ? 'words' : 'words to hold')
})

it('highlights only a fresh dragged subrange without recoloring its wider existing highlight', async () => {
  vi.stubGlobal('PointerEvent', MouseEvent)
  localStorage.setItem('tinct-highlight-color', 'rose')
  const existing = { id: 'saved-wide-mark', bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, paragraphIndex: 13, fromWord: 3, endParagraphIndex: 13, toWord: 10, text: 'source words to hold a nonzero resume', color: 'gold', updatedAt: Date.now() }
  localStorage.setItem('tinct-lab-highlights', JSON.stringify([existing]))
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4'))
  const from = document.querySelector('[data-testid="lab-word"][data-paragraph-index="13"][data-word-index="4"]')!
  const to = document.querySelector('[data-testid="lab-word"][data-paragraph-index="13"][data-word-index="6"]')!
  fireEvent.pointerDown(from, { button: 0, clientX: 10, clientY: 10 })
  fireEvent.pointerMove(to, { clientX: 20, clientY: 10 })
  fireEvent.pointerUp(to, { clientX: 20, clientY: 10 })
  fireEvent.click(screen.getByTestId('lab-dbar-highlight'))
  const marks = JSON.parse(localStorage.getItem('tinct-lab-highlights')!)
  expect(marks.find((mark: { id: string }) => mark.id === existing.id)).toEqual(existing)
  expect(marks).toContainEqual(expect.objectContaining({ paragraphIndex: 13, fromWord: 4, endParagraphIndex: 13, toWord: 7, text: 'words to hold', color: 'rose' }))
  expect(marks).toHaveLength(2)
})
