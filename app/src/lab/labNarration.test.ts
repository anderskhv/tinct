import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LAB_PREFS } from './labPrefs'
import {
  applyNarrationPilotFlag,
  ensureNarration,
  fetchNarrationPilotInfo,
  narrationFailureMessage,
  narrationPilotApplies,
  narrationPilotFlag,
  resolveNarrationVoice,
  NarrationEnsureError,
} from './labNarration'
import { narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

afterEach(() => vi.unstubAllGlobals())

describe('narration pilot flag and prefs', () => {
  it('reads the query flag and applies it to prefs without touching anything else', () => {
    expect(narrationPilotFlag('?narration=fish')).toBe('fish')
    expect(narrationPilotFlag('narration=FISH&chrome=v2')).toBe('fish')
    expect(narrationPilotFlag('?narration=off')).toBe('off')
    expect(narrationPilotFlag('?narration=0')).toBe('off')
    expect(narrationPilotFlag('?chrome=v2')).toBeNull()
    expect(narrationPilotFlag(undefined)).toBeNull()
    const on = applyNarrationPilotFlag(DEFAULT_LAB_PREFS, 'fish')
    expect(on).toMatchObject({ narrationProvider: 'fish', primaryEdition: DEFAULT_LAB_PREFS.primaryEdition })
    expect(applyNarrationPilotFlag(on, 'fish')).toBe(on)
    expect(applyNarrationPilotFlag(on, 'off').narrationProvider).toBeNull()
    expect(applyNarrationPilotFlag(DEFAULT_LAB_PREFS, null)).toBe(DEFAULT_LAB_PREFS)
  })

  it('applies only inside the pilot scope and only after opting in', () => {
    const on = { ...DEFAULT_LAB_PREFS, narrationProvider: 'fish' as const }
    expect(narrationPilotApplies(on, 'odyssey', 'original-en', 1)).toBe(true)
    expect(narrationPilotApplies(on, 'odyssey', 'modern-en', 1)).toBe(true)
    expect(narrationPilotApplies(on, 'odyssey', 'modern-da', 1)).toBe(false)
    expect(narrationPilotApplies(on, 'odyssey', 'original-en', 2)).toBe(false)
    expect(narrationPilotApplies(on, 'bible', 'kjv-en', 1)).toBe(false)
    expect(narrationPilotApplies(DEFAULT_LAB_PREFS, 'odyssey', 'original-en', 1)).toBe(false)
  })

  it('remembers the chosen voice while the server still offers it', () => {
    const voices = [{ key: 'a', label: 'Nathan' }, { key: 'b', label: 'Abby' }]
    expect(resolveNarrationVoice({ ...DEFAULT_LAB_PREFS, narrationVoice: 'b' }, voices)).toBe('b')
    expect(resolveNarrationVoice({ ...DEFAULT_LAB_PREFS, narrationVoice: 'z' }, voices)).toBe('a')
    expect(resolveNarrationVoice(DEFAULT_LAB_PREFS, voices)).toBe('a')
    expect(resolveNarrationVoice(DEFAULT_LAB_PREFS, [])).toBeNull()
  })
})

describe('narration API client', () => {
  it('sends the displayed text hash with a bearer token and maps the answer', async () => {
    const paragraph = 'Tell me, O _Muse_, of that\ningenious hero.'
    const textHash = await sha256Hex(narrationTextForParagraph(paragraph))
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body))
      expect(body).toEqual({ bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'a', paragraphs: [{ index: 0, textHash }] })
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-1')
      return Response.json({ paragraphs: [{ paragraph: 0, status: 'ready', url: '/api/audio-file?path=x', duration: 3, words: null, timingsUsable: false, hash: 'h', textHash, source: 'cache' }] })
    }) as unknown as typeof fetch
    const results = await ensureNarration(
      { bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'a', paragraphs: [{ index: 0, text: paragraph }] },
      { authToken: 'token-1', fetchImpl },
    )
    expect(results[0]).toMatchObject({ status: 'ready', paragraph: 0 })
    expect(fetchImpl).toHaveBeenCalledWith('/api/narration/ensure', expect.objectContaining({ method: 'POST' }))
  })

  it('turns HTTP failures into typed errors and passes aborts through', async () => {
    const request = { bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'a', paragraphs: [{ index: 0, text: 'x' }] }
    for (const [status, code] of [[401, 'unauthenticated'], [503, 'not_configured'], [429, 'rate_limited'], [500, 'http']] as const) {
      const fetchImpl = (async () => new Response('', { status })) as unknown as typeof fetch
      await expect(ensureNarration(request, { fetchImpl })).rejects.toMatchObject({ code })
    }
    const abort = (async () => { throw new DOMException('aborted', 'AbortError') }) as unknown as typeof fetch
    const cancelled = new AbortController()
    cancelled.abort()
    await expect(ensureNarration(request, { fetchImpl: abort, signal: cancelled.signal })).rejects.toHaveProperty('name', 'AbortError')
    // The same failure without a reader cancellation is a timeout, reported as a network error.
    await expect(ensureNarration(request, { fetchImpl: abort })).rejects.toMatchObject({ code: 'network', message: 'timeout' })
    const offline = (async () => { throw new TypeError('Failed to fetch') }) as unknown as typeof fetch
    await expect(ensureNarration(request, { fetchImpl: offline })).rejects.toBeInstanceOf(NarrationEnsureError)
  })

  it('reads the pilot info defensively', async () => {
    const ok = (async () => Response.json({ enabled: true, provider: 'fish', model: 's2.1-pro', voices: [{ key: 'a', label: 'Nathan' }, { bad: true }] })) as unknown as typeof fetch
    expect(await fetchNarrationPilotInfo(ok)).toEqual({ enabled: true, reason: undefined, provider: 'fish', model: 's2.1-pro', voices: [{ key: 'a', label: 'Nathan' }] })
    const down = (async () => new Response('', { status: 500 })) as unknown as typeof fetch
    expect(await fetchNarrationPilotInfo(down)).toMatchObject({ enabled: false, reason: 'http_500', voices: [] })
    const offline = (async () => { throw new TypeError('x') }) as unknown as typeof fetch
    expect(await fetchNarrationPilotInfo(offline)).toMatchObject({ enabled: false, reason: 'network' })
  })

  it('has reader-facing copy for every failure reason', () => {
    for (const reason of ['budget_exhausted', 'provider_unavailable', 'provider_auth', 'not_configured', 'unauthenticated', 'text_mismatch', 'validation_failed', 'rate_limited', 'playback', undefined]) {
      expect(narrationFailureMessage(reason).length).toBeGreaterThan(10)
    }
  })
})
