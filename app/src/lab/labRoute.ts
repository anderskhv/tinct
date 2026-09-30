/**
 * The public page URLs. Everything a reader can see in the address bar is one
 * of these (plus /read/{bookId} for search engines). Asset folders such as
 * /lab/library_2/ are implementation detail and never a navigation target.
 */
export const PAGE_HOME = '/'
export const PAGE_LIBRARY = '/library'
export const PAGE_READER = '/reader'
export const PAGE_SIGN_IN = '/sign-in'
export const PAGE_FEATURED = '/featured'

/** The one path that mounts the reader SPA. */
export function isLabPath(pathname: string): boolean {
  const path = pathname.split('?')[0].split('#')[0]
  return path === PAGE_READER || path === PAGE_READER + '/'
}

/**
 * Old page URLs from when the reader and library lived under /lab. They are
 * permanent redirects to the canonical page, keeping the query string. Only
 * page (HTML document) URLs are listed; asset files under /lab/ are served.
 * The /lab namespace stays free for future experiments.
 */
export function legacyLabPageRedirect(pathname: string, search = ''): string | null {
  const path = pathname.replace(/\/+$/, '').replace(/\/index\.html$/, '')
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  let target: string | null = null
  switch (path) {
    case '/lab':
    case '/lab/landing':
      target = PAGE_HOME
      break
    case '/lab/library':
    case '/lab/library_2':
    case '/lab/library-2':
      target = PAGE_LIBRARY
      break
    case '/lab/reader':
      target = PAGE_READER
      break
    case '/lab/phone':
    case '/lab/desktop':
      target = PAGE_READER
      if (!params.has('layout')) params.set('layout', path.slice('/lab/'.length))
      break
    case '/lab/sign-in':
      target = PAGE_SIGN_IN
      break
    case '/lab/featured':
      target = PAGE_FEATURED
      break
    default:
      return null
  }
  if (target === PAGE_READER || target === PAGE_LIBRARY) {
    params.delete('chrome')
    if (params.get('voiceTrial') === 'full') params.delete('voiceTrial')
  }
  const query = params.toString()
  return query ? `${target}?${query}` : target
}

export type LabLayoutOverride = 'phone' | 'desktop' | null

/** `/reader?layout=phone|desktop` forces a layout for QA; otherwise the device decides. */
export function labLayoutOverride(pathname: string, search?: string): LabLayoutOverride {
  const [pathPart, inlineQuery = ''] = pathname.split('#')[0].split('?')
  const path = pathPart.replace(/\/+$/, '')
  if (path === '/lab/phone') return 'phone'
  if (path === '/lab/desktop') return 'desktop'
  const query = search !== undefined ? search : inlineQuery
  const layout = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query).get('layout')?.trim().toLowerCase()
  return layout === 'phone' || layout === 'desktop' ? layout : null
}

export type LabVoiceVersion = 'v1' | 'v2'

/**
 * Voice V2 is an opt-in preview at `/reader?voice=v2` only. Every other
 * route (and every non-lab route) stays on Voice V1. When `search` is
 * omitted the query string is read from `pathname` itself.
 */
export function labVoiceVersion(pathname: string, search?: string): LabVoiceVersion {
  const [pathPart, inlineQuery = ''] = pathname.split('#')[0].split('?')
  const path = pathPart.replace(/\/+$/, '')
  if (path !== '/lab/reader' && path !== '/reader') return 'v1'
  const query = search !== undefined ? search : inlineQuery
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  return params.get('voice')?.trim().toLowerCase() === 'v2' ? 'v2' : 'v1'
}

export type LabChromeVersion = 'v1' | 'v2'

/** The three lab routes that mount the reader. Chrome V2 is offered on all of them. */
const LAB_READER_PATHS = ['/lab/reader', '/lab/phone', '/lab/desktop']

/**
 * Chrome V2 — the new reader shell — is an opt-in preview at `?chrome=v2` on a
 * lab reader route. Every other route, and a reader route without the flag,
 * keeps the chrome that ships today, untouched.
 */
export function labChromeVersion(pathname: string, search?: string): LabChromeVersion {
  const [pathPart, inlineQuery = ''] = pathname.split('#')[0].split('?')
  const path = pathPart.replace(/\/+$/, '')
  if (path === '/reader') return 'v2'
  if (!LAB_READER_PATHS.includes(path)) return 'v1'
  const query = search !== undefined ? search : inlineQuery
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
  return params.get('chrome')?.trim().toLowerCase() === 'v2' ? 'v2' : 'v1'
}
