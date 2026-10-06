// @vitest-environment jsdom

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyInternalFromUrl, initInternalTraffic, internalHeaders, syncInternalBadge } from '../public/lab/internal-traffic.js'
import { INTERNAL_KEY, internalTrafficHeaders, isInternalTraffic } from './utils/internalTraffic'
import { clearLocalUserData } from './services/storage'
import { corsHeaders } from './worker/lib/responses'
import { ensureNarration, fetchNarrationPilotInfo } from './lab/labNarration'
import { requestLabRecapSummary } from './preReader/recapSummaryClient'
import { researchVoiceQuestion } from './lab/labVoiceResearch'
import { reportTalkSeconds, setUsageReportTransport } from './utils/usageReport'

function visit(path: string) { window.history.replaceState(null, '', path) }

beforeEach(() => { localStorage.clear(); visit('/') })
afterEach(() => {
  localStorage.clear()
  document.querySelectorAll('[data-tinct-internal-badge]').forEach(node => node.remove())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setUsageReportTransport(null)
})

describe('the internal flag from the address', () => {
  it('?internal=1 sets the device flag and is stripped from the address, keeping everything else', () => {
    visit('/reader?book=odyssey&internal=1&chapter=3#p12')
    expect(applyInternalFromUrl()).toBe(true)
    expect(localStorage.getItem(INTERNAL_KEY)).toBe('1')
    expect(isInternalTraffic()).toBe(true)
    expect(location.pathname + location.search + location.hash).toBe('/reader?book=odyssey&chapter=3#p12')
  })

  it('?internal=0 clears it', () => {
    localStorage.setItem(INTERNAL_KEY, '1')
    visit('/library?internal=0')
    expect(applyInternalFromUrl()).toBe(false)
    expect(localStorage.getItem(INTERNAL_KEY)).toBeNull()
    expect(location.search).toBe('')
  })

  it('without the parameter the stored flag stays as it is; any other value is stripped and changes nothing', () => {
    localStorage.setItem(INTERNAL_KEY, '1')
    visit('/reader?book=odyssey')
    expect(applyInternalFromUrl()).toBe(true)
    visit('/reader?internal=yes')
    expect(applyInternalFromUrl()).toBe(true)
    expect(location.search).toBe('')
    localStorage.clear()
    visit('/reader?internal=true')
    expect(applyInternalFromUrl()).toBe(false)
  })

  it('never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    visit('/reader?internal=1')
    expect(() => applyInternalFromUrl()).not.toThrow()
    expect(isInternalTraffic()).toBe(false)
    expect(internalTrafficHeaders()).toEqual({})
  })
})

describe('the internal badge', () => {
  it('shows one small, non-interactive "internal" badge while the flag is set and removes it when cleared', () => {
    const badge = syncInternalBadge(document, true)!
    expect(badge.textContent).toBe('internal')
    expect(badge.getAttribute('aria-label')).toBe('internal')
    expect(badge.style.position).toBe('fixed')
    expect(badge.style.pointerEvents).toBe('none')
    expect(badge.style.fontSize || badge.style.font).toMatch(/10px/)
    syncInternalBadge(document, true)
    expect(document.querySelectorAll('[data-tinct-internal-badge]')).toHaveLength(1)
    syncInternalBadge(document, false)
    expect(document.querySelector('[data-tinct-internal-badge]')).toBeNull()
  })

  it('initialising from ?internal=1 marks the device and shows the badge', () => {
    visit('/library?internal=1')
    expect(initInternalTraffic(window)).toBe(true)
    expect(document.querySelector('[data-tinct-internal-badge]')?.textContent).toBe('internal')
    expect(location.search).toBe('')
  })
})

describe('AI and narration requests carry x-tinct-check: 1 while the flag is set', () => {
  const capture = () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = []
    const fetchImpl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), headers: { ...(init?.headers as Record<string, string> | undefined) } })
      return new Response(JSON.stringify({ enabled: true, voices: [], summary: 'A summary.', results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })
    return { calls, fetchImpl }
  }

  it('builds the header only while the flag is set', () => {
    expect(internalHeaders()).toEqual({})
    localStorage.setItem(INTERNAL_KEY, '1')
    expect(internalHeaders()).toEqual({ 'x-tinct-check': '1' })
    expect(internalTrafficHeaders()).toEqual({ 'x-tinct-check': '1' })
  })

  it('narration ensure and voices', async () => {
    localStorage.setItem(INTERNAL_KEY, '1')
    const { calls, fetchImpl } = capture()
    await ensureNarration({ bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'ara', paragraphs: [{ index: 0 }] }, { fetchImpl: fetchImpl as unknown as typeof fetch }).catch(() => {})
    await fetchNarrationPilotInfo(fetchImpl as unknown as typeof fetch)
    expect(calls.map(call => call.url)).toEqual(['/api/narration/ensure', '/api/narration/voices'])
    for (const call of calls) expect(call.headers['x-tinct-check']).toBe('1')
  })

  it('the recap route, signed out', async () => {
    localStorage.setItem(INTERNAL_KEY, '1')
    const { calls, fetchImpl } = capture()
    await requestLabRecapSummary({ request: {} as never, token: null, fetchImpl })
    expect(calls[0]).toMatchObject({ url: '/api/lab-recap', headers: { 'x-tinct-check': '1' } })
  })

  it('voice research and the usage reports', async () => {
    localStorage.setItem(INTERNAL_KEY, '1')
    const { calls, fetchImpl } = capture()
    vi.stubGlobal('fetch', fetchImpl)
    await researchVoiceQuestion('Who wrote this?', 'jwt')
    reportTalkSeconds({ seconds: 30, authToken: 'jwt' })
    expect(calls.map(call => call.url)).toEqual(['/api/voice-research', '/api/voice-usage'])
    for (const call of calls) expect(call.headers['x-tinct-check']).toBe('1')
  })

  it('sends no check header without the flag', async () => {
    const { calls, fetchImpl } = capture()
    await requestLabRecapSummary({ request: {} as never, token: null, fetchImpl })
    await fetchNarrationPilotInfo(fetchImpl as unknown as typeof fetch)
    for (const call of calls) expect(call.headers).not.toHaveProperty('x-tinct-check')
  })

  // Every client call to a metered Worker route adds the header. A new call site
  // that forgets it fails here instead of quietly counting our testing as readers.
  it('every client call site of an AI or narration route spreads internalTrafficHeaders()', () => {
    const ROUTE = /['"`](?:\/api\/(?:chat|lab-chat|lab-recap|lab-catch-up|lab-chapter-notes|narration\/(?:ensure|voices|listen)|voice-session|lab-voice-session|voice-research|voice-usage))['"`?]|CHAPTER_NOTES_ROUTE|CATCH_UP_ROUTE|LAB_RECAP_ROUTE|RECAP_SUMMARY_ROUTE/
    const root = join(__dirname)
    const files: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) { if (name !== 'worker' && name !== 'node_modules') walk(path); continue }
        if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\./.test(name) && name !== 'worker.ts') files.push(path)
      }
    }
    walk(root)
    const callers = files.filter(path => readFileSync(path, 'utf8').split('\n').some(line => /fetch(Impl)?\(|post\(/.test(line) && ROUTE.test(line)))
    expect(callers.length).toBeGreaterThanOrEqual(10)
    const missing = callers.filter(path => !readFileSync(path, 'utf8').includes('internalTrafficHeaders()')).map(path => relative(root, path))
    expect(missing).toEqual([])
    const addBook = readFileSync(join(root, '../public/lab/addbook/js/tinct-api.js'), 'utf8')
    expect(addBook).toMatch(/'x-tinct-check': '1'/)
    expect(addBook).toMatch(/internalHeaders\(\), token \?/)
  })

  it('the Worker lets the native app send the header cross-origin', () => {
    const headers = corsHeaders(new Request('https://tinct.app/api/lab-chat', { headers: { origin: 'https://localhost' } }))
    expect(headers['Access-Control-Allow-Headers']).toMatch(/X-Tinct-Check/i)
  })
})

describe('sign-out keeps the flag', () => {
  it('clearLocalUserData keeps tinct:internal (a device setting, not reader data)', () => {
    localStorage.setItem(INTERNAL_KEY, '1')
    localStorage.setItem('tinct-lab-device-id', 'device-1234')
    clearLocalUserData()
    expect(localStorage.getItem(INTERNAL_KEY)).toBe('1')
    expect(localStorage.getItem('tinct-lab-device-id')).toBeNull()
  })
})

describe('the /q share landing carries the flag to the reader', () => {
  const source = readFileSync(join(__dirname, '../public/share-open.js'), 'utf8')
  const run = (search: string) => {
    const replace = vi.fn()
    const body = { getAttribute: () => '/reader?share=abc&book=odyssey' }
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function('location', 'document', 'sessionStorage', source)({ search, replace }, { body, referrer: '' }, { setItem: () => {} })
    return replace.mock.calls[0]?.[0] as string
  }

  it('passes internal=1 or internal=0 through, and nothing else', () => {
    expect(run('?internal=1')).toBe('/reader?share=abc&book=odyssey&internal=1')
    expect(run('?internal=0')).toBe('/reader?share=abc&book=odyssey&internal=0')
    expect(run('?internal=<x>')).toBe('/reader?share=abc&book=odyssey')
    expect(run('')).toBe('/reader?share=abc&book=odyssey')
  })
})
