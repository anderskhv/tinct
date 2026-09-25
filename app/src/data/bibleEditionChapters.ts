/**
 * Which Bible chapters an edition has, and where editions number a passage
 * differently.
 *
 * Every Bible edition shares one chapter numbering: Genesis 1 = 1 …
 * Revelation 22 = 1189, and saved places, finished chapters, conversations,
 * highlights and the cast are keyed by it. The 73-book WEB Catholic edition
 * (scripts/build-bible-webc.py) keeps that numbering for the chapters it
 * shares with the 66-book editions (its Greek Esther and Greek Daniel are
 * Esther and Daniel) and numbers the chapters only it has — Tobit, Judith,
 * 1–2 Maccabees, Wisdom, Sirach, Baruch, Daniel 13–14 — 1190–1328. It reads
 * them in the Catholic order, so moving between chapters follows the list,
 * never number + 1.
 */
export const BIBLE_SHARED_CHAPTERS = 1189

const CHAPTER_COUNT: Record<string, number> = { 'webc-en': 1328 }

/** Editions translated from the Greek Esther and Greek Daniel, with their additions. */
const GREEK_ADDITIONS = new Set(['webc-en'])

/** Greek Daniel 3 inserts the Prayer of Azariah and the Song of the Three as 3:24–90; its 3:91–97 are Daniel 3:24–30. */
const DANIEL_3 = 853
/** Esther 1–10. The Greek additions sit inside verses (1:1, 3:13, 8:13) and 5:1–2 is rewritten, so a partial selection cannot be carried across. */
const ESTHER = { from: 427, to: 436 }

export function bibleEditionChapterCount(editionKey: string): number {
  return CHAPTER_COUNT[editionKey] ?? BIBLE_SHARED_CHAPTERS
}

export function bibleEditionHasChapter(editionKey: string, chapterNumber: number): boolean {
  return Number.isInteger(chapterNumber) && chapterNumber >= 1 && chapterNumber <= bibleEditionChapterCount(editionKey)
}

/** One edition has the Greek text of this chapter and the other the Hebrew. */
function greekAgainstHebrew(a: string, b: string): boolean {
  return a !== b && GREEK_ADDITIONS.has(a) !== GREEK_ADDITIONS.has(b)
}

/** Whether the same verse number is the same passage in both editions throughout this chapter. */
export function bibleVerseNumbersCorrespond(a: string, b: string, chapterNumber: number): boolean {
  return !(chapterNumber === DANIEL_3 && greekAgainstHebrew(a, b))
}

/** Whether a highlight made in one edition may be shown in the other: by exact wording or by verse. */
export function bibleHighlightsCarryAcross(a: string, b: string, chapterNumber: number): boolean {
  if (!greekAgainstHebrew(a, b)) return true
  return chapterNumber !== DANIEL_3 && (chapterNumber < ESTHER.from || chapterNumber > ESTHER.to)
}
