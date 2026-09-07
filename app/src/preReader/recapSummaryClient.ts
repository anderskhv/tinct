/**
 * Client side of the "so far" summary: the request to `/api/lab-recap` and a
 * small device cache so the library opens with the line already filled on a
 * repeat visit. Pure over an injectable fetch and storage; nothing here
 * touches the DOM.
 *
 * The cache lives under the `tinct:` namespace so sign-out wipes it with the
 * rest of the device's user data.
 */
import { LAB_RECAP_ROUTE, type LabRecapRequest, type LabRecapResponse } from '../recapSummary'

export const RECAP_SUMMARY_STORAGE_KEY = 'tinct:lab-recap-summaries'
/** Entries kept per device, newest first. */
export const RECAP_SUMMARY_STORAGE_MAX = 24

export interface StoredRecapSummary {
  summary: string
  at: number
}

interface StoredRecapSummaries {
  v: 1
  entries: Record<string, StoredRecapSummary>
}

export interface RecapSummaryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

export type RecapSummaryResult =
  | { ok: true; response: LabRecapResponse }
  | { ok: false; error: string }

function readStore(storage: RecapSummaryStorage | null): StoredRecapSummaries {
  try {
    const raw = storage?.getItem(RECAP_SUMMARY_STORAGE_KEY)
    if (!raw) return { v: 1, entries: {} }
    const parsed = JSON.parse(raw) as Partial<StoredRecapSummaries>
    if (parsed?.v !== 1 || !parsed.entries || typeof parsed.entries !== 'object') return { v: 1, entries: {} }
    return { v: 1, entries: parsed.entries }
  } catch {
    return { v: 1, entries: {} }
  }
}

export function readStoredRecapSummary(storage: RecapSummaryStorage | null, key: string): string | null {
  const entry = readStore(storage).entries[key]
  return entry && typeof entry.summary === 'string' && entry.summary.trim() ? entry.summary : null
}

/** Remember a summary under its cache key; the oldest entries beyond the cap are dropped. */
export function storeRecapSummary(storage: RecapSummaryStorage | null, key: string, summary: string, now: number): void {
  if (!storage) return
  const store = readStore(storage)
  store.entries[key] = { summary, at: now }
  const kept = Object.entries(store.entries)
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, RECAP_SUMMARY_STORAGE_MAX)
  try {
    storage.setItem(RECAP_SUMMARY_STORAGE_KEY, JSON.stringify({ v: 1, entries: Object.fromEntries(kept) }))
  } catch { /* private mode / quota */ }
}

/**
 * Ask the Worker for the summary. Any failure is reported, never shown: the
 * hero keeps its position line and nothing else.
 */
export async function requestLabRecapSummary(input: {
  request: LabRecapRequest
  token?: string | null
  fetchImpl?: FetchLike
  apiBase?: string
}): Promise<RecapSummaryResult> {
  const fetchImpl = input.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' }
  try {
    const response = await fetchImpl(`${input.apiBase ?? ''}${LAB_RECAP_ROUTE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.token ? { Authorization: `Bearer ${input.token}` } : {}),
      },
      body: JSON.stringify(input.request),
    })
    if (!response.ok) return { ok: false, error: `recap route returned ${response.status}` }
    const data = await response.json() as Partial<LabRecapResponse> | null
    const summary = typeof data?.summary === 'string' ? data.summary.trim() : ''
    if (!summary || !data?.coverage) return { ok: false, error: 'recap route returned no summary' }
    return { ok: true, response: { ...data, summary } as LabRecapResponse }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'request failed' }
  }
}
