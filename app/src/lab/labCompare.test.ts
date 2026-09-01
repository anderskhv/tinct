import { describe, expect, it } from 'vitest'
import { mapLabCompareAnchor } from './labCompare'

describe('mobile compare anchors', () => {
  it('keeps aligned paragraphs and maps relative word progress', () => {
    const source = [`${'old '.repeat(60)}ending.`]
    const target = [`${'new '.repeat(100)}ending.`]
    expect(mapLabCompareAnchor(source, target, { paragraphIndex: 0, wordIndex: 30 })).toEqual({
      paragraphIndex: 0,
      wordIndex: 50,
    })
  })

  it('snaps to a nearby sentence start', () => {
    const source = ['One two three four five six seven eight nine ten. Eleven twelve thirteen fourteen.']
    const target = ['Alpha beta gamma delta epsilon zeta eta theta. New sentence begins right here.']
    expect(mapLabCompareAnchor(source, target, { paragraphIndex: 0, wordIndex: 11 })).toEqual({
      paragraphIndex: 0,
      wordIndex: 8,
    })
  })

  it('does not jump to the start of a very long sentence', () => {
    const source = [`${'source '.repeat(100)}end.`]
    const target = [`${'target '.repeat(140)}end.`]
    const mapped = mapLabCompareAnchor(source, target, { paragraphIndex: 0, wordIndex: 75 })
    expect(mapped.wordIndex).toBeGreaterThan(90)
  })

  it('falls back safely when an aligned target paragraph is empty', () => {
    expect(mapLabCompareAnchor(['Some words here.'], [''], { paragraphIndex: 0, wordIndex: 2 })).toEqual({
      paragraphIndex: 0,
      wordIndex: 0,
    })
  })

  it('opens at the start when the source paragraph has no words', () => {
    expect(mapLabCompareAnchor([''], ['A complete target paragraph.'], { paragraphIndex: 0, wordIndex: 7 })).toEqual({
      paragraphIndex: 0,
      wordIndex: 0,
    })
  })
})
