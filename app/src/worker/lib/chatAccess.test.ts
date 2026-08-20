import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluateChatAccess } from './chatAccess'

describe('evaluateChatAccess', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows trial users with no paid balance', () => {
    expect(evaluateChatAccess({
      messages_used_this_period: 0,
      message_balance: 0,
      subscription_status: null,
      subscription_period_end: null,
      created_at: '2026-06-01T12:00:00Z',
    })).toEqual({ allowed: true })
  })

  it('blocks exhausted free users after trial', () => {
    expect(evaluateChatAccess({
      messages_used_this_period: 0,
      message_balance: 0,
      subscription_status: null,
      subscription_period_end: null,
      created_at: '2025-01-01T12:00:00Z',
    })).toEqual({ allowed: false, error: 'No messages remaining. Buy a chat pack to continue.' })
  })
})
