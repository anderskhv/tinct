export type PrefaceDisplayColumns = 1 | 2

const OVERFLOW_SLACK = 0.15
export const MIN_READER_COLUMN_HEIGHT = 160
export const MIN_READER_COLUMN_WIDTH = 200

export function countColumnPages(args: {
  scrollWidth: number
  columnWidth: number
  columnGap: number
  displayColumns?: PrefaceDisplayColumns
}): number {
  const displayColumns = args.displayColumns ?? 1
  const { scrollWidth, columnWidth, columnGap } = args
  if (columnWidth <= 0) return 1
  const stride = columnWidth + columnGap
  if (stride <= 0) return 1
  const rawCols = (scrollWidth + columnGap) / stride
  const totalCols = Math.max(1, Math.round(rawCols - OVERFLOW_SLACK))
  return Math.max(1, Math.ceil(totalCols / displayColumns))
}

export function canMeasureReaderPages(width: number, height: number): boolean {
  return width >= MIN_READER_COLUMN_WIDTH && height >= MIN_READER_COLUMN_HEIGHT
}

export function measureContentfulColumnPages(args: {
  scrollWidth: number
  columnWidth: number
  columnGap: number
  containerHeight: number
  containerWidth: number
  lastContentOffsetLeft?: number
}): number | null {
  if (!canMeasureReaderPages(args.containerWidth, args.containerHeight)) return null
  if (args.columnWidth <= 0) return null
  const raw = countColumnPages({
    scrollWidth: args.scrollWidth,
    columnWidth: args.columnWidth,
    columnGap: args.columnGap,
    displayColumns: 1,
  })
  if (args.lastContentOffsetLeft == null || args.lastContentOffsetLeft < 0) return raw
  const lastPage = Math.floor(args.lastContentOffsetLeft / (args.columnWidth + args.columnGap))
  return Math.max(1, Math.min(raw, lastPage + 1))
}

/**
 * Publish a page total only after the same count arrives twice, and ignore
 * one-page rounding jitter. Stops the chapter footer from cycling
 * 1/41 → 1/103 → 1/28 while fonts, chrome, and column-width settle.
 */
export function decidePublishedPageCount(args: {
  measured: number | null
  published: number
  pending: number | null
}): { publish: boolean; pages: number | null; pending: number | null } {
  if (args.measured == null || args.measured < 1) {
    return { publish: false, pages: null, pending: args.pending }
  }
  if (args.measured === args.published) {
    return { publish: false, pages: args.published, pending: null }
  }
  if (args.published > 1 && Math.abs(args.measured - args.published) <= 1) {
    return { publish: false, pages: args.published, pending: null }
  }
  if (args.pending === args.measured) {
    return { publish: true, pages: args.measured, pending: null }
  }
  return { publish: false, pages: null, pending: args.measured }
}

export const SPLIT_ROW_FRAGMENT_CHARS = 480

export function splitRowShouldFragment(rowHeight: number, columnHeight: number): boolean {
  if (columnHeight <= 0 || rowHeight <= 0) return false
  return rowHeight > columnHeight - 16
}

/** First-pass Compare heuristic before height is known. 1200 chars missed
 *  most Odyssey Book 1 pairs, which still overflow a 50% column. */
export function splitRowShouldFragmentByText(leftChars: number, rightChars: number): boolean {
  return Math.max(leftChars, rightChars) > SPLIT_ROW_FRAGMENT_CHARS
}

export function liveContentfulPageCount(
  content: { scrollWidth: number; querySelector: (selector: string) => Element | null },
  container: { clientHeight: number; clientWidth: number } | null,
  columnWidth: number,
  columnGap: number,
): number | null {
  const last = content.querySelector('.chapter-end, [data-paragraph-index]:last-of-type') as { offsetLeft?: number } | null
  return measureContentfulColumnPages({
    scrollWidth: content.scrollWidth,
    columnWidth,
    columnGap,
    containerHeight: container?.clientHeight ?? 0,
    containerWidth: container?.clientWidth ?? 0,
    lastContentOffsetLeft: last?.offsetLeft,
  })
}
