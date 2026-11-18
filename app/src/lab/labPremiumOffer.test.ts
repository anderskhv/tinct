import { describe, expect, it, vi } from 'vitest'
import { premiumOfferIntervals, startPremiumCheckout } from './labPremiumOffer'

const now = Date.UTC(2026, 9, 6)

describe('premiumOfferIntervals', () => {
  it('offers the intervals the Worker has a price for, monthly first', () => {
    expect(premiumOfferIntervals({ subscription_status: null, intervals: ['year', 'month'] }, now)).toEqual(['month', 'year'])
    expect(premiumOfferIntervals({ subscription_status: null, intervals: ['month'] }, now)).toEqual(['month'])
  })

  it('hides the yearly plan when the Worker does not list it, and everything when it lists nothing', () => {
    expect(premiumOfferIntervals({ subscription_status: null, intervals: ['month'] }, now)).not.toContain('year')
    expect(premiumOfferIntervals({ subscription_status: null, intervals: [] }, now)).toEqual([])
    expect(premiumOfferIntervals({ subscription_status: null }, now)).toEqual([])
    expect(premiumOfferIntervals({ subscription_status: null, intervals: ['price_123', 'week'] }, now)).toEqual([])
    expect(premiumOfferIntervals(null, now)).toEqual([])
  })

  it('offers nothing to a reader who already pays or still has paid time', () => {
    const intervals = ['month', 'year']
    expect(premiumOfferIntervals({ subscription_status: 'active', intervals }, now)).toEqual([])
    expect(premiumOfferIntervals({ subscription_status: 'trialing', intervals }, now)).toEqual([])
    expect(premiumOfferIntervals({ subscription_status: 'past_due', intervals }, now)).toEqual([])
    expect(premiumOfferIntervals({ subscription_status: 'canceled', subscription_period_end: '2026-11-01T00:00:00Z', intervals }, now)).toEqual([])
    expect(premiumOfferIntervals({ subscription_status: 'canceled', subscription_period_end: '2026-09-01T00:00:00Z', intervals }, now)).toEqual(['month', 'year'])
  })
})

describe('startPremiumCheckout', () => {
  it('sends only the type and the interval (never a price) and returns the Checkout URL', async () => {
    const fetchImpl = vi.fn(async (_input: string, _init?: RequestInit) => Response.json({ url: 'https://checkout.stripe.com/c/pay/x' }))
    await expect(startPremiumCheckout('token-1', 'year', fetchImpl)).resolves.toBe('https://checkout.stripe.com/c/pay/x')
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('/api/create-checkout')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer token-1')
    const body = JSON.parse(String(init?.body))
    expect(body).toMatchObject({ type: 'subscription', interval: 'year' })
    expect(Object.keys(body).sort()).toEqual(['attribution', 'interval', 'type'])
  })

  it('fails on a refusal or a missing URL', async () => {
    await expect(startPremiumCheckout('t', 'year', async () => Response.json({ error: 'The yearly plan is not available' }, { status: 400 }))).rejects.toThrow()
    await expect(startPremiumCheckout('t', 'month', async () => Response.json({}))).rejects.toThrow()
  })
})
