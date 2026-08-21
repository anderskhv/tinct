// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ParagraphRenderer } from './ParagraphRenderer'

describe('ParagraphRenderer word follow', () => {
  it('marks only the current word and does not add a paragraph-playing class', () => {
    const { container } = render(
      <ParagraphRenderer
        text="Tell me, O Muse."
        paragraphIndex={0}
        highlights={[]}
        playingWordIndex={2}
      />,
    )
    const current = container.querySelector('.audio-word-current')
    expect(current?.textContent).toBe('O')
    expect(current?.getAttribute('data-audio-word')).toBe('2')
    expect(container.querySelectorAll('.audio-word-current')).toHaveLength(1)
    expect(container.querySelector('.paragraph-playing')).toBeNull()
    expect(container.querySelector('.text-paragraph')?.className).not.toMatch(/paragraph-playing/)
  })

  it('does not wrap a word when playingWordIndex is omitted', () => {
    const { container } = render(
      <ParagraphRenderer
        text="Tell me, O Muse."
        paragraphIndex={0}
        highlights={[]}
      />,
    )
    expect(container.querySelector('.audio-word-current')).toBeNull()
    expect(screen.getByText('Tell me, O Muse.')).toBeTruthy()
  })
})
