// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }))

import { LAB_READER_HANDOFF_KEY } from '../labReaderHandoff'
import { MarginPreviewNav, marginContentsSections, type MarginNavRequest } from './MarginPreviewNav'
import type { MarginPreviewBook } from './marginPreviewModel'

const model = {
  bookId: 'to-the-lighthouse',
  editionKey: 'modern-en',
  editionLabel: 'Modern English',
  title: 'To the Lighthouse',
  author: 'Virginia Woolf',
  language: 'en',
  chapters: [
    { number: 1, title: 'The Window · 1', section: 'The Window', paragraphs: [] },
    { number: 2, title: 'The Window · 2', section: 'The Window', paragraphs: [] },
    { number: 3, title: 'Time Passes · 1', section: 'Time Passes', paragraphs: [] },
  ],
  start: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 },
  normalHref: '/reader?book=to-the-lighthouse&margin=0',
} as MarginPreviewBook

function request(kind: MarginNavRequest['kind']): MarginNavRequest {
  return { kind, theme: 'light', page: 2, percent: 40, chapterLabel: 'The Window · 2', go: vi.fn(), leave: vi.fn(), library: vi.fn(), closed: vi.fn() }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear() })

describe('the margin preview’s title and chapter pill: the book reader’s own', () => {
  it('groups the edition’s chapters into its parts, as the book reader’s Contents does', () => {
    expect(marginContentsSections(model.chapters)).toEqual([{ title: 'The Window', chapters: [1, 2] }, { title: 'Time Passes', chapters: [3] }])
    expect(marginContentsSections(model.chapters.map(({ section: _section, ...c }) => c))).toBeUndefined()
  })

  it('the chapter pill opens Contents at the chapter on view; a chapter picked moves the frame there', async () => {
    const req = request('contents'), done = vi.fn()
    render(<MarginPreviewNav model={model} request={req} onDone={done} />)
    expect(screen.getByTestId('lab-contents-v2')).toBeTruthy()
    // The tree opens at the chapter on view (inside its part).
    expect(screen.getByTestId('lab-tree-chapter-2').getAttribute('aria-current')).toBe('page')
    fireEvent.click(screen.getByText('Time Passes'))
    fireEvent.click(await screen.findByTestId('lab-tree-chapter-3'))
    expect(done).toHaveBeenCalled()
    expect(req.go).toHaveBeenCalledWith({ page: 3, para: 0, word: 0 })
    expect(req.leave).not.toHaveBeenCalled()
  })

  it('the book title opens Reading now, the current book checked, Library at the bottom', async () => {
    const req = request('switcher')
    render(<MarginPreviewNav model={model} request={req} onDone={vi.fn()} />)
    expect(screen.getByTestId('lab-book-switcher')).toBeTruthy()
    expect(screen.getByText('Reading now')).toBeTruthy()
    const current = document.querySelector('.lab-book-switcher-row.is-active')!
    expect(current.textContent).toContain('To the Lighthouse')
    expect(current.querySelector('.lab-book-switcher-check')).toBeTruthy()
    fireEvent.click(screen.getByText('Library'))
    expect(req.library).toHaveBeenCalled()
  })

  it('another book opens as the book reader’s switcher opens it: this place written first, then the hand-off', async () => {
    const now = Date.now()
    localStorage.setItem('tinct-lab-position', JSON.stringify({
      books: { frankenstein: { bookId: 'frankenstein', headerBook: 'frankenstein', sequentialChapter: 5, chapterNumber: 5, paragraphIndex: 3, wordIndex: 4, primaryEditionKey: 'modern-en', readerMode: 'read', updatedAt: now - 60000, deviceId: 'qa', rev: 1 } },
      finished: {}, hidden: {}, lastSettledBookId: 'frankenstein', lastSettledAt: now - 60000, updatedAt: now - 60000, deviceId: 'qa',
    }))
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, search: '?book=to-the-lighthouse', assign } as Location)
    const req = request('switcher')
    render(<MarginPreviewNav model={model} request={req} onDone={vi.fn()} />)
    const row = await waitFor(() => {
      const found = [...document.querySelectorAll<HTMLButtonElement>('.lab-book-switcher-row')].find(b => /Frankenstein/.test(b.textContent || ''))
      if (!found) throw new Error('no Frankenstein row')
      return found
    })
    fireEvent.click(row)
    expect(req.leave).toHaveBeenCalled()
    const handoff = JSON.parse(sessionStorage.getItem(LAB_READER_HANDOFF_KEY) || 'null')
    expect(handoff).toMatchObject({ bookId: 'frankenstein' })
    expect(assign).toHaveBeenCalledWith('/reader')
  })
})
