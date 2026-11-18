// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { findPdfHeading } from './pdfHeadingGeometry'
it('attaches actions only to actual matching source ink and preserves split title geometry', () => {
  const layer = document.createElement('div')
  layer.innerHTML = '<span data-pdf-furniture="true">Chapter One</span><span>Chapter</span><span>One</span><span>Body</span>'
  const box = (left: number, top: number, width: number, height: number) => ({ left, top, right: left + width, bottom: top + height, width, height } as DOMRect)
  layer.getBoundingClientRect = () => box(10, 20, 600, 800)
  Array.from(layer.children).forEach((span, i) => { span.getBoundingClientRect = () => box(70 + i * 60, 100, 50, 20) })
  const heading = { key: 'chapter-1', title: 'Chapter One', page: 4, actions: [], onAction: vi.fn() }
  const source = findPdfHeading(layer, heading)
  expect(source?.rects).toHaveLength(2)
  expect(source?.rects[0]).toEqual([4, .2, .1, 50 / 600, .025])
  expect(layer.children[0].hasAttribute('data-pdf-heading')).toBe(false)
  expect(layer.children[1].getAttribute('tabindex')).toBe('0')
  expect(findPdfHeading(layer, { ...heading, title: 'Absent title' })).toBeNull()
})

it('retains Roman letters that are part of a real title', () => {
  const layer = document.createElement('div'); layer.innerHTML = '<span>Civil</span>'
  const box = { left: 0, top: 0, width: 600, height: 800, right: 600, bottom: 800 } as DOMRect
  layer.getBoundingClientRect = () => box; layer.firstElementChild!.getBoundingClientRect = () => box
  expect(findPdfHeading(layer, { key: 'civil', title: 'Civil', page: 1, actions: [], onAction: vi.fn() })?.text).toBe('Civil')
})
