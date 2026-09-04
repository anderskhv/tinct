import fs from 'node:fs'
import path from 'node:path'
import type { SerializablePreReaderCatalogue } from './catalogue'

export interface LibraryReadingChapter {
  number: number
  title: string
  paragraphCount: number
}

export interface LibraryReadingStructure {
  editionKey: string
  totalParagraphs: number
  chapters: LibraryReadingChapter[]
}

export type LibraryCatalogueWithStructure = SerializablePreReaderCatalogue & {
  books: Array<SerializablePreReaderCatalogue['books'][number] & {
    readingStructure: LibraryReadingStructure
  }>
}

type ChapterLike = { number?: unknown; title?: unknown; paragraphCount?: unknown; paragraphs?: unknown }

function visibleReadingEdition(book: SerializablePreReaderCatalogue['books'][number]) {
  const visible = book.editions.filter(edition => edition.language !== 'da' && edition.availability.chapterText)
  return visible.find(edition => edition.style === 'original' && edition.language === 'en')
    || visible.find(edition => edition.style === 'modern' && edition.language === 'en')
    || visible[0]
}

function normalizeChapters(chapters: ChapterLike[]): LibraryReadingChapter[] {
  return chapters.map((chapter, index) => {
    const paragraphCount = Number.isInteger(chapter.paragraphCount) && Number(chapter.paragraphCount) > 0
      ? Number(chapter.paragraphCount)
      : Array.isArray(chapter.paragraphs) && chapter.paragraphs.length > 0
        ? chapter.paragraphs.length
        : 1
    return {
      number: Number.isInteger(chapter.number) && Number(chapter.number) > 0 ? Number(chapter.number) : index + 1,
      title: typeof chapter.title === 'string' && chapter.title.trim() ? chapter.title.trim() : `Chapter ${index + 1}`,
      paragraphCount,
    }
  })
}

function readStructure(publicDirectory: string, bookId: string, editionKey: string): LibraryReadingStructure {
  const manifestPath = path.join(publicDirectory, 'data', 'editions-chapters', `${bookId}-${editionKey}`, 'manifest.json')
  const editionPath = path.join(publicDirectory, 'data', 'editions', `${bookId}-${editionKey}.json`)
  const sourcePath = fs.existsSync(manifestPath) ? manifestPath : editionPath
  if (!fs.existsSync(sourcePath)) throw new Error(`No published reading structure for ${bookId}/${editionKey}`)
  const parsed = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as { chapters?: ChapterLike[] }
  const chapters = normalizeChapters(Array.isArray(parsed.chapters) ? parsed.chapters : [])
  if (!chapters.length) throw new Error(`No chapters in published reading structure for ${bookId}/${editionKey}`)
  return {
    editionKey,
    totalParagraphs: chapters.reduce((sum, chapter) => sum + chapter.paragraphCount, 0),
    chapters,
  }
}

export function addLibraryReadingStructures(
  catalogue: SerializablePreReaderCatalogue,
  publicDirectory: string,
): LibraryCatalogueWithStructure {
  return {
    ...catalogue,
    books: catalogue.books.map(book => {
      const edition = visibleReadingEdition(book)
      if (!edition) throw new Error(`Published book ${book.id} has no readable non-Danish edition`)
      return {
        ...book,
        readingStructure: readStructure(publicDirectory, book.id, edition.key),
      }
    }),
  }
}
