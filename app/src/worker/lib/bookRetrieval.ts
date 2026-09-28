/**
 * In-book retrieval for the reading companion.
 *
 * The companion's system prompt carries only the chapter in front of the
 * reader. When they ask about something earlier ("how did Jeremiah get out of
 * prison?" while reading Jeremiah 37), the model needs to read chapters 32–33
 * or search the book. These helpers back the `read_chapter` and
 * `find_in_book` tools served by `/api/chat` and `/api/lab-chat`.
 *
 * Edition data is read through the Worker's static asset binding:
 * `/data/editions-chapters/{bookId}-{editionKey}/chNNNN.json` (sharded) or,
 * for editions that are not sharded, `/data/editions/{bookId}-{editionKey}.json`.
 * Work is bounded: a chapter is trimmed to READ_CHAPTER_MAX_CHARS, a search
 * scans at most FIND_SCAN_CAP chapters, nearest-first, and stops at
 * FIND_MAX_MATCHES hits.
 */

import { isEditionWithheld, migrateWithheldEdition } from '../../data/withheldEditions'

export type AssetsBinding = { fetch: (request: Request) => Promise<Response> }

/**
 * Editions to try when the requested one has no text on disk.
 *
 * A withdrawn edition names its successor in `withheldEditions`, and that is
 * tried first. Everything after it is the conventional key set this library
 * uses, so a client that asks for an edition this book never had (a stale
 * preference, a renamed key) still gets the book rather than a dead round.
 * Probing is one asset fetch per candidate and only happens when the
 * requested edition is genuinely missing.
 */
export const RETRIEVAL_FALLBACK_EDITION_KEYS = ['original-en', 'bsb-en', 'kjv-en', 'web-en', 'modern-en'] as const

/** The requested edition first (successor-migrated), then the generic fallbacks. */
export function editionCandidates(book: BookRef): string[] {
  const candidates = [migrateWithheldEdition(book.bookId, book.editionKey)]
  for (const key of RETRIEVAL_FALLBACK_EDITION_KEYS) {
    if (candidates.includes(key)) continue
    if (isEditionWithheld(book.bookId, key)) continue
    candidates.push(key)
  }
  return candidates
}

/**
 * What the model is told when no edition of this book can be read. It is not a
 * tool error: the companion still has the chapter in front of the reader in its
 * system prompt, so it must answer from that and say what it could not check.
 * Reporting this as an error collapses the turn and the client then latches the
 * Ask panel into "unavailable".
 */
export const NO_EDITION_NOTICE =
  'The exact edition text could not be loaded for this request. Answer the question using your reliable general knowledge and the supplied context. Do not give a routine missing-context disclaimer. If the reader needs an exact quotation or verification, state that specific limit without inventing wording or a source check.'

export interface BookRef {
  bookId: string
  editionKey: string
  chapterNumber?: number
}

export interface ChapterText {
  number: number
  title: string
  paragraphs: string[]
}

export interface ChapterEntry {
  number: number
  title: string
  path?: string
}

export interface SectionNode {
  title?: string
  chapters?: number[]
  sections?: SectionNode[]
}

export interface EditionIndex {
  chapters: ChapterEntry[]
  sections?: SectionNode[]
  /** Set when the edition is a single whole-book JSON (not chapter-sharded). */
  whole?: Map<number, ChapterText>
}

/** An index plus which edition actually served it. */
export interface ResolvedEditionIndex {
  index: EditionIndex
  editionKey: string
  /** True when the requested edition had no text and another one was read instead. */
  substituted: boolean
}

export interface ToolOutcome {
  content: string
  isError?: boolean
}

export const READ_CHAPTER_MAX_CHARS = 6_000
export const FIND_MAX_MATCHES = 5
/**
 * Chapters one search may look at, nearest-first.
 *
 * This was 80, which only ever bit in the Bible: every other book has fewer
 * chapters than the cap, so the whole book was searched in well under a dozen
 * fetches. In the Bible a query with no hits near the reader walked all 80
 * shards — 81 asset subrequests in a single Worker request, measured against
 * the shipped edition — which is over Cloudflare's 50-subrequest limit on the
 * Workers Free plan. Past that limit every later `fetch` in the same request
 * throws, including the tool loop's own call back to Anthropic, so the whole
 * turn died and the client showed "Ask is unavailable right now". A search
 * whose answer was near the reader (a recap, a name in the current book)
 * finished in 8 chapters and worked, which is why it looked intermittent.
 */
export const FIND_SCAN_CAP = 24

/**
 * Asset subrequests one retrieval may spend, across every tool call in the
 * request. The rest of the Worker's budget belongs to the tool loop's calls to
 * Anthropic (up to MAX_TOOL_ROUNDS + 1) — running out there is what turns a
 * bounded search into a dead turn, so retrieval stops well short.
 */
export const RETRIEVAL_ASSET_BUDGET = 32
export const FIND_SNIPPET_CHARS = 280
export const FIND_QUERY_MAX_CHARS = 120
export const TRAIL_MAX_CHAPTERS = 10
const FIND_CONCURRENCY = 6
const MAX_CHAPTER_NUMBER = 10_000
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/

function isChapterNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_CHAPTER_NUMBER
}

/** `book` from the request body. Anything malformed disables the tools rather than failing the chat. */
export function parseBookRef(raw: unknown): BookRef | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  if (typeof value.bookId !== 'string' || !ID_PATTERN.test(value.bookId)) return null
  if (typeof value.editionKey !== 'string' || !ID_PATTERN.test(value.editionKey)) return null
  // A client that kept a withdrawn edition in its preferences must not be able
  // to aim retrieval at text that is no longer served.
  const ref: BookRef = {
    bookId: value.bookId,
    editionKey: migrateWithheldEdition(value.bookId, value.editionKey),
  }
  if (isChapterNumber(value.chapterNumber)) ref.chapterNumber = value.chapterNumber
  return ref
}

/** Chapter numbers from the client's `readingTrail`; used only to order the search. */
export function parseReadingTrailChapters(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const chapters: number[] = []
  for (const item of raw) {
    const chapterNumber = item && typeof item === 'object'
      ? (item as { chapterNumber?: unknown }).chapterNumber
      : item
    if (isChapterNumber(chapterNumber) && !chapters.includes(chapterNumber)) chapters.push(chapterNumber)
    if (chapters.length >= TRAIL_MAX_CHAPTERS) break
  }
  return chapters
}

export function chapterShardPath(chapterNumber: number): string {
  return `ch${String(chapterNumber).padStart(4, '0')}.json`
}

function cleanParagraph(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Numbered paragraphs, trimmed to the cap with a note so the model knows it saw a part. */
export function renderChapterForTool(chapter: ChapterText, maxChars = READ_CHAPTER_MAX_CHARS, startParagraph = 1, startOffset = 0): string {
  const head = `Chapter ${chapter.number} — ${chapter.title}`
  let result = head + '\n\n'
  for (let index = startParagraph - 1; index < chapter.paragraphs.length; index++) {
    const fullText = cleanParagraph(chapter.paragraphs[index])
    const offset = index === startParagraph - 1 ? startOffset : 0
    const text = fullText.slice(offset)
    if (!text) continue
    const line = `[${index + 1}] ${text}`
    // Keep paragraph boundaries so a continuation never drops half a paragraph.
    if (result.length + line.length > maxChars && result.length > head.length + 2) {
      return `${result.trimEnd()}\n\n[Trimmed: continue read_chapter with chapter "${chapter.number}" and start_paragraph ${index + 1}.]`
    }
    if (result.length + line.length > maxChars) {
      const take = Math.max(1, maxChars - result.length - `[${index + 1}] `.length)
      return `${result}[${index + 1}] ${text.slice(0, take)}\n\n[Trimmed: continue read_chapter with chapter "${chapter.number}", start_paragraph ${index + 1}, and start_offset ${offset + take}.]`
    }
    result += line + '\n\n'
  }
  return result.trimEnd()
}

function leafContaining(sections: SectionNode[] | undefined, chapterNumber: number): SectionNode | null {
  if (!sections) return null
  for (const node of sections) {
    if (Array.isArray(node.chapters) && node.chapters.includes(chapterNumber)) return node
    const nested = leafContaining(node.sections, chapterNumber)
    if (nested) return nested
  }
  return null
}

/**
 * Nearest-first scan order: the current chapter's own section (a biblical
 * book), the chapters on the reader's trail, then outward from the current
 * chapter. Deterministic and capped so a 1,189-chapter Bible never becomes a
 * full scan.
 */
export function findScanOrder(input: {
  chapters: number[]
  current?: number
  trail?: number[]
  sections?: SectionNode[]
  cap?: number
}): number[] {
  const cap = input.cap ?? FIND_SCAN_CAP
  const known = new Set(input.chapters)
  const order: number[] = []
  const push = (chapterNumber: number) => {
    if (order.length >= cap) return
    if (!known.has(chapterNumber) || order.includes(chapterNumber)) return
    order.push(chapterNumber)
  }
  const current = input.current
  if (current != null) push(current)
  // The trail comes before the rest of the section. Under a cap small enough
  // to keep one search inside the Worker's subrequest budget, a long section
  // (Jeremiah is 52 chapters) would otherwise fill the whole scan and the
  // chapters the reader actually visited would never be looked at.
  ;(input.trail ?? []).slice().reverse().forEach(push)
  if (current != null) {
    const leaf = leafContaining(input.sections, current)
    if (leaf?.chapters) {
      // Walk the section outward from the current chapter so the nearest
      // chapters of the same book come first.
      const sorted = [...leaf.chapters].sort((a, b) => Math.abs(a - current) - Math.abs(b - current) || a - b)
      sorted.forEach(push)
    }
  }
  if (current != null) {
    const sorted = [...input.chapters].sort((a, b) => Math.abs(a - current) - Math.abs(b - current) || a - b)
    for (const chapterNumber of sorted) {
      if (order.length >= cap) break
      push(chapterNumber)
    }
  } else {
    for (const chapterNumber of input.chapters) {
      if (order.length >= cap) break
      push(chapterNumber)
    }
  }
  return order
}

/** Snippet around the first match, cut at word boundaries. */
export function snippetAround(text: string, index: number, queryLength: number, maxChars = FIND_SNIPPET_CHARS): string {
  const clean = text
  if (clean.length <= maxChars) return clean
  const half = Math.max(0, Math.floor((maxChars - queryLength) / 2))
  let start = Math.max(0, index - half)
  let end = Math.min(clean.length, index + queryLength + half)
  if (start > 0) {
    const boundary = clean.indexOf(' ', start)
    if (boundary !== -1 && boundary < index) start = boundary + 1
  }
  if (end < clean.length) {
    const boundary = clean.lastIndexOf(' ', end)
    if (boundary > index + queryLength) end = boundary
  }
  return `${start > 0 ? '…' : ''}${clean.slice(start, end).trim()}${end < clean.length ? '…' : ''}`
}

function normalizeQuery(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const query = raw.replace(/\s+/g, ' ').trim()
  if (query.length < 2) return null
  return query.slice(0, FIND_QUERY_MAX_CHARS)
}

export interface FindMatch {
  chapterNumber: number
  label: string
  paragraph: number
  text: string
}

export interface FindResult {
  query: string
  /** Present only when the requested edition was unavailable and another one was searched. */
  edition?: string
  editionNote?: string
  matches: FindMatch[]
  scanned: { chapters: number; ofChapters: number; complete: boolean }
  /** Set when the scan was bounded, so the model can say what it did not cover. */
  note?: string
}

/** Case-insensitive substring search over one chapter, at most two hits per chapter. */
export function matchesInChapter(chapter: ChapterText, query: string, perChapter = 2): FindMatch[] {
  const needle = query.toLowerCase()
  const hits: FindMatch[] = []
  for (let index = 0; index < chapter.paragraphs.length; index++) {
    const text = cleanParagraph(chapter.paragraphs[index] || '')
    const at = text.toLowerCase().indexOf(needle)
    if (at === -1) continue
    hits.push({
      chapterNumber: chapter.number,
      label: chapter.title,
      paragraph: index + 1,
      text: snippetAround(text, at, needle.length),
    })
    if (hits.length >= perChapter) break
  }
  return hits
}

// Manifests are small (chapter numbers and titles) and identical for every
// reader of an edition, so a few live across requests inside the isolate.
const indexCache = new Map<string, EditionIndex>()
const INDEX_CACHE_MAX = 6

export function resetBookRetrievalCache(): void {
  indexCache.clear()
}

function rememberIndex(key: string, index: EditionIndex): void {
  if (index.whole) return // whole-book data can be megabytes; never keep it across requests
  if (indexCache.size >= INDEX_CACHE_MAX) {
    const oldest = indexCache.keys().next().value
    if (oldest !== undefined) indexCache.delete(oldest)
  }
  indexCache.set(key, index)
}

function parseChapterText(value: unknown, fallbackNumber: number): ChapterText | null {
  if (!value || typeof value !== 'object') return null
  const record = value as { number?: unknown; title?: unknown; paragraphs?: unknown }
  if (!Array.isArray(record.paragraphs)) return null
  const paragraphs = record.paragraphs.filter((item): item is string => typeof item === 'string')
  const number = isChapterNumber(record.number) ? record.number : fallbackNumber
  const title = typeof record.title === 'string' && record.title.trim() ? record.title : `Chapter ${number}`
  return { number, title, paragraphs }
}

export interface BookRetrieval {
  readChapter(input: unknown): Promise<ToolOutcome>
  findInBook(input: unknown): Promise<ToolOutcome>
  /** The raw chapter (untrimmed paragraphs) for server-side callers such as the recap summary; null when the edition lacks it. */
  chapterText(chapterNumber: number): Promise<ChapterText | null>
}

export function createBookRetrieval(input: {
  assets: AssetsBinding
  origin: string
  book: BookRef
  trailChapters?: number[]
}): BookRetrieval {
  const { assets, origin, book } = input
  const requestedEditionId = `${book.bookId}-${book.editionKey}`
  const chapterCache = new Map<number, ChapterText | null>()
  let indexPromise: Promise<ResolvedEditionIndex | null> | null = null
  let wholePromise: Promise<Map<number, ChapterText> | null> | null = null
  /** Set once an edition resolves; every chapter read uses the edition that actually loaded. */
  let editionId = requestedEditionId

  let assetFetches = 0
  const budgetSpent = () => assetFetches >= RETRIEVAL_ASSET_BUDGET

  const fetchJson = async (path: string): Promise<unknown | null> => {
    if (budgetSpent()) return null
    assetFetches += 1
    try {
      const response = await assets.fetch(new Request(new URL(path, origin)))
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }

  const loadEditionIndex = async (id: string): Promise<EditionIndex | null> => {
    const cached = indexCache.get(id)
    if (cached) return cached
    {
      const manifest = await fetchJson(`/data/editions-chapters/${id}/manifest.json`) as {
        chapters?: unknown
        sections?: unknown
      } | null
      if (manifest && Array.isArray(manifest.chapters) && manifest.chapters.length > 0) {
        const chapters: ChapterEntry[] = []
        for (const raw of manifest.chapters) {
          const entry = raw as { number?: unknown; title?: unknown; path?: unknown }
          if (!isChapterNumber(entry.number)) continue
          chapters.push({
            number: entry.number,
            title: typeof entry.title === 'string' ? entry.title : `Chapter ${entry.number}`,
            path: typeof entry.path === 'string' ? entry.path : undefined,
          })
        }
        const index: EditionIndex = {
          chapters,
          sections: Array.isArray(manifest.sections) ? manifest.sections as SectionNode[] : undefined,
        }
        rememberIndex(id, index)
        return index
      }
      const whole = await fetchJson(`/data/editions/${id}.json`) as { chapters?: unknown; sections?: unknown } | null
      if (!whole || !Array.isArray(whole.chapters)) return null
      const map = new Map<number, ChapterText>()
      const chapters: ChapterEntry[] = []
      whole.chapters.forEach((raw, position) => {
        const chapter = parseChapterText(raw, position + 1)
        if (!chapter) return
        map.set(chapter.number, chapter)
        chapters.push({ number: chapter.number, title: chapter.title })
      })
      if (chapters.length === 0) return null
      return { chapters, sections: Array.isArray(whole.sections) ? whole.sections as SectionNode[] : undefined, whole: map }
    }
  }

  /**
   * The first candidate edition that actually has text. A reader whose stored
   * edition was withdrawn (or never existed) still gets the book: retrieval
   * degrades to an available edition instead of failing the round. Tinct's
   * editions are paragraph-aligned, so chapter N is the same passage either way.
   */
  const loadIndex = (): Promise<ResolvedEditionIndex | null> => {
    if (indexPromise) return indexPromise
    indexPromise = (async () => {
      for (const key of editionCandidates(book)) {
        const id = `${book.bookId}-${key}`
        const index = await loadEditionIndex(id)
        if (!index) continue
        editionId = id
        return { index, editionKey: key, substituted: id !== requestedEditionId }
      }
      return null
    })()
    return indexPromise
  }

  /** The index alone, for the many call sites that do not care which edition served it. */
  const loadIndexOnly = async (): Promise<EditionIndex | null> => (await loadIndex())?.index ?? null

  /** Prefix telling the model it is reading a stand-in for the edition it asked for. */
  const substitutionNote = (resolved: ResolvedEditionIndex): string => (
    resolved.substituted
      ? `[The ${book.editionKey} edition of this book is no longer available. This is the ${resolved.editionKey} edition, paragraph-aligned with it.]\n\n`
      : ''
  )

  const loadChapter = async (chapterNumber: number): Promise<ChapterText | null> => {
    if (chapterCache.has(chapterNumber)) return chapterCache.get(chapterNumber) ?? null
    const pending = (async () => {
      const index = await loadIndexOnly()
      if (!index) return null
      const entry = index.chapters.find(item => item.number === chapterNumber)
      if (!entry) return null
      if (index.whole) return index.whole.get(chapterNumber) ?? null
      const data = await fetchJson(`/data/editions-chapters/${editionId}/${entry.path || chapterShardPath(chapterNumber)}`)
      const chapter = parseChapterText(data, chapterNumber)
      if (!chapter) return null
      return { ...chapter, number: chapterNumber, title: chapter.title || entry.title }
    })()
    const chapter = await pending
    chapterCache.set(chapterNumber, chapter)
    return chapter
  }

  // One static asset request replaces hundreds of chapter-shard requests for
  // global search. Keep this map only for this request, never in isolate cache.
  const loadWhole = async (): Promise<Map<number, ChapterText> | null> => {
    const index = await loadIndexOnly()
    if (index?.whole) return index.whole
    if (!wholePromise) wholePromise = (async () => {
      const data = await fetchJson(`/data/editions/${editionId}.json`) as { chapters?: unknown[] } | null
      if (!Array.isArray(data?.chapters)) return null
      const map = new Map<number, ChapterText>()
      data.chapters.forEach((raw, i) => {
        const chapter = parseChapterText(raw, i + 1)
        if (chapter) map.set(chapter.number, chapter)
      })
      // A stale whole edition must not quietly reintroduce chapter-number drift.
      if (!index || index.chapters.some(entry => map.get(entry.number)?.title !== entry.title)) return null
      return map.size ? map : null
    })()
    return wholePromise
  }

  const usage = 'read_chapter needs {"chapter": "<sequential number as digits or exact chapter label>"}.'
  const byLabel = async (label: string): Promise<{ chapterNumber: number } | { error: string }> => {
    const index = await loadIndexOnly()
    const wanted = label.replace(/\s+/g, ' ').trim().toLowerCase()
    const entry = index?.chapters.find(item => item.title.replace(/\s+/g, ' ').trim().toLowerCase() === wanted)
    if (!entry) return { error: `No chapter titled "${label.trim()}" in this edition. Pass the sequential chapter number as digits instead.` }
    return { chapterNumber: entry.number }
  }
  const resolveChapterNumber = async (raw: unknown): Promise<{ chapterNumber: number } | { error: string }> => {
    if (!raw || typeof raw !== 'object') return { error: usage }
    const value = raw as { chapter?: unknown; chapterNumber?: unknown; label?: unknown }
    if (typeof value.chapter === 'string' && value.chapter.trim()) {
      const text = value.chapter.trim()
      if (/^\d+$/.test(text)) {
        const chapterNumber = Number(text)
        if (!isChapterNumber(chapterNumber)) return { error: 'chapter must be a positive integer within this edition, or an exact chapter label.' }
        return { chapterNumber }
      }
      return byLabel(text)
    }
    if (typeof value.chapter === 'number') {
      if (!isChapterNumber(value.chapter)) return { error: 'chapter must be a positive integer within this edition, or an exact chapter label.' }
      return { chapterNumber: value.chapter }
    }
    // Lenient aliases, in case the model ignores the strict schema.
    if (value.chapterNumber !== undefined) {
      const chapterNumber = typeof value.chapterNumber === 'string' ? Number(value.chapterNumber) : value.chapterNumber
      if (!isChapterNumber(chapterNumber)) return { error: 'chapterNumber must be a positive integer.' }
      return { chapterNumber }
    }
    if (typeof value.label === 'string' && value.label.trim()) return byLabel(value.label)
    return { error: usage }
  }

  return {
    chapterText: loadChapter,

    async readChapter(rawInput: unknown): Promise<ToolOutcome> {
      const resolved = await resolveChapterNumber(rawInput)
      if ('error' in resolved) return { content: resolved.error, isError: true }
      const options = rawInput as { through?: unknown; start_paragraph?: unknown; start_offset?: unknown }
      const end = options.through == null ? resolved : await resolveChapterNumber({ chapter: options.through })
      if ('error' in end) return { content: end.error, isError: true }
      const start = options.start_paragraph ?? 1
      if (!Number.isInteger(start) || (start as number) < 1) return { content: 'start_paragraph must be a positive integer.', isError: true }
      const offset = options.start_offset ?? 0
      if (!Number.isInteger(offset) || (offset as number) < 0) return { content: 'start_offset must be a nonnegative integer.', isError: true }
      const edition = await loadIndex()
      if (!edition) return { content: NO_EDITION_NOTICE }
      const entries = edition.index.chapters
      const from = entries.findIndex(c => c.number === resolved.chapterNumber)
      const to = entries.findIndex(c => c.number === end.chapterNumber)
      if (from < 0 || to < from) return { content: `Invalid chapter range in this edition (it has ${entries.length} chapters).`, isError: true }
      if (to - from >= 14) return { content: 'Read at most 14 chapters per call; continue with the next range.', isError: true }
      const selected = entries.slice(from, to + 1)
      const chapters = await Promise.all(selected.map(entry => loadChapter(entry.number)))
      const output: string[] = []
      let used = 0
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i]
        if (!chapter) { output.push(`[Could not load ${selected[i].title}; do not invent its contents.]`); continue }
        if (i === 0 && (start as number) > chapter.paragraphs.length) return { content: 'start_paragraph is beyond the end of this chapter.', isError: true }
        const text = renderChapterForTool(chapter, READ_CHAPTER_MAX_CHARS, i === 0 ? start as number : 1, i === 0 ? offset as number : 0)
        if (used + text.length > 48_000) {
          output.push(`[Range continues: call read_chapter from "${chapter.title}" through "${selected.at(-1)!.title}".]`)
          break
        }
        output.push(text); used += text.length
      }
      return { content: substitutionNote(edition) + output.join('\n\n') }
    },

    async findInBook(rawInput: unknown): Promise<ToolOutcome> {
      const query = normalizeQuery(rawInput && typeof rawInput === 'object' ? (rawInput as { query?: unknown }).query : rawInput)
      if (!query) return { content: 'find_in_book needs {"query": "<two or more characters>"}.', isError: true }
      const edition = await loadIndex()
      if (!edition) return { content: NO_EDITION_NOTICE }
      const index = edition.index
      const whole = await loadWhole()
      if (whole) {
        const chapters = [...whole.values()].sort((a, b) => a.number - b.number)
        const matches: FindMatch[] = []
        let matchCount = 0
        for (const chapter of chapters) {
          const hits = matchesInChapter(chapter, query)
          matchCount += hits.length
          if (matches.length < FIND_MAX_MATCHES) matches.push(...hits.slice(0, FIND_MAX_MATCHES - matches.length))
        }
        return { content: JSON.stringify({ query, edition: edition.editionKey,
          ...(edition.substituted ? { editionNote: substitutionNote(edition).trim() } : {}),
          matches, scanned: { chapters: chapters.length, ofChapters: index.chapters.length, complete: chapters.length >= index.chapters.length },
          note: `Searched the available whole edition. Showing the first ${matches.length} matching passages in book order; at least ${matchCount} matching passages found. Do not reveal later developments unless requested.`,
        }) }
      }
      const order = findScanOrder({
        chapters: index.chapters.map(item => item.number),
        current: book.chapterNumber,
        trail: input.trailChapters,
        sections: index.sections,
        cap: index.whole ? index.chapters.length : FIND_SCAN_CAP,
      })
      const matches: FindMatch[] = []
      let scanned = 0
      let cursor = 0
      const worker = async () => {
        while (cursor < order.length && matches.length < FIND_MAX_MATCHES && !budgetSpent()) {
          const chapterNumber = order[cursor++]
          const chapter = await loadChapter(chapterNumber)
          scanned += 1
          if (!chapter) continue
          for (const hit of matchesInChapter(chapter, query)) {
            if (matches.length >= FIND_MAX_MATCHES) break
            matches.push(hit)
          }
        }
      }
      await Promise.all(Array.from({ length: Math.min(FIND_CONCURRENCY, order.length) }, worker))
      matches.sort((a, b) => a.chapterNumber - b.chapterNumber || a.paragraph - b.paragraph)
      const result: FindResult = {
        query,
        ...(edition.substituted
          ? { edition: edition.editionKey, editionNote: `The ${book.editionKey} edition is no longer available; searched the paragraph-aligned ${edition.editionKey} edition instead.` }
          : {}),
        matches: matches.slice(0, FIND_MAX_MATCHES),
        scanned: {
          chapters: scanned,
          ofChapters: index.chapters.length,
          complete: scanned >= index.chapters.length,
        },
      }
      // A partial search is a real answer, not a failure. Say so plainly so the
      // model answers from what it found and from the chapter it already has,
      // and tells the reader what it could not cover.
      if (!result.scanned.complete) {
        result.note = matches.length > 0
          ? `Searched the ${scanned} chapters nearest the reader, not the whole book. There may be more elsewhere.`
          : `Searched the ${scanned} chapters nearest the reader and found nothing; this book has ${index.chapters.length} chapters, so the whole book was not covered. Answer from the chapter in front of you and from what you know, and say you could not search the whole book.`
      }
      return { content: JSON.stringify(result) }
    },
  }
}
