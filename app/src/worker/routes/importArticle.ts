import { jsonResponse, corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { checkArticleUrl, OWN_HOSTS } from '../lib/articleUrl'
import { ArticleFetchError, fetchArticlePage, type FetchFailure, type FetchOptions } from '../lib/articleFetch'
import { extractArticle } from '../lib/articleExtract'

/**
 * POST /api/import-article {url}: a link pasted into Paste text becomes the article's text (Anders,
 * 9 Nov 2026: "import articles rather than pasting text via link").
 *
 * Signed-in readers only, ARTICLE_IMPORT_PER_MINUTE a minute. The Worker fetches the page once
 * (lib/articleFetch.ts: public hosts only, every redirect checked, 5 MB, 10 s), finds the article
 * (lib/articleExtract.ts) and answers with its title, byline, site name and text. Nothing is kept:
 * not the page, not the link, not the text; the reply is `no-store` and the link is never logged.
 * The browser then adds it exactly as pasted text (own-add.js: the same cleaning, EPUB, limits and
 * upload), so the reader's own copy in their account is the only copy.
 *
 * A page that shares no readable text (paywalled, blocked, built by JavaScript, not an article) is
 * refused with NO_TEXT_MESSAGE, never turned into an empty book. Plain text is returned as text for the
 * browser's own plain-text reading. A link to a file is answered with its code ('pdf', 'epub', or 'file' when
 * only its bytes can tell): since
 * 11 Nov 2026 the browser then asks POST /api/import-file for the file itself (routes/importFile.ts) and adds
 * it as a chosen file, rights step included. PDF_MESSAGE is what an older page shows.
 */

export const ARTICLE_IMPORT_PER_MINUTE = 10
export const NO_TEXT_MESSAGE = 'This page didn’t share its text. Paste the article text instead.'
export const PDF_MESSAGE = 'This link is a PDF. Download it and add it as a book.'
const MAX_REQUEST_BYTES = 4096
/** Plain text over this is refused here; the browser's paste limit (own-add.js PASTE_MAX_CHARS) is lower still. */
const MAX_TEXT_CHARS = 1_000_000

type VerifiedUser = { id: string; email: string }
export type ImportArticleDeps<E> = {
  verifyUser: (env: E, request: Request) => Promise<VerifiedUser | null>
  checkRateLimit: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>
  fetchOptions?: FetchOptions
}

const REFUSALS: Record<FetchFailure | 'no_text' | 'paywall', { status: number; error: string }> = {
  bad_url: { status: 400, error: 'This doesn’t look like a web address. Paste the article text instead.' },
  blocked_host: { status: 400, error: 'Tinct can only import public web pages. Paste the article text instead.' },
  too_many_redirects: { status: 422, error: 'This link kept redirecting. Paste the article text instead.' },
  timeout: { status: 504, error: 'The page took too long to load. Try again, or paste the article text instead.' },
  too_large: { status: 413, error: 'This page is too large to import. Paste the article text instead.' },
  unreachable: { status: 502, error: 'Tinct could not reach this site. Check the link, or paste the article text instead.' },
  http_error: { status: 502, error: 'The site did not send the page. Try again later, or paste the article text instead.' },
  not_found: { status: 422, error: 'The site says this page doesn’t exist. Check the link.' },
  refused_by_site: { status: 422, error: NO_TEXT_MESSAGE },
  unsupported_type: { status: 415, error: 'This link is not a web page. If it is a file, download it and add it as a book.' },
  pdf: { status: 415, error: PDF_MESSAGE },
  epub: { status: 415, error: 'This link is an EPUB. Download it and add it as a book.' },
  file: { status: 415, error: 'This link is not a web page. If it is a file, download it and add it as a book.' },
  no_text: { status: 422, error: NO_TEXT_MESSAGE },
  paywall: { status: 422, error: NO_TEXT_MESSAGE },
}

function refuse(request: Request, code: keyof typeof REFUSALS): Response {
  const { status, error } = REFUSALS[code]
  // Outcome only: never the link, its host or the reader.
  console.log(JSON.stringify({ event: 'article_import_refused', code }))
  return Response.json({ error, code }, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'no-store' } })
}

export async function handleImportArticle<E>(request: Request, env: E, deps: ImportArticleDeps<E>): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const user = await deps.verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Sign in to import an article.', code: 'signed_out' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  if (!await deps.checkRateLimit(`import-article:${user.id}`, undefined, ARTICLE_IMPORT_PER_MINUTE)) {
    return jsonResponse({ error: 'Too many links at once. Try again in a minute.', code: 'rate_limited' }, 429, request)
  }
  const declared = Number(request.headers.get('content-length') || '0')
  if (declared > MAX_REQUEST_BYTES) return refuse(request, 'bad_url')
  let body: unknown
  try {
    const text = await request.text()
    if (text.length > MAX_REQUEST_BYTES) return refuse(request, 'bad_url')
    body = JSON.parse(text)
  } catch { return refuse(request, 'bad_url') }
  const ownHosts = [...OWN_HOSTS, new URL(request.url).hostname]
  const checked = checkArticleUrl((body as { url?: unknown } | null)?.url, ownHosts)
  if (!checked.ok) return refuse(request, checked.code)

  let page
  try {
    page = await fetchArticlePage(checked.url, { ownHosts, ...deps.fetchOptions })
  } catch (error) {
    return refuse(request, error instanceof ArticleFetchError ? error.code : 'unreachable')
  }
  const headers = { ...corsHeaders(request), 'Cache-Control': 'no-store' }
  if (page.kind === 'text') {
    const text = page.body.replace(/\r\n?/g, '\n').trim()
    if (!text) return refuse(request, 'no_text')
    if (text.length > MAX_TEXT_CHARS) return refuse(request, 'too_large')
    return Response.json({ kind: 'text', url: page.url, text, title: '', author: '', siteName: new URL(page.url).hostname.replace(/^www\./, '') }, { headers })
  }
  const article = extractArticle(page.body, page.url)
  if ('refused' in article) return refuse(request, article.refused)
  return Response.json({ kind: 'html', url: page.url, ...article }, { headers })
}
