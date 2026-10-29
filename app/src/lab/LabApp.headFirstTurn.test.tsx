// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import type { ChapterHearingPage } from './labHearing'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

vi.mock('./labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('./labNarration')>(),
  initialNarrationPilotInfo: () => ({ enabled: false, provider: 'google', voices: [] }),
  fetchNarrationPilotInfo: async () => ({ enabled: false, provider: 'google', voices: [] }),
}))

/** Publish a source-covering provisional map, holding the full map until the test releases it. */
const layouts = vi.hoisted(() => ({ count: 0, kept: [] as Array<number | null>, finish: null as null | (() => void) }))
vi.mock('./LabNativePaginator', async importOriginal => {
  const actual = await importOriginal<typeof import('./LabNativePaginator')>()
  const { useEffect } = await import('react')
  const { tokenizeHearingWords } = await import('./labHearing')
  const PAGE = 8
  const cut = (paragraphs: string[], from: { paragraphIndex: number; wordIndex: number }, shift: number) => {
    const pages: ChapterHearingPage[] = []
    paragraphs.forEach((text, paragraphIndex) => {
      if (paragraphIndex < from.paragraphIndex) return
      const length = tokenizeHearingWords(text).length
      let at = paragraphIndex === from.paragraphIndex ? from.wordIndex : 0
      let first = at === 0 && shift > 0 && shift < length
      while (at < length) {
        const to = Math.min(length, at + (first ? shift : PAGE))
        pages.push({ paragraphIndex, from: at, to })
        at = to
        first = false
      }
    })
    return pages
  }
  function FakeNativePaginator({ paragraphs, keepPages, onPages }: {
    paragraphs: string[]
    keepPages?: ChapterHearingPage[]
    onPages: (pages: ChapterHearingPage[], paragraphs?: string[], partial?: boolean) => void
  }) {
    useEffect(() => {
      const layout = ++layouts.count
      layouts.kept.push(keepPages?.length ?? null)
      const shift = layout === 1 ? 0 : 3
      const last = keepPages?.[keepPages.length - 1]
      const pages = last
        ? [...keepPages!, ...cut(paragraphs, { paragraphIndex: last.paragraphIndex, wordIndex: last.to }, shift)]
        : cut(paragraphs, { paragraphIndex: 0, wordIndex: 0 }, shift)
      onPages(pages, paragraphs, true)
      layouts.finish = () => onPages(pages, paragraphs, false)
    }, [paragraphs, keepPages, onPages])
    return null
  }
  return { ...actual, LabNativePaginator: FakeNativePaginator }
})

beforeEach(() => {
  layouts.count = 0
  layouts.finish = null
  vi.spyOn(performance, 'now').mockReturnValue(1000)
  layouts.kept = []
  // Native column paging, as on every phone browser the reader supports.
  vi.stubGlobal('CSS', { supports: () => true, escape: (value: string) => value })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  try { localStorage.clear() } catch { /* jsdom */ }
  try { sessionStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

const root = () => screen.getByTestId('lab-root')
const firstWord = () => {
  const word = screen.getByTestId('lab-page-wrap').querySelector<HTMLElement>('[data-testid="lab-word"]')
  return word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null
}

it('honours a queued turn after the head-first deadline without turning again when the full map arrives', async () => {
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
  await waitFor(() => expect(firstWord()).toBe('0:0'))
  expect(layouts.finish).not.toBeNull()
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  fireEvent.keyDown(window, { key: 'ArrowRight' })
  expect(firstWord()).toBe('0:0')
  vi.mocked(performance.now).mockReturnValue(4500)
  await act(async () => { await vi.advanceTimersByTimeAsync(3500) })
  expect(firstWord()).toBe('0:8')
  act(() => layouts.finish!())
  await act(async () => { await vi.advanceTimersByTimeAsync(50) })
  expect(firstWord()).toBe('0:8')
})

it('uses an early full map once and cancels the remaining fallback timer', async () => {
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
  await waitFor(() => expect(firstWord()).toBe('0:0'))
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  fireEvent.keyDown(window, { key: 'ArrowRight' })
  act(() => layouts.finish!())
  await act(async () => { await vi.advanceTimersByTimeAsync(50) })
  expect(firstWord()).toBe('0:8')
  vi.mocked(performance.now).mockReturnValue(5000)
  await act(async () => { await vi.advanceTimersByTimeAsync(4000) })
  expect(firstWord()).toBe('0:8')
})

it('cancels a queued forward turn when the reader asks to go back', async () => {
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
  await waitFor(() => expect(firstWord()).toBe('0:0'))
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  fireEvent.keyDown(window, { key: 'ArrowRight' })
  fireEvent.keyDown(window, { key: 'ArrowLeft' })
  vi.mocked(performance.now).mockReturnValue(5000)
  await act(async () => { await vi.advanceTimersByTimeAsync(4000) })
  act(() => layouts.finish!())
  await act(async () => { await vi.advanceTimersByTimeAsync(50) })
  expect(firstWord()).toBe('0:0')
})

it('does not turn behind a menu opened while the full map is pending', async () => {
  render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
  await waitFor(() => expect(firstWord()).toBe('0:0'))
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  fireEvent.keyDown(window, { key: 'ArrowRight' })
  fireEvent.click(screen.getByTestId('lab-super'))
  vi.mocked(performance.now).mockReturnValue(5000)
  await act(async () => { await vi.advanceTimersByTimeAsync(4000) })
  act(() => layouts.finish!())
  await act(async () => { await vi.advanceTimersByTimeAsync(50) })
  expect(root().getAttribute('data-place')).toBe('0:0')
})
