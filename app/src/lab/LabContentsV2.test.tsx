// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadEdition } from '../data/editionLoader'
import { LabContentsV2 } from './LabContentsV2'
import { contentsBooks, contentsChapterNumber, contentsQuote, searchContents } from './labContents'
import type { ChatConversation, EditionData, Section } from '../types'
vi.mock('../data/editionLoader', () => ({ loadEdition: vi.fn() }))
const chapters = Array.from({ length: 60 }, (_, i) => ({ number: i + 1, title: i < 50 ? `Genesis ${i + 1}` : `Psalms ${i - 49}` }))
const sections: Section[] = [{ title: 'Old Testament', sections: [{ title: 'Genesis', chapters: chapters.slice(0, 50).map(ch => ch.number) }, { title: 'Psalms', chapters: chapters.slice(50).map(ch => ch.number) }] }]
const data: EditionData = { chapters: chapters.map(ch => ({ ...ch, paragraphs: ch.number === 44 ? ['Where is the silver cup?', 'Judah offers himself instead.'] : ch.number === 51 ? ['The shepherd keeps the flock.'] : ['A passage.'] })) }
const chat: ChatConversation = { id: 'cup-chat', bookId: 'bible', chapterNumber: 44, paragraphIndex: 1, startTimestamp: 1000, endTimestamp: 2000, preview: 'Why the cup?', messages: [
  { id: 'cup-question', bookId: 'bible', role: 'user', content: 'Why the silver cup?', timestamp: 1000 },
  { id: 'cup-answer', bookId: 'bible', role: 'assistant', content: 'Consider what Judah offers.', timestamp: 2000 },
] }
const highlight = { id: 'judah', bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 44, paragraphIndex: 1, endParagraphIndex: 1, fromWord: 0, toWord: 3, color: 'gold' as const, note: 'A substitution' }
function props() {
  return { open: true, bookId: 'bible', title: 'The Bible', editionKey: 'kjv-en', editionLabel: 'King James Version', chapters, chaptersReady: true, sections, currentChapter: 44, currentPage: 2, totalPages: 4, statuses: new Map(), conversations: [chat], highlights: [highlight], unassignedHighlights: [], historyStatus: 'ready' as const,
    onClose: vi.fn(), onSelectChapter: vi.fn(), onWarmChapter: vi.fn(), onOpenPassage: vi.fn(), onContinueConversation: vi.fn() }
}
beforeEach(() => { vi.mocked(loadEdition).mockResolvedValue(data) })
afterEach(() => { cleanup(); vi.resetAllMocks() })

describe('V2 contents data', () => {
  it('maps local Bible numbers to sequential IDs', () => {
    const books = contentsBooks('The Bible', chapters, sections, true)
    expect(contentsChapterNumber(books[1], 3)).toBe(53)
    expect(contentsChapterNumber(books[1], 11)).toBeNull()
    expect(contentsChapterNumber(books[1], 1.5)).toBeNull()
  })
  it('retrieves exact highlight boundaries and searches text beyond the loaded chapter', () => {
    expect(contentsQuote(highlight, data)).toBe('Judah offers himself')
    expect(searchContents('shepherd', chapters, null, [], []).passages).toHaveLength(0)
    expect(searchContents('shepherd', chapters, data, [], []).passages[0]).toMatchObject({ chapterNumber: 51, paragraphIndex: 0, wordIndex: 1 })
    expect(searchContents('Genesis44', chapters, data, [], []).chapters[0].number).toBe(44)
    expect(searchContents('Judah', chapters, data, [], [highlight]).highlights[0].highlight.id).toBe('judah')
  })
})
describe('V2 contents browsing', () => {
  it('browses books and ranges without navigating or changing the actual reading footer', () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    fireEvent.click(screen.getByRole('button', { name: 'Change Bible book, Genesis' }))
    fireEvent.click(screen.getByRole('button', { name: /^Psalms/ }))
    expect(screen.getByRole('button', { name: 'Your reading place, Genesis 44, page 2 of 4' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Jump to' }))
    fireEvent.click(screen.getByRole('button', { name: 'Browse chapters 1 to 10' }))
    expect(p.onSelectChapter).not.toHaveBeenCalled(); expect(p.onOpenPassage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Your reading place, Genesis 44, page 2 of 4' }))
    expect(screen.getByRole('button', { name: 'Change Bible book, Genesis' })).toBeTruthy()
  })
  it('opens the requested local chapter', () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    fireEvent.click(screen.getByRole('button', { name: 'Change Bible book, Genesis' }))
    fireEvent.click(screen.getByRole('button', { name: /^Psalms/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Jump to' }))
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } })
    fireEvent.submit(screen.getByRole('spinbutton').closest('form')!)
    expect(p.onSelectChapter).toHaveBeenCalledExactlyOnceWith(53)
  })
  it('loads the whole selected edition and opens the matching paragraph and word', async () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    fireEvent.click(screen.getByRole('button', { name: 'Search contents' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'shepherd' } })
    const word = await screen.findByText('shepherd', { selector: 'mark' })
    expect(loadEdition).toHaveBeenCalledWith('bible', 'kjv-en', { forceWholeBook: true })
    fireEvent.click(word.closest('button')!)
    expect(p.onOpenPassage).toHaveBeenCalledWith(expect.objectContaining({ chapterNumber: 51, paragraphIndex: 0, wordIndex: 1 }))
  })
  it('opens the exact conversation directly in chat', async () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    fireEvent.click(screen.getByRole('button', { name: 'Search contents' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'cup' } })
    fireEvent.click(await screen.findByTestId('contents-chat-cup-chat'))
    expect(p.onContinueConversation).toHaveBeenCalledExactlyOnceWith(chat)
  })
  it('does not present missing text or pending history as an empty result', async () => {
    vi.mocked(loadEdition).mockRejectedValue(new Error('offline'))
    render(<LabContentsV2 {...props()} historyStatus="loading" />)
    expect(screen.getByText('Loading saved conversations…')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Search contents' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'missing' } })
    await screen.findByRole('button', { name: 'Retry' })
    expect(screen.queryByText('No matches.')).toBeNull()
  })
  it('keeps other-book chats out and preserves unassigned marks separately', async () => {
    render(<LabContentsV2 {...props()} conversations={[{ ...chat, bookId: 'odyssey' }]} unassignedHighlights={[{ ...highlight, id: 'older', bookId: undefined, editionKey: undefined }]} />)
    expect(screen.queryByTestId('contents-chat-cup-chat')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Highlights' }))
    fireEvent.click(screen.getByRole('button', { name: 'Older highlights · book not recorded' }))
    expect(screen.getByText('A substitution')).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('Judah offers himself')).toBeNull())
  })
})

it('waits for the real chapter manifest before enabling numeric navigation', () => {
  const p = props()
  const { rerender } = render(<LabContentsV2 {...p} chaptersReady={false} chapters={chapters.slice(0, 2)} />)
  expect(screen.getByText('Loading contents…')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Jump to' })).toBeNull()
  rerender(<LabContentsV2 {...p} />)
  fireEvent.click(screen.getByRole('button', { name: 'Jump to' }))
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '44' } })
  fireEvent.submit(screen.getByRole('spinbutton').closest('form')!)
  expect(p.onSelectChapter).toHaveBeenCalledExactlyOnceWith(44)
})

it('uses ordinary book chapter titles without a Bible book picker', () => {
  const p = props()
  render(<LabContentsV2 {...p} bookId="romeo-and-juliet" title="Romeo and Juliet" sections={undefined} chapters={[{ number: 1, title: 'Act 1, Scene 1 — A Public Place in Verona' }]} currentChapter={1} highlights={[]} />)
  expect(screen.getByText('Act 1, Scene 1 — A Public Place in Verona', { selector: 'strong' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Change Bible book/ })).toBeNull()
})

it('keeps chapter annotations collapsed until requested', () => {
  render(<LabContentsV2 {...props()} />)
  expect(screen.queryByTestId('contents-chat-cup-chat')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '1 chat · 1 highlight' }))
  expect(screen.getByTestId('contents-chat-cup-chat')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '1 chat · 1 highlight' }))
  expect(screen.queryByTestId('contents-chat-cup-chat')).toBeNull()
})
