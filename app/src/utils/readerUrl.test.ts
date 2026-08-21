import { describe, expect, it } from 'vitest'
import {
  hasReaderIntent,
  parseParagraphHash,
  parseReadChapterPath,
  readerAppPath,
  readerLocationFromUrl,
} from './readerUrl'

describe('readerAppPath', () => {
  it('adds from=app so book-sheet opens stay in the reader', () => {
    expect(readerAppPath('odyssey', '', '', '')).toBe('/read/odyssey?from=app')
    expect(readerAppPath('odyssey', '', '#spot', '')).toBe('/read/odyssey?from=app#spot')
  })

  it('keeps an existing reader-intent query', () => {
    expect(readerAppPath('hamlet', '?from=test', '#x', '')).toBe('/read/hamlet?from=test#x')
    expect(readerAppPath('odyssey', '?chapter=1&edition=original-en', '', '')).toBe(
      '/read/odyssey?chapter=1&edition=original-en',
    )
  })

  it('keeps a numeric chapter path when the book still matches', () => {
    expect(readerAppPath('odyssey', '', '#p12', '/read/odyssey/1')).toBe('/read/odyssey/1?from=app#p12')
    expect(readerAppPath('hamlet', '', '', '/read/odyssey/1')).toBe('/read/hamlet?from=app')
  })
})

describe('hasReaderIntent', () => {
  it('treats library and chapter deep-links as reader intent', () => {
    expect(hasReaderIntent(new URLSearchParams('from=app'))).toBe(true)
    expect(hasReaderIntent(new URLSearchParams('view=library'))).toBe(true)
    expect(hasReaderIntent(new URLSearchParams())).toBe(false)
  })
})

describe('chapter URL parsing', () => {
  it('reads /read/:slug/:chapter and #pN', () => {
    expect(parseReadChapterPath('/read/odyssey/1')).toEqual({ bookId: 'odyssey', chapter: 1 })
    expect(parseReadChapterPath('/read/odyssey/chapter-1')).toBeNull()
    expect(parseParagraphHash('#p12')).toBe(11)
    expect(parseParagraphHash('#p1')).toBe(0)
    expect(readerLocationFromUrl({
      pathname: '/read/odyssey/1',
      search: '',
      hash: '#p12',
    })).toEqual({ bookId: 'odyssey', chapter: 1, paragraphIndex: 11 })
  })
})
