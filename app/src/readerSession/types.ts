import type { Book, ChatMessage, EditionData } from '../types'

export type ReaderView = 'read' | 'compare' | 'chat' | 'feed' | 'cast'

export type ReaderLocationSource =
  | 'init'
  | 'cloud-restore'
  | 'local-restore'
  | 'book-open'
  | 'user'
  | 'reader-layout'
  | 'audio'
  | 'remote'

export interface ReaderLocation {
  bookId: string
  chapterNumber: number
  paragraphIndex?: number
  scrollFraction: number
  editionKey: string
  activeView: ReaderView
  source: ReaderLocationSource
  revision: number
}

export interface ReaderBookContext {
  book: Pick<Book, 'id' | 'editions'>
  editionData: Pick<EditionData, 'chapters'> | null
}

export interface ReaderSessionState {
  location: ReaderLocation
  status: 'ready' | 'switching-book' | 'loading-edition'
  pendingBookId?: string
  lastExplicitUserNavAt: number
}

export type ReaderSessionEvent =
  | { type: 'OPEN_BOOK'; bookId: string; now: number }
  | { type: 'EDITION_READY'; context: ReaderBookContext; restored?: Partial<ReaderLocation>; now: number }
  | { type: 'RESTORE_POSITION'; location: ReaderLocation; context: ReaderBookContext; source: 'cloud-restore' | 'local-restore' | 'remote'; now: number }
  | { type: 'USER_SELECT_CHAPTER'; chapterNumber: number; paragraphIndex?: number; context: ReaderBookContext; now: number }
  | { type: 'USER_NEXT_CHAPTER'; context: ReaderBookContext; now: number }
  | { type: 'USER_PREV_CHAPTER'; context: ReaderBookContext; now: number }
  | { type: 'READER_LAYOUT_READY'; page: number; totalPages: number; firstVisibleParagraph?: number; view: ReaderView; context: ReaderBookContext; now: number }
  | { type: 'AUDIO_PARAGRAPH_CHANGED'; chapterNumber: number; paragraphIndex: number; context: ReaderBookContext; now: number }
  | { type: 'AUDIO_CHAPTER_COMPLETED'; context: ReaderBookContext; now: number }

export interface ReaderPersistenceSnapshot {
  location: ReaderLocation
  canWrite: boolean
  reason?: string
}

export interface ChatMessageWithLocation extends ChatMessage {
  bookId: string
  chapterNumber: number
  paragraphIndex?: number
}
