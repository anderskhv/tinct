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
    const path=sourceMarginLeaderPath(columnRight,sourceY,railLeft,headerY)
    expect(path).toBe(`M850 ${sourceY}H856V${headerY}H862`)
    // Its only vertical segment is six pixels beyond source column's right edge.
    expect(Number(path.match(/H([\d.]+)V/)?.[1])).toBeGreaterThan(columnRight)
    expect(path).not.toContain('L')
    const xs = [Number(path.match(/^M([\d.]+)/)?.[1]), ...[...path.matchAll(/H([\d.]+)/g)].map(match => Number(match[1]))]
    expect(xs.every(x => x >= columnRight)).toBe(true)
  }
})

it('collapses on Escape from a focused editor and outside clicks, preserving inner actions and nested overlays', () => {
  const host = document.createElement('div'); host.dataset.fixtureHost = 'true'; document.body.append(host)
  const toggle = vi.fn(), editorKey = vi.fn(), inner = vi.fn()
  const entry: SourceMarginEntry = { id: 'long-note', label: 'Note', source: () => ({ left: 10, right: 100, top: 100, bottom: 120 }), order: 1, open: true, content: <><textarea aria-label="Draft" defaultValue="Unsent words" onKeyDown={event => { editorKey(); event.preventDefault(); event.stopPropagation() }} /><button onPointerDown={inner}>Inside action</button></>, onToggle: toggle }
  render(<SourceMarginRail host={host} entries={[entry]} />)
  const editor = screen.getByRole('textbox', { name: 'Draft' })
  fireEvent.keyDown(editor, { key: 'Escape' })
  expect(toggle).toHaveBeenCalledOnce(); expect(editorKey).not.toHaveBeenCalled()
  expect((editor as HTMLTextAreaElement).value).toBe('Unsent words')
  fireEvent.pointerDown(screen.getByText('Inside action'))
  expect(toggle).toHaveBeenCalledOnce(); expect(inner).toHaveBeenCalledOnce()
  fireEvent.pointerDown(document.body)
  expect(toggle).toHaveBeenCalledTimes(2)
  fireEvent.keyDown(editor, { key: 'Escape', isComposing: true })
  expect(toggle).toHaveBeenCalledTimes(2)
  const dialog = document.createElement('div'); dialog.setAttribute('aria-modal', 'true'); document.body.append(dialog)
  fireEvent.keyDown(dialog, { key: 'Escape' }); fireEvent.pointerDown(dialog)
  expect(toggle).toHaveBeenCalledTimes(2)
  dialog.remove()
})

it('leaves source and minimap gestures to their existing handlers without an extra collapse', () => {
  const host = document.createElement('div'); host.dataset.fixtureHost = 'true'; document.body.append(host)
  const toggle = vi.fn(), sourceGesture = vi.fn()
  const entry: SourceMarginEntry = { id: 'card-a', label: 'Explain', source: () => ({ left: 10, right: 100, top: 100, bottom: 120 }), order: 1, open: true, content: <p>Answer</p>, onToggle: toggle }
  const source = document.createElement('span'); source.dataset.sourceCardId = 'card-a'; host.append(source)
  source.addEventListener('pointerdown', sourceGesture)
  const minimap = document.createElement('div'); minimap.className = 'pdf-original__minimap'; host.append(minimap)
  const pdfSource = document.createElement('span'); host.append(pdfSource)
  render(<SourceMarginRail host={host} entries={[entry]} ownsSourcePointer={event => event.target === pdfSource} />)
  fireEvent.pointerDown(source); fireEvent.pointerDown(minimap); fireEvent.pointerDown(pdfSource)
  expect(toggle).not.toHaveBeenCalled(); expect(sourceGesture).toHaveBeenCalledOnce()
  fireEvent.pointerDown(host)
  expect(toggle).toHaveBeenCalledOnce()
})

it('starts each leader at its own PDF page border, including mixed sheet widths and horizontal scroll', () => {
  const host = document.createElement('div'); host.dataset.fixtureHost = 'true'; document.body.append(host)
  Object.defineProperty(host, 'clientWidth', { value: 1500 }); Object.defineProperty(host, 'clientHeight', { value: 800 })
  host.scrollLeft = 40; host.scrollTop = 120
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ left: 50, right: 1550, top: 60, bottom: 860 } as DOMRect)
  for (const box of [{ left: 100, right: 950, top: -200, bottom: 200 }, { left: 100, right: 800, top: 220, bottom: 1000 }]) {
    const page = document.createElement('div'); page.className = 'pdf-original__page'; host.append(page)
    vi.spyOn(page, 'getBoundingClientRect').mockReturnValue(box as DOMRect)
  }
  const entries = [{ id: 'wide', source: { left: 200, right: 410, top: 100, bottom: 125 }, border: 940 }, { id: 'narrow', source: { left: 200, right: 390, top: 320, bottom: 345 }, border: 790 }]
  render(<SourceMarginRail host={host} entries={entries.map((entry, index) => ({ id: entry.id, label: 'Explain', source: () => entry.source, order: index, open: true, content: <p>Response</p>, onToggle: vi.fn() }))} />)
  const leaders = screen.getByTestId('source-margin-leaders')
  expect(leaders.querySelector('circle')).toBeNull()
  for (const entry of entries) {
    const path = leaders.querySelector(`[data-card-id="${entry.id}"] path`)!.getAttribute('d')!
    expect(Number(path.match(/^M([\d.]+)/)?.[1])).toBe(entry.border)
    expect(Number(path.match(/^M[\d.]+ ([\d.]+)/)?.[1])).toBe(entry.source.top - 60 + 120)
    const xs = [Number(path.match(/^M([\d.]+)/)?.[1]), ...[...path.matchAll(/H([\d.]+)/g)].map(match => Number(match[1]))]
    expect(xs.every(x => x >= entry.border)).toBe(true)
  }
})
