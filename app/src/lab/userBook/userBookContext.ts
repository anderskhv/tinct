/**
 * What of a reader's own book goes to the companion. The privacy notice says
 * only the passages asked about are sent, so Ask, Explain and Define carry a
 * window around the reader's place (what Add a book's own view sent, about
 * 9,000 characters), never the whole chapter; a chapter recap carries the
 * chapter, capped as Add a book capped its Summarize. Pure.
 */
import { readableParagraph } from '../labFigures'

export const USER_BOOK_PASSAGE_CHARS = 9_000
export const USER_BOOK_CHAPTER_CHARS = 120_000

export interface ContextWindow { paragraphs: string[]; paragraphIndex: number }

/** Paragraphs around `index`, widening on both sides while they fit `budget` characters. */
export function passageWindow(source: string[], index: number, budget = USER_BOOK_PASSAGE_CHARS): ContextWindow {
  // A figure is sent as its caption, never as its placeholder (labFigures).
  const paragraphs = source.map(readableParagraph)
  if (paragraphs.length === 0) return { paragraphs: [], paragraphIndex: 0 }
  const at = Math.max(0, Math.min(index, paragraphs.length - 1))
  const centre = paragraphs[at].slice(0, budget)
  let used = centre.length
  let from = at
  let to = at
  for (let grew = true; grew;) {
    grew = false
    const before = from > 0 ? paragraphs[from - 1].length : Infinity
    if (used + before <= budget) { from--; used += before; grew = true }
    const after = to < paragraphs.length - 1 ? paragraphs[to + 1].length : Infinity
    if (used + after <= budget) { to++; used += after; grew = true }
  }
  return { paragraphs: [...paragraphs.slice(from, at), centre, ...paragraphs.slice(at + 1, to + 1)], paragraphIndex: at - from }
}

/** The chapter from its start, cut at `budget` characters. */
export function chapterWindow(source: string[], index: number, budget = USER_BOOK_CHAPTER_CHARS): ContextWindow {
  const paragraphs = source.map(readableParagraph)
  const out: string[] = []
  let used = 0
  for (const paragraph of paragraphs) {
    if (used >= budget) break
    const piece = paragraph.slice(0, budget - used)
    out.push(piece)
    used += piece.length
  }
  return { paragraphs: out, paragraphIndex: Math.max(0, Math.min(index, out.length - 1)) }
}

export function windowLength(window: ContextWindow): number {
  return window.paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0)
}
