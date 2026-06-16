import { useCallback, useEffect, useRef, useState, type Dispatch, type MutableRefObject } from 'react'
import { ODYSSEY, getBook } from '../data/bookRegistry'
import { storage } from '../services/storage'
import type { EditionKey, ReadingPosition, ReadingProgress } from '../types'
import { perfStartSwitch } from '../utils/perf'
import { appendReaderSessionShadow } from '../readerSession/shadow'
import {
  getCloudRestoreWinner,
  getLocalFirstCloudAdoption,
  getStartupCloudRestoreTarget,
  paragraphTargetFromPosition,
  shouldAttemptStartupCloudPositionRestore,
  shouldApplyRemotePosition,
} from '../readerSession/controllerGuards'
import { readerViewFromMobileIndex } from '../readerSession/useReaderSessionController'
import type { ReaderBookContext, ReaderSessionEvent } from '../readerSession/types'
import { getSavedPosition, markCloudLoaded, markCloudPosition, markUserNav } from './useReadingPosition'
import { buildReadingProgressUpdate } from './useReadingPosition.guards'

type ReaderControllerOptions = {
  activeViewRef?: MutableRefObject<number>
  cloudRestoreSettled?: boolean
  clearMessagesRef?: MutableRefObject<(() => void) | null>
  dispatchReaderSessionRef?: MutableRefObject<Dispatch<ReaderSessionEvent> | null>
  libraryEmpty?: boolean
  localFirstFromCacheRef?: MutableRefObject<boolean>
  primaryEditionKeyRef?: MutableRefObject<EditionKey | null>
  readerSessionContextRef?: MutableRefObject<ReaderBookContext | null>
  readerSessionRevisionRef?: MutableRefObject<number>
  refreshFromStorage?: () => void
  refreshLibrary?: () => void
  resetReaderSurfacesRef?: MutableRefObject<(() => void) | null>
  resetPerfMarkersRef?: MutableRefObject<(() => void) | null>
  setCloudRestoreSettled?: (settled: boolean) => void
  setReadingObjectiveRef?: MutableRefObject<((angle: string) => void) | null>
  showStore?: boolean
  storageReady?: boolean
  supabaseInitTick?: number
  supabaseProviderRef?: MutableRefObject<{
    refresh: (currentBookId?: string) => Promise<void>
    refreshKeys: (keys: string[]) => Promise<void>
  } | null>
  targetParagraphRef?: MutableRefObject<number | undefined>
  totalChaptersRef?: MutableRefObject<number>
  user?: unknown | null
}

const SUPABASE_FOCUS_REFRESH_TIMEOUT_MS = 4000
const SUPABASE_FOCUS_REFRESH_MIN_INTERVAL_MS = 60 * 60 * 1000

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout)
  })
}

function replaceReaderUrl(bookId: string): void {
  try {
    const newPath = `/read/${bookId}`
    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.replaceState(null, '', newPath + window.location.search + window.location.hash)
    }
  } catch { /* ignore */ }
}

function progressKey(bookId: string): string {
  return `progress:${bookId}`
}

export function useReaderController(options: ReaderControllerOptions = {}) {
  const [currentBookId, setCurrentBookId] = useState(() => {
    return storage.get<string>('tinct-current-book') || ODYSSEY.id
  })
  const book = getBook(currentBookId) || ODYSSEY

  const savedPos = useRef<ReadingPosition | null>(getSavedPosition(book.id))
  const [currentChapter, setCurrentChapter] = useState(() => {
    const ch = savedPos.current?.chapterNumber || 1
    // Bounds check: chapter must be positive (full bounds check happens after data loads)
    return ch >= 1 ? ch : 1
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [readerKey, setReaderKey] = useState(0)
  const hasRestoredFromCloud = useRef(false)
  const lastSyncRef = useRef(Date.now())

  const localFirstDebug = useCallback((stage: string, detail?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return
    const w = window as Window & { __tinctLocalFirstDebug?: Array<Record<string, unknown>> }
    w.__tinctLocalFirstDebug = w.__tinctLocalFirstDebug || []
    w.__tinctLocalFirstDebug.push({ at: Date.now(), stage, ...detail })
    if (w.__tinctLocalFirstDebug.length > 40) w.__tinctLocalFirstDebug.shift()
  }, [])

  // Re-read position, preferences, and library from cloud storage once Supabase syncs.
  // Re-runs when supabaseInitTick increments (init landed AFTER the 5s timeout
  // already flipped storageReady=true). Without that, a slow cold-start cloud
  // fetch meant restore ran against stale localStorage and the user opened on
  // a book they weren't actually reading anymore. Now: restore once on
  // ready, and again the moment cloud data is genuinely available.
  useEffect(() => {
    const supabaseInitTick = options.supabaseInitTick ?? 0
    if (!options.storageReady || !options.user) return

    // Allow re-restore when supabaseInitTick fires (cloud data just landed).
    // The first restore (against possibly-stale localStorage) is harmless;
    // the second corrects to true cloud values.
    options.refreshFromStorage?.()
    options.refreshLibrary?.()

    // Current book — switch if cloud disagrees with what we have on screen.
    const cloudBookId = storage.get<string>('tinct-current-book')
    const restoreTarget = getStartupCloudRestoreTarget({
      cloudBookId,
      currentBookId: book.id,
      isKnownBookId: (bookId) => !!getBook(bookId),
    })
    const targetBookId = restoreTarget.targetBookId
    if (restoreTarget.shouldSwitchBook) {
      localFirstDebug(options.localFirstFromCacheRef?.current ? 'cloud-corrected-book' : 'cloud-restored-book', {
        from: currentBookId,
        to: targetBookId,
      })
      setCurrentBookId(targetBookId)
    }

    // Restore reading position only on the FIRST SUCCESSFUL restore. Subsequent
    // restores (e.g. supabaseInitTick fires after the user has been
    // reading for a few seconds) must NOT yank the user back to where
    // they were last time — the current state on screen is more recent.
    //
    // H1 fix (2026-05-06): set `hasRestoredFromCloud` only AFTER we
    // confirm cloudPos is non-null. Previously the flag was set
    // unconditionally on the first run; if the 5s timeout fired with
    // localStorage still empty (post-wipe device), the restore got null
    // and was permanently blocked. Now: re-attempt on every supabaseInitTick
    // until we actually have cloud data.
    const shouldRestoreCloudPosition = shouldAttemptStartupCloudPositionRestore({
      hasRestoredFromCloud: hasRestoredFromCloud.current,
      supabaseInitTick,
    })
    if (options.localFirstFromCacheRef?.current && shouldRestoreCloudPosition) {
      const cloudPos = getSavedPosition(targetBookId)
      markCloudPosition(targetBookId, cloudPos)
      if (cloudPos) {
        hasRestoredFromCloud.current = true
        const localPos = savedPos.current
        const adoption = getLocalFirstCloudAdoption({
          localPos,
          cloudPos,
          currentBookId,
          targetBookId,
        })
        if (adoption.kind === 'none') return
        localFirstDebug(adoption.kind === 'confirmed' ? 'cloud-confirmed-position' : 'cloud-corrected-position', {
          bookId: targetBookId,
          localChapter: localPos?.chapterNumber,
          cloudChapter: adoption.position.chapterNumber,
          localFraction: localPos?.scrollFraction,
          cloudFraction: adoption.position.scrollFraction,
        })
        markCloudLoaded(targetBookId, adoption.position)
        if (adoption.kind === 'confirmed') return
        savedPos.current = adoption.position
        if (options.targetParagraphRef) options.targetParagraphRef.current = paragraphTargetFromPosition(adoption.position)
        markUserNav(targetBookId)
        setCurrentChapter(adoption.position.chapterNumber)
        setCurrentPage(0)
        setReaderKey(k => k + 1)
      }
    } else if (shouldRestoreCloudPosition) {
      const cloudPos = getSavedPosition(targetBookId)
      // Mark cloud-known chapter so the regression guard knows what the
      // authoritative position is. Without this, the first heartbeat
      // after a buggy default-state remount would be allowed to write
      // chapter 1 because the guard had no baseline to compare.
      markCloudPosition(targetBookId, cloudPos)
      if (cloudPos) {
        hasRestoredFromCloud.current = true
        const localPos = savedPos.current
        const winner = getCloudRestoreWinner({ localPos, cloudPos })
        if (winner) {
          savedPos.current = winner
          if (options.targetParagraphRef) {
            options.targetParagraphRef.current = winner === cloudPos ? paragraphTargetFromPosition(winner) : undefined
          }
          // Restoring from cloud counts as a user-initiated landing point;
          // any write within USER_NAV_GRACE_MS of this is allowed even if
          // it appears to regress.
          markUserNav(targetBookId)
          // Prime dedup so the post-layout `onPageChange` echo doesn't write
          // the just-loaded value back to cloud (cross-device echo bug).
          markCloudLoaded(targetBookId, winner)
          setCurrentChapter(winner.chapterNumber)
          setCurrentPage(0)
          setReaderKey(k => k + 1)
        }
      }
    }
    options.setCloudRestoreSettled?.(true)
  }, [
    book.id,
    currentBookId,
    localFirstDebug,
    options.localFirstFromCacheRef,
    options.refreshFromStorage,
    options.refreshLibrary,
    options.setCloudRestoreSettled,
    options.storageReady,
    options.supabaseInitTick,
    options.targetParagraphRef,
    options.user,
  ])

  // Cross-book bleed guard.
  //
  // Every code path that changes `currentBookId` MUST also reset chapter/page
  // state to match the new book — otherwise the next heartbeat writes
  // `position:newBook` carrying the OLD book's chapterNumber.
  //
  // `handleBookChange` does this manually, but cloud-sync paths can call
  // `setCurrentBookId` directly. Centralizing the reset here keeps the rule
  // unconditional for future book-change paths.
  const prevBookIdRef = useRef(currentBookId)
  useEffect(() => {
    if (prevBookIdRef.current === currentBookId) return
    prevBookIdRef.current = currentBookId

    // Reset perf flags so the next book switch logs a clean run, even when
    // the change came from cloud-sync (didn't go through handleBookChange).
    options.resetPerfMarkersRef?.current?.()
    perfStartSwitch(currentBookId)

    const pos = getSavedPosition(currentBookId)
    // Mark cloud-known chapter for the new book so the regression guard has
    // a baseline. Mark user-nav so the first heartbeat-after-book-change
    // (which may render at the old chapter for a render or two) doesn't get
    // wrongly classified as a regression.
    markCloudPosition(currentBookId, pos)
    markCloudLoaded(currentBookId, pos)
    markUserNav(currentBookId)
    savedPos.current = pos
    if (options.targetParagraphRef) options.targetParagraphRef.current = undefined
    setCurrentChapter(pos?.chapterNumber || 1)
    setCurrentPage(0)
    // Reset totalPages so the reader's effects gate writes during relayout
    // (useReadingPosition skips page-level writes when totalPages <= 1).
    setTotalPages(1)
    options.resetReaderSurfacesRef?.current?.()
    setReaderKey(k => k + 1)

    // Reading angle is per-book. Load the new book's angle into
    // preferences.readingObjective so chat / system-prompt consumers see
    // the right one. If the new book has no saved angle, clear — never
    // fall back to the previous book's angle.
    const savedAngle = storage.get<string>(`reading-angle:${currentBookId}`)
    options.setReadingObjectiveRef?.current?.(savedAngle || '')
  }, [currentBookId, options.resetPerfMarkersRef, options.resetReaderSurfacesRef, options.setReadingObjectiveRef, options.targetParagraphRef])

  // Re-sync from Supabase when tab regains focus (cross-device sync).
  const handleVisibilitySync = useCallback(async () => {
    const now = Date.now()
    if (document.visibilityState !== 'visible') return
    const provider = options.supabaseProviderRef?.current
    if (!provider || !options.user) return
    if (!options.storageReady || !options.cloudRestoreSettled) return
    if (options.showStore || options.libraryEmpty) return
    if (now - lastSyncRef.current < SUPABASE_FOCUS_REFRESH_MIN_INTERVAL_MS) return
    lastSyncRef.current = now
    try {
      await withTimeout(
        provider.refresh(book.id),
        SUPABASE_FOCUS_REFRESH_TIMEOUT_MS,
        '[App] Supabase focus refresh timed out',
      )
    } catch (e) {
      console.warn('[App] Supabase focus refresh failed:', e)
      return
    }
    // If the cloud's current-book pointer has changed (user opened a
    // different book on another device), switch to it. Without this,
    // two devices stay on their own last-opened book even after sync.
    const cloudBookId = storage.get<string>('tinct-current-book')
    if (cloudBookId && cloudBookId !== book.id && !!getBook(cloudBookId)) {
      const beforeRefreshPos = getSavedPosition(cloudBookId)
      try {
        await withTimeout(
          provider.refreshKeys([`position:${cloudBookId}`]),
          SUPABASE_FOCUS_REFRESH_TIMEOUT_MS,
          '[App] Supabase focus refresh for switched book timed out',
        )
      } catch (e) {
        console.warn('[App] Supabase switched-book position refresh failed:', e)
      }
      if (typeof window !== 'undefined') {
        const afterRefreshPos = getSavedPosition(cloudBookId)
        ;(window as Window & { __tinctSyncDebug?: unknown }).__tinctSyncDebug = {
          lastSwitchedBookRefreshAt: Date.now(),
          cloudBookId,
          beforeChapter: beforeRefreshPos?.chapterNumber,
          beforeFraction: beforeRefreshPos?.scrollFraction,
          afterChapter: afterRefreshPos?.chapterNumber,
          afterFraction: afterRefreshPos?.scrollFraction,
        }
      }
      setCurrentBookId(cloudBookId)
      // Don't also try to restore position for the OLD book — let the
      // book-change effect re-trigger restore for the new book.
      return
    }
    const cloudPos = getSavedPosition(book.id)
    if (cloudPos) {
      // Don't sync if layout hasn't settled (totalPages=1 means stale state)
      if (totalPages <= 1) return
      // Bounds check: chapter must be valid for this book
      const totalChapters = options.totalChaptersRef?.current ?? 0
      if (cloudPos.chapterNumber < 1 || cloudPos.chapterNumber > totalChapters) return
      // Update the regression baseline whenever we successfully read cloud.
      // Even if we don't adopt the cloud value (because we're ahead), the
      // guard needs to know cloud's chapter so heartbeats can't regress below it.
      markCloudPosition(book.id, cloudPos)
      // The on-screen position is the source of truth for "where I'm reading
      // on THIS device". Only adopt cloud when it's clearly a different
      // session writing to it (chapter differs, or scrollFraction is materially
      // ahead of where we are right now).
      const localFraction = currentPage / Math.max(totalPages - 1, 1)
      const cloudFraction = cloudPos.scrollFraction ?? 0
      const chapterDiffers = cloudPos.chapterNumber !== currentChapter
      const cloudIsAhead = cloudPos.chapterNumber === currentChapter && cloudFraction > localFraction + 0.02
      const cloudIsBehind = cloudPos.chapterNumber === currentChapter && cloudFraction < localFraction - 0.02
      // Cloud "ahead" -> other device made progress; adopt it.
      // Cloud "behind" -> don't yank the user backwards on focus.
      if (chapterDiffers || cloudIsAhead) {
        // If our local savedPos is actually newer than cloud, prefer ours.
        const local = savedPos.current
        if (local?.updatedAt && cloudPos.updatedAt && local.updatedAt > cloudPos.updatedAt && !cloudIsAhead) {
          return
        }
        savedPos.current = cloudPos
        if (options.targetParagraphRef) options.targetParagraphRef.current = paragraphTargetFromPosition(cloudPos)
        // Prime dedup so the post-layout `onPageChange` echo doesn't write
        // the just-loaded value back to cloud (cross-device echo bug).
        markCloudLoaded(book.id, cloudPos)
        setCurrentChapter(cloudPos.chapterNumber)
        setCurrentPage(0)
        setReaderKey(k => k + 1)
      } else if (cloudIsBehind) {
        // No-op — log only so we can spot the pattern in DevTools if it
        // turns out the heartbeat is failing on this device.
        if (typeof window !== 'undefined') {
          (window as unknown as { __tinctSyncDebug?: { lastBehindAt: number; gap: number } }).__tinctSyncDebug = {
            lastBehindAt: Date.now(),
            gap: localFraction - cloudFraction,
          }
        }
      }
    }
  }, [
    book.id,
    currentChapter,
    currentPage,
    options.cloudRestoreSettled,
    options.libraryEmpty,
    options.showStore,
    options.storageReady,
    options.supabaseProviderRef,
    options.targetParagraphRef,
    options.totalChaptersRef,
    options.user,
    totalPages,
  ])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilitySync)
    return () => document.removeEventListener('visibilitychange', handleVisibilitySync)
  }, [handleVisibilitySync])

  const handleRemotePosition = useCallback((remotePos: ReadingPosition) => {
    const primaryEditionKey = options.primaryEditionKeyRef?.current
    const activeView = options.activeViewRef?.current ?? 0
    const readerSessionContext = options.readerSessionContextRef?.current
    const readerSessionRevision = options.readerSessionRevisionRef?.current ?? 0
    const dispatchReaderSession = options.dispatchReaderSessionRef?.current
    if (!remotePos || !remotePos.chapterNumber) return
    if (!primaryEditionKey || !readerSessionContext || !dispatchReaderSession) return
    if (!shouldApplyRemotePosition({ remoteBookId: remotePos.bookId, currentBookId: book.id })) return
    // Mark this as user-nav so the regression guard widens its window. Remote
    // progress may legitimately move backward when another device navigated.
    markUserNav(book.id)
    markCloudPosition(book.id, remotePos)
    markCloudLoaded(book.id, remotePos)
    dispatchReaderSession({
      type: 'RESTORE_POSITION',
      location: {
        bookId: remotePos.bookId,
        chapterNumber: remotePos.chapterNumber,
        paragraphIndex: remotePos.lastParagraphIndex,
        scrollFraction: remotePos.scrollFraction ?? 0,
        editionKey: primaryEditionKey,
        activeView: readerViewFromMobileIndex(activeView),
        source: 'remote',
        revision: readerSessionRevision,
      },
      context: readerSessionContext,
      source: 'remote',
      now: Date.now(),
    })
    if (options.targetParagraphRef) options.targetParagraphRef.current = paragraphTargetFromPosition(remotePos)
    savedPos.current = remotePos
    setCurrentChapter(remotePos.chapterNumber)
    setCurrentPage(0)
    setTotalPages(1)
    setReaderKey(k => k + 1)
  }, [
    book.id,
    options.activeViewRef,
    options.dispatchReaderSessionRef,
    options.primaryEditionKeyRef,
    options.readerSessionContextRef,
    options.readerSessionRevisionRef,
    options.targetParagraphRef,
  ])

  const handleBookChange = useCallback((bookId: string) => {
    if (bookId === currentBookId) {
      storage.set('tinct-current-book', bookId)
      replaceReaderUrl(bookId)
      return
    }

    appendReaderSessionShadow({
      kind: 'event',
      event: 'OPEN_BOOK',
      detail: { from: currentBookId, to: bookId },
    })
    perfStartSwitch(bookId)
    options.resetPerfMarkersRef?.current?.()
    storage.set('tinct-current-book', bookId)
    setCurrentBookId(bookId)
    // Reflect the open book in the URL. Critical for anonymous users who
    // can't persist `tinct-current-book` to localStorage — without the URL,
    // refresh drops them back to the BookStore. Also makes URLs sharable
    // for signed-in users. Uses replaceState to avoid history pollution.
    replaceReaderUrl(bookId)

    const pos = getSavedPosition(bookId)
    setCurrentChapter(pos?.chapterNumber || 1)
    setCurrentPage(0) // will be corrected by Reader from scrollFraction after layout
    setTotalPages(1) // Reset so useReadingPosition guard (totalPages <= 1) prevents stale saves
    options.resetReaderSurfacesRef?.current?.()
    savedPos.current = pos
    // Reset target paragraph so the previous book's explicit target doesn't leak.
    // Returning books restore from their saved page fraction.
    if (options.targetParagraphRef) options.targetParagraphRef.current = undefined
    options.clearMessagesRef?.current?.()
    setReaderKey(k => k + 1) // Force Reader remount with correct initialPage
  }, [currentBookId, options.clearMessagesRef, options.resetPerfMarkersRef, options.resetReaderSurfacesRef, options.targetParagraphRef])

  const handleNextChapter = useCallback(() => {
    const totalChapters = options.totalChaptersRef?.current ?? 0
    const readerSessionContext = options.readerSessionContextRef?.current
    const dispatchReaderSession = options.dispatchReaderSessionRef?.current
    if (currentChapter >= totalChapters || totalChapters <= 0) return false
    if (!readerSessionContext || !dispatchReaderSession) return false

    appendReaderSessionShadow({
      kind: 'event',
      event: 'USER_NEXT_CHAPTER',
      detail: { bookId: book.id, from: currentChapter, to: currentChapter + 1 },
    })
    markUserNav(book.id)
    dispatchReaderSession({
      type: 'USER_NEXT_CHAPTER',
      context: readerSessionContext,
      now: Date.now(),
    })

    const existing = storage.get<ReadingProgress>(progressKey(book.id))
    const completedProgress = buildReadingProgressUpdate({
      bookId: book.id,
      progressChapter: currentChapter,
      currentPage: 1,
      totalPages: 2,
      totalChapters,
      existing,
    })
    if (completedProgress) {
      storage.set<ReadingProgress>(progressKey(book.id), completedProgress)
    }

    if (options.targetParagraphRef) options.targetParagraphRef.current = undefined
    savedPos.current = {
      bookId: book.id,
      chapterNumber: currentChapter + 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
    }
    setCurrentPage(0)
    setTotalPages(1)
    setCurrentChapter(currentChapter + 1)
    setReaderKey(k => k + 1)
    if (typeof window !== 'undefined') {
      const w = window as Window & { __tinctNavDebug?: unknown[] }
      w.__tinctNavDebug = w.__tinctNavDebug || []
      w.__tinctNavDebug.push({ at: Date.now(), kind: 'next', from: currentChapter, to: currentChapter + 1, savedPos: { ...savedPos.current } })
      if (w.__tinctNavDebug.length > 40) w.__tinctNavDebug.shift()
    }
    return true
  }, [
    book.id,
    currentChapter,
    options.dispatchReaderSessionRef,
    options.readerSessionContextRef,
    options.targetParagraphRef,
    options.totalChaptersRef,
  ])

  const handlePrevChapter = useCallback(() => {
    const readerSessionContext = options.readerSessionContextRef?.current
    const dispatchReaderSession = options.dispatchReaderSessionRef?.current
    if (currentChapter <= 1) return false
    if (!readerSessionContext || !dispatchReaderSession) return false

    appendReaderSessionShadow({
      kind: 'event',
      event: 'USER_PREV_CHAPTER',
      detail: { bookId: book.id, from: currentChapter, to: currentChapter - 1 },
    })
    markUserNav(book.id)
    dispatchReaderSession({
      type: 'USER_PREV_CHAPTER',
      context: readerSessionContext,
      now: Date.now(),
    })

    if (options.targetParagraphRef) options.targetParagraphRef.current = undefined
    savedPos.current = {
      bookId: book.id,
      chapterNumber: currentChapter - 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 1,
    }
    setCurrentPage(0)
    setTotalPages(1)
    setCurrentChapter(currentChapter - 1)
    setReaderKey(k => k + 1)
    if (typeof window !== 'undefined') {
      const w = window as Window & { __tinctNavDebug?: unknown[] }
      w.__tinctNavDebug = w.__tinctNavDebug || []
      w.__tinctNavDebug.push({ at: Date.now(), kind: 'prev', from: currentChapter, to: currentChapter - 1, savedPos: { ...savedPos.current } })
      if (w.__tinctNavDebug.length > 40) w.__tinctNavDebug.shift()
    }
    return true
  }, [
    book.id,
    currentChapter,
    options.dispatchReaderSessionRef,
    options.readerSessionContextRef,
    options.targetParagraphRef,
  ])

  const handleNavigateToChapter = useCallback((chapter: number, paragraphIndex?: number, editionKey?: string) => {
    const readerSessionContext = options.readerSessionContextRef?.current
    const dispatchReaderSession = options.dispatchReaderSessionRef?.current
    if (!readerSessionContext || !dispatchReaderSession) return false

    if (options.targetParagraphRef) options.targetParagraphRef.current = paragraphIndex
    markUserNav(book.id)
    dispatchReaderSession({
      type: 'USER_SELECT_CHAPTER',
      chapterNumber: chapter,
      paragraphIndex,
      context: readerSessionContext,
      now: Date.now(),
    })

    // Always reset savedPos so the Reader lands on page 1 of the chosen
    // chapter (or on the target paragraph if one was passed). Even when the
    // user taps the current chapter in the TOC, snap to page 1 instead of
    // restoring the previous in-chapter position.
    savedPos.current = {
      bookId: book.id,
      chapterNumber: chapter,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: paragraphIndex !== undefined ? -1 : 0,
    }
    setCurrentPage(0)
    setTotalPages(1)
    if (chapter !== currentChapter) {
      setCurrentChapter(chapter)
    }
    setReaderKey(k => k + 1)
    if (typeof window !== 'undefined') {
      const w = window as Window & { __tinctNavDebug?: unknown[] }
      w.__tinctNavDebug = w.__tinctNavDebug || []
      w.__tinctNavDebug.push({ at: Date.now(), kind: 'navigateToChapter', from: currentChapter, to: chapter, paragraphIndex, editionKey, savedPos: { ...savedPos.current } })
      if (w.__tinctNavDebug.length > 60) w.__tinctNavDebug.shift()
    }
    return true
  }, [
    book.id,
    currentChapter,
    options.dispatchReaderSessionRef,
    options.readerSessionContextRef,
    options.targetParagraphRef,
  ])

  const handleBackToPosition = useCallback((target: { chapter: number; scrollFraction: number }) => {
    const readerSessionContext = options.readerSessionContextRef?.current
    const dispatchReaderSession = options.dispatchReaderSessionRef?.current
    if (!readerSessionContext || !dispatchReaderSession) return false

    if (options.targetParagraphRef) options.targetParagraphRef.current = undefined
    markUserNav(book.id)
    dispatchReaderSession({
      type: 'USER_SELECT_CHAPTER',
      chapterNumber: target.chapter,
      context: readerSessionContext,
      now: Date.now(),
    })
    savedPos.current = {
      bookId: book.id,
      chapterNumber: target.chapter,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: target.scrollFraction,
    }
    if (target.chapter !== currentChapter) {
      setCurrentChapter(target.chapter)
    }
    setReaderKey(k => k + 1)
    return true
  }, [
    book.id,
    currentChapter,
    options.dispatchReaderSessionRef,
    options.readerSessionContextRef,
    options.targetParagraphRef,
  ])

  const resetInvalidPosition = useCallback((args: { chapterNumber?: number; resetTotalPages?: boolean } = {}) => {
    if (options.targetParagraphRef) options.targetParagraphRef.current = undefined
    savedPos.current = null
    storage.delete(`position:${book.id}`)
    if (typeof args.chapterNumber === 'number') {
      setCurrentChapter(args.chapterNumber)
    }
    setCurrentPage(0)
    if (args.resetTotalPages) {
      setTotalPages(1)
    }
    setReaderKey(k => k + 1)
  }, [book.id, options.targetParagraphRef])

  return {
    currentBookId,
    setCurrentBookId,
    book,
    savedPos,
    currentChapter,
    setCurrentChapter,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    readerKey,
    setReaderKey,
    handleBookChange,
    hasRestoredFromCloud,
    handleVisibilitySync,
    handleRemotePosition,
    handleNextChapter,
    handlePrevChapter,
    handleNavigateToChapter,
    handleBackToPosition,
    resetInvalidPosition,
  }
}
