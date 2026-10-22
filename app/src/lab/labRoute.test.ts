import { describe, expect, it } from 'vitest'
import { isLabPath, labLayoutOverride, legacyLabPageRedirect } from './labRoute'

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
    for (const path of ['/lab/library', '/lab/library/', '/lab/library_2', '/lab/library_2/', '/lab/library_2/index.html', '/lab/library-2', '/lab/library-2/', '/lab/library-2/index.html', '/lab/library_2/desktop.html', '/lab/library_2/mobile.html']) expect(to(path)).toBe('/library')
    for (const path of ['/lab/reader', '/lab/reader/']) expect(to(path)).toBe('/reader')
    for (const path of ['/lab/sign-in', '/lab/sign-in/', '/lab/sign-in/index.html']) expect(to(path)).toBe('/sign-in')
    for (const path of ['/lab/featured', '/lab/featured/', '/lab/featured/index.html']) expect(to(path)).toBe('/featured')
  })

  it("sends an own book's old Add a book address to its one reader address, keeping Original pages' page", () => {
    const hex = 'aa11bb22cc33dd44ee55ff66'
    expect(to('/lab/addbook/', `?userBook=${hex}`)).toBe(`/reader?userBook=${hex}`)
    expect(to('/lab/addbook', `?userBook=${hex}`)).toBe(`/reader?userBook=${hex}`)
    expect(to('/lab/addbook/index.html', `?userBook=${hex}&page=12&frac=0.25&pages`)).toBe(`/reader?userBook=${hex}&page=12&frac=0.25&pages=`)
    expect(to('/lab/addbook/', `?open=pdf:${hex}`)).toBe(`/reader?userBook=${hex}`)
    expect(to('/lab/addbook/', `?open=epub:${hex}`)).toBe(`/reader?userBook=${hex}`)
    // The page itself stays for everything else: an old hand-off link, the frame's own page, a bad key.
    expect(to('/lab/addbook/', '?mode=file&handoff=1')).toBeNull()
    expect(to('/lab/addbook/', '')).toBeNull()
    expect(to('/lab/addbook/book', `?userBook=${hex}`)).toBeNull()
    expect(to('/lab/addbook/book', '?tinctBook=frankenstein')).toBeNull()
    expect(to('/lab/addbook/', '?userBook=XYZ')).toBeNull()
    expect(to('/lab/addbook/', '?open=cbz:abcdef0123')).toBeNull()
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

it('mounts the reader only at /reader, with no preview flags to choose a chrome', () => {
  expect(isLabPath('/reader')).toBe(true)
  expect(isLabPath('/reader/')).toBe(true)
  expect(isLabPath('/reader?voice=v2')).toBe(true)
  for (const path of ['/lab/reader', '/lab/phone', '/lab/desktop', '/lab']) expect(isLabPath(path)).toBe(false)
})
