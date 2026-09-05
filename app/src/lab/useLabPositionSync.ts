import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useAuth } from '../hooks/useAuth'
import { bibleFallbackSource, type LabSource } from './labSource'
import { getBook } from '../data/bookRegistry'
import {
  biblicalBookId,
  createLabPositionController,
  parseBiblicalPlaceTitle,
  placeFromChapterRef,
  resumePlace,
  type LabBookPlace,
  type LabPlaceReason,
  type LabPositionController,
  type LabReaderStateSnapshot,
} from './labPosition'
import {
  createLabPositionSync,
  fetchLabPositionCloud,
  readLabDeviceId,
  readLabPositionLocal,
  writeLabPositionLocal,
} from './labPositionStore'

export function bookFromResumePlace(place: LabBookPlace): LabSource {
  const registryBook = getBook(place.bookId)
  if (registryBook && registryBook.id !== 'bible') {
    const chapterLabel = `Chapter ${place.chapterNumber}`
    return {
      bookId: registryBook.id,
      editions: registryBook.editions,
      bookTitle: registryBook.title,
      bookAuthor: registryBook.author,
      editionLabel: registryBook.editions[0]?.label || '',
      chapterNumber: place.sequentialChapter,
      chapterTitle: chapterLabel,
      chapterLabel,
      headerBook: registryBook.title,
      headerChapter: chapterLabel,
      paragraphs: [],
      compareParagraphs: [],
      followParagraphs: [],
      chapters: [{ number: place.sequentialChapter, title: chapterLabel }],
      chaptersProvisional: true,
      cast: [],
    }
  }
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
  resume: LabBookPlace | null
} {
  if (source) return { book: source, place: { paragraphIndex: 0, wordIndex: 0 }, resume: null }
  const resume = resumePlace(readLabPositionLocal())
  if (!resume) return { book: bibleFallbackSource(), place: { paragraphIndex: 0, wordIndex: 0 }, resume: null }
  return {
    book: bookFromResumePlace(resume),
    place: { paragraphIndex: resume.paragraphIndex, wordIndex: resume.wordIndex },
    resume,
  }
}

export function placeFromLabBook(
  book: LabSource,
  at: { paragraphIndex: number; wordIndex: number },
  deviceId: string,
  now: number,
  rev: number,
  readerState?: LabReaderStateSnapshot,
): LabBookPlace {
  if (book.bookId && book.bookId !== 'bible') {
    return {
      bookId: book.bookId,
      headerBook: book.bookTitle,
      chapterNumber: book.chapterNumber,
      sequentialChapter: book.chapterNumber,
      paragraphIndex: at.paragraphIndex,
      wordIndex: at.wordIndex,
      ...(readerState || {}),
      updatedAt: now,
      deviceId,
      rev,
    }
  }
  const parsed = parseBiblicalPlaceTitle(book.chapterTitle)
  const inBook = Number(book.headerChapter) || Number(parsed.chapter) || 1
  return {
    bookId: biblicalBookId(book.headerBook || parsed.book),
    headerBook: book.headerBook || parsed.book,
    chapterNumber: inBook,
    sequentialChapter: book.chapterNumber,
    paragraphIndex: at.paragraphIndex,
    wordIndex: at.wordIndex,
    ...(readerState || {}),
    updatedAt: now,
    deviceId,
    rev,
  }
}

export function useLabPositionSync(args: {
  book: LabSource
  placeRef: MutableRefObject<{ paragraphIndex: number; wordIndex: number }>
  readerStateRef?: MutableRefObject<LabReaderStateSnapshot>
  sourceLocked: boolean
  writesSuspended?: boolean
  authToken?: string | null
  onRemoteResume?: (place: LabBookPlace) => void
}): {
  notePlace: (reason: LabPlaceReason, at?: { sequentialChapter?: number; paragraphIndex?: number; wordIndex?: number }) => void
  biblicalBook: string
} {
  const { session } = useAuth()
  const liveToken = args.authToken !== undefined ? args.authToken : (session?.access_token ?? null)
  const deviceIdRef = useRef(readLabDeviceId())
  // Seeded from the stored record below so a reload never restarts at 0 and
  // loses a same-millisecond tie-break against an older place.
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
      persist: (state, cause, reason) => {
        writeLabPositionLocal(state)
        if (cause === 'local') return
        syncRef.current?.persist(state, { keepalive: reason === 'hide' })
      },
      schedule: (fn, ms) => {
        const id = window.setTimeout(fn, ms)
        return () => window.clearTimeout(id)
      },
    })
    controller.replace(local)
    controllerRef.current = controller
    revRef.current = Object.values(local.books).reduce((max, place) => Math.max(max, place.rev), 0)
  }

  useEffect(() => {
    const sync = createLabPositionSync({ token: liveToken })
    syncRef.current = sync
    if (sync.isDirty()) void sync.flush()
    const onOnline = () => { void syncRef.current?.flush() }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [liveToken])

  useEffect(() => {
    if (args.sourceLocked || !liveToken || cloudDoneRef.current) return
    // The boot render spreads the Genesis fallback (two chapters) under the
    // resume place; merging against that list would discard every cloud
    // place outside Genesis 1-2. Wait for the loaded manifest.
    if (args.book.chaptersProvisional || args.book.chapters.length === 0) return
    let cancelled = false
    const chapters = args.book.chapters
    void fetchLabPositionCloud(liveToken).then((cloud) => {
      if (cancelled || !cloud) return
      const controller = controllerRef.current
      if (!controller) return
      const next = controller.applyCloud(cloud, chapters)
      // Latch only now: the record was merged against the real chapter list.
      cloudDoneRef.current = true
      writeLabPositionLocal(next)
      syncRef.current?.persist(next)
      const resume = resumePlace(next)
      const current = bookRef.current
      if (!resume) return
      const currentBookId = current.bookId && current.bookId !== 'bible'
        ? current.bookId
        : biblicalBookId(current.headerBook)
      if (resume.sequentialChapter !== current.chapterNumber || resume.bookId !== currentBookId) {
        onRemoteResumeRef.current?.(resume)
        return
      }
      args.placeRef.current = { paragraphIndex: resume.paragraphIndex, wordIndex: resume.wordIndex }
    })
    return () => { cancelled = true }
  }, [args.authToken, args.book.chapters, args.placeRef, args.sourceLocked, liveToken])

  const notePlace = useCallback((reason: LabPlaceReason, at?: { sequentialChapter?: number; paragraphIndex?: number; wordIndex?: number }) => {
    if (args.writesSuspended) return
    const book = bookRef.current
    const controller = controllerRef.current
    if (!controller) return
    revRef.current += 1
    const sequential = at?.sequentialChapter ?? book.chapterNumber
    const paragraphIndex = at?.paragraphIndex ?? args.placeRef.current.paragraphIndex
    const wordIndex = at?.wordIndex ?? args.placeRef.current.wordIndex
    const place = sequential === book.chapterNumber
      ? placeFromLabBook(book, { paragraphIndex, wordIndex }, deviceIdRef.current, Date.now(), revRef.current, args.readerStateRef?.current)
      : placeFromChapterRef({
          chapters: book.chapters,
          sequentialChapter: sequential,
          paragraphIndex,
          wordIndex,
          deviceId: deviceIdRef.current,
          now: Date.now(),
          rev: revRef.current,
          bookId: book.bookId,
          headerBook: book.bookTitle,
          readerState: args.readerStateRef?.current,
        })
    controller.note({ place, reason })
  }, [args.placeRef, args.readerStateRef, args.writesSuspended])

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
    biblicalBook: args.book.bookId && args.book.bookId !== 'bible'
      ? args.book.bookId
      : biblicalBookId(args.book.headerBook),
  }
}
