import type { BookReadingLog, ChatConversation, Section } from '../types'
import { visibleToViewer, type ReadingMemoryState } from '../readingMemory'
import { buildLabBibleTree, type LabTreeNode } from './labBibleTree'
import { labChapterStatuses, type LabChapterStatus, type LabChapterStatusKind } from './labChapterStatus'
import { biblicalBookId, parseBiblicalPlaceTitle, type LabPositionState } from './labPosition'
import { isUserBookId } from './userBook/userBookId'

/**
 * Per-book chapter coverage for the companion, built from the records the
 * Contents menu reads (`labChapterStatuses`): the position record's finished
 * set and saved places, reading-memory sessions and chat locations, plus any
 * legacy `reading-log:*` record still on the device. A reader's own books
 * stay out.
 */
export interface ReadingCoverageSources {
  position?: LabPositionState | null
  memory?: ReadingMemoryState | null
  viewer?: string | null
  conversations?: ReadonlyArray<ChatConversation>
  legacyLogs?: ReadonlyArray<BookReadingLog>
}

export interface ReadingCoverageOutline {
  chapters: ReadonlyArray<{ number: number; title: string }>
  sections?: Section[]
}

const KIND_RANK: Record<LabChapterStatusKind, number> = { 'not-started': 0, visited: 1, 'in-progress': 2, finished: 3 }

/**
 * Library book a saved place belongs to. Bible places are pinned per biblical
 * book (`ezra`, `1-john`), so a pin is the Bible's when its id is a biblical
 * slug that is not itself a registry book.
 */
export function libraryBookForPin(pinBookId: string, biblicalSlugs: ReadonlySet<string>, isRegistryBook: (id: string) => boolean): string {
  if (pinBookId === 'bible') return 'bible'
  if (isRegistryBook(pinBookId)) return pinBookId
  return biblicalSlugs.has(pinBookId) ? 'bible' : pinBookId
}

export function readingCoverageByBook(
  sources: ReadingCoverageSources,
  options: { biblicalSlugs?: ReadonlySet<string>; isRegistryBook?: (id: string) => boolean } = {},
): Map<string, Map<number, LabChapterStatus>> {
  const slugs = options.biblicalSlugs ?? new Set<string>()
  const isRegistryBook = options.isRegistryBook ?? (() => false)
  const viewer = sources.viewer ?? null
  // The position record is one device-wide record tagged with its account.
  const position = sources.position && !(sources.position.owner && viewer && sources.position.owner !== viewer)
    ? sources.position : null
  const candidates = new Map<string, Set<number>>()
  const add = (bookId: string | undefined, chapter: number) => {
    if (!bookId || isUserBookId(bookId) || !Number.isInteger(chapter) || chapter < 1) return
    let set = candidates.get(bookId)
    if (!set) candidates.set(bookId, set = new Set())
    set.add(chapter)
  }
  const pinsByBook = new Map<string, LabPositionState['books']>()
  if (position) {
    for (const [bookId, list] of Object.entries(position.finished || {})) for (const chapter of list) add(bookId, chapter)
    for (const [key, pin] of Object.entries(position.books || {})) {
      const library = libraryBookForPin(pin.bookId, slugs, isRegistryBook)
      add(library, pin.sequentialChapter)
      const pins = pinsByBook.get(library) || {}
      pins[key] = pin
      pinsByBook.set(library, pins)
    }
  }
  const visible = visibleToViewer(viewer)
  for (const session of Object.values(sources.memory?.sessions || {})) {
    if (visible(session)) add(session.anchor.bookId, session.anchor.chapterNumber)
  }
  const chatsByBook = new Map<string, Array<{ chapterNumber: number; endTimestamp: number }>>()
  for (const conversation of sources.conversations || []) {
    add(conversation.bookId, conversation.chapterNumber)
    const list = chatsByBook.get(conversation.bookId) || []
    list.push(conversation)
    chatsByBook.set(conversation.bookId, list)
  }
  for (const log of sources.legacyLogs || []) {
    for (const record of Object.values(log?.chapters || {})) if (record) add(log.bookId, record.chapterNumber)
  }

  const out = new Map<string, Map<number, LabChapterStatus>>()
  for (const [bookId, chapters] of candidates) {
    const statuses = labChapterStatuses({
      bookId,
      chapterNumbers: [...chapters],
      finished: new Set(position?.finished?.[bookId] || []),
      memory: sources.memory,
      // Only this book's places: Contents is always asked about one open book.
      position: position ? { ...position, books: pinsByBook.get(bookId) || {} } : null,
      viewer,
      conversations: chatsByBook.get(bookId) || [],
    })
    for (const log of sources.legacyLogs || []) {
      if (log?.bookId !== bookId) continue
      for (const record of Object.values(log.chapters || {})) {
        if (!record || !Number.isInteger(record.chapterNumber)) continue
        const prev = statuses.get(record.chapterNumber) || { kind: 'not-started' as const }
        const kind: LabChapterStatusKind = record.completed ? 'finished' : 'visited'
        statuses.set(record.chapterNumber, {
          ...prev,
          kind: KIND_RANK[kind] > KIND_RANK[prev.kind] ? kind : prev.kind,
          lastReadAt: Math.max(prev.lastReadAt ?? 0, record.lastReadAt || 0) || undefined,
        })
      }
    }
    for (const [chapter, status] of statuses) if (status.kind === 'not-started') statuses.delete(chapter)
    if (statuses.size > 0) out.set(bookId, statuses)
  }
  return out
}

/** "1–3, 5, 7–9" from chapter labels in reading order. */
export function compressChapterRanges(labels: ReadonlyArray<number>): string {
  const sorted = [...new Set(labels)].sort((a, b) => a - b)
  const parts: string[] = []
  for (let i = 0; i < sorted.length; i++) {
    let j = i
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}–${sorted[j]}`)
    i = j
  }
  return parts.join(', ')
}

function isoDate(value: number): string {
  return new Date(value).toISOString().slice(0, 10)
}

interface CoverageGroup {
  /** "Ezra" for a biblical book, otherwise the book title. */
  name: string
  /** Bible groups name chapters "Ezra 1–10"; other books "chapters 1–3". */
  biblical: boolean
  /** Whether `chapters` is the book's whole chapter list (so "all"/"x of y" is true). */
  complete: boolean
  /** Overrides the "chapters " prefix. */
  prefix?: string
  /** Sequential chapter numbers in the group, in reading order. */
  chapters: number[]
  /** Label shown for a sequential chapter (its number inside the group). */
  label: (sequential: number) => number
}

function describeGroup(group: CoverageGroup, statuses: ReadonlyMap<number, LabChapterStatus>): { text: string; at: number } | null {
  const byKind: Record<'finished' | 'in-progress' | 'visited', number[]> = { finished: [], 'in-progress': [], visited: [] }
  let at = 0
  for (const chapter of group.chapters) {
    const status = statuses.get(chapter)
    if (!status || status.kind === 'not-started') continue
    byKind[status.kind].push(group.label(chapter))
    at = Math.max(at, status.lastReadAt ?? 0, status.finishedAt ?? 0)
  }
  const total = group.chapters.length
  const parts: string[] = []
  const prefix = group.prefix ?? (group.biblical ? `${group.name} ` : 'chapters ')
  let first = true
  for (const kind of ['finished', 'in-progress', 'visited'] as const) {
    if (!byKind[kind].length) continue
    parts.push(`${first ? prefix : ''}${compressChapterRanges(byKind[kind])} ${kind === 'in-progress' ? 'in progress' : kind}`)
    first = false
  }
  if (!parts.length) return null
  const finished = byKind.finished.length
  const extent = group.complete && total > 0
    ? (finished === total ? ` (all ${total} chapters finished)` : ` (${finished} of ${total} chapters finished)`)
    : ''
  const name = group.biblical ? `The Bible, ${group.name}` : group.name
  return { at, text: `${name}: ${parts.join(', ')}${extent}${at ? `; last read ${isoDate(at)}` : ''}.` }
}

function bibleBookNodes(nodes: LabTreeNode[]): LabTreeNode[] {
  return nodes.flatMap(node => node.kind === 'book' ? [node] : bibleBookNodes(node.children || []))
}

/** Biblical-book boundaries from the Bible manifest's sections (or, failing that, chapter titles). */
export function bibleCoverageGroups(outline: ReadingCoverageOutline | null | undefined): CoverageGroup[] {
  if (!outline?.chapters.length) return []
  const titleOf = new Map(outline.chapters.map(chapter => [chapter.number, chapter.title]))
  const localLabel = (chapters: number[]) => (sequential: number) => {
    const parsed = Number(parseBiblicalPlaceTitle(titleOf.get(sequential) || '').chapter)
    const fromTitle = titleOf.has(sequential) && Number.isInteger(parsed) && parsed > 0 ? parsed : 0
    return fromTitle || chapters.indexOf(sequential) + 1
  }
  const books = bibleBookNodes(buildLabBibleTree(outline.sections, []))
  if (books.length > 0) {
    return books.map(node => ({ name: node.title, biblical: true, complete: true, chapters: node.chapterNumbers, label: localLabel(node.chapterNumbers) }))
  }
  const grouped = new Map<string, number[]>()
  for (const chapter of outline.chapters) {
    const book = parseBiblicalPlaceTitle(chapter.title).book
    grouped.set(book, [...(grouped.get(book) || []), chapter.number])
  }
  return [...grouped].map(([name, chapters]) => ({ name, biblical: true, complete: true, chapters, label: localLabel(chapters) }))
}

/** Lowercase slugs of the biblical books, matching Bible place pins. */
export function biblicalSlugsOf(outline: ReadingCoverageOutline | null | undefined): Set<string> {
  return new Set(bibleCoverageGroups(outline).map(group => biblicalBookId(group.name)))
}

function normalized(value: string): string {
  return ` ${value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `
}

/** True when the question names this title as whole words ("ezra", "the odyssey"). */
export function questionNames(question: string, title: string): boolean {
  const needle = normalized(title.replace(/^the\s+/i, '')).trim()
  return needle.length > 1 && normalized(question).includes(` ${needle} `)
}

export interface ReadingCoverageBook {
  bookId: string
  title: string
  outline?: ReadingCoverageOutline | null
}

export interface ReadingCoverageSummaryInput {
  coverage: ReadonlyMap<string, ReadonlyMap<number, LabChapterStatus>>
  books: ReadonlyArray<ReadingCoverageBook>
  question?: string
  openBookId?: string | null
  /** Character budget for the listed lines. */
  maxChars?: number
}

/**
 * One line per book (per biblical book for the Bible) with recorded activity,
 * plus the open book and any book the question names, which are listed even
 * without a record. Named and open books come first, then the most recent.
 */
export function readingCoverageLines(input: ReadingCoverageSummaryInput): string[] {
  const question = input.question || ''
  const lines: Array<{ text: string; at: number; priority: number }> = []
  for (const book of input.books) {
    if (isUserBookId(book.bookId)) continue
    const statuses = input.coverage.get(book.bookId) || new Map<number, LabChapterStatus>()
    const open = book.bookId === input.openBookId
    if (book.bookId === 'bible') {
      const groups = bibleCoverageGroups(book.outline)
      if (groups.length === 0) {
        const all = [...statuses.keys()].sort((a, b) => a - b)
        const line = describeGroup({ name: book.title, biblical: false, complete: false, prefix: 'sequential chapters ', chapters: all, label: n => n }, statuses)
        if (line) lines.push({ ...line, priority: open || questionNames(question, 'bible') ? 1 : 0 })
        else if (open || questionNames(question, 'bible')) lines.push({ text: `${book.title}: no chapter records.`, at: 0, priority: 1 })
        continue
      }
      const bibleNamed = questionNames(question, 'bible')
      let any = false
      for (const group of groups) {
        const named = questionNames(question, group.name)
        const line = describeGroup(group, statuses)
        if (line) { any = true; lines.push({ ...line, priority: named ? 2 : open || bibleNamed ? 1 : 0 }) }
        else if (named) lines.push({ text: `The Bible, ${group.name}: no chapter records (${group.chapters.length} chapters).`, at: 0, priority: 2 })
      }
      if (!any && (open || bibleNamed)) lines.push({ text: `${book.title}: no chapter records.`, at: 0, priority: 1 })
      continue
    }
    const named = questionNames(question, book.title) || questionNames(question, book.bookId.replace(/-/g, ' '))
    // Without the book's chapter list the extent is unknown, never "all".
    const complete = Boolean(book.outline?.chapters.length)
    const chapters = complete
      ? book.outline!.chapters.map(chapter => chapter.number)
      : [...statuses.keys()].sort((a, b) => a - b)
    const line = describeGroup({ name: book.title, biblical: false, complete, chapters, label: n => n }, statuses)
    const priority = named ? 2 : open ? 1 : 0
    if (line) lines.push({ ...line, priority })
    else if (named || open) lines.push({ text: `${book.title}: no chapter records${complete ? ` (${chapters.length} chapters)` : ''}.`, at: 0, priority })
  }
  lines.sort((a, b) => b.priority - a.priority || b.at - a.at)
  const budget = input.maxChars ?? 3500
  const out: string[] = []
  let size = 0
  for (const line of lines) {
    if (size + line.text.length > budget) {
      out.push(`… ${lines.length - out.length} more books with records not listed.`)
      break
    }
    out.push(line.text)
    size += line.text.length + 1
  }
  return out
}

export const READING_COVERAGE_HEADER = 'Chapter coverage (the same records as the Contents menu): "finished" = the reader turned past the chapter\'s last page or heard it to the end; "in progress" = a recorded reading session or saved place there; "visited" = only a chat held there. Chapters are numbered within each book. Records can be incomplete (older devices, cleared data, reading before these records existed): a chapter without a record is unknown, not unread.'
