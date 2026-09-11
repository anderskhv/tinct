import { describe, expect, it } from 'vitest'
import { buildHighlightRange, highlightColorAt, highlightContainsRange, removeLegacyTapHighlights, type LabHighlight } from './labHighlights'

describe('lab highlight ranges', () => {
  it('normalizes a backwards selection within one long paragraph', () => {
    expect(buildHighlightRange(
      ['zero one two three four five'],
      { paragraphIndex: 0, wordIndex: 4 },
      { paragraphIndex: 0, wordIndex: 1 },
    )).toEqual({
      paragraphIndex: 0,
      fromWord: 1,
      endParagraphIndex: 0,
      toWord: 5,
      text: 'one two three four',
    })
  })

  it('normalizes a backwards selection across paragraphs and pages', () => {
    expect(buildHighlightRange(
      ['zero one two', 'three four five'],
      { paragraphIndex: 1, wordIndex: 1 },
      { paragraphIndex: 0, wordIndex: 1 },
    )).toEqual({
      paragraphIndex: 0,
      fromWord: 1,
      endParagraphIndex: 1,
      toWord: 2,
      text: 'one two three four',
    })
  })

  it('removes only the unconfirmed one-word gold records created by legacy taps', () => {
    const records: LabHighlight[] = [
      { id: 'ghost', chapterNumber: 1, paragraphIndex: 0, fromWord: 2, endParagraphIndex: 0, toWord: 3, color: 'gold' },
      { id: 'sentence', chapterNumber: 1, paragraphIndex: 0, fromWord: 2, endParagraphIndex: 0, toWord: 6, color: 'gold' },
      { id: 'colored-word', chapterNumber: 1, paragraphIndex: 0, fromWord: 2, endParagraphIndex: 0, toWord: 3, color: 'blue' },
      { id: 'noted-word', chapterNumber: 1, paragraphIndex: 0, fromWord: 2, endParagraphIndex: 0, toWord: 3, color: 'gold', note: 'keep' },
    ]
    expect(removeLegacyTapHighlights(records).map(record => record.id)).toEqual(['sentence', 'colored-word', 'noted-word'])
  })

  it('recognizes a word selected inside a saved passage', () => {
    const passage: LabHighlight = {
      id: 'passage', chapterNumber: 2, paragraphIndex: 3, fromWord: 4,
      endParagraphIndex: 3, toWord: 12, color: 'gold',
    }
    expect(highlightContainsRange(passage, {
      paragraphIndex: 3, fromWord: 7, endParagraphIndex: 3, toWord: 8, text: 'word',
    }, 2)).toBe(true)
  })

  it('paints the most recently added color when ranges overlap', () => {
    const highlights: LabHighlight[] = [
      { id: 'old', chapterNumber: 1, paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 5, color: 'gold' },
      { id: 'new', chapterNumber: 1, paragraphIndex: 0, fromWord: 2, endParagraphIndex: 0, toWord: 4, color: 'sky' },
    ]
    expect(highlightColorAt(highlights, 1, 0, 3)).toBe('sky')
  })
})
