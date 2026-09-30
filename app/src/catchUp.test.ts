import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Section } from './types'
import {
  CATCH_UP_PROMPT_VERSION,
  CATCH_UP_UNIT_ID_PATTERN,
  catchUpCacheKey,
  catchUpPlan,
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
  it('Bible, mid-2 Kings: earlier books the reader has read, then 2 Kings so far, then the current chapter to the paragraph', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const read = new Set([1, 2, 3, 300, 313, 314, 320])
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: 325, paragraphIndex: 2, completed: false, readChapters: read })
    expect(plan.map(entry => entry.title)).toEqual(['Genesis', '1 Kings', '2 Kings', '2 Kings 12'])
    expect(plan[0]).toMatchObject({ kind: 'unit', key: 'book-genesis', request: { bookId: 'bible', editionKey: 'kjv-en', unitId: 'book-genesis' } })
    expect(plan[0].request).not.toHaveProperty('throughChapter')
    expect(plan[2]).toMatchObject({ kind: 'unit', key: 'book-2-kings@324', request: { unitId: 'book-2-kings', throughChapter: 324 } })
    expect(plan[2].kind === 'unit' && plan[2].chapters).toEqual(Array.from({ length: 11 }, (_, i) => 314 + i))
    expect(plan[3]).toMatchObject({ kind: 'current', request: { chapterNumber: 325, paragraphIndex: 2, completed: false } })
  })

  it('War and Peace in Book Two: Book One whole, Book Two up to the chapter before, then the chapter so far', () => {
    const units = catchUpUnits({ title: 'War and Peace', chapters: warAndPeace.chapters, bible: false })
    const bookTwo = units[1]
    const current = bookTwo.chapters[4]
    const plan = catchUpPlan({ bookId: 'war-and-peace', editionKey: 'modern-en', units, chapters: warAndPeace.chapters, chapterNumber: current, paragraphIndex: 7, completed: false })
    expect(plan.map(entry => entry.kind)).toEqual(['unit', 'unit', 'current'])
    expect(plan[0]).toMatchObject({ title: 'Book One (1805)', request: { unitId: 'part-book-one-1805' } })
    expect(plan[1]).toMatchObject({ title: 'Book Two (1805)', request: { unitId: bookTwo.id, throughChapter: current - 1 } })
    expect(plan[2]).toMatchObject({ title: 'Book Two (1805) — Chapter 5', request: { chapterNumber: current, paragraphIndex: 7 } })
  })

  it('a plain book: one entry per earlier chapter and the current chapter truncated at the paragraph; no partial unit', () => {
    const units = catchUpUnits({ title: 'Plain', chapters: plain, bible: false })
    const plan = catchUpPlan({ bookId: 'plain', editionKey: 'original-en', units, chapters: plain, chapterNumber: 61, paragraphIndex: 4, completed: false })
    expect(plan).toHaveLength(61)
    expect(plan.slice(0, 60).every(entry => entry.kind === 'unit' && !('throughChapter' in entry.request))).toBe(true)
    expect(plan.at(-1)).toMatchObject({ kind: 'current', title: 'Chapter 61', request: { chapterNumber: 61, paragraphIndex: 4 } })
  })

  it('the first chapter of a unit has no partial entry, only the so-far entry', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: 314, paragraphIndex: 0, completed: false, readChapters: new Set() })
    expect(plan.map(entry => entry.title)).toEqual(['2 Kings 1'])
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
      const plan = catchUpPlan({ bookId: 'b', editionKey: 'e', units, chapters, chapterNumber: at, paragraphIndex: 3, completed: false })
      const unitChapters = plan.flatMap(entry => entry.kind === 'unit' ? entry.chapters : [])
      expect(unitChapters.every(n => order.get(n)! < order.get(at)!)).toBe(true)
      for (const entry of plan) {
        if (entry.kind !== 'unit') continue
        const unit = units.find(item => item.id === entry.request.unitId)!
        const through = entry.request.throughChapter ?? unit.chapters.at(-1)!
        expect(order.get(through)!).toBeLessThan(order.get(at)!)
      }
      const current = plan.filter(entry => entry.kind === 'current')
      expect(current).toHaveLength(1)
      expect(current[0].request).toMatchObject({ chapterNumber: at, paragraphIndex: 3, completed: false })
      expect(requestedChapters(plan).filter(n => n === at)).toHaveLength(1)
    }
  })

  it('Bible: an earlier book without a reading record is left out; outside the Bible the order is the book\'s', () => {
    const units = catchUpUnits({ title: 'The Bible', chapters: bible.chapters, sections: bible.sections, bible: true })
    const plan = catchUpPlan({ bookId: 'bible', editionKey: 'kjv-en', units, chapters: bible.chapters, chapterNumber: 1000, paragraphIndex: 0, completed: false, readChapters: new Set([51]) })
    expect(plan.map(entry => entry.title)).toContain('Exodus')
    expect(plan.map(entry => entry.title)).not.toContain('Genesis')
  })

  it('an unknown chapter yields an empty plan', () => {
    expect(catchUpPlan({ bookId: 'p', editionKey: 'e', units: [], chapters: plain, chapterNumber: 999, paragraphIndex: 0, completed: false })).toEqual([])
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
