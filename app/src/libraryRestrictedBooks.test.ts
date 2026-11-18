// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { serializePreReaderCatalogue } from './preReader/catalogue'
import { listWithout, loadRestrictedBookIds, pendingRestrictedBookIds, resetRestrictedBookIdsForTest, restrictCatalogue, restrictedBookIdsNow } from '../public/lab/restricted-books.js'

afterEach(() => { resetRestrictedBookIdsForTest(); vi.unstubAllGlobals(); delete (window as unknown as { Capacitor?: unknown }).Capacitor })

const B = 'master-and-margarita'
const catalogue = () => ({
  books: [
    { id: 'crime-and-punishment', author: 'Fyodor Dostoevsky', topics: ['Dostoevsky, Tolstoy and Bulgakov'], discoveryAvailable: true },
    { id: 'anna-karenina', author: 'Leo Tolstoy', topics: ['Dostoevsky, Tolstoy and Bulgakov'] },
    { id: B, author: 'Mikhail Bulgakov', topics: ['Dostoevsky, Tolstoy and Bulgakov'], discoveryAvailable: true, searchAvailable: true },
  ],
  houses: [{ id: 'novel', title: 'Fiction', shelves: [{ id: 'russian-novels', title: 'The Russians', subtitle: 'Dostoevsky, Tolstoy and Bulgakov', bookIds: ['crime-and-punishment', 'anna-karenina', B] }, { id: 'other', title: 'Other', bookIds: ['anna-karenina'] }] }],
  popular: [B, 'anna-karenina'],
})

describe('the library catalogue for a restricted visitor', () => {
  it('takes the book out of discovery and search, off its shelf and Popular, and Bulgakov out of the subtitle', () => {
    const data = catalogue()
    const before = structuredClone(data)
    const out = restrictCatalogue(data, new Set([B]))
    const book = out.books.find(entry => entry.id === B)!
    expect(book).toMatchObject({ discoveryAvailable: false, searchAvailable: false, restricted: true })
    expect(out.houses[0].shelves[0]).toMatchObject({ bookIds: ['crime-and-punishment', 'anna-karenina'], subtitle: 'Dostoevsky and Tolstoy' })
    expect(out.houses[0].shelves[1]).toEqual(data.houses[0].shelves[1])
    expect(out.popular).toEqual(['anna-karenina'])
    expect(out.books[0].topics).toEqual(['Dostoevsky and Tolstoy'])
    expect(data).toEqual(before)
  })
  it('changes nothing for a visitor with no restriction', () => {
    const data = catalogue()
    expect(restrictCatalogue(data, new Set())).toBe(data)
    expect(restrictCatalogue(data, new Set(['not-in-catalogue']))).toBe(data)
  })
  it('works on the built catalogue: the real Russians shelf loses the book and its author', () => {
    const built = JSON.parse(JSON.stringify(serializePreReaderCatalogue())) as ReturnType<typeof catalogue>
    expect(built.houses.flatMap(house => house.shelves).find(item => item.id === 'russian-novels')?.bookIds).toContain(B)
    const out = restrictCatalogue(built, new Set([B]))
    const shelf = out.houses.flatMap(house => house.shelves).find(item => item.id === 'russian-novels')!
    expect(shelf.bookIds).not.toContain(B)
    expect(shelf.subtitle).not.toContain('Bulgakov')
  })
  it('keeps a list it cannot read as "A, B and C"', () => {
    expect(listWithout('Dostoevsky, Tolstoy and Bulgakov', 'Bulgakov')).toBe('Dostoevsky and Tolstoy')
    expect(listWithout('Tolstoy and Bulgakov', 'Bulgakov')).toBe('Tolstoy')
    expect(listWithout('Novels of the Russian golden age', 'Bulgakov')).toBe('Novels of the Russian golden age')
    expect(listWithout('Dostoevsky, Tolstoy and Chekhov', 'Bulgakov')).toBe('Dostoevsky, Tolstoy and Chekhov')
  })
})

describe('the restricted-books signal in the library', () => {
  it('one request per page, shared by every copy; no storage', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const fetch = vi.fn(async () => Response.json({ restrictedBookIds: [B] }))
    expect(pendingRestrictedBookIds()).toBeNull()
    const first = await loadRestrictedBookIds(fetch)
    await loadRestrictedBookIds(fetch)
    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith('/api/restricted-books', { cache: 'no-store', credentials: 'omit' })
    expect([...first]).toEqual([B])
    expect([...restrictedBookIdsNow()]).toEqual([B])
    expect(pendingRestrictedBookIds()).not.toBeNull()
    expect(setItem).not.toHaveBeenCalled()
  })
  it('asks tinct.app itself from the Android app', async () => {
    ;(window as unknown as { Capacitor: unknown }).Capacitor = { isNativePlatform: () => true }
    const fetch = vi.fn(async () => Response.json({ restrictedBookIds: [] }))
    await loadRestrictedBookIds(fetch)
    expect(fetch.mock.calls[0][0]).toBe('https://tinct.app/api/restricted-books')
  })
  it('fails open', async () => {
    expect((await loadRestrictedBookIds(async () => { throw new Error('offline') })).size).toBe(0)
  })
  it('catalogue.js applies it to the shared catalogue data', () => {
    const source = readFileSync('public/lab/library_2/catalogue.js', 'utf8')
    expect(source).toMatch(/restrictCatalogue\(data, await restricted\)/)
    const shelf = readFileSync('public/lab/library_2/bookshelf.js', 'utf8')
    expect(shelf.match(/view\.update\([^;]*?shownSaved\(saved\)/g)?.length).toBe(6)
    expect(shelf).toContain('shownSaved')
  })
})
