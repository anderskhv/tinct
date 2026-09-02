import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createLabHighlight,
  mergeLabHighlight,
  readLabHighlights,
  sameHighlightRange,
  writeLabHighlights,
  type LabHighlight,
  type LabHighlightColor,
  type LabHighlightRange,
} from './labHighlights'

export function useLabHighlights(chapterNumber: number) {
  const [highlights, setHighlights] = useState<LabHighlight[]>(() => readLabHighlights())
  const highlightsRef = useRef(highlights)
  highlightsRef.current = highlights

  useEffect(() => {
    writeLabHighlights(highlights)
  }, [highlights])

  const chapterHighlights = useMemo(
    () => highlights.filter(h => h.chapterNumber === chapterNumber),
    [highlights, chapterNumber],
  )

  const addOrReuse = useCallback((range: LabHighlightRange, color: LabHighlightColor = 'gold') => {
    const list = highlightsRef.current
    const existing = list.find(h => sameHighlightRange(h, range, chapterNumber))
    if (existing) return existing
    if (
      range.paragraphIndex === range.endParagraphIndex
      && range.toWord === range.fromWord + 1
    ) {
      const single = list.find(h => (
        h.chapterNumber === chapterNumber
        && h.paragraphIndex === range.paragraphIndex
        && h.fromWord === range.fromWord
        && h.endParagraphIndex === range.endParagraphIndex
        && h.toWord === range.toWord
      ))
      if (single) return single
    }
    const created = createLabHighlight(chapterNumber, range, color)
    setHighlights(current => mergeLabHighlight(current, created))
    return created
  }, [chapterNumber])

  const findRange = useCallback((range: LabHighlightRange) => (
    highlightsRef.current.find(h => sameHighlightRange(h, range, chapterNumber))
  ), [chapterNumber])

  const setColor = useCallback((id: string, color: LabHighlightColor) => {
    setHighlights(current => current.map(h => h.id === id ? { ...h, color } : h))
  }, [])

  const setNote = useCallback((id: string, note: string) => {
    setHighlights(current => current.map(h => h.id === id ? { ...h, note } : h))
  }, [])

  const keep = useCallback((id: string) => {
    setHighlights(current => current.map(h => h.id === id ? { ...h, kept: true } : h))
  }, [])

  const remove = useCallback((id: string) => {
    setHighlights(current => current.filter(h => h.id !== id))
  }, [])

  return {
    highlights,
    chapterHighlights,
    findRange,
    addOrReuse,
    setColor,
    setNote,
    keep,
    remove,
    setHighlights,
  }
}
