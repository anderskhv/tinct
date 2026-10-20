import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { tokenizeWithEmphasis } from '../labEmphasis'
import { createLabPositionController, type LabBookPlace } from '../labPosition'
import {
  anchorOfSpot,
  drawnParagraphText,
  fractionOfParagraph,
  offsetsOfRange,
  paragraphAtFraction,
  rangeOfOffsets,
  rangeText,
  spotOfAnchor,
} from './marginPreviewAnchors'
import { marginPreviewChapters, type MarginPreviewChapter } from './marginPreviewModel'
import { createMarginPlaceGate, type MarginPlaceReport } from './marginPreviewPlace'
import { marginReaderState, marginPreviewSource } from './useMarginPreviewPlace'
import type { EditionData } from '../../types'

const edition: EditionData = {
  bookId: 'frankenstein', editionKey: 'modern-en', language: 'en', title: 'Frankenstein',
  sections: [{ title: 'Part One', chapters: [2] }],
  chapters: [
    { number: 1, title: 'Letter 1', paragraphs: ['To Mrs. Saville, England.', 'You will _rejoice_ to hear that no disaster has accompanied the commencement.'] },
    { number: 2, title: 'Chapter 1', paragraphs: ['I am by birth a Genevese, and my family is one of the most distinguished.', '', '“What,” said he,\nand _so it_ went on.', 'The last one here.'] },
  ],
} as unknown as EditionData
const chapters = marginPreviewChapters(edition)

/** The chapter's text as the frame draws it: its heading, then each paragraph (an empty one a zero-width space). */
const drawn = (c: MarginPreviewChapter) => (c.section ?? '') + c.title + c.paragraphs.map(p => drawnParagraphText(p.text)).join('')

describe('margin anchors: the frame\'s places and offsets are the book reader\'s words', () => {
  it('a place carries over as chapter number, paragraph and word, checked against the text', () => {
    expect(anchorOfSpot(chapters, { page: 2, para: 2, word: 3 })).toEqual({ chapterNumber: 2, paragraphIndex: 2, wordIndex: 3 })
    expect(anchorOfSpot(chapters, { page: 2, para: 3, word: 40 })).toEqual({ chapterNumber: 2, paragraphIndex: 3, wordIndex: 3 })
    expect(anchorOfSpot(chapters, { page: 2, para: 4, word: 0 })).toBeNull()
    expect(anchorOfSpot(chapters, { page: 3, para: 0, word: 0 })).toBeNull()
    expect(anchorOfSpot(chapters, { page: 1, para: -1, word: 0 })).toBeNull()
    expect(spotOfAnchor(chapters, { chapterNumber: 2, paragraphIndex: 2, wordIndex: 3 })).toEqual({ page: 2, para: 2, word: 3 })
    expect(spotOfAnchor(chapters, { chapterNumber: 9, paragraphIndex: 0, wordIndex: 0 })).toBeNull()
  })

  it('words are the book reader\'s (emphasis delimiters out), in every paragraph', () => {
    for (const [i, c] of chapters.entries()) for (const [p, para] of c.paragraphs.entries()) {
      const words = tokenizeWithEmphasis(edition.chapters[i].paragraphs[p]).map(w => w.text)
      expect(rangeText(c, { paragraphIndex: p, fromWord: 0, endParagraphIndex: p, toWord: words.length })).toBe(words.join(' '))
      expect(para.text.match(/\S+/g)?.length ?? 0).toBe(words.length)
    }
  })

  it('a highlight\'s character offsets round-trip through word anchors, as whole words', () => {
    const c = chapters[1], text = drawn(c)
    for (let p = 0; p < c.paragraphs.length; p++) {
      const words = c.paragraphs[p].text.match(/\S+/g) || []
      for (let from = 0; from < words.length; from++) for (let to = from + 1; to <= words.length; to++) {
        const range = { paragraphIndex: p, fromWord: from, endParagraphIndex: p, toWord: to }
        const at = offsetsOfRange(c, range)!
        expect(text.slice(at.start, at.end).split(/\s+/)).toEqual(words.slice(from, to))
        expect(rangeOfOffsets(c, at.start, at.end)).toEqual({ chapterNumber: c.number, ...range })
      }
    }
    // Across paragraphs, past the empty one.
    const across = { paragraphIndex: 0, fromWord: 5, endParagraphIndex: 2, toWord: 2 }
    const at = offsetsOfRange(c, across)!
    expect(rangeOfOffsets(c, at.start, at.end)).toEqual({ chapterNumber: 2, ...across })
  })

  it('a selection cut through words or starting in the heading snaps to the words it touches', () => {
    const c = chapters[1], text = drawn(c)
    const genevese = text.indexOf('Genevese')
    expect(rangeOfOffsets(c, genevese + 2, genevese + 5)).toMatchObject({ paragraphIndex: 0, fromWord: 5, toWord: 6 })
    expect(rangeOfOffsets(c, 0, text.indexOf('birth') + 2)).toMatchObject({ paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 4 })
    // Only the empty paragraph's zero-width space: no word.
    const empty = text.indexOf('​')
    expect(rangeOfOffsets(c, empty, empty + 1)).toBeNull()
    expect(rangeOfOffsets(c, 5, 5)).toBeNull()
  })

  it('a note at a height of its chapter is the paragraph there, and back', () => {
    const c = chapters[1]
    for (let p = 0; p < c.paragraphs.length; p++) expect(paragraphAtFraction(c, fractionOfParagraph(c, p))).toBe(p)
    expect(paragraphAtFraction(c, 0)).toBe(0)
    expect(paragraphAtFraction(c, 1)).toBe(c.paragraphs.length - 1)
  })

  it('every paragraph of a real edition round-trips (Frankenstein, Modern English)', () => {
    const real = marginPreviewChapters(JSON.parse(readFileSync(resolve(__dirname, '../../../public/data/editions/frankenstein-modern-en.json'), 'utf8')))
    for (const c of real.slice(0, 6)) for (let p = 0; p < c.paragraphs.length; p++) {
      const n = c.paragraphs[p].text.match(/\S+/g)?.length ?? 0
      if (!n) continue
      const range = { paragraphIndex: p, fromWord: Math.floor(n / 3), endParagraphIndex: p, toWord: n }
      const at = offsetsOfRange(c, range)!
      expect(rangeOfOffsets(c, at.start, at.end)).toEqual({ chapterNumber: c.number, ...range })
    }
  })
})

const open = (spot: MarginPlaceReport['spot'], target: MarginPlaceReport['target'], interactions = 0): MarginPlaceReport => ({ kind: 'open', spot, target, interactions })
const move = (spot: MarginPlaceReport['spot'], interactions: number): MarginPlaceReport => ({ kind: 'move', spot, interactions })

describe('the margin place gate: the book reader\'s rules for writing a place', () => {
  it('writes nothing while the book is loading', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    expect(gate.decide(move({ page: 2, para: 1, word: 0 }, 3))).toBeNull()
    expect(gate.opened()).toBe(false)
  })

  it('a landed restore writes the restored word itself (open-book), never the first word of its line', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const target = { page: 2, para: 2, word: 3 }
    expect(gate.decide(open(target, target))).toEqual({ reason: 'open-book', at: { chapterNumber: 2, paragraphIndex: 2, wordIndex: 3 }, spot: target })
    // Re-landed at the same word: nothing new.
    expect(gate.decide(open(target, target))).toBeNull()
  })

  it('holds every write while a restore has not landed, until the reader acts (labRestoreTarget)', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const target = { page: 2, para: 2, word: 3 }
    // A reflow left the view a paragraph early: no write, at open or after.
    expect(gate.decide(open({ page: 2, para: 1, word: 0 }, target, 0))).toBeNull()
    expect(gate.decide(move({ page: 2, para: 0, word: 4 }, 0))).toBeNull()
    expect(gate.watch()).not.toBeNull()
    // The reader scrolls: their place from now on.
    expect(gate.decide(move({ page: 2, para: 3, word: 0 }, 1))).toMatchObject({ reason: 'page-turn', at: { chapterNumber: 2, paragraphIndex: 3, wordIndex: 0 } })
    expect(gate.watch()).toBeNull()
  })

  it('a restore that lands only after a reflow settles is the opening write then (open-book), at its word', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const target = { page: 2, para: 2, word: 3 }
    expect(gate.decide(open({ page: 2, para: 2, word: 0 }, target))).toBeNull()
    expect(gate.decide(open(target, target))).toMatchObject({ reason: 'open-book', at: { paragraphIndex: 2, wordIndex: 3 } })
    expect(gate.decide(open(target, target))).toBeNull()
  })

  it('writes no backward place without a reader action since the last write', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const target = { page: 2, para: 2, word: 3 }
    gate.decide(open(target, target))
    expect(gate.decide(move({ page: 2, para: 1, word: 0 }, 0))).toBeNull()
    expect(gate.decide(move({ page: 1, para: 1, word: 0 }, 0))).toBeNull()
    expect(gate.decide(move({ page: 2, para: 1, word: 0 }, 2))).toMatchObject({ reason: 'page-turn', at: { paragraphIndex: 1 } })
    // Forward needs no new action (the reader reads on).
    expect(gate.decide(move({ page: 2, para: 3, word: 0 }, 2))).toMatchObject({ at: { paragraphIndex: 3 } })
  })

  it('a place outside the edition\'s text is never written', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    gate.decide(open(null, null))
    expect(gate.decide(move({ page: 5, para: 0, word: 0 }, 1))).toBeNull()
    expect(gate.decide(move({ page: 2, para: 99, word: 0 }, 2))).toBeNull()
    expect(gate.decide(move({ page: 2, para: 0, word: 99 }, 3))).toMatchObject({ at: { chapterNumber: 2, paragraphIndex: 0, wordIndex: 14 } })
  })

  it('scrolling on into the next chapter finishes the one before', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const target = { page: 1, para: 1, word: 0 }
    gate.decide(open(target, target))
    expect(gate.decide(move({ page: 2, para: 0, word: 0 }, 1))).toMatchObject({ finished: 1, at: { chapterNumber: 2 } })
  })

  it('another device\'s place the page moved to is not written back once landed, and holds writes until then', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const first = { page: 1, para: 1, word: 2 }
    gate.decide(open(first, first))
    const phone = { page: 2, para: 3, word: 1 }
    gate.expectRestore(phone)
    expect(gate.decide(move({ page: 2, para: 0, word: 0 }, 0))).toBeNull()
    expect(gate.decide(open(phone, phone, 0))).toBeNull()
    expect(gate.last()).toEqual(phone)
    // From there, the reader's own moves are written.
    expect(gate.decide(move({ page: 2, para: 3, word: 3 }, 1))).toMatchObject({ reason: 'page-turn', at: { paragraphIndex: 3, wordIndex: 3 } })
  })
})

describe('the margin place through the position path', () => {
  const model = { bookId: 'frankenstein', editionKey: 'modern-en', editionLabel: 'Modern English', title: 'Frankenstein', author: 'Mary Shelley', language: 'en', chapters, start: { chapterNumber: 2, paragraphIndex: 2, wordIndex: 3, updatedAt: 1 }, normalHref: '' }

  it('is a place of this book in this edition, with no page and the last place\'s compare mode left alone', () => {
    const known = { compareEditionKey: 'original-en', readerMode: 'compare' } as LabBookPlace
    expect(marginReaderState(model, known)).toEqual({ pageIndex: 0, primaryEditionKey: 'modern-en', compareEditionKey: 'original-en', readerMode: 'compare' })
    expect(marginReaderState(model, null)).toEqual({ pageIndex: 0, primaryEditionKey: 'modern-en', compareEditionKey: undefined, readerMode: 'read' })
    const source = marginPreviewSource(model)
    expect(source).toMatchObject({ bookId: 'frankenstein', chapterNumber: 2, chapters: [{ number: 1, title: 'Letter 1' }, { number: 2, title: 'Chapter 1' }] })
    expect(source.chaptersProvisional).toBeUndefined()
  })

  it('a gate note settles the book at its exact word in the controller (the store the book reader reads)', () => {
    const gate = createMarginPlaceGate({ bookId: 'frankenstein', chapters })
    const controller = createLabPositionController({ deviceId: 'desk' })
    const note = gate.decide(open({ page: 2, para: 2, word: 3 }, { page: 2, para: 2, word: 3 }))!
    controller.note({ reason: note.reason, place: { bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: note.at.chapterNumber, sequentialChapter: note.at.chapterNumber, paragraphIndex: note.at.paragraphIndex, wordIndex: note.at.wordIndex, primaryEditionKey: 'modern-en', updatedAt: 0, deviceId: 'desk', rev: 1 } })
    expect(controller.resume()).toMatchObject({ bookId: 'frankenstein', chapterNumber: 2, paragraphIndex: 2, wordIndex: 3, primaryEditionKey: 'modern-en' })
  })
})
