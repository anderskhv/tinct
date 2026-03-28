import { useState, useCallback, useEffect } from 'react'
import { storage } from '../services/storage'
import type { Highlight, HighlightColor, EditionKey } from '../types'

function storageKey(bookId: string, chapterNumber: number): string {
  return `highlights:${bookId}:${chapterNumber}`
}

let idCounter = 0
function generateId(): string {
  return `hl_${Date.now()}_${++idCounter}`
}

export function useHighlights(bookId: string, chapterNumber: number) {
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    return storage.get<Highlight[]>(storageKey(bookId, chapterNumber)) || []
  })

  // Reload when chapter changes
  useEffect(() => {
    const stored = storage.get<Highlight[]>(storageKey(bookId, chapterNumber)) || []
    setHighlights(stored)
  }, [bookId, chapterNumber])

  // Persist on change
  useEffect(() => {
    storage.set(storageKey(bookId, chapterNumber), highlights)
  }, [highlights, bookId, chapterNumber])

  const addHighlight = useCallback((
    editionKey: EditionKey,
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
  ): Highlight => {
    const highlight: Highlight = {
      id: generateId(),
      bookId,
      editionKey,
      chapterNumber,
      paragraphIndex,
      startOffset,
      endOffset,
      text,
      color,
      timestamp: Date.now(),
    }
    setHighlights(prev => [...prev, highlight])
    return highlight
  }, [bookId, chapterNumber])

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id))
  }, [])

  const updateHighlightNote = useCallback((id: string, note: string) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note } : h))
  }, [])

  const updateHighlightColor = useCallback((id: string, color: HighlightColor) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, color } : h))
  }, [])

  /** Get highlights for a specific edition only */
  const getEditionHighlights = useCallback((editionKey: EditionKey) => {
    return highlights.filter(h => h.editionKey === editionKey)
  }, [highlights])

  /** Get all highlights across all chapters for a book (for end-of-book summary) */
  const getAllBookHighlights = useCallback((): Highlight[] => {
    return storage.getAll<Highlight[]>(`highlights:${bookId}:`).flat()
  }, [bookId])

  return {
    highlights,
    addHighlight,
    removeHighlight,
    updateHighlightNote,
    updateHighlightColor,
    getEditionHighlights,
    getAllBookHighlights,
  }
}
