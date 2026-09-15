// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabChapterCover } from './LabChapterCover'
afterEach(cleanup)
it('keeps preparation first, Start reading second, and does not turn the cover page through either action', () => {
  const before = vi.fn(), start = vi.fn(), turn = vi.fn()
  render(<LabChapterCover title="The Odyssey" series="Homer" editionLabel="Original English" imageSrc="/cover.webp" onPageTurn={turn} onToggleControls={vi.fn()} onBefore={before} onStart={start} />)
  const actions = [...screen.getByTestId('lab-cover-entry').querySelectorAll('button')]
  expect(actions.map(action => action.querySelector('strong')?.textContent)).toEqual(['Before you begin', 'Start reading'])
  fireEvent.pointerDown(actions[0]); fireEvent.pointerUp(actions[0]); fireEvent.click(actions[0])
  expect(before).toHaveBeenCalledTimes(1)
  expect(turn).not.toHaveBeenCalled()
  fireEvent.click(actions[1])
  expect(start).toHaveBeenCalledTimes(1)
})
