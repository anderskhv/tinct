// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabChapterEnd } from './LabChapterEnd'
import { LabChapterHeading } from './LabChapterHeading'
afterEach(cleanup)
it('offers only recap at the book end, with no automatic action or end heading', () => {
  const onContinue = vi.fn(), onDiscuss = vi.fn()
  render(<LabChapterEnd hasNext={false} onContinue={onContinue} onDiscuss={onDiscuss} />)
  expect(screen.queryByRole('heading')).toBeNull()
  expect(screen.getAllByRole('button')).toHaveLength(1)
  expect(onContinue).not.toHaveBeenCalled()
  expect(onDiscuss).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Recap this chapter' }))
  expect(onDiscuss).toHaveBeenCalledTimes(1)
})
it('keeps Next available while chat is busy and isolates controls from reader gestures', () => {
  const onContinue = vi.fn(), onDiscuss = vi.fn(), onReaderClick = vi.fn(), onReaderPointer = vi.fn()
  render(<div onClick={onReaderClick} onPointerDown={onReaderPointer}>
    <LabChapterEnd hasNext busy onContinue={onContinue} onDiscuss={onDiscuss} />
  </div>)
  const next = screen.getByRole('button', { name: 'Next chapter' })
  fireEvent.pointerDown(next); fireEvent.click(next)
  fireEvent.click(screen.getByRole('button', { name: 'Recap this chapter' }))
  expect(onContinue).toHaveBeenCalledTimes(1)
  expect(onReaderClick).not.toHaveBeenCalled()
  expect(onReaderPointer).not.toHaveBeenCalled()
  expect(onDiscuss).not.toHaveBeenCalled()
})
it('opens Preview only on an explicit click without triggering book gestures', () => {
  const onPreview = vi.fn(), onReader = vi.fn()
  render(<div onClick={onReader}><LabChapterHeading title="Chapter One" preview onPreview={onPreview} /></div>)
  expect(onPreview).not.toHaveBeenCalled()
  expect(screen.getByRole('heading').textContent).toBe('Chapter One')
  fireEvent.click(screen.getByRole('button', { name: 'Primer for Chapter One' }))
  expect(onPreview).toHaveBeenCalledTimes(1)
  expect(onReader).not.toHaveBeenCalled()
})
