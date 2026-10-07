import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Section } from './types'
import {
  CATCH_UP_PROMPT_VERSION,
  CATCH_UP_UNIT_ID_PATTERN,
  catchUpCacheKey,
  catchUpFindUnit,
  catchUpPlan,
  catchUpSeparateWorks,
  catchUpStaticKey,
  catchUpUnits,
  chapterTitlePart,
  type CatchUpChapter,
} from './catchUp'

function manifest(id: string): { chapters: CatchUpChapter[]; sections?: Section[] } {
  return JSON.parse(readFileSync(resolve(__dirname, `../public/data/editions-chapters/${id}/manifest.json`), 'utf8'))
}

const bible = manifest('bible-kjv-en')
const warAndPeace = manifest('war-and-peace-modern-en')
const lighthouse = manifest('to-the-lighthouse-modern-en')
const sherlock = manifest('adventures-of-sherlock-holmes-original-en')
const plain: CatchUpChapter[] = Array.from({ length: 64 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}` }))

/** Every chapter an entry asks the model about, across the whole plan. */
function requestedChapters(plan: ReturnType<typeof catchUpPlan>): number[] {
  return plan.flatMap(entry => entry.kind === 'unit' ? entry.chapters : [entry.request.chapterNumber])
}

describe('catchUpUnits', () => {
  it('Bible: one unit per biblical book, from the same grouping as the contents', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    expect(units).toHaveLength(66)
    expect(units[0]).toMatchObject({ kind: 'book', title: 'Genesis', id: 'book-genesis' })
    const kings = units.find(unit => unit.title === '2 Kings')!
    expect(kings).toMatchObject({ id: 'book-2-kings', kind: 'book' })
    expect(kings.chapters[0]).toBe(314)
    expect(kings.chapters.at(-1)).toBe(338)
    for (const unit of units) expect(unit.id).toMatch(CATCH_UP_UNIT_ID_PATTERN)
  })

  it('a book whose sections name parts: one unit per top-level section', () => {
    const units = catchUpUnits({ title: 'To the Lighthouse', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false })
    expect(units.map(unit => unit.title)).toEqual(['Part I — The Window', 'Part II — Time Passes', 'Part III — The Lighthouse'])
    expect(units.every(unit => unit.kind === 'part')).toBe(true)
    expect(units.flatMap(unit => unit.chapters)).toEqual(lighthouse.chapters.map(ch => ch.number))
  })

  it('a book whose chapter titles carry the part (War and Peace): one unit per part, in order', () => {
    expect(warAndPeace.sections).toBeUndefined()
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, sections: warAndPeace.sections, bible: false })
    expect(units[0]).toMatchObject({ kind: 'part', title: 'Book One (1805)', id: 'part-book-one-1805' })
    expect(units[1]).toMatchObject({ kind: 'part', title: 'Book Two (1805)' })
    expect(units.at(-1)).toMatchObject({ title: 'Second Epilogue' })
    expect(units.flatMap(unit => unit.chapters)).toEqual(warAndPeace.chapters.map(ch => ch.number))
    expect(new Set(units.map(unit => unit.id)).size).toBe(units.length)
  })

  it('everything else: one unit per chapter', () => {
    const units = catchUpUnits({ title: 'Plain', chapters: plain, bible: false })
    expect(units).toHaveLength(64)
    expect(units[4]).toEqual({ id: 'ch-5', kind: 'chapter', title: 'Chapter 5', chapters: [5] })
    // A lone "Part 1, Chapter 1" title does not make parts.
    expect(catchUpUnits({ title: 'x', chapters: [{ number: 1, title: 'Part 1, Chapter 1' }, { number: 2, title: 'Epilogue' }], bible: false }).map(u => u.kind)).toEqual(['chapter', 'chapter'])
  })

  it('reads the part out of a chapter title', () => {
    expect(chapterTitlePart('Book One (1805) — Chapter 3')).toBe('Book One (1805)')
    expect(chapterTitlePart('First Epilogue (1813 - 20) — Chapter 1')).toBe('First Epilogue (1813 - 20)')
    expect(chapterTitlePart('Part 1, Chapter 2')).toBe('Part 1')
    expect(chapterTitlePart('Chapter 2')).toBeNull()
    expect(chapterTitlePart('Loomings')).toBeNull()
  })
})

describe('catchUpPlan', () => {
  it('Bible at Nehemiah 12: only Nehemiah 1–11, chapter by chapter, then chapter 12 to the paragraph; no earlier biblical book', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const at = bible.chapters.find(chapter => chapter.title === 'Nehemiah 12')!.number
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: at, paragraphIndex: 2, completed: false, separateWorks: true })
    expect(plan.map(entry => entry.title)).toEqual([...Array.from({ length: 11 }, (_, i) => `Nehemiah ${i + 1}`), 'Nehemiah 12'])
    expect(plan[0]).toMatchObject({ kind: 'unit', key: `ch-${at - 11}`, chapters: [at - 11], request: { bookId: 'bible', editionKey: 'kjv-en', unitId: `ch-${at - 11}` } })
    for (const entry of plan.slice(0, 11)) {
      expect(entry.kind).toBe('unit')
      expect(entry.request).not.toHaveProperty('throughChapter')
      expect(entry.kind === 'unit' && entry.folded).toBeFalsy()
    }
    expect(plan.at(-1)).toMatchObject({ kind: 'current', request: { chapterNumber: at, paragraphIndex: 2, completed: false } })
  })

  it('Bible: the separate-works scope holds whatever the reader read before (Genesis, Ezra are never in a Nehemiah recap)', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: 425, paragraphIndex: 0, completed: false, separateWorks: true })
    const nehemiah = units.find(unit => unit.title === 'Nehemiah')!
    expect(plan.flatMap(entry => entry.kind === 'unit' ? entry.chapters : [entry.request.chapterNumber]).every(n => nehemiah.chapters.includes(n))).toBe(true)
  })

  it('War and Peace in Book Two: Book One folded to one entry, Book Two chapter by chapter, then the chapter so far', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    const bookTwo = units[1]
    const current = bookTwo.chapters[4]
    const plan = catchUpPlan({ bookId: 'war-and-peace', editionKey: 'modern-en', units, chapters: warAndPeace.chapters, chapterNumber: current, paragraphIndex: 7, completed: false })
    expect(plan.map(entry => entry.title)).toEqual(['Book One (1805)', ...[1, 2, 3, 4].map(n => `Book Two (1805) — Chapter ${n}`), 'Book Two (1805) — Chapter 5'])
    expect(plan[0]).toMatchObject({ kind: 'unit', folded: true, request: { unitId: 'part-book-one-1805' } })
    expect(plan[0].request).not.toHaveProperty('throughChapter')
    for (const [i, entry] of plan.slice(1, 5).entries()) {
      expect(entry).toMatchObject({ kind: 'unit', chapters: [bookTwo.chapters[i]], request: { unitId: `ch-${bookTwo.chapters[i]}` } })
      expect(entry.kind === 'unit' && entry.folded).toBeFalsy()
    }
    expect(plan[5]).toMatchObject({ kind: 'current', request: { chapterNumber: current, paragraphIndex: 7 } })
  })

  it('War and Peace late in the book: one folded entry per earlier part, in order', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    const currentPart = units[5]
    const plan = catchUpPlan({ bookId: 'war-and-peace', editionKey: 'modern-en', units, chapters: warAndPeace.chapters, chapterNumber: currentPart.chapters[2], paragraphIndex: 3, completed: false })
    const folded = plan.filter(entry => entry.kind === 'unit' && entry.folded)
    expect(folded.map(entry => entry.title)).toEqual(units.slice(0, 5).map(unit => unit.title))
    expect(plan.filter(entry => entry.kind === 'unit' && !entry.folded).map(entry => entry.chapters)).toEqual([[currentPart.chapters[0]], [currentPart.chapters[1]]])
  })

  it('a book whose sections name parts (To the Lighthouse): earlier parts folded, the current part chapter by chapter', () => {
    const units = catchUpUnits({ title: 'To the Lighthouse', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false })
    const at = units[1].chapters[2]
    const plan = catchUpPlan({ bookId: 'to-the-lighthouse', editionKey: 'modern-en', units, chapters: lighthouse.chapters, chapterNumber: at, paragraphIndex: 1, completed: false })
    expect(plan[0]).toMatchObject({ title: 'Part I — The Window', folded: true })
    expect(plan.slice(1, 3).map(entry => entry.kind === 'unit' && entry.chapters)).toEqual([[units[1].chapters[0]], [units[1].chapters[1]]])
    expect(plan).toHaveLength(4)
  })

  it('a plain book (unchanged): one entry per earlier chapter and the current chapter truncated at the paragraph; nothing folded', () => {
    const units = catchUpUnits({ title: 'Plain', chapters: plain, bible: false })
    const plan = catchUpPlan({ bookId: 'plain', editionKey: 'original-en', units, chapters: plain, chapterNumber: 61, paragraphIndex: 4, completed: false })
    expect(plan).toHaveLength(61)
    expect(plan.slice(0, 60).every(entry => entry.kind === 'unit' && !('throughChapter' in entry.request) && !entry.folded)).toBe(true)
    expect(plan.slice(0, 60).map(entry => entry.kind === 'unit' && entry.request.unitId)).toEqual(Array.from({ length: 60 }, (_, i) => `ch-${i + 1}`))
    expect(plan.at(-1)).toMatchObject({ kind: 'current', title: 'Chapter 61', request: { chapterNumber: 61, paragraphIndex: 4 } })
  })

  it('the first chapter of a work: only the so-far entry, no earlier work', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: 314, paragraphIndex: 0, completed: false, separateWorks: true })
    expect(plan.map(entry => entry.title)).toEqual(['2 Kings 1'])
    // Before any narrative is read there: the timeline is empty, only "You are here".
    const opening = ['THE SECOND BOOK OF THE KINGS', 'COMMONLY CALLED, THE FOURTH BOOK OF THE KINGS.', 'Then Moab rebelled against Israel after the death of Ahab.']
    expect(catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: 314, paragraphIndex: 0, completed: false, separateWorks: true, currentParagraphs: opening })).toEqual([])
  })

  it('a short-story collection: only the current story, never the earlier ones', () => {
    const units = catchUpUnits({ title: 'The Adventures of Sherlock Holmes', chapters: sherlock.chapters, sections: sherlock.sections, bible: false })
    const plan = catchUpPlan({ bookId: 'adventures-of-sherlock-holmes', editionKey: 'original-en', units, chapters: sherlock.chapters, chapterNumber: 5, paragraphIndex: 9, completed: false, separateWorks: true })
    expect(plan.map(entry => entry.title)).toEqual(['The Five Orange Pips'])
    expect(plan[0].kind).toBe('current')
  })

  it('spoiler rule: nothing at or past the reader\'s chapter is requested as a unit, and the current chapter only to the paragraph', () => {
    const cases = [
      { chapters: bible.chapters, units: catchUpUnits({ title: 'B', chapters: bible.chapters, sections: bible.sections, bible: true }), at: 325 },
      { chapters: warAndPeace.chapters, units: catchUpUnits({ title: 'W', chapters: warAndPeace.chapters, bible: false }), at: 40 },
      { chapters: lighthouse.chapters, units: catchUpUnits({ title: 'L', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false }), at: 20 },
      { chapters: plain, units: catchUpUnits({ title: 'P', chapters: plain, bible: false }), at: 12 },
    ]
    for (const { chapters, units, at } of cases) {
      const order = new Map(chapters.map((chapter, index) => [chapter.number, index]))
      for (const separateWorks of [false, true]) {
      const plan = catchUpPlan({ bookId: 'b', editionKey: 'e', units, chapters, chapterNumber: at, paragraphIndex: 3, completed: false, separateWorks })
      const unitChapters = plan.flatMap(entry => entry.kind === 'unit' ? entry.chapters : [])
      expect(unitChapters.every(n => order.get(n)! < order.get(at)!)).toBe(true)
      for (const entry of plan) {
        if (entry.kind !== 'unit') continue
        const unit = catchUpFindUnit(units, chapters, entry.request.unitId)!
        const through = entry.request.throughChapter ?? unit.chapters.at(-1)!
        expect(order.get(through)!).toBeLessThan(order.get(at)!)
      }
      const current = plan.filter(entry => entry.kind === 'current')
      expect(current).toHaveLength(1)
      expect(current[0].request).toMatchObject({ chapterNumber: at, paragraphIndex: 3, completed: false })
      expect(requestedChapters(plan).filter(n => n === at)).toHaveLength(1)
      }
    }
  })

  it('which books are collections of separate works', () => {
    expect(catchUpSeparateWorks({ bookId: 'bible' })).toBe(true)
    expect(catchUpSeparateWorks({ bookId: 'adventures-of-sherlock-holmes', form: 'short-stories' })).toBe(true)
    expect(catchUpSeparateWorks({ bookId: 'war-and-peace', form: 'novel' })).toBe(false)
    expect(catchUpSeparateWorks({ bookId: 'imitation-of-christ', form: 'scripture' })).toBe(false)
    expect(catchUpSeparateWorks({ bookId: 'user-abc', form: null })).toBe(false)
  })

  it('leaves out the "so far" entry until the reader has read narrative in the current chapter (Frankenstein, Letter 4)', () => {
    const letters: CatchUpChapter[] = [1, 2, 3, 4].map(n => ({ number: n, title: `Letter ${n}` }))
    const units = catchUpUnits({ title: 'Frankenstein', chapters: letters, bible: false })
    const sentence = 'So strange an accident has happened to us that I cannot forbear recording it, although it is very probable that you will see me before these papers can come into your possession.'
    const letter4 = ['_To Mrs. Saville, England._', 'August 5th, 17—.', ...Array.from({ length: 37 }, () => sentence)]
    const plan = (paragraphIndex: number, currentParagraphs?: string[]) => catchUpPlan({
      bookId: 'frankenstein', editionKey: 'original-en', bookTitle: 'Frankenstein', units, chapters: letters, chapterNumber: 4, paragraphIndex, completed: false, currentParagraphs,
    })
    // Only the heading lines read: the timeline ends with the earlier letters, then "You are here".
    for (const at of [0, 1, 2, 4]) {
      expect(plan(at, letter4).map(entry => entry.title)).toEqual(['Letter 1', 'Letter 2', 'Letter 3'])
      expect(plan(at, letter4).every(entry => entry.kind === 'unit')).toBe(true)
    }
    expect(plan(5, letter4).at(-1)).toMatchObject({ kind: 'current', title: 'Letter 4', request: { chapterNumber: 4, paragraphIndex: 5, brief: true } })
    // Text not loaded: the entry stays and the Worker decides.
    expect(plan(1).at(-1)).toMatchObject({ kind: 'current', title: 'Letter 4' })
  })

  it('an unknown chapter yields an empty plan', () => {
    expect(catchUpPlan({ bookId: 'p', editionKey: 'e', units: [], chapters: plain, chapterNumber: 999, paragraphIndex: 0, completed: false })).toEqual([])
  })
})

describe('catchUpFindUnit', () => {
  it('finds a unit by id, or one chapter by ch-<number>; anything else is unknown', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    expect(catchUpFindUnit(units, warAndPeace.chapters, 'part-book-one-1805')).toBe(units[0])
    expect(catchUpFindUnit(units, warAndPeace.chapters, 'ch-30')).toEqual({ id: 'ch-30', kind: 'chapter', title: warAndPeace.chapters.find(ch => ch.number === 30)!.title, chapters: [30] })
    expect(catchUpFindUnit(units, warAndPeace.chapters, 'ch-999999')).toBeNull()
    expect(catchUpFindUnit(units, warAndPeace.chapters, 'part-nope')).toBeNull()
  })
})

describe('keys', () => {
  it('cache and static keys name the unit and how far it goes', () => {
    expect(catchUpCacheKey({ bookId: 'bible', editionKey: 'kjv-en', unitId: 'book-genesis' })).toBe(`${CATCH_UP_PROMPT_VERSION}/bible/kjv-en/book-genesis/end`)
    expect(catchUpCacheKey({ bookId: 'bible', editionKey: 'kjv-en', unitId: 'book-2-kings', throughChapter: 324 })).toBe(`${CATCH_UP_PROMPT_VERSION}/bible/kjv-en/book-2-kings/324`)
    expect(catchUpStaticKey({ unitId: 'book-genesis' })).toBe('book-genesis')
    expect(catchUpStaticKey({ unitId: 'book-2-kings', throughChapter: 324 })).toBe('book-2-kings@324')
  })
})
