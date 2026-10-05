// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabAiUsageBar } from './LabAiUsageBar'
import { AI_USAGE_COPY, aiUsageNote, fetchAiAllowance, parseAiAllowance, startTopUpCheckout } from './labAiAllowance'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('parseAiAllowance', () => {
  it('is null while the allowance is switched off', () => {
    expect(parseAiAllowance({ enabled: false })).toBeNull()
    expect(parseAiAllowance(null)).toBeNull()
    expect(parseAiAllowance({ enabled: true, usedFraction: 'x', state: 'ok' })).toBeNull()
    expect(parseAiAllowance({ enabled: true, usedFraction: 0.5, state: 'weird' })).toBeNull()
  })

  it('reads the four fields and clamps the fraction', () => {
    expect(parseAiAllowance({ enabled: true, usedFraction: 1.4, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false }))
      .toEqual({ usedFraction: 1, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false })
  })
})

describe('aiUsageNote', () => {
  it('names the renewal date and says reading carries on at zero', () => {
    expect(aiUsageNote({ usedFraction: 1, state: 'used_up', resetsAt: '2026-10-20T12:00:00.000Z', hasTopUp: false }))
      .toBe(AI_USAGE_COPY.usedUpUntil('Oct 20'))
    expect(aiUsageNote({ usedFraction: 1, state: 'used_up', resetsAt: null, hasTopUp: false })).toBe(AI_USAGE_COPY.usedUp)
    expect(aiUsageNote({ usedFraction: 0.85, state: 'low', resetsAt: '2026-10-20T12:00:00.000Z', hasTopUp: true }))
      .toBe(`${AI_USAGE_COPY.low} ${AI_USAGE_COPY.includesTopUp} ${AI_USAGE_COPY.resets('Oct 20')}.`)
  })

  it('never shows a currency', () => {
    for (const state of ['ok', 'low', 'used_up'] as const) {
      expect(aiUsageNote({ usedFraction: 0.5, state, resetsAt: '2026-10-20T12:00:00.000Z', hasTopUp: true })).not.toMatch(/[$€£]|usd|dollar/i)
    }
  })
})

describe('requests', () => {
  it('sends the session token and parses the response', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ enabled: true, usedFraction: 0.1, state: 'ok', resetsAt: null, hasTopUp: false }))
    expect(await fetchAiAllowance('tok', fetchImpl)).toEqual({ usedFraction: 0.1, state: 'ok', resetsAt: null, hasTopUp: false })
    expect(fetchImpl).toHaveBeenCalledWith('/api/ai-allowance', expect.objectContaining({ headers: { Authorization: 'Bearer tok' } }))
  })

  it('opens the existing chat-pack checkout as the top-up', async () => {
    const fetchImpl = vi.fn(async (_input: string, _init?: RequestInit) => Response.json({ url: 'https://checkout.stripe.com/c/pay' }))
    expect(await startTopUpCheckout('tok', 'chat_pack_200', fetchImpl)).toBe('https://checkout.stripe.com/c/pay')
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))).toEqual({ type: 'chat_pack_200' })
  })
})

describe('LabAiUsageBar', () => {
  it('renders nothing while the allowance is off', async () => {
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

  it('shows the bar, and offers a top-up only when used up', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true, usedFraction: 1, state: 'used_up', resetsAt: '2026-10-20T12:00:00.000Z', hasTopUp: false })))
    render(<LabAiUsageBar token="tok" />)
    const bar = await screen.findByTestId('lab-v2-ai-usage')
    expect(bar.getAttribute('data-state')).toBe('used_up')
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100')
    expect(screen.getByTestId('lab-v2-top-up').textContent).toBe(AI_USAGE_COPY.topUp)
  })

  it('has no top-up button while allowance is left', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true, usedFraction: 0.3, state: 'ok', resetsAt: null, hasTopUp: false })))
    render(<LabAiUsageBar token="tok" />)
    await screen.findByTestId('lab-v2-ai-usage')
    expect(screen.queryByTestId('lab-v2-top-up')).toBeNull()
  })
})
