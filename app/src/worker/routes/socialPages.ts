/**
 * Profiles (social ship 2): the pages. Used only while SOCIAL_PROFILES is "1".
 *
 * - /you: the You page (library look): your picture, AI credits, Settings.
 *   Served from public/lab/you/ at its public URL, never indexed.
 * - The library, reader and sign-in pages get one marker,
 *   <meta name="tinct-social" content="1">, which is how their scripts know
 *   profiles are on. The library also loads /lab/social-entry.js (your
 *   picture in the top bar, and the one gentle prompt for older accounts).
 *
 * With the switch off none of this runs, so those pages are byte-for-byte
 * what they were.
 */
import { SECURITY_HEADERS } from './seo'

export const SOCIAL_META = '<meta name="tinct-social" content="1">'
export const SOCIAL_ENTRY_SCRIPT = '<script type="module" src="/lab/social-entry.js"></script>'

const YOU_PATHS = new Set(['/you', '/you/'])
const LIBRARY_PATHS = new Set(['/', '/library', '/library/'])
const MARKED_PATHS = new Set([...LIBRARY_PATHS, '/reader', '/reader/', '/sign-in', '/sign-in/'])

export function isYouPath(pathname: string): boolean {
  return YOU_PATHS.has(pathname)
}

export async function serveYouPage(request: Request, env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }): Promise<Response | null> {
  const url = new URL(request.url)
  const assetUrl = new URL('/lab/you/', url.origin)
  const asset = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: request.method }))
  if (!asset.ok) return null
  const html = request.method === 'HEAD' ? null : (await asset.text()).replace('</head>', `${SOCIAL_META}</head>`)
  const response = new Response(html, asset)
  for (const header of ['Content-Length', 'Content-Encoding', 'ETag']) response.headers.delete(header)
  response.headers.set('Content-Type', 'text/html; charset=utf-8')
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('X-Robots-Tag', 'noindex, noarchive')
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value)
  return response
}

/** Add the profiles marker (and the library's entry script) to a page this Worker already answered. */
export async function withSocialMarkers(response: Response, request: Request): Promise<Response> {
  const url = new URL(request.url)
  if (request.method !== 'GET' || response.status !== 200 || !MARKED_PATHS.has(url.pathname)) return response
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response
  const html = await response.text()
  if (!html.includes('</head>') || html.includes(SOCIAL_META)) return new Response(html, response)
  const extra = SOCIAL_META + (LIBRARY_PATHS.has(url.pathname) ? SOCIAL_ENTRY_SCRIPT : '')
  const marked = new Response(html.replace('</head>', `${extra}</head>`), response)
  for (const header of ['Content-Length', 'Content-Encoding', 'ETag']) marked.headers.delete(header)
  return marked
}
