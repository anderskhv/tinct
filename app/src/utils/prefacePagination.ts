export type PrefaceDisplayColumns = 1 | 2

const NARROW_PREFACE_WIDTH = 680
const OVERFLOW_SLACK = 0.15

export function prefaceDisplayColumns(
  wrapperWidth: number,
  requested: PrefaceDisplayColumns = 2,
): PrefaceDisplayColumns {
  if (wrapperWidth > 0 && wrapperWidth < NARROW_PREFACE_WIDTH) return 1
  return requested
}

export function countColumnPages(args: {
  scrollWidth: number
  columnWidth: number
  columnGap: number
  displayColumns: PrefaceDisplayColumns
}): number {
  const { scrollWidth, columnWidth, columnGap, displayColumns } = args
  if (columnWidth <= 0) return 1
  const stride = columnWidth + columnGap
  if (stride <= 0) return 1
  const rawCols = (scrollWidth + columnGap) / stride
  // Bias against a blank overflow column. CSS multi-column often reports a
  // sub-pixel leftover that used to grow the preface counter as the reader
  // tapped (1 of 7 → 2 of 9 → 16 of 16).
  const totalCols = Math.max(1, Math.round(rawCols - OVERFLOW_SLACK))
  return Math.max(1, Math.ceil(totalCols / displayColumns))
}

export function prefaceSectionTotal(measuredPages: number, included: boolean): number {
  if (!included) return 0
  return Math.max(1, measuredPages)
}

export function prefacePageTotal(args: {
  isMobile: boolean
  hasWhy: boolean
  hasCast: boolean
  hasCompare: boolean
  aboutPages: number
  whyPages: number
  castPages: number
}): number {
  const about = prefaceSectionTotal(args.aboutPages, true)
  const why = prefaceSectionTotal(args.whyPages, args.hasWhy)
  const cast = prefaceSectionTotal(args.castPages, args.hasCast)
  if (args.isMobile) {
    return (
      1 +
      about +
      why +
      cast +
      1 +
      (args.hasCompare ? 1 : 0) +
      1
    )
  }
  return about + why + cast + 1
}

export function formatPrefaceCounter(pageIndex: number, total: number, settled: boolean): string {
  const page = Math.max(1, pageIndex + 1)
  if (!settled || total < 1) return String(page)
  return `${page} of ${total}`
}

export function isPrefaceMeasurementSettled(args: {
  hasWhy: boolean
  hasCast: boolean
  aboutKnown: boolean
  whyKnown: boolean
  castKnown: boolean
}): boolean {
  if (!args.aboutKnown) return false
  if (args.hasWhy && !args.whyKnown) return false
  if (args.hasCast && !args.castKnown) return false
  return true
}
