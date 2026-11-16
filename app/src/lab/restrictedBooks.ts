/**
 * Which books are not served to this request's country (`GET
 * /api/restricted-books`, src/worker/lib/regionGate.ts). The Worker answers
 * with book ids only, never the country; this module keeps the answer in
 * memory for the page's lifetime and writes nothing to storage. Any failure
 * (offline, an old Worker, a bad answer) means "none": the Worker still
 * refuses the text itself, so failing open only affects what the library shows.
 */
export const RESTRICTED_BOOKS_URL = '/api/restricted-books'

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

let pending: Promise<ReadonlySet<string>> | null = null

export function parseRestrictedBookIds(value: unknown): ReadonlySet<string> {
  const ids = (value as { restrictedBookIds?: unknown } | null)?.restrictedBookIds
  if (!Array.isArray(ids)) return new Set()
  return new Set(ids.filter((id): id is string => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id)))
}

export async function fetchRestrictedBookIds(fetchImpl: FetchLike = (input, init) => fetch(input, init)): Promise<ReadonlySet<string>> {
  try {
    const response = await fetchImpl(RESTRICTED_BOOKS_URL, { cache: 'no-store', credentials: 'omit' })
    if (!response.ok) return new Set()
    return parseRestrictedBookIds(await response.json())
  } catch {
    return new Set()
  }
}

/** One request per page. */
export function loadRestrictedBookIds(fetchImpl?: FetchLike): Promise<ReadonlySet<string>> {
  if (!pending) pending = fetchRestrictedBookIds(fetchImpl)
  return pending
}

export function resetRestrictedBookIdsForTest(): void {
  pending = null
}
