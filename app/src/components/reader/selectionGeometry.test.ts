// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { getDomPointForOffset, getOffsetWithinParagraph, pointCompare } from './selectionGeometry'

function paragraph(html: string): HTMLElement {
  const el = document.createElement('p')
  el.setAttribute('data-paragraph-index', '0')
  el.innerHTML = html
  return el
}

describe('getDomPointForOffset', () => {
  it('maps an absolute offset to a DOM node + local offset (single text node)', () => {
    const el = paragraph('Hello world')
    const point = getDomPointForOffset(el, 6)
    expect(point?.node.textContent).toBe('Hello world')
    expect(point?.offset).toBe(6)
  })

  it('crosses into the correct text node when there are multiple', () => {
    const el = paragraph('Hello <em>brave</em> world') // "Hello " (6) + "brave" (5) + " world"
    const point = getDomPointForOffset(el, 8) // 2 chars into "brave"
    expect(point?.node.textContent).toBe('brave')
    expect(point?.offset).toBe(2)
  })

  it('returns null when the offset is past the end', () => {
    const el = paragraph('Hi')
    expect(getDomPointForOffset(el, 999)).toBeNull()
  })
})

describe('getOffsetWithinParagraph', () => {
  it('is the inverse of getDomPointForOffset', () => {
    const el = paragraph('Hello <em>brave</em> world')
    const dom = getDomPointForOffset(el, 8)!
    const back = getOffsetWithinParagraph(el, dom.node, dom.offset)
    expect(back).toBe(8)
  })

  it('returns null when the node is not within the paragraph', () => {
    const el = paragraph('Hello')
    const orphan = document.createTextNode('elsewhere')
    expect(getOffsetWithinParagraph(el, orphan, 1)).toBeNull()
  })
})

describe('pointCompare', () => {
  it('orders by paragraph first, then offset', () => {
    expect(pointCompare({ paragraphIndex: 1, offset: 0 }, { paragraphIndex: 2, offset: 0 })).toBeLessThan(0)
    expect(pointCompare({ paragraphIndex: 2, offset: 5 }, { paragraphIndex: 2, offset: 2 })).toBeGreaterThan(0)
    expect(pointCompare({ paragraphIndex: 3, offset: 4 }, { paragraphIndex: 3, offset: 4 })).toBe(0)
  })
})
