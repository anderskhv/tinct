import { describe, expect, it } from 'vitest'
import { isLabPath, labLayoutOverride, labSurface, labVoiceVersion } from './labRoute'

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

describe('lab voice version flag', () => {
  it('defaults every lab route to Voice V1', () => {
    expect(labVoiceVersion('/lab')).toBe('v1')
    expect(labVoiceVersion('/lab/')).toBe('v1')
    expect(labVoiceVersion('/lab/phone')).toBe('v1')
    expect(labVoiceVersion('/lab/desktop')).toBe('v1')
    expect(labVoiceVersion('/lab/reader')).toBe('v1')
    expect(labVoiceVersion('/lab/reader', '')).toBe('v1')
    expect(labVoiceVersion('/lab/reader', '?voice=v1')).toBe('v1')
    expect(labVoiceVersion('/lab/reader', '?voice=')).toBe('v1')
    expect(labVoiceVersion('/lab/reader', '?voice=v3')).toBe('v1')
  })

  it('enables Voice V2 only at /lab/reader?voice=v2', () => {
    expect(labVoiceVersion('/lab/reader', '?voice=v2')).toBe('v2')
    expect(labVoiceVersion('/lab/reader/', '?voice=v2')).toBe('v2')
    expect(labVoiceVersion('/lab/reader?voice=v2')).toBe('v2')
    expect(labVoiceVersion('/lab/reader?from=library&voice=V2')).toBe('v2')
    expect(labVoiceVersion('/lab/reader?voice=v2#p3')).toBe('v2')
    expect(labVoiceVersion('/lab/reader', 'voice=v2')).toBe('v2')
  })

  it('never lets the preview flag reach other lab layouts or production routes', () => {
    expect(labVoiceVersion('/lab', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/lab/phone', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/lab/desktop', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/lab/library', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/lab/phone?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/app', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/read/odyssey', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/', '?voice=v2')).toBe('v1')
  })

  it('keeps the existing lab routing helpers unaware of the flag', () => {
    expect(isLabPath('/lab/reader?voice=v2')).toBe(true)
    expect(labSurface('/lab/reader?voice=v2')).toBe('reader')
    expect(labLayoutOverride('/lab/reader?voice=v2')).toBeNull()
  })
})
