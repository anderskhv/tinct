import { useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../services/storage'
import type { Highlight, HighlightColor, EditionKey } from '../types'

function storageKey(bookId: string, chapterNumber: number): string {
  return `highlights:${bookId}:${chapterNumber}`
}

let idCounter = 0
function generateId(): string {
  return `hl_${Date.now()}_${++idCounter}`
}

function normalizedText(text: string): string {
  return text.replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
}

function shouldMergeHighlights(a: Highlight, b: Pick<Highlight, 'editionKey' | 'paragraphIndex' | 'startOffset' | 'endOffset'>, paragraphText?: string): boolean {
  if (a.editionKey !== b.editionKey || a.paragraphIndex !== b.paragraphIndex) return false
  const gapStart = Math.min(a.endOffset, b.endOffset)
  const gapEnd = Math.max(a.startOffset, b.startOffset)
  if (gapEnd <= gapStart) return true
  if (!paragraphText) return false
  const gap = normalizedText(paragraphText).slice(gapStart, gapEnd)
  return gap.length <= 40 && !/[.!?。！？]/.test(gap)
}

export function useHighlights(bookId: string, chapterNumber: number, totalChapters?: number, heavyLoadedTick = 0) {
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    return storage.get<Highlight[]>(storageKey(bookId, chapterNumber)) || []
  })

  // Cross-book bleed guard — see useNotes for context. Same fix.
  function isChapterInBoundsForBook(): boolean {
    if (!totalChapters || totalChapters <= 0) return true
    return chapterNumber >= 1 && chapterNumber <= totalChapters
  }

  // Reload when chapter changes OR after Phase B heavy-load completes.
  useEffect(() => {
    const stored = storage.get<Highlight[]>(storageKey(bookId, chapterNumber)) || []
    setHighlights(stored)
  }, [bookId, chapterNumber, heavyLoadedTick])

  // Persist on change. Skip empty-array writes for nonexistent keys (state-init
  // noise) and out-of-bounds chapters (cross-book bleed).
  const prevPersistBookIdRef = useRef(bookId)
  useEffect(() => {
    if (prevPersistBookIdRef.current !== bookId) {
      prevPersistBookIdRef.current = bookId
      return
    }
    if (!isChapterInBoundsForBook()) return
    if (highlights.length === 0 && storage.get<Highlight[]>(storageKey(bookId, chapterNumber)) === null) return
    storage.set(storageKey(bookId, chapterNumber), highlights)
  }, [highlights, bookId, chapterNumber])

  const addHighlight = useCallback((
    editionKey: EditionKey,
    paragraphIndex: number,
    startOffset: number,
    endOffset: number,
    text: string,
    color: HighlightColor,
    paragraphText?: string,
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
    setHighlights(prev => {
      const mergeIndex = prev.findIndex(h => shouldMergeHighlights(h, highlight, paragraphText))
      if (mergeIndex < 0) return [...prev, highlight]

      const existing = prev[mergeIndex]
      const mergedStart = Math.min(existing.startOffset, highlight.startOffset)
      const mergedEnd = Math.max(existing.endOffset, highlight.endOffset)
      const source = paragraphText ? normalizedText(paragraphText) : ''
      const merged: Highlight = {
        ...existing,
        startOffset: mergedStart,
        endOffset: mergedEnd,
        text: source ? source.slice(mergedStart, mergedEnd) : `${existing.text} ${highlight.text}`.trim(),
        timestamp: Date.now(),
      }
      return prev.map((h, i) => i === mergeIndex ? merged : h)
    })
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
