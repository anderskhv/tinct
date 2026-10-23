import type { PdfScan, PdfSizedUnit, PdfUnitEntry } from '../../userBook/pdfEdition'

export type PdfOriginalScanOutline = Pick<PdfScan, 'entries' | 'nav' | 'pages'>
export type PdfOriginalUnit = PdfSizedUnit
export interface PdfOriginalUnitRules {
  PRIMER: { units: number }
  sizeUnits: (entries: PdfUnitEntry[], count: number) => PdfOriginalUnit[]
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
  return rules.sizeUnits(entries, count).filter(unit => Number.isInteger(unit.from) && Number.isInteger(unit.to)
    && unit.from >= 1 && unit.from <= unit.to && unit.to <= count).map(unit => ({ ...unit, key: pdfUnitKey(unit.key) }))
}

export const pdfUnitAt = (units: PdfOriginalUnit[], page: number): PdfOriginalUnit | null =>
  units.find(unit => page >= unit.from && page <= unit.to) ?? null

/** Bounded actual pages from the unit's heading, within the companion's 20-page limit. */
export function pdfPrimerPages(unit: PdfOriginalUnit): number[] {
  if (unit.matter || unit.start < 1 || unit.to < unit.start) return []
  return Array.from({ length: Math.min(20, unit.to - unit.start + 1) }, (_, index) => unit.start + index)
}

/** The recent *earlier* pages: never turn the current or a future page into a catch-up. */
export function pdfCatchUpPages(rules: Pick<PdfOriginalUnitRules, 'catchUpSpan'>, unit: PdfOriginalUnit, page: number): number[] {
  if (unit.matter || !Number.isInteger(page) || page < 1 || page < unit.from || page > unit.to) return []
  const span = unit.from === 1 ? { from: Math.max(1, page - 20), to: page - 1 } : rules.catchUpSpan(unit.from, page, 20)
  const to = Math.min(span.to, page - 1)
  if (span.from < 1 || span.from > to) return []
  return Array.from({ length: to - span.from + 1 }, (_, index) => span.from + index)
}
