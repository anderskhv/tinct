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
import { readUserBookPlace, writeUserBookPlace } from './userBookPlace'
import { UserBookReader } from './UserBookReader'
import { fetchNarrationPilotInfo, OWN_BOOK_NARRATION_UNAVAILABLE } from '../labNarration'
import { USER_BOOK_CHAPTER_CHARS, USER_BOOK_PASSAGE_CHARS, chapterWindow, passageWindow } from './userBookContext'
const accountCards = vi.hoisted(() => ({ open: vi.fn(async (_options: { start?: string }) => true) }))
vi.mock('../../cards/openCards', async importOriginal => ({ ...await importOriginal<typeof import('../../cards/openCards')>(), openAccountCards: accountCards.open }))

const leave = vi.hoisted(() => vi.fn())
vi.mock('../labLeaveForLibrary', async importOriginal => ({ ...await importOriginal<typeof import('../labLeaveForLibrary')>(), leaveForLibrary: leave }))
const ownShelf = vi.hoisted(() => ({ books: [] as unknown[], owners: [] as unknown[] }))
vi.mock('./ownShelf', async importOriginal => ({
  ...await importOriginal<typeof import('./ownShelf')>(),
  readOwnShelf: vi.fn(async (owner: unknown) => { ownShelf.owners.push(owner); return ownShelf.books }),
}))
vi.mock('../labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('../labNarration')>(),
  initialNarrationPilotInfo: () => null,
  fetchNarrationPilotInfo: vi.fn(async () => ({ enabled: false, provider: 'google', voices: [] })),
}))

// Saving a place to the reader's private account copy (ownSync.ts, tested there): watched here.
const ownSync = vi.hoisted(() => ({ note: vi.fn(), flush: vi.fn(), notePdf: vi.fn() }))
vi.mock('./ownSync', async importOriginal => ({ ...await importOriginal<typeof import('./ownSync')>(), noteOwnPlace: ownSync.note, flushOwnPlaces: ownSync.flush, notePdfPlace: ownSync.notePdf }))

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
    // The title opens the book switcher, exactly as for Tinct's books (Anders, 2026-10-08).
    expect(screen.getByTestId('lab-header-book').getAttribute('aria-label')).toBe('Switch books, currently My Own Notebook')
    expect(screen.queryByTestId('lab-v2-play')).toBeNull()
    expect(document.title).toBe('My Own Notebook · Tinct')
    fireEvent.click(screen.getByTestId('lab-super'))
    const rows = [...document.querySelectorAll('.lab-super-row')].map(row => row.getAttribute('data-row'))
    // Book settings: an EPUB on the desktop has Margin view too (19 Oct 2026, epubView.ts).
    expect(rows).toEqual(['librarian', 'summarize', 'catchup', 'text', 'editions', 'audio', 'account'])
    // The Librarian row offers Chat and Talk, as for any book (2026-10-08).
    expect(screen.getByTestId('lab-super-row-chat')).toBeTruthy()
    expect(screen.getByTestId('lab-super-row-talk')).toBeTruthy()
  })

  it('opens the book switcher from its title, with the reader\u2019s other own books and the library', async () => {
    ownShelf.books = [{
      key: 'epub:cc12cd34ef56ab12cd34ef56', kind: 'epub', hex: 'cc12cd34ef56ab12cd34ef56', title: 'The Sovereign Child', author: 'A. Writer',
      cover: 'data:image/jpeg;base64,AAAA', at: 5, href: '/reader?userBook=cc12cd34ef56ab12cd34ef56',
      reading: { bookId: 'userbook-cc12cd34ef56ab12cd34ef56', chapterNumber: 3, chapterLabel: 'Chapter Three', headline: '', percent: 20, wordCount: 1000, lastActiveAt: 9 },
    }]
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'u-test', email: 'reader@example.com' } }))
    ownShelf.owners = []
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign, search: '?userBook=' + HEX, href: 'http://localhost/reader?userBook=' + HEX })
    render(<LabApp pathname="/lab/desktop" authToken="test-token" userBook={{ ...loaded({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }), cover: 'data:image/jpeg;base64,BBBB' }} />)
    fireEvent.click(screen.getByTestId('lab-header-book'))
    const switcher = await screen.findByTestId('lab-book-switcher')
    expect(switcher.textContent).toContain('Reading now')
    await waitFor(() => expect(switcher.textContent).toContain('The Sovereign Child'))
    // Only this account's own books are read (this device's at once, then with the account's, as the library).
    expect([...new Set(ownShelf.owners)]).toEqual(['u-test'])
    const rows = [...switcher.querySelectorAll('.lab-book-switcher-row')]
    // The book being read is the current row, with its own cover; the other own book follows.
    expect(rows[0].getAttribute('aria-current')).toBe('true')
    expect(rows[0].textContent).toContain('My Own Notebook')
    expect(rows[0].querySelector('img')?.getAttribute('src')).toBe('data:image/jpeg;base64,BBBB')
    const other = rows.find(row => row.textContent?.includes('The Sovereign Child'))!
    expect(other.textContent).toContain('Chapter Three')
    expect(other.querySelector('img')?.getAttribute('src')).toBe('data:image/jpeg;base64,AAAA')
    expect(switcher.querySelector('.lab-book-switcher-library')?.textContent).toContain('Library')
    fireEvent.click(other)
    expect(assign).toHaveBeenCalledWith('/reader?userBook=cc12cd34ef56ab12cd34ef56')
    // Nothing about the own books was sent anywhere.
    expect(requests.filter(request => request.url !== '/lab/catalogue.json' && /userbook|Sovereign/.test(request.url + JSON.stringify(request.body)))).toEqual([])
    ownShelf.books = []
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

  it('hands each place it keeps to the account sync (its private copy), and sends what waits when the page is hidden', async () => {
    ownSync.note.mockClear(); ownSync.flush.mockClear()
    const book = loaded({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={book} />)
    const root = screen.getByTestId('lab-root')
    for (let i = 0; i < 10 && root.getAttribute('data-chapter') !== '2'; i++) {
      const next = screen.queryByTestId('lab-page-next')
      if (next) fireEvent.click(next)
      else fireEvent.keyDown(document.body, { key: 'ArrowRight' })
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    await waitFor(() => expect(readUserBookPlace(HEX, edition())?.chapterNumber).toBe(2))
    expect(ownSync.note).toHaveBeenCalledWith(HEX, book.edition.chapters)
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    await waitFor(() => expect(ownSync.flush).toHaveBeenCalled())
  })

  it('on the desktop, leaving it names it as the book just read for the library\u2019s first paint (this device only)', async () => {
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'u-test', email: 'reader@example.com' } }))
    render(<LabApp pathname="/lab/desktop" authToken={undefined} userBook={loaded({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 })} />)
    await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2'))
    await waitFor(() => {
      window.dispatchEvent(new Event('pagehide'))
      expect(JSON.parse(localStorage.getItem('tinct:lab-library-boot') || 'null')?.hero).toMatchObject({ bookId: BOOK_ID, title: 'My Own Notebook' })
    })
    expect(JSON.parse(localStorage.getItem('tinct:lab-library-boot')!).userId).toBe('u-test')
    // Nothing of it is sent anywhere.
    expect(requests.filter(request => /userbook|Notebook/.test(request.url + JSON.stringify(request.body)))).toEqual([])
  })

  it('on a phone, leaving it writes no library snapshot (phones unchanged)', async () => {
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'u-test', email: 'reader@example.com' } }))
    render(<LabApp pathname="/lab/phone" authToken={undefined} userBook={loaded({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 })} />)
    await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2'))
    await new Promise(resolve => setTimeout(resolve, 50))
    window.dispatchEvent(new Event('pagehide'))
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    expect(localStorage.getItem('tinct:lab-library-boot')).toBeNull()
  })

  it('opened without a saved place, joins Currently reading from its start, a mark never sent to the account', async () => {
    ownSync.note.mockClear()
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    await waitFor(() => expect(JSON.parse(localStorage.getItem(`tinct-addbook:place:${HEX}`) || 'null')).toEqual({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 }))
    expect(ownSync.note).not.toHaveBeenCalled()
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

  it('goes back to the library\'s reading table, as from Tinct\'s books (Anders, 12 Oct)', () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
    const back = screen.getByTestId('lab-library-back')
    expect(back.getAttribute('aria-label')).toBe('Back to library')
    fireEvent.click(back)
    expect(leave).toHaveBeenCalledWith('/library')
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
  it('opens the account cards, with their Premium offer, when the server answers 402', async () => {
    vi.mocked(fetchNarrationPilotInfo).mockResolvedValue({ enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female' }], ownBooks: true })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requests.push({ url, body: null })
      if (url.endsWith('/api/narration/own/ensure')) return Response.json({ error: 'Premium required', reason: 'premium_required' }, { status: 402 })
      return new Response('{}', { status: 404 })
    }))
    render(<LabApp pathname="/lab/desktop" authToken="token-a" userBook={loaded()} />)
    fireEvent.click(await screen.findByTestId('lab-v2-play'))
    await waitFor(() => expect(accountCards.open).toHaveBeenCalled())
    expect(screen.queryByTestId('lab-narration-error')).toBeNull()
  })
})

/** A text PDF's Tinct text: chapter 1 starts on page 2 and runs onto page 3; chapter 2 is on page 4. */
function pdfBook(place: { chapterNumber: number; paragraphIndex: number; wordIndex: number } | null = null) {
  const pdf: UserBookEdition = {
    ...edition(), source: 'pdf', converter: 1, title: 'A Paper of My Own',
    chapters: [
      { ...edition().chapters[0], pages: [2, 2, 2, 3], pageBreaks: [[2, 40, 3]] },
      { ...edition().chapters[1], pages: [4, 4] },
    ],
  }
  return { hex: HEX, bookId: BOOK_ID, kind: 'pdf' as const, pdfPages: 6, edition: pdf, images: new Map(), place: place ? { ...place, updatedAt: 1, converter: 1 } : null }
}

describe('a PDF read as its Tinct text', () => {
  it('offers Book settings with its two editions, and nothing else of an edition', async () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={pdfBook({ chapterNumber: 1, paragraphIndex: 2, wordIndex: 45 })} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    const rows = [...document.querySelectorAll('.lab-super-row')].map(row => row.getAttribute('data-row'))
    expect(rows).toEqual(['librarian', 'summarize', 'catchup', 'text', 'editions', 'audio', 'account'])
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    const sheet = await screen.findByRole('heading', { name: 'Book settings' })
    const body = sheet.closest('section, [role="dialog"], .lab-v2-sheet') ?? document.body
    expect(screen.getByTestId('lab-v2-main-edition').textContent).toContain('Tinct text')
    expect(screen.queryByTestId('lab-v2-audio-edition')).toBeNull()
    expect(screen.queryByTestId('lab-v2-compare-edition')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-v2-main-edition'))
    const options = [...body.querySelectorAll('.lab-v2-edition-option')].map(option => [option.textContent?.replace('✓', '').trim(), option.getAttribute('aria-pressed')])
    // On the desktop its pages are named as an EPUB's Margin view is (19 Oct 2026: the way back); a phone says Original pages.
    expect(options).toEqual([['Tinct text', 'true'], ['Margin view (original pages)', 'false']])
  })

  it('picking Original pages opens the viewer at the same spot, kept and sent as the PDF\u2019s one place', async () => {
    ownSync.notePdf.mockClear(); ownSync.flush.mockClear()
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign, search: '?userBook=' + HEX, href: 'http://localhost/reader?userBook=' + HEX })
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={pdfBook({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 })} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    fireEvent.click(await screen.findByTestId('lab-v2-main-edition'))
    fireEvent.click([...document.querySelectorAll('.lab-v2-edition-option')].find(option => option.textContent?.includes('Margin view (original pages)'))!)
    // One address (22 Oct 2026): the reader there opens the margin reader's pages at that page.
    expect(assign).toHaveBeenCalledWith(`/reader?userBook=${HEX}&page=4`)
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:pos:pdf:${HEX}`) || 'null')).toMatchObject({ page: 4, chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, converter: 1, edition: 'p' })
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:edition:${HEX}`) || 'null')).toBe('pages')
    expect(ownSync.notePdf).toHaveBeenCalledWith(HEX, { now: true })
    expect(ownSync.flush).toHaveBeenCalled()
  })

  it('keeps each place it notes as the PDF\u2019s place, shared with its pages', async () => {
    ownSync.note.mockClear()
    const book = pdfBook({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={book} />)
    const root = screen.getByTestId('lab-root')
    for (let i = 0; i < 10 && root.getAttribute('data-chapter') !== '2'; i++) {
      const next = screen.queryByTestId('lab-page-next')
      if (next) fireEvent.click(next)
      else fireEvent.keyDown(document.body, { key: 'ArrowRight' })
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    await waitFor(() => expect(ownSync.note).toHaveBeenCalledWith(HEX, book.edition.chapters, { pdf: { pages: 6 } }))
  })

  // Anders, 19 Oct 2026: on the desktop an EPUB reads in Add a book's margin reader unless the reader chose the
  // Tinct reader there; from here, "Margin view" goes back. A phone keeps one edition and no Book settings row.
  it('an EPUB on a phone keeps one edition and no Book settings row', () => {
    const width = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    try {
      render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded()} />)
      fireEvent.click(screen.getByTestId('lab-super'))
      expect(screen.queryByTestId('lab-super-row-editions')).toBeNull()
    } finally { Object.defineProperty(window, 'innerWidth', { configurable: true, value: width }) }
  })

  it('an EPUB on the desktop offers Margin view, which opens the margin reader at the same words, chosen on this device', async () => {
    ownSync.flush.mockClear()
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign, search: '?userBook=' + HEX, href: 'http://localhost/reader?userBook=' + HEX })
    const book = loaded({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 })
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={book} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    fireEvent.click(await screen.findByTestId('lab-v2-main-edition'))
    const options = [...document.querySelectorAll('.lab-v2-edition-option')].map(option => [option.textContent?.replace('✓', '').trim(), option.getAttribute('aria-pressed')])
    expect(options).toEqual([['EPUB', 'true'], ['Margin view', 'false']])
    expect(screen.queryByTestId('lab-v2-compare-edition')).toBeNull()
    fireEvent.click([...document.querySelectorAll('.lab-v2-edition-option')].find(option => option.textContent?.includes('Margin view'))!)
    expect(assign).toHaveBeenCalledWith(`/reader?userBook=${HEX}`)
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:epub-view:${HEX}`) || 'null')).toBe('margin')
    const words = book.edition.chapters.find(chapter => chapter.number === 2)!.paragraphs[0].split(/\s+/).slice(0, 14).join(' ')
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:pos:epub:${HEX}`) || 'null')).toMatchObject({ via: 't', quote: words })
    expect(ownSync.flush).toHaveBeenCalled()
  })
})

describe('UserBookReader', () => {
  it('hides the old private source synchronously when the mounted reader changes account', async () => {
    const book = { ...loaded(), kind: 'epub' as const, images: new Map<string, string>() }
    let resolveNext: ((value: { ok: true; book: typeof book }) => void) | undefined
    const open = vi.fn((_hex: string, options: { owner?: string | null }) => options.owner === 'account-a'
      ? Promise.resolve({ ok: true as const, book })
      : new Promise<{ ok: true; book: typeof book }>(resolve => { resolveNext = resolve }))
    const { rerender } = render(<UserBookReader hex={HEX} owner="account-a" sharedReader open={open} reconcile={async () => {}} />)
    await waitFor(() => expect(screen.getByTestId('lab-root')).toBeTruthy())
    rerender(<UserBookReader hex={HEX} owner="account-b" sharedReader open={open} reconcile={async () => {}} />)
    expect(screen.queryByTestId('lab-root')).toBeNull()
    expect(screen.getByTestId('user-book-opening')).toBeTruthy()
    resolveNext?.({ ok: true, book })
    await waitFor(() => expect(screen.getByTestId('lab-root')).toBeTruthy())
  })

  it('opens a stored Margin EPUB in the shared React reader without changing the stored view preference', async () => {
    localStorage.setItem(`tinct-addbook:epub-view:${HEX}`, '"margin"')
    localStorage.setItem('tinct:margin-preview', '1')
    const open = vi.fn(async () => ({ ok: true as const, book: { ...loaded(), images: new Map() } }))
    render(<UserBookReader hex={HEX} owner="me" sharedReader open={open} reconcile={async () => {}} />)
    await waitFor(() => expect(screen.getByTestId('lab-root')).toBeTruthy())
    expect(open).toHaveBeenCalledWith(HEX, expect.objectContaining({ epubView: 'text', sharedReader: true }))
    expect(open.mock.lastCall?.[1]).not.toHaveProperty('desktop')
    expect(screen.queryByTestId('margin-preview-frame')).toBeNull()
    expect(localStorage.getItem(`tinct-addbook:epub-view:${HEX}`)).toBe('"margin"')
    expect(localStorage.getItem('tinct:margin-preview')).toBe('1')
  })

  it('opens selected PDF Tinct text in the shared reader and reconciles its PDF place first', async () => {
    const reconcile = vi.fn(async () => {})
    const open = vi.fn(async () => ({ ok: true as const, book: pdfBook({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 }) }))
    render(<UserBookReader hex={HEX} sharedReader open={open} reconcile={reconcile} />)
    await waitFor(() => expect(screen.getByTestId('lab-root')).toBeTruthy())
    expect(open).toHaveBeenCalledWith(HEX, expect.objectContaining({ sharedReader: true }))
    expect(open.mock.lastCall?.[1]).not.toHaveProperty('desktop')
    expect(reconcile).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('margin-preview-frame')).toBeNull()
  })

  // One Tinct (22 Oct 2026): the margin reader's books open at /reader?userBook=<hex> in the reader's shell on a
  // desktop (the frame); a phone goes on to the margin reader's page, as before.
  it('opens a PDF read in its pages, or one without text to reflow, in the margin reader: framed on a desktop, its page on a phone (a scan never back here)', async () => {
    const forward = vi.fn()
    render(<UserBookReader hex={HEX} phone open={async () => ({ ok: false, reason: 'pages', message: '' })} forward={forward} />)
    await waitFor(() => expect(forward).toHaveBeenCalledWith('/lab/addbook/book?userBook=' + HEX))
    cleanup()
    const scan = vi.fn()
    render(<UserBookReader hex={HEX} phone open={async () => ({ ok: false, reason: 'pages_only', message: '' })} forward={scan} />)
    await waitFor(() => expect(scan).toHaveBeenCalledWith('/lab/addbook/book?userBook=' + HEX + '&pages=1'))
    cleanup()
    const desk = vi.fn()
    render(<UserBookReader hex={HEX} open={async () => ({ ok: false, reason: 'pages_only', message: '' })} forward={desk} />)
    const frame = await screen.findByTestId('margin-preview-frame', {}, { timeout: 8000 })
    expect(frame.getAttribute('src')).toBe('/lab/addbook/book?userBook=' + HEX + '&pages=1')
    expect(desk).not.toHaveBeenCalled()
  })

  it('frames an EPUB in Margin view on a desktop at the reader\u2019s address, writing no place of its own', async () => {
    const before = JSON.stringify({ ...localStorage })
    render(<UserBookReader hex={HEX} open={async () => ({ ok: false, reason: 'margin', message: '' })} forward={() => { throw new Error('no forward') }} />)
    const frame = await screen.findByTestId('margin-preview-frame', {}, { timeout: 8000 })
    expect(frame.getAttribute('src')).toBe('/lab/addbook/book?userBook=' + HEX)
    await waitFor(() => expect(window.TinctMarginPreview?.bookId).toBe('userbook-' + HEX))
    expect(Object.keys(localStorage).filter(key => key.includes(HEX))).toEqual(Object.keys(JSON.parse(before)).filter(key => key.includes(HEX)))
  })

  it('carries a link\u2019s Original pages request (&page, &frac, &pages) to the margin reader without opening the book here', async () => {
    vi.stubGlobal('location', { ...window.location, search: `?userBook=${HEX}&page=7&frac=0.5&pages`, href: `http://localhost/reader?userBook=${HEX}&page=7&frac=0.5&pages` })
    const open = vi.fn(async () => ({ ok: true as const, book: loaded() }))
    render(<UserBookReader hex={HEX} owner="me" open={open} />)
    const frame = await screen.findByTestId('margin-preview-frame', {}, { timeout: 8000 })
    expect(frame.getAttribute('src')).toBe(`/lab/addbook/book?userBook=${HEX}&page=7&frac=0.5&pages=`)
    expect(open).not.toHaveBeenCalled()
    // The host tidies the address it was opened at (page and frac only); this test's own address goes back.
    window.history.replaceState(null, '', '/')
  })

  it('opens a PDF\u2019s Tinct text (a phone\u2019s reader) at the place last read in its pages, found from the page', async () => {
    // Read in Original pages later than the Tinct text: the top of page 4 is chapter 2.
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 100, converter: 1 })
    localStorage.setItem(`tinct-addbook:pos:pdf:${HEX}`, JSON.stringify({ page: 4, frac: 0, at: 5_000, edition: 'p' }))
    render(<UserBookReader hex={HEX} phone open={async () => ({ ok: true, book: pdfBook({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 }) })} reconcile={async () => {}} />)
    await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2'))
  })

  it('opens at a link\u2019s page once: the page leaves the address, so a reload opens at the kept place', async () => {
    window.history.replaceState(null, '', `/reader?userBook=${HEX}&page=4&margin=1`)
    try {
      render(<UserBookReader hex={HEX} phone open={async () => ({ ok: true, book: pdfBook({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 }) })} reconcile={async () => {}} />)
      await waitFor(() => expect(screen.getByTestId('lab-root')).toBeTruthy())
      expect(window.location.search).toBe(`?userBook=${HEX}&margin=1`)
    } finally { window.history.replaceState(null, '', '/') }
  })

  it('frames a PDF read as its Tinct text on a desktop: it reads beside the margin there, from the same place', async () => {
    const reconcile = vi.fn(async () => {})
    render(<UserBookReader hex={HEX} open={async () => ({ ok: true, book: pdfBook({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 }) })} reconcile={reconcile} forward={() => { throw new Error('no forward') }} />)
    expect((await screen.findByTestId('margin-preview-frame', {}, { timeout: 8000 })).getAttribute('src')).toBe('/lab/addbook/book?userBook=' + HEX)
    // The frame is the place's only writer: it reconciles a PDF's place itself as it opens.
    expect(reconcile).not.toHaveBeenCalled()
  })

  it('says why a book cannot be opened and links back to My shelf', async () => {
    render(<UserBookReader hex={HEX} open={async () => ({ ok: false, reason: 'unreadable', message: 'This file could not be opened as an EPUB. Choose another file.' })} forward={() => { throw new Error('no forward') }} />)
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('could not be opened'))
    expect(screen.getByRole('link').getAttribute('href')).toBe('/library#my-shelf')
  })

  it('sends a book that is not on this device yet (a PDF, an account copy) on to the margin reader, which fetches it', async () => {
    const forward = vi.fn()
    render(<UserBookReader hex={HEX} phone open={async () => ({ ok: false, reason: 'missing', message: 'That book is no longer on this device. Open the file again.' })} forward={forward} />)
    await waitFor(() => expect(forward).toHaveBeenCalledWith('/lab/addbook/book?userBook=' + HEX))
  })

  it('opens at the place read later on another device of the account, taken before the first page is drawn', async () => {
    const reconcile = vi.fn(async (hex: string) => { writeUserBookPlace(hex, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 9_000 }) })
    render(<UserBookReader hex={HEX} open={async () => ({ ok: true, book: { ...loaded({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 }), images: new Map() } })} reconcile={reconcile} />)
    await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2'))
    expect(reconcile).toHaveBeenCalledWith(HEX, expect.objectContaining({ hex: HEX }))
  })

  it('opens at this device\'s place when the account cannot be asked', async () => {
    render(<UserBookReader hex={HEX} open={async () => ({ ok: true, book: { ...loaded({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }), images: new Map() } })} reconcile={async () => { throw new Error('offline') }} />)
    await waitFor(() => expect(screen.getByTestId('lab-root').getAttribute('data-chapter')).toBe('2'))
  })

  it('opens the reader once the book is ready', async () => {
    render(<UserBookReader hex={HEX} open={async () => ({ ok: true, book: loaded() })} />)
    await waitFor(() => expect(screen.getByTestId('lab-header-book').textContent).toBe('My Own Notebook'))
  })
})
