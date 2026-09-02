import { describe, expect, it } from 'vitest'
import { buildHighlightRange, removeLegacyTapHighlights, type LabHighlight } from './labHighlights'

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
})
