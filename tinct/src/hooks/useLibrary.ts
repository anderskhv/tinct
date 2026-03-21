import { useState, useCallback, useEffect } from 'react'
import { storage } from '../services/storage'

const LIBRARY_KEY = 'library'

/**
 * Manages the user's book library — which books they've added from the store.
 * Empty library = new user, show the store.
 */
export function useLibrary() {
  const [libraryIds, setLibraryIds] = useState<string[]>(() => {
    return storage.get<string[]>(LIBRARY_KEY) || []
  })

  // Persist on change
  useEffect(() => {
    storage.set(LIBRARY_KEY, libraryIds)
  }, [libraryIds])

  const addBook = useCallback((bookId: string) => {
    setLibraryIds(prev => {
      if (prev.includes(bookId)) return prev
      return [...prev, bookId]
    })
  }, [])

  const removeBook = useCallback((bookId: string) => {
    setLibraryIds(prev => prev.filter(id => id !== bookId))
  }, [])

  const hasBook = useCallback((bookId: string) => {
    return libraryIds.includes(bookId)
  }, [libraryIds])

  const isEmpty = libraryIds.length === 0

  return { libraryIds, addBook, removeBook, hasBook, isEmpty }
}
