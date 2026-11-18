// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DESKTOP_DOCK_OVERLAP, DESKTOP_DOCK_TEXT_CLEARANCE, desktopDockBottom, measureDesktopLeaf } from './labAudioDock'

// 1440x900 after the trim: the leaf ends 56px above the viewport's foot and
// its text box 30px (--desktop-pad-bottom) above that. The dock is 54px tall.
const base = { viewportHeight: 900, leafBottom: 844, contentBottom: 814, dockHeight: 54 }
const top = (layout: typeof base) => layout.viewportHeight - desktopDockBottom(layout) - layout.dockHeight

describe('the desktop audio dock over the leaf', () => {
  it('rides 10px over the foot of the leaf when the folio zone has room', () => {
    expect(DESKTOP_DOCK_OVERLAP).toBe(10)
    expect(desktopDockBottom(base)).toBe(12)
    expect(top(base)).toBe(base.leafBottom - 10)
  })

  it('never reaches above the text box: with a thin foot the overlap shrinks and the pill sits lower', () => {
    const thin = { ...base, contentBottom: 840 }
    expect(top(thin)).toBe(840 + DESKTOP_DOCK_TEXT_CLEARANCE)
    expect(top(thin)).toBeGreaterThan(thin.contentBottom)
  })

  it('a chapter-end row docked in the foot counts as content', () => {
    const docked = { ...base, contentBottom: 843 }
    // The pill sits on the viewport edge here, still clear of the row.
    expect(desktopDockBottom(docked)).toBe(0)
    expect(top(docked)).toBeGreaterThan(843)
  })

  it('never leaves the viewport downward; at worst it sits on the bottom edge', () => {
    const cramped = { ...base, contentBottom: 880 }
    expect(desktopDockBottom(cramped)).toBe(0)
  })

  for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 800], [1024, 700], [1280, 640], [1100, 600]]) {
    it(`keeps the pill below the text at ${width}x${height}`, () => {
      const layout = { viewportHeight: height, leafBottom: height - 56, contentBottom: height - 86, dockHeight: 54 }
      expect(top(layout)).toBeGreaterThan(layout.contentBottom)
      expect(top(layout)).toBeLessThan(layout.leafBottom)
    })
  }
})

describe('measureDesktopLeaf', () => {
  it('reads the leaf and its text box, and lets a docked chapter-end row raise the floor', () => {
    document.body.innerHTML = '<div class="lab"><div class="lab-page-wrap"><div class="lab-passage" style="padding-bottom:30px"><div class="lab-chapter-end is-docked"></div></div></div></div>'
    const rect = (bottom: number, height: number) => ({ bottom, height, top: bottom - height, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    ;(document.querySelector('.lab-page-wrap') as HTMLElement).getBoundingClientRect = () => rect(844, 780)
    ;(document.querySelector('.lab-passage') as HTMLElement).getBoundingClientRect = () => rect(844, 780)
    const end = document.querySelector('.lab-chapter-end') as HTMLElement
    end.getBoundingClientRect = () => rect(840, 26)
    expect(measureDesktopLeaf(document)).toEqual({ leafBottom: 844, contentBottom: 840 })
    end.classList.remove('is-docked')
    expect(measureDesktopLeaf(document)).toEqual({ leafBottom: 844, contentBottom: 814 })
  })
})

describe('lab.css', () => {
  const css = readFileSync(resolve(__dirname, 'lab.css'), 'utf8')
  it('trims the space under the leaf to 56px in both states and places the dock from the measured value', () => {
    expect(css).toMatch(/\[data-desktop-paging="true"\] \.lab-body \{ padding-bottom: 56px; \}/)
    expect(css).toMatch(/\[data-desktop-paging="true"\]\[data-transport="open"\] \.lab-body \{ padding-bottom: 56px; \}/)
    expect(css).toMatch(/\.lab-desktop-audio-dock \{ bottom: var\(--lab-dock-bottom, 12px\); \}/)
    expect(css).toMatch(/\[data-desktop-paging="true"\]\[data-transport="open"\] \.lab-chapter-progress \{\s*visibility: hidden;/)
  })
  it('sets the dock text and the folios in EB Garamond, never mono', () => {
    expect(css).toMatch(/\.lab-desktop-audio-speed \{ font: 500 15px\/1 'EB Garamond'/)
    expect(css).toMatch(/\.lab-desktop-audio-track span \{ font: italic 12px\/1\.2 'EB Garamond'/)
    expect(css).toMatch(/\.lab-desktop-page-footers \{ font-family: 'EB Garamond', Georgia, serif; \}/)
    expect(css).not.toMatch(/\.lab-desktop-page-footers \{[^}]*Plex Mono/)
  })
})
