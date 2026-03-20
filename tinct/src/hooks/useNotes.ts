import { useState, useCallback, useEffect } from 'react'
import { storage } from '../services/storage'
import type { Note } from '../types'

function storageKey(bookId: string, chapterNumber: number): string {
  return `notes:${bookId}:${chapterNumber}`
}

let idCounter = 0
function generateId(): string {
  return `note_${Date.now()}_${++idCounter}`
}

export function useNotes(bookId: string, chapterNumber: number) {
  const [notes, setNotes] = useState<Note[]>(() => {
    return storage.get<Note[]>(storageKey(bookId, chapterNumber)) || []
  })

  // Reload when chapter changes
  useEffect(() => {
    const stored = storage.get<Note[]>(storageKey(bookId, chapterNumber)) || []
    setNotes(stored)
  }, [bookId, chapterNumber])

  // Persist on change
  useEffect(() => {
    storage.set(storageKey(bookId, chapterNumber), notes)
  }, [notes, bookId, chapterNumber])

  const addNote = useCallback((
    content: string,
    sourceType: Note['sourceType'] = 'freeform',
    sourceId?: string,
  ): Note => {
    const note: Note = {
      id: generateId(),
      bookId,
      chapterNumber,
      content,
      sourceType,
      sourceId,
      timestamp: Date.now(),
    }
    setNotes(prev => [...prev, note])
    return note
  }, [bookId, chapterNumber])

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }, [])

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, timestamp: Date.now() } : n))
  }, [])

  /** Replace all notes (used by AI cleanup) */
  const replaceAllNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes)
  }, [])

  /** Get all notes across all chapters for a book (for end-of-book summary) */
  const getAllBookNotes = useCallback((): Note[] => {
    return storage.getAll<Note[]>(`notes:${bookId}:`).flat()
  }, [bookId])

  return {
    notes,
    addNote,
    deleteNote,
    updateNote,
    replaceAllNotes,
    getAllBookNotes,
  }
}
