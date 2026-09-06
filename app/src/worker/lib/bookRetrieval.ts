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

export type AssetsBinding = { fetch: (request: Request) => Promise<Response> }

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

export interface ToolOutcome {
  content: string
  isError?: boolean
}

export const READ_CHAPTER_MAX_CHARS = 6_000
export const FIND_MAX_MATCHES = 5
export const FIND_SCAN_CAP = 80
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
  const ref: BookRef = { bookId: value.bookId, editionKey: value.editionKey }
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
export function renderChapterForTool(chapter: ChapterText, maxChars = READ_CHAPTER_MAX_CHARS): string {
  const head = `Chapter ${chapter.number} — ${chapter.title}`
  const body = chapter.paragraphs
    .map((text, index) => `[${index + 1}] ${cleanParagraph(text)}`)
    .filter(line => line.length > 4)
    .join('\n\n')
  const full = `${head}\n\n${body}`
  if (full.length <= maxChars) return full
  const cut = full.slice(0, maxChars)
  const boundary = cut.lastIndexOf(' ')
  const kept = boundary > maxChars * 0.8 ? cut.slice(0, boundary) : cut
  return `${kept}\n\n[Trimmed: ${full.length - kept.length} more characters of this chapter were left out. Ask for a search with find_in_book if you need a later part.]`
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
  if (current != null) {
    push(current)
    const leaf = leafContaining(input.sections, current)
    if (leaf?.chapters) {
      // Walk the section outward from the current chapter so the nearest
      // chapters of the same book come first.
      const sorted = [...leaf.chapters].sort((a, b) => Math.abs(a - current) - Math.abs(b - current) || a - b)
      sorted.forEach(push)
    }
  }
  ;(input.trail ?? []).slice().reverse().forEach(push)
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
  matches: FindMatch[]
  scanned: { chapters: number; ofChapters: number; complete: boolean }
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
}

export function createBookRetrieval(input: {
  assets: AssetsBinding
  origin: string
  book: BookRef
  trailChapters?: number[]
}): BookRetrieval {
  const { assets, origin, book } = input
  const editionId = `${book.bookId}-${book.editionKey}`
  const chapterCache = new Map<number, ChapterText | null>()
  let indexPromise: Promise<EditionIndex | null> | null = null

  const fetchJson = async (path: string): Promise<unknown | null> => {
    try {
      const response = await assets.fetch(new Request(new URL(path, origin)))
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }

  const loadIndex = (): Promise<EditionIndex | null> => {
    if (indexPromise) return indexPromise
    const cached = indexCache.get(editionId)
    if (cached) {
      indexPromise = Promise.resolve(cached)
      return indexPromise
    }
    indexPromise = (async () => {
      const manifest = await fetchJson(`/data/editions-chapters/${editionId}/manifest.json`) as {
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
        rememberIndex(editionId, index)
        return index
      }
      const whole = await fetchJson(`/data/editions/${editionId}.json`) as { chapters?: unknown; sections?: unknown } | null
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
    })()
    return indexPromise
  }

  const loadChapter = async (chapterNumber: number): Promise<ChapterText | null> => {
    if (chapterCache.has(chapterNumber)) return chapterCache.get(chapterNumber) ?? null
    const pending = (async () => {
      const index = await loadIndex()
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

  const usage = 'read_chapter needs {"chapter": "<sequential number as digits or exact chapter label>"}.'
  const byLabel = async (label: string): Promise<{ chapterNumber: number } | { error: string }> => {
    const index = await loadIndex()
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
    async readChapter(rawInput: unknown): Promise<ToolOutcome> {
      const resolved = await resolveChapterNumber(rawInput)
      if ('error' in resolved) return { content: resolved.error, isError: true }
      const chapter = await loadChapter(resolved.chapterNumber)
      if (!chapter) {
        const index = await loadIndex()
        const total = index?.chapters.length
        return {
          content: total
            ? `Chapter ${resolved.chapterNumber} is not in this edition (it has ${total} chapters).`
            : 'The book text is not available right now.',
          isError: true,
        }
      }
      return { content: renderChapterForTool(chapter) }
    },

    async findInBook(rawInput: unknown): Promise<ToolOutcome> {
      const query = normalizeQuery(rawInput && typeof rawInput === 'object' ? (rawInput as { query?: unknown }).query : rawInput)
      if (!query) return { content: 'find_in_book needs {"query": "<two or more characters>"}.', isError: true }
      const index = await loadIndex()
      if (!index) return { content: 'The book text is not available right now.', isError: true }
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
        while (cursor < order.length && matches.length < FIND_MAX_MATCHES) {
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
        matches: matches.slice(0, FIND_MAX_MATCHES),
        scanned: {
          chapters: scanned,
          ofChapters: index.chapters.length,
          complete: scanned >= index.chapters.length || matches.length >= FIND_MAX_MATCHES,
        },
      }
      return { content: JSON.stringify(result) }
    },
  }
}
