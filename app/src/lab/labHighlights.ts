import type { HighlightColor } from '../types'

export type LabHighlightColor = HighlightColor

export interface LabWordPlace {
  paragraphIndex: number
  wordIndex: number
}

export interface LabHighlightRange {
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
  text: string
}

export interface LabHighlight {
  id: string
  chapterNumber: number
  paragraphIndex: number
  fromWord: number
  endParagraphIndex: number
  toWord: number
  color: LabHighlightColor
  note?: string
  kept?: boolean
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
  return {
    id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    chapterNumber,
    paragraphIndex: range.paragraphIndex,
    fromWord: range.fromWord,
    endParagraphIndex: range.endParagraphIndex,
    toWord: range.toWord,
    color,
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
    const words = (paragraphs[p] || '').split(/\s+/).filter(Boolean)
    const from = p === paragraphIndex ? fromWord : 0
    const to = p === endParagraphIndex ? toWord : words.length
    if (to > from) textParts.push(words.slice(from, to).join(' '))
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
  range: LabHighlightRange,
  paragraphIndex: number,
  wordIndex: number,
): boolean {
  if (paragraphIndex < range.paragraphIndex || paragraphIndex > range.endParagraphIndex) return false
  if (paragraphIndex === range.paragraphIndex && wordIndex < range.fromWord) return false
  if (paragraphIndex === range.endParagraphIndex && wordIndex >= range.toWord) return false
  return true
}

export function highlightColorAt(
  highlights: LabHighlight[],
  chapterNumber: number,
  paragraphIndex: number,
  wordIndex: number,
): LabHighlightColor | null {
  for (const h of highlights) {
    if (h.chapterNumber !== chapterNumber) continue
    if (paragraphIndex < h.paragraphIndex || paragraphIndex > h.endParagraphIndex) continue
    if (paragraphIndex === h.paragraphIndex && wordIndex < h.fromWord) continue
    if (paragraphIndex === h.endParagraphIndex && wordIndex >= h.toWord) continue
    return h.color
  }
  return null
}

const COLOR_CLASS: Record<LabHighlightColor, string> = {
  gold: 'is-hl-warm',
  rose: 'is-hl-rose',
  green: 'is-hl-sage',
  blue: 'is-hl-sky',
  purple: 'is-hl-lavender',
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
