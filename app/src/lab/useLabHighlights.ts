import { bibleHighlightsCarryAcross } from '../data/bibleEditionChapters'
import { getBook } from '../data/bookRegistry'
import { loadChapterText } from '../readingMemory'
import { projectHighlight } from './labHighlightProjection'
import { currentContentRevision } from '../data/editionContentRevisions'
import { highlightOffCurrentText } from './labHighlightContentMigration'
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

export function useLabHighlights(chapterNumber: number, scope?: { bookId: string; editionKey: string; paragraphs?: string[]; compareEditionKey?: string; compareParagraphs?: string[] }) {
  const [highlights, setHighlights] = useState<LabHighlight[]>(() => readLabHighlights())
  const highlightsRef = useRef(highlights)
  highlightsRef.current = highlights
  const [sources, setSources] = useState<Record<string, string[]>>({})
  useEffect(() => {
    if (!scope) return
    let active = true
    const keys = [...new Set(highlights.filter(h => h.bookId === scope.bookId && h.chapterNumber === chapterNumber && h.editionKey).map(h => h.editionKey!))]
    for (const editionKey of keys) {
      const key = `${scope.bookId}:${chapterNumber}:${editionKey}`
      if (sources[key]) continue
      void loadChapterText({ bookId: scope.bookId, editionKey, chapterNumber }).then(chapter => {
        if (active && chapter) setSources(current => ({ ...current, [key]: chapter.paragraphs }))
      }).catch(() => {})
    }
    return () => { active = false }
  }, [highlights, chapterNumber, scope?.bookId, sources])
  const projected = (editionKey = scope?.editionKey) => {
    if (!scope) return highlightsRef.current
    const target = editionKey === scope.editionKey ? scope.paragraphs : editionKey === scope.compareEditionKey ? scope.compareParagraphs : undefined
    return highlightsRef.current.flatMap(h => {
      if (h.bookId !== scope.bookId) return []
      // Kept, but its coordinates are in text a structural release has replaced.
      if (highlightOffCurrentText(h)) return []
      if (h.editionKey === editionKey) return [h]
      if (!target?.length || h.chapterNumber !== chapterNumber || !h.editionKey) return []
      // Greek Esther and Greek Daniel 3 against the Hebrew: stays in its own edition.
      if (scope.bookId === 'bible' && !bibleHighlightsCarryAcross(h.editionKey, editionKey ?? '', chapterNumber)) return []
      const displayedSource = h.editionKey === scope.editionKey ? scope.paragraphs : h.editionKey === scope.compareEditionKey ? scope.compareParagraphs : undefined
      const source = displayedSource?.length ? displayedSource : sources[`${scope.bookId}:${chapterNumber}:${h.editionKey}`]
      const projection = source?.length ? projectHighlight(h, source, target, [h.editionKey, editionKey].every(key => getBook(scope.bookId)?.editions.find(edition => edition.key === key)?.aligned === true)) : null
      return projection ? [projection] : []
    })
  }
  const inScope = (highlight: LabHighlight, editionKey = scope?.editionKey) => !scope || (highlight.bookId === scope.bookId && highlight.editionKey === editionKey)
  const visibleHighlights = useMemo(() => projected(), [highlights, sources, chapterNumber, scope?.bookId, scope?.editionKey, scope?.paragraphs, scope?.compareEditionKey, scope?.compareParagraphs])

  useEffect(() => {
    writeLabHighlights(highlights)
  }, [highlights])

  const chapterHighlights = useMemo(
    () => visibleHighlights.filter(h => h.chapterNumber === chapterNumber),
    [visibleHighlights, chapterNumber],
  )

  const addOrReuse = useCallback((range: LabHighlightRange, color: LabHighlightColor = 'gold', editionKey = scope?.editionKey) => {
    const list = highlightsRef.current.filter(h => inScope(h, editionKey) && !highlightOffCurrentText(h))
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
    if (scope) {
      const contentRevision = currentContentRevision(scope.bookId, editionKey)
      Object.assign(created, { bookId: scope.bookId, editionKey, ...(contentRevision ? { contentRevision } : {}) })
    }
    setHighlights(current => mergeLabHighlight(current, created))
    return created
  }, [chapterNumber, scope?.bookId, scope?.editionKey])

  const findRange = useCallback((range: LabHighlightRange, editionKey = scope?.editionKey) => (
    projected(editionKey).find(h => sameHighlightRange(h, range, chapterNumber))
  ), [chapterNumber, scope?.bookId, scope?.editionKey, scope?.paragraphs, scope?.compareEditionKey, scope?.compareParagraphs, sources, highlights])

  const findContainingRange = useCallback((range: LabHighlightRange, editionKey = scope?.editionKey) => (
    projected(editionKey)
      .reverse()
      .find(h => highlightContainsRange(h, range, chapterNumber))
  ), [chapterNumber, scope?.bookId, scope?.editionKey, scope?.paragraphs, scope?.compareEditionKey, scope?.compareParagraphs, sources, highlights])

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
    compareHighlights: projected(scope?.compareEditionKey).filter(h => h.chapterNumber === chapterNumber),
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
