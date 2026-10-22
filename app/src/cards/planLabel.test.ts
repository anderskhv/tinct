import { describe, expect, it } from 'vitest'
import { planIntervals, planOf } from './planLabel'

describe('the plan the cards show (22 Oct 2026)', () => {
  const now = Date.parse('2026-10-30T12:00:00Z')
  it('the free month while it lasts, then Free; a paid plan stays Premium', () => {
    expect(planOf({ subscription_status: null, free_month_until: '2026-11-14T00:00:00Z' }, now)).toBe('free_month')
    expect(planOf({ subscription_status: 'canceled', subscription_period_end: '2026-11-22T05:00:00Z', free_month_until: '2026-11-22T05:00:00Z' }, now)).toBe('free_month')
    expect(planOf({ subscription_status: 'canceled', subscription_period_end: '2026-11-22T05:00:00Z', free_month_until: '2026-11-22T05:00:00Z' }, Date.parse('2026-11-23T00:00:00Z'))).toBe('free')
    expect(planOf({ subscription_status: 'active', free_month_until: null }, now)).toBe('premium')
    expect(planOf({ subscription_status: null }, now)).toBe('free')
  })
  it('the free month offers the paid plans, as a free account does', () => {
    const intervals = ['month', 'year']
    expect(planIntervals({ subscription_status: 'canceled', subscription_period_end: '2026-11-22T05:00:00Z', free_month_until: '2026-11-22T05:00:00Z', intervals }, now)).toEqual(['month', 'year'])
    expect(planIntervals({ subscription_status: 'active', intervals }, now)).toEqual([])
  })
})
