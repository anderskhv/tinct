import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReadingPosition } from '../types'
import type { SupabaseStorageProvider } from '../services/supabaseStorage'

/** How long before a device is considered idle (no user interaction) */
const IDLE_TIMEOUT_MS = 30_000

interface UseRemoteSyncOptions {
  bookId: string
  currentChapter: number
  currentPage: number
  totalPages: number
  provider: SupabaseStorageProvider | null
  /** Callback to apply a remote position (chapter change + reader remount) */
  onRemotePosition: (pos: ReadingPosition) => void
  /** User-facing chapter label for sync messages. */
  formatChapterLabel?: (chapterNumber: number) => string
}

interface UseRemoteSyncReturn {
  /** Whether follow mode is active */
  followMode: boolean
  /** Toggle follow mode on/off */
  setFollowMode: (on: boolean) => void
  /** Toast message to display (auto-clears after 3s) */
  syncToast: string | null
}

export function useRemoteSync({
  bookId,
  currentChapter,
  currentPage,
  totalPages,
  provider,
  onRemotePosition,
  formatChapterLabel,
}: UseRemoteSyncOptions): UseRemoteSyncReturn {
  const [followMode, setFollowMode] = useState(false)
  const [syncToast, setSyncToast] = useState<string | null>(null)
  const lastInteractionRef = useRef(Date.now())
  const onRemotePositionRef = useRef(onRemotePosition)
  onRemotePositionRef.current = onRemotePosition

  // Track user interaction to determine idle state
  useEffect(() => {
    const touch = () => { lastInteractionRef.current = Date.now() }
    window.addEventListener('pointerdown', touch, { passive: true })
    window.addEventListener('keydown', touch, { passive: true })
    window.addEventListener('scroll', touch, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', touch)
      window.removeEventListener('keydown', touch)
      window.removeEventListener('scroll', touch)
    }
  }, [])

  // Auto-clear toast after 3s
  useEffect(() => {
    if (!syncToast) return
    const timer = setTimeout(() => setSyncToast(null), 3000)
    return () => clearTimeout(timer)
  }, [syncToast])

  // Break out of follow mode on manual navigation
  const prevChapterRef = useRef(currentChapter)
  const prevPageRef = useRef(currentPage)
  const ignoreNextChangeRef = useRef(false)
  useEffect(() => {
    if (!followMode) {
      prevChapterRef.current = currentChapter
      prevPageRef.current = currentPage
      return
    }
    // If this change was triggered by a remote sync, don't break follow mode
    if (ignoreNextChangeRef.current) {
      ignoreNextChangeRef.current = false
      prevChapterRef.current = currentChapter
      prevPageRef.current = currentPage
      return
    }
    // Manual navigation while in follow mode — disable it
    if (currentChapter !== prevChapterRef.current || currentPage !== prevPageRef.current) {
      setFollowMode(false)
      setSyncToast('Follow mode disabled — you navigated manually')
    }
    prevChapterRef.current = currentChapter
    prevPageRef.current = currentPage
  }, [currentChapter, currentPage, followMode])

  // Listen for remote position changes
  useEffect(() => {
    if (!provider) return

    const posKey = `position:${bookId}`
    const unsubscribe = provider.onChange((key, value, meta) => {
      if (key !== posKey) return

      const remotePos = value as ReadingPosition
      if (!remotePos || !remotePos.chapterNumber) return

      const isIdle = Date.now() - lastInteractionRef.current > IDLE_TIMEOUT_MS
      const isSameBrowserTab = meta?.source === 'broadcast'

      if (followMode) {
        // Follow mode: always apply remote position
        ignoreNextChangeRef.current = true
        onRemotePositionRef.current(remotePos)
        return
      }

      if (isIdle) {
        // Auto-sync when idle
        ignoreNextChangeRef.current = true
        onRemotePositionRef.current(remotePos)
        if (!isSameBrowserTab) setSyncToast('Reading position synced')
      } else {
        // User is active — show indicator but don't hijack
        if (isSameBrowserTab) return
        const chLabel = formatChapterLabel?.(remotePos.chapterNumber) || `Chapter ${remotePos.chapterNumber}`
        setSyncToast(`Reading position changed elsewhere: ${chLabel}`)
      }
    })

    return unsubscribe
  }, [provider, bookId, followMode, formatChapterLabel])

  return {
    followMode,
    setFollowMode,
    syncToast,
  }
}
