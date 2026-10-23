// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PdfOriginalGeometry } from './usePdfOriginalServices'
import type { PdfOriginalSelection } from '../sharedReader/pdf/PdfOriginalSurface'
import { parseCompanionRequest } from '../../companion/companionRequest'
import { appendLabChatTurnTo } from '../labChatHistory'
import { userBookId } from './userBookId'

const HEX = 'ab'.repeat(12), OWNER = 'owner-a', FILE = '1'.repeat(32), NEXT = '2'.repeat(32)
const selection: PdfOriginalSelection = { page: 3, text: 'The selected original words', rects: [[3, .1, .2, .3, .04]] }
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status })
const auth = (owner: string) => localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: owner } }))
beforeEach(() => { localStorage.clear(); auth(OWNER) })
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); vi.useRealTimers() })

it('keeps four-coordinate page marks and five-coordinate cards separate, preserving recap turns and tombstones', async () => {
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    if (init?.method === 'GET') return json({ [String(url).includes('/marks/') ? 'marks' : 'cards']: [], rev: 0, fileId: FILE })
    return json({ rev: 1, fileId: FILE })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'test-token', api as typeof fetch)
  expect(service.saveHighlight(selection, 'sage')).toBe(true)
  expect(service.marks[0].rects).toEqual([[.1, .2, .3, .04]])
  expect(service.saveNote(selection, 'A page note')).toBe(true)
  expect(service.saveCard(selection, 'recap', 'This is the summary.', { question: 'Summarize this page.', turns: [
    { role: 'user', content: 'Summarize this page.' }, { role: 'assistant', content: 'This is the summary.' },
  ] })).toBe(true)
  expect(service.cards[0].kind).toBe('recap')
  const id = service.marks[0].id
  const undo = service.removeMark(id)
  expect(service.marks.some(mark => mark.id === id)).toBe(false)
  await service.open()
  const writes = api.mock.calls.filter(([, init]) => init?.method === 'PUT').map(([, init]) => JSON.parse(String(init!.body)))
  expect(writes).toHaveLength(2)
  expect(writes.every(body => body.expectedFileId === FILE && body.rev === 0)).toBe(true)
  expect(writes.find(body => body.cards)?.cards[0]).toMatchObject({ kind: 'ask', page: 3,
    rects: [[3, .1, .2, .3, .04]], turns: [{ role: 'user', content: 'Summarize this page.' }, { role: 'assistant', content: 'This is the summary.' }], data: { action: 'recap' } })
  expect(writes.find(body => body.marks)?.marks).toContainEqual(expect.objectContaining({ id, gone: true }))
  undo?.()
  expect(service.marks.some(mark => mark.id === id)).toBe(true)
  service.dispose()
})

it('merges a revision conflict without losing remote marks and refuses an old generation', async () => {
  let active = FILE, marks: unknown[] = [], rev = 0, conflicts = 0
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: active, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    if (init?.method === 'GET') return json({ marks, rev, fileId: active })
    const body = JSON.parse(String(init?.body)) as { marks: unknown[]; rev: number; expectedFileId: string }
    if (body.expectedFileId !== active) return json({ error: 'generation_conflict', fileId: active }, 409)
    if (!conflicts++) {
      marks = [{ id: 'other123', page: 4, rects: [[.2, .3, .1, .04]], text: 'Other device', color: 'sky', at: 100, u: 100 }]
      rev = 1
      return json({ marks, rev, fileId: active }, 409)
    }
    marks = body.marks; rev++
    return json({ rev, fileId: active })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'test-token', api as typeof fetch)
  expect(service.saveHighlight(selection, 'gold')).toBe(true)
  await service.sync('marks')
  expect(service.marks.map(mark => mark.text)).toEqual(['The selected original words', 'Other device'])
  expect(marks).toHaveLength(2)
  active = NEXT
  expect(service.saveHighlight(selection, 'rose')).toBe(true) // its old-generation local copy stays offline
  const prior = api.mock.calls.filter(([, init]) => init?.method === 'PUT').length
  await service.sync('marks')
  expect(api.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(prior)
  expect(marks).toHaveLength(2)
  service.dispose()
  const replacement = new PdfOriginalGeometry(HEX, OWNER, NEXT, async () => null, api as typeof fetch)
  expect(replacement.marks).toEqual([])
  replacement.dispose()
})

it('does not reveal or mutate a prior owner’s same-hash journals after an account switch', async () => {
  const api = vi.fn(async () => json({ books: [] }))
  const old = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', api as typeof fetch)
  old.saveHighlight(selection, 'gold')
  auth('owner-b')
  expect(old.marks).toEqual([])
  expect(old.saveNote(selection, 'No cross-owner note')).toBe(false)
  expect(old.removeMark('anything')).toBeNull()
  await old.open()
  expect(api).not.toHaveBeenCalled()
  old.dispose()
  const other = new PdfOriginalGeometry(HEX, 'owner-b', FILE, async () => null, api as typeof fetch)
  expect(other.marks).toEqual([])
  other.dispose()
})

it('preserves a new local annotation while an older PUT awaits, then sends both', async () => {
  let release!: () => void
  const barrier = new Promise<void>(resolve => { release = resolve })
  let puts = 0, received: Array<{ marks: Array<{ text?: string }> }> = []
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    if (init?.method === 'GET') return json({ marks: [], rev: 0, fileId: FILE })
    const body = JSON.parse(String(init?.body)) as { marks: Array<{ text?: string }> }
    received.push(body)
    if (++puts === 1) await barrier
    return json({ rev: puts, fileId: FILE })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', api as typeof fetch)
  service.saveHighlight(selection, 'gold')
  const syncing = service.sync('marks')
  await vi.waitFor(() => expect(puts).toBe(1))
  service.saveNote({ ...selection, text: 'Later words' }, 'A second note')
  release()
  await syncing
  expect(service.marks.map(mark => mark.text).sort()).toEqual(['Later words', 'The selected original words'])
  expect(received[received.length - 1]?.marks.map(mark => mark.text).sort()).toEqual(['Later words', 'The selected original words'])
  service.dispose()
})

it('retries a transient failed PUT from its owner journal without requiring another edit', async () => {
  vi.useFakeTimers()
  let puts = 0, server: unknown[] = []
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    if (init?.method === 'GET') return json({ marks: server, rev: 0, fileId: FILE })
    puts++
    if (puts === 1) return json({ error: 'temporary' }, 503)
    server = JSON.parse(String(init?.body)).marks
    return json({ rev: 1, fileId: FILE })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', api as typeof fetch)
  expect(service.saveHighlight(selection, 'gold')).toBe(true)
  await service.sync('marks')
  expect(puts).toBe(1)
  await vi.advanceTimersByTimeAsync(1500)
  expect(puts).toBe(2)
  expect(server).toContainEqual(expect.objectContaining({ text: selection.text }))
  service.dispose()
})

it('fails closed on a malformed canonical record without replacing its bytes', () => {
  const key = `tinct-addbook:pdf-original-cards:${OWNER}:${FILE}:${HEX}`
  const broken = JSON.stringify({ items: [{}], rev: 3, dirty: true })
  localStorage.setItem(key, broken)
  expect(() => new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)).toThrow('unreadable')
  expect(localStorage.getItem(key)).toBe(broken)
})

it('keeps an oversized local card journal untouched instead of accepting a Worker-truncated sync', () => {
  const storageKey = `tinct-addbook:pdf-original-cards:${OWNER}:${FILE}:${HEX}`
  const card = { id: 'original123', kind: 'ask', page: 3, rects: [[3, .1, .2, .3, .04]], text: 'Source',
    turns: [{ role: 'assistant', content: 'A'.repeat(12_001) }], at: 100, u: 100 }
  const raw = JSON.stringify({ items: [card], rev: 0, dirty: true })
  localStorage.setItem(storageKey, raw)
  expect(() => new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)).toThrow('unreadable')
  expect(localStorage.getItem(storageKey)).toBe(raw)
  localStorage.setItem(storageKey, JSON.stringify({ items: [{ ...card, turns: [{ role: 'assistant', content: 'Saved' }], text: 'A'.repeat(2001) }], rev: 0, dirty: true }))
  expect(() => new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)).toThrow('unreadable')
})

it('sends only the selected private page with its citation marker in a valid Worker companion request', async () => {
  const requests: unknown[] = []
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    const body = JSON.parse(String(init?.body)) as { companion: unknown }
    requests.push(body.companion)
    return json({ content: [{ text: 'The page explains this point.' }], stop_reason: 'end_turn' })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', api as typeof fetch)
  expect(await service.ask(selection, 'factcheck')).toContain('page')
  const parsed = parseCompanionRequest(requests[0])
  expect(parsed).toMatchObject({ intent: 'factcheck', pdf: true, context: { pageNumber: 3 } })
  expect(parsed?.context?.paragraphs).toEqual(['<page n="3">\nThe selected original words\n</page>'])
  expect(await service.askQuizCheck?.(selection, { question: 'What?', expected: 'A point.', answer: 'A point.' })).toContain('page')
  expect(parseCompanionRequest(requests[1])).toMatchObject({ intent: 'quiz_check', pdf: true, quizCheck: { answer: 'A point.' } })
  service.dispose()
})

it('hands real visible page text to the existing own-book narration player without changing PDF place', async () => {
  const play = vi.fn(), snapshot = vi.fn(() => ({ available: true }))
  let source: { chapters: () => Array<{ number: number }>; chapter: (page: number) => Promise<{ paragraphs: string[] } | null> } | undefined
  const player = { attachOwn: vi.fn(value => { source = value }), play, snapshot }
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null, vi.fn() as typeof fetch, player as never)
  service.setPdfPageText(1, 'Printed first page.', 2)
  service.setPdfPageText(2, '', 2)
  expect(source?.chapters().map(chapter => chapter.number)).toEqual([1, 2])
  expect(await source?.chapter(1)).toMatchObject({ paragraphs: ['Printed first page.'] })
  service.listen?.(1, 'Printed first page.')
  expect(play).toHaveBeenCalledWith({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
  service.listen?.(2, '')
  expect(play).toHaveBeenCalledTimes(1)
  auth('owner-b')
  service.listen?.(1, 'Printed first page.')
  expect(play).toHaveBeenCalledTimes(1)
  service.dispose()
})

it('saves a page recap without invented geometry and rejects oversize source or answer intact', () => {
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  const page = { page: 3, text: 'Printed page content.', rects: [] }
  expect(service.saveCard(page, 'recap', 'A concise summary.')).toBe(true)
  expect(service.cards[0]).toMatchObject({ page: 3, rects: [], kind: 'recap' })
  expect(service.saveCard(selection, 'explain', 'x'.repeat(12_001))).toBe(false)
  expect(service.saveCard({ ...selection, text: 'x'.repeat(2_001) }, 'explain', 'Short answer')).toBe(false)
  expect(service.cards).toHaveLength(1)
  service.dispose()
})

it('stamps delete and undo after a saved item from a device with a future clock', () => {
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  expect(service.saveHighlight(selection, 'sky')).toBe(true)
  const mark = service.marks[0], future = Date.now() + 86_400_000
  localStorage.setItem(`tinct-addbook:pdf-original-marks:${OWNER}:${FILE}:${HEX}`,
    JSON.stringify({ items: [{ ...mark, u: future }], rev: 0, dirty: true }))
  service.dispose()
  const reopened = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  const undo = reopened.removeMark(mark.id)
  expect(reopened.marks).toHaveLength(0)
  expect(undo?.()).toBe(true)
  expect(reopened.marks[0].u).toBeGreaterThan(future + 1)
  expect(reopened.saveCard(selection, 'explain', 'An answer.')).toBe(true)
  const card = reopened.cards[0]
  reopened.dispose()
  const cardKey = `tinct-addbook:pdf-original-cards:${OWNER}:${FILE}:${HEX}`
  const saved = JSON.parse(localStorage.getItem(cardKey)!)
  saved.items[0].u = future
  localStorage.setItem(cardKey, JSON.stringify(saved))
  const final = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  const restore = final.removeCard(card.id)
  expect(final.cards).toHaveLength(0)
  expect(restore?.()).toBe(true)
  const finalState = JSON.parse(localStorage.getItem(cardKey)!)
  expect(finalState.items[0].u).toBeGreaterThan(future + 1)
  final.dispose()
})

it('shares owner-qualified local Talk history with the private text reader without cloud projection', async () => {
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', vi.fn() as typeof fetch)
  const turn = { id: 'voice-one', role: 'user' as const, content: 'What is on this PDF page?', timestamp: Date.now(),
    bookId: userBookId(HEX), chapterNumber: 3, source: 'voice' as const }
  const conversation = appendLabChatTurnTo([], userBookId(HEX), turn, 3)[0]
  expect(service.chat?.persist([{ ...conversation, id: 'pdf-original-test-conversation' }])).toBe(true)
  expect(service.talkConversations).toMatchObject([{ page: 3, localOnly: true, turns: [{ role: 'user', content: turn.content }] }])
  service.dispose()
  const reopened = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  expect(reopened.talkConversations[0].turns[0].content).toBe(turn.content)
  reopened.dispose()
  auth('owner-b')
  const other = new PdfOriginalGeometry(HEX, 'owner-b', FILE, async () => null)
  expect(other.talkConversations).toEqual([])
  other.dispose()
})

it('keeps hash-only legacy Talk unassigned until this owner explicitly claims it', () => {
  const message = { id: 'legacy-voice', role: 'user' as const, content: 'My older PDF question',
    timestamp: Date.now(), bookId: userBookId(HEX), chapterNumber: 2, source: 'voice' as const }
  const legacy = appendLabChatTurnTo([], userBookId(HEX), message, 2)
  localStorage.setItem(`tinct:chat-history:${userBookId(HEX)}`, JSON.stringify(legacy))
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  expect(service.talkConversations).toEqual([])
  expect(service.recoverableTalkCount).toBe(1)
  expect(service.adoptRecoverableTalk()).toBe(true)
  expect(service.talkConversations).toMatchObject([{ page: null, turns: [{ content: message.content }] }])
  expect(service.recoverableTalkCount).toBe(0)
  service.dispose()
  auth('owner-b')
  const other = new PdfOriginalGeometry(HEX, 'owner-b', FILE, async () => null)
  expect(other.talkConversations).toEqual([])
  expect(other.recoverableTalkCount).toBe(1)
  other.dispose()
})

it('keeps working PDF geometry when the separate legacy Talk archive is unreadable', () => {
  const raw = '{broken private legacy chat'
  const legacyKey = `tinct:chat-history:${userBookId(HEX)}`
  localStorage.setItem(legacyKey, raw)
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => null)
  expect(service.TalkCard).toBeUndefined()
  expect(service.saveHighlight(selection, 'sage')).toBe(true)
  expect(service.marks).toHaveLength(1)
  expect(localStorage.getItem(legacyKey)).toBe(raw)
  service.dispose()
})

it('asks a bounded unit with actual extracted page text and saves a truthful page-only primer', async () => {
  const requests: unknown[] = []
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    requests.push(JSON.parse(String(init?.body)).companion)
    return json({ content: [{ text: 'A grounded orientation.' }], stop_reason: 'end_turn' })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', api as typeof fetch)
  service.setPdfPageText(2, 'Actual second page.', 3)
  service.setPdfPageText(3, 'Actual third page.', 3)
  const source = { unit: { key: 'outline-1', title: 'The author’s chapter', from: 2, to: 3 },
    pages: [{ n: 2, text: 'Actual second page.' }, { n: 3, text: 'Actual third page.' }], atPage: 3 }
  expect(await service.askUnit(source, 'primer')).toBe('A grounded orientation.')
  expect(parseCompanionRequest(requests[0])).toMatchObject({ intent: 'chapter', pdf: true, chapter: { action: { kind: 'primer', unitKey: 'outline-1' } } })
  expect(service.saveUnitCard(source, 'primer', 'A grounded orientation.')).toBe(true)
  expect(service.cards).toMatchObject([{ kind: 'primer', page: 3, rects: [], data: {
    action: 'primer', unit: source.unit, source: { from: 2, to: 3 },
  } }])
  expect(service.saveUnitCard(source, 'primer', 'Changed answer.')).toBe(false)
  const invented = { ...source, pages: [{ n: 2, text: 'Invented source.' }, source.pages[1]] }
  expect(await service.askUnit(invented, 'primer')).toBeNull()
  service.setPdfPageText(2, 'D'.repeat(6001), 3)
  expect(await service.askUnit({ ...source, pages: [{ n: 2, text: 'D'.repeat(6001) }, source.pages[1]] }, 'primer')).toBeNull()
  expect(requests).toHaveLength(1)
  service.dispose()
})

it('keeps a follow-up under the original saved card ID with ordered private turns', async () => {
  const requests: Array<Record<string, unknown>> = []
  const api = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === '/api/user-books') return json({ books: [{ id: FILE, type: 'pdf', sha256: HEX + '0'.repeat(40) }] })
    requests.push(JSON.parse(String(init?.body)))
    return json({ content: [{ text: 'A second grounded answer.' }], stop_reason: 'end_turn' })
  })
  const service = new PdfOriginalGeometry(HEX, OWNER, FILE, async () => 'token', api as typeof fetch)
  service.setPdfPageText(3, 'The actual page containing the selection.', 3)
  const id = service.saveCardWithId(selection, 'ask', 'The first answer.', { question: 'First question?' })
  expect(id).toMatch(/^[0-9a-z]{24}$/)
  expect(await service.askCardFollow(id!, 'What follows?')).toBe('A second grounded answer.')
  expect(parseCompanionRequest(requests[0].companion)).toMatchObject({ intent: 'ask', pdf: true, context: { pageNumber: 3 } })
  expect(requests[0].messages).toEqual([
    { role: 'user', content: 'First question?' }, { role: 'assistant', content: 'The first answer.' }, { role: 'user', content: 'What follows?' },
  ])
  expect(service.appendCardTurn(id!, 'What follows?', 'A second grounded answer.')).toBe(true)
  expect(service.cards).toMatchObject([{ id, turns: [
    { role: 'user', content: 'First question?' }, { role: 'assistant', content: 'The first answer.' },
    { role: 'user', content: 'What follows?' }, { role: 'assistant', content: 'A second grounded answer.' },
  ] }])
  expect(service.appendCardTurn(id!, 'Too long?', 'x'.repeat(12_001))).toBe(false)
  expect(service.cards[0].turns).toHaveLength(4)
  service.dispose()
})
