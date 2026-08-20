import { describe, expect, it } from 'vitest'
import { hasReaderIntent, readerAppPath } from './readerUrl'

describe('readerAppPath', () => {
  it('adds from=app so book-sheet opens stay in the reader', () => {
    expect(readerAppPath('odyssey')).toBe('/read/odyssey?from=app')
    expect(readerAppPath('odyssey', '', '#spot')).toBe('/read/odyssey?from=app#spot')
  })

  it('keeps an existing reader-intent query', () => {
    expect(readerAppPath('hamlet', '?from=test', '#x')).toBe('/read/hamlet?from=test#x')
    expect(readerAppPath('odyssey', '?chapter=1&edition=original-en')).toBe(
      '/read/odyssey?chapter=1&edition=original-en',
    )
  })
})

describe('hasReaderIntent', () => {
  it('treats library and chapter deep-links as reader intent', () => {
    expect(hasReaderIntent(new URLSearchParams('from=app'))).toBe(true)
    expect(hasReaderIntent(new URLSearchParams('view=library'))).toBe(true)
    expect(hasReaderIntent(new URLSearchParams())).toBe(false)
  })
})
