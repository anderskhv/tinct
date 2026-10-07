// Types for public-books.js (imported by the reader, the library bundles and the Worker).
type KeyStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface CatalogueEdition { source: string; sourceUrl?: string | null; epubUrl: string | null; licence?: string }
export interface CataloguePerson { name: string; birthYear?: number | null; deathYear?: number | null; aliases?: string[] }
export interface CatalogueWork {
  id: string
  title: string
  subtitle?: string | null
  language?: string[]
  popularity?: number
  authors?: CataloguePerson[]
  translators?: CataloguePerson[]
  subjects?: string[]
  bookshelves?: string[]
  firstPublishedYear?: number | null
  onTinct?: boolean
  tinctIds?: string[]
  editions: CatalogueEdition[]
}
export interface PublicPlacement {
  houseId: string; houseTitle: string; houseSubtitle: string; houseHue: number
  shelfId: string; shelfTitle: string; shelfSubtitle: string; shelfHue: number
}

export function signedInCookie(cookie?: string): boolean
export function addToTinctEnabled(storage?: KeyStore, signedIn?: boolean): boolean
export const MODERN_EDITIONS_FOR_EVERYONE: boolean
export function modernEditionsEnabled(storage?: KeyStore): boolean
export const PUBLIC_BOOK_PREFIX: string
export const PUBLIC_BOOK_ID: RegExp
export function isPublicBookId(id: unknown): id is string
export const WORK_ID: RegExp
export const IMPORT_SOURCES: Record<string, { name: string; hosts: string[] }>
export const EXCLUDED_SOURCES: string[]
export const IMPORT_LANGUAGES: string[]
export function sourceName(source: string | undefined): string
export function allowedSourceUrl(source: string, url: string): boolean
export function importableWork(work: CatalogueWork | null | undefined): boolean
export function publicBookId(workId: string): string | null
export function normalizeText(value: unknown): string
export function titleAuthorKey(title: string, author: string): string
export function looseTitle(title: string): { base: string; part: string | null }
export function looseTitleAuthorKey(title: string, author: string): string
export const REGISTRY_GUTENBERG_IDS: Record<string, string>
export function inTinct(work: CatalogueWork, tinctBooks: Array<{ id: string; title: string; author: string; public?: { workId?: string } }>): boolean
export function groupSearchResults<T>(input: { tinct: T[]; free: CatalogueWork[]; tinctBooks: Array<{ id: string; title: string; author: string }>; limit?: number }): { available: T[]; notYet: CatalogueWork[] }
export function freeRow(work: CatalogueWork): { title: string; author: string; source: string }
export function mergePublicBooks<C extends { books: Array<{ id: string }>; houses?: unknown[] }>(catalogue: C, entries: Array<{ id: string; shelfIds?: string[]; placement?: PublicPlacement[] }>): C
export const PUBLIC_BOOKS_INDEX_URL: string
