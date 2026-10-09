// @vitest-environment jsdom
/**
 * Books already converted keep their chapters, paragraphs and places
 * (userEdition.ts USER_EDITION_CONVERTER): a stored conversion stays usable
 * under the rules it was made with, a book converted again is converted under
 * its own rules, and what changes no paragraph is healed in memory on read.
 * Add to Tinct sends what rules 6 knows of each paragraph (verse, headings)
 * and the Worker publishes it only as the EPUB has it.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { LEGACY_EDITION_CONVERTER, USER_EDITION_CONVERTER, USER_EDITION_FORMAT, usableUserEdition, type UserBookEdition } from './userEdition'
import { conversionRules } from './userBookStore'
import { readUserBookPlace, storedPlaceConverter, writeUserBookPlace } from './userBookPlace'
import { healUserEdition, personName } from './chapterAuthors'
import { publicChapters } from './publicChapters'
import { parseChapters, publicSpeakers } from '../../worker/routes/publicBooks'
import { letters, titleInSource, verifyEditionAgainstSource, documentLetters } from '../../worker/lib/epubSource'
import { normalizeChapterTitle, normalizeChapterTitles } from '../../../public/lab/chapter-title.js'
import { registerUserBook } from './userBookSource'
import { resetVerseLines, verseSpeakerWords } from '../labVerseLines'

const edition = (converter: number, chapters: UserBookEdition['chapters'], author = 'Jo Writer'): UserBookEdition => ({
  format: USER_EDITION_FORMAT, converter, title: 'A Modest Proposal', author, language: 'en', droppedImages: 0, bylines: true, chapters,
})

afterEach(() => { localStorage.clear(); resetVerseLines() })

describe('stored conversions and their rules', () => {
  it('keeps a conversion made under rules 5 or 6 as it is, and converts one made earlier again', () => {
    const chapters = [{ number: 1, title: 'One', paragraphs: ['Text.'] }]
    expect(usableUserEdition(edition(LEGACY_EDITION_CONVERTER, chapters))).toBe(true)
    expect(usableUserEdition(edition(USER_EDITION_CONVERTER, chapters))).toBe(true)
    expect(usableUserEdition(edition(4, chapters))).toBe(false)
  })

  it('converts a book again under the rules it was read under, never the new ones', () => {
    const stored = (converter: number) => edition(converter, [{ number: 1, title: 'One', paragraphs: ['Text.'] }])
    // A conversion kept but missing a picture: its own rules.
    expect(conversionRules(stored(5), undefined)).toBe(5)
    expect(conversionRules(stored(6), null)).toBe(6)
    // No usable conversion, but a place saved before places recorded the rules: the rules before 6.
    expect(conversionRules(stored(4), null)).toBe(LEGACY_EDITION_CONVERTER)
    expect(conversionRules(undefined, null)).toBe(LEGACY_EDITION_CONVERTER)
    // A place that records its rules; an unknown number reads as a place made before.
    expect(conversionRules(undefined, 6)).toBe(6)
    expect(conversionRules(undefined, 5)).toBe(5)
    expect(conversionRules(undefined, 99)).toBe(LEGACY_EDITION_CONVERTER)
    // Never read on this device: the current rules.
    expect(conversionRules(undefined, undefined)).toBe(USER_EDITION_CONVERTER)
    expect(conversionRules({ format: 'something else', converter: 6 }, undefined)).toBe(USER_EDITION_CONVERTER)
  })

  it('records the rules with the place, and reads a place saved before as one made under rules 5', () => {
    const book = edition(6, [{ number: 1, title: 'One', paragraphs: ['A first paragraph.', 'A second one.'] }])
    expect(storedPlaceConverter('aa11')).toBeUndefined()
    localStorage.setItem('tinct-addbook:place:aa11', JSON.stringify({ chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 1 }))
    expect(storedPlaceConverter('aa11')).toBeNull()
    writeUserBookPlace('bb22', { chapterNumber: 1, paragraphIndex: 1, wordIndex: 2, updatedAt: 2, converter: 6 })
    expect(storedPlaceConverter('bb22')).toBe(6)
    expect(readUserBookPlace('bb22', book)).toEqual({ chapterNumber: 1, paragraphIndex: 1, wordIndex: 2, updatedAt: 2, converter: 6 })
    localStorage.setItem('tinct-addbook:place:cc33', '{not json')
    expect(storedPlaceConverter('cc33')).toBeUndefined()
  })
})

describe("a reader's own play", () => {
  it('sets its speakers as labels when the conversion says it is a play, and only then', () => {
    const chapters = [{ number: 1, title: 'Act 1', paragraphs: ['NORA. Hide the Christmas Tree carefully, Helen.', 'HELMER. Is that my little lark?'] }]
    registerUserBook('userbook-' + 'cd'.repeat(12), edition(5, chapters))
    expect(verseSpeakerWords('NORA. Hide the Christmas Tree carefully, Helen.')).toBe(0)
    registerUserBook('userbook-' + 'ef'.repeat(12), { ...edition(6, chapters), speakers: true })
    expect(verseSpeakerWords('NORA. Hide the Christmas Tree carefully, Helen.')).toBe(1)
  })
})

describe('in-memory heals of an earlier conversion', () => {
  it("gives the author as readers know them and a one-chapter book its own title, and changes no paragraph", () => {
    const before = edition(5, [{ number: 1, title: 'Section 1', paragraphs: ['It is a melancholy object.', 'I think it is agreed.'], kinds: [null, null] }], 'graf Leo Tolstoy')
    const healed = healUserEdition(before)
    expect(healed.author).toBe('Leo Tolstoy')
    expect(healed.chapters[0].title).toBe('A Modest Proposal')
    expect(healed.converter).toBe(5)
    expect(healed.chapters.map(chapter => [chapter.number, chapter.paragraphs, chapter.kinds])).toEqual(before.chapters.map(chapter => [chapter.number, chapter.paragraphs, chapter.kinds]))
    // A book that needs nothing is returned as it is.
    const fine = edition(5, [{ number: 1, title: 'One', paragraphs: ['Text.'] }, { number: 2, title: 'Section 2', paragraphs: ['More.'] }])
    expect(healUserEdition(fine)).toBe(fine)
  })

  it('keeps a name with a particle, and titles of nobility that are part of the name', () => {
    expect(personName('graf Leo Tolstoy')).toBe('Leo Tolstoy')
    expect(personName('comte de Lautréamont')).toBe('comte de Lautréamont')
    expect(personName('Count Basie')).toBe('Count Basie')
    expect(personName('Benedictus de Spinoza')).toBe('Benedictus de Spinoza')
  })
})

describe('Add to Tinct: what is sent and what is published', () => {
  it("sends each paragraph's kind, a picture's caption as text and nothing for a picture without one", () => {
    const sent = publicChapters([{
      number: 1, title: 'Observ. I. Of the Point of a sharp small Needle.',
      paragraphs: ['￼f1', 'As in Geometry, the most natural way of beginning is from a Mathematical point.', '￼f2', '_Schem._ 2.'],
      kinds: [null, null, null, 'line'],
      figures: [{ id: 'f1', number: 1, src: '' }, { id: 'f2', number: 2, src: '', caption: 'Fig. 1. The point of a needle.' }],
    }])
    expect(sent).toEqual([{
      number: 1, title: 'Observ. I. Of the Point of a sharp small Needle.',
      paragraphs: ['As in Geometry, the most natural way of beginning is from a Mathematical point.', 'Fig. 1. The point of a needle.', '_Schem._ 2.'],
      kinds: [null, null, 'line'],
    }])
    // Prose only: no kinds sent.
    expect(publicChapters([{ number: 1, title: 'One', paragraphs: ['Text.'] }])).toEqual([{ number: 1, title: 'One', paragraphs: ['Text.'] }])
  })

  it('keeps kinds the reader knows, in step with the paragraphs, and leaves out pictures an older page sent', () => {
    expect(parseChapters({ chapters: [{ title: 'Poem', paragraphs: ['VI.', 'If you were coming in the fall,', '￼f3'], kinds: ['heading', 'line', null] }] }))
      .toEqual([{ number: 1, title: 'Poem', paragraphs: ['VI.', 'If you were coming in the fall,'], kinds: ['heading', 'line'] }])
    // Kinds out of step, or unknown, are not kept; the text is.
    expect(parseChapters({ chapters: [{ title: 'Poem', paragraphs: ['a', 'b'], kinds: ['line'] }] })).toEqual([{ number: 1, title: 'Poem', paragraphs: ['a', 'b'] }])
    expect(parseChapters({ chapters: [{ title: 'Poem', paragraphs: ['a'], kinds: ['<script>'] }] })).toEqual([{ number: 1, title: 'Poem', paragraphs: ['a'] }])
    // A chapter that was only a picture is not a chapter.
    expect(parseChapters({ chapters: [{ title: 'Plate', paragraphs: ['￼f1'] }, { title: 'One', paragraphs: ['Text.'] }] })).toEqual([{ number: 1, title: 'One', paragraphs: ['Text.'] }])
  })

  it('keeps kinds in step when a paragraph not in the source is left out', () => {
    const source = letters('POEMS VI. If you were coming in the fall, I’d brush the summer by')
    const checked = verifyEditionAgainstSource([{ number: 1, title: 'Poems', paragraphs: ['VI.', 'Not in this book at all.', 'If you were coming in the fall,', 'I’d brush the summer by'], kinds: ['heading', null, 'line', 'line'] }], source)
    expect(checked?.chapters).toEqual([{ number: 1, title: 'Poems', paragraphs: ['VI.', 'If you were coming in the fall,', 'I’d brush the summer by'], kinds: ['heading', 'line', 'line'] }])
  })

  it("accepts a title made of two of the source's own entries, or a part's number; never words the source lacks", () => {
    const source = documentLetters('<h2>BOOK ONE: 1805</h2><h2>CHAPTER I</h2><p>Text.</p><h2>CHAPTER II</h2><h2>I. A SCANDAL IN BOHEMIA</h2><h2>PART II.</h2><h3>DEFINITIONS</h3>')
    expect(titleInSource('BOOK ONE, CHAPTER II', source)).toBe(true)
    expect(titleInSource('PART II — DEFINITIONS', source)).toBe(true)
    expect(titleInSource('I. A SCANDAL IN BOHEMIA, PART III', source)).toBe(true)
    expect(titleInSource('Chapter XIV', source)).toBe(true)
    expect(titleInSource('BOOK ONE, A Chapter Nobody Wrote', source)).toBe(false)
    expect(titleInSource('Buy cheap pills', source)).toBe(false)
    const checked = verifyEditionAgainstSource([{ number: 1, title: 'BOOK ONE, A Chapter Nobody Wrote', paragraphs: ['Text.'] }], source)
    expect(checked?.chapters[0].title).toBe('Section 1')
  })

  it("reads a lettered note call as the converter does: not the book's words", () => {
    const source = documentLetters('<p>Its frontiers <a href="#linknote-1a" id="linknoteref-1a">1a</a> were guarded.</p>')
    expect(source).toBe(letters('Its frontiers were guarded.'))
  })

  it('marks a play whose speeches open on their speakers, and nothing else', () => {
    const play = [{ paragraphs: Array.from({ length: 10 }, (_, i) => [`NORA. Line ${i}.`, `HELMER. Line ${i}.`, `MRS LINDE. Line ${i}.`]).flat() }]
    expect(publicSpeakers(play)).toBe(true)
    expect(publicSpeakers([{ paragraphs: Array.from({ length: 40 }, (_, i) => `VI. Paragraph ${i}.`) }])).toBe(false)
  })
})

describe('house style for joined titles (chapter-title.js)', () => {
  it('sets a title and its numbered part each in house style', () => {
    expect(normalizeChapterTitle('BOOK ONE, CHAPTER II')).toBe('Book 1, Chapter 2')
    expect(normalizeChapterTitle('I. A SCANDAL IN BOHEMIA, PART II')).toBe('1 — A Scandal in Bohemia, Part 2')
    expect(normalizeChapterTitle('FIRST EPILOGUE: 1813 - 20, CHAPTER IV')).toBe('First Epilogue: 1813 - 20, Chapter 4')
    expect(normalizeChapterTitle('PART II — DEFINITIONS')).toBe('Part 2 — Definitions')
    expect(normalizeChapterTitle('LETTER I — MISS ANNA HOWE, TO MISS CLARISSA HARLOWE JAN 10.')).toBe('Letter 1 — Miss Anna Howe, to Miss Clarissa Harlowe Jan 10')
    // Titles already in house style, and ones without a numbered part, are as before.
    for (const title of ['Book 1, Chapter 2', 'Act 1, Scene 2', 'Miss Brooke, Chapter 2', 'Henry V', 'To Some Ladies']) expect(normalizeChapterTitle(title)).toBe(title)
    expect(normalizeChapterTitles([{ title: 'BOOK TWO: 1805, CHAPTER I' }]).map(chapter => chapter.title)).toEqual(['Book 2 — 1805, Chapter 1'])
  })
})
