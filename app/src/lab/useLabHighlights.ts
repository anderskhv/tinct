import type {ChapterSelectionPart} from './labChapterSelection'
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
import {
  applyLabHighlightSet,
  createLabHighlightCloud,
  createLabHighlightCloudWriter,
  labHighlightBucket,
  labHighlightSetFor,
  LAB_HIGHLIGHTS_UNASSIGNED,
  localLabHighlightBuckets,
  readLabHighlightTombstones,
  recordLabHighlightDeletions,
  type LabHighlightCloudWriter,
  type LabHighlightSet,
} from './labHighlightSync'

function bucketSignatures(list: LabHighlight[]): Map<string, string> {
  const grouped = new Map<string, LabHighlight[]>()
  for (const highlight of list) {
    const bucket = labHighlightBucket(highlight)
    grouped.set(bucket, [...(grouped.get(bucket) ?? []), highlight])
  }
  return new Map([...grouped].map(([bucket, items]) => [bucket, JSON.stringify(items)]))
}

export function useLabHighlights(chapterNumber: number, scope?: {
  bookId: string
  editionKey: string
  paragraphs?: string[]
  compareEditionKey?: string
  compareParagraphs?: string[]
  /** Signed-in account: highlights and notes also sync through its `lab-highlights:{bookId}` rows. Absent or null = this device only. */
  userId?: string | null
}) {
  const [highlights, setHighlights] = useState<LabHighlight[]>(() => readLabHighlights())
  const highlightsRef = useRef(highlights)
  highlightsRef.current = highlights
  const userId = scope?.userId ?? null
  const bookId = scope?.bookId
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

  // Signed in: one serialized writer per account. Merges that may carry marks
  // from another device fold into the list here.
  // Created in an effect (not a memo) so StrictMode's mount/unmount/mount
  // ends with a live writer, and sign-out disposes it.
  const [cloudWriter, setCloudWriter] = useState<LabHighlightCloudWriter | null>(null)
  useEffect(() => {
    const cloud = userId ? createLabHighlightCloud(userId) : null
    if (!cloud) { setCloudWriter(null); return }
    const writer = createLabHighlightCloudWriter(cloud, {
      onMerged: (bucket: string, set: LabHighlightSet) => setHighlights(current => applyLabHighlightSet(current, bucket, set)),
    })
    setCloudWriter(writer)
    return () => writer.dispose()
  }, [userId])

  const savedRef = useRef<Map<string, string> | null>(null)
  useEffect(() => {
    writeLabHighlights(highlights)
    const next = bucketSignatures(highlights)
    const previous = savedRef.current
    savedRef.current = next
    if (!cloudWriter || !previous) return
    const tombstones = readLabHighlightTombstones()
    for (const bucket of new Set([...previous.keys(), ...next.keys()])) {
      if (previous.get(bucket) !== next.get(bucket)) cloudWriter.push(bucket, labHighlightSetFor(bucket, highlights, tombstones))
    }
  }, [highlights, cloudWriter])

  // On sign-in: bring every book this device holds marks for into the
  // account (a merge, never an overwrite), so nothing is lost when sign-out
  // later clears the device copy.
  useEffect(() => {
    if (!cloudWriter) return
    for (const bucket of localLabHighlightBuckets()) {
      if (bucket !== bookId) void cloudWriter.sync(bucket)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudWriter])

  // The open book (and marks without a recorded book, listed in Contents):
  // on open, book change, reconnect and return to the tab.
  useEffect(() => {
    if (!cloudWriter || !bookId) return
    const run = () => {
      void cloudWriter.sync(bookId)
      void cloudWriter.sync(LAB_HIGHLIGHTS_UNASSIGNED)
    }
    run()
    const onVisible = () => { if (document.visibilityState === 'visible') run() }
    window.addEventListener('online', run)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('online', run)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [cloudWriter, bookId])

  const chapterHighlights = useMemo(
    () => visibleHighlights.filter(h => h.chapterNumber === chapterNumber),
    [visibleHighlights, chapterNumber],
  )

  const addOrReuse = useCallback((range: LabHighlightRange, color: LabHighlightColor = 'gold', editionKey = scope?.editionKey, targetChapter = chapterNumber) => {
    const list = highlightsRef.current.filter(h => inScope(h, editionKey) && !highlightOffCurrentText(h))
    const existing = list.find(h => sameHighlightRange(h, range, targetChapter))
    if (existing) return existing
    if (
      range.paragraphIndex === range.endParagraphIndex
      && range.toWord === range.fromWord + 1
    ) {
      const single = list.find(h => (
        h.chapterNumber === targetChapter
        && h.paragraphIndex === range.paragraphIndex
        && h.fromWord === range.fromWord
        && h.endParagraphIndex === range.endParagraphIndex
        && h.toWord === range.toWord
      ))
      if (single) return single
    }
    const created = createLabHighlight(targetChapter, range, color)
    if (scope) {
      const contentRevision = currentContentRevision(scope.bookId, editionKey)
      Object.assign(created, { bookId: scope.bookId, editionKey, ...(contentRevision ? { contentRevision } : {}) })
    }
    setHighlights(current => mergeLabHighlight(current, created))
    return created
  }, [chapterNumber, scope?.bookId, scope?.editionKey])

  const addGroup = useCallback((parts: ChapterSelectionPart[], color: LabHighlightColor = 'gold', editionKey = scope?.editionKey) => {
    const groupId='hg-'+crypto.randomUUID(),groupText=parts.map(part=>part.range.text).join(' ')
    const created=parts.map(part=>{
      const mark=createLabHighlight(part.chapterNumber,part.range,color)
      const contentRevision=scope ? currentContentRevision(scope.bookId,editionKey) : null
      return {...mark,groupId,groupText,...(scope?{bookId:scope.bookId,editionKey,...(contentRevision?{contentRevision}:{})}:{})}
    })
    setHighlights(current=>[...current,...created])
    return created
  },[scope?.bookId,scope?.editionKey])

  const findRange = useCallback((range: LabHighlightRange, editionKey = scope?.editionKey, targetChapter = chapterNumber) => (
    projected(editionKey).find(h => sameHighlightRange(h, range, targetChapter))
  ), [chapterNumber, scope?.bookId, scope?.editionKey, scope?.paragraphs, scope?.compareEditionKey, scope?.compareParagraphs, sources, highlights])

  const findContainingRange = useCallback((range: LabHighlightRange, editionKey = scope?.editionKey, targetChapter = chapterNumber) => (
    projected(editionKey)
      .reverse()
      .find(h => highlightContainsRange(h, range, targetChapter))
  ), [chapterNumber, scope?.bookId, scope?.editionKey, scope?.paragraphs, scope?.compareEditionKey, scope?.compareParagraphs, sources, highlights])

  const setColor = useCallback((id: string, color: LabHighlightColor) => {
    setHighlights(current => {const group=current.find(h=>h.id===id)?.groupId;const updatedAt=Date.now();return current.map(h=>h.id===id || group && h.groupId===group ? {...h,color,updatedAt}:h)})
  }, [])

  const setNote = useCallback((id: string, note: string) => {
    setHighlights(current => {const group=current.find(h=>h.id===id)?.groupId;const updatedAt=Date.now();return current.map(h=>h.id===id || group && h.groupId===group ? {...h,note,updatedAt}:h)})
  }, [])

  const keep = useCallback((id: string) => {
    setHighlights(current => { const group = current.find(h => h.id === id)?.groupId; const updatedAt = Date.now(); return current.map(h => h.id === id || group && h.groupId === group ? { ...h, kept: true, updatedAt } : h) })
  }, [])

  const remove = useCallback((id: string) => {
    const group = highlightsRef.current.find(h => h.id === id)?.groupId
    // Tombstones first, so the push that follows carries the deletion.
    recordLabHighlightDeletions(highlightsRef.current.filter(h => h.id === id || (group && h.groupId === group)))
    setHighlights(current => {const group=current.find(h=>h.id===id)?.groupId;return current.filter(h=>h.id!==id && (!group || h.groupId!==group))})
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
    addGroup,
    setColor,
    setNote,
    keep,
    remove,
    setHighlights,
  }
}
