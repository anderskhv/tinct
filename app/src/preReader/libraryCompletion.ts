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
