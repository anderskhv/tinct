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
 * The phone paginator, reduced to what the reader hands it: it lays the chapter out in pages of eight words in a
 * shell `shell.height` px tall, and records the pages it is told to keep and the shell height they come with.
 */
const shell = vi.hoisted(() => ({ height: 664, layouts: [] as Array<{ kept: number | null; keepShellHeight: number | undefined }> }))
vi.mock('./LabNativePaginator', async importOriginal => {
  const actual = await importOriginal<typeof import('./LabNativePaginator')>()
  const { useEffect } = await import('react')
  const { tokenizeHearingWords } = await import('./labHearing')
  function FakeNativePaginator({ paragraphs, keepPages, keepShellHeight, onPages }: {
    paragraphs: string[]
    keepPages?: ChapterHearingPage[]
    keepShellHeight?: number
    onPages: (pages: ChapterHearingPage[], paragraphs?: string[], partial?: boolean, shellHeight?: number) => void
  }) {
    useEffect(() => {
      shell.layouts.push({ kept: keepPages?.length ?? null, keepShellHeight: keepPages?.length ? keepShellHeight : undefined })
      const pages: ChapterHearingPage[] = []
      paragraphs.forEach((text, paragraphIndex) => {
        const length = tokenizeHearingWords(text).length
        for (let at = 0; at < length; at += 8) pages.push({ paragraphIndex, from: at, to: Math.min(length, at + 8) })
      })
      onPages(pages, paragraphs, false, shell.height)
    }, [paragraphs, keepPages, keepShellHeight, onPages])
    return null
  }
  return { ...actual, LabNativePaginator: FakeNativePaginator }
})

beforeEach(() => {
  shell.height = 664
  shell.layouts = []
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

const firstWord = () => {
  const word = screen.getByTestId('lab-page-wrap').querySelector<HTMLElement>('[data-testid="lab-word"]')
  return word ? `${word.dataset.paragraphIndex}:${word.dataset.wordIndex}` : null
}
const throughChat = async () => {
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-chat'))
  await waitFor(() => expect(screen.getByTestId('lab-ask-pane')).toBeTruthy())
  fireEvent.click(screen.getByTestId('lab-ask-done'))
  await waitFor(() => expect(screen.queryByTestId('lab-ask-pane')).toBeNull())
}

/**
 * iPhone, 26 and 27 Nov 2026: half the page blank after a card with follow-ups. The keyboard had the chapter in
 * half-height pages when a follow-up opened Chat; Chat's opening kept the page on screen, and it stayed half height
 * in the full shell. The pages a freeze keeps now come with the shell height they were laid out in, and the
 * paginator keeps them only in a shell of that height (labPageMapFitsShell, LabNativePaginator keepShellHeight).
 */
describe('the pages kept when phone Chat opens', () => {
  it('come with the shell height they were laid out in', async () => {
    // The keyboard is up: the chapter was laid out in a shell 328px tall.
    shell.height = 328
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
    await waitFor(() => expect(shell.layouts).toHaveLength(1))
    expect(shell.layouts[0]).toEqual({ kept: null, keepShellHeight: undefined })
    for (let turn = 0; turn < 3; turn++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(firstWord()).toBe('0:24'))

    // The keyboard has gone by the time the page is laid out again.
    shell.height = 664
    await throughChat()
    await waitFor(() => expect(shell.layouts).toHaveLength(2))
    expect(shell.layouts[1]).toEqual({ kept: 4, keepShellHeight: 328 })
  })

  it('name the full shell when the chapter was laid out in it', async () => {
    render(<LabApp pathname="/lab/phone" source={fallbackLabSource()} authToken={null} />)
    await waitFor(() => expect(shell.layouts).toHaveLength(1))
    for (let turn = 0; turn < 2; turn++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(firstWord()).toBe('0:16'))
    await throughChat()
    await waitFor(() => expect(shell.layouts).toHaveLength(2))
    expect(shell.layouts[1]).toEqual({ kept: 3, keepShellHeight: 664 })
    expect(firstWord()).toBe('0:16')
  })
})
