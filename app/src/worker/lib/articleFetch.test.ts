import { describe, expect, it, vi } from 'vitest'
import { ArticleFetchError, fetchArticlePage, IMPORT_USER_AGENT } from './articleFetch'

const page = (body: BodyInit, init: ResponseInit = {}) => new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, ...init })
const redirect = (location: string, status = 302) => new Response(null, { status, headers: { location } })
const code = async (promise: Promise<unknown>) => { try { await promise; return 'ok' } catch (error) { return error instanceof ArticleFetchError ? error.code : String(error) } }

describe('fetching the page to import', () => {
  it('sends an honest Tinct User-Agent, no cookies, and caches nothing', async () => {
    const fetchImpl = vi.fn(async () => page('<p>Hello</p>'))
    const result = await fetchArticlePage(new URL('https://example.org/a'), { fetchImpl })
    expect(result).toMatchObject({ url: 'https://example.org/a', kind: 'html', body: '<p>Hello</p>' })
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['User-Agent']).toBe(IMPORT_USER_AGENT)
    expect(headers['User-Agent']).toMatch(/Tinct/)
    expect(headers['User-Agent']).not.toMatch(/@/)
    expect(Object.keys(headers).map(k => k.toLowerCase())).not.toContain('cookie')
    expect(init).toMatchObject({ redirect: 'manual', cache: 'no-store', method: 'GET' })
  })

  it('follows up to five redirects, resolving relative locations', async () => {
    const hops = ['/b', 'https://cdn.example.net/c', '/d', '/e', '/f']
    const fetchImpl = vi.fn(async () => (hops.length ? redirect(hops.shift()!) : page('<p>done</p>')))
    const result = await fetchArticlePage(new URL('https://example.org/a'), { fetchImpl })
    expect(result.url).toBe('https://cdn.example.net/f')
    expect(fetchImpl).toHaveBeenCalledTimes(6)
  })

  it('stops after five redirects', async () => {
    let n = 0
    const fetchImpl = vi.fn(async () => redirect(`/hop${++n}`))
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl }))).toBe('too_many_redirects')
    expect(fetchImpl).toHaveBeenCalledTimes(6)
  })

  it('refuses a redirect into private space without requesting it', async () => {
    for (const target of ['http://127.0.0.1/admin', 'http://169.254.169.254/latest/meta-data/', 'http://[::1]/', 'http://localhost:8787/', 'http://10.1.2.3/', 'file:///etc/passwd']) {
      const fetchImpl = vi.fn(async (url: string) => (url === 'https://example.org/a' ? redirect(target, 301) : page('secret')))
      expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl }))).toMatch(/blocked_host|bad_url/)
      expect(fetchImpl).toHaveBeenCalledTimes(1)
    }
  })

  it('caps the size by Content-Length and while streaming', async () => {
    const declared = vi.fn(async () => page('x', { headers: { 'content-type': 'text/html', 'content-length': String(6 * 1024 * 1024) } }))
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: declared }))).toBe('too_large')
    const chunk = new Uint8Array(1024 * 1024).fill(97)
    let sent = 0
    const stream = new ReadableStream<Uint8Array>({ pull(controller) { sent++; controller.enqueue(chunk); if (sent > 20) controller.close() } })
    const streamed = vi.fn(async () => page(stream))
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: streamed }))).toBe('too_large')
    expect(sent).toBeLessThanOrEqual(7)
  })

  it('gives up after the time limit, while connecting or while reading', async () => {
    const hanging = vi.fn((_url: string, init: RequestInit) => new Promise<Response>((_, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))))
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: hanging, timeoutMs: 20 }))).toBe('timeout')
    const slow = vi.fn(async () => page(new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode('<p>')) } })))
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: slow, timeoutMs: 20 }))).toBe('timeout')
  })

  it('names PDFs, other files and the site refusing', async () => {
    expect(await code(fetchArticlePage(new URL('https://example.org/a.pdf'), { fetchImpl: async () => page('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } }) }))).toBe('pdf')
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: async () => page('%PDF-1.4 ...', { headers: { 'content-type': '' } }) }))).toBe('pdf')
    // Another file (11 Nov 2026): 'file', so the browser asks the file import, which decides by the bytes.
    expect(await code(fetchArticlePage(new URL('https://example.org/a.zip'), { fetchImpl: async () => page('PK', { headers: { 'content-type': 'application/zip' } }) }))).toBe('file')
    expect(await code(fetchArticlePage(new URL('https://example.org/dl?id=4'), { fetchImpl: async () => page('%PDF', { headers: { 'content-type': 'application/octet-stream' } }) }))).toBe('file')
    expect(await code(fetchArticlePage(new URL('https://example.org/book.epub'), { fetchImpl: async () => page('PK', { headers: { 'content-type': 'application/octet-stream' } }) }))).toBe('epub')
    expect(await code(fetchArticlePage(new URL('https://example.org/b'), { fetchImpl: async () => page('PK', { headers: { 'content-type': 'application/epub+zip' } }) }))).toBe('epub')
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: async () => page('no', { status: 403 }) }))).toBe('refused_by_site')
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: async () => page('no', { status: 404 }) }))).toBe('not_found')
    expect(await code(fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: async () => { throw new TypeError('network') } }))).toBe('unreachable')
  })

  it('reads plain text and decodes the declared charset', async () => {
    const text = await fetchArticlePage(new URL('https://example.org/a.txt'), { fetchImpl: async () => page('Line one\n\nLine two', { headers: { 'content-type': 'text/plain' } }) })
    expect(text).toMatchObject({ kind: 'text', body: 'Line one\n\nLine two' })
    const latin = await fetchArticlePage(new URL('https://example.org/a'), { fetchImpl: async () => page(new Uint8Array([0x3c, 0x70, 0x3e, 0x63, 0x61, 0x66, 0xe9]), { headers: { 'content-type': 'text/html; charset=windows-1252' } }) })
    expect(latin.body).toBe('<p>café')
  })
})
