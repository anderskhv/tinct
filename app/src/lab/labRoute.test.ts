import { describe, expect, it } from 'vitest'
import { isLabPath, labLayoutOverride } from './labRoute'

describe('lab routes', () => {
  it('treats /lab and nested paths as the demo', () => {
    expect(isLabPath('/lab')).toBe(true)
    expect(isLabPath('/lab/')).toBe(true)
    expect(isLabPath('/lab/phone')).toBe(true)
    expect(isLabPath('/lab/desktop?x=1')).toBe(true)
    expect(isLabPath('/app')).toBe(false)
    expect(isLabPath('/read/odyssey')).toBe(false)
    expect(isLabPath('/laboratory')).toBe(false)
  })

  it('reads optional layout overrides from /lab/*', () => {
    expect(labLayoutOverride('/lab')).toBeNull()
    expect(labLayoutOverride('/lab/phone')).toBe('phone')
    expect(labLayoutOverride('/lab/desktop/')).toBe('desktop')
  })
})
