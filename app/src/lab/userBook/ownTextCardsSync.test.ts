// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adoptUnassignedOwnTextCards, OwnTextCardsSync, ownTextCardsBelongTo, readOwnedTextChat, unassignedOwnTextCardCount } from './ownTextCardsSync'
import { userBookId } from './userBookId'
import type { UserBookEdition } from './userEdition'
import type { SharedReaderCard } from '../sharedReader/sharedReaderCards'
import type { ChatConversation } from '../../types'
import { appendLabChatTurn } from '../labChatHistory'

const HEX = 'ab'.repeat(12), A = 'owner-a', B = 'owner-b'
const edition: UserBookEdition = { format: 'tinct-user-edition-v1', converter: 7, title: 'Own', author: '', language: 'en', droppedImages: 0,
  chapters: [{ number: 1, title: 'Opening', paragraphs: ['These exact source words appear here.'] }] }
const card = (id = 'card123'): SharedReaderCard => ({ source: { kind: 'own-text', bookId: userBookId(HEX), ownHex: HEX, converter: 7, editionKey: 'own-en' },
  id, kind: 'explain', chapterNumber: 1, anchor: { editionKey: 'own-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3 },
  text: 'These exact source', turns: [{ role: 'assistant', content: 'It explains these words.' }], at: 1000, u: 1001 })
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status })
const auth = (owner: string) => localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: owner } }))
beforeEach(() => { localStorage.clear(); auth(A) })
afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })

describe('owner-scoped private source-word cards and Talk', () => {
  it('calls a Window-brand-checked fetch with the global receiver for GET and PUT', async () => {
    const fileId = 'f'.repeat(32), methods: string[] = []
    const strict = async function (this: typeof globalThis, _url: RequestInfo | URL, init?: RequestInit) {
      if (this !== globalThis) throw new TypeError('Illegal invocation')
      methods.push(init?.method ?? 'GET')
      return init?.method === 'PUT' ? json({ rev: 1, fileId }) : json({ cards: [], rev: 0, fileId })
    }
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', strict as typeof fetch, fileId)
    await controller.open()
    expect(controller.saveCard(card())).toHaveLength(1)
    await controller.sync()
    expect(methods).toContain('GET')
    expect(methods).toContain('PUT')
    controller.dispose()
  })
  it('saves complete answer with exact source anchor, revises and tombstones through account route', async () => {
    const calls: Array<{ url: string; body?: { cards: unknown[]; rev: number } }> = []
    let rev = 0
    const fetchImpl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined
      calls.push({ url: String(url), body })
      return init?.method === 'PUT' ? json({ rev: ++rev }) : json({ cards: [], rev })
    })
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch)
    await controller.open()
    const saved = controller.saveCard(card())
    expect(saved?.[0].messages.some(message => message.content === 'It explains these words.')).toBe(true)
    await controller.sync()
    expect(calls[calls.length - 1]).toMatchObject({ url: `/api/user-books/cards/${HEX}`, body: { cards: [expect.objectContaining({ v: 'text-v1', anchor: expect.objectContaining({ converter: 7, chapterNumber: 1 }) })] } })
    const undo = controller.deleteCard(saved![0].id)
    expect(undo).toBeTypeOf('function')
    expect(controller.read()).toEqual([])
    await controller.sync()
    expect(calls[calls.length - 1]?.body?.cards).toContainEqual(expect.objectContaining({ id: 'card123', gone: true }))
    undo?.()
    expect(controller.read()).toHaveLength(1)
    controller.dispose()
  })

  it('does not paint or upload A chat under B even for identical file bytes', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => init?.method === 'PUT' ? json({ rev: 1 }) : json({ cards: [], rev: 0 }))
    const a = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch)
    a.saveCard(card())
    const savedA = a.read()
    a.dispose()
    auth(B)
    expect(readOwnedTextChat(HEX, B)).toEqual([])
    const b = new OwnTextCardsSync(HEX, B, edition, async () => 'token', fetchImpl as typeof fetch)
    await b.open()
    expect(b.read()).toEqual([])
    expect(fetchImpl.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0)
    b.dispose()
    auth(A)
    const reopened = new OwnTextCardsSync(HEX, A, edition, async () => null, fetchImpl as typeof fetch)
    expect(reopened.read()).toEqual(savedA)
    reopened.dispose()
  })

  it('preserves unknown old history without attributing it to a newly signed-in account', async () => {
    const old = { id: 'conv-old', bookId: userBookId(HEX), chapterNumber: 1, startTimestamp: 1, endTimestamp: 2, preview: 'Why?', messages: [
      { id: 'msg-1', bookId: userBookId(HEX), chapterNumber: 1, role: 'user', content: 'Why?', timestamp: 1 },
      { id: 'msg-2', bookId: userBookId(HEX), chapterNumber: 1, role: 'assistant', content: 'Because.', timestamp: 2 }] }
    localStorage.setItem(`tinct:chat-history:${userBookId(HEX)}`, JSON.stringify([old]))
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => json({ cards: [], rev: 0 }))
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch)
    await controller.open()
    expect(controller.read()).toEqual([])
    expect(unassignedOwnTextCardCount(HEX, A)).toBe(1)
    expect(fetchImpl.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0)
    controller.dispose()
  })

  it('fails closed if the projected chat write fails after the owner backup changed', () => {
    const a = new OwnTextCardsSync(HEX, A, edition, async () => null)
    const original = Storage.prototype.setItem
    const quota = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === `tinct-addbook:text-cards-canonical:${A}:${HEX}`) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    expect(a.saveCard(card())).toBeNull()
    quota.mockRestore()
    expect(ownTextCardsBelongTo(HEX, A)).toBe(true)
    a.dispose()
    const again = new OwnTextCardsSync(HEX, A, edition, async () => null)
    expect(again.read()).toHaveLength(0)
    again.dispose()
  })

  it('never offers B cards to A recovery after a failed second projection write', () => {
    const b = new OwnTextCardsSync(HEX, A, edition, async () => null)
    b.saveCard(card())
    const before = b.read()
    const original = Storage.prototype.setItem
    const quota = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === `tinct-addbook:text-cards-canonical:${A}:${HEX}`) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    expect(b.saveCard(card('card456'))).toBeNull()
    quota.mockRestore()
    expect(b.read()).toEqual(before)
    b.dispose()
    auth(B)
    const a = new OwnTextCardsSync(HEX, B, edition, async () => null)
    expect(a.read()).toEqual([])
    expect(unassignedOwnTextCardCount(HEX, B)).toBe(0)
    expect(adoptUnassignedOwnTextCards(HEX, B)).toBe(false)
    a.dispose()
    auth(A)
    const restored = new OwnTextCardsSync(HEX, A, edition, async () => null)
    expect(restored.read()).toEqual(before)
    restored.dispose()
  })

  it('a failed delete does not journal or upload a tombstone', async () => {
    const calls: Array<{ method: string; body?: { cards: Array<{ gone?: true }> } }> = []
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ method: init?.method ?? 'GET', ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}) })
      return init?.method === 'PUT' ? json({ rev: 1 }) : json({ cards: [], rev: 0 })
    })
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch)
    const saved = controller.saveCard(card())!
    await controller.sync()
    calls.length = 0
    const original = Storage.prototype.setItem
    const quota = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === `tinct-addbook:text-cards-canonical:${A}:${HEX}`) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    expect(controller.deleteCard(saved[0].id)).toBeNull()
    quota.mockRestore()
    expect(controller.read()).toEqual(saved)
    const canonical = JSON.parse(localStorage.getItem(`tinct-addbook:text-cards-canonical:${A}:${HEX}`)!)
    expect(canonical.items).not.toContainEqual(expect.objectContaining({ id: card().id, gone: true }))
    await controller.sync()
    expect(calls.filter(call => call.method === 'PUT').flatMap(call => call.body?.cards ?? [])).not.toContainEqual(expect.objectContaining({ gone: true }))
    controller.dispose()
  })

  it('clears a temporary unsupported-card block once the card is repaired', async () => {
    const sent: unknown[][] = []
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') { sent.push(JSON.parse(String(init.body)).cards); return json({ rev: sent.length }) }
      return json({ cards: [], rev: 0 })
    })
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch)
    const valid = controller.saveCard(card())!
    const unsupported = { ...valid[0], id: 'unsupported', card: { ...valid[0].card!, anchor: { ...valid[0].card!.anchor!, editionKey: 'other' } } }
    expect(controller.persist([...valid, unsupported])).toBe(true)
    await controller.sync()
    expect(sent).toHaveLength(0)
    expect(controller.persist(valid)).toBe(true)
    await controller.sync()
    expect(sent).toHaveLength(1)
    controller.dispose()
  })

  it('does not let a stale mounted controller replace an explicit account adoption', () => {
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => null)
    const old = { id: 'old-conversation', bookId: userBookId(HEX), chapterNumber: 1, startTimestamp: 1, endTimestamp: 1, preview: 'Old', messages: [
      { id: 'old-message', bookId: userBookId(HEX), chapterNumber: 1, role: 'user', content: 'Old', timestamp: 1 }] }
    localStorage.setItem(`tinct-addbook:text-cards-unassigned:${HEX}`, JSON.stringify([old]))
    expect(adoptUnassignedOwnTextCards(HEX, A)).toBe(true)
    expect(controller.saveCard(card())).toBeNull()
    expect(readOwnedTextChat(HEX, A)).toContainEqual(expect.objectContaining({ id: old.id }))
    controller.dispose()
  })

  it('refreshes the mounted owner chat immediately after explicit adoption', () => {
    const fileId = 'a'.repeat(32)
    const controller = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    const old = { id: 'old-conversation', bookId: userBookId(HEX), chapterNumber: 1, startTimestamp: 1, endTimestamp: 1, preview: 'Old', messages: [
      { id: 'old-message', bookId: userBookId(HEX), chapterNumber: 1, role: 'user', content: 'Old', timestamp: 1 }] }
    localStorage.setItem(`tinct-addbook:text-cards-unassigned:${HEX}`, JSON.stringify([old]))
    let received = 0
    controller.subscribe(rows => { received = rows.length })
    expect(controller.adoptUnassigned()).toBe(true)
    expect(controller.isTrusted()).toBe(true)
    // Accountless history remains available to Notebook/export after explicit
    // adoption, but an unknown source must not be labelled an Original page.
    expect(controller.readAll()).toContainEqual(expect.objectContaining({ id: old.id }))
    expect(controller.read()).toEqual([])
    expect(received).toBe(0)
    controller.dispose()
  })

  it('keeps a real pre-release Talk transcript in the explicit recovery archive', () => {
    const old = appendLabChatTurn(userBookId(HEX), { id: 'old-voice-turn', role: 'user', bookId: userBookId(HEX),
      content: 'What did this page mean?', source: 'voice', timestamp: 100 }, 1)
    expect(old).toHaveLength(1)
    const raw = localStorage.getItem(`tinct:chat-history:${userBookId(HEX)}`)
    const fileId = 'd'.repeat(32)
    const controller = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    expect(unassignedOwnTextCardCount(HEX, A, fileId)).toBe(1)
    expect(controller.adoptUnassigned()).toBe(true)
    expect(controller.readAll().map(row => row.messages[0].content)).toContain('What did this page mean?')
    expect(controller.read()).toEqual([]) // unknown legacy source is never labelled a PDF page
    expect(localStorage.getItem(`tinct:chat-history:${userBookId(HEX)}`)).toBe(raw)
    controller.dispose()
  })

  it('isolates a same-owner reupload by file generation and never sends stale cards to its route', async () => {
    const firstId = '1'.repeat(32), secondId = '2'.repeat(32)
    const calls: Array<{ method: string; body?: { expectedFileId?: string } }> = []
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ method: init?.method ?? 'GET', ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}) })
      return init?.method === 'PUT' ? json({ rev: 1, fileId: secondId }) : json({ cards: [], rev: 0, fileId: secondId })
    })
    const old = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch, firstId)
    old.saveCard(card())
    await old.open()
    expect(old.read()).toEqual([])
    expect(calls.filter(call => call.method === 'PUT')).toHaveLength(0)
    old.dispose()
    const next = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch, secondId)
    await next.open()
    expect(next.read()).toEqual([])
    expect(localStorage.getItem(`tinct-addbook:text-cards-canonical:${A}:${HEX}:${firstId}`)).toContain('card123')
    next.saveCard(card('card456'))
    await next.sync()
    expect(calls.filter(call => call.method === 'PUT')[0].body?.expectedFileId).toBe(secondId)
    next.dispose()
  })
  it('fences a mounted card generation on confirmed 404 while preserving its canonical bytes', async () => {
    const fileId = 'd'.repeat(32), fetchImpl = vi.fn(async () => json({ error: 'not_found' }, 404))
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    expect(controller.saveCard(card())).toHaveLength(1)
    const key = `tinct-addbook:text-cards-canonical:${A}:${HEX}:${fileId}`, raw = localStorage.getItem(key)
    await controller.open()
    expect(controller.isTrusted()).toBe(false)
    expect(controller.read()).toEqual([])
    expect(controller.saveCard(card('next-card'))).toBeNull()
    await controller.sync()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(key)).toBe(raw)
    controller.dispose()
  })

  it('keeps an edit made during an in-flight PUT dirty and sends it in the next revision', async () => {
    const fileId = 'e'.repeat(32), requests: Array<{ cards: Array<{ id: string }>; expectedFileId: string }> = []
    let release!: () => void
    const firstAck = new Promise<void>(resolve => { release = resolve })
    let sent!: () => void
    const firstSent = new Promise<void>(resolve => { sent = resolve })
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method !== 'PUT') return json({ cards: [], rev: 0, fileId })
      requests.push(JSON.parse(String(init.body)))
      if (requests.length === 1) { sent(); await firstAck }
      return json({ rev: requests.length, fileId })
    })
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    controller.saveCard(card('card-one'))
    const pending = controller.open()
    await firstSent
    controller.saveCard(card('card-two'))
    release()
    await pending
    expect(requests).toHaveLength(2)
    expect(requests[0].cards.map(item => item.id)).toEqual(['card-one'])
    expect(requests[1].cards.map(item => item.id)).toEqual(['card-one', 'card-two'])
    expect(requests[1].expectedFileId).toBe(fileId)
    controller.dispose()
  })

  it('retries a dirty card after a delayed failed PUT consumed the mutation timer', async () => {
    const fileId = 'f'.repeat(32), bodies: Array<{ cards: Array<{ id: string }> }> = []
    let release!: () => void, sent!: () => void
    const response = new Promise<void>(resolve => { release = resolve })
    const firstSent = new Promise<void>(resolve => { sent = resolve })
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method !== 'PUT') return json({ cards: [], rev: 0, fileId })
      bodies.push(JSON.parse(String(init.body)))
      if (bodies.length === 1) { sent(); await response; return json({ error: 'busy' }, 503) }
      return json({ rev: 1, fileId })
    })
    const controller = new OwnTextCardsSync(HEX, A, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    controller.saveCard(card('card-one'))
    const pending = controller.open()
    await firstSent
    controller.saveCard(card('card-two'))
    await new Promise(resolve => setTimeout(resolve, 1650))
    release()
    await pending
    await new Promise(resolve => setTimeout(resolve, 1650))
    expect(bodies[bodies.length - 1].cards.map(item => item.id)).toEqual(['card-one', 'card-two'])
    controller.dispose()
  })

  it('preserves malformed canonical bytes and refuses to read, replace, or upload them', () => {
    const fileId = 'a'.repeat(32), key = `tinct-addbook:text-cards-canonical:${A}:${HEX}:${fileId}`
    for (const bad of [
      { conversations: [], items: [null], rev: 0, dirty: true },
      { conversations: [{ id: 'lost-turn', bookId: userBookId(HEX), messages: [{ id: 'bad', role: 'other', content: 'secret' }] }], items: [], rev: 0, dirty: false },
    ]) {
      const raw = JSON.stringify(bad)
      localStorage.setItem(key, raw)
      expect(() => new OwnTextCardsSync(HEX, A, edition, async () => 'token', vi.fn() as typeof fetch, fileId)).toThrow('canonical unreadable')
      expect(localStorage.getItem(key)).toBe(raw)
    }
  })

  it('rejects malformed Talk writes and explicit adoption before altering the canonical bytes', () => {
    const fileId = 'a'.repeat(32), key = `tinct-addbook:text-cards-canonical:${A}:${HEX}:${fileId}`
    const controller = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    const before = localStorage.getItem(key)
    const invalid: ChatConversation = { id: 'bad', bookId: userBookId(HEX), chapterNumber: 1, startTimestamp: 1, endTimestamp: 1,
      preview: 'Invalid', messages: [{ id: 'bad-message', role: 'assistant', bookId: userBookId(HEX), content: 'x'.repeat(50_000), timestamp: 1 }] }
    expect(controller.persist([invalid])).toBe(false)
    expect(localStorage.getItem(key)).toBe(before)
    localStorage.setItem(`tinct-addbook:text-cards-unassigned:${HEX}`, JSON.stringify([invalid]))
    expect(adoptUnassignedOwnTextCards(HEX, A, fileId)).toBe(false)
    expect(localStorage.getItem(key)).toBe(before)
    controller.dispose()
  })

  it('keeps PDF Original page Talk separate from Tinct text chat in one owner record', () => {
    const fileId = 'b'.repeat(32), pdf = { ...edition, source: 'pdf' as const }
    const original = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    const pageTalk: ChatConversation = { id: 'pdf-original-talk-1', bookId: userBookId(HEX), chapterNumber: 1, startTimestamp: 10, endTimestamp: 10,
      preview: 'Original page', messages: [{ id: 'page-msg', bookId: userBookId(HEX), chapterNumber: 1, role: 'user', content: 'Original page', timestamp: 10 }] }
    expect(original.persist([pageTalk])).toBe(true)
    expect(original.read()).toHaveLength(1)
    original.dispose()
    const text = new OwnTextCardsSync(HEX, A, pdf, async () => null, undefined, fileId)
    expect(text.read()).toEqual([])
    expect(text.readAll()).toContainEqual(pageTalk)
    expect(text.saveCard(card('text-card'))).toHaveLength(1)
    text.dispose()
    const reopened = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    expect(reopened.read()).toContainEqual(pageTalk)
    expect(reopened.readAll().some(row => row.card?.id === 'text-card')).toBe(true)
    reopened.dispose()
  })

  it('refuses a Talk turn that would trim the other PDF mode at the shared message cap', () => {
    const fileId = 'c'.repeat(32), pdf = { ...edition, source: 'pdf' as const }
    const original = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    const pageTalk = { id: 'pdf-original-talk-1', bookId: userBookId(HEX), chapterNumber: 1,
      startTimestamp: 1, endTimestamp: 599, preview: 'Page Talk', messages: Array.from({ length: 599 }, (_, i) => ({
        id: `page-${i}`, bookId: userBookId(HEX), chapterNumber: 1, role: 'user' as const,
        content: `Page ${i}`, timestamp: i + 1 })) }
    expect(original.persist([pageTalk])).toBe(true)
    const text = new OwnTextCardsSync(HEX, A, pdf, async () => null, undefined, fileId)
    const textTalk = { id: 'text-talk', bookId: userBookId(HEX), chapterNumber: 1,
      startTimestamp: 600, endTimestamp: 600, preview: 'Text', messages: [{ id: 'text-1', bookId: userBookId(HEX),
        chapterNumber: 1, role: 'user' as const, content: 'Text', timestamp: 600 }] }
    expect(text.persist([textTalk])).toBe(true)
    const before = text.readAll()
    const more = { ...textTalk, endTimestamp: 601, messages: [...textTalk.messages,
      { ...textTalk.messages[0], id: 'text-2', content: 'More', timestamp: 601 }] }
    expect(text.persist([more])).toBe(false)
    expect(text.readAll()).toEqual(before)
    text.dispose()
    original.dispose()
    const reopened = new OwnTextCardsSync(HEX, A, null, async () => null, undefined, fileId)
    expect(reopened.read()[0].messages).toHaveLength(599)
    reopened.dispose()
  })
})
