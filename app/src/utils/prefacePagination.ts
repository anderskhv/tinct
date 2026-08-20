import { countColumnPages, type PrefaceDisplayColumns } from './readerPagination'

export type { PrefaceDisplayColumns }
export { countColumnPages }

const NARROW_PREFACE_WIDTH = 680

export function prefaceDisplayColumns(
  wrapperWidth: number,
  requested: PrefaceDisplayColumns = 2,
): PrefaceDisplayColumns {
  if (wrapperWidth > 0 && wrapperWidth < NARROW_PREFACE_WIDTH) return 1
  return requested
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
