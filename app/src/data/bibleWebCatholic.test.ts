import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { bibleEditionHasChapter, bibleHighlightsCarryAcross, bibleVerseNumbersCorrespond, BIBLE_SHARED_CHAPTERS } from './bibleEditionChapters'
import { nextLabChapter, prevLabChapter } from '../lab/labSource'
import { remoteResumeSelection } from '../lab/useLabPositionSync'
import { DEFAULT_LAB_PREFS } from '../lab/labPrefs'
import type { LabBookPlace } from '../lab/labPosition'

type Edition = { sections: { title: string; chapters?: number[]; sections?: unknown[] }[]; chapters: { number: number; title: string; paragraphs: string[] }[] }
const app = resolve(__dirname, '../..')
const edition = (key: string) => JSON.parse(readFileSync(resolve(app, `public/data/editions/bible-${key}.json`), 'utf8')) as Edition
const numbering = JSON.parse(readFileSync(resolve(app, 'data/bible-webc-en.numbering.json'), 'utf8')) as {
  candidateSha256: string
  chapters: { native: number; number: number; bookCode: string; biblicalChapter: number; paragraphsSha256: string }[]
}
const webc = edition('webc-en')
const bsb = edition('bsb-en')

describe('WEB Catholic (webc-en)', () => {
  it('publishes every chapter of the accepted candidate byte for byte, once, in its Catholic order', () => {
    expect(numbering.candidateSha256).toBe('ecaee43e09e68d5411091da3110a5280abe09e0cf5d39f10cc247571f37c5bfb')
    expect(webc.chapters).toHaveLength(1328)
    expect(numbering.chapters.map(row => row.native)).toEqual(Array.from({ length: 1328 }, (_, i) => i + 1))
    webc.chapters.forEach((chapter, index) => {
      const row = numbering.chapters[index]
      expect(chapter.number, `${row.bookCode} ${row.biblicalChapter}`).toBe(row.number)
      const sha = createHash('sha256').update(JSON.stringify(chapter.paragraphs).replace(/[\u007f-￿]/g, c => c)).digest('hex')
      expect(sha, `${row.bookCode} ${row.biblicalChapter}`).toBe(row.paragraphsSha256)
    })
    expect(new Set(webc.chapters.map(chapter => chapter.number)).size).toBe(1328)
  })

  it('numbers a shared chapter as every other edition does, and the rest after Revelation 22', () => {
    const byNumber = new Map(webc.chapters.map(chapter => [chapter.number, chapter]))
    for (const chapter of bsb.chapters) expect(byNumber.get(chapter.number)?.title).toBe(chapter.title)
    const at = (code: string, chapter: number) => numbering.chapters.find(row => row.bookCode === code && row.biblicalChapter === chapter)!.number
    expect(at('ESG', 4)).toBe(430)
    expect(at('DAG', 3)).toBe(853)
    expect(at('PSA', 23)).toBe(bsb.chapters.find(chapter => chapter.title === 'Psalm 23' || chapter.title === 'Psalms 23')!.number)
    expect(at('TOB', 1)).toBe(BIBLE_SHARED_CHAPTERS + 1)
    expect(at('DAG', 13)).toBe(1327)
    expect(at('DAG', 14)).toBe(1328)
    // The contents follow the Catholic order and keep the source's book names.
    const books = (webc.sections as Edition['sections']).flatMap(section => (section.sections ?? []) as Edition['sections']).flatMap(group => (group.sections ?? []) as Edition['sections'])
    const names = books.map(book => book.title)
    expect(names.slice(names.indexOf('Nehemiah'), names.indexOf('Nehemiah') + 4)).toEqual(['Nehemiah', 'Tobit', 'Judith', 'Esther (Greek)'])
    expect(books.find(book => book.title === 'Tobit')!.chapters![0]).toBe(1190)
  })

  it('steps through chapters in reading order, not by number', () => {
    const chapters = webc.chapters.map(({ number, title }) => ({ number, title }))
    expect(nextLabChapter(chapters, 426)).toBe(1190) // Nehemiah 13 → Tobit 1
    expect(prevLabChapter(chapters, 1190)).toBe(426)
    expect(prevLabChapter(chapters, 427)).toBe(at('JDT', 16)) // Esther (Greek) 1 ← Judith 16
    expect(nextLabChapter(chapters, 436)).toBe(at('1MA', 1)) // Esther (Greek) 10 → 1 Maccabees 1
    expect(nextLabChapter(chapters, 862)).toBe(1327) // Daniel 12 → Susanna
    expect(nextLabChapter(chapters, 1328)).toBe(bsb.chapters.find(chapter => chapter.title === 'Hosea 1')!.number) // Bel and the Dragon → Hosea 1
    expect(nextLabChapter(chapters, 1189)).toBeNull()
    // The 66-book editions are numbered in order: unchanged.
    const plain = bsb.chapters.map(({ number, title }) => ({ number, title }))
    expect(nextLabChapter(plain, 426)).toBe(427)
    expect(prevLabChapter(plain, 1)).toBeNull()
  })

  it('knows which versions have a chapter and where verse numbers differ', () => {
    expect(bibleEditionHasChapter('bsb-en', 1189)).toBe(true)
    expect(bibleEditionHasChapter('bsb-en', 1190)).toBe(false)
    expect(bibleEditionHasChapter('webc-en', 1328)).toBe(true)
    expect(bibleEditionHasChapter('webc-en', 1329)).toBe(false)
    expect(bibleVerseNumbersCorrespond('webc-en', 'bsb-en', 853)).toBe(false)
    expect(bibleVerseNumbersCorrespond('kjv-en', 'bsb-en', 853)).toBe(true)
    expect(bibleVerseNumbersCorrespond('webc-en', 'web-en', 430)).toBe(true)
    expect(bibleHighlightsCarryAcross('webc-en', 'bsb-en', 430)).toBe(false)
    expect(bibleHighlightsCarryAcross('bsb-en', 'webc-en', 853)).toBe(false)
    expect(bibleHighlightsCarryAcross('webc-en', 'bsb-en', 854)).toBe(true)
    expect(bibleHighlightsCarryAcross('kjv-en', 'bsb-en', 430)).toBe(true)
  })

  it('resumes a Tobit place in the version it was read in', () => {
    const tobit: LabBookPlace = {
      bookId: 'tobit', headerBook: 'Tobit', chapterNumber: 3, sequentialChapter: 1192, paragraphIndex: 2, wordIndex: 0,
      primaryEditionKey: 'webc-en', updatedAt: 1, deviceId: 'phone', rev: 1,
    }
    const prefs = { ...DEFAULT_LAB_PREFS, primaryEdition: 'bsb-en', compareEdition: 'kjv-en', compareOpen: false }
    expect(remoteResumeSelection(tobit, { libraryBookId: 'bible', prefs })).toMatchObject({ bookId: 'bible', primaryEditionKey: 'webc-en' })
    // A shared chapter keeps the reader's current version.
    const psalm = { ...tobit, bookId: 'psalms', headerBook: 'Psalms', chapterNumber: 23, sequentialChapter: 501 }
    expect(remoteResumeSelection(psalm, { libraryBookId: 'bible', prefs })).toMatchObject({ primaryEditionKey: 'bsb-en' })
  })
})

function at(code: string, chapter: number): number {
  return numbering.chapters.find(row => row.bookCode === code && row.biblicalChapter === chapter)!.number
}
