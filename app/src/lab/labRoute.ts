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
