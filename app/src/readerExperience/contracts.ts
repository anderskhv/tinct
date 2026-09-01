import type {
  Book,
  Edition,
  EditionKey,
  HighlightColor,
  ReadingPosition,
  Section,
  UserPreferences,
} from '../types'

export type ReaderLayout = 'phone' | 'desktop'
export type ReaderMode = 'reading' | 'hearing' | 'talking'
export type ReaderNavigationKind = 'chapters' | 'sections' | 'bible-tree'

export interface ReaderChapterDocument {
  number: number
  title: string
  paragraphs: string[]
  compareParagraphs: string[]
}

export interface ReaderDocument {
  book: Pick<Book, 'id' | 'title' | 'author'>
  primaryEdition: Edition
  compareEdition?: Edition
  chapter: ReaderChapterDocument
  chapters: Array<{ number: number; title: string }>
  sections?: Section[]
}

export interface ReaderCapabilities {
  canCompare: boolean
  canListen: boolean
  canFollowWords: boolean
  hasCast: boolean
  navigationKind: ReaderNavigationKind
}

/**
 * Stable application-shell boundary for reader implementations. The production
 * app can adapt its existing hooks to this contract without making the reader
 * own auth, storage, billing, analytics, or book loading.
 */
export interface ReaderExperienceServices {
  book: Book
  document: ReaderDocument
  capabilities: ReaderCapabilities
  preferences: UserPreferences
  position: ReadingPosition | null
  authenticated: boolean
  online: boolean
  canUse(feature: 'compare' | 'listen' | 'ask' | 'sync'): boolean
  navigate(input: { chapterNumber: number; paragraphIndex?: number }): void
  selectBook(bookId: string): void
  selectEdition(input: { primary: EditionKey; compare?: EditionKey }): void
  updatePreferences(patch: Partial<UserPreferences>): void
  addHighlight(input: {
    chapterNumber: number
    paragraphIndex: number
    startOffset: number
    endOffset: number
    text: string
    color: HighlightColor
  }): void
  ask(input: { text: string; highlightedText?: string }): Promise<void>
  track(event: string, payload?: Record<string, unknown>): void
}
