/** The shape of a reader's own book once converted (epubEdition.ts). Types and constants only. */
import type { Chapter, ParagraphKind } from '../../types'

export const USER_EDITION_FORMAT = 'tinct-user-edition-v1'
/** Bump when the conversion changes, so stored conversions are redone. */
export const USER_EDITION_CONVERTER = 6

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
  /** The book's own language tag (`dc:language`), possibly empty. */
  language: string
  chapters: UserBookChapter[]
  /** Pictures left out of the text. */
  droppedImages: number
}

export function usableUserEdition(value: unknown): value is UserBookEdition {
  const edition = value as UserBookEdition | null
  return !!edition && edition.format === USER_EDITION_FORMAT && edition.converter === USER_EDITION_CONVERTER
    && Array.isArray(edition.chapters) && edition.chapters.length > 0
}
