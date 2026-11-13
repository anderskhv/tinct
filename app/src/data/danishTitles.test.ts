import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BOOKS } from './bookRegistry'
import { DANISH_AUTHOR_NAMES, DANISH_TITLES } from './danishTitles'
import { PRE_READER_CATALOGUE } from '../preReader/catalogue'

// Danish titles are never invented (Anders, 2026-11-13): each is the one Tinct's own Danish
// text uses, or a long-established Danish title marked as such.
describe('Danish titles for search', () => {
  const registry = new Map(BOOKS.map(book => [book.id, book]))

  it('names only books in the registry, with titles that differ from the English one', () => {
    for (const [id, entry] of Object.entries(DANISH_TITLES)) {
      const book = registry.get(id)
      expect(book, id).toBeTruthy()
      expect(entry.titles.length, id).toBeGreaterThan(0)
      expect(entry.titles.map(title => title.toLowerCase()), id).not.toContain(book!.title.toLowerCase())
    }
  })

  it('takes a title from the repo only where its Danish text uses it', () => {
    for (const [id, { titles, source }] of Object.entries(DANISH_TITLES)) {
      if (source === 'established') continue
      const text = readFileSync(join(__dirname, '../../public', source), 'utf8')
      expect(text.includes(titles[0]), `${id}: "${titles[0]}" in ${source}`).toBe(true)
    }
  })

  it('spells only authors the registry names', () => {
    const authors = new Set(BOOKS.map(book => book.author.trim()))
    for (const author of Object.keys(DANISH_AUTHOR_NAMES)) expect(authors.has(author), author).toBe(true)
  })

  it('reaches the library through the catalogue', () => {
    const byId = new Map(PRE_READER_CATALOGUE.books.map(book => [book.id, book]))
    expect(byId.get('a-little-princess')?.localTitles).toEqual({ da: ['Den lille prinsesse'] })
    expect(byId.get('the-art-of-war')?.localTitles?.da).toEqual(['Krigskunsten', 'Kunsten at føre krig'])
    expect(byId.get('apology')?.localAuthors).toEqual({ da: ['Platon'] })
    expect(byId.get('hamlet')?.localTitles).toBeUndefined()
  })
})
