import type { ReadingPosition } from '../types'

export function shouldHoldReaderForCloudRestore(args: {
  storageReady: boolean
  isSignedIn: boolean
  cloudRestoreSettled: boolean
}): boolean {
  const { storageReady, isSignedIn, cloudRestoreSettled } = args
  return !storageReady || (isSignedIn && !cloudRestoreSettled)
}

export function isCloudPositionConfirmedLocally(args: {
  localPos: ReadingPosition | null | undefined
  cloudPos: ReadingPosition
  currentBookId: string
  targetBookId: string
  scrollTolerance?: number
}): boolean {
  const { localPos, cloudPos, currentBookId, targetBookId, scrollTolerance = 0.005 } = args
  if (!localPos) return false
  if (currentBookId !== targetBookId) return false
  if (localPos.bookId !== cloudPos.bookId) return false
  if (localPos.chapterNumber !== cloudPos.chapterNumber) return false
  return Math.abs((localPos.scrollFraction ?? 0) - (cloudPos.scrollFraction ?? 0)) < scrollTolerance
}

export function shouldApplyRemotePosition(args: {
  remoteBookId: string | undefined
  currentBookId: string
}): boolean {
  const { remoteBookId, currentBookId } = args
  return Boolean(remoteBookId) && remoteBookId === currentBookId
}
