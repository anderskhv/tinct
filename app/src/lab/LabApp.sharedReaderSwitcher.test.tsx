// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'
import { LAB_READER_HANDOFF_KEY } from './labReaderHandoff'

const mocks = vi.hoisted(() => ({ destination: vi.fn<(href: string) => void>(), result: vi.fn<(href: string) => void>() }))
vi.mock('./sharedReader/sharedReaderFlag', async importOriginal => {
  const original = await importOriginal<typeof import('./sharedReader/sharedReaderFlag')>()
  return { ...original, sharedReaderDestination: (href: string) => {
    mocks.destination(href)
    const result = original.sharedReaderDestination(href)
    mocks.result(result)
    return result
  } }
})
vi.mock('./LabBookSwitcher', () => ({ LabBookSwitcher: ({ onSelect }: { onSelect: (row: unknown) => void }) => (
  <div>
    <button type="button" onClick={() => onSelect({
      bookId: 'bible', title: 'Bible', chapterLabel: 'Genesis 1', target: {
        bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1, chapterLabel: 'Genesis 1',
        pageIndex: 0, paragraphIndex: 3, wordIndex: 4, paragraphCount: null, source: 'position', at: 100,
      },
    })}>Catalogue row</button>
    <button type="button" onClick={() => onSelect({
      bookId: 'userbook-0123456789abcdef01234567', title: 'Own PDF', chapterLabel: 'Page 1',
      href: '/reader?userBook=0123456789abcdef01234567&pages=1',
    })}>Own row</button>
  </div>
)}))

beforeEach(() => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'kjv-en', audioEdition: 'kjv-en' }))
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ books: [] }) })))
  mocks.destination.mockClear()
  mocks.result.mockClear()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

async function openSwitcher(sharedReader: boolean) {
  window.history.replaceState(null, '', `/reader?voiceTrial=mini${sharedReader ? '&sharedReader=1' : ''}`)
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader={sharedReader} />)
  fireEvent.click(screen.getByTestId('lab-header-book'))
  await waitFor(() => expect(screen.getByText('Catalogue row')).toBeTruthy())
}

it('keeps the private flag on a catalogue handoff after flushing the outgoing place', async () => {
  await openSwitcher(true)
  fireEvent.click(screen.getByText('Catalogue row'))
  expect(mocks.destination).toHaveBeenCalledWith('/reader?voiceTrial=mini')
  expect(mocks.result).toHaveBeenCalledWith('/reader?voiceTrial=mini&sharedReader=1')
  expect(JSON.parse(sessionStorage.getItem(LAB_READER_HANDOFF_KEY)!)).toMatchObject({
    kind: 'open-reader', bookId: 'bible', savedPlace: { chapterNumber: 1, paragraphIndex: 3, wordIndex: 4 },
  })
})

it('passes an own-book reader link through the private destination helper', async () => {
  await openSwitcher(true)
  fireEvent.click(screen.getByText('Own row'))
  expect(mocks.destination).toHaveBeenCalledWith('/reader?userBook=0123456789abcdef01234567&pages=1')
  expect(mocks.result).toHaveBeenCalledWith('/reader?userBook=0123456789abcdef01234567&pages=1&sharedReader=1')
  expect(sessionStorage.getItem(LAB_READER_HANDOFF_KEY)).toBeNull()
})

it('leaves the existing switcher navigation untouched when private mode is off', async () => {
  await openSwitcher(false)
  fireEvent.click(screen.getByText('Catalogue row'))
  expect(mocks.destination).not.toHaveBeenCalled()
  expect(sessionStorage.getItem(LAB_READER_HANDOFF_KEY)).not.toBeNull()
})
