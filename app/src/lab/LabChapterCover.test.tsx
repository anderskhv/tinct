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
