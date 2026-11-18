// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'

// Anders, 16 Nov 2026 (iPhone, an essay collection): the "Back to reading" pill
// after a Notebook jump stayed on screen and nothing made it go away, even after
// he moved on to another essay. It is an offer to go back right after the jump:
// it leaves when tapped, when the reader goes somewhere else on purpose, or once
// they read on at the destination. The landing itself is not reading on.
vi.mock('./LabContentsV2', () => ({
  LabContentsV2: ({ onOpenPassage, onSelectChapter }: {
    onOpenPassage: (place: { chapterNumber: number; paragraphIndex: number; wordIndex: number }) => void
    onSelectChapter: (number: number) => void
  }) => <>
    <button onClick={() => onOpenPassage({ chapterNumber: 1, paragraphIndex: 2, wordIndex: 3 })}>Open noted passage</button>
    <button onClick={() => onSelectChapter(1)}>Choose chapter</button>
  </>,
}))
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals(); window.history.replaceState(null, '', '/') })

const pill = () => screen.queryByTestId('lab-notebook-return')

function renderPhone() {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=phone')
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader marginPhone />)
  return screen.getByTestId('lab-root')
}

function renderDesktopMargin() {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=desktop&view=margin')
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
  return screen.getByTestId('lab-root')
}

async function jumpFromNotebook(root: HTMLElement) {
  fireEvent.click(screen.getByText('Open noted passage'))
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('2:3'))
  // The programmatic landing is not a page turn: the offer is still there.
  await waitFor(() => expect(pill()).toBeTruthy())
}

it('phone: the Notebook return pill leaves once the reader turns a page at the destination', async () => {
  const root = renderPhone()
  await jumpFromNotebook(root)
  // A forward turn by the reader (key, tap or swipe all run the same turn).
  fireEvent.keyDown(window, { key: 'ArrowRight' })
  await waitFor(() => expect(pill()).toBeNull())
})

it('phone: the Notebook return pill leaves when the reader turns back a page', async () => {
  const root = renderPhone()
  await jumpFromNotebook(root)
  fireEvent.click(screen.getByTestId('lab-page-prev'))
  await waitFor(() => expect(pill()).toBeNull())
})

it('phone: choosing a chapter in Contents dismisses the Notebook return pill', async () => {
  const root = renderPhone()
  await jumpFromNotebook(root)
  fireEvent.click(screen.getByText('Choose chapter'))
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('0:0'))
  await new Promise(resolve => setTimeout(resolve, 50))
  expect(pill()).toBeNull()
})

it('phone: tapping the pill still returns to the exact pre-jump place, and a second Notebook jump keeps the first origin', async () => {
  const root = renderPhone()
  const origin = root.getAttribute('data-place')
  await jumpFromNotebook(root)
  fireEvent.click(screen.getByText('Open noted passage'))
  await waitFor(() => expect(pill()).toBeTruthy())
  fireEvent.click(pill()!)
  await waitFor(() => expect(root.getAttribute('data-place')).toBe(origin))
  expect(pill()).toBeNull()
})

it('desktop Margin: the Notebook return pill leaves once the reader scrolls on', async () => {
  const root = renderDesktopMargin()
  await jumpFromNotebook(root)
  fireEvent.wheel(screen.getByTestId('continuous-reader'), { deltaY: 120 })
  await waitFor(() => expect(pill()).toBeNull())
})

it('desktop Margin: choosing a chapter in Contents dismisses the Notebook return pill', async () => {
  const root = renderDesktopMargin()
  await jumpFromNotebook(root)
  fireEvent.click(screen.getByText('Choose chapter'))
  await waitFor(() => expect(root.getAttribute('data-place')).toBe('0:0'))
  await new Promise(resolve => setTimeout(resolve, 50))
  expect(pill()).toBeNull()
})

it('desktop Two-page: the Notebook return pill leaves once the reader turns a page', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
  window.history.replaceState(null, '', '/reader?sharedReader=1&layout=desktop&view=two-page')
  render(<LabApp pathname="/reader" source={fallbackLabSource()} authToken={null} sharedReader />)
  const root = screen.getByTestId('lab-root')
  await jumpFromNotebook(root)
  // A forward turn by the reader (key, tap or swipe all run the same turn).
  fireEvent.keyDown(window, { key: 'ArrowRight' })
  await waitFor(() => expect(pill()).toBeNull())
})
