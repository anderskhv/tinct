// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { groupEditions, groupSearchResults, inTinct, type CatalogueWork } from '../public/lab/public-books.js'
import { INTERNAL_KEY } from '../public/lab/internal-traffic.js'
// @ts-expect-error -- plain module shared by Add a book, freepubs.fyi and the library
import { cleanName, cleanTitle, createSearch, hydrate, languagesOf } from '../../addbooks/site/search.js'
// @ts-expect-error -- plain browser module of the library page
import { createLibrarySearch } from '../public/lab/library_2/library-search.js'
// @ts-expect-error -- plain browser module of the library page
import * as addToTinct from '../public/lab/library_2/add-to-tinct.js'

// Library search QA fixes (2026-10-08), unit by unit; the real-catalogue cases are in librarySearchGolden.test.ts.
type Person = { name: string; birthYear?: number; deathYear?: number; aliases?: string[] }
type Raw = { id: string; title: string; language?: string[]; popularity?: number; authors?: Person[]; translators?: Person[]; editions: Array<Record<string, unknown>> }
const raw = (id: string, title: string, authors: Person[], popularity = 100, extra: Partial<Raw> = {}): Raw =>
  ({ id, title, language: ['en'], popularity, authors, editions: [{ source: id.startsWith('ws:') ? 'Wikisource' : 'Gutenberg', epubUrl: id.startsWith('ws:') ? `https://ws-export.wmcloud.org/?format=epub&lang=en&page=${id}` : `https://www.gutenberg.org/ebooks/${id.split(':')[1]}.epub3.images` }], ...extra })
const engine = (list: Raw[]) => {
  const works = hydrate(structuredClone(list))
  for (const w of works) for (const e of w.editions) { if (!e.authors.length) e.authors = w.authors; if (!e.translators.length) e.translators = w.translators; if (!e.title) e.title = w.title }
  const run = createSearch(works)
  return (query: string) => run(query, { language: 'en' }, 50) as { results: Array<{ id: string; title: string }>; author: { name: string } | null }
}
const el = (tag: string, cls?: string, text?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e }

describe('blank results after a search-only book\'s cover is cached (library_2/app.js)', () => {
  const app = readFileSync('public/lab/library_2/app.js', 'utf8')
  it('paints and labels covers by looking the book up among the search-only books too', () => {
    // `books.find` missed War and Peace (held from the shelves, searched): "reading 'typeset'" of undefined.
    expect(app).toContain('function bookById(id){return books.find(b=>b.id===id)||searchOnlyBooks.find(b=>b.id===id);}')
    const paint = app.slice(app.indexOf('function paintCover('), app.indexOf('const designs='))
    expect(paint).toContain('const book=bookById(id);if(book?.typeset){')
    expect(paint).not.toContain('books.find(')
    expect(app).toContain("all('[data-metadata-book]').forEach(meta=>{const book=bookById(meta.dataset.metadataBook);")
    // Declared before the first cover is painted (the Featured row), not in its temporal dead zone.
    expect(app.indexOf('const searchOnlyBooks=[];')).toBeLessThan(app.indexOf("[['Featured',"))
  })
})

describe('the engine: who an author query means', () => {
  it('"hume" is David Hume, known on more Wikimedia sites, though Fergus Hume is downloaded more', () => {
    const david = { name: 'David Hume', birthYear: 1711, deathYear: 1776 }, fergus = { name: 'Fergus Hume', birthYear: 1859, deathYear: 1932 }
    const list = [raw('pg:9662', 'An Enquiry Concerning Human Understanding', [david], 9000), raw('pg:4705', 'A Treatise of Human Nature', [david], 8000),
      raw('pg:2868', 'The Green Mummy', [fergus], 24000), raw('pg:36346', "The Mandarin's Fan", [fergus], 14000), raw('pg:4223', 'The Mystery of a Hansom Cab', [fergus], 900)]
    const works = hydrate(structuredClone(list)) as Array<Raw & { wikidata?: string; sitelinks?: number }>
    Object.assign(works[0], { wikidata: 'Q1', sitelinks: 21 }); Object.assign(works[1], { wikidata: 'Q2', sitelinks: 26 }); Object.assign(works[4], { wikidata: 'Q3', sitelinks: 9 })
    for (const w of works) for (const e of w.editions as Array<Record<string, unknown>>) { e.authors = w.authors; e.translators = w.translators; e.title = w.title }
    const out = createSearch(works)('hume', { language: 'en' }, 50)
    expect(out.author.name).toBe('David Hume')
    expect(out.results.slice(0, 2).map((w: Raw) => w.id).sort()).toEqual(['pg:4705', 'pg:9662'])
    expect(out.results.map((w: Raw) => w.id)).toContain('pg:2868') // another Hume by surname follows
  })

  it('a person the query names only by a given or middle name is left out when the author is clear', () => {
    const dante = { name: 'Dante Alighieri', birthYear: 1265, deathYear: 1321 }, rossetti = { name: 'Dante Gabriel Rossetti', birthYear: 1828, deathYear: 1882 }
    const works = hydrate(structuredClone([raw('pg:8800', 'The divine comedy', [dante], 20000), raw('pg:41085', 'The New Life', [dante], 8000), raw('pg:3692', 'The House of Life', [rossetti], 1000)])) as Array<Raw & { wikidata?: string; sitelinks?: number }>
    Object.assign(works[0], { wikidata: 'Q1', sitelinks: 150 })
    for (const w of works) for (const e of w.editions as Array<Record<string, unknown>>) { e.authors = w.authors; e.translators = w.translators; e.title = w.title }
    const out = createSearch(works)('dante', { language: 'en' }, 50)
    expect(out.author.name).toBe('Dante Alighieri')
    expect(out.results.map((w: Raw) => w.id)).toEqual(['pg:8800', 'pg:41085'])
  })

  it('near spellings name the author ("nietzche"): his books before books about him', () => {
    const search = engine([raw('pg:4363', 'Beyond Good and Evil', [{ name: 'Friedrich Wilhelm Nietzsche', birthYear: 1844, deathYear: 1900 }], 9000),
      raw('pg:1998', 'Thus Spake Zarathustra', [{ name: 'Friedrich Wilhelm Nietzsche', birthYear: 1844, deathYear: 1900 }], 9000),
      raw('pg:53622', 'What Nietzsche Taught', [{ name: 'Willard Huntington Wright' }], 20000)])
    const out = search('nietzche')
    expect(out.author?.name).toBe('Friedrich Wilhelm Nietzsche')
    expect(out.results.map(w => w.id).slice(0, 2).sort()).toEqual(['pg:1998', 'pg:4363'])
  })

  it('Gutenberg\'s indexes and compilations of its own files are never results', () => {
    const austen = { name: 'Jane Austen', birthYear: 1775, deathYear: 1817 }
    const search = engine([raw('pg:1342', 'Pride and Prejudice', [austen]), raw('pg:31100', 'The Complete Project Gutenberg Works of Jane Austen', [austen], 9000),
      raw('pg:1', 'Index of the Project Gutenberg Works of Jane Austen', [austen], 9000), raw('pg:2', 'Project Gutenberg Compilation of Short Stories by Jane Austen', [austen], 9000)])
    expect(search('austen').results.map(w => w.id)).toEqual(['pg:1342'])
    expect(search('complete project gutenberg works').results).toEqual([])
  })

  it('weak matches go when strong ones exist; two letters off counts only in a title', () => {
    const search = engine([raw('pg:15', 'Moby Dick', [{ name: 'Herman Melville' }], 90000), raw('pg:68699', 'Dusky Dick', [{ name: 'Joseph Badger' }], 400, { subtitle: "Old Toby Castor's great campaign" } as Partial<Raw>),
      raw('pg:9', 'A searchlight on Germany', [{ name: 'W. Hornaday' }], 300, { subjects: ['Crime', 'Punishment'] } as Partial<Raw>), raw('pg:10', 'Crime and Punishment', [{ name: 'Fyodor Dostoevsky' }], 90000),
      raw('pg:21394', "Priscilla's Spies", [{ name: 'George A. Birmingham' }], 9000), raw('pg:16459', 'Musical Memories', [{ name: 'Camille Saint-Saëns' }], 900),
      raw('pg:1727', 'The Odyssey', [{ name: 'Homer' }], 9000)])
    expect(search('moby dick').results.map(w => w.id)).toEqual(['pg:15'])
    expect(search('crime and punishment').results.map(w => w.id)).toEqual(['pg:10'])
    expect(search('sapiens').results).toEqual([]) // not "spies", not Saint-Saëns
    expect(search('oddysey').results.map(w => w.id)).toEqual(['pg:1727']) // a title two letters off still found
  })

  it('"Kant" lists only Kant in Tinct: a borrowed translator a near spelling away is a weak match', () => {
    const library = createLibrarySearch([{ id: 'kant-groundwork', title: 'Groundwork of the Metaphysics of Morals', author: 'Immanuel Kant' }, { id: 'candide', title: 'Candide', author: 'Voltaire' }],
      { candide: { popularity: 9000, aliases: [], titles: [], translators: ['Charles Kent'] } })
    expect(library('kant').map((b: { id: string }) => b.id)).toEqual(['kant-groundwork'])
  })
})

describe('names, titles and languages as readers write them', () => {
  it('cleanName puts library forms back in order', () => {
    expect(cleanName("Roger, Sir L'Estrange")).toBe("Sir Roger L'Estrange")
    expect(cleanName('Leo, graf Tolstoy')).toBe('Leo Tolstoy')
    expect(cleanName('Agénor, comte de Gasparin')).toBe('Agénor de Gasparin')
    expect(cleanName('Mary Wortley, Lady Montagu')).toBe('Lady Mary Wortley Montagu')
    expect(cleanName('Emperor of Rome Marcus Aurelius')).toBe('Marcus Aurelius')
    expect(cleanName('of Hippo, Saint Augustine')).toBe('Saint Augustine of Hippo')
    // Forms that already read right are kept.
    for (const name of ['Alfred Tennyson, Baron Tennyson', 'Henry Hawkins, Baron Brampton', 'Jane Austen', 'W. H. D. (William Henry Denham) Rouse']) expect(cleanName(name)).toBe(name)
  })

  it('hydrate keeps the library form as another name, so searching it still finds the person', () => {
    const [w] = hydrate([raw('pg:1', 'Resurrection', [{ name: 'Leo, graf Tolstoy', birthYear: 1828, deathYear: 1910 }])])
    expect(w.authors[0]).toMatchObject({ name: 'Leo Tolstoy', aliases: ['Leo, graf Tolstoy'] })
  })

  it('cleanTitle drops "[sic]", a trailing full stop, a Wikisource edition label, and mends a few', () => {
    expect(cleanTitle('Love and Freindship [sic]')).toBe('Love and Freindship')
    expect(cleanTitle('The vision of hell.')).toBe('The vision of hell')
    expect(cleanTitle('Pericles (1925) Yale')).toBe('Pericles')
    expect(cleanTitle('Tragedies of Seneca (1907) Miller')).toBe('Tragedies of Seneca')
    expect(cleanTitle('Bleak-House')).toBe('Bleak House')
    for (const title of ['Redburn. His First Voyage', 'The Works of John Smith, Esq.', 'Moby-Dick', 'U.S.A.']) expect(cleanTitle(title)).toBe(title)
  })

  it('a Wikisource work is in its wiki\'s language', () => {
    expect(languagesOf({ id: 'ws:pt:Q82464', language: ['en'] })).toEqual(['pt'])
    expect(languagesOf({ id: 'ws:de:Q1', language: ['de'] })).toEqual(['de'])
    expect(languagesOf({ id: 'ws:en:Q1', language: ['en'] })).toEqual(['en'])
    expect(languagesOf({ id: 'pg:1', language: ['en'] })).toEqual(['en'])
  })

  it('dates: an era rather than a 100-year life, and "Written" as the library writes early dates', () => {
    expect(addToTinct.lifespan({ birthYear: -750, deathYear: -650 })).toBe('c. 750 BC')
    expect(addToTinct.lifespan({ birthYear: -4, deathYear: 65 })).toBe('4 BC – AD 65')
    expect(addToTinct.writtenYear({ firstPublishedYear: 60, authors: [{ name: 'Seneca', deathYear: 65 }] })).toBe('c. 60 AD')
    const facts = addToTinct.tinctRowFacts({ id: 'pd-pg-64576', title: 'Minor Dialogues', author: 'Lucius Annaeus Seneca', displayYear: '60', editions: [] })
    expect(facts.facts).toContainEqual(['Written', 'c. 60 AD'])
    const added = addToTinct.tinctRowFacts({ id: 'pd-pg-56075', title: "Seneca's Morals", author: 'Lucius Annaeus Seneca', editions: [{ key: 'original-en', language: 'en', translator: "Roger, Sir L'Estrange" }] })
    expect(added.translator).toBe("Sir Roger L'Estrange")
  })
})

describe('"Not yet in Tinct": one row per work, no copy of a Tinct book', () => {
  const gutenberg = (id: string, title: string, author: string, extra: Partial<CatalogueWork> = {}): CatalogueWork =>
    ({ id, title, language: ['en'], authors: [{ name: author }], editions: [{ source: 'Gutenberg', epubUrl: `https://www.gutenberg.org/ebooks/${id.split(':')[1]}.epub3.images`, sourceUrl: null, licence: 'PD' }], ...extra })

  it('volumes and parts of one work are one row', () => {
    const journal = [1, 2, 3].map(n => gutenberg(`pg:7083${n}`, `The journal of Montaigne's travels in Italy, Volume ${n} (of 3)`, 'Michel de Montaigne'))
    const treatise = [gutenberg('pg:989', 'Theologico-Political Treatise — Part 1', 'Benedictus de Spinoza'), gutenberg('pg:992', 'A Theological-Political Treatise [Part IV]', 'Benedictus de Spinoza')]
    const grouped = groupEditions([...journal, ...treatise, gutenberg('pg:3800', 'Ethics', 'Benedictus de Spinoza')])
    expect(grouped.map(w => w.id)).toEqual(['pg:70831', 'pg:989', 'pg:3800'])
    expect(grouped[0].alternates.map(w => w.id)).toEqual(['pg:70832', 'pg:70833'])
    expect(grouped[1].alternates.map(w => w.id)).toEqual(['pg:992'])
    // Two works with only similar titles stay two rows.
    expect(groupEditions([gutenberg('pg:1', 'The History of England, Volume I', 'David Hume'), gutenberg('pg:2', 'The History of English Literature, Part 1', 'David Hume')]).map(w => w.id)).toEqual(['pg:1', 'pg:2'])
  })

  it('the same title in the same translation from two libraries is one row', () => {
    const ws = (id: string, title: string, author: string, translator: string) => ({ ...gutenberg(id, title, author), translators: [{ name: translator }], editions: [{ source: 'Wikisource', epubUrl: `https://ws-export.wmcloud.org/?format=epub&lang=en&page=${id}`, sourceUrl: null, licence: 'CC BY-SA 4.0' }] })
    const grouped = groupEditions([{ ...gutenberg('pg:3794', 'L. Annaeus Seneca on Benefits', 'Lucius Annaeus Seneca'), translators: [{ name: 'Aubrey Stewart' }] }, ws('ws:en:Q19085747', 'On Benefits', 'Seneca', 'Aubrey Stewart')])
    expect(grouped.map(w => w.id)).toEqual(['pg:3794'])
    expect(grouped[0].alternates.map(w => w.id)).toEqual(['ws:en:Q19085747'])
  })

  it('knows a Tinct book by its other titles, an author\'s name around the title, and a whole work in its translation', () => {
    const groundwork = { id: 'kant-groundwork', title: 'Groundwork of the Metaphysics of Morals', author: 'Immanuel Kant', altTitles: ['Fundamental Principles of the Metaphysic of Morals'] }
    expect(inTinct(gutenberg('pg:5682', 'Fundamental Principles of the Metaphysic of Morals', 'Immanuel Kant'), [groundwork])).toBe(true)
    const genealogy = { id: 'genealogy', title: 'On the Genealogy of Morals', author: 'Friedrich Nietzsche' }
    expect(inTinct(gutenberg('ws:en:Q19088097', 'The Genealogy of Morals', 'Friedrich Nietzsche'), [genealogy])).toBe(true)
    const benefits = { id: 'pd-pg-3794', title: 'L. Annaeus Seneca on Benefits', author: 'Lucius Annaeus Seneca' }
    expect(inTinct(gutenberg('ws:en:Q19085747', 'On Benefits', 'Seneca'), [benefits])).toBe(true)
    const faust = { id: 'faust-part-1', title: 'Faust, Part One', author: 'Johann Wolfgang von Goethe', editions: [{ key: 'original-en', translator: 'Bayard Taylor' }] }
    expect(inTinct({ ...gutenberg('ws:en:Q87144479', "Goethe's Faust", 'Johann Wolfgang von Goethe'), translators: [{ name: 'Bayard Taylor' }] }, [faust])).toBe(true)
    expect(inTinct({ ...gutenberg('pg:63203', 'Faust', 'Johann Wolfgang von Goethe'), translators: [{ name: 'John Stuart Blackie' }] }, [faust])).toBe(false) // another translation stays
    const comedy = { id: 'divine-comedy', title: 'The Divine Comedy', author: 'Dante Alighieri' }
    expect(inTinct(gutenberg('pg:8789', 'The Divine Comedy by Dante, Illustrated, Hell, Volume 01', 'Dante Alighieri'), [comedy])).toBe(true)
  })

  it('leaves out Gutenberg\'s quotation selections', () => {
    const free = [gutenberg('pg:3600', 'Essays of Michel de Montaigne — Complete', 'Michel de Montaigne'), gutenberg('pg:7551', 'Quotes and Images From The Works of Michel De Montaigne', 'Michel de Montaigne'), gutenberg('pg:3661', "Widger's Quotations from the Project Gutenberg Editions of the Works of Montaigne", 'Michel de Montaigne')]
    expect(groupSearchResults({ tinct: [], free, tinctBooks: [] }).notYet.map(w => w.id)).toEqual(['pg:3600'])
  })
})

describe('the search panel: author card chips, empty searches', () => {
  class FakeWorker {
    onmessage: ((event: { data: unknown }) => void) | null = null
    onerror: (() => void) | null = null
    static reply: Record<string, unknown> = { results: [] }
    postMessage(message: { type: string; request?: number }) {
      queueMicrotask(() => {
        if (message.type === 'load') this.onmessage?.({ data: { type: 'ready', total: 1, sources: 1 } })
        if (message.type === 'search') this.onmessage?.({ data: { type: 'results', request: message.request, total: 0, ...FakeWorker.reply } })
      })
    }
  }
  beforeEach(() => { localStorage.setItem(INTERNAL_KEY, '1'); vi.stubGlobal('Worker', FakeWorker) })
  afterEach(() => { localStorage.removeItem(INTERNAL_KEY); vi.unstubAllGlobals() })

  it('a chip closes the row the previous chip opened', () => {
    const box = el('div')
    for (const key of ['work:a', 'work:b']) box.append(addToTinct.resultRow({ el, facts: { title: key, author: '', translator: '', editions: '', includes: '', aka: '', pills: [], description: '', facts: [['Source', 'Wikisource']] }, action: el('button'), key, className: 'free-row' }))
    addToTinct.revealRow(box, 'work:a')
    addToTinct.revealRow(box, 'work:b')
    expect([...box.querySelectorAll('.result-row.is-open')].map(row => (row as HTMLElement).dataset.rowKey)).toEqual(['work:b'])
  })

  it('names the author the engine identified, with their own works only', async () => {
    const seneca = { name: 'Seneca', birthYear: -4, deathYear: 65 }
    const own = (id: string, title: string) => ({ ...raw(id, title, [seneca]), byAuthor: true })
    FakeWorker.reply = { results: [own('ws:en:Q97452599', 'Moral letters to Lucilius'), own('pg:10001', 'Apocolocyntosis'), raw('pg:61477', 'Seneca myths and folk tales', [{ name: 'Arthur C. Parker' }])], author: { name: 'Seneca', names: ['Seneca', 'Lucius Annaeus Seneca'], birthYear: -4, deathYear: 65 } }
    const box = el('div'); document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'seneca', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box.querySelector('.author-card')).not.toBeNull())
    expect(box.querySelector('.author-name')?.textContent).toBe('Seneca')
    expect([...box.querySelectorAll('.author-work')].map(chip => chip.textContent)).toEqual(['Moral letters to Lucilius', 'Apocolocyntosis'])
    box.remove()
  })

  it('says why a search found nothing: only in other languages (Kafka), or still under copyright', async () => {
    expect(addToTinct.emptyReason({ name: 'Franz Kafka', languages: ['de'] })).toBe('Tinct has Franz Kafka only in German. The English translations aren’t public domain yet.')
    expect(addToTinct.emptyReason({ name: 'Somebody', languages: ['de', 'fr', 'la'] })).toBe('Tinct has Somebody only in German, French and Latin. The English translations aren’t public domain yet.')
    expect(addToTinct.emptyReason(null)).toBe('Tinct only has books in the public domain, so books still under copyright aren’t here.')
    expect(addToTinct.emptyReason(null, true)).toBe('') // a chosen language other than English was searched as asked
    FakeWorker.reply = { results: [], elsewhere: { name: 'Franz Kafka', languages: ['de'] } }
    const box = el('div'); document.body.append(box)
    addToTinct.renderSearchGroups(box, { query: 'kafka', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box.querySelector('.search-why')).not.toBeNull())
    expect([...box.querySelectorAll('.search-none')].map(p => p.textContent)).toEqual(['Try another title or author.', 'Tinct has Franz Kafka only in German. The English translations aren’t public domain yet.'])
    box.remove()
    FakeWorker.reply = { results: [] }
    const box2 = el('div'); document.body.append(box2)
    addToTinct.renderSearchGroups(box2, { query: 'harry potter', tinct: [], tinctBooks: [], renderTinct: () => {}, el, onAdd: () => {}, addingWork: null })
    await vi.waitFor(() => expect(box2.querySelector('.search-why')).not.toBeNull())
    expect(box2.querySelector('.search-why')?.textContent).toBe('Tinct only has books in the public domain, so books still under copyright aren’t here.')
    box2.remove()
  })
})
