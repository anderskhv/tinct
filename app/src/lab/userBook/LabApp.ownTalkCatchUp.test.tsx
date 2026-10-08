// @vitest-environment jsdom
//
// Talk and Catch me up on a reader's own book (2026-10-08). The voice
// transport never opens (getUserMedia hangs) and the Worker is a stub: no
// provider is reached.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { useVoiceSession } from '../../hooks/useVoiceSession'
import { buildVoiceReaderContext, nearbyParagraphWindow } from '../../voice/context'
import { LabApp } from '../LabApp'
import type { UserBookEdition } from './userEdition'
import { userBookId } from './userBookId'

const captured = vi.hoisted(() => ({ options: null as Parameters<typeof useVoiceSession>[0] | null }))
vi.mock('../../hooks/useVoiceSession', async importOriginal => {
  const original = await importOriginal<typeof import('../../hooks/useVoiceSession')>()
  return { ...original, useVoiceSession: (options: Parameters<typeof useVoiceSession>[0]) => {
    captured.options = options
    return original.useVoiceSession(options)
  } }
})
vi.mock('../labNarration', async importOriginal => ({
  ...await importOriginal<typeof import('../labNarration')>(),
  initialNarrationPilotInfo: () => null,
  fetchNarrationPilotInfo: vi.fn(async () => ({ enabled: false, provider: 'google', voices: [] })),
}))

const HEX = 'ab12cd34ef56ab12cd34ef56'
const BOOK_ID = userBookId(HEX)
// A long chapter: 300 paragraphs of about 600 characters (180,000 characters).
const long = Array.from({ length: 300 }, (_, i) => `p${String(i).padStart(3, '0')} ` + 'word '.repeat(119))

function edition(): UserBookEdition {
  return {
    format: 'tinct-user-edition-v1', converter: 1, title: 'My Own Notebook', author: 'A. Reader', language: 'en', droppedImages: 0,
    chapters: [
      { number: 1, title: 'Long', paragraphs: long },
      { number: 2, title: 'The Morning', paragraphs: ['Morning came over the hills.', 'Mara left for the city.', 'The road was long.'] },
    ],
  }
}

const loaded = (place: { chapterNumber: number; paragraphIndex: number; wordIndex: number } | null = null) =>
  ({ hex: HEX, bookId: BOOK_ID, edition: edition(), images: new Map(), place: place ? { ...place, updatedAt: 1 } : null })

let requests: Array<{ url: string; method: string; body: unknown }> = []
beforeEach(() => {
  requests = []
  captured.options = null
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: () => new Promise(() => {}) } })
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    let body: unknown = null
    try { body = init?.body ? JSON.parse(String(init.body)) : null } catch { body = init?.body }
    requests.push({ url, method: init?.method ?? 'GET', body })
    if (url.includes('/api/own-catch-up?')) return Response.json({ steps: [], current: null })
    if (url.endsWith('/api/own-catch-up')) {
      const chapter = (body as { chapter: number }).chapter
      return Response.json({ recap: chapter === 1 ? 'Mara waits by the lamp.' : 'Mara waits by the lamp, then leaves for the city.', chapter, complete: true, cached: false })
    }
    return new Response('{}', { status: 404 })
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

const size = (text: string) => text.length

describe('Talk on a reader’s own book', () => {
  it('is offered in the menu and starts with the AI line, hearing only the passage on screen', async () => {
    render(<LabApp pathname="/lab/phone" authToken="token-a" userBook={loaded({ chapterNumber: 1, paragraphIndex: 150, wordIndex: 0 })} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-talk'))
    await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
    expect(screen.getByTestId('lab-call-ai').textContent).toBe("You're talking to an AI.")

    const options = captured.options!
    expect(options.editionKey).toBeUndefined()
    expect(options.bookTitle).toBe('My Own Notebook')
    // The passage the session hears, exactly as useVoiceSession builds it, and the reference beside it.
    const index = options.paragraphIndex
    const spoken = buildVoiceReaderContext({
      bookId: options.bookId, bookTitle: options.bookTitle, bookAuthor: options.bookAuthor, editionKey: options.editionKey, editionLabel: options.editionLabel,
      chapterNumber: options.chapterNumber, chapterLabel: options.chapterTitle, paragraphIndex: index,
      currentParagraph: options.chapterParagraphs[index], nearbyParagraphs: nearbyParagraphWindow(options.chapterParagraphs, index), visibleText: options.visibleText,
    })
    const reference = options.reference ?? ''
    // Built-in Talk's sizing: a few paragraphs around the place, never the chapter (180,000 characters).
    expect(size(spoken)).toBeLessThan(3_000)
    expect(size(reference)).toBeLessThan(5_000)
    const near = long[index].slice(0, 4)
    expect(reference).toContain(near)
    for (const far of ['p000', 'p100', 'p200', 'p299']) {
      expect(spoken).not.toContain(far)
      expect(reference).not.toContain(far)
    }
    expect(spoken).not.toContain('userbook-')
    expect(reference).not.toContain('userbook-')
    expect(JSON.parse(reference).book).toBe('My Own Notebook')
    // Nothing named the book on the way: no request carries its id.
    expect(requests.filter(request => request.url.includes('userbook-') || JSON.stringify(request.body ?? '').includes('userbook-'))).toEqual([])
  })

  it('the Librarian row’s mic opens Talk', async () => {
    render(<LabApp pathname="/lab/phone" authToken="token-a" userBook={loaded()} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.getAllByTestId('lab-super-row-talk')).toHaveLength(1)
    fireEvent.click(screen.getByTestId('lab-super-row-talk'))
    await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())
  })
})

describe('Catch me up on a reader’s own book', () => {
  it('builds the recap a chapter at a time from this device’s text and shows it above You are here', async () => {
    render(<LabApp pathname="/lab/desktop" authToken="token-a" userBook={loaded({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 })} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-catchup'))
    const sheet = await screen.findByTestId('lab-catch-up')
    expect(sheet.getAttribute('data-own-book')).toBe('true')
    await waitFor(() => expect(screen.getByTestId('lab-catch-up-entry').textContent).toContain('Mara waits by the lamp, then leaves for the city.'))
    const posts = requests.filter(request => request.url.endsWith('/api/own-catch-up'))
    expect(posts.map(request => request.method)).toEqual(['POST', 'POST'])
    const [first, second] = posts.map(request => request.body as { book: string; chapter: number; complete: boolean; through: number; text: string; previous: string })
    expect(first).toMatchObject({ book: HEX, chapter: 1, complete: true, previous: '' })
    expect(first.text.length).toBeLessThanOrEqual(32_000)
    // The chapter in progress goes only to the reader's paragraph, on the recap before it.
    expect(second).toMatchObject({ book: HEX, chapter: 2, complete: false, through: 1, previous: 'Mara waits by the lamp.', text: 'Morning came over the hills.\n\nMara left for the city.' })
    expect(second.text).not.toContain('The road was long.')
    expect(requests.filter(request => request.url.includes('/api/lab-catch-up') || request.url.includes('/api/lab-recap'))).toEqual([])
    expect(requests.filter(request => request.url.includes('userbook-') || JSON.stringify(request.body ?? '').includes('userbook-'))).toEqual([])
    expect(screen.getByTestId('lab-catch-up-here')).toBeTruthy()
  })

  it('signed out: asks for an account instead of sending anything', () => {
    render(<LabApp pathname="/lab/desktop" authToken={null} userBook={loaded({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 })} />)
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-catchup'))
    expect(screen.queryByTestId('lab-catch-up')).toBeNull()
    expect(screen.getByTestId('lab-account-sheet')).toBeTruthy()
    expect(requests.filter(request => request.url.includes('catch-up'))).toEqual([])
  })
})
