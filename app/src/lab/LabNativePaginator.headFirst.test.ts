import { describe, expect, it } from 'vitest'
import { measuredDesktopPages, measuredDesktopPageSteps } from './LabDesktopPaginator'
import { chapterPagesCover, chapterPageSegments, type ChapterHearingPage } from './labHearing'
import { nativePaginationSlice, labResumeAfterPage, nativePagesFromPlacements, provisionalPagesAfter } from './LabNativePaginator'

// Page 1 first (15 Oct 2026): the phone reader shows a chapter's opening page
// as soon as it is laid out, and lays out the rest right after that page has
// painted. The opening page must be the one the whole chapter's layout gives,
// and the map it travels in must cover the chapter.

const words = (count: number, from = 0) => Array.from({ length: count }, (_, i) => `w${from + i}`).join(' ')

describe('head-first chapter maps', () => {
  const lengths = [13, 70, 4, 16]
  const fits = (segments: { from: number; to: number }[], first: boolean) => segments.reduce((n, s) => n + s.to - s.from, 0) <= (first ? 20 : 30)

  it('hands over the opening page as it closes, and carrying on gives the one-go map', () => {
    let opening: ChapterHearingPage | null = null
    const steps = measuredDesktopPageSteps(lengths, fits, undefined, Infinity, undefined, undefined, undefined, undefined, closed => {
      if (!opening) opening = closed[0]
    })
    let step = steps.next()
    expect(step.done).toBe(false)
    const whole = measuredDesktopPages(lengths, fits)
    // The first pause: the opening page is final, the rest is still to come.
    expect(opening).toEqual(whole[0])
    while (!step.done) step = steps.next()
    expect(step.value).toEqual(whole)
  })

  it('covers the rest of the chapter with the column flow, from the word after the opening page', () => {
    const paragraphs = [words(13), words(70), words(4), words(16)]
    // The browser's column flow (the preflight): pages of 25 words.
    const placements = paragraphs.flatMap((text, paragraphIndex) => text.split(' ').map((_, wordIndex) => ({ paragraphIndex, wordIndex })))
      .map((place, index) => ({ ...place, pageIndex: Math.floor(index / 25) }))
    const preflight = nativePagesFromPlacements(placements)
    const opening = measuredDesktopPages(lengths, fits)[0]
    const start = labResumeAfterPage(opening, lengths)!
    const rest = provisionalPagesAfter(preflight, start)
    expect(chapterPagesCover(paragraphs, [opening, ...rest])).toBe(true)
    expect(chapterPageSegments(rest[0])[0]).toEqual({ paragraphIndex: start.paragraphIndex, from: start.wordIndex, to: 25 - 13 })
  })

  it('carries a word broken at the opening page edge onto the next page', () => {
    const paragraphs = ['alpha beta extraordinarily gamma delta epsilon']
    const opening: ChapterHearingPage = { paragraphIndex: 0, from: 0, to: 2, segments: [{ paragraphIndex: 0, from: 0, to: 2, tailFragment: 5 }] }
    const preflight = nativePagesFromPlacements([0, 1, 2, 3, 4, 5].map(wordIndex => ({ pageIndex: wordIndex < 3 ? 0 : 1, paragraphIndex: 0, wordIndex })))
    const start = labResumeAfterPage(opening, [6])!
    expect(start).toEqual({ paragraphIndex: 0, wordIndex: 2, headBreak: 5 })
    const rest = provisionalPagesAfter(preflight, start)
    expect(chapterPageSegments(rest[0])[0]).toEqual({ paragraphIndex: 0, from: 2, to: 3, headBreak: 5 })
    expect(chapterPagesCover(paragraphs, [opening, ...rest])).toBe(true)
  })
})


describe('long native layout scheduling', () => {
  it('yields before completing a long chapter and preserves the exact final page map', () => {
    const lengths = Array.from({ length: 200 }, () => 120)
    const fits = (segments: { from: number; to: number }[]) => segments.reduce((n, s) => n + s.to - s.from, 0) <= 80
    const steps = measuredDesktopPageSteps(lengths, fits)
    let clock = 0
    const now = () => { clock += 10; return clock }
    let result = nativePaginationSlice(steps, now)
    expect(result.done).toBe(false)
    let tasks = 1
    while (!result.done) { result = nativePaginationSlice(steps, now); tasks += 1 }
    expect(tasks).toBeGreaterThan(2)
    expect(result.value).toEqual(measuredDesktopPages(lengths, fits))
  })
})
