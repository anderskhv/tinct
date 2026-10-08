// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    expect(FakeWorker.last?.url).toBe('/lab/addbook/js/search-worker.js?v=20261008rel6')
    await vi.waitFor(() => expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).not.toBe('pending'))
    expect(box.querySelector('.free-group')?.getAttribute('data-free-group')).toBe('2')
    expect(freeShown).toEqual([2]) // the panel's "N books found" counts these rows too (app.js)
    expect([...box.querySelectorAll('.search-group-head')].map(h => h.textContent)).toEqual(['Available in Tinct', 'Not yet in Tinct'])
    expect(box.querySelector('.search-result')?.textContent).toBe('Pride and Prejudice')
    const rows = [...box.querySelectorAll('.free-row')]
    expect(rows.map(row => row.querySelector('.free-line')?.textContent)).toEqual(['Persuasion · Jane Austen', 'Lady Susan · Jane Austen'])
    expect(rows.map(row => row.querySelector('small')?.textContent)).toEqual(['Project Gutenberg', 'Wikisource'])
    ;(rows[0].querySelector('.free-add') as HTMLButtonElement).click()
    expect(added).toEqual(['pg:105'])
    expect(rows[0].querySelector('.free-add')?.getAttribute('aria-label')).toBe('Add Persuasion to Tinct')
    const file = box.querySelector('.file-box')!
    expect(box.lastElementChild).toBe(file)
    expect(file.querySelector('p')?.textContent).toBe('Have it as a file?')
    // Straight to Add a book's file step, never its free-book search (the library search above is that).
    expect(file.querySelector('a')?.getAttribute('href')).toBe('/lab/addbook/?mode=file')
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
    expect(button.querySelector('svg.add-spinner')).not.toBeNull()
    // No new visible words: the spinner replaces "Add", the existing "Adding…" is for screen readers only.
    expect(button.querySelector('.sr-only')?.textContent).toBe('Adding…')
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
  const own = (key: string, title: string, readingAt: number | null, kind = 'epub') => ({ key, kind, title, author: 'Me', at: 1, readingAt, href: kind === 'epub' ? `/reader?userBook=${key.slice(5)}` : '/lab/addbook/#books' })

  it('opens My shelf with the + tile, puts own books being read under Currently reading, then Your own books', () => {
    const grid = document.createElement('div')
    grid.append(el('h2', 'my-books-head', 'Currently reading'))
    const library = el('article', 'collection-card'); library.dataset.shelfGroup = 'reading'; grid.append(library)
    grid.append(el('h2', 'my-books-head', 'Finished'))
    const added = addToTinct.appendOwnShelf(grid, [own('epub:aa', 'Notes', 5), own('pdf:bb', 'Slides', null, 'pdf'), own('epub:cc', 'Thesis', 9)], el)
    expect(added).toBe(6)
    const order = [...grid.children].map(child => child.classList.contains('my-books-head') ? `# ${child.textContent}` : child.querySelector('h2')?.textContent ?? (child.classList.contains('add-file-card') ? '+' : 'library'))
    expect(order).toEqual(['+', '# Currently reading', 'library', 'Thesis', 'Notes', '# Finished', '# Your own books', 'Notes', 'Slides', 'Thesis'])
    const tile = grid.querySelector('.add-file-tile')!
    expect(grid.firstElementChild?.contains(tile)).toBe(true)
    // The + goes straight to the file step (PDF or EPUB), not to a second free-book search.
    expect(tile.getAttribute('href')).toBe('/lab/addbook/?mode=file')
    expect(tile.textContent).toBe('+Add a PDF or EPUB')
    const notes = grid.querySelector('.own-book a') as HTMLAnchorElement
    expect(notes.getAttribute('href')).toBe('/reader?userBook=cc')
    expect(grid.querySelector('.own-book canvas.cover')).not.toBeNull()
  })

  it('shows an own book\u2019s own cover at full size, and a paper cover without one', () => {
    const grid = document.createElement('div')
    addToTinct.appendOwnShelf(grid, [{ ...own('epub:aa', 'Notes', null), cover: 'data:image/jpeg;base64,AAAA' }, own('epub:bb', 'Plain', null)], el)
    const cards = [...grid.querySelectorAll('.own-book')]
    const image = cards.find(card => card.textContent?.includes('Notes'))!.querySelector('img.cover') as HTMLImageElement
    expect(image.getAttribute('src')).toBe('data:image/jpeg;base64,AAAA')
    expect(cards.find(card => card.textContent?.includes('Plain'))!.querySelector('canvas.cover')).not.toBeNull()
  })

  it('opens a Currently reading heading for own books when the library has none, and shows only the + tile on an empty list', () => {
    const grid = document.createElement('div')
    grid.append(el('h2', 'my-books-head', 'Saved for later'))
    addToTinct.appendOwnShelf(grid, [own('epub:aa', 'Notes', 3)], el)
    expect([...grid.querySelectorAll('.my-books-head')].map(h => h.textContent)).toEqual(['Currently reading', 'Saved for later', 'Your own books'])
    expect(grid.firstElementChild?.classList.contains('add-file-card')).toBe(true)
    const empty = document.createElement('div')
    expect(addToTinct.appendOwnShelf(empty, [], el)).toBe(1)
    expect([...empty.children].map(c => c.className)).toEqual(['collection-card add-file-card'])
    expect(addToTinct.ownShelfGroups([own('epub:a', 'A', null), own('epub:b', 'B', 2), own('epub:c', 'C', 7)]).reading.map((b: { title: string }) => b.title)).toEqual(['C', 'B'])
  })

  it('offers the file step from the search field only where Add to Tinct is on', () => {
    const link = document.createElement('a')
    link.hidden = true
    localStorage.setItem(INTERNAL_KEY, '1')
    addToTinct.syncSearchAddFile(link)
    expect(link.hidden).toBe(false)
    expect(link.getAttribute('href')).toBe('/lab/addbook/?mode=file')
    localStorage.removeItem(INTERNAL_KEY)
    addToTinct.syncSearchAddFile(link)
    expect(link.hidden).toBe(true)
    addToTinct.syncSearchAddFile(null)
  })

  it('opens with "+ Add a book", which opens the library search, before the file tile', () => {
    const grid = document.createElement('div')
    const open = vi.fn()
    expect(addToTinct.appendOwnShelf(grid, [], el, open)).toBe(2)
    expect([...grid.children].map(c => c.className)).toEqual(['collection-card add-book-card', 'collection-card add-file-card'])
    const shelf = document.createElement('div')
    shelf.append(el('h2', 'my-books-head', 'Currently reading'))
    addToTinct.appendOwnShelf(shelf, [own('epub:aa', 'Notes', null)], el, open)
    expect([...shelf.children].map(c => c.classList.contains('my-books-head') ? `# ${c.textContent}` : c.className)).toEqual(['collection-card add-book-card', 'collection-card add-file-card', '# Currently reading', '# Your own books', 'collection-card own-book'])
    const tile = grid.querySelector('.add-book-tile') as HTMLButtonElement
    expect(tile.tagName).toBe('BUTTON')
    expect(tile.textContent).toBe('+Add a book')
    expect(tile.getAttribute('href')).toBeNull()
    tile.click()
    expect(open).toHaveBeenCalledTimes(1)
  })
})

describe('Your own book pop-up (the search field +, "Add a PDF or EPUB")', () => {
  afterEach(() => { addToTinct.closeFileDialog(); document.documentElement.classList.remove('signed-in'); document.body.replaceChildren() })
  const entry = () => { const link = document.createElement('a'); link.href = '/lab/addbook/?mode=file'; document.body.append(link); return link }
  const dialog = () => document.querySelector('[data-testid="own-file-dialog"]')

  it('shows Add a book’s own wording and a button that opens the file picker, without leaving the page', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn()
    await addToTinct.openFileEntry(entry(), { access: async () => true, go })
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
  })

  it('hands the chosen file to Add a book’s upload flow, or opens its file step when it cannot', async () => {
    document.documentElement.classList.add('signed-in')
    for (const kept of [true, false]) {
      const go = vi.fn()
      const keep = vi.fn(async () => kept)
      await addToTinct.openFileEntry(entry(), { access: async () => null, go, keep })
      const input = dialog()!.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['%PDF-1.4'], 'notes.pdf', { type: 'application/pdf' })
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      input.dispatchEvent(new Event('change'))
      await vi.waitFor(() => expect(go).toHaveBeenCalledTimes(1))
      expect(keep).toHaveBeenCalledWith(file)
      expect(go).toHaveBeenCalledWith(kept ? '/lab/addbook/?mode=file&handoff=1' : 'http://localhost:3000/lab/addbook/?mode=file')
      expect(dialog()).toBeNull()
    }
  })

  it('keeps the gating: a free account past its trial gets the Premium offer, never the pop-up', async () => {
    document.documentElement.classList.add('signed-in')
    const go = vi.fn()
    await addToTinct.openFileEntry(entry(), { access: async () => false, go })
    expect(go).toHaveBeenCalledWith(addToTinct.PREMIUM_PAGE)
    expect(dialog()).toBeNull()
  })

  it('closes on Cancel and Escape', async () => {
    document.documentElement.classList.add('signed-in')
    await addToTinct.openFileEntry(entry(), { access: async () => true, go: vi.fn() })
    ;(dialog()!.querySelector('.own-file-cancel') as HTMLButtonElement).click()
    expect(dialog()).toBeNull()
    await addToTinct.openFileEntry(entry(), { access: async () => true, go: vi.fn() })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(dialog()).toBeNull()
  })

  it('shows the top bar + only where Add to Tinct is on, opening the add-a-book flow', () => {
    const button = document.createElement('button')
    const open = vi.fn()
    addToTinct.syncLibraryAdd(button, open)
    expect(button.hidden).toBe(true)
    document.documentElement.classList.add('signed-in')
    addToTinct.syncLibraryAdd(button, open)
    expect(button.hidden).toBe(false)
    button.click()
    expect(open).toHaveBeenCalledTimes(1)
    // Re-synced on sign-in/out without binding twice.
    addToTinct.syncLibraryAdd(button, open)
    button.click()
    expect(open).toHaveBeenCalledTimes(2)
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
