import { describe, expect, it } from 'vitest'
import { subtitleRepeatsBody } from './cardSubtitle'

describe('subtitleRepeatsBody', () => {
  it('hides a subtitle the body already says', () => {
    // To the Lighthouse, Mrs. McNab: "looks" matches "look"; 5 of 6 content words.
    expect(subtitleRepeatsBody('An old local woman who looks after the house', 'An old local woman, nearly seventy, who comes in to clean and look after the Ramsays’ summer house.')).toBe(true)
    // Bible, Sarai: "Abram’s" counts as "abram" (curly apostrophe, possessive).
    expect(subtitleRepeatsBody('Wife of Abram', 'Sarai is Abram’s wife, barren into old age, who gives her servant Hagar to Abram so that he might have an heir through her instead.')).toBe(true)
  })
  it('keeps a subtitle that adds facts', () => {
    expect(subtitleRepeatsBody('Called out of Ur', 'Abram is called by God to leave his country for a land he will be shown, with the promise that he will become a great nation.')).toBe(false)
    expect(subtitleRepeatsBody('Second son of Adam and Eve', 'Abel is a keeper of sheep whose offering of the firstlings of his flock God accepts.')).toBe(false)
  })
  it('keeps a subtitle with no content words, and an empty one is not redundant', () => {
    expect(subtitleRepeatsBody('Of the', 'Of the house.')).toBe(false)
    expect(subtitleRepeatsBody('', 'Anything.')).toBe(false)
  })
  it('hides at exactly 70% and keeps just below it', () => {
    const body = 'alpha beta gamma delta epsilon zeta eta'
    expect(subtitleRepeatsBody('alpha beta gamma delta epsilon zeta eta theta iota kappa', body)).toBe(true)
    expect(subtitleRepeatsBody('alpha beta gamma delta epsilon zeta theta iota kappa lambda', body)).toBe(false)
  })
})
