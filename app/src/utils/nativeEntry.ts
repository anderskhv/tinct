/** Native shells serve bundled files instead of the Worker's URL rewrites. */
export function nativeEntryDestination(native: boolean, pathname: string, search = '', hash = ''): string | null {
  if (!native) return null
  const path = pathname.replace(/\/$/, '') || '/'
  if (['/', '/index.html', '/library'].includes(path)) {
    return '/lab/library_2/index.html' + search + hash
  }
  if (path === '/sign-in') return '/lab/sign-in/index.html' + search + hash
  return null
}
