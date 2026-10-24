// @vitest-environment jsdom
import { useEffect } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SourceMarginRail, sourceMarginLayout, sourceMarginLeaderPath, type SourceMarginEntry } from './SourceMarginRail'
afterEach(() => { cleanup(); vi.restoreAllMocks(); document.querySelectorAll('[data-fixture-host]').forEach(host => host.remove()) })
it('sorts by source order and pushes long answers down without constraining their height', () => {
  const layout = sourceMarginLayout([{ id: 'later', y: 140, height: 200, order: 2 }, { id: 'first', y: 100, height: 1800, order: 1 }])
  expect(layout.map(item => item.id)).toEqual(['first', 'later'])
  expect(layout[0]).toMatchObject({ top: 100, height: 1800 })
  expect(layout[1].top).toBe(1918)
})
it('portals a natural-height ordered layer into the source scroller and folds without unmounting its answer', async () => {
  const host = document.createElement('div'); host.dataset.fixtureHost = 'true'; document.body.append(host)
  Object.defineProperty(host, 'clientWidth', { value: 1400 }); Object.defineProperty(host, 'clientHeight', { value: 800 })
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 1400, top: 60, bottom: 860, width: 1400, height: 800 } as DOMRect)
  const column = document.createElement('div'); column.className = 'continuous-reader-window'; host.append(column)
  vi.spyOn(column, 'getBoundingClientRect').mockReturnValue({ right: 850 } as DOMRect)
  const mounted = vi.fn(), unmounted = vi.fn(), toggle = vi.fn(), remove = vi.fn()
  function Answer() { useEffect(() => { mounted(); return unmounted }, []); return <p>An answer at its source</p> }
  const entry: SourceMarginEntry = { id: 'a1', label: 'Explain', source: () => ({ left: 200, right: 400, top: 300, bottom: 320 }), order: 1, open: true, content: <Answer />, onToggle: toggle, onDelete: remove }
  const { rerender } = render(<SourceMarginRail host={host} entries={[entry]} />)
  expect(screen.getByTestId('source-margin-rail').parentElement).toBe(host)
  expect(Number.parseFloat(screen.getByTestId('source-margin-item').style.left)).toBe(868)
  expect(screen.getByTestId('source-margin-leaders').querySelector('path')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Minimise' })); expect(toggle).toHaveBeenCalledOnce()
  rerender(<SourceMarginRail host={host} entries={[{ ...entry, open: false }]} />)
  expect(mounted).toHaveBeenCalledOnce(); expect(unmounted).not.toHaveBeenCalled()
  expect(screen.getByTestId('source-margin-item').dataset.open).toBe('false')
  fireEvent.click(screen.getByTestId('source-margin-open')); expect(toggle).toHaveBeenCalledTimes(2)
  rerender(<SourceMarginRail host={host} entries={[entry]} />)
  fireEvent.keyDown(window, { key: 'Escape' }); expect(toggle).toHaveBeenCalledTimes(3); expect(remove).not.toHaveBeenCalled()
  host.scrollTop = 100
  // Viewport movement and scrolling cancel: the item retains its document coordinate.
  entry.source = () => ({ left: 200, right: 400, top: 200, bottom: 220 })
  await act(async () => { fireEvent.scroll(host); await new Promise(resolve => requestAnimationFrame(resolve)) })
  expect(Number.parseFloat(screen.getByTestId('source-margin-item').style.top)).toBe(240)
})

it('keeps stacked and offscreen leader height changes outside the reading column', () => {
  const columnRight=850, railLeft=columnRight+18
  for (const [sourceY,headerY] of [[-800,100],[300,2400],[2400,300]]) {
    const path=sourceMarginLeaderPath(343,sourceY,railLeft,headerY)
    expect(path).toBe(`M343 ${sourceY}H856V${headerY}H862`)
    // Its only vertical segment is six pixels beyond source column's right edge.
    expect(Number(path.match(/H([\d.]+)V/)?.[1])).toBeGreaterThan(columnRight)
    expect(path).not.toContain('L')
  }
})
