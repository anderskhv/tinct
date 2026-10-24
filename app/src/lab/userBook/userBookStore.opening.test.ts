// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import { openUserBook } from './userBookStore'
import { USER_EDITION_FORMAT } from './userEdition'

const hex = 'ab'.repeat(12), owner = 'synthetic-owner'
const cover = vi.hoisted(() => ({ pending: null as Promise<string | null> | null }))
vi.mock('./ownCovers', async importOriginal => ({
  ...await importOriginal<typeof import('./ownCovers')>(),
  cachedStoredCover: () => cover.pending ?? Promise.resolve(null),
}))

let records: Map<string, Record<string, unknown>>
beforeEach(() => {
  records = new Map([[`epub:${hex}`, { key: `epub:${hex}`, kind: 'epub', owner,
    edition: { format: USER_EDITION_FORMAT, converter: 5, title: 'Synthetic migrated EPUB', author: '', language: 'en', droppedImages: 0,
      chapters: [{ number: 1, title: 'Chapter one', paragraphs: ['A saved chapter remains readable.'] }] },
  }]])
  ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
})
afterEach(() => { delete (globalThis as { indexedDB?: unknown }).indexedDB; cover.pending = null; localStorage.clear() })

it('opens a stored legacy conversion without waiting for its optional cover cache', async () => {
  let resolveCover!: (value: string | null) => void
  cover.pending = new Promise(resolve => { resolveCover = resolve })
  const result = await Promise.race([
    openUserBook(hex, { owner }),
    new Promise<'still-opening'>(resolve => setTimeout(() => resolve('still-opening'), 100)),
  ])
  expect(result).not.toBe('still-opening')
  if (typeof result !== 'string' && result.ok) expect(result.book.edition.converter).toBe(5)
  resolveCover(null)
})
