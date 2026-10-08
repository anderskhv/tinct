// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { groupSearchResults, importableWork, inTinct, REGISTRY_GUTENBERG_IDS, titleAuthorKey, type CatalogueWork } from '../public/lab/public-books.js'
// @ts-expect-error -- plain module shared by Add a book, freepubs.fyi and the library
import { createSearch, hydrate, borrowFor, applyPriors, altTitlesFor, includedWork } from '../../addbooks/site/search.js'
// @ts-expect-error -- plain browser module of the library page
import { createLibrarySearch } from '../public/lab/library_2/library-search.js'
// @ts-expect-error -- plain browser module of the library page
import { freeRowFacts, resultRow, findAuthor, lifespan } from '../public/lab/library_2/add-to-tinct.js'
// @ts-expect-error -- plain browser module of the library page
import { books as starterBooks } from '../public/lab/library_2/books.js'
import { serializePreReaderCatalogue } from './preReader/catalogue'
import { GOLDEN_CASES } from './__fixtures__/librarySearchGolden'

// The library search panel scored on the golden set (search audit, 2026-10-07), over the real
// installed catalogue and the library's own books: "Available in Tinct" (library-search.js), then
// "Not yet in Tinct" (the catalogue engine, English, 40 works, grouped by public-books.js), as the
// library shows them. strict@1: the first row is a right answer, no Tinct book that is a right
// answer is missing from "Available in Tinct", and no catalogue copy of a Tinct book is offered.
// The catalogue's work priors (public/lab/addbook/data/work-priors.json) apply as the worker applies them.
// Deterministic: the committed catalogue, no network. English works only are indexed, which ranks
// an English search exactly as the whole catalogue does (other languages never pass its filter).
type Person = { name: string; aliases?: string[] }
type Work = CatalogueWork & { authors: Person[]; editions: Array<Record<string, unknown>> }
type Book = { id: string; title: string; author: string; altTitles?: string[] }
const STRICT_AT_1 = 0.9

const fold = (s: string) => ' ' + String(s).toLowerCase().replace(/æ/g, 'ae').replace(/œ/g, 'oe').normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim() + ' '
function parse(expectation: string): [RegExp, RegExp] {
  let title: string, author: string
  if (expectation.includes(' @ ')) [title, author] = expectation.split(' @ ')
  else {
    let depth = 0, i = 0
    for (; i < expectation.length; i++) { const c = expectation[i]; if (c === '(') depth++; else if (c === ')') depth--; else if (c === '|' && !depth) break }
    title = expectation.slice(0, i); author = expectation.slice(i + 1)
  }
  const rx = (x: string) => x.trim() === '.' ? /(?:)/ : new RegExp(x.replace(/\^/g, '^ ').replace(/\$/g, ' $'), 'i')
  return [rx(title), rx(author)]
}
const matcher = (expectations: string[]) => {
  const parsed = expectations.map(parse)
  return (title: string, author: string) => parsed.some(([t, a]) => t.test(fold(title)) && a.test(fold(author)))
}

type Row = { tinct: boolean; title: string; author: string; id: string }
type Engine = (query: string, filters?: Record<string, string>, limit?: number) => { total: number; results: Work[]; author: { name: string; names: string[]; birthYear: number | null; deathYear: number | null; works: Set<Work> } | null }
let panel: { rows: (query: string) => Row[]; tinctBooks: Book[]; notYet: (query: string) => Work[]; search: Engine; tinctSearch: (query: string) => Book[]; free: (query: string) => Work[]; all: Work[] } | null = null
/** The search panel's rows for a query, as the library shows them; built once. */
function searchPanel() {
  if (panel) return panel
    const raw = JSON.parse(gunzipSync(readFileSync(join(__dirname, '../public/lab/addbook/data/catalog.json.gz'))).toString('utf8')) as { works: Work[] }
    const priors = JSON.parse(readFileSync(join(__dirname, '../public/lab/addbook/data/work-priors.json'), 'utf8'))
    const all: Work[] = applyPriors(hydrate(raw.works), priors)
    for (const w of all) for (const e of w.editions as unknown as Array<{ authors: Person[]; translators: Person[]; title: string }>) {
      if (!e.authors.length) e.authors = w.authors
      if (!e.translators.length) e.translators = (w as unknown as { translators: Person[] }).translators
      if (!e.title) e.title = w.title
    }
    const english = all.filter(w => (w.language || []).includes('en'))
    const search = createSearch(english)
    // The library's books: the starter list, then every discoverable catalogue book (app.js).
    const tinctBooks: Book[] = (starterBooks as Book[]).map(b => ({ id: b.id, title: b.title, author: b.author }))
    for (const entry of serializePreReaderCatalogue().books) {
      if (entry.discoveryAvailable === false) continue
      const known = tinctBooks.find(b => b.id === entry.id)
      if (known) { if (entry.altTitles) known.altTitles = entry.altTitles } else tinctBooks.push({ id: entry.id, title: entry.title, author: entry.author, ...(entry.altTitles ? { altTitles: entry.altTitles } : {}) })
    }
    const workIds = (book: Book) => Object.entries(REGISTRY_GUTENBERG_IDS).filter(([, id]) => id === book.id).map(([workId]) => workId)
    // The worker lends what the English catalogue knows of the library's books (search-worker.js borrow).
    const tinctSearch = createLibrarySearch(tinctBooks, borrowFor(tinctBooks.map(b => ({ ...b, workIds: workIds(b) })), english))
    // As the worker sends a result (search-worker.js slim): its other titles, curated ones included, and its Wikidata work.
    const sent = (w: Work) => ({ ...w, altTitles: [...new Set([...((w as { altTitles?: string[] }).altTitles || []), ...altTitlesFor(w.title, (w.authors as Person[]).map(p => p.name).join(' '))])], wikidata: (w as { wikidata?: string }).wikidata || null })
    const notYet = (query: string) => groupSearchResults({ tinct: tinctSearch(query), free: search(query, { language: 'en' }, 40).results.map(sent), tinctBooks }).notYet as Work[]
    const rows = (query: string): Row[] => [...(tinctSearch(query) as Book[]).map(b => ({ tinct: true, id: b.id, title: b.title, author: b.author })),
      ...notYet(query).map(w => ({ tinct: false, id: w.id, title: w.title, author: (w.authors as Person[]).map(p => p.name).join(', ') }))]
    // The worker's "Not yet in Tinct" results as it posts them: the author the query names, their works flagged.
    const free = (query: string) => { const out = search(query, { language: 'en' }, 40); return Object.assign(out.results.map(w => ({ ...sent(w), ...(out.author?.works.has(w) ? { byAuthor: true } : {}) })), { author: out.author }) as Work[] }
    panel = { rows, tinctBooks, notYet, search, tinctSearch, free, all }
  return panel
}

describe('library search golden set', () => {
  it(`strict@1 is at least ${STRICT_AT_1 * 100}% of ${GOLDEN_CASES.length} queries`, () => {
    const { rows: panelRows, tinctBooks, notYet: notYetFor } = searchPanel()
    // An independent check for copies: the audit's "first title segment + first author surname" key.
    const tinctKeys = new Set(tinctBooks.map(b => titleAuthorKey(b.title, b.author)))
    const copyKey = (w: Work) => titleAuthorKey(String(w.title).split(/[,:;(]| or /i)[0], w.authors?.[0]?.name || '')

    const failures: string[] = []
    let strict = 0
    for (const [query, , expectations] of GOLDEN_CASES) {
      const right = matcher(expectations)
      const rows = panelRows(query)
      const available = rows.filter(row => row.tinct)
      const notYet = notYetFor(query)
      const first = rows[0]
      const tinctHidden = tinctBooks.some(b => right(b.title, b.author)) && !available.some(b => right(b.title, b.author))
      const copies = notYet.filter(w => inTinct(w, tinctBooks) || tinctKeys.has(copyKey(w as Work)) || !importableWork(w))
      if (first && right(first.title, first.author) && !tinctHidden && !copies.length) strict++
      else failures.push(`${query} -> ${first ? `${first.tinct ? '[Tinct] ' : ''}${first.title} — ${first.author}` : '(nothing)'}${tinctHidden ? ' [Tinct book hidden]' : ''}${copies.length ? ` [copy offered: ${copies.map(w => w.title).join('; ')}]` : ''}`)
    }
    const share = strict / GOLDEN_CASES.length
    console.log(`library search golden set: strict@1 ${strict}/${GOLDEN_CASES.length} (${(share * 100).toFixed(1)}%)\n  ${failures.join('\n  ')}`)
    expect(share, failures.join('\n')).toBeGreaterThanOrEqual(STRICT_AT_1)
  }, 120_000)
})

// Ranking sense (2026-10-08): fame from the work priors, an author's own books first, other names
// of famous works, one row per Wikidata work.
describe('library search: fame, own books, other titles, one row per work', () => {
  const ids = (query: string) => searchPanel().rows(query).map(row => row.id)
  const at = (list: string[], id: string) => { const i = list.indexOf(id); return i < 0 ? Infinity : i }

  it('"seneca": the Moral Letters first; his own books above Parker\'s Seneca folk tales and a three-author anthology', () => {
    const list = ids('seneca')
    expect(list[0]).toBe('ws:en:Q97452599') // Moral letters to Lucilius (Wikisource, no Gutenberg downloads)
    for (const own of ['pg:64576', 'pg:56075', 'pg:3794', 'pg:57999']) {
      expect(at(list, own)).toBeLessThan(at(list, 'pg:61477')) // Seneca myths and folk tales, by Arthur C. Parker
      expect(at(list, own)).toBeLessThan(at(list, 'pg:60831')) // Between Heathenism and Christianity (Super, Plutarch, Seneca)
    }
  }, 120_000)

  it('"letters from a stoic", "moral epistles" and "epistulae morales ad lucilium" find the Moral Letters first', () => {
    for (const query of ['letters from a stoic', 'Letters from a Stoic', 'moral epistles', 'epistulae morales ad lucilium', 'moral letters to lucilius']) expect(ids(query)[0], query).toBe('ws:en:Q97452599')
  })

  it('"seneca letters from a stoic": the Moral Letters first, its row saying "Seneca · also known as Letters from a Stoic" (owner, 2026-10-08)', () => {
    const query = 'seneca letters from a stoic'
    const [first] = searchPanel().notYet(query)
    expect(first.id).toBe('ws:en:Q97452599')
    expect(first.title).toMatch(/^Moral letters to Lucilius/i)
    const facts = freeRowFacts(first, query)
    expect(facts.aka).toBe('Letters from a Stoic')
    const el = (tag: string, cls?: string, text?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e }
    const row = resultRow({ el, facts, action: el('button'), key: 'work:' + first.id, className: 'free-row' })
    expect(row.querySelector('.row-author')?.textContent).toBe('Seneca · also known as Letters from a Stoic')
    // Found by its own title (or by the author alone), no "also known as".
    expect(freeRowFacts(first, 'moral letters to lucilius').aka).toBe('')
    expect(freeRowFacts(first, 'seneca').aka).toBe('')
    expect(freeRowFacts(first, 'letters from a sto').aka).toBe('Letters from a Stoic')
  })

  it('"confessions": Tinct\'s Confessions, and no catalogue copy of it ("The Confessions of St. Augustine")', () => {
    const list = ids('confessions')
    expect(list[0]).toBe('confessions')
    expect(list).not.toContain('pg:3296')
  })

  it('"homer": Homer\'s own books above books by people with Homer as a middle name', () => {
    const list = ids('homer')
    expect(list.slice(0, 2).sort()).toEqual(['iliad', 'odyssey'])
    expect(at(list, 'pg:48895')).toBeLessThan(at(list, 'pg:929')) // The Odysseys of Homer before Charles Homer Haskins
  })

  it('"montaigne": the complete Essays first, Gutenberg\'s quotation selections not in the first rows', () => {
    const list = ids('montaigne')
    expect(list[0]).toBe('pg:3600')
    expect(at(list, 'pg:3600')).toBeLessThan(at(list, 'pg:5637')) // Literary and Philosophical Essays, seven authors
    for (const selection of ['pg:7551', 'pg:3661']) expect(list.slice(0, 8)).not.toContain(selection) // Quotes and Images…, Widger's Quotations…
  })

  it('Seneca by author and title in any order, and the works inside his collections (owner\'s cases, 2026-10-08)', () => {
    const top = (query: string) => ids(query)[0]
    for (const query of ['seneca letters from a stoic', 'letters from a stoic seneca', 'seneca letters on ethics']) expect(top(query), query).toBe('ws:en:Q97452599')
    for (const query of ['seneca on the shortness of life', 'on the shortness of life', 'de brevitate vitae', 'seneca on anger', 'peace of mind seneca', 'seneca de tranquillitate animi', 'de ira seneca']) expect(top(query), query).toBe('pg:64576') // Minor Dialogues
    expect(ids('seneca on anger').slice(0, 2)).toEqual(['pg:64576', 'pg:56075']) // and L'Estrange's "…Benefits, Anger and Clemency"
    expect(ids('seneca tragedies').slice(0, 2)).toEqual(['pg:57999', 'pg:46058'])
    expect(ids('seneca medea').slice(0, 2)).toEqual(['pg:57999', 'pg:46058'])
    for (const query of ['thyestes', 'seneca phaedra', 'seneca hippolytus']) expect(top(query), query).toBe('pg:57999')
    expect(top('medea')).toBe('medea') // Tinct's Medea (Euripides) stays first
  })

  it('"Includes <work>": the worker names the work a query asks for inside a collection, also once the collection is in Tinct', () => {
    const dialogues = 'Minor Dialogues, Together With the Dialogue on Clemency'
    expect(includedWork(dialogues, 'Lucius Annaeus Seneca', 'seneca on anger')).toBe('On Anger')
    expect(includedWork(dialogues, 'Lucius Annaeus Seneca', 'de brevitate vitae')).toBe('On the Shortness of Life')
    expect(includedWork(dialogues, 'Lucius Annaeus Seneca', 'peace of mind seneca')).toBe('Peace of Mind')
    expect(includedWork(dialogues, 'Lucius Annaeus Seneca', 'seneca')).toBe('') // the author alone asks for no work
    expect(includedWork(dialogues, 'Lucius Annaeus Seneca', 'minor dialogues')).toBe('') // the title itself says it
    expect(includedWork('The Tragedies of Seneca', 'Lucius Annaeus Seneca', 'seneca medea')).toBe('Medea')
    expect(includedWork('The Tragedies of Seneca', 'Lucius Annaeus Seneca', 'hippolytus')).toBe('Phaedra')
    expect(includedWork('Some Other Dialogues', 'Lucius Annaeus Seneca', 'on anger')).toBe('')
    // A reader added Minor Dialogues: it is "Available in Tinct" for its works' names, first.
    const added = { id: 'pd-pg-64576', title: dialogues, author: 'Lucius Annaeus Seneca', public: { workId: 'pg:64576' } }
    const library = createLibrarySearch([...searchPanel().tinctBooks, added], {})
    for (const query of ['seneca on anger', 'on the shortness of life', 'peace of mind seneca']) expect((library(query) as Book[])[0]?.id, query).toBe('pd-pg-64576')
    expect(searchPanel().notYet('seneca on anger').map(w => w.id)).toContain('pg:64576') // not added in the panel's own library
    expect(groupSearchResults({ tinct: [], free: [{ id: 'pg:64576', title: dialogues, authors: [{ name: 'Lucius Annaeus Seneca' }], language: ['en'], editions: [{ source: 'Gutenberg', epubUrl: 'https://www.gutenberg.org/ebooks/64576.epub3.images' }] }] as unknown as CatalogueWork[], tinctBooks: [added] }).notYet).toEqual([])
  })

  it('"marcus aurelius": no catalogue copy of Tinct\'s Meditations under its other titles', () => {
    const notYet = searchPanel().notYet('marcus aurelius').map(w => w.id)
    for (const copy of ['pg:2680', 'pg:15877', 'pg:6920', 'ws:en:Q1152283', 'ws:en:Q52634585']) expect(notYet).not.toContain(copy)
  })
})

// Search QA (2026-10-08): the queries the QA pass found wrong, over the real catalogue and library.
describe('library search QA, 2026-10-08', () => {
  const tinctIds = (query: string) => searchPanel().tinctSearch(query).map(book => book.id)
  const notYet = (query: string) => searchPanel().notYet(query)
  const titles = (query: string) => notYet(query).map(w => String(w.title))
  const authors = (query: string) => notYet(query).map(w => (w.authors as Person[]).map(p => p.name).join(', '))
  const card = (query: string) => {
    const { tinctSearch, free, tinctBooks } = searchPanel()
    const tinct = tinctSearch(query), works = free(query)
    return findAuthor({ query, tinct, free: works, notYet: groupSearchResults({ tinct, free: works, tinctBooks }).notYet, tinctBooks })
  }

  it('an author query means that author: no Candide for "kant", no George Adam Smith, Fergus Hume or Dante Gabriel Rossetti before them', () => {
    expect(tinctIds('kant')).toEqual(['kant-groundwork']) // Candide matched a Norwegian edition's translator, Charles Kent
    for (const name of authors('adam smith')) expect(name).not.toMatch(/George Adam Smith/)
    expect(card('adam smith')?.works.map((w: { title: string }) => w.title).join(' / ')).not.toMatch(/Jeremiah|Expositor/)
    const hume = authors('hume')
    expect(hume.slice(0, 5).every(name => name === 'David Hume')).toBe(true)
    expect(titles('hume')).toContain('A Treatise of Human Nature')
    for (const name of authors('dante')) expect(name).not.toBe('Dante Gabriel Rossetti')
    for (const name of authors('homer')) expect(name).not.toMatch(/^Homer Greene$/)
  })

  it('the indexes and compilations Gutenberg makes of its own files are never listed', () => {
    for (const query of ['marcus aurelius', 'jane austen', 'chekhov', 'dostoevsky', 'montaigne']) {
      for (const title of titles(query)) expect(title, query).not.toMatch(/^(Index of the Project Gutenberg|The Complete Project Gutenberg Works|Project Gutenberg Compilation)/)
    }
    expect(card('marcus aurelius')?.works.map((w: { title: string }) => w.title)).not.toContain('Index of the Project Gutenberg Works of Marcus Aurelius Antoninus')
  })

  it('weak matches do not fill the rows: a title word near the query, or words only in subjects', () => {
    expect(titles('sapiens')).not.toContain('Minor Dialogues, Together With the Dialogue on Clemency')
    expect(tinctIds('sapiens')).toEqual([])
    expect(titles('wealth of nations')).not.toContain('An Account of the Sore Throat Attended With Ulcers')
    expect(titles('moby dick')).not.toContain('Dusky Dick')
    expect(titles('crime and punishment')).not.toContain('A searchlight on Germany')
    expect(titles('letters from a stoic')).not.toContain('Between Heathenism and Christianity')
  })

  it('volumes and parts of one work are one row', () => {
    expect(titles('montaigne').filter(t => /^The journal of Montaigne's travels/.test(t))).toHaveLength(1)
    expect(titles('spinoza').filter(t => /Theolog\w+-Political Treatise/.test(t))).toHaveLength(1)
    // Volumes of the Divine Comedy, which Tinct has whole.
    expect(titles('divine comedy').filter(t => /Illustrated, Hell, Volume/.test(t))).toEqual([])
    expect(titles('inferno').filter(t => /Illustrated, Hell, Volume/.test(t))).toEqual([])
  })

  it('no catalogue copy of a book Tinct has, and one row for the same translation in two libraries', () => {
    expect(titles('kant')).not.toContain('Fundamental Principles of the Metaphysic of Morals') // Tinct's Groundwork
    expect(titles('nietzsche')).not.toContain('The Genealogy of Morals') // Tinct's On the Genealogy of Morals
    const seneca = notYet('seneca')
    expect(seneca.filter(w => /^(L\. Annaeus Seneca )?On Benefits$/i.test(String(w.title)))).toHaveLength(1)
    // Gutenberg's and Wikisource's Walter K. Kelly.
    expect(notYet('cervantes').filter(w => /^The Exemplary Novels of Cervantes$/.test(String(w.title)))).toHaveLength(1)
  })

  it('author cards for Tolstoy, Melville, Cervantes, Dante, Hume, and the misspelt "nietzche" and "shakespear"', () => {
    const expected: Array<[string, string]> = [['tolstoy', 'Leo Tolstoy'], ['melville', 'Herman Melville'], ['cervantes', 'Miguel de Cervantes'], ['dante', 'Dante Alighieri'], ['hume', 'David Hume'], ['nietzche', 'Friedrich Nietzsche'], ['shakespear', 'William Shakespeare'], ['adam smith', 'Adam Smith']]
    for (const [query, name] of expected) expect(card(query)?.name, query).toBe(name)
    // His own works before the books about him.
    const rows = searchPanel().rows('nietzche')
    const own = rows.findIndex(row => /^Thus Spake Zarathustra/.test(row.title)), about = rows.findIndex(row => !/Nietzsche/.test(row.author))
    expect(own).toBeGreaterThanOrEqual(0)
    if (about >= 0) expect(about).toBeGreaterThan(own)
    expect(rows.slice(0, own + 1).every(row => /Nietzsche/.test(row.author))).toBe(true)
  })

  it('names and titles as readers write them', () => {
    const named = (id: string) => searchPanel().all.find(w => w.id === id) as unknown as { translators: Person[] }
    expect(named('pg:56075').translators[0].name).toBe("Sir Roger L'Estrange")
    expect(authors('tolstoy')).not.toContain('Leo, graf Tolstoy')
    expect(authors('tolstoy')).toContain('Leo Tolstoy')
    expect(titles('dante')).toContain('The vision of hell')
    expect(titles('dickens')).toContain('Bleak House')
    for (const title of titles('the prince')) expect(title).not.toMatch(/\(\d{4}\) Yale$/)
    const austen = titles('jane austen')
    expect(austen.indexOf('Persuasion')).toBeLessThan(austen.indexOf('Love and Freindship'))
    expect(austen).not.toContain('Love and Freindship [sic]')
    expect(card('homer')?.lifespan).toBe('c. 750 BC')
    expect(lifespan({ birthYear: -428, deathYear: -348 })).toBe('428–348 BC')
  })

  it('in the default language, no titles in other languages, and Darwin\'s Descent of Man', () => {
    const wilde = titles('oscar wilde')
    for (const title of ['O Retrato de Dorian Gray', 'Le Fantôme de Canterville']) expect(wilde).not.toContain(title)
    const darwin = titles('darwin')
    expect(darwin).not.toContain('Die Abstammung des Menschen und die geschlechtliche Zuchtwahl')
    expect(darwin.some(title => /^The Descent of Man/.test(title))).toBe(true)
  })
})
