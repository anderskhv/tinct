import { isFigureToken, readableParagraph } from './labFigures'
import type { HighlightColor } from '../types'
import { tokenizeWithEmphasis } from './labEmphasis'

export type LabHighlightColor = HighlightColor

export interface LabWordPlace {
  paragraphIndex: number
  wordIndex: number
}

export interface LabHighlightRange {
  /** Temporary dictionary paint only; never changes persisted word coordinates. */
  lookupWord?: string
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
  text: string
}

export interface LabHighlight {
  id: string
  /** One deliberate selection spanning chapter-owned records. */
  groupId?: string
  groupText?: string
  /** V2 records their source; older unscoped marks are retained separately. */
  bookId?: string
  editionKey?: string
  chapterNumber: number
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
  color: LabHighlightColor
  note?: string
  /** Exact source wording, retained for requested history search. */
  text?: string
  kept?: boolean
  /** Last change (ms). Missing on older marks; sync falls back to the id's creation time. */
  updatedAt?: number
  /**
   * 'chapter': a note on the whole chapter, with no passage. Its range is the
   * empty 0..0 (no word falls inside it, so nothing is ever painted), and it
   * lives in the same list, storage and cloud rows as passage highlights.
   */
  kind?: 'chapter'
  /**
   * Where the reader moved this note's card in the desktop margin (Anders, 13 Nov 2026): its top at `fraction` of
   * paragraph `paragraphIndex`'s height (0 its first line's top, 1 its last line's foot), in `editionKey`'s text.
   * Kept relative to a paragraph, so it holds through a reload, sync, a font or size change and a resize. Absent:
   * the card sits at its passage. A passage note stays linked to its highlight; a margin note's own paragraph moves
   * with it.
   */
  cardPlace?: LabNoteCardPlace
}

export interface LabNoteCardPlace {
  paragraphIndex: number
  fraction: number
  editionKey?: string
}

/** A stored card place, checked (from another device or an older copy): null when it is not one. */
export function validNoteCardPlace(value: unknown): LabNoteCardPlace | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = value as Record<string, unknown>
  if (typeof v.paragraphIndex !== 'number' || !Number.isInteger(v.paragraphIndex) || v.paragraphIndex < 0 || v.paragraphIndex > 10_000_000) return null
  if (typeof v.fraction !== 'number' || !Number.isFinite(v.fraction)) return null
  const fraction = Math.max(-1, Math.min(2, Math.round(v.fraction * 10000) / 10000))
  return { paragraphIndex: v.paragraphIndex, fraction, ...(typeof v.editionKey === 'string' && v.editionKey && v.editionKey.length <= 80 ? { editionKey: v.editionKey } : {}) }
}

/**
 * A note's card moved to `place`. A margin note (a note with no words) moves its own paragraph with it, so it is
 * listed and found there; a passage note keeps its passage. `place` null: back beside its passage. Stamped `now`.
 */
export function withNoteCardPlace(highlight: LabHighlight, place: LabNoteCardPlace | null, now = Date.now()): LabHighlight {
  const { cardPlace: _old, ...rest } = highlight
  const checked = place ? validNoteCardPlace(place) : null
  if (!checked) return { ...rest, updatedAt: Math.max(now, (highlight.updatedAt ?? 0) + 1) }
  const marginNote = !isLabChapterNote(highlight) && highlight.paragraphIndex === highlight.endParagraphIndex && highlight.fromWord === highlight.toWord
  return {
    ...rest,
    ...(marginNote ? { paragraphIndex: checked.paragraphIndex, endParagraphIndex: checked.paragraphIndex, fromWord: 0, toWord: 0 } : {}),
    cardPlace: checked,
    updatedAt: Math.max(now, (highlight.updatedAt ?? 0) + 1),
  }
}

const STORAGE_KEY = 'tinct-lab-highlights'
const LEGACY_TAP_CLEANUP_KEY = 'tinct-lab-highlights-tap-cleanup-v1'

/** Remove the one-word gold records produced by the old tap-to-save bug. */
export function removeLegacyTapHighlights(highlights: LabHighlight[]): LabHighlight[] {
  return highlights.filter(highlight => !(
    highlight.color === 'gold'
    && highlight.paragraphIndex === highlight.endParagraphIndex
    && highlight.toWord === highlight.fromWord + 1
    && !highlight.note
    && !highlight.kept
    && !highlight.groupId
  ))
}

export function readLabHighlights(): LabHighlight[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LEGACY_TAP_CLEANUP_KEY, '1')
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    if (!localStorage.getItem(LEGACY_TAP_CLEANUP_KEY)) {
      const cleaned = removeLegacyTapHighlights(parsed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
      localStorage.setItem(LEGACY_TAP_CLEANUP_KEY, '1')
      return cleaned
    }
    return parsed
  } catch {
    return []
  }
}

export function writeLabHighlights(highlights: LabHighlight[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(highlights))
  } catch {
    /* quota */
  }
}

export function createLabHighlight(
  chapterNumber: number,
  range: LabHighlightRange,
  color: LabHighlightColor,
): LabHighlight {
  const now = Date.now()
  return {
    id: `hl-${now}-${Math.random().toString(36).slice(2, 8)}`,
    chapterNumber,
    text: range.text,
    paragraphIndex: range.paragraphIndex,
    fromWord: range.fromWord,
    endParagraphIndex: range.endParagraphIndex,
    toWord: range.toWord,
    color,
    updatedAt: now,
  }
}

/** A note on the chapter itself (no passage); see `LabHighlight.kind`. */
export function isLabChapterNote(highlight: Pick<LabHighlight, 'kind'>): boolean {
  return highlight.kind === 'chapter'
}

export function createLabChapterNote(chapterNumber: number, note: string): LabHighlight {
  const now = Date.now()
  return {
    id: `hl-${now}-${Math.random().toString(36).slice(2, 8)}`,
    kind: 'chapter',
    chapterNumber,
    paragraphIndex: 0,
    fromWord: 0,
    endParagraphIndex: 0,
    toWord: 0,
    color: 'gold',
    note,
    updatedAt: now,
  }
}

export function mergeLabHighlight(list: LabHighlight[], highlight: LabHighlight): LabHighlight[] {
  const idx = list.findIndex(h => h.id === highlight.id)
  if (idx >= 0) {
    const next = [...list]
    next[idx] = highlight
    return next
  }
  return [...list, highlight]
}

export function sameHighlightRange(
  highlight: LabHighlight,
  range: LabHighlightRange,
  chapterNumber: number,
): boolean {
  return (
    highlight.chapterNumber === chapterNumber
    && highlight.paragraphIndex === range.paragraphIndex
    && highlight.endParagraphIndex === range.endParagraphIndex
    && highlight.fromWord === range.fromWord
    && highlight.toWord === range.toWord
  )
}

export function highlightContainsRange(
  highlight: LabHighlight,
  range: LabHighlightRange,
  chapterNumber: number,
): boolean {
  if (highlight.chapterNumber !== chapterNumber) return false
  const startsBefore = highlight.paragraphIndex < range.paragraphIndex
    || (highlight.paragraphIndex === range.paragraphIndex && highlight.fromWord <= range.fromWord)
  const endsAfter = highlight.endParagraphIndex > range.endParagraphIndex
    || (highlight.endParagraphIndex === range.endParagraphIndex && highlight.toWord >= range.toWord)
  return startsBefore && endsAfter
}

export function buildHighlightRange(
  paragraphs: string[],
  start: LabWordPlace,
  end: LabWordPlace,
): LabHighlightRange | null {
  const startBeforeEnd = start.paragraphIndex < end.paragraphIndex
    || (start.paragraphIndex === end.paragraphIndex && start.wordIndex <= end.wordIndex)
  const first = startBeforeEnd ? start : end
  const last = startBeforeEnd ? end : start
  const paragraphIndex = first.paragraphIndex
  const endParagraphIndex = last.paragraphIndex
  const fromWord = first.wordIndex
  const toWord = last.wordIndex + 1
  const textParts: string[] = []
  for (let p = paragraphIndex; p <= endParagraphIndex; p += 1) {
    // Same whitespace-token count/order as a plain split — emphasis
    // delimiters are stripped so a selection copies clean text.
    const words = tokenizeWithEmphasis(paragraphs[p] || '')
    const from = p === paragraphIndex ? fromWord : 0
    const to = p === endParagraphIndex ? toWord : words.length
    // A figure reads as its caption ("[Figure 2: …]"), never as its placeholder.
    if (to > from) textParts.push(words.slice(from, to).map(word => isFigureToken(word.text) ? readableParagraph(word.text) : word.text).join(' '))
  }
  const text = textParts.join(' ').trim()
  if (!text) return null
  return {
    paragraphIndex,
    fromWord,
    endParagraphIndex,
    toWord,
    text,
  }
}

export function wordInHighlightRange(
  range: Pick<LabHighlightRange, 'paragraphIndex' | 'endParagraphIndex' | 'fromWord' | 'toWord'>,
  paragraphIndex: number,
  wordIndex: number,
): boolean {
  if (paragraphIndex < range.paragraphIndex || paragraphIndex > range.endParagraphIndex) return false
  if (paragraphIndex === range.paragraphIndex && wordIndex < range.fromWord) return false
  if (paragraphIndex === range.endParagraphIndex && wordIndex >= range.toWord) return false
  return true
}

/** The topmost saved mark owns both the visible colour and its controls. */
export function highlightAt(
  highlights: LabHighlight[],
  chapterNumber: number,
  paragraphIndex: number,
  wordIndex: number,
): LabHighlight | undefined {
  for (let index = highlights.length - 1; index >= 0; index -= 1) {
    const mark = highlights[index]
    if (mark.chapterNumber === chapterNumber && wordInHighlightRange(mark, paragraphIndex, wordIndex)) return mark
  }
  return undefined
}

export function highlightColorAt(
  highlights: LabHighlight[],
  chapterNumber: number,
  paragraphIndex: number,
  wordIndex: number,
): LabHighlightColor | null {
  return highlightAt(highlights, chapterNumber, paragraphIndex, wordIndex)?.color ?? null
}

const COLOR_CLASS: Record<LabHighlightColor, string> = {
  gold: 'is-hl-warm',
  rose: 'is-hl-rose',
  sage: 'is-hl-sage',
  sky: 'is-hl-sky',
  lavender: 'is-hl-lavender',
}

export function labHighlightCssClass(
  color: LabHighlightColor | null,
  selecting: boolean,
): string {
  const parts = ['lab-hearing-word']
  if (selecting) parts.push('is-selecting')
  if (color) parts.push(COLOR_CLASS[color] || 'is-hl-warm')
  return parts.join(' ')
}

/** Paint only a separator whose words are both inside the same visible mark. */
export function labHighlightGapCssClass(
  color: LabHighlightColor | null,
  selecting: boolean,
  previousColor: LabHighlightColor | null,
  previousSelecting: boolean,
): string {
  const joinsSelection = selecting && previousSelecting
  const joinsSavedHighlight = color != null && previousColor != null
  if (!joinsSelection && !joinsSavedHighlight) return ''
  const parts = ['lab-highlight-gap']
  if (joinsSelection) parts.push('is-selecting')
  if (joinsSavedHighlight && color) parts.push(COLOR_CLASS[color] || 'is-hl-warm')
  return parts.join(' ')
}
