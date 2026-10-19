/**
 * Reading units sized for Primer, Catch me up, Recap and Quiz me (TinctMargin.sizeUnits; Anders, 19 Oct 2026: "rarely
 * will you want a recap of a paragraph nor of a full book"): about 3–25 pages a unit, from the document's headings at
 * the level that gives that; pages bands when it has none.
 */
// @vitest-environment jsdom
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Entry = { title: string; page: number | null; kind?: string; items?: Entry[] }
type Unit = { key: string; title: string; from: number; start: number; to: number; matter?: string; chapter?: string; label?: string; parts?: string[]; pages?: boolean }
let M: { sizeUnits(entries: Entry[], count: number): Unit[]; UNIT_SIZE: { min: number; split: number; band: number } }
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  M = (globalThis as unknown as { TinctMargin: typeof M }).TinctMargin
})
const span = (u: Unit) => u.to - u.from + 1
// Every page in exactly one unit, in order; every key one the Worker's storage accepts.
function covers(units: Unit[], n: number) {
  expect(units[0].from).toBe(1)
  expect(units.at(-1)!.to).toBe(n)
  units.forEach((u, i) => {
    expect(u.to).toBeGreaterThanOrEqual(u.from)
    expect(u.start).toBeGreaterThanOrEqual(u.from)
    expect(u.start).toBeLessThanOrEqual(u.to)
    if (i) expect(u.from).toBe(units[i - 1].to + 1)
    expect(u.key).toMatch(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)
  })
  expect(new Set(units.map(u => u.key)).size).toBe(units.length)
}

describe('unit sizing', () => {
  it('a book with chapters: each chapter is a unit, front and back matter apart, the chapters named', () => {
    const book: Entry[] = [
      { title: 'Contents', page: 3 }, { title: 'Preface', page: 5 },
      { title: '1 Introduction', page: 9, items: [{ title: '1.1 Scope', page: 10 }, { title: '1.2 Plan', page: 15 }] },
      { title: '2 Inference', page: 21 }, { title: '3 Coding', page: 39 }, { title: '4 Channels', page: 60 },
      { title: '5 Summary', page: 72 }, { title: 'References', page: 80 }, { title: 'Index', page: 86 },
    ]
    const units = M.sizeUnits(book, 90)
    covers(units, 90)
    expect(units.map(u => [u.key, u.from, u.to])).toEqual([
      ['outline-0', 1, 4], ['outline-1', 5, 8], ['outline-2', 9, 20], ['outline-3', 21, 38], ['outline-4', 39, 59], ['outline-5', 60, 71], ['outline-6', 72, 79], ['outline-7', 80, 85], ['outline-8', 86, 90],
    ])
    // Contents (pages 1–4, the pages before it with it) and the Preface (5–8) are long enough to stand: matter, apart.
    expect(units.filter(u => u.matter).map(u => u.matter)).toEqual(['front', 'front', 'back', 'back'])
    // A chapter's sections (1.1, 1.2) are never units of a 12-page chapter.
    expect(units[2].title).toBe('1 Introduction')
    expect(units.slice(1, 6).every(u => span(u) >= 3 && span(u) <= 25)).toBe(true)
  })
  it('short front matter joins front matter, never a chapter; a chapter is never split under 30 pages', () => {
    const units = M.sizeUnits([{ title: 'Title page', page: 1 }, { title: 'Contents', page: 2 }, { title: 'Preface', page: 3 }, { title: '1 Light', page: 5 }, { title: '2 Heat', page: 33 }, { title: 'Index', page: 60 }], 61)
    covers(units, 61)
    expect(units.map(u => [u.title, u.from, u.to, u.matter || ''])).toEqual([
      ['Title page', 1, 2, 'front'], ['Preface', 3, 4, 'front'], ['1 Light', 5, 32, ''], ['2 Heat', 33, 59, ''], ['Index', 60, 61, 'back'],
    ])
    // The one-page Contents joined the shorter of its neighbours, both matter.
    expect(units[0].parts).toEqual(['Title page', 'Contents'])
  })
  it('a 20-page paper with sections 1, 1.1, 2, 2.1 … (Constructor Theory-like): its numbered sections, short ones joined', () => {
    // A flat outline, as the scan's headings come: nested by the numbers.
    const paper: Entry[] = [
      { title: 'Abstract', page: 1 }, { title: '1 Introduction', page: 1 }, { title: '1.1 Constructors', page: 2 },
      { title: '2 Motivations', page: 4 }, { title: '2.1 Tasks', page: 5 }, { title: '2.2 Substrates', page: 7 },
      { title: '3 Information', page: 10 }, { title: '3.1 Media', page: 12 }, { title: '4 Superinformation', page: 15 },
      { title: '5 Conclusion', page: 18 }, { title: 'References', page: 19 },
    ]
    const units = M.sizeUnits(paper, 20)
    covers(units, 20)
    expect(units.map(u => [u.title, u.from, u.to])).toEqual([
      ['1 Introduction', 1, 3], ['2 Motivations', 4, 9], ['3 Information', 10, 14], ['4 Superinformation', 15, 18], ['References', 19, 20],
    ])
    // The abstract (no page of its own) joined the introduction; the one-page conclusion its shorter neighbour that is
    // not matter (References stays apart); the sections are units, never the subsections.
    expect(units[0].parts).toEqual(['Abstract', '1 Introduction'])
    expect(units[3].parts).toEqual(['4 Superinformation', '5 Conclusion'])
    expect(units[4].matter).toBe('back')
    expect(units.some(u => /^\d+\.\d/.test(u.title))).toBe(false)
  })
  it('no usable headings: bands of about 10 pages, "Pages 11–20"; a short file is one unit', () => {
    const units = M.sizeUnits([], 43)
    covers(units, 43)
    expect(units.map(u => [u.title, u.key])).toEqual([['Pages 1–10', 'pages-1'], ['Pages 11–20', 'pages-11'], ['Pages 21–30', 'pages-21'], ['Pages 31–40', 'pages-31'], ['Pages 41–43', 'pages-41']])
    // A tail of 2 pages or fewer goes with the band before it.
    expect(M.sizeUnits([], 42).map(u => u.title).at(-1)).toBe('Pages 31–42')
    expect(units.every(u => u.pages)).toBe(true)
    expect(M.sizeUnits([{ title: '', page: 2 }, { title: 'Lost', page: null }], 12)).toEqual([{ key: 'all', title: '', from: 1, start: 1, to: 12 }])
    expect(M.sizeUnits([], 25).map(u => [u.from, u.to])).toEqual([[1, 10], [11, 20], [21, 25]])
  })
  it('a huge chapter is split at its sections; one with none is kept whole up to 60 pages, past that in bands of about 10 pages', () => {
    const book: Entry[] = [
      { title: '1 Origins', page: 1 },
      { title: '2 The Long Chapter', page: 11, items: [{ title: '2.1 First', page: 12 }, { title: '2.2 Second', page: 25 }, { title: '2.3 Third', page: 41 }, { title: '2.4 Fourth', page: 41 }, { title: '2.5 Fifth', page: 55 }] },
      { title: '3 Without Sections', page: 71 }, { title: '4 Also Without', page: 135 }, { title: '5 End', page: 170 },
    ]
    const units = M.sizeUnits(book, 180)
    covers(units, 180)
    expect(units.map(u => [u.title, u.from, u.to])).toEqual([
      ['1 Origins', 1, 10],
      ['2.1 First', 11, 24], ['2.2 Second', 25, 40], ['2.4 Fourth', 41, 54], ['2.5 Fifth', 55, 70],
      ['3 Without Sections, pages 71–80', 71, 80], ['3 Without Sections, pages 81–90', 81, 90], ['3 Without Sections, pages 91–100', 91, 100], ['3 Without Sections, pages 101–110', 101, 110], ['3 Without Sections, pages 111–120', 111, 120], ['3 Without Sections, pages 121–130', 121, 130], ['3 Without Sections, pages 131–134', 131, 134],
      ['4 Also Without', 135, 169],
      ['5 End', 170, 180],
    ])
    expect(units[1].start).toBe(12)
    expect(units.every(u => span(u) >= M.UNIT_SIZE.min && span(u) <= M.UNIT_SIZE.split * 2)).toBe(true)
    // Chapter naming as the primer's: a book of 100 pages or more names "Chapter 1: Origins"; a band keeps its chapter.
    expect(units[0].label).toBe('Chapter 1: Origins')
    expect(units[5].label).toBe('Chapter 3: Without Sections, pages 71–80')
    expect((M as unknown as { unitPhrase(u: Unit): string }).unitPhrase(units[5])).toBe('pages 71–80 of chapter 3')
  })
  it('a part of chapters gives its chapters; a 300-page book of one entry is never one unit', () => {
    const units = M.sizeUnits([{ title: 'Part I Foundations', page: 1, items: [{ title: '1 Sets', page: 3 }, { title: '2 Maps', page: 15 }, { title: '3 Groups', page: 30 }] }], 44)
    expect(units.map(u => [u.key, u.from, u.to])).toEqual([['outline-0.0', 1, 14], ['outline-0.1', 15, 29], ['outline-0.2', 30, 44]])
    const one = M.sizeUnits([{ title: 'The Book', page: 1 }], 300)
    covers(one, 300)
    expect(one.length).toBe(30)
    expect(one.every(u => span(u) === 10)).toBe(true)
    // A 31-page chapter with no sections stays one chapter.
    expect(M.sizeUnits([{ title: '1 Introduction', page: 1, kind: 'chapter' }, { title: '2 Bandits', page: 32, kind: 'chapter' }], 50).map(u => [u.label, u.from, u.to])).toEqual([['Chapter 1: Introduction', 1, 31], ['Chapter 2: Bandits', 32, 50]])
  })
})

describe('unit sizing: a conclusion sharing its page with the references', () => {
  it('is named for the conclusion, not the references (Constructor Theory: 4. Conclusion, Acknowledgements, References on p. 39)', () => {
    const units = M.sizeUnits([{ title: '1. Introduction', page: 1 }, { title: '2. Motivations', page: 7 }, { title: '3. Development of the theory', page: 27 }, { title: '4. Conclusion', page: 39 }, { title: 'Acknowledgements', page: 39 }, { title: 'References', page: 39 }], 40)
    expect(units.map(u => [u.title, u.from, u.to, u.matter || ''])).toEqual([
      ['1. Introduction', 1, 6, ''], ['2. Motivations', 7, 26, ''], ['3. Development of the theory', 27, 38, ''], ['4. Conclusion', 39, 40, ''],
    ])
    expect(units[3].parts).toEqual(['4. Conclusion', 'Acknowledgements', 'References'])
  })
})
