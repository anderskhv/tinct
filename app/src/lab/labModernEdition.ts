/**
 * The reader's side of paid Modern English editions for added public-domain
 * books (worker/routes/publicBookModern.ts). One shared edition per book: the
 * first reader buys it, everyone after reads it. Until a chapter is written it
 * is served in the original text (same paragraphs, so the place carries over)
 * and the reader says so; when it is ready the chapter is swapped in.
 * Everything here is behind modernEditionsEnabled() (public-books.js).
 */
import { useEffect, useRef, useState } from 'react'
import { loadEdition } from '../data/editionLoader'
import type { EditionData } from '../types'
import { apiUrl } from '../utils/apiUrl'
import { refreshPublicBook } from '../utils/publicBooks'

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
function pendingPurchase(): string | null {
  try { return sessionStorage.getItem(PENDING_PURCHASE_KEY) } catch { return null }
}
function clearPendingPurchase(): void {
  try { sessionStorage.removeItem(PENDING_PURCHASE_KEY) } catch { /* nothing to clear */ }
}

/**
 * The edition for the reader. While it is being written the copy is never
 * taken from a cache (a chapter may have been finished since); once complete
 * it is cached like any edition.
 */
const finished = new Set<string>()
export async function loadPublicModernEdition(bookId: string): Promise<EditionData> {
  if (finished.has(bookId)) return loadEdition(bookId, MODERN_EDITION_KEY)
  const data = await loadEdition(bookId, MODERN_EDITION_KEY, { bypassCache: true })
  if (!modernInfo(data)) finished.add(bookId)
  return data
}

/** The per-chapter states the Worker sends with an edition still being written; null once complete. */
export function modernInfo(data: unknown): { chapters: Record<string, string> } | null {
  const modern = (data as { modern?: { complete?: unknown; chapters?: unknown } } | null)?.modern
  if (!modern || modern.complete !== false || !modern.chapters || typeof modern.chapters !== 'object') return null
  return { chapters: modern.chapters as Record<string, string> }
}

/** True when the chapter was served in its original text because its modern text is not written yet. */
export function modernChapterPending(data: unknown, chapterNumber: number): boolean {
  const info = modernInfo(data)
  return !!info && info.chapters[String(chapterNumber)] !== 'ready'
}

/** How often to ask for the edition's state: soon while a shown chapter waits, slowly while chapters are left. */
export function modernPollDelay(status: ModernStatus | null, waiting: boolean, purchasePending: boolean): number {
  if (waiting) return 10_000
  if (purchasePending) return 5_000
  if (status?.state === 'paid') return 30_000
  return 0
}

/**
 * The reader's hook. `pending` is true while the chapter on screen came in its
 * original text (LabSource.modernPending). Returns the edition's status, a
 * counter that changes when that chapter is ready (the reader reloads it in
 * place), and whether to show the "being prepared" line.
 */
export function useLabModernEdition({ enabled, bookId, editionKey, chapterNumber, pending, onPurchased }: {
  enabled: boolean; bookId: string; editionKey: string; chapterNumber: number; pending: boolean; onPurchased: () => void
}): { status: ModernStatus | null; refresh: number; preparing: boolean } {
  const [status, setStatus] = useState<ModernStatus | null>(null)
  const [refresh, setRefresh] = useState(0)
  const onPurchasedRef = useRef(onPurchased)
  onPurchasedRef.current = onPurchased
  // One reload per chapter: if the reloaded text were somehow still the original, never loop.
  const reloaded = useRef(new Set<string>())
  const reading = enabled && editionKey === MODERN_EDITION_KEY
  const chapterState = status?.chapters[String(chapterNumber)]
  const waiting = reading && pending && (chapterState === 'queued' || chapterState === 'preparing')

  // The edition's state: now, and again while anything is still to come.
  useEffect(() => {
    setStatus(null)
    if (!enabled) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let purchasePolls = 0
    const tick = async () => {
      const next = await fetchModernStatus(bookId)
      if (cancelled) return
      if (next) setStatus(next)
      let purchasePending = pendingPurchase() === bookId
      if (purchasePending && next && (next.state === 'paid' || next.state === 'complete')) {
        clearPendingPurchase()
        purchasePending = false
        await refreshPublicBook(bookId).catch(() => {})
        if (!cancelled) onPurchasedRef.current()
      }
      if (purchasePending && ++purchasePolls > 36) { clearPendingPurchase(); purchasePending = false }
      const delay = modernPollDelay(next, false, purchasePending)
      if (delay && !cancelled) timer = setTimeout(tick, delay)
    }
    void tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [enabled, bookId])

  // A chapter opened before it was written jumps the queue, and is watched until ready.
  useEffect(() => {
    if (!reading || !pending) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const watch = async (first: boolean) => {
      const next = first ? await prioritiseModernChapter(bookId, chapterNumber) : await fetchModernStatus(bookId)
      if (cancelled) return
      if (next) setStatus(next)
      if (next?.chapters[String(chapterNumber)] === 'ready') {
        const key = `${bookId}:${chapterNumber}`
        if (!reloaded.current.has(key)) { reloaded.current.add(key); setRefresh(n => n + 1) }
        return
      }
      timer = setTimeout(() => void watch(false), modernPollDelay(next, true, false))
    }
    void watch(true)
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [reading, pending, bookId, chapterNumber])

  return { status: enabled ? status : null, refresh, preparing: waiting }
}
