import { describe, expect, it } from 'vitest'
import { stripUnderscoreEmphasis, tokenizeWithEmphasis } from './labEmphasis'

/** Plain whitespace split — the ground truth every lab tokenizer must match in count/order. */
function rawTokens(text: string): string[] {
  return text.split(/\s+/).map(part => part.trim()).filter(Boolean)
}

describe('stripUnderscoreEmphasis', () => {
  it('strips a matched pair and reports its range', () => {
    const { text, ranges } = stripUnderscoreEmphasis('I want to attempt a thing _like that_ and am frightened.')
    expect(text).toBe('I want to attempt a thing like that and am frightened.')
    expect(ranges).toHaveLength(1)
    expect(text.slice(...ranges[0])).toBe('like that')
  })

  it('keeps punctuation that sits inside the markers', () => {
    // Frankenstein: "_To Mrs. Saville, England._"
    const { text, ranges } = stripUnderscoreEmphasis('_To Mrs. Saville, England._')
    expect(text).toBe('To Mrs. Saville, England.')
    expect(text.slice(...ranges[0])).toBe('To Mrs. Saville, England.')
  })

  it('keeps punctuation that sits outside the markers', () => {
    const { text, ranges } = stripUnderscoreEmphasis('She said, "_like that_," and left.')
    expect(text).toBe('She said, "like that," and left.')
    expect(text.slice(...ranges[0])).toBe('like that')
  })

  it('leaves an unmatched single underscore untouched', () => {
    const input = 'The file is named report_final and nothing else.'
    const { text, ranges } = stripUnderscoreEmphasis(input)
    expect(text).toBe(input)
    expect(ranges).toEqual([])
  })

  it('leaves in-word underscores (snake_case) alone even with a second one nearby', () => {
    const input = 'Check the some_var_name identifier before shipping.'
    const { text, ranges } = stripUnderscoreEmphasis(input)
    expect(text).toBe(input)
    expect(ranges).toEqual([])
  })

  it('handles multiple separate pairs in one paragraph', () => {
    const input = 'It was _entirely_ his fault, and _completely_ avoidable.'
    const { text, ranges } = stripUnderscoreEmphasis(input)
    expect(text).toBe('It was entirely his fault, and completely avoidable.')
    expect(ranges).toHaveLength(2)
    expect(text.slice(...ranges[0])).toBe('entirely')
    expect(text.slice(...ranges[1])).toBe('completely')
  })

  it('handles a pair spanning the whole paragraph', () => {
    const input = '_This entire sentence is emphasized._'
    const { text, ranges } = stripUnderscoreEmphasis(input)
    expect(text).toBe('This entire sentence is emphasized.')
    expect(ranges).toEqual([[0, text.length]])
  })

  it('is a no-op when there is no underscore at all', () => {
    const input = 'Nothing special here.'
    expect(stripUnderscoreEmphasis(input)).toEqual({ text: input, ranges: [] })
  })
})

describe('tokenizeWithEmphasis', () => {
  it('flags only the tokens that fell inside a matched pair', () => {
    const tokens = tokenizeWithEmphasis('I want to attempt a thing _like that_ and am frightened.')
    expect(tokens.map(t => t.text)).toEqual([
      'I', 'want', 'to', 'attempt', 'a', 'thing', 'like', 'that', 'and', 'am', 'frightened.',
    ])
    expect(tokens.map(t => t.emphasis)).toEqual([
      false, false, false, false, false, false, true, true, false, false, false,
    ])
  })

  it('flags every token in a paragraph-spanning pair', () => {
    const tokens = tokenizeWithEmphasis('_This entire sentence is emphasized._')
    expect(tokens.map(t => t.text)).toEqual(['This', 'entire', 'sentence', 'is', 'emphasized.'])
    expect(tokens.every(t => t.emphasis)).toBe(true)
  })

  it('flags both separate pairs and nothing in between', () => {
    const tokens = tokenizeWithEmphasis('It was _entirely_ his fault, and _completely_ avoidable.')
    const byText = Object.fromEntries(tokens.map(t => [t.text, t.emphasis]))
    expect(byText['entirely']).toBe(true)
    expect(byText['completely']).toBe(true)
    expect(byText['his']).toBe(false)
    expect(byText['fault,']).toBe(false)
  })

  it('never flags snake_case tokens', () => {
    const tokens = tokenizeWithEmphasis('Check the some_var_name identifier.')
    expect(tokens.find(t => t.text === 'some_var_name')?.emphasis).toBe(false)
  })

  it.each([
    'I want to attempt a thing _like that_ and am frightened by these trifles.',
    '_To Mrs. Saville, England._',
    'It was _entirely_ his fault, and _completely_ avoidable, he said.',
    'The file is named report_final and nothing else.',
    'Check the some_var_name identifier before shipping.',
    'Plain text with no markup whatsoever.',
    '_This entire paragraph, start to finish, is emphasized._',
  ])('keeps token count and order identical to a plain whitespace split: %s', (paragraph) => {
    const raw = rawTokens(paragraph)
    const tokens = tokenizeWithEmphasis(paragraph)
    expect(tokens).toHaveLength(raw.length)
    // Order preserved: every emphasized token's underlying word matches the
    // corresponding raw token once markers are stripped, position for position.
    tokens.forEach((token, index) => {
      const strippedRaw = raw[index].replace(/^_+/, '').replace(/_+$/, '')
      // Only the edge delimiters differ; a non-emphasized token is untouched.
      if (token.emphasis || raw[index] !== token.text) {
        expect(token.text).toBe(strippedRaw === '' ? raw[index] : strippedRaw)
      } else {
        expect(token.text).toBe(raw[index])
      }
    })
  })
})
