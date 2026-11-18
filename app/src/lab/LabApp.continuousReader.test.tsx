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


// Margin is the desktop default since 4 Nov 2026 (Anders); Two-page was before.
it('fresh desktop text opens Margin at its place and remembers an explicit Two-page choice on reopen', async () => {
  localStorage.removeItem('tinct:reader-desktop-layout')
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  const view = render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-reader-ready')).toBe('true'))
  await waitFor(() => expect(screen.getByTestId('continuous-reader')).toBeTruthy())
  expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4')
  fireEvent.click(screen.getByTestId('lab-header-aa'))
  expect(screen.getByTestId('lab-v2-layout-margin').getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-v2-layout-two-page'))
  expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4')
  view.unmount()
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-reader-ready')).toBe('true'))
  expect(screen.getByTestId('lab-root').getAttribute('data-continuous-reader')).toBeNull()
  expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('13:4')
})

it('menu Chat anchors at the current nonzero source word with no selection or position movement', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('13:4'))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  const field = await screen.findByTestId('lab-ask-input')
  expect(document.activeElement).toBe(field)
  expect(field.closest('.lab-ask')).toBeTruthy()
  expect(root.getAttribute('data-place')).toBe('13:4')
  expect(readLabPositionLocal().books.genesis).toMatchObject({ paragraphIndex: 13, wordIndex: 4 })
  expect(root.getAttribute('data-desktop-panel')).toBe('chat')
})

it('discards an unsent Chat when closed and preserves the book across a layout roundtrip', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('13:4'))
  fireEvent.click(screen.getByTestId('lab-super')); fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  fireEvent.change(screen.getByTestId('lab-ask-input'), { target: { value: 'Keep this unsent margin question.' } })
  fireEvent.click(screen.getByTestId('lab-desktop-companion-close'))
  fireEvent.click(screen.getByTestId('lab-header-aa')); fireEvent.click(screen.getByTestId('lab-v2-layout-two-page'))
  expect(root.getAttribute('data-continuous-reader')).toBeNull()
  expect(screen.queryByTestId('lab-ask-input')).toBeNull()
  expect(root.querySelector('.lab-desktop-card')).toBeNull()
  expect(root.getAttribute('data-place')).toBe('13:4')
  fireEvent.click(screen.getByTestId('lab-header-aa')); fireEvent.click(screen.getByTestId('lab-v2-layout-margin'))
  fireEvent.click(screen.getByTestId('lab-super')); fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  expect((screen.getByTestId('lab-ask-input') as HTMLTextAreaElement).value).toBe('')
  expect(root.getAttribute('data-place')).toBe('13:4')
})

it('folds a saved margin thread on Compare transition without changing history and discards its follow-up draft', async () => {
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
  expect((screen.getByPlaceholderText('Ask a follow-up') as HTMLTextAreaElement).value).toBe('')
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

it('Margin: "Continue from last position" leaves once the reader scrolls on (5 Nov 2026: it never went away)', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  expect(root.getAttribute('data-continuous-reader')).toBe('true')
  fireEvent.click(screen.getByTestId('lab-header-chapter'))
  fireEvent.click(await screen.findByTestId('lab-tree-chapter-1'))
  const pill = await screen.findByTestId('lab-continue-chapter')
  expect(pill.textContent).toBe('Continue from last position')
  fireEvent.wheel(screen.getByTestId('continuous-reader'), { deltaY: 120 })
  await waitFor(() => expect(screen.queryByTestId('lab-continue-chapter')).toBeNull())
})

// Anders, 5 Nov 2026: he read 2 Maccabees 11 to its end in Margin and Contents
// showed it neither finished nor started. Margin is read by scrolling, so the
// chapter's progress is the last word in view, and scrolling the chapter's last
// line into view finishes it, as turning past the last page does in Two-page.
// Neither moves the saved reading place.
it('Margin counts a chapter scrolled to its end as finished, and shows the share read before that', async () => {
  window.history.replaceState(null, '', '/reader?book=bible&sharedReader=1')
  const words = chapter.map(paragraph => paragraph.split(' ').length)
  const before = words.map((_, index) => words.slice(0, index).reduce((sum, count) => sum + count, 0))
  const total = before.at(-1)! + words.at(-1)!
  let top = 0
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    if (this.dataset.testid === 'continuous-reader') return { top: 0, bottom: 600, height: 600 } as DOMRect
    if (this.dataset.testid === 'lab-word') {
      const y = (before[Number(this.dataset.paragraphIndex)] + Number(this.dataset.wordIndex)) * 20 - this.closest<HTMLElement>('.continuous-reader')!.scrollTop
      return { top: y, bottom: y + 20, height: 20 } as DOMRect
    }
    return { top: 0, bottom: 0, height: 0 } as DOMRect
  })
  render(<LabApp pathname="/reader" authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await waitFor(() => expect(root.getAttribute('data-reader-ready')).toBe('true'))
  await waitFor(() => expect(screen.getByTestId('continuous-reader').querySelector('[data-paragraph-index="13"][data-word-index="4"]')).toBeTruthy())
  const host = screen.getByTestId('continuous-reader')
  const max = total * 20 + 200 - 600
  top = host.scrollTop
  Object.defineProperties(host, { clientHeight: { value: 600 }, scrollHeight: { value: total * 20 + 200 },
    scrollTop: { configurable: true, get: () => top, set: value => { top = Math.max(0, Math.min(max, value)) } } })
  const scrollTo = (target: number) => {
    for (let next = top + 120; next < target + 120; next += 120) { fireEvent.wheel(host, { deltaY: 120 }); host.scrollTop = Math.min(next, target); fireEvent.scroll(host) }
  }
  const contentsLabel = async () => {
    fireEvent.click(screen.getByTestId('lab-header-chapter'))
    const label = await waitFor(() => screen.getByTestId('lab-tree-chapter-1').getAttribute('aria-label'))
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByTestId('lab-tree-chapter-1')).toBeNull())
    return label
  }
  try {
    // Halfway: the last word in view sits about 3,600px down of 6,600.
    // The saved place stays the word on the reader's top line (24% down, at
    // most 140px), as the scroll left it, and the stored pin agrees.
    const placeOnTopLine = async () => {
      const [paragraphIndex, wordIndex] = root.getAttribute('data-place')!.split(':').map(Number)
      const y = (before[paragraphIndex] + wordIndex) * 20
      expect(y + 20).toBeGreaterThan(top)
      expect(y).toBeLessThanOrEqual(top + 140)
      await waitFor(() => expect(readLabPositionLocal().books.genesis).toMatchObject({ sequentialChapter: 1, paragraphIndex, wordIndex }))
    }
    // Halfway: the last word in view sits 3,600px down of 6,600.
    scrollTo(3000)
    expect(await contentsLabel()).toMatch(/^Genesis 1, currently reading, 5\d% read$/)
    await placeOnTopLine()
    expect(readLabPositionLocal().finished.bible ?? []).not.toContain(1)
    // On to the end: the last line comes into view.
    scrollTo(max)
    expect(readLabPositionLocal().finished.bible).toContain(1)
    expect(await contentsLabel()).toBe('Genesis 1, currently reading, 100% read')
    // Finishing records the chapter; it never moves the reading place.
    await placeOnTopLine()
  } finally { rect.mockRestore() }
})
