import { afterEach, describe, expect, it, vi } from 'vitest'
import { currentOwnBookMetadata, withOwnBookMetadata } from './ownBookMetadata'
import type { LoadedUserBook } from './userBookStore'

describe('mutable account metadata', () => {
  it('updates labels without shifting converted text, figure assets, or a saved word', () => {
    const book = { hex: 'ab'.repeat(12), bookId: 'userbook-' + 'ab'.repeat(12), kind: 'epub', images: new Map(),
      place: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 7, updatedAt: 200 },
      edition: { format: 'tinct-user-edition-v1', converter: 7, title: 'Original', author: 'Writer', language: 'en', droppedImages: 0,
        chapters: [{ number: 2, title: 'II', paragraphs: ['one two three'] }] } } as LoadedUserBook
    const changed = withOwnBookMetadata(book, { title: 'Revised title', author: '', name: 'original.epub', metadataRev: 2 })
    expect(changed.edition).toMatchObject({ title: 'Revised title', author: '', converter: 7, chapters: book.edition.chapters })
    expect(changed.place).toBe(book.place)
    expect(changed.images).toBe(book.images)
    expect(book.edition.title).toBe('Original')
    expect(withOwnBookMetadata(book, { title: 'Original filename', author: '', name: 'original.epub', metadataRev: 0 })).toBe(book)
  })
})

const lookup = vi.hoisted(() => ({ owner: 'owner-a', local: null as any, remote: null as any }))
vi.mock('./userBookStore', () => ({ userBookOwner: () => lookup.owner, readOwnedBookMetadata: async () => lookup.local }))
vi.mock('./ownAccount', () => ({ ownBookToken: async () => 'fixture-token', listAccountBooks: () => lookup.remote }))
afterEach(() => { vi.useRealTimers(); lookup.owner = 'owner-a'; lookup.local = null; lookup.remote = null })
it('keeps a local PDF title prompt even when the remote label gets a longer deadline', async () => {
 vi.useFakeTimers()
 lookup.local = { id: 'fixture', title: 'Local title', name: 'local.pdf', type: 'pdf' }
 lookup.remote = new Promise(() => {})
 let result: unknown
 void currentOwnBookMetadata('ab'.repeat(12), 'owner-a', 10_000).then(value => { result = value })
 await vi.advanceTimersByTimeAsync(700)
 expect(result).toEqual(lookup.local)
})
it('keeps waiting for a late account title when there is no local label', async () => {
 vi.useFakeTimers()
 const record = { id: 'fixture', sha256: 'ab'.repeat(32), title: 'Account title', name: 'account.pdf', type: 'pdf' }
 lookup.remote = new Promise(resolve => setTimeout(() => resolve([record]), 1600))
 let result: unknown
 const pending = currentOwnBookMetadata('ab'.repeat(12), 'owner-a', 10_000).then(value => { result = value; return value })
 await vi.advanceTimersByTimeAsync(700)
 expect(result).toBeUndefined()
 await vi.advanceTimersByTimeAsync(900)
 expect(await pending).toEqual(record)
})
it('rejects a delayed label after the account changes and clears its deadlines', async () => {
 vi.useFakeTimers()
 const record = { id: 'fixture', sha256: 'ab'.repeat(32), title: 'Private title', name: 'account.pdf', type: 'pdf' }
 lookup.remote = new Promise(resolve => setTimeout(() => resolve([record]), 1600))
 const pending = currentOwnBookMetadata('ab'.repeat(12), 'owner-a', 10_000)
 await vi.advanceTimersByTimeAsync(700)
 lookup.owner = 'owner-b'
 await vi.advanceTimersByTimeAsync(900)
 expect(await pending).toBeNull()
 expect(vi.getTimerCount()).toBe(0)
})
