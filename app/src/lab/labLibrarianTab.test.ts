import { describe, expect, it } from 'vitest'
import { DEFAULT_LIBRARIAN_TAB_DOCK, DEFAULT_LIBRARIAN_TAB_PREFS, type LabMargins } from './labPrefs'
import {
  LIBRARIAN_TAB_BAND_MIN_HEIGHT,
  LIBRARIAN_TAB_BAND_WIDTH,
  LIBRARIAN_TAB_GAP,
  LIBRARIAN_TAB_HEIGHT,
  LIBRARIAN_TAB_PEEK_HEIGHT,
  LIBRARIAN_TAB_RELEASE,
  labDesktopReaderMargin,
  labPhoneReaderMargin,
  librarianTabAvoid,
  librarianTabBand,
  librarianTabDockFromDrop,
  librarianTabIconSize,
  librarianTabLongPressMode,
  librarianTabOverTarget,
  librarianTabPull,
  librarianTabRect,
  librarianTabReleased,
  librarianTabShown,
  librarianTabStretch,
  librarianTabTapMode,
  librarianTabTargetCentre,
  librarianTabWidth,
  librarianTabYRange,
  type LibrarianTabFrame,
} from './labLibrarianTab'

const MARGINS: LabMargins[] = ['narrow', 'medium', 'wide', 0.7, 1.45]

function frame(margin: number, width = 390, top = 53, bottom = 818): LibrarianTabFrame {
  return { left: 0, right: width, top, bottom, marginLeft: margin, marginRight: margin }
}

describe('tab width follows the margin', () => {
  it('is the margin less 5px, between 12 and 18', () => {
    expect(librarianTabWidth(24)).toBe(18)
    expect(librarianTabWidth(23)).toBe(18)
    expect(librarianTabWidth(20)).toBe(15)
    expect(librarianTabWidth(17)).toBe(12)
    expect(librarianTabWidth(35)).toBe(18)
  })

  it('never fills the margin, and gives up when there is no room at all', () => {
    for (let margin = 13; margin <= 80; margin += 0.25) {
      const width = librarianTabWidth(margin)!
      expect(width).toBeLessThan(margin)
      if (margin >= 17) expect(margin - width).toBeGreaterThanOrEqual(LIBRARIAN_TAB_GAP)
    }
    expect(librarianTabWidth(12)).toBeNull()
    expect(librarianTabWidth(Number.NaN)).toBeNull()
  })

  it('draws its icon inside the tab, at most 12px', () => {
    expect(librarianTabIconSize(18)).toBe(12)
    expect(librarianTabIconSize(12)).toBe(9)
    expect(librarianTabIconSize(14)).toBe(11)
  })
})

describe('the tab never reaches the text', () => {
  it('phone: narrow, medium and wide (and the slider ends) leave paper before the text', () => {
    // 1.1rem / 1.55rem / 2.2rem — about 17, 24 and 35px.
    expect(Math.round(labPhoneReaderMargin('narrow'))).toBe(18)
    expect(Math.round(labPhoneReaderMargin('medium'))).toBe(25)
    expect(Math.round(labPhoneReaderMargin('wide'))).toBe(35)
    for (const margins of MARGINS) {
      const margin = labPhoneReaderMargin(margins)
      const f = frame(margin)
      for (const side of ['left', 'right'] as const) {
        const tab = librarianTabRect(f, { side, y: 0.62 })!
        const textLeft = f.left + f.marginLeft
        const textRight = f.right - f.marginRight
        if (side === 'right') {
          expect(tab.left + tab.width).toBe(f.right)
          expect(tab.left).toBeGreaterThanOrEqual(textRight + 1)
        } else {
          expect(tab.left).toBe(f.left)
          expect(tab.left + tab.width).toBeLessThanOrEqual(textLeft - 1)
        }
      }
    }
  })

  it('desktop: every margin at every window width keeps the tab in the leaf padding', () => {
    for (const width of [900, 1024, 1100, 1280, 1440, 1920, 2560]) {
      for (const margins of MARGINS) {
        const margin = labDesktopReaderMargin(margins, width)
        const f = { left: 31, right: width - 31, top: 73, bottom: 791, marginLeft: margin, marginRight: margin }
        const tab = librarianTabRect(f, { side: 'right', y: 0.62 })
        expect(tab, `${width}/${margins}`).not.toBeNull()
        expect(tab!.left).toBeGreaterThan(f.right - f.marginRight)
        expect(tab!.left + tab!.width).toBe(f.right)
      }
    }
  })

  it('the peek stretches along the edge only', () => {
    const f = frame(24.8)
    const rest = librarianTabRect(f, DEFAULT_LIBRARIAN_TAB_DOCK)!
    const peek = librarianTabRect(f, DEFAULT_LIBRARIAN_TAB_DOCK, LIBRARIAN_TAB_PEEK_HEIGHT)!
    expect(rest.height).toBe(LIBRARIAN_TAB_HEIGHT)
    expect(peek.height).toBe(LIBRARIAN_TAB_PEEK_HEIGHT)
    expect(peek.width).toBe(rest.width)
    expect(peek.left).toBe(rest.left)
    expect(peek.top + peek.height / 2).toBeCloseTo(rest.top + rest.height / 2)
  })
})

describe('placement', () => {
  it('sits at 62% of the page by default, and stays clear of its ends', () => {
    const f = frame(24.8)
    const tab = librarianTabRect(f, DEFAULT_LIBRARIAN_TAB_DOCK)!
    expect(tab.top + tab.height / 2).toBeCloseTo(53 + 0.62 * (818 - 53))
    const top = librarianTabRect(f, { side: 'right', y: 0 })!
    const bottom = librarianTabRect(f, { side: 'right', y: 1 })!
    expect(top.top).toBeGreaterThan(f.top)
    expect(bottom.top + bottom.height).toBeLessThan(f.bottom)
  })

  it('has a tap band 40px wide and at least 44px tall, from the edge', () => {
    const f = frame(24.8)
    const tab = librarianTabRect(f, DEFAULT_LIBRARIAN_TAB_DOCK)!
    const band = librarianTabBand(f, tab, 'right')
    expect(band.width).toBe(LIBRARIAN_TAB_BAND_WIDTH)
    expect(band.height).toBe(LIBRARIAN_TAB_BAND_MIN_HEIGHT)
    expect(band.left + band.width).toBe(f.right)
    expect(band.top + band.height / 2).toBeCloseTo(tab.top + tab.height / 2)
    expect(librarianTabBand(f, librarianTabRect(f, { side: 'left', y: 0.5 })!, 'left').left).toBe(0)
  })

  it('a drop docks to the nearer side at that height', () => {
    const f = frame(24.8)
    expect(librarianTabDockFromDrop(f, 60, 400).side).toBe('left')
    expect(librarianTabDockFromDrop(f, 300, 400).side).toBe('right')
    expect(librarianTabDockFromDrop(f, 300, 400).y).toBeCloseTo((400 - 53) / (818 - 53), 2)
    const range = librarianTabYRange(f)
    expect(librarianTabDockFromDrop(f, 300, -500).y).toBeCloseTo((range[0] - 53) / (818 - 53), 2)
  })

  it('keeps out of the desktop page-turn buttons', () => {
    const range: [number, number] = [100, 700]
    expect(librarianTabAvoid(410, [[380, 480]], range)).toBe(380)
    expect(librarianTabAvoid(460, [[380, 480]], range)).toBe(480)
    expect(librarianTabAvoid(600, [[380, 480]], range)).toBe(600)
    expect(librarianTabAvoid(150, [[90, 200]], range)).toBe(200)
  })
})

describe('drag', () => {
  it('sticks to the edge, then lets go at 56px', () => {
    const f = frame(24.8)
    expect(librarianTabPull(f, 'right', 380)).toBe(10)
    expect(librarianTabPull(f, 'right', 400)).toBe(0)
    expect(librarianTabPull(f, 'left', 30)).toBe(30)
    expect(librarianTabStretch(10)).toBeCloseTo(3.8)
    expect(librarianTabStretch(200)).toBeCloseTo(LIBRARIAN_TAB_RELEASE * 0.38)
    expect(librarianTabReleased(LIBRARIAN_TAB_RELEASE)).toBe(false)
    expect(librarianTabReleased(LIBRARIAN_TAB_RELEASE + 1)).toBe(true)
  })

  it('the hide target sits bottom centre and catches a drop on it', () => {
    const centre = librarianTabTargetCentre(390, 844)
    expect(centre.x).toBe(195)
    expect(centre.y).toBe(844 - 34 - 26)
    expect(librarianTabOverTarget(195, 790, 390, 844)).toBe(true)
    expect(librarianTabOverTarget(210, 770, 390, 844)).toBe(true)
    expect(librarianTabOverTarget(195, 600, 390, 844)).toBe(false)
    expect(librarianTabOverTarget(380, 790, 390, 844)).toBe(false)
  })
})

describe('tap and long press', () => {
  it('a tap opens the chosen mode', () => {
    expect(librarianTabTapMode(DEFAULT_LIBRARIAN_TAB_PREFS)).toBe('chat')
    expect(librarianTabTapMode({ librarianTabOpens: 'talk' })).toBe('talk')
    // A reader's own book has no Talk.
    expect(librarianTabTapMode({ librarianTabOpens: 'talk' }, false)).toBe('chat')
  })

  it('long press does nothing unless the setting is on, then opens the other mode', () => {
    expect(librarianTabLongPressMode(DEFAULT_LIBRARIAN_TAB_PREFS)).toBeNull()
    expect(librarianTabLongPressMode({ librarianTabOpens: 'chat', librarianTabLongPress: true })).toBe('talk')
    expect(librarianTabLongPressMode({ librarianTabOpens: 'talk', librarianTabLongPress: true })).toBe('chat')
    expect(librarianTabLongPressMode({ librarianTabOpens: 'chat', librarianTabLongPress: true }, false)).toBeNull()
  })
})

describe('when the tab is shown', () => {
  const base = { enabled: true, signedIn: true, readerReady: true, conversationOpen: false, overlayOpen: false }
  it('shows for a signed-in reader on a ready page', () => {
    expect(librarianTabShown(base)).toBe(true)
  })
  it('hides when hidden, signed out, loading, in a conversation or under an overlay', () => {
    expect(librarianTabShown({ ...base, enabled: false })).toBe(false)
    expect(librarianTabShown({ ...base, signedIn: false })).toBe(false)
    expect(librarianTabShown({ ...base, readerReady: false })).toBe(false)
    expect(librarianTabShown({ ...base, conversationOpen: true })).toBe(false)
    expect(librarianTabShown({ ...base, overlayOpen: true })).toBe(false)
  })
})
