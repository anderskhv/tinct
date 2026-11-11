/**
 * Book scroll (Anders, 11 Nov 2026): the desktop Margin reader scrolls through a whole "scroll unit"
 * instead of stopping at each chapter. On for Tinct library books; phone, two-page, Compare and a
 * reader's own books keep the one-chapter reader for now.
 *
 * The saved place is unchanged: chapter + paragraph + word. Only the view changes; the reader's
 * chapter follows the chapter at the reading line (BookScrollReader.tsx).
 *
 * A pasted article can join later as one scroll unit whose sections are its chapters, with no gap
 * between them (`BookScrollUnit.gap`).
 */
import { parseBibleChapterTitle, type LabChapter } from '../labSource'

const SWITCH_KEY = 'tinct-book-scroll-off'

/**
 * On unless switched off. `?bookScroll=0` turns it off for this tab's session (a QA escape hatch, no
 * menu entry), `?bookScroll=1` on again.
 */
export function bookScrollSwitch(search: string, storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null): boolean {
  let asked: string | null = null
  try { asked = new URLSearchParams(search).get('bookScroll') } catch { asked = null }
  try {
    if (asked === '0') storage?.setItem(SWITCH_KEY, '1')
    else if (asked === '1') storage?.removeItem(SWITCH_KEY)
    return asked === '1' || (asked !== '0' && storage?.getItem(SWITCH_KEY) !== '1')
  } catch {
    return asked !== '0'
  }
}

export interface BookScrollUnit {
  /** Stable for the unit: the reader stays mounted while the chapter changes inside it. */
  key: string
  /** The unit's name where it has one ("Luke", "Book Two (1805)"); the empty string for a whole book. */
  label: string
  /** The unit's chapters, in reading order. */
  chapters: LabChapter[]
  /**
   * The space before a chapter's heading inside the unit: 'scripture' (short chapters, a smaller
   * gap), 'book' (a novel's chapter ending is a pause), 'none' (a pasted article's sections, later).
   */
  gap: 'scripture' | 'book' | 'none'
}

/** The higher division a chapter title carries: "Book Two (1805) — Chapter 3" -> "Book Two (1805)". */
export function chapterDivision(title: string): string | null {
  const at = title.indexOf(' — ')
  if (at <= 0) return null
  const head = title.slice(0, at).trim()
  return head || null
}

/** The contiguous run of chapters around `index` that share `group(chapter)`. */
function runAround<T>(items: readonly T[], index: number, group: (item: T) => string): T[] {
  const mine = group(items[index])
  let from = index
  let to = index
  while (from > 0 && group(items[from - 1]) === mine) from--
  while (to + 1 < items.length && group(items[to + 1]) === mine) to++
  return items.slice(from, to + 1)
}

/**
 * The scroll unit the chapter belongs to.
 * - The Bible: one biblical book (Luke, Genesis, Numbers).
 * - A book whose chapter titles carry a higher division ("Book Two (1805) — Chapter 3"): that division.
 * - Anything else: the whole book.
 * A chapter the list does not hold is its own unit, so the reader never shows text it cannot place.
 */
export function bookScrollUnit(bookId: string, chapters: readonly LabChapter[], chapterNumber: number): BookScrollUnit {
  const index = chapters.findIndex(chapter => chapter.number === chapterNumber)
  if (index < 0) return { key: `${bookId}/chapter:${chapterNumber}`, label: '', chapters: chapters.filter(chapter => chapter.number === chapterNumber), gap: bookId === 'bible' ? 'scripture' : 'book' }
  if (bookId === 'bible') {
    const group = (chapter: LabChapter) => parseBibleChapterTitle(chapter.title).book
    const run = runAround(chapters, index, group)
    return { key: `${bookId}/${group(chapters[index])}/${run[0].number}`, label: group(chapters[index]), chapters: run, gap: 'scripture' }
  }
  const divisions = chapters.map(chapter => chapterDivision(chapter.title))
  const named = new Set(divisions.filter((division): division is string => division != null))
  // A real division names several chapters: more than one division, and far fewer divisions than chapters.
  // "Chapter 1 — The Letter" style titles give one division per chapter and stay a whole-book scroll.
  const divided = named.size > 1 && named.size <= chapters.length * 0.6
  if (!divided) return { key: `${bookId}/book`, label: '', chapters: [...chapters], gap: 'book' }
  const group = (chapter: LabChapter) => chapterDivision(chapter.title) ?? ''
  const run = runAround(chapters, index, group)
  return { key: `${bookId}/${group(chapters[index])}/${run[0].number}`, label: group(chapters[index]), chapters: run, gap: 'book' }
}

export interface BookScrollBlock { chapterNumber: number; top: number }

/**
 * The chapter at the reading line. Blocks are in reading order with their tops in content
 * coordinates; the page break between two chapters belongs to the chapter above it, so a
 * chapter becomes current when its own first line reaches the reading line.
 */
export function chapterAtReadingLine(blocks: readonly BookScrollBlock[], line: number): number | null {
  if (!blocks.length) return null
  let low = 0
  let high = blocks.length - 1
  if (line < blocks[0].top) return blocks[0].chapterNumber
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (blocks[mid].top <= line) low = mid
    else high = mid - 1
  }
  return blocks[low].chapterNumber
}

/**
 * Which chapters are mounted. `order` is the unit in reading order, `first..last` the index
 * range in or near the viewport. Chapters within `add` of it are mounted; ones already mounted
 * stay until they are further than `keep` away (every painted chapter is restyled when the reader's own chapter changes, so few are kept), so a reader resting at a boundary does not
 * mount and release the same chapter. `always` (the reader's own chapter) is never released.
 */
export function bookScrollMounted(order: readonly number[], first: number, last: number, mounted: readonly number[], always: number, add = 1, keep = 2): number[] {
  if (!order.length) return []
  const lo = Math.max(0, Math.min(first, last))
  const hi = Math.min(order.length - 1, Math.max(first, last))
  const was = new Set(mounted)
  const next: number[] = []
  order.forEach((number, index) => {
    const near = index >= lo - add && index <= hi + add
    const kept = was.has(number) && index >= lo - keep && index <= hi + keep
    if (near || kept || number === always) next.push(number)
  })
  return next
}

/** Words a chapter is expected to hold, for a placeholder's height before the chapter was ever measured. */
export function chapterWordEstimate(chapter: Pick<LabChapter, 'wordCount' | 'paragraphCount'>, wordsPerParagraph = 80): number {
  if (typeof chapter.wordCount === 'number' && chapter.wordCount > 0) return chapter.wordCount
  return Math.max(1, chapter.paragraphCount ?? 1) * wordsPerParagraph
}
