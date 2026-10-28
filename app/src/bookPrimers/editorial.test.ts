import { expect, it } from 'vitest'
import { editorialPrimerPath, parseEditorialPrimer } from './editorial'
import type { PrimerIdentity } from './model'
const identity: PrimerIdentity = { scope: { kind: 'public' }, workId: 'book', editionId: 'original-en', sourceVersion: 'sha', unitId: null, type: 'book', language: 'en' }
const content = { opening: 'Human opening.', structure: [], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] }
const record = { identity, resources: [], primer: { identity, content, origin: 'manual', createdAt: '2026-10-28T00:00:00Z', promptVersion: 'editorial-1' } }
it('accepts persisted human copy without applying generated prompt-version invalidation', () => {
  expect(parseEditorialPrimer(record, identity, [])?.primer?.content).toEqual(content)
  expect(editorialPrimerPath(identity)).toBe('/data/book-primers/book/original-en/en/book.json')
})
it('rejects cross-source, private, generated, malformed resources and invented quotes', () => {
  for (const change of [{ sourceVersion: 'other' }, { language: 'da' }, { editionId: 'modern-en' }, { scope: { kind: 'private', ownerId: 'owner', uploadId: 'upload' } }]) {
    expect(parseEditorialPrimer(record, { ...identity, ...change } as PrimerIdentity, [])).toBeNull()
  }
  expect(editorialPrimerPath({ ...identity, scope: { kind: 'private', ownerId: 'o', uploadId: 'u' } })).toBeNull()
  expect(parseEditorialPrimer({ ...record, resources: [{}] }, identity, [])).toBeNull()
  expect(parseEditorialPrimer({ ...record, primer: { ...record.primer, origin: 'generated' } }, identity, [])).toBeNull()
  expect(parseEditorialPrimer({ ...record, primer: { ...record.primer, content: { ...content, structure: [{ title: 'A', explanation: 'B', quotes: [{ text: 'invented', passageId: 'chapter-1:paragraph-0' }] }] } } }, identity, [])).toBeNull()
})
