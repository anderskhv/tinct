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
  expect(pdfCatchUpPages(margin, units[1], 14)).toEqual(Array.from({ length: 10 }, (_, i) => i + 1))
  expect(pdfCatchUpPages(margin, units[0], 5)).toEqual([1, 2, 3, 4])
  expect(pdfCompleteUnitPages(units[1])).toEqual(Array.from({ length: 20 }, (_, i) => i + 11))
  expect(pdfCompleteUnitPages(units[2])).toEqual([]) // 30-page unit cannot be recapped as a whole under a 20-page source bound.
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
