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
 *  - the last CATCH_UP_RECENT_CHAPTERS (two) get an entry each, chapter by
 *    chapter (a chapter under a page joins its neighbour in the same part, so
 *    it never vanishes as "nothing to summarise");
 *  - everything before them is grouped by the book's structure (Anders,
 *    21 Oct 2026: "too much condensation, need at least one header per
 *    book"): a group NEVER crosses a part, book or volume, so every part gets
 *    at least its own entry; inside a part, consecutive chapters are grouped
 *    by size, about CATCH_UP_GROUP_MIN_PAGES–CATCH_UP_GROUP_NEAR_PAGES pages
 *    in the part the reader is in (or the last pages of a book without parts)
 *    and up to CATCH_UP_GROUP_FAR_PAGES further back, so recent reading has
 *    more detail and older reading is more compressed (the 3–25-page aim of
 *    DECISIONS 2026-10-19). A group is a `range` unit (`chs-<from>-<to>`), a
 *    whole part by its id, or one chapter.
 * The current chapter and anything after it are never included or requested:
 * the timeline ends at "You are here" (Anders, 8 Oct 2026). Each request
 * names the reader's chapter (`placeChapter`); the Worker refuses coverage at
 * or after it and the client drops any entry that reaches it.
 */
import type { Section } from './types'
import type { LabRecapRequest } from './recapSummary'
import { contentsBooks } from './lab/labContents'

export const CATCH_UP_ROUTE = '/api/lab-catch-up'
export const CATCH_UP_PROMPT_VERSION = 'catch-up-v4'
export const CATCH_UP_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Unit ids are slugs: `book-2-kings`, `part-book-two-1805`, `ch-12`. */
export const CATCH_UP_UNIT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,95}$/

/** `range`: a compact block of consecutive chapters (`chs-<from>-<to>`), only ever asked for by id. */
export type CatchUpUnitKind = 'book' | 'part' | 'chapter' | 'range'

/** The chapters just before the current one that keep an entry each; earlier ones are one block. */
export const CATCH_UP_RECENT_CHAPTERS = 2

/** Sizes are optional: a chapter list without them is grouped by chapter count (CATCH_UP_FALLBACK_CHAPTER_WORDS). */
export interface CatchUpChapter { number: number; title: string; wordCount?: number; paragraphCount?: number }

/** Grouping sizes, in printed pages of CATCH_UP_WORDS_PER_PAGE words. */
export const CATCH_UP_WORDS_PER_PAGE = 300
export const CATCH_UP_GROUP_MIN_PAGES = 3
/** In the part the reader is in (or the last CATCH_UP_NEAR_PAGES of a book without parts). */
export const CATCH_UP_GROUP_NEAR_PAGES = 25
/** Further back: more compressed. */
export const CATCH_UP_GROUP_FAR_PAGES = 50
/** A book without parts: how far back from the reader's chapter counts as near. */
export const CATCH_UP_NEAR_PAGES = 120
/** A chapter with no size at all counts as this many words. */
export const CATCH_UP_FALLBACK_CHAPTER_WORDS = 3_000
/** Under this, a recent chapter joins its neighbour in the same part instead of standing alone. */
export const CATCH_UP_TINY_CHAPTER_WORDS = 250

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
  /**
   * The reader's chapter (the place the sheet was opened at). Not part of the
   * cache key: the Worker refuses any coverage at or after it, so nothing
   * past the reader's place is ever summarised or sent.
   */
  placeChapter?: number
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

/** The top-level part (a `part` or biblical `book` unit) each chapter belongs to; chapters outside one are absent. */
function partOf(units: CatchUpUnit[]): Map<number, CatchUpUnit> {
  const map = new Map<number, CatchUpUnit>()
  for (const unit of units) if (unit.kind === 'part' || unit.kind === 'book') for (const n of unit.chapters) map.set(n, unit)
  return map
}

/** Which part a chapter is in, as a key: the part's id, or '' for a chapter outside any part. */
export function catchUpPartKey(units: CatchUpUnit[], chapterNumber: number): string {
  return partOf(units).get(chapterNumber)?.id ?? ''
}

/**
 * Whether a run of chapters crosses a part, book or volume (or runs from one
 * into chapters outside any). A catch-up group never does; the Worker refuses one.
 */
export function catchUpCrossesParts(units: CatchUpUnit[], chapterNumbers: readonly number[]): boolean {
  const parts = partOf(units)
  return new Set(chapterNumbers.map(n => parts.get(n)?.id ?? '')).size > 1
}

/**
 * Each chapter's size in words: its word count, else its paragraphs at the
 * book's own words per paragraph (from the chapters that carry both), else
 * CATCH_UP_FALLBACK_CHAPTER_WORDS.
 */
export function catchUpChapterWords(chapters: readonly CatchUpChapter[]): (chapter: CatchUpChapter) => number {
  let words = 0, paragraphs = 0
  for (const chapter of chapters) {
    if (chapter.wordCount && chapter.wordCount > 0 && chapter.paragraphCount && chapter.paragraphCount > 0) {
      words += chapter.wordCount
      paragraphs += chapter.paragraphCount
    }
  }
  const perParagraph = paragraphs > 0 ? words / paragraphs : 100
  return chapter => {
    if (chapter.wordCount && chapter.wordCount > 0) return chapter.wordCount
    if (chapter.paragraphCount && chapter.paragraphCount > 0) return Math.round(chapter.paragraphCount * perParagraph)
    return CATCH_UP_FALLBACK_CHAPTER_WORDS
  }
}

/** "Part I — The Window" is named by "The Window · 1 – The Window · 5"; "Part One" is not named by "Chapter 1 – Chapter 5". */
function namesPart(title: string, part: string): boolean {
  const name = part.replace(/^(?:part|book|volume)\s+[\divxlc]+\s*[—–:.,-]?\s*/i, '').trim().toLowerCase()
  return title.toLowerCase().includes(name || part.toLowerCase())
}

/**
 * The places the sheet may show an entry for: chapters strictly before the
 * reader's (chapter numbers are sequential, in reading order). The sheet
 * filters by this and the client never sends a request beyond it.
 */
export function catchUpBeforePlace(entry: CatchUpEntry, placeChapter: number): boolean {
  if (entry.kind !== 'unit') return entry.request.chapterNumber < placeChapter
  return entry.chapters.length > 0 && entry.chapters.every(n => n < placeChapter)
}

/**
 * The timeline, oldest first (scope and grouping: see the header). Never the
 * current chapter or later.
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
  const base = {
    bookId: input.bookId, editionKey: input.editionKey,
    ...(input.bookTitle ? { bookTitle: input.bookTitle } : {}),
    placeChapter: input.chapterNumber,
  }
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
  if (!earlier.length) return []
  const parts = partOf(input.units)
  const partKey = (chapter: CatchUpChapter) => parts.get(chapter.number)?.id ?? ''
  const words = catchUpChapterWords(input.chapters)
  const page = CATCH_UP_WORDS_PER_PAGE
  const herePart = parts.get(input.chapterNumber)?.id ?? ''

  // Near: in the reader's part; outside any part, within CATCH_UP_NEAR_PAGES of the reader's chapter.
  const near = new Set<number>()
  let behind = 0
  for (let i = earlier.length - 1; i >= 0; i--) {
    const chapter = earlier[i], key = partKey(chapter)
    behind += words(chapter)
    if (key ? key === herePart : behind <= CATCH_UP_NEAR_PAGES * page) near.add(chapter.number)
  }

  const recentCount = Math.max(0, Math.floor(input.recent ?? CATCH_UP_RECENT_CHAPTERS))
  const split = Math.max(0, earlier.length - recentCount)
  const older = earlier.slice(0, split)
  const groups: CatchUpChapter[][] = []
  // Older chapters: first the runs inside one part (a group never crosses one), then each run cut by size.
  const runs: CatchUpChapter[][] = []
  for (const chapter of older) {
    const run = runs[runs.length - 1]
    if (run && partKey(run[0]) === partKey(chapter)) run.push(chapter)
    else runs.push([chapter])
  }
  const min = CATCH_UP_GROUP_MIN_PAGES * page
  for (const run of runs) {
    const cut: CatchUpChapter[][] = []
    let group: CatchUpChapter[] = [], size = 0
    for (const chapter of run) {
      const w = words(chapter)
      const last = group[group.length - 1]
      const cap = (near.has(chapter.number) ? CATCH_UP_GROUP_NEAR_PAGES : CATCH_UP_GROUP_FAR_PAGES) * page
      // A new group where the reach changes (far to near) or the group is full.
      if (last && (near.has(last.number) !== near.has(chapter.number) || (size + w > cap && size >= min))) {
        cut.push(group); group = []; size = 0
      }
      group.push(chapter)
      size += w
    }
    // The part's last group under the minimum joins the one before it.
    if (cut.length && size < min) cut[cut.length - 1].push(...group)
    else cut.push(group)
    groups.push(...cut)
  }
  // The most recent chapters, one each; a chapter under a page joins its neighbour in the same part.
  const recent = earlier.slice(split).map(chapter => [chapter])
  for (let i = 0; i < recent.length; i++) {
    const [chapter] = recent[i]
    if (recent[i].length !== 1 || words(chapter) >= CATCH_UP_TINY_CHAPTER_WORDS) continue
    const next = recent[i + 1], previous = i > 0 ? recent[i - 1] : groups[groups.length - 1]
    if (next && partKey(next[0]) === partKey(chapter)) { next.unshift(chapter); recent.splice(i, 1); i-- }
    else if (previous && partKey(previous[previous.length - 1]) === partKey(chapter)) { previous.push(chapter); recent.splice(i, 1); i-- }
  }
  groups.push(...recent)

  return groups.map(group => {
    const first = group[0], last = group[group.length - 1]
    const numbers = group.map(chapter => chapter.number)
    const part = parts.get(first.number)
    // The header names the part when the chapters' own titles do not ("Part One: Chapter 6").
    const named = (title: string) => part && part.kind === 'part' && !namesPart(title, part.title) ? `${part.title}: ${title}` : title
    if (group.length === 1) {
      const unitId = catchUpChapterUnitId(first.number)
      return { key: unitId, kind: 'unit' as const, title: named(first.title), chapters: numbers, request: { ...base, unitId } }
    }
    if (part && part.chapters.length === numbers.length && part.chapters.every((n, i) => n === numbers[i])) {
      return { key: part.id, kind: 'unit' as const, title: part.title, chapters: numbers, request: { ...base, unitId: part.id } }
    }
    const unitId = catchUpRangeUnitId(first.number, last.number)
    return { key: unitId, kind: 'unit' as const, title: named(catchUpRangeTitle(first, last)), chapters: numbers, request: { ...base, unitId } }
  })
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
