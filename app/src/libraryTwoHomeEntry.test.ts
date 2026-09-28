import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, it, vi } from 'vitest'

const source = readFileSync(new URL('../public/lab/library_2/boot.js', import.meta.url), 'utf8')
const now = Date.now(), windowMs = 3 * 24 * 60 * 60 * 1000
function boot(path = '/', options: { age?: number; owner?: string | null; user?: string | null; missingPlace?: boolean; brokenStorage?: boolean } = {}) {
  const at = now - (options.age ?? 1000)
  const position = JSON.stringify({ owner: options.owner === undefined ? 'reader-a' : options.owner,
    lastSettledBookId: 'hamlet', lastSettledAt: at,
    books: options.missingPlace ? {} : { hamlet: { bookId: 'hamlet', updatedAt: at, chapterNumber: 3, paragraphIndex: 8, wordIndex: 12, primaryEditionKey: 'original-en' } } })
  const records = new Map([['tinct-lab-position', position]])
  const user = options.user === undefined ? 'reader-a' : options.user
  if (user) records.set('sb-test-auth-token', JSON.stringify({ user: { id: user } }))
  const getItem = (key: string) => { if (options.brokenStorage) throw new Error('blocked'); return records.get(key) ?? null }
  const localStorage = { length: records.size, key: (i: number) => [...records.keys()][i], getItem, setItem: vi.fn() }
  const sessionStorage = { getItem: () => null, setItem: vi.fn() }
  const replace = vi.fn(), url = new URL(path, 'https://tinct.app')
  const document = { cookie: '', documentElement: { style: { visibility: '', setProperty: vi.fn() }, classList: { add: vi.fn() }, dataset: {} },
    head: { append: vi.fn() }, createElement: () => ({}) }
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [] }))
  runInNewContext(source, { window: {}, location: { pathname: url.pathname, search: url.search, replace },
    localStorage, sessionStorage, document, URLSearchParams, Date: class extends Date { static now() { return now } },
    innerWidth: 393, innerHeight: 734, fetch })
  expect(localStorage.setItem).not.toHaveBeenCalled()
  expect(records.get('tinct-lab-position')).toBe(position)
  return { replace, sessionStorage, document, fetch }
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
