import { describe, expect, it } from 'vitest'
import { bookScrollMounted, bookScrollSwitch, bookScrollUnit, chapterAtReadingLine, chapterDivision, chapterWordEstimate } from './bookScroll'

const memory = () => {
  const data = new Map<string, string>()
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } }
}
const chapters = (titles: string[], from = 1) => titles.map((title, index) => ({ number: from + index, title }))

describe('the book scroll switch', () => {
  it('is off unless asked for, on for the session once asked, and off again on ?bookScroll=0', () => {
    const storage = memory()
    expect(bookScrollSwitch('', storage)).toBe(false)
    expect(bookScrollSwitch('?book=odyssey', storage)).toBe(false)
    expect(bookScrollSwitch('?book=odyssey&bookScroll=1', storage)).toBe(true)
    expect(bookScrollSwitch('?book=odyssey', storage)).toBe(true)
    expect(bookScrollSwitch('?bookScroll=0', storage)).toBe(false)
    expect(bookScrollSwitch('', storage)).toBe(false)
  })
  it('works for the one page without session storage, and never throws', () => {
    expect(bookScrollSwitch('?bookScroll=1', null)).toBe(true)
    expect(bookScrollSwitch('', null)).toBe(false)
    const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => { throw new Error('blocked') } }
    expect(bookScrollSwitch('?bookScroll=1', broken)).toBe(true)
    expect(bookScrollSwitch('', broken)).toBe(false)
  })
})

describe('the scroll unit', () => {
  const bible = chapters(['Mark 15', 'Mark 16', 'Luke 1', 'Luke 2', 'Luke 3', 'John 1', '1 John 1', '1 John 2'], 1000)
  it('is one biblical book for the Bible', () => {
    const unit = bookScrollUnit('bible', bible, 1003)
    expect(unit.label).toBe('Luke')
    expect(unit.chapters.map(chapter => chapter.number)).toEqual([1002, 1003, 1004])
    expect(bookScrollUnit('bible', bible, 1002).key).toBe(unit.key)
    expect(bookScrollUnit('bible', bible, 1004).key).toBe(unit.key)
  })
  it('keeps John and 1 John apart, and Mark out of Luke', () => {
    expect(bookScrollUnit('bible', bible, 1005).chapters.map(chapter => chapter.number)).toEqual([1005])
    expect(bookScrollUnit('bible', bible, 1006).chapters.map(chapter => chapter.number)).toEqual([1006, 1007])
    expect(bookScrollUnit('bible', bible, 1001).chapters.map(chapter => chapter.number)).toEqual([1000, 1001])
  })
  const warAndPeace = chapters([
    'Book One (1805) — Chapter 1', 'Book One (1805) — Chapter 2', 'Book One (1805) — Chapter 3',
    'Book Two (1805) — Chapter 1', 'Book Two (1805) — Chapter 2', 'Book Two (1805) — Chapter 3',
    'First Epilogue — Chapter 1', 'First Epilogue — Chapter 2',
  ])
  it('is one Book for War and Peace, whose chapter titles carry the Book', () => {
    const unit = bookScrollUnit('war-and-peace', warAndPeace, 5)
    expect(unit.label).toBe('Book Two (1805)')
    expect(unit.chapters.map(chapter => chapter.number)).toEqual([4, 5, 6])
    expect(bookScrollUnit('war-and-peace', warAndPeace, 8).chapters.map(chapter => chapter.number)).toEqual([7, 8])
    expect(bookScrollUnit('war-and-peace', warAndPeace, 1).key).not.toBe(unit.key)
  })
  it('is the whole book for an undivided book', () => {
    const anna = chapters(Array.from({ length: 12 }, (_, index) => `Chapter ${index + 1}`))
    const unit = bookScrollUnit('anna-karenina', anna, 7)
    expect(unit.label).toBe('')
    expect(unit.chapters).toHaveLength(12)
    expect(bookScrollUnit('anna-karenina', anna, 1).key).toBe(unit.key)
  })
  it('does not take "Chapter 1 — The Letter" titles (one head per chapter) for a division', () => {
    const titled = chapters(['Chapter 1 — The Letter', 'Chapter 2 — The Drawer', 'Chapter 3 — The String', 'Chapter 4 — The Door'])
    expect(bookScrollUnit('a-book', titled, 2).chapters).toHaveLength(4)
  })
  it('groups front matter without a division on its own, between the divisions', () => {
    const mixed = chapters(['Preface', 'Part One — Chapter 1', 'Part One — Chapter 2', 'Part One — Chapter 3', 'Part Two — Chapter 1', 'Part Two — Chapter 2', 'Part Two — Chapter 3'])
    expect(bookScrollUnit('a-book', mixed, 1).chapters.map(chapter => chapter.number)).toEqual([1])
    expect(bookScrollUnit('a-book', mixed, 3).chapters.map(chapter => chapter.number)).toEqual([2, 3, 4])
  })
  it('makes a chapter the list does not hold its own unit', () => {
    expect(bookScrollUnit('a-book', chapters(['One', 'Two']), 9).chapters).toEqual([])
  })
  it('reads the division from the title', () => {
    expect(chapterDivision('Book Two (1805) — Chapter 3')).toBe('Book Two (1805)')
    expect(chapterDivision('Chapter 3')).toBeNull()
    expect(chapterDivision(' — Chapter 3')).toBeNull()
  })
})

describe('the chapter at the reading line', () => {
  const blocks = [{ chapterNumber: 3, top: 0 }, { chapterNumber: 4, top: 1000 }, { chapterNumber: 5, top: 2500 }]
  it('is the chapter whose first line has reached the line', () => {
    expect(chapterAtReadingLine(blocks, 0)).toBe(3)
    expect(chapterAtReadingLine(blocks, 999.9)).toBe(3)
    expect(chapterAtReadingLine(blocks, 1000)).toBe(4)
    expect(chapterAtReadingLine(blocks, 2499)).toBe(4)
    expect(chapterAtReadingLine(blocks, 2500)).toBe(5)
    expect(chapterAtReadingLine(blocks, 1e9)).toBe(5)
  })
  it('is the first chapter above the unit, and nothing without chapters', () => {
    expect(chapterAtReadingLine(blocks, -50)).toBe(3)
    expect(chapterAtReadingLine([], 10)).toBeNull()
  })
  it('never goes backwards as the line moves down (monotonic)', () => {
    let previous = 0
    for (let line = -100; line < 4000; line += 37) {
      const index = blocks.findIndex(block => block.chapterNumber === chapterAtReadingLine(blocks, line))
      expect(index).toBeGreaterThanOrEqual(previous)
      previous = index
    }
  })
})

describe('the mounted chapters', () => {
  const order = Array.from({ length: 20 }, (_, index) => index + 1)
  it('are the viewport chapters and one either side', () => {
    expect(bookScrollMounted(order, 9, 9, [], 10)).toEqual([9, 10, 11])
    expect(bookScrollMounted(order, 0, 0, [], 1)).toEqual([1, 2])
    expect(bookScrollMounted(order, 19, 19, [], 20)).toEqual([19, 20])
  })
  it('keep a chapter already mounted until it is more than two away, so a boundary does not thrash', () => {
    expect(bookScrollMounted(order, 10, 10, [9, 10, 11], 10)).toEqual([9, 10, 11, 12])
    expect(bookScrollMounted(order, 12, 12, [9, 10, 11, 12], 10)).toEqual([10, 11, 12, 13, 14])
    expect(bookScrollMounted(order, 14, 14, [10, 11, 12, 13, 14], 15)).toEqual([13, 14, 15, 16])
  })
  it('never release the reader’s own chapter', () => {
    expect(bookScrollMounted(order, 17, 17, [3], 3)).toEqual([3, 17, 18, 19])
  })
  it('stay bounded however far the reader scrolls', () => {
    let mounted: number[] = []
    for (let index = 0; index < order.length; index++) {
      mounted = bookScrollMounted(order, index, index, mounted, order[index])
      expect(mounted.length).toBeLessThanOrEqual(5)
    }
  })
})

describe('a placeholder’s words', () => {
  it('are the chapter’s word count, else its paragraphs at the measured rate', () => {
    expect(chapterWordEstimate({ wordCount: 1234, paragraphCount: 9 })).toBe(1234)
    expect(chapterWordEstimate({ paragraphCount: 10 }, 42)).toBe(420)
    expect(chapterWordEstimate({})).toBe(80)
  })
})
