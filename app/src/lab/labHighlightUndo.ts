import type { LabHighlight, LabHighlightColor } from './labHighlights'

/**
 * The reader's undo (Ctrl+Z / Cmd+Z) for its own highlight and note actions.
 * Each entry records what one action replaced, as data; useLabHighlights
 * applies the inverse through its own store functions, so the device copy,
 * tombstones and the cloud rows stay on their usual path.
 *
 * - create: the marks a highlight (or a note on a fresh passage) made; undo removes them.
 * - delete: the marks as they were; undo brings them back (labHighlightRestoreIds).
 * - color / note: the earlier colour or note on one mark.
 * - chapter-note: the earlier note on a whole chapter ('' when there was none).
 */
export type LabHighlightUndoEntry =
  | { kind: 'create'; ids: string[] }
  | { kind: 'delete'; marks: LabHighlight[] }
  | { kind: 'color'; id: string; color: LabHighlightColor }
  | { kind: 'note'; id: string; note: string }
  | { kind: 'chapter-note'; chapterNumber: number; note: string }

/** A small stack: undo is for the last few slips, not a history. */
export const LAB_HIGHLIGHT_UNDO_LIMIT = 20

/**
 * Push one action. Repeated edits of the same thing are one step: a note
 * saved on every keystroke, or several colours tried in a row, undo back to
 * what was there before the first. A colour or note on a mark the latest
 * step created belongs to that step (undo removes the new mark).
 */
export function pushLabHighlightUndo(
  stack: readonly LabHighlightUndoEntry[],
  entry: LabHighlightUndoEntry,
  limit = LAB_HIGHLIGHT_UNDO_LIMIT,
): LabHighlightUndoEntry[] {
  const top = stack[stack.length - 1]
  if (top && (entry.kind === 'color' || entry.kind === 'note')) {
    if (top.kind === 'create' && top.ids.includes(entry.id)) return [...stack]
    if (top.kind === entry.kind && top.id === entry.id) return [...stack]
  }
  if (top && entry.kind === 'chapter-note' && top.kind === 'chapter-note' && top.chapterNumber === entry.chapterNumber) return [...stack]
  if (entry.kind === 'create' && !entry.ids.length) return [...stack]
  if (entry.kind === 'delete' && !entry.marks.length) return [...stack]
  return [...stack, entry].slice(-Math.max(1, limit))
}

/** What the reader is told after an undo (the existing status pill). */
export function labHighlightUndoMessage(entry: LabHighlightUndoEntry): string {
  switch (entry.kind) {
    case 'create': return 'Highlight removed'
    case 'delete': return entry.marks.some(mark => mark.note?.trim()) ? 'Note restored' : 'Highlight restored'
    case 'color': return 'Colour changed back'
    case 'note': return 'Note changed back'
    case 'chapter-note': return entry.note ? 'Chapter note changed back' : 'Chapter note removed'
  }
}

/**
 * Ids for marks brought back after a deletion. A deletion's tombstone is kept
 * for good and always beats a mark with the same id (labHighlightSync), so a
 * mark restored under its old id would vanish again at the next sync. Those
 * marks come back under a new id that keeps the old creation time (order,
 * and the content-revision rules that read it, are unchanged); a mark that
 * left no tombstone keeps its id.
 */
export function labHighlightRestoreIds(
  marks: readonly Pick<LabHighlight, 'id'>[],
  tombstoned: ReadonlySet<string>,
  random: () => string = () => Math.random().toString(36).slice(2, 8),
): Map<string, string> {
  const ids = new Map<string, string>()
  for (const { id } of marks) {
    if (!tombstoned.has(id)) { ids.set(id, id); continue }
    const written = /^hl-(\d{10,})-/.exec(id)?.[1]
    ids.set(id, written ? `hl-${written}-${random()}` : `${id}-r${random()}`)
  }
  return ids
}
