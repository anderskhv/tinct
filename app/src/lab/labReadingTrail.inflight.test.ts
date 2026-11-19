import { afterEach, expect, it, vi } from 'vitest'

const shard = vi.hoisted(() => ({ release: null as null | (() => void), calls: 0 }))

vi.mock('../readingMemory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../readingMemory')>()
  return {
    ...actual,
    loadChapterText: vi.fn(() => {
      shard.calls++
      return new Promise(resolve => {
        shard.release = () => resolve({ paragraphs: ['Thus saith the LORD; Behold, waters rise up out of the north.'] })
      })
    }),
  }
})

import { loadTrailOpeningLine, resetLabTrailOpeningCache } from './labReadingTrail'

afterEach(() => { resetLabTrailOpeningCache(); shard.calls = 0; shard.release = null })

/**
 * The chat pane warms the trail when it opens; a question sent while that
 * shard read is still in flight joins it rather than loading the chapter again.
 */
it('joins an opening-line read already in flight, then serves it from the cache', async () => {
  const input = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 792 }
  const warm = loadTrailOpeningLine(input)
  const send = loadTrailOpeningLine(input)
  expect(shard.calls).toBe(1)
  shard.release?.()
  const expected = 'Thus saith the LORD; Behold, waters rise up out of the north.'
  await expect(warm).resolves.toBe(expected)
  await expect(send).resolves.toBe(expected)
  await expect(loadTrailOpeningLine(input)).resolves.toBe(expected)
  expect(shard.calls).toBe(1)
})
