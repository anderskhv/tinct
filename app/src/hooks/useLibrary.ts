import { useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../services/storage'

const LIBRARY_KEY = 'library'

/**
 * Manages the user's book library — which books they've added from the store.
 * Empty library = new user, show the store.
 */
export function useLibrary(storageReady = true) {
  const [libraryIds, setLibraryIds] = useState<string[]>(() => {
    return storage.get<string[]>(LIBRARY_KEY) || []
  })

  // Persist on change — skip first write when storageReady transitions to true
  // to avoid overwriting cloud data with empty defaults
  const writeUnlockedRef = useRef(false)
  useEffect(() => {
    if (!storageReady) return
    if (!writeUnlockedRef.current) {
      writeUnlockedRef.current = true
      return
    }
    storage.set(LIBRARY_KEY, libraryIds)
  }, [libraryIds, storageReady])

  const addBook = useCallback((bookId: string) => {
    setLibraryIds(prev => {
      if (prev.includes(bookId)) return prev
      return [...prev, bookId]
    })
  }, [])

  const removeBook = useCallback((bookId: string) => {
    setLibraryIds(prev => prev.filter(id => id !== bookId))
    // Clear per-book state so re-adding starts fresh on page 1 and re-triggers onboarding.
    // Highlights, notes, and chat history are preserved as user artifacts.
    storage.delete(`position:${bookId}`)
    storage.delete(`progress:${bookId}`)
    storage.delete(`reading-log:${bookId}`)
    storage.delete(`reading-speed:${bookId}`)
    storage.delete(`book-onboarded:${bookId}`)
    // Also clear legacy raw-localStorage flags so a cross-device restore
    // doesn't resurrect them via the startup migration.
    try {
      localStorage.removeItem(`tinct-book-onboarded-${bookId}`)
      localStorage.removeItem(`tinct-progress-prompt-dismissed-${bookId}`)
    } catch { /* ignore */ }
  }, [])

  const hasBook = useCallback((bookId: string) => {
    return libraryIds.includes(bookId)
  }, [libraryIds])

  // Re-read from storage after provider swap (cloud sync)
  const refreshFromStorage = useCallback(() => {
    const saved = storage.get<string[]>(LIBRARY_KEY)
    if (saved) setLibraryIds(saved)
  }, [])

  const isEmpty = libraryIds.length === 0

  return { libraryIds, addBook, removeBook, hasBook, isEmpty, refreshFromStorage }
}
