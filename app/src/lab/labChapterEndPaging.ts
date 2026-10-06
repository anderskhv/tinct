import { chapterPageSegments, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'

function pageOf(segments: ChapterPageSegment[]): ChapterHearingPage {
  return { ...segments[0], segments }
}

/** Reserve the measured chapter actions on the final leaf without creating
 * an actions-only page. Earlier pages and logical source coordinates stay intact. */
/** A page may begin cleanly at a paragraph's start or after a sentence ends. */
export function cleanPageStarts(words: ReadonlyArray<ReadonlyArray<{ text: string }>>): (paragraphIndex: number, wordIndex: number) => boolean {
  return (paragraphIndex, wordIndex) => wordIndex === 0
    || /[.!?;:]["'”’)\]]*$/.test(words[paragraphIndex]?.[wordIndex - 1]?.text ?? '')
}

/** The carried tail may grow to this share of the page to reach a clean break. */
const CLEAN_BREAK_REACH = 1 / 3

/**
 * With `lineStarts` (the word indexes where the last page's lines begin, in
 * the paragraph of the segments' tail, as the paginators measure them), the
 * leaf before the actions is cut only where a line begins, so it ends on a
 * whole line like every other page, never on a lone word ("…good sense." |
 * "At thirteen …"). A sentence start is preferred only where a line starts.
 */
export function fitChapterEnd(
  pages: ChapterHearingPage[],
  fits: (segments: ChapterPageSegment[], first: boolean) => boolean,
  cleanStart?: (paragraphIndex: number, wordIndex: number) => boolean,
  lineStarts?: (segments: ChapterPageSegment[], first: boolean) => readonly number[] | null,
): ChapterHearingPage[] {
  if (!pages.length) return pages
  const last = chapterPageSegments(pages[pages.length - 1])
  if (fits(last, pages.length === 1)) return pages
  const count = last.reduce((sum, segment) => sum + segment.to - segment.from, 0)
  if (count < 2) return pages
  const split = (before: number): [ChapterPageSegment[], ChapterPageSegment[]] => {
    const left: ChapterPageSegment[] = [], right: ChapterPageSegment[] = []
    let remaining = before
    for (const segment of last) {
      const length = segment.to - segment.from
      if (remaining >= length) { left.push(segment); remaining -= length }
      else if (remaining <= 0) right.push(segment)
      else {
        // The new page boundary is between whole words. Existing fragments
        // at the outside edges retain their original ownership.
        const { tailFragment: _tail, ...head } = segment
        const { headBreak: _head, ...tail } = segment
        left.push({ ...head, to: segment.from + remaining })
        right.push({ ...tail, from: segment.from + remaining })
        remaining = 0
      }
    }
    return [left, right]
  }
  // The page before the actions keeps nearly all of its prose: carry about a
  // tenth of it over, so the actions never follow a lone word. Moving the
  // largest tail that fits instead stranded a few words ("1", "said, \"We")
  // on an otherwise empty leaf in long single-paragraph chapters.
  const target = Math.min(count - 1, Math.max(1, Math.round(count / 10)))
  let low = count - target, high = count - 1
  if (!fits(split(high)[1], false)) return pages
  // Shrink the carried tail only as far as the actions require.
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (fits(split(mid)[1], false)) high = mid
    else low = mid + 1
  }
  const at = (index: number) => {
    let remaining = index
    for (let segmentIndex = 0; segmentIndex < last.length; segmentIndex += 1) {
      const segment = last[segmentIndex]
      const length = segment.to - segment.from
      if (remaining < length) return { segmentIndex, paragraphIndex: segment.paragraphIndex, wordIndex: segment.from + remaining }
      remaining -= length
    }
    return null
  }
  // Where lines begin on the last page as it stands (the leaf before the
  // actions keeps that page's start, so it keeps those lines).
  const first = pages.length === 1
  const startsBySegment = new Map<number, ReadonlySet<number> | null>()
  const lineStart = (index: number): boolean => {
    if (!lineStarts) return true
    const place = at(index)
    if (!place) return false
    const segment = last[place.segmentIndex]
    // A segment begins a paragraph (or the page): always a line start.
    if (place.wordIndex === segment.from) return true
    if (!startsBySegment.has(place.segmentIndex)) {
      const found = lineStarts(last.slice(0, place.segmentIndex + 1), first)
      startsBySegment.set(place.segmentIndex, found ? new Set(found) : null)
    }
    const starts = startsBySegment.get(place.segmentIndex)
    return starts == null || starts.has(place.wordIndex)
  }
  // Prefer to start the actions' leaf at a sentence or paragraph rather than
  // mid-sentence ("…my words to" | "him."), carrying a little more if needed,
  // and only where a line starts.
  let cut = low
  let clean = false
  if (cleanStart) {
    const floor = Math.max(1, Math.floor(count * (1 - CLEAN_BREAK_REACH)))
    for (let candidate = low; candidate >= floor; candidate -= 1) {
      const place = at(candidate)
      if (!place || !cleanStart(place.paragraphIndex, place.wordIndex) || !lineStart(candidate)) continue
      if (fits(split(candidate)[1], false)) { cut = candidate; clean = true }
      break
    }
  }
  // Otherwise the next line start: the actions' leaf carries a little less,
  // which always still fits.
  if (!clean && lineStarts && !lineStart(cut)) {
    let candidate = cut + 1
    while (candidate < count && !lineStart(candidate)) candidate += 1
    if (candidate < count) cut = candidate
    else {
      // The cut is on the page's last line: carry that whole line instead.
      candidate = cut - 1
      while (candidate >= 1 && !(lineStart(candidate) && fits(split(candidate)[1], false))) candidate -= 1
      if (candidate >= 1) cut = candidate
    }
  }
  const [before, after] = split(cut)
  return [...pages.slice(0, -1), pageOf(before), pageOf(after)]
}
