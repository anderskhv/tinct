import { describe, expect, it } from 'vitest'
import {
  coerceRev,
  shouldFallbackToLegacyUserDataWrite,
  versionedWriteApplied,
} from './supabaseStorage.versioning'

describe('supabaseStorage versioning helpers', () => {
  it('falls back when the migration has not added the rev column yet', () => {
    expect(shouldFallbackToLegacyUserDataWrite({
      code: '42703',
      message: 'column user_data.rev does not exist',
    })).toBe(true)
  })

  it('falls back when the commit RPC is missing during rollout', () => {
    expect(shouldFallbackToLegacyUserDataWrite({
      code: 'PGRST202',
      message: 'Could not find the function public.commit_user_data',
    })).toBe(true)
  })

  it('does not fall back for ordinary write failures', () => {
    expect(shouldFallbackToLegacyUserDataWrite({
      code: '42501',
      message: 'not authorized',
    })).toBe(false)
  })

  it('coerces valid revs from PostgREST values', () => {
    expect(coerceRev(3)).toBe(3)
    expect(coerceRev('4')).toBe(4)
    expect(coerceRev(null)).toBeUndefined()
    expect(coerceRev(-1)).toBeUndefined()
  })

  it('treats conflict rows as not applied', () => {
    expect(versionedWriteApplied({ key: 'position:a', value: {}, rev: 2, applied: true, conflict: false })).toBe(true)
    expect(versionedWriteApplied({ key: 'position:a', value: {}, rev: 3, applied: false, conflict: true })).toBe(false)
  })
})
