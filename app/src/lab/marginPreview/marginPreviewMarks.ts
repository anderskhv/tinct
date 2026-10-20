/**
 * Highlights and notes: one store for the margin view and the book reader (Anders, 20 Oct 2026). The margin view
 * shows and edits the book reader's own marks (`LabHighlight`, word anchors, the `tinct-lab-highlights` list and its
 * `lab-highlights:{bookId}` account rows with tombstones, labHighlightSync.ts); it keeps none of its own.
 *
 * The margin reader (public/lab/addbook/js/reader.js) holds an EPUB's marks as character offsets in a chapter:
 *   a passage:      { id, page, start, end, text, color, at, u?, note?, withNote? }
 *   a margin note:  { id, page, rects: [[1, y, 0, 0]], text: '', note, withNote: true, … }   (at a height y)
 *   a chapter note: { id, page, rects: [[2, 1, 0, 0]], text: '', note, withNote: true, … }   (the chapter's "Note" pill)
 * Here they become, and come back from:
 *   a passage:      the same words (marginPreviewAnchors)
 *   a margin note:  a note on the paragraph at that height with no words (an empty range: nothing is painted), `margin: 'note'`
 *   a chapter note: the book reader's chapter note (`kind: 'chapter'`), one per chapter, in every edition
 *
 * A mark the margin hands back unchanged keeps the book reader's record exactly as it was (its group, its own
 * fields); a changed one is stamped now. Pure.
 */
import { highlightOffCurrentText } from '../labHighlightContentMigration'
import { isLabChapterNote, type LabHighlight, type LabHighlightColor } from '../labHighlights'
import { chapterOfPage, fractionOfParagraph, offsetsOfRange, pageOfChapter, paragraphAtFraction, rangeOfOffsets, rangeText } from './marginPreviewAnchors'
import type { MarginPreviewChapter } from './marginPreviewModel'

export interface MarginMark {
  id: string
  page: number
  start?: number
  end?: number
  rects?: number[][]
  text?: string
  color?: string
  at?: number
  u?: number
  note?: string
  withNote?: boolean
  gone?: boolean
}

export interface MarginMarkScope {
  bookId: string
  editionKey: string
  chapters: MarginPreviewChapter[]
  /** The edition's content revision (editionContentRevisions): stamped on new marks, as the book reader does. */
  contentRevision?: string | null
}

const COLORS: readonly LabHighlightColor[] = ['gold', 'rose', 'sage', 'sky', 'lavender']
const colorOf = (c: unknown): LabHighlightColor => (COLORS.includes(c as LabHighlightColor) ? c as LabHighlightColor : 'gold')
const isMarginNote = (h: LabHighlight) => (h as LabHighlight & { margin?: string }).margin === 'note'
/** The margin's note boxes (TinctMargin.noteSpot): one box of no size; [2, …] is the chapter's own note. */
function noteSpot(m: MarginMark): { y: number; unit: boolean } | null {
  const r = m.rects
  if (!Array.isArray(r) || r.length !== 1 || !Array.isArray(r[0]) || r[0][2] !== 0 || r[0][3] !== 0) return null
  return { y: Number(r[0][1]) || 0, unit: r[0][0] === 2 }
}
const stamp = (h: LabHighlight) => (typeof h.updatedAt === 'number' ? h.updatedAt : Date.now())

/** Is this book reader mark one the margin view shows (this book; this edition, or a chapter note; current text)? */
export function marginShows(h: LabHighlight, scope: MarginMarkScope): boolean {
  if (h.bookId !== scope.bookId || highlightOffCurrentText(h)) return false
  if (!pageOfChapter(scope.chapters, h.chapterNumber)) return false
  return isLabChapterNote(h) || h.editionKey === scope.editionKey
}

/** A book reader mark as the margin's, or null when it has no place in this edition's text. */
export function marginMarkOf(h: LabHighlight, scope: MarginMarkScope): MarginMark | null {
  if (!marginShows(h, scope)) return null
  const page = pageOfChapter(scope.chapters, h.chapterNumber)
  const chapter = chapterOfPage(scope.chapters, page)!
  const at = stamp(h)
  const base = { id: h.id, page, color: colorOf(h.color), at, u: at }
  if (isLabChapterNote(h)) return h.note ? { ...base, rects: [[2, 1, 0, 0]], text: '', note: h.note, withNote: true } : null
  if (isMarginNote(h) || (h.fromWord === h.toWord && h.paragraphIndex === h.endParagraphIndex)) {
    if (!h.note) return null
    return { ...base, rects: [[1, fractionOfParagraph(chapter, h.paragraphIndex), 0, 0]], text: '', note: h.note, withNote: true }
  }
  const offsets = offsetsOfRange(chapter, h)
  if (!offsets) return null
  return {
    ...base,
    start: offsets.start,
    end: offsets.end,
    text: (h.text || rangeText(chapter, h)).slice(0, 2000),
    ...(h.note ? { note: h.note } : {}),
    ...((h as LabHighlight & { withNote?: boolean }).withNote ? { withNote: true } : {}),
  }
}

/** A margin mark as the book reader's (without its time), or null when it holds no words of the text. */
export function labMarkOf(m: MarginMark, scope: MarginMarkScope): Omit<LabHighlight, 'updatedAt'> | null {
  if (!m || typeof m.id !== 'string' || !m.id || m.id.length > 160 || m.gone) return null
  const chapter = chapterOfPage(scope.chapters, m.page)
  if (!chapter) return null
  const revision = scope.contentRevision ? { contentRevision: scope.contentRevision } : {}
  const common = { id: m.id, bookId: scope.bookId, chapterNumber: chapter.number, color: colorOf(m.color) }
  const note = typeof m.note === 'string' && m.note.trim() ? m.note.slice(0, 4000) : undefined
  const spot = m.start == null ? noteSpot(m) : null
  if (spot) {
    if (!note) return null
    if (spot.unit) return { ...common, editionKey: scope.editionKey, kind: 'chapter', paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 0, note }
    const p = paragraphAtFraction(chapter, spot.y)
    return { ...common, editionKey: scope.editionKey, ...revision, paragraphIndex: p, fromWord: 0, endParagraphIndex: p, toWord: 0, text: '', note, margin: 'note' } as Omit<LabHighlight, 'updatedAt'>
  }
  const range = rangeOfOffsets(chapter, Number(m.start), Number(m.end))
  if (!range) return null
  return {
    ...common,
    editionKey: scope.editionKey,
    ...revision,
    paragraphIndex: range.paragraphIndex,
    fromWord: range.fromWord,
    endParagraphIndex: range.endParagraphIndex,
    toWord: range.toWord,
    text: rangeText(chapter, range).slice(0, 2000),
    ...(note ? { note } : {}),
    ...(m.withNote ? { withNote: true } : {}),
  } as Omit<LabHighlight, 'updatedAt'>
}

/** The margin's marks for this book: the book reader's, in the margin's form. */
export function marginMarks(all: LabHighlight[], scope: MarginMarkScope): MarginMark[] {
  return all.map(h => marginMarkOf(h, scope)).filter((m): m is MarginMark => m !== null)
}

/**
 * The margin's whole list for this book, applied to the book reader's: new marks added, changed ones replaced
 * (stamped now, their other fields kept), the ones it no longer has removed (returned, for their tombstones).
 * Marks the margin does not show (other books, other editions, text since replaced) are untouched.
 */
export function applyMarginMarks(all: LabHighlight[], incoming: MarginMark[], scope: MarginMarkScope, now = Date.now()): { next: LabHighlight[]; removed: LabHighlight[]; changed: boolean } {
  const shown = new Map(all.filter(h => marginMarkOf(h, scope)).map(h => [h.id, h]))
  const seen = new Set<string>()
  const replaced = new Map<string, LabHighlight>()
  const added: LabHighlight[] = []
  for (const m of incoming || []) {
    if (!m || m.gone || seen.has(m.id)) continue
    const lab = labMarkOf(m, scope)
    if (!lab) continue
    seen.add(m.id)
    const before = shown.get(m.id)
    if (before) {
      if (sameMark(before, lab)) continue
      const { note: _n, withNote: _w, ...rest } = before as LabHighlight & { withNote?: boolean }
      replaced.set(m.id, { ...rest, ...lab, updatedAt: Math.max(now, stamp(before) + 1) } as LabHighlight)
      continue
    }
    if (all.some(h => h.id === m.id)) continue
    added.push({ ...lab, updatedAt: Number(m.u || m.at) || now } as LabHighlight)
  }
  const removed = [...shown.values()].filter(h => !seen.has(h.id))
  const gone = new Set(removed.map(h => h.id))
  const next = [...all.filter(h => !gone.has(h.id)).map(h => replaced.get(h.id) ?? h), ...added]
  return { next, removed, changed: removed.length > 0 || replaced.size > 0 || added.length > 0 }
}

/** The same words, colour and note: what the margin can change on a mark. */
function sameMark(a: LabHighlight, b: Omit<LabHighlight, 'updatedAt'>): boolean {
  return a.chapterNumber === b.chapterNumber && a.paragraphIndex === b.paragraphIndex && a.fromWord === b.fromWord
    && a.endParagraphIndex === b.endParagraphIndex && a.toWord === b.toWord && a.color === b.color
    && (a.note || '') === (b.note || '') && !!(a as { withNote?: boolean }).withNote === !!(b as { withNote?: boolean }).withNote
    && !!a.kind === !!b.kind
}

/**
 * The preview's own marks from before the margin view shared the book reader's (`tinct-addbook:hl:preview:<id>`),
 * once: those whose words are still the edition's join the book reader's list; any whose words no longer match are
 * left where they were, untouched. -> the marks to add and those to leave
 */
export function migratePreviewMarks(legacy: unknown, all: LabHighlight[], scope: MarginMarkScope, now = Date.now()): { add: LabHighlight[]; keep: MarginMark[] } {
  const add: LabHighlight[] = [], keep: MarginMark[] = []
  const known = new Set(all.map(h => h.id))
  const squash = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
  for (const m of Array.isArray(legacy) ? legacy as MarginMark[] : []) {
    if (!m || typeof m.id !== 'string' || m.gone) continue
    if (known.has(m.id)) continue
    const lab = labMarkOf(m, scope)
    const matches = !!lab && (m.start == null || !m.text || squash(String(lab.text || '')).startsWith(squash(String(m.text)).slice(0, 60)) || squash(String(m.text)).startsWith(squash(String(lab.text || '')).slice(0, 60)))
    if (!lab || !matches) { keep.push(m); continue }
    add.push({ ...lab, updatedAt: Number(m.u || m.at) || now } as LabHighlight)
    known.add(m.id)
  }
  return { add, keep }
}
