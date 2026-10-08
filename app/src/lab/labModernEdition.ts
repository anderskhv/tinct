/**
 * The reader's side of paid Modern English editions for added public-domain
 * books (worker/routes/publicBookModern.ts). One shared edition per book: the
 * first reader buys it, everyone after reads it.
 *
 * While the edition is being written the Worker serves each chapter with its
 * written paragraphs in Modern English and the rest in the original text (same
 * paragraphs, so a place carries over), and says which paragraphs are written.
 * The reader never shows an unwritten paragraph as Modern English: a page that
 * holds one is covered by a waiting screen (LabModernWait) with the progress
 * and an estimate, and after a while an offer to read the original meanwhile,
 * named as the original. When the paragraphs arrive the chapter is reloaded in
 * place. A reader who chose the original is told, quietly, once Modern English
 * is ready where they are, and switches with one tap at the same paragraph.
 * Everything here is behind modernEditionsEnabled() (public-books.js).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { loadEdition } from '../data/editionLoader'
import type { EditionData } from '../types'
import { refreshPublicBook } from '../utils/publicBooks'
import { clearPendingPurchase, fetchModernStatus, MODERN_EDITION_KEY, parseRuns, pendingPurchase, prioritiseModernChapter, type ModernProgress, type ModernStatus } from './labModernEditionApi'

export { fetchModernStatus, formatModernPrice, markPendingPurchase, MODERN_EDITION_KEY, MODERN_PREMIUM_REQUIRED, prioritiseModernChapter, startModernCheckout } from './labModernEditionApi'
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

/** The per-chapter states (and written runs) the Worker sends with an edition still being written; null once complete. */
export function modernInfo(data: unknown): { chapters: Record<string, string>; written: Record<string, Array<[number, number]>> } | null {
  const modern = (data as { modern?: { complete?: unknown; chapters?: unknown; written?: unknown } } | null)?.modern
  if (!modern || modern.complete !== false || !modern.chapters || typeof modern.chapters !== 'object') return null
  const written: Record<string, Array<[number, number]>> = {}
  if (modern.written && typeof modern.written === 'object') {
    for (const [key, runs] of Object.entries(modern.written as Record<string, unknown>)) written[key] = parseRuns(runs)
  }
  return { chapters: modern.chapters as Record<string, string>, written }
}

/** True when the chapter is not all Modern English yet (some or all of it came in its original text). */
export function modernChapterPending(data: unknown, chapterNumber: number): boolean {
  const info = modernInfo(data)
  return !!info && info.chapters[String(chapterNumber)] !== 'ready'
}

/** The paragraphs of a pending chapter that came in Modern English, as [start, end) runs. */
export function modernChapterWritten(data: unknown, chapterNumber: number): Array<[number, number]> {
  return modernInfo(data)?.written[String(chapterNumber)] ?? []
}

/** Whether every paragraph from `first` to `last` (inclusive) is inside the runs. */
export function runsCover(runs: ReadonlyArray<readonly [number, number]>, first: number, last: number): boolean {
  if (last < first) return true
  let at = first
  for (const [start, end] of [...runs].sort((a, b) => a[0] - b[0])) {
    if (start > at) break
    if (end > at) at = end
    if (at > last) return true
  }
  return at > last
}

/** The first paragraph from `first` to `last` outside the runs, or null. */
export function firstUnwritten(runs: ReadonlyArray<readonly [number, number]>, first: number, last: number): number | null {
  for (let i = first; i <= last; i++) if (!runs.some(([a, b]) => i >= a && i < b)) return i
  return null
}

/** How often to ask for the edition's state: often while the reader waits, soon while a shown chapter is being written, slowly while chapters are left. */
export function modernPollDelay(status: ModernStatus | null, waiting: boolean, purchasePending: boolean, covered = false): number {
  if (covered) return 5_000
  if (waiting) return 10_000
  if (purchasePending) return 5_000
  if (status?.state === 'paid') return 30_000
  return 0
}

/** Source words written before a waiting reader's page appears: the chunk under way, then the short opening at their place (worker lib/modernEdition.ts). */
const WORDS_BEFORE_PAGE = 900 + 350

/**
 * Seconds until a reader waiting in `chapter` sees their page, from the pace
 * so far; null while the pace is not known. An estimate, shown as one.
 */
export function modernWaitSeconds(progress: ModernProgress | undefined, chapter: number): number | null {
  const own = progress?.chapters[String(chapter)]
  const wpm = progress?.wordsPerMinute
  if (!own || !wpm || own.startsIn === null) return null
  const page = own.startsIn + Math.round(WORDS_BEFORE_PAGE / wpm * 60)
  return own.eta !== null ? Math.min(page, Math.max(own.eta, 1)) : page
}

/** The estimate in words: never a precise-looking number. */
export function formatModernWait(seconds: number | null): string | null {
  if (seconds === null) return null
  if (seconds < 60) return 'Under a minute'
  const minutes = Math.round(seconds / 60)
  return minutes <= 1 ? 'About a minute' : `About ${minutes} minutes`
}

/** Paragraphs read ahead of the page: they are loaded before the reader gets there. */
const LOOKAHEAD = 3
/** The waiting screen offers the original after this long. */
export const OFFER_ORIGINAL_AFTER_MS = 30_000

export type ModernCover = 'purchase' | 'writing' | 'unavailable'
export interface ModernVisible { first: number; last: number }

/**
 * What the reader shows for the page in view: nothing special, or a cover
 * (the purchase is being confirmed; this page is being written; this chapter
 * could not be written). `reload` asks for the chapter again because more of
 * it is written now than the reader has. Pure: the hook below and the tests
 * share it.
 */
export function modernReaderDecision(input: {
  reading: boolean; pending: boolean; written: ReadonlyArray<readonly [number, number]>; visible: ModernVisible | null
  status: ModernStatus | null; chapterNumber: number; paragraphCount: number; purchasePending: boolean
}): { cover: ModernCover | null; reload: boolean } {
  const { reading, pending, written, visible, status, chapterNumber, paragraphCount } = input
  if (input.purchasePending && !reading) return { cover: 'purchase', reload: false }
  if (!reading || !pending || !visible) return { cover: null, reload: false }
  const key = String(chapterNumber)
  const shown = runsCover(written, visible.first, visible.last)
  const state = status?.chapters[key]
  if (state === 'ready' || status?.state === 'complete') return { cover: shown ? null : 'writing', reload: true }
  const live = status?.progress?.chapters[key]?.ranges ?? []
  const need = shown
    ? { first: visible.last + 1, last: Math.min(paragraphCount - 1, visible.last + LOOKAHEAD) }
    : visible
  const reload = !runsCover(written, need.first, need.last) && runsCover(live, need.first, need.last)
  const failed = status?.state === 'paid' && state === undefined
  return { cover: shown ? null : failed ? 'unavailable' : 'writing', reload }
}

export interface ModernWait {
  kind: ModernCover
  /** The original may be offered: after OFFER_ORIGINAL_AFTER_MS, or at once when the chapter could not be written. */
  offerOriginal: boolean
  done: number
  total: number | null
  /** "About 3 minutes" and the like; null while not known. */
  estimate: string | null
}

/**
 * The reader's hook. `pending` and `written` describe the chapter on screen
 * (LabSource.modernPending / modernWritten); `visible` is the paragraphs on
 * the page in view. Returns the edition's status, a counter that changes when
 * the chapter should be reloaded in place, the waiting screen to show (if
 * any), and the note for a reader who chose the original meanwhile.
 * `readToken` (signed in) sends the reader's token, so the offer comes only
 * to readers who may buy.
 */
export function useLabModernEdition({ enabled, bookId, editionKey, chapterNumber, pending, written, visible, paragraphCount, onPurchased, readToken }: {
  enabled: boolean; bookId: string; editionKey: string; chapterNumber: number; pending: boolean; onPurchased: () => void
  written?: ReadonlyArray<readonly [number, number]>; visible?: ModernVisible | null; paragraphCount?: number
  readToken?: () => Promise<string | null>
}): {
  status: ModernStatus | null; refresh: number; wait: ModernWait | null
  /** Reading the original while Modern English is written: 'original' says so; 'ready' offers the switch. */
  originalNote: 'original' | 'ready' | null
  /** The reader chose the original meanwhile (the caller switches the edition). */
  readOriginal: () => void
  /** The reader went back to Modern English (the caller switches the edition). */
  backToModern: () => void
} {
  const [status, setStatus] = useState<ModernStatus | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [purchasePending, setPurchasePending] = useState(() => enabled && pendingPurchase() === bookId)
  const [watching, setWatching] = useState(false)
  const [offerOriginal, setOfferOriginal] = useState(false)
  const onPurchasedRef = useRef(onPurchased)
  onPurchasedRef.current = onPurchased
  const watchingRef = useRef(watching)
  watchingRef.current = watching
  const reloaded = useRef(new Set<string>())
  const reading = enabled && editionKey === MODERN_EDITION_KEY
  const runs = written ?? []
  const view = visible ?? null
  const decision = modernReaderDecision({
    reading, pending, written: runs, visible: view, status, chapterNumber,
    paragraphCount: paragraphCount ?? Number.MAX_SAFE_INTEGER, purchasePending: enabled && purchasePending && !watching,
  })
  const cover = enabled ? decision.cover : null
  const pollRef = useRef({ covered: false, waiting: false, watching: false })
  pollRef.current = { covered: cover !== null, waiting: reading && pending, watching: watching && !reading }

  // The edition's state: now, and again while anything is still to come.
  const wakeRef = useRef<() => void>(() => {})
  useEffect(() => {
    setStatus(null)
    if (!enabled) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let purchasePolls = 0
    let busy = false
    // The reader starts waiting (or reading the original meanwhile): ask now, not at the slow pace.
    wakeRef.current = () => { if (!busy && !cancelled) { if (timer) clearTimeout(timer); void tick() } }
    const tick = async () => {
      busy = true
      try { await poll() } finally { busy = false }
    }
    const poll = async () => {
      const token = readToken ? await readToken().catch(() => null) : null
      const next = await fetchModernStatus(bookId, fetch, token)
      if (cancelled) return
      if (next) setStatus(next)
      let purchase = pendingPurchase() === bookId
      if (purchase && next && (next.state === 'paid' || next.state === 'complete')) {
        clearPendingPurchase()
        purchase = false
        await refreshPublicBook(bookId).catch(() => {})
        // A reader who chose the original while the purchase went through stays there (the note offers the switch).
        if (!cancelled && !watchingRef.current) onPurchasedRef.current()
      }
      if (purchase && ++purchasePolls > 36) { clearPendingPurchase(); purchase = false }
      if (!cancelled) setPurchasePending(purchase)
      const { covered, waiting, watching: watchingOriginal } = pollRef.current
      const delay = modernPollDelay(next, waiting || watchingOriginal, purchase, covered)
      if (delay && !cancelled) timer = setTimeout(tick, delay)
    }
    void tick()
    return () => { cancelled = true; if (timer) clearTimeout(timer); wakeRef.current = () => {} }
  }, [enabled, bookId, readToken])
  const askingOften = cover !== null || (watching && !reading) || (reading && pending)
  useEffect(() => { if (askingOften) wakeRef.current() }, [askingOften])

  // The chapter in view jumps the queue; where the reader waits (or reads the
  // original meanwhile) is written first, from that paragraph on.
  // Reading the original, the place is sent only while it is not written yet
  // (the writing soon runs ahead of a reader, and then nothing more is sent).
  const liveRuns = status?.progress?.chapters[String(chapterNumber)]?.ranges ?? []
  const focus = !view ? null
    : cover === 'writing' ? firstUnwritten(runs, view.first, view.last) ?? view.first
    : watching && !reading ? firstUnwritten(liveRuns, view.first, view.last)
    : null
  const prioritised = (reading && pending) || (watching && !reading && status?.state === 'paid')
  useEffect(() => {
    if (!prioritised) return
    let cancelled = false
    void (async () => {
      const token = readToken ? await readToken().catch(() => null) : null
      const next = await prioritiseModernChapter(bookId, chapterNumber, fetch, token, focus ?? undefined)
      if (!cancelled && next) setStatus(next)
    })()
    return () => { cancelled = true }
    // Only a new chapter or a new waiting place asks again; the status poll does the rest.
  }, [prioritised, bookId, chapterNumber, focus, readToken])

  // More of the chapter is written than the reader has: reload it in place, once per state of it.
  const liveDone = status?.progress?.chapters[String(chapterNumber)]?.done ?? -1
  const chapterState = status?.chapters[String(chapterNumber)]
  useEffect(() => {
    if (!reading || !decision.reload) return
    const key = `${bookId}:${chapterNumber}:${chapterState}:${liveDone}`
    if (reloaded.current.has(key)) return
    reloaded.current.add(key)
    setRefresh(n => n + 1)
  }, [reading, decision.reload, bookId, chapterNumber, chapterState, liveDone])

  // The original is offered once the reader has waited a while (a chapter that could not be written offers it at once).
  const coverKey = cover ? `${cover}:${bookId}:${chapterNumber}` : ''
  useEffect(() => {
    setOfferOriginal(false)
    if (!coverKey) return
    const timer = setTimeout(() => setOfferOriginal(true), OFFER_ORIGINAL_AFTER_MS)
    return () => clearTimeout(timer)
  }, [coverKey])

  // Back in Modern English (any way: the note, the edition menu): the watch ends.
  useEffect(() => { if (reading && watching && !purchasePending) setWatching(false) }, [reading, watching, purchasePending])

  const progress = status?.progress?.chapters[String(chapterNumber)]
  const wait: ModernWait | null = cover ? {
    kind: cover,
    offerOriginal: cover === 'unavailable' || offerOriginal,
    done: progress?.done ?? runs.reduce((sum, [a, b]) => sum + b - a, 0),
    total: progress?.total ?? paragraphCount ?? null,
    estimate: cover === 'writing' ? formatModernWait(modernWaitSeconds(status?.progress, chapterNumber)) : null,
  } : null

  let originalNote: 'original' | 'ready' | null = null
  if (enabled && watching && !reading) {
    const live = progress?.ranges ?? []
    const here = chapterState === 'ready' || status?.state === 'complete' || (!!view && runsCover(live, view.first, view.last))
    originalNote = here && !purchasePending ? 'ready' : 'original'
  }

  const readOriginal = useCallback(() => { setWatching(true); setPurchasePending(false) }, [])
  const backToModern = useCallback(() => setWatching(false), [])
  return { status: enabled ? status : null, refresh, wait, originalNote, readOriginal, backToModern }
}
