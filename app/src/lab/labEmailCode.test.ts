import { describe, expect, it } from 'vitest'
import { codeFromText } from './labEmailCode'

describe('codeFromText (5 Nov 2026: a reader could not paste their code)', () => {
  it.each([
    ['123456', '123456'],
    ['123 456', '123456'],
    ['12-34-56', '123456'],
    [' 123456\n', '123456'],
    ['Your Tinct code is 482913', '482913'],
    ['Code 482913, valid for 2026', '482913'],
    ['12', '12'],
    ['1234567', '123456'],
  ])('%j gives %j', (text, code) => expect(codeFromText(text)).toBe(code))
})
