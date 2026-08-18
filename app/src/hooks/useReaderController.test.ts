// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appendReaderSessionShadow } from '../readerSession/shadow'
import { localStorageProvider, setStorageProvider, type StorageProvider } from '../services/storage'
import type { ReadingPosition } from '../types'
import { perfStartSwitch } from '../utils/perf'
import { useReaderController } from './useReaderController'

vi.mock('../readerSession/shadow', () => ({
  appendReaderSessionShadow: vi.fn(),
}))

vi.mock('../utils/perf', () => ({
  perfStartSwitch: vi.fn(),
}))

function createMemoryStorage(): { provider: StorageProvider; store: Map<string, unknown> } {
  const store = new Map<string, unknown>()
  return {
    store,
    provider: {
      get<T>(key: string): T | null {
        return (store.get(key) as T | undefined) ?? null
      },
      set<T>(key: string, value: T): void {
        store.set(key, value)
      },
      delete(key: string): void {
        store.delete(key)
      },
      getAll<T>(prefix: string): T[] {
        return Array.from(store.entries())
          .filter(([key]) => key.startsWith(prefix))
          .map(([, value]) => value as T)
      },
    },
  }
}

function position(patch: Partial<ReadingPosition> = {}): ReadingPosition {
  return {
    bookId: 'hamlet',
    chapterNumber: 3,
    currentPage: 2,
    totalPages: 12,
    scrollFraction: 0.2,
    ...patch,
  }
}

function setVisibilityState(value: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', { value, configurable: true })
}

describe('useReaderController', () => {
  let store: Map<string, unknown>

  beforeEach(() => {
    const memory = createMemoryStorage()
    store = memory.store
    setStorageProvider(memory.provider)
    vi.mocked(appendReaderSessionShadow).mockClear()
    vi.mocked(perfStartSwitch).mockClear()
    setVisibilityState('visible')
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    vi.useRealTimers()
    setStorageProvider(localStorageProvider)
  })

  it('initializes the current book and chapter from persisted reader state', () => {
    store.set('tinct-current-book', 'hamlet')
    store.set('position:hamlet', position())

    const { result } = renderHook(() => useReaderController())

    expect(result.current.currentBookId).toBe('hamlet')
    expect(result.current.book.id).toBe('hamlet')
    expect(result.current.savedPos.current).toEqual(position())
    expect(result.current.currentChapter).toBe(3)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(0)
  })

  it('recovers a poisoned Bible Genesis 2 position from reading history on initialization', () => {
    store.set('tinct-current-book', 'bible')
    store.set('position:bible', position({
      bookId: 'bible',
      chapterNumber: 2,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: 1,
    }))
    store.set('reading-log:bible', {
      bookId: 'bible',
      updatedAt: 2_000,
      chapters: {
        803: {
          chapterNumber: 803,
          editions: ['kjv-en'],
          readCount: 1,
          firstReadAt: 1_500,
          lastReadAt: 2_000,
          completed: false,
          lastParagraphIndex: 4,
          totalParagraphs: 10,
        },
      },
    })

    const { result } = renderHook(() => useReaderController({
      totalChaptersRef: { current: 1189 },
    }))

    expect(result.current.currentBookId).toBe('bible')
    expect(result.current.book.id).toBe('bible')
    expect(result.current.currentChapter).toBe(803)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.savedPos.current).toMatchObject({
      bookId: 'bible',
      chapterNumber: 803,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 4 / 9,
      lastParagraphIndex: 4,
    })
  })

  it('recovers a poisoned Bible Genesis 2 position after cloud progress arrives', () => {
    store.set('tinct-current-book', 'bible')
    store.set('position:bible', position({
      bookId: 'bible',
      chapterNumber: 2,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: 1,
    }))
    const targetParagraphRef = { current: undefined as number | undefined }

    const { result, rerender } = renderHook(
      (props: { storageReady: boolean; supabaseInitTick: number }) => useReaderController({
        storageReady: props.storageReady,
        supabaseInitTick: props.supabaseInitTick,
        targetParagraphRef,
        totalChaptersRef: { current: 1189 },
      }),
      { initialProps: { storageReady: false, supabaseInitTick: 0 } },
    )

    expect(result.current.currentChapter).toBe(2)

    act(() => {
      store.set('progress:bible', {
        bookId: 'bible',
        highestCompletedChapter: 802,
        totalChapters: 1189,
        percent: 67,
      })
      rerender({ storageReady: true, supabaseInitTick: 1 })
    })

    expect(result.current.currentChapter).toBe(803)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(result.current.savedPos.current).toMatchObject({
      bookId: 'bible',
      chapterNumber: 803,
      currentPage: 0,
      totalPages: 1,
    })
  })

  it('falls back to Odyssey and clamps invalid saved chapters to chapter 1', () => {
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 0 }))

    const { result } = renderHook(() => useReaderController())

    expect(result.current.currentBookId).toBe('odyssey')
    expect(result.current.book.id).toBe('odyssey')
    expect(result.current.currentChapter).toBe(1)
  })

  it('exposes the same setters App uses for navigation and layout updates', () => {
    const { result } = renderHook(() => useReaderController())

    act(() => {
      result.current.setCurrentChapter(4)
      result.current.setCurrentPage(7)
      result.current.setTotalPages(20)
      result.current.setReaderKey((key) => key + 1)
    })

    expect(result.current.currentChapter).toBe(4)
    expect(result.current.currentPage).toBe(7)
    expect(result.current.totalPages).toBe(20)
    expect(result.current.readerKey).toBe(1)
  })

  it('advances to the next chapter through the controller and records completed progress', () => {
    store.set('tinct-current-book', 'odyssey')
    store.set('progress:odyssey', {
      bookId: 'odyssey',
      highestCompletedChapter: 1,
      totalChapters: 10,
      percent: 10,
    })
    const dispatchReaderSessionRef = { current: vi.fn() }
    const readerSessionContext = {
      book: { id: 'odyssey', editions: [] },
      editionData: { chapters: [] },
    }
    const targetParagraphRef = { current: 8 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      dispatchReaderSessionRef,
      readerSessionContextRef: { current: readerSessionContext },
      targetParagraphRef,
      totalChaptersRef: { current: 10 },
    }))

    act(() => {
      result.current.setCurrentChapter(3)
      result.current.setCurrentPage(4)
      result.current.setTotalPages(12)
    })

    act(() => {
      expect(result.current.handleNextChapter()).toBe(true)
    })

    expect(result.current.currentChapter).toBe(4)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(result.current.savedPos.current).toEqual({
      bookId: 'odyssey',
      chapterNumber: 4,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
    })
    expect(targetParagraphRef.current).toBeUndefined()
    expect(store.get('progress:odyssey')).toEqual({
      bookId: 'odyssey',
      highestCompletedChapter: 3,
      totalChapters: 10,
      percent: 30,
      positionPercent: 30,
    })
    expect(dispatchReaderSessionRef.current).toHaveBeenCalledWith(expect.objectContaining({
      type: 'USER_NEXT_CHAPTER',
      context: readerSessionContext,
    }))
    expect(appendReaderSessionShadow).toHaveBeenCalledWith({
      kind: 'event',
      event: 'USER_NEXT_CHAPTER',
      detail: { bookId: 'odyssey', from: 3, to: 4 },
    })
  })

  it('retreats to the previous chapter at the last-page restore point without changing progress', () => {
    store.set('tinct-current-book', 'odyssey')
    store.set('progress:odyssey', {
      bookId: 'odyssey',
      highestCompletedChapter: 3,
      totalChapters: 10,
      percent: 30,
    })
    const dispatchReaderSessionRef = { current: vi.fn() }
    const readerSessionContext = {
      book: { id: 'odyssey', editions: [] },
      editionData: { chapters: [] },
    }
    const targetParagraphRef = { current: 8 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      dispatchReaderSessionRef,
      readerSessionContextRef: { current: readerSessionContext },
      targetParagraphRef,
      totalChaptersRef: { current: 10 },
    }))

    act(() => {
      result.current.setCurrentChapter(4)
      result.current.setCurrentPage(5)
      result.current.setTotalPages(12)
    })

    act(() => {
      expect(result.current.handlePrevChapter()).toBe(true)
    })

    expect(result.current.currentChapter).toBe(3)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(result.current.savedPos.current).toEqual({
      bookId: 'odyssey',
      chapterNumber: 3,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 1,
    })
    expect(targetParagraphRef.current).toBeUndefined()
    expect(store.get('progress:odyssey')).toEqual({
      bookId: 'odyssey',
      highestCompletedChapter: 3,
      totalChapters: 10,
      percent: 30,
    })
    expect(dispatchReaderSessionRef.current).toHaveBeenCalledWith(expect.objectContaining({
      type: 'USER_PREV_CHAPTER',
      context: readerSessionContext,
    }))
    expect(appendReaderSessionShadow).toHaveBeenCalledWith({
      kind: 'event',
      event: 'USER_PREV_CHAPTER',
      detail: { bookId: 'odyssey', from: 4, to: 3 },
    })
  })

  it('navigates directly to a chapter and remounts even when selecting the current chapter', () => {
    store.set('tinct-current-book', 'odyssey')
    const dispatchReaderSessionRef = { current: vi.fn() }
    const readerSessionContext = {
      book: { id: 'odyssey', editions: [] },
      editionData: { chapters: [] },
    }
    const targetParagraphRef = { current: 4 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      dispatchReaderSessionRef,
      readerSessionContextRef: { current: readerSessionContext },
      targetParagraphRef,
    }))

    act(() => {
      result.current.setCurrentChapter(3)
      result.current.setCurrentPage(6)
      result.current.setTotalPages(20)
    })

    act(() => {
      expect(result.current.handleNavigateToChapter(3)).toBe(true)
    })

    expect(result.current.currentChapter).toBe(3)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(result.current.savedPos.current).toEqual({
      bookId: 'odyssey',
      chapterNumber: 3,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
    })
    expect(dispatchReaderSessionRef.current).toHaveBeenCalledWith(expect.objectContaining({
      type: 'USER_SELECT_CHAPTER',
      chapterNumber: 3,
      paragraphIndex: undefined,
      context: readerSessionContext,
    }))
  })

  it('navigates directly to a target paragraph and preserves edition intent in nav debug', () => {
    store.set('tinct-current-book', 'odyssey')
    const dispatchReaderSessionRef = { current: vi.fn() }
    const readerSessionContext = {
      book: { id: 'odyssey', editions: [] },
      editionData: { chapters: [] },
    }
    const targetParagraphRef = { current: undefined as number | undefined }
    window.__tinctNavDebug = []

    const { result } = renderHook(() => useReaderController({
      dispatchReaderSessionRef,
      readerSessionContextRef: { current: readerSessionContext },
      targetParagraphRef,
    }))

    act(() => {
      result.current.setCurrentChapter(2)
      result.current.setCurrentPage(5)
      result.current.setTotalPages(12)
    })

    act(() => {
      expect(result.current.handleNavigateToChapter(5, 17, 'modern-da')).toBe(true)
    })

    expect(result.current.currentChapter).toBe(5)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(targetParagraphRef.current).toBe(17)
    expect(result.current.savedPos.current).toEqual({
      bookId: 'odyssey',
      chapterNumber: 5,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: -1,
    })
    expect(dispatchReaderSessionRef.current).toHaveBeenCalledWith(expect.objectContaining({
      type: 'USER_SELECT_CHAPTER',
      chapterNumber: 5,
      paragraphIndex: 17,
      context: readerSessionContext,
    }))
    expect(window.__tinctNavDebug?.at(-1)).toMatchObject({
      kind: 'navigateToChapter',
      from: 2,
      to: 5,
      paragraphIndex: 17,
      editionKey: 'modern-da',
    })
  })

  it('restores a back-position target with its saved scroll fraction', () => {
    store.set('tinct-current-book', 'odyssey')
    const dispatchReaderSessionRef = { current: vi.fn() }
    const readerSessionContext = {
      book: { id: 'odyssey', editions: [] },
      editionData: { chapters: [] },
    }
    const targetParagraphRef = { current: 17 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      dispatchReaderSessionRef,
      readerSessionContextRef: { current: readerSessionContext },
      targetParagraphRef,
    }))

    act(() => {
      result.current.setCurrentChapter(6)
      result.current.setCurrentPage(8)
      result.current.setTotalPages(22)
    })

    act(() => {
      expect(result.current.handleBackToPosition({ chapter: 2, scrollFraction: 0.45 })).toBe(true)
    })

    expect(result.current.currentChapter).toBe(2)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(result.current.savedPos.current).toEqual({
      bookId: 'odyssey',
      chapterNumber: 2,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0.45,
    })
    expect(dispatchReaderSessionRef.current).toHaveBeenCalledWith(expect.objectContaining({
      type: 'USER_SELECT_CHAPTER',
      chapterNumber: 2,
      context: readerSessionContext,
    }))
  })

  it('resets an out-of-range chapter position to chapter 1 and deletes the saved position', () => {
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 99 }))
    const targetParagraphRef = { current: 9 as number | undefined }

    const { result } = renderHook(() => useReaderController({ targetParagraphRef }))

    act(() => {
      result.current.setCurrentChapter(99)
      result.current.setCurrentPage(7)
      result.current.setTotalPages(15)
      result.current.resetInvalidPosition({ chapterNumber: 1 })
    })

    expect(result.current.currentChapter).toBe(1)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(15)
    expect(result.current.readerKey).toBe(1)
    expect(result.current.savedPos.current).toBeNull()
    expect(targetParagraphRef.current).toBeUndefined()
    expect(store.has('position:odyssey')).toBe(false)
  })

  it('resets an invalid target paragraph without changing the current chapter', () => {
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 3, lastParagraphIndex: 999 }))
    const targetParagraphRef = { current: 999 as number | undefined }

    const { result } = renderHook(() => useReaderController({ targetParagraphRef }))

    act(() => {
      result.current.setCurrentChapter(3)
      result.current.setCurrentPage(4)
      result.current.setTotalPages(11)
      result.current.resetInvalidPosition()
    })

    expect(result.current.currentChapter).toBe(3)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(11)
    expect(result.current.readerKey).toBe(1)
    expect(result.current.savedPos.current).toBeNull()
    expect(targetParagraphRef.current).toBeUndefined()
    expect(store.has('position:odyssey')).toBe(false)
  })

  it('resets blank-reader recovery to a fallback chapter and gates layout writes', () => {
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 6 }))
    const targetParagraphRef = { current: 3 as number | undefined }

    const { result } = renderHook(() => useReaderController({ targetParagraphRef }))

    act(() => {
      result.current.setCurrentChapter(6)
      result.current.setCurrentPage(9)
      result.current.setTotalPages(30)
      result.current.resetInvalidPosition({ chapterNumber: 2, resetTotalPages: true })
    })

    expect(result.current.currentChapter).toBe(2)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(result.current.savedPos.current).toBeNull()
    expect(targetParagraphRef.current).toBeUndefined()
    expect(store.has('position:odyssey')).toBe(false)
  })

  it('refreshes storage and URL for same-book selection without resetting reader state', () => {
    store.set('tinct-current-book', 'hamlet')
    window.history.replaceState(null, '', '/library?from=test#spot')
    const clearMessagesRef = { current: vi.fn() }
    const resetReaderSurfacesRef = { current: vi.fn() }
    const resetPerfMarkersRef = { current: vi.fn() }
    const targetParagraphRef = { current: 42 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      clearMessagesRef,
      resetReaderSurfacesRef,
      resetPerfMarkersRef,
      targetParagraphRef,
    }))

    act(() => {
      result.current.handleBookChange('hamlet')
    })

    expect(store.get('tinct-current-book')).toBe('hamlet')
    expect(window.location.pathname).toBe('/read/hamlet')
    expect(window.location.search).toBe('?from=test')
    expect(window.location.hash).toBe('#spot')
    expect(result.current.currentBookId).toBe('hamlet')
    expect(result.current.readerKey).toBe(0)
    expect(targetParagraphRef.current).toBe(42)
    expect(clearMessagesRef.current).not.toHaveBeenCalled()
    expect(resetReaderSurfacesRef.current).not.toHaveBeenCalled()
    expect(resetPerfMarkersRef.current).not.toHaveBeenCalled()
    expect(perfStartSwitch).not.toHaveBeenCalled()
    expect(appendReaderSessionShadow).not.toHaveBeenCalled()
  })

  it('adopts saved position and resets volatile reader state for cross-book selection', () => {
    store.set('tinct-current-book', 'odyssey')
    const hamletPosition = position()
    store.set('position:hamlet', hamletPosition)
    window.history.replaceState(null, '', '/read/odyssey?from=test#spot')
    const clearMessagesRef = { current: vi.fn() }
    const resetReaderSurfacesRef = { current: vi.fn() }
    const resetPerfMarkersRef = { current: vi.fn() }
    const targetParagraphRef = { current: 42 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      clearMessagesRef,
      resetReaderSurfacesRef,
      resetPerfMarkersRef,
      targetParagraphRef,
    }))

    act(() => {
      result.current.setCurrentPage(9)
      result.current.setTotalPages(30)
      result.current.handleBookChange('hamlet')
    })

    expect(store.get('tinct-current-book')).toBe('hamlet')
    expect(window.location.pathname).toBe('/read/hamlet')
    expect(window.location.search).toBe('?from=test')
    expect(window.location.hash).toBe('#spot')
    expect(result.current.currentBookId).toBe('hamlet')
    expect(result.current.book.id).toBe('hamlet')
    expect(result.current.savedPos.current).toEqual(hamletPosition)
    expect(result.current.currentChapter).toBe(3)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(2)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(clearMessagesRef.current).toHaveBeenCalledTimes(1)
    expect(resetReaderSurfacesRef.current).toHaveBeenCalledTimes(2)
    expect(resetPerfMarkersRef.current).toHaveBeenCalledTimes(2)
    expect(perfStartSwitch).toHaveBeenCalledTimes(2)
    expect(perfStartSwitch).toHaveBeenCalledWith('hamlet')
    expect(appendReaderSessionShadow).toHaveBeenCalledWith({
      kind: 'event',
      event: 'OPEN_BOOK',
      detail: { from: 'odyssey', to: 'hamlet' },
    })
  })

  it('re-derives reader state when setCurrentBookId bypasses handleBookChange', () => {
    store.set('tinct-current-book', 'odyssey')
    const hamletPosition = position({ chapterNumber: 4, currentPage: 5, totalPages: 18, scrollFraction: 0.4 })
    store.set('position:hamlet', hamletPosition)
    store.set('reading-angle:hamlet', 'Watch Hamlet as political theater')
    const clearMessagesRef = { current: vi.fn() }
    const resetReaderSurfacesRef = { current: vi.fn() }
    const resetPerfMarkersRef = { current: vi.fn() }
    const setReadingObjectiveRef = { current: vi.fn() }
    const targetParagraphRef = { current: 24 as number | undefined }

    const { result } = renderHook(() => useReaderController({
      clearMessagesRef,
      resetReaderSurfacesRef,
      resetPerfMarkersRef,
      setReadingObjectiveRef,
      targetParagraphRef,
    }))

    act(() => {
      result.current.setCurrentPage(8)
      result.current.setTotalPages(22)
      result.current.setReaderKey((key) => key + 5)
      result.current.setCurrentBookId('hamlet')
    })

    expect(store.get('tinct-current-book')).toBe('odyssey')
    expect(result.current.currentBookId).toBe('hamlet')
    expect(result.current.book.id).toBe('hamlet')
    expect(result.current.savedPos.current).toEqual(hamletPosition)
    expect(result.current.currentChapter).toBe(4)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(6)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(clearMessagesRef.current).not.toHaveBeenCalled()
    expect(resetReaderSurfacesRef.current).toHaveBeenCalledTimes(1)
    expect(resetPerfMarkersRef.current).toHaveBeenCalledTimes(1)
    expect(setReadingObjectiveRef.current).toHaveBeenCalledWith('Watch Hamlet as political theater')
    expect(perfStartSwitch).toHaveBeenCalledWith('hamlet')
    expect(appendReaderSessionShadow).not.toHaveBeenCalled()
  })

  it('adopts cloud current book during startup restore', () => {
    store.set('tinct-current-book', 'odyssey')
    store.set('position:hamlet', position({ chapterNumber: 2, lastParagraphIndex: 5 }))
    const refreshFromStorage = vi.fn()
    const refreshLibrary = vi.fn()
    const setCloudRestoreSettled = vi.fn()
    const targetParagraphRef = { current: undefined as number | undefined }
    const localFirstFromCacheRef = { current: false }

    const { result, rerender } = renderHook(
      (props: { storageReady: boolean; supabaseInitTick: number; user: unknown | null }) => useReaderController({
        localFirstFromCacheRef,
        refreshFromStorage,
        refreshLibrary,
        setCloudRestoreSettled,
        storageReady: props.storageReady,
        supabaseInitTick: props.supabaseInitTick,
        targetParagraphRef,
        user: props.user,
      }),
      { initialProps: { storageReady: false, supabaseInitTick: 0, user: null } },
    )

    act(() => {
      store.set('tinct-current-book', 'hamlet')
      rerender({ storageReady: true, supabaseInitTick: 1, user: { id: 'reader' } })
    })

    expect(refreshFromStorage).toHaveBeenCalledTimes(2)
    expect(refreshLibrary).toHaveBeenCalledTimes(2)
    expect(result.current.currentBookId).toBe('hamlet')
    expect(result.current.book.id).toBe('hamlet')
    expect(result.current.savedPos.current).toEqual(position({ chapterNumber: 2, lastParagraphIndex: 5 }))
    expect(result.current.currentChapter).toBe(2)
    expect(result.current.currentPage).toBe(0)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(result.current.hasRestoredFromCloud.current).toBe(true)
    expect(setCloudRestoreSettled).toHaveBeenCalledWith(true)
  })

  it('corrects local-first startup position after cloud data lands', () => {
    store.set('tinct-current-book', 'odyssey')
    const localPosition = position({ bookId: 'odyssey', chapterNumber: 1, scrollFraction: 0.1 })
    const cloudPosition = position({ bookId: 'odyssey', chapterNumber: 4, scrollFraction: 0.6, lastParagraphIndex: 9 })
    store.set('position:odyssey', localPosition)
    const setCloudRestoreSettled = vi.fn()
    const targetParagraphRef = { current: undefined as number | undefined }
    const localFirstFromCacheRef = { current: true }

    const { result, rerender } = renderHook(
      (props: { storageReady: boolean; supabaseInitTick: number; user: unknown | null }) => useReaderController({
        localFirstFromCacheRef,
        setCloudRestoreSettled,
        storageReady: props.storageReady,
        supabaseInitTick: props.supabaseInitTick,
        targetParagraphRef,
        user: props.user,
      }),
      { initialProps: { storageReady: false, supabaseInitTick: 0, user: null } },
    )

    expect(result.current.savedPos.current).toEqual(localPosition)

    act(() => {
      store.set('position:odyssey', cloudPosition)
      rerender({ storageReady: true, supabaseInitTick: 1, user: { id: 'reader' } })
    })

    expect(result.current.currentBookId).toBe('odyssey')
    expect(result.current.savedPos.current).toEqual(cloudPosition)
    expect(result.current.currentChapter).toBe(4)
    expect(result.current.currentPage).toBe(0)
    expect(targetParagraphRef.current).toBe(9)
    expect(result.current.readerKey).toBe(1)
    expect(result.current.hasRestoredFromCloud.current).toBe(true)
    expect(setCloudRestoreSettled).toHaveBeenCalledWith(true)
  })

  it('settles local-first startup restore when cloud confirms the cached position', () => {
    store.set('tinct-current-book', 'odyssey')
    const cachedPosition = position({ bookId: 'odyssey', chapterNumber: 4, scrollFraction: 0.6, lastParagraphIndex: 9 })
    store.set('position:odyssey', cachedPosition)
    const setCloudRestoreSettled = vi.fn()
    const localFirstFromCacheRef = { current: true }

    const { result, rerender } = renderHook(
      (props: { storageReady: boolean; supabaseInitTick: number; user: unknown | null }) => useReaderController({
        localFirstFromCacheRef,
        setCloudRestoreSettled,
        storageReady: props.storageReady,
        supabaseInitTick: props.supabaseInitTick,
        user: props.user,
      }),
      { initialProps: { storageReady: false, supabaseInitTick: 0, user: null } },
    )

    act(() => {
      rerender({ storageReady: true, supabaseInitTick: 1, user: { id: 'reader' } })
    })

    expect(result.current.currentBookId).toBe('odyssey')
    expect(result.current.savedPos.current).toEqual(cachedPosition)
    expect(result.current.currentChapter).toBe(4)
    expect(result.current.readerKey).toBe(0)
    expect(result.current.hasRestoredFromCloud.current).toBe(true)
    expect(setCloudRestoreSettled).toHaveBeenCalledWith(true)
  })

  it('adopts same-book remote progress on focus refresh when cloud is ahead', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_777_300_000_000)
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 1, scrollFraction: 0.1 }))
    const cloudPosition = position({ bookId: 'odyssey', chapterNumber: 2, scrollFraction: 0.25, lastParagraphIndex: 7 })
    const provider = {
      refresh: vi.fn(async () => {
        store.set('position:odyssey', cloudPosition)
      }),
      refreshKeys: vi.fn(async () => {}),
    }
    const targetParagraphRef = { current: undefined as number | undefined }
    const totalChaptersRef = { current: 10 }

    const { result } = renderHook(() => useReaderController({
      cloudRestoreSettled: true,
      storageReady: true,
      supabaseProviderRef: { current: provider },
      targetParagraphRef,
      totalChaptersRef,
      user: { id: 'reader' },
    }))

    act(() => {
      result.current.setTotalPages(10)
      result.current.setCurrentChapter(1)
      result.current.setCurrentPage(0)
    })
    setVisibilityState('hidden')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    vi.setSystemTime(1_777_303_600_001)
    setVisibilityState('visible')

    await act(async () => {
      await result.current.handleVisibilitySync()
    })

    expect(provider.refresh).toHaveBeenCalledWith('odyssey')
    expect(provider.refreshKeys).not.toHaveBeenCalled()
    expect(result.current.currentBookId).toBe('odyssey')
    expect(result.current.savedPos.current).toEqual(cloudPosition)
    expect(result.current.currentChapter).toBe(2)
    expect(result.current.currentPage).toBe(0)
    expect(targetParagraphRef.current).toBe(7)
    expect(result.current.readerKey).toBe(1)
  })

  it('does not refresh remote position on short app switch before the stale window elapses', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_777_300_000_000)
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 1, scrollFraction: 0.1 }))
    const provider = {
      refresh: vi.fn(async () => {
        store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 2, scrollFraction: 0.25 }))
      }),
      refreshKeys: vi.fn(async () => {}),
    }

    const { result } = renderHook(() => useReaderController({
      cloudRestoreSettled: true,
      storageReady: true,
      supabaseProviderRef: { current: provider },
      totalChaptersRef: { current: 10 },
      user: { id: 'reader' },
    }))

    act(() => {
      result.current.setTotalPages(10)
      result.current.setCurrentChapter(1)
    })
    vi.setSystemTime(1_777_307_200_000)
    setVisibilityState('hidden')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    vi.setSystemTime(1_777_308_400_000)
    setVisibilityState('visible')

    await act(async () => {
      await result.current.handleVisibilitySync()
    })

    expect(provider.refresh).not.toHaveBeenCalled()
    expect(provider.refreshKeys).not.toHaveBeenCalled()
    expect(result.current.currentChapter).toBe(1)
  })

  it('does not count long app uptime as stale focus time', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_777_300_000_000)
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 1, scrollFraction: 0.1 }))
    const provider = {
      refresh: vi.fn(async () => {
        store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 2, scrollFraction: 0.25 }))
      }),
      refreshKeys: vi.fn(async () => {}),
    }

    const { result } = renderHook(() => useReaderController({
      cloudRestoreSettled: true,
      storageReady: true,
      supabaseProviderRef: { current: provider },
      totalChaptersRef: { current: 10 },
      user: { id: 'reader' },
    }))

    act(() => {
      result.current.setTotalPages(10)
      result.current.setCurrentChapter(1)
    })
    vi.setSystemTime(1_777_307_200_000)
    setVisibilityState('hidden')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    vi.setSystemTime(1_777_308_400_000)
    setVisibilityState('visible')

    await act(async () => {
      await result.current.handleVisibilitySync()
    })

    expect(provider.refresh).not.toHaveBeenCalled()
    expect(provider.refreshKeys).not.toHaveBeenCalled()
    expect(result.current.currentChapter).toBe(1)
  })

  it('switches to cloud current book on focus refresh', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_777_300_000_000)
    store.set('tinct-current-book', 'odyssey')
    store.set('position:odyssey', position({ bookId: 'odyssey', chapterNumber: 1 }))
    const hamletPosition = position({ bookId: 'hamlet', chapterNumber: 5, scrollFraction: 0.5, lastParagraphIndex: 11 })
    const provider = {
      refresh: vi.fn(async () => {
        store.set('tinct-current-book', 'hamlet')
      }),
      refreshKeys: vi.fn(async () => {
        store.set('position:hamlet', hamletPosition)
      }),
    }
    const resetReaderSurfacesRef = { current: vi.fn() }
    const targetParagraphRef = { current: undefined as number | undefined }
    const totalChaptersRef = { current: 10 }

    const { result } = renderHook(() => useReaderController({
      cloudRestoreSettled: true,
      resetReaderSurfacesRef,
      storageReady: true,
      supabaseProviderRef: { current: provider },
      targetParagraphRef,
      totalChaptersRef,
      user: { id: 'reader' },
    }))

    act(() => {
      result.current.setTotalPages(10)
    })
    setVisibilityState('hidden')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    vi.setSystemTime(1_777_303_600_001)
    setVisibilityState('visible')

    await act(async () => {
      await result.current.handleVisibilitySync()
    })

    expect(provider.refresh).toHaveBeenCalledWith('odyssey')
    expect(provider.refreshKeys).toHaveBeenCalledWith(['position:hamlet'])
    expect(result.current.currentBookId).toBe('hamlet')
    expect(result.current.book.id).toBe('hamlet')
    expect(result.current.savedPos.current).toEqual(hamletPosition)
    expect(result.current.currentChapter).toBe(5)
    expect(result.current.currentPage).toBe(0)
    expect(targetParagraphRef.current).toBeUndefined()
    expect(resetReaderSurfacesRef.current).toHaveBeenCalledTimes(1)
  })

  it('adopts realtime remote positions and dispatches readerSession restore', () => {
    store.set('tinct-current-book', 'odyssey')
    const dispatchReaderSessionRef = { current: vi.fn() }
    const readerSessionContext = {
      book: { id: 'odyssey', editions: [] },
      editionData: { chapters: [] },
    }
    const targetParagraphRef = { current: undefined as number | undefined }
    const remotePosition = position({
      bookId: 'odyssey',
      chapterNumber: 6,
      scrollFraction: 0.65,
      lastParagraphIndex: 12,
    })

    const { result } = renderHook(() => useReaderController({
      activeViewRef: { current: 1 },
      dispatchReaderSessionRef,
      primaryEditionKeyRef: { current: 'modern-en' },
      readerSessionContextRef: { current: readerSessionContext },
      readerSessionRevisionRef: { current: 17 },
      targetParagraphRef,
    }))

    act(() => {
      result.current.setTotalPages(9)
      result.current.handleRemotePosition(remotePosition)
    })

    expect(result.current.savedPos.current).toEqual(remotePosition)
    expect(result.current.currentChapter).toBe(6)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(1)
    expect(result.current.readerKey).toBe(1)
    expect(targetParagraphRef.current).toBe(12)
    expect(dispatchReaderSessionRef.current).toHaveBeenCalledWith({
      type: 'RESTORE_POSITION',
      location: {
        bookId: 'odyssey',
        chapterNumber: 6,
        paragraphIndex: 12,
        scrollFraction: 0.65,
        editionKey: 'modern-en',
        activeView: 'compare',
        source: 'remote',
        revision: 17,
      },
      context: readerSessionContext,
      source: 'remote',
      now: expect.any(Number),
    })
  })
})
