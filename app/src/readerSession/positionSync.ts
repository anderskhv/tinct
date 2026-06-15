import type { ReadingPosition } from '../types'
import { positionFromLocation } from './writer'
import type { ReaderLocation } from './types'

export function buildReadingPositionForWrite(args: {
  location: ReaderLocation
  currentPage: number
  totalPages: number
  now: number
}): ReadingPosition {
  const haveLayout = args.totalPages > 1
  return positionFromLocation(args.location, args.now, {
    currentPage: haveLayout ? args.currentPage : 0,
    totalPages: haveLayout ? args.totalPages : 1,
  })
}
