// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

vi.mock('../services/dictionary', () => ({ lookup: vi.fn(async () => null) }))

const characterFixture = vi.hoisted(() => ({ data: null as unknown }))
vi.mock('../services/characters/useCharacterCards', () => ({
  useCharacterCards: (bookId?: string) => bookId === 'to-the-lighthouse' ? characterFixture.data : null,
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
  characterFixture.data = null
})

function openSharedPhone() {
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1&layout=phone')
  const source = fallbackLabSource()
  return render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source,
    bookId: 'odyssey',
    paragraphs: ['A short chapter has words to select and explain.'],
    followParagraphs: [{ index: 0, text: 'A short chapter has words to select and explain.' }],
  }} authToken={null} sharedReader marginPhone />)
}

function selectPassage() {
  const words = screen.getAllByTestId('lab-word')
  fireEvent.pointerDown(words[1], { pointerId: 41, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerMove(words[3], { pointerId: 41, pointerType: 'mouse', clientX: 230, clientY: 200 })
  fireEvent.pointerUp(words[3], { pointerId: 41, pointerType: 'mouse', clientX: 230, clientY: 200 })
}

it('routes selected text through the compact phone bar and an Explain bottom card', async () => {
  openSharedPhone()
  const root = screen.getByTestId('lab-root')
  expect(root.getAttribute('data-lab-layout')).toBe('phone')
  expect(root.classList.contains('is-margin-phone')).toBe(true)
  expect(screen.queryByTestId('lab-header-aa')).toBeNull()
  selectPassage()
  expect(screen.getByTestId('lab-pbar-explain')).toBeTruthy()
  expect(document.querySelector('.selection-popup')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-pbar-explain'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('explain')
  expect(screen.getByTestId('lab-phone-card-dock')).toBeTruthy()
  expect(document.querySelector('.selection-popup.is-contextual-explain')).toBeNull()
  expect(screen.getByTestId('lab-phone-card-label').textContent).toContain('Explain')
})

it('routes a passage note and quiz to one keyboard-aware phone card at a time', () => {
  openSharedPhone()
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-pbar-note'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('note')
  expect(screen.getByTestId('lab-phone-card-dock')).toBeTruthy()
  fireEvent.pointerDown(screen.getByTestId('lab-phone-card-drag'), { pointerId: 1, clientY: 400 })
  fireEvent.pointerUp(screen.getByTestId('lab-phone-card-drag'), { pointerId: 1, clientY: 500 })
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-pbar-more'))
  fireEvent.click(screen.getByTestId('lab-pmore-quiz'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('quiz')
})

it('opens a reviewed name as its released character card and keeps the future gallery hidden', async () => {
  window.history.replaceState(null, '', '/reader?book=to-the-lighthouse&sharedReader=1&layout=phone')
  const text = 'Mrs. Ramsay greeted James.'
  const point = { chapterNumber: 1, paragraphIndex: 0, offset: 0 }
  const mrs = { id: 'mrs-ramsay', kind: 'person', storyRole: 'major', roleVisibleAt: point, firstMention: point,
    snapshots: [{ availableAt: point, name: 'Mrs. Ramsay', subtitle: 'At the window', body: 'A released reminder.' }] }
  const future = { id: 'prue', kind: 'person', storyRole: 'major', roleVisibleAt: { chapterNumber: 2, paragraphIndex: 0, offset: 0 }, firstMention: { chapterNumber: 2, paragraphIndex: 0, offset: 0 },
    snapshots: [{ availableAt: { chapterNumber: 2, paragraphIndex: 0, offset: 0 }, name: 'Prue', subtitle: '', body: 'Future information.' }] }
  characterFixture.data = { paragraphs: { 1: [text] }, edition: { characters: [mrs, future], mentions: [
    { characterId: 'mrs-ramsay', chapterNumber: 1, paragraphIndex: 0, startOffset: 0, endOffset: 11, text: 'Mrs. Ramsay' },
  ] } }
  const source = fallbackLabSource()
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source, bookId: 'to-the-lighthouse', paragraphs: [text],
    followParagraphs: [{ index: 0, text }],
  }} authToken={null} sharedReader marginPhone />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-characters-ready')).toBe('true'))
  const word = screen.getAllByTestId('lab-word')[0]
  fireEvent.pointerDown(word, { pointerId: 42, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerUp(word, { pointerId: 42, pointerType: 'mouse', clientX: 150, clientY: 200 })
  expect(screen.getByTestId('lab-phone-character').getAttribute('data-kind')).toBe('character')
  expect(screen.getByRole('heading', { name: 'Mrs. Ramsay' })).toBeTruthy()
  expect(screen.getByText('A released reminder.')).toBeTruthy()
  expect(screen.queryByText('Future information.')).toBeNull()
  expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Character gallery' }))
  expect(screen.getByText('In this passage')).toBeTruthy()
  expect(screen.queryByText('Prue')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Back to selected name' }))
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
})

it('opens an ordinary single-word lookup in the existing definition card before passage actions', () => {
  openSharedPhone()
  const word = screen.getAllByTestId('lab-word')[1]
  fireEvent.pointerDown(word, { pointerId: 43, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerUp(word, { pointerId: 43, pointerType: 'mouse', clientX: 150, clientY: 200 })
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('define')
  expect(screen.getByTestId('lab-phone-define')).toBeTruthy()
  expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  expect(screen.getByTestId('lab-phone-bar')).toBeTruthy()
  fireEvent.click(screen.getByTestId('lab-pbar-more'))
  fireEvent.click(screen.getByTestId('lab-pmore-define'))
  expect(screen.getByTestId('lab-phone-define')).toBeTruthy()
})

it('keeps Dictionary visible when a desktop character popup becomes a phone card', async () => {
  vi.stubGlobal('innerWidth', 1280)
  window.history.replaceState(null, '', '/reader?book=to-the-lighthouse&sharedReader=1')
  const text = 'Mrs. Ramsay greeted James.'
  const point = { chapterNumber: 1, paragraphIndex: 0, offset: 0 }
  characterFixture.data = { paragraphs: { 1: [text] }, edition: { characters: [{
    id: 'mrs-ramsay', kind: 'person', storyRole: 'major', roleVisibleAt: point, firstMention: point,
    snapshots: [{ availableAt: point, name: 'Mrs. Ramsay', subtitle: '', body: 'Released reminder.' }],
  }], mentions: [{ characterId: 'mrs-ramsay', chapterNumber: 1, paragraphIndex: 0, startOffset: 0, endOffset: 11, text: 'Mrs. Ramsay' }] } }
  const source = fallbackLabSource()
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source, bookId: 'to-the-lighthouse', paragraphs: [text], followParagraphs: [{ index: 0, text }],
  }} authToken={null} sharedReader marginPhone={false} />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-characters-ready')).toBe('true'))
  const word = screen.getAllByTestId('lab-word')[0]
  fireEvent.pointerDown(word, { pointerId: 44, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerUp(word, { pointerId: 44, pointerType: 'mouse', clientX: 150, clientY: 200 })
  expect(document.querySelector('[data-popup-mode="character"]')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.click(screen.getByTestId('lab-dbar-more'))
  fireEvent.click(screen.getByTestId('lab-dmore-define'))
  expect(document.querySelector('.lab-desktop-card[data-kind="define"]')).toBeTruthy()
  expect(document.querySelector('.selection-popup')).toBeNull()
  vi.stubGlobal('innerWidth', 390)
  fireEvent.resize(window)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-lab-layout')).toBe('phone'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('define')
  expect(screen.queryByTestId('lab-phone-bar')).toBeNull()
  expect(document.querySelector('.selection-popup')).toBeNull()
})

it('switches shared selection routing when a desktop window narrows and widens', async () => {
  vi.stubGlobal('innerWidth', 1280)
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1')
  const source = fallbackLabSource()
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source,
    bookId: 'odyssey',
    paragraphs: ['A short chapter has words to select and explain.'],
    followParagraphs: [{ index: 0, text: 'A short chapter has words to select and explain.' }],
  }} authToken={null} sharedReader marginPhone={false} />)
  const root = screen.getByTestId('lab-root')
  expect(root.getAttribute('data-lab-layout')).toBe('desktop')
  expect(root.classList.contains('is-margin-phone')).toBe(false)

  vi.stubGlobal('innerWidth', 390)
  fireEvent.resize(window)
  await waitFor(() => expect(root.getAttribute('data-lab-layout')).toBe('phone'))
  expect(root.classList.contains('is-margin-phone')).toBe(true)
  selectPassage()
  expect(screen.getByTestId('lab-pbar-explain')).toBeTruthy()
  expect(document.querySelector('.selection-popup')).toBeNull()

  vi.stubGlobal('innerWidth', 1280)
  fireEvent.resize(window)
  await waitFor(() => expect(root.getAttribute('data-lab-layout')).toBe('desktop'))
  expect(root.classList.contains('is-margin-phone')).toBe(false)
  expect(screen.queryByTestId('lab-pbar-explain')).toBeNull()
  expect(document.querySelector('.selection-popup')).toBeTruthy()
})

it('keeps the flag-off reader on its original selection surface after narrowing', async () => {
  vi.stubGlobal('innerWidth', 1280)
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=0')
  const source = fallbackLabSource()
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source,
    bookId: 'odyssey',
    paragraphs: ['A short chapter has words to select and explain.'],
    followParagraphs: [{ index: 0, text: 'A short chapter has words to select and explain.' }],
  }} authToken={null} marginPhone={false} />)

  vi.stubGlobal('innerWidth', 390)
  fireEvent.resize(window)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-lab-layout')).toBe('phone'))
  expect(screen.getByTestId('lab-root').classList.contains('is-margin-phone')).toBe(false)
  selectPassage()
  expect(document.querySelector('.selection-popup')).toBeTruthy()
  expect(screen.queryByTestId('lab-pbar-explain')).toBeNull()
})


it('creates and edits a shared desktop passage note in its margin card and persists one source highlight', async () => {
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1&layout=desktop&view=margin')
  const source = fallbackLabSource()
  const view = render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source, bookId: 'odyssey', paragraphs: ['A short chapter has words to select and explain.'],
    followParagraphs: [{ index: 0, text: 'A short chapter has words to select and explain.' }],
  }} authToken={null} sharedReader />)
  for (const word of screen.getAllByTestId('lab-word')) { vi.spyOn(word, 'getClientRects').mockReturnValue([{ left: 150, right: 230, top: 200, bottom: 220, width: 80, height: 20 }] as unknown as DOMRectList); vi.spyOn(word, 'getBoundingClientRect').mockReturnValue({ left: 150, right: 230, top: 200, bottom: 220, width: 80, height: 20 } as DOMRect) }
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-dbar-ask'))
  expect(document.querySelector('[data-testid="source-margin-item"][data-open="true"] [data-testid="lab-phone-card-input"]')).toBeTruthy()
  expect(screen.queryByTestId('lab-dbar-ask-field')).toBeNull()
  fireEvent.click(screen.getByRole('button', {name:'Minimise'}))
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-dbar-note'))
  expect(document.querySelector('[data-testid="source-margin-item"][data-open="true"]')).toBeTruthy()
  expect(document.querySelector('.selection-popup[data-popup-mode="note"]')).toBeNull()
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Highlight note' })).toBeTruthy())
  fireEvent.change(screen.getByRole('textbox', { name: 'Highlight note' }), { target: { value: 'A thought about this passage' } })
  fireEvent.click(screen.getByRole('button', { name: 'Minimise' }))
  let saved = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({ bookId: 'odyssey', paragraphIndex: 0, fromWord: 1, toWord: 4, note: 'A thought about this passage' })
  const id = saved[0].id
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-dbar-note'))
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Highlight note' })).toBeTruthy())
  expect((screen.getByRole('textbox', { name: 'Highlight note' }) as HTMLTextAreaElement).value).toBe('A thought about this passage')
  fireEvent.change(screen.getByRole('textbox', { name: 'Highlight note' }), { target: { value: 'An edited thought' } })
  fireEvent.click(screen.getByRole('button', { name: 'Minimise' }))
  saved = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({ id, note: 'An edited thought' })
  const noteHeader = screen.getAllByTestId('source-margin-open').find(button => button.textContent === 'Note')!
  expect(noteHeader).toBeTruthy()
  fireEvent.click(noteHeader)
  fireEvent.change(screen.getByRole('textbox', { name: 'Follow up' }), {target:{value:'What does my thought imply?'}})
  fireEvent.click(screen.getByRole('button', {name:'Send'}))
  await waitFor(() => expect(document.querySelector('[data-testid="source-margin-item"][data-open="true"]')?.textContent).toContain('Ask'))
  // A blocked or failed request must never discard the original note.
  saved = JSON.parse(localStorage.getItem('tinct-lab-highlights') || '[]')
  expect(saved[0]).toMatchObject({id, note:'An edited thought'})
  fireEvent.change(screen.getByRole('textbox', {name:'Follow up'}), {target:{value:'Private draft for the first account'}})
  view.rerender(<LabApp pathname="/reader" search={window.location.search} source={{...source,bookId:'odyssey',paragraphs:['A short chapter has words to select and explain.'],followParagraphs:[{index:0,text:'A short chapter has words to select and explain.'}]}} authToken="second-account-fixture" sharedReader />)
  await waitFor(() => expect(document.querySelectorAll('[data-testid="source-margin-item"][data-open="true"]')).toHaveLength(0))
  for (const word of screen.getAllByTestId('lab-word')) vi.spyOn(word, 'getBoundingClientRect').mockReturnValue({ left:150,right:230,top:200,bottom:220,width:80,height:20 } as DOMRect)
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-dbar-ask'))
  await waitFor(() => expect((screen.getByRole('textbox', {name:'Follow up'}) as HTMLTextAreaElement).value).toBe(''))
  fireEvent.click(screen.getByRole('button', {name:'Minimise'}))
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({summary:'A local catch-up fixture.'}), {headers:{'Content-Type':'application/json'}})))
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-catchup'))
  await waitFor(() => expect(document.querySelector('[data-testid="source-margin-item"][data-open="true"] .lab-catch-up-timeline')).toBeTruthy())
})
