// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChapterNotesRequest } from '../chapterNotes'
import { LabChapterNotesSheet } from './LabChapterNotesSheet'
import { CHAPTER_NOTES_STORAGE_KEY, chapterNotesKey, chapterNotesPlainText } from './labChapterNotes'
import { LAB_COPY } from './labCopy'

const request: ChapterNotesRequest = { bookId: 'bible', editionKey: 'original-en', chapterNumber: 12, kind: 'end', bookTitle: 'The Bible' }
const beats = [
  { title: 'Two Choirs on the Wall', text: 'Two choirs walk the wall in opposite directions. The joy is heard far off.' },
  { title: 'Storerooms Staffed', text: 'Men are set over the storerooms. The singers are paid daily.' },
]
const expected = [
  'Nehemiah 12 in brief',
  'Two Choirs on the Wall\nTwo choirs walk the wall in opposite directions. The joy is heard far off.',
  'Storerooms Staffed\nMen are set over the storerooms. The singers are paid daily.',
].join('\n\n')

function store() {
  localStorage.setItem(CHAPTER_NOTES_STORAGE_KEY, JSON.stringify({ [chapterNotesKey(request)]: { beats, at: Date.now() } }))
}

function renderSheet() {
  return render(<LabChapterNotesSheet request={request} title="Nehemiah 12 in brief" onClose={vi.fn()} onChat={vi.fn()} onTalk={vi.fn()} />)
}

describe('LabChapterNotesSheet Copy', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

  it('formats the card as plain text: title, then each beat title and text, separated by blank lines', () => {
    expect(chapterNotesPlainText('Nehemiah 12 in brief', beats)).toBe(expected)
  })

  it('writes the card to the clipboard inside the tap and confirms with "Copied"', async () => {
    store()
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderSheet()
    const button = screen.getByTestId('lab-chapter-notes-copy')
    expect(button.getAttribute('aria-label')).toBe('Copy')
    fireEvent.click(button)
    // Synchronous with the click (iOS Safari only allows the write in the gesture).
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith(expected)
    await act(async () => { await Promise.resolve() })
    expect(screen.getByTestId('lab-chapter-notes-copy').getAttribute('aria-label')).toBe('Copied')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns to "Copy" after a moment', async () => {
    vi.useFakeTimers()
    store()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(() => Promise.resolve()) }, configurable: true })
    renderSheet()
    fireEvent.click(screen.getByTestId('lab-chapter-notes-copy'))
    await act(async () => { await Promise.resolve() })
    expect(screen.getByTestId('lab-chapter-notes-copy').getAttribute('aria-label')).toBe('Copied')
    act(() => { vi.advanceTimersByTime(2100) })
    expect(screen.getByTestId('lab-chapter-notes-copy').getAttribute('aria-label')).toBe('Copy')
  })

  it('falls back to a selection copy without the async clipboard, without scrolling', () => {
    store()
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    const execCommand = vi.fn(() => true)
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    renderSheet()
    fireEvent.click(screen.getByTestId('lab-chapter-notes-copy'))
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
    expect(scrollTo).not.toHaveBeenCalled()
    expect(screen.getByTestId('lab-chapter-notes-copy').getAttribute('aria-label')).toBe('Copied')
  })

  it('offers Copy only once the beats are there', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderSheet()
    expect(screen.queryByTestId('lab-chapter-notes-copy')).toBeNull()
    expect(screen.getByTestId('lab-chapter-notes-chat')).toBeTruthy()
  })
})

describe('LabChapterNotesSheet errors', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })
  const answer = (status: number, body: unknown) => vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status, json: async () => body })))

  it('a resting AI (503 ai_resting) shows the existing "AI is resting" line above Retry', async () => {
    answer(503, { type: 'error', error: { type: 'ai_resting', message: 'AI is resting — try again later.' } })
    renderSheet()
    expect((await screen.findByTestId('lab-chapter-notes-resting')).textContent).toBe(LAB_COPY.aiResting)
    expect(screen.getByTestId('lab-chapter-notes-retry').textContent).toBe('Retry')
  })

  it('a failure with no copy of its own (404, 502) stays a bare Retry', async () => {
    answer(404, { error: 'Chapter not available' })
    renderSheet()
    expect((await screen.findByTestId('lab-chapter-notes-retry')).textContent).toBe('Retry')
    expect(screen.queryByTestId('lab-chapter-notes-resting')).toBeNull()
  })
})
