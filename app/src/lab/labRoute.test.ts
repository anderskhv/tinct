import { describe, expect, it } from 'vitest'
import { isLabPath, labLayoutOverride, labSurface } from './labRoute'

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

  it('routes landing and library without changing reader layout routes', () => {
    expect(labSurface('/lab/landing')).toBe('landing')
    expect(labSurface('/lab/landing/')).toBe('landing')
    expect(labSurface('/lab/library?from=reader')).toBe('library')
    expect(labSurface('/lab')).toBe('reader')
    expect(labSurface('/lab/phone')).toBe('reader')
    expect(labSurface('/lab/desktop')).toBe('reader')
    expect(labSurface('/lab/reader')).toBe('reader')
  })

  it('keeps the neutral reader route responsive', () => {
    expect(labLayoutOverride('/lab/reader')).toBeNull()
  })
})
