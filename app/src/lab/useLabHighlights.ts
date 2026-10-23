import type {ChapterSelectionPart} from './labChapterSelection'
import { bibleHighlightsCarryAcross } from '../data/bibleEditionChapters'
import { getBook } from '../data/bookRegistry'
import { loadChapterText } from '../readingMemory'
import { projectHighlight } from './labHighlightProjection'
import { currentContentRevision } from '../data/editionContentRevisions'
import { highlightOffCurrentText } from './labHighlightContentMigration'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isUserBookId, userBookHex } from './userBook/userBookId'
import { importOwnTextMarks, listenOwnTextMarks, mergeIncomingLabMarks, noteOwnTextMarks, ownTextMarksBelongTo, ownTextMarksGuarded, ownTextMarksCanonical, readOwnedTextMarks } from './userBook/ownTextMarksSync'
import { userBookOwner } from './userBook/userBookStore'
import {
  createLabChapterNote,
  createLabHighlight,
  highlightContainsRange,
  isLabChapterNote,
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
  /** A highlight from a shared link (/q/{id}): shown on its passage, never saved. */
  shared?: LabHighlight | null
}) {
  const [highlights, setHighlights] = useState<LabHighlight[]>(() => {
    const all = readLabHighlights()
    const hex = scope?.bookId && isUserBookId(scope.bookId) ? userBookHex(scope.bookId) : null
    if (hex && ownTextMarksCanonical(hex)) return [...all.filter(mark => mark.bookId !== scope?.bookId), ...readOwnedTextMarks(hex, userBookOwner())]
    return hex && ownTextMarksGuarded(hex) && !ownTextMarksBelongTo(hex, userBookOwner()) ? all.filter(mark => mark.bookId !== scope?.bookId) : all
  })
  const privateHex = scope?.bookId && isUserBookId(scope.bookId) ? userBookHex(scope.bookId) : null
  const ownerProof = !privateHex || !ownTextMarksGuarded(privateHex) || ownTextMarksBelongTo(privateHex, userBookOwner())
  const safeHighlights = ownerProof ? highlights : highlights.filter(mark => mark.bookId !== scope?.bookId)
  const highlightsRef = useRef(highlights)
  highlightsRef.current = safeHighlights
  const userId = scope?.userId ?? null
  const bookId = scope?.bookId
  const [sources, setSources] = useState<Record<string, string[]>>({})
  useEffect(() => {
    if (!scope) return
    let active = true
    const keys = [...new Set(safeHighlights.filter(h => h.bookId === scope.bookId && h.chapterNumber === chapterNumber && h.editionKey).map(h => h.editionKey!))]
    for (const editionKey of keys) {
      const key = `${scope.bookId}:${chapterNumber}:${editionKey}`
      if (sources[key]) continue
      void loadChapterText({ bookId: scope.bookId, editionKey, chapterNumber }).then(chapter => {
        if (active && chapter) setSources(current => ({ ...current, [key]: chapter.paragraphs }))
      }).catch(() => {})
    }
    return () => { active = false }
  }, [safeHighlights, chapterNumber, scope?.bookId, sources])
  const projected = (editionKey = scope?.editionKey) => {
    if (!scope) return highlightsRef.current
    const target = editionKey === scope.editionKey ? scope.paragraphs : editionKey === scope.compareEditionKey ? scope.compareParagraphs : undefined
    return highlightsRef.current.flatMap(h => {
      if (h.bookId !== scope.bookId) return []
      // A chapter note has no passage to paint or project (chapterNotes below).
      if (isLabChapterNote(h)) return []
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
  const visibleHighlights = useMemo(() => projected(), [highlights, ownerProof, sources, chapterNumber, scope?.bookId, scope?.editionKey, scope?.paragraphs, scope?.compareEditionKey, scope?.compareParagraphs])

  // Signed in: one serialized writer per account. Merges that may carry marks
  // from another device fold into the list here.
  // Created in an effect (not a memo) so StrictMode's mount/unmount/mount
  // ends with a live writer, and sign-out disposes it.
  const [cloudWriter, setCloudWriter] = useState<LabHighlightCloudWriter | null>(null)
  useEffect(() => {
    const cloud = userId ? createLabHighlightCloud(userId) : null
    if (!cloud) { setCloudWriter(null); return }
    const writer = createLabHighlightCloudWriter(cloud, {
      onMerged: (bucket: string, set: LabHighlightSet) => {
        if (isUserBookId(bucket)) return
        setHighlights(current => applyLabHighlightSet(current, bucket, set))
      },
    })
    setCloudWriter(writer)
    return () => writer.dispose()
  }, [userId])

  const savedRef = useRef<Map<string, string> | null>(null)
  useEffect(() => {
    const hex = bookId && isUserBookId(bookId) ? userBookHex(bookId) : null
    if (hex && ownTextMarksCanonical(hex)) { noteOwnTextMarks(hex, highlights); return }
    if (hex && ownTextMarksGuarded(hex) && !ownTextMarksBelongTo(hex, userBookOwner())) return
    writeLabHighlights(highlights)
    if (hex) noteOwnTextMarks(hex, highlights)
    const next = bucketSignatures(highlights)
    const previous = savedRef.current
    savedRef.current = next
    if (!cloudWriter || !previous) return
    const tombstones = readLabHighlightTombstones()
    for (const bucket of new Set([...previous.keys(), ...next.keys()])) {
      if (!isUserBookId(bucket) && previous.get(bucket) !== next.get(bucket)) cloudWriter.push(bucket, labHighlightSetFor(bucket, highlights, tombstones))
    }
  }, [highlights, cloudWriter])

  // Private EPUB sync can receive a newer revision while this reader remains open.
  // Only records in this one owned book are merged; unrelated marks retain their identities.
  useEffect(() => {
    if (!bookId || !isUserBookId(bookId)) return
    const hex = userBookHex(bookId)
    if (!hex) return
    return listenOwnTextMarks(bookId, (items, edition) => {
      setHighlights(current => !ownTextMarksBelongTo(hex, userBookOwner())
        ? current.filter(mark => mark.bookId !== bookId) : mergeIncomingLabMarks(current, items, hex, edition))
    })
  }, [bookId])

  // On sign-in: bring every book this device holds marks for into the
  // account (a merge, never an overwrite), so nothing is lost when sign-out
  // later clears the device copy.
  useEffect(() => {
    if (!cloudWriter) return
    for (const bucket of localLabHighlightBuckets()) {
      if (bucket !== bookId && !isUserBookId(bucket)) void cloudWriter.sync(bucket)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudWriter])

  // The open book (and marks without a recorded book, listed in Contents):
  // on open, book change, reconnect and return to the tab.
  useEffect(() => {
    if (!cloudWriter || !bookId || isUserBookId(bookId)) return
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

  // Notes on whole chapters of this book. They belong to the chapter, so they
  // show in every edition of it (a Bible edition whose chapters do not carry
  // highlights across keeps its own).
  const chapterNotes = useMemo(() => (scope ? safeHighlights.filter(h => (
    isLabChapterNote(h)
    && h.bookId === scope.bookId
    && (!h.editionKey || h.editionKey === scope.editionKey || scope.bookId !== 'bible' || bibleHighlightsCarryAcross(h.editionKey, scope.editionKey, h.chapterNumber))
  )) : []), [highlights, ownerProof, scope?.bookId, scope?.editionKey])
  const chapterNotesRef = useRef(chapterNotes)
  chapterNotesRef.current = chapterNotes

  const shared = scope?.shared && scope.shared.bookId === scope.bookId && scope.shared.editionKey === scope.editionKey ? scope.shared : null
  const shownHighlights = useMemo(
    () => (shared && !visibleHighlights.some(h => h.id === shared.id) ? [...visibleHighlights, shared] : visibleHighlights),
    [visibleHighlights, shared],
  )
  const chapterHighlights = useMemo(
    () => shownHighlights.filter(h => h.chapterNumber === chapterNumber),
    [shownHighlights, chapterNumber],
  )

  const addOrReuse = useCallback((range: LabHighlightRange, color: LabHighlightColor = 'gold', editionKey = scope?.editionKey, targetChapter = chapterNumber) => {
    const list = highlightsRef.current.filter(h => inScope(h, editionKey) && !highlightOffCurrentText(h) && !isLabChapterNote(h))
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

  /**
   * The note on a whole chapter (one per chapter): saved as an entry with no
   * passage in the same list, so it syncs through the same versioned rows.
   * Clearing its text removes it.
   */
  const setChapterNote = useCallback((targetChapter: number, note: string) => {
    const text = note.trim()
    const existing = chapterNotesRef.current.find(h => h.chapterNumber === targetChapter)
    if (existing) {
      if (!text) {
        recordLabHighlightDeletions([existing])
        const hex = scope?.bookId && isUserBookId(scope.bookId) ? userBookHex(scope.bookId) : null
        if (hex) noteOwnTextMarks(hex, highlightsRef.current.filter(h => h.id !== existing.id))
        setHighlights(current => current.filter(h => h.id !== existing.id))
        return null
      }
      if (existing.note === text) return existing
      const updated = { ...existing, note: text, updatedAt: Date.now() }
      setHighlights(current => mergeLabHighlight(current, updated))
      return updated
    }
    if (!text) return null
    const created = createLabChapterNote(targetChapter, text)
    if (scope) Object.assign(created, { bookId: scope.bookId, editionKey: scope.editionKey })
    setHighlights(current => mergeLabHighlight(current, created))
    return created
  }, [scope?.bookId, scope?.editionKey])

  const keep = useCallback((id: string) => {
    setHighlights(current => { const group = current.find(h => h.id === id)?.groupId; const updatedAt = Date.now(); return current.map(h => h.id === id || group && h.groupId === group ? { ...h, kept: true, updatedAt } : h) })
  }, [])

  const remove = useCallback((id: string) => {
    const group = highlightsRef.current.find(h => h.id === id)?.groupId
    const hex = bookId && isUserBookId(bookId) ? userBookHex(bookId) : null
    const next = highlightsRef.current.filter(h => h.id !== id && (!group || h.groupId !== group))
    if (hex && ownTextMarksCanonical(hex)) {
      if (!noteOwnTextMarks(hex, next)) return false
      setHighlights(next)
      return true
    }
    // Tombstones first, so the push that follows carries the deletion.
    recordLabHighlightDeletions(highlightsRef.current.filter(h => h.id === id || (group && h.groupId === group)))
    if (hex) noteOwnTextMarks(hex, next)
    setHighlights(current => {const group=current.find(h=>h.id===id)?.groupId;return current.filter(h=>h.id!==id && (!group || h.groupId!==group))})
    return true
  }, [bookId])

  const restore = useCallback((saved: LabHighlight[]) => {
    const hex = bookId && isUserBookId(bookId) ? userBookHex(bookId) : null
    const updatedAt = Math.max(Date.now() + 1, ...saved.map(entry => (entry.updatedAt || 0) + 1))
    const entries = saved.map(entry => ({ ...entry, updatedAt }))
    if (hex && ownTextMarksCanonical(hex)) {
      const owner = userBookOwner()
      if (!owner || !importOwnTextMarks(hex, owner, entries)) return false
      const actual = new Map(readOwnedTextMarks(hex, owner).map(mark => [mark.id, mark]))
      if (entries.some(entry => !actual.has(entry.id))) return false
      setHighlights(current => [...current.filter(entry => !saved.some(prior => prior.id === entry.id)),
        ...entries.map(entry => actual.get(entry.id)!)])
      return true
    }
    setHighlights(current => [...current.filter(entry => !saved.some(prior => prior.id === entry.id)), ...entries])
    return true
  }, [bookId])

  return {
    highlights: shownHighlights,
    allHighlights: safeHighlights,
    compareHighlights: projected(scope?.compareEditionKey).filter(h => h.chapterNumber === chapterNumber),
    unassignedHighlights: safeHighlights.filter(h => (!h.bookId || !h.editionKey) && !isLabChapterNote(h)),
    chapterHighlights,
    chapterNotes,
    setChapterNote,
    findRange,
    findContainingRange,
    addOrReuse,
    addGroup,
    setColor,
    setNote,
    keep,
    remove,
    restore,
    setHighlights,
  }
}
