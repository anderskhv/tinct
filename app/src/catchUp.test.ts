import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Section } from './types'
import {
  CATCH_UP_PROMPT_VERSION,
  CATCH_UP_UNIT_ID_PATTERN,
  CATCH_UP_GROUP_FAR_PAGES,
  CATCH_UP_GROUP_NEAR_PAGES,
  CATCH_UP_WORDS_PER_PAGE,
  catchUpBeforePlace,
  catchUpCacheKey,
  catchUpCrossesParts,
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

  it('a plain book without parts: chapter groups of about 3–25 pages near the place, up to 50 further back; then chapters 59 and 60 each; never chapter 61', () => {
    const sized = plain.map(chapter => ({ ...chapter, wordCount: 3_000 }))
    const units = catchUpUnits({ title: 'Plain', chapters: sized, bible: false })
    const plan = catchUpPlan({ bookId: 'plain', editionKey: 'original-en', units, chapters: sized, chapterNumber: 61, paragraphIndex: 4, completed: false })
    expect(plan.every(entry => entry.kind === 'unit')).toBe(true)
    // Every earlier chapter exactly once, in order.
    expect(requestedChapters(plan)).toEqual(Array.from({ length: 60 }, (_, i) => i + 1))
    expect(plan.slice(-2).map(entry => [entry.title, entry.kind === 'unit' && entry.request.unitId])).toEqual([['Chapter 59', 'ch-59'], ['Chapter 60', 'ch-60']])
    const pages = (entry: (typeof plan)[number]) => entry.kind === 'unit' ? entry.chapters.length * 3_000 / CATCH_UP_WORDS_PER_PAGE : 0
    const groups = plan.slice(0, -2)
    // Never one block for everything: groups of at most 50 pages, the ones nearest the place at most 25.
    expect(groups.length).toBeGreaterThan(3)
    for (const entry of groups) expect(pages(entry)).toBeLessThanOrEqual(CATCH_UP_GROUP_FAR_PAGES)
    expect(pages(groups[groups.length - 1])).toBeLessThanOrEqual(CATCH_UP_GROUP_NEAR_PAGES)
    expect(pages(groups[0])).toBeGreaterThan(CATCH_UP_GROUP_NEAR_PAGES)
    expect(groups.map(entry => entry.key)).toEqual(['chs-1-5', 'chs-6-10', 'chs-11-15', 'chs-16-20', 'chs-21-25', 'chs-26-30', 'chs-31-35', 'chs-36-40', 'chs-41-45', 'chs-46-48', 'chs-49-50', 'chs-51-52', 'chs-53-54', 'chs-55-56', 'chs-57-58'])
    expect(groups[0]).toMatchObject({ title: 'Chapter 1 – Chapter 5', request: { bookId: 'plain', editionKey: 'original-en', unitId: 'chs-1-5', placeChapter: 61 } })
    expect(requestedChapters(plan)).not.toContain(61)
    expect(plan.every(entry => !('throughChapter' in entry.request))).toBe(true)
  })

  it('early in a book: no group until there are more than two earlier chapters, and nothing at all in chapter 1', () => {
    const units = catchUpUnits({ title: 'Plain', chapters: plain, bible: false })
    const at = (chapterNumber: number) => catchUpPlan({ bookId: 'p', editionKey: 'e', units, chapters: plain, chapterNumber, paragraphIndex: 9, completed: true })
    expect(at(1)).toEqual([])
    expect(at(2).map(entry => entry.key)).toEqual(['ch-1'])
    expect(at(3).map(entry => entry.key)).toEqual(['ch-1', 'ch-2'])
    // A group of one chapter is that chapter's own entry.
    expect(at(4).map(entry => entry.key)).toEqual(['ch-1', 'ch-2', 'ch-3'])
    expect(at(5).map(entry => entry.key)).toEqual(['chs-1-2', 'ch-3', 'ch-4'])
    // Finished the current chapter or not: it is still never recapped.
    expect(requestedChapters(at(5))).not.toContain(5)
  })

  it('To the Lighthouse in Part III, chapter 6: The Window, Time Passes and The Lighthouse 1–5 each have their own entries; nothing at or past the reader\'s place', () => {
    const units = catchUpUnits({ title: 'To the Lighthouse', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false })
    const at = lighthouse.chapters.find(chapter => chapter.title === 'The Lighthouse · 6')!.number
    const plan = catchUpPlan({ bookId: 'to-the-lighthouse', editionKey: 'modern-en', units, chapters: lighthouse.chapters, chapterNumber: at, paragraphIndex: 0, completed: true })
    const part = (n: number) => units.find(unit => unit.chapters.includes(n))!.title
    // Every chapter before the place exactly once, in order; nothing from chapter 6 of Part III on.
    expect(requestedChapters(plan)).toEqual(lighthouse.chapters.filter(chapter => chapter.number < at).map(chapter => chapter.number))
    // No entry crosses a part, and every part has at least one entry.
    for (const entry of plan) if (entry.kind === 'unit') expect(new Set(entry.chapters.map(part)).size).toBe(1)
    expect([...new Set(plan.map(entry => entry.kind === 'unit' ? part(entry.chapters[0]) : ''))]).toEqual(['Part I — The Window', 'Part II — Time Passes', 'Part III — The Lighthouse'])
    // The labels match the parts: an entry's header names its own part.
    for (const entry of plan) {
      if (entry.kind !== 'unit') continue
      const name = part(entry.chapters[0]).replace(/^Part [IVX]+ — /, '')
      expect(entry.title).toContain(name)
    }
    const titles = plan.map(entry => entry.title)
    expect(titles).toContain('Part II — Time Passes')
    expect(titles.slice(-2)).toEqual(['The Lighthouse · 4', 'The Lighthouse · 5'])
    expect(titles.some(title => /The Lighthouse · ([6-9]|1\d)/.test(title))).toBe(false)
    // Part I (19 chapters) is several groups, never one; the earlier groups are larger than the recent ones.
    expect(plan.filter(entry => entry.kind === 'unit' && part(entry.chapters[0]) === 'Part I — The Window').length).toBeGreaterThan(1)
    // The Worker resolves every id to exactly those chapters, inside one part.
    for (const entry of plan) {
      if (entry.kind !== 'unit') continue
      const unit = catchUpFindUnit(units, lighthouse.chapters, entry.request.unitId)!
      expect(unit.chapters).toEqual(entry.chapters)
      expect(catchUpCrossesParts(units, unit.chapters)).toBe(false)
      expect(entry.request.placeChapter).toBe(at)
    }
  })

  it('a one-paragraph chapter never vanishes: it joins its neighbour in the same part (To the Lighthouse, Part III 6 and 7)', () => {
    const units = catchUpUnits({ title: 'To the Lighthouse', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false })
    const at = lighthouse.chapters.find(chapter => chapter.title === 'The Lighthouse · 8')!.number
    const plan = catchUpPlan({ bookId: 'to-the-lighthouse', editionKey: 'modern-en', units, chapters: lighthouse.chapters, chapterNumber: at, paragraphIndex: 0, completed: false })
    expect(plan.at(-1)).toMatchObject({ title: 'The Lighthouse · 6 – The Lighthouse · 7', chapters: [at - 2, at - 1] })
    expect(requestedChapters(plan)).toEqual(lighthouse.chapters.filter(chapter => chapter.number < at).map(chapter => chapter.number))
  })

  it('War and Peace in Book Two: Book One is its own entry or entries, never merged into Book Two; the last two chapters each', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    const bookTwo = units[1]
    const current = bookTwo.chapters[4]
    const plan = catchUpPlan({ bookId: 'war-and-peace', editionKey: 'modern-en', units, chapters: warAndPeace.chapters, chapterNumber: current, paragraphIndex: 7, completed: false })
    expect(plan.slice(-2).map(entry => entry.title)).toEqual(['Book Two (1805) — Chapter 3', 'Book Two (1805) — Chapter 4'])
    for (const entry of plan) if (entry.kind === 'unit') expect(catchUpCrossesParts(units, entry.chapters)).toBe(false)
    const bookOne = plan.filter(entry => entry.kind === 'unit' && units[0].chapters.includes(entry.chapters[0]))
    expect(bookOne.length).toBeGreaterThan(0)
    expect(bookOne.flatMap(entry => entry.kind === 'unit' ? entry.chapters : [])).toEqual(units[0].chapters)
    expect(bookOne.every(entry => entry.title.includes('Book One (1805)'))).toBe(true)
    // Book Two's chapters before the last two: in entries of their own, after Book One's.
    const bookTwoEntries = plan.filter(entry => entry.kind === 'unit' && bookTwo.chapters.includes(entry.chapters[0]))
    expect(bookTwoEntries.flatMap(entry => entry.kind === 'unit' ? entry.chapters : [])).toEqual(bookTwo.chapters.slice(0, 4))
    expect(plan.indexOf(bookTwoEntries[0])).toBe(bookOne.length)
  })

  it('a part whose chapter titles do not name it: the header does', () => {
    const chapters = Array.from({ length: 12 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}`, wordCount: 3_000 }))
    const sections = [{ title: 'Part One', chapters: [1, 2, 3, 4, 5, 6] }, { title: 'Part Two', chapters: [7, 8, 9, 10, 11, 12] }] as Section[]
    const units = catchUpUnits({ title: 'x', chapters, sections, bible: false })
    const plan = catchUpPlan({ bookId: 'x', editionKey: 'e', units, chapters, chapterNumber: 11, paragraphIndex: 0, completed: false })
    // Part One is far (50-page groups), Part Two near (25-page groups); the last two chapters each.
    expect(plan.map(entry => entry.title)).toEqual(['Part One: Chapter 1 – Chapter 5', 'Part One: Chapter 6', 'Part Two: Chapter 7 – Chapter 8', 'Part Two: Chapter 9', 'Part Two: Chapter 10'])
    // A whole part in one group asks for the part by its id.
    const whole = catchUpPlan({ bookId: 'x', editionKey: 'e', units, chapters: chapters.map(chapter => ({ ...chapter, wordCount: 600 })), chapterNumber: 11, paragraphIndex: 0, completed: false })
    expect(whole[0]).toMatchObject({ key: 'part-part-one', title: 'Part One', chapters: [1, 2, 3, 4, 5, 6], request: { unitId: 'part-part-one' } })
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

  it('at every place in a book with parts (and one without): each earlier chapter exactly once, nothing at or past the place, no entry across a part', () => {
    const books = [
      { chapters: lighthouse.chapters, sections: lighthouse.sections },
      { chapters: warAndPeace.chapters, sections: undefined },
      { chapters: plain, sections: undefined },
    ]
    for (const { chapters, sections } of books) {
      const units = catchUpUnits({ title: 'x', chapters, sections, bible: false })
      for (const chapter of chapters) {
        const plan = catchUpPlan({ bookId: 'b', editionKey: 'e', units, chapters, chapterNumber: chapter.number, paragraphIndex: 0, completed: false })
        expect(requestedChapters(plan)).toEqual(chapters.filter(item => item.number < chapter.number).map(item => item.number))
        for (const entry of plan) {
          expect(catchUpBeforePlace(entry, chapter.number)).toBe(true)
          if (entry.kind === 'unit') expect(catchUpCrossesParts(units, entry.chapters)).toBe(false)
        }
      }
    }
  })

  it('catchUpBeforePlace and catchUpCrossesParts', () => {
    const units = catchUpUnits({ title: 'L', chapters: lighthouse.chapters, sections: lighthouse.sections, bible: false })
    const entry = (chapters: number[]) => ({ key: 'k', kind: 'unit' as const, title: 't', chapters, request: { bookId: 'b', editionKey: 'e', unitId: 'k' } })
    expect(catchUpBeforePlace(entry([30, 34]), 35)).toBe(true)
    expect(catchUpBeforePlace(entry([34, 35]), 35)).toBe(false)
    expect(catchUpBeforePlace(entry([36]), 35)).toBe(false)
    expect(catchUpBeforePlace(entry([]), 35)).toBe(false)
    expect(catchUpCrossesParts(units, [18, 19])).toBe(false)
    expect(catchUpCrossesParts(units, [19, 20])).toBe(true)
    expect(catchUpCrossesParts(units, [29, 30, 31])).toBe(true)
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
