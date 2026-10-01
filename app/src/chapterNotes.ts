/**
 * Chapter notes: the short titled "beats" card behind Summarize ("so far"),
 * the chapter-end summary and Primer. Shared by the Worker route and the lab
 * client. Notes depend only on the text, so the Worker caches them for every
 * reader; the client keeps its own copies per book/edition/chapter/kind so a
 * reopen is instant and the notes can be reused elsewhere (they never enter
 * the chat feed).
 */
export const CHAPTER_NOTES_ROUTE = '/api/lab-chapter-notes'
export const CHAPTER_NOTES_PROMPT_VERSION = 'notes-v1'
export const CHAPTER_NOTES_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60

export type ChapterNotesKind = 'sofar' | 'end' | 'primer'
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
  return `${CHAPTER_NOTES_PROMPT_VERSION}/${input.bookId}/${input.editionKey}/${input.chapterNumber}/${input.kind}/${input.through ?? 'all'}`
}
