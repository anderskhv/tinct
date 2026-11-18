// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { validNoteCardPlace, withNoteCardPlace, type LabHighlight } from '../labHighlights'
import { labHighlightRowValue, mergeLabHighlightSets, parseLabHighlightRow } from '../labHighlightSync'
import { applyMarginMarks, marginMarkOf, type MarginMarkScope } from '../marginPreview/marginPreviewMarks'
import { marginPreviewChapters } from '../marginPreview/marginPreviewModel'
import { drawnParagraphText } from '../marginPreview/marginPreviewAnchors'
import { fractionIn, orderOfPlace, placeAt, placeApplies, yOfPlace } from './notePlace'
import type { EditionData } from '../../types'

const passage = (over: Partial<LabHighlight> = {}): LabHighlight => ({ id: 'hl-1700000000000-abcd', bookId: 'frankenstein', editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 0, fromWord: 5, endParagraphIndex: 0, toWord: 6, color: 'rose', text: 'Genevese,', note: '**born**', updatedAt: 1000, ...over })
const marginNote = (over: Partial<LabHighlight> = {}): LabHighlight => passage({ id: 'hl-1700000000001-efgh', paragraphIndex: 1, endParagraphIndex: 1, fromWord: 3, toWord: 3, text: '', note: '- a\n  - b', ...over })

describe('a moved note\'s card place', () => {
  it('is kept relative to a paragraph: the same words through any size of text', () => {
    const before = { paragraphIndex: 4, top: 100, bottom: 300 }
    const place = placeAt([{ paragraphIndex: 3, top: 20, bottom: 90 }, before, { paragraphIndex: 5, top: 320, bottom: 400 }], 150, 'modern-en')!
    expect(place).toEqual({ paragraphIndex: 4, fraction: 0.25, editionKey: 'modern-en' })
    // A larger font: the paragraph is taller and lower; the card is still a quarter of the way down it.
    expect(yOfPlace({ top: 180, bottom: 580 }, place.fraction)).toBe(280)
    // In the gap above the next paragraph: just below this one's foot.
    expect(placeAt([before, { paragraphIndex: 5, top: 320, bottom: 400 }], 310)!).toMatchObject({ paragraphIndex: 5, fraction: -0.125 })
    expect(fractionIn({ top: 0, bottom: 10 }, 1000)).toBe(2)
    expect(placeApplies(place, 'modern-en')).toBe(true)
    expect(placeApplies(place, 'original-en')).toBe(false)
    expect(orderOfPlace({ paragraphIndex: 2, fraction: 0.5 }, 40)).toBe(200020)
  })

  it('a passage note keeps its passage; a margin note moves its own paragraph with it', () => {
    const moved = withNoteCardPlace(passage(), { paragraphIndex: 3, fraction: 0.5, editionKey: 'modern-en' }, 5000)
    expect(moved).toMatchObject({ paragraphIndex: 0, fromWord: 5, toWord: 6, cardPlace: { paragraphIndex: 3, fraction: 0.5 }, updatedAt: 5000 })
    const free = withNoteCardPlace(marginNote(), { paragraphIndex: 7, fraction: 0.2 }, 5000)
    expect(free).toMatchObject({ paragraphIndex: 7, endParagraphIndex: 7, fromWord: 0, toWord: 0, cardPlace: { paragraphIndex: 7, fraction: 0.2 } })
    const chapter = withNoteCardPlace(passage({ kind: 'chapter', paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 0 }), { paragraphIndex: 2, fraction: 1 }, 5000)
    expect(chapter).toMatchObject({ kind: 'chapter', paragraphIndex: 0, cardPlace: { paragraphIndex: 2, fraction: 1 } })
    // Put back: no place, stamped so the change syncs.
    const back = withNoteCardPlace(moved, null, 6000)
    expect(back.cardPlace).toBeUndefined()
    expect(back.updatedAt).toBe(6000)
    expect(validNoteCardPlace({ paragraphIndex: -1, fraction: 0 })).toBeNull()
    expect(validNoteCardPlace({ paragraphIndex: 1, fraction: Infinity })).toBeNull()
    expect(validNoteCardPlace({ paragraphIndex: 1, fraction: 9 })).toEqual({ paragraphIndex: 1, fraction: 2 })
  })

  it('syncs: the newer move wins on every device, and a broken place from the account is dropped', () => {
    const a = withNoteCardPlace(passage(), { paragraphIndex: 3, fraction: 0.5 }, 5000)
    const b = withNoteCardPlace(passage(), { paragraphIndex: 9, fraction: 0.1 }, 7000)
    expect(mergeLabHighlightSets({ highlights: [a], deleted: [] }, { highlights: [b], deleted: [] }).highlights[0].cardPlace).toEqual({ paragraphIndex: 9, fraction: 0.1 })
    expect(mergeLabHighlightSets({ highlights: [b], deleted: [] }, { highlights: [a], deleted: [] }).highlights[0].cardPlace).toEqual({ paragraphIndex: 9, fraction: 0.1 })
    // A note edited later on another device carries its own place (or none): the record as a whole is newest-wins.
    const row = labHighlightRowValue({ highlights: [b], deleted: [] })
    expect(parseLabHighlightRow(JSON.parse(JSON.stringify(row)), 'frankenstein').highlights[0].cardPlace).toEqual({ paragraphIndex: 9, fraction: 0.1 })
    const broken = parseLabHighlightRow({ v: 1, highlights: [{ ...b, cardPlace: { paragraphIndex: 'x', fraction: 1 } }], deleted: [] }, 'frankenstein')
    expect(broken.highlights).toHaveLength(1)
    expect('cardPlace' in broken.highlights[0]).toBe(false)
  })
})

describe('a moved note in the margin frame (Tinct books) is the book reader\'s place', () => {
  const chapters = marginPreviewChapters({
    chapters: [
      { number: 1, title: 'Letter 1', paragraphs: ['To Mrs. Saville, England.'] },
      { number: 2, title: 'Chapter 1', paragraphs: ['I am by birth a Genevese, and my family is one of the most distinguished.', 'Second paragraph here.', 'And so it went on, day after day.'] },
    ],
  } as unknown as EditionData)
  const scope: MarginMarkScope = { bookId: 'frankenstein', editionKey: 'modern-en', chapters }
  const startOf = (k: number) => { const c = chapters[1]; return (c.section ?? '').length + c.title.length + c.paragraphs.slice(0, k).reduce((n, p) => n + drawnParagraphText(p.text).length, 0) }

  it('goes to the frame as the paragraph\'s offset and comes back as the same paragraph', () => {
    const h = withNoteCardPlace(passage(), { paragraphIndex: 2, fraction: 0.4, editionKey: 'modern-en' }, 5000)
    const m = marginMarkOf(h, scope)!
    expect(m.place).toEqual({ at: startOf(2), f: 0.4 })
    expect(applyMarginMarks([h], [m], scope).changed).toBe(false)
    // Moved in the frame: the book reader keeps the new paragraph.
    const { next, changed } = applyMarginMarks([h], [{ ...m, place: { at: startOf(1) + 3, f: 0.9 } }], scope, 9000)
    expect(changed).toBe(true)
    expect(next[0].cardPlace).toEqual({ paragraphIndex: 1, fraction: 0.9, editionKey: 'modern-en' })
    expect(next[0]).toMatchObject({ paragraphIndex: 0, fromWord: 5, toWord: 6 })
  })

  it('a margin note moved in the frame moves its paragraph; a place made in another edition is kept', () => {
    const note = marginNote({ paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 0 })
    const m = marginMarkOf(note, scope)!
    const { next } = applyMarginMarks([note], [{ ...m, place: { at: startOf(2), f: 0 } }], scope, 9000)
    expect(next[0]).toMatchObject({ paragraphIndex: 2, endParagraphIndex: 2, cardPlace: { paragraphIndex: 2, fraction: 0 } })
    const elsewhere = withNoteCardPlace(passage(), { paragraphIndex: 1, fraction: 0.5, editionKey: 'original-en' }, 5000)
    const shown = marginMarkOf(elsewhere, scope)!
    expect(shown.place).toBeUndefined()
    const after = applyMarginMarks([elsewhere], [{ ...shown, note: 'changed' }], scope, 9000).next[0]
    expect(after.cardPlace).toEqual({ paragraphIndex: 1, fraction: 0.5, editionKey: 'original-en' })
  })
})
