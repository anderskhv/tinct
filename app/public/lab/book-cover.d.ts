// Types for book-cover.js (imported by the library, the reader and Add a book's bundles).
export interface BookCover { src: string; srcSet: string | null }
export interface BookCoverInput {
  bookId: string | null | undefined
  /** The catalogue's art, or its src. */
  art?: { src?: string | null; srcSet?: string | null } | string | null
  /** An own book's kept picture (a data: URL). */
  ownCover?: string | null
}
export const PAINTED_COVER_IDS: readonly string[]
export const PAINTED_WIDTHS: Readonly<{ full: number; thumb: number }>
export function paintedCover(bookId: string | null | undefined): string | null
export function ownCoverImage(cover: unknown): string | null
export function resolveBookCover(input?: BookCoverInput): BookCover | null
export function bookCoverSrc(input?: BookCoverInput): string | null
export function paperCover(title: string, author?: string, kind?: string): HTMLCanvasElement
export function paperCoverUrl(title: string, author?: string, kind?: string): string
