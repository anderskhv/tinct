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
 * Scope (`catchUpPlan`):
 *  - a collection of separate works (the Bible, a short-story collection;
 *    `catchUpSeparateWorks`): only the work the reader is in, chapter by
 *    chapter. Earlier works are other books and are never recapped;
 *  - a book with parts: every earlier part as one folded entry, then the
 *    current part chapter by chapter;
 *  - everything else: every earlier chapter.
 * The timeline always ends with the current chapter through the reader's
 * paragraph via `/api/lab-recap`. Nothing past the reader's place is ever
 * requested.
 */
import type { Section } from './types'
import { briefRecapHasEnoughText, type LabRecapRequest } from './recapSummary'
import { contentsBooks } from './lab/labContents'

export const CATCH_UP_ROUTE = '/api/lab-catch-up'
export const CATCH_UP_PROMPT_VERSION = 'catch-up-v3'
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

/**
 * The unit a request names: one of the book's units, or a single chapter by
 * `ch-<number>`. The Worker and the client resolve ids the same way.
 */
export function catchUpFindUnit(units: CatchUpUnit[], chapters: CatchUpChapter[], unitId: string): CatchUpUnit | null {
  const unit = units.find(item => item.id === unitId)
  if (unit) return unit
  const match = /^ch-(\d+)$/.exec(unitId)
  if (!match) return null
  const chapter = chapters.find(item => item.number === Number(match[1]))
  return chapter ? { id: unitId, kind: 'chapter', title: chapter.title, chapters: [chapter.number] } : null
}

/**
 * The timeline, oldest first (scope: see the header). The unit the reader is
 * in contributes each of its earlier chapters as its own entry, then the
 * current chapter through their paragraph.
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
  /** A collection of separate works (`catchUpSeparateWorks`): nothing before the current work. */
  separateWorks?: boolean
  /**
   * The current chapter's paragraphs, when loaded. With them, the "so far"
   * entry is left out until the reader has read enough narrative to summarise
   * (`briefRecapHasEnoughText`): a heading, an address and a date are not a
   * chapter's events. Without them the entry is kept and the Worker decides.
   */
  currentParagraphs?: readonly string[] | null
}): CatchUpEntry[] {
  const order = new Map(input.chapters.map((chapter, index) => [chapter.number, index]))
  const here = order.get(input.chapterNumber)
  if (here === undefined) return []
  const base = { bookId: input.bookId, editionKey: input.editionKey, ...(input.bookTitle ? { bookTitle: input.bookTitle } : {}) }
  const hasParts = input.units.some(unit => unit.kind === 'part')
  const titles = new Map(input.chapters.map(chapter => [chapter.number, chapter.title]))
  const entries: CatchUpEntry[] = []
  for (const unit of input.units) {
    const before = unit.chapters.filter(n => (order.get(n) ?? Infinity) < here)
    if (!before.length) continue
    if (unit.chapters.includes(input.chapterNumber)) {
      // The unit the reader is in: chapter by chapter up to their chapter.
      for (const n of before) {
        const unitId = catchUpChapterUnitId(n)
        entries.push({ key: unitId, kind: 'unit', title: titles.get(n) ?? unit.title, chapters: [n], request: { ...base, unitId } })
      }
      continue
    }
    // Earlier works of a collection are other books, never recapped here.
    if (input.separateWorks) continue
    if (before.length !== unit.chapters.length) continue
    entries.push({
      key: unit.id,
      kind: 'unit',
      title: unit.title,
      chapters: before,
      request: { ...base, unitId: unit.id },
      ...(hasParts ? { folded: true } : {}),
    })
  }
  const current = input.chapters[here]
  if (input.currentParagraphs?.length && !briefRecapHasEnoughText({
    paragraphs: input.currentParagraphs, paragraphIndex: input.paragraphIndex, completed: input.completed,
  })) return entries
  entries.push({
    key: `here:${input.chapterNumber}:${input.paragraphIndex}`,
    kind: 'current',
    title: current.title,
    request: {
      ...base,
      chapterNumber: input.chapterNumber,
      paragraphIndex: Math.max(0, Math.floor(input.paragraphIndex) || 0),
      completed: input.completed,
      brief: true,
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
