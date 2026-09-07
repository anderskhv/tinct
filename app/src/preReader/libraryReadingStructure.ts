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

type SerializedBook = SerializablePreReaderCatalogue['books'][number]
type SerializedEdition = SerializedBook['editions'][number]

/**
 * An edition as the browser sees it, plus the one thing only the build knows:
 * whether this edition is published as chapter shards
 * (`/data/editions-chapters/{bookId}-{editionKey}/`) or as one whole-book
 * JSON. Without the flag the runtime had to *probe* for the manifest and take
 * the 404 as its answer, which meant every library and book-page load fired a
 * handful of 404s at the reader's console for the books that are not sharded
 * (odyssey, the-republic, pride-and-prejudice…). The build already reads
 * these manifests to publish the reading structure, so it can simply say.
 */
export type LibraryEditionWithShards = SerializedEdition & { chapterShards: boolean }

export type LibraryCatalogueWithStructure = SerializablePreReaderCatalogue & {
  books: Array<Omit<SerializedBook, 'editions'> & {
    editions: LibraryEditionWithShards[]
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

function manifestPathFor(publicDirectory: string, bookId: string, editionKey: string): string {
  return path.join(publicDirectory, 'data', 'editions-chapters', `${bookId}-${editionKey}`, 'manifest.json')
}

/** True when this edition ships as chapter shards with a manifest beside them. */
export function hasChapterShards(publicDirectory: string, bookId: string, editionKey: string): boolean {
  return fs.existsSync(manifestPathFor(publicDirectory, bookId, editionKey))
}

function readStructure(publicDirectory: string, bookId: string, editionKey: string): LibraryReadingStructure {
  const manifestPath = manifestPathFor(publicDirectory, bookId, editionKey)
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
        editions: book.editions.map(item => ({
          ...item,
          chapterShards: hasChapterShards(publicDirectory, book.id, item.key),
        })),
        readingStructure: readStructure(publicDirectory, book.id, edition.key),
      }
    }),
  }
}
