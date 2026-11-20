/**
 * Where a moved note's card sits in the desktop margin (Anders, 13 Nov 2026): its top kept as a fraction of the
 * height of the paragraph beside it (labHighlights `cardPlace`), never in pixels, so the card stays by the same words
 * through a reload, sync, a font or size change and a resize. The pure rules first, then the reader's DOM.
 */
import type { LabNoteCardPlace } from '../labHighlights'

export interface ParagraphBox { paragraphIndex: number; top: number; bottom: number }

/** The fraction a card's top at `y` is down `box` (above its top: below 0; below its foot: above 1), kept in [-1, 2]. */
export function fractionIn(box: Pick<ParagraphBox, 'top' | 'bottom'>, y: number): number {
  const height = Math.max(1, box.bottom - box.top)
  return Math.max(-1, Math.min(2, Math.round(((y - box.top) / height) * 10000) / 10000))
}

/** The window y of a place, given its paragraph's box now. */
export function yOfPlace(box: Pick<ParagraphBox, 'top' | 'bottom'>, fraction: number): number {
  return box.top + fraction * Math.max(1, box.bottom - box.top)
}

/** The paragraph a card dropped at `y` belongs to: the first whose foot is at or below it, else the last. */
export function placeAt(boxes: ParagraphBox[], y: number, editionKey?: string): LabNoteCardPlace | null {
  if (!boxes.length) return null
  const sorted = [...boxes].sort((a, b) => a.top - b.top)
  const box = sorted.find(item => item.bottom >= y) ?? sorted[sorted.length - 1]
  return { paragraphIndex: box.paragraphIndex, fraction: fractionIn(box, y), ...(editionKey ? { editionKey } : {}) }
}

/** The margin's sort key of a placed card, in the same scale as a passage's (paragraph * 100000 + word). */
export function orderOfPlace(place: LabNoteCardPlace, words = 100): number {
  return place.paragraphIndex * 100000 + Math.max(0, Math.min(99999, Math.round(Math.max(0, place.fraction) * Math.max(1, words))))
}

/** A place applies only in the edition it was made in (or any, when it names none). */
export function placeApplies(place: LabNoteCardPlace | undefined, editionKey: string): place is LabNoteCardPlace {
  return !!place && (!place.editionKey || place.editionKey === editionKey)
}

const WORD = '[data-testid="lab-word"]'

/** A paragraph's box in the reader's own chapter (its first word's top to its last word's foot), or null when not drawn. */
export function paragraphBox(host: ParentNode, paragraphIndex: number): ParagraphBox | null {
  const words = host.querySelectorAll<HTMLElement>(`${WORD}[data-paragraph-index="${paragraphIndex}"]`)
  if (!words.length) return null
  const first = words[0].getBoundingClientRect(), last = words[words.length - 1].getBoundingClientRect()
  if (!first.height && !last.height) return null
  return { paragraphIndex, top: Math.min(first.top, last.top), bottom: Math.max(first.bottom, last.bottom) }
}

/** The drawn paragraphs of the reader's own chapter around `y` (each paragraph's box), for a drop. */
export function paragraphBoxes(host: ParentNode): ParagraphBox[] {
  const boxes = new Map<number, ParagraphBox>()
  for (const word of host.querySelectorAll<HTMLElement>(WORD)) {
    const index = Number(word.dataset.paragraphIndex)
    if (!Number.isInteger(index)) continue
    const rect = word.getBoundingClientRect()
    if (!rect.height) continue
    const box = boxes.get(index)
    if (!box) boxes.set(index, { paragraphIndex: index, top: rect.top, bottom: rect.bottom })
    else { box.top = Math.min(box.top, rect.top); box.bottom = Math.max(box.bottom, rect.bottom) }
  }
  return [...boxes.values()]
}

/** Where a card's top at window y `y` is kept. */
export function notePlaceFromY(host: ParentNode, y: number, editionKey?: string): LabNoteCardPlace | null {
  return placeAt(paragraphBoxes(host), y, editionKey)
}

/** A kept place's window y now, or null when its paragraph is not drawn. */
export function noteYFromPlace(host: ParentNode, place: LabNoteCardPlace): number | null {
  const box = paragraphBox(host, place.paragraphIndex)
  return box ? yOfPlace(box, place.fraction) : null
}
