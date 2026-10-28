import { expect, it } from 'vitest'
import { acceptGeneratedPrimer, primerKey, quotesMatchSource, visiblePrimerSections, type PrimerIdentity, type PrimerContent, type SavedPrimer } from './model'
import { bookPrimerRequest } from './prompt'
const identity: PrimerIdentity = { scope: { kind: 'public' }, workId: 'work', editionId: 'edition', sourceVersion: 'v1', unitId: null, type: 'book', language: 'en' }
const content: PrimerContent = { opening: 'An opening.', structure: [], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] }
const saved = (origin: SavedPrimer['origin']): SavedPrimer => ({ identity, content, resources: [], origin, createdAt: '2026-10-27T23:00:00Z', promptVersion: '1' })
it('separates editions, source versions, units, languages and private owners', () => {
  const variants: PrimerIdentity[] = [identity, { ...identity, editionId: 'translation' }, { ...identity, sourceVersion: 'v2' },
    { ...identity, type: 'chapter', unitId: 'letter-1' }, { ...identity, language: 'fr' },
    { ...identity, scope: { kind: 'private', ownerId: 'a', uploadId: 'one' } },
    { ...identity, scope: { kind: 'private', ownerId: 'b', uploadId: 'one' } },
    { ...identity, scope: { kind: 'private', ownerId: 'a', uploadId: 'two' } }]
  expect(new Set(variants.map(primerKey)).size).toBe(variants.length)
})
it.each(['manual', 'approved', 'generated'] as const)('reuses saved %s content', origin => {
  const existing = saved(origin)
  expect(acceptGeneratedPrimer(existing, { ...saved('generated'), content: { ...content, opening: 'Replacement' } })).toBe(existing)
})
it('rejects cross-edition replacement', () => {
  expect(() => acceptGeneratedPrimer(saved('manual'), { ...saved('generated'), identity: { ...identity, editionId: 'different' } })).toThrow('identity mismatch')
})
it('rejects invented passage IDs or changed quotation wording', () => {
  const quoted = { ...content, whatToNotice: [{ title: 'Address', explanation: 'An opening address.', quotes: [{ text: 'You will rejoice', passageId: 'letter-1:p1' }] }] }
  expect(quotesMatchSource(quoted, [{ id: 'letter-1:p1', text: 'You will rejoice to hear' }])).toBe(true)
  expect(quotesMatchSource(quoted, [{ id: 'other-edition', text: 'You will rejoice to hear' }])).toBe(false)
  expect(quotesMatchSource(quoted, [{ id: 'letter-1:p1', text: 'You will be happy to hear' }])).toBe(false)
})
it('hides empty sections', () => { expect(visiblePrimerSections(content, 'book')).toEqual([]) })
it('uses the actual opening letter and refuses an invented chapter', () => {
  const source = { identity: { ...identity, type: 'chapter' as const, unitId: 'letter-1' }, title: 'Frankenstein', unitLabel: 'Letter 1', reliable: true, units: [{ id: 'letter-1', label: 'Letter 1' }], passages: [{ id: 'p1', unitId: 'letter-1', text: 'A source passage.' }, { id: 'p2', unitId: 'later-unit', text: 'A later discovery.' }] }
  expect(JSON.parse(bookPrimerRequest(source).data).unitLabel).toBe('Letter 1')
  expect(bookPrimerRequest(source).data).not.toContain('A later discovery.')
  expect(() => bookPrimerRequest({ ...source, identity: { ...source.identity, unitId: 'chapter-1' } })).toThrow('reliably')
  expect(() => bookPrimerRequest({ ...source, reliable: false })).toThrow('Reading remains available')
})
it('withholds future unit titles from chapter prompts while retaining the complete book map for book primers', () => {
  const source = { identity: { ...identity, type: 'chapter' as const, unitId: 'letter-2' }, title: 'Letters', unitLabel: 'Second letter', reliable: true,
    units: [{ id: 'letter-1', label: 'Arrival' }, { id: 'letter-2', label: 'Second letter' }, { id: 'letter-3', label: 'The death of the missing brother' }],
    passages: [{ id: 'p1', unitId: 'letter-2', text: 'The current letter.' }, { id: 'p2', unitId: 'letter-3', text: 'The later revelation.' }] }
  const chapter = JSON.parse(bookPrimerRequest(source).data)
  expect(chapter.units).toEqual(source.units.slice(0, 2))
  expect(chapter.passages).toEqual([source.passages[0]])
  expect(bookPrimerRequest(source).data).not.toContain('missing brother')
  expect(JSON.parse(bookPrimerRequest({ ...source, identity }).data).units).toEqual(source.units)
})
