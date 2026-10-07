import { PAGE_HOME, legacyLabPageRedirect } from './labRoute'

/**
 * Where the sign-in page sends the reader afterwards.
 *
 * Only same-origin canonical pages are honoured: `/library`, `/reader`, `/you` (with
 * their query strings such as `?voice=v2`), `/read/<bookId>[/<n>]`, `/featured`
 * and `/admin/metrics`. Old `/lab/...` page URLs from saved links are mapped to
 * their canonical page, so a return never lands on an asset-folder URL.
 * One exception: `/lab/addbook/`, the unlinked Add-a-book page, has no
 * canonical URL yet, so it is honoured as itself (Anders, 2026-10-05).
 * Anything else — another origin, protocol-relative `//host`, `javascript:`, a
 * backslash that a browser would fold into a slash — falls back to the library.
 */
export const LAB_DEFAULT_RETURN_TO = '/library'

const LAUNCH_ROUTE = /^\/(?:library|reader|you|featured|admin\/metrics|read\/[A-Za-z0-9_-]+(?:\/\d+)?)\/?$/
const ADD_BOOK_PAGE = /^\/lab\/addbook(?:\/|\/index\.html)?$/

export function safeLabReturnTo(value: string | null | undefined, origin: string = location.origin): string {
  if (!value || value.includes('\\')) return LAB_DEFAULT_RETURN_TO
  try {
    const destination = new URL(value, origin)
    if (destination.origin !== origin) return LAB_DEFAULT_RETURN_TO
    const path = destination.pathname
    if (/^\/(?:lab\/)?sign-in(?:\/index\.html)?\/?$/.test(path)) return LAB_DEFAULT_RETURN_TO
    if (ADD_BOOK_PAGE.test(path)) return `/lab/addbook/${destination.search}${destination.hash}`
    const legacy = legacyLabPageRedirect(path, destination.search)
    if (legacy) return legacy === PAGE_HOME ? LAB_DEFAULT_RETURN_TO : `${legacy}${destination.hash}`
    if (!LAUNCH_ROUTE.test(path)) return LAB_DEFAULT_RETURN_TO
    return `${path}${destination.search}${destination.hash}`
  } catch {
    return LAB_DEFAULT_RETURN_TO
  }
}
