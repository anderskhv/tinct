import { expect, it } from 'vitest'
import { LIBRARY_TWO_DEFAULT, libraryEntryPath } from './libraryTwoRelease'
it('serves the approved library publicly without a preview cookie', () => {
  expect(LIBRARY_TWO_DEFAULT).toBe(true)
  for (const cookie of [null, 'tinct_auth=1', 'tinct_library_preview=0']) expect(libraryEntryPath(cookie)).toBe('/lab/library_2/')
})
it('retains exact preview opt-in when the public rollout is rolled back', () => {
  expect(libraryEntryPath('tinct_auth=1; tinct_library_preview=1; other=yes', false)).toBe('/lab/library_2/')
  for (const cookie of ['tinct_library_preview=0', 'other_tinct_library_preview=1', 'tinct_library_preview=10']) expect(libraryEntryPath(cookie, false)).toBe('/lab/')
})
it('supports rollback without changing reader routes or data', () => {
  expect(libraryEntryPath(null, true)).toBe('/lab/library_2/')
  expect(libraryEntryPath(null, false)).toBe('/lab/')
})
