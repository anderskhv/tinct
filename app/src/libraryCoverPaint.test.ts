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
  type Callback = (entries: Array<{ isIntersecting: boolean; target: Canvas }>) => void
  const options: Record<string, string>[] = []
  const observed = new Set<Canvas>()
  const watching = new Map<Canvas, Record<string, string>>()
  const callbacks: Callback[] = []
  class FakeObserver {
    opts: Record<string, string>
    cb: Callback
    constructor(cb: Callback, opts: Record<string, string>) { this.cb = cb; this.opts = opts; callbacks.push(cb); options.push(opts) }
    observe(c: Canvas) { observed.add(c); watching.set(c, this.opts); observers.set(c, this) }
    unobserve(c: Canvas) { observed.delete(c) }
  }
  const observers = new Map<Canvas, FakeObserver>()
  class FakeImage { src = ''; naturalWidth = 10; naturalHeight = 15; decode() { return imageFails ? Promise.reject(new Error('404')) : Promise.resolve() } }
  const canvases: Canvas[] = []
  const textures = new Map<string, unknown>()
  const paperCover = vi.fn((title: string) => ({ paper: title }))
  const paintCover = (c: Canvas, id: string) => { if (textures.has(id)) c.dataset.painted = 'true' }
  // No book is opening here: the quiet loads (quiet-loads.js) run every cover at once.
  const quiet = { run: (_key: string, task: () => unknown) => task() }
  const factory = new Function('IntersectionObserver', 'Image', 'textures', 'coverReady', 'paperCover', 'paintCover', 'all', 'coverTexture', 'bookById', 'quiet',
    block + '\nreturn {ensureCover,observeCover,coverObserver};')
  const api = factory(FakeObserver, FakeImage, textures, new Map(), paperCover, paintCover, () => canvases, async (im: unknown) => im,
    (id: string) => pool.find(b => b.id === id), quiet)
  const canvasFor = (book: Book) => { const c: Canvas = { dataset: { book: book.id } }; canvases.push(c); api.observeCover(c, book); return c }
  // The observer watching the canvas reports it, as the browser would; else the shelves' observer.
  const intersect = (c: Canvas) => (observers.get(c)?.cb ?? callbacks[0])([{ isIntersecting: true, target: c }])
  return { canvasFor, intersect, observed, options: () => options, margins: (c: Canvas) => watching.get(c), paperCover }
}
const flush = () => new Promise(r => setTimeout(r, 0))
const shakespeare: Book = { id: 'pd-pg-100', title: 'The Complete Works of William Shakespeare', author: 'William Shakespeare', cover: '/api/public-books/pd-pg-100/cover' }

describe('library covers always paint (library_2/app.js)', () => {
  it('loads covers just past a reel\'s scrolled edge, not only near the viewport', () => {
    const h = harness()
    expect(h.options()[0]).toEqual({ rootMargin: '400px', scrollMargin: '400px' })
    expect(h.margins(h.canvasFor({ id: 'iliad', title: 'The Iliad', author: 'Homer', cover: '/covers/v2/iliad.webp' }))).toEqual({ rootMargin: '400px', scrollMargin: '400px' })
  })

  // Phone QA 2026-10-15: on /library?book=odyssey two added books' paintings (Gorgias 392 KB,
  // A Modest Proposal 438 KB) downloaded on first paint, two cards past their reels' edges and
  // rows below the fold. The cover route serves only the full-size painting, so those covers
  // load a card ahead of being seen, still past the reel's edge (the Shakespeare case above).
  it('loads an added book\'s full-size painting only a card ahead of being seen', () => {
    const h = harness()
    expect(h.margins(h.canvasFor(shakespeare))).toEqual({ rootMargin: '150px', scrollMargin: '150px' })
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
