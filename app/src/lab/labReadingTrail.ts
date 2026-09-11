/**
 * Reading trail for the companion: the last few chapters the reader visited
 * in this book, newest last, so "earlier", "a few chapters back" and "wasn't
 * he just…" have a referent in the prompt.
 *
 * Sources, all read-only:
 * - chapter visits observed by the Ask hook while the reader moved around
 *   (carry the opening line for free, current session only);
 * - durable reading-memory sessions (previous sittings; carry a stored
 *   recap summary or the exact read range), via its public API.
 * Opening lines for chapters that were not visited this session are fetched
 * from the edition shards with a small cache and a short deadline; when they
 * are not ready in time the entry simply has no opening line.
 */
import {
  cleanExcerpt,
  loadChapterText,
  readDeviceReadingMemory,
  visibleToViewer,
  type ReadingMemoryState,
} from '../readingMemory'

export interface LabReadingTrailEntry {
  chapterNumber: number
  label: string
  openingLine?: string
  recap?: string
}

export interface LabTrailVisit {
  chapterNumber: number
  label: string
  openingLine?: string
  at: number
}

export const LAB_READING_TRAIL_LENGTH = 5
export const LAB_TRAIL_OPENING_CHARS = 120
export const LAB_TRAIL_RECAP_CHARS = 300
export const LAB_TRAIL_OPENING_DEADLINE_MS = 1_200
const VISITS_MAX = 12
const OPENING_CACHE_MAX = 24

function clip(text: string, max: number): string {
  const clean = cleanExcerpt(text)
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const boundary = cut.lastIndexOf(' ')
  return `${(boundary > max * 0.6 ? cut.slice(0, boundary) : cut).replace(/[,;:\s]+$/, '')}…`
}

/** First ~120 characters of a chapter, verse markers stripped. */
export function openingLineOf(paragraphs: readonly string[], max = LAB_TRAIL_OPENING_CHARS): string | undefined {
  const first = paragraphs.find(text => typeof text === 'string' && text.trim())
  if (!first) return undefined
  return clip(first, max)
}

/** Add a visit, keeping one entry per chapter and the newest VISITS_MAX. */
export function recordTrailVisit(visits: LabTrailVisit[], visit: LabTrailVisit): LabTrailVisit[] {
  const next = visits.filter(item => item.chapterNumber !== visit.chapterNumber)
  next.push(visit)
  next.sort((a, b) => a.at - b.at)
  return next.slice(-VISITS_MAX)
}

function recapOf(session: {
  summary?: { text: string } | null
  anchor: { range?: { firstWords?: string; lastWords?: string } | null }
}): string | undefined {
  const summary = session.summary?.text?.trim()
  if (summary) return clip(summary, LAB_TRAIL_RECAP_CHARS)
  const first = session.anchor.range?.firstWords?.trim()
  const last = session.anchor.range?.lastWords?.trim()
  if (first && last && first !== last) return clip(`Read from "${first}" to "${last}"`, LAB_TRAIL_RECAP_CHARS)
  if (first) return clip(`Read from "${first}"`, LAB_TRAIL_RECAP_CHARS)
  return undefined
}

/**
 * Pure merge of the two sources. Excludes the current chapter, orders by the
 * reader's last activity in each chapter (newest last) and keeps the last
 * LAB_READING_TRAIL_LENGTH chapters.
 */
export function trailFromSources(input: {
  bookId: string
  editionKey?: string
  currentChapter?: number
  visits: readonly LabTrailVisit[]
  memory?: ReadingMemoryState | null
  viewer?: string | null
  length?: number
}): LabReadingTrailEntry[] {
  const length = input.length ?? LAB_READING_TRAIL_LENGTH
  const byChapter = new Map<number, { at: number; entry: LabReadingTrailEntry }>()
  const merge = (chapterNumber: number, at: number, patch: Partial<LabReadingTrailEntry> & { label: string }) => {
    if (chapterNumber === input.currentChapter) return
    const existing = byChapter.get(chapterNumber)
    const entry: LabReadingTrailEntry = existing
      ? {
          ...existing.entry,
          label: patch.label || existing.entry.label,
          openingLine: existing.entry.openingLine || patch.openingLine,
          recap: existing.entry.recap || patch.recap,
        }
      : { chapterNumber, label: patch.label, openingLine: patch.openingLine, recap: patch.recap }
    byChapter.set(chapterNumber, { at: Math.max(at, existing?.at ?? 0), entry })
  }

  if (input.memory) {
    const visible = visibleToViewer(input.viewer ?? null)
    const sessions = Object.values(input.memory.sessions)
      .filter(session => session.anchor.bookId === input.bookId && visible(session))
    // Prefer the open edition; fall back to any edition of the same book
    // (chapter numbering is shared across editions).
    const sameEdition = input.editionKey ? sessions.filter(session => session.anchor.editionKey === input.editionKey) : sessions
    for (const session of (sameEdition.length > 0 ? sameEdition : sessions)) {
      merge(session.anchor.chapterNumber, session.lastActiveAt, {
        label: session.anchor.chapterLabel || `Chapter ${session.anchor.chapterNumber}`,
        recap: recapOf(session),
      })
    }
  }
  for (const visit of input.visits) {
    merge(visit.chapterNumber, visit.at, { label: visit.label, openingLine: visit.openingLine })
  }

  return [...byChapter.values()]
    .sort((a, b) => a.at - b.at)
    .slice(-length)
    .map(item => item.entry)
}

const openingCache = new Map<string, string | undefined>()

function rememberOpening(key: string, value: string | undefined): void {
  if (openingCache.size >= OPENING_CACHE_MAX) {
    const oldest = openingCache.keys().next().value
    if (oldest !== undefined) openingCache.delete(oldest)
  }
  openingCache.set(key, value)
}

export function resetLabTrailOpeningCache(): void {
  openingCache.clear()
}

/** Opening line of a chapter shard, cached; undefined when unavailable. */
export async function loadTrailOpeningLine(input: {
  bookId: string
  editionKey: string
  chapterNumber: number
  version?: string
}): Promise<string | undefined> {
  const key = `${input.bookId}-${input.editionKey}:${input.chapterNumber}`
  if (openingCache.has(key)) return openingCache.get(key)
  const chapter = await loadChapterText({
    bookId: input.bookId,
    editionKey: input.editionKey,
    chapterNumber: input.chapterNumber,
    version: input.version,
  }).catch(() => null)
  const line = chapter ? openingLineOf(chapter.paragraphs) : undefined
  if (chapter) rememberOpening(key, line)
  return line
}

/**
 * Trail for one request. Fills missing opening lines from the edition data
 * within a short deadline so a slow network never delays the reader's
 * question; entries without an opening line are still sent.
 */
export async function buildLabReadingTrail(input: {
  bookId: string
  editionKey?: string
  currentChapter?: number
  visits: readonly LabTrailVisit[]
  viewer?: string | null
  memory?: ReadingMemoryState | null
  loadOpening?: (chapterNumber: number) => Promise<string | undefined>
  deadlineMs?: number
}): Promise<LabReadingTrailEntry[]> {
  const memory = input.memory === undefined ? readDeviceReadingMemory() : input.memory
  const trail = trailFromSources({
    bookId: input.bookId,
    editionKey: input.editionKey,
    currentChapter: input.currentChapter,
    visits: input.visits,
    memory,
    viewer: input.viewer,
  })
  const missing = trail.filter(entry => !entry.openingLine)
  if (missing.length === 0) return trail
  const editionKey = input.editionKey
  const loadOpening = input.loadOpening
    ?? (editionKey
      ? (chapterNumber: number) => loadTrailOpeningLine({ bookId: input.bookId, editionKey, chapterNumber })
      : null)
  if (!loadOpening) return trail
  const deadline = input.deadlineMs ?? LAB_TRAIL_OPENING_DEADLINE_MS
  const filled = await Promise.race([
    Promise.all(missing.map(async entry => ({ entry, openingLine: await loadOpening(entry.chapterNumber).catch(() => undefined) }))),
    new Promise<null>(resolve => setTimeout(() => resolve(null), deadline)),
  ])
  if (!filled) return trail
  for (const { entry, openingLine } of filled) {
    if (openingLine) entry.openingLine = openingLine
  }
  return trail
}
