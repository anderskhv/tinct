import { describe, expect, it } from 'vitest'
import { registerBiblePoetry, poetryClass } from './labPoetry'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { chapterPageSegments, chapterPagesCover, tokenizeHearingWords } from './labHearing'
import { lexicalWords } from './labLookupWord'

describe('reader feedback layout and lookup', () => {
  it('keeps short poetic pairs together without losing source words', () => {
    const paragraphs = ['¹ Wine is a mocker,', 'and strong drink a brawler.', '² A king sits to judge,', 'sifting evil with his eyes.']
    registerBiblePoetry('Proverbs 20', paragraphs)
    expect(poetryClass(paragraphs[0])).toBe(' is-poetic-line')
    const lengths = paragraphs.map(p => tokenizeHearingWords(p).length)
    const pages = measuredDesktopPages(lengths, segments => segments.reduce((n, s) => n + s.to - s.from, 0) <= 17, undefined, Infinity, paragraphs)
    expect(chapterPageSegments(pages[0]).map(s => s.paragraphIndex)).toEqual([0, 1])
    expect(chapterPageSegments(pages[1]).map(s => s.paragraphIndex)).toEqual([2, 3])
    expect(chapterPagesCover(paragraphs, pages)).toBe(true)
  })
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
