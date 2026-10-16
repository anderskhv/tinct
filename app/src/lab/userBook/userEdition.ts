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
/**
 * Where an edition's text comes from: an EPUB's own text (the default, when
 * absent), a text PDF's text layer (addbooks/web/src/js/pdf-text.js, "Tinct
 * text"), or text recognised from a scanned PDF's page images (OCR, R2).
 */
export type UserEditionSource = 'epub' | 'pdf' | 'ocr'
/**
 * The rules a PDF's Tinct text is converted with (pdf-text.js
 * PDF_TEXT_CONVERTER). The same file converts to the same chapters, paragraphs
 * and words on every device; rules that change any of them get a new number,
 * and a place records the number it was read under, like an EPUB's.
 * 2 (16 Oct 2026): an indented abstract runs on as one paragraph, numbered
 * subheadings stand alone, figure labels and table cells leave the text. A
 * conversion under 1 is made again; a place read in it moves by its PDF page
 * (pdfEditions.ts readPdfTextPlace).
 * 3 (16 Oct 2026): formulas, figures and tables stand in the text as crops of
 * their page (`figures`, kept on this device like an EPUB's pictures).
 */
export const PDF_TEXT_CONVERTER = 3
/**
 * The format of a recognised (OCR) edition assembled in the account (§3 of the PDF editions plan).
 * 2 (15 Oct 2026): captions and algorithm boxes kept, a paper's numbered sections as chapters.
 * Editions assembled under 1 stay readable as they are.
 */
export const OCR_EDITION_FORMAT = 2
/** The rule sets each source's stored editions may have been made with. */
export const EDITION_CONVERTERS: Readonly<Record<UserEditionSource, readonly number[]>> = {
  epub: USER_EDITION_CONVERTERS,
  pdf: [PDF_TEXT_CONVERTER],
  ocr: [1, OCR_EDITION_FORMAT],
}
/** The rules a new conversion from each source uses. */
export const CURRENT_CONVERTER: Readonly<Record<UserEditionSource, number>> = { epub: USER_EDITION_CONVERTER, pdf: PDF_TEXT_CONVERTER, ocr: OCR_EDITION_FORMAT }
/** An edition's source; an edition without one is an EPUB's. */
export const editionSource = (edition: { source?: unknown } | null | undefined): UserEditionSource =>
  edition?.source === 'pdf' || edition?.source === 'ocr' ? edition.source : 'epub'

/** The general paragraph kinds every edition may carry (types/index.ts). */
export type UserBookParagraphKind = ParagraphKind

/** A chapter exactly as a built-in edition's chapter JSON has it: text, kinds, links, figures and its own writer. */
export type UserBookChapter = Pick<Chapter, 'number' | 'title' | 'paragraphs' | 'kinds' | 'links' | 'figures' | 'author'> & {
  /** A PDF's Tinct text: the page (1-based) each paragraph starts on. */
  pages?: number[]
  /** A PDF's Tinct text: where a paragraph runs onto a later page, as [paragraph, word, page]. */
  pageBreaks?: Array<[number, number, number]>
  /** A PDF's Tinct text: the paragraph where the chapter's notes (collected from the pages' feet) begin. */
  notes?: number
}

export interface UserBookEdition {
  format: typeof USER_EDITION_FORMAT
  converter: number
  /** Where the text comes from (absent: an EPUB). */
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
  /**
   * Recognised text only (`source: 'ocr'`): how many pages were recognised,
   * how many of them are set in two or more columns and how many carry
   * equations, which decide the edition it opens in (ocrEdition.ts ocrDefaultEdition).
   */
  ocrLayout?: { pages: number; columns: number; equations: number }
}

/** The rule sets an edition from `source` may have been made with (absent: an EPUB). */
export function editionConverters(source: UserEditionSource | undefined): readonly number[] {
  return EDITION_CONVERTERS[source ?? 'epub']
}

/**
 * A stored edition this code reads as it is: of a known source and a rule set
 * that source knows. `source`, when given, is the source the book needs (an
 * EPUB's record never opens a PDF's text, nor the other way round; a PDF may
 * open its recognised text).
 */
export function usableUserEdition(value: unknown, source?: UserEditionSource): value is UserBookEdition {
  const edition = value as UserBookEdition | null
  if (!edition || edition.format !== USER_EDITION_FORMAT) return false
  if (edition.source !== undefined && edition.source !== 'epub' && edition.source !== 'pdf' && edition.source !== 'ocr') return false
  const from = editionSource(edition)
  if (source && from !== source && !(source === 'pdf' && from === 'ocr')) return false
  return editionConverters(from).includes(edition.converter) && Array.isArray(edition.chapters) && edition.chapters.length > 0
}
