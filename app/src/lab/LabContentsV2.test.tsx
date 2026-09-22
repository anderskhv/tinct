// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadEdition } from '../data/editionLoader'
import { contentsTree, flattenContents, contentsPercent } from './labContentsTree'
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

describe('Design 1 contents', () => {
  it('opens at the current chapter and browses other branches without moving the reading marker', () => {
    const p = props(); render(<LabContentsV2 {...p} currentPercent={68} />)
    expect(screen.getByTestId('lab-tree-chapter-44').getAttribute('aria-current')).toBe('page')
    expect(screen.getByTestId('lab-tree-chapter-44').getAttribute('title')).toBe('68% read')
    fireEvent.click(screen.getByRole('button', { name: 'Psalms', exact: true }))
    expect(screen.getByTestId('lab-tree-chapter-53')).toBeTruthy()
    expect(screen.getByTestId('lab-tree-chapter-44').getAttribute('aria-current')).toBe('page')
    expect(p.onSelectChapter).not.toHaveBeenCalled(); expect(p.onOpenPassage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('lab-tree-chapter-53'))
    expect(p.onSelectChapter).toHaveBeenCalledExactlyOnceWith(53)
  })
  it('uses real continuous percentages and retains unknown progress without inventing a value', () => {
    expect(contentsPercent({kind:'in-progress',page:7,totalPages:25},false)).toBe(28)
    expect(contentsPercent({kind:'finished'},false)).toBe(100)
    expect(contentsPercent({kind:'in-progress',page:7},false)).toBeNull()
    expect(contentsPercent(undefined,true,68)).toBe(68)
  })
  it('preserves manifest ancestry and full sequential identity', () => {
    const flat = flattenContents(contentsTree(chapters, sections, true))
    const psalm = flat.find(n => n.chapter === 53)!
    expect(psalm.label).toBe('Chapter 3')
    expect(psalm.parents.map(n => n.label)).toEqual(['Old Testament','Psalms'])
    expect(new Set(flat.filter(n => n.chapter).map(n => n.chapter)).size).toBe(60)
  })
  it('loads the whole edition for search and opens the exact paragraph and word', async () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    fireEvent.click(screen.getByRole('button', { name: 'Search contents' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'shepherd' } })
    const word = await screen.findByText('shepherd', { selector: 'mark' })
    expect(loadEdition).toHaveBeenCalledWith('bible', 'kjv-en', { forceWholeBook: true })
    fireEvent.click(word.closest('button')!)
    expect(p.onOpenPassage).toHaveBeenCalledWith(expect.objectContaining({ chapterNumber: 51, paragraphIndex: 0, wordIndex: 1 }))
  })
  it('opens the exact conversation and keeps chapter annotation lists behind their icons', async () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    expect(screen.queryByTestId('contents-chat-cup-chat')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '1 chats in Genesis 44' }))
    fireEvent.click(await screen.findByTestId('contents-chat-cup-chat'))
    expect(p.onContinueConversation).toHaveBeenCalledExactlyOnceWith(chat)
  })
  it('filters search by Book and Chats without losing the query', async () => {
    render(<LabContentsV2 {...props()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Search contents' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cup' } })
    await screen.findByTestId('contents-chat-cup-chat')
    fireEvent.click(screen.getByRole('button', { name:'Book',exact:true }))
    expect(screen.queryByTestId('contents-chat-cup-chat')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name:'Chats',exact:true }))
    expect(screen.getByTestId('contents-chat-cup-chat')).toBeTruthy()
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('cup')
  })
  it('does not present missing text or pending history as an empty result', async () => {
    vi.mocked(loadEdition).mockRejectedValue(new Error('offline'))
    render(<LabContentsV2 {...props()} historyStatus="loading" />)
    expect(screen.getByText('Loading saved conversations…')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Search contents' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } })
    await screen.findByRole('button', { name: 'Retry' })
    expect(screen.queryByText('No matches.')).toBeNull()
  })
  it('keeps other-book chats out and preserves unassigned marks separately', async () => {
    render(<LabContentsV2 {...props()} conversations={[{ ...chat, bookId: 'odyssey' }]} unassignedHighlights={[{ ...highlight, id:'older',bookId:undefined,editionKey:undefined }]} />)
    expect(screen.queryByRole('button', {name:'1 chats in Genesis 44'})).toBeNull()
    fireEvent.click(screen.getByRole('button', {name:'Highlights',exact:true}))
    fireEvent.click(screen.getByRole('button', {name:'Older highlights · book not recorded'}))
    expect(screen.getByText('A substitution')).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('Judah offers himself')).toBeNull())
  })
  it('opens a saved highlight at its recorded location', async () => {
    const p = props(); render(<LabContentsV2 {...p} />)
    fireEvent.click(screen.getByRole('button',{name:'1 highlights in Genesis 44'}))
    fireEvent.click(await screen.findByTestId('contents-highlight-judah'))
    await screen.findByText('Judah offers himself')
    fireEvent.click(screen.getByRole('button',{name:'Open passage'}))
    expect(p.onOpenPassage).toHaveBeenCalledWith({chapterNumber:44,paragraphIndex:1,wordIndex:0})
  })
  it('waits for the real chapter manifest and resets ancestry when the book changes', () => {
    const p = props()
    const {rerender} = render(<LabContentsV2 {...p} chaptersReady={false} />)
    expect(screen.getByText('Loading contents…')).toBeTruthy()
    expect(screen.queryByTestId('lab-tree-chapter-44')).toBeNull()
    rerender(<LabContentsV2 {...p} />)
    expect(screen.getByTestId('lab-tree-chapter-44')).toBeTruthy()
    rerender(<LabContentsV2 {...p} bookId="notes" title="Notes from Underground" sections={[{title:'Part I',chapters:[1]}]} chapters={[{number:1,title:'Chapter 1'}]} currentChapter={1} />)
    expect(screen.getByTestId('lab-tree-chapter-1')).toBeTruthy()
    expect(screen.queryByTestId('lab-tree-chapter-44')).toBeNull()
  })
  it('opens the book switcher from its title and offers a direct return to reading', () => {
    const p = props(), onSwitchBook = vi.fn()
    render(<LabContentsV2 {...p} onSwitchBook={onSwitchBook} />)
    fireEvent.click(screen.getByRole('button', {name: 'Switch books, currently The Bible'}))
    expect(onSwitchBook).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', {name: 'Back to book'}))
    expect(p.onClose).toHaveBeenCalledTimes(1)
    expect(screen.getAllByText('The Bible')).toHaveLength(1)
  })
})

it('matches the flat-book Chapters root and simplifies repeated part labels', () => {
  const flatBook=contentsTree([{number:1,title:'Chapter 1'},{number:2,title:'Appendix'}],undefined,false)
  expect(flatBook.map(n=>n.label)).toEqual(['Chapter 1','Appendix'])
  const parts=contentsTree([{number:1,title:'Part 1, Chapter 1'}],[{title:'Part 1 — Underground',chapters:[1]}],false)
  expect(parts[0].label).toBe('Part 1 — Underground')
  expect(parts[0].children?.[0].label).toBe('Chapter 1')
})

it('puts separate Cover and Preface destinations above the chapter tree without choosing a chapter', () => {
  const p=props(), openCover=vi.fn(), openPreface=vi.fn()
  render(<LabContentsV2 {...p} onOpenCover={openCover} onOpenPreface={openPreface}/>)
  const cover=screen.getByRole('button',{name:'Cover'})
  const preface=screen.getByRole('button',{name:'Preface'})
  const tree=screen.getByRole('navigation',{name:'Chapters'})
  expect(tree.firstElementChild?.contains(cover)).toBe(true)
  expect(tree.firstElementChild?.contains(preface)).toBe(true)
  fireEvent.click(cover)
  fireEvent.click(preface)
  expect(openCover).toHaveBeenCalledTimes(1)
  expect(openPreface).toHaveBeenCalledTimes(1)
  expect(p.onSelectChapter).not.toHaveBeenCalled()
})
