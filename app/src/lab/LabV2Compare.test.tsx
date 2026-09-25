// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'
import { labSwipeCompareSwap, labSwipePageDirection } from './labChrome'
import { LAB_PREFS_KEY } from './labPrefs'
import { labSuperMenuRows } from './labSuperMenu'
import { bibleEditions, editionLabelFor } from './labPrefs'
import { LAB_V2_VERSION_PILL_MS } from './labV2Sheet'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

/** A reader who has a compare edition switched on. */
function withCompare() {
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({
    version: 2,
    shared: { primaryEdition: 'kjv-en', compareEdition: 'web-en', audioEdition: 'kjv-en', audioSpeed: 1, compareOpen: true },
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
    // The pointer's way into Compare is the switch in Reading settings.
    fireEvent.click(screen.getByTestId('lab-super'))
    expect(screen.queryByTestId('lab-super-row-compare')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    expect(screen.getByTestId('lab-v2-show-compare')).toBeTruthy()
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
    expect(labSuperMenuRows({ phone: true }).some(row => row.id === 'compare')).toBe(false)
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    expect(screen.queryByTestId('lab-v2-show-compare')).toBeNull()
  })
})

describe('what Compare says about itself', () => {
  it('carries no running head and identifies the actual comparison edition', () => {
    withCompare()
    renderPhone()
    swipe(screen.getByTestId('lab-book'), 0, -110)
    expect(screen.queryByTestId('lab-v2-edition-name')).toBeNull()
    expect(screen.getByTestId('lab-chapter-progress').textContent).toBe('World English Bible')
    expect(screen.getByTestId('lab-chapter-progress').textContent).not.toMatch(/\d/)
    // Back on the primary page the line is the progress line it always was.
    swipe(screen.getByTestId('lab-book'), 0, 110)
    expect(screen.getByTestId('lab-chapter-progress').textContent).toMatch(/of (book|chapter)/)
  })

  it('names the version just swapped to with a pill that goes again', () => {
    vi.useFakeTimers()
    withCompare()
    renderPhone()
    expect(screen.queryByTestId('lab-v2-version-pill')).toBeNull()
    swipe(screen.getByTestId('lab-book'), 0, -110)
    const pill = screen.getByTestId('lab-v2-version-pill')
    expect(pill.textContent).toBe(editionLabelFor('web-en', bibleEditions()))
    // Every swap, on the page landed on: back again names the primary.
    swipe(screen.getByTestId('lab-book'), 0, 110)
    expect(screen.getByTestId('lab-v2-version-pill').textContent).toBe(editionLabelFor('kjv-en', bibleEditions()))
    expect(editionLabelFor('kjv-en', bibleEditions())).not.toBe(editionLabelFor('web-en', bibleEditions()))
    // And it never persists: about a second, then gone.
    act(() => { vi.advanceTimersByTime(LAB_V2_VERSION_PILL_MS + 5) })
    expect(screen.queryByTestId('lab-v2-version-pill')).toBeNull()
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

describe('the standby edition', () => {
  /** jsdom has no columns; the paginator only mounts when the browser does. */
  function withNativePaging() {
    vi.stubGlobal('CSS', { supports: () => true })
  }

  it('is measured off-screen whenever Compare is available, so a swap has nothing to compute', () => {
    withNativePaging()
    withCompare()
    renderPhone()
    // Two hidden measuring columns: the edition on screen, and the one a
    // swipe away. Both are aria-hidden and neither can paint.
    const hosts = screen.getAllByTestId('lab-native-page-measure')
    expect(hosts).toHaveLength(2)
    for (const host of hosts) {
      expect(host.getAttribute('aria-hidden')).toBe('true')
      expect(host.classList.contains('lab-page-measure')).toBe(true)
    }
  })

  it('is not measured when there is nothing to swap to', () => {
    withNativePaging()
    renderPhone()
    expect(screen.getAllByTestId('lab-native-page-measure')).toHaveLength(1)
  })

  it('is not measured without the flag', () => {
    withNativePaging()
    withCompare()
    render(<LabApp pathname="/lab/phone" search="" authToken={null} source={{
      ...fallbackLabSource(),
      paragraphs: ['Old wording begins here and continues through the original passage.'],
      compareParagraphs: ['Modern wording starts here and continues through the comparison passage.'],
    }} />)
    expect(screen.getAllByTestId('lab-native-page-measure')).toHaveLength(1)
  })
})

describe('where the compare page begins', () => {
  // Two editions whose paginations diverge badly: the primary's paragraphs
  // are long enough to break into several pages each; the compare's are one
  // short line apiece. Page 3 of the primary is deep in paragraph 1; page 3
  // of the compare is paragraph 3. Chosen by index or by fraction, the two
  // pages would show different paragraphs.
  const long = (n: number) => Array.from({ length: 120 }, (_, i) => `Paragraph ${n} word ${i}.`).join(' ')
  const primary = [long(0), long(1), long(2), long(3), long(4)]
  const compare = ['Short one.', 'Short two.', 'Short three.', 'Short four.', 'Short five.']

  /** The text of the first painted line of the page. */
  function firstLine() {
    const line = screen.getByTestId('lab-book').querySelector('.lab-hearing-line') as HTMLElement
    return (line.textContent ?? '').replace(/\s+/g, ' ').trim()
  }

  it('is the primary page\'s first word, carried to the same aligned paragraph — and back is the page left', () => {
    withCompare()
    renderPhone({ source: { ...fallbackLabSource(), paragraphs: primary, compareParagraphs: compare } })
    // Turn pages until the primary is somewhere inside paragraph 1 or later,
    // with its page beginning mid-paragraph.
    for (let i = 0; i < 40 && !/^Paragraph [1-9]/.test(firstLine()); i += 1) {
      fireEvent.click(screen.getByTestId('lab-page-next'))
    }
    fireEvent.click(screen.getByTestId('lab-page-next'))
    const left = firstLine()
    const leftProgress = screen.getByTestId('lab-chapter-progress').textContent
    expect(left).toMatch(/^Paragraph/)
    const leftParagraph = Number(left.match(/Paragraph (\d+)/)![1])
    expect(leftParagraph).toBeGreaterThan(0)

    swipe(screen.getByTestId('lab-book'), 0, -110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('true')
    // Same paragraph as the primary page's first word — not page 4 of the compare.
    expect(firstLine()).toBe(compare[leftParagraph])
    expect(screen.getByTestId('lab-book').textContent).toContain(compare[leftParagraph])
    expect(screen.getByTestId('lab-book').textContent).not.toContain(compare[leftParagraph - 1])

    swipe(screen.getByTestId('lab-book'), 0, 110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(firstLine()).toBe(left)
    expect(screen.getByTestId('lab-chapter-progress').textContent).toBe(leftProgress)
  })

  it('returns to the identical primary page after reading on in Compare and coming back', () => {
    withCompare()
    renderPhone({ source: { ...fallbackLabSource(), paragraphs: primary, compareParagraphs: primary.map(text => text.replace(/Paragraph/g, 'Section')) } })
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByTestId('lab-page-next'))
    const left = firstLine()
    const place = screen.getByTestId('lab-root').getAttribute('data-place')
    swipe(screen.getByTestId('lab-book'), 0, -110)
    const opened = firstLine()
    fireEvent.click(screen.getByTestId('lab-page-next'))
    expect(firstLine()).not.toBe(opened)
    fireEvent.click(screen.getByTestId('lab-page-prev'))
    expect(firstLine()).toBe(opened)
    swipe(screen.getByTestId('lab-book'), 0, 110)
    expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
    expect(firstLine()).toBe(left)
    expect(screen.getByTestId('lab-root').getAttribute('data-place')).toBe(place)
  })
})

describe('where the compare page ends', () => {
  // Verse-marked editions: the primary's verses are short, the compare's twice as long.
  const sup = (n: number) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')
  const verses = (words: number, label: string) => Array.from({ length: 40 }, (_, v) => `${sup(v + 1)} ${Array.from({ length: words }, (_, w) => `${label}${v + 1}w${w}`).join(' ')}.`)
  // Two long paragraphs, so pages break inside verses.
  const group = (list: string[]) => [list.slice(0, 20).join(' '), list.slice(20).join(' ')]

  function visibleWords() {
    return [...screen.getByTestId('lab-book').querySelectorAll('[data-testid="lab-word"]')].map(node => (node.textContent ?? '').trim())
  }

  it('carries the whole primary page over: one page when the passage fits, the end marked when it does not', () => {
    withCompare()
    const primary = group(verses(7, 'p'))
    renderPhone({ source: { ...fallbackLabSource(), paragraphs: primary, compareParagraphs: group(verses(4, 'c')) } })
    fireEvent.click(screen.getByTestId('lab-page-next'))
    const mainWords = visibleWords()
    const lastVerse = [...mainWords].reverse().find(word => /^p\d+w/.test(word))!.match(/^p(\d+)w/)![1]
    swipe(screen.getByTestId('lab-book'), 0, -110)
    const shown = visibleWords()
    // Shorter: the passage fits and the page is exactly it, from the verse the
    // primary page began in through the whole of the verse it ended in.
    const firstVerse = mainWords.find(word => /^p\d+w/.test(word))!.match(/^p(\d+)w/)![1]
    expect(shown.find(word => /^c\d+w/.test(word))).toBe(`c${firstVerse}w0`)
    expect(shown[shown.length - 1]).toBe(`c${lastVerse}w3.`)
    expect(shown.some(word => word === `c${Number(lastVerse) + 1}w0`)).toBe(false)
    expect(screen.queryByTestId('lab-compare-page-end')).toBeNull()
    swipe(screen.getByTestId('lab-book'), 0, 110)
    cleanup()

    // Twice as long: normal pages, and the end of the passage is marked.
    withCompare()
    renderPhone({ source: { ...fallbackLabSource(), paragraphs: primary, compareParagraphs: group(verses(14, 'c')) } })
    // The first page, which ends between two verses inside a paragraph.
    const longLast = [...visibleWords()].reverse().find(word => /^p\d+w/.test(word))!.match(/^p(\d+)w/)![1]
    swipe(screen.getByTestId('lab-book'), 0, -110)
    for (let i = 0; i < 4 && !screen.queryByTestId('lab-compare-page-end'); i += 1) fireEvent.click(screen.getByTestId('lab-page-next'))
    const marker = screen.getByTestId('lab-compare-page-end')
    // The mark stands right before the first word after the passage: the next verse.
    expect((marker.nextElementSibling?.textContent ?? '').trim()).toBe(String(Number(longLast) + 1))
  })


})

it('swaps to the compare version from the Reading settings switch and back, closing the sheet each time', () => {
  withCompare()
  renderPhone()
  const openSwitch = () => {
    fireEvent.click(screen.getByTestId('lab-super'))
    fireEvent.click(screen.getByTestId('lab-super-row-editions'))
    return screen.getByTestId('lab-v2-show-compare')
  }
  const first = openSwitch()
  expect(first.getAttribute('aria-checked')).toBe('false')
  fireEvent.click(first)
  expect(screen.queryByTestId('lab-v2-sheet')).toBeNull()
  expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('true')
  const second = openSwitch()
  expect(second.getAttribute('aria-checked')).toBe('true')
  fireEvent.click(second)
  expect(screen.getByTestId('lab-root').getAttribute('data-compare-active')).toBe('false')
})
