import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// @ts-expect-error -- plain module shared by Add a book, freepubs.fyi and the library's "Not yet in Tinct"
import { createSearch, hydrate } from '../../addbooks/site/search.js'

// The catalogue search engine (addbooks/site/search.js, installed as public/lab/addbook/js/search.js)
// over real records copied unchanged from public/lab/addbook/data/catalog.json.gz.
type Person = { name: string; aliases: string[] }
type Work = { id: string; title: string; language: string[]; authors: Person[]; translators: Person[]; editions: Array<{ authors: Person[]; translators: Person[]; title: string }> }
type Search = (query: string, filters?: { language?: string }, limit?: number) => { total: number; results: Work[] }

const fixture = JSON.parse(readFileSync(join(__dirname, '__fixtures__/catalogue-search-works.json'), 'utf8')) as { works: Work[] }
const works: Work[] = hydrate(structuredClone(fixture.works))
// As the worker (search-worker.js) prepares the slim catalogue: editions carry the work's people and title.
for (const w of works) for (const e of w.editions) {
  if (!e.authors.length) e.authors = w.authors
  if (!e.translators.length) e.translators = w.translators
  if (!e.title) e.title = w.title
}
const search: Search = createSearch(works)
const ids = (query: string, filters = {}) => search(query, filters, 50).results.map(w => w.id)
const rank = (list: string[], id: string) => { const i = list.indexOf(id); expect(i, `${id} in ${list.join(', ')}`).toBeGreaterThanOrEqual(0); return i }
const MAX_BRAND = works.filter(w => w.authors.some(a => a.name === 'Max Brand')).map(w => w.id)

describe('catalogue search ranking', () => {
  it('is the installed copy', () => {
    const source = readFileSync(join(__dirname, '../../addbooks/site/search.js'), 'utf8')
    expect(readFileSync(join(__dirname, '../public/lab/addbook/js/search.js'), 'utf8')).toBe(source)
  })

  it('"faust": the English Faust translations and Marlowe, and no Max Brand western', () => {
    expect(MAX_BRAND.length).toBe(3)
    const list = ids('faust')
    for (const id of MAX_BRAND) expect(list).not.toContain(id)
    // An alias is the only place Camille Mauclair's record has "Faust" too.
    expect(list).not.toContain('pg:14056')
    // Tier 1 (a title word is "faust"), English first: the Goethe translations, then the German Faust.
    expect(list.slice(0, 3)).toEqual(['pg:14591', 'pg:14460', 'pg:2229'])
    // Tier 2 (a title word starts with "faust"): Marlowe, then Klinger, by popularity.
    expect(rank(list, 'pg:779')).toBeLessThan(rank(list, 'pg:25468'))
    expect(rank(list, 'pg:2229')).toBeLessThan(rank(list, 'pg:779'))
    // Tier 3: the author's own name. Fewer works carry "Faust" as their author than as a title,
    // so this is not an author search and Frederick Schiller Faust comes after the titles.
    expect(rank(list, 'pg:25468')).toBeLessThan(rank(list, 'ws:en:Q61006269'))
  })

  it('is case- and diacritics-insensitive', () => {
    expect(ids('FAUST')).toEqual(ids('faust'))
    expect(ids('Fäust')).toEqual(ids('faust'))
    expect(ids('les miserables')).toEqual(ids('Les Misérables'))
    expect(ids('les miserables')[0]).toBe('bb:hugo_victor_-_les_miserables')
  })

  it('a single word found only in an author\'s other name is dropped; two of its words find it, last', () => {
    expect(ids('schiller')).toEqual(['ws:en:Q61006269'])
    const list = ids('frederick faust')
    expect(list[0]).toBe('ws:en:Q61006269')
    expect(list.slice(1).sort()).toEqual([...MAX_BRAND].sort())
  })

  it('"doctor faustus": Marlowe first', () => {
    const list = ids('doctor faustus')
    expect(list[0]).toBe('pg:779')
    expect(search('doctor faustus').results[0].authors[0].name).toBe('Christopher Marlowe')
    // English before the German translation of the same tier.
    expect(rank(list, 'ws:en:Q50919')).toBeLessThan(rank(list, 'tg:s8fj.0'))
  })

  it('respects the language filter, and ranks English first without one', () => {
    expect(ids('faust', { language: 'de' })).toEqual(['pg:2229', 'tg:s8fj.0']) // Faust, then Doktor Faustus
    // The Russian and German records are exact titles too ("The Idiot", "Der Idiot"), and rank after
    // the English ones; between them, equal popularity falls back to the title.
    expect(ids('idiot')).toEqual(['pg:18881', 'pg:21616', 'tg:mhpp.0', 'ws:en:Q24036344'])
    expect(ids('idiot', { language: 'de' })).toEqual(['tg:mhpp.0'])
    expect(ids('idiot', { language: 'ru' })).toEqual(['ws:en:Q24036344'])
  })

  it('every word of a multi-word query must match, and the title holding more of them ranks higher', () => {
    expect(ids('meditations marcus')).toEqual(['pg:2680', 'ws:en:Q52634585'])
    expect(ids('faust nonexistentword')).toEqual([])
  })

  it('sanity: dostoevsky, the idiot, jane austen, odyssey', () => {
    const dostoevsky = ids('dostoevsky')
    expect(dostoevsky.slice(0, 2)).toEqual(['pg:2554', 'pg:28054'])
    expect(dostoevsky).toContain('pg:76944')
    expect(dostoevsky[dostoevsky.length - 1]).toBe('pg:59196') // the Gutenberg index goes last
    expect(ids('the idiot')[0]).toBe('pg:18881')
    const austen = ids('jane austen')
    expect(austen.slice(0, 3)).toEqual(['pg:1342', 'pg:158', 'pg:105'])
    expect(rank(austen, 'pg:105')).toBeLessThan(rank(austen, 'pg:52622'))
    expect(austen).toContain('pg:17797')
    expect(ids('odyssey')).toEqual(['pg:1727', 'pg:23731', 'pg:26275'])
    expect(ids('oddysey')[0]).toBe('pg:1727')
  })
})
