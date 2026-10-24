// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SourceMinimap } from './SourceMinimap'
afterEach(cleanup)
it('navigates real source paragraphs by keyboard without inventing pages', () => {
  const jump = vi.fn()
  render(<SourceMinimap paragraphs={['one two', 'three four five', 'six']} visible={{ paragraphIndex: 1, wordIndex: 0 }} onJump={jump} />)
  const map = screen.getByRole('slider', { name: 'Chapter position' })
  expect(map.getAttribute('aria-valuenow')).toBe('33')
  fireEvent.keyDown(map, { key: 'ArrowDown' })
  expect(jump).toHaveBeenLastCalledWith({ paragraphIndex: 2, wordIndex: 0 })
  fireEvent.keyDown(map, { key: 'Home' })
  expect(jump).toHaveBeenLastCalledWith({ paragraphIndex: 0, wordIndex: 0 })
})
it('maps a click in a long paragraph to an exact word rather than a fake page', () => {
  const jump = vi.fn()
  render(<SourceMinimap paragraphs={['one two three four five six seven eight']} visible={{ paragraphIndex: 0, wordIndex: 0 }} onJump={jump} />)
  const map = screen.getByRole('slider')
  vi.spyOn(map, 'getBoundingClientRect').mockReturnValue({ top: 100, height: 600 } as DOMRect)
  fireEvent.pointerDown(map, { clientY: 400, pointerId: 1 })
  expect(jump).toHaveBeenLastCalledWith({ paragraphIndex: 0, wordIndex: 4 })
})
it('represents the whole book and routes other chapters through chapter navigation', () => {
  const jump = vi.fn(), chapter = vi.fn()
  render(<SourceMinimap paragraphs={['one two', 'three four']} visible={{ paragraphIndex: 0, wordIndex: 0 }} onJump={jump}
    bookMap={{ chapterNumber: 2, chapters: [{ number: 1, title: 'First', wordCount: 4 }, { number: 2, title: 'Second', wordCount: 4 }, { number: 3, title: 'Third', wordCount: 4 }], onJumpChapter: chapter,
      marks: [{ id: 'saved', chapterNumber: 3, paragraphIndex: 0 }] }} />)
  const map = screen.getByRole('slider', { name: 'Book position' })
  expect(map.getAttribute('aria-valuenow')).toBe('33')
  expect(map.querySelector('[data-map-saved="saved"]')?.getAttribute('cy')).toBe('400')
  fireEvent.keyDown(map, { key: 'Home' })
  expect(chapter).toHaveBeenLastCalledWith(1)
  fireEvent.keyDown(map, { key: 'End' })
  expect(chapter).toHaveBeenLastCalledWith(3)
  vi.spyOn(map, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 600 } as DOMRect)
  fireEvent.pointerDown(map, { clientY: 500, pointerId: 1 })
  expect(chapter).toHaveBeenLastCalledWith(3)
  expect(jump).not.toHaveBeenCalled()
  fireEvent.pointerDown(map.querySelector('[data-map-saved="saved"]')!, { clientY: 400, pointerId: 1 })
  expect(chapter).toHaveBeenLastCalledWith(3, { paragraphIndex: 0, wordIndex: 0 })
  fireEvent.pointerDown(map, { clientY: 300, pointerId: 1 })
  expect(jump).toHaveBeenLastCalledWith({ paragraphIndex: 1, wordIndex: 0 })
})
