import { describe, expect, it } from 'vitest'
import {
  canMeasureReaderPages,
  countColumnPages,
  decidePublishedPageCount,
  measureContentfulColumnPages,
  liveContentfulPageCount,
  splitRowShouldFragment,
  splitRowShouldFragmentByText,
} from './readerPagination'

describe('countColumnPages', () => {
  it('does not invent a leftover page from sub-pixel overflow', () => {
    expect(countColumnPages({
      scrollWidth: 400.4,
      columnWidth: 400,
      columnGap: 60,
    })).toBe(1)
  })
})

describe('canMeasureReaderPages', () => {
  it('rejects a collapsed reader box that would invent dozens of pages', () => {
    expect(canMeasureReaderPages(1100, 0)).toBe(false)
    expect(canMeasureReaderPages(1100, 80)).toBe(false)
    expect(canMeasureReaderPages(1100, 700)).toBe(true)
  })
})

describe('measureContentfulColumnPages', () => {
  it('returns null until the column has a real height', () => {
    expect(measureContentfulColumnPages({
      scrollWidth: 20000,
      columnWidth: 400,
      columnGap: 60,
      containerHeight: 40,
      containerWidth: 1100,
    })).toBeNull()
  })

  it('trims trailing empty columns using the last content offset', () => {
    expect(measureContentfulColumnPages({
      scrollWidth: 20000,
      columnWidth: 400,
      columnGap: 60,
      containerHeight: 700,
      containerWidth: 1100,
      lastContentOffsetLeft: 32 * (400 + 60),
    })).toBe(33)
  })
})

describe('decidePublishedPageCount', () => {
  it('holds the first wild measurement until it repeats', () => {
    expect(decidePublishedPageCount({ measured: 103, published: 1, pending: null })).toEqual({
      publish: false,
      pages: null,
      pending: 103,
    })
    expect(decidePublishedPageCount({ measured: 103, published: 1, pending: 103 })).toEqual({
      publish: true,
      pages: 103,
      pending: null,
    })
  })

  it('ignores one-page rounding jitter after a total is published', () => {
    expect(decidePublishedPageCount({ measured: 34, published: 33, pending: null })).toEqual({
      publish: false,
      pages: 33,
      pending: null,
    })
  })

  it('publishes a confirmed jump after two matching reads', () => {
    expect(decidePublishedPageCount({ measured: 28, published: 41, pending: null }).pending).toBe(28)
    expect(decidePublishedPageCount({ measured: 28, published: 41, pending: 28 })).toEqual({
      publish: true,
      pages: 28,
      pending: null,
    })
  })
})

describe('splitRowShouldFragment', () => {
  it('fragments an aligned pair that cannot fit on one Compare page', () => {
    expect(splitRowShouldFragment(820, 700)).toBe(true)
    expect(splitRowShouldFragment(240, 700)).toBe(false)
  })
})

describe('liveContentfulPageCount', () => {
  it('returns null when the reader box is still collapsed', () => {
    const content = {
      scrollWidth: 20000,
      querySelector: () => ({ offsetLeft: 0 }),
    }
    expect(liveContentfulPageCount(content, { clientHeight: 40, clientWidth: 1100 }, 400, 60)).toBeNull()
  })
})

describe('splitRowShouldFragmentByText', () => {
  it('marks Odyssey-length opening pairs before height is known', () => {
    expect(splitRowShouldFragmentByText(605, 548)).toBe(true)
    expect(splitRowShouldFragmentByText(274, 233)).toBe(false)
    expect(splitRowShouldFragmentByText(1199, 400)).toBe(true)
  })
})
