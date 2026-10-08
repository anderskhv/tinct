/**
 * The requests and small helpers of paid Modern English editions for added
 * public-domain books (worker/routes/publicBookModern.ts), without React or the
 * edition loader, so the library's add engine (src/libraryAdd.ts) can ask the
 * same questions and start the same checkout as the reader (labModernEdition.ts).
 */
import { apiUrl } from '../utils/apiUrl'

export const MODERN_EDITION_KEY = 'modern-en'
export type ModernChapterState = 'ready' | 'preparing' | 'queued'
export interface ModernStatus {
  state: 'none' | 'checkout' | 'paid' | 'complete'
  chapters: Record<string, ModernChapterState>
  offer: { tier: number; cents: number } | null
}
type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const PENDING_PURCHASE_KEY = 'tinct:modern-purchase'
const statusUrl = (bookId: string, rest = '') => apiUrl(`/api/public-books/${encodeURIComponent(bookId)}/modern-en${rest}`)

function parseStatus(value: unknown): ModernStatus | null {
  const data = value as Partial<ModernStatus> | null
  if (!data || typeof data.state !== 'string' || !data.chapters || typeof data.chapters !== 'object') return null
  const offer = data.offer && typeof data.offer.cents === 'number' ? data.offer : null
  return { state: data.state, chapters: data.chapters, offer }
}

export async function fetchModernStatus(bookId: string, fetchImpl: FetchLike = fetch): Promise<ModernStatus | null> {
  try {
    const response = await fetchImpl(statusUrl(bookId), { cache: 'no-store' })
    return response.ok ? parseStatus(await response.json()) : null
  } catch {
    return null
  }
}

/** A reader opened a chapter not yet written: it goes to the front of the queue. */
export async function prioritiseModernChapter(bookId: string, chapter: number, fetchImpl: FetchLike = fetch): Promise<ModernStatus | null> {
  try {
    const response = await fetchImpl(statusUrl(bookId, '/priority'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chapter }) })
    return response.ok ? parseStatus(await response.json()) : null
  } catch {
    return null
  }
}

/** Starts Stripe Checkout; resolves to the Checkout URL. The Worker picks the price. */
export async function startModernCheckout(bookId: string, chapter: number, token: string, fetchImpl: FetchLike = fetch): Promise<string> {
  const response = await fetchImpl(statusUrl(bookId, '/checkout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ chapter }),
  })
  const data = await response.json().catch(() => ({})) as { url?: unknown }
  if (!response.ok || typeof data.url !== 'string' || !data.url.startsWith('https://')) throw new Error('checkout')
  return data.url
}

export function formatModernPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function markPendingPurchase(bookId: string): void {
  try { sessionStorage.setItem(PENDING_PURCHASE_KEY, bookId) } catch { /* the edition still appears; only the switch to it is lost */ }
}
export function pendingPurchase(): string | null {
  try { return sessionStorage.getItem(PENDING_PURCHASE_KEY) } catch { return null }
}
export function clearPendingPurchase(): void {
  try { sessionStorage.removeItem(PENDING_PURCHASE_KEY) } catch { /* nothing to clear */ }
}
