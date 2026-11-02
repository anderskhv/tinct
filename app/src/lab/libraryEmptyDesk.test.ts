// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LIBRARY_EMPTY_KEY, libraryKnownEmpty, libraryOpensReturning, rememberEmptyLibrary } from './libraryRoom'

const lib = (file: string) => readFileSync(resolve(__dirname, '../../public/lab/library_2/' + file), 'utf8')
const win = () => ({ document, localStorage, sessionStorage })
const signIn = (id: string) => localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: 'x', user: { id } }))

afterEach(() => { localStorage.clear(); sessionStorage.clear(); document.cookie = 'tinct_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT' })

// 2 Nov 2026: a new reader saw the empty table room for several seconds before Frankenstein, because the
// signed-in cookie alone opened the library on the desk while the account's (empty) books were fetched.
describe('an account this device knows has an empty desk', () => {
  it('opens on the discovery library, not on the table', () => {
    document.cookie = 'tinct_auth=1'
    signIn('user-a')
    expect(libraryOpensReturning('/library', win())).toBe(true)
    rememberEmptyLibrary(localStorage, 'user-a')
    expect(libraryKnownEmpty(localStorage, 'user-a')).toBe(true)
    expect(libraryOpensReturning('/library', win())).toBe(false)
  })

  it('belongs to its own account only', () => {
    document.cookie = 'tinct_auth=1'
    rememberEmptyLibrary(localStorage, 'user-a')
    signIn('user-b')
    expect(libraryKnownEmpty(localStorage, 'user-b')).toBe(false)
    expect(libraryOpensReturning('/library', win())).toBe(true)
  })

  it('never hides books kept on this device', () => {
    document.cookie = 'tinct_auth=1'
    signIn('user-a')
    rememberEmptyLibrary(localStorage, 'user-a')
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { frankenstein: { chapter: 1 } } }))
    expect(libraryOpensReturning('/library', win())).toBe(true)
  })

  it('is cleared once the account has a book', () => {
    rememberEmptyLibrary(localStorage, 'user-a')
    rememberEmptyLibrary(localStorage, 'user-a', false)
    expect(localStorage.getItem(LIBRARY_EMPTY_KEY)).toBeNull()
  })

  it('is read by boot.js and written by bookshelf.js under the same key', () => {
    expect(lib('boot.js')).toContain(`localStorage.getItem('${LIBRARY_EMPTY_KEY}')`)
    expect(lib('boot.js')).toContain('(signed&&!knownEmpty)')
    expect(lib('boot.js')).toContain('owner:signedInUser()')
    expect(lib('bookshelf.js')).toContain(`localStorage.setItem('${LIBRARY_EMPTY_KEY}',JSON.stringify({v:1,owner}))`)
    expect(lib('bookshelf.js')).toContain(`localStorage.removeItem('${LIBRARY_EMPTY_KEY}')`)
  })
})

describe('a tap on Read before the library has wired it', () => {
  it('is kept by boot.js and answered by app.js once it is ready', () => {
    expect(lib('boot.js')).toContain("closest('#read-featured,#hero-book')")
    expect(lib('boot.js')).toContain('window.__library2EarlyOpen=true')
    const app = lib('app.js')
    const wired = app.indexOf("$('hero-book').onclick=$('read-featured').onclick=openFeatured;")
    expect(wired).toBeGreaterThan(-1)
    expect(app.indexOf('window.__library2HeroWired=true;if(window.__library2EarlyOpen)')).toBeGreaterThan(wired)
    // After the module has run: openFeatured reads state declared further down app.js.
    expect(app).toContain('setTimeout(()=>{if(!/\\breturning(-pending)?\\b/.test(document.documentElement.className))openFeatured();},0)')
  })
})
