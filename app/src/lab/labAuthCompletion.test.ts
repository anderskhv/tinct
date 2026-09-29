import { describe, expect, it } from 'vitest'
import { isInitialAccountSession } from './labAuthCompletion'

describe('initial account session', () => {
  it('recognises an account created during this provider sign-in', () => {
    expect(isInitialAccountSession({ created_at: '2026-09-29T17:00:00Z', last_sign_in_at: '2026-09-29T17:00:01Z' })).toBe(true)
  })
  it('does not mistake a returning reader, missing dates, or an invalid timestamp for signup', () => {
    expect(isInitialAccountSession({ created_at: '2026-09-20T17:00:00Z', last_sign_in_at: '2026-09-29T17:00:01Z' })).toBe(false)
    expect(isInitialAccountSession({})).toBe(false)
    expect(isInitialAccountSession({ created_at: 'bad', last_sign_in_at: 'bad' })).toBe(false)
  })
})
