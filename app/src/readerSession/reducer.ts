import type { ReaderBookContext, ReaderLocation, ReaderSessionEvent, ReaderSessionState } from './types'

function chapterCount(context: ReaderBookContext): number {
  return context.editionData?.chapters.length ?? 0
}

function paragraphCount(context: ReaderBookContext, chapterNumber: number): number {
  const chapter = context.editionData?.chapters.find(ch => ch.number === chapterNumber)
  return chapter?.paragraphs.length || chapter?.paragraphCount || 0
}

export function isValidLocation(location: Pick<ReaderLocation, 'bookId' | 'chapterNumber' | 'paragraphIndex' | 'editionKey'>, context: ReaderBookContext): boolean {
  if (location.bookId !== context.book.id) return false
  if (!context.book.editions.some(ed => ed.key === location.editionKey)) return false
  const totalChapters = chapterCount(context)
  if (totalChapters <= 0) return false
  if (location.chapterNumber < 1 || location.chapterNumber > totalChapters) return false
  if (location.paragraphIndex !== undefined) {
    const totalParagraphs = paragraphCount(context, location.chapterNumber)
    if (totalParagraphs <= 0) return false
    if (location.paragraphIndex < 0 || location.paragraphIndex >= totalParagraphs) return false
  }
  return true
}

function clampScrollFraction(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function nextRevision(state: ReaderSessionState): number {
  return state.location.revision + 1
}

function withLocation(state: ReaderSessionState, patch: Partial<ReaderLocation>, source: ReaderLocation['source']): ReaderSessionState {
  return {
    ...state,
    status: 'ready',
    pendingBookId: undefined,
    location: {
      ...state.location,
      ...patch,
      source,
      revision: nextRevision(state),
    },
  }
}

function firstEditionKey(context: ReaderBookContext): string {
  return context.book.editions[0]?.key ?? 'original-en'
}

export function initialReaderSession(location: Omit<ReaderLocation, 'source' | 'revision'>): ReaderSessionState {
  return {
    location: { ...location, source: 'init', revision: 0 },
    status: 'ready',
    lastExplicitUserNavAt: 0,
  }
}

export function readerSessionReducer(state: ReaderSessionState, event: ReaderSessionEvent): ReaderSessionState {
  switch (event.type) {
    case 'OPEN_BOOK':
      if (event.bookId === state.location.bookId) return state
      return {
        ...state,
        status: 'switching-book',
        pendingBookId: event.bookId,
      }

    case 'EDITION_READY': {
      const restored = event.restored
      const base: ReaderLocation = {
        bookId: event.context.book.id,
        chapterNumber: restored?.chapterNumber ?? 1,
        paragraphIndex: restored?.paragraphIndex,
        scrollFraction: clampScrollFraction(restored?.scrollFraction ?? 0),
        editionKey: restored?.editionKey ?? firstEditionKey(event.context),
        activeView: restored?.activeView ?? state.location.activeView,
        source: 'book-open',
        revision: nextRevision(state),
      }
      if (!isValidLocation(base, event.context)) {
        return {
          ...state,
          status: 'ready',
          pendingBookId: undefined,
          location: {
            ...base,
            chapterNumber: 1,
            paragraphIndex: undefined,
            scrollFraction: 0,
          },
        }
      }
      return { ...state, status: 'ready', pendingBookId: undefined, location: base }
    }

    case 'RESTORE_POSITION':
      if (!isValidLocation(event.location, event.context)) return state
      return {
        ...state,
        status: 'ready',
        pendingBookId: undefined,
        location: {
          ...event.location,
          scrollFraction: clampScrollFraction(event.location.scrollFraction),
          source: event.source,
          revision: nextRevision(state),
        },
      }

    case 'USER_SELECT_CHAPTER': {
      const next = {
        bookId: state.location.bookId,
        chapterNumber: event.chapterNumber,
        paragraphIndex: event.paragraphIndex,
        editionKey: state.location.editionKey,
      }
      if (state.status !== 'ready' || !isValidLocation(next, event.context)) return state
      return {
        ...withLocation(state, {
          chapterNumber: event.chapterNumber,
          paragraphIndex: event.paragraphIndex,
          scrollFraction: event.paragraphIndex === undefined ? 0 : state.location.scrollFraction,
        }, 'user'),
        lastExplicitUserNavAt: event.now,
      }
    }

    case 'USER_NEXT_CHAPTER': {
      if (state.status !== 'ready') return state
      const total = chapterCount(event.context)
      if (state.location.chapterNumber >= total) return state
      return {
        ...withLocation(state, {
          chapterNumber: state.location.chapterNumber + 1,
          paragraphIndex: undefined,
          scrollFraction: 0,
        }, 'user'),
        lastExplicitUserNavAt: event.now,
      }
    }

    case 'USER_PREV_CHAPTER': {
      if (state.status !== 'ready' || state.location.chapterNumber <= 1) return state
      return {
        ...withLocation(state, {
          chapterNumber: state.location.chapterNumber - 1,
          paragraphIndex: undefined,
          scrollFraction: 1,
        }, 'user'),
        lastExplicitUserNavAt: event.now,
      }
    }

    case 'READER_LAYOUT_READY': {
      if (state.status !== 'ready') return state
      if (event.view !== 'read' && event.view !== 'compare') return state
      const totalPages = Math.max(event.totalPages, 1)
      const scrollFraction = totalPages > 1 ? event.page / (totalPages - 1) : state.location.scrollFraction
      const paragraphIndex = event.firstVisibleParagraph ?? state.location.paragraphIndex
      const next = { ...state.location, paragraphIndex }
      if (!isValidLocation(next, event.context)) return state
      return withLocation(state, {
        paragraphIndex,
        scrollFraction: clampScrollFraction(scrollFraction),
        activeView: event.view,
      }, 'reader-layout')
    }

    case 'AUDIO_PARAGRAPH_CHANGED': {
      if (state.status !== 'ready') return state
      const next = {
        bookId: state.location.bookId,
        chapterNumber: event.chapterNumber,
        paragraphIndex: event.paragraphIndex,
        editionKey: state.location.editionKey,
      }
      if (!isValidLocation(next, event.context)) return state
      const totalParagraphs = paragraphCount(event.context, event.chapterNumber)
      return withLocation(state, {
        chapterNumber: event.chapterNumber,
        paragraphIndex: event.paragraphIndex,
        scrollFraction: totalParagraphs > 1 ? event.paragraphIndex / (totalParagraphs - 1) : 0,
      }, 'audio')
    }

    case 'AUDIO_CHAPTER_COMPLETED': {
      if (state.status !== 'ready') return state
      const total = chapterCount(event.context)
      if (state.location.chapterNumber >= total) return state
      return withLocation(state, {
        chapterNumber: state.location.chapterNumber + 1,
        paragraphIndex: undefined,
        scrollFraction: 0,
      }, 'audio')
    }
  }
}
