import { highlightWrittenAt } from './labHighlightContentMigration'
import { isLabChapterNote, type LabHighlight } from './labHighlights'

/**
 * How Contents → Highlights & notes lists marks: by creation time, oldest
 * first unless Newest first is on (Anders, 15 Oct: "either chronological or
 * newest first"). Book order only breaks ties.
 */
export type LabHighlightOrder = 'oldest' | 'newest'

/** Creation time: from the id (`hl-<ms>-…`), else the last change. */
export function highlightCreatedAt(highlight: Pick<LabHighlight, 'id' | 'updatedAt'>): number {
  return highlightWrittenAt(highlight) ?? highlight.updatedAt ?? 0
}

const byId = (a: LabHighlight, b: LabHighlight) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

/**
 * Book order (the tie-break for marks made in the same millisecond): chapter (by its place in the book when `chapterPlace` is given,
 * else its number), then position in the chapter. A chapter note comes after
 * the chapter's passage highlights.
 */
export function compareHighlightsInBookOrder(chapterPlace: (chapterNumber: number) => number = n => n) {
  return (a: LabHighlight, b: LabHighlight): number => (
    chapterPlace(a.chapterNumber) - chapterPlace(b.chapterNumber)
    || Number(isLabChapterNote(a)) - Number(isLabChapterNote(b))
    || a.paragraphIndex - b.paragraphIndex
    || a.fromWord - b.fromWord
    || a.endParagraphIndex - b.endParagraphIndex
    || a.toWord - b.toWord
    || highlightCreatedAt(a) - highlightCreatedAt(b)
    || byId(a, b)
  )
}

export function orderLabHighlights(list: LabHighlight[], order: LabHighlightOrder, chapterPlace?: (chapterNumber: number) => number): LabHighlight[] {
  const bookOrder = compareHighlightsInBookOrder(chapterPlace)
  const direction = order === 'newest' ? -1 : 1
  return [...list].sort((a, b) => direction * (highlightCreatedAt(a) - highlightCreatedAt(b)) || bookOrder(a, b))
}

export function highlightHasNote(highlight: Pick<LabHighlight, 'note'>): boolean {
  return Boolean(highlight.note?.trim())
}

/** "Notes only": passage highlights carrying a note, and chapter notes. */
export function labNotesOnly(list: LabHighlight[]): LabHighlight[] {
  return list.filter(highlightHasNote)
}
