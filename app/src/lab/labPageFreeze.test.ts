import { describe, expect, it } from 'vitest'
import { measuredDesktopPages, type LabPaginationStart } from './LabDesktopPaginator'
import { labPagesKeepingPrefix, labResumeAfterPage } from './LabNativePaginator'
import { chapterPageSegments, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'

/**
 * The V2 phone foot changes height when the audio transport opens or closes.
 * The reader's page must not move a word: it is kept, and only the pages after
 * it are laid out again at the new height.
 */
const lengths = [13, 70, 4, 16]
const count = (segments: ChapterPageSegment[]) => segments.reduce((n, s) => n + s.to - s.from, 0)
/** A page of `capacity` words; the chapter's first leaf loses 10 to the heading. */
const leaf = (capacity: number) => (segments: ChapterPageSegment[], first: boolean) => count(segments) <= capacity - (first ? 10 : 0)
const words = (pages: ChapterHearingPage[]) => pages.flatMap(p => chapterPageSegments(p).flatMap(s => Array.from({ length: s.to - s.from }, (_, i) => `${s.paragraphIndex}:${s.from + i}`)))
const everyWord = lengths.flatMap((n, p) => Array.from({ length: n }, (_, w) => `${p}:${w}`))

describe('keeping the open page through a foot change', () => {
  const closed = measuredDesktopPages(lengths, leaf(30)) // transport closed: every line
  const paginateAt = (capacity: number) => (start: LabPaginationStart) =>
    measuredDesktopPages(lengths, leaf(capacity), undefined, Infinity, undefined, start)

  it('keeps the current page and those before it verbatim, and lays out only the rest at the new height', () => {
    const current = 1
    const next = labPagesKeepingPrefix(closed.slice(0, current + 1), lengths, paginateAt(26))
    expect(next.slice(0, current + 1)).toEqual(closed.slice(0, current + 1))
    // Same words, same order, none lost or repeated.
    expect(words(next)).toEqual(everyWord)
    // Every later page fits the shorter column (26 words); none is the heading page.
    for (const page of next.slice(current + 1)) expect(count(chapterPageSegments(page))).toBeLessThanOrEqual(26)
    // The first of them starts at the word after the kept page…
    const keptSegments = chapterPageSegments(closed[current]); const keptEnd = keptSegments[keptSegments.length - 1]
    expect(next[current + 1]).toMatchObject({ paragraphIndex: keptEnd.paragraphIndex, from: keptEnd.to })
    // …and is full: the shorter column still packs every line it has.
    expect(count(chapterPageSegments(next[current + 1]))).toBe(26)
  })

  it('goes back to the full column for later pages when the transport closes', () => {
    const open = measuredDesktopPages(lengths, leaf(26))
    const next = labPagesKeepingPrefix(open.slice(0, 2), lengths, paginateAt(30))
    expect(next.slice(0, 2)).toEqual(open.slice(0, 2))
    expect(words(next)).toEqual(everyWord)
    expect(count(chapterPageSegments(next[2]))).toBe(30)
  })

  it('keeps the whole map when the kept page ends the chapter', () => {
    expect(labPagesKeepingPrefix(closed, lengths, paginateAt(26))).toBe(closed)
  })

  it('resumes after a page end at a paragraph boundary, skipping empty paragraphs', () => {
    expect(labResumeAfterPage({ paragraphIndex: 0, from: 0, to: 13 }, [13, 0, 5])).toEqual({ paragraphIndex: 2, wordIndex: 0 })
    expect(labResumeAfterPage({ paragraphIndex: 2, from: 0, to: 5 }, [13, 0, 5])).toBeNull()
  })

  it('continues a hyphenated word the kept page showed the opening of', () => {
    const page = { paragraphIndex: 0, from: 0, to: 20, segments: [{ paragraphIndex: 0, from: 0, to: 20, tailFragment: 3 }] }
    expect(labResumeAfterPage(page, [40])).toEqual({ paragraphIndex: 0, wordIndex: 20, headBreak: 3 })
    const rest = measuredDesktopPages([40], leaf(30), undefined, Infinity, undefined, { paragraphIndex: 0, wordIndex: 20, headBreak: 3 })
    expect(chapterPageSegments(rest[0])[0]).toEqual({ paragraphIndex: 0, from: 20, to: 40, headBreak: 3 })
  })

  it('applies the chapter-end fit only when a tail was laid out again', () => {
    let fitted: ChapterHearingPage[] | null = null
    const next = labPagesKeepingPrefix(closed.slice(0, 1), lengths, paginateAt(26), pages => { fitted = pages; return pages })
    expect(fitted).toBe(next)
    let untouched = true
    labPagesKeepingPrefix(closed, lengths, paginateAt(26), pages => { untouched = false; return pages })
    expect(untouched).toBe(true)
  })
})
