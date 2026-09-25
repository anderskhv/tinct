// @vitest-environment jsdom
import { useRef } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { highlightRows, highlightSeams, useTextRangeHighlights } from './useTextRangeHighlights'
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

it('uses full row bounds for background paint without including raised verse glyphs', () => {
 const rect=(left:number,right:number,top:number,bottom:number)=>({left,right,top,bottom,height:bottom-top})
 expect(highlightRows([rect(15,90,0,33),rect(90,140,0,33),rect(0,12,-8,10),rect(0,60,33.4,66.4)],22)).toEqual([
  {left:15,right:140,top:0,bottom:33},{left:0,right:60,top:33.4,bottom:66.4}
 ])
})

it('joins a split word fragment to the same painted range and includes its preceding space', () => {
  const registry = new Map<string, { ranges: Range[] }>()
  vi.stubGlobal('CSS', { highlights: registry })
  vi.stubGlobal('Highlight', class { ranges: Range[]; constructor(...ranges: Range[]) { this.ranges = ranges } })
  function SplitPassage() {
    const ref = useRef<HTMLElement>(null)
    useTextRangeHighlights(ref)
    return <article ref={ref}><p className="lab-hearing-line"><span data-testid="lab-word" className="is-hl-sage">you,</span>{' '}<span data-fragment-word="1" className="lab-word-fragment is-hl-sage" aria-hidden="true">inas</span></p></article>
  }
  render(<SplitPassage />)
  const ranges = [...registry.values()].flatMap(h => h.ranges)
  expect(ranges).toHaveLength(1)
  expect(ranges[0].toString()).toBe('you, inas')
})

it('installs its stylesheet once and keeps its class when React rewrites the passage classes', () => {
  const registry = new Map<string, { ranges: Range[] }>()
  vi.stubGlobal('CSS', { highlights: registry })
  const made: number[] = []
  vi.stubGlobal('Highlight', class { ranges: Range[]; constructor(...ranges: Range[]) { this.ranges = ranges; made.push(ranges.length) } })
  function Spoken({ current }: { current: number }) {
    const ref = useRef<HTMLElement>(null)
    useTextRangeHighlights(ref)
    return <article ref={ref} className={`lab-passage word-${current}`}><p className="lab-hearing-line">
      {['one', 'two', 'three'].map((word, index) => <span key={word} data-testid="lab-word" data-paragraph-index={0} data-word-index={index}
        className={[index === current ? 'is-current' : '', index === 2 ? 'is-hl-sky' : ''].filter(Boolean).join(' ')}>{word} </span>)}
    </p></article>
  }
  const styles = () => document.head.querySelectorAll('style').length
  const view = render(<Spoken current={0} />)
  const installed = styles()
  const builds = made.length
  const article = view.container.querySelector('article')!
  expect(article.classList.contains('has-text-range-highlights')).toBe(true)
  // The spoken word moves: the passage's className changes, the highlight does not.
  view.rerender(<Spoken current={1} />)
  view.rerender(<Spoken current={2} />)
  expect(styles()).toBe(installed)
  expect(made.length).toBe(builds)
  expect(article.classList.contains('has-text-range-highlights')).toBe(true)
  view.unmount()
  expect(registry.size).toBe(0)
})
