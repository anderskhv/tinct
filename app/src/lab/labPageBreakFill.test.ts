// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { measuredDesktopPages, type LineStartLookup } from './LabDesktopPaginator'
import { chapterPageSegments, segmentWordTexts, tokenizeHearingWords, type ChapterPageSegment } from './labHearing'
import { HARD_BREAK_FRAGMENT_RE, hardBreaks, hyphenationBreaks, pageEdgeBreaks } from './labHyphenate'
import { labFragmentClass, labMeasureParagraphInto, measuredLineStarts } from './labMeasureParagraph'

/**
 * A page that continues its paragraph must end on a naturally filled last
 * line (Anders, Esther 8 on iPhone, 6 Oct 2026; nightly QA, Frankenstein ch. 6
 * and Sense and Sensibility ch. 1). These tests lay text out greedily in a
 * fixed number of characters per line and lines per page, the way a browser
 * fills a column, and check where the paginator ends each page.
 */
function layout(text: string, width: number, lines: number) {
  const words = tokenizeHearingWords(text)
  /** Line starts (paragraph word indexes) of a laid-out single-paragraph trial page. */
  const wrap = (segments: ChapterPageSegment[]) => {
    const tail = segments[segments.length - 1]
    const drawn = segmentWordTexts(words, tail)
    const starts: number[] = []
    let used = -1
    let count = 0
    drawn.forEach((word, index) => {
      // A soft break draws a hyphen after its fragment; a hard one does not.
      const size = word.text.length + (word.fragment && !HARD_BREAK_FRAGMENT_RE.test(word.text) ? 1 : 0)
      if (used < 0 || used + 1 + size > width) {
        count += 1
        if (index > 0 && !word.fragment) starts.push(tail.from + index)
        used = size
      } else used += 1 + size
    })
    return { starts, count }
  }
  const fits = (segments: ChapterPageSegment[]) => wrap(segments).count <= lines
  const lineStarts: LineStartLookup = segments => wrap(segments).starts
  const pageText = (segment: ChapterPageSegment) => segmentWordTexts(words, segment)
    .map(word => word.fragment && !HARD_BREAK_FRAGMENT_RE.test(word.text) ? `${word.text}‐` : word.text).join(' ')
  const lastLine = (segment: ChapterPageSegment) => {
    const drawn = pageText(segment).split(' ')
    const out: string[][] = []
    for (const word of drawn) {
      const line = out[out.length - 1]
      if (!line || [...line, word].join(' ').length > width) out.push([word])
      else line.push(word)
    }
    return out[out.length - 1].join(' ')
  }
  return { words, fits, lineStarts, pageText, lastLine }
}

describe('a page break moved back for a sentence lands on a line start', () => {
  // Three lines of twenty characters: "aaaa bbbb cccc dddd" / "eeee ffff gggg
  // hhhh" / "made in science. He" — and "soon" does not fit.
  const text = 'aaaa bbbb cccc dddd eeee ffff gggg hhhh made in science. He soon noticed that the words were all of them common.'

  it('keeps the filled last line instead of ending at a mid-line full stop ("made in science." | "He")', () => {
    const page = layout(text, 20, 3)
    const pages = measuredDesktopPages([page.words.length], page.fits, undefined, Infinity, [text], undefined, page.lineStarts)
    const first = chapterPageSegments(pages[0])[0]
    expect(page.lastLine(first)).toBe('made in science. He')
    expect(first.to).toBe(12)
  })

  it('still carries a new sentence\'s first words when they are all the last line holds', () => {
    // "science." ends line two; line three is only "He soon".
    const own = 'aaaa bbbb cccc dddd eeee ffff science. He soon extraordinarily noticed that the words were all of them common.'
    const page = layout(own, 20, 3)
    const pages = measuredDesktopPages([page.words.length], page.fits, undefined, Infinity, [own], undefined, page.lineStarts)
    const first = chapterPageSegments(pages[0])[0]
    expect(page.pageText(first).endsWith('science.')).toBe(true)
    expect(page.words[first.to].text).toBe('He')
  })

  it('without a measured layout keeps the older word-count rule (unit callers only)', () => {
    const page = layout(text, 20, 3)
    const pages = measuredDesktopPages([page.words.length], page.fits, undefined, Infinity, [text])
    expect(page.pageText(chapterPageSegments(pages[0])[0]).endsWith('science.')).toBe(true)
  })
})

describe('a paragraph\'s last words kept off the next page', () => {
  // Natural page: "aaaa bbbb cccc dddd" / "eeee ffff gggg hhhh" / "iiii jjjj
  // to him. And Tobiah" with "wrote." (the paragraph's last word) left over.
  const text = 'aaaa bbbb cccc dddd eeee ffff gggg hhhh iiii jjjj to him. And Tobiah wrote.'

  it('moves the break back to a line start, so the page ends on a full line', () => {
    const page = layout(text, 20, 3)
    const pages = measuredDesktopPages([page.words.length], page.fits, undefined, Infinity, [text], undefined, page.lineStarts)
    const first = chapterPageSegments(pages[0])[0]
    // The sentence "And Tobiah wrote." goes to the next page with its line,
    // and the page ends on the full line above it, not on "to him." mid-line.
    expect(page.pageText(first)).toBe('aaaa bbbb cccc dddd eeee ffff gggg hhhh')
    expect(page.lastLine(first)).toBe('eeee ffff gggg hhhh')
    expect(chapterPageSegments(pages[1])[0].from).toBe(8)
  })
})

describe('the book\'s own dash breaks at a page edge ("twenty-|third")', () => {
  const text = 'Mordecai summoned, and on the twenty-third day of the third month.'

  it('offers a break after a hyphen between letters, with no hyphen added', () => {
    expect(hardBreaks('twenty-third')).toEqual([7])
    expect(hardBreaks('“well-known,')).toEqual([6])
    expect(hardBreaks('him—and')).toEqual([4])
    expect(hardBreaks('mother-in-law')).toEqual([7, 10])
    // Not a break: a non-breaking hyphen, a number, a dash at an edge.
    expect(hardBreaks('twenty‑third')).toEqual([])
    expect(hardBreaks('1-3')).toEqual([])
    expect(hardBreaks('word—')).toEqual([])
    expect(hardBreaks('—word')).toEqual([])
    // The dictionary still leaves hyphenated words alone.
    expect(hyphenationBreaks('twenty-third', 'en')).toEqual([])
    expect(pageEdgeBreaks('twenty-third', null)).toEqual([7])
    expect(pageEdgeBreaks('twenty-third', 'en')).toEqual([7])
  })

  it('fills the last line with "twenty-" instead of ending after "the"', () => {
    // Two lines of twenty: "Mordecai summoned," / "and on the twenty-" —
    // "twenty-third" (12) does not fit after "and on the" (10), "twenty-" does.
    const page = layout(text, 20, 2)
    const pages = measuredDesktopPages(
      [page.words.length], page.fits,
      (_paragraph, wordIndex) => pageEdgeBreaks(page.words[wordIndex]?.text ?? '', null),
      Infinity, [text], undefined, page.lineStarts,
    )
    const [first] = chapterPageSegments(pages[0])
    const [second] = chapterPageSegments(pages[1])
    expect(first.tailFragment).toBe(7)
    expect(page.lastLine(first)).toBe('and on the twenty-')
    expect(segmentWordTexts(page.words, second)[0].text).toBe('third')
    // The broken word still belongs to the next page alone.
    expect(first.to).toBe(second.from)
  })

  it('marks the fragment so CSS draws no second hyphen', () => {
    expect(labFragmentClass('twenty-')).toBe('lab-word-fragment is-hard-break')
    expect(labFragmentClass('multi')).toBe('lab-word-fragment')
  })
})

describe('measuredLineStarts', () => {
  /** Give each measured word a rect on the line the test names. */
  function placeOnLines(p: HTMLElement, lineOf: number[]) {
    const words = [...p.querySelectorAll<HTMLElement>('.lab-hearing-word')]
    words.forEach((word, index) => {
      const line = lineOf[index]
      const rect = { top: line * 30, bottom: line * 30 + 22, left: 0, right: 10, width: 10, height: 22, x: 0, y: line * 30 }
      word.getClientRects = () => [rect] as unknown as DOMRectList
    })
  }

  it('lists the words that begin a painted line, after the first', () => {
    const p = document.createElement('p')
    labMeasureParagraphInto(p, tokenizeHearingWords('one two three four five six'))
    placeOnLines(p, [0, 0, 0, 1, 1, 2])
    expect(measuredLineStarts(p, 40)).toEqual([43, 45])
  })

  it('starts a verse unit\'s line at its verse number', () => {
    const p = document.createElement('p')
    labMeasureParagraphInto(p, tokenizeHearingWords('one two ⁹ three four'))
    // The superscript sits high on line 1; its line is its word's line.
    const words = [...p.querySelectorAll<HTMLElement>('.lab-hearing-word')]
    placeOnLines(p, [0, 0, 1, 1, 1])
    words[2].getClientRects = () => [{ top: 24, bottom: 36, left: 0, right: 4, width: 4, height: 12, x: 0, y: 24 }] as unknown as DOMRectList
    expect(measuredLineStarts(p, 0)).toEqual([2])
  })
})
