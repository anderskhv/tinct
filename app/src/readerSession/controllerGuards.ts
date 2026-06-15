import type { ReadingPosition } from '../types'

export type LocalFirstCloudAdoption =
  | { kind: 'none' }
  | { kind: 'confirmed'; position: ReadingPosition }
  | { kind: 'corrected'; position: ReadingPosition }

/** Pick the most recently updated position. Falls back to furthest if no timestamps. */
export function pickLatestPosition(a: ReadingPosition | null, b: ReadingPosition | null): ReadingPosition | null {
  if (!a) return b
  if (!b) return a
  if (a.updatedAt && b.updatedAt) return a.updatedAt >= b.updatedAt ? a : b
  if (a.updatedAt) return a
  if (b.updatedAt) return b
  if (a.chapterNumber > b.chapterNumber) return a
  if (b.chapterNumber > a.chapterNumber) return b
  const fracA = a.scrollFraction ?? 0
  const fracB = b.scrollFraction ?? 0
  return fracA >= fracB ? a : b
}

export function paragraphTargetFromPosition(pos: ReadingPosition | null | undefined): number | undefined {
  const paragraph = pos?.lastParagraphIndex
  return typeof paragraph === 'number' && paragraph > 0 ? paragraph : undefined
}

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

export function getLocalFirstCloudAdoption(args: {
  localPos: ReadingPosition | null | undefined
  cloudPos: ReadingPosition | null
  currentBookId: string
  targetBookId: string
}): LocalFirstCloudAdoption {
  const { localPos, cloudPos, currentBookId, targetBookId } = args
  if (!cloudPos) return { kind: 'none' }
  if (isCloudPositionConfirmedLocally({ localPos, cloudPos, currentBookId, targetBookId })) {
    return { kind: 'confirmed', position: cloudPos }
  }
  return { kind: 'corrected', position: cloudPos }
}

export function getCloudRestoreWinner(args: {
  localPos: ReadingPosition | null
  cloudPos: ReadingPosition | null
}): ReadingPosition | null {
  const { localPos, cloudPos } = args
  return pickLatestPosition(localPos, cloudPos)
}

export function shouldApplyRemotePosition(args: {
  remoteBookId: string | undefined
  currentBookId: string
}): boolean {
  const { remoteBookId, currentBookId } = args
  return Boolean(remoteBookId) && remoteBookId === currentBookId
}
