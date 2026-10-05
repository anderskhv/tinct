import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AI_ALLOWANCE_ENFORCED,
  ALLOWANCE_USED_ERROR,
  PREMIUM_AI_ALLOWANCE_USD,
  TOP_UP_CREDIT_USD,
  addMonthsUtc,
  allowanceUsedBody,
  allowanceView,
  allowsAiFeature,
  billingPeriod,
  createAllowanceGate,
  isPaidAiFeature,
  isSubscribed,
  loadAllowanceView,
  requestAllowsAiFeature,
  topUpCreditMicros,
  type AllowanceGate,
  type AllowanceView,
} from './aiAllowance'
import type { AiFeature } from './aiUsage'

const now = new Date('2026-10-05T12:00:00Z')
const iso = (value: string) => new Date(value).toISOString()
const usedUp: AllowanceView = { usedFraction: 1, state: 'used_up', resetsAt: null, hasTopUp: false }
const ok: AllowanceView = { usedFraction: 0.2, state: 'ok', resetsAt: null, hasTopUp: false }

afterEach(() => vi.unstubAllGlobals())

describe('configuration', () => {
  it('ships with the allowance switched off', () => {
    expect(AI_ALLOWANCE_ENFORCED).toBe(false)
  })

  it('uses the configured placeholders', () => {
    expect(PREMIUM_AI_ALLOWANCE_USD).toBe(3)
    expect(TOP_UP_CREDIT_USD).toEqual({ chat_pack_100: 2.10, chat_pack_200: 3.50 })
  })

  it('credits top-ups by checkout type only', () => {
    expect(topUpCreditMicros('chat_pack_100')).toBe(2_100_000)
    expect(topUpCreditMicros('chat_pack_200')).toBe(3_500_000)
    expect(topUpCreditMicros('subscription')).toBeNull()
    expect(topUpCreditMicros('toString')).toBeNull()
    expect(topUpCreditMicros(undefined)).toBeNull()
  })
})

describe('period math', () => {
  it('adds calendar months in UTC and clamps short months', () => {
    expect(addMonthsUtc(new Date('2026-01-31T10:00:00Z'), 1).toISOString()).toBe(iso('2026-02-28T10:00:00Z'))
    expect(addMonthsUtc(new Date('2028-01-31T10:00:00Z'), 1).toISOString()).toBe(iso('2028-02-29T10:00:00Z'))
    expect(addMonthsUtc(new Date('2026-03-15T00:00:00Z'), -1).toISOString()).toBe(iso('2026-02-15T00:00:00Z'))
    expect(addMonthsUtc(new Date('2026-12-10T00:00:00Z'), 1).toISOString()).toBe(iso('2027-01-10T00:00:00Z'))
  })

  it('treats canceled-but-paid-through as subscribed, and nothing else that is not active', () => {
    expect(isSubscribed({ subscription_status: 'active', subscription_period_end: null, created_at: null }, now)).toBe(true)
    expect(isSubscribed({ subscription_status: 'canceled', subscription_period_end: '2026-10-20T00:00:00Z', created_at: null }, now)).toBe(true)
    expect(isSubscribed({ subscription_status: 'canceled', subscription_period_end: '2026-10-01T00:00:00Z', created_at: null }, now)).toBe(false)
    expect(isSubscribed({ subscription_status: 'past_due', subscription_period_end: '2026-10-20T00:00:00Z', created_at: null }, now)).toBe(false)
  })

  it('runs a subscription period from period end minus one month to period end', () => {
    const period = billingPeriod({ subscription_status: 'active', subscription_period_end: '2026-10-20T08:00:00Z', created_at: '2025-01-01T00:00:00Z' }, now)
    expect(period.kind).toBe('subscription')
    expect(period.start.toISOString()).toBe(iso('2026-09-20T08:00:00Z'))
    expect(period.end.toISOString()).toBe(iso('2026-10-20T08:00:00Z'))
    expect(period.allowanceMicros).toBe(3_000_000)
  })

  it('keeps a canceled subscription paid through to its period end', () => {
    const period = billingPeriod({ subscription_status: 'canceled', subscription_period_end: '2026-10-31T00:00:00Z', created_at: '2025-01-01T00:00:00Z' }, now)
    expect(period.kind).toBe('subscription')
    expect(period.start.toISOString()).toBe(iso('2026-09-30T00:00:00Z'))
    expect(period.allowanceMicros).toBe(3_000_000)
  })

  it('rolls an active subscription with a stale period end forward', () => {
    const period = billingPeriod({ subscription_status: 'active', subscription_period_end: '2026-08-20T00:00:00Z', created_at: null }, now)
    expect(period.start.toISOString()).toBe(iso('2026-09-20T00:00:00Z'))
    expect(period.end.toISOString()).toBe(iso('2026-10-20T00:00:00Z'))
  })

  it('gives a new account one trial period from creation with the same allowance', () => {
    const period = billingPeriod({ subscription_status: null, subscription_period_end: null, created_at: '2026-09-20T09:00:00Z' }, now)
    expect(period.kind).toBe('trial')
    expect(period.start.toISOString()).toBe(iso('2026-09-20T09:00:00Z'))
    expect(period.end.toISOString()).toBe(iso('2026-10-20T09:00:00Z'))
    expect(period.allowanceMicros).toBe(3_000_000)
  })

  it('gives a standard account monthly windows from the trial end and no allowance', () => {
    // Created 2026-01-01; the trial ended 2026-01-31; windows start on the 31st (clamped).
    const period = billingPeriod({ subscription_status: 'canceled', subscription_period_end: '2026-05-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' }, now)
    expect(period.kind).toBe('standard')
    expect(period.allowanceMicros).toBe(0)
    expect(period.start.getTime()).toBeLessThanOrEqual(now.getTime())
    expect(period.end.getTime()).toBeGreaterThan(now.getTime())
    expect(period.start.toISOString()).toBe(iso('2026-09-30T00:00:00Z'))
    expect(period.end.toISOString()).toBe(iso('2026-10-31T00:00:00Z'))
  })

  it('starts the first standard window exactly at the trial end', () => {
    const period = billingPeriod({ subscription_status: null, subscription_period_end: null, created_at: '2026-09-04T12:00:00Z' }, now)
    expect(period.kind).toBe('standard')
    expect(period.start.toISOString()).toBe(iso('2026-10-04T12:00:00Z'))
  })
})

describe('state', () => {
  const resets = new Date('2026-10-20T00:00:00Z')
  const view = (spend: number, credit = 0, drawn = 0, allowance = 3_000_000) =>
    allowanceView({ allowanceMicros: allowance, spendMicros: spend, creditMicros: credit, drawnMicros: drawn }, resets)

  it('is ok below 80% used', () => {
    expect(view(0)).toEqual({ usedFraction: 0, state: 'ok', resetsAt: resets.toISOString(), hasTopUp: false })
    expect(view(2_390_000).state).toBe('ok')
  })

  it('is low from 80% used', () => {
    expect(view(2_400_000)).toMatchObject({ usedFraction: 0.8, state: 'low' })
  })

  it('is used up at zero', () => {
    expect(view(3_000_000)).toMatchObject({ usedFraction: 1, state: 'used_up' })
    expect(view(3_400_000)).toMatchObject({ usedFraction: 1, state: 'used_up' })
  })

  it('counts top-up credit in the bar and keeps paid features open while any is left', () => {
    // Allowance spent, 1.00 of a 2.10 top-up drawn this period, 1.10 left.
    const result = view(4_000_000, 1_100_000, 1_000_000)
    expect(result.state).toBe('ok')
    expect(result.hasTopUp).toBe(true)
    expect(result.usedFraction).toBeCloseTo(4 / 5.1, 3)
  })

  it('has nothing to use on a standard account without credit', () => {
    expect(allowanceView({ allowanceMicros: 0, spendMicros: 0, creditMicros: 0, drawnMicros: 0 }, null))
      .toEqual({ usedFraction: 1, state: 'used_up', resetsAt: null, hasTopUp: false })
  })

  it('lets a standard account use its top-up', () => {
    expect(allowanceView({ allowanceMicros: 0, spendMicros: 500_000, creditMicros: 1_600_000, drawnMicros: 500_000 }, null))
      .toMatchObject({ state: 'ok', hasTopUp: true })
  })
})

describe('gate', () => {
  const paid: AiFeature[] = ['chat', 'librarian', 'talk', 'recap', 'chapter_notes', 'catch_up', 'source_search']
  const free: AiFeature[] = ['explain', 'narration_generate', 'narration_listen']

  it('allows everything while the switch is off', () => {
    for (const feature of [...paid, ...free]) expect(allowsAiFeature(false, feature, usedUp)).toBe(true)
  })

  it('blocks paid features at zero when on', () => {
    for (const feature of paid) {
      expect(isPaidAiFeature(feature)).toBe(true)
      expect(allowsAiFeature(true, feature, usedUp)).toBe(false)
      expect(allowsAiFeature(true, feature, ok)).toBe(true)
    }
  })

  it('never blocks Explain, Define or narration', () => {
    for (const feature of free) {
      expect(isPaidAiFeature(feature)).toBe(false)
      expect(allowsAiFeature(true, feature, usedUp)).toBe(true)
    }
  })

  it('fails open when the allowance cannot be read', () => {
    expect(allowsAiFeature(true, 'chat', null)).toBe(true)
  })

  it('refuses with the agreed body', () => {
    expect(allowanceUsedBody()).toEqual({ error: ALLOWANCE_USED_ERROR })
    expect(ALLOWANCE_USED_ERROR).toBe('allowance_used')
  })

  it('reads nothing while the switch is off', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const gate = createAllowanceGate({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k' })
    expect(gate.enforced).toBe(false)
    expect(await gate.load('11111111-1111-4111-8111-111111111111')).toBeNull()
    const resolveUser = vi.fn(async () => 'u')
    expect(await requestAllowsAiFeature(gate, resolveUser, new Request('https://tinct.app/api/lab-recap'), 'recap')).toBe(true)
    expect(resolveUser).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('checks a signed-in reader on shared routes and leaves signed-out readers to the guest ceiling', async () => {
    const gate: AllowanceGate = { enforced: true, load: vi.fn(async () => usedUp) }
    const request = new Request('https://tinct.app/api/lab-recap')
    expect(await requestAllowsAiFeature(gate, async () => 'reader', request, 'recap')).toBe(false)
    expect(await requestAllowsAiFeature(gate, async () => null, request, 'recap')).toBe(true)
    expect(await requestAllowsAiFeature(gate, async () => 'reader', request, 'explain')).toBe(true)
  })
})

describe('loadAllowanceView', () => {
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
  const userId = '11111111-1111-4111-8111-111111111111'

  it('settles the current period with the configured allowance', async () => {
    let settleBody: Record<string, unknown> | null = null
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) return Response.json([{ subscription_status: 'active', subscription_period_end: '2026-10-20T00:00:00Z', created_at: '2025-01-01T00:00:00Z' }])
      if (url.endsWith('/rpc/ai_allowance_settle')) {
        settleBody = JSON.parse(String(init?.body))
        return Response.json([{ spend_micros: 2_700_000, credit_micros: 0, drawn_micros: 0 }])
      }
      return Response.json({}, { status: 500 })
    }))
    const view = await loadAllowanceView(env, userId, now)
    expect(settleBody).toEqual({ p_user: userId, p_period_start: iso('2026-09-20T00:00:00Z'), p_allowance_micros: 3_000_000 })
    expect(view).toEqual({ usedFraction: 0.9, state: 'low', resetsAt: iso('2026-10-20T00:00:00Z'), hasTopUp: false })
  })

  it('returns null when the settlement fails (fail open)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).includes('/rest/v1/profiles')
      ? Response.json([{ subscription_status: 'active', subscription_period_end: null, created_at: null }])
      : new Response('missing function', { status: 404 })))
    expect(await loadAllowanceView(env, userId, now)).toBeNull()
  })
})
