/**
 * The margin view's place through the book reader's own position path (useLabPositionSync: the device record,
 * the controller with its dwell and settle rules, the account's record and its guards). The frame reports where it
 * is (js/tinct-book.js); marginPreviewPlace's gate decides what of that is a place; this writes it, and moves the
 * frame when the account holds a newer place (another device's), as the book reader follows one.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getBook } from '../../data/bookRegistry'
import { libraryResumePlace, parseBiblicalPlaceTitle, type LabBookPlace, type LabReaderStateSnapshot } from '../labPosition'
import { readLabPositionLocal } from '../labPositionStore'
import { useLabReadingYear } from '../useLabReadingYear'
import { useLabPositionSync } from '../useLabPositionSync'
import type { LabSource } from '../labSource'
import { pageOfChapter, sameSpot, type MarginSpot } from './marginPreviewAnchors'
import { marginPreviewStart, type MarginPreviewBook } from './marginPreviewModel'
import { createMarginPlaceGate, type MarginPlaceReport } from './marginPreviewPlace'

export interface MarginPlaceBridge {
  /** A report from the frame. `leaving`: the page is being hidden or left (the write goes out at once). */
  report(report: MarginPlaceReport & { screen?: number }, leaving?: boolean): void
  /** The frame's way to be moved to a place (another device's, newer). -> stop listening */
  listen(go: (spot: MarginSpot) => void): () => void
  /** The reader did something in the frame (a tap, key, wheel or touch): reading time counts it as this page's. */
  active(): void
}

const isBible = (model: MarginPreviewBook) => model.bookId === 'bible'

/**
 * The chapter a place is written in, on the source: its number and title, and for the Bible its biblical book and
 * chapter in it (placeFromLabBook keys a Bible place by its book: "Psalms" 23, never "The Bible").
 */
export function setSourceChapter(source: LabSource, model: MarginPreviewBook, chapter: { number: number; title: string }): void {
  source.chapterNumber = chapter.number
  source.chapterTitle = source.chapterLabel = chapter.title
  if (isBible(model)) {
    const parsed = parseBiblicalPlaceTitle(chapter.title)
    source.headerBook = parsed.book
    source.headerChapter = parsed.chapter
  } else source.headerChapter = chapter.title
}

/** The preview's book as the position path's source: the book, its edition's chapter list, the chapter being read. */
export function marginPreviewSource(model: MarginPreviewBook): LabSource {
  const book = getBook(model.bookId)
  const chapter = model.chapters.find(c => c.number === model.start.chapterNumber) ?? model.chapters[0]
  const bible = isBible(model) ? parseBiblicalPlaceTitle(chapter.title) : null
  return {
    bookId: model.bookId,
    editions: book?.editions,
    bookTitle: model.title,
    bookAuthor: model.author,
    editionLabel: model.editionLabel,
    chapterLabel: chapter.title,
    chapterTitle: chapter.title,
    chapterNumber: chapter.number,
    headerBook: bible ? bible.book : model.title,
    headerChapter: bible ? bible.chapter : chapter.title,
    paragraphs: [],
    compareParagraphs: [],
    followParagraphs: [],
    chapters: model.chapters.map(c => ({ number: c.number, title: c.title })),
    cast: [],
  }
}

/**
 * The reader state a margin place carries: its edition; no page (the margin scrolls: the book reader finds the page
 * from the paragraph and word); the compare edition and mode of the book's last place, left as they were.
 */
export function marginReaderState(model: MarginPreviewBook, known: LabBookPlace | null | undefined): LabReaderStateSnapshot {
  const compare = known?.compareEditionKey && known.compareEditionKey !== model.editionKey ? known.compareEditionKey : undefined
  return { pageIndex: 0, primaryEditionKey: model.editionKey, compareEditionKey: compare, readerMode: known?.readerMode ?? 'read' }
}

export function useMarginPreviewPlace(model: MarginPreviewBook, userId: string | null, account?: { authToken: string | null; ownerId: string | null }): MarginPlaceBridge {
  const bookId = model.bookId
  // One source object for the page's life: its chapter follows the place written (below), so the position path
  // builds each place from the chapter it is in (placeFromLabBook: the edition's content revision with it).
  const sourceRef = useRef<LabSource | null>(null)
  if (!sourceRef.current) sourceRef.current = marginPreviewSource(model)
  const placeRef = useRef({ paragraphIndex: model.start.paragraphIndex, wordIndex: model.start.wordIndex })
  // The book's last place (the Bible's: its newest biblical-book pin) for its compare edition and mode.
  const readerStateRef = useRef<LabReaderStateSnapshot>(marginReaderState(model, isBible(model)
    ? libraryResumePlace(readLabPositionLocal(), bookId, id => getBook(id)?.id)
    : readLabPositionLocal().books[bookId]))
  const interactedRef = useRef(false)
  const gate = useMemo(() => createMarginPlaceGate({ bookId, chapters: model.chapters }), [bookId, model.chapters])
  const goRef = useRef<((spot: MarginSpot) => void) | null>(null)
  const queueRef = useRef<Array<{ report: MarginPlaceReport; leaving: boolean }>>([])
  const resolvedRef = useRef(false)
  const initialDoneRef = useRef(false)
  const shownRef = useRef<MarginSpot | null>(null)
  const listeningRef = useRef(false)
  // The reading year's place: the chapter and the screen of it on view (the margin scrolls; a page is a screen).
  const [yearPlace, setYearPlace] = useState({ chapter: sourceRef.current.chapterNumber, page: 0 })

  const aligned = useCallback((key: string) => getBook(bookId)?.editions.find(e => e.key === key)?.aligned !== false, [bookId])

  /** The account holds a newer place: the frame goes there (the first answer only before the reader has acted). */
  const follow = (place: LabBookPlace) => {
    if (!initialDoneRef.current && interactedRef.current) return
    const start = marginPreviewStart(place, model.chapters, { editionKey: model.editionKey, aligned, sequential: isBible(model) })
    const spot = { page: pageOfChapter(model.chapters, start.chapterNumber), para: start.paragraphIndex, word: start.wordIndex }
    if (!spot.page || !goRef.current || sameSpot(spot, shownRef.current) || sameSpot(spot, gate.last())) return
    // Reports about the view being left behind are about a place no longer shown.
    queueRef.current = []
    gate.expectRestore(spot)
    goRef.current(spot)
  }

  const position = useLabPositionSync({
    book: sourceRef.current,
    placeRef,
    readerStateRef,
    // The margin view resolves its place as the book reader does: it waits for the account's record before any
    // write, follows it when it is newer, and only in this book.
    sourceLocked: false,
    resumeLibraryBookId: bookId,
    resolveBeforePaint: true,
    interactedRef,
    // Tests name the account; the page uses the session's (the hook's own useAuth).
    ...(account ? { authToken: account.authToken, ownerId: account.ownerId } : {}),
    onResolvedPlace: follow,
    onRemoteResume: follow,
  })
  const { notePlace, markChapterFinished, initialPositionResolved } = position

  const decide = useCallback((report: MarginPlaceReport, leaving: boolean) => {
    const note = gate.decide(report)
    if (!note) { if (leaving) notePlace('hide'); return }
    const source = sourceRef.current!
    const chapter = model.chapters.find(c => c.number === note.at.chapterNumber)!
    setSourceChapter(source, model, chapter)
    placeRef.current = { paragraphIndex: note.at.paragraphIndex, wordIndex: note.at.wordIndex }
    if (note.finished) markChapterFinished(note.finished)
    notePlace(note.reason, { sequentialChapter: chapter.number, paragraphIndex: note.at.paragraphIndex, wordIndex: note.at.wordIndex })
    if (leaving) notePlace('hide')
  }, [gate, markChapterFinished, model, notePlace])
  const decideRef = useRef(decide)
  decideRef.current = decide

  // Nothing is written before the place is resolved against the account (the book reader's rule); reports wait.
  useEffect(() => {
    if (!initialPositionResolved) return
    resolvedRef.current = true
    initialDoneRef.current = true
    const queued = queueRef.current
    queueRef.current = []
    for (const item of queued) decideRef.current(item.report, item.leaving)
  }, [initialPositionResolved])

  // Reading time and pages (the reading year), as the book reader counts them.
  useLabReadingYear({ userId, bookId, chapter: yearPlace.chapter, page: yearPlace.page, onCover: false, paused: false, listeningRef })

  return useMemo<MarginPlaceBridge>(() => ({
    report(report, leaving = false) {
      if (report.interactions > 0) interactedRef.current = true
      if (report.spot) {
        shownRef.current = report.spot
        const chapter = model.chapters[report.spot.page - 1]?.number
        const page = Math.max(0, Math.floor(Number(report.screen) || 0))
        if (chapter) setYearPlace(current => (current.chapter === chapter && current.page === page ? current : { chapter, page }))
      }
      if (!resolvedRef.current) {
        queueRef.current = [...queueRef.current, { report, leaving }].slice(-20)
        if (leaving) notePlace('hide')
        return
      }
      decideRef.current(report, leaving)
    },
    listen(go) {
      goRef.current = go
      return () => { if (goRef.current === go) goRef.current = null }
    },
    // The reading year hears the reader's actions on this window; the frame's are its own (a frame's events do not
    // reach the page). One plain event stands for them, on the window only.
    active() { window.dispatchEvent(new Event('pointerdown')) },
  }), [model.chapters, notePlace])
}
