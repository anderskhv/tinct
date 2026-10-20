import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { chapterPageSegments, type ChapterHearingPage } from '../lab/labHearing'
import { readLabDeviceId } from '../lab/labPositionStore'
import { adoptReadingMemoryOnSignIn, hydrateReadingMemoryFromCloud } from './adoption'
import { createSupabaseReadingMemoryCloud } from './cloud'
import { deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory } from './deviceStore'
import { drainReadingMemoryQueue, type ReadingMemoryCloud, type ReadingMemoryQueue } from './queue'
import { createReadingMemoryRecorder, detectCompletionSignal, type ReadingMemoryRecorder } from './recorder'
import { wordCount } from './textRange'

/**
 * The device mirror is written on every page turn; the account's cloud copy
 * (one versioned `user_data` row, fanned out to per-session rows by a
 * trigger) goes up at most once in this window. Leaving the page (hidden or
 * pagehide), coming back online and sign-in still send it at once. Nothing is
 * lost in between: every write waits in the persisted device queue, and the
 * library recap drains that same queue before it reads the cloud copy.
 */
export const CLOUD_DRAIN_MIN_INTERVAL_MS = 5 * 60_000

/**
 * Side-effect-free observer of the lab reader. It only READS existing reader
 * state (book tuple, rendered page, page anchors, page-turn direction,
 * finished-chapter transitions) and records durable reading sessions. It
 * never changes how position is computed or persisted.
 */
export interface LabReadingMemoryInput {
  bookId: string
  editionKey: string
  chapterNumber: number
  chapterLabel: string
  paragraphs: string[]
  pageIndex: number
  pages: ChapterHearingPage[]
  /** Pages are measured and settled for this chapter. */
  pagesSettled: boolean
  /** No cover, no load error, no suspended-position state in front of the reader. */
  ready: boolean
  pageTurnDirection: 'next' | 'previous' | null
  finishedChapters: ReadonlySet<number>
  /** Optional override; defaults to the live Supabase session. */
  userId?: string | null
  /** Cloud factory override (tests); defaults to the Supabase versioned row. */
  cloudFor?: (userId: string) => ReadingMemoryCloud | null
}

export function useLabReadingMemory(input: LabReadingMemoryInput): void {
  const { user } = useAuth()
  const userId = input.userId !== undefined ? input.userId : (user?.id ?? null)
  const recorderRef = useRef<ReadingMemoryRecorder | null>(null)
  const queueRef = useRef<ReadingMemoryQueue | null>(null)
  const previousFinishedRef = useRef<ReadonlySet<number> | null>(null)
  const userIdRef = useRef<string | null>(userId)
  userIdRef.current = userId
  const cloudForRef = useRef(input.cloudFor ?? createSupabaseReadingMemoryCloud)
  cloudForRef.current = input.cloudFor ?? createSupabaseReadingMemoryCloud
  const drainTimerRef = useRef<number | null>(null)
  /** When the last drain started; null until the first one. */
  const lastDrainAtRef = useRef<number | null>(null)
  const drainingRef = useRef(false)
  /** A flush (hide, online, sign-in) asked for while a drain was in flight. */
  const flushAgainRef = useRef(false)

  const scheduleDrain = (immediate = false) => {
    const uid = userIdRef.current
    if (!uid || typeof window === 'undefined') return
    const run = () => {
      if (drainTimerRef.current !== null) { window.clearTimeout(drainTimerRef.current); drainTimerRef.current = null }
      if (drainingRef.current) { if (immediate) flushAgainRef.current = true; return }
      const cloud = cloudForRef.current(uid)
      const queue = queueRef.current
      // Nothing queued since the last cloud write: no read, no write.
      if (!cloud || !queue || queue.pending().length === 0) return
      lastDrainAtRef.current = Date.now()
      drainingRef.current = true
      void drainReadingMemoryQueue(queue, cloud).catch(() => {}).finally(() => {
        drainingRef.current = false
        const again = flushAgainRef.current
        flushAgainRef.current = false
        if (queueRef.current && queueRef.current.pending().length > 0) scheduleDrain(again)
      })
    }
    if (immediate) { run(); return }
    // Throttle, not debounce: steady page turns must not postpone it forever.
    if (drainTimerRef.current !== null) return
    const wait = lastDrainAtRef.current === null ? 0 : Math.max(0, lastDrainAtRef.current + CLOUD_DRAIN_MIN_INTERVAL_MS - Date.now())
    drainTimerRef.current = window.setTimeout(run, wait)
  }

  if (!recorderRef.current) {
    queueRef.current = deviceReadingMemoryQueue()
    recorderRef.current = createReadingMemoryRecorder({
      deviceId: readLabDeviceId(),
      // Sessions are owned by the signed-in account, or by no account.
      owner: () => userIdRef.current,
      load: () => readDeviceReadingMemory(),
      save: state => writeDeviceReadingMemory(state),
      onEvent: (event) => {
        // Signed-out reading stays on the device only. Signed-in reading is
        // queued first (offline-safe) and drained to the versioned cloud copy.
        if (!userIdRef.current) return
        queueRef.current?.push(event)
        scheduleDrain()
      },
    })
  }

  const page = input.pages[Math.max(0, Math.min(input.pageIndex, Math.max(0, input.pages.length - 1)))]
  const segments = chapterPageSegments(page)
  const first = segments[0]
  const last = segments[segments.length - 1]
  const pageStart = first ? { paragraphIndex: first.paragraphIndex, wordIndex: first.from } : null
  const pageEnd = last ? { paragraphIndex: last.paragraphIndex, wordIndex: last.to } : null
  const lastParagraph = input.paragraphs[input.paragraphs.length - 1]
  const lastParagraphWordCount = typeof lastParagraph === 'string' ? wordCount(lastParagraph) : 0

  useEffect(() => {
    const recorder = recorderRef.current
    if (!recorder || !pageStart || !pageEnd) return
    const completionSignal = detectCompletionSignal({
      pageIndex: input.pageIndex,
      totalPages: input.pages.length,
      pageEnd,
      paragraphs: input.paragraphs,
      lastParagraphWordCount,
      pageTurnDirection: input.pageTurnDirection,
      chapterNumber: input.chapterNumber,
      finishedChapters: input.finishedChapters,
      previousFinishedChapters: previousFinishedRef.current,
    })
    previousFinishedRef.current = input.finishedChapters
    const ready = input.ready && input.pagesSettled
    recorder.observe({
      bookId: input.bookId,
      editionKey: input.editionKey,
      chapterNumber: input.chapterNumber,
      chapterLabel: input.chapterLabel,
      paragraphs: input.paragraphs,
      pageIndex: input.pageIndex,
      totalPages: input.pages.length,
      pageStart,
      pageEnd,
      ready,
      completionSignal,
    })
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onHide = () => {
      recorderRef.current?.end()
      scheduleDrain(true)
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') onHide() }
    const onOnline = () => scheduleDrain(true)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onHide)
    window.addEventListener('online', onOnline)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('online', onOnline)
      recorderRef.current?.end()
      // Leaving the reader sends what waits instead of leaving it for later.
      scheduleDrain(true)
      if (drainTimerRef.current !== null) window.clearTimeout(drainTimerRef.current)
    }
    // Listeners read refs; they do not need to re-bind per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Signed-out → signed-in: sessions recorded by no account are adopted by
  // this one (retagged, queued, drained); the account's cloud copy is merged
  // into the device mirror (a wiped or new device gets its chapter states
  // back); and the recorder re-reads the rewritten store so it never writes
  // the pre-adoption copy back.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const cloud = cloudForRef.current(userId)
    const adoption = adoptReadingMemoryOnSignIn({ userId, cloud, drain: false })
    // Adoption rewrites the device synchronously. Reload before waiting for
    // the network: a page turn during hydration must not restore old owners.
    recorderRef.current?.reload()
    void adoption
      .then(() => hydrateReadingMemoryFromCloud({ cloud }))
      .then(() => {
        if (cancelled) return
        recorderRef.current?.reload()
        scheduleDrain(true)
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
