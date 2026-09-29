import { describe, expect, it } from 'vitest'
import { nativeEntryDestination } from './nativeEntry'
describe('bundled native entry routes', () => {
  it('opens the real library and retains the requested view', () => {
    expect(nativeEntryDestination(true, '/', '?book=hamlet', '#saved')).toBe('/lab/library_2/index.html?book=hamlet#saved')
    expect(nativeEntryDestination(true, '/library/')).toBe('/lab/library_2/index.html')
    expect(nativeEntryDestination(true, '/lab/sign-in', '?returnTo=%2Freader')).toBe('/lab/sign-in/index.html?returnTo=%2Freader')
  })
  it('preserves reader deep links, library assets and ordinary web entry', () => {
    for (const path of ['/reader', '/lab/phone', '/lab/library_2/index.html']) expect(nativeEntryDestination(true, path)).toBeNull()
    expect(nativeEntryDestination(false, '/')).toBeNull()
  })
})
