// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from '../labHighlights'
import { drawnParagraphText, offsetsOfRange } from './marginPreviewAnchors'
import { applyMarginMarks, labMarkOf, marginMarkOf, marginMarks, migratePreviewMarks, type MarginMark, type MarginMarkScope } from './marginPreviewMarks'
import { marginPreviewChapters } from './marginPreviewModel'
import { migratePreviewMarksLocal, previewMarksKey } from './useMarginPreviewMarks'
import type { EditionData } from '../../types'

const chapters = marginPreviewChapters({
  chapters: [
    { number: 1, title: 'Letter 1', paragraphs: ['To Mrs. Saville, England.', 'You will _rejoice_ to hear that no disaster has accompanied the commencement.'] },
    { number: 2, title: 'Chapter 1', paragraphs: ['I am by birth a Genevese, and my family is one of the most distinguished.', '', 'And so it went on, day after day.'] },
  ],
} as unknown as EditionData)
const scope: MarginMarkScope = { bookId: 'frankenstein', editionKey: 'modern-en', chapters }
const text = (page: number) => { const c = chapters[page - 1]; return (c.section ?? '') + c.title + c.paragraphs.map(p => drawnParagraphText(p.text)).join('') }
const lab = (over: Partial<LabHighlight>): LabHighlight => ({ id: 'hl-1700000000000-abcd', bookId: 'frankenstein', editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 0, fromWord: 5, endParagraphIndex: 0, toWord: 6, color: 'rose', text: 'Genevese,', updatedAt: 1000, ...over })

describe('margin marks are the book reader\'s marks', () => {
  it('a book reader highlight shows in the margin on its words, and comes back as the same record', () => {
    const h = lab({ groupId: 'hg-1', note: 'Where he was born.' })
    const m = marginMarkOf(h, scope)!
    expect(text(2).slice(m.start, m.end)).toBe('Genevese,')
    expect(m).toMatchObject({ id: h.id, page: 2, color: 'rose', note: 'Where he was born.' })
    // Handed back unchanged: the book reader's record is kept exactly (its group too).
    const { next, changed } = applyMarginMarks([h], [m], scope)
    expect(changed).toBe(false)
    expect(next[0]).toBe(h)
  })

  it('a highlight made in the margin is a word-anchored LabHighlight of this book and edition', () => {
    const t = text(2), start = t.indexOf('my family'), end = start + 'my family'.length
    const m: MarginMark = { id: 'mz1abc', page: 2, start, end, text: 'my family', color: 'sage', at: 2000 }
    const { next, changed } = applyMarginMarks([], [m], { ...scope, contentRevision: 'a'.repeat(64) }, 3000)
    expect(changed).toBe(true)
    expect(next).toEqual([{ id: 'mz1abc', bookId: 'frankenstein', editionKey: 'modern-en', contentRevision: 'a'.repeat(64), chapterNumber: 2, color: 'sage', paragraphIndex: 0, fromWord: 7, endParagraphIndex: 0, toWord: 9, text: 'my family', updatedAt: 2000 }])
    // And back: the same characters.
    expect(marginMarkOf(next[0], scope)).toMatchObject({ start, end })
  })

  it('a colour or note changed in the margin replaces the record, stamped now; a removal is returned for its tombstone', () => {
    const a = lab({ id: 'a' }), b = lab({ id: 'b', paragraphIndex: 2, endParagraphIndex: 2, fromWord: 0, toWord: 2, text: 'And so' })
    const other = lab({ id: 'other', bookId: 'dracula' }), original = lab({ id: 'orig', editionKey: 'original-en' })
    const ma = { ...marginMarkOf(a, scope)!, color: 'sky', note: 'Mine.' }
    const { next, removed } = applyMarginMarks([a, b, other, original], [ma], scope, 5000)
    expect(removed.map(h => h.id)).toEqual(['b'])
    expect(next.map(h => h.id)).toEqual(['a', 'other', 'orig'])
    expect(next[0]).toMatchObject({ id: 'a', color: 'sky', note: 'Mine.', updatedAt: 5000, paragraphIndex: 0, fromWord: 5 })
    // Clearing the note in the margin clears it here.
    const cleared = applyMarginMarks(next, [{ ...ma, note: undefined }], scope, 6000).next[0]
    expect(cleared.note).toBeUndefined()
  })

  it('a margin note at a height is a note on that paragraph with no words; a chapter\'s note is the book reader\'s chapter note', () => {
    const free = labMarkOf({ id: 'n1', page: 2, rects: [[1, 0.9, 0, 0]], text: '', note: 'Ends here.', withNote: true, color: 'gold' }, scope)!
    expect(free).toMatchObject({ chapterNumber: 2, paragraphIndex: 2, fromWord: 0, endParagraphIndex: 2, toWord: 0, note: 'Ends here.', margin: 'note' })
    const back = marginMarkOf({ ...free, updatedAt: 1 } as LabHighlight, scope)!
    expect(back.rects).toHaveLength(1)
    expect(labMarkOf(back, scope)).toMatchObject({ paragraphIndex: 2 })
    const unit = labMarkOf({ id: 'n2', page: 1, rects: [[2, 1, 0, 0]], text: '', note: 'A letter.', withNote: true }, scope)!
    expect(unit).toMatchObject({ kind: 'chapter', chapterNumber: 1, note: 'A letter.' })
    // The book reader's chapter note (any edition) is the margin's chapter Note.
    expect(marginMarkOf(lab({ id: 'cn', kind: 'chapter', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 0, note: 'Hi' }), scope)).toMatchObject({ page: 1, rects: [[2, 1, 0, 0]], note: 'Hi', withNote: true })
  })

  it('marks of other books, editions or a chapter this edition lacks are not shown', () => {
    expect(marginMarks([lab({ bookId: 'dracula' }), lab({ editionKey: 'original-en' }), lab({ chapterNumber: 9 })], scope)).toEqual([])
  })

  it('the preview\'s own marks migrate once: matching words join the list, the local keys go', () => {
    localStorage.clear()
    const t = text(2), start = t.indexOf('Genevese'), end = start + 'Genevese,'.length
    const ok: MarginMark = { id: 'old1', page: 2, start, end, text: 'Genevese,', color: 'gold', at: 100 }
    const stale: MarginMark = { id: 'old2', page: 2, start, end, text: 'Something else entirely', color: 'gold', at: 100 }
    expect(migratePreviewMarks([ok, stale], [], scope).keep.map(m => m.id)).toEqual(['old2'])
    localStorage.setItem(previewMarksKey('frankenstein'), JSON.stringify([ok]))
    localStorage.setItem('tinct-addbook:hl-gone:preview:frankenstein', '[]')
    writeLabHighlights([lab({ id: 'mine', bookId: 'dracula' })])
    expect(migratePreviewMarksLocal(scope).map(h => h.id)).toEqual(['old1'])
    expect(readLabHighlights().map(h => h.id)).toEqual(['mine', 'old1'])
    expect(localStorage.getItem(previewMarksKey('frankenstein'))).toBeNull()
    expect(localStorage.getItem('tinct-addbook:hl-gone:preview:frankenstein')).toBeNull()
    // Again: nothing more.
    expect(migratePreviewMarksLocal(scope)).toEqual([])
  })
})

describe('offsets match the frame\'s text exactly', () => {
  beforeEach(() => localStorage.clear())
  it('every word of every paragraph', () => {
    for (const [i, c] of chapters.entries()) for (let p = 0; p < c.paragraphs.length; p++) {
      const words = c.paragraphs[p].text.match(/\S+/g) || []
      words.forEach((w, k) => { const at = offsetsOfRange(c, { paragraphIndex: p, fromWord: k, endParagraphIndex: p, toWord: k + 1 })!; expect(text(i + 1).slice(at.start, at.end)).toBe(w) })
    }
  })
})
