// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarginFirstHint, marginStartCard } from './marginFirstHint'

afterEach(cleanup)

describe('the desktop margin’s chapter-start card', () => {
  it('outside free mode: the hint on a first visit, the start actions after', () => {
    expect(marginStartCard({ freeMode: false, firstVisit: true })).toBe('hint')
    expect(marginStartCard({ freeMode: false, firstVisit: false })).toBe('start')
  })

  it('the hint keeps its chapter Primer when one is offered', () => {
    const onPrimer = vi.fn()
    render(<MarginFirstHint chapterTitle="Letter 1" onPrimer={onPrimer} />)
    expect(screen.getByTestId('margin-first-hint').querySelector('.lab-first-hint-text')?.textContent).toBe('Highlight any passage to have it explained, simplified, or to ask about it.')
    expect(screen.getByTestId('margin-hint-primer').textContent).toBe('✧Primer for Letter 1')
    fireEvent.click(screen.getByTestId('margin-hint-primer'))
    expect(onPrimer).toHaveBeenCalledTimes(1)
  })
})
