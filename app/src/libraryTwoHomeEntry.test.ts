import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, it, vi } from 'vitest'

const source = readFileSync(new URL('../public/lab/library_2/boot.js', import.meta.url), 'utf8')
const now = Date.now(), windowMs = 3 * 24 * 60 * 60 * 1000
function boot(path = '/', options: { age?: number; owner?: string | null; user?: string | null; missingPlace?: boolean; brokenStorage?: boolean; linkedBook?: string; fresh?: boolean } = {}) {
  const at = now - (options.age ?? 1000)
  const position = JSON.stringify({ owner: options.owner === undefined ? 'reader-a' : options.owner,
    lastSettledBookId: 'hamlet', lastSettledAt: at,
    books: options.missingPlace ? {} : { hamlet: { bookId: 'hamlet', updatedAt: at, chapterNumber: 3, paragraphIndex: 8, wordIndex: 12, primaryEditionKey: 'original-en' } } })
  const records = new Map(options.fresh ? [] : [['tinct-lab-position', position]])
  const user = options.user === undefined ? 'reader-a' : options.user
  if (user) records.set('sb-test-auth-token', JSON.stringify({ user: { id: user } }))
  const getItem = (key: string) => { if (options.brokenStorage) throw new Error('blocked'); return records.get(key) ?? null }
  const localStorage = { length: records.size, key: (i: number) => [...records.keys()][i], getItem, setItem: vi.fn() }
  const sessionStorage = { getItem: () => null, setItem: vi.fn() }
  const replace = vi.fn(), url = new URL(path, 'https://tinct.app')
  const document = { cookie: '', documentElement: { style: { visibility: '', setProperty: vi.fn() }, classList: { add: vi.fn() }, dataset: options.linkedBook ? { linkedBook: options.linkedBook } as Record<string, string> : {} as Record<string, string> },
    head: { append: vi.fn() }, createElement: () => ({}) }
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [] }))
  const window: { __library2Boot?: { hint: boolean; scene: string; asset: string; book: string | null } } = {}
  runInNewContext(source, { window, location: { pathname: url.pathname, search: url.search, replace },
    localStorage, sessionStorage, document, URLSearchParams, Date: class extends Date { static now() { return now } },
    innerWidth: 393, innerHeight: 734, fetch })
  expect(localStorage.setItem).not.toHaveBeenCalled()
  if (!options.fresh) expect(records.get('tinct-lab-position')).toBe(position)
  return { replace, sessionStorage, document, fetch, window }
}

it.each(['/', '/index.html'])('resumes a recent same-account reader at %s before fetching the library', path => {
  const result = boot(path)
  expect(result.replace).toHaveBeenCalledExactlyOnceWith('/reader')
  expect(result.fetch).not.toHaveBeenCalled()
  expect(result.sessionStorage.setItem).toHaveBeenCalledWith('tinct:lab-reader-origin', JSON.stringify({ v: 1, bookId: 'hamlet', at: now }))
})
it.each(['/library', '/library/', '/lab/library_2/', '/?book=hamlet', '/?view=library', '/?preview=1', '/?demo=reading'])('keeps explicit navigation %s in the library', path => {
  expect(boot(path).replace).not.toHaveBeenCalled()
})
it.each([{ user: null }, { owner: null }, { owner: 'reader-b' }, { missingPlace: true }, { age: windowMs + 1 }, { age: -1 }, { brokenStorage: true }])('does not redirect an unconfirmed or stale device record: %j', options => {
  const result = boot('/', options)
  expect(result.replace).not.toHaveBeenCalled()
  expect(result.document.documentElement.style.visibility).toBe('')
})
it('keeps the established three-day boundary and explicit voice trial', () => {
  expect(boot('/?voiceTrial=mini', { age: windowMs }).replace).toHaveBeenCalledWith('/reader?voiceTrial=mini')
})

// Book links (/library?book=<id>, /read/<id>) show that book in the hero from the first paint.
it.each([['/library?book=wuthering-heights', 'wuthering-heights'], ['/read/wuthering-heights/', 'wuthering-heights'], ['/read/wuthering-heights', 'wuthering-heights'], ['/library', null], ['/read/', null], ['/library?book=%3Cx%3E', null]])('reads the linked book from %s', (path, book) => {
  const result = boot(path, { fresh: true })
  expect(result.window.__library2Boot?.book).toBe(book)
  expect(result.replace).not.toHaveBeenCalled()
})
it('trusts a hero the Worker already filled and otherwise holds the hero for the linked book', () => {
  const filled = boot('/read/wuthering-heights/', { fresh: true, linkedBook: 'wuthering-heights' })
  expect(filled.document.documentElement.classList.add).not.toHaveBeenCalledWith('linked-pending')
  const unfilled = boot('/library?book=wuthering-heights', { fresh: true })
  expect(unfilled.document.documentElement.classList.add).toHaveBeenCalledWith('linked-pending')
  expect(boot('/library', { fresh: true }).document.documentElement.classList.add).not.toHaveBeenCalledWith('linked-pending')
})
it('starts a new reader on the linked book: its catalogue, never the featured cover', () => {
  const linked = boot('/library?book=wuthering-heights', { fresh: true, linkedBook: 'wuthering-heights' })
  expect(linked.fetch).toHaveBeenCalledWith('/lab/catalogue.json')
  expect(linked.document.head.append).not.toHaveBeenCalledWith(expect.objectContaining({ href: 'assets/frankenstein.jpg' }))
  expect(linked.window.__library2Boot?.scene).toBe('frankenstein')
  const featured = boot('/library', { fresh: true })
  expect(featured.document.head.append).toHaveBeenCalledWith(expect.objectContaining({ href: 'assets/frankenstein.jpg' }))
  // A book with its own painted room opens in that room.
  const odyssey = boot('/read/odyssey/', { fresh: true, linkedBook: 'odyssey' })
  expect(odyssey.window.__library2Boot).toMatchObject({ book: 'odyssey', scene: 'odyssey', asset: 'assets/scene-odyssey-phone.jpg' })
})
