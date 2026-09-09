// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabChapterEnd } from './LabChapterEnd'
afterEach(cleanup)
it('offers only discussion at the book end, without automatic actions', () => {
  const onContinue = vi.fn(), onDiscuss = vi.fn(), onPrepare = vi.fn()
  render(<LabChapterEnd hasNext={false} busy={false} onContinue={onContinue} onDiscuss={onDiscuss} onPrepare={onPrepare} />)
  expect(screen.getByRole('heading', { name: 'End of chapter' })).toBeTruthy()
  expect(screen.getAllByRole('button')).toHaveLength(1)
  expect(onContinue).not.toHaveBeenCalled()
  expect(onDiscuss).not.toHaveBeenCalled()
  expect(onPrepare).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Discuss this chapter' }))
  expect(onDiscuss).toHaveBeenCalledTimes(1)
})
it('keeps Continue available while chat is busy and isolates it from reader gestures', () => {
  const onContinue = vi.fn(), onDiscuss = vi.fn(), onPrepare = vi.fn(), onReaderClick = vi.fn(), onReaderPointer = vi.fn()
  render(<div onClick={onReaderClick} onPointerDown={onReaderPointer}>
    <LabChapterEnd hasNext busy onContinue={onContinue} onDiscuss={onDiscuss} onPrepare={onPrepare} />
  </div>)
  const buttons = screen.getAllByRole('button')
  expect(buttons.map(b => b.textContent)).toEqual(['Continue to next chapter', 'Discuss this chapter', 'Prepare for the next chapter'])
  fireEvent.pointerDown(buttons[0]); fireEvent.click(buttons[0])
  fireEvent.click(buttons[1]); fireEvent.click(buttons[2])
  expect(onContinue).toHaveBeenCalledTimes(1)
  expect(onReaderClick).not.toHaveBeenCalled()
  expect(onReaderPointer).not.toHaveBeenCalled()
  expect(onDiscuss).not.toHaveBeenCalled()
  expect(onPrepare).not.toHaveBeenCalled()
})
