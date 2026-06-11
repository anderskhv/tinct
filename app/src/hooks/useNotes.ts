import { useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../services/storage'
import type { Note } from '../types'

function storageKey(bookId: string, chapterNumber: number): string {
  return `notes:${bookId}:${chapterNumber}`
}

let idCounter = 0
function generateId(): string {
  return `note_${Date.now()}_${++idCounter}`
}

export function useNotes(bookId: string, chapterNumber: number, totalChapters?: number, heavyLoadedTick = 0) {
  const [notes, setNotes] = useState<Note[]>(() => {
    return storage.get<Note[]>(storageKey(bookId, chapterNumber)) || []
  })

  // Cross-book bleed guard. When bookId switches, `chapterNumber` may still
  // hold the OLD book's chapter for one render. Without this, an empty-array
  // write fires under `notes:newBookId:OLDchapter` — exactly how phantom
  // entries like `notes:the-awakening:345` got created (B1, 2026-05-06).
  function isChapterInBoundsForBook(): boolean {
    if (!totalChapters || totalChapters <= 0) return true // unknown — don't block
    return chapterNumber >= 1 && chapterNumber <= totalChapters
  }

  // Reload when chapter changes OR when heavy-load completes (notes are in
  // Phase B background load, may not be cached on first chapter-open).
  useEffect(() => {
    const stored = storage.get<Note[]>(storageKey(bookId, chapterNumber)) || []
    setNotes(stored)
  }, [bookId, chapterNumber, heavyLoadedTick])

  // Persist on change. Skip empty-array writes for keys that don't exist yet —
  // those are nearly always state-init noise (newly-mounted hook for a chapter
  // with no notes) rather than user actions. Also skip out-of-bounds chapters.
  const prevPersistBookIdRef = useRef(bookId)
  useEffect(() => {
    if (prevPersistBookIdRef.current !== bookId) {
      prevPersistBookIdRef.current = bookId
      return
    }
    if (!isChapterInBoundsForBook()) return
    if (notes.length === 0 && storage.get<Note[]>(storageKey(bookId, chapterNumber)) === null) return
    storage.set(storageKey(bookId, chapterNumber), notes)
  }, [notes, bookId, chapterNumber])

  const addNote = useCallback((
    content: string,
    sourceType: Note['sourceType'] = 'freeform',
    sourceId?: string,
    anchor?: Pick<Note, 'paragraphIndex' | 'editionKey' | 'quote'>,
  ): Note => {
    const note: Note = {
      id: generateId(),
      bookId,
      chapterNumber,
      ...anchor,
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
