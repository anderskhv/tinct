import { jsonResponse, corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { checkArticleUrl, OWN_HOSTS } from '../lib/articleUrl'
import { ArticleFetchError, fetchLinkedFile, FILE_MAX_BYTES, type FetchFailure, type FetchOptions } from '../lib/articleFetch'

/**
 * POST /api/import-file {url}: a link to a PDF or EPUB opens as the reader's own book (Anders, 11 Nov 2026:
 * "when someone inserts a pdf link we shud just open it instead of asking them to dload it and upload it").
 *
 * Signed-in readers only, FILE_IMPORT_PER_MINUTE a minute. The Worker fetches the file once with the article
 * import's checks (lib/articleFetch.ts: public hosts only, every redirect checked, no cookie or referrer),
 * held to the own-book upload cap (FILE_MAX_BYTES, 50 MB) and 30 s; the bytes must be a PDF or an EPUB. It
 * answers with the bytes, `no-store`, and keeps nothing: not the file, not the link (never logged). The browser
 * then adds the file exactly as a chosen one (add-to-tinct.js addFile: the rights step, this device, the
 * account copy), so the reader's own copy in their account is the only copy.
 */

export const FILE_IMPORT_PER_MINUTE = 6
const MAX_REQUEST_BYTES = 4096

type VerifiedUser = { id: string; email: string }
export type ImportFileDeps<E> = {
  verifyUser: (env: E, request: Request) => Promise<VerifiedUser | null>
  checkRateLimit: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>
  fetchOptions?: FetchOptions
}

const MB = Math.round(FILE_MAX_BYTES / 1024 / 1024)
export const FILE_REFUSALS: Record<FetchFailure, { status: number; error: string }> = {
  bad_url: { status: 400, error: 'This doesn’t look like a web address.' },
  blocked_host: { status: 400, error: 'Tinct can only open files from public websites. Download the file and add it instead.' },
  too_many_redirects: { status: 422, error: 'This link kept redirecting. Download the file and add it instead.' },
  timeout: { status: 504, error: 'The file took too long to download. Try again, or download it and add it instead.' },
  too_large: { status: 413, error: `This file is larger than ${MB} MB, the limit for your own books.` },
  unreachable: { status: 502, error: 'Tinct could not reach this site. Check the link.' },
  http_error: { status: 502, error: 'The site did not send the file. Try again later, or download it and add it instead.' },
  not_found: { status: 422, error: 'The site says this file doesn’t exist. Check the link.' },
  refused_by_site: { status: 422, error: 'The site would not send this file to Tinct (it may need a sign-in). Download it and add it instead.' },
  unsupported_type: { status: 415, error: 'This link is not a PDF or an EPUB.' },
  pdf: { status: 415, error: 'This link is not a PDF or an EPUB.' },
  epub: { status: 415, error: 'This link is not a PDF or an EPUB.' },
  file: { status: 415, error: 'This link is not a PDF or an EPUB.' },
}

function refuse(request: Request, code: FetchFailure): Response {
  const { status, error } = FILE_REFUSALS[code]
  // Outcome only: never the link, its host or the reader.
  console.log(JSON.stringify({ event: 'file_import_refused', code }))
  return Response.json({ error, code }, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'no-store' } })
}

export async function handleImportFile<E>(request: Request, env: E, deps: ImportFileDeps<E>): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const user = await deps.verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Sign in to open a linked file.', code: 'signed_out' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  if (!await deps.checkRateLimit(`import-file:${user.id}`, undefined, FILE_IMPORT_PER_MINUTE)) {
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
  let file
  try {
    file = await fetchLinkedFile(checked.url, { ownHosts, ...deps.fetchOptions })
  } catch (error) {
    return refuse(request, error instanceof ArticleFetchError ? error.code : 'unreachable')
  }
  return new Response(file.bytes, {
    headers: {
      ...corsHeaders(request),
      'Cache-Control': 'no-store',
      'Content-Type': file.kind === 'pdf' ? 'application/pdf' : 'application/epub+zip',
      // The name and final address for the browser's own book record (encoded: header values are Latin-1).
      'X-File-Name': encodeURIComponent(file.name),
      'X-File-Url': encodeURIComponent(file.url),
    },
  })
}
