/**
 * Profiles (social ship 2): the page markers. Used only while SOCIAL_PROFILES is "1".
 *
 * The library, reader and sign-in pages get one marker,
 * <meta name="tinct-social" content="1">, which is how their scripts know
 * profiles are on. (The account itself is the account cards, src/cards; the
 * old /you page redirects to them, src/cards/cardRoutes.ts.)
 *
 * With the switch off none of this runs, so those pages are byte-for-byte
 * what they were. While SOCIAL_FRIENDS (ship 3) is on too, the same pages also
 * carry <meta name="tinct-friends" content="1"> (routes/social.ts FRIENDS_META).
 */
export const SOCIAL_META = '<meta name="tinct-social" content="1">'
const LIBRARY_PATHS = new Set(['/', '/library', '/library/'])
const MARKED_PATHS = new Set([...LIBRARY_PATHS, '/reader', '/reader/', '/sign-in', '/sign-in/'])

/** Add the profiles marker to a page this Worker already answered. */
export async function withSocialMarkers(response: Response, request: Request, extraMeta = ''): Promise<Response> {
  const url = new URL(request.url)
  if (request.method !== 'GET' || response.status !== 200 || !MARKED_PATHS.has(url.pathname)) return response
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response
  const html = await response.text()
  if (!html.includes('</head>') || html.includes(SOCIAL_META)) return new Response(html, response)
  const extra = SOCIAL_META + extraMeta
  const marked = new Response(html.replace('</head>', `${extra}</head>`), response)
  for (const header of ['Content-Length', 'Content-Encoding', 'ETag']) marked.headers.delete(header)
  return marked
}
