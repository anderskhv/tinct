/**
 * Client side of chapter notes (Summarize "so far", chapter-end summary,
 * Primer) and of stored explanations. Both are kept on this device under the
 * `tinct:` namespace (so sign-out wipes them) and never enter the chat feed;
 * they are stored so other surfaces can reuse them.
 */
import { CHAPTER_NOTES_ROUTE, chapterNotesCacheKey, parseChapterNotesBeats, type ChapterNotesBeat, type ChapterNotesRequest } from '../chapterNotes'

export const CHAPTER_NOTES_STORAGE_KEY = 'tinct:chapter-notes'
export const EXPLANATIONS_STORAGE_KEY = 'tinct:explanations'
const NOTES_MAX = 120
const EXPLANATIONS_MAX = 200

type FetchLike = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

function readMap<T>(key: string): Record<string, T> {
  try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' ? value as Record<string, T> : {} } catch { return {} }
}
function writeMap<T extends { at: number }>(key: string, map: Record<string, T>, max: number): void {
  const entries = Object.entries(map).sort((a, b) => b[1].at - a[1].at).slice(0, max)
  try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(entries))) } catch { /* full or private */ }
}

export function chapterNotesKey(request: ChapterNotesRequest): string {
  return chapterNotesCacheKey({ ...request, through: request.kind === 'sofar' ? request.paragraphIndex ?? 0 : null })
}

export function storedChapterNotes(request: ChapterNotesRequest): ChapterNotesBeat[] | null {
  const entry = readMap<{ beats: ChapterNotesBeat[]; at: number }>(CHAPTER_NOTES_STORAGE_KEY)[chapterNotesKey(request)]
  return entry ? parseChapterNotesBeats(entry) : null
}

export async function fetchChapterNotes(request: ChapterNotesRequest, options: { fetchImpl?: FetchLike } = {}): Promise<{ ok: true; beats: ChapterNotesBeat[] } | { ok: false; status: number }> {
  const stored = storedChapterNotes(request)
  if (stored) return { ok: true, beats: stored }
  const fetchImpl = options.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, status: 0 }
  try {
    const response = await fetchImpl(CHAPTER_NOTES_ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) })
    if (!response.ok) return { ok: false, status: response.status }
    const beats = parseChapterNotesBeats(await response.json())
    if (!beats) return { ok: false, status: response.status }
    const map = readMap<{ beats: ChapterNotesBeat[]; at: number }>(CHAPTER_NOTES_STORAGE_KEY)
    map[chapterNotesKey(request)] = { beats, at: Date.now() }
    writeMap(CHAPTER_NOTES_STORAGE_KEY, map, NOTES_MAX)
    return { ok: true, beats }
  } catch {
    return { ok: false, status: 0 }
  }
}

export interface StoredExplanation { bookId: string; chapterNumber: number; paragraphIndex: number; passage: string; answer: string; at: number }

/** Keep an explanation for reuse, outside the chat feed. Same passage → replaced. */
export function saveExplanation(entry: Omit<StoredExplanation, 'at'>, now = Date.now()): void {
  if (!entry.answer.trim() || !entry.passage.trim()) return
  const map = readMap<StoredExplanation>(EXPLANATIONS_STORAGE_KEY)
  map[`${entry.bookId}/${entry.chapterNumber}/${entry.paragraphIndex}/${entry.passage.slice(0, 120)}`] = { ...entry, at: now }
  writeMap(EXPLANATIONS_STORAGE_KEY, map, EXPLANATIONS_MAX)
}

export function chapterNotesText(title: string, beats: ChapterNotesBeat[]): string {
  return [title, ...beats.map(beat => `${beat.title}: ${beat.text}`)].join('\n')
}
