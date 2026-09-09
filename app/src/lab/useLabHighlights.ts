import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createLabHighlight,
  highlightContainsRange,
  mergeLabHighlight,
  readLabHighlights,
  sameHighlightRange,
  writeLabHighlights,
  type LabHighlight,
  type LabHighlightColor,
  type LabHighlightRange,
} from './labHighlights'

export function useLabHighlights(chapterNumber: number, scope?: { bookId: string; editionKey: string }) {
  const [highlights, setHighlights] = useState<LabHighlight[]>(() => readLabHighlights())
  const highlightsRef = useRef(highlights)
  highlightsRef.current = highlights
  const inScope = (highlight: LabHighlight, editionKey = scope?.editionKey) => !scope || (highlight.bookId === scope.bookId && highlight.editionKey === editionKey)
  const visibleHighlights = useMemo(() => highlights.filter(h => inScope(h)), [highlights, scope?.bookId, scope?.editionKey])

  useEffect(() => {
    writeLabHighlights(highlights)
  }, [highlights])

  const chapterHighlights = useMemo(
    () => visibleHighlights.filter(h => h.chapterNumber === chapterNumber),
    [highlights, chapterNumber, scope?.bookId, scope?.editionKey],
  )

  const addOrReuse = useCallback((range: LabHighlightRange, color: LabHighlightColor = 'gold', editionKey = scope?.editionKey) => {
    const list = highlightsRef.current.filter(h => inScope(h, editionKey))
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
    if (scope) Object.assign(created, { ...scope, editionKey })
    setHighlights(current => mergeLabHighlight(current, created))
    return created
  }, [chapterNumber, scope?.bookId, scope?.editionKey])

  const findRange = useCallback((range: LabHighlightRange, editionKey = scope?.editionKey) => (
    highlightsRef.current.find(h => inScope(h, editionKey) && sameHighlightRange(h, range, chapterNumber))
  ), [chapterNumber, scope?.bookId, scope?.editionKey])

  const findContainingRange = useCallback((range: LabHighlightRange, editionKey = scope?.editionKey) => (
    [...highlightsRef.current]
      .reverse()
      .find(h => inScope(h, editionKey) && highlightContainsRange(h, range, chapterNumber))
  ), [chapterNumber, scope?.bookId, scope?.editionKey])

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
    highlights: visibleHighlights,
    allHighlights: highlights,
    unassignedHighlights: highlights.filter(h => !h.bookId || !h.editionKey),
    chapterHighlights,
    findRange,
    findContainingRange,
    addOrReuse,
    setColor,
    setNote,
    keep,
    remove,
    setHighlights,
  }
}
