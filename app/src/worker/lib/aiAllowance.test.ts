import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AI_ALLOWANCE_ENFORCED as SHARED_SWITCH } from '../../aiAllowanceSwitch'
import {
  AI_ALLOWANCE_ENFORCED,
  ALLOWANCE_USED_ERROR,
  NEVER_CHARGED_AI_FEATURES,
  PREMIUM_AI_ALLOWANCE_USD,
  TOP_UPS,
  TOP_UP_CREDIT_USD,
  TOP_UP_TYPES,
  addMonthsUtc,
  monthWindowAround,
  allowanceUsedBody,
  allowanceView,
  allowsAiFeature,
  billingPeriod,
  createAllowanceGate,
  hasPremiumAccess,
  loadPremiumAccess,
  isPaidAiFeature,
  loadPremiumTier,
  premiumTier,
  isSubscribed,
  loadAllowanceView,
  requestAllowsAiFeature,
  topUpCreditMicros,
  type AllowanceGate,
  type AllowanceView,
} from './aiAllowance'
import type { AiFeature } from './aiUsage'

const require = createRequire(import.meta.url)
const now = new Date('2026-10-05T12:00:00Z')
const iso = (value: string) => new Date(value).toISOString()
const usedUp: AllowanceView = { usedFraction: 1, monthUsedFraction: 1, topUpLeftFraction: null, state: 'used_up', resetsAt: null, hasTopUp: false }
const ok: AllowanceView = { usedFraction: 0.2, monthUsedFraction: 0.2, topUpLeftFraction: null, state: 'ok', resetsAt: null, hasTopUp: false }

afterEach(() => vi.unstubAllGlobals())

describe('configuration', () => {
  // The guard against an accidental flip. Turning the allowance on means
  // changing src/aiAllowanceSwitch.ts and this expectation together.
  // Switched on 2026-10-10 (Anders: "I want credits on now").
  it('ships with the allowance switched on', () => {
    expect(AI_ALLOWANCE_ENFORCED).toBe(true)
    expect(createAllowanceGate({}).enforced).toBe(AI_ALLOWANCE_ENFORCED)
  })

  it('has one switch, shared with the reader bundle and the build scripts', () => {
    expect(AI_ALLOWANCE_ENFORCED).toBe(SHARED_SWITCH)
    const script = require('../../../scripts/ai-allowance-switch.cjs') as { aiAllowanceEnforced(): boolean; parseAiAllowanceSwitch(source: string): boolean }
    expect(script.aiAllowanceEnforced()).toBe(AI_ALLOWANCE_ENFORCED)
    expect(script.parseAiAllowanceSwitch('export const AI_ALLOWANCE_ENFORCED = true\n')).toBe(true)
    expect(script.parseAiAllowanceSwitch('export const AI_ALLOWANCE_ENFORCED = false\n')).toBe(false)
    expect(() => script.parseAiAllowanceSwitch('export const AI_ALLOWANCE_ENFORCED = process.env.X === "1"\n')).toThrow()
  })

  it('uses the approved amounts: $3.00 a month, $5 pack $3.50, $10 pack $7.50', () => {
    expect(PREMIUM_AI_ALLOWANCE_USD).toBe(3)
    expect(TOP_UP_CREDIT_USD).toEqual({ chat_pack_200: 3.50, top_up_10: 7.50 })
    expect(TOP_UPS).toEqual({ chat_pack_200: { priceCents: 500, creditUsd: 3.50 }, top_up_10: { priceCents: 1000, creditUsd: 7.50 } })
    expect(TOP_UP_TYPES).toEqual(['chat_pack_200', 'top_up_10'])
  })

  it('credits top-ups by checkout type only', () => {
    expect(topUpCreditMicros('chat_pack_200')).toBe(3_500_000)
    expect(topUpCreditMicros('top_up_10')).toBe(7_500_000)
    // The retired $3 pack is not a top-up.
    expect(topUpCreditMicros('chat_pack_100')).toBeNull()
    expect(topUpCreditMicros('subscription')).toBeNull()
    expect(topUpCreditMicros('toString')).toBeNull()
    expect(topUpCreditMicros(undefined)).toBeNull()
  })

  it('leaves out of the SQL spend exactly the features that are never charged', () => {
    const excludedIn = (file: string) => {
      const sql = readFileSync(new URL(`../../../supabase/migrations/${file}`, import.meta.url), 'utf8')
      // Same function signature as the migration already run, so it replaces it in place.
      expect(sql).toContain('create or replace function public.ai_spend_micros(p_user uuid, p_since timestamptz, p_until timestamptz default null)')
      return /e\.feature not in \(([^)]*)\)/.exec(sql)?.[1].split(',').map(name => name.trim().replace(/'/g, '')) ?? []
    }
    // The latest definition of ai_spend_micros (Modern English, 2026-10-10) is the one in force.
    expect([...excludedIn('20261010_ai_usage_modern_edition.sql')].sort()).toEqual([...NEVER_CHARGED_AI_FEATURES].sort())
    expect([...excludedIn('20261009_ai_usage_ocr.sql')].sort()).toEqual(['dictation', 'narration_generate', 'narration_listen', 'ocr'])
    expect(NEVER_CHARGED_AI_FEATURES).toEqual(expect.arrayContaining(['narration_listen', 'narration_generate', 'dictation']))
    // The earlier one excluded every never-charged feature that existed then.
    expect([...excludedIn('20261007_ai_allowance_never_charged.sql')].sort()).toEqual(['dictation', 'narration_generate', 'narration_listen'])
  })

  it('allows the modern_edition feature in the ledger constraint, keeping every earlier one', () => {
    const sql = readFileSync(new URL('../../../supabase/migrations/20261010_ai_usage_modern_edition.sql', import.meta.url), 'utf8')
    const allowed = /feature in \(([^)]*)\)/.exec(sql)?.[1].split(',').map(name => name.trim().replace(/'/g, '')) ?? []
    expect(allowed).toEqual(['chat', 'explain', 'librarian', 'recap', 'chapter_notes', 'catch_up', 'lab_chat', 'talk', 'narration_generate', 'narration_listen', 'source_search', 'dictation', 'ocr', 'modern_edition'])
  })

  it('allows the ocr feature in the ledger constraint', () => {
    const sql = readFileSync(new URL('../../../supabase/migrations/20261009_ai_usage_ocr.sql', import.meta.url), 'utf8')
    const allowed = /feature in \(([^)]*)\)/.exec(sql)?.[1].split(',').map(name => name.trim().replace(/'/g, '')) ?? []
    expect(allowed).toEqual(expect.arrayContaining(['dictation', 'narration_generate', 'ocr', 'chat']))
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

  it('resets a yearly plan every month, anchored to the subscription start', () => {
    // Subscribed 2026-03-14 09:30 on the yearly plan: Stripe's period end is 2027-03-14 09:30.
    const yearly = { subscription_status: 'active', subscription_period_end: '2027-03-14T09:30:00Z', created_at: '2026-01-01T00:00:00Z' }
    const at = (when: string) => billingPeriod(yearly, new Date(when))
    expect(at('2026-03-20T00:00:00Z')).toMatchObject({ kind: 'subscription', start: new Date('2026-03-14T09:30:00Z'), end: new Date('2026-04-14T09:30:00Z'), allowanceMicros: 3_000_000 })
    expect(at('2026-10-05T12:00:00Z')).toMatchObject({ start: new Date('2026-09-14T09:30:00Z'), end: new Date('2026-10-14T09:30:00Z'), allowanceMicros: 3_000_000 })
    // The boundary itself opens the next month.
    expect(at('2026-10-14T09:30:00Z')).toMatchObject({ start: new Date('2026-10-14T09:30:00Z'), end: new Date('2026-11-14T09:30:00Z') })
    expect(at('2027-03-01T00:00:00Z')).toMatchObject({ start: new Date('2027-02-14T09:30:00Z'), end: new Date('2027-03-14T09:30:00Z') })
    // Twelve monthly allowances in the paid year, each one month long.
    const starts = new Set<string>()
    for (let day = new Date('2026-03-14T09:30:00Z'); day < new Date('2027-03-14T09:30:00Z'); day = new Date(day.getTime() + 86_400_000)) {
      const period = billingPeriod(yearly, day)
      expect(addMonthsUtc(period.start, 1).getTime()).toBe(period.end.getTime())
      expect(period.start.getTime()).toBeLessThanOrEqual(day.getTime())
      expect(period.end.getTime()).toBeGreaterThan(day.getTime())
      starts.add(period.start.toISOString())
    }
    expect(starts.size).toBe(12)
  })

  it('keeps a yearly plan started on the 31st on month ends without drifting', () => {
    const yearly = { subscription_status: 'active', subscription_period_end: '2027-01-31T00:00:00Z', created_at: null }
    expect(billingPeriod(yearly, new Date('2026-03-05T00:00:00Z'))).toMatchObject({ start: new Date('2026-02-28T00:00:00Z'), end: new Date('2026-03-31T00:00:00Z') })
    expect(billingPeriod(yearly, new Date('2026-05-05T00:00:00Z'))).toMatchObject({ start: new Date('2026-04-30T00:00:00Z'), end: new Date('2026-05-31T00:00:00Z') })
    expect(billingPeriod(yearly, new Date('2026-08-31T00:00:00Z'))).toMatchObject({ start: new Date('2026-08-31T00:00:00Z'), end: new Date('2026-09-30T00:00:00Z') })
  })

  it('keeps a canceled yearly plan monthly until its paid year ends, then standard', () => {
    const canceled = { subscription_status: 'canceled', subscription_period_end: '2027-03-14T09:30:00Z', created_at: '2026-01-01T00:00:00Z' }
    expect(billingPeriod(canceled, now)).toMatchObject({ kind: 'subscription', start: new Date('2026-09-14T09:30:00Z'), allowanceMicros: 3_000_000 })
    expect(billingPeriod(canceled, new Date('2027-03-20T00:00:00Z'))).toMatchObject({ kind: 'standard', allowanceMicros: 0 })
  })

  it('gives a monthly plan exactly its Stripe billing period', () => {
    const monthly = { subscription_status: 'active', subscription_period_end: '2026-10-20T08:00:00Z', created_at: '2025-01-01T00:00:00Z' }
    expect(billingPeriod(monthly, new Date('2026-09-20T08:00:00Z'))).toMatchObject({ start: new Date('2026-09-20T08:00:00Z'), end: new Date('2026-10-20T08:00:00Z') })
    expect(billingPeriod(monthly, new Date('2026-10-20T07:59:59Z'))).toMatchObject({ start: new Date('2026-09-20T08:00:00Z'), end: new Date('2026-10-20T08:00:00Z') })
  })

  it('finds the month around an anchor in either direction', () => {
    const anchor = new Date('2026-06-10T00:00:00Z')
    expect(monthWindowAround(anchor, new Date('2026-06-10T00:00:00Z'))).toEqual({ start: anchor, end: new Date('2026-07-10T00:00:00Z') })
    expect(monthWindowAround(anchor, new Date('2026-06-09T23:59:59Z'))).toEqual({ start: new Date('2026-05-10T00:00:00Z'), end: anchor })
    expect(monthWindowAround(anchor, new Date('2025-12-31T00:00:00Z'))).toEqual({ start: new Date('2025-12-10T00:00:00Z'), end: new Date('2026-01-10T00:00:00Z') })
    expect(monthWindowAround(anchor, new Date('2027-02-28T00:00:00Z'))).toEqual({ start: new Date('2027-02-10T00:00:00Z'), end: new Date('2027-03-10T00:00:00Z') })
  })

  it('moves a trial reader who subscribes onto the subscription month', () => {
    // Created 2026-09-20 (trial to 10-20), subscribed monthly on 10-01: period end 11-01.
    const period = billingPeriod({ subscription_status: 'active', subscription_period_end: '2026-11-01T10:00:00Z', created_at: '2026-09-20T09:00:00Z' }, now)
    expect(period).toMatchObject({ kind: 'subscription', start: new Date('2026-10-01T10:00:00Z'), end: new Date('2026-11-01T10:00:00Z'), allowanceMicros: 3_000_000 })
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
    expect(view(0)).toEqual({ usedFraction: 0, monthUsedFraction: 0, topUpLeftFraction: null, state: 'ok', resetsAt: resets.toISOString(), hasTopUp: false })
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
      .toEqual({ usedFraction: 1, monthUsedFraction: 1, topUpLeftFraction: null, state: 'used_up', resetsAt: null, hasTopUp: false })
  })

  it('splits the bar: this month\'s allowance and the top-up, as fractions only', () => {
    // 1.50 of a 3.00 allowance spent; no top-up this period.
    expect(view(1_500_000)).toMatchObject({ monthUsedFraction: 0.5, topUpLeftFraction: null })
    // Allowance spent (overflow drawn from the top-up): the month is full, 1.10 of 2.10 credit left.
    const topped = view(4_000_000, 1_100_000, 1_000_000)
    expect(topped.monthUsedFraction).toBe(1)
    expect(topped.topUpLeftFraction).toBe(0.524)
    // A top-up bought, nothing drawn yet: all of it left.
    expect(view(600_000, 2_000_000, 0)).toMatchObject({ monthUsedFraction: 0.2, topUpLeftFraction: 1 })
    // A top-up fully drawn this period: still shown, empty.
    expect(view(3_500_000, 0, 500_000)).toMatchObject({ monthUsedFraction: 1, topUpLeftFraction: 0 })
  })

  it('counts a standard account\'s month as used and its top-up on its own bar', () => {
    expect(allowanceView({ allowanceMicros: 0, spendMicros: 500_000, creditMicros: 1_500_000, drawnMicros: 500_000 }, null))
      .toMatchObject({ monthUsedFraction: 1, topUpLeftFraction: 0.75 })
  })

  it('lets a standard account use its top-up', () => {
    expect(allowanceView({ allowanceMicros: 0, spendMicros: 500_000, creditMicros: 1_600_000, drawnMicros: 500_000 }, null))
      .toMatchObject({ state: 'ok', hasTopUp: true })
  })
})

describe('gate', () => {
  const paid: AiFeature[] = ['chat', 'librarian', 'talk', 'recap', 'chapter_notes', 'catch_up', 'source_search']
  const free: AiFeature[] = ['explain', 'narration_generate', 'narration_listen', 'ocr']

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

  it('never blocks dictation, which is never charged either', () => {
    expect(isPaidAiFeature('dictation')).toBe(false)
    expect(allowsAiFeature(true, 'dictation', usedUp)).toBe(true)
    expect(NEVER_CHARGED_AI_FEATURES).toContain('dictation')
  })

  it('charges neither narration, dictation nor OCR, but does count Explain', () => {
    expect([...NEVER_CHARGED_AI_FEATURES].sort()).toEqual(['dictation', 'modern_edition', 'narration_generate', 'narration_listen', 'ocr'])
    expect(isPaidAiFeature('ocr')).toBe(false)
    expect(NEVER_CHARGED_AI_FEATURES).not.toContain('explain')
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
    const gate = createAllowanceGate({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k' }, false)
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

describe('hasPremiumAccess (adding books)', () => {
  const now = new Date('2026-10-07T12:00:00Z')
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
  afterEach(() => vi.unstubAllGlobals())

  it('allows subscribed accounts and the 30-day trial; refuses free accounts past it', () => {
    expect(hasPremiumAccess({ subscription_status: 'active', subscription_period_end: null, created_at: '2025-01-01T00:00:00Z' }, now)).toBe(true)
    expect(hasPremiumAccess({ subscription_status: 'canceled', subscription_period_end: '2026-10-20T00:00:00Z', created_at: '2025-01-01T00:00:00Z' }, now)).toBe(true)
    expect(hasPremiumAccess({ subscription_status: null, subscription_period_end: null, created_at: '2026-09-20T00:00:00Z' }, now)).toBe(true) // in trial
    expect(hasPremiumAccess({ subscription_status: null, subscription_period_end: null, created_at: '2026-08-01T00:00:00Z' }, now)).toBe(false) // trial over
    expect(hasPremiumAccess({ subscription_status: 'canceled', subscription_period_end: '2026-10-01T00:00:00Z', created_at: '2025-01-01T00:00:00Z' }, now)).toBe(false)
    expect(hasPremiumAccess({ subscription_status: 'past_due', subscription_period_end: null, created_at: null }, now)).toBe(false)
  })

  it('reads the profile, and is null when it cannot', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ subscription_status: null, subscription_period_end: null, created_at: '2026-08-01T00:00:00Z' }])))
    expect(await loadPremiumAccess(env, 'u', now)).toBe(false)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 500 })))
    expect(await loadPremiumAccess(env, 'u', now)).toBeNull()
    expect(await loadPremiumAccess({}, 'u', now)).toBeNull()
  })
})

describe('loadAllowanceView', () => {
  const env ={ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
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
    expect(view).toEqual({ usedFraction: 0.9, monthUsedFraction: 0.9, topUpLeftFraction: null, state: 'low', resetsAt: iso('2026-10-20T00:00:00Z'), hasTopUp: false })
  })

  it('returns null when the settlement fails (fail open)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => String(input).includes('/rest/v1/profiles')
      ? Response.json([{ subscription_status: 'active', subscription_period_end: null, created_at: null }])
      : new Response('missing function', { status: 404 })))
    expect(await loadAllowanceView(env, userId, now)).toBeNull()
  })
})

describe('premium tier (trial told from paid Premium)', () => {
  const now = new Date('2026-10-09T12:00:00Z')
  it('is premium when subscribed, trial in the first 30 days only, none after', () => {
    expect(premiumTier({ subscription_status: 'active', subscription_period_end: null, created_at: '2026-10-01T00:00:00Z' }, now)).toBe('premium')
    expect(premiumTier({ subscription_status: 'canceled', subscription_period_end: '2026-11-01T00:00:00Z', created_at: '2025-01-01T00:00:00Z' }, now)).toBe('premium')
    expect(premiumTier({ subscription_status: null, subscription_period_end: null, created_at: '2026-10-01T00:00:00Z' }, now)).toBe('trial')
    expect(premiumTier({ subscription_status: null, subscription_period_end: null, created_at: '2026-08-01T00:00:00Z' }, now)).toBe('none')
    expect(premiumTier({ subscription_status: 'past_due', subscription_period_end: null, created_at: '2026-08-01T00:00:00Z' }, now)).toBe('none')
  })

  it('is null when the profile cannot be read', async () => {
    expect(await loadPremiumTier({}, 'u', now)).toBeNull()
  })
})
