import { describe, expect, it } from 'vitest'
import { isLabPath, labChromeVersion, labLayoutOverride, labVoiceVersion, legacyLabPageRedirect } from './labRoute'

describe('lab routes', () => {
  it('mounts the reader SPA only at /reader', () => {
    expect(isLabPath('/reader')).toBe(true)
    expect(isLabPath('/reader/')).toBe(true)
    expect(isLabPath('/reader?voice=v2')).toBe(true)
    for (const path of ['/lab', '/lab/', '/lab/phone', '/lab/reader', '/app', '/read/odyssey', '/library', '/laboratory']) expect(isLabPath(path)).toBe(false)
  })

  it('reads the QA layout override from ?layout= on /reader', () => {
    expect(labLayoutOverride('/reader')).toBeNull()
    expect(labLayoutOverride('/reader', '?layout=phone')).toBe('phone')
    expect(labLayoutOverride('/reader', 'layout=Desktop')).toBe('desktop')
    expect(labLayoutOverride('/reader?layout=phone&chrome=v2')).toBe('phone')
    expect(labLayoutOverride('/reader', '?layout=tablet')).toBeNull()
    expect(labLayoutOverride('/lab/phone')).toBe('phone')
    expect(labLayoutOverride('/lab/desktop/')).toBe('desktop')
  })
})

describe('legacy /lab page redirects', () => {
  const to = (path: string, search = '') => legacyLabPageRedirect(path, search)
  it('sends every old page URL to its canonical page', () => {
    for (const path of ['/lab', '/lab/', '/lab/index.html', '/lab/landing']) expect(to(path)).toBe('/')
    for (const path of ['/lab/library', '/lab/library/', '/lab/library_2', '/lab/library_2/', '/lab/library_2/index.html', '/lab/library-2', '/lab/library-2/', '/lab/library-2/index.html']) expect(to(path)).toBe('/library')
    for (const path of ['/lab/reader', '/lab/reader/']) expect(to(path)).toBe('/reader')
    for (const path of ['/lab/sign-in', '/lab/sign-in/', '/lab/sign-in/index.html']) expect(to(path)).toBe('/sign-in')
    for (const path of ['/lab/featured', '/lab/featured/', '/lab/featured/index.html']) expect(to(path)).toBe('/featured')
  })

  it('keeps the query string and maps phone and desktop to ?layout=', () => {
    expect(to('/lab/library_2/', '?book=hamlet&view=book-detail')).toBe('/library?book=hamlet&view=book-detail')
    expect(to('/lab/phone', '?chrome=v2')).toBe('/reader?layout=phone')
    expect(to('/lab/phone/', '?voice=v2')).toBe('/reader?voice=v2&layout=phone')
    expect(to('/lab/desktop', '')).toBe('/reader?layout=desktop')
    expect(to('/lab/reader', '?chrome=v2&book=bible&chapter=3&voiceTrial=full')).toBe('/reader?book=bible&chapter=3')
    expect(to('/lab/reader', '?voiceTrial=mini')).toBe('/reader?voiceTrial=mini')
  })

  it('leaves asset files and unknown /lab paths alone, so /lab stays free for experiments', () => {
    for (const path of ['/lab/library_2/app.js', '/lab/library_2/styles.css', '/lab/library_2/assets/odyssey.jpg', '/lab/catalogue.json', '/lab/display-profile.js', '/lab/sign-in-runtime.js', '/lab/experiment', '/reader', '/library', '/sign-in', '/laboratory']) expect(to(path)).toBeNull()
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
    expect(isLabPath('/reader?voice=v2')).toBe(true)
    expect(labLayoutOverride('/lab/reader?voice=v2')).toBeNull()
  })
})

describe('lab chrome version flag', () => {
  it('defaults every lab route to the chrome that ships today', () => {
    expect(labChromeVersion('/lab')).toBe('v1')
    expect(labChromeVersion('/lab/')).toBe('v1')
    expect(labChromeVersion('/lab/library')).toBe('v1')
    expect(labChromeVersion('/lab/landing')).toBe('v1')
    expect(labChromeVersion('/lab/reader')).toBe('v1')
    expect(labChromeVersion('/lab/phone')).toBe('v1')
    expect(labChromeVersion('/lab/desktop')).toBe('v1')
    expect(labChromeVersion('/lab/reader', '')).toBe('v1')
    expect(labChromeVersion('/lab/reader', '?chrome=v1')).toBe('v1')
    expect(labChromeVersion('/lab/reader', '?chrome=')).toBe('v1')
    expect(labChromeVersion('/lab/reader', '?chrome=v3')).toBe('v1')
  })

  it('enables Chrome V2 on each lab reader route with the flag', () => {
    expect(labChromeVersion('/lab/reader', '?chrome=v2')).toBe('v2')
    expect(labChromeVersion('/lab/phone', '?chrome=v2')).toBe('v2')
    expect(labChromeVersion('/lab/desktop', '?chrome=v2')).toBe('v2')
    expect(labChromeVersion('/lab/reader/', '?chrome=v2')).toBe('v2')
    expect(labChromeVersion('/lab/phone?chrome=v2')).toBe('v2')
    expect(labChromeVersion('/lab/phone?from=library&chrome=V2')).toBe('v2')
    expect(labChromeVersion('/lab/phone?chrome=v2#p3')).toBe('v2')
    expect(labChromeVersion('/lab/phone', 'chrome=v2')).toBe('v2')
  })

  it('never lets the preview flag reach the library, the landing page or production routes', () => {
    expect(labChromeVersion('/lab', '?chrome=v2')).toBe('v1')
    expect(labChromeVersion('/lab/library', '?chrome=v2')).toBe('v1')
    expect(labChromeVersion('/lab/landing', '?chrome=v2')).toBe('v1')
    expect(labChromeVersion('/read', '?chrome=v2')).toBe('v1')
    expect(labChromeVersion('/', '?chrome=v2')).toBe('v1')
  })

  it('reads the two preview flags independently', () => {
    expect(labChromeVersion('/lab/reader', '?voice=v2')).toBe('v1')
    expect(labVoiceVersion('/lab/reader', '?chrome=v2')).toBe('v1')
    expect(labChromeVersion('/lab/reader', '?voice=v2&chrome=v2')).toBe('v2')
    expect(labVoiceVersion('/lab/reader', '?voice=v2&chrome=v2')).toBe('v2')
  })
})

 it('opens the public reader with production chrome and voice without flags', () => {
   expect(isLabPath('/reader')).toBe(true)
   expect(labChromeVersion('/reader')).toBe('v2')
   expect(labChromeVersion('/reader/')).toBe('v2')
 })
