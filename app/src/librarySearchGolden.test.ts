import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { groupSearchResults, importableWork, inTinct, REGISTRY_GUTENBERG_IDS, titleAuthorKey, type CatalogueWork } from '../public/lab/public-books.js'
// @ts-expect-error -- plain module shared by Add a book, freepubs.fyi and the library
import { createSearch, hydrate, borrowFor } from '../../addbooks/site/search.js'
// @ts-expect-error -- plain browser module of the library page
import { createLibrarySearch } from '../public/lab/library_2/library-search.js'
// @ts-expect-error -- plain browser module of the library page
import { books as starterBooks } from '../public/lab/library_2/books.js'
import { serializePreReaderCatalogue } from './preReader/catalogue'
import { GOLDEN_CASES } from './__fixtures__/librarySearchGolden'

// The library search panel scored on the golden set (search audit, 2026-10-07), over the real
// installed catalogue and the library's own books: "Available in Tinct" (library-search.js), then
// "Not yet in Tinct" (the catalogue engine, English, 40 works, grouped by public-books.js), as the
// library shows them. strict@1: the first row is a right answer, no Tinct book that is a right
// answer is missing from "Available in Tinct", and no catalogue copy of a Tinct book is offered.
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

describe('library search golden set', () => {
  it(`strict@1 is at least ${STRICT_AT_1 * 100}% of ${GOLDEN_CASES.length} queries`, () => {
    const raw = JSON.parse(gunzipSync(readFileSync(join(__dirname, '../public/lab/addbook/data/catalog.json.gz'))).toString('utf8')) as { works: Work[] }
    const all: Work[] = hydrate(raw.works)
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
    const tinctSearch = createLibrarySearch(tinctBooks, borrowFor(tinctBooks.map(b => ({ ...b, workIds: workIds(b) })), all))
    // An independent check for copies: the audit's "first title segment + first author surname" key.
    const tinctKeys = new Set(tinctBooks.map(b => titleAuthorKey(b.title, b.author)))
    const copyKey = (w: Work) => titleAuthorKey(String(w.title).split(/[,:;(]| or /i)[0], w.authors?.[0]?.name || '')

    const failures: string[] = []
    let strict = 0
    for (const [query, , expectations] of GOLDEN_CASES) {
      const right = matcher(expectations)
      const available: Book[] = tinctSearch(query)
      const { notYet } = groupSearchResults({ tinct: available, free: search(query, { language: 'en' }, 40).results, tinctBooks })
      const rows = [...available.map(b => ({ tinct: true, title: b.title, author: b.author })),
        ...notYet.map(w => ({ tinct: false, title: w.title, author: (w.authors as Person[]).map(p => p.name).join(', ') }))]
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
