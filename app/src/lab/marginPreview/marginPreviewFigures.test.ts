import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { anchorOfSpot, drawnParagraphText, offsetsOfRange, rangeOfOffsets, rangeText, wordCount } from './marginPreviewAnchors'
import { isMarginPreviewBook, marginPreviewChapters, marginPreviewStart, readsInClassicReader } from './marginPreviewModel'
import type { Book, EditionData } from '../../types'

const FIG = '￼'
const edition = {
  chapters: [{
    number: 2,
    title: '1 — The Fate of Spacetime',
    paragraphs: ['Before the _picture_ comes.', 'Interference', `${FIG}f1`, 'After it, the text goes on.', `${FIG}f2`, 'The end.'],
    kinds: [null, 'heading', null, null, null, null],
    figures: [
      { id: 'f1', number: 1, src: '/data/figures/bold-conjectures-volume-2/f1.jpg', caption: 'Figure 1:  Double slit\nexperiment.', alt: 'Image', width: 320, height: 200 },
      { id: 'f2', number: 2, src: '/data/figures/bold-conjectures-volume-2/f2.png', width: 1153, height: 1982, large: true },
    ],
  }],
} as unknown as EditionData

describe('figures in margin view (launch, 22 Oct 2026)', () => {
  const [chapter] = marginPreviewChapters(edition)

  it('a figure stays one paragraph at its index, drawn as its picture and caption', () => {
    expect(chapter.paragraphs).toHaveLength(6)
    expect(chapter.paragraphs[2]).toEqual({
      text: 'Figure 1: Double slit experiment.',
      figure: { id: 'f1', number: 1, src: '/data/figures/bold-conjectures-volume-2/f1.jpg', alt: 'Image', width: 320, height: 200 },
    })
    expect(chapter.paragraphs[4]).toMatchObject({ text: '', figure: { id: 'f2', src: '/data/figures/bold-conjectures-volume-2/f2.png', large: true } })
    expect(chapter.paragraphs[3]).toEqual({ text: 'After it, the text goes on.' })
    expect(chapter.paragraphs[1]).toEqual({ text: 'Interference', kind: 'heading' })
    expect(chapter.paragraphs[0].em).toEqual([[11, 18]])
  })

  it('only a same-origin picture is drawn; a missing or unavailable one leaves its caption', () => {
    const [c] = marginPreviewChapters({ chapters: [{ number: 1, title: 'x', paragraphs: [`${FIG}a`, `${FIG}b`, `${FIG}gone`], figures: [
      { id: 'a', number: 1, src: 'https://example.com/a.png', caption: 'A' },
      { id: 'b', number: 2, src: '/data/figures/x/b.png', caption: 'B', unavailable: true },
    ] }] } as unknown as EditionData)
    expect(c.paragraphs.map(p => [p.text, p.figure?.src])).toEqual([['A', ''], ['B', ''], ['', '']])
  })

  it('a figure is one word, as the book reader counts it: places and highlights after it keep their words', () => {
    expect(wordCount(chapter, 2)).toBe(1)
    expect(wordCount(chapter, 4)).toBe(1)
    expect(anchorOfSpot([chapter], { page: 1, para: 2, word: 4 })).toEqual({ chapterNumber: 2, paragraphIndex: 2, wordIndex: 0 })
    // The chapter's drawn text is what tinct-book.js draws: the heading, then each paragraph (a figure's caption, or a zero-width space).
    const drawn = chapter.title + chapter.paragraphs.map(p => drawnParagraphText(p.text)).join('')
    const after = { paragraphIndex: 3, fromWord: 3, endParagraphIndex: 3, toWord: 6 }
    const at = offsetsOfRange(chapter, after)!
    expect(drawn.slice(at.start, at.end)).toBe('text goes on.')
    expect(rangeOfOffsets(chapter, at.start, at.end)).toMatchObject(after)
    const last = offsetsOfRange(chapter, { paragraphIndex: 5, fromWord: 0, endParagraphIndex: 5, toWord: 2 })!
    expect(drawn.slice(last.start, last.end)).toBe('The end.')
    // A passage through a figure quotes its caption; one without a caption adds nothing.
    expect(rangeText(chapter, { paragraphIndex: 2, fromWord: 0, endParagraphIndex: 3, toWord: 2 })).toBe('Figure 1: Double slit experiment. After it,')
    expect(rangeText(chapter, { paragraphIndex: 4, fromWord: 0, endParagraphIndex: 5, toWord: 1 })).toBe('The')
  })

  it('the book reader\'s place on a figure opens on it, at its one word', () => {
    const place = { bookId: 'b', headerBook: 'b', chapterNumber: 2, sequentialChapter: 2, paragraphIndex: 2, wordIndex: 3, updatedAt: 5, deviceId: 'd', rev: 0 }
    expect(marginPreviewStart(place, [chapter], { editionKey: 'original-en', aligned: () => true })).toEqual({ chapterNumber: 2, paragraphIndex: 2, wordIndex: 0, updatedAt: 5 })
  })

  it('the real editions: every figure keeps its paragraph, with its picture', () => {
    for (const bookId of ['lords-of-the-cosmos', 'bold-conjectures-volume-2', 'the-farthest-reaches']) {
      const data = JSON.parse(readFileSync(`public/data/editions/${bookId}-original-en.json`, 'utf8')) as EditionData
      const chapters = marginPreviewChapters(data)
      let figures = 0
      data.chapters.forEach((source, i) => {
        expect(chapters[i].paragraphs).toHaveLength(source.paragraphs.length)
        for (const figure of source.figures ?? []) {
          const p = source.paragraphs.indexOf(FIG + figure.id)
          expect(chapters[i].paragraphs[p].figure).toMatchObject({ id: figure.id, src: figure.src })
          figures++
        }
      })
      expect(figures).toBeGreaterThan(0)
    }
  })
})

describe('plays and verse-sidecar books open in the classic reader (launch, 22 Oct 2026)', () => {
  const book = (over: Partial<Book>): Book => ({ id: 'x', title: 'X', author: 'Someone', editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true }], ...over } as Book)

  it('a Shakespeare play, with or without its verse sidecar, is not a margin view book', () => {
    for (const id of ['hamlet', 'macbeth', 'othello', 'the-tempest']) {
      expect(getBook(id), id).toBeTruthy()
      expect(readsInClassicReader(getBook(id)!), id).toBe(true)
      expect(isMarginPreviewBook(getBook(id)), id).toBe(false)
    }
  })

  it('any book with a verse sidecar (hasVerseLines) keeps the classic reader, whoever wrote it', () => {
    const epic = book({ id: 'an-epic', author: 'Homer', editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true, hasVerseLines: true }] as Book['editions'] })
    expect(readsInClassicReader(epic)).toBe(true)
    expect(isMarginPreviewBook(epic)).toBe(false)
    expect(isMarginPreviewBook(book({ id: 'a-novel' }))).toBe(true)
  })

  it('an epic whose lines are in its own text (no sidecar) reads in margin view, as prose books do', () => {
    // Paradise Lost and the Divine Comedy store each verse paragraph with its line breaks; margin view keeps them (white-space: pre-line).
    for (const id of ['paradise-lost', 'divine-comedy', 'frankenstein']) {
      expect(getBook(id), id).toBeTruthy()
      expect(isMarginPreviewBook(getBook(id)), id).toBe(true)
    }
  })
})
