import { describe, expect, it } from 'vitest'
import { labVerseAtOrBefore, labVerseWordIndex, mapLabCompareAnchor, splitLabPagesAtAnchor } from './labCompare'

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

describe('splitLabPagesAtAnchor', () => {
  // A native page map: pages span paragraphs, the way a paginated compare
  // edition really breaks. Verse 15 sits mid-way down a page that began at
  // verse 9 — the Proverbs 17 case.
  const pages = [
    { paragraphIndex: 0, from: 0, to: 40, segments: [
      { paragraphIndex: 0, from: 0, to: 40 }, { paragraphIndex: 1, from: 0, to: 30 }, { paragraphIndex: 2, from: 0, to: 20 },
    ] },
    { paragraphIndex: 8, from: 0, to: 25, segments: [
      { paragraphIndex: 8, from: 0, to: 25 }, { paragraphIndex: 9, from: 0, to: 22 }, { paragraphIndex: 14, from: 0, to: 18 }, { paragraphIndex: 15, from: 0, to: 12 },
    ] },
    { paragraphIndex: 16, from: 0, to: 30 },
  ]

  it('cuts the page that holds the anchor so a page begins there, segments and all', () => {
    const split = splitLabPagesAtAnchor(pages, { paragraphIndex: 14, wordIndex: 0 })
    expect(split).toHaveLength(4)
    expect(split[1]).toEqual({ paragraphIndex: 8, from: 0, to: 25, segments: [
      { paragraphIndex: 8, from: 0, to: 25 }, { paragraphIndex: 9, from: 0, to: 22 },
    ] })
    expect(split[2]).toEqual({ paragraphIndex: 14, from: 0, to: 18, segments: [
      { paragraphIndex: 14, from: 0, to: 18 }, { paragraphIndex: 15, from: 0, to: 12 },
    ] })
    // The page shown is the one that begins at the anchor.
    expect(split.findIndex(page => page.paragraphIndex === 14 && page.from === 0)).toBe(2)
    expect(split[3]).toEqual(pages[2])
  })

  it('cuts inside a segment when the anchor is mid-paragraph', () => {
    const split = splitLabPagesAtAnchor(pages, { paragraphIndex: 9, wordIndex: 10 })
    expect(split[1].segments).toEqual([{ paragraphIndex: 8, from: 0, to: 25 }, { paragraphIndex: 9, from: 0, to: 10 }])
    expect(split[2]).toMatchObject({ paragraphIndex: 9, from: 10, to: 22 })
    expect(split[2].segments).toEqual([
      { paragraphIndex: 9, from: 10, to: 22 }, { paragraphIndex: 14, from: 0, to: 18 }, { paragraphIndex: 15, from: 0, to: 12 },
    ])
  })

  it('leaves a map alone when a page already begins at the anchor, or nothing holds it', () => {
    expect(splitLabPagesAtAnchor(pages, { paragraphIndex: 8, wordIndex: 0 })).toBe(pages)
    expect(splitLabPagesAtAnchor(pages, { paragraphIndex: 16, wordIndex: 0 })).toBe(pages)
    expect(splitLabPagesAtAnchor(pages, { paragraphIndex: 40, wordIndex: 0 })).toBe(pages)
    expect(splitLabPagesAtAnchor([], { paragraphIndex: 0, wordIndex: 0 })).toEqual([])
  })
})

describe('verse-marked editions', () => {
  // One paragraph holding three verses in each edition, with very different
  // wording and word counts — the way KJV and the World English Bible break.
  const kjv = '¹ Better is a dry morsel, and quietness therewith, than an house full of sacrifices with strife. ² A wise servant shall have rule over a son that causeth shame, and shall have part of the inheritance among the brethren. ³ The fining pot is for silver, and the furnace for gold: but the LORD trieth the hearts.'
  const web = '¹ Better is a dry morsel with quietness, than a house full of feasting with strife. ² A servant who deals wisely will rule over a son who causes shame, and shall have a part in the inheritance among the brothers. ³ The refining pot is for silver, and the furnace for gold, but Yahweh tests the hearts.'
  const words = (text: string) => text.split(/\s+/).map(text => ({ text }))

  it('reads the verse a word sits in and finds where that verse begins', () => {
    expect(labVerseAtOrBefore(words(kjv), 0)).toBe('1')
    expect(labVerseAtOrBefore(words(kjv), 20)).toBe('2')
    expect(labVerseAtOrBefore(words(kjv), words(kjv).length - 1)).toBe('3')
    expect(labVerseAtOrBefore(words('no markers here'), 2)).toBeNull()
    expect(labVerseWordIndex(words(web), '3')).toBe(words(web).findIndex(word => word.text === '³'))
    expect(labVerseWordIndex(words(web), '9')).toBeNull()
  })

  it('carries a page head to the same verse of the other edition, not to a proportion of it', () => {
    const kjvWords = words(kjv)
    const webWords = words(web)
    const verse3 = kjvWords.findIndex(word => word.text === '³')
    const mapped = mapLabCompareAnchor([kjv], [web], { paragraphIndex: 0, wordIndex: verse3 })
    expect(mapped).toEqual({ paragraphIndex: 0, wordIndex: webWords.findIndex(word => word.text === '³') })
    // A word inside verse 2 lands on the start of verse 2.
    const inside2 = kjvWords.findIndex(word => word.text === 'inheritance')
    expect(mapLabCompareAnchor([kjv], [web], { paragraphIndex: 0, wordIndex: inside2 }))
      .toEqual({ paragraphIndex: 0, wordIndex: webWords.findIndex(word => word.text === '²') })
    // And back again lands on the verse it came from.
    const back = mapLabCompareAnchor([web], [kjv], { paragraphIndex: 0, wordIndex: webWords.findIndex(word => word.text === '²') })
    expect(back).toEqual({ paragraphIndex: 0, wordIndex: kjvWords.findIndex(word => word.text === '²') })
  })

  it('falls back to the proportional mapping when the other edition has no such verse', () => {
    const plain = 'Verse markers are absent from this rendering, which runs on as prose.'
    const mapped = mapLabCompareAnchor([kjv], [plain], { paragraphIndex: 0, wordIndex: 20 })
    expect(mapped.paragraphIndex).toBe(0)
    expect(mapped.wordIndex).toBeGreaterThanOrEqual(0)
    expect(mapped.wordIndex).toBeLessThan(words(plain).length)
  })
})
