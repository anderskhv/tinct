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
    // Library membership is separate from reading history. Removing a book
    // hides it from "My Library" but keeps position/progress visible in the
    // redesigned library and available if the book is re-added.
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
