// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { LAYOUT_TRACE_LOG_KEY, LAYOUT_TRACE_ON_KEY, flushLayoutTraceForTest, layoutTraceEntries, resetLayoutTraceForTest } from './labLayoutTrace'

// The on-device layout trace (?layoutTrace=1, Anders 26 Nov 2026). No AI: every request answers 404.
vi.mock('../services/dictionary', () => ({ lookup: vi.fn(async () => null) }))
const characterFixture = vi.hoisted(() => ({ data: null as unknown }))
vi.mock('../services/characters/useCharacterCards', () => ({
  useCharacterCards: (bookId?: string) => bookId === 'to-the-lighthouse' ? characterFixture.data : null,
}))

const TEXT = 'Mrs. Ramsay greeted James.'

beforeEach(() => {
  resetLayoutTraceForTest()
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
  resetLayoutTraceForTest()
  characterFixture.data = null
})

async function openPhone(search: string) {
  window.history.replaceState(null, '', `/reader?book=to-the-lighthouse&sharedReader=1&layout=phone${search}`)
  const point = { chapterNumber: 1, paragraphIndex: 0, offset: 0 }
  const card = (id: string, name: string) => ({ id, kind: 'person', storyRole: 'major', roleVisibleAt: point, firstMention: point,
    snapshots: [{ availableAt: point, name, subtitle: 'In the house', body: `${name} reminder.` }] })
  characterFixture.data = { paragraphs: { 1: [TEXT] }, edition: { characters: [card('mrs-ramsay', 'Mrs. Ramsay'), card('james', 'James')], mentions: [
    { characterId: 'mrs-ramsay', chapterNumber: 1, paragraphIndex: 0, startOffset: 0, endOffset: 11, text: 'Mrs. Ramsay' },
    { characterId: 'james', chapterNumber: 1, paragraphIndex: 0, startOffset: 20, endOffset: 25, text: 'James' },
  ] } }
  const source = fallbackLabSource()
  render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source, bookId: 'to-the-lighthouse', paragraphs: [TEXT], followParagraphs: [{ index: 0, text: TEXT }],
  }} authToken={null} sharedReader marginPhone />)
  await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-characters-ready')).toBe('true'))
}

/** Anders's steps: a name's People card, its gallery, another person, then close. */
function runCharacterSteps() {
  const word = screen.getAllByTestId('lab-word')[0]
  fireEvent.pointerDown(word, { pointerId: 42, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerUp(word, { pointerId: 42, pointerType: 'mouse', clientX: 150, clientY: 200 })
  expect(screen.getByTestId('lab-phone-character')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Character gallery' }))
  fireEvent.click(screen.getByRole('button', { name: /^James/ }))
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByTestId('lab-phone-character')).toBeNull()
}

it('off: the card steps and the t menu add no trace control, no entries and no storage', async () => {
  const setItem = vi.spyOn(Storage.prototype, 'setItem')
  await openPhone('')
  runCharacterSteps()
  fireEvent.click(screen.getByTestId('lab-super'))
  expect(screen.getByTestId('lab-super-menu')).toBeTruthy()
  expect(screen.queryByTestId('lab-trace-copy')).toBeNull()
  flushLayoutTraceForTest()
  expect(layoutTraceEntries()).toEqual([])
  expect(setItem.mock.calls.filter(([key]) => String(key).startsWith('tinct-layout-trace'))).toEqual([])
  expect(sessionStorage.getItem(LAYOUT_TRACE_ON_KEY)).toBeNull()
  expect(sessionStorage.getItem(LAYOUT_TRACE_LOG_KEY)).toBeNull()
})

it('on: records the character card open, its gallery steps, its close and the pages, and copies them', async () => {
  await openPhone('&layoutTrace=1')
  runCharacterSteps()
  const entries = layoutTraceEntries()
  const open = entries.find(entry => entry.k === 'open' && entry.card === 'card:character')
  const close = entries.find(entry => entry.k === 'close' && entry.card === 'card:character')
  expect(open).toMatchObject({ ch: 1, open: ['card:character'] })
  expect(close).toBeTruthy()
  expect(entries.indexOf(close!)).toBeGreaterThan(entries.indexOf(open!))
  expect(entries.filter(entry => entry.k === 'char-nav').map(entry => entry.to)).toEqual(['gallery', 'person'])
  expect(entries.some(entry => entry.k === 'page' && entry.ch === 1 && typeof entry.n === 'number')).toBe(true)
  // Never book text: names and passage words stay out of the trace.
  const json = JSON.stringify(entries)
  expect(json).not.toContain('Ramsay')
  expect(json).not.toContain('James')
  expect(json).not.toContain('greeted')

  const writeText = vi.fn(async () => {})
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
  fireEvent.click(screen.getByTestId('lab-super'))
  expect(entries.length).toBeGreaterThan(0)
  expect(screen.getByTestId('lab-trace-copy-button').textContent).toContain('Copy trace')
  await act(async () => { fireEvent.click(screen.getByTestId('lab-trace-copy-button')) })
  expect(writeText).toHaveBeenCalledTimes(1)
  const copied = JSON.parse((writeText.mock.calls[0] as unknown as [string])[0])
  expect(copied.e.some((entry: { k: string; card?: string }) => entry.k === 'open' && entry.card === 't-menu')).toBe(true)
  expect(screen.getByTestId('lab-trace-copy-status').textContent).toBe('Copied')
})

it('on: a refused clipboard shows the trace in a selectable text area', async () => {
  await openPhone('&layoutTrace=1')
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: vi.fn(async () => { throw new Error('denied') }) } })
  fireEvent.click(screen.getByTestId('lab-super'))
  await act(async () => { fireEvent.click(screen.getByTestId('lab-trace-copy-button')) })
  const area = screen.getByTestId('lab-trace-copy-text') as HTMLTextAreaElement
  expect(JSON.parse(area.value).e.length).toBeGreaterThan(0)
  expect(area.readOnly).toBe(true)
})
