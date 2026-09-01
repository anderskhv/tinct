export type PrefaceDisplayColumns = 1 | 2

const OVERFLOW_SLACK = 0.15
export const MIN_READER_COLUMN_HEIGHT = 160
export const MIN_READER_COLUMN_WIDTH = 200

export const READER_SWIPE_MIN_DISTANCE = 44
export const READER_SWIPE_AXIS_RATIO = 1.2

/** Return +1 for a deliberate left/forward swipe, -1 for right/back. */
export function readerSwipeDirection(deltaX: number, deltaY: number): 1 | -1 | 0 {
  const horizontal = Math.abs(deltaX)
  const vertical = Math.abs(deltaY)
  if (horizontal < READER_SWIPE_MIN_DISTANCE) return 0
  if (horizontal < vertical * READER_SWIPE_AXIS_RATIO) return 0
  return deltaX < 0 ? 1 : -1
}

export const CONTENT_BOX_SELECTOR = '[data-paragraph-index], .chapter-header, .chapter-end, .split-row'

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
export const PARAGRAPH_FRAGMENT_CHARS = SPLIT_ROW_FRAGMENT_CHARS

export function splitRowShouldFragment(rowHeight: number, columnHeight: number): boolean {
  if (columnHeight <= 0 || rowHeight <= 0) return false
  return rowHeight > columnHeight - 16
}

/** Height check for a single-column paragraph that would skip the column. */
export function paragraphShouldFragment(paragraphHeight: number, columnHeight: number): boolean {
  return splitRowShouldFragment(paragraphHeight, columnHeight)
}

/** First-pass Compare heuristic before height is known. 1200 chars missed
 *  most Odyssey Book 1 pairs, which still overflow a 50% column. */
export function splitRowShouldFragmentByText(leftChars: number, rightChars: number): boolean {
  return Math.max(leftChars, rightChars) > SPLIT_ROW_FRAGMENT_CHARS
}

/** First-pass single-column heuristic. Odyssey Book 1 has 21/32 paras
 *  over 480 chars; those are the ones that skip a desktop column. */
export function paragraphShouldFragmentByText(chars: number): boolean {
  return chars > PARAGRAPH_FRAGMENT_CHARS
}

export type ReaderContentBox = {
  offsetLeft: number
  offsetWidth?: number
  offsetHeight?: number
  textLength?: number
  fragmentable?: boolean
}

export function pageIndexForOffset(offsetLeft: number, columnWidth: number, columnGap: number): number {
  const stride = columnWidth + columnGap
  if (stride <= 0) return 0
  return Math.max(0, Math.floor(offsetLeft / stride))
}

export function pageHasContentfulText(args: {
  boxes: ReaderContentBox[]
  pageIndex: number
  columnWidth: number
  columnGap: number
  columnHeight?: number
}): boolean {
  const { boxes, pageIndex, columnWidth, columnGap, columnHeight } = args
  if (pageIndex < 0 || columnWidth <= 0) return false
  const stride = columnWidth + columnGap
  const pageLeft = pageIndex * stride
  const pageRight = pageLeft + columnWidth

  const starts = boxes
    .filter(box => (box.textLength ?? 1) > 0)
    .map(box => pageIndexForOffset(box.offsetLeft, columnWidth, columnGap))

  for (const box of boxes) {
    if ((box.textLength ?? 1) <= 0) continue
    const left = box.offsetLeft
    const width = box.offsetWidth ?? 0
    const startPage = pageIndexForOffset(left, columnWidth, columnGap)
    if (startPage === pageIndex) return true
    if (width > 0 && left < pageRight && left + width > pageLeft) return true
    if (box.fragmentable && startPage < pageIndex) {
      if (columnHeight && (box.offsetHeight ?? 0) > 0) {
        const span = Math.max(1, Math.ceil((box.offsetHeight ?? 0) / columnHeight))
        if (pageIndex < startPage + span) return true
      }
      const nextStart = starts.reduce<number | null>((min, start) => {
        if (start <= startPage) return min
        return min == null || start < min ? start : min
      }, null)
      if (nextStart == null || pageIndex < nextStart) return true
    }
  }
  return false
}

export function listContentfulPages(args: {
  boxes: ReaderContentBox[]
  columnWidth: number
  columnGap: number
  pageCount: number
  columnHeight?: number
}): number[] {
  const pages: number[] = []
  const max = Math.max(0, args.pageCount)
  for (let i = 0; i < max; i++) {
    if (pageHasContentfulText({ ...args, pageIndex: i })) pages.push(i)
  }
  return pages
}

/**
 * Never return a column that has no contentful text when any content exists.
 * Walks in `direction` first (page turns), then the opposite way (restore).
 */
export function resolveContentfulPage(args: {
  requested: number
  direction?: 1 | -1
  boxes: ReaderContentBox[]
  columnWidth: number
  columnGap: number
  pageCount: number
  columnHeight?: number
}): number {
  const pageCount = Math.max(1, args.pageCount)
  const requested = Math.max(0, Math.min(Math.trunc(args.requested), pageCount - 1))
  const direction: 1 | -1 = args.direction === -1 ? -1 : 1
  const has = (page: number) => pageHasContentfulText({ ...args, pageIndex: page })
  if (has(requested)) return requested
  for (let page = requested + direction; page >= 0 && page < pageCount; page += direction) {
    if (has(page)) return page
  }
  for (let page = requested - direction; page >= 0 && page < pageCount; page -= direction) {
    if (has(page)) return page
  }
  return requested
}

/** True when landing on `pageIndex` would show chrome + empty paper. */
export function publishedPageWouldBeEmpty(args: {
  pageIndex: number
  boxes: ReaderContentBox[]
  columnWidth: number
  columnGap: number
  pageCount: number
  columnHeight?: number
}): boolean {
  if (args.boxes.every(box => (box.textLength ?? 1) <= 0)) return false
  const shown = resolveContentfulPage({
    requested: args.pageIndex,
    boxes: args.boxes,
    columnWidth: args.columnWidth,
    columnGap: args.columnGap,
    pageCount: args.pageCount,
    columnHeight: args.columnHeight,
  })
  return !pageHasContentfulText({ ...args, pageIndex: shown })
}

export function collectContentBoxes(content: {
  querySelectorAll?: (selector: string) => ArrayLike<{
    offsetLeft?: number
    offsetWidth?: number
    offsetHeight?: number
    textContent?: string | null
    classList?: { contains: (name: string) => boolean }
  }>
  querySelector?: (selector: string) => { offsetLeft?: number; textContent?: string | null } | null
}): ReaderContentBox[] {
  if (typeof content.querySelectorAll === 'function') {
    const nodes = content.querySelectorAll(CONTENT_BOX_SELECTOR)
    const boxes: ReaderContentBox[] = []
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i]
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
      if (!text) continue
      boxes.push({
        offsetLeft: el.offsetLeft ?? 0,
        offsetWidth: el.offsetWidth ?? 0,
        offsetHeight: el.offsetHeight ?? 0,
        textLength: text.length,
        fragmentable: el.classList?.contains('text-paragraph-fragmentable')
          || el.classList?.contains('split-row-fragmentable'),
      })
    }
    return boxes
  }
  const last = content.querySelector?.('.chapter-end, [data-paragraph-index]:last-of-type')
  if (!last) return []
  const text = (last.textContent || '').replace(/\s+/g, ' ').trim()
  return [{ offsetLeft: last.offsetLeft ?? 0, textLength: text.length || 1 }]
}

export function lastContentOffsetLeft(boxes: ReaderContentBox[]): number | undefined {
  if (boxes.length === 0) return undefined
  return Math.max(...boxes.map(box => box.offsetLeft))
}

export function liveContentfulPageCount(
  content: {
    scrollWidth: number
    querySelector: (selector: string) => Element | null
    querySelectorAll?: (selector: string) => ArrayLike<Element>
  },
  container: { clientHeight: number; clientWidth: number } | null,
  columnWidth: number,
  columnGap: number,
): number | null {
  const boxes = collectContentBoxes(content)
  const last = lastContentOffsetLeft(boxes)
    ?? (content.querySelector('.chapter-end, [data-paragraph-index]:last-of-type') as { offsetLeft?: number } | null)?.offsetLeft
  return measureContentfulColumnPages({
    scrollWidth: content.scrollWidth,
    columnWidth,
    columnGap,
    containerHeight: container?.clientHeight ?? 0,
    containerWidth: container?.clientWidth ?? 0,
    lastContentOffsetLeft: last,
  })
}

export function resolveContentfulPageFromDom(
  content: {
    querySelectorAll?: (selector: string) => ArrayLike<Element>
    querySelector?: (selector: string) => Element | null
  } | null,
  args: {
    requested: number
    direction?: 1 | -1
    columnWidth: number
    columnGap: number
    pageCount: number
    columnHeight?: number
  },
): number {
  if (!content || args.columnWidth <= 0) return Math.max(0, args.requested)
  return resolveContentfulPage({
    requested: args.requested,
    direction: args.direction,
    boxes: collectContentBoxes(content),
    columnWidth: args.columnWidth,
    columnGap: args.columnGap,
    pageCount: args.pageCount,
    columnHeight: args.columnHeight,
  })
}

/** Compare/split stays off unless the reader turned it on and picked a companion. */
export function shouldOpenSplitView(args: {
  splitViewEnabled: boolean
  companionEditionKey?: string | null
  primaryEditionKey?: string | null
}): boolean {
  if (!args.splitViewEnabled) return false
  if (!args.companionEditionKey) return false
  if (args.companionEditionKey === args.primaryEditionKey) return false
  return true
}
