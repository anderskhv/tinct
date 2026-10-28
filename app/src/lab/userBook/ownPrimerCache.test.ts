// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import { fetchOwnChapterNotes, type OwnChapterNotesSource } from './ownChapterNotes'
import { keepOwnedPrimerCache, readOwnedPrimerCache } from './userBookStore'
const session = vi.hoisted(() => ({ owner: 'owner-a' as string | null }))
vi.mock('../labLibraryBoot', () => ({ readCachedSupabaseUser: () => session.owner ? { id: session.owner } : null }))
const hex = 'ab'.repeat(12), key = 'epub:' + hex
const source: OwnChapterNotesSource = { bookTitle: 'Synthetic book', chapterNumber: 1, chapterTitle: 'Letter one', paragraphs: ['A complete synthetic letter.'], structured: { ownerId: 'owner-a', uploadId: hex, workId: 'userbook-' + hex, editionId: 'own-en', language: 'en' } }
const content = { opening: 'A letter opens a conversation.', structure: [], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] }
const answer = () => new Response(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(content) }], stop_reason: 'end_turn' }), { status: 200 })
let records: Map<string, Record<string, unknown>>
beforeEach(() => {
 session.owner = 'owner-a'
 records = new Map([[key, { key, kind: 'epub', owner: session.owner, cloudId: 'generation-1', bytes: new ArrayBuffer(2) }]])
 vi.stubGlobal('indexedDB', fakeIndexedDb(records)); vi.stubGlobal('crypto', webcrypto)
})
afterEach(() => vi.unstubAllGlobals())
it('reopens from durable owned storage, but regenerates when source or language changes', async () => {
 const fetchImpl = vi.fn(async () => answer())
 const first = await fetchOwnChapterNotes('primer', source, { fetchImpl })
 expect(first.ok).toBe(true)
 expect(await fetchOwnChapterNotes('primer', source, { fetchImpl })).toEqual(first)
 expect(fetchImpl).toHaveBeenCalledTimes(1)
 await fetchOwnChapterNotes('primer', { ...source, paragraphs: ['Changed complete source.'] }, { fetchImpl })
 await fetchOwnChapterNotes('primer', { ...source, structured: { ...source.structured!, language: 'da' } }, { fetchImpl })
 expect(fetchImpl).toHaveBeenCalledTimes(3)
 expect((await readOwnedPrimerCache(hex, 'owner-a'))?.entries).toHaveLength(3)
})
it('never reads another owner cache or sends old text after a token changes accounts', async () => {
 await fetchOwnChapterNotes('primer', source, { fetchImpl: async () => answer() })
 session.owner = 'owner-b'
 expect(await readOwnedPrimerCache(hex, 'owner-a')).toBeNull()
 session.owner = 'owner-a'
 const fetchImpl = vi.fn(async () => answer())
 const result = await fetchOwnChapterNotes('primer', { ...source, paragraphs: ['New source.'] }, { fetchImpl, readToken: async () => { session.owner = 'owner-b'; return 'new-account-token' } })
 expect(result.ok).toBe(false); expect(fetchImpl).not.toHaveBeenCalled()
})
it('does not recreate deleted uploads or write a late result into a replacement generation', async () => {
 const result = await fetchOwnChapterNotes('primer', source, { fetchImpl: async () => answer() })
 if (!result.ok || !result.primer) throw new Error('Expected primer')
 records.delete(key)
 await keepOwnedPrimerCache(hex, 'owner-a', 'generation-1', result.primer)
 expect(records.has(key)).toBe(false)
 records.set(key, { key, kind: 'epub', owner: 'owner-a', cloudId: 'generation-2' })
 await keepOwnedPrimerCache(hex, 'owner-a', 'generation-1', result.primer)
 expect(records.get(key)?.generatedPrimers).toBeUndefined()
})
it('invalidates cached entries if the existing local record gets a new cloud generation', async () => {
 const fetchImpl = vi.fn(async () => answer())
 await fetchOwnChapterNotes('primer', source, { fetchImpl })
 records.set(key, { ...records.get(key)!, cloudId: 'generation-2' })
 expect((await readOwnedPrimerCache(hex, 'owner-a'))?.entries).toEqual([])
 await fetchOwnChapterNotes('primer', source, { fetchImpl })
 expect(fetchImpl).toHaveBeenCalledTimes(2)
 expect(records.get(key)?.generatedPrimerFileId).toBe('generation-2')
})
it('replaces an obsolete generated prompt once, then reuses the fresh result', async () => {
 const fetchImpl = vi.fn(async () => answer())
 await fetchOwnChapterNotes('primer', source, { fetchImpl })
 const record = records.get(key)!
 const entries = record.generatedPrimers as Array<{ promptVersion: string }>
 entries[0].promptVersion = 'obsolete-prompt'
 await fetchOwnChapterNotes('primer', source, { fetchImpl })
 await fetchOwnChapterNotes('primer', source, { fetchImpl })
 expect(fetchImpl).toHaveBeenCalledTimes(2)
 expect((await readOwnedPrimerCache(hex, 'owner-a'))?.entries).toHaveLength(1)
})

it('keeps whole-book and chapter primers separate, and invalidates the book when a later section changes', async () => {
 const fetchImpl = vi.fn(async () => answer())
 const whole = { ...source, bookChapters: [{ number: 1, title: 'Letter one', paragraphs: source.paragraphs }, { number: 2, title: 'Letter two', paragraphs: ['A later complete letter.'] }] }
 const chapter = await fetchOwnChapterNotes('primer', source, { fetchImpl })
 const book = await fetchOwnChapterNotes('primer', whole, { fetchImpl })
 expect(book).toMatchObject({ ok: true, primer: { identity: { type: 'book', unitId: null } } })
 expect(await fetchOwnChapterNotes('primer', whole, { fetchImpl })).toEqual(book)
 expect(await fetchOwnChapterNotes('primer', source, { fetchImpl })).toEqual(chapter)
 expect(fetchImpl).toHaveBeenCalledTimes(2)
 await fetchOwnChapterNotes('primer', { ...whole, bookChapters: [whole.bookChapters[0], { ...whole.bookChapters[1], paragraphs: ['Changed later letter.'] }] }, { fetchImpl })
 expect(fetchImpl).toHaveBeenCalledTimes(3)
})
it.each(['manual', 'approved'] as const)('prefers matching %s copy over generated entries across prompt updates', async origin => {
 const fetchImpl = vi.fn(async () => answer())
 const first = await fetchOwnChapterNotes('primer', source, { fetchImpl })
 if (!first.ok || !first.primer) throw new Error('Expected primer')
 const human = { ...first.primer, origin, promptVersion: 'editorial-revision-1', content: { ...content, opening: 'The saved human opening.' } }
 records.get(key)!.generatedPrimers = [first.primer, human]
 fetchImpl.mockClear()
 const readToken = vi.fn(async () => 'token')
 expect(await fetchOwnChapterNotes('primer', source, { fetchImpl, readToken })).toMatchObject({ ok: true, primer: human })
 expect(fetchImpl).not.toHaveBeenCalled()
 expect(readToken).not.toHaveBeenCalled()
})
it('does not trust stale or corrupt human entries merely because they have editorial provenance', async () => {
 const fetchImpl = vi.fn(async () => answer())
 const first = await fetchOwnChapterNotes('primer', source, { fetchImpl })
 if (!first.ok || !first.primer) throw new Error('Expected primer')
 const human = { ...first.primer, origin: 'manual', promptVersion: 'editorial-revision-1' }
 records.get(key)!.generatedPrimers = [null,
   { ...human, identity: { ...human.identity, sourceVersion: 'older-source' } },
   { ...human, content: { ...content, whatToNotice: [{ title: 'Invented', explanation: 'Invalid quote.', quotes: [{ text: 'Not in the source.', passageId: 'chapter-1:paragraph-0' }] }] } },
   first.primer]
 fetchImpl.mockClear()
 expect(await fetchOwnChapterNotes('primer', source, { fetchImpl })).toEqual(first)
 expect(fetchImpl).not.toHaveBeenCalled()
})
