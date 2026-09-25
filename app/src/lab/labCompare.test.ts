import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { labComparePassagePages, labCompareAlignment, labVerseAtOrBefore, labVerseWordIndex, mapLabCompareAnchor, mapLabCompareEnd, labVerseLocation, splitLabPagesAtAnchor, type LabAlignFile } from './labCompare'
import { chapterPageSegments, pageIndexForPlace, tokenizeHearingWords, type ChapterHearingPage } from './labHearing'

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

describe('Bible editions with their own paragraphing (BSB)', () => {
  // KJV-style prose paragraphs vs BSB-style one-line paragraphs.
  const prose = ['¹ In the beginning God created. ² And the earth was void. ³ And God said, Let there be light.', '⁴ And God saw the light.']
  const lines = ['¹ In the beginning God created.', '² Now the earth was formless', 'and void.', '³ And God said, “Let there be light.”', '⁴ And God saw that the light was good.']
  it('finds the verse in another paragraph of the target chapter', () => {
    const verse3 = prose[0].split(' ').indexOf('³')
    expect(mapLabCompareAnchor(prose, lines, { paragraphIndex: 0, wordIndex: verse3 + 2 })).toEqual({ paragraphIndex: 3, wordIndex: 0 })
    expect(mapLabCompareAnchor(lines, prose, { paragraphIndex: 3, wordIndex: 2 })).toEqual({ paragraphIndex: 0, wordIndex: verse3 })
  })
  it('gives an unmarked poetry line the verse opened before it', () => {
    const verse2 = prose[0].split(' ').indexOf('²')
    expect(mapLabCompareAnchor(lines, prose, { paragraphIndex: 2, wordIndex: 1 })).toEqual({ paragraphIndex: 0, wordIndex: verse2 })
  })
  it('lands on the nearest earlier verse an edition has when it omits one', () => {
    const withGap = ['²⁰ He replied.', '²² As they gathered.']
    const full = ['²⁰ He replied. ²¹ But this kind does not go out.', '²² As they gathered.']
    expect(labVerseLocation(withGap, '21')).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    expect(mapLabCompareAnchor(full, withGap, { paragraphIndex: 0, wordIndex: 4 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
  })
})

const bibleChapter = (edition: string, number: number): string[] => (JSON.parse(readFileSync(resolve(__dirname, `../../public/data/editions/bible-${edition}.json`), 'utf8')) as { chapters: { number: number; paragraphs: string[] }[] })
  .chapters.find(chapter => chapter.number === number)!.paragraphs
/** The words of [start, end) across paragraphs. */
const passage = (paragraphs: string[], start: { paragraphIndex: number; wordIndex: number }, end: { paragraphIndex: number; wordIndex: number }) => {
  const out: string[] = []
  for (let p = start.paragraphIndex; p <= Math.min(end.paragraphIndex, paragraphs.length - 1); p += 1) {
    const words = tokenizeHearingWords(paragraphs[p]).map(word => word.text)
    out.push(...words.slice(p === start.paragraphIndex ? start.wordIndex : 0, p === end.paragraphIndex ? end.wordIndex : words.length))
  }
  return out.join(' ')
}
const wordsOf = (text: string) => tokenizeHearingWords(text).length

describe('the compare passage for a whole main page (Step A)', () => {
  // Proverbs 15 (sequential chapter 643): WEB on screen, KJV flipped to.
  const web = bibleChapter('web-en', 643)
  const kjv = bibleChapter('kjv-en', 643)

  it('verse text: a page from mid-verse 11 to the start of verse 16 maps to a passage through verse 16', () => {
    const pageStart = { paragraphIndex: 2, wordIndex: 3 }
    // The page's last words are "¹⁶ Better is": it ends three words into verse 16.
    expect(tokenizeHearingWords(web[3]).slice(0, 3).map(word => word.text).join(' ')).toBe('¹⁶ Better is')
    const start = mapLabCompareAnchor(web, kjv, pageStart)
    const end = mapLabCompareEnd(web, kjv, { paragraphIndex: 3, wordIndex: 3 })
    expect(start).toEqual({ paragraphIndex: 2, wordIndex: 0 })
    const text = passage(kjv, start, end)
    expect(text.startsWith('¹¹ Hell and destruction')).toBe(true)
    expect(text).toContain('¹⁶ Better is little with the fear of the LORD than great treasure and trouble therewith.')
    expect(text).not.toContain('¹⁷')
    // It stops exactly where verse 17 begins.
    expect(tokenizeHearingWords(kjv[end.paragraphIndex])[end.wordIndex].text).toBe('¹⁷')
  })

  it('verse text: a page that ends with a verse ends the passage with the same verse', () => {
    // WEB paragraph 2 holds verses 11-15; a page ending with it ends with 15.
    const end = mapLabCompareEnd(web, kjv, { paragraphIndex: 3, wordIndex: 0 })
    expect(end).toEqual({ paragraphIndex: 3, wordIndex: 0 })
    expect(passage(kjv, { paragraphIndex: 2, wordIndex: 0 }, end)).toMatch(/¹⁵ .*feast\.$/)
  })

  it('prose: a page ending mid-paragraph ends inside the aligned paragraph, finishing a nearby sentence', () => {
    const main = ['Intro line.', 'One two three four five six seven eight nine ten. Eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty.']
    const other = ['Opening.', 'Alpha beta gamma delta epsilon zeta eta theta iota kappa. Lambda mu nu xi omicron pi rho sigma tau upsilon.']
    // The main page ends after "twelve" (word 12 of 20).
    const end = mapLabCompareEnd(main, other, { paragraphIndex: 1, wordIndex: 12 })
    expect(end.paragraphIndex).toBe(1)
    expect(end.wordIndex).toBeGreaterThan(0)
    expect(end.wordIndex).toBeLessThanOrEqual(wordsOf(other[1]))
    // 12/20 of 20 words is word 12; the sentence ends at word 20, within reach.
    expect(end.wordIndex).toBe(20)
    // A far sentence end is not chased: the proportional word stands.
    const long = [`${'old '.repeat(60)}ending.`]
    const longer = [`${'new '.repeat(100)}ending.`]
    expect(mapLabCompareEnd(long, longer, { paragraphIndex: 0, wordIndex: 30 })).toEqual({ paragraphIndex: 0, wordIndex: 50 })
    // A page ending with its paragraph ends the passage with the same paragraph.
    expect(mapLabCompareEnd(main, other, { paragraphIndex: 1, wordIndex: wordsOf(main[1]) })).toEqual({ paragraphIndex: 1, wordIndex: wordsOf(other[1]) })
    expect(mapLabCompareEnd(main, other, { paragraphIndex: 1, wordIndex: 0 })).toEqual({ paragraphIndex: 1, wordIndex: 0 })
  })

  it('cuts the compare pages to the passage when it fits one page, and leaves them when it does not', () => {
    // Natural compare map: four pages of 40 words over one long paragraph.
    const pages: ChapterHearingPage[] = [0, 40, 80, 120].map(from => ({ paragraphIndex: 0, from, to: from + 40 }))
    // Fits: 30 words straddling a page break.
    const fit = labComparePassagePages(pages, { paragraphIndex: 0, wordIndex: 25 }, { paragraphIndex: 0, wordIndex: 55 })
    expect(fit.fits).toBe(true)
    const shown = fit.pages[pageIndexForPlace(fit.pages, 0, 25)]
    expect(chapterPageSegments(shown)).toEqual([{ paragraphIndex: 0, from: 25, to: 55 }])
    // Nothing is lost or repeated: the pages still tile the paragraph.
    expect(fit.pages.flatMap(chapterPageSegments).map(segment => [segment.from, segment.to])).toEqual([[0, 25], [25, 55], [55, 80], [80, 120], [120, 160]])
    // Longer than a page: the map is unchanged and the end is marked instead.
    const long = labComparePassagePages(pages, { paragraphIndex: 0, wordIndex: 25 }, { paragraphIndex: 0, wordIndex: 70 })
    expect(long).toEqual({ pages, fits: false })
    // Across three pages never fits.
    expect(labComparePassagePages(pages, { paragraphIndex: 0, wordIndex: 35 }, { paragraphIndex: 0, wordIndex: 85 }).fits).toBe(false)
    // Inside one page always fits.
    expect(labComparePassagePages(pages, { paragraphIndex: 0, wordIndex: 45 }, { paragraphIndex: 0, wordIndex: 78 }).fits).toBe(true)
    // A leftover of a line or two is not left as a page of its own: it joins its neighbour.
    const tight = labComparePassagePages(pages, { paragraphIndex: 0, wordIndex: 45 }, { paragraphIndex: 0, wordIndex: 78 }).pages
    expect(tight.flatMap(chapterPageSegments).map(segment => [segment.from, segment.to])).toEqual([[0, 45], [45, 78], [78, 120], [120, 160]])
  })

  it('flipping back from the compare passage returns to the identical main page', () => {
    // The flip back restores the main map and the saved main place (LabApp keeps
    // both); the compare cut never touches the main map.
    const main: ChapterHearingPage[] = [{ paragraphIndex: 2, from: 0, to: 60 }, { paragraphIndex: 2, from: 60, to: 999, segments: [{ paragraphIndex: 2, from: 60, to: 120 }, { paragraphIndex: 3, from: 0, to: 3 }] }]
    const mainIndex = 1
    const place = { paragraphIndex: 2, wordIndex: 61 }
    const start = mapLabCompareAnchor(web, kjv, place)
    const end = mapLabCompareEnd(web, kjv, { paragraphIndex: 3, wordIndex: 3 })
    const comparePages = labComparePassagePages([{ paragraphIndex: 2, from: 0, to: 200 }, { paragraphIndex: 3, from: 0, to: 200 }], start, end).pages
    expect(comparePages.length).toBeGreaterThan(0)
    expect(pageIndexForPlace(main, place.paragraphIndex, place.wordIndex)).toBe(mainIndex)
  })
})

describe('sentence alignment hook (Step B, switched off)', () => {
  const main = ['Intro.', `${'m '.repeat(10)}first. ${'m '.repeat(10)}second. ${'m '.repeat(10)}third.`]
  const other = ['Opening.', `${'o '.repeat(4)}first. ${'o '.repeat(20)}second. ${'o '.repeat(6)}third.`]
  const file = (over: Partial<LabAlignFile> = {}): LabAlignFile => ({
    format: 'tinct-edition-align', version: 1, bookId: 'book',
    source: { edition: 'original-en', sha256: 'a'.repeat(64) },
    target: { edition: 'modern-en', sha256: 'b'.repeat(64) },
    approved: { by: 'reviewer', date: '2026-09-25' },
    chapters: { '1': { '1': { status: 'human', segments: [['m', 0, 11, 0, 5], ['m', 11, 22, 5, 26], ['m', 22, 33, 26, 33]] } } },
    ...over,
  })
  const context = { bookId: 'book', chapterNumber: 1, main: { edition: 'original-en', sha256: 'a'.repeat(64) }, compare: { edition: 'modern-en', sha256: 'b'.repeat(64) } }

  it('maps by sentence when the file is approved and matches the served editions', () => {
    const alignment = labCompareAlignment(file(), context)!
    expect(alignment).not.toBeNull()
    // Start 3 words into the second sentence (covers more than half): its counterpart starts at 5.
    expect(mapLabCompareAnchor(main, other, { paragraphIndex: 1, wordIndex: 14 }, alignment)).toEqual({ paragraphIndex: 1, wordIndex: 5 })
    // End 2 words into the second sentence (less than half): stop after the first one.
    expect(mapLabCompareEnd(main, other, { paragraphIndex: 1, wordIndex: 13 }, alignment)).toEqual({ paragraphIndex: 1, wordIndex: 5 })
    // Read in the other direction, the same file serves the flip back.
    const back = labCompareAlignment(file(), { ...context, main: context.compare, compare: context.main })!
    expect(mapLabCompareAnchor(other, main, { paragraphIndex: 1, wordIndex: 5 }, back)).toEqual({ paragraphIndex: 1, wordIndex: 11 })
  })

  it('an unapproved file, a fingerprint mismatch or broken tiling gives exactly the Step A result', () => {
    const point = { paragraphIndex: 1, wordIndex: 14 }
    const endPoint = { paragraphIndex: 1, wordIndex: 13 }
    const stepA = { start: mapLabCompareAnchor(main, other, point), end: mapLabCompareEnd(main, other, endPoint) }
    const unapproved = labCompareAlignment(file({ approved: null }), context)
    const mismatch = labCompareAlignment(file(), { ...context, compare: { ...context.compare, sha256: 'c'.repeat(64) } })
    const wrongPair = labCompareAlignment(file(), { ...context, compare: { ...context.compare, edition: 'modern-da' } })
    const oldFormat = labCompareAlignment(file({ version: 2 }), context)
    expect([unapproved, mismatch, wrongPair, oldFormat]).toEqual([null, null, null, null])
    for (const alignment of [unapproved, mismatch]) {
      expect(mapLabCompareAnchor(main, other, point, alignment)).toEqual(stepA.start)
      expect(mapLabCompareEnd(main, other, endPoint, alignment)).toEqual(stepA.end)
    }
    // Segments that no longer tile the live paragraph fall back for that paragraph.
    const stale = labCompareAlignment(file({ chapters: { '1': { '1': { segments: [['m', 0, 11, 0, 5], ['m', 11, 30, 5, 33]] } } } }), context)!
    expect(stale).not.toBeNull()
    expect(mapLabCompareAnchor(main, other, point, stale)).toEqual(stepA.start)
    expect(mapLabCompareEnd(main, other, endPoint, stale)).toEqual(stepA.end)
  })
})
