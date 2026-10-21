/**
 * The margin view's place, written back to the account (Anders, 20 Oct 2026: margin view becomes the default way to
 * read on the desktop, so it keeps the book reader's place). The frame reports where it is; this gate decides what of
 * that is a place to write, by the rules the book reader keeps (CLAUDE.md "Invariants", labRestoreTarget.ts):
 *
 * - **Loading.** Nothing is written until the frame has opened the book and restored its place (the `open` report),
 *   nor while the page is moving it to another device's place.
 * - **The restore.** While the place it restored to is outstanding, nothing is written unless it has landed (the view
 *   still holds that word: the frame's previewSpot) or the reader has acted since (`holdPlaceWrite`). A landed restore
 *   writes the restored word itself, never the first word of its line, so a round trip never drifts.
 * - **Backward.** A place before the last one written needs a reader action since that write: a reflow (a font, the
 *   width) that moved the view up is not a place.
 * - **The tuple.** Every place is a paragraph and word of this book's edition, checked against its text
 *   (marginPreviewAnchors); the book and edition are the preview's own.
 *
 * The writes themselves go through the book reader's store (useLabPositionSync: its guards, the controller, the
 * account's record). Pure: no storage, no timers.
 */
import type { LabPlaceReason } from '../labPosition'
import { holdPlaceWrite, labRestoreChapterKey, type LabRestoreWatch } from '../labRestoreTarget'
import { anchorOfSpot, sameSpot, spotBefore, type BookAnchor, type MarginSpot } from './marginPreviewAnchors'
import type { MarginPreviewChapter } from './marginPreviewModel'

/** What the frame tells the page (js/tinct-book.js). */
export interface MarginPlaceReport {
  /** `open`: the book is open and its place restored (again, after a move the page asked for). `move`: the view moved. */
  kind: 'open' | 'move'
  /** Where the view is: the restored word while the view has not moved since, else the top of the view. */
  spot: MarginSpot | null
  /** With `open`: the place the frame restored to (null: none, the book's start or a fraction). */
  target?: MarginSpot | null
  /** The reader's taps, keys, wheels and touches in the frame so far. */
  interactions: number
}

export interface MarginPlaceNote {
  reason: LabPlaceReason
  at: BookAnchor
  spot: MarginSpot
  /** The chapter the reader read to its end on the way here (scrolled on into the next chapter), if any. */
  finished?: number
}

export interface MarginPlaceGate {
  /** The report's place to write, or null. */
  decide(report: MarginPlaceReport): MarginPlaceNote | null
  /**
   * The page is moving the view to a place the account already holds (another device's): nothing is written until
   * the frame reports it open again, and that place, landed, is not written back.
   */
  expectRestore(spot: MarginSpot): void
  /** True once the book is open and its place restored. */
  opened(): boolean
  /** The place last written (or adopted from the account). */
  last(): MarginSpot | null
  /** The restore being watched. */
  watch(): LabRestoreWatch | null
  /** The most reader actions any report has counted. */
  interactions(): number
}

export function createMarginPlaceGate(opts: { bookId: string; chapters: MarginPreviewChapter[] }): MarginPlaceGate {
  const { bookId, chapters } = opts
  let isOpen = false
  let watch: (LabRestoreWatch & { spot: MarginSpot }) | null = null
  let last: { spot: MarginSpot; interactions: number } | null = null
  let openWritten = false
  let adopting: MarginSpot | null = null
  let seen = 0

  const keyOf = (spot: MarginSpot) => labRestoreChapterKey(bookId, chapters[spot.page - 1]?.number ?? 0)

  return {
    opened: () => isOpen,
    last: () => last?.spot ?? null,
    watch: () => watch,
    interactions: () => seen,
    expectRestore(spot) { isOpen = false; adopting = spot; watch = null },
    decide(report) {
      seen = Math.max(seen, report.interactions)
      if (report.kind === 'open') {
        isOpen = true
        const target = report.target && anchorOfSpot(chapters, report.target) ? report.target : null
        watch = target ? { paragraphIndex: target.para, wordIndex: target.word, chapterKey: keyOf(target), interactions: report.interactions, retries: 0, spot: target } : null
      }
      // Loading (or being moved to another device's place): no place yet.
      if (!isOpen || !report.spot) return null
      let spot = report.spot
      let landedRestore = false
      if (watch) {
        const landed = sameSpot(spot, watch.spot)
        if (holdPlaceWrite({ watch, reason: report.kind === 'open' ? 'open-book' : 'page-turn', interactions: report.interactions, landed })) return null
        // Landed, nothing done since: the restored word itself. Acted since: the reader's own place from now on.
        if (report.interactions > watch.interactions) watch = null
        else { spot = watch.spot; landedRestore = true }
      }
      const at = anchorOfSpot(chapters, spot)
      if (!at) return null
      spot = { page: spot.page, para: at.paragraphIndex, word: at.wordIndex }
      // Another device's place, landed with nothing done since: the account has it already.
      if (adopting) {
        const adopted = sameSpot(spot, adopting) && (!last || report.interactions <= last.interactions)
        adopting = null
        if (adopted) { last = { spot, interactions: report.interactions }; return null }
      }
      const acted = !last || report.interactions > last.interactions
      if (last && sameSpot(spot, last.spot)) return null
      // Backward without a reader action since the last write: a reflow, not a place.
      if (last && spotBefore(spot, last.spot) && !acted) return null
      // The opening write: the restore as it lands (at its `open` report, or a later one once a reflow has settled).
      const reason: LabPlaceReason = !openWritten && (report.kind === 'open' || landedRestore) ? 'open-book' : 'page-turn'
      const finished = last && acted && reason === 'page-turn' && spot.page === last.spot.page + 1 ? chapters[last.spot.page - 1]?.number : undefined
      if (reason === 'open-book') openWritten = true
      last = { spot, interactions: report.interactions }
      return { reason, at, spot, ...(finished ? { finished } : {}) }
    },
  }
}
