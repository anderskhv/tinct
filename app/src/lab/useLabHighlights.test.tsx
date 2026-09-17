// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabHighlights } from './useLabHighlights'
import { readLabHighlights } from './labHighlights'
afterEach(() => { cleanup(); localStorage.clear() })
it('records book and edition, never reuses another book’s identical word range', () => {
  const range = { paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 3, text: 'a saved passage' }
  const { result, rerender } = renderHook(({ bookId }) => useLabHighlights(1, { bookId, editionKey: 'original-en' }), { initialProps: { bookId: 'odyssey' } })
  act(() => { result.current.addOrReuse(range) })
  const first = result.current.highlights[0]
  expect(first.bookId).toBe('odyssey')
  rerender({ bookId: 'romeo-and-juliet' })
  expect(result.current.chapterHighlights).toHaveLength(0)
  act(() => { result.current.addOrReuse(range) })
  expect(result.current.highlights[0].bookId).toBe('romeo-and-juliet')
  expect(result.current.highlights[0].id).not.toBe(first.id)
  expect(readLabHighlights()).toHaveLength(2)
})
it('preserves unknown older marks without fabricating a source', () => {
  const older = { id: 'older', chapterNumber: 44, paragraphIndex: 0, endParagraphIndex: 0, fromWord: 0, toWord: 3, color: 'gold', note: 'My note' }
  localStorage.setItem('tinct-lab-highlights', JSON.stringify([older]))
  const { result } = renderHook(() => useLabHighlights(44, { bookId: 'bible', editionKey: 'kjv-en' }))
  expect(result.current.highlights).toHaveLength(0)
  expect(result.current.unassignedHighlights).toEqual([older])
  expect(readLabHighlights()).toEqual([older])
})

it('projects a saved secondary edition even when Compare has not loaded its text', async () => {
 const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: 'Matthew 10', paragraphs: ['¹ He saith thus. ² Other.'] }) })
 vi.stubGlobal('fetch', fetcher)
 localStorage.setItem('tinct-lab-highlights', JSON.stringify([{ id: 'kjv', bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 939, paragraphIndex: 0, fromWord: 1, endParagraphIndex: 0, toWord: 4, color: 'gold' }]))
 const { result } = renderHook(() => useLabHighlights(939, { bookId: 'bible', editionKey: 'web-en', paragraphs: ['¹ He says these words. ² Other.'], compareEditionKey: 'kjv-en', compareParagraphs: [] }))
 await waitFor(() => expect(result.current.chapterHighlights).toHaveLength(1))
 expect(result.current.chapterHighlights[0]).toMatchObject({ id: 'kjv', fromWord: 0, toWord: 5 })
 expect(readLabHighlights()[0].fromWord).toBe(1)
 vi.unstubAllGlobals()
})
