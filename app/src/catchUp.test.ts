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

  it('a plain book: chapters 1–58 as one compact block, then chapters 59 and 60 each; never chapter 61 (the current one)', () => {
    const units = catchUpUnits({ title: 'Plain', chapters: plain, bible: false })
    const plan = catchUpPlan({ bookId: 'plain', editionKey: 'original-en', units, chapters: plain, chapterNumber: 61, paragraphIndex: 4, completed: false })
    expect(plan).toHaveLength(3)
    expect(plan.every(entry => entry.kind === 'unit')).toBe(true)
    expect(plan[0]).toMatchObject({ key: 'chs-1-58', title: 'Chapter 1 – Chapter 58', chapters: Array.from({ length: 58 }, (_, i) => i + 1), request: { bookId: 'plain', editionKey: 'original-en', unitId: 'chs-1-58' } })
    expect(plan.slice(1).map(entry => [entry.title, entry.kind === 'unit' && entry.request.unitId])).toEqual([['Chapter 59', 'ch-59'], ['Chapter 60', 'ch-60']])
    expect(plan.some(entry => entry.kind === 'unit' && entry.folded)).toBe(false)
    expect(requestedChapters(plan)).not.toContain(61)
    expect(plan.every(entry => !('throughChapter' in entry.request))).toBe(true)
  })

  it('early in a book: no block until there are more than two earlier chapters, and nothing at all in chapter 1', () => {
    const units = catchUpUnits({ title: 'Plain', chapters: plain, bible: false })
    const at = (chapterNumber: number) => catchUpPlan({ bookId: 'p', editionKey: 'e', units, chapters: plain, chapterNumber, paragraphIndex: 9, completed: true })
    expect(at(1)).toEqual([])
    expect(at(2).map(entry => entry.key)).toEqual(['ch-1'])
    expect(at(3).map(entry => entry.key)).toEqual(['ch-1', 'ch-2'])
    // A "block" of one chapter is that chapter's own entry.
    expect(at(4).map(entry => entry.key)).toEqual(['ch-1', 'ch-2', 'ch-3'])
    expect(at(5).map(entry => entry.key)).toEqual(['chs-1-2', 'ch-3', 'ch-4'])
    // Finished the current chapter or not: it is still never recapped.
    expect(requestedChapters(at(5))).not.toContain(5)
  })

  it('fewer requests than before: at most three entries, however far in', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    for (const index of [1, 2, 3, 10, 120, warAndPeace.chapters.length - 1]) {
      const plan = catchUpPlan({ bookId: 'war-and-peace', editionKey: 'modern-en', units, chapters: warAndPeace.chapters, chapterNumber: warAndPeace.chapters[index].number, paragraphIndex: 0, completed: false })
      expect(plan.length).toBe(Math.min(3, index))
    }
  })

  it('War and Peace in Book Two: everything before the last two chapters is one block, across the part boundary', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    const bookTwo = units[1]
    const current = bookTwo.chapters[4]
    const at = warAndPeace.chapters.findIndex(chapter => chapter.number === current)
    const plan = catchUpPlan({ bookId: 'war-and-peace', editionKey: 'modern-en', units, chapters: warAndPeace.chapters, chapterNumber: current, paragraphIndex: 7, completed: false })
    const first = warAndPeace.chapters[0], last = warAndPeace.chapters[at - 3]
    expect(plan[0]).toMatchObject({ key: `chs-${first.number}-${last.number}`, title: `${first.title} – ${last.title}` })
    expect(plan.slice(1).map(entry => entry.title)).toEqual(['Book Two (1805) — Chapter 3', 'Book Two (1805) — Chapter 4'])
    // The Worker resolves the block id to exactly those chapters.
    const unit = catchUpFindUnit(units, warAndPeace.chapters, plan[0].kind === 'unit' ? plan[0].request.unitId : '')!
    expect(unit).toMatchObject({ kind: 'range', chapters: warAndPeace.chapters.slice(0, at - 2).map(chapter => chapter.number) })
    expect(unit.id).toMatch(CATCH_UP_UNIT_ID_PATTERN)
  })

  it('Bible at Nehemiah 12: Nehemiah 1–9 as a block, then 10 and 11; never Nehemiah 12 or an earlier biblical book', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const at = bible.chapters.find(chapter => chapter.title === 'Nehemiah 12')!.number
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: at, paragraphIndex: 2, completed: false, separateWorks: true })
    expect(plan.map(entry => entry.title)).toEqual(['Nehemiah 1 – Nehemiah 9', 'Nehemiah 10', 'Nehemiah 11'])
    expect(plan[0]).toMatchObject({ request: { unitId: `chs-${at - 11}-${at - 3}` } })
    const nehemiah = units.find(unit => unit.title === 'Nehemiah')!
    expect(requestedChapters(plan).every(n => nehemiah.chapters.includes(n) && n < at)).toBe(true)
  })

  it('the first chapter of a work in a collection: nothing (earlier works are other books)', () => {
    const bibleUnits = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    expect(catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units: bibleUnits, chapters: bible.chapters, chapterNumber: 314, paragraphIndex: 40, completed: false, separateWorks: true })).toEqual([])
    const units = catchUpUnits({ title: 'The Adventures of Sherlock Holmes', chapters: sherlock.chapters, sections: sherlock.sections, bible: false })
    expect(catchUpPlan({ bookId: 'adventures-of-sherlock-holmes', editionKey: 'original-en', units, chapters: sherlock.chapters, chapterNumber: 5, paragraphIndex: 9, completed: false, separateWorks: true })).toEqual([])
  })

  it('spoiler rule: nothing at or past the reader\'s chapter is ever requested, and the current chapter never is', () => {
    const cases = [
      { chapters: bible.chapters, units: catchUpUnits({ title: 'B', chapters: bible.chapters, sections: bible.sections, bible: true }), at: 325 },
      { chapters: warAndPeace.chapters, units: catchUpUnits({ title: 'W', chapters: warAndPeace.chapters, bible: false }), at: 40 },
      { chapters: lighthouse.chapters, units: catchUpUnits({ title: 'L', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false }), at: 20 },
      { chapters: plain, units: catchUpUnits({ title: 'P', chapters: plain, bible: false }), at: 12 },
    ]
    for (const { chapters, units, at } of cases) {
      const order = new Map(chapters.map((chapter, index) => [chapter.number, index]))
      for (const separateWorks of [false, true]) for (const completed of [false, true]) {
        const plan = catchUpPlan({ bookId: 'b', editionKey: 'e', units, chapters, chapterNumber: at, paragraphIndex: 3, completed, separateWorks })
        // (A plain book read as separate works: each chapter is its own work, so nothing.)
        if (!separateWorks) expect(plan.length).toBeGreaterThan(0)
        expect(plan.every(entry => entry.kind === 'unit')).toBe(true)
        expect(requestedChapters(plan).every(n => order.get(n)! < order.get(at)!)).toBe(true)
        for (const entry of plan) {
          if (entry.kind !== 'unit') continue
          // What the Worker would cover for this id: still strictly before the reader's chapter.
          const unit = catchUpFindUnit(units, chapters, entry.request.unitId)!
          expect(unit.chapters).toEqual(entry.chapters)
          expect(unit.chapters.every(n => order.get(n)! < order.get(at)!)).toBe(true)
        }
        // The two chapters just before the current one, each on its own, last.
        if (plan.length >= 2) expect(plan.slice(-2).map(entry => entry.kind === 'unit' && entry.chapters)).toEqual([[chapters[order.get(at)! - 2].number], [chapters[order.get(at)! - 1].number]])
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
