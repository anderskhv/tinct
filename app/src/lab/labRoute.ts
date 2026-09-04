/** Paths that serve the private reading-chrome demo. */
export function isLabPath(pathname: string): boolean {
  const path = pathname.split('?')[0].split('#')[0]
  return path === '/lab' || path.startsWith('/lab/')
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
