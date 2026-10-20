/**
 * The margin view's highlights and notes are the book reader's (marginPreviewMarks.ts): this keeps them in its
 * stores exactly as useLabHighlights does: the device list (`tinct-lab-highlights`), deletions as tombstones, and,
 * signed in, the versioned `lab-highlights:{bookId}` rows (createLabHighlightCloudWriter: a merge, never an
 * overwrite; on open, return to the tab and reconnect). Marks from the account or another tab reach the frame.
 */
import { useEffect, useMemo, useRef } from 'react'
import { currentContentRevision } from '../../data/editionContentRevisions'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from '../labHighlights'
import {
  applyLabHighlightSet,
  createLabHighlightCloud,
  createLabHighlightCloudWriter,
  labHighlightSetFor,
  LAB_HIGHLIGHTS_UNASSIGNED,
  localLabHighlightBuckets,
  readLabHighlightTombstones,
  recordLabHighlightDeletions,
  type LabHighlightCloudWriter,
} from '../labHighlightSync'
import { applyMarginMarks, marginMarks, migratePreviewMarks, type MarginMark, type MarginMarkScope } from './marginPreviewMarks'
import type { MarginPreviewBook } from './marginPreviewModel'

/** The preview's own keys from before (js/tinct-book.js, reader.js's store: `tinct-addbook:` + key). */
export const previewMarksKey = (bookId: string) => `tinct-addbook:hl:preview:${bookId}`
export const previewMarksGoneKey = (bookId: string) => `tinct-addbook:hl-gone:preview:${bookId}`

export interface MarginMarksBridge {
  /** The book's marks in the margin's form. */
  list(): MarginMark[]
  /** The margin's whole list for the book, after a change there. */
  put(list: MarginMark[]): void
  /** Marks changed elsewhere (the account, another tab): the margin's new list. -> stop listening */
  listen(cb: (list: MarginMark[]) => void): () => void
}

/** Once: the preview's own marks join the book reader's; the local keys go (any whose words no longer match stay). */
export function migratePreviewMarksLocal(scope: MarginMarkScope, storage: Storage = localStorage): LabHighlight[] {
  let legacy: unknown = null
  try { legacy = JSON.parse(storage.getItem(previewMarksKey(scope.bookId)) || 'null') } catch { legacy = null }
  if (!Array.isArray(legacy)) return []
  const all = readLabHighlights()
  const { add, keep } = migratePreviewMarks(legacy, all, scope)
  if (add.length) writeLabHighlights([...all, ...add])
  try {
    if (keep.length) storage.setItem(previewMarksKey(scope.bookId), JSON.stringify(keep))
    else storage.removeItem(previewMarksKey(scope.bookId))
    storage.removeItem(previewMarksGoneKey(scope.bookId))
  } catch { /* kept; tried again next time */ }
  return add
}

export function useMarginPreviewMarks(model: MarginPreviewBook, userId: string | null): MarginMarksBridge {
  const scope = useMemo<MarginMarkScope>(() => ({
    bookId: model.bookId, editionKey: model.editionKey, chapters: model.chapters,
    contentRevision: currentContentRevision(model.bookId, model.editionKey),
  }), [model])
  const bookId = model.bookId
  const allRef = useRef<LabHighlight[] | null>(null)
  if (!allRef.current) { migratePreviewMarksLocal(scope); allRef.current = readLabHighlights() }
  const listeners = useRef(new Set<(list: MarginMark[]) => void>())
  const writerRef = useRef<LabHighlightCloudWriter | null>(null)
  const shownRef = useRef('')

  const tell = () => {
    const list = marginMarks(allRef.current!, scope)
    const text = JSON.stringify(list)
    if (text === shownRef.current) return
    shownRef.current = text
    for (const cb of listeners.current) cb(list)
  }
  const tellRef = useRef(tell)
  tellRef.current = tell

  // Signed in: the account's rows, as useLabHighlights keeps them.
  useEffect(() => {
    const cloud = userId ? createLabHighlightCloud(userId) : null
    if (!cloud) { writerRef.current = null; return }
    const writer = createLabHighlightCloudWriter(cloud, {
      onMerged: (bucket, set) => {
        const next = applyLabHighlightSet(allRef.current!, bucket, set)
        if (next === allRef.current) return
        allRef.current = next
        writeLabHighlights(next)
        if (bucket === bookId) tellRef.current()
      },
    })
    writerRef.current = writer
    // Everything this device holds goes to the account (a merge), the preview's migrated marks with it.
    for (const bucket of localLabHighlightBuckets()) if (bucket !== bookId) void writer.sync(bucket)
    const run = () => { void writer.sync(bookId); void writer.sync(LAB_HIGHLIGHTS_UNASSIGNED) }
    run()
    const onVisible = () => { if (document.visibilityState === 'visible') run() }
    window.addEventListener('online', run)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      writer.dispose()
      if (writerRef.current === writer) writerRef.current = null
      window.removeEventListener('online', run)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [bookId, userId])

  // The book reader in another tab of this device.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'tinct-lab-highlights') return
      allRef.current = readLabHighlights()
      tellRef.current()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return useMemo<MarginMarksBridge>(() => ({
    list() {
      const list = marginMarks(allRef.current!, scope)
      shownRef.current = JSON.stringify(list)
      return list
    },
    put(list) {
      const { next, removed, changed } = applyMarginMarks(allRef.current!, list, scope)
      if (!changed) return
      // Tombstones first, so the push that follows carries the deletion.
      if (removed.length) recordLabHighlightDeletions(removed)
      allRef.current = next
      writeLabHighlights(next)
      shownRef.current = JSON.stringify(marginMarks(next, scope))
      writerRef.current?.push(bookId, labHighlightSetFor(bookId, next, readLabHighlightTombstones()))
    },
    listen(cb) {
      listeners.current.add(cb)
      return () => { listeners.current.delete(cb) }
    },
  }), [bookId, scope])
}
