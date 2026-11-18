import { describe, expect, it } from 'vitest'
import { endsListeningSentence, listeningSentenceStart, tokenizeHearingWords } from './labHearing'

const words = (text: string) => tokenizeHearingWords(text)

describe('listening sentence start', () => {
  it('rewinds to the first word of the sentence holding the resume word', () => {
    const paragraph = words('It was dark. The storm rose over the lake. We waited.')
    expect(listeningSentenceStart(paragraph, 6)).toBe(3) // "over" → "The"
    expect(listeningSentenceStart(paragraph, 3)).toBe(3) // already at a sentence start
    expect(listeningSentenceStart(paragraph, 10)).toBe(9)
  })

  it('never goes before the paragraph start', () => {
    const paragraph = words('The first sentence has no stop before it')
    expect(listeningSentenceStart(paragraph, 5)).toBe(0)
    expect(listeningSentenceStart(paragraph, 0)).toBe(0)
  })

  it('treats ! and ? and an ellipsis as sentence ends', () => {
    const paragraph = words('Stop! Who goes there? Nobody… Then silence fell.')
    expect(listeningSentenceStart(paragraph, 2)).toBe(1)
    expect(listeningSentenceStart(paragraph, 4)).toBe(4)
    expect(listeningSentenceStart(paragraph, 7)).toBe(5)
  })

  it('ends a sentence after closing quotes and brackets, straight or curly', () => {
    const paragraph = words('“I am alone.” She turned. "Come here!" he said. (It was late.) Then dawn.')
    expect(listeningSentenceStart(paragraph, 4)).toBe(3) // "She turned."
    expect(listeningSentenceStart(paragraph, 7)).toBe(5) // a lower-case dialogue tag continues the sentence
    expect(listeningSentenceStart(paragraph, 10)).toBe(9) // "(It was late.)"
    expect(listeningSentenceStart(paragraph, 13)).toBe(12)
  })

  it('does not stop at common abbreviations', () => {
    const paragraph = words('We met Mr. Walton and Dr. Frankenstein at St. Petersburg.')
    expect(listeningSentenceStart(paragraph, 8)).toBe(0)
    expect(endsListeningSentence('Mr.')).toBe(false)
    expect(endsListeningSentence('I.')).toBe(true)
    expect(endsListeningSentence('lake.’')).toBe(true)
    expect(endsListeningSentence('_end._')).toBe(true)
  })

  it('clamps an out-of-range word and tolerates an empty paragraph', () => {
    const paragraph = words('One. Two three.')
    expect(listeningSentenceStart(paragraph, 99)).toBe(1)
    expect(listeningSentenceStart([], 3)).toBe(0)
    expect(listeningSentenceStart(paragraph, Number.NaN)).toBe(0)
  })
})
