/** The shape of a reader's own book once converted (epubEdition.ts). Types and constants only. */
import type { Chapter, ParagraphKind } from '../../types'

export const USER_EDITION_FORMAT = 'tinct-user-edition-v1'
/**
 * The conversion rules a new conversion uses (epubEdition.ts `rules`). Rules
 * that cut chapters or paragraphs differently get a new number here, used for
 * books converted from then on only: a book converted earlier keeps its
 * stored conversion, and when it must be converted again on a device it is
 * converted under the rules it was first converted with
 * (userBookStore.ts `conversionRules`), so its chapters, paragraphs and every
 * reading place stay exactly as they are. A fix that changes no chapter or
 * paragraph is applied in memory on read instead (chapterAuthors.ts
 * `healUserEdition`).
 *
 * 6 (2026-10-08): act, part and story titles kept, contents labels for bare
 * numbers, verse and poem titles, speakers, footnote backlinks and Wikisource
 * export pages left out.
 *
 * 7 (2026-10-09): a document that holds the printed contents and the book's text
 * together (a short book of poems in one document) is kept, not left out as a
 * contents page (epubEdition.ts contentsMatter).
 */
export const USER_EDITION_CONVERTER = 7
/** The rules every book converted before USER_EDITION_CONVERTER was converted with. */
export const LEGACY_EDITION_CONVERTER = 5
/** Every rule set a stored conversion may have been made with; each stays readable as it is. */
export const USER_EDITION_CONVERTERS: readonly number[] = [LEGACY_EDITION_CONVERTER, 6, USER_EDITION_CONVERTER]

/** The general paragraph kinds every edition may carry (types/index.ts). */
export type UserBookParagraphKind = ParagraphKind

/** A chapter exactly as a built-in edition's chapter JSON has it: text, kinds, links, figures and its own writer. */
export type UserBookChapter = Pick<Chapter, 'number' | 'title' | 'paragraphs' | 'kinds' | 'links' | 'figures' | 'author'>

export interface UserBookEdition {
  format: typeof USER_EDITION_FORMAT
  converter: number
  title: string
  /** The book's subtitle from its metadata, if it names one. */
  subtitle?: string
  author: string
  /** Writing by several authors (an essay collection, an anthology): see `EditionData.collection`. */
  collection?: true
  /**
   * Chapter bylines were read at conversion. An older conversion without it
   * is healed from its stored text (chapterAuthors.ts healChapterAuthors), never
   * converted again for them: converting again can change its chapters and so
   * move a reader's place.
   */
  bylines?: true
  /**
   * A play whose speeches open on their speaker ("NORA. Hide the Christmas
   * Tree…"): the reader sets each speaker as a label, as in Tinct's own plays.
   */
  speakers?: true
  /** The book's own language tag (`dc:language`), possibly empty. */
  language: string
  chapters: UserBookChapter[]
  /** Pictures left out of the text. */
  droppedImages: number
}

export function usableUserEdition(value: unknown): value is UserBookEdition {
  const edition = value as UserBookEdition | null
  return !!edition && edition.format === USER_EDITION_FORMAT && USER_EDITION_CONVERTERS.includes(edition.converter)
    && Array.isArray(edition.chapters) && edition.chapters.length > 0
}
