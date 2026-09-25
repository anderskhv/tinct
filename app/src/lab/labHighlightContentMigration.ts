import { currentContentRevision, loadCoordinateMigration, writtenBeforeRelease } from '../data/editionContentRevisions'
import { loadChapterText } from '../readingMemory'
import { migrateLabHighlight, type MigratableHighlight } from './labHighlightMigration'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'

/**
 * Highlights and notes across an accepted structural edition release
 * (editionContentRevisions.ts). A mark moves only when its whole quote is
 * found word for word in the new text; otherwise it is kept, with its old
 * coordinates, quote and note, as unresolved and is not painted. Nothing is
 * ever dropped.
 */

/** Highlight ids carry their creation time (`hl-<ms>-…`). */
export function highlightWrittenAt(highlight: Pick<LabHighlight, 'id'>): number | undefined {
  const match = /^hl-(\d{10,})-/.exec(highlight.id)
  return match ? Number(match[1]) : undefined
}

export function highlightNeedsMigration(highlight: MigratableHighlight): boolean {
  if (highlight.contentMigrationStatus === 'unresolved' && highlight.contentRecovery) return false
  return writtenBeforeRelease(highlight.bookId, highlight.editionKey, highlight.contentRevision, highlightWrittenAt(highlight))
}

/** Not to be painted against the current text: awaiting its move, or unresolved. */
export function highlightOffCurrentText(highlight: MigratableHighlight): boolean {
  return highlight.contentMigrationStatus === 'unresolved' || highlightNeedsMigration(highlight)
}

type ChapterLoader = (request: { bookId: string; editionKey: string; chapterNumber: number; version?: string }) => Promise<{ paragraphs: string[] } | null>

/**
 * Move every stored highlight that needs it, chapter by chapter. A chapter
 * whose text or map is not available yet (offline, or an old cached copy of
 * the text) is left for the next start. Returns whether anything changed.
 */
export async function migrateStoredLabHighlights(loadChapter: ChapterLoader = loadChapterText): Promise<boolean> {
  const stored = readLabHighlights() as MigratableHighlight[]
  const waiting = stored.filter(highlightNeedsMigration)
  if (!waiting.length) return false
  const moved = new Map<string, MigratableHighlight>()
  const groups = new Map<string, MigratableHighlight[]>()
  for (const highlight of waiting) {
    const key = `${highlight.bookId}\u0000${highlight.editionKey}\u0000${highlight.chapterNumber}`
    groups.set(key, [...(groups.get(key) ?? []), highlight])
  }
  await Promise.all([...groups.values()].map(async group => {
    const { bookId, editionKey, chapterNumber } = group[0] as Required<Pick<MigratableHighlight, 'bookId' | 'editionKey' | 'chapterNumber'>>
    const migration = await loadCoordinateMigration('highlights', bookId)
    if (!migration) return
    // A structural repair may move a complete passage into another chapter.
    // Verify the quote against its destination, never the old chapter's text.
    const chapters = new Map<number, Promise<{ paragraphs: string[] } | null>>()
    for (const highlight of group) {
      const entry = migration.editions[editionKey]?.entries[chapterNumber + '.' + highlight.paragraphIndex]
      const targetChapter = entry?.chapter ?? chapterNumber
      if (!chapters.has(targetChapter)) chapters.set(targetChapter,
        loadChapter({ bookId, editionKey, chapterNumber: targetChapter, version: currentContentRevision(bookId, editionKey) }).catch(() => null))
      const chapter = await chapters.get(targetChapter)
      const expected = migration.editions[editionKey]?.paragraphCountsAfter[String(targetChapter)]
      if (!chapter || chapter.paragraphs.length !== expected) continue
      moved.set(highlight.id, migrateLabHighlight(highlight, migration, chapter.paragraphs))
    }
  }))
  if (!moved.size) return false
  // Re-read: nothing written meanwhile is lost.
  writeLabHighlights(readLabHighlights().map(highlight => moved.get(highlight.id) ?? highlight))
  return true
}
