// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import type { ChapterHearingPage } from './labHearing'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

vi.mock('./labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('./labNarration')>(),
  initialNarrationPilotInfo: () => ({ enabled: false, provider: 'google', voices: [] }),
  fetchNarrationPilotInfo: async () => ({ enabled: false, provider: 'google', voices: [] }),
}))

/**
 * The phone paginator, reduced to what this regression needs: every time it
 * mounts it lays the chapter out, and a fresh layout breaks pages a few words
 * differently from the first one (as a fresh measurement does from a map the
 * visible-page check has peeled). Pages it is told to keep stay exactly as
 * given; only what follows them is laid out afresh.
 */
const layouts = vi.hoisted(() => ({ count: 0, kept: [] as Array<number | null> }))
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
    onPages: (pages: ChapterHearingPage[], paragraphs?: string[]) => void
  }) {
    useEffect(() => {
      const layout = ++layouts.count
      layouts.kept.push(keepPages?.length ?? null)
      const shift = layout === 1 ? 0 : 3
      const last = keepPages?.[keepPages.length - 1]
      const pages = last
        ? [...keepPages!, ...cut(paragraphs, { paragraphIndex: last.paragraphIndex, wordIndex: last.to }, shift)]
        : cut(paragraphs, { paragraphIndex: 0, wordIndex: 0 }, shift)
      onPages(pages, paragraphs)
    }, [paragraphs, keepPages, onPages])
    return null
  }
  return { ...actual, LabNativePaginator: FakeNativePaginator }
})

beforeEach(() => {
  layouts.count = 0
  layouts.kept = []
  // Native column paging, as on every phone browser the reader supports.
  vi.stubGlobal('CSS', { supports: () => true, escape: (value: string) => value })
})

afterEach(() => {
  cleanup()
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

describe('returning to the book from phone Chat', () => {
  it('lands on the page the reader left, not an earlier one of a fresh layout', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
    await waitFor(() => expect(layouts.count).toBe(1))
    await waitFor(() => expect(firstWord()).toBe('0:0'))

    for (let turn = 0; turn < 3; turn++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(firstWord()).toBe('0:24'))
    expect(root().getAttribute('data-place')).toBe('0:24')

    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
    expect(screen.queryByTestId('lab-page-wrap')).toBeNull()

    fireEvent.click(screen.getByTestId('lab-ask-done'))
    await waitFor(() => expect(screen.queryByTestId('lab-ask-pane')).toBeNull())
    await waitFor(() => expect(layouts.count).toBe(2))
    expect(firstWord()).toBe('0:24')
    expect(root().getAttribute('data-place')).toBe('0:24')
    // The page surface laid the chapter out again; the reader's page and the
    // pages before it were kept as they were on screen.
    expect(layouts.kept[1]).toBe(4)
  })
})
