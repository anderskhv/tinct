/**
 * Client side of "Catch me up": fetching one timeline entry, the order in
 * which entries are fetched, and a per-tab memory of what came back so
 * reopening the sheet costs nothing. Nothing here touches the DOM.
 */
import { CATCH_UP_ROUTE, type CatchUpEntry, type CatchUpResponse } from '../catchUp'
import { requestLabRecapSummary } from '../preReader/recapSummaryClient'

/** Requests in flight at once. The oldest entries go first, in reading order. */
export const CATCH_UP_CONCURRENCY = 3
/** Without a scroll observer, the first few entries are the ones on screen. */
export const CATCH_UP_INITIAL_WANTED = 5
/** After a rate limit or a resting AI, wait this long before asking again on our own. */
export const CATCH_UP_COOLDOWN_MS = 20_000

export type CatchUpEntryResult =
  | { ok: true; summary: string }
  | { ok: false; status: number }

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

const memory = new Map<string, string>()
const MEMORY_MAX = 400

export function catchUpMemoryKey(entry: CatchUpEntry): string {
  const request = entry.request
  return `${request.bookId}/${request.editionKey}/${entry.key}`
}

export function rememberedCatchUp(entry: CatchUpEntry): string | null {
  return memory.get(catchUpMemoryKey(entry)) ?? null
}

export function resetCatchUpMemory(): void {
  memory.clear()
}

function remember(entry: CatchUpEntry, summary: string): void {
  if (memory.size >= MEMORY_MAX) {
    const oldest = memory.keys().next().value
    if (oldest !== undefined) memory.delete(oldest)
  }
  memory.set(catchUpMemoryKey(entry), summary)
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
    const recorded: FetchLike = async (url, init) => { const response = await fetchImpl(url, init); status = response.status; return response }
    const result = await requestLabRecapSummary({ request: entry.request, token: options.token, fetchImpl: recorded })
    if (!result.ok) return { ok: false, status }
    remember(entry, result.response.summary)
    return { ok: true, summary: result.response.summary }
  }
  try {
    const response = await fetchImpl(CATCH_UP_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry.request),
    })
    if (!response.ok) return { ok: false, status: response.status }
    const data = await response.json() as Partial<CatchUpResponse> | null
    const summary = typeof data?.summary === 'string' ? data.summary.trim() : ''
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

export type CatchUpLoadState = 'idle' | 'loading' | 'ok' | 'error'

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
