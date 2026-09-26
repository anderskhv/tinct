import { describe, expect, it } from 'vitest'
import { measuredDesktopPages } from './LabDesktopPaginator'
import { type ChapterPageSegment } from './labHearing'

const fits = (segments: ChapterPageSegment[], first: boolean) =>
  segments.reduce((n, s) => n + s.to - s.from + (s.tailFragment ? 0.4 : 0), 0) <= (first ? 3.5 : 5.5)

describe('bounded next-chapter measurement', () => {
  it('returns exactly the same opening and continuation as the full chapter map', () => {
    for (const lengths of [[2], [3, 4], [3, 4, 17], [103], [1, 1, 1, 1, 80]]) {
      const full = measuredDesktopPages(lengths, fits)
      expect(measuredDesktopPages(lengths, fits, undefined, 2)).toEqual(full.slice(0, 2))
    }
  })
  it('retains page-edge fragment ownership in the bounded opening', () => {
    const breaks = () => [3, 5]
    const full = measuredDesktopPages([42], fits, breaks)
    expect(full[0].segments?.[0].tailFragment).toBe(5)
    expect(full[1].segments?.[0].headBreak).toBe(5)
    expect(measuredDesktopPages([42], fits, breaks, 2)).toEqual(full.slice(0, 2))
  })
  it('does not lay out an entire long chapter to show its opening', () => {
    let limitedCalls = 0, fullCalls = 0
    measuredDesktopPages([10000], (s, first) => { limitedCalls++; return fits(s, first) }, undefined, 2)
    measuredDesktopPages([10000], (s, first) => { fullCalls++; return fits(s, first) })
    expect(limitedCalls).toBeLessThan(fullCalls / 10)
  })
})
