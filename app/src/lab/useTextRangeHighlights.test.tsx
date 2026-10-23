// @vitest-environment jsdom
import { useRef } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { generatedHyphenRects, highlightRows, highlightSeams, useTextRangeHighlights } from './useTextRangeHighlights'
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

it('does not remeasure unchanged ranges on popup renders, but repaints changed marks and reflow', () => {
  const registry = new Map<string, { ranges: Range[] }>()
  vi.stubGlobal('CSS', { highlights: registry })
  vi.stubGlobal('Highlight', class { ranges: Range[]; constructor(...ranges: Range[]) { this.ranges = ranges } })
  const originalRects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects')
  const measure = vi.fn(() => [{ left: 0, right: 35, top: 0, bottom: 24, height: 24 }] as unknown as DOMRectList)
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: measure })
  try {
    function Painted({ popup, marked, layout }: { popup: boolean; marked: boolean; layout: string }) {
      const ref = useRef<HTMLElement>(null)
      useTextRangeHighlights(ref, layout)
      return <article ref={ref} data-popup={popup}><p className="lab-hearing-line"><span data-testid="lab-word" data-paragraph-index="0" data-word-index="0" className="is-hl-sage">word</span><span data-testid="lab-word" data-paragraph-index="0" data-word-index="1" className={marked ? 'is-hl-sage' : ''}> next</span></p></article>
    }
    const view = render(<Painted popup={false} marked={false} layout="font-1" />)
    expect(measure).toHaveBeenCalled()
    const firstPaint = measure.mock.calls.length
    view.rerender(<Painted popup marked={false} layout="font-1" />)
    expect(measure).toHaveBeenCalledTimes(firstPaint)
    view.rerender(<Painted popup marked layout="font-1" />)
    expect(measure.mock.calls.length).toBeGreaterThan(firstPaint)
    const changedMarkPaint = measure.mock.calls.length
    view.rerender(<Painted popup marked layout="font-2" />)
    expect(measure.mock.calls.length).toBeGreaterThan(changedMarkPaint)
  } finally {
    if (originalRects) Object.defineProperty(Range.prototype, 'getClientRects', originalRects)
    else Reflect.deleteProperty(Range.prototype, 'getClientRects')
  }
})

it('skips the text-node scan when only reader chrome rerenders a passage', () => {
  vi.stubGlobal('CSS', { highlights: new Map() })
  vi.stubGlobal('Highlight', class { constructor(..._ranges: Range[]) {} })
  const source = ['a marked word']
  function Painted({ popup, selection }: { popup: boolean; selection: number }) {
    const ref = useRef<HTMLElement>(null)
    useTextRangeHighlights(ref, 'layout-1', [source, selection])
    return <article ref={ref} data-popup={popup}><p className="lab-hearing-line"><span data-testid="lab-word" data-paragraph-index="0" data-word-index="0" className="is-hl-sage">a</span></p></article>
  }
  const view = render(<Painted popup={false} selection={0} />)
  const article = view.container.querySelector('article')!
  const scan = vi.spyOn(article, 'querySelectorAll')
  view.rerender(<Painted popup selection={0} />)
  expect(scan).not.toHaveBeenCalled()
  view.rerender(<Painted popup selection={1} />)
  expect(scan).toHaveBeenCalled()
})

it('paints only the looked-up lexeme inside an unchanged audio token', () => {
  const registry = new Map<string, { ranges: Range[] }>()
  vi.stubGlobal('CSS', { highlights: registry })
  vi.stubGlobal('Highlight', class { ranges: Range[]; constructor(...ranges: Range[]) { this.ranges = ranges } })
  function Lookup({word}: {word:string}) {
    const ref=useRef<HTMLElement>(null)
    useTextRangeHighlights(ref)
    return <article ref={ref}><p className="lab-hearing-line"><span data-testid="lab-word" className="is-selecting" data-selection-word={word}>Sherebiah—a</span></p></article>
  }
  const view=render(<Lookup word="Sherebiah" />)
  expect([...registry.values()].flatMap(h=>h.ranges).map(r=>r.toString())).toEqual(['Sherebiah'])
  view.rerender(<Lookup word="a" />)
  expect([...registry.values()].flatMap(h=>h.ranges).map(r=>r.toString())).toEqual(['a'])
  expect(view.container.textContent).toBe('Sherebiah—a')
})

it('paints the generated hyphen of a highlighted page-edge fragment or planned break, not of a word outside the range', () => {
  // Owner report (8 Oct 2026): a highlight running over a page break stopped
  // just before the "-" of "ratio-": the hyphen is ::after content, outside
  // any Range's rects. The covered elements' own boxes include it.
  document.body.innerHTML = '<p class="lab-hearing-line"><span id="a" class="is-hl-sage">the</span> <span id="b" class="is-hl-sage"><span class="lab-syl">ra</span>tio</span> <span id="f" class="lab-word-fragment is-hl-sage">ratio</span> <span id="c"><span class="lab-syl">out</span>side</span></p>'
  const boxes = new Map<Element, DOMRect[]>()
  for (const el of document.querySelectorAll('.lab-syl, .lab-word-fragment')) {
    const rect = { left: 1, right: 2, top: 0, bottom: 30, width: 1, height: 30, x: 1, y: 0, toJSON: () => ({}) } as DOMRect
    boxes.set(el, [rect])
    ;(el as HTMLElement).getClientRects = () => boxes.get(el) as unknown as DOMRectList
  }
  const line = document.querySelector('.lab-hearing-line')!
  const range = document.createRange()
  range.setStart(document.getElementById('a')!, 0)
  const fragment = document.getElementById('f')!
  range.setEnd(fragment, fragment.childNodes.length)
  const rects = generatedHyphenRects(line, range)
  const covered = [document.querySelector('#b .lab-syl')!, fragment].flatMap(el => boxes.get(el)!)
  expect(rects).toEqual(covered)
  expect(rects).not.toContain(boxes.get(document.querySelector('#c .lab-syl')!)![0])
  document.body.innerHTML = ''
})
