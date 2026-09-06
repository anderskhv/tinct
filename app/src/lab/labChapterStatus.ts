import type { LabPositionState } from './labPosition'
import { visibleToViewer, type ReadingMemoryState } from '../readingMemory'

export type LabChapterStatusKind = 'not-started' | 'in-progress' | 'finished'

/**
 * One truthful line per chapter for the picker. Every field is a stored fact:
 *  - `finished`: the reader turned past the last page or heard the chapter
 *    out (position record), or reading memory holds a `completed` session;
 *  - `in-progress`: any recorded reading session, or a position pin, sits in
 *    that chapter;
 *  - otherwise `not-started`.
 */
export interface LabChapterStatus {
  kind: LabChapterStatusKind
  /** 1-based page the reader last saw, when reading memory recorded one. */
  page?: number
  totalPages?: number
  /** Latest recorded activity in the chapter (memory or pin). */
  lastReadAt?: number
  finishedAt?: number
}

export interface LabChapterStatusInput {
  /** Library bookId the picker shows (`bible`, `odyssey`, …). */
  bookId: string
  chapterNumbers: number[]
  /** Finished signal from the position record (and any legacy list). */
  finished: ReadonlySet<number>
  memory?: ReadingMemoryState | null
  position?: LabPositionState | null
  /** Signed-in account, or null; other accounts' sessions never count. */
  viewer?: string | null
}

function bump(map: Map<number, LabChapterStatus>, chapter: number, patch: LabChapterStatus): void {
  const prev = map.get(chapter) || { kind: 'not-started' }
  const newer = (patch.lastReadAt ?? 0) >= (prev.lastReadAt ?? 0)
  const kind: LabChapterStatusKind = prev.kind === 'finished' || patch.kind === 'finished'
    ? 'finished'
    : (prev.kind === 'in-progress' || patch.kind === 'in-progress' ? 'in-progress' : 'not-started')
  map.set(chapter, {
    kind,
    page: newer ? (patch.page ?? prev.page) : (prev.page ?? patch.page),
    totalPages: newer ? (patch.totalPages ?? prev.totalPages) : (prev.totalPages ?? patch.totalPages),
    lastReadAt: Math.max(prev.lastReadAt ?? 0, patch.lastReadAt ?? 0) || undefined,
    finishedAt: Math.max(prev.finishedAt ?? 0, patch.finishedAt ?? 0) || undefined,
  })
}

export function labChapterStatuses(input: LabChapterStatusInput): Map<number, LabChapterStatus> {
  const wanted = new Set(input.chapterNumbers)
  const map = new Map<number, LabChapterStatus>()
  for (const chapter of input.finished) {
    if (wanted.has(chapter)) bump(map, chapter, { kind: 'finished' })
  }
  if (input.position) {
    for (const pin of Object.values(input.position.books)) {
      const pinBook = pin.bookId
      const pinnedLibraryBook = pinBook === input.bookId || (input.bookId === 'bible' && pinBook !== input.bookId)
      if (!pinnedLibraryBook || !wanted.has(pin.sequentialChapter)) continue
      bump(map, pin.sequentialChapter, {
        kind: 'in-progress',
        page: pin.pageIndex === undefined ? undefined : pin.pageIndex + 1,
        lastReadAt: pin.updatedAt,
      })
    }
  }
  if (input.memory) {
    const visible = visibleToViewer(input.viewer ?? null)
    for (const session of Object.values(input.memory.sessions)) {
      if (!visible(session) || session.anchor.bookId !== input.bookId || !wanted.has(session.anchor.chapterNumber)) continue
      const done = session.state === 'completed' && session.completedAt !== null
      bump(map, session.anchor.chapterNumber, {
        kind: done ? 'finished' : 'in-progress',
        page: session.anchor.page,
        totalPages: session.anchor.totalPages ?? undefined,
        lastReadAt: session.lastActiveAt,
        finishedAt: done ? session.completedAt ?? undefined : undefined,
      })
    }
  }
  return map
}

export function labFinishedChapterSet(statuses: Map<number, LabChapterStatus>): Set<number> {
  const out = new Set<number>()
  for (const [chapter, status] of statuses) if (status.kind === 'finished') out.add(chapter)
  return out
}

/** Most recent activity across the book, for the picker header. */
export function labLastReadAt(statuses: Map<number, LabChapterStatus>): number | null {
  let best = 0
  for (const status of statuses.values()) best = Math.max(best, status.lastReadAt ?? 0, status.finishedAt ?? 0)
  return best || null
}

export function labChapterStatusLine(
  status: LabChapterStatus | undefined,
  current: boolean,
  formatDate: (value: number) => string,
): string {
  if (current) return 'Reading now'
  if (!status || status.kind === 'not-started') return 'Not started'
  if (status.kind === 'finished') return status.finishedAt ? `Finished · ${formatDate(status.finishedAt)}` : 'Finished'
  const parts = ['In progress']
  if (status.page && status.totalPages) parts.push(`page ${status.page} of ${status.totalPages}`)
  if (status.lastReadAt) parts.push(`last read ${formatDate(status.lastReadAt)}`)
  return parts.join(' · ')
}
