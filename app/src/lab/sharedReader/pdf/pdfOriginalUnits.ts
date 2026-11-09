import { PDF_SOURCE_PAGES } from './pdfOriginalSourceLimits'
import type { PdfScan, PdfSizedUnit, PdfUnitEntry } from '../../userBook/pdfEdition'
import { PDF_SECTION_PAGES, type PdfDetectedSection } from './pdfSectionHeadings'

export type PdfOriginalScanOutline = Pick<PdfScan, 'entries' | 'nav' | 'pages'>
/** frac: where a detected section's heading stands on its first page (pdfSectionHeadings), for the exact jump. */
export type PdfOriginalUnit = PdfSizedUnit & { frac?: number }
export interface PdfOriginalUnitRules {
  PRIMER: { units: number }
  sizeUnits: (entries: PdfUnitEntry[], count: number, options?: { min?: number; split?: number }) => PdfOriginalUnit[]
  scanTree: (entries: PdfScan['entries']) => PdfUnitEntry[]
  scanEntries: (entries: PdfScan['entries'], nav: string, count: number) => PdfUnitEntry[]
  catchUpSpan: (unitFrom: number, page: number, max?: number) => { from: number; to: number }
}
/** The companion's chapter parser has a 64-character key bound. */
export function pdfUnitKey(key: string): string {
  if (/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(key)) return key
  let hash = 2166136261
  for (let index = 0; index < key.length; index++) hash = Math.imul(hash ^ key.charCodeAt(index), 16777619)
  return `unit-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

/** The same pure size rules as Original pages in the existing margin reader. */
export function pdfOriginalUnits(rules: PdfOriginalUnitRules, count: number,
  outline: PdfUnitEntry[] = [], scan: PdfOriginalScanOutline | null = null, sections: PdfDetectedSection[] | null = null): PdfOriginalUnit[] {
  if (!Number.isInteger(count) || count < 1 || count > 5000) return []
  const validEntry = (entry: PdfUnitEntry): boolean =>
    (Number.isInteger(entry.page) && entry.page! >= 1 && entry.page! <= count)
    || (entry.items ?? []).some(validEntry)
  const validOutline = outline.some(validEntry)
  // A paper without bookmarks: its detected sections, each from its heading's place (bookmarks still come first).
  const detected = validOutline ? [] : pdfSectionUnits(sections, count)
  if (detected.length) return withOpeningPages(detected)
  let entries = validOutline ? outline : []
  if (!validOutline && scan?.pages === count && Array.isArray(scan.entries)) {
    if (scan.nav === 'contents' || scan.nav === 'headings' || scan.nav === 'outline')
      entries = rules.scanTree(scan.entries)
    else if (count >= rules.PRIMER.units) entries = rules.scanEntries(scan.entries, scan.nav, count)
  }
  const units = rules.sizeUnits(entries, count, entries.length ? { min: 1, split: PDF_SOURCE_PAGES } : undefined).filter(unit => Number.isInteger(unit.from) && Number.isInteger(unit.to)
    && unit.from >= 1 && unit.from <= unit.to && unit.to <= count).map(unit => ({ ...unit, key: pdfUnitKey(unit.key) }))
  return withOpeningPages(units)
}

function withOpeningPages(units: PdfOriginalUnit[]): PdfOriginalUnit[] {
  // The shared sizing rules attach leading pages to the first bookmark. Those
  // pages have no known chapter title: do not show a later heading on the cover
  // or include them in an action claiming to summarize that named chapter.
  const first = units[0]
  if (first?.from === 1 && first.start > 1 && first.start <= first.to) {
    const end = first.start - 1
    return [{ key: 'opening-pages-1', title: end === 1 ? 'Page 1' : `Pages 1–${end}`, from: 1, start: 1, to: end, pages: true },
      { ...first, from: first.start }, ...units.slice(1)]
  }
  return units
}

/** A jump to a detected heading lands this far above it, so the heading is not cut at the top of the view. */
const HEADING_LEAD = 0.02
/** Detected sections share pages: the unit at a place is the last one whose heading stands at or just below it. */
export function pdfUnitAt(units: PdfOriginalUnit[], page: number, frac = 0): PdfOriginalUnit | null {
  const here = units.filter(unit => page >= unit.from && page <= unit.to)
  if (here.length < 2) return here[0] ?? null
  return here.filter(unit => unit.start < page || (unit.frac ?? 0) <= frac + HEADING_LEAD + 0.01).at(-1) ?? here[0]
}

/** Where a unit's jump lands: just above a detected heading, else its page's top. */
export const pdfUnitFrac = (unit: PdfOriginalUnit): number => unit.frac === undefined ? 0 : Math.max(0, unit.frac - HEADING_LEAD)

const SECTION_BACK = /^(?:references|bibliography|works cited|literature cited)$/i
/**
 * Units for detected sections: the top-level sections in reading order, each from its heading's page to the page
 * where the next one starts (the page before, when the next heading opens its page). Subsections stay inside their
 * section, so a unit is a paper's section, never a paragraph. A section beginning on the page another one ends on
 * shares it; pdfUnitAt tells them apart by the place on the page.
 */
export function pdfSectionUnits(sections: PdfDetectedSection[] | null, count: number): PdfOriginalUnit[] {
  if (!sections?.length || count > PDF_SECTION_PAGES) return []
  const top = sections.filter(section => section.level === 1 && Number.isInteger(section.page) && section.page >= 1 && section.page <= count
    && Number.isFinite(section.frac) && section.title.trim())
  if (top.length < 2) return []
  return top.map((section, index) => {
    const next = top[index + 1]
    const to = !next ? count : Math.max(section.page, next.frac <= 0.12 && next.page > section.page ? next.page - 1 : next.page)
    const title = section.title.replace(/\s+/g, ' ').trim().slice(0, 300)
    return { key: pdfUnitKey(`section-${index}`), title, from: index === 0 ? 1 : section.page, start: section.page, to, frac: section.frac,
      ...(SECTION_BACK.test(title.replace(/^(?:\d+|[IVX]+)\.?\s+/, '')) ? { matter: 'back' } : {}) }
  })
}

/** Every page of the current source unit, including its later sections. */
export function pdfPrimerPages(unit: PdfOriginalUnit): number[] {
  if (unit.matter || unit.start < 1 || unit.to < unit.start) return []
  return Array.from({ length: Math.min(PDF_SOURCE_PAGES, unit.to - unit.start + 1) }, (_, index) => unit.start + index)
}

/** After-unit actions require every page of the finished unit, without pretending a partial recap is complete. */
export function pdfCompleteUnitPages(unit: PdfOriginalUnit, includeMatter = false): number[] {
  if (unit.matter && !includeMatter || unit.from < 1 || unit.to < unit.from || unit.to - unit.from + 1 > PDF_SOURCE_PAGES) return []
  return Array.from({ length: unit.to - unit.from + 1 }, (_, index) => unit.from + index)
}

/** All completed source pages before the current position; never include unread current-page text. */
export function pdfCatchUpPages(_rules: Pick<PdfOriginalUnitRules, 'catchUpSpan'>, unit: PdfOriginalUnit, page: number): number[] {
  if (unit.matter || !Number.isInteger(page) || page < 1 || page < unit.from || page > unit.to || page > PDF_SOURCE_PAGES) return []
  return Array.from({ length: page - 1 }, (_, index) => index + 1)
}
