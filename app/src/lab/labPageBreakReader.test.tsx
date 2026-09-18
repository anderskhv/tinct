// @vitest-environment jsdom

/**
 * Reader-path regressions for a word broken at a page edge.
 *
 * The paginator producing sound segments is not the risk; the risk is what the
 * rest of the reader does with them. These cover the failure classes the review
 * named: page ownership for saved position, narration follow and manual
 * navigation, and the rendered DOM that copy, selection, highlights and
 * assistive technology actually read.
 */
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  chapterPagesCover,
  followOnReadingPage,
  pageIndexForPlace,
  readingPageLines,
  tokenizeHearingWords,
  type ChapterHearingPage,
  type ChapterPageSegment,
} from './labHearing'
import { labMeasureParagraphInto } from './labMeasureParagraph'
import { LabPassage } from './LabPassage'

afterEach(cleanup)

// "withdrew" is word 3, broken after "withd" (5) at the page edge.
const SOURCE = 'Jesus perceiving that withdrew from there'
const WORDS = tokenizeHearingWords(SOURCE)
const BROKEN = 3
const AT = 5

const page = (segments: ChapterPageSegment[]): ChapterHearingPage => ({ ...segments[0], segments })
const PAGE_A = page([{ paragraphIndex: 0, from: 0, to: BROKEN, tailFragment: AT }])
const PAGE_B = page([{ paragraphIndex: 0, from: BROKEN, to: WORDS.length, headBreak: AT }])
const PAGES = [PAGE_A, PAGE_B]

describe('the layout itself is sound', () => {
  it('covers the paragraph with a reconstructable break', () => {
    expect(chapterPagesCover([SOURCE], PAGES)).toBe(true)
  })
})

describe('page ownership across the break', () => {
  it('gives the broken word to exactly one page', () => {
    const owners = PAGES.filter(p => (p.segments ?? [p]).some(s => BROKEN >= s.from && BROKEN < s.to))
    expect(owners).toHaveLength(1)
  })

  it('resolves the broken word to the page that RESUMES it, not the one that teased it', () => {
    // The page that shows "withd-" does not own the word. Resolving to it would
    // restore a saved position, or pull narration, one page backwards.
    expect(pageIndexForPlace(PAGES, 0, BROKEN)).toBe(1)
  })

  it('never resolves a word to a page before the one holding it', () => {
    for (let word = 0; word < WORDS.length; word += 1) {
      const index = pageIndexForPlace(PAGES, 0, word)
      const owning = PAGES.findIndex(p => (p.segments ?? [p]).some(s => word >= s.from && word < s.to))
      expect(index).toBe(owning)
    }
  })

  it('moves forward, never backward, as narration crosses the break', () => {
    const seen = WORDS.map((_, word) => pageIndexForPlace(PAGES, 0, word))
    for (let i = 1; i < seen.length; i += 1) expect(seen[i]).toBeGreaterThanOrEqual(seen[i - 1])
  })

  it('does not consider the broken word to be on the page that only shows its opening', () => {
    const follow = { kind: 'word', paragraphIndex: 0, wordIndex: BROKEN }
    expect(followOnReadingPage(follow, PAGES, 1)).toBe(true)
    expect(followOnReadingPage(follow, PAGES, 0)).toBe(false)
  })

  it('keeps ordinary pagination resolving exactly as before', () => {
    const plain = [
      page([{ paragraphIndex: 0, from: 0, to: BROKEN }]),
      page([{ paragraphIndex: 0, from: BROKEN, to: WORDS.length }]),
    ]
    for (let word = 0; word < WORDS.length; word += 1) {
      expect(pageIndexForPlace(PAGES, 0, word)).toBe(pageIndexForPlace(plain, 0, word))
    }
  })
})

describe('the words handed to the renderer', () => {
  it('draws the fragment but does not count it as a word of the page', () => {
    const [line] = readingPageLines([SOURCE], PAGE_A)
    expect(line.words.filter(w => !w.fragment).map(w => w.text)).toEqual(['Jesus', 'perceiving', 'that'])
    expect(line.words.filter(w => w.fragment).map(w => w.text)).toEqual(['withd'])
  })

  it('resumes the word on the owning page', () => {
    const [line] = readingPageLines([SOURCE], PAGE_B)
    expect(line.words[0].text).toBe('rew')
    expect(line.words[0].fragment).toBeUndefined()
  })
})

function passageProps(readingPage: ChapterHearingPage) {
  return {
    chapterTitle: 'Matthew 12',
    paragraphs: [SOURCE],
    compareParagraphs: [],
    compare: false,
    mode: 'reading' as const,
    follow: { kind: 'none' } as never,
    followParagraphs: [],
    markedIndexes: new Set<number>(),
    readingPage,
    chapterPages: PAGES,
    highlights: [],
    chapterNumber: 1,
  }
}

describe('the rendered DOM a reader copies from', () => {
  it('gives the fragment no word identity, so nothing word-indexed can see it', () => {
    const { container } = render(<LabPassage {...passageProps(PAGE_A)} />)
    const fragment = container.querySelector('[data-testid="lab-word-fragment"]')
    expect(fragment).not.toBeNull()
    expect(fragment!.getAttribute('data-word-index')).toBeNull()
    expect(fragment!.getAttribute('data-paragraph-index')).toBeNull()
    expect(container.querySelectorAll('[data-testid="lab-word"]')).toHaveLength(3)
  })

  it('hides the fragment from assistive technology, so the word is spoken once', () => {
    const { container } = render(<LabPassage {...passageProps(PAGE_A)} />)
    expect(container.querySelector('[data-testid="lab-word-fragment"]')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('keeps the hyphen out of the text entirely', () => {
    const { container } = render(<LabPassage {...passageProps(PAGE_A)} />)
    // The hyphen is CSS generated content, so it is in no text node, no
    // textContent and no clipboard write.
    expect(container.textContent).not.toMatch(/[-‐‑]/)
  })

  it('numbers the owning page’s words from the word itself, not from its remainder', () => {
    const { container } = render(<LabPassage {...passageProps(PAGE_B)} />)
    const first = container.querySelector('[data-testid="lab-word"]')!
    expect(first.getAttribute('data-word-index')).toBe(String(BROKEN))
    expect(first.textContent).toBe('rew')
  })

  it('leaves a page with no break completely untouched', () => {
    const plain = page([{ paragraphIndex: 0, from: 0, to: WORDS.length }])
    const { container } = render(<LabPassage {...passageProps(plain)} />)
    expect(container.querySelector('[data-testid="lab-word-fragment"]')).toBeNull()
    expect(container.textContent).toContain('withdrew')
  })
})

describe('the offscreen measurement matches what is painted', () => {
  it('measures the fragment, so the page is packed against the line the reader sees', () => {
    const measured = labMeasureParagraphInto(document.createElement('p'), [
      ...WORDS.slice(0, BROKEN),
      { text: 'withd', fragment: true as const },
    ])
    const fragment = measured.querySelector('.lab-word-fragment')
    expect(fragment).not.toBeNull()
    expect(fragment!.textContent).toBe('withd')
    expect(measured.querySelectorAll('.lab-hearing-word')).toHaveLength(BROKEN)
  })
})
