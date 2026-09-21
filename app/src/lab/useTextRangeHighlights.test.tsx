// @vitest-environment jsdom
import { useRef } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { highlightSeams, useTextRangeHighlights } from './useTextRangeHighlights'
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
function Passage() {
  const ref = useRef<HTMLElement>(null)
  useTextRangeHighlights(ref)
  return <article ref={ref}><p className="lab-hearing-line"><span data-testid="lab-word">before</span>{' '}<span data-testid="lab-word" className="is-selecting">If</span>{' '}<span data-testid="lab-word" className="is-selecting">I</span>{' '}<span data-testid="lab-word">after</span></p></article>
}
it('paints one range including internal spaces but excluding outside spaces and cleans up only its own ranges', () => {
  const registry = new Map<string, { ranges: Range[] }>()
  vi.stubGlobal('CSS', { highlights: registry })
  // The browser constructor is variadic.
  vi.stubGlobal('Highlight', class { ranges: Range[]; constructor(...ranges: Range[]) { this.ranges = ranges } })
  const first = render(<Passage />)
  const range = [...registry.values()].flatMap(h => h.ranges)
  expect(range).toHaveLength(1)
  expect(range[0].toString()).toBe('If I')
  expect(first.container.textContent).toBe('before If I after')
  const second = render(<Passage />)
  expect(registry.size).toBe(10)
  first.unmount()
  expect(registry.size).toBe(5)
  second.unmount()
  expect(registry.size).toBe(0)
})

it('bridges fractional row cracks only where both rows are highlighted', () => {
 const rect=(left:number,right:number,top:number,bottom:number)=>({left,right,top,bottom,height:bottom-top})
 expect(highlightSeams([rect(0,200,0,33),rect(0,100,33.4,66.4)],22,.5)).toEqual([{left:0,top:32.5,width:100,height:1.5}])
 expect(highlightSeams([rect(0,200,0,33),rect(0,100,38,71)],22)).toEqual([])
 expect(highlightSeams([rect(100,200,0,33),rect(0,90,33.4,66.4)],22)).toEqual([])
 // Raised verse glyphs must not become extra rows or grow the band.
 expect(highlightSeams([rect(0,200,0,33),rect(0,10,28,41),rect(0,100,33.4,66.4)],22,.5)).toHaveLength(1)
})
