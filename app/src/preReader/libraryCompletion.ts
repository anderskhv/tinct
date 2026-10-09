/** Recognise both generations of completion records without rewriting history. */
export function completedLibraryBookId(key: string, value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const match = /^(?:tinct:)?(book-completed|progress):(.+)$/.exec(key)
  if (!match || record.bookId !== match[2]) return null
  if (match[1] === 'book-completed') return match[2]
  const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)
  const complete = (finite(record.totalChapters) && record.totalChapters > 0
    && finite(record.highestCompletedChapter) && record.highestCompletedChapter >= record.totalChapters)
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
