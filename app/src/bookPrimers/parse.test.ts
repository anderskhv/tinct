import { expect, it } from 'vitest'
import { parseGeneratedPrimer } from './parse'
const response = { opening: 'An opening.', structure: [], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] }
it('rejects malformed JSON and missing structure without making up a primer', () => {
  expect(() => parseGeneratedPrimer('not JSON', [])).toThrow()
  expect(() => parseGeneratedPrimer('{"opening":"Only prose"}', [])).toThrow()
})
it('strips model-supplied provenance and unverified resources', () => {
  const parsed = parseGeneratedPrimer(JSON.stringify({ ...response, origin: 'approved', resources: [{ url: 'https://example.com' }] }), [])
  expect(parsed).toEqual(response)
})
it('requires a real exact-edition quotation', () => {
  const raw = JSON.stringify({ ...response, whatToNotice: [{ title: 'Notice', explanation: 'A distinction.', quotes: [{ text: 'Actual wording', passageId: 'p1' }] }] })
  expect(() => parseGeneratedPrimer(raw, [{ id: 'p1', text: 'Different wording' }])).toThrow('does not match')
  expect(parseGeneratedPrimer(raw, [{ id: 'p1', text: 'Actual wording from this edition.' }]).whatToNotice).toHaveLength(1)
})
