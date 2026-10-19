/**
 * A user book as a reader source: the same `LabSource` every registry book
 * loads into, built from the edition converted on this device. The reader's
 * chapter navigation goes through `loadLabBookSource`, which hands a
 * `userbook-` id to `loadUserBookSource` here; nothing about a user book is
 * ever fetched.
 */
import type { Edition } from '../../types'
import type { LabSource } from '../labSource'
import { editionSource, type UserBookEdition } from './userEdition'
import { PDF_PAGES_EDITION_KEY } from './pdfEditions'
import { EPUB_MARGIN_EDITION_KEY, PHONE_MAX_WIDTH } from './epubView'
import { isUserBookId } from './userBookId'
import { userBookLanguage } from './userBookLanguage'
import { registerBookOpening, registerChapterStructure } from '../labParagraphStyle'
import { bookFigures } from '../labFigures'
import { registerShakespeareSpeakers } from '../labVerseLines'

const editions = new Map<string, UserBookEdition>()
const editionLists = new Map<string, Edition[]>()
const chapterLists = new WeakMap<UserBookEdition, LabSource['chapters']>()

function chapterList(edition: UserBookEdition): LabSource['chapters'] {
  let list = chapterLists.get(edition)
  if (!list) {
    list = edition.chapters.map(item => ({
      number: item.number,
      title: item.title,
      wordCount: item.paragraphs.join(' ').split(/\s+/).filter(Boolean).length,
      paragraphCount: item.paragraphs.length,
      ...(item.author ? { author: item.author } : {}),
    }))
    chapterLists.set(edition, list)
  }
  return list
}

/**
 * The reader's own copy is one edition. Its key carries the language
 * (userBookLanguage: the book's tag normalised, or English text untagged),
 * which turns on hyphenation where Tinct has patterns.
 */
export function userBookEditionKey(edition: Pick<UserBookEdition, 'language' | 'chapters'>): string {
  const lang = userBookLanguage(edition)
  return lang === 'en' || lang === 'da' ? `own-${lang}` : 'own'
}

/**
 * An EPUB is one edition, and on the desktop "Margin view" too: the EPUB in
 * Add a book's margin reader (epubView.ts; choosing it leaves the reader:
 * LabApp). A PDF is two: its Tinct text, read here, and "Original pages", the
 * PDF itself in Add a book's viewer (choosing it there leaves the reader: LabApp).
 */
export function userBookEditions(edition: UserBookEdition, { phone = typeof window !== 'undefined' && window.innerWidth < PHONE_MAX_WIDTH }: { phone?: boolean } = {}): Edition[] {
  const key = userBookEditionKey(edition)
  const pdf = editionSource(edition) !== 'epub'
  const cacheKey = `${key}/${pdf ? 'pdf' : phone ? 'epub' : 'epub-desk'}/${edition.title}`
  const cached = editionLists.get(cacheKey)
  if (cached) return cached
  const language = userBookLanguage(edition) ?? 'en'
  const list: Edition[] = pdf
    ? [
        { key, language, style: 'original', label: 'Tinct text', aligned: false, hasAudio: false },
        { key: PDF_PAGES_EDITION_KEY, language, style: 'original', label: 'Original pages', aligned: false, hasAudio: false },
      ]
    : [
        { key, language, style: 'original', label: 'EPUB', aligned: false, hasAudio: false },
        ...(phone ? [] : [{ key: EPUB_MARGIN_EDITION_KEY, language, style: 'original', label: 'Margin view', aligned: false, hasAudio: false } satisfies Edition]),
      ]
  editionLists.set(cacheKey, list)
  return list
}

export function registerUserBook(bookId: string, edition: UserBookEdition): void {
  if (!isUserBookId(bookId)) return
  editions.set(bookId, edition)
  // Headings, list items, labels and links are painted from what the
  // conversion recorded beside each chapter's paragraphs; the book opens under
  // its own title, above the first chapter's heading.
  for (const chapter of edition.chapters) registerChapterStructure(chapter)
  // A play's speakers ("NORA. …") are set as labels, as in Tinct's own plays.
  if (edition.speakers) for (const chapter of edition.chapters) registerShakespeareSpeakers(chapter.paragraphs)
  const first = edition.chapters[0]
  if (first) registerBookOpening(first.title, { title: edition.title, subtitle: edition.subtitle, author: edition.author })
}

export function registeredUserBook(bookId: string): UserBookEdition | null {
  return editions.get(bookId) ?? null
}

export function userBookLabSource(bookId: string, edition: UserBookEdition, chapterNumber: number): LabSource {
  const chapter = edition.chapters.find(item => item.number === chapterNumber) ?? edition.chapters[0]
  const list = userBookEditions(edition)
  return {
    bookId,
    editions: list,
    bookTitle: edition.title,
    bookAuthor: edition.author,
    ...(edition.collection || edition.chapters.some(item => item.author) ? { collection: true as const } : {}),
    editionLabel: list[0].label,
    chapterLabel: chapter.title,
    chapterTitle: chapter.title,
    chapterNumber: chapter.number,
    headerBook: edition.title,
    headerChapter: chapter.title,
    paragraphs: chapter.paragraphs,
    compareParagraphs: [],
    followParagraphs: chapter.paragraphs.map((text, index) => ({ index, text })),
    chapters: chapterList(edition),
    ...(edition.chapters.some(item => item.figures?.length) ? { figures: bookFigures(edition.chapters) } : {}),
    cast: [],
  }
}

/** `loadLabBookSource` for a user book: the registered edition's chapter, or an error like a missing edition. */
export async function loadUserBookSource(input: { bookId: string; chapterNumber?: number }): Promise<LabSource> {
  const edition = registeredUserBook(input.bookId)
  if (!edition) throw new Error('This book is not open on this device')
  return userBookLabSource(input.bookId, edition, input.chapterNumber ?? 1)
}
