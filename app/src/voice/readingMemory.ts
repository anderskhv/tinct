import type { BookReadingLog, ReadingSessionRecord } from '../types'

export type ReadingHistoryPeriod = 'last_session' | 'today' | 'yesterday' | 'day_before_yesterday'

export interface ReadingMemoryBook {
  id: string
  title: string
  author: string
}

export interface ReadingActivityHit extends ReadingSessionRecord {
  bookId: string
  bookTitle: string
  bookAuthor: string
  chapterNumber: number
  legacy: boolean
}

const LAST_SESSION_GAP_MS = 30 * 60 * 1000

function validTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function validParagraph(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined
}

function normalized(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function matchesBookQuery(book: ReadingMemoryBook, query: string | undefined): boolean {
  if (!query?.trim()) return true
  const needle = normalized(query)
  if (!needle) return true
  return [book.id, book.title, book.author]
    .map(normalized)
    .some(value => value === needle || value.includes(needle) || needle.includes(value))
}

function periodBounds(period: Exclude<ReadingHistoryPeriod, 'last_session'>, now: number): { start: number; end: number } {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const daysBack = period === 'today' ? 0 : period === 'yesterday' ? 1 : 2
  start.setDate(start.getDate() - daysBack)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.getTime(), end: end.getTime() }
}

function recordHits(log: BookReadingLog, book: ReadingMemoryBook): ReadingActivityHit[] {
  const hits: ReadingActivityHit[] = []
  for (const record of Object.values(log.chapters || {})) {
    if (!record || !Number.isInteger(record.chapterNumber) || record.chapterNumber < 1) continue
    const sessions = Array.isArray(record.sessions) ? record.sessions : []
    let validSessions = 0
    for (const session of sessions) {
      if (!session || !validTimestamp(session.startedAt) || !validTimestamp(session.lastActiveAt)) continue
      if (session.lastActiveAt < session.startedAt) continue
      if (session.mode !== 'read' && session.mode !== 'listened') continue
      if (typeof session.editionKey !== 'string' || !session.editionKey) continue
      validSessions += 1
      hits.push({
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        chapterNumber: record.chapterNumber,
        startedAt: session.startedAt,
        lastActiveAt: session.lastActiveAt,
        editionKey: session.editionKey,
        mode: session.mode,
        startParagraphIndex: validParagraph(session.startParagraphIndex),
        lastParagraphIndex: validParagraph(session.lastParagraphIndex),
        legacy: false,
      })
    }

    // Older logs predate per-session history. Their most recent chapter visit
    // is still useful, but never fabricate earlier calendar activity from it.
    if (validSessions === 0 && validTimestamp(record.lastReadAt)) {
      const editionKey = record.editions?.[record.editions.length - 1]
        || record.editionUsage?.[record.editionUsage.length - 1]?.key
      if (!editionKey) continue
      hits.push({
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        chapterNumber: record.chapterNumber,
        startedAt: record.lastReadAt,
        lastActiveAt: record.lastReadAt,
        editionKey,
        mode: record.editionUsage?.[record.editionUsage.length - 1]?.mode || 'read',
        startParagraphIndex: validParagraph(record.lastParagraphIndex),
        lastParagraphIndex: validParagraph(record.lastParagraphIndex),
        legacy: true,
      })
    }
  }
  return hits
}

export function findReadingActivity(args: {
  logs: BookReadingLog[]
  books: ReadingMemoryBook[]
  period: ReadingHistoryPeriod
  now: number
  bookQuery?: string
  limit?: number
}): ReadingActivityHit[] {
  const { logs, books, period, now, bookQuery, limit = 8 } = args
  const booksById = new Map(books.map(book => [book.id, book]))
  const all = logs.flatMap(log => {
    const book = booksById.get(log.bookId)
    if (!book || !matchesBookQuery(book, bookQuery)) return []
    return recordHits(log, book)
  }).sort((a, b) => b.lastActiveAt - a.lastActiveAt)

  if (period === 'last_session') {
    const latest = all[0]
    if (!latest) return []
    const session: ReadingActivityHit[] = [latest]
    let earliestStart = latest.startedAt
    for (const hit of all.slice(1)) {
      if (earliestStart - hit.lastActiveAt > LAST_SESSION_GAP_MS) break
      session.push(hit)
      earliestStart = Math.min(earliestStart, hit.startedAt)
      if (session.length >= limit) break
    }
    return session
  }

  const { start, end } = periodBounds(period, now)
  return all
    .filter(hit => hit.startedAt < end && hit.lastActiveAt >= start)
    .slice(0, limit)
}

function cleanParagraph(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Select representative text from a possibly long session range while
 * keeping function output small enough for a low-latency spoken recap. */
export function readingPassageExcerpt(args: {
  paragraphs: string[]
  startParagraphIndex?: number
  lastParagraphIndex?: number
  maxCharacters?: number
}): string {
  const { paragraphs, maxCharacters = 2_400 } = args
  if (paragraphs.length === 0) return ''
  const fallback = Math.max(0, Math.min(paragraphs.length - 1, args.lastParagraphIndex ?? 0))
  const start = Math.max(0, Math.min(paragraphs.length - 1, args.startParagraphIndex ?? fallback))
  const end = Math.max(start, Math.min(paragraphs.length - 1, args.lastParagraphIndex ?? start))
  const candidates = end - start <= 6
    ? Array.from({ length: end - start + 1 }, (_, index) => start + index)
    : [start, start + 1, Math.floor((start + end) / 2), end - 1, end]
  const unique = [...new Set(candidates)]
  let excerpt = ''
  for (const index of unique) {
    const paragraph = cleanParagraph(paragraphs[index] || '')
    if (!paragraph) continue
    const next = excerpt ? `${excerpt}\n${paragraph}` : paragraph
    if (next.length > maxCharacters) {
      if (!excerpt) return `${paragraph.slice(0, maxCharacters - 1).trim()}…`
      break
    }
    excerpt = next
  }
  return excerpt
}

export function readingPeriodLabel(period: ReadingHistoryPeriod): string {
  switch (period) {
    case 'last_session': return 'last time'
    case 'today': return 'today'
    case 'yesterday': return 'yesterday'
    case 'day_before_yesterday': return 'the day before yesterday'
  }
}
