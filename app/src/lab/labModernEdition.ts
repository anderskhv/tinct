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
import { refreshPublicBook } from '../utils/publicBooks'
import { clearPendingPurchase, fetchModernStatus, MODERN_EDITION_KEY, pendingPurchase, prioritiseModernChapter, type ModernStatus } from './labModernEditionApi'

export { fetchModernStatus, formatModernPrice, markPendingPurchase, MODERN_EDITION_KEY, prioritiseModernChapter, startModernCheckout } from './labModernEditionApi'
export type { ModernChapterState, ModernStatus } from './labModernEditionApi'

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
