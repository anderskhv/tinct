/**
 * "Catch me up": a recap of everything read so far in the current book,
 * oldest first, ending where the reader is. Shared by the Worker route
 * (`/api/lab-catch-up`) and the reader's sheet.
 *
 * Units follow the book's top-level contents structure, never a per-book rule:
 *  - the Bible: one unit per biblical book (`contentsBooks`, the same grouping
 *    the contents uses);
 *  - a book whose sections name parts or volumes: one unit per top-level
 *    section; when the manifest has no sections but its chapter titles carry
 *    a part (`Book One (1805) — Chapter 3`, `Part 1, Chapter 2`), one unit per
 *    run of chapters sharing that part;
 *  - everything else: one unit per chapter.
 *
 * Truth rule (as `recapSummary.ts`): a unit the reader has fully passed gets a
 * full recap; the unit they are in is recapped only up to where they are —
 * its earlier chapters as one entry, then the current chapter through their
 * paragraph via `/api/lab-recap`. Nothing past the reader's place is ever
 * requested.
 */
import type { Section } from './types'
import type { LabRecapRequest } from './recapSummary'
import { contentsBooks } from './lab/labContents'

export const CATCH_UP_ROUTE = '/api/lab-catch-up'
export const CATCH_UP_PROMPT_VERSION = 'catch-up-v1'
export const CATCH_UP_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Unit ids are slugs: `book-2-kings`, `part-book-two-1805`, `ch-12`. */
export const CATCH_UP_UNIT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,95}$/

export type CatchUpUnitKind = 'book' | 'part' | 'chapter'

export interface CatchUpChapter { number: number; title: string }

export interface CatchUpUnit {
  id: string
  kind: CatchUpUnitKind
  title: string
  /** Sequential chapter numbers, in reading order. */
  chapters: number[]
}

export interface CatchUpRequest {
  bookId: string
  editionKey: string
  unitId: string
  /**
   * The last chapter (inclusive) to cover when the reader is still inside
   * this unit. Omitted for a unit the reader has fully passed.
   */
  throughChapter?: number
  /** Shown to the model for context only; not part of the cache key. */
  bookTitle?: string
}

export interface CatchUpResponse {
  summary: string
  unitId: string
  title: string
  /** Chapters the summary covers, in reading order. */
  chapters: number[]
  complete: boolean
  version: string
  source: 'static' | 'cache' | 'model'
}

function slug(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'unit'
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`
  used.add(id)
  return id
}

function sectionChapters(section: Section): number[] {
  return [...(section.chapters || []), ...(section.sections || []).flatMap(sectionChapters)]
}

/** `Book One (1805) — Chapter 3` → `Book One (1805)`; `Part 1, Chapter 2` → `Part 1`. */
export function chapterTitlePart(title: string): string | null {
  const match = /^(.+?)(?:\s+[—–-]\s+|,\s+|:\s+)(?:chapter|ch\.)\s+\S+/i.exec(title.trim())
  return match ? match[1].trim() : null
}

/** The book's units in reading order. Pure; the Worker and the client build the same list. */
export function catchUpUnits(input: { title: string; chapters: CatchUpChapter[]; sections?: Section[]; bible: boolean }): CatchUpUnit[] {
  const { chapters } = input
  const used = new Set<string>()
  const order = new Map(chapters.map((chapter, index) => [chapter.number, index]))
  const inOrder = (numbers: number[]) => [...new Set(numbers)].filter(n => order.has(n)).sort((a, b) => order.get(a)! - order.get(b)!)
  const chapterUnit = (chapter: CatchUpChapter): CatchUpUnit => ({ id: uniqueId(`ch-${chapter.number}`, used), kind: 'chapter', title: chapter.title, chapters: [chapter.number] })

  if (input.bible) {
    return contentsBooks(input.title, chapters, input.sections, true)
      .filter(book => book.chapters.length > 0)
      .map(book => ({ id: uniqueId(`book-${slug(book.title)}`, used), kind: 'book' as const, title: book.title, chapters: inOrder(book.chapters.map(ch => ch.number)) }))
  }

  const units: CatchUpUnit[] = []
  if (input.sections?.length) {
    const covered = new Set<number>()
    for (const section of input.sections) {
      const numbers = inOrder(sectionChapters(section)).filter(n => !covered.has(n))
      if (!numbers.length) continue
      numbers.forEach(n => covered.add(n))
      units.push({ id: uniqueId(`part-${slug(section.title)}`, used), kind: 'part', title: section.title, chapters: numbers })
    }
    for (const chapter of chapters) if (!covered.has(chapter.number)) units.push(chapterUnit(chapter))
    return units.sort((a, b) => order.get(a.chapters[0])! - order.get(b.chapters[0])!)
  }

  const parts = chapters.map(chapter => chapterTitlePart(chapter.title))
  const distinct = new Set(parts.filter((part): part is string => part !== null))
  const runs: Array<{ part: string | null; chapters: CatchUpChapter[] }> = []
  chapters.forEach((chapter, index) => {
    const last = runs[runs.length - 1]
    if (last && last.part !== null && last.part === parts[index]) last.chapters.push(chapter)
    else runs.push({ part: parts[index], chapters: [chapter] })
  })
  if (distinct.size < 2 || !runs.some(run => run.part !== null && run.chapters.length > 1)) return chapters.map(chapterUnit)
  for (const run of runs) {
    if (run.part === null) { run.chapters.forEach(chapter => units.push(chapterUnit(chapter))); continue }
    units.push({ id: uniqueId(`part-${slug(run.part)}`, used), kind: 'part', title: run.part, chapters: run.chapters.map(ch => ch.number) })
  }
  return units
}

export type CatchUpEntry =
  | { key: string; kind: 'unit'; title: string; request: CatchUpRequest; chapters: number[] }
  | { key: string; kind: 'current'; title: string; request: LabRecapRequest }

/**
 * The timeline, oldest first. Units wholly before the reader's chapter are
 * complete entries; the unit they are in contributes its earlier chapters (if
 * any) as a partial entry, then the current chapter through their paragraph.
 *
 * `readChapters`, when given, keeps only earlier units the reader has a record
 * of reading (the Bible is an anthology: opening it at John is not reading
 * Genesis to Malachi). The unit they are in is always kept.
 */
export function catchUpPlan(input: {
  bookId: string
  editionKey: string
  bookTitle?: string
  units: CatchUpUnit[]
  chapters: CatchUpChapter[]
  chapterNumber: number
  paragraphIndex: number
  completed: boolean
  readChapters?: ReadonlySet<number> | null
}): CatchUpEntry[] {
  const order = new Map(input.chapters.map((chapter, index) => [chapter.number, index]))
  const here = order.get(input.chapterNumber)
  if (here === undefined) return []
  const base = { bookId: input.bookId, editionKey: input.editionKey, ...(input.bookTitle ? { bookTitle: input.bookTitle } : {}) }
  const entries: CatchUpEntry[] = []
  for (const unit of input.units) {
    const before = unit.chapters.filter(n => (order.get(n) ?? Infinity) < here)
    if (!before.length) continue
    const containsHere = unit.chapters.includes(input.chapterNumber)
    const whole = !containsHere && before.length === unit.chapters.length
    if (!containsHere && !whole) continue
    if (!containsHere && input.readChapters && !unit.chapters.some(n => input.readChapters!.has(n))) continue
    const through = before[before.length - 1]
    entries.push({
      key: whole ? unit.id : `${unit.id}@${through}`,
      kind: 'unit',
      title: unit.title,
      chapters: before,
      request: whole ? { ...base, unitId: unit.id } : { ...base, unitId: unit.id, throughChapter: through },
    })
  }
  const current = input.chapters[here]
  entries.push({
    key: `here:${input.chapterNumber}:${input.paragraphIndex}`,
    kind: 'current',
    title: current.title,
    request: {
      ...base,
      chapterNumber: input.chapterNumber,
      paragraphIndex: Math.max(0, Math.floor(input.paragraphIndex) || 0),
      completed: input.completed,
    },
  })
  return entries
}

/** Cache key for one entry; the prompt version is part of it so a prompt change never serves a stale entry. */
export function catchUpCacheKey(input: { bookId: string; editionKey: string; unitId: string; throughChapter?: number | null }): string {
  return `${CATCH_UP_PROMPT_VERSION}/${input.bookId}/${input.editionKey}/${input.unitId}/${input.throughChapter ?? 'end'}`
}

/** Key inside a pre-written static recap file: the unit id, or `unit@chapter` for a partial unit. */
export function catchUpStaticKey(input: { unitId: string; throughChapter?: number | null }): string {
  return input.throughChapter == null ? input.unitId : `${input.unitId}@${input.throughChapter}`
}

/** Where a pre-written recap file for one edition would live; the route reads it before any generation. */
export function catchUpStaticPath(bookId: string, editionKey: string): string {
  return `/data/catch-up/${bookId}-${editionKey}.json`
}
