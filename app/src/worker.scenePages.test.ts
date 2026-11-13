import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import worker from './worker'
import { renderScenePage } from './seo/scenePages'

// The scene pages (13 Nov 2026): /read/{bookId}/{scene} for five plays, served as static HTML to everyone.
const hamlet = JSON.parse(readFileSync('public/data/editions/hamlet-modern-en.json', 'utf8'))
const page = renderScenePage({ book: { id: 'hamlet', title: 'Hamlet', author: 'William Shakespeare' }, chapters: hamlet.chapters, chapterNumber: 8, original: null }).html
const bookPage = readFileSync('public/read/hamlet/book.html', 'utf8')
const library = readFileSync('public/lab/library_2/index.html', 'utf8')
const env = {
  ASSETS: {
    fetch: async (request: Request) => {
      const url = new URL(request.url)
      if (url.pathname === '/read/hamlet/act-3-scene-1') return new Response(page, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      if (url.pathname === '/read/hamlet/book') return new Response(bookPage, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      if (url.pathname === '/lab/library_2/') return new Response(library, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      if (url.pathname === '/404.html') return new Response('<title>Page not found — Tinct</title>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      return new Response('Not found', { status: 404 })
    },
  },
}
const ctx = { waitUntil: () => undefined } as unknown as ExecutionContext
const get = (path: string, headers: Record<string, string> = {}) => worker.fetch(new Request(`https://tinct.app${path}`, { headers }), env as never, ctx)

describe('scene pages', () => {
  it('serves a scene page to a crawler with its own title, description and canonical, and its whole text', async () => {
    const resp = await get('/read/hamlet/act-3-scene-1', { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' })
    expect(resp.status).toBe(200)
    expect(resp.headers.get('X-Robots-Tag')).toBeNull()
    expect(resp.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    const html = await resp.text()
    expect(html).not.toMatch(/name="robots"/)
    expect(html).toContain('<title>Hamlet, Act 3, Scene 1 in modern English | Tinct</title>')
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/read/hamlet/act-3-scene-1">')
    expect(html).toContain('To be, or not to be — that is the question.')
    expect(html).toContain('<meta property="og:image" content="https://tinct.app/brand/20260921/books/hamlet.jpg">')
  })

  it('is the same page for a signed-in reader: static, no redirect, no reading position', async () => {
    const resp = await get('/read/hamlet/act-3-scene-1', { Cookie: 'tinct_auth=1' })
    expect(resp.status).toBe(200)
    expect(await resp.text()).toBe(await (await get('/read/hamlet/act-3-scene-1')).text())
  })

  it.each(['/read/hamlet/act-3-scene-1/', '/read/hamlet/act-3-scene-1.html', '/read/Hamlet/Act-3-Scene-1'])('sends %s to the one address', async path => {
    const resp = await get(`${path}?utm_source=x`)
    expect(resp.status).toBe(301)
    expect(resp.headers.get('Location')).toBe('/read/hamlet/act-3-scene-1?utm_source=x')
  })

  it('has no scene pages for other books or scenes that do not exist', async () => {
    for (const path of ['/read/hamlet/act-9-scene-9', '/read/king-lear/act-1-scene-1', '/read/wuthering-heights/act-1-scene-1']) {
      const resp = await get(path)
      expect(resp.status).toBe(404)
      expect(resp.headers.get('X-Robots-Tag')).toBe('noindex, noarchive')
    }
  })

  it('sends a play\'s retired chapter-N to the scene page of that chapter; other retired pages still go to the book page', async () => {
    for (const [path, target] of [
      ['/read/hamlet/chapter-8', '/read/hamlet/act-3-scene-1'],
      ['/read/hamlet/chapter-8.html', '/read/hamlet/act-3-scene-1'],
      ['/read/romeo-and-juliet/chapter-1', '/read/romeo-and-juliet/prologue'],
      ['/read/othello/chapter-15', '/read/othello/act-5-scene-2'],
      ['/read/hamlet/chapter-99', '/read/hamlet'],
      ['/read/hamlet/summary', '/read/hamlet'],
      ['/read/hamlet/cast.html', '/read/hamlet'],
      ['/read/wuthering-heights/chapter-3', '/read/wuthering-heights'],
      ['/read/king-lear/chapter-2', '/read/king-lear'],
    ]) {
      const resp = await get(path)
      expect(resp.status, path).toBe(301)
      expect(resp.headers.get('Location'), path).toBe(target)
      expect(resp.headers.get('Cache-Control')).toBe('public, max-age=86400')
    }
  })

  it('keeps /read/{bookId} as before: the book page signed out (now linking its scenes), the library signed in', async () => {
    const out = await get('/read/hamlet')
    expect(out.status).toBe(200)
    const html = await out.text()
    expect(html).toContain('<title>Hamlet in modern English, scene by scene | Tinct</title>')
    expect(html).toContain('<a href="/read/hamlet/act-3-scene-1">')
    const signedIn = await get('/read/hamlet', { Cookie: 'tinct_auth=1' })
    expect(signedIn.status).toBe(302)
    expect(signedIn.headers.get('Location')).toBe('/library?book=hamlet')
  })
})
