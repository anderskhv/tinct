// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { buildRangeSelectionSegments, buildSelectionSegments, getDomPointForOffset, getOffsetWithinParagraph, pointCompare } from './selectionGeometry'

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

describe('buildSelectionSegments', () => {
  const texts = ['zero', 'one paragraph', 'two']
  const getText = (i: number) => texts[i] ?? ''

  it('slices a single paragraph between offsets', () => {
    const segs = buildSelectionSegments({ paragraphIndex: 1, offset: 0 }, { paragraphIndex: 1, offset: 3 }, getText)
    expect(segs).toEqual([{ paragraphIndex: 1, startOffset: 0, endOffset: 3, text: 'one' }])
  })

  it('normalizes reversed anchor/focus (focus before anchor)', () => {
    const segs = buildSelectionSegments({ paragraphIndex: 1, offset: 3 }, { paragraphIndex: 1, offset: 0 }, getText)
    expect(segs[0].text).toBe('one')
  })

  it('spans multiple paragraphs, slicing the ends and including the middle whole', () => {
    const segs = buildSelectionSegments({ paragraphIndex: 0, offset: 2 }, { paragraphIndex: 2, offset: 3 }, getText)
    expect(segs.map(s => s.paragraphIndex)).toEqual([0, 1, 2])
    expect(segs[0].text).toBe('ro')              // 'zero'.slice(2)
    expect(segs[1].text).toBe('one paragraph')   // full middle paragraph
    expect(segs[2].text).toBe('two')             // 'two'.slice(0, 3)
  })
})

describe('buildRangeSelectionSegments', () => {
  it('extracts the selected slice of a single paragraph from a DOM Range', () => {
    const content = document.createElement('div')
    const p = document.createElement('p')
    p.setAttribute('data-paragraph-index', '0')
    p.textContent = 'Hello world'
    content.appendChild(p)
    document.body.appendChild(content)
    const range = document.createRange()
    range.setStart(p.firstChild!, 0)
    range.setEnd(p.firstChild!, 5)
    const segs = buildRangeSelectionSegments(content, range, () => 'Hello world')
    expect(segs).toEqual([{ paragraphIndex: 0, startOffset: 0, endOffset: 5, text: 'Hello' }])
    document.body.removeChild(content)
  })
})
