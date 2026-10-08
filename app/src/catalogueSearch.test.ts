import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// @ts-expect-error -- plain module shared by Add a book, freepubs.fyi and the library's "Not yet in Tinct"
import { createSearch, hydrate, normalize, altTitlesFor, applyPriors, fame, containedWorksFor } from '../../addbooks/site/search.js'

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
    // Gutenberg's index of its own Dostoevsky files is not a book: never listed (search audit, 2026-10-08).
    expect(dostoevsky).not.toContain('pg:59196')
    expect(search('index of the project gutenberg works of fyodor dostoyevsky', {}, 50).results.map(w => w.id)).not.toContain('pg:59196')
    expect(ids('the idiot')[0]).toBe('pg:18881')
    const austen = ids('jane austen')
    expect(austen.slice(0, 3)).toEqual(['pg:1342', 'pg:158', 'pg:105'])
    expect(rank(austen, 'pg:105')).toBeLessThan(rank(austen, 'pg:52622'))
    expect(austen).toContain('pg:17797')
    expect(ids('odyssey')).toEqual(['pg:1727', 'pg:23731', 'pg:26275'])
    expect(ids('oddysey')[0]).toBe('pg:1727')
  })
})

// Search quality (approved by Anders, 2026-10-07): spelling variants, apostrophes, other titles,
// the author's name within a tier, and volumes.
describe('catalogue search: variants, other titles, author words', () => {
  it('"dr faustus" is "doctor faustus": Marlowe first', () => {
    expect(normalize('Dr. Faustus')).toBe('doctor faustus')
    expect(ids('dr faustus')[0]).toBe('pg:779')
    expect(ids('dr faustus')).toEqual(ids('doctor faustus'))
  })

  it('"quran", "qur\'an" and "koran" find the Koran first; letters across an apostrophe are one word', () => {
    expect(normalize("Qur'an")).toBe('quran')
    expect(normalize('Qur’ān')).toBe('quran')
    for (const query of ['quran', "qur'an", 'Qur’an', 'koran', 'the koran']) expect(ids(query)[0], query).toBe('pg:2800')
    // The near spelling "Quan" (William Quan Judge) comes after the Koran and a title with "Quranic".
    const list = ids('quran')
    expect(rank(list, 'pg:2800')).toBeLessThan(rank(list, 'ws:en:Q19111885'))
    expect(list.indexOf('pg:54268')).not.toBe(0)
  })

  it('"tolstoi" is Tolstoy: his own books before books about him', () => {
    expect(normalize('Tolstoi')).toBe('tolstoy')
    const list = ids('tolstoi')
    expect(list[0]).toBe('pg:2600') // War and Peace
    expect(rank(list, 'pg:2600')).toBeLessThan(rank(list, 'rb:jstolstoi')) // In the Land of Tolstoi
    expect(ids('tolstoy')[0]).toBe('pg:2600')
    // Other variants in the table.
    expect(normalize('Chekov')).toBe('chekhov')
    expect(normalize('Vergil')).toBe('virgil')
    expect(normalize('Lao Tzu')).toBe('laozi')
    expect(normalize('St. Augustine')).toBe('saint augustine')
    expect(normalize('Around the World in 80 Days')).toBe('around the world in eighty days')
    expect(normalize('drama')).toBe('drama') // whole words only
  })

  it('"shakespeare sonnets": the words found in the author\'s name rank his sonnets above other sonnets', () => {
    const list = ids('shakespeare sonnets')
    expect(list.slice(0, 2).sort()).toEqual(['pg:1041', 'pg:1105'])
    expect(rank(list, 'pg:1105')).toBeLessThan(rank(list, 'pg:1050')) // Shaw's The Dark Lady of the Sonnets
    expect(ids('sonnets shakespeare').slice(0, 2).sort()).toEqual(['pg:1041', 'pg:1105'])
  })

  it('"emma": Austen\'s Emma (an exact title) before authors called Emma', () => {
    const list = ids('emma')
    expect(list[0]).toBe('pg:158')
    expect(rank(list, 'pg:158')).toBeLessThan(rank(list, 'pg:23789'))
    expect(rank(list, 'pg:158')).toBeLessThan(rank(list, 'pg:2162'))
  })

  it('"hunchback of notre dame" finds Notre-Dame de Paris by Victor Hugo (a curated other title)', () => {
    expect(altTitlesFor('Notre-Dame de Paris', 'Victor Hugo')).toEqual(['The Hunchback of Notre Dame'])
    expect(altTitlesFor('Notre-Dame de Paris', 'Somebody Else')).toEqual([])
    const list = ids('hunchback of notre dame')
    expect(list[0]).toBe('pg:2610')
    expect(list).not.toContain('pg:3480') // The Hunchback, by another author: no "notre dame"
    expect(ids('the hunchback of notre dame')[0]).toBe('pg:2610')
  })

  it('the other titles cover the common names readers search for', () => {
    expect(altTitlesFor('The Divine Comedy', 'Dante Alighieri')).toContain('Inferno')
    expect(altTitlesFor('The Divine Comedy, Volume 2, Purgatory', 'Dante Alighieri')).toEqual([])
    expect(altTitlesFor('The Song Celestial; Or, Bhagavad-Gîtâ (from the Mahâbhârata)', 'Edwin Arnold')).toEqual(['Bhagavad Gita'])
    expect(altTitlesFor('The Tao Teh King, or the Tao and its Characteristics', 'Laozi')).toContain('Tao Te Ching')
    expect(altTitlesFor("The Koran (Al-Qur'an)", '')).toContain('Quran')
  })
})

// Ranking sense (2026-10-08): fame from the work priors (Wikidata sitelinks) for works without
// Gutenberg downloads, an author's own books before shared ones, and other names of famous works.
describe('catalogue search: work priors, own books, other titles', () => {
  type Raw = { id: string; title: string; language: string[]; popularity: number; authors: Array<{ name: string }>; editions: Array<{ source: string }>; altTitles?: string[] }
  const raw = (id: string, title: string, authors: string[], popularity = 0): Raw => ({ id, title, language: ['en'], popularity, authors: authors.map(name => ({ name })), editions: [{ source: id.startsWith('ws:') ? 'Wikisource' : 'Gutenberg' }] })
  const engine = (list: Raw[], priors?: unknown) => {
    const prepared: Work[] = applyPriors(hydrate(structuredClone(list)), priors)
    for (const w of prepared) for (const e of w.editions) { if (!e.authors.length) e.authors = w.authors; if (!e.translators.length) e.translators = w.translators; if (!e.title) e.title = w.title }
    const run: Search = createSearch(prepared)
    return (query: string) => run(query, { language: 'en' }, 50).results.map(w => w.id)
  }
  const seneca = [
    raw('ws:en:Q97452599', 'Moral letters to Lucilius', ['Seneca']),
    raw('pg:64576', 'Minor Dialogues, Together With the Dialogue on Clemency', ['Lucius Annaeus Seneca'], 3627),
    raw('pg:3794', 'L. Annaeus Seneca on Benefits', ['Lucius Annaeus Seneca'], 3108),
    raw('pg:60831', 'Between Heathenism and Christianity', ['Charles William Super', 'Plutarch', 'Lucius Annaeus Seneca'], 758),
    raw('pg:61477', 'Seneca myths and folk tales', ['Arthur C. (Arthur Caswell) Parker'], 2278),
  ]
  const priors = { works: { 'ws:en:Q97452599': ['Q720535', 26, 'Epistulae morales ad Lucilium'], 'pg:3794': ['Q5244244', 11] } }

  it('applyPriors adds the Wikidata work, its sitelinks and English name; fame takes downloads or sitelinks, whichever says more', () => {
    const [letters, , benefits] = applyPriors(hydrate(structuredClone(seneca)), priors)
    expect(letters).toMatchObject({ wikidata: 'Q720535', sitelinks: 26 })
    expect(letters.altTitles).toContain('Epistulae morales ad Lucilium')
    expect(fame(letters)).toBeCloseTo(2.4 + 0.9 * Math.log10(27))
    expect(fame(benefits)).toBeCloseTo(Math.log10(3109)) // its downloads say more than 11 sitelinks
    expect(fame({ popularity: 0 })).toBe(0)
    // No priors: the catalogue as it was.
    expect(applyPriors(hydrate(structuredClone(seneca)), null)[0]).not.toHaveProperty('wikidata')
  })

  it('"seneca": the famous Wikisource letters first with the priors; his own books before an anthology and Parker\'s folk tales', () => {
    expect(engine(seneca)('seneca')[0]).toBe('pg:64576') // without priors, downloads alone
    const list = engine(seneca, priors)('seneca')
    expect(list.slice(0, 3)).toEqual(['ws:en:Q97452599', 'pg:64576', 'pg:3794'])
    expect(list.slice(3).sort()).toEqual(['pg:60831', 'pg:61477'])
  })

  it('"letters from a stoic" and the other names of the Moral Letters find them as titles', () => {
    expect(altTitlesFor('Moral letters to Lucilius', 'Seneca')).toContain('Letters from a Stoic')
    expect(altTitlesFor('Moral letters to Lucilius', 'Somebody Else')).toEqual([])
    for (const query of ['letters from a stoic', 'moral epistles', 'epistulae morales', 'letters to lucilius']) expect(engine(seneca, priors)(query)[0], query).toBe('ws:en:Q97452599')
    expect(altTitlesFor('Thoughts of Marcus Aurelius', 'Emperor of Rome Marcus Aurelius')).toEqual(['Meditations', 'To Himself'])
    expect(altTitlesFor('Index of the Project Gutenberg Works of Marcus Aurelius Antoninus', 'Marcus Aurelius')).toEqual([])
  })

  it('Seneca\'s dialogues by their Latin names; the works a collection holds rank as its title words', () => {
    expect(altTitlesFor('Moral letters to Lucilius', 'Seneca')).toContain('Letters on Ethics')
    expect(altTitlesFor('De brevitate vitae', 'Seneca')).toContain('On the Shortness of Life')
    expect(altTitlesFor('On the shortness of life', 'Seneca')).toContain('De Brevitate Vitae')
    expect(altTitlesFor('De ira', 'Seneca')).toContain('On Anger')
    expect(altTitlesFor('De tranquillitate animi', 'Seneca')).toContain('Peace of Mind')
    expect(altTitlesFor('On Anger', 'Somebody Else')).toEqual([])
    expect(containedWorksFor('Minor Dialogues, Together With the Dialogue on Clemency', 'Lucius Annaeus Seneca').map((w: { title: string }) => w.title))
      .toEqual(['On Providence', 'On the Firmness of the Wise Man', 'On Anger', 'To Marcia, On Consolation', 'On the Happy Life', 'On Leisure', 'Peace of Mind', 'On the Shortness of Life', 'To Helvia, On Consolation', 'To Polybius, On Consolation', 'On Clemency'])
    expect(containedWorksFor('Minor Dialogues', 'Somebody Else')).toEqual([])
    const run = engine(seneca, priors)
    expect(run('seneca on anger')[0]).toBe('pg:64576')
    expect(run('peace of mind seneca')[0]).toBe('pg:64576')
    expect(run('seneca letters from a stoic')[0]).toBe('ws:en:Q97452599')
  })

  it('for an author\'s name, a middle name and Gutenberg\'s quotation selections rank below the author\'s own books', () => {
    const list = engine([
      raw('pg:1', 'The Odysseys of Homer', ['Homer'], 900),
      raw('pg:2', 'The Rise of Universities', ['Charles Homer Haskins'], 950),
      raw('pg:3', 'Stories from the Odyssey', ['H. L. Havell', 'Homer'], 1400),
      raw('pg:4', 'The Iliads of Homer', ['Homer'], 800),
      raw('pg:5', 'Quotes and Images From The Works of Homer', ['Homer'], 5000),
    ])('homer')
    expect(list.slice(0, 2)).toEqual(['pg:1', 'pg:4'])
    expect(list[list.length - 1]).toBe('pg:5')
  })
})
