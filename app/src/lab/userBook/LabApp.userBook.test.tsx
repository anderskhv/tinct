// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from '../LabApp'
import { readLabPositionLocal } from '../labPositionStore'
import { readLabHighlights } from '../labHighlights'
import { loadLabBookSource } from '../labSource'
import { loadChapterText } from '../../readingMemory'
import type { UserBookEdition } from './userEdition'
import { userBookId } from './userBookId'
import { readUserBookPlace } from './userBookPlace'
import { UserBookReader } from './UserBookReader'
import { fetchNarrationPilotInfo, OWN_BOOK_NARRATION_UNAVAILABLE } from '../labNarration'
import { USER_BOOK_CHAPTER_CHARS, USER_BOOK_PASSAGE_CHARS, chapterWindow, passageWindow } from './userBookContext'

const leave = vi.hoisted(() => vi.fn())
vi.mock('../labLeaveForLibrary', async importOriginal => ({ ...await importOriginal<typeof import('../labLeaveForLibrary')>(), leaveForLibrary: leave }))
vi.mock('../labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('../labNarration')>(),
  initialNarrationPilotInfo: () => null,
  fetchNarrationPilotInfo: vi.fn(async () => ({ enabled: false, provider: 'google', voices: [] })),
}))

const HEX = 'ab12cd34ef56ab12cd34ef56'
const BOOK_ID = userBookId(HEX)
const words = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i}`).join(' ')

function edition(): UserBookEdition {
  return {
    format: 'tinct-user-edition-v1',
    converter: 1,
    title: 'My Own Notebook',
    author: 'A. Reader',
    language: 'en',
    droppedImages: 0,
    chapters: [
      { number: 1, title: 'The Lamp', paragraphs: ['It was a _dark_ night and the lamp was lit.', words('one', 90), words('two', 90), words('three', 90)] },
      { number: 2, title: 'The Morning', paragraphs: ['Morning came over the hills.', words('four', 40)] },
    ],
  }
}

function loaded(place: { chapterNumber: number; paragraphIndex: number; wordIndex: number } | null = null) {
  return { hex: HEX, bookId: BOOK_ID, edition: edition(), place: place ? { ...place, updatedAt: 1 } : null }
}

let requests: Array<{ url: string; body: unknown }> = []
beforeEach(() => {
  requests = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    let body: unknown = null
    try { body = init?.body ? JSON.parse(String(init.body)) : null } catch { body = init?.body }
    requests.push({ url, body })
    if (url.endsWith('/api/lab-chat') || url.endsWith('/api/chat')) {
      const events = [
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'A mock answer.' } },
        { type: 'message_stop' },
      ].map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('')
      return new Response(events, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
    }
    return new Response('{}', { status: 404 })
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  leave.mockClear()
  localStorage.clear()
})

describe('a user book in the Tinct reader', () => {
  it('opens at its saved place, with registry-only controls hidden and Talk and Catch me up offered', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 })} />)
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-chapter')).toBe('2')
    expect(root.getAttribute('lang')).toBe('en')
    expect(screen.getByTestId('lab-header-book').textContent).toBe('My Own Notebook')
    expect(screen.getByTestId('lab-header-book').getAttribute('aria-label')).toBe('Table of contents')
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()
    expect(document.title).toBe('My Own Notebook · Tinct')
    fireEvent.click(screen.getByTestId('lab-super'))
    const rows = [...document.querySelectorAll('.lab-super-row')].map(row => row.getAttribute('data-row'))
    expect(rows).toEqual(['librarian', 'summarize', 'catchup', 'settings', 'account'])
    // The Librarian row offers Chat and Talk, as for any book (2026-10-08).
    expect(screen.getByTestId('lab-super-row-chat')).toBeTruthy()
    expect(screen.getByTestId('lab-super-row-talk')).toBeTruthy()
  })

  it('keeps its place on this device only and loads chapters without fetching', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    const root = screen.getByTestId('lab-root')
    expect(root.getAttribute('data-chapter')).toBe('1')
    for (let i = 0; i < 10 && root.getAttribute('data-chapter') !== '2'; i++) {
      const next = screen.queryByTestId('lab-page-next')
      if (next) fireEvent.click(next)
      else fireEvent.keyDown(document.body, { key: 'ArrowRight' })
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    await waitFor(() => expect(root.getAttribute('data-chapter')).toBe('2'))
    expect(screen.getByTestId('lab-header-chapter').textContent).toMatch(/The Morning/)
    await waitFor(() => expect(readUserBookPlace(HEX, edition())?.chapterNumber).toBe(2))
    // The account's position record never holds a user book.
    expect(Object.keys(readLabPositionLocal().books)).toEqual([])
    expect(requests.filter(request => /userbook|\/data\/|lab-position|narration|catalogue/.test(request.url))).toEqual([])
  })

  it('asks the companion with the chapter text and without the book id', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    fireEvent.change(screen.getByTestId('lab-ask-input'), { target: { value: 'What is lit?' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    await waitFor(() => expect(requests.some(request => request.url.endsWith('/api/lab-chat'))).toBe(true))
    const body = requests.find(request => request.url.endsWith('/api/lab-chat'))!.body as { companion: { intent: string; context: Record<string, unknown> } }
    expect(body.companion.intent).toBe('ask')
    expect(body.companion.context.bookTitle).toBe('My Own Notebook')
    expect(body.companion.context.paragraphs).toEqual(edition().chapters[0].paragraphs)
    expect(body.companion.context.bookId).toBeUndefined()
    expect(body.companion.context.editionKey).toBeUndefined()
    expect(body.companion.context.readingTrail).toEqual([])
    expect(JSON.stringify(body)).not.toContain('userbook-')
    await waitFor(() => { const answers = screen.getAllByTestId('lab-ask-turn-assistant'); expect(answers[answers.length - 1].textContent).toContain('A mock answer.') })
    // The chat stays in this browser under the user book.
    expect(localStorage.getItem(`tinct:chat-history:${BOOK_ID}`)).toContain('What is lit?')
  })

  it('Summarize recaps the chapter in the chat instead of the server-cached notes', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-summarize'))
    await waitFor(() => expect(requests.some(request => request.url.endsWith('/api/lab-chat'))).toBe(true))
    expect(requests.some(request => /chapter-notes|catch-up/.test(request.url))).toBe(false)
    const body = requests.find(request => request.url.endsWith('/api/lab-chat'))!.body as { companion: { intent: string }; messages: Array<{ content: string }> }
    expect(body.companion.intent).toBe('ask')
    expect(body.messages[body.messages.length - 1].content).toContain('Recap this chapter.')
  })

  it('goes back to Your books on Add a book', () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    const back = screen.getByTestId('lab-library-back')
    expect(back.getAttribute('aria-label')).toBe('Back to your books')
    fireEvent.click(back)
    expect(leave).toHaveBeenCalledWith('/lab/addbook/?mode=file#books')
  })

  it('names its chapters and text only from this device', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    const source = await loadLabBookSource({ bookId: BOOK_ID, primaryEditionKey: 'own-en', chapterNumber: 2 })
    expect(source.chapterTitle).toBe('The Morning')
    expect(source.paragraphs[0]).toBe('Morning came over the hills.')
    expect(source.cast).toEqual([])
    expect((await loadChapterText({ bookId: BOOK_ID, editionKey: 'own-en', chapterNumber: 1 }))?.title).toBe('The Lamp')
    expect(readLabHighlights()).toEqual([])
    expect(requests).toEqual([])
  })
})

describe('what of a user book reaches the companion', () => {
  // A long chapter: 300 paragraphs of 600 characters (180,000 characters).
  const long = Array.from({ length: 300 }, (_, i) => `p${String(i).padStart(3, '0')} ` + 'word '.repeat(119))
  const longBook = () => ({ ...loaded(), edition: { ...edition(), chapters: [{ number: 1, title: 'Long', paragraphs: long }, edition().chapters[1]] } })
  const sent = () => requests.filter(request => request.url.endsWith('/api/lab-chat')).map(request => request.body as { companion: { context: { paragraphs: string[]; paragraphIndex: number } } })
  const size = (paragraphs: string[]) => paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0)

  it('windows: a passage stays within 9,000 characters around its place; a chapter within 120,000', () => {
    const passage = passageWindow(long, 150)
    expect(size(passage.paragraphs)).toBeLessThanOrEqual(USER_BOOK_PASSAGE_CHARS)
    expect(size(passage.paragraphs)).toBeGreaterThan(USER_BOOK_PASSAGE_CHARS - 1200)
    expect(passage.paragraphs[passage.paragraphIndex]).toBe(long[150])
    expect(passageWindow(['x'.repeat(20_000)], 0).paragraphs[0].length).toBe(USER_BOOK_PASSAGE_CHARS)
    const chapter = chapterWindow(long, 10)
    expect(size(chapter.paragraphs)).toBe(USER_BOOK_CHAPTER_CHARS)
    expect(chapter.paragraphs[0]).toBe(long[0])
  })

  it('Ask sends a window around the reader\u2019s place, not the chapter', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={longBook()} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-chat'))
    fireEvent.change(screen.getByTestId('lab-ask-input'), { target: { value: 'What is this?' } })
    fireEvent.click(screen.getByTestId('lab-ask-send'))
    await waitFor(() => expect(sent().length).toBe(1))
    const context = sent()[0].companion.context
    expect(size(context.paragraphs)).toBeLessThanOrEqual(USER_BOOK_PASSAGE_CHARS)
    expect(context.paragraphs[context.paragraphIndex]).toBe(long[0])
  })

  it('Recap this chapter sends the chapter, capped at 120,000 characters', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={longBook()} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-summarize'))
    await waitFor(() => expect(sent().length).toBe(1))
    const context = sent()[0].companion.context
    expect(size(context.paragraphs)).toBe(USER_BOOK_CHAPTER_CHARS)
    expect(context.paragraphs[0]).toBe(long[0])
  })
})

describe('Listen for a user book', () => {
  const voices = [{ key: 'f', label: 'Ara', persona: 'female' as const }, { key: 'm', label: 'Helios', persona: 'male' as const }]

  it('stays hidden unless the server says own books can be read aloud', async () => {
    vi.mocked(fetchNarrationPilotInfo).mockResolvedValue({ enabled: true, provider: 'grok', voices, ownBooks: false })
    render(<LabApp pathname="/lab/desktop" authToken="token-a" userBook={loaded()} />)
    await waitFor(() => expect(fetchNarrationPilotInfo).toHaveBeenCalled())
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()
  })

  it('stays hidden for a signed-out reader, who never asks the server', async () => {
    vi.mocked(fetchNarrationPilotInfo).mockClear()
    vi.mocked(fetchNarrationPilotInfo).mockResolvedValue({ enabled: true, provider: 'grok', voices, ownBooks: true })
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(fetchNarrationPilotInfo).not.toHaveBeenCalled()
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()
  })

  it('sends the chapter text to the own-book route only, never the book id elsewhere, and shows why it cannot play', async () => {
    vi.mocked(fetchNarrationPilotInfo).mockResolvedValue({ enabled: true, provider: 'grok', voices, ownBooks: true })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      let body: unknown = null
      try { body = init?.body ? JSON.parse(String(init.body)) : null } catch { body = init?.body }
      requests.push({ url, body })
      if (url.endsWith('/api/narration/own/ensure')) return Response.json({ error: 'Narration limit reached', reason: 'own_book_cap' }, { status: 429 })
      return new Response('{}', { status: 404 })
    }))
    render(<LabApp pathname="/lab/desktop" authToken="token-a" userBook={loaded()} />)
    const play = await screen.findByTestId('lab-v2-play')
    fireEvent.click(play)
    await waitFor(() => expect(requests.some(request => request.url.endsWith('/api/narration/own/ensure'))).toBe(true))
    const sent = requests.find(request => request.url.endsWith('/api/narration/own/ensure'))!.body as { book: string; voice: string; paragraphs: Array<{ index: number; text: string }> }
    expect(sent.book).toBe(HEX)
    expect(sent.paragraphs[0]).toMatchObject({ index: 0, text: edition().chapters[0].paragraphs[0] })
    await waitFor(() => expect(document.body.textContent).toContain(OWN_BOOK_NARRATION_UNAVAILABLE))
    // The id never travels: not to the shared narration routes, the listen report, covers or anywhere else.
    expect(requests.filter(request => /\/api\/narration\/(ensure|listen|chapter|prepare)|\/covers\//.test(request.url))).toEqual([])
    expect(requests.filter(request => request.url.includes('userbook-') || JSON.stringify(request.body ?? '').includes('userbook-'))).toEqual([])
    expect(requests.filter(request => !request.url.endsWith('/api/narration/own/ensure') && JSON.stringify(request.body ?? '').includes(HEX))).toEqual([])
  })
})

describe('Listen for a user book without Premium', () => {
  it('opens the account sheet, with its Premium offer, when the server answers 402', async () => {
    vi.mocked(fetchNarrationPilotInfo).mockResolvedValue({ enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female' }], ownBooks: true })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requests.push({ url, body: null })
      if (url.endsWith('/api/narration/own/ensure')) return Response.json({ error: 'Premium required', reason: 'premium_required' }, { status: 402 })
      return new Response('{}', { status: 404 })
    }))
    render(<LabApp pathname="/lab/desktop" authToken="token-a" userBook={loaded()} />)
    fireEvent.click(await screen.findByTestId('lab-v2-play'))
    await waitFor(() => expect(screen.getByTestId('lab-v2-account-card')).toBeTruthy())
    expect(screen.queryByTestId('lab-narration-error')).toBeNull()
  })
})

describe('UserBookReader', () => {
  it('says why a book cannot be opened and links back to Your books', async () => {
    render(<UserBookReader hex={HEX} open={async () => ({ ok: false, reason: 'missing', message: 'That book is no longer on this device. Open the file again.' })} />)
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('no longer on this device'))
    expect(screen.getByRole('link').getAttribute('href')).toBe('/lab/addbook/?mode=file#books')
  })

  it('opens the reader once the book is ready', async () => {
    render(<UserBookReader hex={HEX} open={async () => ({ ok: true, book: loaded() })} />)
    await waitFor(() => expect(screen.getByTestId('lab-header-book').textContent).toBe('My Own Notebook'))
  })
})
