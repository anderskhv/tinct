import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { chapterPageSegments, type ChapterHearingPage } from '../lab/labHearing'
import { readLabDeviceId } from '../lab/labPositionStore'
import { adoptReadingMemoryOnSignIn } from './adoption'
import { createSupabaseReadingMemoryCloud } from './cloud'
import { deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory } from './deviceStore'
import { drainReadingMemoryQueue, type ReadingMemoryQueue } from './queue'
import { createReadingMemoryRecorder, detectCompletionSignal, type ReadingMemoryRecorder } from './recorder'
import { wordCount } from './textRange'

const CLOUD_DRAIN_DEBOUNCE_MS = 1_500

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
}

export function useLabReadingMemory(input: LabReadingMemoryInput): void {
  const { user } = useAuth()
  const userId = input.userId !== undefined ? input.userId : (user?.id ?? null)
  const recorderRef = useRef<ReadingMemoryRecorder | null>(null)
  const queueRef = useRef<ReadingMemoryQueue | null>(null)
  const previousFinishedRef = useRef<ReadonlySet<number> | null>(null)
  const userIdRef = useRef<string | null>(userId)
  userIdRef.current = userId
  const drainTimerRef = useRef<number | null>(null)

  const scheduleDrain = (immediate = false) => {
    const uid = userIdRef.current
    if (!uid || typeof window === 'undefined') return
    const run = () => {
      drainTimerRef.current = null
      const cloud = createSupabaseReadingMemoryCloud(uid)
      const queue = queueRef.current
      if (!cloud || !queue) return
      void drainReadingMemoryQueue(queue, cloud).catch(() => {})
    }
    if (drainTimerRef.current !== null) window.clearTimeout(drainTimerRef.current)
    if (immediate) run()
    else drainTimerRef.current = window.setTimeout(run, CLOUD_DRAIN_DEBOUNCE_MS)
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
      ready: input.ready && input.pagesSettled,
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
      if (drainTimerRef.current !== null) window.clearTimeout(drainTimerRef.current)
    }
    // Listeners read refs; they do not need to re-bind per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Signed-out → signed-in: sessions recorded by no account are adopted by
  // this one (retagged, queued, drained), and the recorder re-reads the
  // rewritten store so it never writes the pre-adoption copy back.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const cloud = createSupabaseReadingMemoryCloud(userId)
    void adoptReadingMemoryOnSignIn({ userId, cloud, drain: false }).then(() => {
      if (cancelled) return
      recorderRef.current?.reload()
      scheduleDrain(true)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
