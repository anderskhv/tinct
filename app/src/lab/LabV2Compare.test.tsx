// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { labSwipeCompareSwap, labSwipePageDirection } from './labChrome'
import { LAB_PREFS_KEY } from './labPrefs'
import { labSuperMenuRows } from './labSuperMenu'

afterEach(() => {
  cleanup()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

/** A reader who has a compare edition switched on. */
function withCompare() {
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
    version: 2,
    shared: { primaryEdition: 'kjv', compareEdition: 'modern-en', audioEdition: 'kjv', audioSpeed: 1, compareOpen: true },
    phone: {},
    desktop: {},
    seenOnce: {},
  }))
}

function renderPhone(props: Record<string, unknown> = {}) {
  return render(
    <LabApp
      pathname="/lab/phone"
      search="?chrome=v2"
      authToken={null}
      source={{
        ...fallbackLabSource(),
        paragraphs: ['Old wording begins here and continues through the original passage.'],
        compareParagraphs: ['Modern wording starts here and continues through the comparison passage.'],
      }}
      {...props}
    />,
  )
}

function swipe(node: Element, dx: number, dy: number, pointerType = 'touch') {
  fireEvent.pointerDown(node, { pointerId: 1, pointerType, clientX: 180, clientY: 400, timeStamp: 0 })
  fireEvent.pointerUp(node, { pointerId: 1, pointerType, clientX: 180 + dx, clientY: 400 + dy, timeStamp: 220 })
}

describe('the compare gesture', () => {
  it('is vertical, decisive, and can never fire on the same swipe as a page turn', () => {
    // Up and down both swap.
    expect(labSwipeCompareSwap(0, -90)).toBe(true)
    expect(labSwipeCompareSwap(0, 90)).toBe(true)
    // A short flick is not a swap.
    expect(labSwipeCompareSwap(0, 30)).toBe(false)
    // A diagonal is neither gesture.
    expect(labSwipeCompareSwap(80, 80)).toBe(false)
    expect(labSwipePageDirection(80, 80)).toBeNull()
    // And a page turn is never a swap.
    for (const dx of [-200, -60, 60, 200]) {
      expect(labSwipeCompareSwap(dx, 0)).toBe(false)
      expect(labSwipePageDirection(dx, 0)).not.toBeNull()
    }
  })

  it('swaps the whole page and back again', () => {
    withCompare()
    renderPhone()
    const page = screen.getByTestId('lab-book')
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')

    swipe(page, 0, -110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('true')
    expect(screen.getByTestId('lab-book').textContent).toContain('Modern wording')

    swipe(screen.getByTestId('lab-book'), 0, 110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(screen.getByTestId('lab-book').textContent).toContain('Old wording')
  })

  it('is a finger, not a mouse: a drag down the page is still a selection', () => {
    withCompare()
    renderPhone()
    swipe(screen.getByTestId('lab-book'), 0, -110, 'mouse')
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    // The pointer's way into Compare is the menu row, which is there.
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.getByTestId('lab-super-row-compare')).toBeTruthy()
  })

  it('does nothing without a compare edition, and offers no Compare anywhere', () => {
    renderPhone()
    const page = screen.getByTestId('lab-book')
    swipe(page, 0, -110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(screen.queryByTestId('lab-v2-edition-name')).toBeNull()
    expect(screen.queryByTestId('lab-v2-compare-mark')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.queryByTestId('lab-super-row-compare')).toBeNull()
    expect(labSuperMenuRows({ compare: false }).some(row => row.id === 'compare')).toBe(false)
  })
})

describe('what Compare says about itself', () => {
  it('names the edition over the page and marks the progress line', () => {
    withCompare()
    renderPhone()
    swipe(screen.getByTestId('lab-book'), 0, -110)
    expect(screen.getByTestId('lab-v2-edition-name').textContent).toBeTruthy()
    expect(screen.getByTestId('lab-v2-compare-mark').textContent).toBe('Compare version')
    // The bottom bar is otherwise the bar it already is.
    expect(screen.getByTestId('lab-chapter-progress')).toBeTruthy()
  })

  it('never explains the swipe', () => {
    withCompare()
    renderPhone()
    swipe(screen.getByTestId('lab-book'), 0, -110)
    const chrome = screen.getByTestId('lab-root').textContent ?? ''
    expect(chrome).not.toMatch(/swipe/i)
    expect(chrome).not.toMatch(/swap/i)
    expect(screen.getByTestId('lab-root').querySelector('[data-testid="lab-compare-hint"]')).toBeNull()
  })

  it('leaves the swap alone without the flag', () => {
    withCompare()
    render(<LabApp pathname="/lab/phone" search="" authToken={null} source={{
      ...fallbackLabSource(),
      paragraphs: ['Old wording begins here and continues through the original passage.'],
      compareParagraphs: ['Modern wording starts here and continues through the comparison passage.'],
    }} />)
    swipe(screen.getByTestId('lab-book'), 0, -110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
  })
})
