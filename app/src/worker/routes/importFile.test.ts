import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleImportFile, FILE_IMPORT_PER_MINUTE, FILE_REFUSALS } from './importFile'
import { fileKindOf, linkedFileName, FILE_MAX_BYTES } from '../lib/articleFetch'

const USER = { id: '11111111-2222-4333-8444-555555555555', email: 'reader@test.tinct.app' }
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x25, 0x25, 0x45, 0x4f, 0x46])
function epubBytes(): Uint8Array {
  const head = new Uint8Array(30 + 8 + 20 + 4)
  head.set([0x50, 0x4b, 0x03, 0x04])
  const tail = 'mimetypeapplication/epub+zip'
  for (let i = 0; i < tail.length; i++) head[30 + i] = tail.charCodeAt(i)
  return head
}

const post = (body: unknown) => new Request('https://tinct.app/api/import-file', {
  method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer token' }, body: JSON.stringify(body),
})
const file = (bytes: Uint8Array, headers: Record<string, string> = {}) => new Response(bytes, { headers: { 'content-type': 'application/octet-stream', ...headers } })

function deps({ user = USER as typeof USER | null, allowed = true, fetchImpl = vi.fn(async () => file(PDF, { 'content-type': 'application/pdf' })) } = {}) {
  const checkRateLimit = vi.fn(async () => allowed)
  return { checkRateLimit, fetchImpl, deps: { verifyUser: vi.fn(async () => user), checkRateLimit, fetchOptions: { fetchImpl } } }
}

afterEach(() => vi.restoreAllMocks())

describe('POST /api/import-file (a link to a PDF or EPUB, 11 Nov 2026)', () => {
  it('signed-in readers only, rate limited, POST only, before anything is fetched', async () => {
    const out = deps({ user: null })
    expect((await handleImportFile(post({ url: 'https://example.org/a.pdf' }), {}, out.deps)).status).toBe(401)
    const limited = deps({ allowed: false })
    expect((await handleImportFile(post({ url: 'https://example.org/a.pdf' }), {}, limited.deps)).status).toBe(429)
    expect(limited.checkRateLimit).toHaveBeenCalledWith(`import-file:${USER.id}`, undefined, FILE_IMPORT_PER_MINUTE)
    expect((await handleImportFile(new Request('https://tinct.app/api/import-file'), {}, deps().deps)).status).toBe(405)
    expect(out.fetchImpl).not.toHaveBeenCalled()
    expect(limited.fetchImpl).not.toHaveBeenCalled()
  })

  it('answers a PDF with its bytes, its name and final address, uncached, and logs nothing about the link', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps: d } = deps({ fetchImpl: vi.fn(async () => file(PDF, { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="Variational Bayes.pdf"' })) })
    const response = await handleImportFile(post({ url: 'https://papers.example.org/vb?id=7' }), {}, d)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(decodeURIComponent(response.headers.get('x-file-name') || '')).toBe('Variational Bayes.pdf')
    expect(decodeURIComponent(response.headers.get('x-file-url') || '')).toBe('https://papers.example.org/vb?id=7')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(PDF)
    expect(log.mock.calls.flat().join(' ')).not.toContain('example.org')
  })

  it('an EPUB is recognised by its bytes, whatever type the site sends', async () => {
    const { deps: d } = deps({ fetchImpl: vi.fn(async () => file(epubBytes())) })
    const response = await handleImportFile(post({ url: 'https://books.example.org/download/42' }), {}, d)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/epub+zip')
    expect(decodeURIComponent(response.headers.get('x-file-name') || '')).toBe('42.epub')
  })

  it('a page or another file is refused as "not a PDF or an EPUB", even when it says it is a PDF', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    for (const body of [new TextEncoder().encode('<!doctype html><p>hi'), new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0])]) {
      const { deps: d } = deps({ fetchImpl: vi.fn(async () => file(body, { 'content-type': 'application/pdf' })) })
      const response = await handleImportFile(post({ url: 'https://example.org/x.pdf' }), {}, d)
      expect(response.status).toBe(415)
      expect(await response.json()).toMatchObject({ code: 'unsupported_type', error: 'This link is not a PDF or an EPUB.' })
    }
  })

  it('a file over the own-book cap is refused before it is read, with the limit named', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { deps: d } = deps({ fetchImpl: vi.fn(async () => file(PDF, { 'content-type': 'application/pdf', 'content-length': String(FILE_MAX_BYTES + 1) })) })
    const response = await handleImportFile(post({ url: 'https://example.org/huge.pdf' }), {}, d)
    expect(response.status).toBe(413)
    expect((await response.json() as { error: string }).error).toBe('This file is larger than 50 MB, the limit for your own books.')
  })

  it('refuses private addresses and a redirect into one, without fetching them', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    for (const url of ['http://127.0.0.1/a.pdf', 'http://169.254.169.254/latest/meta-data/', 'http://localhost/a.pdf', 'https://tinct.app/api/user-books']) {
      const { deps: d, fetchImpl } = deps()
      expect((await handleImportFile(post({ url }), {}, d)).status).toBe(400)
      expect(fetchImpl).not.toHaveBeenCalled()
    }
    const redirect = vi.fn(async () => new Response(null, { status: 302, headers: { location: 'http://10.0.0.5/secret.pdf' } }))
    const { deps: d } = deps({ fetchImpl: redirect })
    expect((await handleImportFile(post({ url: 'https://example.org/a.pdf' }), {}, d)).status).toBe(400)
    expect(redirect).toHaveBeenCalledTimes(1)
  })

  it('every refusal names what to do in plain words', () => {
    for (const { error } of Object.values(FILE_REFUSALS)) expect(error).toMatch(/^[A-Z].+\.$/)
    expect(FILE_REFUSALS.unreachable.error).toBe('Tinct could not reach this site. Check the link.')
  })
})

describe('linked file helpers', () => {
  it('the kind is the bytes’, else the type’s or the address’s', () => {
    expect(fileKindOf('text/html', PDF)).toBe('pdf')
    expect(fileKindOf('', epubBytes())).toBe('epub')
    expect(fileKindOf('application/pdf', new Uint8Array([1, 2, 3, 4]))).toBeNull()
    expect(fileKindOf('application/epub+zip', null)).toBe('epub')
    expect(fileKindOf('', null, new URL('https://x.org/book.EPUB'))).toBe('epub')
    expect(fileKindOf('text/html', null, new URL('https://x.org/page'))).toBeNull()
  })

  it('the name: Content-Disposition, else the last part of the address, with the kind’s extension', () => {
    expect(linkedFileName('inline; filename*=UTF-8\'\'Gr%C3%BCnde.pdf', new URL('https://x.org/a'), 'pdf')).toBe('Gründe.pdf')
    expect(linkedFileName(null, new URL('https://arxiv.org/pdf/2401.00001v2'), 'pdf')).toBe('2401.00001v2.pdf')
    expect(linkedFileName(null, new URL('https://x.org/'), 'epub')).toBe('Linked document.epub')
    expect(linkedFileName('attachment; filename="../../etc/passwd"', new URL('https://x.org/'), 'pdf')).toBe('.. .. etc passwd.pdf')
  })
})
