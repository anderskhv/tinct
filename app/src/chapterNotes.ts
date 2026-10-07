/**
 * Chapter notes: the short titled "beats" card behind Summarize ("so far"),
 * the chapter-end summary and Primer. Shared by the Worker route and the lab
 * client. Notes depend only on the text, so the Worker caches them for every
 * reader; the client keeps its own copies per book/edition/chapter/kind so a
 * reopen is instant and the notes can be reused elsewhere (they never enter
 * the chat feed).
 */
export const CHAPTER_NOTES_ROUTE = '/api/lab-chapter-notes'
export const CHAPTER_NOTES_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60

export type ChapterNotesKind = 'sofar' | 'end' | 'primer'

/**
 * Prompt version per kind, the first segment of every cache key (Worker and
 * device). Bump a kind's version when its prompt changes so cards written by
 * the old prompt are never served again; the other kinds keep their caches.
 * 2026-10-07: `end` v2 adds one text-grounded observation per beat, v3 is the
 * tested prompt on Sonnet; `primer` v2 is two beats on Sonnet (no "And").
 */
export const CHAPTER_NOTES_PROMPT_VERSIONS: Readonly<Record<ChapterNotesKind, string>> = Object.freeze({
  sofar: 'notes-v1',
  end: 'notes-v3',
  primer: 'notes-v2',
})
export interface ChapterNotesBeat { title: string; text: string }

export interface ChapterNotesRequest {
  bookId: string
  editionKey: string
  chapterNumber: number
  kind: ChapterNotesKind
  /** "So far" only: the paragraph the reader is in. */
  paragraphIndex?: number
  bookTitle?: string
}

export interface ChapterNotesResponse {
  beats: ChapterNotesBeat[]
  kind: ChapterNotesKind
  chapterNumber: number
  /** "So far": the last paragraph covered; null for whole-chapter kinds. */
  through: number | null
  source: 'cache' | 'model'
}

const MAX_BEATS = 4
const MAX_TITLE = 60
const MAX_TEXT = 320

/** Accepts `{beats:[{title,text}]}` with 1–4 non-empty beats; anything else is null. */
export function parseChapterNotesBeats(raw: unknown): ChapterNotesBeat[] | null {
  const list = raw && typeof raw === 'object' ? (raw as { beats?: unknown }).beats : null
  if (!Array.isArray(list)) return null
  const beats = list.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const { title, text } = item as Record<string, unknown>
    if (typeof title !== 'string' || typeof text !== 'string') return []
    const t = title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE)
    const x = text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)
    return t && x ? [{ title: t, text: x }] : []
  }).slice(0, MAX_BEATS)
  return beats.length ? beats : null
}

export function chapterNotesCacheKey(input: { bookId: string; editionKey: string; chapterNumber: number; kind: ChapterNotesKind; through?: number | null }): string {
  return `${CHAPTER_NOTES_PROMPT_VERSIONS[input.kind]}/${input.bookId}/${input.editionKey}/${input.chapterNumber}/${input.kind}/${input.through ?? 'all'}`
}
