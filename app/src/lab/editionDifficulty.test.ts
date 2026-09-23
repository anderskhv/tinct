import { describe, expect, it } from 'vitest'
import { editionDifficulty, readerEditionLabel } from './editionDifficulty'
import type { Edition } from '../types'
const edition = (key: string, label = key) => ({ key, label } as Edition)
describe('edition reading guidance', () => {
  it('distinguishes versions within a book and never guesses for an unreviewed edition', () => {
    expect(editionDifficulty('bible', edition('kjv-en'))).toBe('Hard')
    expect(editionDifficulty('bible', edition('web-en'))).toBe('Medium')
    expect(editionDifficulty('bible', edition('new-translation'))).toBeUndefined()
    expect(editionDifficulty('unknown-book', edition('original-en'))).toBeUndefined()
  })
  it('always names and marks the modern English adaptation consistently', () => {
    expect(editionDifficulty('unknown-book', edition('modern-en'))).toBe('Easy')
    expect(readerEditionLabel(edition('modern-en', 'Modern English'))).toBe('Tinct Modern English')
    expect(readerEditionLabel(edition('original-en', 'Original (1922)'))).toBe('Original (1922)')
  })
})
