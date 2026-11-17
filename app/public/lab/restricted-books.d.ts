export const RESTRICTED_BOOKS_PATH: string
type FetchLike = (input: string, init?: RequestInit) => Promise<Response>
export function parseRestrictedBookIds(value: unknown): Set<string>
export function fetchRestrictedBookIds(fetchImpl?: FetchLike): Promise<Set<string>>
export function loadRestrictedBookIds(fetchImpl?: FetchLike): Promise<Set<string>>
export function restrictedBookIdsNow(): Set<string>
export function resetRestrictedBookIdsForTest(): void
export function listWithout(text: string, name: string): string
export function restrictCatalogue<T extends { books: Array<{ id: string; author?: string; topics?: string[] }>; houses?: unknown[]; popular?: string[] }>(data: T, ids: ReadonlySet<string>): T
export function pendingRestrictedBookIds(): Promise<Set<string>> | null
