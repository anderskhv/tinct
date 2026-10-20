/** How far through (percent) a legacy record must be when only its last chapter lacks a mark. */
export const LEGACY_FINISHED_PERCENT = 95

/** Recognise both generations of completion records without rewriting history. */
export function completedLibraryBookId(key: string, value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const match = /^(?:tinct:)?(book-completed|progress):(.+)$/.exec(key)
  if (!match || record.bookId !== match[2]) return null
  if (match[1] === 'book-completed') return match[2]
  const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)
  // The legacy reader's writer (useReadingPosition.guards buildReadingProgressUpdate, removed
  // 2026-09-30) counted chapters from 1: `highestCompletedChapter` N means chapters 1..N were
  // read to their last page. Its last chapter often never got its own mark (War and Peace:
  // 364 of 365 at 100%), so every chapter but the last plus at least 95% is the end of the
  // book too. The Bible (1146 of 1189, 96%) is not.
  const total = finite(record.totalChapters) && record.totalChapters > 0 ? record.totalChapters : null
  const highest = finite(record.highestCompletedChapter) ? record.highestCompletedChapter : null
  const complete = (total !== null && highest !== null && highest >= total)
    || (total !== null && highest !== null && highest >= total - 1 && finite(record.percent) && record.percent >= LEGACY_FINISHED_PERCENT)
    || (finite(record.percent) && record.percent >= 100)
    || (finite(record.positionPercent) && record.positionPercent >= 100)
  return complete ? match[2] : null
}

/** Every book a storage's completion records mark finished (the library's Finished shelf rule). */
export function completedBookIdsIn(storage: Pick<Storage, 'length' | 'key' | 'getItem'> | null | undefined): Set<string> {
  const ids = new Set<string>()
  if (!storage) return ids
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (!key || (!key.startsWith('tinct:book-completed:') && !key.startsWith('tinct:progress:'))) continue
      try {
        const id = completedLibraryBookId(key, JSON.parse(storage.getItem(key) ?? 'null'))
        if (id) ids.add(id)
      } catch { /* A malformed legacy record must not hide other finished books. */ }
    }
  } catch { /* storage blocked */ }
  return ids
}
