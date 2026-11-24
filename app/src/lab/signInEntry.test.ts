import { describe, expect, it } from 'vitest'
import { SIGN_IN_COPY, SIGN_IN_ENTRY_KEY, currentSignInEntry, rememberSignInBook, signInBookTitle, signInEntryOf, signInSheetCopy, withSignInEntry } from './signInEntry'
import { labSignInHref } from './labAccountPrompt'
import { labSignInUrl } from './labPrefs'

function memory(): Storage {
  const map = new Map<string, string>()
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => { map.set(key, String(value)) }, removeItem: key => { map.delete(key) }, clear: () => map.clear(), key: () => null, get length() { return map.size } }
}

describe('the sign-in sheet by what opened it (Anders, 24 Nov 2026)', () => {
  it('one table holds every title and line', () => {
    expect(SIGN_IN_COPY).toEqual({
      save_place: { title: 'Keep your place', line: 'Pick up {book} at this page on any device.', lineWithoutBook: 'Pick up where you are on any device.' },
      listen: { title: 'Keep listening', line: 'Listen on from this sentence, on any device.' },
      general: { title: 'Sign in or join Tinct', line: 'Your books, places, highlights and notes on every device.' },
    })
    expect(signInSheetCopy('save_place', 'Middlemarch')).toEqual({ title: 'Keep your place', line: 'Pick up Middlemarch at this page on any device.' })
    expect(signInSheetCopy('save_place', '  ')).toEqual({ title: 'Keep your place', line: 'Pick up where you are on any device.' })
    expect(signInSheetCopy('listen', 'Middlemarch').line).toBe('Listen on from this sentence, on any device.')
  })

  it('only the three entries; anything else is general', () => {
    expect(['save_place', 'listen', 'general', 'x', null, 3].map(signInEntryOf)).toEqual(['save_place', 'listen', 'general', 'general', 'general', 'general'])
  })

  it('the links carry from= beside returnTo; general adds nothing', () => {
    expect(labSignInUrl('/reader', 'save_place')).toBe('/sign-in?returnTo=%2Freader&from=save_place')
    expect(labSignInUrl('/reader')).toBe('/sign-in?returnTo=%2Freader')
    expect(labSignInHref('signin', '/reader', 'listen')).toBe('/sign-in?returnTo=%2Freader&from=listen')
    expect(labSignInHref('create', '/library')).toBe('/sign-in?mode=create&returnTo=%2Flibrary')
    expect(withSignInEntry('/sign-in?returnTo=%2Flibrary', 'general')).toBe('/sign-in?returnTo=%2Flibrary')
  })

  it('the title travels in this tab only, for 30 minutes, trimmed and capped', () => {
    const storage = memory()
    rememberSignInBook('  The   Odyssey ', storage, 1_000)
    expect(signInBookTitle(storage, 1_000 + 29 * 60_000)).toBe('The Odyssey')
    expect(signInBookTitle(storage, 1_000 + 31 * 60_000)).toBeNull()
    rememberSignInBook('x'.repeat(500), storage, 1_000)
    expect(signInBookTitle(storage, 1_000)).toHaveLength(120)
    rememberSignInBook(null, storage)
    expect(signInBookTitle(storage)).toBeNull()
    storage.setItem('tinct:sign-in-book', '{not json')
    expect(signInBookTitle(storage)).toBeNull()
  })

  it('the entry is kept for a provider round trip, and forgotten on a plain visit', () => {
    const storage = memory()
    expect(currentSignInEntry('?from=listen&returnTo=%2Freader', false, storage)).toBe('listen')
    expect(currentSignInEntry('?callback=google', true, storage)).toBe('listen')
    expect(currentSignInEntry('?returnTo=%2Flibrary', false, storage)).toBe('general')
    expect(storage.getItem(SIGN_IN_ENTRY_KEY)).toBeNull()
    expect(currentSignInEntry('?callback=google', true, storage)).toBe('general')
  })
})
