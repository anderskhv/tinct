import { describe, expect, it } from 'vitest'
import { labHighlightCssClass } from './labHighlights'

describe('lab highlight colours', () => {
  it('maps every stored colour to a distinct painted class', () => {
    expect(labHighlightCssClass('gold', false)).toContain('is-hl-warm')
    expect(labHighlightCssClass('rose', false)).toContain('is-hl-rose')
    expect(labHighlightCssClass('sage', false)).toContain('is-hl-sage')
    expect(labHighlightCssClass('sky', false)).toContain('is-hl-sky')
    expect(labHighlightCssClass('lavender', false)).toContain('is-hl-lavender')
  })
})
