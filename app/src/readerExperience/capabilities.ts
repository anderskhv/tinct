import type { Book, Edition, EditionData, ThreadsData } from '../types'
import type { ReaderCapabilities, ReaderNavigationKind } from './contracts'

export interface ReaderCapabilityInput {
  book: Book
  primaryEdition: Edition
  data?: EditionData | null
  threads?: ThreadsData | null
  hasWordTimings?: boolean
}

export function readerNavigationKind(book: Book, data?: EditionData | null): ReaderNavigationKind {
  if (book.id === 'bible') return 'bible-tree'
  if (data?.sections?.length) return 'sections'
  return 'chapters'
}

export function readerCapabilities(input: ReaderCapabilityInput): ReaderCapabilities {
  const alternatives = input.book.editions.filter(edition => edition.key !== input.primaryEdition.key)
  return {
    canCompare: alternatives.some(edition => edition.aligned),
    canListen: input.primaryEdition.hasAudio === true,
    canFollowWords: input.primaryEdition.hasAudio === true && input.hasWordTimings === true,
    hasCast: Boolean(input.threads?.characters?.length),
    navigationKind: readerNavigationKind(input.book, input.data),
  }
}
