/**
 * A registered book as the margin reader's text (public/lab/addbook/js/tinct-book.js).
 *
 * The margin reader reads an EPUB as chapters of block paragraphs; a Tinct
 * edition is chapters of paragraph strings. Each edition paragraph becomes one
 * paragraph there, in order, so a place carries over 1:1: chapter number,
 * paragraph index and word index (the reader's `\S+` words after the
 * `_emphasis_` delimiters are taken out, emphasisText.ts) mean the same in
 * both. That is also the anchor plan for the port: a margin highlight or card
 * anchored at (chapter, paragraph, word) is a book-reader anchor.
 *
 * Pure: no storage, no network.
 */
import { stripUnderscoreEmphasis } from '../emphasisText'
import { editionHold } from '../../data/editionAvailability'
import { defaultPrimaryEditionKey } from '../../data/editionDefaults'
import type { LabBookPlace } from '../labPosition'
import type { Book, EditionData } from '../../types'

export interface MarginPreviewParagraph {
  /** The paragraph as shown: the edition's text with `_emphasis_` delimiters taken out. */
  text: string
  /** Emphasised character ranges of `text`, [start, end). */
  em?: Array<[number, number]>
}

export interface MarginPreviewChapter {
  number: number
  title: string
  /** The part the chapter belongs to ("Part I — The Window"), when the edition has parts. */
  section?: string
  paragraphs: MarginPreviewParagraph[]
}

/** Where the preview opens when it has no newer place of its own: the book reader's place, read only. */
export interface MarginPreviewStart {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
  /** When the book reader saved that place (0: no place; the book's start). */
  updatedAt: number
}

export interface MarginPreviewBook {
  bookId: string
  editionKey: string
  editionLabel: string
  title: string
  author: string
  language: string
  chapters: MarginPreviewChapter[]
  start: MarginPreviewStart
  /** The book reader for the same book, with the preview turned off. */
  normalHref: string
}

/** The book reader for this book, the opt-in turned off (marginPreviewFlag.ts). */
export function normalReaderHref(bookId: string): string {
  return `/reader?book=${encodeURIComponent(bookId)}&margin=0`
}

/** Registered, readable books only: never the Bible (1,189 chapters, its own reader) or a reader's own book. */
export function isMarginPreviewBook(book: Book | undefined): book is Book {
  return !!book && book.id !== 'bible' && !book.localOnly && book.editions.some(edition => !editionHold(book.id, edition.key))
}

/**
 * The main edition, as the book reader opens it (option B, 2026-10-14: the
 * main edition, never the compare one): the edition the book's saved place was
 * read in, else the reader's chosen main edition when this book has it, else
 * the book's default (Modern English). Held editions are skipped.
 */
export function marginPreviewEditionKey(book: Book, opts: { placeEdition?: string; prefsEdition?: string } = {}): string | undefined {
  const usable = (key: string | undefined) => key && book.editions.some(edition => edition.key === key) && !editionHold(book.id, key) ? key : undefined
  return usable(opts.placeEdition) ?? usable(opts.prefsEdition) ?? defaultPrimaryEditionKey(book.id, book.editions)
}

export function marginPreviewParagraph(raw: unknown): MarginPreviewParagraph {
  const { text, ranges } = stripUnderscoreEmphasis(typeof raw === 'string' ? raw : '')
  return ranges.length ? { text, em: ranges.map(([a, b]) => [a, b] as [number, number]) } : { text }
}

export function marginPreviewChapters(data: EditionData): MarginPreviewChapter[] {
  const sectionOf = new Map<number, string>()
  for (const section of data.sections ?? []) for (const n of section.chapters ?? []) sectionOf.set(Number(n), section.title)
  return data.chapters
    .filter(chapter => Array.isArray(chapter.paragraphs))
    .map((chapter, i) => {
      const number = Number(chapter.number) || i + 1
      const section = (chapter as { section?: string }).section || sectionOf.get(number)
      return {
        number,
        title: String(chapter.title || `Chapter ${number}`).replace(/\s+/g, ' ').trim(),
        ...(section ? { section } : {}),
        paragraphs: chapter.paragraphs.map(marginPreviewParagraph),
      }
    })
}

/** The newer of two places (by when they were saved), either may be missing. */
export function newerPlace(a: LabBookPlace | null | undefined, b: LabBookPlace | null | undefined): LabBookPlace | null {
  if (!a) return b ?? null
  if (!b) return a
  return b.updatedAt > a.updatedAt || (b.updatedAt === a.updatedAt && b.rev > a.rev) ? b : a
}

const words = (text: string) => text.match(/\S+/g)?.length ?? 0

/**
 * The book reader's place as a place in the preview's text: the same chapter,
 * paragraph and word, checked against the text (a place outside it falls back
 * to its chapter's start, then the book's). A place read in another edition
 * keeps its paragraph only when that edition aligns paragraph by paragraph,
 * and its word is not carried over.
 */
export function marginPreviewStart(place: LabBookPlace | null, chapters: MarginPreviewChapter[], opts: { editionKey: string; aligned: (key: string) => boolean }): MarginPreviewStart {
  const first = chapters[0]?.number ?? 1
  if (!place) return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 }
  const chapter = chapters.find(c => c.number === place.chapterNumber)
  if (!chapter) return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0, updatedAt: place.updatedAt }
  const sameEdition = !place.primaryEditionKey || place.primaryEditionKey === opts.editionKey
  const carries = sameEdition || (opts.aligned(place.primaryEditionKey!) && opts.aligned(opts.editionKey))
  const paragraph = carries ? place.paragraphIndex : 0
  if (paragraph < 0 || paragraph >= chapter.paragraphs.length) return { chapterNumber: chapter.number, paragraphIndex: 0, wordIndex: 0, updatedAt: place.updatedAt }
  const count = words(chapter.paragraphs[paragraph].text)
  const word = sameEdition ? Math.max(0, Math.min(place.wordIndex, Math.max(0, count - 1))) : 0
  return { chapterNumber: chapter.number, paragraphIndex: paragraph, wordIndex: word, updatedAt: place.updatedAt }
}
