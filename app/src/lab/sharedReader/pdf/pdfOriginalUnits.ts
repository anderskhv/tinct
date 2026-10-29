import { PDF_SOURCE_PAGES } from './pdfOriginalSourceLimits'
import type { PdfScan, PdfSizedUnit, PdfUnitEntry } from '../../userBook/pdfEdition'

export type PdfOriginalScanOutline = Pick<PdfScan, 'entries' | 'nav' | 'pages'>
export type PdfOriginalUnit = PdfSizedUnit
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
  outline: PdfUnitEntry[] = [], scan: PdfOriginalScanOutline | null = null): PdfOriginalUnit[] {
  if (!Number.isInteger(count) || count < 1 || count > 5000) return []
  const validEntry = (entry: PdfUnitEntry): boolean =>
    (Number.isInteger(entry.page) && entry.page! >= 1 && entry.page! <= count)
    || (entry.items ?? []).some(validEntry)
  const validOutline = outline.some(validEntry)
  let entries = validOutline ? outline : []
  if (!validOutline && scan?.pages === count && Array.isArray(scan.entries)) {
    if (scan.nav === 'contents' || scan.nav === 'headings' || scan.nav === 'outline')
      entries = rules.scanTree(scan.entries)
    else if (count >= rules.PRIMER.units) entries = rules.scanEntries(scan.entries, scan.nav, count)
  }
  const units = rules.sizeUnits(entries, count, entries.length ? { min: 1, split: PDF_SOURCE_PAGES } : undefined).filter(unit => Number.isInteger(unit.from) && Number.isInteger(unit.to)
    && unit.from >= 1 && unit.from <= unit.to && unit.to <= count).map(unit => ({ ...unit, key: pdfUnitKey(unit.key) }))
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

export const pdfUnitAt = (units: PdfOriginalUnit[], page: number): PdfOriginalUnit | null =>
  units.find(unit => page >= unit.from && page <= unit.to) ?? null

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
