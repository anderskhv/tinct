import { describe, expect, it } from 'vitest'
import { LAB_DEFAULT_RETURN_TO, safeLabReturnTo } from './labSignInReturn'

const ORIGIN = 'https://tinct.app'
const safe = (value: string | null | undefined) => safeLabReturnTo(value, ORIGIN)

describe('safeLabReturnTo', () => {
  it('returns the reader routes, with their query strings, so sign-in lands back in the book', () => {
    expect(safe('/lab/reader')).toBe('/lab/reader')
    expect(safe('/lab/phone?voice=v2')).toBe('/lab/phone?voice=v2')
    expect(safe('/lab/desktop?voice=v2#p12')).toBe('/lab/desktop?voice=v2#p12')
    expect(safe('/lab/reader/')).toBe('/lab/reader/')
  })

  it('keeps the pre-reader lab routes and the launch routes', () => {
    expect(safe('/lab/library')).toBe('/lab/library')
    expect(safe('/lab/library-2?mode=recap')).toBe('/lab/library-2?mode=recap')
    expect(safe('/lab')).toBe('/lab')
    expect(safe('/library')).toBe('/library')
    expect(safe('/library/')).toBe('/library/')
    expect(safe('/read/odyssey')).toBe('/read/odyssey')
    expect(safe('/read/odyssey/3')).toBe('/read/odyssey/3')
    expect(safe('/read/bible/40?voice=v2')).toBe('/read/bible/40?voice=v2')
  })

  it('falls back to the library for empty and unknown same-origin paths', () => {
    expect(safe(null)).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe(undefined)).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/app')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/laboratory')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/read')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/read/odyssey/three')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/read/../admin')).toBe(LAB_DEFAULT_RETURN_TO)
  })

  it('rejects anything that is not a same-origin path', () => {
    expect(safe('https://evil.example/lab/reader')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('http://tinct.app/lab/reader')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('//evil.example/lab/reader')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('javascript:alert(1)')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/\\evil.example/lab/reader')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('\\\\evil.example')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('/lab/reader\\..\\x')).toBe(LAB_DEFAULT_RETURN_TO)
    expect(safe('data:text/html,hi')).toBe(LAB_DEFAULT_RETURN_TO)
  })

  it('honours the same-origin lab path when given the real origin (absolute form)', () => {
    expect(safe(`${ORIGIN}/lab/reader?voice=v2`)).toBe('/lab/reader?voice=v2')
  })
})
