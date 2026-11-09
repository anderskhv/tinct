import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleImportArticle, NO_TEXT_MESSAGE, PDF_MESSAGE, ARTICLE_IMPORT_PER_MINUTE } from './importArticle'

const USER = { id: '11111111-2222-4333-8444-555555555555', email: 'reader@test.tinct.app' }
const news = readFileSync(new URL('../__fixtures__/articles/news.html', import.meta.url), 'utf8')
const spa = readFileSync(new URL('../__fixtures__/articles/spa.html', import.meta.url), 'utf8')

const post = (body: unknown, headers: Record<string, string> = {}) => new Request('https://tinct.app/api/import-article', {
  method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer token', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body),
})
const html = (body: string) => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } })

function deps({ user = USER as typeof USER | null, allowed = true, fetchImpl = vi.fn(async () => html(news)) } = {}) {
  const checkRateLimit = vi.fn(async () => allowed)
  return { checkRateLimit, fetchImpl, deps: { verifyUser: vi.fn(async () => user), checkRateLimit, fetchOptions: { fetchImpl } } }
}

afterEach(() => vi.restoreAllMocks())

describe('POST /api/import-article', () => {
  it('signed-in readers only: no fetch without a verified user', async () => {
    const { deps: d, fetchImpl } = deps({ user: null })
    const response = await handleImportArticle(post({ url: 'https://example.org/otters' }), {}, d)
    expect(response.status).toBe(401)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('POST only', async () => {
    const { deps: d } = deps()
    expect((await handleImportArticle(new Request('https://tinct.app/api/import-article'), {}, d)).status).toBe(405)
  })

  it('is rate limited per reader, before anything is fetched', async () => {
    const { deps: d, fetchImpl, checkRateLimit } = deps({ allowed: false })
    const response = await handleImportArticle(post({ url: 'https://example.org/otters' }), {}, d)
    expect(response.status).toBe(429)
    expect(checkRateLimit).toHaveBeenCalledWith(`import-article:${USER.id}`, undefined, ARTICLE_IMPORT_PER_MINUTE)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('returns the article, uncached, and logs nothing about the link', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps: d } = deps()
    const response = await handleImportArticle(post({ url: 'https://news.example.org/otters?utm=1' }), {}, d)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json() as Record<string, unknown>
    expect(body).toMatchObject({ kind: 'html', url: 'https://news.example.org/otters?utm=1', title: 'The quiet return of the river otter', author: 'Maren Holt', siteName: 'The Northern Ledger' })
    expect(String(body.html)).toContain('For most of the last century')
    expect(log.mock.calls.flat().join(' ')).not.toContain('example.org')
  })

  it('refuses private addresses without fetching', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    for (const url of ['http://127.0.0.1/', 'http://169.254.169.254/latest/meta-data/', 'http://[::1]/', 'http://localhost/', 'https://tinct.app/api/user-books']) {
      const { deps: d, fetchImpl } = deps()
      const response = await handleImportArticle(post({ url }), {}, d)
      expect(response.status).toBe(400)
      expect(fetchImpl).not.toHaveBeenCalled()
    }
  })

  it('a page with no text gets the honest message, never an empty article', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps: d } = deps({ fetchImpl: vi.fn(async () => html(spa)) })
    const response = await handleImportArticle(post({ url: 'https://app.example.org/read/1' }), {}, d)
    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: NO_TEXT_MESSAGE, code: 'no_text' })
    expect(log.mock.calls.flat().join(' ')).not.toContain('example.org')
  })

  it('a PDF is named as one', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps: d } = deps({ fetchImpl: vi.fn(async () => new Response('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } })) })
    const response = await handleImportArticle(post({ url: 'https://example.org/paper.pdf' }), {}, d)
    expect(response.status).toBe(415)
    expect(await response.json()).toMatchObject({ error: PDF_MESSAGE, code: 'pdf' })
  })

  it('plain text comes back as text for the browser to read as a paste', async () => {
    const { deps: d } = deps({ fetchImpl: vi.fn(async () => new Response('A title\n\nThe first paragraph.', { headers: { 'content-type': 'text/plain' } })) })
    const response = await handleImportArticle(post({ url: 'https://example.org/notes.txt' }), {}, d)
    expect(await response.json()).toMatchObject({ kind: 'text', text: 'A title\n\nThe first paragraph.', siteName: 'example.org' })
  })

  it('a malformed or oversized request is refused', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps: d, fetchImpl } = deps()
    expect((await handleImportArticle(post('{not json'), {}, d)).status).toBe(400)
    expect((await handleImportArticle(post({ url: 'https://example.org/' + 'a'.repeat(5000) }), {}, d)).status).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
