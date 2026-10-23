// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from '../labHighlights'
import { adoptUnassignedOwnTextMarks, guardOwnTextMarks, mergeTextItems, OwnTextMarksSync, ownTextMarksBelongTo, ownTextMarksCanonical, readOwnedTextMarks, releaseOwnTextMarksGuard, textMarkOf, unassignedOwnTextMarkCount, type TextItem } from './ownTextMarksSync'
import { userBookId } from './userBookId'
import type { UserBookEdition } from './userEdition'

const HEX = 'ab'.repeat(12)
const OWNER = 'owner-a'
const edition: UserBookEdition = { format: 'tinct-user-edition-v1', converter: 7, title: 'Own', author: '', language: 'en', droppedImages: 0,
  chapters: [{ number: 1, title: 'Opening', paragraphs: ['These words are the exact source passage.'] }] }
const mark = (id = 'hl-1000-abcdef', updatedAt = 1000): LabHighlight => ({ id, bookId: userBookId(HEX), editionKey: 'own-en', chapterNumber: 1,
  paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2, text: 'These words', color: 'gold', updatedAt })
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const trust = () => localStorage.setItem(`tinct-addbook:text-marks-local:${OWNER}:${HEX}`, JSON.stringify(readLabHighlights().filter(mark => mark.bookId === userBookId(HEX))))
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: OWNER } }))
  localStorage.setItem(`tinct-addbook:text-marks-owner:${HEX}`, OWNER)
  trust()
})
afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })

describe('owned EPUB text marks', () => {
  it('calls a Window-brand-checked fetch with the global receiver for GET and PUT', async () => {
    const fileId = 'f'.repeat(32), methods: string[] = []
    const strict = async function (this: typeof globalThis, _url: RequestInfo | URL, init?: RequestInit) {
      if (this !== globalThis) throw new TypeError('Illegal invocation')
      methods.push(init?.method ?? 'GET')
      return init?.method === 'PUT' ? json({ rev: 1, fileId }) : json({ marks: [], rev: 0, fileId })
    }
    const controller = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'token', strict as typeof fetch, fileId)
    expect(controller.changed([mark()])).toBe(true)
    await controller.open()
    await controller.sync()
    expect(methods).toContain('GET')
    expect(methods).toContain('PUT')
    controller.dispose()
  })
  it('hides hash-only marks when the owner file generation is missing', () => {
    writeLabHighlights([mark()]); trust()
    guardOwnTextMarks(HEX)
    expect(ownTextMarksCanonical(HEX)).toBe(true)
    expect(ownTextMarksBelongTo(HEX, OWNER)).toBe(false)
    expect(readOwnedTextMarks(HEX, OWNER)).toEqual([])
    releaseOwnTextMarksGuard(HEX)
  })
  it('keeps generation-bound marks in one owner record without touching hash-only global marks', async () => {
    const fileId = 'a'.repeat(32), nextId = 'b'.repeat(32), mine = mark(), catalogue = { ...mark('hl-1300-catalogue'), bookId: 'frankenstein' }
    writeLabHighlights([catalogue])
    const calls: Array<{ method: string; body?: { expectedFileId?: string; marks: TextItem[] } }> = []
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ method: init?.method ?? 'GET', ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}) })
      return init?.method === 'PUT' ? json({ rev: 1, fileId }) : json({ rev: 0, marks: [], fileId })
    })
    const first = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    expect(first.importMarks([mine])).toBe(true)
    await first.open()
    expect(first.read()).toContainEqual(mine)
    expect(readLabHighlights()).toEqual([catalogue])
    expect(calls.find(call => call.method === 'PUT')?.body?.expectedFileId).toBe(fileId)
    first.dispose()
    const another = new OwnTextMarksSync(HEX, OWNER, edition, async () => null, fetchImpl as typeof fetch, nextId)
    expect(another.read()).toEqual([])
    expect(localStorage.getItem(`tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`)).toContain(mine.id)
    another.dispose()
  })
  it('fences a mounted marks generation after a confirmed account 404 without erasing its raw record', async () => {
    const fileId = 'd'.repeat(32), fetchImpl = vi.fn(async () => json({ error: 'not_found' }, 404))
    const sync = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    expect(sync.changed([mark()])).toBe(true)
    const raw = localStorage.getItem(`tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`)
    await sync.open()
    expect(sync.isTrusted()).toBe(false)
    expect(readOwnedTextMarks(HEX, OWNER)).toEqual([])
    expect(sync.changed([mark('hl-2000-another')])).toBe(false)
    await sync.sync()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(`tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`)).toBe(raw)
    sync.dispose()
  })

  it('does not journal a deletion if its single canonical storage write fails', async () => {
    const fileId = 'c'.repeat(32), mine = mark()
    const controller = new OwnTextMarksSync(HEX, OWNER, edition, async () => null, undefined, fileId)
    expect(controller.importMarks([mine])).toBe(true)
    const original = Storage.prototype.setItem
    const quota = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === `tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`) throw new DOMException('Quota', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    controller.changed([])
    quota.mockRestore()
    expect(controller.read()).toEqual([mine])
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`)!).items).not.toContainEqual(expect.objectContaining({ gone: true }))
    controller.dispose()
  })

  it('restores above a future-dated tombstone rather than reporting a false Undo', () => {
    const fileId = 'd'.repeat(32), future = Date.now() + 100_000, mine = mark('hl-1000-future', future)
    const controller = new OwnTextMarksSync(HEX, OWNER, edition, async () => null, undefined, fileId)
    expect(controller.importMarks([mine])).toBe(true)
    expect(controller.changed([])).toBe(true)
    const key = `tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`
    const deleted = JSON.parse(localStorage.getItem(key)!)
    const tombstone = deleted.items.find((item: { id: string }) => item.id === mine.id)
    expect(tombstone).toMatchObject({ gone: true })
    expect(controller.importMarks([{ ...mine, updatedAt: Date.now() + 1 }])).toBe(true)
    const live = JSON.parse(localStorage.getItem(key)!).items.find((item: { id: string }) => item.id === mine.id)
    expect(live.gone).toBeUndefined()
    expect(live.u).toBeGreaterThan(tombstone.u)
    controller.dispose()
  })

  it('replaces only a verified same-ID original page mark; a newer changed note stays unresolved', () => {
    const fileId = 'd'.repeat(32), mine = mark('hl-1000-page', 1000)
    const controller = new OwnTextMarksSync(HEX, OWNER, edition, async () => null, undefined, fileId)
    const page = { v: 'epub-page-v1' as const, id: mine.id, page: 1, text: mine.text!, color: mine.color, at: 1000 }
    expect(controller.importPageMarks([page])).toBe(true)
    expect(controller.importMarks([mine])).toBe(true)
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`)!).items).toContainEqual(expect.objectContaining({ id: mine.id, v: 'text-v1' }))
    controller.dispose()
    const changed = new OwnTextMarksSync(HEX, OWNER, edition, async () => null, undefined, 'e'.repeat(32))
    expect(changed.importPageMarks([{ ...page, note: 'Edited later', u: 2000 }])).toBe(true)
    expect(changed.importMarks([mine])).toBe(false)
    expect(changed.pageMarks()).toContainEqual(expect.objectContaining({ id: mine.id, note: 'Edited later' }))
    changed.dispose()
  })

  it('retains a deletion made while PUT is in flight and sends its tombstone at the next revision', async () => {
    const fileId = 'e'.repeat(32), mine = mark(), requests: Array<{ marks: TextItem[]; expectedFileId: string }> = []
    let release!: () => void, sent!: () => void
    const firstAck = new Promise<void>(resolve => { release = resolve })
    const firstSent = new Promise<void>(resolve => { sent = resolve })
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method !== 'PUT') return json({ marks: [], rev: 0, fileId })
      requests.push(JSON.parse(String(init.body)))
      if (requests.length === 1) { sent(); await firstAck }
      return json({ rev: requests.length, fileId })
    })
    const controller = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'token', fetchImpl as typeof fetch, fileId)
    controller.importMarks([mine])
    const pending = controller.open()
    await firstSent
    expect(controller.changed([])).toBe(true)
    release()
    await pending
    expect(requests).toHaveLength(2)
    expect(requests[0].marks).toContainEqual(expect.objectContaining({ id: mine.id, v: 'text-v1' }))
    expect(requests[1].marks).toContainEqual(expect.objectContaining({ id: mine.id, gone: true }))
    expect(requests[1].expectedFileId).toBe(fileId)
    controller.dispose()
  })

  it('fails closed and preserves malformed owner canonical bytes intact', () => {
    const fileId = 'a'.repeat(32), key = `tinct-addbook:text-marks-canonical:${OWNER}:${HEX}:${fileId}`
    for (const bad of [{ marks: [{ ...mark(), color: 'invalid' }], items: [], rev: 0, dirty: false },
      { marks: [], items: [null], rev: 0, dirty: true }]) {
      const raw = JSON.stringify(bad)
      localStorage.setItem(key, raw)
      expect(() => new OwnTextMarksSync(HEX, OWNER, edition, async () => 'token', vi.fn() as typeof fetch, fileId)).toThrow('canonical unreadable')
      expect(localStorage.getItem(key)).toBe(raw)
    }
  })
  it('keeps exact chapter/range/group anchors and refuses oversized records rather than truncating them', () => {
    const grouped = { ...mark(), groupId: 'hg-1234', groupText: 'These words', note: 'A note' }
    expect(textMarkOf(grouped, HEX, edition)).toMatchObject({ v: 'text-v1', id: grouped.id, groupId: 'hg-1234',
      anchor: { kind: 'range', editionKey: 'own-en', converter: 7, chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 2 } })
    expect(textMarkOf({ ...grouped, kind: 'chapter' }, HEX, edition)?.anchor).toEqual({ kind: 'chapter', editionKey: 'own-en', converter: 7, chapterNumber: 1 })
    expect(textMarkOf({ ...grouped, note: 'x'.repeat(4001) }, HEX, edition)).toBeNull()
    expect(textMarkOf({ ...grouped, endParagraphIndex: 99 }, HEX, edition)).toBeNull()
  })

  it('merges by timestamp and keeps tombstones through a stale conflict', async () => {
    const local = mark()
    writeLabHighlights([local])
    trust()
    const old = textMarkOf(local, HEX, edition)!
    const remote = { ...old, id: 'hl-900-other', at: 900 }
    const deleted = { id: local.id, gone: true as const, u: 3000 }
    const calls: Array<{ method: string; body?: { marks: TextItem[]; rev: number } }> = []
    let writes = 0
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET', body = init?.body ? JSON.parse(String(init.body)) : undefined
      calls.push({ method, body })
      if (method === 'GET') return json({ marks: [remote], rev: 1 })
      if (++writes === 1) return json({ marks: [remote, deleted], rev: 2, error: 'conflict' }, 409)
      return json({ rev: 3 })
    })
    const sync = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'synthetic', fetchImpl as typeof fetch)
    await sync.open()
    expect(calls.map(c => c.method)).toEqual(['GET', 'PUT', 'PUT'])
    expect(calls[1].body?.rev).toBe(1)
    expect(calls[2].body?.rev).toBe(2)
    expect(calls[2].body?.marks).toContainEqual(deleted)
    expect(readLabHighlights().some(h => h.id === local.id)).toBe(false)
    expect(readLabHighlights().some(h => h.id === remote.id)).toBe(true)
    const saved = JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-sync:${OWNER}:${HEX}`)!)
    expect(saved.rev).toBe(3)
    expect(saved.items).toContainEqual(deleted)
    sync.dispose()
  })

  it('creates a tombstone for a deliberate local removal without deleting unrelated books', async () => {
    const mine = mark()
    const other = { ...mark('hl-1100-other'), bookId: userBookId('cd'.repeat(12)) }
    writeLabHighlights([mine, other])
    trust()
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => init?.method === 'PUT' ? json({ rev: 1 }) : json({ marks: [], rev: 0 }))
    const sync = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'synthetic', fetchImpl as typeof fetch)
    await sync.open()
    sync.changed([other])
    const saved = JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-sync:${OWNER}:${HEX}`)!)
    expect(saved.items).toContainEqual(expect.objectContaining({ id: mine.id, gone: true }))
    expect(readLabHighlights()).toContainEqual(other)
    sync.dispose()
  })

  it('refuses to upload a partial set when a local mark cannot be represented', async () => {
    writeLabHighlights([mark(), { ...mark('hl-1200-other'), note: 'x'.repeat(4001) }])
    trust()
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => json({ marks: [], rev: 0 }))
    const sync = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'synthetic', fetchImpl as typeof fetch)
    await sync.open()
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(readLabHighlights()).toHaveLength(2)
    sync.dispose()
  })

  it('a newer deletion wins, and the older local mark cannot resurrect it', () => {
    const live = textMarkOf(mark(), HEX, edition)!
    expect(mergeTextItems([live], [{ id: live.id, gone: true, u: 2000 }])).toEqual([{ id: live.id, gone: true, u: 2000 }])
  })

  it('sends PDF Tinct text marks to the PDF source-word route, never page geometry', async () => {
    const pdfEdition = { ...edition, source: 'pdf' as const }
    const mine = mark()
    writeLabHighlights([mine]); trust()
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => init?.method === 'PUT' ? json({ rev: 1 }) : json({ marks: [], rev: 0 }))
    const sync = new OwnTextMarksSync(HEX, OWNER, pdfEdition, async () => 'token', fetchImpl as typeof fetch)
    await sync.open()
    expect(fetchImpl).toHaveBeenCalledWith(`/api/user-books/text-marks/${HEX}`, expect.objectContaining({ method: 'GET' }))
    expect(fetchImpl).toHaveBeenCalledWith(`/api/user-books/text-marks/${HEX}`, expect.objectContaining({ method: 'PUT' }))
    sync.dispose()
  })

  it('keeps marks from another account on the same bytes isolated and restores the first owner later', async () => {
    const a = mark()
    writeLabHighlights([a])
    trust()
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => init?.method === 'PUT' ? json({ rev: 1 }) : json({ marks: [], rev: 0 }))
    const first = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'a', fetchImpl as typeof fetch)
    await first.open()
    first.dispose()
    fetchImpl.mockClear()
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'owner-b' } }))
    const second = new OwnTextMarksSync(HEX, 'owner-b', edition, async () => 'b', fetchImpl as typeof fetch)
    await second.open()
    expect(readLabHighlights()).not.toContainEqual(a)
    expect(fetchImpl.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0)
    second.dispose()
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: OWNER } }))
    const again = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'a', fetchImpl as typeof fetch)
    expect(readLabHighlights()).toContainEqual(a)
    again.dispose()
  })

  it('archives owner-unknown marks without attributing them to the currently signed-in account', async () => {
    localStorage.removeItem(`tinct-addbook:text-marks-owner:${HEX}`)
    writeLabHighlights([mark()])
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => json({ marks: [], rev: 0 }))
    const sync = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'a', fetchImpl as typeof fetch)
    await sync.open()
    expect(readLabHighlights()).toEqual([])
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-unassigned:${HEX}`)!)).toContainEqual(mark())
    expect(fetchImpl.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0)
    sync.dispose()
  })

  it('a failed account switch preserves every existing local highlight atomically', () => {
    const a = mark(), catalogue = { ...mark('hl-1300-catalogue'), bookId: 'frankenstein' }
    writeLabHighlights([a, catalogue])
    trust()
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'owner-b' } }))
    const original = Storage.prototype.setItem
    const quota = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === 'tinct-lab-highlights') throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    expect(() => new OwnTextMarksSync(HEX, 'owner-b', edition, async () => 'b', vi.fn() as typeof fetch)).toThrow()
    quota.mockRestore()
    expect(readLabHighlights()).toEqual([a, catalogue])
    expect(localStorage.getItem(`tinct-addbook:text-marks-owner:${HEX}`)).toBe(OWNER)
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:text-marks-local:${OWNER}:${HEX}`)!)).toEqual([a])
  })

  it('a failed final owner marker cannot expose the new owner projection to the old owner', () => {
    const a = mark(), b = { ...mark('hl-2000-bbbbbb'), text: 'Other words' }
    writeLabHighlights([a]); trust()
    localStorage.setItem(`tinct-addbook:text-marks-local:owner-b:${HEX}`, JSON.stringify([b]))
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'owner-b' } }))
    const original = Storage.prototype.setItem
    const failing = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === `tinct-addbook:text-marks-owner:${HEX}`) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    const switched = new OwnTextMarksSync(HEX, 'owner-b', edition, async () => 'b', vi.fn() as typeof fetch)
    failing.mockRestore()
    expect(readLabHighlights()).toEqual([b])
    switched.dispose()
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: OWNER } }))
    const reopened = new OwnTextMarksSync(HEX, OWNER, edition, async () => 'a', vi.fn() as typeof fetch)
    expect(readLabHighlights()).toEqual([a])
    expect(unassignedOwnTextMarkCount(HEX, OWNER)).toBe(0)
    expect(adoptUnassignedOwnTextMarks(HEX, OWNER)).toBe(false)
    expect(localStorage.getItem(`tinct-addbook:text-marks-local:owner-b:${HEX}`)).toBe(JSON.stringify([b]))
    reopened.dispose()
  })

  it('a failed owner backup write leaves the previous owner projection intact', () => {
    const a = mark()
    writeLabHighlights([a]); trust()
    localStorage.setItem('sb-test-auth-token', JSON.stringify({ user: { id: 'owner-b' } }))
    const original = Storage.prototype.setItem
    const failing = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === `tinct-addbook:text-marks-local:owner-b:${HEX}`) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    })
    expect(() => new OwnTextMarksSync(HEX, 'owner-b', edition, async () => 'b', vi.fn() as typeof fetch)).toThrow()
    failing.mockRestore()
    expect(readLabHighlights()).toEqual([a])
    expect(localStorage.getItem(`tinct-addbook:text-marks-owner:${HEX}`)).toBe(OWNER)
  })
})
