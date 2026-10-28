// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { fetchChapterNotes } from '../lab/labChapterNotes'
it('preserves verified server resources and editorial origin through the shared client', async () => {
  const resource = { title: 'Essay', creator: 'Author', format: 'Essay', url: 'https://example.org/essay', relevance: 'Context.', spoilerNote: 'Spoilers.', verifiedAt: '2026-10-28T00:00:00Z' }
  const request = { bookId: 'book', editionKey: 'original-en', chapterNumber: 1, kind: 'primer' as const, format: 'structured-primer' as const, primerType: 'book' as const }
  const result = await fetchChapterNotes(request, { fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ primer: {
    identity: { scope: { kind: 'public' }, workId: 'book', editionId: 'original-en', sourceVersion: 'sha', unitId: null, type: 'book', language: 'en' },
    origin: 'manual', createdAt: '2026-10-28T00:00:00Z', promptVersion: 'editorial-1', resources: [resource, { ...resource, url: 'javascript:alert(1)' }],
    content: { opening: 'Human opening.', structure: [], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] },
  } }) }) })
  expect(result).toMatchObject({ ok: true, primer: { origin: 'manual', resources: [resource] } })
})
