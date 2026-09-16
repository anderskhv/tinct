export interface LibraryCatalogueBook {
  id: string
  title: string
  author: string
  summary?: string
  blurb?: string
  wordCount?: number | null
  topics?: string[]
  shelfIds?: string[]
  houseIds?: string[]
  art?: { src?: string; srcSet?: string } | null
  discoveryAvailable?: boolean
  stub?: boolean
  comingSoon?: boolean
  unavailable?: boolean
  availability?: { chapterText?: boolean }
}

export interface LibraryCatalogue {
  books: LibraryCatalogueBook[]
  houses?: Array<{
    id: string
    title: string
    subtitle?: string
    shelves?: Array<{ id: string; title: string; subtitle?: string; bookIds?: string[] }>
  }>
}

export function eligibleLibraryBooks(catalogue: LibraryCatalogue | null): LibraryCatalogueBook[] {
  return (catalogue?.books ?? []).filter(book => book.discoveryAvailable !== false
    && book.stub !== true
    && book.comingSoon !== true
    && book.unavailable !== true
    && book.availability?.chapterText !== false)
}

function normalized(value: unknown): string {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function searchLibraryCatalogue(catalogue: LibraryCatalogue | null, query: string): LibraryCatalogueBook[] {
  const books = eligibleLibraryBooks(catalogue)
  const needle = normalized(query)
  if (!needle) return books
  return books.filter(book => normalized([
    book.title,
    book.author,
    book.summary,
    book.blurb,
    ...(book.topics ?? []),
    ...(book.shelfIds ?? []),
    ...(book.houseIds ?? []),
  ].join(' ')).includes(needle))
}

export function estimatedHours(wordCount: number | null | undefined, wordsPerMinute = 250): string | null {
  if (!Number.isFinite(wordCount) || Number(wordCount) <= 0 || !Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) return null
  const hours = Number(wordCount) / wordsPerMinute / 60
  if (hours < 1) return 'Less than 1 hour'
  const rounded = Math.max(1, Math.round(hours))
  return `About ${rounded} ${rounded === 1 ? 'hour' : 'hours'}`
}

export function libraryCataloguePrompt(catalogue: LibraryCatalogue | null): string {
  const books = eligibleLibraryBooks(catalogue)
  const rows = books.map(book => {
    const description = (book.summary || book.blurb || '').replace(/\s+/g, ' ').trim()
    const time = estimatedHours(book.wordCount)
    return `- ${book.id} | ${book.title} | ${book.author}${time ? ` | ${time}` : ''}${description ? ` | ${description}` : ''}`
  })
  return [
    "You are Tinct's librarian. Help the reader choose among the eligible books in the catalogue below.",
    'Recommend no more than three books at a time. Be specific and concise. Ask at most one useful preference question in a response.',
    'Use only the supplied catalogue. Never claim live popularity, unavailable editions, external reviews, or facts not supported by the catalogue.',
    'For every recommended title, append its exact id as [[book:BOOK_ID]]. These markers become working book links in the interface.',
    'Do not discuss a random open book, a page, a chapter, or the reader\'s saved position. This is a separate library-selection conversation.',
    '',
    '[Eligible catalogue]',
    ...rows,
  ].join('\n')
}

export function recommendationBookIds(text: string, catalogue: LibraryCatalogue | null): string[] {
  const eligible = new Map(eligibleLibraryBooks(catalogue).map(book => [book.id, book]))
  const ids: string[] = []
  for (const match of text.matchAll(/\[\[book:([a-z0-9-]+)\]\]/gi)) {
    const id = match[1].toLowerCase()
    if (eligible.has(id) && !ids.includes(id)) ids.push(id)
  }
  if (ids.length) return ids.slice(0, 3)
  const lower = normalized(text)
  for (const book of eligible.values()) {
    if (lower.includes(normalized(book.title)) && !ids.includes(book.id)) ids.push(book.id)
    if (ids.length === 3) break
  }
  return ids
}

export function visibleLibrarianText(text: string): string {
  return text.replace(/\s*\[\[book:[a-z0-9-]+\]\]/gi, '').replace(/\n{3,}/g, '\n\n').trim()
}
