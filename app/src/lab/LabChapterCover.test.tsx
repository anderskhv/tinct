// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabChapterCover } from './LabChapterCover'
afterEach(cleanup)
it('shows a Bible book opening as a plain title page that turns with the keyboard', () => {
  const turn = vi.fn()
  render(<LabChapterCover title="Exodus" series="The Bible" editionLabel="King James Version" onPageTurn={turn} onToggleControls={vi.fn()} />)
  const cover = screen.getByTestId('lab-chapter-cover')
  expect(cover.querySelector('h2')?.textContent).toBe('Exodus')
  expect(cover.querySelector('img')).toBeNull()
  expect(cover.querySelectorAll('button')).toHaveLength(0)
  fireEvent.keyDown(cover, { key: 'ArrowRight' })
  fireEvent.keyDown(cover, { key: 'ArrowLeft' })
  expect(turn.mock.calls).toEqual([[1], [-1]])
})
// Phone: swipe up/down turns pages like left/right (Anders, 12 Nov 2026).
it('turns on a vertical swipe only on the phone page', () => {
  const turn = vi.fn()
  const swipe = (cover: Element, dy: number) => {
    fireEvent.pointerDown(cover, { pointerType: 'touch', clientX: 200, clientY: 400 })
    fireEvent.pointerUp(cover, { pointerType: 'touch', clientX: 202, clientY: 400 + dy })
  }
  const { unmount } = render(<LabChapterCover title="Exodus" series="The Bible" editionLabel="KJV" onPageTurn={turn} onToggleControls={vi.fn()} />)
  swipe(screen.getByTestId('lab-chapter-cover'), -100)
  expect(turn).not.toHaveBeenCalled()
  unmount()
  render(<LabChapterCover title="Exodus" series="The Bible" editionLabel="KJV" onPageTurn={turn} onToggleControls={vi.fn()} verticalSwipeTurns />)
  const cover = screen.getByTestId('lab-chapter-cover')
  expect(cover.classList.contains('has-vertical-swipe')).toBe(true)
  swipe(cover, -100)
  swipe(cover, 100)
  expect(turn.mock.calls).toEqual([[1], [-1]])
})
