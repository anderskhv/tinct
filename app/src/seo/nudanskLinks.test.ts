import { describe, expect, it } from 'vitest'
import { danishSlug, nudanskBookForSlug, nudanskBookPath } from './nudanskLinks'
import { nudanskBooks } from './modernEnglishPage'
import { handleSeoAndStaticRequest } from '../worker/routes/seo'

describe('a link that opens one book in Danish', () => {
  it('writes a Danish title as a web address', () => {
    expect(danishSlug('Kriton')).toBe('kriton')
    expect(danishSlug('Sokrates’ forsvarstale')).toBe('sokrates-forsvarstale')
    expect(danishSlug('Ødipus i Kolonos')).toBe('oedipus-i-kolonos')
    expect(danishSlug('Vinden i piletræerne')).toBe('vinden-i-piletraeerne')
    expect(danishSlug('Tusind og én nat')).toBe('tusind-og-en-nat')
    expect(danishSlug('Håndbogen')).toBe('haandbogen')
    expect(danishSlug('Dr. Jekyll og Mr. Hyde')).toBe('dr-jekyll-og-mr-hyde')
  })

  it('gives every book on /nudansk its own address, from the title the page shows', () => {
    const list = nudanskBooks()
    const paths = list.map(book => nudanskBookPath(book.id))
    expect(new Set(paths).size).toBe(list.length)
    for (const book of list) {
      const path = nudanskBookPath(book.id)!
      expect(path, book.id).toBe('/nudansk/' + danishSlug(book.title))
      expect(path, book.id).toMatch(/^\/nudansk\/[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(nudanskBookForSlug(path.slice('/nudansk/'.length)), book.id).toBe(book.id)
    }
    expect(nudanskBookPath('crito')).toBe('/nudansk/kriton')
    expect(nudanskBookPath('hamlet')).toBe('/nudansk/hamlet')
  })

  it('opens a book by its other Danish titles, its English title and its id too', () => {
    expect(nudanskBookForSlug('kunsten-at-foere-krig')).toBe('the-art-of-war')
    expect(nudanskBookForSlug('krigskunsten')).toBe('the-art-of-war')
    expect(nudanskBookForSlug('the-art-of-war')).toBe('the-art-of-war')
    expect(nudanskBookForSlug('crito')).toBe('crito')
  })

  it('reads the address as people type it', () => {
    expect(nudanskBookForSlug('Kriton')).toBe('crito')
    expect(nudanskBookForSlug('vinden%20i%20piletr%C3%A6erne')).toBe('wind-in-the-willows')
    expect(nudanskBookForSlug('Ødipus i Kolonos')).toBe('oedipus-at-colonus')
  })

  it('opens nothing for a book that is not offered in Danish, or an unknown name', () => {
    expect(nudanskBookPath('pride-and-prejudice')).toBeNull()
    expect(nudanskBookForSlug('stolthed-og-fordom')).toBeNull()
    expect(nudanskBookForSlug('no-such-book')).toBeNull()
    expect(nudanskBookForSlug('')).toBeNull()
  })
})

describe('the Worker answers /nudansk/<title>', () => {
  const env = { ASSETS: { fetch: async () => new Response('nf', { status: 404 }) } }
  const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
  const get = (path: string, method = 'GET') => handleSeoAndStaticRequest(new Request(`https://tinct.app${path}`, { method }), env as never, ctx)

  it('sends a book\'s Danish title to that book in Danish, as its card on /nudansk does', async () => {
    for (const [path, bookId] of [['/nudansk/kriton', 'crito'], ['/nudansk/kriton/', 'crito'], ['/nudansk/Kriton', 'crito'], ['/nudansk/vinden-i-piletraeerne', 'wind-in-the-willows'], ['/nudansk/hamlet', 'hamlet']]) {
      const response = await get(path)
      expect(response.status, path).toBe(302)
      expect(response.headers.get('Location'), path).toBe(`/reader?book=${bookId}&mode=free&ref=nudansk`)
    }
    expect((await get('/nudansk/kriton', 'HEAD')).headers.get('Location')).toBe('/reader?book=crito&mode=free&ref=nudansk')
    // The same address the page's own cards use.
    const card = nudanskBooks().find(book => book.id === 'crito')!
    expect((await get('/nudansk/kriton')).headers.get('Location')).toBe(card.href)
  })

  it('sends a name that is no Danish book to the page', async () => {
    for (const path of ['/nudansk/no-such-book', '/nudansk/stolthed-og-fordom', '/nudansk/kriton/2', '/nudansk/%E0%A4%A']) {
      const response = await get(path)
      expect(response.status, path).toBe(302)
      expect(response.headers.get('Location'), path).toBe('/nudansk')
    }
  })
})
