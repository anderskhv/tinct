/**
 * "Continue from chapter 5": the place this device had read to, offered when another device has put the reader
 * back a chapter or more in the same book.
 *
 * The newest place on any device is where a book opens, backwards moves included (a deliberate re-read on another
 * device is followed). So a short visit to an earlier chapter on one device, to look something up or ask about it,
 * moves every other device back with it (17 Nov 2026: a PC in chapter 4 put a phone back from chapter 5). The rule
 * stays; the reader then shows one quiet button with the place this device itself had read to. It is an offer for
 * the page it appears on: turning the page, scrolling on, or changing chapter withdraws it.
 *
 * Chapters only. Two devices paginate differently, so the same place saved by another device is often a paragraph
 * or two earlier; inside one chapter there is nothing to offer.
 */
import type { LabBookPlace } from './labPosition'

export interface FurtherPlace {
  /** The place this device had, in the coordinates it was saved in. */
  place: LabBookPlace
  /** Library book both places belong to ('bible' for every biblical book). */
  libraryBookId: string
  /** The chapter the reader was moved to; the offer belongs to it. */
  fromChapter: number
}

/**
 * `before` is the place this device would have opened without the account's answer; `resume` is where the account's
 * answer puts the reader. An offer exists only when this device saved `before` itself, another device saved
 * `resume`, both are in one library book, and `resume` is in an earlier chapter.
 */
export function furtherPlaceHere(
  before: LabBookPlace | null | undefined,
  resume: LabBookPlace | null | undefined,
  deviceId: string,
  libraryOf: (place: LabBookPlace) => string,
): FurtherPlace | null {
  if (!before || !resume || !deviceId) return null
  if (before.deviceId !== deviceId || resume.deviceId === deviceId) return null
  const libraryBookId = libraryOf(before)
  if (libraryBookId !== libraryOf(resume)) return null
  if (!(resume.sequentialChapter < before.sequentialChapter)) return null
  return { place: before, libraryBookId, fromChapter: resume.sequentialChapter }
}

/**
 * The button's words. The Bible by its book and chapter. Any other book by its own name for the chapter, which is
 * not always its place in the file (Frankenstein opens with four letters, so its "Chapter 7" is the eleventh
 * section): "chapter 7" from "Chapter 7" or "7. The trial", a named part ("Book 8", "Letter 4", "Act 2, Scene 3")
 * as it stands, a short title without a number as it stands, else the section's number.
 */
export function furtherPlaceLabel(further: FurtherPlace, chapterTitle?: string | null): string {
  const { place, libraryBookId } = further
  if (libraryBookId === 'bible' && place.bookId !== 'bible') return `Continue from ${place.headerBook} ${place.chapterNumber}`
  const title = (chapterTitle ?? '').replace(/\s+/g, ' ').trim()
  const numbered = /^(?:chapter|kapitel)\s+([0-9]+|[IVXLC]+)\b/i.exec(title) ?? /^([0-9]+)[.:]\s/.exec(title)
  if (numbered) return `Continue from chapter ${numbered[1]}`
  const named = /^((?:Book|Part|Canto|Letter|Volume)\s+(?:[0-9]+|[IVXLC]+)|Act\s+(?:[0-9]+|[IVXLC]+),\s*Scene\s+(?:[0-9]+|[IVXLC]+))\b/i.exec(title)
  if (named) return `Continue from ${named[1]}`
  if (title && title.length <= 32 && !/[0-9]/.test(title)) return `Continue from ${title}`
  return `Continue from chapter ${place.chapterNumber}`
}

/**
 * Where the button lands in the edition now open: the saved word in the edition it was saved in; the saved
 * paragraph where both editions line up paragraph by paragraph; else the chapter's first word. A word index is
 * never carried into another edition's text.
 */
export function furtherPlaceTarget(
  further: FurtherPlace,
  openEditionKey: string | null | undefined,
  aligned: (editionKey: string) => boolean,
): { chapterNumber: number; paragraphIndex: number; wordIndex: number } {
  const { place } = further
  const saved = place.primaryEditionKey
  const same = !saved || saved === openEditionKey
  const paragraph = same || (!!openEditionKey && aligned(saved) && aligned(openEditionKey))
  return { chapterNumber: place.sequentialChapter, paragraphIndex: paragraph ? place.paragraphIndex : 0, wordIndex: same ? place.wordIndex : 0 }
}
