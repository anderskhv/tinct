import { describe, expect, it } from 'vitest'
import {
  canMeasureReaderPages,
  countColumnPages,
  decidePublishedPageCount,
  measureContentfulColumnPages,
  liveContentfulPageCount,
  pageHasContentfulText,
  paragraphShouldFragment,
  paragraphShouldFragmentByText,
  publishedPageWouldBeEmpty,
  readerSwipeDirection,
  resolveContentfulPage,
  shouldOpenSplitView,
  splitRowShouldFragment,
  splitRowShouldFragmentByText,
} from './readerPagination'

describe('readerSwipeDirection', () => {
  it('maps left forward and right backward', () => {
    expect(readerSwipeDirection(-90, 8)).toBe(1)
    expect(readerSwipeDirection(90, -8)).toBe(-1)
  })

  it('ignores taps and predominantly vertical movement', () => {
    expect(readerSwipeDirection(8, 2)).toBe(0)
    expect(readerSwipeDirection(-50, 48)).toBe(0)
    expect(readerSwipeDirection(70, 90)).toBe(0)
  })
})

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

describe('empty-page guard', () => {
  const columnWidth = 400
  const columnGap = 60
  const skippedColumn = {
    boxes: [
      { offsetLeft: 0, offsetWidth: 400, textLength: 80 },
      { offsetLeft: 2 * (400 + 60), offsetWidth: 400, textLength: 120 },
    ],
    columnWidth,
    columnGap,
    pageCount: 3,
  }

  it('fails when a published page would have no contentful text', () => {
    expect(pageHasContentfulText({ ...skippedColumn, pageIndex: 0 })).toBe(true)
    expect(pageHasContentfulText({ ...skippedColumn, pageIndex: 1 })).toBe(false)
    expect(pageHasContentfulText({ ...skippedColumn, pageIndex: 2 })).toBe(true)
    const shown = resolveContentfulPage({ requested: 1, direction: 1, ...skippedColumn })
    expect(shown).toBe(2)
    expect(pageHasContentfulText({ ...skippedColumn, pageIndex: shown })).toBe(true)
    expect(publishedPageWouldBeEmpty({ pageIndex: 1, ...skippedColumn })).toBe(false)
  })

  it('skips a leftover empty column when turning backward', () => {
    expect(resolveContentfulPage({ requested: 1, direction: -1, ...skippedColumn })).toBe(0)
  })

  it('does not skip a continuation column of a fragmentable paragraph', () => {
    const boxes = [
      { offsetLeft: 0, offsetWidth: 400, offsetHeight: 1400, textLength: 1800, fragmentable: true },
      { offsetLeft: 2 * (400 + 60), offsetWidth: 400, textLength: 80 },
    ]
    expect(pageHasContentfulText({
      boxes,
      pageIndex: 1,
      columnWidth: 400,
      columnGap: 60,
      columnHeight: 700,
    })).toBe(true)
    expect(resolveContentfulPage({
      requested: 1,
      direction: 1,
      boxes,
      columnWidth: 400,
      columnGap: 60,
      pageCount: 3,
      columnHeight: 700,
    })).toBe(1)
  })

  it('fragments a single-column paragraph that cannot fit the column', () => {
    expect(paragraphShouldFragment(820, 700)).toBe(true)
    expect(paragraphShouldFragment(240, 700)).toBe(false)
    expect(paragraphShouldFragmentByText(1875)).toBe(true)
    expect(paragraphShouldFragmentByText(200)).toBe(false)
  })

  it('fragments a Compare pair that overflows the column', () => {
    expect(splitRowShouldFragment(820, 700)).toBe(true)
    expect(splitRowShouldFragmentByText(605, 548)).toBe(true)
  })
})

describe('shouldOpenSplitView', () => {
  it('stays off unless the reader chose a companion edition', () => {
    expect(shouldOpenSplitView({
      splitViewEnabled: true,
      companionEditionKey: 'modern-en',
      primaryEditionKey: 'original-en',
    })).toBe(true)
    expect(shouldOpenSplitView({
      splitViewEnabled: true,
      companionEditionKey: null,
      primaryEditionKey: 'original-en',
    })).toBe(false)
    expect(shouldOpenSplitView({
      splitViewEnabled: false,
      companionEditionKey: 'modern-en',
      primaryEditionKey: 'original-en',
    })).toBe(false)
    expect(shouldOpenSplitView({
      splitViewEnabled: true,
      companionEditionKey: 'original-en',
      primaryEditionKey: 'original-en',
    })).toBe(false)
  })
})
