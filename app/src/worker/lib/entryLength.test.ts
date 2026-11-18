import { describe, expect, it } from 'vitest'
import { describeEntryLimit, entryFits, entrySentences, entryWordCount, trimEntryToLimit } from './entryLength'

const block = { sentences: 2, words: 45 }
const chapter = { sentences: 1, words: 25 }

describe('entry length', () => {
  it('counts words and sentences, without splitting at abbreviations or initials', () => {
    expect(entryWordCount('  Judas gathers about six thousand men — and wins. ')).toBe(8)
    expect(entrySentences('Mr. Darcy calls at St. Petersburg. J. Smith waits. "Go!" she says.')).toEqual(['Mr. Darcy calls at St. Petersburg.', 'J. Smith waits.', '"Go!" she says.'])
    expect(entrySentences('Antiochus invades Egypt. 2 Maccabees then turns to Jerusalem')).toHaveLength(2)
    expect(entrySentences('no end punctuation')).toEqual(['no end punctuation'])
    expect(entrySentences('   ')).toEqual([])
  })

  it('fits only within both the sentence and the word limit', () => {
    expect(entryFits('Jason buys the high priesthood. Antiochus invades Egypt.', block)).toBe(true)
    expect(entryFits('Jason buys the high priesthood. Antiochus invades Egypt.', chapter)).toBe(false)
    expect(entryFits('One. Two. Three.', block)).toBe(false)
    expect(entryFits(Array(46).fill('word').join(' ') + '.', block)).toBe(false)
  })

  it('trims to whole sentences, never inside one, and keeps at least the first', () => {
    const text = 'Jason buys the high priesthood. Antiochus invades Egypt and plunders the temple. Eleazar dies rather than eat pork.'
    expect(trimEntryToLimit(text, block)).toBe('Jason buys the high priesthood. Antiochus invades Egypt and plunders the temple.')
    expect(trimEntryToLimit(text, chapter)).toBe('Jason buys the high priesthood.')
    // A second sentence that would pass the word limit is left out.
    const long = `Judas gathers six thousand men. Then ${Array(43).fill('word').join(' ')}.`
    expect(trimEntryToLimit(long, block)).toBe('Judas gathers six thousand men.')
    // A first sentence over the word limit on its own is kept whole.
    const one = `${Array(30).fill('word').join(' ')}. Next sentence.`
    expect(trimEntryToLimit(one, chapter)).toBe(`${Array(30).fill('word').join(' ')}.`)
  })

  it('describes the limit for the prompt', () => {
    expect(describeEntryLimit(chapter)).toBe('one sentence of at most 25 words')
    expect(describeEntryLimit(block)).toBe('at most two sentences and 45 words in all')
  })
})
