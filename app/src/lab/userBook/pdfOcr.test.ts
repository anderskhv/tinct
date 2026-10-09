/**
 * Recognising the text of a scanned PDF, the device's side (addbooks/web/src/js/pdf-ocr.js,
 * installed as public/lab/addbook/js/pdf-ocr.js): when it is offered and to whom, what the
 * reader is told at each step (the approved copy), which pages are sent and how an upload
 * resumes, and the edition a recognised text opens in. The account is a fake; nothing is sent.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { assembleOcrEdition, ocrDefaultEdition, type OcrPage } from './ocrEdition'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))

type Status = Record<string, unknown> & { state: string }
type Local = Record<string, unknown>
interface View { kind: string; text: string; action?: string }
interface OcrApi {
  RENDER_EDGE: number; JPEG_QUALITY: number; BLANK_INK: number; PARALLEL: number; POLL_MS: number
  FREE_LINE: string
  view: (status: Status | null, local?: Local, pages?: number) => View | null
  shelfLine: (status: Status | null) => string | null
  toSend: (status: Status | null, pages: number, blank?: number[]) => number[]
  upload: (pages: number[], options: Record<string, unknown>) => Promise<void>
  run: (ctx: Record<string, unknown>) => Promise<Status | null>
  defaultEdition: (edition: unknown) => 'text' | 'pages'
  greyInk: (data: Uint8ClampedArray) => number
  api: (options: Record<string, unknown>) => { status: (hex: string) => Promise<Status | null>; put: (hex: string, n: number, blob: Blob) => Promise<string> }
}

let ocr: OcrApi
beforeAll(() => {
  require(ROOT + 'addbooks/web/src/js/pdf-ocr.js')
  ocr = (globalThis as unknown as { TinctPdfOcr: OcrApi }).TinctPdfOcr
})

const month = { used: 40, limit: 1500 }
const status = (state: string, extra: Record<string, unknown> = {}): Status => ({ state, pages: 250, uploaded: 0, done: 0, failed: 0, blank: 0, month, tier: 'premium', ...extra })

describe('pdf-ocr.js: the installed copy is this one', () => {
  it('is identical in the app’s static files', () => {
    expect(readFileSync(ROOT + 'app/public/lab/addbook/js/pdf-ocr.js', 'utf8')).toBe(readFileSync(ROOT + 'addbooks/web/src/js/pdf-ocr.js', 'utf8'))
  })
  it('makes pages as the plan says: 1600 px long edge, JPEG quality 0.75, blank under 0.3% ink, four at a time, status every 5 s', () => {
    expect([ocr.RENDER_EDGE, ocr.JPEG_QUALITY, ocr.BLANK_INK, ocr.PARALLEL, ocr.POLL_MS]).toEqual([1600, 0.75, 0.003, 4, 5000])
  })
})

describe('the offer: Premium and the trial are asked once; a free account gets one calm line; switched off, nothing', () => {
  it('offers Premium and the trial recognition of a scan, with its pages and the month’s pages it would use', () => {
    for (const tier of ['premium', 'trial']) {
      const shown = ocr.view(status('none', { pages: 0, tier, month: { used: 40, limit: 1500 } }), {}, 250)
      expect(shown).toMatchObject({ kind: 'offer', action: 'start' })
      expect(shown!.text).toContain('250 pages')
      expect(shown!.text).toContain('250 of the 1,460 pages left in your month')
    }
    expect(ocr.view(status('none', { pages: 0, tier: 'trial', month: { used: 0, limit: 300 } }), {}, 250)!.text).toContain('250 of the 300 pages left')
  })

  it('asks once per book', () => {
    expect(ocr.view(status('none', { pages: 0 }), { asked: true }, 250)).toBeNull()
  })

  it('shows a free account the approved line, which opens the account sheet, and only that', () => {
    const shown = ocr.view(status('none', { pages: 0, tier: 'none' }), {}, 250)
    expect(shown).toEqual({ kind: 'free', text: 'This PDF is a scan. With Premium, Tinct can recognise its text so you can read it reflowed, listen and ask about it.', action: 'account' })
    // Also when Premium lapsed during a job; and the recognised text of a finished job stays readable.
    expect(ocr.view(status('paused', { tier: 'none', reason: 'premium_required' }))).toMatchObject({ kind: 'free' })
    expect(ocr.view(status('done', { tier: 'none', done: 250 }), { ready: true })).toBeNull()
  })

  it('shows nothing when recognition is switched off (the status route answers 404) or the account cannot be asked', async () => {
    expect(ocr.view(null, {}, 250)).toBeNull()
    const off = ocr.api({ token: () => 'token-1', fetch: vi.fn(async () => new Response('{"error":"Not found"}', { status: 404 })) })
    expect(await off.status('ab'.repeat(12))).toBeNull()
    const offline = ocr.api({ token: () => 'token-1', fetch: vi.fn(async () => { throw new TypeError('offline') }) })
    expect(await offline.status('ab'.repeat(12))).toBeNull()
    expect(ocr.view(await off.status('ab'.repeat(12)), {}, 250)).toBeNull()
  })
})

describe('progress, in the approved words', () => {
  it('prepares pages, then recognises them, then the Tinct text is ready', () => {
    expect(ocr.view(status('uploading', { uploaded: 38, blank: 2 }))).toEqual({ kind: 'progress', text: 'Preparing pages 40 of 250' })
    // This device's count, while it sends, when it is ahead of the account's.
    expect(ocr.view(status('uploading', { uploaded: 10 }), { prepared: 40 })!.text).toBe('Preparing pages 40 of 250')
    expect(ocr.view(status('running', { uploaded: 248, blank: 2, done: 118 }))).toEqual({ kind: 'progress', text: 'Recognising text: 120 of 250 pages' })
    expect(ocr.view(status('done', { done: 248, blank: 2 }))).toEqual({ kind: 'ready', text: 'Tinct text is ready' })
    // Said once: once seen, the "Tinct text" control is what stays.
    expect(ocr.view(status('done', { done: 248, blank: 2 }), { ready: true })).toBeNull()
  })

  it('names the day a monthly limit lets it go on, and "later" for the shared pool', () => {
    const nov = Date.UTC(2026, 10, 1)
    expect(ocr.view(status('paused', { reason: 'account_pages', resumesAt: nov }))).toEqual({ kind: 'paused', text: 'Continues on 1 November' })
    expect(ocr.view(status('paused', { reason: 'account_usd', resumesAt: Date.UTC(2027, 0, 1) }))!.text).toBe('Continues on 1 January')
    expect(ocr.view(status('paused', { reason: 'global_usd', resumesAt: nov }))).toEqual({ kind: 'paused', text: 'Continues later' })
  })

  it('offers to try the pages that could not be read again', () => {
    expect(ocr.view(status('done', { done: 247, failed: 3 }))).toEqual({ kind: 'failed', text: '3 pages could not be read.', action: 'retry' })
    expect(ocr.view(status('done', { done: 249, failed: 1 }))!.text).toBe('1 page could not be read.')
  })

  it('My shelf says "Recognising text…" while a job is under way', () => {
    for (const state of ['uploading', 'running', 'paused']) expect(ocr.shelfLine(status(state))).toBe('Recognising text…')
    for (const state of ['none', 'done', 'failed']) expect(ocr.shelfLine(status(state))).toBeNull()
    expect(ocr.shelfLine(null)).toBeNull()
  })
})

describe('sending pages: only what is missing, four at a time, only while visible, resumable', () => {
  it('sends every page but the blank ones before the job exists, and then only those the account says are missing', () => {
    expect(ocr.toSend(null, 5)).toEqual([1, 2, 3, 4, 5])
    expect(ocr.toSend(status('none'), 4, [2])).toEqual([1, 3, 4])
    expect(ocr.toSend(status('uploading', { missing: [3, 5, 9, 700] }), 10, [5])).toEqual([3, 9])
    expect(ocr.toSend(status('running'), 10)).toEqual([])
  })

  it('sends four at a time and waits while the page is hidden', async () => {
    let inFlight = 0, most = 0
    let visible = false
    let release: () => void = () => {}
    const shown = new Promise<void>(resolve => { release = resolve })
    const sent: number[] = []
    const done = ocr.upload([1, 2, 3, 4, 5, 6, 7, 8, 9], {
      render: async () => ({ blank: false, blob: new Blob(['x']) }),
      put: async (n: number) => { inFlight++; most = Math.max(most, inFlight); await new Promise(r => setTimeout(r, 2)); inFlight--; sent.push(n); return 'ok' },
      waitVisible: () => (visible ? Promise.resolve() : shown),
    })
    await new Promise(r => setTimeout(r, 20))
    expect(sent).toEqual([])
    visible = true
    release()
    await done
    expect(sent.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(most).toBe(4)
  })

  it('stops at an error with what it has not sent left for the next run', async () => {
    const sent: number[] = []
    await expect(ocr.upload([1, 2, 3, 4, 5, 6], {
      parallel: 1,
      render: async () => ({ blank: false, blob: new Blob(['x']) }),
      put: async (n: number) => { if (n === 3) throw Object.assign(new Error('offline'), { code: 'offline' }); sent.push(n); return 'ok' },
    })).rejects.toThrow('offline')
    expect(sent).toEqual([1, 2])
  })

  /** A fake account: the job's pages, which are missing, and what it was sent. */
  function account(pages: number) {
    const state = { started: false, missing: new Set<number>(), blank: new Set<number>(), done: new Set<number>(), puts: [] as number[], starts: [] as unknown[] }
    const snapshot = (): Status => {
      if (!state.started) return status('none', { pages: 0 })
      const missing = [...state.missing].sort((a, b) => a - b)
      const uploaded = pages - missing.length - state.blank.size
      const finished = !missing.length && state.done.size + state.blank.size === pages
      return status(finished ? 'done' : missing.length ? 'uploading' : 'running', { pages, uploaded, done: state.done.size, blank: state.blank.size, ...(missing.length ? { missing } : {}) })
    }
    const api = {
      start: vi.fn(async (_hex: string, body: { pages: number; blank?: number[] }) => {
        state.starts.push(body)
        if (!state.started) { state.started = true; for (let n = 1; n <= pages; n++) state.missing.add(n) }
        for (const n of body.blank ?? []) if (state.missing.delete(n)) state.blank.add(n)
        return snapshot()
      }),
      status: vi.fn(async () => snapshot()),
      put: vi.fn(async (_hex: string, n: number) => { state.puts.push(n); state.missing.delete(n); return 'ok' }),
      edition: vi.fn(async () => ({ source: 'ocr', chapters: [{ number: 1, title: 'x', paragraphs: ['x'] }] })),
      // The account recognises what it has.
      recognise() { for (let n = 1; n <= pages; n++) if (!state.missing.has(n) && !state.blank.has(n)) state.done.add(n) },
    }
    return { state, api }
  }
  const memory = () => { let kept: Local = {}; return { get: () => kept, set: (patch: Local) => { kept = { ...kept, ...patch } } } }

  it('closed mid-upload and opened again, sends only the pages still missing, then finishes and hands over the Tinct text', async () => {
    const { state, api } = account(10)
    const local = memory()
    const blankPages = new Set([4])
    const render = vi.fn(async (n: number) => (blankPages.has(n) ? { blank: true } : { blank: false, blob: new Blob([String(n)]) }))
    // First visit: closed after five pages are made.
    let open = true
    const seen: string[] = []
    const first = await ocr.run({
      hex: 'h', pages: 10, api, local, render, sleep: async () => {}, pollMs: 0,
      live: () => open,
      onStatus: (s: Status, l: Local) => { seen.push(ocr.view(s, l)!.text); if ((l.prepared as number) >= 5) open = false },
    })
    expect(first).toMatchObject({ state: 'uploading' })
    expect(state.puts.length).toBeLessThan(10)
    expect(local.get()).toMatchObject({ asked: true, started: true, blank: [4] })
    expect(seen).toContain('Preparing pages 5 of 10')
    const sentFirst = [...state.puts]

    // Second visit: the account says what is missing; page 4 is known blank here and told with the start.
    render.mockClear()
    const editions: unknown[] = []
    const last = await ocr.run({
      hex: 'h', pages: 10, api, local, render, sleep: async () => { api.recognise() }, pollMs: 0,
      onStatus: () => {},
      onEdition: (edition: unknown) => { editions.push(edition) },
    })
    expect(api.start.mock.calls[1][1]).toMatchObject({ pages: 10, blank: [4] })
    const sentSecond = state.puts.slice(sentFirst.length)
    expect(new Set([...sentFirst, ...sentSecond]).size).toBe(sentFirst.length + sentSecond.length)
    expect([...sentFirst, ...sentSecond].sort((a, b) => a - b)).toEqual([1, 2, 3, 5, 6, 7, 8, 9, 10])
    expect(render.mock.calls.map(([n]) => n).every(n => !sentFirst.includes(n as number))).toBe(true)
    expect(last).toMatchObject({ state: 'done', blank: 1, done: 9 })
    expect(editions).toHaveLength(1)
  })

  it('tells the account of blank pages it finds, so the job can finish', async () => {
    const { state, api } = account(3)
    const local = memory()
    await ocr.run({
      hex: 'h', pages: 3, api, local, sleep: async () => { api.recognise() }, pollMs: 0,
      render: async (n: number) => (n === 2 ? { blank: true } : { blank: false, blob: new Blob(['x']) }),
    })
    expect(state.puts.sort()).toEqual([1, 3])
    expect(api.start.mock.calls.at(-1)![1]).toEqual({ pages: 3, blank: [2] })
    expect(state.blank.has(2)).toBe(true)
  })

  it('re-runs the pages that could not be read: asks with rerun "failed" and sends those pages again', async () => {
    const { state, api } = account(3)
    state.started = true
    state.done = new Set([1, 3])
    state.missing = new Set()
    // The account forgot page 2's image after it failed: re-running makes it missing again.
    api.start.mockImplementationOnce(async (_hex: string, body: { pages: number; rerun?: string }) => { state.starts.push(body); state.missing.add(2); return status('uploading', { pages: 3, missing: [2], done: 2 }) })
    await ocr.run({ hex: 'h', pages: 3, api, local: memory(), rerun: 'failed', sleep: async () => { api.recognise() }, pollMs: 0, render: async () => ({ blank: false, blob: new Blob(['x']) }) })
    expect(state.starts[0]).toMatchObject({ pages: 3, rerun: 'failed' })
    expect(state.puts).toEqual([2])
  })

  it('skips a page the account has already recognised (409), and waits out its rate limit', async () => {
    const sleep = vi.fn(async () => {})
    const replies = [new Response('', { status: 429 }), new Response('{"ok":true}', { status: 200 }), new Response('{"error":"not_expected"}', { status: 409 })]
    const fetchImpl = vi.fn(async () => replies.shift()!)
    const client = ocr.api({ token: () => 'token-1', fetch: fetchImpl, sleep })
    expect(await client.put('h', 1, new Blob(['x']))).toBe('ok')
    expect(sleep).toHaveBeenCalledTimes(1)
    expect(await client.put('h', 2, new Blob(['x']))).toBe('skipped')
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/user-books/ocr/h/pages/1')
    expect(init).toMatchObject({ method: 'PUT', headers: { 'Content-Type': 'image/jpeg', Authorization: 'Bearer token-1' } })
  })
})

describe('pages and their ink', () => {
  it('greys a page and measures its ink: blank under 0.3%', () => {
    const page = (inkPixels: number, of = 10000) => {
      const data = new Uint8ClampedArray(of * 4).fill(255)
      for (let i = 0; i < inkPixels; i++) { data[i * 4] = 20; data[i * 4 + 1] = 40; data[i * 4 + 2] = 200 }
      return data
    }
    const some = page(29)
    expect(ocr.greyInk(some)).toBeLessThan(ocr.BLANK_INK)
    expect(ocr.greyInk(page(31))).toBeGreaterThan(ocr.BLANK_INK)
    // Grey now: red, green and blue the same.
    expect(some[0]).toBe(some[1])
    expect(some[1]).toBe(some[2])
  })
})

describe('the edition a recognised text opens in', () => {
  it('is the Worker’s rule (ocrEdition.ts ocrDefaultEdition): Tinct text unless columns on ≥30% and equations on ≥20%', () => {
    for (const [columns, equations] of [[3, 2], [2, 2], [3, 1], [10, 10], [0, 0], [5, 0]]) {
      const pages = Array.from({ length: 10 }, (_, i): OcrPage => ({ page: i + 1, columns: i < columns ? 2 : 1, blocks: [{ t: 'p', x: 'Text.' }, ...(i < equations ? [{ t: 'eq' as const, x: 'x = 1' }] : [])] }))
      const edition = assembleOcrEdition({ title: 't', author: 'a', pages })
      expect(ocr.defaultEdition(edition), `${columns} ${equations}`).toBe(ocrDefaultEdition(edition))
    }
    expect(ocr.defaultEdition(null)).toBe('text')
  })
})
