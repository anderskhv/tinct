import { expect, it } from 'vitest'
import { usablePrimerResource } from './resources'
const resource = { title: 'Lecture', creator: 'Lecturer', format: 'Video', url: 'https://example.com/lecture', relevance: 'Explains the opening argument.', spoilerNote: 'Before reading.', verifiedAt: '2026-10-28T00:00:00Z' }
it('requires complete verification metadata and a safe direct URL', () => {
  expect(usablePrimerResource(resource)).toBe(true)
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'https://example.com/search?q=book', 'https://youtube.com/results?search_query=book', 'https://user:pass@example.com/lecture']) expect(usablePrimerResource({ ...resource, url })).toBe(false)
  expect(usablePrimerResource({ ...resource, verifiedAt: '' })).toBe(false)
  expect(usablePrimerResource({ ...resource, spoilerNote: '' })).toBe(false)
})
