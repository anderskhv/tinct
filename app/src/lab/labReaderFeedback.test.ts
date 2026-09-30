import { describe, expect, it } from 'vitest'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { chapterPageSegments, chapterPagesCover, tokenizeHearingWords } from './labHearing'
import { lexicalWords } from './labLookupWord'

describe('reader feedback layout and lookup', () => {
  it('moves a dangling sentence opener forward, without dropping it', () => {
    const paragraphs = ['They could no longer come or go. Thus they turned the pleasant land into desolation.']
    const pages = measuredDesktopPages([tokenizeHearingWords(paragraphs[0]).length], segments => segments.reduce((n, s) => n + s.to - s.from, 0) <= 8, undefined, Infinity, paragraphs)
    expect(pages[0].to).toBe(7)
    expect(pages[1].from).toBe(7)
    expect(chapterPagesCover(paragraphs, pages)).toBe(true)
  })
  it('separates punctuation-joined lexical words without changing audio tokens', () => {
    const text = 'Sherebiah—a'
    expect(tokenizeHearingWords(text)).toHaveLength(1)
    expect(lexicalWords(text).map(w => w.text)).toEqual(['Sherebiah', 'a'])
    expect(lexicalWords('mother-in-law')).toHaveLength(1)
    expect(lexicalWords('“don’t,”')[0].text).toBe('don’t')
  })
})
