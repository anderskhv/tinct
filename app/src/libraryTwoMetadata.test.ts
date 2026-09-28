import { expect, it } from 'vitest'
import { bookMetadata, readingMinutes, readingTime } from '../public/lab/library_2/book-metadata.js'

it('uses the same approximate silent-reading estimate for covers and remaining time', () => {
  const book = { displayYear: '1818', wordCount: 66300 }
  expect(bookMetadata(book, { compact: true })).toBe('1818 · ~6.5h')
  expect(bookMetadata(book, { percent: 50 })).toBe('1818 · ~3.5 hours left')
  expect(readingMinutes(book, 50)).toBe(195)
  expect(readingTime({ wordCount: 5100 })).toBe('~30 minutes to read')
})

it('does not invent estimates for missing counts or mislabel unknown progress', () => {
  expect(bookMetadata({ displayYear: 'c. 750 BCE', wordCount: null })).toBe('c. 750 BCE')
  expect(readingTime({ wordCount: NaN })).toBe('')
  expect(readingTime({ wordCount: -10 })).toBe('')
  expect(readingTime({ wordCount: 10200 }, { percent: null })).toBe('~1 hour to read')
  expect(readingTime({ wordCount: 10200 }, { percent: -10 })).toBe('~1 hour left')
  expect(readingTime({ wordCount: 10200 }, { percent: 110 })).toBe('<5 minutes left')
})
