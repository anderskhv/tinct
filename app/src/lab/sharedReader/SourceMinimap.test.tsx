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
