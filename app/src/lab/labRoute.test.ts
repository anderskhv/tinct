import { describe, expect, it } from 'vitest'
import { CLASSIC_APP_PATH, LIBRARY_PATH, isLabPath, isLabReaderPath, labLayoutOverride, labReaderRoute, labSurface, labVoiceVersion } from './labRoute'

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

describe('launch switch routes', () => {
  it('names the public library and the classic app', () => {
    expect(LIBRARY_PATH).toBe('/library')
    expect(CLASSIC_APP_PATH).toBe('/classic')
  })

  it('mounts the lab reader for /read/{bookId} but leaves the static SEO pages alone', () => {
    expect(isLabReaderPath('/read/odyssey')).toBe(true)
    expect(isLabReaderPath('/read/odyssey/')).toBe(true)
    expect(isLabReaderPath('/read/odyssey/3')).toBe(true)
    expect(isLabReaderPath('/read/odyssey?chapter=2&edition=modern-en')).toBe(true)
    expect(isLabReaderPath('/read')).toBe(false)
    expect(isLabReaderPath('/read/')).toBe(false)
    expect(isLabReaderPath('/read/odyssey/summary')).toBe(false)
    expect(isLabReaderPath('/read/odyssey/chapter-3')).toBe(false)
    expect(isLabReaderPath('/classic')).toBe(false)
    expect(isLabReaderPath('/library')).toBe(false)
    expect(isLabReaderPath('/lab/reader')).toBe(false)
  })

  it('parses book, chapter and edition from reader URLs', () => {
    expect(labReaderRoute('/read/odyssey')).toEqual({ bookId: 'odyssey', chapterNumber: null, editionKey: null })
    expect(labReaderRoute('/read/Odyssey/4')).toEqual({ bookId: 'odyssey', chapterNumber: 4, editionKey: null })
    expect(labReaderRoute('/read/odyssey', '?chapter=2&edition=modern-en')).toEqual({ bookId: 'odyssey', chapterNumber: 2, editionKey: 'modern-en' })
    expect(labReaderRoute('/read/odyssey/7?chapter=2')).toEqual({ bookId: 'odyssey', chapterNumber: 7, editionKey: null })
    expect(labReaderRoute('/read/odyssey?chapter=0')).toEqual({ bookId: 'odyssey', chapterNumber: null, editionKey: null })
    expect(labReaderRoute('/read/odyssey/summary')).toBeNull()
    expect(labReaderRoute('/lab/reader')).toBeNull()
  })
})
