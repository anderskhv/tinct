// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { loadEdition } from '../data/editionLoader'
import { LabContentsV2 } from './LabContentsV2'
import type { EditionData } from '../types'
import type { LabHighlight } from './labHighlights'

vi.mock('../data/editionLoader', () => ({ loadEdition: vi.fn() }))
const T = 1_780_000_000_000
const chapters = [{ number: 1, title: 'Chapter I' }, { number: 2, title: 'Chapter II' }]
const data: EditionData = { chapters: [
  { number: 1, title: 'Chapter I', paragraphs: ['Emma Woodhouse, handsome, clever, and rich.', 'She was the youngest daughter.'] },
  { number: 2, title: 'Chapter II', paragraphs: ['Mr. Weston was a native of Highbury.'] },
] }
const mark = (id: string, extra: Partial<LabHighlight>): LabHighlight => ({ id, bookId: 'emma', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2, color: 'gold', ...extra })
const highlights = [
  mark(`hl-${T + 3}-weston`, { chapterNumber: 2, toWord: 2 }),
  mark(`hl-${T + 1}-daughter`, { paragraphIndex: 1, endParagraphIndex: 1, fromWord: 3, toWord: 5, note: 'Youngest, and so the indulged one.\nSee her father.' }),
  mark(`hl-${T + 2}-emma`, { toWord: 2 }),
]
const chapterNote: LabHighlight = { ...mark(`hl-${T + 4}-cn`, { toWord: 0 }), kind: 'chapter', note: 'The whole chapter is about being spoiled.' }
const props = () => ({ open: true, bookId: 'emma', title: 'Emma', editionKey: 'original-en', editionLabel: 'Original', chapters, chaptersReady: true, currentChapter: 1, currentPage: 1, totalPages: 3,
  statuses: new Map(), conversations: [], highlights, unassignedHighlights: [], chapterNotes: [chapterNote], historyStatus: 'ready' as const,
  onClose: vi.fn(), onSelectChapter: vi.fn(), onWarmChapter: vi.fn(), onOpenPassage: vi.fn(), onContinueConversation: vi.fn() })
beforeEach(() => { vi.mocked(loadEdition).mockResolvedValue(data) })
afterEach(() => { cleanup(); vi.resetAllMocks() })

const rows = () => Array.from(document.querySelectorAll('.overlay .results .result')).map(row => row.getAttribute('data-testid'))

it('lists highlights and notes oldest first by creation time; Newest first reverses it', async () => {
  render(<LabContentsV2 {...props()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Highlights', exact: true }))
  expect(screen.getByText('Highlights & notes')).toBeTruthy()
  await screen.findByText('Emma Woodhouse,')
  expect(screen.getByRole('button', { name: 'Newest first' }).getAttribute('aria-pressed')).toBe('false')
  expect(rows()).toEqual([`contents-highlight-hl-${T + 1}-daughter`, `contents-highlight-hl-${T + 2}-emma`, `contents-highlight-hl-${T + 3}-weston`, `contents-chapter-note-hl-${T + 4}-cn`])
  fireEvent.click(screen.getByRole('button', { name: 'Newest first' }))
  expect(screen.getByRole('button', { name: 'Newest first' }).getAttribute('aria-pressed')).toBe('true')
  expect(rows()).toEqual([`contents-chapter-note-hl-${T + 4}-cn`, `contents-highlight-hl-${T + 3}-weston`, `contents-highlight-hl-${T + 2}-emma`, `contents-highlight-hl-${T + 1}-daughter`])
})

it('shows each note in full under its passage, in ink, and filters to Notes only', async () => {
  render(<LabContentsV2 {...props()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Highlights', exact: true }))
  const row = await screen.findByTestId(`contents-highlight-hl-${T + 1}-daughter`)
  await within(row).findByText('youngest daughter.')
  const note = row.querySelector('.note')!
  expect(note.textContent).toBe('Youngest, and so the indulged one.\nSee her father.')
  expect(row.querySelector('.excerpt')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Notes only' }))
  expect(rows()).toEqual([`contents-highlight-hl-${T + 1}-daughter`, `contents-chapter-note-hl-${T + 4}-cn`])
  // Approved mockup (12 Oct): under Notes only the note leads and its passage follows, quoted.
  const first = screen.getByTestId(`contents-highlight-hl-${T + 1}-daughter`)
  expect(first.querySelector('.note-lead')?.textContent).toBe('Youngest, and so the indulged one.\nSee her father.')
  expect(first.querySelector('.note-source')?.textContent).toMatch(/^“.*youngest daughter\.”$/)
  expect(first.querySelector('.note-lead')!.compareDocumentPosition(first.querySelector('.note-source')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(document.querySelector('.note-count')?.textContent).toMatch(/^2 notes in /)
  fireEvent.click(screen.getByRole('button', { name: 'All', exact: true }))
  expect(rows()).toHaveLength(4)
})

it('sets the quoted passage under a note in plain italic, overriding the legacy uppercase .note-source', () => {
  const css = readFileSync(resolve(__dirname, 'labContentsV2.css'), 'utf8')
  const rule = /\.lab-contents-v2 \.result \.note-source \{([^}]*)\}/.exec(css)?.[1] ?? ''
  expect(rule).toMatch(/text-transform:\s*none/)
  expect(rule).toMatch(/letter-spacing:\s*normal/)
  expect(rule).toMatch(/italic/)
})

it('a chapter note opens its chapter, and the chapter’s tag counts it', async () => {
  const p = props()
  render(<LabContentsV2 {...p} />)
  fireEvent.click(screen.getByRole('button', { name: '3 highlights and notes in Chapter I' }))
  fireEvent.click(await screen.findByTestId(`contents-chapter-note-hl-${T + 4}-cn`))
  expect(screen.getByText('The whole chapter is about being spoiled.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Open chapter' }))
  expect(p.onOpenPassage).toHaveBeenCalledWith({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
})

// The phone's Notebook (22 Oct 2026): one list, newest first, of the book's cards and the reader's marks, as the
// desktop margin reader's Notebook lists them, with its filters All · My notes · AI.
it('as the Notebook, lists cards and highlights and notes newest first, filters them, and opens each', async () => {
  const card = (id: string, at: number, extra: object = {}) => ({ id, bookId: 'emma', chapterNumber: 1, paragraphIndex: 1, startTimestamp: at, endTimestamp: at, preview: 'Why the youngest?', messages: [
    { role: 'user' as const, content: 'Why the youngest?', timestamp: at }, { role: 'assistant' as const, content: 'Because she is indulged.', timestamp: at }], ...extra })
  const explain = card('mc_explain', T + 5), gone = card('mc_gone', T + 6, { messages: [], card: { id: 'gone', kind: 'explain', chapterNumber: 1, at: T, u: T + 6, gone: true } })
  const p = { ...props(), notebook: true, conversations: [explain, gone, card('other-book', T + 7, { bookId: 'persuasion' })] }
  render(<LabContentsV2 {...p} />)
  expect(screen.getByText('Notebook')).toBeTruthy()
  await screen.findByText('Emma Woodhouse,')
  expect(rows()).toEqual(['contents-chat-mc_explain', `contents-chapter-note-hl-${T + 4}-cn`, `contents-highlight-hl-${T + 3}-weston`, `contents-highlight-hl-${T + 2}-emma`, `contents-highlight-hl-${T + 1}-daughter`])
  fireEvent.click(screen.getByTestId('contents-notebook-ai'))
  expect(rows()).toEqual(['contents-chat-mc_explain'])
  fireEvent.click(screen.getByTestId('contents-notebook-mine'))
  expect(rows()).toEqual([`contents-chapter-note-hl-${T + 4}-cn`, `contents-highlight-hl-${T + 3}-weston`, `contents-highlight-hl-${T + 2}-emma`, `contents-highlight-hl-${T + 1}-daughter`])
  // A mark opens its detail; back returns to the Notebook, and the Notebook's close returns to the book.
  fireEvent.click(screen.getByTestId(`contents-highlight-hl-${T + 2}-emma`))
  expect(screen.getByRole('button', { name: 'Open passage' })).toBeTruthy()
  fireEvent.click(screen.getByLabelText('Close overlay'))
  expect(screen.getByText('Notebook')).toBeTruthy()
  fireEvent.click(screen.getByTestId('contents-notebook-all'))
  fireEvent.click(screen.getByTestId('contents-chat-mc_explain'))
  expect(p.onContinueConversation).toHaveBeenCalledWith(explain)
  fireEvent.click(screen.getByLabelText('Close overlay'))
  expect(p.onClose).toHaveBeenCalled()
})

it('preserves unmappable original EPUB annotations in the Notebook without a false passage link', () => {
  const p = { ...props(), bookId: 'epub:abc123', notebook: true, highlights: [], chapterNotes: [],
    legacyOwnEpubItems: [
      { id: 'old-mark', kind: 'highlight' as const, text: 'The exact original quotation.', note: 'My original note.', page: 12, at: T + 2 },
      { id: 'old-card', kind: 'card' as const, text: 'A question from the old page.', note: 'Original margin note.', page: 17, at: T + 3,
        turns: [{ role: 'user' as const, content: 'Why this line?' }, { role: 'assistant' as const, content: 'The saved answer.' }], data: { answer: 2 } },
    ] }
  render(<LabContentsV2 {...p} />)
  expect(rows()).toEqual(['contents-legacy-epub-old-card', 'contents-legacy-epub-old-mark'])
  const markRow = screen.getByTestId('contents-legacy-epub-old-mark')
  expect(within(markRow).getByText('Original EPUB page 12 · Saved highlight')).toBeTruthy()
  expect(within(markRow).getByText('The exact original quotation.')).toBeTruthy()
  expect(within(markRow).getByText('My original note.')).toBeTruthy()
  expect(markRow.tagName).toBe('ARTICLE')
  expect(markRow.querySelector('button')).toBeNull()
  fireEvent.click(markRow)
  expect(p.onOpenPassage).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('contents-notebook-mine'))
  expect(rows()).toEqual(['contents-legacy-epub-old-mark'])
  fireEvent.click(screen.getByTestId('contents-notebook-ai'))
  expect(rows()).toEqual(['contents-legacy-epub-old-card'])
  expect(screen.getByText('Original EPUB page 17 · Saved AI card')).toBeTruthy()
  expect(Array.from(screen.getByTestId('contents-legacy-epub-old-card').querySelectorAll('.legacy-turn')).map(row => row.textContent)).toEqual(['Q. Why this line?', 'A. The saved answer.'])
  fireEvent.click(screen.getByText('Saved card details'))
  expect(screen.getByText(/"answer": 2/)).toBeTruthy()
})

it('does not show original EPUB records outside the Notebook', () => {
  render(<LabContentsV2 {...props()} legacyOwnEpubItems={[{ id: 'old', kind: 'highlight', text: 'Old quote', page: 3, at: T }]} />)
  fireEvent.click(screen.getByRole('button', { name: 'Highlights', exact: true }))
  expect(screen.queryByTestId('contents-legacy-epub-old')).toBeNull()
})

it('private Notebook copies all entries and deletes with undo through its existing-store callback', async () => {
  const restore = vi.fn()
  const onDeleteNotebookItem = vi.fn(() => restore)
  const writeText = vi.fn(async (_value: string) => {})
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const p = { ...props(), notebook: true, sharedNotebook: true, onDeleteNotebookItem, highlights: [highlights[1]], chapterNotes: [],
    legacyOwnEpubItems: [{ id: 'old', kind: 'card' as const, text: 'Old page passage.', note: 'Old page answer.', page: 15, at: T + 2 }] }
  render(<LabContentsV2 {...p} />)
  fireEvent.click(screen.getByRole('button', { name: 'Copy all Notebook entries' }))
  await screen.findByText('Notebook copied.')
  expect(writeText).toHaveBeenCalledTimes(1)
  expect(writeText.mock.calls[0][0]).toContain('Original EPUB page 15')
  expect(writeText.mock.calls[0][0]).toContain('Old page answer.')
  expect(writeText.mock.calls[0][0]).toContain('Youngest, and so the indulged one.')
  expect(screen.queryByRole('button', { name: 'Delete Notebook entry old' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: `Delete Notebook entry hl-${T + 1}-daughter` }))
  expect(onDeleteNotebookItem).toHaveBeenCalledWith({ kind: 'highlight', id: `hl-${T + 1}-daughter` })
  expect(screen.queryByTestId(`contents-highlight-hl-${T + 1}-daughter`)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Copy all Notebook entries' }))
  await screen.findByText('Notebook copied.')
  expect(writeText.mock.calls.slice(-1)[0]?.[0]).not.toContain('Youngest, and so the indulged one.')
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(restore).toHaveBeenCalledTimes(1)
  expect(screen.getByTestId(`contents-highlight-hl-${T + 1}-daughter`)).toBeTruthy()
})

it('keeps a deleted Notebook row hidden and Undo available when owner storage cannot restore it', () => {
  const restore = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true)
  render(<LabContentsV2 {...props()} notebook sharedNotebook highlights={[highlights[1]]} chapterNotes={[]}
    onDeleteNotebookItem={() => restore} />)
  const row = `contents-highlight-hl-${T + 1}-daughter`
  fireEvent.click(screen.getByRole('button', { name: `Delete Notebook entry hl-${T + 1}-daughter` }))
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(screen.getByText('Could not restore entry.')).toBeTruthy()
  expect(screen.queryByTestId(row)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(screen.getByTestId(row)).toBeTruthy()
  expect(restore).toHaveBeenCalledTimes(2)
})

it('the private Notebook reopens on its last filter, but starts All for a different book', () => {
  const p = { ...props(), notebook: true, sharedNotebook: true }
  const rendered = render(<LabContentsV2 {...p} />)
  fireEvent.click(screen.getByTestId('contents-notebook-mine'))
  const results = document.querySelector<HTMLElement>('.overlay .results')!
  results.scrollTop = 115
  fireEvent.scroll(results)
  expect(screen.getByTestId('contents-notebook-mine').getAttribute('aria-pressed')).toBe('true')
  rendered.rerender(<LabContentsV2 {...p} open={false} />)
  rendered.rerender(<LabContentsV2 {...p} open />)
  expect(screen.getByTestId('contents-notebook-mine').getAttribute('aria-pressed')).toBe('true')
  expect(document.querySelector<HTMLElement>('.overlay .results')?.scrollTop).toBe(115)
  rendered.rerender(<LabContentsV2 {...p} bookId="different-book" />)
  expect(screen.getByTestId('contents-notebook-all').getAttribute('aria-pressed')).toBe('true')
  expect(document.querySelector<HTMLElement>('.overlay .results')?.scrollTop).toBe(0)
})

it('only saved cards get card deletion; an ordinary chat stays readable, and undo survives a chapter turn', () => {
  const restore = vi.fn(), onDeleteNotebookItem = vi.fn(() => restore)
  const chat = (id: string, withCard: boolean) => ({ id, bookId: 'emma', chapterNumber: 1, startTimestamp: T + 7, endTimestamp: T + 8,
    preview: 'Why?', messages: [{ id: id + '-q', role: 'user' as const, content: 'Why?', timestamp: T + 7 }],
    ...(withCard ? { card: { id: 'saved-card', kind: 'explain', chapterNumber: 1, at: T + 7, u: T + 8 } } : {}) })
  const p = { ...props(), notebook: true, sharedNotebook: true, conversations: [chat('normal', false), chat('mc_saved-card', true)],
    onDeleteNotebookItem }
  const rendered = render(<LabContentsV2 {...p} />)
  expect(screen.getByTestId('contents-chat-normal')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Delete Notebook entry normal' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Delete Notebook entry mc_saved-card' }))
  expect(onDeleteNotebookItem).toHaveBeenCalledWith({ kind: 'card', id: 'mc_saved-card' })
  rendered.rerender(<LabContentsV2 {...p} currentChapter={2} />)
  expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(restore).toHaveBeenCalledOnce()
})

it('shows a blank-margin note immediately without fetching quotation text, including its detail', () => {
  const point = mark('point-note', { paragraphIndex: 1, endParagraphIndex: 1, fromWord: 3, toWord: 3, text: '', note: 'note 1' })
  const p = { ...props(), notebook: true, highlights: [point], chapterNotes: [] }
  render(<LabContentsV2 {...p} />)
  expect(screen.getByText('note 1')).toBeTruthy()
  expect(screen.queryByTestId('lab-wait')).toBeNull()
  expect(loadEdition).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('contents-highlight-point-note'))
  expect(screen.getByText('note 1')).toBeTruthy()
  expect(screen.queryByTestId('lab-wait')).toBeNull()
  expect(loadEdition).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Open passage' }))
  expect(p.onOpenPassage).toHaveBeenCalledWith({ chapterNumber: 1, paragraphIndex: 1, wordIndex: 3 })
})

it('ends the spinner when a real highlighted source is absent from the loaded edition', async () => {
  const absent = mark('missing-source', { paragraphIndex: 99, endParagraphIndex: 99, note: 'Keep my note' })
  render(<LabContentsV2 {...props()} notebook highlights={[absent]} chapterNotes={[]} />)
  expect(await screen.findByText('Passage unavailable')).toBeTruthy()
  expect(screen.getByText('Keep my note')).toBeTruthy()
  expect(screen.queryByTestId('lab-wait')).toBeNull()
})

it('keeps saved source text even on a legacy zero-length range', () => {
  const saved = mark('saved-source', { fromWord: 2, toWord: 2, text: 'Retained source words', note: 'My note' })
  render(<LabContentsV2 {...props()} notebook highlights={[saved]} chapterNotes={[]} />)
  expect(screen.getByText('Retained source words')).toBeTruthy()
  expect(screen.queryByTestId('lab-wait')).toBeNull()
  expect(loadEdition).not.toHaveBeenCalled()
})
