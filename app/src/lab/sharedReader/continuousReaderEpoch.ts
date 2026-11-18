import type { ContinuousReaderAnchor } from './continuousReaderWindow'
import { tokenizeHearingWords } from '../labHearing'

export interface ContinuousReaderEpoch {
  bookId: string
  editionKey: string
  chapterNumber: number
  navigation: number
}

export function sameContinuousReaderEpoch(a: ContinuousReaderEpoch, b: ContinuousReaderEpoch): boolean {
  return a.bookId === b.bookId && a.editionKey === b.editionKey
    && a.chapterNumber === b.chapterNumber && a.navigation === b.navigation
}

/** A scroll report is accepted only for the content currently on screen. */
export function acceptContinuousReaderPlace(
  reported: ContinuousReaderEpoch,
  current: ContinuousReaderEpoch,
  ready: boolean,
  suspended: boolean,
  anchor: ContinuousReaderAnchor,
  paragraphs: readonly string[],
): boolean {
  return ready && !suspended && sameContinuousReaderEpoch(reported, current)
    && Number.isInteger(anchor.paragraphIndex) && anchor.paragraphIndex >= 0 && anchor.paragraphIndex < paragraphs.length
    && Number.isInteger(anchor.wordIndex) && anchor.wordIndex >= 0
    && anchor.wordIndex < tokenizeHearingWords(paragraphs[anchor.paragraphIndex]).length
}
