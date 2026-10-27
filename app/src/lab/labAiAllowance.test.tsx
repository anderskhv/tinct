// @vitest-environment jsdom

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The shipped switch is off (src/aiAllowanceSwitch.ts); these tests flip a
// copy of it to exercise both states. aiAllowance.test.ts pins the real value.
const switchState = vi.hoisted(() => ({ on: false }))
vi.mock('../aiAllowanceSwitch', () => ({ get AI_ALLOWANCE_ENFORCED() { return switchState.on } }))

import { AI_USAGE_COPY, aiUsageNote, allowanceAuthHeaders, fetchAiAllowance, offersTopUps, parseAiAllowance, parseTopUps, startTopUpCheckout, watchAiAllowance } from './labAiAllowance'

beforeEach(() => { switchState.on = true })

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const bar = (fields: Record<string, unknown>) => ({ enabled: true, resetsAt: null, hasTopUp: false, topUps: ['chat_pack_200', 'top_up_10'], ...fields })

describe('parseAiAllowance', () => {
  it('is null while the allowance is switched off', () => {
    expect(parseAiAllowance({ enabled: false })).toBeNull()
    expect(parseAiAllowance(null)).toBeNull()
    expect(parseAiAllowance({ enabled: true, usedFraction: 'x', state: 'ok' })).toBeNull()
    expect(parseAiAllowance({ enabled: true, usedFraction: 0.5, state: 'weird' })).toBeNull()
  })

  it('reads the fields and clamps the fraction', () => {
    expect(parseAiAllowance({ enabled: true, usedFraction: 1.4, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false, topUps: ['top_up_10', 'chat_pack_200'] }))
      .toEqual({ usedFraction: 1, monthUsedFraction: null, topUpLeftFraction: null, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false, hasAllowance: true, topUps: ['chat_pack_200', 'top_up_10'] })
  })

  it('reads hasAllowance; a response without it has an allowance when it has a reset date', () => {
    const base = { enabled: true, usedFraction: 1, monthUsedFraction: 1, state: 'used_up' }
    expect(parseAiAllowance({ ...base, hasAllowance: false, resetsAt: '2026-10-20T00:00:00.000Z' })?.hasAllowance).toBe(false)
    expect(parseAiAllowance({ ...base, hasAllowance: true, resetsAt: null })?.hasAllowance).toBe(true)
    expect(parseAiAllowance({ ...base, resetsAt: null })?.hasAllowance).toBe(false)
    expect(parseAiAllowance({ ...base, resetsAt: '2026-10-20T00:00:00.000Z' })?.hasAllowance).toBe(true)
  })

  it('keeps only the known top-ups, $5 first', () => {
    expect(parseTopUps(['top_up_10', 'chat_pack_100', 'price_x', 'chat_pack_200'])).toEqual(['chat_pack_200', 'top_up_10'])
    expect(parseTopUps(undefined)).toEqual([])
    expect(parseTopUps('chat_pack_200')).toEqual([])
  })
})

describe('aiUsageNote', () => {
  const view = (fields: Partial<Parameters<typeof aiUsageNote>[0]>) => ({ usedFraction: 1, monthUsedFraction: null, topUpLeftFraction: null, state: 'used_up' as const, resetsAt: null, hasTopUp: false, hasAllowance: false, topUps: [], ...fields })

  it('names the renewal date and says reading carries on at zero', () => {
    expect(aiUsageNote(view({ resetsAt: '2026-10-20T12:00:00.000Z' }))).toBe(AI_USAGE_COPY.usedUpUntil('Oct 20'))
    expect(aiUsageNote(view({}))).toBe(AI_USAGE_COPY.usedUp)
    expect(aiUsageNote(view({ usedFraction: 0.85, state: 'low', resetsAt: '2026-10-20T12:00:00.000Z', hasTopUp: true })))
      .toBe(`${AI_USAGE_COPY.low} ${AI_USAGE_COPY.includesTopUp} ${AI_USAGE_COPY.resets('Oct 20')}.`)
  })

  it('offers top-ups when running low or at zero, never while plenty is left', () => {
    const topUps = ['chat_pack_200' as const]
    expect(offersTopUps(view({ state: 'used_up', topUps }))).toBe(true)
    expect(offersTopUps(view({ state: 'low', topUps }))).toBe(true)
    expect(offersTopUps(view({ state: 'ok', topUps }))).toBe(false)
    expect(offersTopUps(view({ state: 'used_up', topUps: [] }))).toBe(false)
  })

  it('never shows a currency', () => {
    for (const state of ['ok', 'low', 'used_up'] as const) {
      expect(aiUsageNote(view({ usedFraction: 0.5, state, resetsAt: '2026-10-20T12:00:00.000Z', hasTopUp: true }))).not.toMatch(/[$€£]|usd|dollar/i)
    }
  })
})

describe('requests', () => {
  it('sends the session token and parses the response', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ enabled: true, usedFraction: 0.1, state: 'ok', resetsAt: null, hasTopUp: false, hasAllowance: false, topUps: ['chat_pack_200'] }))
    expect(await fetchAiAllowance('tok', fetchImpl)).toEqual({ usedFraction: 0.1, monthUsedFraction: null, topUpLeftFraction: null, state: 'ok', resetsAt: null, hasTopUp: false, hasAllowance: false, topUps: ['chat_pack_200'] })
    expect(fetchImpl).toHaveBeenCalledWith('/api/ai-allowance', expect.objectContaining({ headers: { Authorization: 'Bearer tok' } }))
  })

  it('asks nothing while the switch is off', async () => {
    switchState.on = false
    const fetchImpl = vi.fn(async () => Response.json(bar({ usedFraction: 1, state: 'used_up' })))
    expect(await fetchAiAllowance('tok', fetchImpl)).toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('opens the top-up checkout for the pack chosen', async () => {
    for (const pack of ['chat_pack_200', 'top_up_10'] as const) {
      const fetchImpl = vi.fn(async (_input: string, _init?: RequestInit) => Response.json({ url: 'https://checkout.stripe.com/c/pay' }))
      expect(await startTopUpCheckout('tok', pack, fetchImpl)).toBe('https://checkout.stripe.com/c/pay')
      expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))).toEqual({ type: pack })
    }
  })

  it('names the reader on chapter notes and Catch me up only while the switch is on', () => {
    expect(allowanceAuthHeaders('tok')).toEqual({ Authorization: 'Bearer tok' })
    expect(allowanceAuthHeaders(null)).toEqual({})
    switchState.on = false
    expect(allowanceAuthHeaders('tok')).toEqual({})
  })
})

describe('an open balance after a purchase on another device', () => {
  it('refreshes in foreground, coalesces focus events and stops when closed', async () => {
    vi.useFakeTimers()
    switchState.on = true
    const fetcher = vi.fn(async () => Response.json(bar({ usedFraction: 1, state: 'used_up' })))
    vi.stubGlobal('fetch', fetcher)
    const changed = vi.fn()
    const stop = watchAiAllowance(() => 'token', changed)
    await vi.advanceTimersByTimeAsync(0)
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'used_up' }))
    fetcher.mockImplementation(async () => Response.json(bar({ usedFraction: 0.5, state: 'ok' })))
    await vi.advanceTimersByTimeAsync(6000)
    window.dispatchEvent(new Event('focus'))
    window.dispatchEvent(new Event('focus'))
    await vi.advanceTimersByTimeAsync(0)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'ok' }))
    await vi.advanceTimersByTimeAsync(30_000)
    expect(fetcher).toHaveBeenCalledTimes(3)
    stop()
    await vi.advanceTimersByTimeAsync(60_000)
    window.dispatchEvent(new Event('focus'))
    expect(fetcher).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })
})
