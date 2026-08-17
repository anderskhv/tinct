import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Book, EditionData, EditionKey, ReadingPosition } from '../types'
import { canPersistLocation } from './writer'
import { paragraphTargetFromPosition } from './controllerGuards'
import { initialReaderSession, readerSessionReducer } from './reducer'
import { appendReaderSessionShadow } from './shadow'
import type { ReaderView } from './types'

export function readerViewFromMobileIndex(activeView: number): ReaderView {
  if (activeView === 1) return 'compare'
  if (activeView === 2) return 'chat'
  if (activeView === 3) return 'feed'
  if (activeView === 4) return 'cast'
  return 'read'
}

export function useReaderSessionController(args: {
  book: Book
  primaryData: EditionData | null
  currentChapter: number
  currentPage: number
  totalPages: number
  effectiveParagraph: number | undefined
  activeFirstVisibleParagraph: number | undefined
  primaryEditionKey: EditionKey
  activeView: number
  storageReady: boolean
  writeSuspended: boolean
  isLoading: boolean
  savedPos: MutableRefObject<ReadingPosition | null>
}) {
  const {
    book,
    primaryData,
    currentChapter,
    currentPage,
    totalPages,
    effectiveParagraph,
    activeFirstVisibleParagraph,
    primaryEditionKey,
    activeView,
    storageReady,
    writeSuspended,
    isLoading,
    savedPos,
  } = args
  const readerSessionContext = useMemo(() => ({ book, editionData: primaryData }), [book, primaryData])
  const readerSessionRestoreSeedRef = useRef<string | null>(null)
  const [readerSessionState, dispatchReaderSession] = useReducer(
    readerSessionReducer,
    {
      bookId: book.id,
      chapterNumber: currentChapter,
      paragraphIndex: effectiveParagraph,
      scrollFraction: totalPages > 1 ? currentPage / Math.max(totalPages - 1, 1) : 0,
      editionKey: primaryEditionKey,
      activeView: readerViewFromMobileIndex(activeView),
    },
    initialReaderSession,
  )
  const derivedReaderSessionStatus = (!storageReady || writeSuspended || !primaryData || isLoading)
    ? 'loading-edition'
    : 'ready'
  const effectiveReaderSessionStatus = derivedReaderSessionStatus === 'ready'
    ? readerSessionState.status
    : derivedReaderSessionStatus

  useEffect(() => {
    dispatchReaderSession({ type: 'OPEN_BOOK', bookId: book.id, now: Date.now() })
  }, [book.id])

  useEffect(() => {
    if (!primaryData) return
    const restoreSeedKey = `${book.id}:${primaryEditionKey}`
    const canSeedFromSavedPosition =
      readerSessionRestoreSeedRef.current !== restoreSeedKey &&
      savedPos.current?.bookId === book.id
    const restored = canSeedFromSavedPosition
      ? {
          chapterNumber: savedPos.current.chapterNumber,
          // Paragraph zero is the default mount state, not a meaningful
          // restore anchor. Let the stored fraction restore the real place.
          paragraphIndex: paragraphTargetFromPosition(savedPos.current),
          scrollFraction: savedPos.current.scrollFraction ?? 0,
          editionKey: primaryEditionKey,
          activeView: readerViewFromMobileIndex(activeView),
        }
      : {
          chapterNumber: currentChapter,
          paragraphIndex: effectiveParagraph,
          scrollFraction: totalPages > 1 ? currentPage / Math.max(totalPages - 1, 1) : 0,
          editionKey: primaryEditionKey,
          activeView: readerViewFromMobileIndex(activeView),
        }
    readerSessionRestoreSeedRef.current = restoreSeedKey
    dispatchReaderSession({
      type: 'EDITION_READY',
      context: readerSessionContext,
      restored,
      now: Date.now(),
    })
  }, [book.id, primaryData, primaryEditionKey, readerSessionContext])

  useEffect(() => {
    if (!primaryData) return
    dispatchReaderSession({
      type: 'READER_LAYOUT_READY',
      page: currentPage,
      totalPages,
      firstVisibleParagraph: activeFirstVisibleParagraph,
      view: readerViewFromMobileIndex(activeView),
      context: readerSessionContext,
      now: Date.now(),
    })
  }, [activeFirstVisibleParagraph, activeView, currentPage, primaryData, readerSessionContext, totalPages])

  useEffect(() => {
    appendReaderSessionShadow({
      kind: 'position',
      detail: canPersistLocation(readerSessionState.location, readerSessionContext, effectiveReaderSessionStatus),
    })
  }, [effectiveReaderSessionStatus, readerSessionContext, readerSessionState])

  return {
    readerSessionContext,
    readerSessionState,
    dispatchReaderSession,
    readerSessionStatus: effectiveReaderSessionStatus,
  }
}
