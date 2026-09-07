import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { useAuth } from '../hooks/useAuth'
import { bibleFallbackSource, type LabSource } from './labSource'
import { getBook } from '../data/bookRegistry'
import { bibleEditions, syncLabAudioEdition, type LabPrefs } from './labPrefs'
import { prefsFromLabResumePlace } from './labReaderHandoff'
import {
  LAB_INITIAL_CLOUD_WAIT_MS,
  LAB_POSITION_WRITE_ARM_MS,
  adoptLabPositionRecord,
  biblicalBookId,
  createLabPositionController,
  finishedChaptersFor,
  parseBiblicalPlaceTitle,
  placeFromChapterRef,
  resumePlace,
  shouldFollowLateCloudResume,
  shouldPreferAccountSettle,
  type LabBookPlace,
  type LabPlaceReason,
  type LabPositionController,
  type LabPositionOwnership,
  type LabPositionState,
  type LabReaderStateSnapshot,
} from './labPosition'
import {
  clearLabPositionLocal,
  createLabPositionSync,
  fetchLabPositionCloud,
  migrateLegacyFinishedChapters,
  readLabDeviceId,
  readLabPositionLocal,
  writeLabPositionLocal,
} from './labPositionStore'

/** Library bookId the position record keys finished chapters by. */
export function labLibraryBookId(book: Pick<LabSource, 'bookId'>): string {
  return book.bookId && book.bookId !== 'bible' ? book.bookId : 'bible'
}

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

export interface LabRemoteResumeSelection {
  /** Library book to load: `bible` for a biblical pin, else the registry book the pin names. */
  bookId: string
  primaryEditionKey: string
  compareEditionKey?: string
  /** Prefs to adopt with the load; the current object when nothing changes. */
  prefs: LabPrefs
}

/**
 * What a resolved cloud place means for the reader: which library book to
 * load and in which editions. A biblical pin (hebrews) is the Bible; a
 * registry pin (crito) is that book, in the edition it was read in when this
 * book offers it, else its default edition. Never the currently open book's
 * loader for another book's chapter number.
 */
export function remoteResumeSelection(place: LabBookPlace, current: { libraryBookId: string; prefs: LabPrefs }): LabRemoteResumeSelection | null {
  const registryBook = getBook(place.bookId)
  const bookId = registryBook && registryBook.id !== 'bible' ? registryBook.id : 'bible'
  const editions = bookId === 'bible' ? bibleEditions() : registryBook!.editions
  const basePrefs = bookId === current.libraryBookId
    ? current.prefs
    : syncLabAudioEdition(prefsFromLabResumePlace(current.prefs, place), editions)
  const primaryEditionKey = editions.some(edition => edition.key === basePrefs.primaryEdition)
    ? basePrefs.primaryEdition
    : (editions.find(edition => edition.style === 'original' && edition.language === 'en') || editions[0])?.key
  if (!primaryEditionKey) return null
  const compareEditionKey = basePrefs.compareOpen
    && basePrefs.compareEdition !== primaryEditionKey
    && editions.some(edition => edition.key === basePrefs.compareEdition)
    ? basePrefs.compareEdition
    : undefined
  const prefs = basePrefs.primaryEdition === primaryEditionKey
    ? basePrefs
    : syncLabAudioEdition({ ...basePrefs, primaryEdition: primaryEditionKey }, editions)
  return { bookId, primaryEditionKey, compareEditionKey, prefs }
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
  /**
   * Account the reader is signed in as. Defaults to the Supabase session's
   * user; passed explicitly by tests. Null means signed out.
   */
  ownerId?: string | null
  /** True once the reader has touched the page (tap, key, wheel); a late cloud record then never moves it. */
  interactedRef?: MutableRefObject<boolean>
  /** The resolved place is in another chapter (or book): load it. */
  onRemoteResume?: (place: LabBookPlace) => void
  /** The resolved place is in the chapter already open: restore to it without a reload. */
  onResolvedPlace?: (place: LabBookPlace) => void
  /** Test hook: the initial cloud wait, ms. */
  initialCloudWaitMs?: number
}): {
  notePlace: (reason: LabPlaceReason, at?: { sequentialChapter?: number; paragraphIndex?: number; wordIndex?: number }) => void
  /**
   * False while a signed-in reader is still resolving its first place
   * (local record + cloud record, validated against the loaded manifest).
   * The reader must not paint a chapter until this is true; it flips after
   * the merge, a failed fetch, a signed-out verdict, or the bounded wait.
   */
  initialPositionResolved: boolean
  biblicalBook: string
  /** Sequential chapters of the current library book the reader has finished. */
  finishedChapters: Set<number>
  /** Record that the reader turned past (or heard out) the given chapter of the current library book. */
  markChapterFinished: (sequentialChapter: number) => void
  /** Current in-memory record (pins + finished), for read-only views such as the picker. */
  readPositionState: () => LabPositionState
} {
  const { session, likelyAuthenticated, isLoading: authLoading } = useAuth()
  const liveToken = args.authToken !== undefined ? args.authToken : (session?.access_token ?? null)
  const ownerId = args.ownerId !== undefined ? args.ownerId : (session?.user?.id ?? null)
  const deviceIdRef = useRef(readLabDeviceId())
  // Seeded from the stored record below so a reload never restarts at 0 and
  // loses a same-millisecond tie-break against an older place.
  const revRef = useRef(0)
  const controllerRef = useRef<LabPositionController | null>(null)
  const syncRef = useRef<ReturnType<typeof createLabPositionSync> | null>(null)
  const cloudDoneRef = useRef(false)
  // Whether the record this device booted with was this account's own. Set
  // once per account by `reconcileOwner`; it decides whether the account's
  // row outranks the device on the first merge.
  const ownershipRef = useRef<LabPositionOwnership>('own')
  const ownerAppliedRef = useRef<string | null | undefined>(undefined)
  const onRemoteResumeRef = useRef(args.onRemoteResume)
  onRemoteResumeRef.current = args.onRemoteResume
  const onResolvedPlaceRef = useRef(args.onResolvedPlace)
  onResolvedPlaceRef.current = args.onResolvedPlace
  const bookRef = useRef(args.book)
  bookRef.current = args.book
  // Initial resolution. A device that looks signed in (live token, cached
  // Supabase session, or the signed-in cookie) waits for the cloud record
  // before the reader paints a chapter, so the first paint is the resolved
  // place and not the local guess that a newer cloud record then replaces.
  const [initialPositionResolved, setInitialPositionResolved] = useState(() => {
    if (args.sourceLocked) return true
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
    if (args.authToken !== undefined) return !args.authToken
    return !(session || likelyAuthenticated)
  })
  const initialResolvedRef = useRef(initialPositionResolved)
  const settleInitial = useCallback(() => {
    if (initialResolvedRef.current) return
    initialResolvedRef.current = true
    setInitialPositionResolved(true)
  }, [])
  // The in-flight GET, started as soon as a token exists so the merge (which
  // waits for the manifest) does not also wait for the network.
  const cloudFetchRef = useRef<{ token: string; promise: Promise<LabPositionState | null> } | null>(null)
  const cloudRecord = useCallback((token: string) => {
    if (cloudFetchRef.current?.token === token) return cloudFetchRef.current.promise
    const promise = fetchLabPositionCloud(token)
    cloudFetchRef.current = { token, promise }
    return promise
  }, [])
  // Bumped whenever the finished map changes (finish, cloud apply) so views
  // re-derive their Set; the controller itself is ref-held.
  const [finishedRevision, setFinishedRevision] = useState(0)

  // Null until the first render has a controller to inspect; then a boolean.
  const writesArmedRef = useRef<boolean | null>(null)
  const reconcileOwnerRef = useRef<((userId: string | null) => void) | null>(null)
  const armWrites = useCallback(() => { writesArmedRef.current = true }, [])

  if (!controllerRef.current) {
    const deviceId = deviceIdRef.current
    const local = migrateLegacyFinishedChapters(readLabPositionLocal(deviceId))
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

  /**
   * Position writes are armed at mount unless the reader is showing a place
   * it invented. A signed-in device with nothing stored paints the Genesis 1
   * fallback; settling that as the account's place — and PUTting it — is how
   * a real reading history was demoted to "Genesis 1 · <1% read"
   * (2026-09-07). Such a reader writes nothing until its account's record has
   * had its say. A reader with a stored place, a library handoff, or an
   * offline/signed-out reader has nothing to wait for.
   */
  if (writesArmedRef.current === null) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    const looksSignedIn = args.authToken !== undefined ? Boolean(args.authToken) : Boolean(session || likelyAuthenticated)
    const inventedPlace = !args.sourceLocked && !offline && looksSignedIn && resumePlace(controllerRef.current.state()) === null
    writesArmedRef.current = !inventedPlace
  }

  /**
   * Sign-in reconciliation, before anything is merged or written: the
   * account's own record is kept, a signed-out one adopted, another
   * account's dropped from this device (never merged, never pushed).
   */
  const reconcileOwner = (userId: string | null) => {
    const controller = controllerRef.current
    if (!controller || !userId || ownerAppliedRef.current === userId) return
    ownerAppliedRef.current = userId
    const current = controller.state()
    const adoption = adoptLabPositionRecord(current, userId)
    ownershipRef.current = adoption.status
    if (adoption.state === current) return
    // Merge-before-write would resurrect a dropped record from localStorage.
    if (adoption.status === 'dropped') clearLabPositionLocal()
    controller.replace(adoption.state)
    writeLabPositionLocal(adoption.state)
  }
  reconcileOwnerRef.current = reconcileOwner

  useEffect(() => {
    const sync = createLabPositionSync({ token: liveToken })
    syncRef.current = sync
    if (sync.isDirty()) void sync.flush()
    const onOnline = () => { void syncRef.current?.flush() }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [liveToken])

  // Bounded wait: the local place paints after this even if the cloud (or the
  // manifest it is validated against) has not answered.
  useEffect(() => {
    if (initialResolvedRef.current) return
    const id = window.setTimeout(settleInitial, args.initialCloudWaitMs ?? LAB_INITIAL_CLOUD_WAIT_MS)
    return () => window.clearTimeout(id)
    // Armed once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The signed-in hint was wrong (stale cookie): nothing to wait for.
  useEffect(() => {
    if (args.authToken !== undefined || authLoading || session) return
    armWrites()
    settleInitial()
  }, [args.authToken, armWrites, authLoading, session, settleInitial])

  // Ownership first: nothing may merge or be written under the wrong account.
  useEffect(() => {
    reconcileOwnerRef.current?.(ownerId)
  }, [ownerId])

  // Safety net. Writes held for the account's record are released after this
  // even if the record never answers, so a genuinely new reader's first
  // session is not dropped for good. The server's acknowledgement guard is
  // what protects an existing row from anything written in that state.
  useEffect(() => {
    if (writesArmedRef.current) return
    const id = window.setTimeout(armWrites, LAB_POSITION_WRITE_ARM_MS)
    return () => window.clearTimeout(id)
    // Armed once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Warm the GET as soon as the token is known.
  useEffect(() => {
    if (args.sourceLocked || !liveToken || cloudDoneRef.current) return
    void cloudRecord(liveToken)
  }, [args.sourceLocked, cloudRecord, liveToken])

  useEffect(() => {
    if (args.sourceLocked || !liveToken || cloudDoneRef.current) return
    // The boot render spreads the Genesis fallback (two chapters) under the
    // resume place; merging against that list would discard every cloud
    // place outside Genesis 1-2. Wait for the loaded manifest.
    if (args.book.chaptersProvisional || args.book.chapters.length === 0) return
    let cancelled = false
    const chapters = args.book.chapters
    reconcileOwnerRef.current?.(ownerId)
    void cloudRecord(liveToken).then((cloud) => {
      if (cancelled) return
      if (!cloud) {
        // Failed or empty answer: paint the local place now; the next
        // chapter list retries the fetch. The verdict is in either way, so
        // the reader may write again.
        if (cloudFetchRef.current?.token === liveToken) cloudFetchRef.current = null
        armWrites()
        settleInitial()
        return
      }
      const controller = controllerRef.current
      if (!controller) return
      // A device record that was never this account's does not outrank the
      // account's own row, however recent its clock says it is.
      const preferIncomingSettle = shouldPreferAccountSettle(controller.state(), cloud, ownershipRef.current)
      const next = controller.applyCloud(cloud, chapters, labLibraryBookId(bookRef.current), { preferIncomingSettle })
      ownershipRef.current = 'own'
      // The reader painted a place it invented (the bounded wait expired
      // before this answered) — it has nothing of its own to lose, so the
      // account's record resolves it like a first paint.
      const paintedInventedPlace = !writesArmedRef.current
      armWrites()
      // Latch only now: the record was merged against the real chapter list.
      cloudDoneRef.current = true
      writeLabPositionLocal(next, { authoritative: true })
      syncRef.current?.persist(next)
      setFinishedRevision(revision => revision + 1)
      const initial = !initialResolvedRef.current || (paintedInventedPlace && !args.interactedRef?.current)
      settleInitial()
      const resume = resumePlace(next)
      const current = bookRef.current
      if (!resume) return
      const currentBookId = current.bookId && current.bookId !== 'bible'
        ? current.bookId
        : biblicalBookId(current.headerBook)
      const sameChapter = resume.sequentialChapter === current.chapterNumber && resume.bookId === currentBookId
      if (!initial) {
        // The reader has painted. Follow only forward, inside this book, and
        // only while the reader has not touched the page.
        const followed = shouldFollowLateCloudResume({
          current: { bookId: currentBookId, sequentialChapter: current.chapterNumber, paragraphIndex: args.placeRef.current.paragraphIndex },
          incoming: resume,
          interacted: Boolean(args.interactedRef?.current),
        })
        if (!followed) return
      }
      if (!sameChapter) {
        onRemoteResumeRef.current?.(resume)
        return
      }
      args.placeRef.current = { paragraphIndex: resume.paragraphIndex, wordIndex: resume.wordIndex }
      onResolvedPlaceRef.current?.(resume)
    })
    return () => { cancelled = true }
  }, [args.authToken, args.book.chapters, args.interactedRef, args.placeRef, args.sourceLocked, armWrites, cloudRecord, liveToken, ownerId, settleInitial])

  const notePlace = useCallback((reason: LabPlaceReason, at?: { sequentialChapter?: number; paragraphIndex?: number; wordIndex?: number }) => {
    // Nothing is painted while the first place is still being resolved; a
    // note now would persist the provisional tuple. And a signed-in reader
    // showing a place it invented writes nothing at all until its account's
    // record has answered.
    if (args.writesSuspended || !initialResolvedRef.current || !writesArmedRef.current) return
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

  const markChapterFinished = useCallback((sequentialChapter: number) => {
    const controller = controllerRef.current
    if (!controller) return
    const before = controller.state()
    const after = controller.finish({ bookId: labLibraryBookId(bookRef.current), sequentialChapter })
    if (after !== before) setFinishedRevision(revision => revision + 1)
  }, [])

  const libraryBookId = labLibraryBookId(args.book)
  const finishedChapters = useMemo(
    () => controllerRef.current ? finishedChaptersFor(controllerRef.current.state(), libraryBookId) : new Set<number>(),
    // finishedRevision is the change signal for the ref-held record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [finishedRevision, libraryBookId],
  )
  const readPositionState = useCallback(() => controllerRef.current?.state() ?? readLabPositionLocal(deviceIdRef.current), [])

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
    initialPositionResolved,
    biblicalBook: args.book.bookId && args.book.bookId !== 'bible'
      ? args.book.bookId
      : biblicalBookId(args.book.headerBook),
    finishedChapters,
    markChapterFinished,
    readPositionState,
  }
}
