import type { BookReadingLog, ChapterReadingRecord, EditionUsage, ReadingSessionRecord } from '../types'

type ReadingMode = 'read' | 'listened'

export const READING_SESSION_GAP_MS = 30 * 60 * 1000
export const MAX_READING_SESSIONS_PER_CHAPTER = 50

function validChapter(chapter: number, totalChapters: number | undefined): boolean {
  if (!Number.isInteger(chapter) || chapter < 1) return false
  if (!totalChapters || totalChapters <= 0) return true
  return chapter <= totalChapters
}

function filterEditions(editions: string[] | undefined, allowed: ReadonlySet<string> | null): string[] {
  const values = Array.isArray(editions) ? editions : []
  if (!allowed) return values
  return values.filter(key => allowed.has(key))
}

function filterUsage(usage: EditionUsage[] | undefined, allowed: ReadonlySet<string> | null): EditionUsage[] | undefined {
  if (!Array.isArray(usage)) return usage
  if (!allowed) return usage
  return usage.filter(entry => allowed.has(entry.key))
}

function createChapterRecord(
  chapterNumber: number,
  editionKey: string,
  mode: ReadingMode,
  now: number,
): ChapterReadingRecord {
  return {
    chapterNumber,
    editions: [editionKey],
    editionUsage: [{ key: editionKey, mode }],
    readCount: 1,
    firstReadAt: now,
    lastReadAt: now,
    completed: false,
  }
}

export function ensureReadingLogChapter(args: {
  log: BookReadingLog
  bookId: string
  chapterNumber: number
  editionKey: string
  mode: ReadingMode
  countVisit: boolean
  now: number
}): BookReadingLog {
  const { log, bookId, chapterNumber, editionKey, mode, countVisit, now } = args
  if (log.bookId !== bookId) return log

  const existing = log.chapters[chapterNumber]
  if (existing && !countVisit) return log

  return {
    ...log,
    updatedAt: now,
    chapters: {
      ...log.chapters,
      [chapterNumber]: existing
        ? {
            ...existing,
            readCount: existing.readCount + 1,
            lastReadAt: now,
            editions: existing.editions.includes(editionKey)
              ? existing.editions
              : [...existing.editions, editionKey],
            editionUsage: upsertUsage(existing.editionUsage, editionKey, mode),
          }
        : createChapterRecord(chapterNumber, editionKey, mode, now),
    },
  }
}

export function getReadingLogTransition(args: {
  previousBookId: string
  previousChapter: number | null
  bookId: string
  activeChapter: number
}): {
  isFirstPersistableLocation: boolean
  isChapterChange: boolean
  isBookChange: boolean
  chapterToFlush: number | null
} {
  const { previousBookId, previousChapter, bookId, activeChapter } = args
  const isFirstPersistableLocation = previousChapter === null
  const isChapterChange = !isFirstPersistableLocation && activeChapter !== previousChapter
  const isBookChange = bookId !== previousBookId
  return {
    isFirstPersistableLocation,
    isChapterChange,
    isBookChange,
    chapterToFlush: (isChapterChange || isBookChange) && previousChapter !== null
      ? previousChapter
      : null,
  }
}

/** Upsert an edition usage entry, preserving existing entries */
export function upsertUsage(existing: EditionUsage[] | undefined, key: string, mode: ReadingMode, percent?: number): EditionUsage[] {
  const arr = existing ? [...existing] : []
  const idx = arr.findIndex(u => u.key === key && u.mode === mode)
  if (idx >= 0) {
    if (percent !== undefined && (arr[idx].percent === undefined || percent > arr[idx].percent)) {
      arr[idx] = { ...arr[idx], percent }
    }
    return arr
  }
  arr.push({ key, mode, percent })
  return arr
}

function upsertSession(args: {
  sessions: ReadingSessionRecord[] | undefined
  editionKey: string
  mode: ReadingMode
  paragraphIndex: number
  now: number
  sessionGapMs?: number
}): ReadingSessionRecord[] {
  const { editionKey, mode, paragraphIndex, now, sessionGapMs = READING_SESSION_GAP_MS } = args
  const sessions = Array.isArray(args.sessions) ? [...args.sessions] : []
  const last = sessions[sessions.length - 1]
  const canContinue = Boolean(
    last
    && last.editionKey === editionKey
    && last.mode === mode
    && now >= last.lastActiveAt
    && now - last.lastActiveAt <= sessionGapMs,
  )

  if (canContinue) {
    sessions[sessions.length - 1] = {
      ...last,
      lastActiveAt: now,
      lastParagraphIndex: paragraphIndex,
    }
  } else {
    sessions.push({
      startedAt: now,
      lastActiveAt: now,
      editionKey,
      mode,
      startParagraphIndex: paragraphIndex,
      lastParagraphIndex: paragraphIndex,
    })
  }
  return sessions.slice(-MAX_READING_SESSIONS_PER_CHAPTER)
}

/** Record an exact, same-book ReaderSession location in the existing reading
 * log. Repeated movement within 30 minutes extends one session; returning
 * later appends another, preserving enough date detail for voice recall. */
export function recordReadingLogActivity(args: {
  log: BookReadingLog
  bookId: string
  chapterNumber: number
  editionKey: string
  mode: ReadingMode
  paragraphIndex: number
  totalParagraphs?: number
  now: number
  sessionGapMs?: number
}): BookReadingLog {
  const {
    log, bookId, chapterNumber, editionKey, mode, paragraphIndex,
    totalParagraphs, now, sessionGapMs,
  } = args
  if (log.bookId !== bookId || !validChapter(chapterNumber, undefined)) return log

  const existing = log.chapters[chapterNumber]
    ?? createChapterRecord(chapterNumber, editionKey, mode, now)
  const pct = totalParagraphs && totalParagraphs > 0
    ? Math.round(((paragraphIndex + 1) / totalParagraphs) * 100)
    : undefined
  const isNewHighWater = existing.lastParagraphIndex === undefined
    || paragraphIndex > existing.lastParagraphIndex

  return {
    ...log,
    updatedAt: now,
    chapters: {
      ...log.chapters,
      [chapterNumber]: {
        ...existing,
        lastReadAt: now,
        editions: existing.editions.includes(editionKey)
          ? existing.editions
          : [...existing.editions, editionKey],
        lastParagraphIndex: isNewHighWater ? paragraphIndex : existing.lastParagraphIndex,
        totalParagraphs: totalParagraphs ?? existing.totalParagraphs,
        editionUsage: upsertUsage(existing.editionUsage, editionKey, mode, pct),
        sessions: upsertSession({
          sessions: existing.sessions,
          editionKey,
          mode,
          paragraphIndex,
          now,
          sessionGapMs,
        }),
      },
    },
  }
}

export function sanitizeReadingLog(args: {
  bookId: string
  log: BookReadingLog | null | undefined
  totalChapters?: number
  allowedEditionKeys?: readonly string[]
}): BookReadingLog {
  const { bookId, log, totalChapters, allowedEditionKeys } = args
  const empty: BookReadingLog = { bookId, chapters: {}, updatedAt: 0 }
  if (!log || log.bookId !== bookId || !log.chapters) return empty

  const allowed = allowedEditionKeys && allowedEditionKeys.length > 0
    ? new Set(allowedEditionKeys)
    : null
  const chapters: Record<number, ChapterReadingRecord> = {}

  for (const [rawChapter, record] of Object.entries(log.chapters)) {
    const chapterNumber = Number(rawChapter)
    if (!validChapter(chapterNumber, totalChapters)) continue
    if (!record || record.chapterNumber !== chapterNumber) continue

    const editions = filterEditions(record.editions, allowed)
    const editionUsage = filterUsage(record.editionUsage, allowed)
    if (allowed && editions.length === 0 && (!editionUsage || editionUsage.length === 0)) continue

    chapters[chapterNumber] = {
      ...record,
      editions,
      editionUsage,
    }
  }

  return { ...log, bookId, chapters }
}
