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
 */
export const USER_EDITION_CONVERTER = 6
/** The rules every book converted before USER_EDITION_CONVERTER was converted with. */
export const LEGACY_EDITION_CONVERTER = 5
/** Every rule set a stored conversion may have been made with; each stays readable as it is. */
export const USER_EDITION_CONVERTERS: readonly number[] = [LEGACY_EDITION_CONVERTER, USER_EDITION_CONVERTER]
/** The rules a PDF's text layer is converted with (pdf-text.js), for editions with `source: 'pdf'`. */
export const PDF_TEXT_CONVERTER = 1
/** The rules recognised text of a scanned PDF is assembled with (ocrEdition.ts), for editions with `source: 'ocr'`. */
export const OCR_EDITION_FORMAT = 1

/** What an edition was made from: an EPUB (also when absent), a PDF's text layer, or a scanned PDF's recognised text. */
export type UserEditionSource = 'epub' | 'pdf' | 'ocr'

/** The general paragraph kinds every edition may carry (types/index.ts). */
export type UserBookParagraphKind = ParagraphKind

/** A chapter exactly as a built-in edition's chapter JSON has it: text, kinds, links, figures and its own writer. */
export type UserBookChapter = Pick<Chapter, 'number' | 'title' | 'paragraphs' | 'kinds' | 'links' | 'figures' | 'author'> & {
  /** A PDF's editions only: the 1-based PDF page each paragraph starts on. */
  pages?: number[]
  /** A PDF's editions only: a page that begins inside a paragraph, as [paragraph, word, page]. */
  pageBreaks?: Array<[number, number, number]>
}

export interface UserBookEdition {
  format: typeof USER_EDITION_FORMAT
  converter: number
  /** What it was made from; absent for an EPUB (every edition made before PDFs had one). */
  source?: UserEditionSource
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

/** The rule sets an edition from `source` may have been made with. */
export function editionConverters(source: UserEditionSource | undefined): readonly number[] {
  if (source === 'pdf') return [PDF_TEXT_CONVERTER]
  if (source === 'ocr') return [OCR_EDITION_FORMAT]
  return USER_EDITION_CONVERTERS
}

export function usableUserEdition(value: unknown): value is UserBookEdition {
  const edition = value as UserBookEdition | null
  if (!edition || edition.format !== USER_EDITION_FORMAT) return false
  if (edition.source !== undefined && edition.source !== 'epub' && edition.source !== 'pdf' && edition.source !== 'ocr') return false
  return editionConverters(edition.source).includes(edition.converter) && Array.isArray(edition.chapters) && edition.chapters.length > 0
}
