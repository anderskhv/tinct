import { BOOKS } from '../data/bookRegistry'
import {
  LIBRARY_BOOK_META_BY_ID,
  LIBRARY_HOUSES,
  LIBRARY_SHELVES,
  getBookDisplayYear,
} from '../data/libraryTaxonomy'
import type { Book, Edition, EditionKey, Language, Style } from '../types'

const FALLBACK_COVER_BACKGROUND = '#2c2417'
const FALLBACK_COVER_ACCENT = '#c9a45c'

export type PreReaderEditionProvenance =
  | 'human-translation'
  | 'authorial-original'
  | 'published-edition'
  | 'tinct-ai-adaptation'

export interface PreReaderCoverViewModel {
  kind: 'generated'
  background: string
  accent: string
}

export interface PreReaderAvailability {
  cover: boolean
  chapterText: boolean
  audio: boolean
  compare: boolean
  optionalPreface: boolean
}

export interface PreReaderEditionViewModel {
  key: EditionKey
  language: Language
  style: Style
  label: string
  translator: string | null
  year: number | null
  aligned: boolean
  group: 'human' | 'modern'
  provenance: PreReaderEditionProvenance
  provenanceLabel: string
  availability: Pick<PreReaderAvailability, 'chapterText' | 'audio' | 'compare'>
}

export interface PreReaderBookViewModel {
  id: string
  title: string
  author: string
  summary: string
  displayYear: string
  wordCount: number | null
  cover: PreReaderCoverViewModel
  shelfIds: string[]
  houseIds: string[]
  topics: string[]
  editions: PreReaderEditionViewModel[]
  availability: PreReaderAvailability
  catalogueIndex: number
}

export interface PreReaderShelfViewModel {
  id: string
  title: string
  subtitle: string
  hue: number
  books: PreReaderBookViewModel[]
}

export interface PreReaderHouseViewModel {
  id: string
  title: string
  subtitle: string
  hue: number
  shelves: PreReaderShelfViewModel[]
}

export interface PreReaderCatalogue {
  books: PreReaderBookViewModel[]
  booksById: ReadonlyMap<string, PreReaderBookViewModel>
  houses: PreReaderHouseViewModel[]
}

export interface SerializablePreReaderCatalogue {
  books: PreReaderBookViewModel[]
  houses: Array<Omit<PreReaderHouseViewModel, 'shelves'> & {
    shelves: Array<Omit<PreReaderShelfViewModel, 'books'> & { bookIds: string[] }>
  }>
}

export interface BookDetailViewModel {
  book: PreReaderBookViewModel
  facts: {
    displayYear: string | null
    wordCount: number | null
    editionCount: number
    languages: Language[]
  }
}

export interface EditionSelectionViewModel {
  bookId: string
  title: string
  selectedEditionKey: EditionKey
  humanEditions: PreReaderEditionViewModel[]
  modernEditions: PreReaderEditionViewModel[]
  compareOptions: PreReaderEditionViewModel[]
}

export interface SavedReaderPlaceInput {
  bookId: string
  chapterNumber: number
  page?: number
  paragraphIndex?: number
}

export interface SavedProgressInput extends SavedReaderPlaceInput {
  editionKey?: EditionKey
  percent?: number
  updatedAt?: number
}

export interface ReadingHistoryInput {
  bookId: string
  lastReadAt: number
  summary?: string
}

export interface ReturningReaderViewModel {
  book: PreReaderBookViewModel
  editionKey: EditionKey
  percent: number | null
  lastReadAt: number | null
  historySummary: string | null
  savedPlace: SavedReaderPlaceInput
  handoff: ReaderHandoffIntent
}

export interface ReaderHandoffSelection {
  bookId: string
  primaryEditionKey: EditionKey
  compareEditionKey?: EditionKey
  audioEditionKey?: EditionKey
  savedPlace?: SavedReaderPlaceInput
}

export interface ReaderHandoffIntent {
  kind: 'open-reader'
  bookId: string
  primaryEditionKey: EditionKey
  compareEditionKey?: EditionKey
  audioEditionKey?: EditionKey
  savedPlace?: SavedReaderPlaceInput
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))]
}

function provenanceFor(edition: Edition): Pick<PreReaderEditionViewModel, 'group' | 'provenance' | 'provenanceLabel'> {
  if (edition.style === 'modern') {
    return { group: 'modern', provenance: 'tinct-ai-adaptation', provenanceLabel: 'Tinct AI adaptation' }
  }
  if (edition.translator) {
    return {
      group: 'human',
      provenance: 'human-translation',
      provenanceLabel: `Human translation by ${edition.translator}`,
    }
  }
  if (edition.style === 'original') {
    return { group: 'human', provenance: 'authorial-original', provenanceLabel: 'Original public-domain text' }
  }
  return { group: 'human', provenance: 'published-edition', provenanceLabel: 'Published public-domain edition' }
}

function editionViewModels(editions: Edition[]): PreReaderEditionViewModel[] {
  const comparableKeys = new Set(
    editions.filter(edition => edition.aligned).map(edition => edition.key),
  )
  return editions.map(edition => ({
    key: edition.key,
    language: edition.language,
    style: edition.style,
    label: edition.label,
    translator: edition.translator || null,
    year: edition.year ?? null,
    aligned: edition.aligned,
    ...provenanceFor(edition),
    availability: {
      // BOOKS is the publication boundary. The exhaustive asset test enforces
      // that every registered edition has renderable chapter content.
      chapterText: true,
      audio: edition.hasAudio === true,
      compare: edition.aligned && comparableKeys.size > 1,
    },
  }))
}

function bookViewModel(book: Book, catalogueIndex: number): PreReaderBookViewModel {
  const meta = LIBRARY_BOOK_META_BY_ID[book.id]
  if (!meta) throw new Error(`Published book ${book.id} is missing library taxonomy metadata`)
  const invalidShelf = meta.shelves.find(shelfId => !LIBRARY_SHELVES[shelfId])
  if (invalidShelf) throw new Error(`Published book ${book.id} references unknown shelf ${invalidShelf}`)
  const houseIds = LIBRARY_HOUSES
    .filter(house => meta.shelves.some(shelfId => house.shelves.includes(shelfId)))
    .map(house => house.id)
  if (!houseIds.length) throw new Error(`Published book ${book.id} is not classified into a library house`)

  const editions = editionViewModels(book.editions)
  const summary = book.description?.trim() || meta.blurb?.trim() || `${book.title} by ${book.author}.`
  const cover = {
    kind: 'generated' as const,
    background: book.coverColor || FALLBACK_COVER_BACKGROUND,
    accent: book.coverAccent || FALLBACK_COVER_ACCENT,
  }
  return {
    id: book.id,
    title: book.title.trim(),
    author: book.author.trim(),
    summary,
    displayYear: getBookDisplayYear(book, meta),
    wordCount: book.wordCount ?? null,
    cover,
    shelfIds: [...meta.shelves],
    houseIds,
    topics: unique([
      meta.tradition,
      meta.form,
      meta.era,
      ...meta.themes,
      ...meta.shelves.flatMap(shelfId => [LIBRARY_SHELVES[shelfId].title, LIBRARY_SHELVES[shelfId].sub]),
      ...houseIds.flatMap(houseId => {
        const house = LIBRARY_HOUSES.find(candidate => candidate.id === houseId)
        return [house?.title, house?.sub]
      }),
    ]),
    editions,
    availability: {
      cover: true,
      chapterText: editions.some(edition => edition.availability.chapterText),
      audio: editions.some(edition => edition.availability.audio),
      compare: editions.some(edition => edition.availability.compare),
      // Published books are required to have an English onboarding asset;
      // the exhaustive asset test below guards that publication contract.
      optionalPreface: true,
    },
    catalogueIndex,
  }
}

export function buildPreReaderCatalogue(): PreReaderCatalogue {
  const books = BOOKS.map(bookViewModel)
  const booksById = new Map(books.map(book => [book.id, book]))
  const houses = LIBRARY_HOUSES.map(house => ({
    id: house.id,
    title: house.title,
    subtitle: house.sub,
    hue: house.hue,
    shelves: house.shelves.map(shelfId => {
      const shelf = LIBRARY_SHELVES[shelfId]
      return {
        id: shelfId,
        title: shelf.title,
        subtitle: shelf.sub,
        hue: shelf.hue,
        books: books.filter(book => book.shelfIds.includes(shelfId)),
      }
    }).filter(shelf => shelf.books.length > 0),
  })).filter(house => house.shelves.length > 0)
  return { books, booksById, houses }
}

export const PRE_READER_CATALOGUE = buildPreReaderCatalogue()

export function serializePreReaderCatalogue(
  catalogue: PreReaderCatalogue = PRE_READER_CATALOGUE,
): SerializablePreReaderCatalogue {
  return {
    books: catalogue.books,
    houses: catalogue.houses.map(house => ({
      id: house.id,
      title: house.title,
      subtitle: house.subtitle,
      hue: house.hue,
      shelves: house.shelves.map(shelf => ({
        id: shelf.id,
        title: shelf.title,
        subtitle: shelf.subtitle,
        hue: shelf.hue,
        bookIds: shelf.books.map(book => book.id),
      })),
    })),
  }
}

function normalized(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function searchScore(book: PreReaderBookViewModel, rawQuery: string): number {
  const query = normalized(rawQuery)
  if (!query) return 1
  const title = normalized(book.title)
  const author = normalized(book.author)
  const topics = normalized([book.summary, ...book.topics].join(' '))
  const tokens = query.split(/\s+/).filter(Boolean)
  let score = 0
  if (title === query) score += 10_000
  else if (title.startsWith(query)) score += 5_000
  else if (title.includes(query)) score += 2_500
  if (author === query) score += 8_000
  else if (author.startsWith(query)) score += 4_000
  else if (author.includes(query)) score += 2_000
  for (const token of tokens) {
    if (title.split(/\s+/).includes(token)) score += 900
    else if (title.includes(token)) score += 500
    if (author.split(/\s+/).includes(token)) score += 700
    else if (author.includes(token)) score += 350
    if (topics.includes(token)) score += 100
  }
  return tokens.every(token => `${title} ${author} ${topics}`.includes(token)) ? score : 0
}

export function searchPreReaderBooks(
  query: string,
  catalogue: PreReaderCatalogue = PRE_READER_CATALOGUE,
): PreReaderBookViewModel[] {
  if (!query.trim()) return [...catalogue.books]
  return catalogue.books
    .map(book => ({ book, score: searchScore(book, query) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.book.catalogueIndex - b.book.catalogueIndex)
    .map(result => result.book)
}

export function getBookDetailViewModel(
  bookId: string,
  catalogue: PreReaderCatalogue = PRE_READER_CATALOGUE,
): BookDetailViewModel | null {
  const book = catalogue.booksById.get(bookId)
  if (!book) return null
  return {
    book,
    facts: {
      displayYear: book.displayYear || null,
      wordCount: book.wordCount,
      editionCount: book.editions.length,
      languages: [...new Set(book.editions.map(edition => edition.language))],
    },
  }
}

function defaultEdition(book: PreReaderBookViewModel): PreReaderEditionViewModel | undefined {
  return book.editions.find(edition => edition.style === 'original' && edition.language === 'en')
    || book.editions.find(edition => edition.style === 'modern' && edition.language === 'en')
    || book.editions[0]
}

export function getEditionSelectionViewModel(
  bookId: string,
  selectedEditionKey?: EditionKey,
  catalogue: PreReaderCatalogue = PRE_READER_CATALOGUE,
): EditionSelectionViewModel | null {
  const book = catalogue.booksById.get(bookId)
  if (!book) return null
  const selected = book.editions.find(edition => edition.key === selectedEditionKey) || defaultEdition(book)
  if (!selected) return null
  return {
    bookId: book.id,
    title: book.title,
    selectedEditionKey: selected.key,
    humanEditions: book.editions.filter(edition => edition.group === 'human'),
    modernEditions: book.editions.filter(edition => edition.group === 'modern'),
    compareOptions: selected.aligned
      ? book.editions.filter(edition => edition.key !== selected.key && edition.availability.compare)
      : [],
  }
}

function validPlace(place: SavedReaderPlaceInput | undefined, bookId: string): place is SavedReaderPlaceInput {
  return Boolean(
    place
    && place.bookId === bookId
    && Number.isInteger(place.chapterNumber)
    && place.chapterNumber >= 1
    && (place.page === undefined || (Number.isInteger(place.page) && place.page >= 0))
    && (place.paragraphIndex === undefined || (Number.isInteger(place.paragraphIndex) && place.paragraphIndex >= 0)),
  )
}

export function createReaderHandoffIntent(
  selection: ReaderHandoffSelection,
  catalogue: PreReaderCatalogue = PRE_READER_CATALOGUE,
): ReaderHandoffIntent | null {
  const book = catalogue.booksById.get(selection.bookId)
  const primary = book?.editions.find(edition => edition.key === selection.primaryEditionKey)
  if (!book || !primary?.availability.chapterText) return null

  const intent: ReaderHandoffIntent = {
    kind: 'open-reader',
    bookId: book.id,
    primaryEditionKey: primary.key,
  }
  if (selection.compareEditionKey) {
    const compare = book.editions.find(edition => edition.key === selection.compareEditionKey)
    if (!primary.aligned || !compare || compare.key === primary.key || !compare.availability.compare) return null
    intent.compareEditionKey = compare.key
  }
  if (selection.audioEditionKey) {
    const audio = book.editions.find(edition => edition.key === selection.audioEditionKey)
    if (!audio?.availability.audio) return null
    intent.audioEditionKey = audio.key
  }
  if (selection.savedPlace) {
    if (!validPlace(selection.savedPlace, book.id)) return null
    intent.savedPlace = { ...selection.savedPlace }
  }
  return intent
}

export function buildReturningReaderViewModel(
  progress: SavedProgressInput[],
  history: ReadingHistoryInput[],
  catalogue: PreReaderCatalogue = PRE_READER_CATALOGUE,
): ReturningReaderViewModel[] {
  const historyByBook = new Map(history.map(entry => [entry.bookId, entry]))
  return progress.flatMap(entry => {
    const book = catalogue.booksById.get(entry.bookId)
    if (!book || !validPlace(entry, entry.bookId)) return []
    const edition = book.editions.find(candidate => candidate.key === entry.editionKey) || defaultEdition(book)
    if (!edition) return []
    const savedPlace = {
      bookId: book.id,
      chapterNumber: entry.chapterNumber,
      ...(entry.page === undefined ? {} : { page: entry.page }),
      ...(entry.paragraphIndex === undefined ? {} : { paragraphIndex: entry.paragraphIndex }),
    }
    const handoff = createReaderHandoffIntent({
      bookId: book.id,
      primaryEditionKey: edition.key,
      savedPlace,
    }, catalogue)
    if (!handoff) return []
    const historyEntry = historyByBook.get(book.id)
    return [{
      book,
      editionKey: edition.key,
      percent: entry.percent === undefined ? null : Math.max(0, Math.min(100, entry.percent)),
      lastReadAt: entry.updatedAt ?? historyEntry?.lastReadAt ?? null,
      historySummary: historyEntry?.summary?.trim() || null,
      savedPlace,
      handoff,
    }]
  }).sort((a, b) => (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0))
}
