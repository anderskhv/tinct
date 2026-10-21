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
  'Recap · Nehemiah 12',
  'Two Choirs on the Wall\nTwo choirs walk the wall in opposite directions. The joy is heard far off.',
  'Storerooms Staffed\nMen are set over the storerooms. The singers are paid daily.',
].join('\n\n')

function store() {
  localStorage.setItem(CHAPTER_NOTES_STORAGE_KEY, JSON.stringify({ [chapterNotesKey(request)]: { beats, at: Date.now() } }))
}

function renderSheet() {
  return render(<LabChapterNotesSheet request={request} title="Recap · Nehemiah 12" onClose={vi.fn()} onChat={vi.fn()} onTalk={vi.fn()} />)
}

describe('LabChapterNotesSheet Copy', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

  it('formats the card as plain text: title, then each beat title and text, separated by blank lines', () => {
    expect(chapterNotesPlainText('Recap · Nehemiah 12', beats)).toBe(expected)
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

describe('LabChapterNotesSheet with the follow-up field (phone, iPhone feedback 21 Oct 2026)', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { cleanup() })

  for (const card of [false, true]) {
    it(`ends with the field in place of Chat, Talk and Copy${card ? ' (margin card)' : ' (sheet)'}, given the beats shown, with follow-ups under them`, () => {
      store()
      const follow = vi.fn((shown: typeof beats | null) => <input data-testid="follow" defaultValue={shown?.length ?? 0} />)
      render(<LabChapterNotesSheet request={request} title="Recap · Nehemiah 12" onClose={vi.fn()} onChat={vi.fn()} onTalk={vi.fn()} card={card}
        follow={follow} thread={<p data-testid="thread">A follow-up</p>} />)
      expect((screen.getByTestId('follow') as HTMLInputElement).value).toBe('2')
      expect(document.querySelectorAll('.lab-chapter-notes-tool')).toHaveLength(0)
      expect(screen.queryByTestId('lab-chapter-notes-copy')).toBeNull()
      // The thread scrolls with the beats, above the field.
      const thread = screen.getByTestId('thread')
      expect(thread.closest('.lab-catch-up-body')).not.toBeNull()
      expect(thread.compareDocumentPosition(screen.getByTestId('follow')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  }
})
