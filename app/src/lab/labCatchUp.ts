/**
 * Client side of "Catch me up": fetching one timeline entry, the order in
 * which entries are fetched, and a per-tab memory of what came back so
 * reopening the sheet costs nothing. Nothing here touches the DOM.
 */
import { CATCH_UP_ROUTE, catchUpBeforePlace, type CatchUpEntry, type CatchUpResponse } from '../catchUp'
import { isUsableRecapSummary } from '../recapSummary'
import { requestLabRecapSummary } from '../preReader/recapSummaryClient'
import { internalTrafficHeaders } from '../utils/internalTraffic'
import { allowanceAuthHeaders, isAllowanceUsedResponse } from './labAiAllowance'
import { AI_RESTING_ERROR_TYPE, labChatErrorType } from './labCompanion'

/** Requests in flight at once. The oldest entries go first, in reading order. */
export const CATCH_UP_CONCURRENCY = 3
/** Without a scroll observer, the first few entries are the ones on screen. */
export const CATCH_UP_INITIAL_WANTED = 5
/** After a rate limit or a resting AI, wait this long before asking again on our own. */
export const CATCH_UP_COOLDOWN_MS = 20_000

export type CatchUpEntryResult =
  | { ok: true; summary: string }
  /**
   * `empty`: nothing to summarise there yet; the sheet leaves the entry out instead of offering Retry.
   * `allowanceUsed`: refused because the reader's AI allowance is at zero (only while the switch is on).
   * `resting`: the daily AI ceiling or a provider limit (503 `ai_resting`); the entry says so above Retry.
   * `beyond`: the entry, or what came back for it, reaches the reader's place; it is never shown (and never asked for).
   */
  | { ok: false; status: number; empty?: boolean; allowanceUsed?: true; resting?: true; beyond?: true }

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

const memory = new Map<string, string>()
const MEMORY_MAX = 400

export function catchUpMemoryKey(entry: CatchUpEntry): string {
  const request = entry.request
  return `${request.bookId}/${request.editionKey}/${entry.key}`
}

export function rememberedCatchUp(entry: CatchUpEntry): string | null {
  const summary = memory.get(catchUpMemoryKey(entry))
  return isUsableRecapSummary(summary) ? summary : null
}

export function resetCatchUpMemory(): void {
  memory.clear()
}

function remember(entry: CatchUpEntry, summary: string): void {
  if (!isUsableRecapSummary(summary)) return
  if (memory.size >= MEMORY_MAX) {
    const oldest = memory.keys().next().value
    if (oldest !== undefined) memory.delete(oldest)
  }
  memory.set(catchUpMemoryKey(entry), summary)
}

/** Why a refused entry was refused, read from its (still unread) body. */
async function refusal(response: Awaited<ReturnType<FetchLike>>): Promise<CatchUpEntryResult> {
  if (await isAllowanceUsedResponse(response)) return { ok: false, status: response.status, allowanceUsed: true }
  if (response.status === 503 && await labChatErrorType(response) === AI_RESTING_ERROR_TYPE) return { ok: false, status: response.status, resting: true }
  return { ok: false, status: response.status }
}

/**
 * One entry. A passed unit (or the passed part of the current one) goes to
 * `/api/lab-catch-up`; the current chapter through the reader's paragraph goes
 * to the existing `/api/lab-recap`. Any failure is a result, never a throw.
 */
export async function fetchCatchUpEntry(entry: CatchUpEntry, options: { token?: string | null; fetchImpl?: FetchLike } = {}): Promise<CatchUpEntryResult> {
  const fetchImpl = options.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, status: 0 }
  if (entry.kind === 'current') {
    let status = 0
    const seen: { response: Awaited<ReturnType<FetchLike>> | null } = { response: null }
    const recorded: FetchLike = async (url, init) => { const response = await fetchImpl(url, init); status = response.status; seen.response = response; return response }
    const result = await requestLabRecapSummary({ request: entry.request, token: options.token, fetchImpl: recorded })
    if (!result.ok) {
      if (result.empty) return { ok: false, status, empty: true }
      // A refused recap's body is still unread (requestLabRecapSummary reads only a 2xx).
      return seen.response ? await refusal(seen.response) : { ok: false, status }
    }
    remember(entry, result.response.summary)
    return { ok: true, summary: result.response.summary }
  }
  // Hard guard: an entry that reaches the reader's chapter is never asked for.
  const place = entry.request.placeChapter
  if (typeof place === 'number' && !catchUpBeforePlace(entry, place)) return { ok: false, status: 0, beyond: true }
  try {
    const response = await fetchImpl(CATCH_UP_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...allowanceAuthHeaders(options.token), ...internalTrafficHeaders() },
      body: JSON.stringify(entry.request),
    })
    if (!response.ok) return await refusal(response)
    const data = await response.json() as Partial<CatchUpResponse> | null
    // ...and an answer covering anything the entry did not ask for, or at or past the place, is dropped.
    if (Array.isArray(data?.chapters) && data.chapters.some(n => typeof n !== 'number' || !entry.chapters.includes(n) || (typeof place === 'number' && n >= place))) {
      return { ok: false, status: response.status, beyond: true }
    }
    const summary = typeof data?.summary === 'string' ? data.summary.trim() : ''
    if (data?.empty === true || (summary && !isUsableRecapSummary(summary))) return { ok: false, status: response.status, empty: true }
    if (!summary) return { ok: false, status: response.status }
    remember(entry, summary)
    return { ok: true, summary }
  } catch {
    return { ok: false, status: 0 }
  }
}

/** A status that says "not now" rather than "this entry is broken". */
export function catchUpShouldCoolDown(status: number): boolean {
  return status === 429 || status === 503
}

/** `empty`: the Worker found nothing to summarise; the entry is not shown. */
export type CatchUpLoadState = 'idle' | 'loading' | 'ok' | 'error' | 'empty'

/**
 * Which entries to start next: wanted, idle, oldest first, within the
 * concurrency left over. Entries the reader has not scrolled near are never
 * started, so a 60-chapter timeline is not 60 requests at once.
 */
export function nextCatchUpKeys(input: {
  keys: string[]
  states: Record<string, CatchUpLoadState | undefined>
  wanted: ReadonlySet<string>
  concurrency?: number
}): string[] {
  const limit = input.concurrency ?? CATCH_UP_CONCURRENCY
  const busy = input.keys.filter(key => input.states[key] === 'loading').length
  const room = Math.max(0, limit - busy)
  if (!room) return []
  const next: string[] = []
  for (let i = 0; i < input.keys.length && next.length < room; i++) {
    const key = input.keys[i]
    if (input.wanted.has(key) && (input.states[key] ?? 'idle') === 'idle') next.push(key)
  }
  return next
}

/** What a shown explanation may carry into chat (companionRequest SHOWN_TEXT_CHARS). */
export const CATCH_UP_CONTEXT_MAX = 4_000

/**
 * The catch-up as Chat and Talk receive it: each loaded entry as
 * "Title: recap", in reading order. Past the bound the oldest entries are
 * dropped, so the part nearest "You are here" always travels.
 */
export function catchUpContextText(items: ReadonlyArray<{ title: string; summary?: string | null }>, max = CATCH_UP_CONTEXT_MAX): string {
  const lines = items
    .map(item => ({ title: item.title.trim(), summary: item.summary?.replace(/\s+/g, ' ').trim() ?? '' }))
    .filter(item => item.summary)
    .map(item => item.title ? `${item.title}: ${item.summary}` : item.summary)
  const kept: string[] = []
  let length = 0
  for (let index = lines.length - 1; index >= 0; index--) {
    const added = lines[index].length + (kept.length ? 1 : 0)
    if (kept.length && length + added > max) break
    kept.unshift(lines[index])
    length += added
  }
  return kept.join('\n')
}
