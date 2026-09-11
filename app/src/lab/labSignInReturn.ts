/**
 * Where the lab sign-in page sends the reader afterwards.
 *
 * Only same-origin paths are honoured: the lab surfaces (`/lab/...`, reader
 * routes included, with their query strings such as `?voice=v2`) and the
 * upcoming launch routes `/library` and `/read/<bookId>[/<n>]`. Anything else —
 * another origin, protocol-relative `//host`, `javascript:`, a backslash that a
 * browser would fold into a slash — falls back to the library.
 */
export const LAB_DEFAULT_RETURN_TO = '/lab/library'

const LAUNCH_ROUTE = /^\/(?:library|read\/[A-Za-z0-9_-]+(?:\/\d+)?)\/?$/

export function safeLabReturnTo(value: string | null | undefined, origin: string = location.origin): string {
  if (!value || value.includes('\\')) return LAB_DEFAULT_RETURN_TO
  try {
    const destination = new URL(value, origin)
    if (destination.origin !== origin) return LAB_DEFAULT_RETURN_TO
    const path = destination.pathname
    const allowed = path === '/lab' || path.startsWith('/lab/') || LAUNCH_ROUTE.test(path)
    if (!allowed) return LAB_DEFAULT_RETURN_TO
    return `${path}${destination.search}${destination.hash}`
  } catch {
    return LAB_DEFAULT_RETURN_TO
  }
}
