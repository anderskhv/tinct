import { describe, expect, it } from 'vitest'
import {
  countColumnPages,
  formatPrefaceCounter,
  isPrefaceMeasurementSettled,
  prefaceDisplayColumns,
  prefacePageTotal,
} from './prefacePagination'

describe('prefaceDisplayColumns', () => {
  it('forces a single column on narrow viewports', () => {
    expect(prefaceDisplayColumns(390, 2)).toBe(1)
    expect(prefaceDisplayColumns(679, 2)).toBe(1)
    expect(prefaceDisplayColumns(680, 2)).toBe(2)
    expect(prefaceDisplayColumns(1200, 1)).toBe(1)
  })
})

describe('countColumnPages', () => {
  it('counts whole facing-page spreads without inventing a leftover page', () => {
    expect(countColumnPages({
      scrollWidth: 860,
      columnWidth: 400,
      columnGap: 60,
      displayColumns: 2,
    })).toBe(1)
  })

  it('does not turn a sub-pixel overflow into an extra page', () => {
    expect(countColumnPages({
      scrollWidth: 400.4,
      columnWidth: 400,
      columnGap: 60,
      displayColumns: 1,
    })).toBe(1)
  })

  it('counts a real second column as a second page', () => {
    expect(countColumnPages({
      scrollWidth: 860,
      columnWidth: 400,
      columnGap: 60,
      displayColumns: 1,
    })).toBe(2)
  })
})

describe('prefacePageTotal', () => {
  it('uses a stable mobile structure once section counts are known', () => {
    expect(prefacePageTotal({
      isMobile: true,
      hasWhy: true,
      hasCast: true,
      hasCompare: true,
      aboutPages: 3,
      whyPages: 2,
      castPages: 4,
    })).toBe(13)
  })

  it('does not invent why/cast pages when those sections are absent', () => {
    expect(prefacePageTotal({
      isMobile: false,
      hasWhy: false,
      hasCast: false,
      hasCompare: false,
      aboutPages: 2,
      whyPages: 9,
      castPages: 9,
    })).toBe(3)
  })
})

describe('formatPrefaceCounter', () => {
  it('withholds a fake total until measurement settles', () => {
    expect(formatPrefaceCounter(0, 7, false)).toBe('1')
    expect(formatPrefaceCounter(4, 13, true)).toBe('5 of 13')
  })
})

describe('isPrefaceMeasurementSettled', () => {
  it('waits for every included section', () => {
    expect(isPrefaceMeasurementSettled({
      hasWhy: true,
      hasCast: true,
      aboutKnown: true,
      whyKnown: false,
      castKnown: true,
    })).toBe(false)
    expect(isPrefaceMeasurementSettled({
      hasWhy: true,
      hasCast: false,
      aboutKnown: true,
      whyKnown: true,
      castKnown: false,
    })).toBe(true)
  })
})
