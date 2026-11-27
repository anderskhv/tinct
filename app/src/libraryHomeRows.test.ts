// The rows of covers on the library's home page (library_2/browse-groups.js homeRows): one per house, and a
// row of its own, right after its house, for a shelf that has one ("For young readers", Anders, 26 Nov 2026).
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain browser module of the library page
import { HOME_SHELF_ROWS, homeRows } from '../public/lab/library_2/browse-groups.js'
import { serializePreReaderCatalogue } from './preReader/catalogue'

type Row = { kind: 'house' | 'shelf'; id: string; title: string; bookIds: string[] }

// The order Anders approved in the mockup (23 Nov 2026).
const YOUNG_READERS = [
  'the-secret-garden', 'wind-in-the-willows', 'merry-adventures-of-robin-hood', 'story-of-king-arthur-and-his-knights',
  'wonder-book-and-tanglewood-tales', 'beautiful-stories-from-shakespeare', 'odyssey-for-boys-and-girls', 'iliad-for-boys-and-girls',
]

const shelf = (id: string, title: string, bookIds: string[]) => ({ id, title, bookIds })
const fixture = () => [
  { id: 'novel', title: 'Fiction', shelves: [
    shelf('russians', 'The Russians', ['crime', 'karamazov']),
    shelf('gothic', 'The Gothic', ['frankenstein', 'crime']),
    shelf('young', 'For young readers', ['garden', 'willows', 'arthur']),
    shelf('detective', 'Detective Fiction', ['holmes']),
  ] },
  { id: 'epic', title: 'Poetry & Epic', shelves: [shelf('ancient', 'Ancient Epics', ['odyssey']), shelf('medieval', 'Medieval Epics', ['beowulf', 'arthur'])] },
]

describe('which rows the library home page shows', () => {
  it('with no shelf row: one row per house, its shelves\' books once each, in shelf order', () => {
    expect(homeRows(fixture(), undefined, [])).toEqual([
      { kind: 'house', id: 'novel', title: 'Fiction', bookIds: ['crime', 'karamazov', 'frankenstein', 'garden', 'willows', 'arthur', 'holmes'] },
      { kind: 'house', id: 'epic', title: 'Poetry & Epic', bookIds: ['odyssey', 'beowulf', 'arthur'] },
    ])
  })

  it('a shelf with a row of its own comes right after its house, in its own order, and its books are in no house row', () => {
    const houses = fixture(), untouched = JSON.stringify(houses)
    expect(homeRows(houses, undefined, ['young'])).toEqual([
      { kind: 'house', id: 'novel', title: 'Fiction', bookIds: ['crime', 'karamazov', 'frankenstein', 'holmes'] },
      { kind: 'shelf', id: 'young', title: 'For young readers', bookIds: ['garden', 'willows', 'arthur'] },
      // King Arthur is also on a shelf of this house: it shows in the shelf's own row only.
      { kind: 'house', id: 'epic', title: 'Poetry & Epic', bookIds: ['odyssey', 'beowulf'] },
    ])
    expect(JSON.stringify(houses)).toBe(untouched)
  })

  it('lists only books the page has, and no row without one', () => {
    const hidden = new Set(['garden', 'willows', 'arthur', 'odyssey', 'beowulf', 'karamazov'])
    expect(homeRows(fixture(), (id: string) => !hidden.has(id), ['young'])).toEqual([
      { kind: 'house', id: 'novel', title: 'Fiction', bookIds: ['crime', 'frankenstein', 'holmes'] },
    ])
  })

  it('keeps the shelf\'s row where its house would be when the house has no other book', () => {
    const houses = [{ id: 'first', title: 'First', shelves: [shelf('a', 'A', ['one'])] }, { id: 'kids', title: 'Children', shelves: [shelf('young', 'For young readers', ['garden'])] }, { id: 'last', title: 'Last', shelves: [shelf('z', 'Z', ['two'])] }]
    expect(homeRows(houses, undefined, ['young']).map((row: Row) => `${row.kind}:${row.title}`)).toEqual(['house:First', 'shelf:For young readers', 'house:Last'])
  })

  it('a shelf row is listed once, a named shelf the catalogue lacks adds nothing, and a house without shelves is skipped', () => {
    const twice = [{ id: 'one', title: 'One', shelves: [shelf('young', 'For young readers', ['garden'])] }, { id: 'two', title: 'Two', shelves: [shelf('young', 'For young readers', ['garden']), shelf('b', 'B', ['beowulf'])] }, { id: 'bare', title: 'Bare' }]
    expect(homeRows(twice, undefined, ['young', 'missing']).map((row: Row) => `${row.kind}:${row.title}`)).toEqual(['shelf:For young readers', 'house:Two'])
  })

  it('by default the shelves named in HOME_SHELF_ROWS have rows of their own', () => {
    expect(HOME_SHELF_ROWS).toEqual(['young-readers'])
    const houses = [{ id: 'novel', title: 'Fiction', shelves: [shelf('adventure', 'Adventure', ['moby-dick']), shelf('young-readers', 'For young readers', ['the-secret-garden'])] }]
    expect(homeRows(houses).map((row: Row) => row.title)).toEqual(['Fiction', 'For young readers'])
  })
})

describe('the library home page with the built catalogue', () => {
  const catalogue = serializePreReaderCatalogue()
  const shown = new Set(catalogue.books.filter(book => book.discoveryAvailable !== false).map(book => book.id))
  const has = (id: string) => shown.has(id)
  const rows: Row[] = homeRows(catalogue.houses, has)
  // The rows as they were while every shelf was part of its house's row.
  const before: Row[] = homeRows(catalogue.houses, has, [])

  it('For young readers has a row of its own between Fiction and Poetry & Epic', () => {
    expect(before.map(row => row.title)).toEqual(catalogue.houses.map(house => house.title))
    expect(rows.map(row => row.title)).toEqual(before.flatMap(row => (row.id === 'novel' ? [row.title, 'For young readers'] : [row.title])))
    const at = rows.findIndex(row => row.kind === 'shelf' && row.id === 'young-readers')
    expect(rows.slice(at - 1, at + 2).map(row => row.title)).toEqual(['Fiction', 'For young readers', 'Poetry & Epic'])
  })

  it('it holds the shelf\'s eight books in the approved order', () => {
    expect(rows.find(row => row.id === 'young-readers')?.bookIds).toEqual(YOUNG_READERS)
  })

  it('each of the eight is on the home page once, and every other book is where it was', () => {
    for (const id of YOUNG_READERS) expect(rows.filter(row => row.bookIds.includes(id)).map(row => row.id), id).toEqual(['young-readers'])
    expect(before.find(row => row.id === 'novel')!.bookIds).toEqual(expect.arrayContaining(YOUNG_READERS))
    for (const row of before) {
      const now = rows.find(item => item.kind === 'house' && item.id === row.id)!
      expect(now.bookIds, row.title).toEqual(row.bookIds.filter(id => !YOUNG_READERS.includes(id)))
    }
  })
})

describe('the library page draws the rows the model gives (library_2/app.js)', () => {
  const app = readFileSync(resolve(__dirname, '../public/lab/library_2/app.js'), 'utf8')
  it('every home row keeps the shelf markup, the cover buttons and the shelves\' memory', () => {
    expect(app).toMatch(/import \{[^}]*\bhomeRows\b[^}]*\} from '\.\/browse-groups\.js\?v=\w+';/)
    expect(app).toContain("homeRows(houses,id=>byId.has(id)).forEach(({title,bookIds})=>{const section=el('section','shelf');section.append(el('h2','',title));const row=el('div','book-row');row.setAttribute('aria-label',title);bookIds.forEach(id=>row.append(titledCover(books.find(b=>b.id===id))));section.append(row);$('shelves').append(section);shelfMemory?.observe(section);});")
    // The rows come from the model alone: no second pass over the houses.
    expect(app).not.toMatch(/houses\.forEach\(/)
  })
})
