import { describe, it, expect } from 'vitest'
import { tokenGroupCoverage, type GroupAlignment } from './tokenGroupCoverage'
import { mergeSidecarWords, followGranularity, wordIndexAtTime } from './labFollow'
const words = [
  { text: 'In', start: .05, end: .53 },
  { text: 'every', start: .53, end: .81 },
  { text: 'thing', start: .81, end: 1.09 },
  { text: '(circumstance)', start: 1.59, end: 1.97 },
]
const alignment: GroupAlignment = { expectedWords: 4, heardWords: 3, matchedWords: 2, matchRatio: .5,
  matchedWordIndexes: [0, 3], tokenGroups: [{ from: 1, to: 3, spokenText: 'everything,', start: .53, end: 1.09, boundaryMethod: 'duration-proportion-v1' }] }
describe('explicit spoken token groups', () => {
  it('preserves raw confidence while accepting exact supported display coverage', () => {
    expect(tokenGroupCoverage(alignment, words)).toBe(1)
    const [paragraph] = mergeSidecarWords([{index: 0, text: 'In every thing (circumstance)', file: 'p0.mp3'}], {chapter: 52, paragraphs: [{paragraph: 0, file: 'p0.mp3', words, alignment}]}, 52)
    expect(paragraph.alignment?.matchRatio).toBe(.5)
    expect(paragraph.alignment?.tokenGroupCoverage).toBe(1)
    expect(followGranularity(paragraph)).toBe('word')
    expect(wordIndexAtTime(paragraph.words!, .7)).toBe(1)
    expect(wordIndexAtTime(paragraph.words!, .9)).toBe(2)
  })
  it('does not promote unsupported, overlapping or invented groups', () => {
    const group = alignment.tokenGroups![0]
    for (const changed of [{spokenText: 'anything'}, {from: 0, to: 2}, {boundaryMethod: 'observed'}, {start: .1}, {spokenText: undefined}]) {
      expect(tokenGroupCoverage({...alignment, tokenGroups: [{...group, ...changed} as typeof group]}, words)).toBeUndefined()
    }
    expect(tokenGroupCoverage({...alignment, matchedWordIndexes: [0, 1]}, words)).toBeUndefined()
    expect(tokenGroupCoverage({...alignment, tokenGroups: [group, group]}, words)).toBeUndefined()
    expect(tokenGroupCoverage({...alignment, matchedWords: 3}, words)).toBeUndefined()
    expect(tokenGroupCoverage(alignment, words.map((w,i)=>i===2?{...w,text:'person'}:w))).toBeUndefined()
  })
  it('keeps ordinary weak paragraphs on sentence follow', () => {
    const [paragraph] = mergeSidecarWords([{index: 0, text: 'In every thing (circumstance)', file:'p0.mp3'}], {chapter:52,paragraphs:[{paragraph:0,file:'p0.mp3',words,alignment:{...alignment,tokenGroups:[]}}]},52)
    expect(followGranularity(paragraph)).toBe('sentence')
  })
})

const actualFixture = {"paragraph": 0, "file": "p0.mp3", "words": [{"text": "In", "start": 0.05, "end": 0.53}, {"text": "every", "start": 0.53, "end": 0.81}, {"text": "thing", "start": 0.81, "end": 1.09}, {"text": "(circumstance)", "start": 1.59, "end": 1.97}, {"text": "we", "start": 2.61, "end": 2.73}, {"text": "should", "start": 2.73, "end": 2.87}, {"text": "hold", "start": 2.87, "end": 3.09}, {"text": "these", "start": 3.09, "end": 3.33}, {"text": "maxims", "start": 3.33, "end": 3.87}, {"text": "ready", "start": 3.87, "end": 4.07}, {"text": "to", "start": 4.07, "end": 4.31}, {"text": "hand:", "start": 4.31, "end": 4.61}], "alignment": {"expectedWords": 12, "heardWords": 11, "matchedWords": 10, "matchRatio": 0.8333333333333334, "matchedWordIndexes": [0, 3, 4, 5, 6, 7, 8, 9, 10, 11], "tokenGroups": [{"from": 1, "to": 3, "spokenText": "everything,", "start": 0.53, "end": 1.09, "boundaryMethod": "duration-proportion-v1"}], "bias": "both"}}

it('accepts the actual twelve-word fixture without changing raw confidence', () => {
  expect(actualFixture.words).toHaveLength(12)
  expect(actualFixture.alignment.matchRatio).toBe(10 / 12)
  const [paragraph] = mergeSidecarWords([{index:0,text:actualFixture.words.map(w=>w.text).join(' '),file:'p0.mp3'}], {chapter:52,paragraphs:[actualFixture]},52)
  expect(paragraph.alignment?.matchRatio).toBe(10 / 12)
  expect(followGranularity(paragraph)).toBe('word')
  expect(wordIndexAtTime(paragraph.words!, .7)).toBe(1)
  expect(wordIndexAtTime(paragraph.words!, .9)).toBe(2)
})
it('rejects malformed groups and nonfinite timing without throwing', () => {
  expect(tokenGroupCoverage({...alignment,tokenGroups:[null] as never},words)).toBeUndefined()
  for (const value of [NaN, Infinity, -Infinity]) {
    expect(tokenGroupCoverage(alignment,words.map((w,i)=>i===1?{...w,start:value}:w))).toBeUndefined()
    expect(tokenGroupCoverage(alignment,words.map((w,i)=>i===2?{...w,end:value}:w))).toBeUndefined()
  }
})
