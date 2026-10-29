// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import { openUserBook } from './userBookStore'
import { PDF_TEXT_CONVERTER, USER_EDITION_FORMAT } from './userEdition'

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


function keepPdf(cached = false) {
  const edition = records.get(`epub:${hex}`)!.edition as Record<string, unknown>
  records.clear()
  records.set(`pdf:${hex}`, { key: `pdf:${hex}`, kind: 'pdf', owner, name: 'Synthetic PDF',
    bytes: new ArrayBuffer(8), layout: { default: 'text' }, scan: { textPages: 1 },
    ...(cached ? { edition: { ...edition, source: 'pdf', converter: PDF_TEXT_CONVERTER } } : {}),
  })
}
it.each([false, true])('opens fresh desktop PDFs in Original pages before converting (cached text: %s)', async cached => {
  keepPdf(cached)
  const convert = vi.fn()
  expect(await openUserBook(hex, { owner, desktop: true, sharedReader: true, convert })).toMatchObject({ ok: false, reason: 'pages' })
  expect(convert).not.toHaveBeenCalled()
})
it('preserves explicit desktop Tinct text and the forced phone source rule', async () => {
  keepPdf(true)
  localStorage.setItem(`tinct-addbook:edition:${hex}`, JSON.stringify('text'))
  expect(await openUserBook(hex, { owner, desktop: true, sharedReader: true })).toMatchObject({ ok: true })
  // A forced phone remains a phone even in this desktop-sized test window.
  localStorage.setItem(`tinct-addbook:open-rule:${hex}`, JSON.stringify(100))
  expect(await openUserBook(hex, { owner, desktop: false, sharedReader: true })).toMatchObject({ ok: true })
  localStorage.setItem(`tinct-addbook:edition:${hex}`, JSON.stringify('pages'))
  expect(await openUserBook(hex, { owner, desktop: false, sharedReader: true })).toMatchObject({ ok: false, reason: 'pages' })
})

it.each([false, true])('opens an unchosen shared phone PDF in Original pages without whole-file conversion (cached: %s)', async cached => {
  keepPdf(cached)
  const convert = vi.fn()
  expect(await openUserBook(hex, { owner, desktop: false, sharedReader: true, convert })).toMatchObject({ ok: false, reason: 'pages' })
  expect(convert).not.toHaveBeenCalled()
  expect(localStorage.getItem(`tinct-addbook:edition:${hex}`)).toBeNull()
})
it('keeps a phone text edition already chosen by its earlier opening rule', async () => {
  keepPdf(true)
  localStorage.setItem(`tinct-addbook:edition:${hex}`, JSON.stringify('text'))
  localStorage.setItem(`tinct-addbook:phone-edition:${hex}`, JSON.stringify({ edition: 'text', kind: 'narrative', by: 'text', v: 1 }))
  localStorage.setItem(`tinct-addbook:open-rule:${hex}`, '2')
  expect(await openUserBook(hex, { owner, desktop: false, sharedReader: true })).toMatchObject({ ok: true })
})
