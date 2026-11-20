import { checkArticleUrl, OWN_HOSTS } from './articleUrl'

/**
 * Fetches the page a reader asked Tinct to import (routes/importArticle.ts), once, without keeping it.
 *
 * Bounded: at most MAX_REDIRECTS redirects, each target checked as the first link was (articleUrl.ts),
 * so a public page cannot redirect the server into a private network; at most MAX_BYTES of body, read as
 * a stream and stopped when it is exceeded; TIMEOUT_MS for the whole exchange, body included. The request
 * names Tinct in its User-Agent and carries no cookie, referrer or anything about the reader. Nothing is
 * cached (`cache: 'no-store'`) or logged here.
 */

export const IMPORT_USER_AGENT = 'Mozilla/5.0 (compatible; TinctArticleImport/1.0; +https://tinct.app/privacy)'
export const MAX_REDIRECTS = 5
export const MAX_BYTES = 5 * 1024 * 1024
export const TIMEOUT_MS = 10_000

export type FetchFailure =
  | 'bad_url' | 'blocked_host' | 'too_many_redirects' | 'timeout' | 'too_large'
  | 'unreachable' | 'http_error' | 'refused_by_site' | 'not_found' | 'unsupported_type' | 'pdf' | 'epub' | 'file'

export class ArticleFetchError extends Error {
  constructor(readonly code: FetchFailure, readonly status = 0) {
    super(code)
    this.name = 'ArticleFetchError'
  }
}

export type FetchedPage = { url: string; kind: 'html' | 'text'; body: string; bytes: number }

type FetchLike = (input: string, init: RequestInit) => Promise<Response>

export type FetchOptions = {
  fetchImpl?: FetchLike
  timeoutMs?: number
  maxBytes?: number
  maxRedirects?: number
  ownHosts?: string[]
}

/** The kind of body a content type names: html, text, pdf, or null for anything else. */
export function bodyKind(contentType: string): 'html' | 'text' | 'pdf' | null {
  const type = contentType.split(';')[0].trim().toLowerCase()
  if (type === 'text/html' || type === 'application/xhtml+xml') return 'html'
  if (type === 'text/plain') return 'text'
  if (type === 'application/pdf' || type === 'application/x-pdf') return 'pdf'
  // Some servers send no type at all; the body decides below.
  if (!type) return 'html'
  return null
}

function charsetOf(contentType: string, head: Uint8Array): string {
  const fromHeader = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType)?.[1]
  if (fromHeader) return fromHeader.toLowerCase()
  // <meta charset="…"> or <meta http-equiv="Content-Type" content="…; charset=…"> in the first 2 KB.
  let ascii = ''
  for (const byte of head.subarray(0, 2048)) ascii += String.fromCharCode(byte)
  const fromMeta = /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(ascii)?.[1]
  return (fromMeta || 'utf-8').toLowerCase()
}

function decode(bytes: Uint8Array, charset: string): string {
  try { return new TextDecoder(charset).decode(bytes) } catch { return new TextDecoder('utf-8').decode(bytes) }
}

async function readCapped(response: Response, maxBytes: number, signal: AbortSignal): Promise<Uint8Array> {
  const declared = Number(response.headers.get('content-length') || '')
  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel().catch(() => {})
    throw new ArticleFetchError('too_large')
  }
  if (!response.body) return new Uint8Array(0)
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  const aborted = new Promise<never>((_, reject) => {
    if (signal.aborted) reject(new ArticleFetchError('timeout'))
    signal.addEventListener('abort', () => reject(new ArticleFetchError('timeout')), { once: true })
  })
  aborted.catch(() => {})
  for (;;) {
    const { done, value } = await Promise.race([reader.read(), aborted])
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel().catch(() => {})
      throw new ArticleFetchError('too_large')
    }
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) { out.set(chunk, at); at += chunk.byteLength }
  return out
}

type Opened = { url: URL; response: Response }

/**
 * Follows a checked link to its final response, every redirect checked as the first link was. Throws
 * ArticleFetchError for a redirect loop, a refused or private target, an error status or no answer. The
 * caller reads (or cancels) the body. Shared by the article import and the file import (fetchLinkedFile).
 */
async function openChecked(start: URL, options: FetchOptions, signal: AbortSignal, accept: string): Promise<Opened> {
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS
  const ownHosts = options.ownHosts ?? OWN_HOSTS
  let url = start
  for (let hop = 0; ; hop++) {
    let response: Response
    try {
      response = await fetchImpl(url.href, {
        method: 'GET',
        redirect: 'manual',
        cache: 'no-store',
        signal,
        headers: {
          'User-Agent': IMPORT_USER_AGENT,
          Accept: accept,
          'Accept-Language': 'en;q=1, *;q=0.5',
        },
      })
    } catch {
      throw new ArticleFetchError(signal.aborted ? 'timeout' : 'unreachable')
    }
    if (response.status >= 300 && response.status < 400 && response.status !== 304) {
      await response.body?.cancel().catch(() => {})
      const location = response.headers.get('location')
      if (!location) throw new ArticleFetchError('http_error', response.status)
      if (hop >= maxRedirects) throw new ArticleFetchError('too_many_redirects')
      let next: string
      try { next = new URL(location, url).href } catch { throw new ArticleFetchError('bad_url') }
      const checked = checkArticleUrl(next, ownHosts)
      if (!checked.ok) throw new ArticleFetchError(checked.code)
      url = checked.url
      continue
    }
    if (!response.ok) {
      await response.body?.cancel().catch(() => {})
      const status = response.status
      if (status === 404 || status === 410) throw new ArticleFetchError('not_found', status)
      if (status === 401 || status === 402 || status === 403 || status === 451) throw new ArticleFetchError('refused_by_site', status)
      throw new ArticleFetchError('http_error', status)
    }
    return { url, response }
  }
}

/** Fetch a checked link: the page's final address, its kind and its decoded text. Throws ArticleFetchError. */
export async function fetchArticlePage(start: URL, options: FetchOptions = {}): Promise<FetchedPage> {
  const maxBytes = options.maxBytes ?? MAX_BYTES
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS)
  try {
    const { url, response } = await openChecked(start, options, controller.signal, 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5')
    const contentType = response.headers.get('content-type') || ''
    const kind = bodyKind(contentType)
    if (kind === 'pdf') { await response.body?.cancel().catch(() => {}); throw new ArticleFetchError('pdf') }
    if (!kind) {
      // Not a page: a file of some kind (many sites send PDFs as application/octet-stream). The file import
      // (fetchLinkedFile) decides by its bytes whether it is a PDF or an EPUB.
      await response.body?.cancel().catch(() => {})
      const named = fileKindOf(contentType, null, url)
      throw new ArticleFetchError(named ?? 'file')
    }
    const bytes = await readCapped(response, maxBytes, controller.signal)
    // A PDF served without its type.
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) throw new ArticleFetchError('pdf')
    return { url: url.href, kind, body: decode(bytes, charsetOf(contentType, bytes)), bytes: bytes.byteLength }
  } finally {
    clearTimeout(timer)
  }
}

// ---- A linked PDF or EPUB (Anders, 11 Nov 2026: "when someone inserts a pdf link we shud just open it") ----

/** The account's own-book upload cap (routes/userBooks.ts MAX_FILE_BYTES): a linked file is held to the same size. */
export const FILE_MAX_BYTES = 50 * 1024 * 1024
/** A file is larger than a page: more time for its body. */
export const FILE_TIMEOUT_MS = 30_000

export type LinkedFile = { url: string; kind: 'pdf' | 'epub'; bytes: Uint8Array; name: string }

const isPdfBytes = (b: Uint8Array | null) => !!b && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46
/** An EPUB is a ZIP whose first entry is `mimetype` holding application/epub+zip (OCF). */
function isEpubBytes(b: Uint8Array | null): boolean {
  if (!b || b.length < 58 || b[0] !== 0x50 || b[1] !== 0x4b || b[2] !== 0x03 || b[3] !== 0x04) return false
  let ascii = ''
  for (const byte of b.subarray(30, 58)) ascii += String.fromCharCode(byte)
  return ascii === 'mimetypeapplication/epub+zip'
}

/** What a linked file is, by its bytes when given (they decide), else by its type or address. */
export function fileKindOf(contentType: string, bytes: Uint8Array | null, url?: URL): 'pdf' | 'epub' | null {
  if (bytes) return isPdfBytes(bytes) ? 'pdf' : isEpubBytes(bytes) ? 'epub' : null
  const type = contentType.split(';')[0].trim().toLowerCase()
  if (type === 'application/pdf' || type === 'application/x-pdf') return 'pdf'
  if (type === 'application/epub+zip') return 'epub'
  const path = url?.pathname.toLowerCase() || ''
  if (path.endsWith('.pdf')) return 'pdf'
  if (path.endsWith('.epub')) return 'epub'
  return null
}

/** The file's name: Content-Disposition's, else the address's last segment, else "Linked document". */
export function linkedFileName(disposition: string | null, url: URL, kind: 'pdf' | 'epub'): string {
  let name = ''
  const star = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(disposition || '')?.[1]
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(disposition || '')?.[1]
  try { name = star ? decodeURIComponent(star) : plain || decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '') } catch { name = plain || '' }
  name = name.replace(/[\u0000-\u001f\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
  if (!name) name = 'Linked document'
  return new RegExp(`\\.${kind}$`, 'i').test(name) ? name : `${name}.${kind}`
}

/**
 * Fetch a checked link to a PDF or EPUB, once: its final address, kind, bytes and name. Same checks as an
 * article (public hosts only, every redirect checked, no cookie or referrer) with the upload's size cap.
 * The bytes decide the kind: a page or any other file is refused ('unsupported_type'). Throws ArticleFetchError.
 */
export async function fetchLinkedFile(start: URL, options: FetchOptions = {}): Promise<LinkedFile> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? FILE_TIMEOUT_MS)
  try {
    const { url, response } = await openChecked(start, options, controller.signal, 'application/pdf,application/epub+zip;q=0.9,*/*;q=0.5')
    const bytes = await readCapped(response, options.maxBytes ?? FILE_MAX_BYTES, controller.signal)
    const kind = fileKindOf('', bytes)
    if (!kind) throw new ArticleFetchError('unsupported_type')
    return { url: url.href, kind, bytes, name: linkedFileName(response.headers.get('content-disposition'), url, kind) }
  } finally {
    clearTimeout(timer)
  }
}
