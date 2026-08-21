const READER_INTENT_PARAMS = [
  'from',
  'chapter',
  'edition',
  'compare',
  'split',
  'view',
  'demo',
  'preface',
  'signin',
] as const

export function hasReaderIntent(params: URLSearchParams): boolean {
  return READER_INTENT_PARAMS.some(key => params.has(key))
}

export function parseReadChapterPath(pathname: string): { bookId: string; chapter: number } | null {
  const match = pathname.match(/^\/read\/([a-z0-9-]+)\/(\d+)\/?$/i)
  if (!match) return null
  const chapter = parseInt(match[2], 10)
  if (!Number.isFinite(chapter) || chapter < 1) return null
  return { bookId: match[1].toLowerCase(), chapter }
}

/** `#p12` is the twelfth paragraph (1-based). Returns a 0-based reader index. */
export function parseParagraphHash(hash: string): number | undefined {
  const match = (hash || '').match(/^#p(\d+)$/i)
  if (!match) return undefined
  const n = parseInt(match[1], 10)
  if (!Number.isFinite(n) || n < 1) return undefined
  return n - 1
}

export function readerLocationFromUrl(url: { pathname: string; search: string; hash: string }): {
  bookId: string | null
  chapter: number | null
  paragraphIndex: number | undefined
} {
  const params = new URLSearchParams(url.search.startsWith('?') ? url.search.slice(1) : url.search)
  const path = parseReadChapterPath(url.pathname)
  const queryChapter = parseInt(params.get('chapter') || '', 10)
  const chapter = Number.isFinite(queryChapter) && queryChapter >= 1
    ? queryChapter
    : path?.chapter ?? null
  return {
    bookId: path?.bookId ?? null,
    chapter,
    paragraphIndex: parseParagraphHash(url.hash),
  }
}

/**
 * In-app book URLs must not be the bare SEO marketing path `/read/:slug`.
 * A query string tells the Worker to serve the SPA instead of book.html.
 * A numeric chapter path such as `/read/odyssey/1` is preserved so a signed-in
 * reader who arrived on that URL stays on the same chapter address.
 */
export function readerAppPath(
  bookId: string,
  currentSearch = '',
  currentHash = '',
  currentPathname = typeof window !== 'undefined' ? window.location.pathname : '',
): string {
  const params = new URLSearchParams(currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch)
  if (!hasReaderIntent(params)) params.set('from', 'app')
  const pathChapter = parseReadChapterPath(currentPathname)
  const pathname = pathChapter && pathChapter.bookId === bookId
    ? `/read/${bookId}/${pathChapter.chapter}`
    : `/read/${bookId}`
  const search = params.toString()
  return `${pathname}${search ? `?${search}` : ''}${currentHash}`
}
