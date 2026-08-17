import { describe, expect, it } from 'vitest'
import { resolveLibraryWrite, shouldAdoptInitialLibraryFromStorage, shouldSkipInitialLibraryWrite, shouldStartFreshFromStoreOpen } from './useLibrary.guards'

describe('resolveLibraryWrite', () => {
  it('unions existing library ids on add so stale clients do not drop books', () => {
    expect(resolveLibraryWrite(['bible'], ['the-awakening'], 'add')).toEqual(['bible', 'the-awakening'])
  })

  it('deduplicates ids while preserving first-seen order', () => {
    expect(resolveLibraryWrite(['bible', 'the-awakening'], ['the-awakening'], 'add')).toEqual(['bible', 'the-awakening'])
  })

  it('allows deliberate removals to shrink the library', () => {
    expect(resolveLibraryWrite(['bible', 'the-awakening'], ['bible'], 'remove')).toEqual(['bible'])
  })

  it('does not let a passive stale replace shrink the library', () => {
    expect(resolveLibraryWrite(['bible', 'war-and-peace'], ['bible'], 'replace')).toEqual(['bible', 'war-and-peace'])
  })
})

describe('shouldSkipInitialLibraryWrite', () => {
  it('skips the initial persistence pass only when state matches storage', () => {
    expect(shouldSkipInitialLibraryWrite(['bible'], ['bible'])).toBe(true)
  })

  it('does not drop a real add that happened before the first persistence effect unlocked', () => {
    expect(shouldSkipInitialLibraryWrite(['bible'], ['bible', 'war-and-peace'])).toBe(false)
  })
})

describe('shouldAdoptInitialLibraryFromStorage', () => {
  it('adopts hydrated storage on the first replace-mode pass instead of overwriting it', () => {
    expect(shouldAdoptInitialLibraryFromStorage(['bible', 'hamlet'], ['bible'], 'replace')).toBe(true)
  })

  it('does not adopt storage over a real add queued before writes unlock', () => {
    expect(shouldAdoptInitialLibraryFromStorage(['bible'], ['bible', 'hamlet'], 'add')).toBe(false)
  })
})

describe('shouldStartFreshFromStoreOpen', () => {
  it('fresh-starts a newly added book with no visible progress', () => {
    expect(shouldStartFreshFromStoreOpen({ wasInLibrary: false, hasProgress: false })).toBe(true)
  })

  it('keeps a real paused position when the store shows progress', () => {
    expect(shouldStartFreshFromStoreOpen({ wasInLibrary: false, hasProgress: true })).toBe(false)
  })

  it('does not reset books already in the library', () => {
    expect(shouldStartFreshFromStoreOpen({ wasInLibrary: true, hasProgress: false })).toBe(false)
  })
})
