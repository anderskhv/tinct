// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  EXCLUDED_SOURCES,
  IMPORT_SOURCES,
  addToTinctEnabled,
  allowedSourceUrl,
  groupSearchResults,
  importableWork,
  inTinct,
  isPublicBookId,
  mergePublicBooks,
  publicBookId,
  signedInCookie,
  titleAuthorKey,
  type CatalogueWork,
} from '../public/lab/public-books.js'
import { INTERNAL_KEY } from '../public/lab/internal-traffic.js'
// The page's head script: the wait ring the Add buttons and the own-file pop-up draw (TinctWait).
import '../public/lab/wait-ring.js'
// @ts-expect-error -- plain browser module of the library page
import * as addToTinct from '../public/lab/library_2/add-to-tinct.js'
import worker from './worker'

const work = (id: string, title: string, author: string, patch: Partial<CatalogueWork> = {}): CatalogueWork => ({
  id, title, language: ['en'], authors: [{ name: author }],
  editions: [{ source: 'Gutenberg', epubUrl: `https://www.gutenberg.org/ebooks/${id.split(':')[1]}.epub3.images`, sourceUrl: null, licence: 'PD' }],
  ...patch,
})
const memoryStore = (internal: boolean) => {
  const values = new Map<string, string>(internal ? [[INTERNAL_KEY, '1']] : [])
  return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v) }, removeItem: (k: string) => { values.delete(k) } }
}
const el = (tag: string, cls?: string, text?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e }

describe('signed-in gating', () => {
  afterEach(() => { document.documentElement.classList.remove('signed-in'); document.cookie = 'tinct_auth=; Max-Age=0; Path=/' })

  it('shows Add to Tinct to every signed-in reader and internal devices, never to signed-out visitors', () => {
    expect(addToTinctEnabled(memoryStore(false), false)).toBe(false)
    expect(addToTinctEnabled(memoryStore(false), true)).toBe(true)
    expect(addToTinctEnabled(memoryStore(true), false)).toBe(true)
    expect(addToTinctEnabled(memoryStore(true))).toBe(true)
  })

  it('falls back to the signed-in cookie when the page gives no account state', () => {
    expect(signedInCookie('a=1; tinct_auth=1; b=2')).toBe(true)
    expect(signedInCookie('tinct_auth=0')).toBe(false)
    expect(signedInCookie('')).toBe(false)
    expect(addToTinctEnabled(memoryStore(false))).toBe(false)
    document.cookie = 'tinct_auth=1; Path=/'
    expect(addToTinctEnabled(memoryStore(false))).toBe(true)
    // The page's own state wins over a stale cookie.
    expect(addToTinctEnabled(memoryStore(false), false)).toBe(false)
  })

  it('follows the library page: signed in shows it, signed out (even with a stale cookie) does not', () => {
    localStorage.removeItem(INTERNAL_KEY)
    document.cookie = 'tinct_auth=1; Path=/'
    expect(addToTinct.enabled()).toBe(false)
    document.documentElement.classList.add('signed-in')
    expect(addToTinct.enabled()).toBe(true)
  })

  it('leaves the library search and catalogue untouched for a signed-out visitor', async () => {
    localStorage.removeItem(INTERNAL_KEY)
    expect(addToTinctEnabled()).toBe(false)
    expect(addToTinct.enabled()).toBe(false)
    expect(await addToTinct.searchFree('pride')).toEqual([])
    const catalogue = { books: [{ id: 'odyssey' }], houses: [] }
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await addToTinct.withPublicBooks(catalogue)).toBe(catalogue)
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  // QA 2026-10-09: a guest's /library?book=pd-pg-1672 (Gorgias) showed Frankenstein; the signed-out catalogue had no added books.
  it('gives a signed-out visitor the added book a link names, and only that one', async () => {
    localStorage.removeItem(INTERNAL_KEY)
    expect(addToTinct.enabled()).toBe(false)
    const catalogue = { books: [{ id: 'odyssey' }], houses: [] }
    const gorgias = { id: 'pd-pg-1672', title: 'Gorgias', shelfIds: ['philosophy'], placement: [{ houseId: 'ideas', houseTitle: 'Ideas', houseSubtitle: '', houseHue: 200, shelfId: 'philosophy', shelfTitle: 'Philosophy', shelfSubtitle: '', shelfHue: 200 }] }
    const fetchSpy = vi.fn(async (url: string) => url === '/api/public-books/pd-pg-1672' ? Response.json({ book: { id: 'pd-pg-1672' }, entry: gorgias }) : new Response('', { status: 404 }))
    vi.stubGlobal('fetch', fetchSpy)
    try {
      for (const link of ['/library?book=pd-pg-1672', '/read/pd-pg-1672/']) {
        window.history.replaceState(null, '', link)
        expect(addToTinct.linkedPublicBook()).toBe('pd-pg-1672')
        const merged = await addToTinct.withPublicBooks(catalogue)
        expect(merged.books.map((book: { id: string }) => book.id)).toEqual(['odyssey', 'pd-pg-1672'])
        expect(merged.houses[0]).toMatchObject({ id: 'ideas', shelves: [{ id: 'philosophy', bookIds: ['pd-pg-1672'] }] })
      }
      expect(fetchSpy.mock.calls).toEqual([['/api/public-books/pd-pg-1672', { cache: 'no-cache' }], ['/api/public-books/pd-pg-1672', { cache: 'no-cache' }]])
      // A registry book's link, or no book, asks for nothing.
      for (const link of ['/library?book=frankenstein', '/library']) {
        window.history.replaceState(null, '', link)
        expect(addToTinct.linkedPublicBook()).toBeNull()
        expect(await addToTinct.withPublicBooks(catalogue)).toBe(catalogue)
      }
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      // A book that is not there leaves the catalogue as it was.
      window.history.replaceState(null, '', '/library?book=pd-pg-9999')
      expect(await addToTinct.withPublicBooks(catalogue)).toBe(catalogue)
    } finally {
      window.history.replaceState(null, '', '/')
      vi.unstubAllGlobals()
    }
  })
})

describe('public book ids and importable works', () => {
  it('derives a stable pd- id per work, lossless when it can be', () => {
    expect(publicBookId('pg:1342')).toBe('pd-pg-1342')
    expect(publicBookId('ws:da:Q100788221')).toMatch(/^pd-ws-da-q100788221-[a-z0-9]+$/)
    expect(publicBookId('ws:da:Q100788221')).toBe(publicBookId('ws:da:Q100788221'))
    expect(publicBookId('ws:da:Q100788221')).not.toBe(publicBookId('ws:da:Q100788222'))
    const long = publicBookId('bb:' + 'a_very_long_title_'.repeat(8))!
    expect(isPublicBookId(long)).toBe(true)
    expect(long.length).toBeLessThanOrEqual(64)
    expect(publicBookId('nonsense')).toBeNull()
    expect(isPublicBookId('pride-and-prejudice')).toBe(false)
  })

  it('accepts only allowlisted hosts over https, offered languages, and EPUB links', () => {
    expect(allowedSourceUrl('Gutenberg', 'https://www.gutenberg.org/x.epub')).toBe(true)
    expect(allowedSourceUrl('Gutenberg', 'http://www.gutenberg.org/x.epub')).toBe(false)
    expect(allowedSourceUrl('Gutenberg', 'https://gutenberg.org.evil.example/x.epub')).toBe(false)
    expect(allowedSourceUrl('Gutenberg', 'https://user:pw@www.gutenberg.org/x.epub')).toBe(false)
    expect(allowedSourceUrl('Wikisource', 'https://www.gutenberg.org/x.epub')).toBe(false)
    expect(allowedSourceUrl('DBNL', 'https://www.dbnl.org/x.epub')).toBe(false)
    expect(importableWork(work('pg:1', 'A', 'B'))).toBe(true)
    expect(importableWork(work('pg:1', 'A', 'B', { language: ['fr'] }))).toBe(false)
    expect(importableWork(work('pg:1', 'A', 'B', { editions: [{ source: 'Gutenberg', epubUrl: null }] }))).toBe(false)
    // Every allowlisted library names at least one host; excluded libraries are refused.
    for (const [source, entry] of Object.entries(IMPORT_SOURCES)) expect(entry.hosts.length, source).toBeGreaterThan(0)
    for (const source of EXCLUDED_SOURCES) expect(allowedSourceUrl(source, `https://${IMPORT_SOURCES[source]?.hosts[0]}/x.epub`)).toBe(false)
  })
})

describe('search grouping and dedupe', () => {
  const tinctBooks = [
    { id: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen' },
    { id: 'pd-pg-2701', title: 'Moby Dick', author: 'Herman Melville', public: { workId: 'pg:2701' } },
    { id: 'the-odyssey', title: 'The Odyssey', author: 'Homer' },
  ]
  it('keeps "Available in Tinct" as it was and leaves out works already in Tinct', () => {
    const tinct = [tinctBooks[0]]
    const free = [
      work('pg:1342', 'Pride and Prejudice', 'Jane Austen', { onTinct: true, tinctIds: ['pride-and-prejudice'] }),
      work('pg:42671', 'PRIDE & PREJUDICE.', 'Austen, Jane'), // same title and author, other spelling
      work('pg:44024', 'Art of War', 'Sun Tzu'), // a Gutenberg number the registry names
      work('pg:2701', 'Moby-Dick; or, The Whale', 'Herman Melville'), // already added
      work('pg:1', 'Odyssey', 'Homer'), // "The" ignored
      work('pg:105', 'Persuasion', 'Jane Austen'),
      work('pg:105', 'Persuasion', 'Jane Austen'), // duplicate result
      work('pg:121', 'Northanger Abbey', 'Jane Austen', { language: ['de'] }),
      work('dbnl:x', 'Emma', 'Jane Austen', { editions: [{ source: 'DBNL', epubUrl: 'https://www.dbnl.org/x.epub' }] }),
      work('pg:158', 'Emma', 'Jane Austen'),
    ]
    const { available, notYet } = groupSearchResults({ tinct, free, tinctBooks })
    expect(available).toBe(tinct)
    expect(notYet.map(w => w.id)).toEqual(['pg:105', 'pg:158'])
    expect(groupSearchResults({ tinct, free, tinctBooks, limit: 1 }).notYet.map(w => w.id)).toEqual(['pg:105'])
    expect(titleAuthorKey('The Pride & Prejudice!', 'Jane  Austen')).toBe(titleAuthorKey('Pride and Prejudice', 'Austen, Jane'))
    expect(inTinct(work('pg:3', 'Moby Dick', 'Herman Melville'), tinctBooks)).toBe(true)
  })

  it("leaves out Goethe's Faust, Part One: its Gutenberg source and the same title with the part as a numeral", () => {
    const library = [{ id: 'faust-part-1', title: 'Faust, Part One', author: 'Johann Wolfgang von Goethe' }]
    const goethe = 'Johann Wolfgang von Goethe'
    expect(inTinct(work('pg:14591', 'Faust [part 1]. Translated Into English in the Original Metres', goethe), library)).toBe(true)
    expect(inTinct(work('pg:3023', 'Faust — Part 1', goethe), library)).toBe(true)
    expect(titleAuthorKey('Faust, Part One', goethe)).toBe(titleAuthorKey('Faust — Part 1', goethe))
    expect(titleAuthorKey('Henry IV, Part Two', 'Shakespeare')).not.toBe(titleAuthorKey('Henry IV, Part 1', 'Shakespeare'))
    // Other translations and Marlowe stay addable.
    const free = [work('pg:14591', 'Faust [part 1]. Translated Into English in the Original Metres', goethe), work('pg:3023', 'Faust — Part 1', goethe),
      work('pg:14460', 'Faust: a Tragedy [part 1], Translated from the German of Goethe', goethe), work('pg:779', 'The Tragical History of Doctor Faustus', 'Christopher Marlowe')]
    expect(groupSearchResults({ tinct: [], free, tinctBooks: library }).notYet.map(w => w.id)).toEqual(['pg:14460', 'pg:779'])
  })

  it('adds added books to the library catalogue on their shelves, creating a shelf the registry leaves empty', () => {
    const catalogue = { books: [{ id: 'odyssey' }], houses: [{ id: 'novel', title: 'Fiction', subtitle: '', hue: 25, shelves: [{ id: 'english-novels', title: 'E', subtitle: '', hue: 1, bookIds: ['jane-eyre'] }] }] }
    const merged = mergePublicBooks(catalogue, [
      { id: 'pd-pg-1', shelfIds: ['english-novels'], placement: [{ houseId: 'novel', houseTitle: 'Fiction', houseSubtitle: '', houseHue: 25, shelfId: 'english-novels', shelfTitle: 'E', shelfSubtitle: '', shelfHue: 1 }] },
      { id: 'pd-pg-2', shelfIds: ['ancient-history'], placement: [{ houseId: 'history', houseTitle: 'History', houseSubtitle: 'The first historians', houseHue: 60, shelfId: 'ancient-history', shelfTitle: 'Ancient History', shelfSubtitle: '', shelfHue: 60 }] },
      { id: 'odyssey', shelfIds: [] }, // never replaces a registry book
    ])
    expect(merged.books.map(b => b.id)).toEqual(['odyssey', 'pd-pg-1', 'pd-pg-2'])
    const houses = merged.houses as Array<{ id: string; shelves: Array<{ id: string; bookIds: string[] }> }>
    expect(houses[0].shelves[0].bookIds).toEqual(['jane-eyre', 'pd-pg-1'])
    expect(houses[1]).toMatchObject({ id: 'history', shelves: [{ id: 'ancient-history', bookIds: ['pd-pg-2'] }] })
    expect(catalogue.houses[0].shelves[0].bookIds).toEqual(['jane-eyre'])
  })
})

describe('library search panel with the flag', () => {
  class FakeWorker {
    onmessage: ((event: { data: unknown }) => void) | null = null
    onerror: (() => void) | null = null
    constructor(public url: string) { FakeWorker.last = this }
    static last: FakeWorker | null = null
    static results: CatalogueWork[] = []
    static searches: Array<{ query: string; filters: unknown; limit: number }> = []
    postMessage(message: { type: string; request?: number; query?: string; filters?: unknown; limit?: number }) {
      if (message.type === 'search') FakeWorker.searches.push({ query: message.query!, filters: message.filters, limit: message.limit! })
      queueMicrotask(() => {
        if (message.type === 'load') this.onmessage?.({ data: { type: 'ready', total: 3, sources: 1 } })
        if (message.type === 'search') this.onmessage?.({ data: { type: 'results', request: message.request, total: FakeWorker.results.length, results: FakeWorker.results } })
      })
    }
  }
  beforeEach(() => { localStorage.setItem(INTERNAL_KEY, '1'); vi.stubGlobal('Worker', FakeWorker) })
  afterEach(() => { localStorage.removeItem(INTERNAL_KEY); vi.unstubAllGlobals() })

  it('renders Available in Tinct, Not yet in Tinct with Add, and the file box', async () => {
    FakeWorker.results = [work('pg:1342', 'Pride and Prejudice', 'Jane Austen', { onTinct: true }), work('pg:105', 'Persuasion', 'Jane Austen'), work('ws:en:Q1', 'Lady Susan', 'Jane Austen', { editions: [{ source: 'Wikisource', epubUrl: 'https://ws-export.wmcloud.org/?format=epub&page=Lady_Susan' }] })]
    const box = document.createElement('div')
    document.body.append(box) // results for a panel no longer on screen are dropped
    const added: string[] = [], freeShown: number[] = []
    addToTinct.renderSearchGroups(box, {
      query: 'austen', onFreeShown: (n: number) => freeShown.push(n), tinct: [{ id: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen' }],
      tinctBooks: [{ id: 'pride-and-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen' }],
      renderTinct: (list: Array<{ title: string }>) => list.forEach(book => box.append(el('button', 'search-result', book.title))), el,
      onAdd: (w: CatalogueWork) => added.push(w.id), addingWork: null,
    })
    expect(FakeWorker.last?.url).toBe('/lab/addbook/js/search-worker.js?v=20261009rel10')
    await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).not.toBe('pending'))
    expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('2')
    expect(freeShown).toEqual([2]) // the panel's "N books found" counts these rows too (app.js)
    expect([...box.querySelectorAll('.search-group-head')].map(h => h.textContent)).toEqual(['Available in Tinct', 'Not yet in Tinct'])
    expect(box.querySelector('.search-result')?.textContent).toBe('Pride and Prejudice')
    const rows = [...box.querySelectorAll('.free-row')]
    expect(rows.map(row => `${row.querySelector('.row-title')?.textContent} · ${row.querySelector('.row-by')?.textContent}`)).toEqual(['Persuasion · Jane Austen', 'Lady Susan · Jane Austen'])
    // The source is a small pill just left of Add (approved search layout, 2026-10-08).
    expect(rows.map(row => [...row.querySelectorAll('.source-pill')].map(pill => pill.textContent))).toEqual([['Gutenberg'], ['Wikisource']])
    expect(rows.map(row => row.querySelector('.source-pill')?.parentElement?.nextElementSibling?.className)).toEqual(['free-add', 'free-add'])
    ;(rows[0].querySelector('.free-add') as HTMLButtonElement).click()
    expect(added).toEqual(['pg:105'])
    expect(rows[0].querySelector('.free-add')?.getAttribute('aria-label')).toBe('Add Persuasion to Tinct')
    const file = box.querySelector('.file-box')!
    expect(box.lastElementChild).toBe(file)
    expect(file.querySelector('p')?.textContent).toBe('Have it as a file?')
    // The "Your own book" pop-up (its link is My shelf, never Add a book's old start page).
    expect(file.querySelector('a')?.getAttribute('href')).toBe('/library#my-shelf')
    expect(file.querySelector('a')?.textContent).toBe('Add a PDF or EPUB')
  })

  it('asks the catalogue for the language books can be added in, or the one the reader chose', async () => {
    const results = FakeWorker.results // the page's one worker keeps answering later tests with these
    FakeWorker.results = []
    FakeWorker.searches = []
    const box = document.createElement('div')
    document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'faust', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('0'))
    expect(FakeWorker.searches).toEqual([{ query: 'faust', filters: { language: 'en' }, limit: 40 }])
    await addToTinct.searchFree('faust', 40, { language: 'de' })
    await addToTinct.searchFree('faust')
    expect(FakeWorker.searches.slice(1).map(s => s.filters)).toEqual([{ language: 'de' }, {}])
    box.remove()
    FakeWorker.results = results
  })

  it('turns Add into a spinner while its import runs: busy, disabled, row dimmed, the step shown, then back', async () => {
    FakeWorker.results = [work('pg:105', 'Persuasion', 'Jane Austen'), work('pg:121', 'Northanger Abbey', 'Jane Austen')]
    const box = document.createElement('div')
    document.body.append(box)
    const added: string[] = []
    addToTinct.renderSearchGroups(box, { query: 'austen', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: (w: CatalogueWork) => added.push(w.id), addingWork: null })
    await vi.waitFor(() => expect(box.querySelectorAll('.free-row')).toHaveLength(2))
    const row = box.querySelector('.free-row') as HTMLElement
    const button = row.querySelector('.free-add') as HTMLButtonElement
    addToTinct.setAddBusy(button, 'start')
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    // The reader's ring (wait-ring.js) after its moment, never a flash for quick work; before it "Add" stays.
    expect(button.querySelector('svg.tinct-wait-ring')).toBeNull()
    expect(button.textContent).toBe('Add')
    await vi.waitFor(() => expect(button.querySelector('svg.tinct-wait-ring')).not.toBeNull())
    // No new visible words: the ring replaces "Add", the existing "Adding…" is for screen readers only.
    expect(button.querySelector('.tinct-wait-label')?.textContent).toBe('Adding…')
    expect(button.getAttribute('aria-label')).toBe('Add Persuasion to Tinct')
    expect(row.classList.contains('is-adding')).toBe(true)
    expect(row.getAttribute('aria-busy')).toBe('true')
    const bar = () => row.querySelector('.free-progress') as HTMLElement
    expect(bar().getAttribute('aria-hidden')).toBe('true')
    const steps: string[] = []
    for (const stage of ['download', 'convert', 'publish']) { addToTinct.setAddBusy(button, stage); steps.push(bar().style.getPropertyValue('--p')) }
    expect(steps.map(Number)).toEqual([...steps.map(Number)].sort((a, b) => a - b))
    expect(Number(steps[2])).toBeLessThan(1)
    expect(row.querySelectorAll('.free-progress')).toHaveLength(1)
    expect(button.querySelectorAll('svg')).toHaveLength(1)
    // A disabled button cannot be clicked twice.
    button.click()
    expect(added).toEqual([])
    addToTinct.setAddBusy(button, null)
    expect(button.disabled).toBe(false)
    expect(button.hasAttribute('aria-busy')).toBe(false)
    expect(button.textContent).toBe('Add')
    expect(row.classList.contains('is-adding')).toBe(false)
    expect(row.querySelector('.free-progress')).toBeNull()
    box.remove()
  })

  it('renders the row being added busy again when the results are drawn anew', async () => {
    FakeWorker.results = [work('pg:105', 'Persuasion', 'Jane Austen'), work('pg:121', 'Northanger Abbey', 'Jane Austen')]
    const box = document.createElement('div')
    document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'austen', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: 'pg:121', addingStage: 'convert' })
    await vi.waitFor(() => expect(box.querySelectorAll('.free-row')).toHaveLength(2))
    const [other, adding] = [...box.querySelectorAll('.free-add')] as HTMLButtonElement[]
    expect(adding.getAttribute('aria-busy')).toBe('true')
    expect(adding.disabled).toBe(true)
    expect((adding.closest('.free-row')!.querySelector('.free-progress') as HTMLElement).dataset.stage).toBe('convert')
    expect(other.disabled).toBe(false)
    expect(other.textContent).toBe('Add')
    box.remove()
  })

  it('leaves out an empty "Available in Tinct" when the catalogue has books, and keeps the empty state when nothing is found', async () => {
    FakeWorker.results = [work('pg:105', 'Persuasion', 'Jane Austen')]
    const box = document.createElement('div')
    document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'persuasion', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('1'))
    expect([...box.querySelectorAll('.search-group-head')].map(h => h.textContent)).toEqual(['Not yet in Tinct'])
    expect(box.querySelector('.search-none')).toBeNull()
    box.remove()
    FakeWorker.results = []
    const none = document.createElement('div')
    document.body.append(none)
    addToTinct.renderSearchGroups(none, { query: 'zzzz', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(none.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('0'))
    expect([...none.querySelectorAll('.search-group-head')].map(h => h.textContent)).toEqual(['Available in Tinct'])
    expect(none.querySelector('.search-none')?.textContent).toBe('Try another title or author.')
    none.remove()
  })

  it('rows: author line with translator and other editions; tapping the row (not Add) opens the details in place, again or Escape closes', async () => {
    FakeWorker.results = [
      work('pg:3794', 'L. Annaeus Seneca on Benefits', 'Lucius Annaeus Seneca', { translators: [{ name: 'Aubrey Stewart' }], firstPublishedYear: 1887, subtitle: 'Seven books', authors: [{ name: 'Lucius Annaeus Seneca', deathYear: 65 }] }),
      work('pg:10001', 'Apocolocyntosis', 'Lucius Annaeus Seneca', { firstPublishedYear: 54, authors: [{ name: 'Lucius Annaeus Seneca', birthYear: -4, deathYear: 65 }] }),
      work('ws:en:Q2', 'Apocolocyntosis', 'Seneca', { wikidata: 'Q1', editions: [{ source: 'Wikisource', epubUrl: 'https://ws-export.wmcloud.org/?format=epub&page=A' }] }),
    ]
    FakeWorker.results[1].wikidata = 'Q1'
    const box = document.createElement('div')
    document.body.append(box)
    const added: string[] = []
    addToTinct.renderSearchGroups(box, { query: 'benefits', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: (w: CatalogueWork) => added.push(w.id), addingWork: null })
    await vi.waitFor(() => expect(box.querySelectorAll('.free-row')).toHaveLength(2))
    const [first, second] = [...box.querySelectorAll('.free-row')] as HTMLElement[]
    expect(first.querySelector('.row-author')?.textContent).toBe('Lucius Annaeus Seneca · tr. Aubrey Stewart')
    expect(second.querySelector('.row-author')?.textContent).toBe('Lucius Annaeus Seneca · +1 edition')
    const toggle = first.querySelector('.row-toggle') as HTMLButtonElement
    const details = first.querySelector('.row-details') as HTMLElement
    expect(toggle.tagName).toBe('BUTTON')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.getAttribute('aria-controls')).toBe(details.id)
    expect(details.hidden).toBe(true)
    ;(first.querySelector('.free-add') as HTMLButtonElement).click()
    expect(added).toEqual(['pg:3794'])
    expect(toggle.getAttribute('aria-expanded')).toBe('false') // Add never opens the details
    toggle.click()
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(details.hidden).toBe(false)
    // Written only when it is no later than the author's death (1887 is the translation's year).
    expect([...details.querySelectorAll('dt')].map(dt => dt.textContent)).toEqual(['Translation', 'Source', 'Note'])
    expect([...details.querySelectorAll('dd')].map(dd => dd.textContent)).toEqual(['Aubrey Stewart', 'Project Gutenberg', 'Seven books'])
    expect(details.querySelector('.row-description')).toBeNull() // no description in the data: none is written
    // The Add button stays in the row's first line, before the details.
    expect(first.querySelector('.free-add')?.nextElementSibling).toBe(details)
    toggle.click()
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(details.hidden).toBe(true)
    ;(second.querySelector('.row-toggle') as HTMLButtonElement).click()
    // Written as the library writes an approximate early date (book-metadata.js eraLabel), not a bare "54" (search audit, 2026-10-08).
    expect([...second.querySelectorAll('dd')].map(dd => dd.textContent)[0]).toBe('c. 54 AD')
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    second.querySelector('.row-toggle')!.dispatchEvent(escape)
    expect(escape.defaultPrevented).toBe(true) // the panel stays open: Escape only closes the row
    expect(second.querySelector('.row-toggle')?.getAttribute('aria-expanded')).toBe('false')
    box.remove()
  })

  it('an author card leads for "seneca" (catalogue only) and "plato" (with Tinct books); chips open their rows', async () => {
    const seneca = (id: string, title: string, name = 'Lucius Annaeus Seneca') => work(id, title, name, { authors: [{ name, birthYear: -4, deathYear: 65 }] })
    FakeWorker.results = [seneca('ws:en:Q97452599', 'Moral letters to Lucilius', 'Seneca'), seneca('pg:3794', 'On Benefits'), seneca('pg:10001', 'Apocolocyntosis')]
    const box = document.createElement('div')
    document.body.append(box)
    const portraits: string[][] = []
    addToTinct.renderSearchGroups(box, { query: 'seneca', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null, portraitFor: async (names: string[]) => { portraits.push(names); return null } })
    await vi.waitFor(() => expect(box.querySelector('.author-card')).not.toBeNull())
    const card = box.querySelector('.author-card')!
    expect(box.firstElementChild).toBe(card)
    expect(card.querySelector('.author-name')?.textContent).toBe('Seneca')
    expect(card.querySelector('.author-subtitle')?.textContent).toBe('4 BC – AD 65')
    expect(card.querySelector('.author-portrait img')).toBeNull() // a plain circle without a portrait
    expect(portraits[0]).toContain('Lucius Annaeus Seneca')
    expect([...card.querySelectorAll('.author-work')].map(chip => chip.textContent)).toEqual(['Moral letters to Lucilius', 'On Benefits', 'Apocolocyntosis'])
    expect([...box.querySelectorAll('.search-group-head')].map(h => h.textContent)).toEqual(['Not yet in Tinct'])
    ;(card.querySelectorAll('.author-work')[1] as HTMLButtonElement).click()
    const row = box.querySelector('.result-row[data-row-key="work:pg:3794"]')!
    expect(row.querySelector('.row-toggle')?.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(row.querySelector('.row-toggle'))
    box.remove()

    const plato = (id: string, title: string) => work(id, title, 'Plato', { authors: [{ name: 'Plato', birthYear: -428, deathYear: -348 }] })
    FakeWorker.results = [plato('pg:150', 'The Republic'), plato('pg:1672', 'Gorgias'), plato('pg:1750', 'Laws')]
    const republic = { id: 'the-republic', title: 'The Republic', author: 'Plato', summary: 'A night of questions about justice.', displayYear: 'c. 375 BC', editions: [{ key: 'original-en', language: 'en', translator: 'Benjamin Jowett', availability: { chapterText: true, audio: true } }, { key: 'modern-en', language: 'en', translator: null, availability: { chapterText: true, audio: false } }] }
    const crito = { id: 'crito', title: 'Crito', author: 'Plato', editions: [] }
    const library = [republic, crito, { id: 'odyssey', title: 'The Odyssey', author: 'Homer' }]
    const box2 = document.createElement('div')
    document.body.append(box2)
    const opened: string[] = []
    addToTinct.renderSearchGroups(box2, {
      query: 'plato', tinct: [republic, crito], tinctBooks: library, el, onAdd: () => {}, addingWork: null,
      renderTinct: (list: typeof library) => { const rows = el('ol', 'tinct-list'); for (const book of list) rows.append(addToTinct.tinctRow(book, { el, cover: document.createElement('canvas'), onOpen: (b: { id: string }) => opened.push(b.id), length: '~10.5 hours to read' })); box2.append(rows) },
      portraitFor: async (names: string[]) => names.includes('Plato') ? { src: '/lab/library_2/assets/author-flaps/plato.png' } : null,
    })
    await vi.waitFor(() => expect(box2.querySelector('.author-card .author-portrait img')).not.toBeNull())
    const card2 = box2.querySelector('.author-card')!
    expect(card2.querySelector('.author-name')?.textContent).toBe('Plato')
    expect(card2.querySelector('.author-subtitle')?.textContent).toBe('428–348 BC · 2 books in Tinct')
    expect([...card2.querySelectorAll('.author-work')].map(chip => chip.textContent)).toEqual(['The Republic', 'Gorgias', 'Laws', 'Crito'])
    expect([...box2.querySelectorAll('.search-group-head')].map(h => h.textContent)).toEqual(['Available in Tinct', 'Not yet in Tinct'])
    // A Tinct book's row: the edition pills, Read (opens the book as its cover does), and its details.
    const tinctRow = box2.querySelector('.tinct-row')!
    expect([...tinctRow.querySelectorAll('.source-pill')].map(pill => pill.textContent)).toEqual(['Modern English', 'Audio'])
    expect(tinctRow.querySelector('.row-author')?.textContent).toBe('Plato · tr. Benjamin Jowett')
    ;(tinctRow.querySelector('.tinct-open') as HTMLButtonElement).click()
    expect(opened).toEqual(['the-republic'])
    ;(card2.querySelector('.author-work') as HTMLButtonElement).click()
    expect(tinctRow.querySelector('.row-toggle')?.getAttribute('aria-expanded')).toBe('true')
    expect(tinctRow.querySelector('.row-description')?.textContent).toBe('A night of questions about justice.')
    expect([...tinctRow.querySelectorAll('dt')].map(dt => dt.textContent)).toEqual(['Written', 'Translation', 'Length'])
    box2.remove()
  })

  it('a collection: "Includes <work>" on its row, and its best-known works as the author card\'s chips, each opening its row', async () => {
    const seneca = { name: 'Lucius Annaeus Seneca', birthYear: -4, deathYear: 65 }
    const dialogues = work('pg:64576', 'Minor Dialogues, Together With the Dialogue on Clemency', 'Lucius Annaeus Seneca', { authors: [seneca], fame: 3.56, contains: [{ title: 'On Providence', fame: 3.34 }, { title: 'On the Happy Life', fame: 3.53 }, { title: 'To Marcia, On Consolation', fame: 0 }, { title: 'On the Shortness of Life', fame: 3.59 }] } as Partial<CatalogueWork>)
    FakeWorker.results = [
      work('ws:en:Q97452599', 'Moral letters to Lucilius', 'Seneca', { authors: [{ ...seneca, name: 'Seneca' }], fame: 3.69, contains: [] } as Partial<CatalogueWork>),
      dialogues,
      work('pg:57999', 'The Tragedies of Seneca', 'Lucius Annaeus Seneca', { authors: [seneca], fame: 3.2, contains: [{ title: 'Medea', fame: 0 }] } as Partial<CatalogueWork>),
    ]
    const box = document.createElement('div')
    document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'seneca', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box.querySelector('.author-card')).not.toBeNull())
    const chips = [...box.querySelectorAll('.author-work')] as HTMLButtonElement[]
    // The collection's works with a known fame stand in for it; a work without one (To Marcia) is no chip.
    expect(chips.map(chip => chip.textContent)).toEqual(['Moral letters to Lucilius', 'On the Shortness of Life', 'On the Happy Life', 'On Providence', 'The Tragedies of Seneca'])
    expect(chips.map(chip => chip.dataset.rowKey)).toEqual(['work:ws:en:Q97452599', 'work:pg:64576', 'work:pg:64576', 'work:pg:64576', 'work:pg:57999'])
    chips[1].click()
    expect(box.querySelector('.result-row[data-row-key="work:pg:64576"] .row-toggle')?.getAttribute('aria-expanded')).toBe('true')
    expect(box.querySelector('.row-includes')).toBeNull() // "seneca" asks for no work inside one
    box.remove()

    FakeWorker.results = [{ ...dialogues, includes: 'On Anger' } as CatalogueWork]
    const box2 = document.createElement('div')
    document.body.append(box2)
    addToTinct.renderSearchGroups(box2, { query: 'seneca on anger', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box2.querySelectorAll('.free-row')).toHaveLength(1))
    expect(box2.querySelector('.free-row .row-author')?.textContent).toBe('Lucius Annaeus Seneca · Includes On Anger')
    expect(box2.querySelector('.author-card')).toBeNull() // a title query
    box2.remove()

    // Once a reader has added it, the Tinct row says so too (from the query, in the page).
    const added = { id: 'pd-pg-64576', title: dialogues.title, author: 'Lucius Annaeus Seneca', editions: [] }
    const row = addToTinct.tinctRow(added, { el, cover: document.createElement('canvas'), onOpen: () => {}, query: 'peace of mind seneca' })
    expect(row.querySelector('.row-author')?.textContent).toBe('Lucius Annaeus Seneca · Includes Peace of Mind')
  })

  it('shows no author card for a title query', async () => {
    FakeWorker.results = [work('pg:1', 'Emma', 'Jane Austen'), work('pg:2', 'Emma McChesney & Co.', 'Edna Ferber')]
    const box = document.createElement('div')
    document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'emma', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).not.toBe('pending'))
    expect(box.querySelector('.author-card')).toBeNull()
    box.remove()
  })

  it('shows only the library and the file box for an empty query', () => {
    const box = document.createElement('div')
    addToTinct.renderSearchGroups(box, { query: '', tinct: [{ title: 'A' }], tinctBooks: [], renderTinct: (list: Array<{ title: string }>) => list.forEach(b => box.append(el('button', 'search-result', b.title))), el, onAdd: () => {}, addingWork: null })
    expect(box.querySelector('.search-group-head')).toBeNull()
    expect([...box.children].map(c => c.className)).toEqual(['search-result', 'file-box'])
  })
})

describe('search filters', () => {
  type Ed = { key: string; language: string; discoveryAvailable?: boolean; audioHeld?: boolean; availability: { chapterText: boolean; audio: boolean } }
  const ed = (key: string, language: string, audio = false, patch: Partial<Ed> = {}): Ed => ({ key, language, availability: { chapterText: true, audio }, ...patch })
  const library = [
    { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', editions: [ed('original-en', 'en', true), ed('modern-en', 'en', true)] },
    { id: 'faust-part-1', title: 'Faust', author: 'Goethe', editions: [ed('original-de', 'de'), ed('modern-en', 'en')] },
    { id: 'death-of-ivan-ilyich', title: 'The Death of Ivan Ilyich', author: 'Leo Tolstoy', editions: [ed('original-en', 'en'), ed('original-ru', 'ru')] },
    // Danish is out of discovery; a held recording or a withheld edition does not count.
    { id: 'held', title: 'Held', author: 'X', editions: [ed('original-en', 'en', true, { audioHeld: true }), ed('modern-en', 'en', false, { discoveryAvailable: false }), ed('modern-da', 'da', true)] },
    { id: 'pd-pg-1', title: 'Added', author: 'Y', editions: [ed('original-en', 'en')] },
    { id: 'loading', title: 'Not attached yet', author: 'Z' },
  ]
  const ids = (list: Array<{ id: string }>) => list.map(book => book.id)
  const none = { modern: false, audio: false, language: '' }

  it('reads Modern English, Audio and languages from the editions the library already loaded', () => {
    expect(addToTinct.bookFacts(library[0])).toEqual({ modern: true, audio: true, languages: ['en'] })
    expect(addToTinct.bookFacts(library[1])).toEqual({ modern: true, audio: false, languages: ['de', 'en'] })
    expect(addToTinct.bookFacts(library[3])).toEqual({ modern: false, audio: false, languages: ['en'] })
    expect(addToTinct.bookFacts(library[5])).toEqual({ modern: false, audio: false, languages: [] })
    expect(addToTinct.libraryLanguages(library).map(addToTinct.languageName)).toEqual(['English', 'German', 'Russian'])
  })

  it('narrows Available in Tinct: every filter set must hold, none set leaves the list as it was', () => {
    expect(addToTinct.filterAvailable(library, none)).toBe(library)
    expect(ids(addToTinct.filterAvailable(library, { ...none, modern: true }))).toEqual(['frankenstein', 'faust-part-1'])
    expect(ids(addToTinct.filterAvailable(library, { ...none, audio: true }))).toEqual(['frankenstein'])
    expect(ids(addToTinct.filterAvailable(library, { ...none, language: 'de' }))).toEqual(['faust-part-1'])
    expect(ids(addToTinct.filterAvailable(library, { ...none, language: 'ru' }))).toEqual(['death-of-ivan-ilyich'])
    expect(ids(addToTinct.filterAvailable(library, { ...none, language: 'da' }))).toEqual([])
    expect(ids(addToTinct.filterAvailable(library, { modern: true, audio: false, language: 'de' }))).toEqual(['faust-part-1'])
    expect(ids(addToTinct.filterAvailable(library, { modern: true, audio: true, language: 'de' }))).toEqual([])
  })

  it('leaves Not yet in Tinct out for Modern English or Audio, and keeps works in the chosen language', () => {
    const works = [work('pg:105', 'Persuasion', 'Jane Austen'), work('pg:2', 'Faust', 'Goethe', { language: ['de'] }), work('pg:3', 'No language', 'X', { language: undefined })]
    expect(addToTinct.filterNotYet(works, none)).toBe(works)
    expect(addToTinct.filterNotYet(works, { ...none, modern: true })).toEqual([])
    expect(addToTinct.filterNotYet(works, { ...none, audio: true, language: 'en' })).toEqual([])
    expect(ids(addToTinct.filterNotYet(works, { ...none, language: 'en' }))).toEqual(['pg:105'])
  })

  describe('chips in the search panel', () => {
    class FakeWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null
      onerror: (() => void) | null = null
      postMessage(message: { type: string; request?: number }) {
        queueMicrotask(() => {
          if (message.type === 'load') this.onmessage?.({ data: { type: 'ready' } })
          if (message.type === 'search') this.onmessage?.({ data: { type: 'results', request: message.request, results: [work('pg:105', 'Persuasion', 'Jane Austen')] } })
        })
      }
    }
    beforeEach(() => { localStorage.setItem(INTERNAL_KEY, '1'); vi.stubGlobal('Worker', FakeWorker) })
    afterEach(() => { localStorage.removeItem(INTERNAL_KEY); vi.unstubAllGlobals() })

    it('shows Modern English, Audio and a language menu only with a query, and narrows both groups', async () => {
      const host = document.createElement('div')
      const box = document.createElement('div')
      host.append(box); document.body.append(host)
      let renders = 0
      const render = (query: string) => {
        renders++
        box.replaceChildren()
        return addToTinct.renderSearchGroups(box, {
          query, tinct: library.slice(0, 3), tinctBooks: library, el, onAdd: () => {}, addingWork: null,
          renderTinct: (list: Array<{ title: string }>) => list.forEach(book => box.append(el('button', 'search-result', book.title))),
          filterHost: host, onFilters: () => render(query),
        })
      }
      render('')
      const bar = host.querySelector('.search-filters') as HTMLElement
      expect(host.firstElementChild).toBe(bar)
      expect(bar.hidden).toBe(true)
      expect(render('a').length).toBe(3)
      expect(bar.hidden).toBe(false)
      expect(host.querySelectorAll('.search-filters')).toHaveLength(1)
      const [modern, audio] = [...bar.querySelectorAll('button')] as HTMLButtonElement[]
      const language = bar.querySelector('select') as HTMLSelectElement
      expect([modern.textContent, audio.textContent]).toEqual(['Modern English', 'Audio'])
      expect([...language.options].map(o => o.textContent)).toEqual(['Any language', 'English', 'German', 'Russian'])
      expect(modern.getAttribute('aria-pressed')).toBe('false')
      // The catalogue worker is shared by the page (the first search started it): count what it found.
      await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).not.toBe('pending'))
      const found = box.querySelector('.free-group')?.getAttribute('data-free-group')
      expect(Number(found)).toBeGreaterThan(0)

      audio.click()
      expect(audio.getAttribute('aria-pressed')).toBe('true')
      expect([...box.querySelectorAll('.search-result')].map(b => b.textContent)).toEqual(['Frankenstein'])
      expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('0') // decided without a catalogue search
      audio.click()

      language.value = 'de'; language.dispatchEvent(new Event('change'))
      expect(language.classList.contains('on')).toBe(true)
      expect([...box.querySelectorAll('.search-result')].map(b => b.textContent)).toEqual(['Faust'])
      await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('0')) // the catalogue results are English
      language.value = 'en'; language.dispatchEvent(new Event('change'))
      await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe(found))
      expect(box.querySelectorAll('.search-result')).toHaveLength(3)

      modern.click()
      expect([...box.querySelectorAll('.search-result')].map(b => b.textContent)).toEqual(['Frankenstein', 'Faust'])
      modern.click()
      language.value = ''; language.dispatchEvent(new Event('change'))
      expect(addToTinct.searchFilters()).toEqual(none)
      expect(renders).toBeGreaterThan(5)
      host.remove()
    })
  })
})

describe('My shelf groups', () => {
  // jsdom has no canvas: the paper cover keeps its blank canvas (paperCover handles a null context).
  beforeEach(() => { vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null) })
  afterEach(() => { vi.restoreAllMocks() })
  const own = (key: string, title: string, readingAt: number | null, kind = 'epub') => ({ key, kind, title, author: 'Me', at: 1, readingAt, href: kind === 'epub' ? `/reader?userBook=${key.slice(5)}` : `/lab/addbook/?userBook=${key.slice(4)}` })

  it('puts own books being read under Currently reading, then every one under "My private uploads", with no add tiles', () => {
    const grid = document.createElement('div')
    grid.append(el('h2', 'my-books-head', 'Currently reading'))
    const library = el('article', 'collection-card'); library.dataset.shelfGroup = 'reading'; grid.append(library)
    grid.append(el('h2', 'my-books-head', 'Finished'))
    const added = addToTinct.appendOwnShelf(grid, [own('epub:aa', 'Notes', 5), own('pdf:bb', 'Slides', null, 'pdf'), own('epub:cc', 'Thesis', 9)], el)
    expect(added).toBe(5)
    const order = [...grid.children].map(child => child.classList.contains('my-books-head') ? `# ${child.textContent}` : child.querySelector('h2')?.textContent ?? 'library')
    expect(order).toEqual(['# Currently reading', 'library', 'Thesis', 'Notes', '# Finished', '# My private uploads', 'Notes', 'Slides', 'Thesis'])
    // The separate "Add a book" and "Add a PDF" tiles are gone: My shelf's heading has the +.
    expect(grid.querySelector('.add-file-tile, .add-book-tile, .add-file-card, .add-book-card')).toBeNull()
    expect(grid.textContent).not.toContain('Your own books')
    const notes = grid.querySelector('.own-book a') as HTMLAnchorElement
    expect(notes.getAttribute('href')).toBe('/reader?userBook=cc')
    expect(grid.querySelector('.own-book canvas.cover')).not.toBeNull()
    // A PDF opens by its own key in Add a book's PDF reader, never the old start page.
    expect(grid.querySelector('[data-own-key="pdf:bb"] a')?.getAttribute('href')).toBe('/lab/addbook/?userBook=bb')
  })

  it('says "Recognising text…" under a scan whose text is being recognised', () => {
    const grid = document.createElement('div')
    addToTinct.appendOwnShelf(grid, [{ ...own('pdf:bb', 'A scan', null, 'pdf'), ocrLine: 'Recognising text…' }, own('pdf:cc', 'Slides', null, 'pdf')], el)
    const scan = grid.querySelector('[data-own-key="pdf:bb"]')!
    expect(scan.querySelector('.own-ocr')?.textContent).toBe('Recognising text…')
    expect(grid.querySelector('[data-own-key="pdf:cc"] .own-ocr')).toBeNull()
  })

  it('shows an own book’s own cover at full size, and a paper cover without one', () => {
    const grid = document.createElement('div')
    addToTinct.appendOwnShelf(grid, [{ ...own('epub:aa', 'Notes', null), cover: 'data:image/jpeg;base64,AAAA' }, own('epub:bb', 'Plain', null)], el)
    const cards = [...grid.querySelectorAll('.own-book')]
    const image = cards.find(card => card.textContent?.includes('Notes'))!.querySelector('img.cover') as HTMLImageElement
    expect(image.getAttribute('src')).toBe('data:image/jpeg;base64,AAAA')
    expect(cards.find(card => card.textContent?.includes('Plain'))!.querySelector('canvas.cover')).not.toBeNull()
  })

  it('draws Currently reading’s own book with the reading table’s full-size cover (the listed one can be an older thumbnail)', () => {
    const grid = document.createElement('div')
    const thumb = 'data:image/jpeg;base64,THUMB', full = 'data:image/jpeg;base64,FULLSIZE'
    const covers = new Map([[addToTinct.ownTableId('epub:aa'), full]])
    addToTinct.appendOwnShelf(grid, [{ ...own('epub:aa', 'The Sovereign Child', 4), cover: thumb }], el, { covers })
    const images = [...grid.querySelectorAll('.own-book img.cover')].map(img => img.getAttribute('src'))
    expect(images).toEqual([full, full])
    expect(addToTinct.ownTableId('epub:aa')).toBe('userbook-aa')
    expect(addToTinct.ownTableId('pdf:bb')).toBe('userbook-bb')
  })

  it('gives own books being read the shelf’s ×, and every upload the ••• menu whose one action is Delete', () => {
    const grid = document.createElement('div')
    const onRemoveReading = vi.fn(), onDelete = vi.fn()
    addToTinct.appendOwnShelf(grid, [own('epub:aa', 'Notes', 3), own('pdf:bb', 'Slides', null, 'pdf')], el, { onRemoveReading, onDelete })
    document.body.append(grid)
    const reading = grid.querySelector('[data-shelf-group="own-reading"]')!
    const x = reading.querySelector('.save-toggle') as HTMLButtonElement
    expect(x.textContent).toBe('×')
    expect(x.getAttribute('aria-label')).toBe('Remove from My shelf: Notes')
    x.click()
    expect(onRemoveReading).toHaveBeenCalledWith(expect.objectContaining({ key: 'epub:aa' }), x)
    expect(onDelete).not.toHaveBeenCalled()
    const uploads = [...grid.querySelectorAll('[data-shelf-group="own"]')]
    expect(uploads.map(card => card.querySelector('.shelf-more')?.getAttribute('aria-label'))).toEqual(['More for Notes', 'More for Slides'])
    expect(uploads.some(card => card.querySelector('.save-toggle'))).toBe(false)
    const more = uploads[1].querySelector('.shelf-more') as HTMLButtonElement
    more.click()
    const items = [...grid.querySelectorAll('[role="menuitem"]')]
    expect(items.map(item => item.textContent)).toEqual(['Delete'])
    ;(items[0] as HTMLButtonElement).click()
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ key: 'pdf:bb' }), more)
    expect(grid.querySelector('.shelf-menu')).toBeNull()
    // The menu never opens the book.
    expect(uploads[1].querySelector('a')?.contains(more)).toBe(false)
    grid.remove()
  })

  it('opens a Currently reading heading for own books when the library has none, and adds nothing for an empty list', () => {
    const grid = document.createElement('div')
    grid.append(el('h2', 'my-books-head', 'Saved for later'))
    addToTinct.appendOwnShelf(grid, [own('epub:aa', 'Notes', 3)], el)
    expect([...grid.querySelectorAll('.my-books-head')].map(h => h.textContent)).toEqual(['Currently reading', 'Saved for later', 'My private uploads'])
    const empty = document.createElement('div')
    expect(addToTinct.appendOwnShelf(empty, [], el)).toBe(0)
    expect(empty.children).toHaveLength(0)
    expect(addToTinct.ownShelfGroups([own('epub:a', 'A', null), own('epub:b', 'B', 2), own('epub:c', 'C', 7)]).reading.map((b: { title: string }) => b.title)).toEqual(['C', 'B'])
  })

  it('shows how far through each own book being read the reader is, as the reading table writes it, under Currently reading only', () => {
    const grid = document.createElement('div')
    addToTinct.appendOwnShelf(grid, [{ ...own('epub:aa', 'Notes', 5), percent: 13.4 }, { ...own('epub:bb', 'Barely', 4), percent: 0.4 }, { ...own('epub:cc', 'Unknown', 3), percent: null }], el)
    const progress = (group: string) => [...grid.querySelectorAll(`[data-shelf-group="${group}"]`)].map(card => card.querySelector('.own-progress')?.textContent ?? '')
    expect(progress('own-reading')).toEqual(['13%', '<1%', ''])
    expect(progress('own')).toEqual(['', '', ''])
  })

  it('lists each own book once, even when the list names it twice', () => {
    const grid = document.createElement('div')
    addToTinct.appendOwnShelf(grid, [own('epub:aa', 'Notes', 5), own('epub:aa', 'Notes', 5), own('epub:bb', 'Plain', null)], el)
    expect(grid.querySelectorAll('[data-shelf-group="own-reading"]')).toHaveLength(1)
    expect([...grid.querySelectorAll('[data-shelf-group="own"]')].map(card => card.getAttribute('data-own-key'))).toEqual(['epub:aa', 'epub:bb'])
  })

  it('offers the pop-up from the search field only where Add to Tinct is on', () => {
    const link = document.createElement('a')
    link.hidden = true
    localStorage.setItem(INTERNAL_KEY, '1')
    addToTinct.syncSearchAddFile(link)
    expect(link.hidden).toBe(false)
    // Never Add a book's old start page: My shelf, for a click the pop-up does not take.
    expect(link.getAttribute('href')).toBe('/library#my-shelf')
    localStorage.removeItem(INTERNAL_KEY)
    addToTinct.syncSearchAddFile(link)
    expect(link.hidden).toBe(true)
    addToTinct.syncSearchAddFile(null)
  })
})

describe('Removing one of My private uploads', () => {
  afterEach(() => { document.body.replaceChildren() })
  const book = { key: 'epub:aa', kind: 'epub', title: 'The Sovereign Child', author: 'Me', at: 1, readingAt: null, href: '/reader?userBook=aa' }

  it('asks first in the page, naming the book and saying plainly what Delete does; Cancel keeps it', async () => {
    const asked = addToTinct.confirmDeleteUpload(book)
    const dialog = document.querySelector('[data-testid="own-delete-dialog"]')!
    expect(dialog.querySelector('h2')?.textContent).toBe('Delete The Sovereign Child?')
    expect(dialog.querySelector('.tui-dialog__body')?.textContent).toBe('Deletes the file, its notes and its place from Tinct on all your devices.')
    expect(dialog.querySelector('.own-delete-confirm')?.textContent).toBe('Delete')
    ;(dialog.querySelector('.own-delete-cancel') as HTMLButtonElement).click()
    expect(await asked).toBe(false)
    expect(document.querySelector('[data-testid="own-delete-dialog"]')).toBeNull()
    const confirmed = addToTinct.confirmDeleteUpload(book)
    ;(document.querySelector('.own-delete-confirm') as HTMLButtonElement).click()
    expect(await confirmed).toBe(true)
    // Escape is Cancel.
    const escaped = addToTinct.confirmDeleteUpload(book)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(await escaped).toBe(false)
  })

  it('says what Remove from shelf does for a Tinct book: its place and notes stay', async () => {
    const asked = addToTinct.confirmDeleteUpload({ title: 'Antigone' }, { own: false })
    const dialog = document.querySelector('[data-testid="own-delete-dialog"]')!
    expect(dialog.querySelector('h2')?.textContent).toBe('Remove Antigone?')
    expect(dialog.querySelector('.tui-dialog__body')?.textContent).toBe('Removes it from your shelf. Your place and notes stay if you add it again.')
    expect(dialog.querySelector('.own-delete-confirm')?.textContent).toBe('Remove')
    ;(dialog.querySelector('.own-delete-confirm') as HTMLButtonElement).click()
    expect(await asked).toBe(true)
    expect(addToTinct.shelfAction(false).item).toBe('Remove from shelf')
    expect(addToTinct.shelfAction(true).item).toBe('Delete')
  })

  it('a Tinct book’s ••• offers Remove from shelf, and Escape or a tap elsewhere closes it untouched', () => {
    const wrap = document.createElement('div'); document.body.append(wrap)
    const onChoose = vi.fn()
    const more = addToTinct.shelfMenu('Antigone', { onChoose })
    wrap.append(more)
    expect(more.getAttribute('aria-expanded')).toBe('false')
    more.click()
    expect(more.getAttribute('aria-expanded')).toBe('true')
    expect(wrap.querySelector('[role="menuitem"]')?.textContent).toBe('Remove from shelf')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrap.querySelector('.shelf-menu')).toBeNull()
    more.click()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(wrap.querySelector('.shelf-menu')).toBeNull()
    expect(onChoose).not.toHaveBeenCalled()
    more.click()
    ;(wrap.querySelector('[role="menuitem"]') as HTMLButtonElement).click()
    expect(onChoose).toHaveBeenCalledWith(more)
  })

  it('Currently reading’s own book: Read later, Remove from Currently reading, then Delete last; each runs its own action', () => {
    const grid = document.createElement('div'); document.body.append(grid)
    const onDelete = vi.fn(), later = vi.fn(), off = vi.fn()
    const book = { key: 'pdf:aa', kind: 'pdf', title: 'Everettian relative states', author: '', href: '/lab/addbook/?userBook=aa' }
    const card = addToTinct.ownBookCard(book, el, { onDelete, progress: true, actions: [{ label: addToTinct.READ_LATER, onChoose: later }, { label: addToTinct.OFF_READING, onChoose: off }] })
    grid.append(card)
    const more = card.querySelector('.shelf-more') as HTMLButtonElement
    const open = () => { more.click(); return [...card.querySelectorAll('[role="menuitem"]')] as HTMLButtonElement[] }
    let items = open()
    expect(items.map(item => item.textContent)).toEqual(['Read later', 'Remove from Currently reading', 'Delete'])
    expect(items.map(item => item.classList.contains('is-delete'))).toEqual([false, false, true])
    expect(document.activeElement).toBe(items[0])
    // Arrow keys move through the menu.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(document.activeElement).toBe(items[1])
    items[0].click()
    expect(later).toHaveBeenCalledWith(book, more)
    expect(card.querySelector('.shelf-menu')).toBeNull()
    items = open(); items[1].click()
    expect(off).toHaveBeenCalledWith(book, more)
    items = open(); items[2].click()
    expect(onDelete).toHaveBeenCalledWith(book, more)
    expect(later).toHaveBeenCalledTimes(1); expect(off).toHaveBeenCalledTimes(1); expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('places the menu just below its •••, right edges aligned, flipping above or to the start only at the viewport’s edge', () => {
    const place = addToTinct.shelfMenuPlace
    const view = { width: 1440, height: 900 }, menu = { width: 220, height: 120 }
    const button = (left: number, top: number) => ({ left, top, right: left + 30, bottom: top + 24 })
    // A cover in the middle of the desktop page: below, right-aligned.
    expect(place(button(600, 300), menu, view)).toEqual({ left: 410, top: 328, above: false, flipped: false })
    // Near the bottom: above the button, still right-aligned.
    expect(place(button(600, 820), menu, view)).toEqual({ left: 410, top: 696, above: true, flipped: false })
    // Near the left edge (a phone's first cover): starts at the button's left edge.
    expect(place(button(110, 300), menu, { width: 390, height: 844 })).toEqual({ left: 110, top: 328, above: false, flipped: true })
    // Never outside the viewport.
    const tight = place(button(300, 300), { width: 380, height: 120 }, { width: 390, height: 844 })
    expect(tight.left).toBe(8)
  })

  it('opens the menu anchored to the ••• inside its card, wherever the card sits', () => {
    const wrap = document.createElement('div'); wrap.className = 'card-wrap'; document.body.append(wrap)
    const more = addToTinct.shelfMenu('Antigone', { items: [{ label: 'Read later', onChoose: vi.fn() }, { label: 'Remove from shelf', onChoose: vi.fn() }] })
    wrap.append(more)
    const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect
    const offsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', { configurable: true, get() { return this.classList?.contains('shelf-menu') ? wrap : null } })
    const boxes = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this === wrap) return rect(400, 200, 220, 330)
      if (this === more) return rect(584, 206, 30, 24)
      if (this.classList.contains('shelf-menu')) return rect(0, 0, 210, 84)
      return rect(0, 0, 0, 0)
    })
    try {
      more.click()
      const menu = wrap.querySelector('.shelf-menu') as HTMLElement
      // 614 − 210 = 404 in the viewport, 4 px into the card; 230 + 4 = 234, 34 px down.
      expect(menu.style.left).toBe('4px')
      expect(menu.style.top).toBe('34px')
      expect(menu.dataset.place).toBe('below end')
    } finally {
      boxes.mockRestore()
      if (offsetParent) Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParent)
      else delete (HTMLElement.prototype as unknown as { offsetParent?: unknown }).offsetParent
    }
  })

  it('deletes with Add a book’s own delete (this device and the account), finding an account-only copy first', async () => {
    const calls: string[] = []
    const engine = (local: boolean) => async () => ({
      library: { get: async (key: string) => { calls.push('get ' + key); return local ? { key } : null } },
      cloud: { refresh: async () => { calls.push('refresh'); return true } },
      removeBook: async (key: string) => { calls.push('remove ' + key); return true },
    })
    expect(await addToTinct.deleteUpload(book, { engine: engine(true) })).toBe(true)
    expect(calls).toEqual(['get epub:aa', 'remove epub:aa'])
    calls.length = 0
    expect(await addToTinct.deleteUpload(book, { engine: engine(false) })).toBe(true)
    expect(calls).toEqual(['get epub:aa', 'refresh', 'remove epub:aa'])
  })

  it('then forgets this device’s other keys for the book (highlights, margin answers, chats, snapshots), never another book’s', async () => {
    vi.stubGlobal('TinctAI', { session: () => ({ userId: 'viewer' }) })
    const hex = 'a1b2c3d4e5f6a1b2c3d4e5f6', other = 'ffffffffffffffffffffffff'
    const store = new Map<string, string>([
      [`tinct-addbook:hl:${hex}`, '[]'], [`tinct-addbook:cards:${hex}`, '[]'], [`tinct-addbook:chat:pdf:${hex}`, '[]'],
      [`tinct-addbook:pos:pdf:${hex}`, '{}'], [`tinct-addbook:table-hidden:${hex}`, '1'], [`tinct:library-2-own-thumb:userbook-${hex}`, 'data:'],
      ['tinct:library-2-table:viewer', JSON.stringify({ reading: [{ bookId: `userbook-${hex}`, title: 'Private' }] })],
      [`tinct-addbook:hl:${other}`, '[]'], ['tinct-addbook:rights:viewer', '{}'], ['tinct:library-2-first-paint', '{"books":["hamlet"]}'],
    ])
    const storage = { get length() { return store.size }, key: (i: number) => [...store.keys()][i] ?? null, getItem: (k: string) => store.get(k) ?? null, removeItem: (k: string) => { store.delete(k) } }
    const calls: string[] = []
    const engine = async () => ({
      library: { get: async () => ({ key: `pdf:${hex}` }) }, cloud: { refresh: async () => true },
      removeBook: async (key: string) => { calls.push('remove ' + key); addToTinct.forgetOwnBookHere(hex, [storage]); return true },
    })
    expect(await addToTinct.deleteUpload({ ...book, key: `pdf:${hex}` }, { engine, storages: [storage] })).toBe(true)
    expect(calls).toEqual([`remove pdf:${hex}`])
    expect([...store.keys()].sort()).toEqual([`tinct-addbook:hl:${other}`, 'tinct-addbook:rights:viewer', 'tinct:library-2-first-paint'])
    // Anything but a book's own id forgets nothing.
    expect(addToTinct.forgetOwnBookHere('tinct', [storage])).toBe(0)
    vi.unstubAllGlobals()
  })

  it('cloud-only deletion keeps foreign same-hash raw state and snapshots while removing B-qualified records', async () => {
    vi.stubGlobal('TinctAI', { session: () => ({ userId: 'u2' }) })
    const hex = 'e'.repeat(24), key = `epub:${hex}`
    const values = new Map<string, string>([
      [`tinct-addbook:pos:${key}`, 'A position'],
      [`tinct-addbook:hl:${key}`, '[{"id":"A"}]'],
      [`tinct-addbook:text-cards-canonical:u1:${hex}`, 'A canonical'],
      [`tinct-addbook:text-cards-canonical:u2:${hex}`, 'B canonical'],
      [`tinct-addbook:pdf-original-talk:u1:${'f'.repeat(32)}:${hex}`, 'A talk'],
      [`tinct-addbook:pdf-original-talk:u2:${'f'.repeat(32)}:${hex}`, 'B talk'],
      [`tinct-addbook:legacy-epub-backup-quarantine:u1:${hex}`, 'A quarantine'],
      [`tinct-addbook:legacy-epub-backup-quarantine:u2:${hex}`, 'B quarantine'],
      [`tinct-addbook:static-epub-marks:u1:${hex}`, 'A static'],
      [`tinct-addbook:static-epub-marks:u2:${hex}`, 'B static'],
      [`tinct-addbook:static-epub-guest-marks:${hex}`, 'guest'],
      ['tinct:library-2-table:u1', JSON.stringify([{ key }])],
    ])
    const storage = { get length() { return values.size }, key: (i: number) => [...values.keys()][i] ?? null,
      getItem: (k: string) => values.get(k) ?? null, removeItem: (k: string) => { values.delete(k) } }
    const cloud = { refresh: vi.fn(async () => true) }
    const removeBook = vi.fn(async () => true)
    try {
      expect(await addToTinct.deleteUpload({ ...book, key }, { engine: async () => ({ library: { get: async () => null }, cloud, removeBook }), storages: [storage] })).toBe(true)
      expect(cloud.refresh).toHaveBeenCalledOnce()
      expect(removeBook).toHaveBeenCalledWith(key)
      for (const fragment of [`pos:${key}`, `hl:${key}`, `text-cards-canonical:u1:${hex}`, `pdf-original-talk:u1:${'f'.repeat(32)}:${hex}`,
        `legacy-epub-backup-quarantine:u1:${hex}`, `static-epub-marks:u1:${hex}`, `static-epub-guest-marks:${hex}`])
        expect(values.get(`tinct-addbook:${fragment}`), fragment).toBeDefined()
      for (const fragment of [`text-cards-canonical:u2:${hex}`, `pdf-original-talk:u2:${'f'.repeat(32)}:${hex}`,
        `legacy-epub-backup-quarantine:u2:${hex}`, `static-epub-marks:u2:${hex}`])
        expect(values.get(`tinct-addbook:${fragment}`), fragment).toBeUndefined()
      expect(values.get('tinct:library-2-table:u1')).toBe(JSON.stringify([{ key }]))
    } finally { vi.unstubAllGlobals() }
  })

  it('does not trust an earlier local lookup after the engine rechecks ownership', async () => {
    vi.stubGlobal('TinctAI', { session: () => ({ userId: 'u2' }) })
    const hex = 'f'.repeat(24), key = `epub:${hex}`
    const raw = `tinct-addbook:pos:${key}`, mine = `tinct-addbook:static-epub-cards:u2:${hex}`
    const values = new Map([[raw, 'A place'], [mine, 'B card']])
    const storage = { get length() { return values.size }, key: (i: number) => [...values.keys()][i] ?? null,
      getItem: (k: string) => values.get(k) ?? null, removeItem: (k: string) => { values.delete(k) } }
    try {
      expect(await addToTinct.deleteUpload({ ...book, key }, { storages: [storage], engine: async () => ({
        library: { get: async () => ({ key }) }, cloud: { refresh: async () => true },
        // Ownership changed before the engine's second lookup; it takes its
        // own conservative cloud-only path and leaves these raw keys alone.
        removeBook: async () => true,
      }) })).toBe(true)
      expect(values.get(raw)).toBe('A place')
      expect(values.has(mine)).toBe(false)
    } finally { vi.unstubAllGlobals() }
  })

  it('never runs the second cleanup under B after A initiated deletion', async () => {
    const session = { userId: 'u1', token: 'A' }
    vi.stubGlobal('TinctAI', { session: () => session })
    const hex = 'd'.repeat(24), key = `epub:${hex}`
    const scoped = `tinct-addbook:text-cards-canonical:u2:${hex}`
    const pdfTalk = `tinct-addbook:pdf-original-talk:u2:${'f'.repeat(32)}:${hex}`
    const values = new Map([[scoped, 'B card'], [pdfTalk, 'B talk']])
    const storage = { get length() { return values.size }, key: (i: number) => [...values.keys()][i] ?? null,
      getItem: (k: string) => values.get(k) ?? null, removeItem: (k: string) => { values.delete(k) } }
    let resume!: () => void
    const gate = new Promise<void>(resolve => { resume = resolve })
    const removeBook = vi.fn(async () => { await gate; return false })
    try {
      const pending = addToTinct.deleteUpload({ ...book, key }, { engine: async () => ({
        library: { get: async () => ({ key }) }, cloud: { refresh: async () => true }, removeBook,
      }), storages: [storage] })
      await vi.waitFor(() => expect(removeBook).toHaveBeenCalledWith(key))
      session.userId = 'u2'; session.token = 'B'; resume()
      expect(await pending).toBe(false)
      expect(values.get(scoped)).toBe('B card')
      expect(values.get(pdfTalk)).toBe('B talk')
    } finally { vi.unstubAllGlobals() }
  })
})

describe('Your own book pop-up (top bar +, My shelf +, the search field +, "Add a PDF or EPUB")', () => {
  afterEach(() => { addToTinct.closeFileDialog(); document.documentElement.classList.remove('signed-in'); document.body.replaceChildren(); localStorage.clear() })
  const entry = () => { const link = document.createElement('a'); link.href = '/library#my-shelf'; document.body.append(link); return link }
  const dialog = () => document.querySelector('[data-testid="own-file-dialog"]')
  const choose = (file: File) => {
    const input = dialog()!.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    input.dispatchEvent(new Event('change'))
  }
  /** Add a book's engine (add-engine.js) as the pop-up uses it, recording each step. */
  function fakeEngine({ rights = true, kept = true, kind = 'epub' as 'epub' | 'pdf', readError = '', epubError = '' } = {}) {
    const steps: string[] = []
    let confirmed = rights
    const api = {
      RIGHTS_COPY: "I have the right to add this file and to read and listen to it in Tinct, including with its AI features. I'm responsible for what I upload and share (Terms §4).",
      rightsConfirmed: () => confirmed,
      confirmRights: () => { steps.push('rights'); confirmed = true },
      readFile: async (file: File) => { steps.push('read ' + file.name); return readError ? { error: readError } : { kind, bytes: new Uint8Array([1]), key: `${kind}:abc` } },
      keepFile: async () => { steps.push('keep'); return kept },
      prepareEpub: async (_bytes: Uint8Array, name: string, key: string) => { steps.push('epub ' + name + ' ' + key); if (epubError) throw new Error(epubError); return { href: '/reader?userBook=abc' } },
      preparePdf: async (_file: File, key: string) => { steps.push('pdf ' + key); return { href: '/lab/addbook/?userBook=' + key.slice(4) } },
    }
    return { steps, engine: async () => api }
  }

  it('shows Add a book’s own wording and a button that opens the file picker, without leaving the page', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn()
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, engine: fakeEngine().engine })
    expect(go).not.toHaveBeenCalled()
    const box = dialog()!
    expect(box.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true')
    expect(box.querySelector('h2')?.textContent).toBe('Your own book')
    expect(box.textContent).toContain('It stays private to your account.')
    expect(box.textContent).toContain('DRM-protected files can’t be opened.')
    const input = box.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.accept).toBe('application/pdf,.pdf,application/epub+zip,.epub')
    const picker = vi.spyOn(input, 'click').mockImplementation(() => {})
    ;(box.querySelector('.own-file-choose') as HTMLButtonElement).click()
    expect(picker).toHaveBeenCalledTimes(1)
    expect(box.querySelector('.own-file-choose')?.textContent).toBe('Choose a PDF or EPUB')
    // From the search field there is no second search to offer.
    expect(box.querySelector('.own-file-search')).toBeNull()
  })

  it('names both the extensions and the types (iOS Files), with no spaces; on Android also octet-stream, which some file managers report for an EPUB', () => {
    const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
    const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'
    const SAMSUNG = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36'
    const ANDROID_APP = 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0 Mobile Safari/537.36'
    for (const ua of [IPAD, IPHONE, WINDOWS]) expect(addToTinct.fileAccept(ua)).toBe('application/pdf,.pdf,application/epub+zip,.epub')
    for (const ua of [SAMSUNG, ANDROID_APP]) expect(addToTinct.fileAccept(ua)).toBe('application/pdf,.pdf,application/epub+zip,.epub,application/octet-stream')
    for (const list of [addToTinct.FILE_ACCEPT, addToTinct.FILE_ACCEPT_ANDROID]) {
      expect(list).not.toMatch(/\s/)
      for (const piece of ['.pdf', '.epub', 'application/pdf', 'application/epub+zip']) expect(list.split(',')).toContain(piece)
    }
    // Add a book's PDF reader asks for the same file types.
    expect(readFileSync('public/lab/addbook/index.html', 'utf8')).toContain('accept="application/pdf,.pdf,application/epub+zip,.epub"')
  })

  it('says why when a chosen file is refused, and offers the picker again', async () => {
    document.documentElement.classList.add('signed-in')
    const { engine } = fakeEngine({ readError: 'This file could not be read from this device. If it is stored in the cloud, download it first, then choose it again.' })
    await addToTinct.openFileEntry(entry(), { access: async () => true, go: vi.fn(), engine })
    choose(new File(['x'], 'book', { type: 'application/octet-stream' }))
    await vi.waitFor(() => expect(dialog()!.querySelector('[role="alert"]')?.textContent).toBe('This file could not be read from this device. If it is stored in the cloud, download it first, then choose it again.'))
    expect(dialog()!.querySelector('.own-file-choose')).not.toBeNull()
  })

  it('adds an EPUB in place: rights once (the engine records it), kept, saved, then opens in the Tinct reader, never via Add a book’s page', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn(), keep = vi.fn(async () => true)
    const { steps, engine } = fakeEngine({ rights: false })
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, keep, engine })
    choose(new File(['PK'], 'sovereign.epub', { type: 'application/epub+zip' }))
    await vi.waitFor(() => expect(dialog()!.querySelector('.own-file-rights')).not.toBeNull())
    const box = dialog()!
    expect(box.textContent).toContain('Tinct opens sovereign.epub here and keeps a private copy in your account')
    expect(box.textContent).toContain("I have the right to add this file and to read and listen to it in Tinct, including with its AI features. I'm responsible for what I upload and share (Terms §4).")
    const ok = box.querySelector('.own-file-continue') as HTMLButtonElement
    expect(ok.disabled).toBe(true)
    const check = box.querySelector('.own-file-rights-box') as HTMLInputElement
    check.checked = true; check.dispatchEvent(new Event('change'))
    expect(ok.disabled).toBe(false)
    ok.click()
    await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
    expect(steps).toEqual(['read sovereign.epub', 'rights', 'keep', 'epub sovereign.epub epub:abc'])
    expect(go).toHaveBeenCalledWith('/reader?userBook=abc')
    expect(keep).not.toHaveBeenCalled()
    // The progress is shown in the pop-up while it works.
    expect(dialog()!.querySelector('.own-file-progress')?.getAttribute('data-value')).toBe('1')
    // The wait is the reader's ring in the pop-up's own line (wait-ring.js); "Opening…" stays for screen readers only.
    await vi.waitFor(() => expect(dialog()!.querySelector('.own-file-status svg.tinct-wait-ring')).not.toBeNull())
    expect(dialog()!.querySelector('.own-file-status .tinct-wait-label')?.textContent).toBe('Opening…')
    expect(dialog()!.querySelector('.own-file-status .tinct-wait')?.getAttribute('role')).toBe('status')
  })

  it('adds a PDF in place and opens it in Add a book’s PDF reader by its key; a confirmed account is not asked again', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn()
    const { steps, engine } = fakeEngine({ kind: 'pdf' })
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, engine })
    choose(new File(['%PDF-1.4'], 'notes.pdf', { type: 'application/pdf' }))
    await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
    expect(steps).toEqual(['read notes.pdf', 'keep', 'pdf pdf:abc'])
    expect(go).toHaveBeenCalledWith('/lab/addbook/?userBook=abc')
  })

  it('says why a file cannot be added, in the pop-up, and offers another', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn()
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, engine: fakeEngine({ readError: 'Choose a PDF or EPUB file.' }).engine })
    choose(new File(['x'], 'notes.txt'))
    await vi.waitFor(() => expect(dialog()!.querySelector('[role="alert"]')?.textContent).toBe('Choose a PDF or EPUB file.'))
    expect(dialog()!.querySelector('.own-file-choose')).not.toBeNull()
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, engine: fakeEngine({ epubError: 'This book is protected by DRM.' }).engine })
    choose(new File(['PK'], 'locked.epub'))
    await vi.waitFor(() => expect(dialog()!.querySelector('[role="alert"]')?.textContent).toBe('This book is protected by DRM.'))
    expect(go).not.toHaveBeenCalled()
  })

  it('a rights confirmation cancelled adds nothing', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn()
    const { steps, engine } = fakeEngine({ rights: false })
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, engine })
    choose(new File(['PK'], 'a.epub'))
    await vi.waitFor(() => expect(dialog()?.querySelector('.own-file-rights')).toBeTruthy())
    ;(dialog()!.querySelector('.own-file-cancel') as HTMLButtonElement).click()
    expect(dialog()).toBeNull()
    expect(steps).toEqual(['read a.epub'])
    expect(go).not.toHaveBeenCalled()
  })

  it('only when this browser cannot keep the file, hands it to Add a book’s PDF reader to open unkept', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn(), keep = vi.fn(async () => true)
    await addToTinct.openFileEntry(entry(), { access: async () => true, go, keep, engine: fakeEngine({ kept: false }).engine })
    const file = new File(['PK'], 'a.epub')
    choose(file)
    await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
    expect(keep).toHaveBeenCalledWith(file)
    expect(go).toHaveBeenCalledWith('/lab/addbook/?mode=file&handoff=1')
  })

  it('keeps the gating: a free account past its trial gets the Premium offer, signed out signs in first, never the pop-up', async () => {
    const go = vi.fn()
    document.documentElement.classList.add('signed-in')
    await addToTinct.openFileEntry(entry(), { access: async () => false, go })
    expect(go).toHaveBeenCalledWith(addToTinct.PREMIUM_PAGE)
    document.documentElement.classList.remove('signed-in')
    await addToTinct.openFileEntry(entry(), { access: async () => null, go })
    expect(go).toHaveBeenLastCalledWith('/sign-in?returnTo=%2Flibrary%23my-shelf')
    expect(dialog()).toBeNull()
  })

  it('closes on its × and Escape; only the file button, no Cancel (Anders, 15 Oct)', async () => {
    document.documentElement.classList.add('signed-in')
    await addToTinct.openFileEntry(entry(), { access: async () => true, go: vi.fn(), engine: fakeEngine().engine })
    expect(dialog()!.querySelector('.own-file-cancel')).toBeNull()
    expect([...dialog()!.querySelectorAll('.tui-dialog__actions button')].map(b => b.className)).toEqual(['tui-btn tui-btn--primary own-file-choose'])
    const close = dialog()!.querySelector('.tui-dialog__head .own-file-close') as HTMLButtonElement
    expect(close.getAttribute('aria-label')).toBe('Close')
    close.click()
    expect(dialog()).toBeNull()
    await addToTinct.openFileEntry(entry(), { access: async () => true, go: vi.fn(), engine: fakeEngine().engine })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(dialog()).toBeNull()
  })

  it('the top bar + opens this pop-up (not the search), with no "Add a book" button any more; shown only where Add to Tinct is on', async () => {
    const button = document.createElement('button')
    document.body.append(button)
    const search = vi.fn()
    addToTinct.syncLibraryAdd(button, search)
    expect(button.hidden).toBe(true)
    document.documentElement.classList.add('signed-in')
    localStorage.setItem(INTERNAL_KEY, '1')
    addToTinct.syncLibraryAdd(button, search)
    expect(button.hidden).toBe(false)
    button.click()
    await vi.waitFor(() => expect(dialog()).not.toBeNull())
    expect(search).not.toHaveBeenCalled()
    expect(dialog()!.querySelector('.own-file-choose')).not.toBeNull()
    expect(dialog()!.querySelector('.own-file-search')).toBeNull()
    ;(dialog()!.querySelector('.own-file-close') as HTMLButtonElement).click()
    expect(search).not.toHaveBeenCalled()
    expect(dialog()).toBeNull()
    // Re-synced on sign-in/out without binding twice.
    addToTinct.syncLibraryAdd(button, search)
    button.click()
    await vi.waitFor(() => expect(dialog()).not.toBeNull())
    expect(document.querySelectorAll('[data-testid="own-file-dialog"]')).toHaveLength(1)
  })

  it('My shelf’s + beside its heading: a round "Add a book" icon button opening the same pop-up; nothing signed out', async () => {
    const header = document.createElement('header'); header.append(el('h2', '', 'My shelf')); document.body.append(header)
    const search = vi.fn()
    const add = addToTinct.syncShelfAdd(header, search) as HTMLButtonElement
    expect(add.hidden).toBe(true)
    document.documentElement.classList.add('signed-in')
    localStorage.setItem(INTERNAL_KEY, '1')
    expect(addToTinct.syncShelfAdd(header, search)).toBe(add)
    expect(header.querySelectorAll('.shelf-add')).toHaveLength(1)
    expect(add.hidden).toBe(false)
    expect(add.classList.contains('tui-icon-btn')).toBe(true)
    expect(add.getAttribute('aria-label')).toBe('Add a book')
    expect(add.previousElementSibling?.textContent).toBe('My shelf')
    add.click()
    await vi.waitFor(() => expect(dialog()).not.toBeNull())
    expect(dialog()!.querySelector('.own-file-search')).toBeNull()
    expect(dialog()!.querySelector('.own-file-close')).not.toBeNull()
  })
})

describe('Modern English, asked right after an add', () => {
  const none = { state: 'none', chapters: {}, offer: { tier: 2, cents: 499 } }
  const yes = () => true
  afterEach(() => { document.documentElement.classList.remove('signed-in'); localStorage.removeItem(INTERNAL_KEY); document.querySelector('.modern-ask-layer')?.remove(); vi.useRealTimers() })

  it('asks only for a book with no edition yet and an offer', () => {
    expect(addToTinct.modernAsk(none)).toEqual({ cents: 499, price: '$4.99' })
    expect(addToTinct.modernAsk({ ...none, offer: { tier: 4, cents: 1199 } })).toEqual({ cents: 1199, price: '$11.99' })
    expect(addToTinct.modernAsk({ ...none, state: 'paid' })).toBeNull()
    expect(addToTinct.modernAsk({ ...none, state: 'complete' })).toBeNull()
    expect(addToTinct.modernAsk({ ...none, state: 'checkout' })).toBeNull() // someone is buying it now
    expect(addToTinct.modernAsk({ ...none, offer: null })).toBeNull()
    expect(addToTinct.modernAsk({ ...none, offer: { tier: 1, cents: 0 } })).toBeNull()
    expect(addToTinct.modernAsk(null)).toBeNull()
  })

  it('none with an offer: ask; paid, complete, no offer or a failed status: do not', async () => {
    const after = (status: unknown) => addToTinct.modernOfferAfterAdd('pd-pg-158', { allowed: yes, status: async () => status })
    expect(await after(none)).toEqual({ cents: 499, price: '$4.99' })
    expect(await after({ ...none, state: 'paid', offer: null })).toBeNull()
    expect(await after({ ...none, state: 'complete', offer: null })).toBeNull()
    expect(await after({ ...none, offer: null })).toBeNull()
    expect(await after(null)).toBeNull() // the engine's status could not be told
    expect(await addToTinct.modernOfferAfterAdd('pd-pg-158', { allowed: yes, status: async () => { throw new Error('offline') } })).toBeNull()
    expect(await addToTinct.modernOfferAfterAdd('pd-pg-158', { allowed: yes, status: () => { throw new Error('engine') } })).toBeNull()
  })

  it('skips the question when the status takes longer than 1.5 s', async () => {
    expect(addToTinct.MODERN_ASK_TIMEOUT_MS).toBe(1500)
    vi.useFakeTimers()
    let answer: (value: unknown) => void = () => {}
    const slow = addToTinct.modernOfferAfterAdd('pd-pg-158', { allowed: yes, status: () => new Promise(resolve => { answer = resolve }) })
    await vi.advanceTimersByTimeAsync(1499)
    answer(none) // just in time
    expect(await slow).toEqual({ cents: 499, price: '$4.99' })
    const late = addToTinct.modernOfferAfterAdd('pd-pg-158', { allowed: yes, status: () => new Promise(resolve => { setTimeout(() => resolve(none), 1600) }) })
    await vi.advanceTimersByTimeAsync(1500)
    expect(await late).toBeNull()
  })

  it('never asks a signed-out reader, and never asks for the status without leave', async () => {
    const status = vi.fn(async () => none)
    expect(addToTinct.modernAskAllowed()).toBe(false)
    expect(await addToTinct.modernOfferAfterAdd('pd-pg-158', { status })).toBeNull()
    localStorage.setItem(INTERNAL_KEY, '1') // an internal device signed out: still no account to buy with
    expect(addToTinct.modernAskAllowed()).toBe(false)
    expect(await addToTinct.modernOfferAfterAdd('pd-pg-158', { status })).toBeNull()
    expect(await addToTinct.modernOfferAfterAdd('pd-pg-158', { allowed: () => false, status })).toBeNull()
    expect(status).not.toHaveBeenCalled()
    localStorage.removeItem(INTERNAL_KEY)
    document.documentElement.classList.add('signed-in') // any signed-in reader, no internal flag
    expect(addToTinct.modernAskAllowed()).toBe(true)
    expect(await addToTinct.modernOfferAfterAdd('pd-pg-158', { status })).toEqual({ cents: 499, price: '$4.99' })
    expect(status).toHaveBeenCalledWith('pd-pg-158')
  })

  it('the question: title, one sentence, the price on the primary button; Not now, Escape and a tap outside answer later', async () => {
    const asked = addToTinct.askModernEdition({ cents: 499, price: '$4.99' })
    const layer = document.querySelector('[data-testid="modern-ask"]') as HTMLElement
    expect(layer.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true')
    expect(layer.querySelector('h2')?.textContent).toBe('Also get it in Modern English?')
    expect(layer.querySelector('.modern-ask-body')?.textContent).toBe('A Modern English edition is written for you chapter by chapter.')
    expect([...layer.querySelectorAll('button')].map(b => b.textContent)).toEqual(['Not now', 'Get Modern English · $4.99'])
    // Not now has the focus (Anders, 2026-10-09: Enter must never start a checkout); was the Get button.
    expect(document.activeElement).toBe(layer.querySelector('.modern-ask-later'))
    ;(layer.querySelector('.modern-ask-buy') as HTMLButtonElement).click()
    expect(await asked).toBe('buy')
    expect(document.querySelector('.modern-ask-layer')).toBeNull()
    for (const answer of [
      () => (document.querySelector('.modern-ask-later') as HTMLButtonElement).click(),
      () => dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
      () => (document.querySelector('.modern-ask-layer') as HTMLElement).click(),
    ]) {
      const again = addToTinct.askModernEdition({ cents: 499, price: '$4.99' })
      answer()
      expect(await again).toBe('later')
      expect(document.querySelector('.modern-ask-layer')).toBeNull()
    }
  })
})

describe('Modern English asked alongside the end of an add (Anders, 2026-10-09)', () => {
  const none = { state: 'none', chapters: {}, offer: { tier: 2, cents: 499 } }
  const yes = () => true
  const question = () => document.querySelector('[data-testid="modern-ask"]') as HTMLElement | null
  const settled = async <T,>(promise: Promise<T>) => { let done = false; void promise.then(() => { done = true }, () => { done = true }); await Promise.resolve(); await new Promise(resolve => setTimeout(resolve, 0)); return done }
  afterEach(() => { document.querySelector('.modern-ask-layer')?.remove(); vi.useRealTimers() })

  it('the question shows as soon as the status answers, without waiting for the add\'s last steps', async () => {
    let finishLast: (href: string) => void = () => {}
    const finish = vi.fn(() => new Promise<string>(resolve => { finishLast = resolve })) // the shelf and the reader's hand-off, still running
    const status = vi.fn(async () => none)
    const end = addToTinct.finishAdd('pd-pg-158', { allowed: yes, status, finish })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(status).toHaveBeenCalledWith('pd-pg-158')
    expect(finish).toHaveBeenCalled()
    expect(question()?.querySelector('.modern-ask-buy')?.textContent).toBe('Get Modern English · $4.99')
    expect(await settled(end)).toBe(false)
    finishLast('/reader')
    ;(question()!.querySelector('.modern-ask-later') as HTMLButtonElement).click()
    expect(await end).toEqual({ href: '/reader', answer: 'later' })
  })

  it('library_2 asks right after the commit answers: the shelf and the reader\'s hand-off run alongside, not before', () => {
    const app = readFileSync('public/lab/library_2/app.js', 'utf8')
    const add = app.slice(app.indexOf('async function addWork('), app.indexOf('// Add your own book from the search field'))
    const committed = add.indexOf('.importWork(work.id')
    const asked = add.indexOf('await finishAdd(entry.id')
    expect(committed).toBeGreaterThan(0)
    expect(asked).toBeGreaterThan(committed)
    // Nothing slow is awaited between the commit and the question: addCatalogueBook and readerDestination are finishAdd's `finish`.
    const between = add.slice(committed, asked)
    expect(between).not.toContain('addCatalogueBook')
    expect(between).not.toContain('readerDestination')
    expect(add.slice(asked)).toMatch(/finish:async\(\)=>\{try\{\(await readingApi\(\)\)\.addCatalogueBook\?\.\(entry\);\}catch\{\}return readerDestination\(book,null\);\}/)
    expect(add).not.toContain('modernOfferAfterAdd(')
  })

  it('the add completes while the question is unanswered, and the reader opens only once it is answered', async () => {
    const steps: string[] = []
    const finish = vi.fn(async () => { steps.push('shelf'); await Promise.resolve(); steps.push('hand-off'); return '/reader' })
    const end = addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: async () => none, finish })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(steps).toEqual(['shelf', 'hand-off']) // done, with the question open
    expect(question()).not.toBeNull()
    expect(await settled(end)).toBe(false) // never under an open question
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(await settled(end)).toBe(false)
    ;(question()!.querySelector('.modern-ask-later') as HTMLButtonElement).click()
    expect(await end).toEqual({ href: '/reader', answer: 'later' })
  })

  it('answered before the add is done, the add simply continues to the reader (Get included)', async () => {
    let finishLast: (href: string) => void = () => {}
    const end = addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: async () => none, finish: () => new Promise<string>(resolve => { finishLast = resolve }) })
    await new Promise(resolve => setTimeout(resolve, 0))
    ;(question()!.querySelector('.modern-ask-buy') as HTMLButtonElement).click()
    expect(question()).toBeNull()
    expect(await settled(end)).toBe(false) // the reader's hand-off is still being written: checkout waits for it, as before
    finishLast('/reader')
    expect(await end).toEqual({ href: '/reader', answer: 'buy' })
  })

  it('no question: not allowed, no offer, search closed, or a status still unanswered 1.5 s after the add is done', async () => {
    const finish = async () => '/reader'
    const ask = vi.fn(async () => 'later')
    expect(await addToTinct.finishAdd('pd-pg-158', { allowed: () => false, status: async () => none, finish, ask })).toEqual({ href: '/reader', answer: null })
    expect(await addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: async () => ({ ...none, offer: null }), finish, ask })).toEqual({ href: '/reader', answer: null })
    expect(await addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: async () => none, finish, ask, live: () => false })).toEqual({ href: '/reader', answer: null })
    expect(ask).not.toHaveBeenCalled()
    vi.useFakeTimers()
    const slow = addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: () => new Promise(resolve => { setTimeout(() => resolve(none), 1600) }), finish, ask })
    await vi.advanceTimersByTimeAsync(1500)
    expect(await slow).toEqual({ href: '/reader', answer: null })
    expect(ask).not.toHaveBeenCalled()
    // A slow status is still asked while the add is not done yet.
    const later = addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: () => new Promise(resolve => { setTimeout(() => resolve(none), 4000) }), finish: () => new Promise<string>(resolve => { setTimeout(() => resolve('/reader'), 5000) }), ask })
    await vi.advanceTimersByTimeAsync(5000)
    expect(await later).toEqual({ href: '/reader', answer: 'later' })
    expect(ask).toHaveBeenCalledTimes(1)
  })

  it('an add that fails closes an open question and reports the failure', async () => {
    let fail: (error: Error) => void = () => {}
    const end = addToTinct.finishAdd('pd-pg-158', { allowed: yes, status: async () => none, finish: () => new Promise<string>((_, reject) => { fail = reject }) })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(question()).not.toBeNull()
    fail(new Error('hand-off'))
    await expect(end).rejects.toThrow('hand-off')
    expect(question()).toBeNull()
  })

  it('focus is on Not now, never on Get: Enter does not start a checkout', async () => {
    const asked = addToTinct.askModernEdition({ cents: 799, price: '$7.99' })
    const layer = question()!
    expect(document.activeElement).toBe(layer.querySelector('.modern-ask-later'))
    expect(document.activeElement).not.toBe(layer.querySelector('.modern-ask-buy'))
    ;(document.activeElement as HTMLButtonElement).click() // what Enter does on the focused button
    expect(await asked).toBe('later')
  })
})

describe('Worker routing', () => {
  it('routes /api/public-books and added editions, and answers 503 without storage', async () => {
    const env = { ASSETS: { fetch: async () => new Response('asset') } } as unknown as Parameters<typeof worker.fetch>[1]
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext
    expect((await worker.fetch(new Request('https://tinct.app/api/public-books'), env, ctx)).status).toBe(503)
    expect((await worker.fetch(new Request('https://tinct.app/data/editions/pd-pg-1-original-en.json'), env, ctx)).status).toBe(503)
  })
})
