import { expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { pdfCatchUpPages, pdfCompleteUnitPages, pdfOriginalUnits, pdfPrimerPages, pdfUnitAt, pdfUnitKey, type PdfOriginalUnitRules } from './pdfOriginalUnits'

const require = createRequire(import.meta.url)
require('../../../../public/lab/addbook/js/margin.js')
const margin = (globalThis as typeof globalThis & { TinctMargin: PdfOriginalUnitRules }).TinctMargin

it('uses real PDF outline headings to size units, preserving source page ranges', () => {
  const units = pdfOriginalUnits(margin, 60, [
    { title: 'Introduction', page: 1 }, { title: 'Chapter 1', page: 11 }, { title: 'Chapter 2', page: 31 },
  ])
  expect(units.map(unit => [unit.from, unit.to])).toEqual([[1, 10], [11, 30], [31, 60]])
  expect(pdfUnitAt(units, 14)?.title).toBe('Chapter 1')
  expect(pdfPrimerPages(units[1])).toEqual(Array.from({ length: 20 }, (_, i) => i + 11))
  expect(pdfCatchUpPages(margin, units[1], 14)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1))
  expect(pdfCatchUpPages(margin, units[0], 5)).toEqual([1, 2, 3, 4])
  expect(pdfCompleteUnitPages(units[1])).toEqual(Array.from({ length: 20 }, (_, i) => i + 11))
  expect(pdfCompleteUnitPages(units[2])).toEqual(Array.from({ length: 30 }, (_, i) => i + 31))
})

it('uses verified stored scan headings when outline is absent and page bands otherwise', () => {
  const scan = { nav: 'contents', pages: 70, entries: [
    { id: 'one', label: '1 Opening', page: 1 }, { id: 'two', label: '2 Later', page: 31 },
  ] }
  const units = pdfOriginalUnits(margin, 70, [], scan)
  expect(units.some(unit => unit.title.includes('Later') && unit.from === 31)).toBe(true)
  const unknown = pdfOriginalUnits(margin, 70, [], { ...scan, pages: 69 })
  expect(unknown[0].title).toMatch(/Pages 1–10/)
  expect(unknown[unknown.length - 1]?.to).toBe(70)
})

it('keeps a genuine child bookmark when its parent has no destination', () => {
  const units = pdfOriginalUnits(margin, 30, [{ title: 'Part', page: null, items: [{ title: 'Section', page: 3 }] }])
  expect(units.some(unit => unit.title.includes('Section') && unit.from <= 3 && unit.to >= 3)).toBe(true)
  expect(units.every(unit => !unit.key.startsWith('pages-'))).toBe(true)
})

it('never invents unit actions for invalid pages, future reading, or matter', () => {
  expect(pdfOriginalUnits(margin, 0)).toEqual([])
  const unit = { key: 'chapter-2', title: '2 Second', from: 21, start: 21, to: 40 }
  expect(pdfCatchUpPages(margin, unit, 19)).toEqual([])
  expect(pdfCatchUpPages(margin, { ...unit, matter: 'back' }, 25)).toEqual([])
  expect(pdfPrimerPages({ ...unit, matter: 'front' })).toEqual([])
})

it('gives deep outline units a stable key accepted by the companion chapter parser', () => {
  const deep = `outline-${'1.'.repeat(80)}2`
  expect(pdfUnitKey(deep)).toMatch(/^unit-[0-9a-f]{8}$/)
  expect(pdfUnitKey(deep)).toBe(pdfUnitKey(deep))
  expect(pdfUnitKey(deep)).not.toBe(pdfUnitKey(deep + '3'))
  expect(pdfUnitKey('outline-1.2')).toBe('outline-1.2')
})

it('includes the current chapter so far and all earlier pages without a recent-page cutoff', () => {
  const unit = {key:'chapter-3',title:'Third',from:61,start:61,to:90}
  expect(pdfCatchUpPages(margin,unit,75)).toEqual(Array.from({length:74},(_,i)=>i+1))
})

it('allows an explicit summary of introductory matter without adding automatic chapter-end actions', () => {
 const introduction={key:'intro',title:'Preface and Introduction',from:3,start:3,to:11,matter:'front'}
 expect(pdfCompleteUnitPages(introduction)).toEqual([])
 expect(pdfCompleteUnitPages(introduction,true)).toEqual([3,4,5,6,7,8,9,10,11])
})

it('does not label pages before the first detected chapter as that chapter', () => {
  const units = pdfOriginalUnits(margin, 512, [], { nav: 'headings', pages: 512, entries: [
    { id: 'h0', label: 'CHAPTER II.', page: 36 }, { id: 'h1', label: 'CHAPTER III.', page: 40 },
  ] })
  expect(pdfUnitAt(units, 1)?.title).toBe('Pages 1–35')
  expect(pdfUnitAt(units, 35)?.title).toBe('Pages 1–35')
  expect(pdfUnitAt(units, 36)?.title).toBe('CHAPTER II.')
  expect(pdfUnitAt(units, 36)?.from).toBe(36)
  expect(pdfCompleteUnitPages(pdfUnitAt(units, 36)!)).toEqual([36, 37, 38, 39])
  expect(units.flatMap(unit => Array.from({length: unit.to - unit.from + 1}, (_, i) => unit.from + i))).toEqual(Array.from({length: 512}, (_, i) => i + 1))
})

it('makes a paper’s detected top-level sections its units, each from its heading, and keeps bookmarks first', async () => {
  const { pdfSectionUnits, pdfUnitFrac } = await import('./pdfOriginalUnits')
  const sections = [
    { title: 'Abstract', page: 1, frac: .3, level: 1 }, { title: '1 Introduction', page: 1, frac: .55, level: 1 },
    { title: '2 Method', page: 3, frac: .08, level: 1 }, { title: '2.1 Setup', page: 3, frac: .5, level: 2 },
    { title: '3 Results', page: 4, frac: .6, level: 1 }, { title: 'References', page: 6, frac: .4, level: 1 },
  ]
  const units = pdfOriginalUnits(margin, 7, [], { nav: 'headings', pages: 7, entries: [{ id: 'h0', label: '2 Method', page: 3 }] }, sections)
  expect(units.map(unit => [unit.title, unit.from, unit.start, unit.to, unit.frac, unit.matter ?? null])).toEqual([
    ['Abstract', 1, 1, 1, .3, null], ['1 Introduction', 1, 1, 2, .55, null],
    // A heading that opens its page leaves the page before to the section before.
    ['2 Method', 3, 3, 4, .08, null], ['3 Results', 4, 4, 6, .6, null], ['References', 6, 6, 7, .4, 'back'],
  ])
  // A shared page belongs to the section whose heading stands at or above the place.
  expect(pdfUnitAt(units, 1, .1)?.title).toBe('Abstract')
  expect(pdfUnitAt(units, 1, .7)?.title).toBe('1 Introduction')
  expect(pdfUnitAt(units, 4, .2)?.title).toBe('2 Method')
  expect(pdfUnitAt(units, 4, .8)?.title).toBe('3 Results')
  expect(pdfUnitFrac(units[2])).toBeCloseTo(.06)
  expect(pdfCompleteUnitPages(units[3])).toEqual([4, 5, 6])
  expect(pdfCompleteUnitPages(units[4])).toEqual([])
  // Bookmarks, when the file has them, still name the units.
  expect(pdfOriginalUnits(margin, 7, [{ title: 'Bookmarked', page: 1 }, { title: 'Later', page: 4 }], null, sections).map(unit => unit.title)).toEqual(['Bookmarked', 'Later'])
  // Too few sections, or a long document, keeps today's units.
  expect(pdfSectionUnits([sections[0]], 7)).toEqual([])
  expect(pdfSectionUnits(sections, 400)).toEqual([])
  // A first section after page 1 leaves the opening pages unnamed.
  expect(pdfOriginalUnits(margin, 7, [], null, sections.slice(2).map(section => ({ ...section, page: section.page })))[0]).toMatchObject({ title: 'Pages 1–2', from: 1, to: 2 })
})
