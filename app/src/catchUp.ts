/**
 * "Catch me up": a recap of what has been read so far, oldest first, ending
 * where the reader is. Shared by the Worker route (`/api/lab-catch-up`) and
 * the reader's sheet.
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
 * Scope (`catchUpPlan`): the chapters before the current one, in reading
 * order; for a collection of separate works (the Bible, a short-story
 * collection; `catchUpSeparateWorks`) only those of the work the reader is in
 * (earlier works are other books and are never recapped). Of those:
 *  - the last CATCH_UP_RECENT_CHAPTERS (two) get an entry each, chapter by chapter;
 *  - everything before them is one compact block (a `range` unit, `chs-<from>-<to>`),
 *    or a plain chapter entry when it is a single chapter.
 * The current chapter and anything after it are never included or requested:
 * the timeline ends at "You are here" (Anders, 8 Oct 2026).
 */
import type { Section } from './types'
import type { LabRecapRequest } from './recapSummary'
import { contentsBooks } from './lab/labContents'

export const CATCH_UP_ROUTE = '/api/lab-catch-up'
export const CATCH_UP_PROMPT_VERSION = 'catch-up-v3'
export const CATCH_UP_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Unit ids are slugs: `book-2-kings`, `part-book-two-1805`, `ch-12`. */
export const CATCH_UP_UNIT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,95}$/

/** `range`: a compact block of consecutive chapters (`chs-<from>-<to>`), only ever asked for by id. */
export type CatchUpUnitKind = 'book' | 'part' | 'chapter' | 'range'

/** The chapters just before the current one that keep an entry each; earlier ones are one block. */
export const CATCH_UP_RECENT_CHAPTERS = 2

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
  /** The model found nothing to summarise: `summary` is empty, the entry is not shown and nothing is cached. */
  empty?: boolean
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
  /** `folded`: an earlier part, shown as one line that opens on tap. */
  | { key: string; kind: 'unit'; title: string; request: CatchUpRequest; chapters: number[]; folded?: boolean }
  /** The current chapter so far via `/api/lab-recap`: no longer produced by `catchUpPlan` (the current chapter is never recapped). */
  | { key: string; kind: 'current'; title: string; request: LabRecapRequest }

/** Library forms whose chapters are separate works (`libraryTaxonomy.ts`). */
const SEPARATE_WORK_FORMS = new Set(['short-stories'])

/**
 * Whether the book is a collection of separate works, so Catch me up stays
 * inside the work the reader is in. The Bible always is (each biblical book is
 * a work); otherwise the library form says so.
 */
export function catchUpSeparateWorks(input: { bookId: string; form?: string | null }): boolean {
  return input.bookId === 'bible' || (!!input.form && SEPARATE_WORK_FORMS.has(input.form))
}

/** The id a single chapter is asked for by when it is not a unit of its own (a chapter inside a part or a biblical book). */
export function catchUpChapterUnitId(chapterNumber: number): string {
  return `ch-${chapterNumber}`
}

/** The id of a compact block: chapters `from` through `to`, in reading order. */
export function catchUpRangeUnitId(from: number, to: number): string {
  return `chs-${from}-${to}`
}

/** A block's title from its first and last chapters' own titles. */
export function catchUpRangeTitle(first: CatchUpChapter, last: CatchUpChapter): string {
  return first.number === last.number ? first.title : `${first.title} – ${last.title}`
}

/**
 * The unit a request names: one of the book's units, a single chapter by
 * `ch-<number>`, or a block of chapters by `chs-<from>-<to>`. The Worker and
 * the client resolve ids the same way.
 */
export function catchUpFindUnit(units: CatchUpUnit[], chapters: CatchUpChapter[], unitId: string): CatchUpUnit | null {
  const unit = units.find(item => item.id === unitId)
  if (unit) return unit
  const range = /^chs-(\d+)-(\d+)$/.exec(unitId)
  if (range) {
    const from = chapters.findIndex(item => item.number === Number(range[1]))
    const to = chapters.findIndex(item => item.number === Number(range[2]))
    if (from < 0 || to < from) return null
    return { id: unitId, kind: 'range', title: catchUpRangeTitle(chapters[from], chapters[to]), chapters: chapters.slice(from, to + 1).map(item => item.number) }
  }
  const match = /^ch-(\d+)$/.exec(unitId)
  if (!match) return null
  const chapter = chapters.find(item => item.number === Number(match[1]))
  return chapter ? { id: unitId, kind: 'chapter', title: chapter.title, chapters: [chapter.number] } : null
}

/**
 * The timeline, oldest first (scope: see the header): one compact block for
 * the earlier chapters, then the last CATCH_UP_RECENT_CHAPTERS before the
 * current one, chapter by chapter. Never the current chapter or later.
 */
export function catchUpPlan(input: {
  bookId: string
  editionKey: string
  bookTitle?: string
  units: CatchUpUnit[]
  chapters: CatchUpChapter[]
  chapterNumber: number
  /** The reader's place in the current chapter. Not recapped (the current chapter never is); kept for callers. */
  paragraphIndex?: number
  completed?: boolean
  /** A collection of separate works (`catchUpSeparateWorks`): nothing before the current work. */
  separateWorks?: boolean
  /** The current chapter's paragraphs; unused now that the current chapter is never recapped. */
  currentParagraphs?: readonly string[] | null
  /** How many chapters before the current one keep an entry each (CATCH_UP_RECENT_CHAPTERS). */
  recent?: number
}): CatchUpEntry[] {
  const here = input.chapters.findIndex(chapter => chapter.number === input.chapterNumber)
  if (here < 0) return []
  const base = { bookId: input.bookId, editionKey: input.editionKey, ...(input.bookTitle ? { bookTitle: input.bookTitle } : {}) }
  // Strictly before the current chapter, in reading order.
  let earlier = input.chapters.slice(0, here)
  if (input.separateWorks) {
    // Only the work the reader is in.
    const work = input.units.find(unit => unit.chapters.includes(input.chapterNumber))
    const inWork = new Set(work?.chapters ?? [input.chapterNumber])
    let start = earlier.length
    while (start > 0 && inWork.has(earlier[start - 1].number)) start--
    earlier = earlier.slice(start)
  }
  const recentCount = Math.max(0, Math.floor(input.recent ?? CATCH_UP_RECENT_CHAPTERS))
  const split = Math.max(0, earlier.length - recentCount)
  const block = earlier.slice(0, split)
  const recent = earlier.slice(split)
  const chapterEntry = (chapter: CatchUpChapter): CatchUpEntry => {
    const unitId = catchUpChapterUnitId(chapter.number)
    return { key: unitId, kind: 'unit', title: chapter.title, chapters: [chapter.number], request: { ...base, unitId } }
  }
  const entries: CatchUpEntry[] = []
  if (block.length === 1) entries.push(chapterEntry(block[0]))
  else if (block.length > 1) {
    const first = block[0], last = block[block.length - 1]
    const unitId = catchUpRangeUnitId(first.number, last.number)
    entries.push({ key: unitId, kind: 'unit', title: catchUpRangeTitle(first, last), chapters: block.map(chapter => chapter.number), request: { ...base, unitId } })
  }
  for (const chapter of recent) entries.push(chapterEntry(chapter))
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
