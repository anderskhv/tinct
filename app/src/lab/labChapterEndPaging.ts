import { chapterPageSegments, type ChapterHearingPage, type ChapterPageSegment } from './labHearing'

function pageOf(segments: ChapterPageSegment[]): ChapterHearingPage {
  return { ...segments[0], segments }
}

/** Reserve the measured chapter actions on the final leaf without creating
 * an actions-only page. Earlier pages and logical source coordinates stay intact. */
export function fitChapterEnd(
  pages: ChapterHearingPage[],
  fits: (segments: ChapterPageSegment[], first: boolean) => boolean,
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
  // Find the largest final prose tail that fits beside the compact actions.
  let low = 1, high = count - 1
  if (!fits(split(high)[1], false)) return pages
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (fits(split(mid)[1], false)) high = mid
    else low = mid + 1
  }
  const [before, after] = split(low)
  return [...pages.slice(0, -1), pageOf(before), pageOf(after)]
}
