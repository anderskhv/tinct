/**
 * Compute the progress label string that the running footer (and the
 * legacy BottomBar) shows to the right of the chapter title.
 *
 * Honors the user's `progressDisplay` preference: metric (percent / page /
 * time / location) × scope (book / chapter / section). Identical logic
 * lived inline in BottomBar.renderProgressValue; extracted here so the
 * Reader's running footer can use it too without re-passing every prop.
 */
import type { UserPreferences } from '../types'

export interface ProgressInputs {
  /** UserPreferences.progressDisplay shape — undefined = default to percent/book. */
  progressDisplay?: UserPreferences['progressDisplay']
  percentComplete: number
  timeRemainingLabel: string
  isLearned: boolean
  currentPage: number
  totalPages: number
  /** Absolute page number across the whole book (optional fallbacks). */
  absoluteCurrentPage?: number
  absoluteTotalPages?: number
  bookCurrentPage?: number
  bookTotalPages?: number
  /** Per-scope numbers; if omitted we fall back to book-level values. */
  chapterPercentComplete?: number
  chapterTimeLabel?: string
  sectionPercentComplete?: number
  sectionTimeLabel?: string
  locationCurrent?: number
  locationTotal?: number
  locationCurrentChapter?: number
  locationTotalChapter?: number
}

export function formatProgressLabel(args: ProgressInputs): string {
  const pd = args.progressDisplay || { metric: 'percent', scope: 'book' }
  const scope = pd.scope
  const metric = pd.metric

  const pct = scope === 'chapter'
    ? (args.chapterPercentComplete ?? Math.round(((args.currentPage + 1) / Math.max(args.totalPages, 1)) * 100))
    : scope === 'section'
      ? (args.sectionPercentComplete ?? args.percentComplete)
      : args.percentComplete
  const time = scope === 'chapter'
    ? (args.chapterTimeLabel ?? args.timeRemainingLabel)
    : scope === 'section'
      ? (args.sectionTimeLabel ?? args.timeRemainingLabel)
      : args.timeRemainingLabel
  const scopeLabel = scope === 'chapter' ? 'ch' : scope === 'section' ? 'sec' : ''

  if (metric === 'page') {
    if (scope === 'book' && args.bookCurrentPage && args.bookTotalPages) {
      return `${args.bookCurrentPage} / ${args.bookTotalPages}`
    }
    const pg = args.absoluteCurrentPage ?? (args.currentPage + 1)
    const tot = args.absoluteTotalPages ?? args.totalPages
    return `${pg} / ${tot}${scope === 'chapter' ? ' ch' : ''}`
  }
  if (metric === 'location') {
    if (scope === 'chapter' && args.locationCurrentChapter !== undefined && args.locationTotalChapter) {
      return `§${args.locationCurrentChapter} / ${args.locationTotalChapter}`
    }
    if (args.locationCurrent !== undefined && args.locationTotal) {
      return `Loc ${args.locationCurrent} / ${args.locationTotal}`
    }
  }
  if (metric === 'time') {
    return `${time}${scopeLabel ? ` (${scopeLabel})` : ''}${!args.isLearned && args.percentComplete > 0 ? ' (est.)' : ''}`
  }
  return `${pct}%${scopeLabel ? ` ${scopeLabel}` : ''}`
}
