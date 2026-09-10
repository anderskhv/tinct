import { describe, expect, it } from 'vitest'
import { defaultPopupMode, isSingleWordSelection, selectionTokens } from './selectionPopupMode'

describe('isSingleWordSelection', () => {
  it('treats one token as a single word', () => {
    expect(isSingleWordSelection('selfishness')).toBe(true)
  })

  it('ignores wrapping punctuation', () => {
    expect(isSingleWordSelection('selfishness,')).toBe(true)
    expect(isSingleWordSelection('"selfishness"')).toBe(true)
    expect(isSingleWordSelection('(selfishness)')).toBe(true)
    expect(isSingleWordSelection('  selfishness.  ')).toBe(true)
  })

  it('counts hyphenated words as one token', () => {
    expect(isSingleWordSelection('wine-dark')).toBe(true)
    expect(isSingleWordSelection("don't")).toBe(true)
  })

  it('treats a phrase as multiple words', () => {
    expect(isSingleWordSelection('selfishness and pride')).toBe(false)
    expect(isSingleWordSelection('the wine-dark sea')).toBe(false)
  })
})

describe('selectionTokens', () => {
  it('strips wrapping punctuation then splits on whitespace', () => {
    expect(selectionTokens('selfishness')).toEqual(['selfishness'])
    expect(selectionTokens('selfishness and pride')).toEqual(['selfishness', 'and', 'pride'])
    expect(selectionTokens('')).toEqual([])
  })
})

describe('defaultPopupMode', () => {
  it('opens define for a single word', () => {
    expect(defaultPopupMode('selfishness')).toBe('define')
    expect(defaultPopupMode('selfishness,')).toBe('define')
  })

  it('opens actions for a multi-word phrase', () => {
    expect(defaultPopupMode('selfishness and pride')).toBe('main')
    expect(defaultPopupMode('the wine-dark sea')).toBe('main')
  })

  it('opens actions when tapping an existing highlight, even for one word', () => {
    expect(defaultPopupMode('selfishness', 'hl_1')).toBe('main')
    expect(defaultPopupMode('selfishness and pride', 'hl_1')).toBe('main')
  })

  it('opens actions for empty text', () => {
    expect(defaultPopupMode('')).toBe('main')
    expect(defaultPopupMode('   ')).toBe('main')
  })
})
