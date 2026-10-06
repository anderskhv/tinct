/** The shape of a reader's own book once converted (epubEdition.ts). Types and constants only. */

export const USER_EDITION_FORMAT = 'tinct-user-edition-v1'
/** Bump when the conversion changes, so stored conversions are redone. */
export const USER_EDITION_CONVERTER = 1

export interface UserBookChapter {
  number: number
  title: string
  paragraphs: string[]
}

export interface UserBookEdition {
  format: typeof USER_EDITION_FORMAT
  converter: number
  title: string
  author: string
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
