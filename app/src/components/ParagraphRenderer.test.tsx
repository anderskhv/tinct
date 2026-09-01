// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { applyProseKeepWithNext, ParagraphRenderer } from './ParagraphRenderer'

describe('ParagraphRenderer typography', () => {
  it('keeps short prose conjunctions with the following word without changing offsets', () => {
    const source = 'earth and heaven, but never fear'
    const displayed = applyProseKeepWithNext(source)
    expect(displayed).toBe('earth and\u00a0heaven, but\u00a0never fear')
    expect(displayed).toHaveLength(source.length)
  })

  it('preserves authored verse line breaks when there are no highlights', () => {
    const { container } = render(
      <ParagraphRenderer text={'1 In the beginning\n2 And then'} paragraphIndex={0} highlights={[]} isVerse />,
    )
    expect(container.querySelectorAll('br')).toHaveLength(1)
    expect(screen.getByText(/In the beginning/)).toBeTruthy()
  })
})
