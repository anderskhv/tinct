import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

/**
 * Tinct's own checks must never count as readers. Every script that reaches
 * production (TINCT_ORIGIN, TEST_ORIGIN or tinct.app) uses the shared helper
 * (scripts/lib/internalTraffic.cjs: markInternal for browsers, checkHeaders /
 * checkFetch for API calls), or the test-account helper built on it.
 */
const SCRIPTS = resolve(__dirname, '../scripts')
const require = createRequire(import.meta.url)

/** Scripts that name production but never reach it, with the reason. */
const OFFLINE: Record<string, string> = {
  'check-gutenberg-adds.mjs': 'drives the Worker handler in-process; tinct.app is only the Request URL. It fetches gutenberg.org only.',
}

const TARGETS_PRODUCTION = /TINCT_ORIGIN|TEST_ORIGIN|https:\/\/tinct\.app|['"`]tinct\.app['"`]/
const REACHES_NETWORK = /\.launch\(|\.newPage\(|connectOverCDP|_android|\bfetch\(|new WebSocket\(|https?\.(request|get)\(/
const USES_HELPER = /lib\/internalTraffic\.cjs|lib\/testAccounts\.cjs/

function scriptFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'node_modules' || name === 'lib' ? [] : scriptFiles(path)
    return /\.(mjs|cjs|js|ts)$/.test(name) ? [path] : []
  })
}

describe('production-touching scripts mark themselves as internal traffic', () => {
  it('every script that reaches production uses the internal-traffic helper', () => {
    const missing = scriptFiles(SCRIPTS)
      .map(path => ({ path, name: relative(SCRIPTS, path), source: readFileSync(path, 'utf8') }))
      .filter(({ name, source }) => !OFFLINE[name] && TARGETS_PRODUCTION.test(source) && REACHES_NETWORK.test(source) && !USES_HELPER.test(source))
      .map(({ name }) => name)
    expect(missing, `Use scripts/lib/internalTraffic.cjs (markInternal on the browser; checkHeaders/checkFetch on API calls) in: ${missing.join(', ')}`).toEqual([])
  })

  it('the offline exemptions really never fetch production', () => {
    for (const name of Object.keys(OFFLINE)) {
      const source = readFileSync(join(SCRIPTS, name), 'utf8')
      expect(source, name).not.toMatch(/\.launch\(|newPage\(|new WebSocket\(/)
      // Its only Tinct URL is the in-process Request.
      expect(source.match(/fetchImpl\(\s*url/g)?.length ?? 0, name).toBeLessThanOrEqual(1)
      expect(source, name).toMatch(/gutenberg\.org/)
    }
  })

  it('the named production checks are covered', () => {
    for (const name of [
      'check-own-book-hyphenation.mjs', 'check-page-break-lines.mjs', 'check-phone-audio-player.mjs',
      'check-edition-holds-production.cjs', 'android/check-publication.mjs', 'realtime-audio-probe.mjs',
      'narration-warm.mjs', 'warm-grok-openings.mjs', 'warm-helios.mjs', 'verify-admin-metrics.cjs',
    ]) expect(readFileSync(join(SCRIPTS, name), 'utf8'), name).toMatch(USES_HELPER)
  })
})

describe('internal-traffic helper', () => {
  const helper = require('../scripts/lib/internalTraffic.cjs') as {
    markInternal: (target: unknown) => Promise<unknown>
    checkHeaders: (extra?: Record<string, string>) => Record<string, string>
  }

  it('adds x-tinct-check to Node-side calls without dropping the caller headers', () => {
    expect(helper.checkHeaders({ Authorization: 'Bearer x' })).toEqual({ Authorization: 'Bearer x', 'x-tinct-check': '1' })
  })

  it("the page init script sets the flag and marks the page's own /api/ fetches only", async () => {
    let script: (() => void) | undefined
    await helper.markInternal({ addInitScript: async (fn: () => void) => { script = fn } })
    expect(script).toBeTypeOf('function')
    const calls: Array<{ url: string; headers: Headers }> = []
    const storage = new Map<string, string>()
    const location = { href: 'https://tinct.app/reader', origin: 'https://tinct.app' }
    const original = vi.fn((input: string, init?: RequestInit) => { calls.push({ url: input, headers: new Headers(init?.headers) }); return Promise.resolve(new Response('')) })
    const fakeWindow: Record<string, unknown> = { fetch: original, location }
    vi.stubGlobal('window', fakeWindow)
    vi.stubGlobal('localStorage', { setItem: (key: string, value: string) => storage.set(key, value) })
    try {
      // The serialised function runs in the page; here it runs against a stand-in window.
      script!()
      const fetchInPage = fakeWindow.fetch as (input: string, init?: RequestInit) => Promise<Response>
      await fetchInPage('/api/profile', { headers: { Authorization: 'Bearer t' } })
      await fetchInPage('https://tinct.app/api/lab-recap')
      await fetchInPage('https://abc-tinct.example.workers.dev/api/chat')
      await fetchInPage('/reader')
      await fetchInPage('https://yazjyiqsxjystvpkyouk.supabase.co/rest/v1/profiles')
      await fetchInPage('https://audio.tinct.app/file.mp3')
    } finally {
      vi.unstubAllGlobals()
    }
    expect(storage.get('tinct:internal')).toBe('1')
    const marked = calls.map(call => [call.url, call.headers.get('x-tinct-check')])
    expect(marked).toEqual([
      ['/api/profile', '1'],
      ['https://tinct.app/api/lab-recap', '1'],
      ['https://abc-tinct.example.workers.dev/api/chat', '1'],
      ['/reader', null],
      ['https://yazjyiqsxjystvpkyouk.supabase.co/rest/v1/profiles', null],
      ['https://audio.tinct.app/file.mp3', null],
    ])
    expect(calls[0].headers.get('authorization')).toBe('Bearer t')
  })
})

describe('test accounts', () => {
  const accounts = require('../scripts/lib/testAccounts.cjs') as {
    TEST_ACCOUNT_DOMAIN: string
    testAccountEmail: (label: string) => string
    isTestAccountEmail: (email: string) => boolean
    createTestAccount: (options: Record<string, unknown>) => Promise<{ id: string; email: string }>
    deleteTestAccount: (options: Record<string, unknown>) => Promise<boolean>
  }

  it('only ever makes qa-*@test.tinct.app addresses', () => {
    const email = accounts.testAccountEmail('Soc A!')
    expect(email).toMatch(/^qa-soc-a-[0-9a-f]{6}@test\.tinct\.app$/)
    expect(accounts.isTestAccountEmail(email)).toBe(true)
    for (const other of ['qa-soc-a@example.com', 'reader@gmail.com', 'qa-x@test.tinct.app.evil.com', 'anders@tinct.app']) {
      expect(accounts.isTestAccountEmail(other), other).toBe(false)
    }
  })

  it('creates a confirmed, marked account with the check header, and flags its profile', async () => {
    const requests: Array<{ url: string; init: RequestInit }> = []
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      requests.push({ url, init })
      return url.includes('/auth/v1/admin/users') ? new Response(JSON.stringify({ id: 'u-1' })) : new Response(null, { status: 204 })
    })
    const account = await accounts.createTestAccount({ supabaseUrl: 'https://sb.example.invalid', serviceKey: 'service', label: 'soc-a', fetchImpl })
    expect(account.id).toBe('u-1')
    expect(accounts.isTestAccountEmail(account.email)).toBe(true)
    const created = JSON.parse(String(requests[0].init.body))
    expect(created).toMatchObject({ email: account.email, email_confirm: true, app_metadata: { is_test: true } })
    expect(requests[1].url).toBe('https://sb.example.invalid/rest/v1/profiles?id=eq.u-1')
    expect(JSON.parse(String(requests[1].init.body))).toEqual({ is_test: true })
    for (const request of requests) expect((request.init.headers as Record<string, string>)['x-tinct-check']).toBe('1')
  })

  it('refuses to delete anything but a test account', async () => {
    const fetchImpl = vi.fn()
    await expect(accounts.deleteTestAccount({ origin: 'https://tinct.app', adminToken: 't', userId: 'u', email: 'reader@gmail.com', fetchImpl })).rejects.toThrow(/Not a test account/)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
