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

/**
 * In-app book URLs must not be the bare SEO marketing path `/read/:slug`.
 * A query string tells the Worker to serve the SPA instead of book.html.
 */
export function readerAppPath(bookId: string, currentSearch = '', currentHash = ''): string {
  const params = new URLSearchParams(currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch)
  if (!hasReaderIntent(params)) params.set('from', 'app')
  const search = params.toString()
  return `/read/${bookId}${search ? `?${search}` : ''}${currentHash}`
}
