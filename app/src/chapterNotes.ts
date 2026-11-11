/**
 * Chapter notes: the short titled "beats" card behind Summarize ("so far"),
 * the chapter-end summary and Primer. Shared by the Worker route and the lab
 * client. Notes depend only on the text, so the Worker caches them for every
 * reader; the client keeps its own copies per book/edition/chapter/kind so a
 * reopen is instant and the notes can be reused elsewhere (they never enter
 * the chat feed).
 */
import { aiPrefsSignature, type AiRequestPrefs } from './aiSettings'

export const CHAPTER_NOTES_ROUTE = '/api/lab-chapter-notes'
export const CHAPTER_NOTES_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60

export type ChapterNotesKind = 'sofar' | 'end' | 'primer'

/**
 * Prompt version per kind, the first segment of every cache key (Worker and
 * device). Bump a kind's version when its prompt changes so cards written by
 * the old prompt are never served again; the other kinds keep their caches.
 * 2026-10-07: `end` v2 adds one text-grounded observation per beat, v3 is the
 * tested prompt on Sonnet; `primer` v2 is two beats on Sonnet (no "And").
 * 2026-10-08: `primer` v3 prepares the reader (why the chapter is interesting,
 * what to expect, what to watch for), at most one line on what came before.
 * 2026-10-14: every kind bumped once: a beat longer than the old 320-character
 * cap was cut mid-word ("muttered self-a"); those cached notes are rewritten.
 * 2026-11-11: `primer` prompt v4 (key notes-v5): the chapter's role in its book, how it
 * is built, then "Watch for" (three beats; v3 was why it is interesting + "Watch for").
 * A reader's own book's Primer cards (userBook/ownChapterNotes.ts, the companion's v5 own-book
 * primer with the same three parts) are kept on the device under this key too, so notes-v5 also
 * retires the own-book cards made by the earlier gist-and-sections primer.
 */
export const CHAPTER_NOTES_PROMPT_VERSIONS: Readonly<Record<ChapterNotesKind, string>> = Object.freeze({
  sofar: 'notes-v2',
  end: 'notes-v4',
  primer: 'notes-v5',
})
/** `items`: a beat that is a list (a Primer's people, terms, threads), one entry a line; `text` is them joined. */
export interface ChapterNotesBeat { title: string; text: string; items?: string[] }

export interface ChapterNotesRequest {
  bookId: string
  editionKey: string
  chapterNumber: number
  kind: ChapterNotesKind
  /** "So far" only: the paragraph the reader is in. */
  paragraphIndex?: number
  bookTitle?: string
  /**
   * The reader's AI settings for this card (aiSettings.ts): Summary's row for
   * "so far" and "in brief", Primer's for a primer. A card with settings is
   * the reader's own: its cache key carries them (chapterNotesCacheKey).
   */
  ai?: AiRequestPrefs
}

export interface ChapterNotesResponse {
  beats: ChapterNotesBeat[]
  kind: ChapterNotesKind
  chapterNumber: number
  /** "So far": the last paragraph covered; null for whole-chapter kinds. */
  through: number | null
  source: 'cache' | 'model'
}

/** A card keeps at most four beats, whatever length the reader set (Detailed is the prompt as written). */
const MAX_BEATS = 4
const MAX_TITLE = 60
// The prompts ask for 35–45 words; this only guards against a runaway answer.
const MAX_TEXT = 700

/** Text within `max` characters, never cut mid-word: at the last sentence end, else the last word. */
export function clipBeatText(text: string, max = MAX_TEXT): string {
  if (text.length <= max) return text
  const head = text.slice(0, max)
  let end = -1
  for (const match of head.matchAll(/[.!?]["'”’)]?(?=\s)/g)) end = match.index + match[0].length
  if (end > max / 2) return head.slice(0, end)
  const word = head.lastIndexOf(' ')
  return `${(word > 0 ? head.slice(0, word) : head).replace(/[\s,;:—–-]+$/, '')}…`
}

/** Accepts `{beats:[{title,text}]}` with 1–4 non-empty beats; anything else is null. */
export function parseChapterNotesBeats(raw: unknown, maxBeats = MAX_BEATS): ChapterNotesBeat[] | null {
  const list = raw && typeof raw === 'object' ? (raw as { beats?: unknown }).beats : null
  if (!Array.isArray(list)) return null
  const beats = list.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const { title, text } = item as Record<string, unknown>
    if (typeof title !== 'string' || typeof text !== 'string') return []
    const t = title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE)
    const x = clipBeatText(text.replace(/\s+/g, ' ').trim())
    return t && x ? [{ title: t, text: x }] : []
  }).slice(0, maxBeats)
  return beats.length ? beats : null
}

export function chapterNotesCacheKey(input: { bookId: string; editionKey: string; chapterNumber: number; kind: ChapterNotesKind; through?: number | null; ai?: AiRequestPrefs }): string {
  // One shared card per shorter length (Standard, Brief); a reader with instructions has their own; Detailed and
  // a request that names no length share the key the cards always had.
  const prefs = aiPrefsSignature(input.ai)
  return `${CHAPTER_NOTES_PROMPT_VERSIONS[input.kind]}/${input.bookId}/${input.editionKey}/${input.chapterNumber}/${input.kind}/${input.through ?? 'all'}${prefs ? `/${prefs}` : ''}`
}
