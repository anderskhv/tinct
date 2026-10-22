import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchOwnChapterNotes, ownChapterNotesBody, ownChapterPages, primerBeats, recapBeats, type OwnChapterNotesSource } from './ownChapterNotes'
import { parsePrimer } from '../../companion/primerParse'
import { parseCompanionRequest } from '../../companion/companionRequest'

const HEX = 'aa11bb22cc33dd44ee55ff66'
const source: OwnChapterNotesSource = {
  bookTitle: 'Lamplit Conjectures', bookAuthor: 'Gale Editor', chapterNumber: 3, chapterTitle: '2 Controversial Candles',
  paragraphs: ['The lamp explains itself while it explains everything else.', 'Yet the shade disagrees, and the room is lit where they meet.'],
}
const PRIMER = {
  kind: 'narrative', gist: 'Two accounts of the evening meet in one room.',
  sections: [{ title: 'Where we are', items: ['The lamp and the shade disagree.'] }, { title: 'Threads to watch', items: [{ text: 'Where the light falls', cite: '{p. 1}' }] }],
  map: [{ title: 'The lamp', pages: 'p. 1' }, { title: 'The shade', pages: 'p. 1' }, { title: 'The room', pages: 'p. 1' }],
}
const answer = (text: string) => new Response(JSON.stringify({ content: [{ type: 'text', text }], stop_reason: 'end_turn' }), { status: 200, headers: { 'Content-Type': 'application/json' } })

afterEach(() => vi.restoreAllMocks())

describe("an own book's Primer and Recap, made from this device's text (One Tinct, 22 Oct 2026)", () => {
  it('sends the chapter as an own EPUB’s pages, with no book id or edition: the Worker reads it as a primer', () => {
    const body = ownChapterNotesBody('primer', source)
    const text = JSON.stringify(body)
    expect(text).not.toContain('userbook')
    expect(text).not.toContain('bookId')
    expect(text).not.toContain('editionKey')
    expect(body).toMatchObject({ stream: false, companion: { intent: 'chapter', context: { kind: 'epub', bookTitle: 'Lamplit Conjectures', chapterLabel: '2 Controversial Candles' }, chapter: { action: { kind: 'primer', unitKey: 'chapter-3' } } } })
    // The Worker's own parser accepts it as Before you start on an own EPUB.
    expect(parseCompanionRequest(body.companion)).toMatchObject({ intent: 'chapter', epub: true })
  })

  it('asks the margin reader’s Recap of the chapter as an ask, with the same context', () => {
    const body = ownChapterNotesBody('end', source) as { messages: Array<{ content: string }>; companion: { intent: string } }
    expect(body.companion.intent).toBe('ask')
    expect(body.messages[0].content).toContain('They have just finished the chapter "2 Controversial Candles"')
    expect(JSON.stringify(body)).not.toContain('userbook')
    expect(parseCompanionRequest(body.companion)).toMatchObject({ intent: 'ask' })
  })

  it('keeps paragraphs whole on pages within the Worker’s bounds', () => {
    const pages = ownChapterPages(['a'.repeat(12_000), 'b'.repeat(12_000), 'c'.repeat(40_000)])
    expect(pages.map(p => p.text.length)).toEqual([12_000, 12_000, 19_000, 19_000, 2_000])
    expect(pages.map(p => p.n)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows a primer and a recap as the card’s titled beats', () => {
    expect(primerBeats(parsePrimer(JSON.stringify(PRIMER))!)).toEqual([
      { title: 'In brief', text: 'Two accounts of the evening meet in one room.' },
      { title: 'Where we are', text: 'The lamp and the shade disagree.' },
      { title: 'Threads to watch', text: 'Where the light falls' },
    ])
    expect(recapBeats('**The lamp** explains.\n\nWhat the shade sets up next.')).toEqual([
      { title: 'Main points', text: 'The lamp explains.' },
      { title: 'What it sets up', text: 'What the shade sets up next.' },
    ])
    expect(recapBeats('  ')).toBeNull()
  })

  it('asks the account’s companion signed in, the guest one signed out, and never names the book', async () => {
    const calls: Array<[string, RequestInit]> = []
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => { calls.push([url, init]); return answer(JSON.stringify(PRIMER)) })
    const signedIn = await fetchOwnChapterNotes('primer', source, { readToken: async () => 'token', fetchImpl })
    expect(signedIn).toMatchObject({ ok: true, beats: [{ title: 'In brief' }, { title: 'Where we are' }, { title: 'Threads to watch' }] })
    expect(calls[0][0]).toMatch(/\/api\/chat$/)
    expect((calls[0][1].headers as Record<string, string>).Authorization).toBe('Bearer token')
    const recap = await fetchOwnChapterNotes('end', source, { readToken: async () => null, fetchImpl: vi.fn(async (url: string, init: RequestInit) => { calls.push([url, init]); return answer('It explains.\n\nIt sets up the shade.') }) })
    expect(recap).toMatchObject({ ok: true, beats: [{ title: 'Main points', text: 'It explains.' }, { title: 'What it sets up' }] })
    expect(calls[1][0]).toMatch(/\/api\/lab-chat$/)
    for (const [url, init] of calls) {
      expect(url).not.toContain('chapter-notes')
      expect(String(init.body)).not.toContain(HEX)
    }
  })

  it('says it failed, without throwing, when the companion refuses or answers no primer', async () => {
    expect(await fetchOwnChapterNotes('primer', source, { fetchImpl: async () => new Response('{}', { status: 500 }) })).toMatchObject({ ok: false, status: 500 })
    expect(await fetchOwnChapterNotes('primer', source, { fetchImpl: async () => answer('not a primer') })).toMatchObject({ ok: false })
    expect(await fetchOwnChapterNotes('primer', source, { fetchImpl: async () => { throw new Error('offline') } })).toMatchObject({ ok: false, status: 0 })
  })
})
