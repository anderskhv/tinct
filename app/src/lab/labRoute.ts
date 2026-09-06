/** Paths that serve the private reading-chrome demo. */
export function isLabPath(pathname: string): boolean {
  const path = pathname.split('?')[0].split('#')[0]
  return path === '/lab' || path.startsWith('/lab/')
}

/** The lab library's public home. `/lab/library` stays as an alias. */
export const LIBRARY_PATH = '/library'
/** Where the classic (pre-lab) app lives after the launch switch. */
export const CLASSIC_APP_PATH = '/classic'

/**
 * `/read/{bookId}` (optionally `/read/{bookId}/{chapter}`) is the lab reader.
 * `/read`, `/read/` and `/read/{bookId}/(summary|chapters|cast|themes|chapter-N)`
 * are static SEO pages the Worker serves before React ever mounts.
 */
export function isLabReaderPath(pathname: string): boolean {
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  return /^\/read\/[a-z0-9-]+(?:\/\d+)?$/i.test(path)
}

export type LabReaderRoute = { bookId: string; chapterNumber: number | null; editionKey: string | null }

/**
 * Book, chapter and edition named by a reader URL: `/read/{bookId}`,
 * `/read/{bookId}/{chapter}`, plus the SEO tour-card form
 * `/read/{bookId}?chapter=N&edition=KEY`. Registry validation happens in the
 * reader; this only parses.
 */
export function labReaderRoute(pathname: string, search = ''): LabReaderRoute | null {
  const [pathPart, inlineQuery = ''] = pathname.split('#')[0].split('?')
  const match = pathPart.replace(/\/+$/, '').match(/^\/read\/([a-z0-9-]+)(?:\/(\d+))?$/i)
  if (!match) return null
  const query = search || inlineQuery
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  const fromQuery = Number.parseInt(params.get('chapter') || '', 10)
  const fromPath = Number.parseInt(match[2] || '', 10)
  const chapterNumber = Number.isInteger(fromPath) && fromPath > 0 ? fromPath : Number.isInteger(fromQuery) && fromQuery > 0 ? fromQuery : null
  const edition = (params.get('edition') || '').trim()
  return { bookId: match[1].toLowerCase(), chapterNumber, editionKey: edition || null }
}

export type LabLayoutOverride = 'phone' | 'desktop' | null
export type LabSurface = 'landing' | 'library' | 'reader'

export function labSurface(pathname: string): LabSurface {
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (path === '/lab/landing') return 'landing'
  if (path === '/lab/library') return 'library'
  return 'reader'
}

export function labLayoutOverride(pathname: string): LabLayoutOverride {
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (path === '/lab/phone') return 'phone'
  if (path === '/lab/desktop') return 'desktop'
  return null
}

export type LabVoiceVersion = 'v1' | 'v2'

/**
 * Voice V2 is an opt-in preview at `/lab/reader?voice=v2` only. Every other
 * lab route (and every non-lab route) stays on Voice V1. When `search` is
 * omitted the query string is read from `pathname` itself.
 */
export function labVoiceVersion(pathname: string, search?: string): LabVoiceVersion {
  const [pathPart, inlineQuery = ''] = pathname.split('#')[0].split('?')
  const path = pathPart.replace(/\/+$/, '')
  if (path !== '/lab/reader') return 'v1'
  const query = search !== undefined ? search : inlineQuery
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  return params.get('voice')?.trim().toLowerCase() === 'v2' ? 'v2' : 'v1'
}
