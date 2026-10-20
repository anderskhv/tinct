/**
 * A saved place the reader is restoring, bound to the chapter it belongs to.
 *
 * Cross-device 0:0 (20 Oct 2026): a desktop reader opening the phone's newer
 * place (Ezra 9 at 1:3) set `restorePlaceRef` for Ezra right after the chapter
 * loaded, before React committed it. The outgoing chapter's desktop paginator
 * then finished a measurement slice in that gap; its page map passed the
 * content check (the outgoing text was still current) and consumed the Ezra
 * place as its own. Ezra then opened with no place to restore, at 0:0, and the
 * reader's next note (the edition switch's `mode-change`, or the dwell) wrote
 * 0:0 to the account over the real place on every device.
 *
 * Two rules, both here so they can be tested without a browser:
 * 1. A restore target set for an incoming chapter carries that chapter's key;
 *    only that chapter's page map may consume it (`restoreTargetFor`). An
 *    untagged target belongs to the chapter on screen, as before.
 * 2. While a saved-place restore is outstanding, the reader writes no place
 *    unless the restore has landed (the settled page on screen holds it) or the
 *    reader has acted since (`holdPlaceWrite`). A restore that has not landed
 *    is retried (`restoreRetryIndex`), never saved as whatever is on screen.
 */
import { restorePageIndexForAnchor, type ChapterHearingPage } from './labHearing'
import type { LabPlaceReason } from './labPosition'

export interface LabPlaceAt {
  paragraphIndex: number
  wordIndex: number
}

/** The key a restore target is bound to: one chapter of one library book. */
export function labRestoreChapterKey(bookId: string | undefined | null, chapterNumber: number): string {
  return `${bookId || 'bible'}:${chapterNumber}`
}

const targetChapters = new WeakMap<object, string>()

/** Bind a restore target to the chapter it was resolved for. Returns the same object. */
export function restoreTargetIn<T extends LabPlaceAt>(place: T, chapterKey: string): T {
  targetChapters.set(place, chapterKey)
  return place
}

/** The chapter a restore target is bound to; undefined means the chapter on screen. */
export function restoreTargetChapter(place: LabPlaceAt | null | undefined): string | undefined {
  return place ? targetChapters.get(place) : undefined
}

/** The restore target the page map of `chapterKey` may use, or null when it belongs to another chapter. */
export function restoreTargetFor<T extends LabPlaceAt>(place: T | null | undefined, chapterKey: string): T | null {
  if (!place) return null
  const bound = targetChapters.get(place)
  return bound === undefined || bound === chapterKey ? place : null
}

/** A saved place being restored, watched until the reader shows it. */
export interface LabRestoreWatch extends LabPlaceAt {
  chapterKey: string
  /** The reader's interaction count when the restore was set. */
  interactions: number
  retries: number
}

export interface LabRestoreView {
  chapterKey: string
  /** The page map on screen is the settled (measured, full) map. */
  settled: boolean
  pages: ChapterHearingPage[]
  pageIndex: number
}

/** The settled page on screen is the page that holds the watched place. */
export function restoreLanded(watch: LabRestoreWatch, view: LabRestoreView): boolean {
  return view.settled
    && view.chapterKey === watch.chapterKey
    && view.pages.length > 0
    && restorePageIndexForAnchor(view.pages, watch) === view.pageIndex
}

/** At most this many re-restores per watched place; past it writes stay held, the page is left alone. */
export const LAB_RESTORE_RETRIES = 3

/**
 * The page to restore to again: the watched place's chapter is on screen and
 * settled but a different page is showing, and the reader has not acted.
 * Null when nothing should move.
 */
export function restoreRetryIndex(watch: LabRestoreWatch, view: LabRestoreView, interactions: number): number | null {
  if (interactions > watch.interactions || watch.retries >= LAB_RESTORE_RETRIES) return null
  if (!view.settled || view.chapterKey !== watch.chapterKey || view.pages.length === 0) return null
  const index = restorePageIndexForAnchor(view.pages, watch)
  return index === view.pageIndex ? null : index
}

/**
 * Hold this note: a saved-place restore is outstanding, it has not landed and
 * the reader has not acted since it was set. `hide` only flushes what is
 * already recorded, so it is never held.
 */
export function holdPlaceWrite(args: {
  watch: LabRestoreWatch | null
  reason: LabPlaceReason
  interactions: number
  landed: boolean
}): boolean {
  if (!args.watch || args.reason === 'hide') return false
  if (args.interactions > args.watch.interactions) return false
  return !args.landed
}
