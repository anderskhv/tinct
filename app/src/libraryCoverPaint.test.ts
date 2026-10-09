// Every visible library cover paints (2026-10-09): The Complete Works of William Shakespeare
// (pd-pg-100, a reader-added book) stayed a blank canvas in the Drama "Tragedies" reel. It sat
// just past the reel's scrolled edge: rootMargin reaches only the viewport, so its cover never
// loaded until it scrolled in. Also: a painting that fails falls back to paper boards, and a
// canvas made before its book is in searchPool() still finds its book.
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

const app = readFileSync('public/lab/library_2/app.js', 'utf8')
const block = app.slice(app.indexOf('function ensureCover('), app.indexOf('// The first cover has priority'))

type Book = { id: string; title: string; author: string; cover?: string; paper?: boolean }
type Canvas = { dataset: { book: string; painted?: string } }

function harness({ imageFails = false, pool = [] as Book[] } = {}) {
  let callback: (entries: Array<{ isIntersecting: boolean; target: Canvas }>) => void = () => {}
  let options: Record<string, string> = {}
  const observed = new Set<Canvas>()
  class FakeObserver {
    constructor(cb: typeof callback, opts: Record<string, string>) { callback = cb; options = opts }
    observe(c: Canvas) { observed.add(c) }
    unobserve(c: Canvas) { observed.delete(c) }
  }
  class FakeImage { src = ''; naturalWidth = 10; naturalHeight = 15; decode() { return imageFails ? Promise.reject(new Error('404')) : Promise.resolve() } }
  const canvases: Canvas[] = []
  const textures = new Map<string, unknown>()
  const paperCover = vi.fn((title: string) => ({ paper: title }))
  const paintCover = (c: Canvas, id: string) => { if (textures.has(id)) c.dataset.painted = 'true' }
  const factory = new Function('IntersectionObserver', 'Image', 'textures', 'coverReady', 'paperCover', 'paintCover', 'all', 'coverTexture', 'bookById',
    block + '\nreturn {ensureCover,observeCover,coverObserver};')
  const api = factory(FakeObserver, FakeImage, textures, new Map(), paperCover, paintCover, () => canvases, async (im: unknown) => im,
    (id: string) => pool.find(b => b.id === id))
  const canvasFor = (book: Book) => { const c: Canvas = { dataset: { book: book.id } }; canvases.push(c); api.observeCover(c, book); return c }
  const intersect = (c: Canvas) => callback([{ isIntersecting: true, target: c }])
  return { canvasFor, intersect, observed, options: () => options, paperCover }
}
const flush = () => new Promise(r => setTimeout(r, 0))
const shakespeare: Book = { id: 'pd-pg-100', title: 'The Complete Works of William Shakespeare', author: 'William Shakespeare', cover: '/api/public-books/pd-pg-100/cover' }

describe('library covers always paint (library_2/app.js)', () => {
  it('loads covers just past a reel\'s scrolled edge, not only near the viewport', () => {
    expect(harness().options()).toEqual({ rootMargin: '400px', scrollMargin: '400px' })
  })

  it('paints a canvas whose book is not in searchPool() yet', async () => {
    const h = harness({ pool: [] })
    const c = h.canvasFor(shakespeare)
    h.intersect(c)
    await flush()
    expect(c.dataset.painted).toBe('true')
    expect(h.observed.has(c)).toBe(false)
  })

  it('falls back to the paper cover when the painting cannot load', async () => {
    const h = harness({ imageFails: true })
    const c = h.canvasFor(shakespeare)
    h.intersect(c)
    await flush(); await flush()
    expect(h.paperCover).toHaveBeenCalledWith(shakespeare.title, shakespeare.author)
    expect(c.dataset.painted).toBe('true')
  })

  it('keeps watching a canvas whose book cannot be found', () => {
    const h = harness()
    const c: Canvas = { dataset: { book: 'unknown' } }
    h.intersect(c)
    expect(h.paperCover).not.toHaveBeenCalled()
  })
})
