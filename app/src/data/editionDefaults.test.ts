import { describe, expect, it } from 'vitest'
import { BOOKS, getBook } from './bookRegistry'
import { defaultCompareEditionKey, defaultPrimaryEditionKey, isMachineMadeOriginal, savedPlaceFallbackEditionKey } from './editionDefaults'
import { PRE_READER_CATALOGUE } from '../preReader/catalogue'
import { continueHandoff } from '../preReader/continueHandoff'

const defaults = (id: string) => {
  const book = getBook(id)!
  const primary = defaultPrimaryEditionKey(id, book.editions)
  return { primary, compare: defaultCompareEditionKey(id, book.editions, primary, book.year) }
}

describe('default editions (approved 2026-09-25)', () => {
  it('reads Tinct Modern English everywhere and BSB in the Bible', () => {
    for (const book of BOOKS) {
      expect(defaultPrimaryEditionKey(book.id, book.editions), book.id).toBe(book.id === 'bible' ? 'bsb-en' : 'modern-en')
    }
  })

  it('compares recent English works with their original', () => {
    expect(defaults('pride-and-prejudice')).toEqual({ primary: 'modern-en', compare: 'original-en' })
  })

  it('compares translated and older works with the easiest human translation', () => {
    expect(defaults('odyssey').compare).toBe('original-en')
    // WEB is rated easier than KJV; BSB is the main edition.
    expect(defaults('bible')).toEqual({ primary: 'bsb-en', compare: 'web-en' })
  })

  it('prefers the easiest rated human translation when a work has several', () => {
    const editions = [
      { key: 'modern-en', style: 'modern', language: 'en' },
      { key: 'kjv-en', style: 'kjv', language: 'en' },
      { key: 'web-en', style: 'web', language: 'en' },
    ] as const
    expect(defaultCompareEditionKey('bible', editions, 'modern-en', -1400)).toBe('web-en')
  })

  it('never picks the main edition or an unaligned edition to compare', () => {
    const editions = [
      { key: 'modern-en', style: 'modern', language: 'en', aligned: true },
      { key: 'original-en', style: 'original', language: 'en', aligned: false },
    ] as const
    expect(defaultCompareEditionKey('x', editions, 'modern-en', 1900)).toBeUndefined()
  })

  it('Fear and Trembling: Tinct Modern English, no default Compare, never the machine-made original', () => {
    expect(defaults('fear-and-trembling')).toEqual({ primary: 'modern-en', compare: undefined })
    const book = PRE_READER_CATALOGUE.booksById.get('fear-and-trembling')!
    expect(book.defaultEditionKey).toBe('modern-en')
    expect(book.defaultCompareEditionKey).toBeNull()
    // A saved row without an edition keeps the old default only when it is human-made.
    expect(savedPlaceFallbackEditionKey('fear-and-trembling', getBook('fear-and-trembling')!.editions)).toBe('modern-en')
    expect(continueHandoff({ bookId: 'fear-and-trembling', editionKey: null, chapterNumber: 1, chapterLabel: 'Preface', pageIndex: 0, paragraphIndex: 0, wordIndex: 0, paragraphCount: null, source: 'memory', at: 1 })?.primaryEditionKey).toBe('modern-en')
    expect(savedPlaceFallbackEditionKey('crito', getBook('crito')!.editions)).toBe('original-en')
  })

  it('knows of exactly one machine-made "original" English edition', () => {
    const machine = BOOKS.flatMap(book => book.editions.filter(e => isMachineMadeOriginal(book.id, e.key)).map(e => `${book.id}/${e.key}`))
    expect(machine).toEqual(['fear-and-trembling/original-en'])
    for (const book of BOOKS) {
      const primary = defaultPrimaryEditionKey(book.id, book.editions)
      const compare = defaultCompareEditionKey(book.id, book.editions, primary, book.year)
      expect([primary, compare].some(key => key && isMachineMadeOriginal(book.id, key)), book.id).toBe(false)
    }
  })
})
