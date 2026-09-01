import type { Book, EditionData, EditionKey } from '../types'
import type { ReaderDocument } from './contracts'

export interface ReaderDocumentAdapterInput {
  book: Book
  primaryEditionKey: EditionKey
  primaryData: EditionData
  chapterNumber: number
  compareEditionKey?: EditionKey
  compareData?: EditionData | null
}

export function readerDocumentFromEditionData(input: ReaderDocumentAdapterInput): ReaderDocument {
  const primaryEdition = input.book.editions.find(edition => edition.key === input.primaryEditionKey)
  if (!primaryEdition) throw new Error(`Unknown primary edition ${input.primaryEditionKey} for ${input.book.id}`)

  const chapter = input.primaryData.chapters.find(item => item.number === input.chapterNumber)
  if (!chapter) throw new Error(`Unknown chapter ${input.chapterNumber} for ${input.book.id}`)

  const compareEdition = input.compareEditionKey
    ? input.book.editions.find(edition => edition.key === input.compareEditionKey)
    : undefined
  if (input.compareEditionKey && !compareEdition) {
    throw new Error(`Unknown compare edition ${input.compareEditionKey} for ${input.book.id}`)
  }

  const compareChapter = compareEdition
    ? input.compareData?.chapters.find(item => item.number === input.chapterNumber)
    : undefined

  return {
    book: { id: input.book.id, title: input.book.title, author: input.book.author },
    primaryEdition,
    compareEdition,
    chapter: {
      number: chapter.number,
      title: chapter.title,
      paragraphs: chapter.paragraphs,
      compareParagraphs: compareChapter?.paragraphs ?? [],
    },
    chapters: input.primaryData.chapters.map(item => ({ number: item.number, title: item.title })),
    sections: input.primaryData.sections,
  }
}
