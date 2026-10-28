import { usablePrimerResource } from '../bookPrimers/resources'
import { parsePrimerContent } from '../bookPrimers/parse'
import { type SavedPrimer, primerKey } from '../bookPrimers/model'
/**
 * Client side of chapter notes (Summarize "so far", chapter-end summary,
 * Primer) and of stored explanations. Both are kept on this device under the
 * `tinct:` namespace (so sign-out wipes them) and never enter the chat feed;
 * they are stored so other surfaces can reuse them.
 */
import { CHAPTER_NOTES_ROUTE, chapterNotesCacheKey, parseChapterNotesBeats, type ChapterNotesBeat, type ChapterNotesRequest } from '../chapterNotes'
import { internalTrafficHeaders } from '../utils/internalTraffic'
import { AI_ALLOWANCE_ENFORCED } from '../aiAllowanceSwitch'
import { allowanceAuthHeaders, isAllowanceUsedResponse } from './labAiAllowance'
import { AI_RESTING_ERROR_TYPE, labChatErrorType } from './labCompanion'

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

/**
 * `allowanceUsed`: refused because the reader's AI allowance is at zero (only while the switch is on).
 * `resting`: the daily AI ceiling or a provider limit (503 `ai_resting`); the card says so above Retry.
 */
export type ChapterNotesResult = { ok: true; beats: ChapterNotesBeat[]; primer?: SavedPrimer } | { ok: false; status: number; allowanceUsed?: true; resting?: true; sourceUnavailable?: true }

export async function fetchChapterNotes(request: ChapterNotesRequest, options: { fetchImpl?: FetchLike; readToken?: () => Promise<string | null> } = {}): Promise<ChapterNotesResult> {
  const stored = request.format ? null : storedChapterNotes(request)
  if (stored) return { ok: true, beats: stored }
  const fetchImpl = options.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, status: 0 }
  try {
    // The session goes along only while the AI allowance is on (labAiAllowance.ts).
    const token = AI_ALLOWANCE_ENFORCED && options.readToken ? await options.readToken().catch(() => null) : null
    const response = await fetchImpl(CHAPTER_NOTES_ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json', ...allowanceAuthHeaders(token), ...internalTrafficHeaders() }, body: JSON.stringify(request) })
    if (!response.ok) {
      if (await isAllowanceUsedResponse(response)) return { ok: false, status: response.status, allowanceUsed: true }
      if (response.status === 503 && await labChatErrorType(response) === AI_RESTING_ERROR_TYPE) return { ok: false, status: response.status, resting: true }
      if (response.status === 422) return { ok: false, status: 422, sourceUnavailable: true }
      return { ok: false, status: response.status }
    }
    const raw = await response.json()
    if (request.format === 'structured-primer') {
      const primer = (raw as { primer?: SavedPrimer })?.primer
      if (!primer || primer.identity.scope.kind !== 'public' || primer.identity.workId !== request.bookId || primer.identity.editionId !== request.editionKey || primer.identity.unitId !== (request.primerType === 'book' ? null : `chapter-${request.chapterNumber}`) || primer.identity.type !== (request.primerType || 'chapter') || primer.identity.language !== (request.language || 'en')) return { ok: false, status: 502 }
      primerKey(primer.identity)
      // Exact quotes were checked against server-owned source before this response.
      const topics = [primer.content.structure, primer.content.peopleAndIdeas, primer.content.helpfulContext, primer.content.whatToNotice, primer.content.usefulReferences].flat()
      const content = parsePrimerContent(JSON.stringify(primer.content))
      const beats = [{ title: 'Primer', text: content.opening }, ...topics.map(t => ({ title: t.title, text: [t.explanation, t.takeaway, ...(t.quotes ?? []).map(q => q.text)].filter(Boolean).join('\n\n') }))]
      return { ok: true, beats, primer: { ...primer, content, resources: Array.isArray(primer.resources) ? primer.resources.filter(usablePrimerResource).slice(0, 4) : [] } }
    }
    const beats = parseChapterNotesBeats(raw)
    if (!beats) return { ok: false, status: response.status }
    keepChapterNotes(request, beats)
    return { ok: true, beats }
  } catch {
    return { ok: false, status: 0 }
  }
}

/** Keep a chapter's notes on this device, so a reopen is instant (also an own book's: userBook/ownChapterNotes.ts). */
export function keepChapterNotes(request: ChapterNotesRequest, beats: ChapterNotesBeat[]): void {
  const map = readMap<{ beats: ChapterNotesBeat[]; at: number }>(CHAPTER_NOTES_STORAGE_KEY)
  map[chapterNotesKey(request)] = { beats, at: Date.now() }
  writeMap(CHAPTER_NOTES_STORAGE_KEY, map, NOTES_MAX)
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

/** The card as plain text for Copy: its title, then each beat's title and text, blocks separated by blank lines. */
export function chapterNotesPlainText(title: string, beats: ChapterNotesBeat[]): string {
  return [title, ...beats.map(beat => `${beat.title}\n${beat.text}`)].join('\n\n')
}
