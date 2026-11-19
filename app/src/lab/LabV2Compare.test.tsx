// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { labSwipePageDirection } from './labChrome'
import { LAB_PREFS_KEY, storeCompareView } from './labPrefs'
import { labSuperMenuRows } from './labSuperMenu'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

/**
 * A reader who has a compare edition switched on and reads the main version.
 * A new book opens on a phone with Compare's view on (Anders, 2026-10-14), so
 * these swap tests start from a reader who turned it off for the book.
 */
function withCompare() {
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
    version: 2,
    shared: { primaryEdition: 'kjv-en', compareEdition: 'web-en', audioEdition: 'kjv-en', audioSpeed: 1, compareOpen: true },
    phone: {},
    desktop: {},
    seenOnce: {},
  }))
  storeCompareView('phone', 'bible', false)
}

/** A reader who chose None for Compare (Compare is on by default since 2026-10-06). */
function withoutCompare() {
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
    version: 2,
    shared: { primaryEdition: 'kjv-en', compareEdition: 'web-en', audioEdition: 'kjv-en', audioSpeed: 1, compareOpen: false, compareChosen: true },
    phone: {},
    desktop: {},
    seenOnce: {},
  }))
}

function renderPhone(props: Record<string, unknown> = {}) {
  return render(
    <LabApp
      pathname="/lab/phone"
     
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

/**
 * Compare is a desktop view (Anders, 10 Nov 2026). The phone reads one edition, the Main version in Book settings;
 * it has no Compare switch, no compare edition row, no swap and no standby measuring.
 */
describe('no Compare on the phone', () => {
  it('a vertical swipe never swaps editions; a sideways swipe still turns the page', () => {
    withCompare()
    renderPhone()
    swipe(screen.getByTestId('lab-book'), 0, -110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    swipe(screen.getByTestId('lab-book'), 0, 110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(labSwipePageDirection(80, 80)).toBeNull()
    for (const dx of [-200, -60, 60, 200]) expect(labSwipePageDirection(dx, 0)).not.toBeNull()
  })

  it('Book settings offers the Main version only: no Compare version row and no switch, even with a compare edition chosen', () => {
    withCompare()
    renderPhone()
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.queryByTestId('lab-super-row-compare')).toBeNull()
    expect(labSuperMenuRows({ phone: true }).some(row => row.id === 'compare')).toBe(false)
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    expect(screen.getByTestId('lab-v2-main-edition')).toBeTruthy()
    expect(screen.queryByTestId('lab-v2-compare-edition')).toBeNull()
    expect(screen.queryByTestId('lab-v2-show-compare')).toBeNull()
  })

  it('a book a phone left in Compare opens on its main version, at the same place', () => {
    withCompare()
    storeCompareView('phone', 'bible', true)
    renderPhone()
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(screen.getByTestId('lab-book').textContent).toContain('Old wording')
    expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe('0:0')
  })

  it('measures only the edition on screen: there is nothing to swap to', () => {
    vi.stubGlobal('CSS', { supports: () => true })
    withCompare()
    renderPhone()
    expect(screen.getAllByTestId('lab-native-page-measure')).toHaveLength(1)
  })

  it('does nothing without a compare edition either', () => {
    withoutCompare()
    renderPhone()
    swipe(screen.getByTestId('lab-book'), 0, -110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(screen.queryByTestId('lab-v2-compare-mark')).toBeNull()
  })
})
