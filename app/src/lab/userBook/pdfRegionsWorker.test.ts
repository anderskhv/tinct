/**
 * A page's regions worked out off the main thread (pdf-regions.js find / finder, js/pdf-regions-worker.js; Anders,
 * 20 Oct 2026: the conversion took a while): the same regions as on the main thread, and the main thread's own when
 * no worker can start, before it has loaded, or when it fails.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
type Input = { ink: Uint8Array; W: number; H: number; spans: unknown[]; body: unknown[]; vp: { width: number; height: number } }
interface Api { find: (input: Input, margin: unknown) => unknown[]; finder: (url: string | null, margin: unknown) => (input: Input) => Promise<unknown[]> }
let api: Api
let margin: unknown
const G = globalThis as unknown as { Worker?: unknown; TinctPdfRegions: Api; TinctMargin: unknown }
const realWorker = G.Worker

beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-regions.js')
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  api = G.TinctPdfRegions
  margin = G.TinctMargin
})
afterEach(() => { G.Worker = realWorker })

// A page 240 x 310 with a picture (a dark box) between two blocks of prose, and a displayed formula.
function page(): Input {
  const W = 240, H = 310, ink = new Uint8Array(W * H)
  for (let y = 120; y < 200; y++) for (let x = 50; x < 190; x++) ink[y * W + x] = 1
  const spans: unknown[] = [], body: unknown[] = []
  const line = (y: number, str: string, x = 60, size = 10) => {
    spans.push({ x: x / 480, y: (y - size * 0.86) / 620, w: (str.length * 5) / 480, h: (size * 1.1) / 620, text: str })
    body.push({ x, base: y, size, w: str.length * 5, str })
  }
  for (let k = 0; k < 8; k++) line(60 + k * 14, 'All the objects of human reason or enquiry may naturally be divided into two kinds')
  line(420, 'Figure 1. A dark box standing for a picture.', 100, 9)
  line(470, 'x = ∑ a + ∫ b', 200)
  for (let k = 0; k < 6; k++) line(510 + k * 14, 'Matters of fact, which are the second objects of human reason, are not ascertained')
  return { ink, W, H, spans, body, vp: { width: 480, height: 620 } }
}

// A worker run here: loaded (`ready`), then each page through the same find, its message cloned as postMessage clones it.
class HereWorker {
  onmessage: ((e: { data: unknown }) => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  constructor() { setTimeout(() => this.onmessage?.({ data: { ready: true } }), 0) }
  postMessage(data: Input & { id: number }) {
    const input = structuredClone(data)
    setTimeout(() => this.onmessage?.({ data: structuredClone({ id: input.id, regions: api.find(input, margin) }) }), 0)
  }
  terminate() {}
}

describe('a page\'s regions off the main thread', () => {
  it('are found on this thread without a worker, as find finds them', async () => {
    G.Worker = undefined
    const want = api.find(page(), margin)
    expect(want.length).toBeGreaterThan(0)
    expect(await api.finder('/w.js', margin)(page())).toEqual(want)
    expect(await api.finder(null, margin)(page())).toEqual(want)
  })
  it('are the same from the worker, once it has loaded, as on this thread', async () => {
    G.Worker = HereWorker
    const want = api.find(page(), margin), find = api.finder('/w.js', margin)
    expect(await find(page())).toEqual(want)
    await new Promise(r => setTimeout(r, 5))
    expect(await Promise.all([find(page()), find(page())])).toEqual([want, want])
  })
  it('fall back to this thread when the worker fails', async () => {
    class Broken extends HereWorker { postMessage() { setTimeout(() => this.onerror?.({ preventDefault() {} }), 0) } }
    G.Worker = Broken
    const want = api.find(page(), margin), find = api.finder('/w.js', margin)
    await new Promise(r => setTimeout(r, 5))
    expect(await find(page())).toEqual(want)
    expect(await find(page())).toEqual(want)
  })
})
