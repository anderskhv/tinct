import { useEffect, useMemo, useState } from 'react'

/**
 * Author footnotes, served per edition as a sidecar so the edition text (and
 * every hash, word index, highlight and audio clip keyed to it) never changes.
 *
 * A note is anchored by `chapter` + 0-based `paragraph` + `offset`, a UTF-16
 * position in that paragraph's text immediately after `after`, the words the
 * marker follows. `after` is what makes an anchor survive a text revision: if
 * the offset no longer lands after it, the words are searched for instead, and
 * a note that can be placed nowhere is dropped rather than misplaced.
 */
export interface Footnote {
  id: string
  chapter: number
  paragraph: number
  offset: number
  after: string
  text: string
}

/** A note placed on a chapter's words. `number` counts from 1 within the chapter. */
export interface PlacedFootnote {
  id: string
  number: number
  paragraphIndex: number
  /** The word the marker follows, in the reader's word indexes. */
  wordIndex: number
  text: string
}

/** Editions that have a footnote sidecar. Any other edition makes no request. */
const FOOTNOTE_EDITIONS: ReadonlySet<string> = new Set(['fear-and-trembling/modern-en'])

export const hasFootnotes = (bookId?: string, editionKey?: string): boolean =>
  Boolean(bookId && editionKey && FOOTNOTE_EDITIONS.has(`${bookId}/${editionKey}`))

export const footnotesPath = (bookId: string, editionKey: string): string => `/data/footnotes/${bookId}-${editionKey}.json`

export function parseFootnotes(raw: unknown): Footnote[] {
  const list = (raw as { footnotes?: unknown } | null)?.footnotes
  if (!Array.isArray(list)) return []
  return list.filter((note): note is Footnote => Boolean(note)
    && typeof note.id === 'string' && typeof note.text === 'string' && typeof note.after === 'string'
    && Number.isInteger(note.chapter) && Number.isInteger(note.paragraph) && Number.isInteger(note.offset))
}

/** The index of the word a marker at `offset` follows: the last word that starts before it. */
function wordIndexAt(text: string, offset: number): number {
  let index = -1
  let count = 0
  for (const match of text.matchAll(/\S+/g)) {
    if (match.index! >= offset) break
    index = count
    count += 1
  }
  return index
}

function anchorOffset(note: Footnote, text: string): number | null {
  if (text.slice(0, note.offset).endsWith(note.after) && note.after) return note.offset
  const found = note.after ? text.indexOf(note.after) : -1
  return found < 0 ? null : found + note.after.length
}

/** Place a chapter's notes on its paragraphs, numbered in reading order. */
export function placeFootnotes(notes: readonly Footnote[], chapterNumber: number, paragraphs: readonly string[]): PlacedFootnote[] {
  const placed: Array<Omit<PlacedFootnote, 'number'> & { offset: number }> = []
  for (const note of notes) {
    if (note.chapter !== chapterNumber) continue
    const text = paragraphs[note.paragraph]
    if (text === undefined) continue
    const offset = anchorOffset(note, text)
    if (offset === null) continue
    const wordIndex = wordIndexAt(text, offset)
    if (wordIndex < 0) continue
    placed.push({ id: note.id, paragraphIndex: note.paragraph, wordIndex, text: note.text, offset })
  }
  placed.sort((a, b) => a.paragraphIndex - b.paragraphIndex || a.offset - b.offset)
  return placed.map(({ offset: _offset, ...note }, index) => ({ ...note, number: index + 1 }))
}

const loads = new Map<string, Promise<Footnote[]>>()
export function loadFootnotes(bookId?: string, editionKey?: string): Promise<Footnote[]> {
  if (!bookId || !editionKey || !hasFootnotes(bookId, editionKey)) return Promise.resolve([])
  const key = `${bookId}:${editionKey}`
  if (!loads.has(key)) loads.set(key, (async () => {
    try {
      const response = await fetch(footnotesPath(bookId, editionKey))
      return response.ok ? parseFootnotes(await response.json()) : []
    } catch { return [] }
  })())
  return loads.get(key)!
}

/** A chapter's footnotes, placed on the paragraphs the reader is showing. Empty until loaded. */
export function useChapterFootnotes(bookId: string | undefined, editionKey: string | undefined, chapterNumber: number, paragraphs: readonly string[]): PlacedFootnote[] {
  const key = `${bookId}:${editionKey}`
  const [loaded, setLoaded] = useState<{ key: string; notes: Footnote[] } | null>(null)
  useEffect(() => {
    let current = true
    void loadFootnotes(bookId, editionKey).then(notes => { if (current) setLoaded({ key, notes }) })
    return () => { current = false }
  }, [key, bookId, editionKey])
  return useMemo(
    () => loaded?.key === key && loaded.notes.length ? placeFootnotes(loaded.notes, chapterNumber, paragraphs) : NONE,
    [loaded, key, chapterNumber, paragraphs],
  )
}
const NONE: PlacedFootnote[] = []
