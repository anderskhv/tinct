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
