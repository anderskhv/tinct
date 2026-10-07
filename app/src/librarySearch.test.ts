// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { groupSearchResults, inTinct, looseTitle, looseTitleAuthorKey, type CatalogueWork } from '../public/lab/public-books.js'
import { INTERNAL_KEY } from '../public/lab/internal-traffic.js'
// @ts-expect-error -- plain module shared by Add a book, freepubs.fyi and the library
import { createSearch, hydrate, borrowFor } from '../../addbooks/site/search.js'
// @ts-expect-error -- plain browser module of the library page
import { createLibrarySearch, librarySearch } from '../public/lab/library_2/library-search.js'
// @ts-expect-error -- plain browser module of the library page
import * as addToTinct from '../public/lab/library_2/add-to-tinct.js'

// The library search panel (approved by Anders, 2026-10-07): "Available in Tinct" ranked by the
// catalogue's engine, so typos and other spellings find Tinct's books, and "Not yet in Tinct"
// never offers another copy of a book Tinct has.
type Book = { id: string; title: string; author: string; altTitles?: string[] }
type Work = CatalogueWork & { editions: Array<Record<string, unknown>> }
const fixture = JSON.parse(readFileSync(join(__dirname, '__fixtures__/catalogue-search-works.json'), 'utf8')) as { works: Work[] }
const prepare = (works: Work[]) => {
  const list = hydrate(structuredClone(works))
  for (const w of list) for (const e of w.editions) { if (!e.authors.length) e.authors = w.authors; if (!e.translators.length) e.translators = w.translators; if (!e.title) e.title = w.title }
  return list
}
const gutenberg = (id: string, title: string, author: string, popularity = 100): Work => ({
  id, title, language: ['en'], popularity, authors: [{ name: author }],
  editions: [{ source: 'Gutenberg', epubUrl: `https://www.gutenberg.org/ebooks/${id.split(':')[1]}.epub3.images`, sourceUrl: null, licence: 'PD' }],
})
// The catalogue as if it had not matched Tinct's books itself (no onTinct), plus loose copies.
const catalogue = prepare([
  ...fixture.works.map(w => { const { onTinct: _o, tinctIds: _t, ...rest } = w as Work & { onTinct?: boolean; tinctIds?: string[] }; return rest as Work }),
  gutenberg('pg:90001', 'Pride and Prejudice: A Novel. In Three Volumes', 'Jane Austen', 900),
  gutenberg('pg:90002', 'The Odyssey of Homer, Volume 1', 'Homer', 800),
  gutenberg('pg:90003', 'Crime and Punishment; a Russian Realistic Novel', 'Fyodor Dostoyevsky', 700),
])
const engine = createSearch(catalogue)
const tinctBooks: Book[] = [
  { id: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: 'odyssey', title: 'The Odyssey', author: 'Homer' },
  { id: 'crime-and-punishment', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky' },
  { id: 'faust-part-1', title: 'Faust, Part One', author: 'Johann Wolfgang von Goethe' },
  { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius' },
]

describe('"Available in Tinct" with the catalogue engine', () => {
  const search = createLibrarySearch(tinctBooks)
  const titles = (query: string) => search(query).map((b: Book) => b.title)

  it('finds Tinct books from typos, other spellings and a leading article', () => {
    expect(titles('pride and prejudise')[0]).toBe('Pride and Prejudice')
    expect(titles('prdie prejudice')[0]).toBe('Pride and Prejudice')
    expect(titles('the oddysey')[0]).toBe('The Odyssey')
    expect(titles('odyssey')[0]).toBe('The Odyssey')
    expect(titles('dostoyevsky')).toEqual(['Crime and Punishment'])
    expect(titles('Fäust')[0]).toBe('Faust, Part One')
  })

  it('keeps every book the plain match found, and lists all books for an empty query', () => {
    expect(titles('')).toEqual(tinctBooks.map(b => b.title))
    expect(titles('pr')).toEqual(['Pride and Prejudice']) // two letters: the old substring match
    expect(titles('editations')).toEqual(['Meditations']) // a word inside a word
    expect(titles('zzzz')).toEqual([])
  })

  it('searches registry other titles as titles', () => {
    const own = createLibrarySearch([{ id: 'the-manual', title: 'The Manual', author: 'Epictetus' }, { id: 'kant', title: 'Groundwork of the Metaphysics of Morals', author: 'Immanuel Kant', altTitles: ['Fundamental Principles of the Metaphysic of Morals'] }])
    expect(own('enchiridion').map((b: Book) => b.id)).toEqual(['the-manual']) // curated (search.js ALT_TITLES)
    expect(own('fundamental principles').map((b: Book) => b.id)).toEqual(['kant'])
  })

  it('borrows popularity and other names from the same catalogue works', () => {
    const borrowed = borrowFor([...tinctBooks, { id: 'faust-part-1', title: 'Faust, Part One', author: 'Johann Wolfgang von Goethe', workIds: ['pg:14591'] }], catalogue)
    expect(borrowed['pride-and-prejudice'].popularity).toBe(223502)
    expect(borrowed['faust-part-1'].titles).toContain('Faust [part 1]. Translated Into English in the Original Metres')
    // Borrowed popularity orders books in the same tier: Pride and Prejudice (223,502) before Meditations (62,911).
    const ranked = createLibrarySearch(tinctBooks, borrowed)
    expect(ranked('and').map((b: Book) => b.id).slice(0, 2)).toEqual(['pride-and-prejudice', 'crime-and-punishment'])
    const growing = librarySearch(tinctBooks)
    expect(growing.lend(borrowed)).toBe(true)
    expect(growing.lend(borrowed)).toBe(false)
    expect(growing.filter('meditation')[0].id).toBe('meditations')
  })
})

describe('"Not yet in Tinct": no copy of a Tinct book', () => {
  it('recognises copies by loose title, author surname and part', () => {
    expect(looseTitle('Moby-Dick; or, The Whale')).toEqual({ base: 'moby dick', part: null })
    expect(looseTitle('The Strange Case of Dr. Jekyll and Mr. Hyde').base).toBe('dr jekyll and mr hyde')
    expect(looseTitle('The Divine Comedy, Volume 1, Hell')).toEqual({ base: 'divine comedy', part: '1' })
    expect(looseTitle('Henry IV, Part Two')).toEqual({ base: 'henry iv', part: '2' })
    expect(looseTitle('Faust: a Tragedy [part 1], Translated from the German of Goethe')).toEqual({ base: 'faust', part: null })
    const shelf = [{ id: 'divine-comedy', title: 'The Divine Comedy', author: 'Dante Alighieri' }, { id: 'henry-iv-part-2', title: 'Henry IV, Part 2', author: 'William Shakespeare' }, { id: 'jekyll', title: 'Dr Jekyll and Mr Hyde', author: 'Robert Louis Stevenson' }]
    expect(inTinct(gutenberg('pg:1', 'The Divine Comedy, Volume 1, Hell', 'Dante Alighieri'), shelf)).toBe(true) // a volume of a book Tinct has whole
    expect(inTinct(gutenberg('pg:2', 'King Henry IV, Part 1', 'William Shakespeare'), shelf)).toBe(false)
    expect(inTinct(gutenberg('pg:3', 'Henry IV, Part 1', 'William Shakespeare'), shelf)).toBe(false) // another part stays addable
    expect(inTinct(gutenberg('pg:4', 'Henry IV, Part Two', 'William Shakespeare'), shelf)).toBe(true)
    expect(inTinct(gutenberg('pg:5', 'The Strange Case of Dr. Jekyll and Mr. Hyde', 'Robert Louis Stevenson'), shelf)).toBe(true)
    expect(inTinct(gutenberg('pg:6', 'The Divine Comedy', 'Henry Wadsworth Longfellow'), shelf)).toBe(false) // another author
    expect(looseTitleAuthorKey('Persuasion', 'Jane Austen')).toBe(looseTitleAuthorKey('Persuasion: A Novel', 'Austen, Jane'))
  })

  it('shows one row per book: a second copy with the same loose title and author is left out', () => {
    const free = [gutenberg('pg:105', 'Persuasion', 'Jane Austen'), gutenberg('pg:106', 'Persuasion: A Novel', 'Jane Austen'), gutenberg('pg:107', 'Persuasion', 'Somebody Else')]
    expect(groupSearchResults({ tinct: [], free, tinctBooks }).notYet.map(w => w.id)).toEqual(['pg:105', 'pg:107'])
  })
})

describe('library search panel: a typo query', () => {
  class EngineWorker {
    onmessage: ((event: { data: unknown }) => void) | null = null
    onerror: (() => void) | null = null
    constructor(public url: string) {}
    postMessage(message: { type: string; request?: number; query?: string; filters?: Record<string, string>; limit?: number; books?: Book[] }) {
      queueMicrotask(() => {
        if (message.type === 'load') this.onmessage?.({ data: { type: 'ready', total: catalogue.length, sources: 1 } })
        if (message.type === 'search') this.onmessage?.({ data: { type: 'results', request: message.request, results: engine(message.query, message.filters, message.limit).results } })
        if (message.type === 'borrow') this.onmessage?.({ data: { type: 'borrowed', request: message.request, borrowed: borrowFor(message.books, catalogue) } })
      })
    }
  }
  beforeEach(() => { localStorage.setItem(INTERNAL_KEY, '1'); vi.stubGlobal('Worker', EngineWorker) })
  afterEach(() => { localStorage.removeItem(INTERNAL_KEY); vi.unstubAllGlobals() })
  const el = (tag: string, cls?: string, text?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e }

  for (const [query, title] of [['pride and prejudise', 'Pride and Prejudice'], ['the oddysey', 'The Odyssey'], ['dostoyevsky crime', 'Crime and Punishment']]) {
    it(`"${query}" shows ${title} in Tinct, and offers no catalogue copy of a Tinct book`, async () => {
      const search = librarySearch(tinctBooks)
      search.lend(await addToTinct.borrowFromCatalogue(tinctBooks))
      const tinct = search.filter(query)
      const box = document.createElement('div')
      document.body.append(box)
      addToTinct.renderSearchGroups(box, {
        query, tinct, tinctBooks, el, onAdd: () => {}, addingWork: null,
        renderTinct: (list: Book[]) => list.forEach(book => box.append(el('button', 'search-result', book.title))),
      })
      await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).not.toBe('pending'))
      expect(box.querySelector('.search-result')?.textContent).toBe(title)
      const offered = [...box.querySelectorAll('.free-add')].map(button => button.getAttribute('data-work'))
      // The engine does find the catalogue's copies; none of them is offered with Add.
      const found = engine(query, { language: 'en' }, 40).results.map((w: Work) => w.id)
      const copies = catalogue.filter((w: Work) => inTinct(w, tinctBooks)).map((w: Work) => w.id)
      expect(found.some((id: string) => copies.includes(id))).toBe(true)
      for (const id of offered) expect(copies, id ?? '').not.toContain(id)
      box.remove()
    })
  }
})
