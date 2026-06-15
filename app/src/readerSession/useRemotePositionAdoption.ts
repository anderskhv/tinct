import { useCallback } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { EditionKey, ReadingPosition } from '../types'
import { markCloudLoaded, markCloudPosition, markUserNav } from './positionSync'
import { paragraphTargetFromPosition, shouldApplyRemotePosition } from './controllerGuards'
import { readerViewFromMobileIndex } from './useReaderSessionController'
import type { ReaderBookContext, ReaderSessionEvent } from './types'

export function useRemotePositionAdoption(args: {
  bookId: string
  primaryEditionKey: EditionKey
  activeView: number
  readerSessionContext: ReaderBookContext
  readerSessionRevision: number
  dispatchReaderSession: Dispatch<ReaderSessionEvent>
  savedPos: MutableRefObject<ReadingPosition | null>
  targetParagraphRef: MutableRefObject<number | undefined>
  setCurrentChapter: Dispatch<SetStateAction<number>>
  setCurrentPage: Dispatch<SetStateAction<number>>
  setTotalPages: Dispatch<SetStateAction<number>>
  setReaderKey: Dispatch<SetStateAction<number>>
}): (remotePos: ReadingPosition) => void {
  const {
    bookId,
    primaryEditionKey,
    activeView,
    readerSessionContext,
    readerSessionRevision,
    dispatchReaderSession,
    savedPos,
    targetParagraphRef,
    setCurrentChapter,
    setCurrentPage,
    setTotalPages,
    setReaderKey,
  } = args

  return useCallback((remotePos: ReadingPosition) => {
    if (!remotePos || !remotePos.chapterNumber) return
    if (!shouldApplyRemotePosition({ remoteBookId: remotePos.bookId, currentBookId: bookId })) return
    // Mark this as user-nav so the regression guard widens its window. Remote
    // progress may legitimately move backward when another device navigated.
    markUserNav(bookId)
    markCloudPosition(bookId, remotePos)
    markCloudLoaded(bookId, remotePos)
    dispatchReaderSession({
      type: 'RESTORE_POSITION',
      location: {
        bookId: remotePos.bookId,
        chapterNumber: remotePos.chapterNumber,
        paragraphIndex: remotePos.lastParagraphIndex,
        scrollFraction: remotePos.scrollFraction ?? 0,
        editionKey: primaryEditionKey,
        activeView: readerViewFromMobileIndex(activeView),
        source: 'remote',
        revision: readerSessionRevision,
      },
      context: readerSessionContext,
      source: 'remote',
      now: Date.now(),
    })
    targetParagraphRef.current = paragraphTargetFromPosition(remotePos)
    savedPos.current = remotePos
    setCurrentChapter(remotePos.chapterNumber)
    setCurrentPage(0)
    setTotalPages(1)
    setReaderKey(k => k + 1)
  }, [
    activeView,
    bookId,
    dispatchReaderSession,
    primaryEditionKey,
    readerSessionContext,
    readerSessionRevision,
    savedPos,
    setCurrentChapter,
    setCurrentPage,
    setReaderKey,
    setTotalPages,
    targetParagraphRef,
  ])
}
