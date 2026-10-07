// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The shipped switch is off (src/aiAllowanceSwitch.ts); these tests flip a
// copy of it to exercise both states. aiAllowance.test.ts pins the real value.
const switchState = vi.hoisted(() => ({ on: false }))
vi.mock('../aiAllowanceSwitch', () => ({ get AI_ALLOWANCE_ENFORCED() { return switchState.on } }))

import { LabAiUsageBar } from './LabAiUsageBar'
import { AI_USAGE_COPY, aiUsageNote, allowanceAuthHeaders, fetchAiAllowance, offersTopUps, parseAiAllowance, parseTopUps, startTopUpCheckout } from './labAiAllowance'

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
      .toEqual({ usedFraction: 1, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false, topUps: ['chat_pack_200', 'top_up_10'] })
  })

  it('keeps only the known top-ups, $5 first', () => {
    expect(parseTopUps(['top_up_10', 'chat_pack_100', 'price_x', 'chat_pack_200'])).toEqual(['chat_pack_200', 'top_up_10'])
    expect(parseTopUps(undefined)).toEqual([])
    expect(parseTopUps('chat_pack_200')).toEqual([])
  })
})

describe('aiUsageNote', () => {
  const view = (fields: Partial<Parameters<typeof aiUsageNote>[0]>) => ({ usedFraction: 1, state: 'used_up' as const, resetsAt: null, hasTopUp: false, topUps: [], ...fields })

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
    const fetchImpl = vi.fn(async () => Response.json({ enabled: true, usedFraction: 0.1, state: 'ok', resetsAt: null, hasTopUp: false, topUps: ['chat_pack_200'] }))
    expect(await fetchAiAllowance('tok', fetchImpl)).toEqual({ usedFraction: 0.1, state: 'ok', resetsAt: null, hasTopUp: false, topUps: ['chat_pack_200'] })
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

describe('LabAiUsageBar', () => {
  it('renders nothing and asks nothing while the switch is off', async () => {
    switchState.on = false
    const fetchMock = vi.fn(async () => Response.json(bar({ usedFraction: 1, state: 'used_up' })))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<LabAiUsageBar token="tok" />)
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(container.innerHTML).toBe('')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders nothing when the Worker says the allowance is off', async () => {
    const fetchMock = vi.fn(async () => Response.json({ enabled: false }))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<LabAiUsageBar token="tok" />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing and asks nothing when signed out', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<LabAiUsageBar token={null} />)
    expect(container.innerHTML).toBe('')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the bar, and offers the $5 and $10 top-ups only when used up', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => String(input).endsWith('/api/create-checkout')
      ? Response.json({ error: 'no' }, { status: 500 })
      : Response.json(bar({ usedFraction: 1, state: 'used_up', resetsAt: '2026-10-20T12:00:00.000Z' })))
    vi.stubGlobal('fetch', fetchMock)
    render(<LabAiUsageBar token="tok" />)
    const element = await screen.findByTestId('lab-v2-ai-usage')
    expect(element.getAttribute('data-state')).toBe('used_up')
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByTestId('lab-v2-top-up').textContent).toBe(AI_USAGE_COPY.topUp)
    expect(screen.getByTestId('lab-v2-top-up-more').textContent).toBe(AI_USAGE_COPY.topUpMore)
    fireEvent.click(screen.getByTestId('lab-v2-top-up-more'))
    await screen.findByText(AI_USAGE_COPY.topUpFailed)
    const checkout = fetchMock.mock.calls.find(call => String(call[0]).endsWith('/api/create-checkout'))
    expect(JSON.parse(String(checkout?.[1]?.body))).toEqual({ type: 'top_up_10' })
  })

  it('offers only the top-ups on sale', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(bar({ usedFraction: 1, state: 'used_up', topUps: ['chat_pack_200'] }))))
    render(<LabAiUsageBar token="tok" />)
    await screen.findByTestId('lab-v2-top-up')
    expect(screen.queryByTestId('lab-v2-top-up-more')).toBeNull()
  })

  it('shows the prices as pills, "$5" and "$10", named for what they do', async () => {
    expect(AI_USAGE_COPY.topUp).toBe('$5')
    expect(AI_USAGE_COPY.topUpMore).toBe('$10')
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(bar({ usedFraction: 1, state: 'used_up' }))))
    render(<LabAiUsageBar token="tok" />)
    expect(await screen.findByRole('button', { name: 'Buy a $5 top-up' })).toBe(screen.getByTestId('lab-v2-top-up'))
    expect(screen.getByRole('button', { name: 'Buy a $10 top-up' })).toBe(screen.getByTestId('lab-v2-top-up-more'))
    expect(screen.getByTestId('lab-v2-top-up').textContent).toBe('$5')
    expect(screen.getByTestId('lab-v2-top-up-more').textContent).toBe('$10')
  })

  it('offers the top-ups when running low too', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(bar({ usedFraction: 0.85, state: 'low' }))))
    render(<LabAiUsageBar token="tok" />)
    await screen.findByTestId('lab-v2-top-up')
    expect(screen.getByTestId('lab-v2-top-up-more')).toBeTruthy()
  })

  it('stands alone: its own classes only, nothing from the account sheet', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(bar({ usedFraction: 0.85, state: 'low', hasTopUp: true }))))
    const { container } = render(<LabAiUsageBar token="tok" />)
    await screen.findByTestId('lab-v2-top-up')
    const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap(node => Array.from(node.classList)))
    for (const name of classes) expect(name).toMatch(/^lab-ai-usage(-[a-z]+)?$/)
  })

  it('has no top-up button while allowance is left', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(bar({ usedFraction: 0.3, state: 'ok' }))))
    render(<LabAiUsageBar token="tok" />)
    await screen.findByTestId('lab-v2-ai-usage')
    expect(screen.queryByTestId('lab-v2-top-up')).toBeNull()
    expect(screen.queryByTestId('lab-v2-top-up-more')).toBeNull()
  })
})
