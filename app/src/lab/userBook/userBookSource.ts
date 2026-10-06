/**
 * A user book as a reader source: the same `LabSource` every registry book
 * loads into, built from the edition converted on this device. The reader's
 * chapter navigation goes through `loadLabBookSource`, which hands a
 * `userbook-` id to `loadUserBookSource` here; nothing about a user book is
 * ever fetched.
 */
import type { Edition, Language } from '../../types'
import type { LabSource } from '../labSource'
import type { UserBookEdition } from './userEdition'
import { isUserBookId } from './userBookId'
import { registerBookOpening, registerChapterStructure } from '../labParagraphStyle'
import { bookFigures } from '../labFigures'

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
    }))
    chapterLists.set(edition, list)
  }
  return list
}

/** The reader's own copy is one edition. Its key carries the language, which turns on hyphenation where Tinct has patterns. */
export function userBookEditionKey(edition: Pick<UserBookEdition, 'language'>): string {
  const lang = (edition.language || '').toLowerCase().split(/[-_]/)[0]
  return lang === 'en' || lang === 'da' ? `own-${lang}` : 'own'
}

const LANGUAGES = new Set<Language>(['en', 'da', 'de', 'fr', 'it', 'ru'])

export function userBookEditions(edition: UserBookEdition): Edition[] {
  const key = userBookEditionKey(edition)
  const cacheKey = `${key}/${edition.title}`
  const cached = editionLists.get(cacheKey)
  if (cached) return cached
  const lang = (edition.language || '').toLowerCase().split(/[-_]/)[0] as Language
  const list: Edition[] = [{ key, language: LANGUAGES.has(lang) ? lang : 'en', style: 'original', label: 'EPUB', aligned: false, hasAudio: false }]
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
