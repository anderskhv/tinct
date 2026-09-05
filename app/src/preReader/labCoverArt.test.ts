import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  LAB_COVER_ART_2X_BOOK_IDS,
  LAB_COVER_ART_BOOK_IDS,
  LAB_POPULAR_BOOK_IDS,
  PRE_READER_CATALOGUE,
  labCoverArt,
  serializePreReaderCatalogue,
} from './catalogue'

const publicRoot = resolve(process.cwd(), 'public')

describe('lab cover art assets', () => {
  it('ships every declared pilot cover at 1x, and 2x only where declared, each under the size budget', () => {
    for (const id of LAB_COVER_ART_BOOK_IDS) {
      const oneX = resolve(publicRoot, 'covers/v2', `${id}.webp`)
      expect(existsSync(oneX), oneX).toBe(true)
      expect(statSync(oneX).size).toBeLessThan(150 * 1024)
      const twoX = resolve(publicRoot, 'covers/v2', `${id}@2x.webp`)
      expect(existsSync(twoX), twoX).toBe(LAB_COVER_ART_2X_BOOK_IDS.includes(id))
      if (existsSync(twoX)) expect(statSync(twoX).size).toBeLessThan(150 * 1024)
    }
  })

  it('attaches art only to the pilot titles and gives every book a one-line blurb', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      expect(book.art === null).toBe(!LAB_COVER_ART_BOOK_IDS.includes(book.id))
      if (book.art) {
        expect(book.art.src).toBe(`/covers/v2/${book.id}.webp`)
        expect(book.art.srcSet.startsWith(`${book.art.src} 1x`)).toBe(true)
      }
      expect(book.blurb.trim()).not.toBe('')
      expect(book.blurb.length).toBeLessThan(200)
    }
    expect(PRE_READER_CATALOGUE.booksById.get('odyssey')?.blurb).toBe('A long way home, by way of every sea-monster between.')
    expect(labCoverArt('odyssey')?.srcSet).toBe('/covers/v2/odyssey.webp 1x, /covers/v2/odyssey@2x.webp 2x')
    expect(labCoverArt('bible')?.srcSet).toBe('/covers/v2/bible.webp 1x')
    expect(labCoverArt('emma')).toBeNull()
  })

  it('serializes the popular eight in shelf order, all published with art', () => {
    const serialized = serializePreReaderCatalogue()
    expect(serialized.popular).toEqual([...LAB_POPULAR_BOOK_IDS])
    expect(serialized.popular).toHaveLength(8)
    for (const id of serialized.popular) {
      const book = PRE_READER_CATALOGUE.booksById.get(id)
      expect(book, id).toBeDefined()
      expect(book?.art, id).not.toBeNull()
    }
    expect(serialized.popular).not.toContain('meditations')
    expect(serialized.popular).not.toContain('frederick-douglass')
  })
})
