/**
 * Listening is reading: while the reader follows the voice, the voice's place
 * is the reader's place, and it is saved as one.
 *
 * A reader's report (26 Nov 2026): fifteen minutes of The Master and Margarita
 * heard on a phone, and the book reopened on the page where Play had been
 * pressed. The page followed the voice, but nothing wrote the place: it was
 * saved at Play, at the reader's own Pause button and at a chapter's end, and
 * nowhere in between. A phone that locks, a pause from the lock screen or the
 * headphones, a call, or a tab the phone discards all end the listening
 * without that button, and every word heard since Play was lost.
 *
 * Three rules, here so they can be tested without a browser:
 * 1. The voice is the reader's place only while the reader follows it: the
 *    player shows the voice on the page, in the chapter on screen, the reader
 *    has not turned away from it, no chapter change is under way, and the page
 *    has taken the voice's word as its own place (`voiceReadingPlace`).
 *    Anything else is not the voice's to save.
 * 2. While it plays, that place is saved each time the voice reaches a new
 *    page (a new paragraph where the reader scrolls), no more often than
 *    `LISTEN_PLACE_MIN_GAP_MS` (`voiceSaveStep`): a page that dies with no
 *    warning reopens within a page of the last word heard.
 * 3. When audio stops without the reader's own button, and when the page goes
 *    out of sight, the word being read is saved at once, unless it is already
 *    the place last saved (`sameListenPlace`): a page left twice writes once.
 */
import type { FollowTarget } from './labFollow'
import { pageIndexForPlace, type ChapterHearingPage } from './labHearing'

/** The shortest time between two saves made as the voice reads on. */
export const LISTEN_PLACE_MIN_GAP_MS = 20_000

/** One chapter of one library book, as the player and the page each name theirs. */
export interface ListenChapter {
  bookId: string
  chapterNumber: number
}

/** A place in the form the position store is noted with. */
export interface ListenPlace {
  sequentialChapter: number
  paragraphIndex: number
  wordIndex: number
}

/**
 * The voice's place when it is the reader's place, else null.
 *
 * `place` is the reader's place as the page keeps it. The page sets it to the
 * voice's word only when it accepts that word (not while the reader browses,
 * not a start-of-chapter blip mid-chapter), so a place that differs from the
 * voice's word means the page has not taken it, and it is not saved.
 */
export function voiceReadingPlace(args: {
  follow: FollowTarget
  place: { paragraphIndex: number; wordIndex: number }
  /** The player shows the voice on the page: not behind Ask or the other edition, not a start still loading. */
  following: boolean
  /** The reader turned pages or scrolled away from the voice. */
  browsing: boolean
  /** A chapter change is under way: the page and the voice are between chapters. */
  changingChapter: boolean
  /** The chapter the voice is reading. */
  listening: ListenChapter
  /** The chapter on screen. */
  shown: ListenChapter
}): ListenPlace | null {
  if (!args.following || args.browsing || args.changingChapter) return null
  if (args.listening.bookId !== args.shown.bookId || args.listening.chapterNumber !== args.shown.chapterNumber) return null
  const follow = args.follow
  if (follow.kind === 'none') return null
  if (args.place.paragraphIndex !== follow.paragraphIndex) return null
  if (follow.kind === 'word' && args.place.wordIndex !== follow.wordIndex) return null
  return {
    sequentialChapter: args.shown.chapterNumber,
    paragraphIndex: args.place.paragraphIndex,
    wordIndex: args.place.wordIndex,
  }
}

/**
 * The step of the text the voice is in: its page where the reader turns pages
 * (`pages`), its paragraph where the reader scrolls (`pages` null). The page
 * index rides along so the saved tuple names the page that holds the word.
 */
export function voiceStep(place: ListenPlace, pages: ChapterHearingPage[] | null): { key: string; pageIndex: number | null } {
  if (!pages) return { key: `${place.sequentialChapter}:paragraph:${place.paragraphIndex}`, pageIndex: null }
  const pageIndex = pageIndexForPlace(pages, place.paragraphIndex, place.wordIndex)
  return { key: `${place.sequentialChapter}:page:${pageIndex}`, pageIndex }
}

/** The step last saved (or first seen), and when. */
export interface ListenSaveMark {
  key: string
  at: number
}

/**
 * One step of saving while the voice plays. `mark` is null when the voice has
 * just started: Play saved its own place, so the first step is only
 * remembered. After that a new step is saved once `LISTEN_PLACE_MIN_GAP_MS`
 * has passed since the last save; a step reached sooner is saved by a later
 * word, as soon as the gap is over.
 */
export function voiceSaveStep(mark: ListenSaveMark | null, key: string, now: number): { mark: ListenSaveMark; save: boolean } {
  if (!mark) return { mark: { key, at: now }, save: false }
  if (mark.key === key || now - mark.at < LISTEN_PLACE_MIN_GAP_MS) return { mark, save: false }
  return { mark: { key, at: now }, save: true }
}

export function sameListenPlace(a: ListenPlace | null, b: ListenPlace | null): boolean {
  return !!a && !!b && a.sequentialChapter === b.sequentialChapter
    && a.paragraphIndex === b.paragraphIndex && a.wordIndex === b.wordIndex
}
