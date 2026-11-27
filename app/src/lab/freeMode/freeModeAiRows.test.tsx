// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The reader as free reading mode draws it (freeMode.ts): FREE_MODE is decided from the address, so it is set here.
vi.mock('./freeMode', async (original) => ({ ...(await original<typeof import('./freeMode')>()), FREE_MODE: true }))

import { LabCatchUpSheet } from '../LabCatchUpSheet'
import { LabChapterNotesSheet } from '../LabChapterNotesSheet'
import { resetCatchUpMemory } from '../labCatchUp'
import { LAB_AI_ACTIONS_KEY, LAB_FREE_AI_ACTIONS, readLabAiActionCount } from '../labAccountPrompt'
import { CHAPTER_SUMMARY_KIND } from '../labChapterNotes'
import { CATCH_UP_ROUTE } from '../../catchUp'
import { CHAPTER_NOTES_ROUTE } from '../../chapterNotes'
import { installFreeModeGuard } from './freeMode'
import { freeModeAiRowKey, pressFreeModeAiRow } from './freeModeAiRows'

const here = { bookId: 'meditations', editionKey: 'modern-en', chapterNumber: 3 }

beforeEach(() => { localStorage.clear(); resetCatchUpMemory() })
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('free reading mode’s AI rows use the device’s free AI actions', () => {
  it('counts each card that is made, on the counter Explain and Ask use', () => {
    const made = new Set<string>()
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', here), made })).toBe('open')
    expect(readLabAiActionCount()).toBe(1)
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('catchup', here), made })).toBe('open')
    expect(readLabAiActionCount()).toBe(2)
    // Another chapter's summary is another card.
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', { ...here, chapterNumber: 4 }), made })).toBe('open')
    expect(readLabAiActionCount()).toBe(3)
    // And so is the same chapter's in the other edition.
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', { ...here, editionKey: 'original-en' }), made })).toBe('open')
    expect(localStorage.getItem(LAB_AI_ACTIONS_KEY)).toBe('4')
  })

  it('opens a card this page already made, or the device already holds, without counting it again', () => {
    const made = new Set<string>()
    const key = freeModeAiRowKey('summary', here)
    expect(pressFreeModeAiRow({ key, made })).toBe('open')
    expect(pressFreeModeAiRow({ key, made })).toBe('open')
    expect(pressFreeModeAiRow({ key, made })).toBe('open')
    expect(readLabAiActionCount()).toBe(1)
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('catchup', here), made, held: true })).toBe('open')
    expect(readLabAiActionCount()).toBe(1)
  })

  it('opens the account sheet once the free actions are used, sending and counting nothing', () => {
    localStorage.setItem(LAB_AI_ACTIONS_KEY, String(LAB_FREE_AI_ACTIONS - 1))
    const made = new Set<string>()
    // The tenth action is free; the next row is not.
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', here), made })).toBe('open')
    expect(readLabAiActionCount()).toBe(LAB_FREE_AI_ACTIONS)
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('catchup', here), made })).toBe('account')
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', { ...here, chapterNumber: 4 }), made })).toBe('account')
    expect(readLabAiActionCount()).toBe(LAB_FREE_AI_ACTIONS)
    expect(made.size).toBe(1)
    // The card already made still opens; a card the device holds too.
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', here), made })).toBe('open')
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('summary', { ...here, chapterNumber: 9 }), made, held: true })).toBe('open')
  })

  it('shares the allowance with Explain: actions used on a selection leave fewer for the rows', () => {
    localStorage.setItem(LAB_AI_ACTIONS_KEY, String(LAB_FREE_AI_ACTIONS))
    expect(pressFreeModeAiRow({ key: freeModeAiRowKey('catchup', here), made: new Set() })).toBe('account')
  })
})

describe('free reading mode’s AI rows reach the Worker as a guest', () => {
  /** The network under the free-mode guard, as in the page. */
  function guarded(respond: (path: string, body: Record<string, unknown>) => unknown) {
    const network = vi.fn(async (url: string, init: RequestInit) => new Response(JSON.stringify(respond(String(url), JSON.parse(String(init.body)))), { headers: { 'Content-Type': 'application/json' } }))
    const win = { location: { origin: window.location.origin }, fetch: network as unknown as typeof fetch, navigator: { sendBeacon: () => true } as unknown as Navigator }
    installFreeModeGuard(win)
    vi.stubGlobal('fetch', win.fetch)
    return network
  }
  const sent = (network: ReturnType<typeof guarded>) => (network.mock.calls as unknown as Array<[string, RequestInit]>).map(([url, init]) => ({ url: String(url), init, body: JSON.parse(String(init.body)) as Record<string, unknown> }))

  it('Summarize this chapter: the chapter’s summary from the chapter notes route, with no account attached', async () => {
    const network = guarded(() => ({ beats: [{ title: 'What happens', text: 'Marcus thanks the people who formed him.' }], kind: 'end', chapterNumber: 3, through: null, source: 'cache' }))
    const token = vi.fn(async () => 'a-session-token')
    render(<LabChapterNotesSheet request={{ ...here, kind: CHAPTER_SUMMARY_KIND, bookTitle: 'Meditations' }} title="Summary · Book 3"
      onClose={() => {}} onChat={() => {}} onTalk={() => {}} readToken={token} />)
    await waitFor(() => expect(screen.getByTestId('lab-chapter-notes-beat').textContent).toContain('Marcus thanks the people who formed him.'))
    const calls = sent(network)
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(CHAPTER_NOTES_ROUTE)
    expect(calls[0].init.method).toBe('POST')
    expect(new Headers(calls[0].init.headers).has('Authorization')).toBe(false)
    // The whole chapter, named by book, edition and chapter only: the Worker reads the text itself.
    expect(calls[0].body).toMatchObject({ bookId: 'meditations', editionKey: 'modern-en', chapterNumber: 3, kind: 'end' })
    // (`ai` is the device's own AI length setting, as any guest's card sends it.)
    expect(Object.keys(calls[0].body).filter(key => key !== 'ai').sort()).toEqual(['bookId', 'bookTitle', 'chapterNumber', 'editionKey', 'kind'])
    // Free mode offers no Talk from the card.
    expect(screen.queryByTestId('lab-chapter-notes-talk')).toBeNull()
  })

  it('Catch me up: the recap of the chapters before this one from the catch-up route, never the "so far" recap, with no account attached', async () => {
    const network = guarded((_path, body) => ({ summary: `Recap of ${String(body.unitId)}.`, unitId: body.unitId, chapters: [] }))
    const chapters = [1, 2, 3, 4].map(number => ({ number, title: `Book ${number}`, wordCount: 3_000 }))
    render(<LabCatchUpSheet {...here} bookTitle="Meditations" chapters={chapters} paragraphIndex={2} completed={false}
      readToken={async () => 'a-session-token'} onClose={() => {}} onChat={() => {}} onTalk={() => {}} />)
    await waitFor(() => expect(screen.getAllByTestId('lab-catch-up-entry').every(entry => entry.getAttribute('data-state') === 'ok')).toBe(true))
    const calls = sent(network)
    expect(calls.length).toBeGreaterThan(0)
    for (const call of calls) {
      expect(call.url).toBe(CATCH_UP_ROUTE)
      expect(call.init.method).toBe('POST')
      expect(new Headers(call.init.headers).has('Authorization')).toBe(false)
      expect(call.body).toMatchObject({ bookId: 'meditations', editionKey: 'modern-en', placeChapter: 3 })
    }
    // Only what came before chapter 3.
    expect(screen.getAllByTestId('lab-catch-up-entry').map(entry => entry.querySelector('h3')?.textContent)).toEqual(['Book 1', 'Book 2'])
    expect(document.body.textContent).toContain('Recap of')
    expect(screen.queryByTestId('lab-catch-up-talk')).toBeNull()
  })

  it('in the book’s first chapter Catch me up asks for nothing', async () => {
    const network = guarded(() => ({}))
    render(<LabCatchUpSheet {...here} chapterNumber={1} bookTitle="Meditations" chapters={[1, 2].map(number => ({ number, title: `Book ${number}`, wordCount: 3_000 }))}
      paragraphIndex={0} completed={false} onClose={() => {}} onChat={() => {}} onTalk={() => {}} />)
    expect(screen.getByTestId('lab-catch-up-here')).toBeTruthy()
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(network).not.toHaveBeenCalled()
  })
})
