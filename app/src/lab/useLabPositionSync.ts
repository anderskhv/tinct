import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useAuth } from '../hooks/useAuth'
import { bibleFallbackSource, type LabSource } from './labSource'
import {
  biblicalBookId,
  createLabPositionController,
  parseBiblicalPlaceTitle,
  placeFromChapterRef,
  resumePlace,
  type LabBookPlace,
  type LabPlaceReason,
  type LabPositionController,
} from './labPosition'
import {
  createLabPositionSync,
  fetchLabPositionCloud,
  readLabDeviceId,
  readLabPositionLocal,
  writeLabPositionLocal,
} from './labPositionStore'

export function bookFromResumePlace(place: LabBookPlace): LabSource {
  const base = bibleFallbackSource()
  const title = `${place.headerBook} ${place.chapterNumber}`
  return {
    ...base,
    chapterNumber: place.sequentialChapter,
    chapterTitle: title,
    chapterLabel: title,
    headerBook: place.headerBook,
    headerChapter: String(place.chapterNumber),
    paragraphs: [],
    compareParagraphs: [],
    followParagraphs: [],
  }
}

export function bootLabReading(source?: LabSource): {
  book: LabSource
  place: { paragraphIndex: number; wordIndex: number }
} {
  if (source) return { book: source, place: { paragraphIndex: 0, wordIndex: 0 } }
  const resume = resumePlace(readLabPositionLocal())
  if (!resume) return { book: bibleFallbackSource(), place: { paragraphIndex: 0, wordIndex: 0 } }
  return {
    book: bookFromResumePlace(resume),
    place: { paragraphIndex: resume.paragraphIndex, wordIndex: resume.wordIndex },
  }
}

export function placeFromLabBook(
  book: LabSource,
  at: { paragraphIndex: number; wordIndex: number },
  deviceId: string,
  now: number,
  rev: number,
): LabBookPlace {
  const parsed = parseBiblicalPlaceTitle(book.chapterTitle)
  const inBook = Number(book.headerChapter) || Number(parsed.chapter) || 1
  return {
    bookId: biblicalBookId(book.headerBook || parsed.book),
    headerBook: book.headerBook || parsed.book,
    chapterNumber: inBook,
    sequentialChapter: book.chapterNumber,
    paragraphIndex: at.paragraphIndex,
    wordIndex: at.wordIndex,
    updatedAt: now,
    deviceId,
    rev,
  }
}

export function useLabPositionSync(args: {
  book: LabSource
  placeRef: MutableRefObject<{ paragraphIndex: number; wordIndex: number }>
  sourceLocked: boolean
  authToken?: string | null
  onRemoteResume?: (place: LabBookPlace) => void
}): {
  notePlace: (reason: LabPlaceReason, at?: { sequentialChapter?: number; paragraphIndex?: number; wordIndex?: number }) => void
  biblicalBook: string
} {
  const { session } = useAuth()
  const liveToken = args.authToken !== undefined ? args.authToken : (session?.access_token ?? null)
  const deviceIdRef = useRef(readLabDeviceId())
  const revRef = useRef(0)
  const controllerRef = useRef<LabPositionController | null>(null)
  const syncRef = useRef<ReturnType<typeof createLabPositionSync> | null>(null)
  const cloudDoneRef = useRef(false)
  const onRemoteResumeRef = useRef(args.onRemoteResume)
  onRemoteResumeRef.current = args.onRemoteResume
  const bookRef = useRef(args.book)
  bookRef.current = args.book

  if (!controllerRef.current) {
    const deviceId = deviceIdRef.current
    const local = readLabPositionLocal(deviceId)
    const controller = createLabPositionController({
      deviceId,
      persist: (state) => {
        writeLabPositionLocal(state)
        syncRef.current?.persist(state)
      },
      schedule: (fn, ms) => {
        const id = window.setTimeout(fn, ms)
        return () => window.clearTimeout(id)
      },
    })
    controller.replace(local)
    controllerRef.current = controller
  }

  useEffect(() => {
    syncRef.current = createLabPositionSync({ token: liveToken })
  }, [liveToken])

  useEffect(() => {
    if (args.sourceLocked || !liveToken || cloudDoneRef.current) return
    if (args.book.chapters.length < 2) return
    let cancelled = false
    const chapters = args.book.chapters
    void fetchLabPositionCloud(liveToken).then((cloud) => {
      if (cancelled || !cloud) return
      cloudDoneRef.current = true
      const controller = controllerRef.current
      if (!controller) return
      const next = controller.applyCloud(cloud, chapters)
      writeLabPositionLocal(next)
      syncRef.current?.persist(next)
      const resume = resumePlace(next)
      const current = bookRef.current
      if (!resume) return
      if (resume.sequentialChapter !== current.chapterNumber || resume.bookId !== biblicalBookId(current.headerBook)) {
        onRemoteResumeRef.current?.(resume)
        return
      }
      args.placeRef.current = { paragraphIndex: resume.paragraphIndex, wordIndex: resume.wordIndex }
    })
    return () => { cancelled = true }
  }, [args.authToken, args.book.chapters, args.placeRef, args.sourceLocked, liveToken])

  const notePlace = useCallback((reason: LabPlaceReason, at?: { sequentialChapter?: number; paragraphIndex?: number; wordIndex?: number }) => {
    const book = bookRef.current
    const controller = controllerRef.current
    if (!controller) return
    revRef.current += 1
    const sequential = at?.sequentialChapter ?? book.chapterNumber
    const paragraphIndex = at?.paragraphIndex ?? args.placeRef.current.paragraphIndex
    const wordIndex = at?.wordIndex ?? args.placeRef.current.wordIndex
    const place = sequential === book.chapterNumber
      ? placeFromLabBook(book, { paragraphIndex, wordIndex }, deviceIdRef.current, Date.now(), revRef.current)
      : placeFromChapterRef({
          chapters: book.chapters,
          sequentialChapter: sequential,
          paragraphIndex,
          wordIndex,
          deviceId: deviceIdRef.current,
          now: Date.now(),
          rev: revRef.current,
        })
    controller.note({ place, reason })
  }, [args.placeRef])

  useEffect(() => {
    const onHide = () => notePlace('hide')
    const onVis = () => { if (document.visibilityState === 'hidden') onHide() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', onHide)
    }
  }, [notePlace])

  return {
    notePlace,
    biblicalBook: biblicalBookId(args.book.headerBook),
  }
}
