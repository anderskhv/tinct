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
  | 'unreachable' | 'http_error' | 'refused_by_site' | 'not_found' | 'unsupported_type' | 'pdf'

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

/** Fetch a checked link: the page's final address, its kind and its decoded text. Throws ArticleFetchError. */
export async function fetchArticlePage(start: URL, options: FetchOptions = {}): Promise<FetchedPage> {
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const maxBytes = options.maxBytes ?? MAX_BYTES
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS
  const ownHosts = options.ownHosts ?? OWN_HOSTS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS)
  try {
    let url = start
    for (let hop = 0; ; hop++) {
      let response: Response
      try {
        response = await fetchImpl(url.href, {
          method: 'GET',
          redirect: 'manual',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'User-Agent': IMPORT_USER_AGENT,
            Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
            'Accept-Language': 'en;q=1, *;q=0.5',
          },
        })
      } catch {
        throw new ArticleFetchError(controller.signal.aborted ? 'timeout' : 'unreachable')
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
      const contentType = response.headers.get('content-type') || ''
      const kind = bodyKind(contentType)
      if (kind === 'pdf') { await response.body?.cancel().catch(() => {}); throw new ArticleFetchError('pdf') }
      if (!kind) { await response.body?.cancel().catch(() => {}); throw new ArticleFetchError('unsupported_type') }
      const bytes = await readCapped(response, maxBytes, controller.signal)
      // A PDF served without its type.
      if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) throw new ArticleFetchError('pdf')
      return { url: url.href, kind, body: decode(bytes, charsetOf(contentType, bytes)), bytes: bytes.byteLength }
    }
  } finally {
    clearTimeout(timer)
  }
}
