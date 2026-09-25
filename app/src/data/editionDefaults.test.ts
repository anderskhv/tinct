import { describe, expect, it } from 'vitest'
import { BOOKS, getBook } from './bookRegistry'
import { defaultCompareEditionKey, defaultPrimaryEditionKey } from './editionDefaults'

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
})
