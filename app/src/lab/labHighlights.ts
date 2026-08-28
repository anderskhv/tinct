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

export function readLabHighlights(): LabHighlight[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
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
  const paragraphIndex = Math.min(start.paragraphIndex, end.paragraphIndex)
  const endParagraphIndex = Math.max(start.paragraphIndex, end.paragraphIndex)
  const fromWord = start.paragraphIndex <= end.paragraphIndex ? start.wordIndex : end.wordIndex
  const toWord = start.paragraphIndex <= end.paragraphIndex ? end.wordIndex + 1 : start.wordIndex + 1
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
